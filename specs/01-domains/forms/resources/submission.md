# Resource: Submission

**Domain**: Forms
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

## Purpose

Represents a completed form submission from a potential lead. Contains all submitted field values, metadata (UTM parameters, referrer, etc.), and lead status for tracking the sales workflow. Submission data is **immutable** once created - only status and deleted_at can be updated.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid Company id | Multi-tenancy reference |
| form_id | uuid | Yes | valid Form id | Parent form reference |
| form_data | map | Yes | valid JSONB | Submitted field values |
| metadata | map | No | valid JSONB | Tracking data (UTM, referrer, etc.) |
| status | enum | Yes | one of 5 values | Lead status workflow |
| submitter_email | string | No | valid email format | Email from submission (extracted for indexing) |
| submitted_at | utc_datetime_usec | Yes | - | Submission timestamp |
| deleted_at | utc_datetime_usec | No | - | Soft delete timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last status update timestamp |

## Attribute Details

### form_data (JSONB)

Immutable map of field_id → submitted value:

```elixir
%{
  "field-uuid-1" => "John Doe",              # Text field
  "field-uuid-2" => "john@example.com",      # Email field
  "field-uuid-3" => "Hello, I'm interested", # Textarea field
  "field-uuid-4" => "US",                    # Select field
  "field-uuid-5" => "yes",                   # Checkbox field
  "field-uuid-6" => "medium",                # Radio field
  "field-uuid-7" => "42",                    # Number field
  "field-uuid-8" => "2025-11-16",           # Date field
  "field-uuid-9" => "+1-555-123-4567",      # Phone field
  "field-uuid-10" => "https://example.com"   # URL field
}
```

**Constraints**:
- Keys must be valid form field UUIDs from the parent form
- All required fields must be present
- Values must match expected field type (validated on create)
- Maximum size: ~100KB per submission (prevent abuse)

### metadata (JSONB)

Tracking and attribution data collected on submission:

```elixir
%{
  # UTM Parameters (if collected)
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "fall-2025",
  utm_term: "crm software",
  utm_content: "ad-variant-a",

  # Referrer Information
  referrer: "https://google.com",
  landing_page: "https://example.com/pricing",

  # Browser/Device Information
  user_agent: "Mozilla/5.0...",
  ip_address: "192.168.1.1",        # Consider GDPR implications
  browser: "Chrome",
  device_type: "desktop",           # "desktop" | "mobile" | "tablet"

  # Timing Information
  time_on_page: 120,                # Seconds spent on page before submission
  first_viewed_at: "2025-11-16T10:00:00Z"  # When user first loaded form
}
```

**Privacy Considerations**:
- IP address storage should be optional (GDPR compliance)
- Consider data retention policies for PII
- Allow users to opt-out of tracking

### status (Enum)

Lead workflow status - can be updated after creation:

| Status | Description | Typical Next States |
|--------|-------------|---------------------|
| new | New submission, not yet contacted | contacted, spam |
| contacted | Lead has been reached out to | qualified, spam |
| qualified | Lead is a good fit for product | converted, contacted |
| converted | Lead became a paying customer | (terminal state) |
| spam | Identified as spam/invalid | (terminal state) |

**Valid Transitions**:
- `new → contacted`
- `new → spam`
- `contacted → qualified`
- `contacted → spam`
- `qualified → converted`
- `qualified → contacted` (follow-up needed)
- Any status → `spam` (can always mark as spam)

### submitter_email (String)

**Extracted from form_data for indexing and querying**. If form has an email field, the value is duplicated here for:
- Fast lookups by email
- Deduplication checks (same email submitting multiple times)
- Email notification triggers

**Nullable**: Forms without email field will have `null` here.

## Business Rules

### Invariants

- **Immutability**: form_data and metadata cannot be changed after creation
- **Status Workflow**: Status transitions must follow valid workflow
- **Soft Delete**: Deleted submissions have deleted_at timestamp, not hard deleted
- **Multi-Tenancy**: All submissions filtered by company_id (inherited from form)
- **Form Association**: Cannot create submission for archived form

### Validations

- **form_data**: Must include all required fields from parent form
- **form_data values**: Must match expected field types (email format, number range, etc.)
- **metadata.utm_source**: Max 50 characters if present
- **submitter_email**: Must be valid email format if present
- **status**: Must be one of 5 valid values
- **Data size**: Total form_data + metadata < 100KB

### Calculated Fields

- **submitter_name**: Extract name field from form_data (if present)
- **days_since_submission**: NOW() - submitted_at (in days)
- **is_deleted**: deleted_at IS NOT NULL

## State Transitions

### Status Workflow

```
                    ┌─────────┐
                    │   new   │
                    └────┬────┘
                         │
                ┌────────┴────────┐
                ▼                 ▼
          ┌──────────┐      ┌──────┐
          │contacted │      │ spam │
          └────┬─────┘      └──────┘
               │              (terminal)
          ┌────┴────┐
          ▼         ▼
    ┌──────────┐  ┌──────┐
    │qualified │  │ spam │
    └────┬─────┘  └──────┘
         │
         ▼
    ┌───────────┐
    │ converted │
    └───────────┘
    (terminal)
```

### Soft Delete Workflow

- **Active**: deleted_at IS NULL (normal state)
- **Deleted**: deleted_at IS NOT NULL (soft deleted, excluded from normal queries)
- **Restored**: deleted_at set back to NULL (undelete operation)

## Relationships

- **Belongs to**: Company (via company_id)
- **Belongs to**: Form (via form_id)

## Domain Events

### Published Events

- `forms.submission_created`: Triggered when submission is created
  - Payload: {submission_id, form_id, company_id, submitter_email, status, submitted_at, metadata}
  - Consumers: **Notification Service** (send alerts), Analytics, Lead Scoring (future)

- `forms.submission_status_changed`: Triggered when status is updated
  - Payload: {submission_id, old_status, new_status, changed_by, changed_at}
  - Consumers: Analytics, CRM Integration (future), Pipeline Dashboard

- `forms.submission_deleted`: Triggered when submission is soft-deleted
  - Payload: {submission_id, deleted_by, deleted_at}
  - Consumers: Analytics, Cleanup Service

- `forms.submission_restored`: Triggered when deleted submission is restored
  - Payload: {submission_id, restored_by, restored_at}
  - Consumers: Analytics

### Subscribed Events

None

## Access Patterns

### Queries

- **List submissions for company**: Filter by company_id, exclude deleted, order by submitted_at DESC
- **List submissions for form**: Filter by form_id, exclude deleted, order by submitted_at DESC
- **Get submission by ID**: Include form relationship
- **Filter by status**: WHERE status = 'new' (for "new leads" dashboard)
- **Filter by date range**: WHERE submitted_at BETWEEN start AND end
- **Search by email**: WHERE submitter_email LIKE '%@example.com'
- **Include deleted**: WHERE deleted_at IS NOT NULL (for admin view)

### Common Operations

#### Create (Public Endpoint)

**Required attributes**: form_id, form_data
**Optional attributes**: metadata

**Validations**:
- Form must exist with status='published'
- All required fields must be present in form_data
- Field values must match expected types
- Form_data size < 100KB

**Side effects**:
- Auto-set company_id from form.company_id
- Auto-set status to 'new'
- Auto-set submitted_at to NOW()
- Extract submitter_email from form_data if email field exists
- Publishes forms.submission_created event
- **Triggers notifications** based on user preferences (immediate/daily/off)

**Authorization**: No authentication required (public endpoint)

**Rate Limiting**: (Future) Max 10 submissions per IP per hour to prevent spam

#### Read

**Available to**: All company members (filtered by company_id)
**Default filter**: WHERE deleted_at IS NULL (exclude soft-deleted)
**Public access**: No public read access (submissions are private to company)

#### Update Status

**Updatable field**: status only

**Validations**:
- New status must follow valid workflow transitions
- Cannot update if submission is deleted

**Side effects**:
- Updates updated_at timestamp
- Publishes forms.submission_status_changed event

**Authorization**: Requires admin or manager role

#### Soft Delete

**Action**: Set deleted_at to NOW()

**Side effects**:
- Submission excluded from default queries (still in database)
- Can be restored later
- Publishes forms.submission_deleted event

**Authorization**: Requires admin or manager role

#### Restore

**Action**: Set deleted_at to NULL

**Side effects**:
- Submission included in default queries again
- Publishes forms.submission_restored event

**Authorization**: Requires admin or manager role

#### Hard Delete

**Action**: Permanently delete from database

**Restrictions**:
- NOT RECOMMENDED (use soft delete instead)
- Only for GDPR "right to be forgotten" requests
- Requires admin role + confirmation

**Authorization**: Requires admin role only

## Public API

### Submit Endpoint

**URL**: `/forms/submit/{form_id}`
**Method**: POST
**Authentication**: None (public)
**Rate Limiting**: (Future) 10 requests per IP per hour

**Request Body**:
```json
{
  "form_data": {
    "field-uuid-1": "John Doe",
    "field-uuid-2": "john@example.com",
    "field-uuid-3": "I'm interested in your product"
  },
  "metadata": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "referrer": "https://google.com",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Response** (Success - 201 Created):
```json
{
  "success": true,
  "submission_id": "uuid",
  "redirect_url": "https://example.com/thank-you",
  "message": "Thank you for your submission!"
}
```

**Response** (Validation Error - 422 Unprocessable Entity):
```json
{
  "success": false,
  "errors": {
    "field-uuid-1": ["is required"],
    "field-uuid-2": ["must be a valid email"]
  }
}
```

**Response** (Form Not Found - 404):
```json
{
  "success": false,
  "error": "Form not found or no longer accepting submissions"
}
```

## Security & Authorization

### Policies

**Read**:
- Company members: Can read all submissions in their company
- Filtering: Always filtered by company_id via Ash policy
- Default: Exclude soft-deleted (deleted_at IS NULL)

**Create** (Public):
- No authentication required
- Validates form is published
- Sanitizes input to prevent XSS/injection attacks
- (Future) Rate limiting per IP

**Update Status**:
- Requires: Admin or Manager role
- Can only update own company's submissions

**Delete/Restore**:
- Requires: Admin or Manager role
- Can only delete/restore own company's submissions

### Multi-Tenancy

All queries automatically filtered by company_id:

```elixir
# Ash policy example
policy action_type(:read) do
  authorize_if actor_attribute_equals(:company_id, :company_id)
end
```

**Public submission** bypasses actor check but still validates form ownership.

### Data Security

**Input Sanitization**:
- Strip HTML tags from text inputs to prevent XSS
- Validate email, URL, phone formats
- Limit string length to prevent DoS
- Validate JSONB structure and size

**PII Protection**:
- Submission data may contain PII (emails, names, phone numbers)
- Consider encryption at rest (database-level or application-level)
- Implement data retention policies
- Support GDPR "right to be forgotten" (hard delete)

## Analytics Queries

### KPI Calculations (Real-time via Ash Aggregates)

#### Total Submissions
```elixir
Submission
|> where(company_id: ^company_id)
|> where([s], is_nil(s.deleted_at))
|> count()
```

#### Conversion Rate
```elixir
# Requires form view tracking (future)
submissions_count / form_views_count * 100
```

#### Active Users (Last 30 Days)
```elixir
Submission
|> where(company_id: ^company_id)
|> where([s], s.submitted_at > ago(30, "day"))
|> where([s], is_nil(s.deleted_at))
|> select([s], count(fragment("DISTINCT ?", s.submitter_email)))
```

#### Average Completion Time
```elixir
# Requires tracking first_viewed_at in metadata
Submission
|> where(company_id: ^company_id)
|> where([s], not is_nil(s.metadata["first_viewed_at"]))
|> select([s], avg(fragment("EXTRACT(EPOCH FROM (? - (?->>'first_viewed_at')::timestamp))",
                           s.submitted_at, s.metadata)))
```

#### Lead Source Tracking
```elixir
Submission
|> where(company_id: ^company_id)
|> group_by([s], fragment("?->>'utm_source'", s.metadata))
|> select([s], {fragment("?->>'utm_source'", s.metadata), count(s.id)})
```

#### Field Completion Rate
```elixir
# Calculate per-field null/empty rate
# Requires JSON analysis of form_data
```

## Database Schema

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE RESTRICT,
  form_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  submitter_email VARCHAR(255),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT submissions_status_check CHECK (
    status IN ('new', 'contacted', 'qualified', 'converted', 'spam')
  ),
  CONSTRAINT submissions_data_size_check CHECK (
    octet_length(form_data::text) < 102400  -- 100KB limit
  )
);

-- Critical indexes for multi-tenancy and performance
CREATE INDEX submissions_company_id_index ON submissions(company_id);
CREATE INDEX submissions_form_id_index ON submissions(form_id);
CREATE INDEX submissions_status_index ON submissions(status);
CREATE INDEX submissions_submitted_at_index ON submissions(submitted_at DESC);
CREATE INDEX submissions_deleted_at_index ON submissions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX submissions_submitter_email_index ON submissions(submitter_email);

-- JSONB GIN indexes for metadata queries
CREATE INDEX submissions_metadata_gin ON submissions USING gin(metadata);
```

## Example Usage

### Creating a Submission (Public)

```elixir
# Public form submission controller
submission = Forms.create_submission!(%{
  form_id: form_id,
  form_data: %{
    "field-1" => "John Doe",
    "field-2" => "john@example.com",
    "field-3" => "Tell me more about pricing"
  },
  metadata: %{
    utm_source: "google",
    utm_medium: "cpc",
    referrer: request.referrer,
    user_agent: request.user_agent
  }
})
# Side effect: Triggers notification to company users
```

### Updating Status

```elixir
submission
|> Forms.update_submission_status!(%{status: "contacted"})
# Publishes forms.submission_status_changed event
```

### Soft Deleting

```elixir
submission
|> Forms.delete_submission!()
# Sets deleted_at to NOW()
```

### Querying New Leads

```elixir
Forms.list_submissions(%{
  company_id: company_id,
  status: "new",
  exclude_deleted: true,
  order_by: [submitted_at: :desc]
})
```

## Testing Checklist

- [ ] Create submission with valid data (should succeed)
- [ ] Create submission with missing required field (should fail)
- [ ] Create submission with invalid email format (should fail)
- [ ] Create submission for draft form (should fail)
- [ ] Create submission for archived form (should fail)
- [ ] Update submission status with valid transition (should succeed)
- [ ] Update submission status with invalid transition (should fail)
- [ ] Update form_data after creation (should fail - immutable)
- [ ] Soft delete submission (should succeed)
- [ ] Restore soft-deleted submission (should succeed)
- [ ] Multi-tenancy: Cannot read submissions from other companies
- [ ] Extract submitter_email from form_data correctly
- [ ] Trigger notification on submission creation
- [ ] Analytics: Calculate total submissions correctly
- [ ] Analytics: Calculate active users (last 30 days) correctly

## Performance Considerations

- **Indexes**: All key columns indexed (company_id, form_id, status, submitted_at, submitter_email)
- **JSONB Queries**: Use GIN index for metadata queries
- **Pagination**: List views should paginate at 50 submissions per page
- **Eager Loading**: Load form relationship when listing submissions
- **Export**: CSV generation should stream results for large datasets (10k+ rows)

## Related Specifications

- Form resource: `./form.md`
- FormField resource: `./form_field.md`
- Notification resource: `./notification.md`
- Lead Management feature: `../features/lead_management.feature.md`
- CSV Export feature: `../features/csv_export.feature.md`
- Multi-tenancy policies: `../policies/row_level_security.md`
