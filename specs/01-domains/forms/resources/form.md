# Resource: Form

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents a customizable data collection interface with configurable fields, validation rules, and post-submission actions. Forms are created by users, published to collect submissions, and can trigger calendar bookings or chatbot interactions.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this form |
| owner_id | uuid | Yes | valid user | User who created form |
| name | string | Yes | 1-255 chars | Form display name |
| description | text | No | max 2000 chars | Form purpose description |
| status | atom | Yes | enum: [:draft, :published, :unpublished, :archived] | Form lifecycle state |
| slug | string | Yes | unique per company, lowercase, alphanumeric + hyphens | URL-friendly form identifier |
| settings | map | Yes | valid JSON | Form configuration settings |
| published_at | utc_datetime | No | - | When form was first published |
| unpublished_at | utc_datetime | No | - | When form was taken offline |
| archived_at | utc_datetime | No | - | When form was archived |
| submission_count | integer | Yes | >= 0 | Cached count of submissions |
| conversion_rate | decimal | Yes | 0.0-100.0 | Percentage of views that submit |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Settings Map Structure

```elixir
%{
  # Display settings
  submit_button_text: "Submit",
  success_message: "Thank you for your submission!",
  theme: "light" | "dark",

  # Behavior settings
  allow_multiple_submissions: false,
  require_email_confirmation: false,
  enable_auto_save: true,

  # Post-submission actions
  post_submission_actions: [
    %{
      type: "calendar_booking",
      enabled: true,
      config: %{
        calendar_connection_id: "uuid",
        meeting_duration: 30,
        custom_questions: [...]
      }
    },
    %{
      type: "chatbot_trigger",
      enabled: true,
      config: %{
        auto_open: true,
        greeting_override: "Thanks for submitting!"
      }
    },
    %{
      type: "redirect",
      enabled: false,
      config: %{
        url: "https://example.com/thank-you",
        delay_seconds: 0
      }
    }
  ],

  # Notifications
  notification_email: "owner@example.com",
  send_copy_to_submitter: false,

  # Analytics
  track_partial_submissions: true,
  track_field_interactions: true
}
```

## Business Rules

### Invariants

- At least one FormField must exist before publishing
- At least one FormField must be marked required
- Slug must be unique within company scope
- Cannot transition from `:archived` to `:published` (must create new form)
- `published_at` cannot be changed once set
- Cannot delete form with submissions (must archive)
- `submission_count` must match actual FormSubmission count

### Validations

- **name**: Required, 1-255 characters, cannot be blank
- **slug**: Required, lowercase alphanumeric with hyphens, 3-100 characters, unique per company
- **status**: Must be one of [:draft, :published, :unpublished, :archived]
- **settings.submit_button_text**: Max 50 characters
- **settings.success_message**: Max 500 characters
- **settings.post_submission_actions**: Max 5 actions
- **conversion_rate**: Between 0.0 and 100.0
- **submission_count**: Non-negative integer

### Calculated Fields

- **is_published**: `status == :published`
- **has_submissions**: `submission_count > 0`
- **days_since_published**: `Date.diff(Date.utc_today(), published_at)`
- **average_completion_time**: Calculated from FormSubmission durations

## State Transitions

```
draft → published → archived
   ↓        ↓
   → unpublished ←
```

**Valid Transitions**:

- `draft → published`: When form has >= 1 field and all validations pass
  - Sets `published_at` to current timestamp
  - Generates public URL

- `published → unpublished`: Admin explicitly takes form offline
  - Sets `unpublished_at` to current timestamp
  - Form URL returns 404

- `unpublished → published`: Admin re-publishes form
  - Keeps original `published_at`
  - Clears `unpublished_at`

- `published → archived`: Form is no longer needed but has submissions
  - Sets `archived_at` to current timestamp
  - Form URL returns 404
  - Data retained for audit trail

- `draft → archived`: Draft form abandoned
  - Sets `archived_at` to current timestamp
  - No data loss concern (no submissions)

**Invalid Transitions**:

- `archived → published`: Cannot resurrect archived forms
- `archived → draft`: Archived is terminal state
- `unpublished → draft`: Cannot revert to draft after publishing

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one
- **Owner** (accounts.users) - many-to-one

### Has Many
- **FormFields** (forms.form_fields) - one-to-many, ordered
  - Cascade delete when form deleted (if no submissions)
  - Cannot delete if submissions exist

- **FormSubmissions** (forms.form_submissions) - one-to-many
  - Never cascade delete (audit trail)
  - Prevents form deletion

### Has Many Through
- **CalendarBookings** through FormSubmissions
- **ChatbotLeads** through FormSubmissions

## Domain Events

### Published Events

- `forms.form_created`: Triggered on create
  - Payload: {form_id, company_id, owner_id, name, slug}
  - Consumers: Analytics

- `forms.form_published`: Triggered on first publish or re-publish
  - Payload: {form_id, published_at, public_url}
  - Consumers: Analytics, Email (notify owner)

- `forms.form_unpublished`: Triggered when taken offline
  - Payload: {form_id, unpublished_at, reason}
  - Consumers: Analytics

- `forms.form_archived`: Triggered on archive
  - Payload: {form_id, archived_at, final_submission_count}
  - Consumers: Analytics, cleanup jobs

### Subscribed Events

- `forms.submission_received`: Updates `submission_count`
- `authorization.company_deleted`: Cascades archive all forms

## Access Patterns

### Queries

```elixir
# List all forms for company
Forms.list_forms(company_id)

# Get form by slug (public access)
Forms.get_by_slug(company_id, slug)

# List published forms only
Forms.list_published_forms(company_id)

# Get forms by owner
Forms.list_forms_by_owner(owner_id)

# Search forms by name
Forms.search_forms(company_id, query)

# Get forms with high conversion
Forms.list_high_converting_forms(company_id, min_rate: 50.0)

# Get recently created forms
Forms.list_recent_forms(company_id, days: 7)
```

### Common Operations

**Create**:
```elixir
Forms.create_form(%{
  company_id: uuid,
  owner_id: uuid,
  name: "Lead Capture Form",
  description: "Captures leads from landing page",
  slug: "lead-capture-2024",
  settings: %{
    submit_button_text: "Get Started",
    success_message: "We'll be in touch soon!",
    theme: "light"
  }
})
# Returns: {:ok, %Form{status: :draft, ...}}
```

**Publish**:
```elixir
Forms.publish_form(form_id)
# Validates: has_fields?, has_required_field?
# Sets: published_at, status: :published
# Returns: {:ok, %Form{}} | {:error, reason}
```

**Unpublish**:
```elixir
Forms.unpublish_form(form_id, reason: "Needs updates")
# Sets: unpublished_at, status: :unpublished
# Returns: {:ok, %Form{}}
```

**Archive**:
```elixir
Forms.archive_form(form_id, reason: "Campaign ended")
# Sets: archived_at, status: :archived
# Returns: {:ok, %Form{}}
```

**Update**:
- Can modify name, description, settings when status is :draft or :unpublished
- Cannot modify structural attributes when :published
- Cannot modify anything when :archived

**Delete**:
- Can delete if status is :draft and submission_count == 0
- Cannot delete if has submissions (use archive instead)
- Cascades delete FormFields if no submissions exist

## Authorization Policy

See: [Form Access Policy](../policies/form_access.md)

**Summary**:
- Company members can view all forms in their company
- Form owners can edit/delete their forms
- Company admins can edit/delete any form
- Public can view published forms via slug (read-only)
- Cross-company access denied

## Analytics & Reporting

**Key Metrics**:
- Total forms created per company
- Forms by status (draft, published, archived)
- Average time from create to publish
- Submission count per form
- Conversion rate per form
- Most popular forms by submissions
- Forms with zero submissions in last 30 days

**Aggregations**:
```elixir
Forms.get_form_stats(company_id)
# Returns: %{
#   total: 45,
#   draft: 12,
#   published: 28,
#   archived: 5,
#   avg_submissions: 234.5,
#   total_submissions: 10557
# }
```

## Performance Considerations

- **Submission Count**: Updated via background job (not real-time)
- **Conversion Rate**: Calculated nightly for all published forms
- **Indexing**: Index on (company_id, status) for list queries
- **Indexing**: Index on (company_id, slug) for public lookups
- **Caching**: Cache published forms with 5-minute TTL
- **Eager Loading**: Preload FormFields when rendering forms

## Testing Scenarios

### Unit Tests
- [ ] Create form with valid attributes
- [ ] Validate slug uniqueness within company
- [ ] Validate slug format (lowercase, alphanumeric, hyphens)
- [ ] Cannot publish without fields
- [ ] Cannot publish without required field
- [ ] State transitions follow state machine
- [ ] Settings map validates correctly
- [ ] Conversion rate stays in 0-100 range

### Integration Tests
- [ ] Creating form publishes domain event
- [ ] Publishing form generates public URL
- [ ] Archived forms cannot be published
- [ ] Forms with submissions cannot be deleted
- [ ] Submission count updates on new submission

---

**Related Resources**:
- [FormField](./form_field.md) - Individual fields within form
- [FormSubmission](./form_submission.md) - Submitted data
- [CalendarBooking](./calendar_booking.md) - Post-submission bookings

**Related Features**:
- [Form Builder Feature](../features/form_builder.feature.md)
- [Form Submission Feature](../features/form_submission.feature.md)

**Related Policies**:
- [Form Access Policy](../policies/form_access.md)
