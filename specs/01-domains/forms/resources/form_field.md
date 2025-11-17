# Resource: FormField

**Domain**: Forms
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

## Purpose

Represents an individual input field within a form. Defines the field type, label, validation rules, and configuration. Part of the Form aggregate - fields are owned by a form and cascade deleted when the form is deleted.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid Company id | Company reference (duplicative for debugging) |
| form_id | uuid | Yes | valid Form id | Parent form reference |
| field_type | enum | Yes | one of 10 types (see below) | Type of input field |
| label | string | Yes | min: 1, max: 100 | Field display label |
| placeholder | string | No | max: 200 | Input placeholder text |
| help_text | string | No | max: 500 | Additional help text shown below field |
| is_required | boolean | Yes | default: false | Whether field is mandatory |
| position | integer | Yes | positive, unique per form | Display order (1, 2, 3, ...) |
| validation_rules | map | No | valid JSON structure | Field-specific validation configuration |
| field_config | map | No | valid JSON structure | Field type-specific configuration |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Field Types (MVP)

**10 supported types** (file upload explicitly excluded):

### Basic Types (6)

| Type | Input Element | Use Case | Example |
|------|---------------|----------|---------|
| text | `<input type="text">` | Short text (name, title) | "John Doe" |
| email | `<input type="email">` | Email addresses | "user@example.com" |
| textarea | `<textarea>` | Long text (message, comments) | "Tell us more..." |
| select | `<select>` | Single choice from list | "Country: USA" |
| checkbox | `<input type="checkbox">` | Boolean yes/no | "Subscribe to newsletter" |
| radio | `<input type="radio">` | Single choice from options | "Size: S / M / L" |

### Advanced Types (4)

| Type | Input Element | Use Case | Example |
|------|---------------|----------|---------|
| number | `<input type="number">` | Numeric values | "42" |
| date | `<input type="date">` | Date selection | "2025-11-16" |
| phone | `<input type="tel">` | Phone numbers | "+1 555-123-4567" |
| url | `<input type="url">` | Website URLs | "https://example.com" |

### Excluded from MVP (Phase 3+)

- **file**: File upload (requires storage infrastructure, S3/R2, security)

## Attribute Details

### validation_rules (JSONB)

Field-specific validation configuration:

```elixir
%{
  min_length: 5,                    # Minimum characters (text, textarea, email, url)
  max_length: 100,                  # Maximum characters
  min_value: 0,                     # Minimum value (number, date)
  max_value: 100,                   # Maximum value
  pattern: nil,                     # Custom regex (Phase 3 - not in MVP)
  custom_error_message: nil         # Custom error message (Phase 3 - not in MVP)
}
```

**MVP Validation Rules**:
- **Required**: Enforced via is_required boolean
- **Email format**: Built-in validation for field_type='email'
- **Phone format**: Basic validation for field_type='phone' (digits, +, -, spaces)
- **URL format**: Built-in validation for field_type='url'
- **Min/max length**: For text, textarea, email, url types
- **Min/max value**: For number and date types

**Phase 3+ (not in MVP)**:
- Custom regex patterns
- Custom error messages
- Cross-field validation

### field_config (JSONB)

Type-specific configuration:

#### Select Field
```elixir
%{
  options: [
    %{label: "Option 1", value: "opt1"},
    %{label: "Option 2", value: "opt2"}
  ],
  allow_other: false  # Phase 3: Allow "Other" with text input
}
```

#### Radio Field
```elixir
%{
  options: [
    %{label: "Yes", value: "yes"},
    %{label: "No", value: "no"}
  ],
  layout: "vertical"  # "vertical" | "horizontal"
}
```

#### Checkbox Field
```elixir
%{
  checked_value: "yes",      # Value when checked
  unchecked_value: "no"      # Value when unchecked (optional)
}
```

#### Number Field
```elixir
%{
  step: 1,                   # Increment/decrement step
  prefix: "$",               # Optional prefix (e.g., "$" for currency)
  suffix: " USD"             # Optional suffix
}
```

#### Phone Field
```elixir
%{
  default_country: "US",     # Default country code
  format: "international"    # "international" | "national"
}
```

#### Date Field
```elixir
%{
  min_date: "2025-01-01",    # Earliest selectable date
  max_date: "2025-12-31",    # Latest selectable date
  default_to_today: true     # Pre-fill with today's date
}
```

## Business Rules

### Invariants

- Each field belongs to exactly one form
- Field positions must be sequential (1, 2, 3, ...) with no gaps within a form
- Cannot add/remove fields from published forms (must create new version)
- Field type cannot be changed after creation (delete and recreate instead)

### Validations

- **label**: 1-100 characters, must not be blank
- **field_type**: Must be one of 10 supported types (text, email, textarea, select, checkbox, radio, number, date, phone, url)
- **position**: Must be positive integer, unique per form
- **validation_rules.min_length**: Must be >= 0 and < max_length
- **validation_rules.max_length**: Must be > min_length
- **field_config.options**: Required for select and radio types (min 2 options)
- **Select/Radio options**: Each option must have unique value within field

### Calculated Fields

None (simple entity, no aggregations)

## State Transitions

FormField has no explicit state machine - it follows the parent Form's lifecycle:

- **Draft form**: Fields can be added, updated, deleted, reordered
- **Published form**: Fields are read-only (cannot add, update, or delete)
- **Archived form**: Fields are read-only (preserved for historical submissions)

## Relationships

- **Belongs to**: Form (via form_id, cascade delete)

## Domain Events

### Published Events

- `forms.field_added`: Triggered when field is added to form
  - Payload: {field_id, form_id, field_type, label, position}
  - Consumers: Analytics, Form Builder UI (live update)

- `forms.field_updated`: Triggered when field is modified
  - Payload: {field_id, form_id, changes}
  - Consumers: Analytics, Form Builder UI (live update)

- `forms.field_deleted`: Triggered when field is removed
  - Payload: {field_id, form_id}
  - Consumers: Analytics, Form Builder UI (live update)

- `forms.fields_reordered`: Triggered when field positions change
  - Payload: {form_id, new_positions: [{field_id, position}]}
  - Consumers: Form Builder UI (live update)

### Subscribed Events

None

## Access Patterns

### Queries

- **Get fields for form**: Filter by form_id, order by position ASC
- **Get field by ID**: Direct lookup with form relationship
- **Count fields for form**: Aggregate count grouped by form_id

### Common Operations

#### Create

**Required attributes**: form_id, field_type, label, position

**Validations**:
- Form must exist and be in 'draft' status
- Position must be unique within form
- Field type must be one of 10 supported types
- If select/radio: field_config.options must have at least 2 options

**Side effects**:
- Auto-increment position if not specified (max position + 1)
- Creates default validation_rules based on field_type
- Publishes forms.field_added event

**Authorization**: Requires admin or manager role

#### Read

**Available to**: All company members (via form.company_id)
**Public access**: Published forms include fields in public API

#### Update

**Updatable fields** (draft forms only):
- label, placeholder, help_text, is_required, validation_rules, field_config

**Immutable fields**:
- form_id, field_type, position (use reorder action instead)

**Restrictions**:
- Cannot update if parent form status is 'published' or 'archived'

**Side effects**:
- Updates updated_at timestamp
- Publishes forms.field_updated event

**Authorization**: Requires admin or manager role

#### Reorder

**Action**: Update field positions for drag-and-drop reordering

**Input**: Array of {field_id, new_position}

**Validations**:
- All field IDs must belong to the same form
- Form must be in 'draft' status
- New positions must be sequential (1, 2, 3, ...)

**Side effects**:
- Updates position for all affected fields
- Publishes forms.fields_reordered event

**Authorization**: Requires admin or manager role

#### Delete

**Restrictions**:
- Can only delete from draft forms
- Cannot delete if form is published or archived

**Side effects**:
- Hard delete (no soft delete for fields)
- Renumbers remaining fields to maintain sequential positions
- Publishes forms.field_deleted event

**Authorization**: Requires admin or manager role

## Field Rendering (Public Forms)

When rendering a public form, each field type maps to specific HTML:

### Text, Email, URL, Phone
```html
<label for="field-{id}">{label} {is_required && "*"}</label>
<input
  type="{field_type}"
  id="field-{id}"
  name="{id}"
  placeholder="{placeholder}"
  required="{is_required}"
  minlength="{validation_rules.min_length}"
  maxlength="{validation_rules.max_length}"
/>
{help_text && <p class="help-text">{help_text}</p>}
```

### Textarea
```html
<label for="field-{id}">{label} {is_required && "*"}</label>
<textarea
  id="field-{id}"
  name="{id}"
  placeholder="{placeholder}"
  required="{is_required}"
  minlength="{validation_rules.min_length}"
  maxlength="{validation_rules.max_length}"
></textarea>
```

### Select
```html
<label for="field-{id}">{label} {is_required && "*"}</label>
<select id="field-{id}" name="{id}" required="{is_required}">
  <option value="">Select...</option>
  {field_config.options.map(opt =>
    <option value="{opt.value}">{opt.label}</option>
  )}
</select>
```

### Radio
```html
<fieldset>
  <legend>{label} {is_required && "*"}</legend>
  {field_config.options.map((opt, idx) =>
    <label>
      <input
        type="radio"
        name="{id}"
        value="{opt.value}"
        required="{is_required && idx === 0}"
      />
      {opt.label}
    </label>
  )}
</fieldset>
```

### Checkbox
```html
<label>
  <input
    type="checkbox"
    name="{id}"
    value="{field_config.checked_value}"
    required="{is_required}"
  />
  {label}
</label>
```

### Number
```html
<label for="field-{id}">{label} {is_required && "*"}</label>
<div class="input-group">
  {field_config.prefix && <span>{field_config.prefix}</span>}
  <input
    type="number"
    id="field-{id}"
    name="{id}"
    step="{field_config.step || 1}"
    min="{validation_rules.min_value}"
    max="{validation_rules.max_value}"
    required="{is_required}"
  />
  {field_config.suffix && <span>{field_config.suffix}</span>}
</div>
```

### Date
```html
<label for="field-{id}">{label} {is_required && "*"}</label>
<input
  type="date"
  id="field-{id}"
  name="{id}"
  min="{field_config.min_date}"
  max="{field_config.max_date}"
  required="{is_required}"
/>
```

## Client-Side Validation

**MVP includes selective client-side validation** for better UX:

### Always Validated Client-Side
- Required fields (prevent submission if empty)
- Email format (HTML5 email validation)
- URL format (HTML5 URL validation)
- Phone format (basic: digits, +, -, spaces)
- Min/max length (HTML5 minlength/maxlength)
- Min/max value (HTML5 min/max for numbers and dates)

### Server-Side Only (Not Client-Side in MVP)
- Custom regex patterns (Phase 3)
- Cross-field validation (Phase 3)
- Complex business logic validation

**All validation is ALWAYS enforced server-side** via Ash validations as the source of truth.

## Security & Authorization

### Policies

**Read**:
- Company members: Can read all fields for forms in their company
- Public: Can read fields for published forms via public API

**Create**:
- Requires: Admin or Manager role
- Restriction: Form must be in 'draft' status
- Multi-tenancy: Validated via parent form.company_id

**Update**:
- Requires: Admin or Manager role
- Restriction: Form must be in 'draft' status

**Delete**:
- Requires: Admin or Manager role
- Restriction: Form must be in 'draft' status

### Multi-Tenancy

Fields inherit company context from parent Form - no separate company_id needed.

### Data Validation

**Type-Specific Validation**:
- Email: Must match email regex
- URL: Must be valid URL format
- Phone: Must contain only digits, +, -, spaces
- Number: Must be numeric
- Date: Must be valid ISO date format

**Configuration Validation**:
- Select/Radio: options array must have at least 2 items
- Each option must have label and value
- Option values must be unique within field

## Database Schema

```sql
CREATE TABLE forms_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms_forms(id) ON DELETE CASCADE,
  field_type VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  placeholder VARCHAR(200),
  help_text VARCHAR(500),
  is_required BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  field_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT forms_fields_type_check CHECK (
    field_type IN ('text', 'email', 'textarea', 'select', 'checkbox', 'radio',
                   'number', 'date', 'phone', 'url')
  ),
  CONSTRAINT forms_fields_position_check CHECK (position > 0),
  CONSTRAINT forms_fields_position_unique UNIQUE (form_id, position)
);

-- Indexes for performance
CREATE INDEX forms_fields_company_id_index ON forms_fields(company_id);
CREATE INDEX forms_fields_form_id_index ON forms_fields(form_id);
CREATE INDEX forms_fields_position_index ON forms_fields(form_id, position);
```

## Example Usage

### Adding a Text Field

```elixir
field = Forms.add_field_to_form!(form, %{
  field_type: "text",
  label: "Full Name",
  placeholder: "Enter your name",
  is_required: true,
  position: 1,
  validation_rules: %{
    min_length: 2,
    max_length: 100
  }
})
```

### Adding a Select Field

```elixir
field = Forms.add_field_to_form!(form, %{
  field_type: "select",
  label: "Country",
  is_required: true,
  position: 2,
  field_config: %{
    options: [
      %{label: "United States", value: "US"},
      %{label: "Canada", value: "CA"},
      %{label: "Mexico", value: "MX"}
    ]
  }
})
```

### Reordering Fields

```elixir
Forms.reorder_fields!(form, [
  {field1.id, 1},  # Move to position 1
  {field2.id, 2},  # Move to position 2
  {field3.id, 3}   # Move to position 3
])
```

## Testing Checklist

- [ ] Create field with each of 10 supported types
- [ ] Create field with invalid type (should fail)
- [ ] Create field with duplicate position (should fail)
- [ ] Create select field without options (should fail)
- [ ] Create field in published form (should fail)
- [ ] Update field in draft form (should succeed)
- [ ] Update field in published form (should fail)
- [ ] Delete field from draft form (should succeed)
- [ ] Delete field from published form (should fail)
- [ ] Reorder fields (should update positions)
- [ ] Validate required field (server-side)
- [ ] Validate email format (server and client)
- [ ] Validate min/max length (server and client)
- [ ] Validate select options uniqueness

## Performance Considerations

- **Indexes**: form_id and position columns indexed for fast queries
- **Eager Loading**: When loading form, eager load fields ordered by position
- **Field Limits**: Reasonable limit of ~50 fields per form (UX consideration)
- **Caching**: Published form fields can be cached with form HTML (future optimization)

## Related Specifications

- Form resource: `./form.md`
- Submission resource: `./submission.md`
- Form Builder feature: `../features/form_builder.feature.md`
- Field validation policies: `../policies/validation_rules.md`
