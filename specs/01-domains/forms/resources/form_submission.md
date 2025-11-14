# Resource: FormSubmission

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents a completed form submission with user-provided data. FormSubmissions are immutable audit records that capture the exact state of the form at submission time, including field values, metadata, and submission source. Acts as the source of truth for all submitted data.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company receiving submission |
| form_id | uuid | Yes | valid published form | Form that was submitted |
| data | map | Yes | valid JSON, non-empty | Submitted field values |
| metadata | map | No | valid JSON | Submission context and tracking |
| source | atom | Yes | enum: [:direct, :embed, :api, :chatbot] | How submission was created |
| ip_address | string | No | valid IPv4/IPv6 | Submitter's IP address |
| user_agent | string | No | max 500 chars | Submitter's browser user agent |
| referrer | string | No | valid URL | Page that led to form |
| utm_params | map | No | valid JSON | UTM tracking parameters |
| submission_duration | integer | No | >= 0 | Time to complete form (seconds) |
| partial_data | map | No | valid JSON | Data saved before completion |
| completed_at | utc_datetime | Yes | - | When form was submitted |
| created_at | utc_datetime | Yes | - | Creation timestamp (same as completed_at) |

### Data Map Structure

Stores submitted field values keyed by field name:

```elixir
%{
  # Field name => submitted value
  "email" => "john@example.com",
  "first_name" => "John",
  "last_name" => "Doe",
  "company_name" => "Acme Inc",
  "company_size" => "11-50",
  "how_did_you_hear" => "Google Search",
  "interested_in" => ["Product Demo", "Pricing"],  # Multi-select
  "comments" => "Looking forward to seeing the platform",

  # Special fields
  "_consent_marketing" => true,
  "_consent_terms" => true
}
```

**Data Validation**:
- All required fields from form must be present
- Field values must match field type validation
- Conditional fields validated based on visibility rules
- No extra fields beyond form definition

### Metadata Map Structure

Captures submission context:

```elixir
%{
  # Form configuration snapshot
  form_version: "1.2",
  form_name: "Lead Capture Form",
  form_slug: "lead-capture-2024",

  # Submission tracking
  session_id: "sess_abc123",
  page_url: "https://example.com/landing-page",
  landing_page: "/landing-page",

  # Device information
  device_type: "desktop" | "mobile" | "tablet",
  browser: "Chrome 120.0",
  os: "macOS 14.0",
  screen_resolution: "1920x1080",

  # Geographic data (if available)
  country: "US",
  region: "California",
  city: "San Francisco",
  timezone: "America/Los_Angeles",

  # Performance metrics
  page_load_time: 1234,  # milliseconds
  time_to_first_interaction: 5678,
  form_abandonment_count: 2,  # Times user left and returned

  # A/B testing (if applicable)
  variant: "variation_a",
  experiment_id: "exp_123"
}
```

### UTM Parameters Map

Standard marketing attribution:

```elixir
%{
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "summer_2024",
  utm_term: "crm software",
  utm_content: "ad_variant_a"
}
```

## Business Rules

### Invariants

- FormSubmissions are **immutable** after creation (no updates allowed)
- Must reference a published form (status: :published)
- All required fields must have values in `data`
- Cannot delete submissions (audit trail)
- Form snapshot preserved even if form later modified
- `completed_at` cannot be in the future
- Each submission must have unique tracking identifier

### Validations

- **data**: Required, non-empty map, all required fields present
- **form_id**: Must reference published form at time of submission
- **source**: Must be valid enum value
- **ip_address**: Valid IPv4 or IPv6 format if present
- **user_agent**: Max 500 characters
- **referrer**: Valid URL format if present
- **submission_duration**: Non-negative integer (seconds)
- **completed_at**: Cannot be in future

### Calculated Fields

- **submitter_email**: Extract from `data["email"]` if present
- **submitter_name**: Combine `data["first_name"]` and `data["last_name"]`
- **is_qualified_lead**: Based on form configuration and data
- **lead_score**: Calculated based on field values and metadata

## State

FormSubmissions have no state transitions - they are created once and never change.

**Immutability Enforcement**:
- No update action defined in Ash resource
- Database constraint prevents updates
- Only soft-delete allowed (marks `deleted_at`)

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one
- **Form** (forms.forms) - many-to-one

### Has One (Optional)
- **CalendarBooking** (forms.calendar_bookings) - one-to-one
  - Created via post-submission action

### Has Many (Future)
- **FormSubmissionEvents** - Audit log of processing events
- **Emails** - Confirmation emails sent

## Domain Events

### Published Events

- `forms.submission_received`: Triggered immediately on create
  - Payload: {submission_id, form_id, company_id, data, source, metadata}
  - Consumers: Forms (post-submission actions), Email, Analytics, CRM (future)

- `forms.submission_qualified`: Triggered when lead meets qualification criteria
  - Payload: {submission_id, lead_score, qualification_reason}
  - Consumers: CRM (future), Sales notifications

- `forms.submission_exported`: Triggered when submission exported
  - Payload: {submission_id, export_format, exported_by}
  - Consumers: Analytics

## Access Patterns

### Queries

```elixir
# List all submissions for a form
FormSubmissions.list_submissions(form_id)

# List submissions for company
FormSubmissions.list_submissions_by_company(company_id)

# Get submissions in date range
FormSubmissions.list_submissions_for_range(form_id, start_date, end_date)

# Get submissions by email
FormSubmissions.get_by_email(company_id, email)

# Get qualified submissions
FormSubmissions.list_qualified_submissions(company_id)

# Get submissions by source
FormSubmissions.list_by_source(form_id, :chatbot)

# Get submissions with UTM parameters
FormSubmissions.list_with_utm(company_id, utm_source: "google")

# Search submissions by field value
FormSubmissions.search_by_field(form_id, "company_name", "Acme")
```

### Common Operations

**Create Submission**:
```elixir
FormSubmissions.create_submission(%{
  company_id: uuid,
  form_id: uuid,
  data: %{
    "email" => "john@example.com",
    "first_name" => "John",
    "last_name" => "Doe",
    "company_name" => "Acme Inc",
    "company_size" => "11-50"
  },
  source: :direct,
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  referrer: "https://google.com",
  utm_params: %{
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer_2024"
  },
  submission_duration: 45,  # seconds
  metadata: %{
    device_type: "desktop",
    browser: "Chrome 120.0"
  },
  completed_at: DateTime.utc_now()
})
# Validates all required fields present
# Publishes: forms.submission_received
# Triggers: Post-submission actions
# Returns: {:ok, %FormSubmission{}}
```

**Validation During Creation**:
```elixir
# Automatically validates:
# 1. Form is published
# 2. All required fields present in data
# 3. Field values match field types
# 4. Conditional fields validated
# 5. No extra fields beyond form definition

# Example validation error:
{:error, %Ecto.Changeset{
  errors: [
    data: {"required field 'email' is missing", []}
  ]
}}
```

**No Update Operation**:
```elixir
# This is intentionally not supported:
FormSubmissions.update_submission(id, changes)
# => Raises error: "Submissions are immutable"

# If data needs correction, must:
# 1. Create new submission with correct data
# 2. Mark original as duplicate/invalid (soft delete)
```

**Soft Delete** (for spam/test submissions):
```elixir
FormSubmissions.mark_as_deleted(submission_id, reason: "spam")
# Sets deleted_at timestamp
# Does not remove from database
# Excluded from default queries
```

**Export**:
```elixir
FormSubmissions.export_to_csv(form_id, date_range)
# Returns CSV with columns: timestamp, email, field1, field2, ...

FormSubmissions.export_to_json(form_id, filters)
# Returns JSON array of submissions
```

## Post-Submission Actions

When submission created, Form configuration triggers actions:

```elixir
# 1. Email notification
if form.settings.notification_email do
  Mailer.send_submission_notification(submission)
end

# 2. Calendar booking
if has_calendar_booking_action?(form) do
  CalendarBookings.create_booking_from_submission(submission)
end

# 3. Chatbot trigger
if has_chatbot_trigger_action?(form) do
  ChatbotConversations.start_from_submission(submission)
end

# 4. Webhook
if form.settings.webhook_url do
  HTTP.post(form.settings.webhook_url, submission_data)
end

# 5. CRM sync (future)
if integration_enabled?(:crm) do
  CRM.create_lead_from_submission(submission)
end
```

## Data Privacy & GDPR

### Personally Identifiable Information (PII)

Submissions likely contain PII:
- Email addresses
- Names
- Phone numbers
- Company information
- IP addresses

**GDPR Compliance Requirements**:

1. **Right to Access**: Provide all submissions for a given email
2. **Right to Deletion**: Anonymize or delete submission data
3. **Data Retention**: Delete old submissions per retention policy
4. **Consent Tracking**: Record marketing/privacy consent

**Implementation**:
```elixir
# Right to deletion (anonymization)
FormSubmissions.anonymize_submissions(email: "user@example.com")
# Replaces PII with anonymized values
# Keeps aggregate data for analytics

# Data retention cleanup (background job)
FormSubmissions.delete_old_submissions(older_than: 730)  # 2 years
# Deletes submissions older than retention period
```

## Analytics & Reporting

### Key Metrics

Calculated from submissions:

- **Submission rate**: Submissions per day/week/month
- **Conversion rate**: (Submissions / Views) × 100
- **Average completion time**: Mean submission_duration
- **Abandonment rate**: Partial submissions / Total sessions
- **Source breakdown**: Submissions by source (direct, chatbot, API)
- **Geographic distribution**: Submissions by country/region
- **Device breakdown**: Desktop vs mobile vs tablet
- **UTM attribution**: Submissions by campaign/source

### Aggregate Queries

```elixir
# Submissions over time
FormSubmissions.get_submission_stats(form_id, group_by: :day)
# Returns: [{date, count}, ...]

# Top referrers
FormSubmissions.get_top_referrers(form_id, limit: 10)
# Returns: [{referrer, count}, ...]

# Source distribution
FormSubmissions.get_source_breakdown(form_id)
# Returns: %{direct: 45, chatbot: 30, embed: 25}

# Average completion time
FormSubmissions.get_avg_completion_time(form_id)
# Returns: 42.5 (seconds)

# Field value distribution
FormSubmissions.get_field_distribution(form_id, "company_size")
# Returns: %{"1-10" => 20, "11-50" => 35, ...}
```

## Performance Considerations

- **Write-Heavy**: Optimized for high-volume writes (append-only)
- **Indexing**:
  - Index on `(company_id, form_id, completed_at)` for list queries
  - Index on `(company_id, data->>'email')` for email lookups (JSONB)
  - Index on `(form_id, source)` for source filtering
- **Data Field Search**: Use PostgreSQL JSONB operators for data queries
- **Partitioning**: Consider table partitioning by date for large volumes
- **Archival**: Move old submissions to cold storage after retention period

## Testing Scenarios

### Unit Tests
- [ ] Create submission with all required fields
- [ ] Validate required fields presence
- [ ] Validate field types match form definition
- [ ] Cannot create submission for unpublished form
- [ ] Cannot update submission after creation
- [ ] UTM parameters stored correctly
- [ ] Metadata captured correctly

### Integration Tests
- [ ] Creating submission publishes event
- [ ] Post-submission actions triggered
- [ ] Calendar booking created from submission
- [ ] Email notification sent
- [ ] Submission counted in form.submission_count
- [ ] Analytics metrics updated

---

**Related Resources**:
- [Form](./form.md) - Parent form definition
- [FormField](./form_field.md) - Field definitions and validation
- [CalendarBooking](./calendar_booking.md) - Bookings created from submissions

**Related Features**:
- [Form Submission Feature](../features/form_submission.feature.md)
- [Calendar Booking Feature](../features/calendar_booking.feature.md)

**Related Policies**:
- [Form Access Policy](../policies/form_access.md) - Submission viewing permissions
