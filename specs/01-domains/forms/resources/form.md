# Resource: Form

**Domain**: Forms
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

## Purpose

Represents a customizable data collection template that companies can create, configure, and embed on their websites. Acts as the aggregate root for form fields and submissions. Supports branding customization, field management, and lifecycle states (draft → published → archived).

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| tenant_id | uuid | Yes | valid Company id | Multi-tenancy reference |
| name | string | Yes | min: 2, max: 100, unique within company | Form display name |
| description | string | No | max: 500 | Form purpose description |
| slug | string | Yes | unique within company, lowercase, alphanumeric + hyphens, max: 50 | URL-safe identifier for embedding |
| status | enum | Yes | one of: draft, published, archived | Form lifecycle state |
| branding | map | No | valid JSON structure | Custom branding configuration |
| settings | map | No | valid JSON structure | Form behavior settings |
| published_at | utc_datetime_usec | No | - | Timestamp when first published |
| created_by | uuid | Yes | valid AuthzUser id | Creator reference |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Attribute Details

### branding (JSONB)

Custom styling and appearance configuration:

```elixir
%{
  primary_color: "#3B82F6",      # Hex color for buttons, accents
  logo_url: "https://...",        # Company logo URL
  background_color: "#FFFFFF",    # Form background
  text_color: "#1F2937",          # Primary text color
  font_family: "Inter"            # Font choice
}
```

### settings (JSONB)

Form behavior and configuration:

```elixir
%{
  redirect_url: "https://...",                    # Post-submission redirect
  success_message: "Thank you for your submission!", # Custom success message
  collect_utm_params: true,                       # Track UTM parameters
  enable_recaptcha: false,                        # Spam protection (Phase 3)
  allow_multiple_submissions: true,               # Same email can submit multiple times
  post_submission_action: "show_message"          # "show_message" | "redirect"
}
```

## Business Rules

### Invariants

- Form name must be unique within a company
- Slug must be unique within a company
- Published forms cannot have fields added or removed (must create new version)
- Cannot delete form with submissions (must archive instead)
- Status transitions are one-way: draft → published → archived

### Validations

- **name**: 2-100 characters, must not be blank, unique per company
- **slug**: lowercase, alphanumeric + hyphens only, no spaces, unique per company
- **status**: Can only transition forward (draft → published → archived)
- **branding.primary_color**: Must be valid hex color (e.g., #3B82F6)
- **settings.redirect_url**: Must be valid URL if provided
- **published_at**: Automatically set on first publish, immutable after that

### Calculated Fields

- **fields_count**: Count of form_fields (all statuses)
- **submissions_count**: Count of submissions WHERE deleted_at IS NULL
- **conversion_rate**: (submissions_count / views_count) * 100 (if view tracking enabled)
- **last_submission_at**: MAX(submissions.submitted_at)
- **is_published**: status == 'published'

## State Transitions

```
[new] → draft → published → archived
```

**Valid Transitions**:

- `draft → published`: When form is ready for use
  - Validation: Must have at least 1 field
  - Side effect: Sets published_at timestamp
  - Side effect: Generates public embed URL
  - Triggers event: forms.form_published

- `published → archived`: When form is no longer needed
  - Validation: Cannot be undone
  - Side effect: Form no longer accepts submissions
  - Side effect: Public URL returns 404
  - Triggers event: forms.form_archived

**Invalid Transitions**:
- `archived → published`: Not allowed (create new form instead)
- `published → draft`: Not allowed (version control)

## Relationships

- **Belongs to**: Company (via tenant_id)
- **Belongs to**: AuthzUser (via created_by)
- **Has many**: FormField (1:Many, cascade delete)
- **Has many**: Submission (1:Many, no cascade delete)

## Domain Events

### Published Events

- `forms.form_created`: Triggered when form is created
  - Payload: {form_id, tenant_id, name, slug, created_by, created_at}
  - Consumers: Analytics

- `forms.form_published`: Triggered when status changes to published
  - Payload: {form_id, tenant_id, name, public_url, published_at}
  - Consumers: Analytics, Cache Invalidation, Marketing Automation (future)

- `forms.form_archived`: Triggered when status changes to archived
  - Payload: {form_id, tenant_id, archived_by, archived_at, submissions_count}
  - Consumers: Analytics, Cleanup Service

- `forms.form_duplicated`: Triggered when form is duplicated
  - Payload: {new_form_id, original_form_id, tenant_id, duplicated_by}
  - Consumers: Analytics

### Subscribed Events

None

## Access Patterns

### Queries

- **List forms for company**: Filter by tenant_id, order by updated_at DESC
- **Get form by ID**: Include fields, submissions_count, last_submission_at
- **Get form by slug**: Public lookup for embedding (status must be published)
- **Get published forms**: Filter by status = published AND tenant_id
- **Search forms by name**: Full-text search on name (future enhancement)

### Common Operations

#### Create

**Required attributes**: name, tenant_id, created_by
**Optional attributes**: description, branding, settings

**Side effects**:
- Auto-generates slug from name (e.g., "Contact Form" → "contact-form")
- Sets status to 'draft'
- Creates default success_message in settings
- Records audit log entry
- Publishes forms.form_created event

**Authorization**: Requires admin or manager role

#### Read

**Available to**: All company members
**Filtering**: Always filtered by tenant_id via Ash policy
**Public access**: Forms with status='published' accessible via public endpoint

#### Update

**Updatable fields** (draft status only):
- name, description, slug, branding, settings

**Restrictions**:
- Cannot update if status is 'published' or 'archived'
- Cannot update tenant_id or created_by (immutable)
- Slug changes require uniqueness check

**Side effects**:
- Updates updated_at timestamp
- Records audit log entry

**Authorization**: Requires admin or manager role

#### Publish

**Action**: Update status from 'draft' to 'published'

**Validations**:
- Must have at least 1 form field
- All required form fields must have valid configuration
- Cannot publish if already published or archived

**Side effects**:
- Sets published_at to current timestamp
- Makes form accessible via public URL
- Publishes forms.form_published event

**Authorization**: Requires admin or manager role

#### Archive

**Action**: Update status from 'published' to 'archived'

**Side effects**:
- Form no longer accepts submissions (public URL returns 404)
- Existing submissions remain accessible
- Fields are preserved (read-only)
- Publishes forms.form_archived event

**Authorization**: Requires admin role only

#### Duplicate

**Action**: Create a copy of form + all fields

**Process**:
1. Copy form attributes (new ID, new slug with "-copy" suffix)
2. Copy all form fields (new IDs, same configuration)
3. Set status to 'draft'
4. Set created_by to current user
5. Clear published_at

**Side effects**:
- Creates new form record
- Creates new form_field records
- Publishes forms.form_duplicated event

**Authorization**: Requires admin or manager role

#### Delete

**Action**: Soft delete (not supported - use Archive instead)

**Restrictions**:
- Hard delete not allowed if submissions exist
- Must archive instead of delete

**Authorization**: Requires admin role only

## Public API

### Embed Endpoint

**URL**: `/forms/embed/{slug}`
**Method**: GET
**Authentication**: None (public)

**Response**: HTML form or JSON schema for rendering

**Validation**:
- Form must exist with matching slug
- Form status must be 'published'
- Returns 404 if archived or not found

### Submit Endpoint

**URL**: `/forms/submit/{form_id}`
**Method**: POST
**Authentication**: None (public)

**Request Body**:
```json
{
  "form_data": {
    "email": "user@example.com",
    "name": "John Doe",
    "message": "Hello!"
  },
  "metadata": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "referrer": "https://google.com"
  }
}
```

**Validation**:
- Form must exist and be published
- All required fields must be present
- Field values must match expected types
- Data size must be reasonable (<100KB)

**Side effects**:
- Creates Submission record
- Publishes forms.submission_created event
- Triggers notifications based on user preferences

## Security & Authorization

### Policies

**Read**:
- Company members: Can read all forms in their company
- Public: Can read published forms via public endpoints only

**Create**:
- Requires: Admin or Manager role
- Multi-tenancy: Auto-set tenant_id from current_tenant_id

**Update**:
- Requires: Admin or Manager role
- Restrictions: Only updatable if status == 'draft'
- Multi-tenancy: Can only update forms in their company

**Publish**:
- Requires: Admin or Manager role
- Validation: Must have at least 1 field

**Archive**:
- Requires: Admin role only
- Cannot be undone

**Delete**:
- Not supported (use archive instead)

### Multi-Tenancy

All queries automatically filtered by tenant_id:

```elixir
# Ash policy example
policy action_type(:read) do
  authorize_if actor_attribute_equals(:tenant_id, :tenant_id)
end
```

### Data Validation

**Server-side** (always enforced):
- Required field presence
- Name/slug uniqueness within company
- Status transition rules
- Branding JSON structure validity

**Client-side** (optional for UX):
- Real-time slug availability check
- Color picker validation
- URL format validation

## Database Schema

```sql
CREATE TABLE forms_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES authz_tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  slug VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES authz_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT forms_forms_status_check CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT forms_forms_name_company_unique UNIQUE (tenant_id, name),
  CONSTRAINT forms_forms_slug_company_unique UNIQUE (tenant_id, slug)
);

-- Indexes for performance
CREATE INDEX forms_forms_tenant_id_index ON forms_forms(tenant_id);
CREATE INDEX forms_forms_status_index ON forms_forms(status);
CREATE INDEX forms_forms_slug_index ON forms_forms(slug);
CREATE INDEX forms_forms_created_by_index ON forms_forms(created_by);
CREATE INDEX forms_forms_published_at_index ON forms_forms(published_at DESC) WHERE published_at IS NOT NULL;
```

## Example Usage

### Creating a Contact Form

```elixir
# In Phoenix LiveView or controller
form = Forms.create_form!(%{
  name: "Contact Us",
  description: "Get in touch with our team",
  tenant_id: current_tenant_id,
  created_by: current_authz_user.id,
  branding: %{
    primary_color: "#3B82F6",
    logo_url: "https://example.com/logo.png"
  },
  settings: %{
    success_message: "Thank you! We'll be in touch soon.",
    collect_utm_params: true
  }
})
```

### Publishing a Form

```elixir
# After adding fields
form
|> Forms.publish_form!()
# Side effect: published_at set, public URL available
```

### Duplicating a Form

```elixir
new_form = Forms.duplicate_form!(form, %{
  created_by: current_authz_user.id
})
# new_form.name = "Contact Us (copy)"
# new_form.status = "draft"
# All fields copied with new IDs
```

## Testing Checklist

- [ ] Create form with valid attributes
- [ ] Create form with duplicate name (should fail)
- [ ] Create form with invalid slug (should fail)
- [ ] Update form in draft status (should succeed)
- [ ] Update form in published status (should fail)
- [ ] Publish form without fields (should fail)
- [ ] Publish form with fields (should succeed)
- [ ] Archive published form (should succeed)
- [ ] Re-publish archived form (should fail)
- [ ] Duplicate form (should create copy with all fields)
- [ ] Multi-tenancy: Cannot read forms from other companies
- [ ] Public access: Can access published form via slug
- [ ] Public access: Cannot access draft or archived form

## Performance Considerations

- **Indexes**: Ensure tenant_id, status, slug all indexed
- **Eager Loading**: When listing forms, load fields_count and submissions_count via Ash aggregates
- **Caching**: Public form HTML can be cached (future optimization)
- **Pagination**: List views should paginate at 25 forms per page

## Related Specifications

- FormField resource: `./form_field.md`
- Submission resource: `./submission.md`
- Form Builder feature: `../features/form_builder.feature.md`
- Multi-tenancy policies: `../policies/row_level_security.md`
