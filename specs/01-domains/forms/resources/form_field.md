# Resource: FormField

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents an individual input field within a form. FormFields define the structure, type, validation rules, and display properties for each piece of data to be collected. Fields are ordered and can have conditional visibility rules.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| form_id | uuid | Yes | valid form | Parent form |
| field_type | atom | Yes | enum: [:text, :email, :phone, :number, :select, :checkbox, :radio, :textarea, :date, :file] | Input field type |
| name | string | Yes | 1-100 chars, alphanumeric + underscore | Field identifier for data storage |
| label | string | Yes | 1-255 chars | Display label shown to user |
| placeholder | string | No | max 255 chars | Placeholder text in input |
| help_text | string | No | max 500 chars | Additional guidance below field |
| required | boolean | Yes | - | Whether field must be filled |
| order | integer | Yes | >= 0 | Display order in form (0-indexed) |
| validation_rules | map | No | valid JSON | Custom validation configuration |
| options | map | No | valid JSON | Field-specific options (for select, radio, checkbox) |
| default_value | string | No | max 1000 chars | Pre-filled value |
| conditional_logic | map | No | valid JSON | Show/hide rules based on other fields |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Field Type Details

**Text Types**:
- `:text` - Single-line text input
- `:email` - Email with RFC 5322 validation
- `:phone` - Phone number with formatting
- `:textarea` - Multi-line text input
- `:number` - Numeric input with min/max

**Choice Types**:
- `:select` - Dropdown selection (single or multi)
- `:radio` - Radio buttons (single choice)
- `:checkbox` - Checkboxes (multiple choices)

**Special Types**:
- `:date` - Date picker
- `:file` - File upload (for future)

### Validation Rules Map Structure

```elixir
%{
  # Text field validations
  min_length: 3,
  max_length: 100,
  pattern: "^[A-Z][a-z]+$",  # Regex pattern

  # Number field validations
  min: 0,
  max: 100,
  step: 5,

  # Email field validations
  confirm_email: true,  # Require confirmation field

  # Phone field validations
  country_code: "US",
  format: "(###) ###-####",

  # File field validations (future)
  max_file_size: 5_242_880,  # 5MB in bytes
  allowed_extensions: [".pdf", ".doc", ".docx"],

  # Custom validation
  custom_error_message: "Please enter a valid company email"
}
```

### Options Map Structure

```elixir
# For select/radio/checkbox fields
%{
  choices: [
    %{value: "option1", label: "Option 1"},
    %{value: "option2", label: "Option 2"},
    %{value: "other", label: "Other", requires_text: true}
  ],
  allow_multiple: false,  # For select fields
  allow_other: true,      # Show "Other" option with text input
  display_style: "dropdown" | "buttons" | "list"
}

# For number fields
%{
  show_spinner: true,
  prefix: "$",
  suffix: "%"
}

# For date fields
%{
  format: "MM/DD/YYYY",
  min_date: "today",
  max_date: "+30 days",
  disable_weekends: true,
  disable_dates: ["2024-12-25", "2024-01-01"]
}
```

### Conditional Logic Map Structure

```elixir
%{
  # Show this field only if...
  visibility_rules: [
    %{
      field_name: "are_you_business",
      operator: "equals",
      value: "yes"
    }
  ],
  logic_operator: "and" | "or"  # How to combine multiple rules
}

# Example: Show "Company Name" if "Are you a business?" is "Yes"
%{
  visibility_rules: [
    %{
      field_name: "customer_type",
      operator: "equals",
      value: "business"
    }
  ]
}

# Supported operators:
# - "equals", "not_equals"
# - "contains", "not_contains"
# - "greater_than", "less_than"
# - "is_empty", "is_not_empty"
```

## Business Rules

### Invariants

- Field `name` must be unique within a form
- At least one field in a form must be `required: true`
- `order` must be unique within a form (no gaps allowed)
- Cannot delete field if form has submissions (must mark as hidden)
- Select/radio/checkbox fields must have at least 1 choice in `options`
- Conditional logic cannot create circular dependencies
- `field_type` cannot be changed if form has submissions

### Validations

- **name**: Required, 1-100 characters, alphanumeric + underscore, unique per form
- **label**: Required, 1-255 characters, non-blank
- **field_type**: Must be valid enum value
- **required**: Boolean, defaults to false
- **order**: Non-negative integer, unique per form
- **options**: Required for select/radio/checkbox types, must have >= 1 choice
- **validation_rules.pattern**: Must be valid regex if present
- **conditional_logic**: Must reference existing field names

### Calculated Fields

- **is_choice_field**: `field_type in [:select, :radio, :checkbox]`
- **has_conditional_logic**: `conditional_logic != nil`
- **is_visible_by_default**: `conditional_logic == nil`

## Relationships

### Belongs To
- **Form** (forms.forms) - many-to-one
  - Cannot exist without parent form
  - Cascade delete if form deleted (and no submissions)

### Ordering

Fields maintain strict ordering via `order` attribute:
- Order starts at 0
- No gaps allowed (consecutive integers)
- Reordering updates multiple fields atomically

## Domain Events

### Published Events

- `forms.field_added`: Triggered when field added to form
  - Payload: {field_id, form_id, field_type, name, order}
  - Consumers: Analytics

- `forms.field_updated`: Triggered when field configuration changes
  - Payload: {field_id, changes}
  - Consumers: Analytics

- `forms.field_deleted`: Triggered when field removed from form
  - Payload: {field_id, form_id, name}
  - Consumers: Analytics

- `forms.field_reordered`: Triggered when field order changes
  - Payload: {form_id, field_orders: [{field_id, new_order}]}
  - Consumers: Analytics

## Access Patterns

### Queries

```elixir
# Get all fields for a form (ordered)
FormFields.list_fields(form_id)
# Returns: [%FormField{order: 0}, %FormField{order: 1}, ...]

# Get field by name
FormFields.get_by_name(form_id, "email")

# Get required fields only
FormFields.list_required_fields(form_id)

# Get choice fields (select/radio/checkbox)
FormFields.list_choice_fields(form_id)

# Get fields with conditional logic
FormFields.list_conditional_fields(form_id)
```

### Common Operations

**Create Field**:
```elixir
FormFields.create_field(%{
  form_id: uuid,
  field_type: :email,
  name: "email",
  label: "Email Address",
  placeholder: "you@example.com",
  help_text: "We'll never share your email",
  required: true,
  order: 0,
  validation_rules: %{
    confirm_email: false
  }
})
# Auto-calculates order if not provided
# Returns: {:ok, %FormField{}}
```

**Create Select Field**:
```elixir
FormFields.create_field(%{
  form_id: uuid,
  field_type: :select,
  name: "company_size",
  label: "Company Size",
  required: true,
  options: %{
    choices: [
      %{value: "1-10", label: "1-10 employees"},
      %{value: "11-50", label: "11-50 employees"},
      %{value: "51-200", label: "51-200 employees"},
      %{value: "201+", label: "201+ employees"}
    ],
    allow_multiple: false,
    display_style: "dropdown"
  }
})
```

**Create Conditional Field**:
```elixir
FormFields.create_field(%{
  form_id: uuid,
  field_type: :text,
  name: "company_name",
  label: "Company Name",
  required: true,
  conditional_logic: %{
    visibility_rules: [
      %{
        field_name: "customer_type",
        operator: "equals",
        value: "business"
      }
    ]
  }
})
```

**Update Field**:
```elixir
FormFields.update_field(field_id, %{
  label: "Updated Label",
  help_text: "New help text",
  validation_rules: %{min_length: 5}
})
# Cannot update: field_type, name (if submissions exist)
# Returns: {:ok, %FormField{}} | {:error, changeset}
```

**Reorder Fields**:
```elixir
FormFields.reorder_fields(form_id, [
  {field_id_1, 0},
  {field_id_2, 1},
  {field_id_3, 2}
])
# Updates all fields atomically
# Returns: {:ok, [%FormField{}, ...]}
```

**Delete Field**:
```elixir
FormFields.delete_field(field_id)
# Only if form has no submissions
# Reorders remaining fields to fill gap
# Returns: {:ok, %FormField{}}
```

## Submission Data Mapping

When form is submitted, FormField configuration determines validation:

```elixir
# FormField configuration
%FormField{
  name: "email",
  field_type: :email,
  required: true,
  validation_rules: %{
    confirm_email: false
  }
}

# Submission data structure
%FormSubmission{
  data: %{
    "email" => "user@example.com",
    "company_size" => "11-50",
    "company_name" => "Acme Inc"  # Only if conditional was true
  }
}

# Validation applied during submission:
# - Check "email" is present (required: true)
# - Validate email format (field_type: :email)
# - Check conditional fields were shown correctly
# - Validate against validation_rules
```

## Drag-Drop Builder Support

FormFields support drag-drop reordering in form builder:

**Frontend Implementation** (LiveView):
```heex
<div id="form-fields" phx-hook="SortableFields">
  <%= for field <- @fields do %>
    <div data-field-id={field.id} data-order={field.order}>
      <%= render_field_editor(field) %>
    </div>
  <% end %>
</div>
```

**JS Hook** (handles drag events):
```javascript
Hooks.SortableFields = {
  mounted() {
    Sortable.create(this.el, {
      onEnd: (evt) => {
        // Send new order to server
        this.pushEvent("reorder_fields", {
          field_id: evt.item.dataset.fieldId,
          new_order: evt.newIndex
        });
      }
    });
  }
}
```

**LiveView Handler**:
```elixir
def handle_event("reorder_fields", %{"field_id" => id, "new_order" => order}, socket) do
  FormFields.reorder_field(id, order)
  {:noreply, reload_fields(socket)}
end
```

## Conditional Logic Evaluation

When rendering form, evaluate conditional logic:

```elixir
defmodule Forms.ConditionalLogic do
  def is_field_visible?(field, submission_data) do
    case field.conditional_logic do
      nil -> true  # Always visible if no logic

      %{visibility_rules: rules, logic_operator: op} ->
        results = Enum.map(rules, &evaluate_rule(&1, submission_data))
        combine_results(results, op)
    end
  end

  defp evaluate_rule(%{field_name: name, operator: op, value: val}, data) do
    field_value = Map.get(data, name)

    case op do
      "equals" -> field_value == val
      "not_equals" -> field_value != val
      "contains" -> String.contains?(field_value || "", val)
      "is_empty" -> is_nil(field_value) or field_value == ""
      # ... other operators
    end
  end

  defp combine_results(results, "and"), do: Enum.all?(results)
  defp combine_results(results, "or"), do: Enum.any?(results)
end
```

## Performance Considerations

- **Field Loading**: Always preload fields when loading form (use `preload: :fields`)
- **Ordering**: Index on `(form_id, order)` for efficient ordered retrieval
- **Name Lookup**: Index on `(form_id, name)` for validation
- **Conditional Evaluation**: Cache visible fields during form session

## Testing Scenarios

### Unit Tests
- [ ] Create field with all types
- [ ] Validate name uniqueness within form
- [ ] Validate order uniqueness
- [ ] Cannot change field_type after submissions
- [ ] Select fields require choices
- [ ] Conditional logic validation
- [ ] Reordering maintains consecutive integers

### Integration Tests
- [ ] Creating field publishes event
- [ ] Deleting field reorders remaining fields
- [ ] Conditional logic evaluated correctly
- [ ] Form cannot be published without required field

---

**Related Resources**:
- [Form](./form.md) - Parent form container
- [FormSubmission](./form_submission.md) - Submitted form data

**Related Features**:
- [Form Builder Feature](../features/form_builder.feature.md)
- [Form Submission Feature](../features/form_submission.feature.md)
