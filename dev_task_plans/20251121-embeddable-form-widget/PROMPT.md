# Embeddable Form Widget for External Websites

## Overview

Create an embeddable form widget that customers can place on external websites (like Wix) using a custom HTML element. The widget fetches form metadata from our Phoenix/Ash backend, renders the form with style inheritance via CSS variables, and submits data back to our server.

## Embed Tag Format

```html
<script src="https://app.clientt.com/embed/clientt-forms.js"></script>
<clientt-form form-id="01234567-89ab-cdef-0123-456789abcdef"></clientt-form>
```

**Optional attributes:**
- `lazy` - Only load form when scrolled into view
- Example: `<clientt-form form-id="xxx" lazy></clientt-form>`

---

## Backend Requirements

### 1. Environment Configuration

- Add `EMBED_BASE_URL` environment variable (dotenvy)
- Default: `https://app.clientt.com`
- Used for CORS headers and embed script URLs

### 2. Public API Endpoints (No Auth Required)

#### GET `/api/public/forms/:id`

- Returns form metadata including fields, branding, settings
- Increments `view_count` on the form
- Security: UUID v7 (obscurity-based)
- CORS: Open by default, check `allowed_domains` in form settings if set
- Response includes: form name, description, branding, settings, fields (sorted by order_position), multi-step configuration

#### POST `/api/public/forms/:id/submissions`

- Accepts form submission data as JSON
- Validates against field definitions and validation_rules
- Creates Submission record
- Increments `submission_count` on the form
- Returns: success status, any validation errors (per-field + summary), submission ID
- Response format for errors: `{errors: {field_name: ["error message"], _summary: ["Overall error"]}}`

### 3. Form Model Updates (`forms_form.ex`)

Extend the `settings` map to include:

```elixir
# Existing
%{
  redirect_url: "...",
  success_message: "Thank you for your submission!",
  collect_utm_params: true,
  allow_multiple_submissions: false
}

# Add these new fields
%{
  # ... existing ...
  show_success_message: true,           # boolean - show success message after submit
  callback_function: "onFormSubmit",    # string - JS callback function name (optional)
  allowed_domains: [],                  # list of strings - empty = allow all
  multi_step_enabled: false,            # boolean - enable multi-step wizard
  steps: []                             # list of step configs: [%{name: "Contact Info", field_ids: [...]}]
}
```

### 4. FormField Model Updates (`forms_field.ex`)

Add step assignment for multi-step forms:

```elixir
attribute :step, :integer do
  allow_nil? true
  public? true
  default nil
  # nil = single page, 1+ = step number for multi-step forms
end
```

### 5. Form Builder UI Updates

Update the form builder LiveView to support:

- **Embed Settings Section**:
  - Toggle `show_success_message`
  - Input for `callback_function` name
  - Multi-select or textarea for `allowed_domains`
- **Multi-step Configuration**:
  - Toggle to enable multi-step mode
  - Step management (add/remove/rename steps)
  - Drag fields between steps or assign step number to fields
- **Embed Code Preview**:
  - Show the embed code snippet for the form
  - Copy-to-clipboard button

---

## Frontend Embed Widget (`clientt-forms.js`)

### 1. Custom Element Definition

```javascript
class ClienttForm extends HTMLElement {
  // Web Component that:
  // - Reads form-id attribute
  // - Optionally lazy-loads via IntersectionObserver if [lazy] attribute present
  // - Fetches form metadata from API
  // - Renders form HTML
  // - Handles validation and submission
}
customElements.define('clientt-form', ClienttForm);
```

### 2. Styling with CSS Variables

The widget should NOT use Shadow DOM (to allow style inheritance). Provide CSS variables for customization:

```css
clientt-form {
  /* Layout */
  --clientt-font-family: inherit;
  --clientt-font-size: 16px;
  --clientt-spacing: 1rem;

  /* Colors */
  --clientt-primary-color: #3B82F6;
  --clientt-error-color: #EF4444;
  --clientt-success-color: #10B981;
  --clientt-text-color: inherit;
  --clientt-background-color: transparent;
  --clientt-border-color: #D1D5DB;

  /* Inputs */
  --clientt-input-padding: 0.5rem 0.75rem;
  --clientt-input-border-radius: 0.375rem;
  --clientt-input-border: 1px solid var(--clientt-border-color);

  /* Buttons */
  --clientt-button-padding: 0.625rem 1.25rem;
  --clientt-button-border-radius: 0.375rem;
}
```

### 3. Field Type Rendering

Render each field type appropriately:

| Field Type | HTML Element |
|------------|--------------|
| `text` | `<input type="text">` |
| `email` | `<input type="email">` |
| `textarea` | `<textarea>` |
| `select` | `<select>` with `<option>` elements from `options` array |
| `checkbox` | `<input type="checkbox">` |
| `radio` | Multiple `<input type="radio">` from `options` array |
| `number` | `<input type="number">` with min/max from validation_rules |
| `date` | `<input type="date">` |
| `phone` | `<input type="tel">` |
| `url` | `<input type="url">` |
| File fields | **Ignore/skip** (not in MVP) |

Each field should include:
- Label (from `label`)
- Input element
- Placeholder (from `placeholder`)
- Help text (from `help_text`)
- Required indicator (from `required`)
- Error message container (for validation errors)

### 4. Client-Side Validation

Before submission, validate based on `validation_rules`:

- `required` - Field must have value
- `min_length` / `max_length` - String length constraints
- `min_value` / `max_value` - Number range constraints
- Built-in HTML5 validation for email, url, phone formats

Show inline errors next to fields AND summary at top.

### 5. Multi-Step Support

If `multi_step_enabled` is true:

- Render step indicator/progress bar
- Show only fields for current step
- Previous/Next buttons for navigation
- Final step shows Submit button
- Validate current step before allowing Next

Default behavior: Single page with all fields.

### 6. Form Submission

On submit:

1. Run client-side validation
2. If valid, POST to `/api/public/forms/:id/submissions`
3. Show loading state on button
4. On success:
   - If `show_success_message`: Display `success_message`
   - If `callback_function`: Call `window[callback_function](response)`
   - If `redirect_url`: `window.location.href = redirect_url`
5. On validation error:
   - Display inline errors per field
   - Display summary banner at top
6. On network/server error:
   - Display generic error message

### 7. Loading States

- **Initial load**: Show spinner/skeleton while fetching metadata
- **Lazy load**: Use IntersectionObserver, show placeholder until visible
- **Submission**: Disable button, show spinner

---

## File Structure

```
clientt_crm_app/
├── lib/
│   ├── clientt_crm_app/
│   │   └── forms/
│   │       ├── forms_form.ex        # Update settings schema
│   │       └── forms_field.ex       # Add step attribute
│   └── clientt_crm_app_web/
│       ├── controllers/
│       │   └── public_form_controller.ex   # New: Public API endpoints
│       └── router.ex                # Add public API routes
├── priv/
│   └── static/
│       └── embed/
│           └── clientt-forms.js     # Embed widget script
```

---

## Router Configuration

```elixir
# Public API (no auth)
scope "/api/public", ClienttCrmAppWeb do
  pipe_through [:api, :public_cors]

  get "/forms/:id", PublicFormController, :show
  post "/forms/:id/submissions", PublicFormController, :submit
end

# Serve embed script
scope "/embed", ClienttCrmAppWeb do
  pipe_through [:static]

  get "/clientt-forms.js", EmbedController, :script
end
```

---

## CORS Configuration

Add CORS plug/middleware that:

- Checks `Origin` header against form's `allowed_domains`
- If `allowed_domains` is empty, allow all origins
- Sets appropriate headers:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers`

---

## Testing Considerations

- Create Playwright tests for embed widget functionality
- Test on a mock external page (HTML file that includes the embed)
- Test CORS behavior
- Test all field types render correctly
- Test validation (client and server)
- Test multi-step navigation
- Test success behaviors (message, callback, redirect)
- Test lazy loading

---

## Summary of Changes Required

### Model Updates
1. **Form** (`forms_form.ex`): Extend `settings` map with embed configuration
2. **FormField** (`forms_field.ex`): Add `step` attribute for multi-step forms

### New Files
1. `public_form_controller.ex` - Public API endpoints
2. `clientt-forms.js` - Embed widget script

### Updates
1. `router.ex` - Add public API routes
2. Form builder LiveView - Add embed settings UI, multi-step configuration, embed code preview
3. Config - Add `EMBED_BASE_URL` environment variable

### Field Types Supported (10)
- **Basic**: text, email, textarea, select, checkbox, radio
- **Advanced**: number, date, phone, url
- **Excluded**: file (MVP)
