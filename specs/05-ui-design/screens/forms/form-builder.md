# Screen: Form Builder

**Priority**: CRITICAL
**Complexity**: HIGH
**Status**: ✅ Documented
**Last Updated**: 2025-11-17

---

## Overview

### Purpose
The Form Builder is a drag-and-drop interface that enables admins and managers to create and edit custom forms. It is the most complex screen in the Forms domain, featuring a field palette, canvas grid, and property editor.

### User Goals
- Create new forms with custom fields
- Edit existing draft forms
- Configure field properties (validation, required, etc.)
- Arrange fields in a visual layout
- Preview forms before publishing

### Access Requirements
- **Roles Required**: Form Admin
- **Permissions**: `can_create_forms?` or `can_edit_forms?`
- **Routes**:
  - `/forms/new` - Create new form
  - `/forms/:id/edit` - Edit existing form (status must be 'draft')

### Figma Reference
- **Source File**: `figma_src/205 Forms Dashboard/src/components/pages/FormBuilderPage.tsx`
- **Lines of Code**: 1,434 lines
- **Components Used**: FormGridCanvas, FormFieldsSidebar, DraggableField, FormDropZone

### Related BDD Scenarios
- `specs/01-domains/forms/features/form_management.feature.md`:
  - Scenario: Create a new form
  - Scenario: Update draft form
  - Scenario: Publish a form

---

## Layout Structure

### Three-Column Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (persistent)                                  [Save] [x] │
├──────────┬─────────────────────────────────┬───────────────────┤
│          │                                 │                   │
│ FIELD    │  CANVAS GRID                    │  PROPERTIES       │
│ PALETTE  │  (Drop Zone)                    │  PANEL            │
│ (Left)   │  (Center)                       │  (Right)          │
│          │                                 │                   │
│ 📝 Text  │  ┌─────────────────┐            │  Field Settings   │
│ 📧 Email │  │ [Email Field]   │            │  ─────────────    │
│ 📱 Phone │  ├─────────────────┤            │  Label: *         │
│ 📅 Date  │  │ [Text Field]    │            │  Placeholder:     │
│ ☑️  Check│  ├─────────────────┤            │  Required: ☑      │
│ ...      │  │ [Drop here]     │            │  Validation:      │
│          │  └─────────────────┘            │  ...              │
│          │                                 │                   │
│ [Preview]│                                 │  [Delete Field]   │
└──────────┴─────────────────────────────────┴───────────────────┘
```

### Responsive Adaptations

**Desktop (>1024px):**
- Full three-column layout
- Palette: 240px width
- Canvas: Flexible (grows with content)
- Properties: 320px width
- All controls visible

**Tablet (640-1024px):**
- Palette: Collapsible drawer (toggle button)
- Canvas: Full width when palette collapsed
- Properties: Stays visible (280px)
- Drag-drop still functional

**Mobile (<640px):**
- Single column, tabs-based navigation:
  - Tab 1: Field Palette
  - Tab 2: Canvas (no drag-drop, use "Add Field" buttons)
  - Tab 3: Properties
- Simplified field addition (click to add, not drag)

---

## Component Breakdown

### 1. Header Bar

| Element | Component | Props/Assigns | Event Handler |
|---------|-----------|---------------|---------------|
| Form Name | `<.input type="text">` | `value={@form.name}` | `phx-change="update_name"` |
| Save Button | `<.button variant="primary">` | `disabled={!@form_valid}` | `phx-click="save_draft"` |
| Publish Button | `<.button variant="success">` | `disabled={!@can_publish}` | `phx-click="publish_form"` |
| Close | `<.link navigate={~p"/forms"}>` | - | - |

**State:**
```elixir
@form_valid - boolean - All fields have valid configuration
@can_publish - boolean - Form has at least 1 field
@form - Form changeset
```

---

### 2. Field Palette Sidebar (Left)

**Component**: Custom `<.field_palette>`

#### Field Types (10 MVP types)

| Icon | Field Type | Description | Draggable |
|------|------------|-------------|-----------|
| 📝 | Text | Single-line text input | Yes |
| 📧 | Email | Email address with validation | Yes |
| 📱 | Phone | Phone number input | Yes |
| 📄 | Textarea | Multi-line text | Yes |
| 🔢 | Number | Numeric input with min/max | Yes |
| 📅 | Date | Date picker | Yes |
| ☑️ | Checkbox | Single checkbox | Yes |
| 🔘 | Radio | Radio button group | Yes |
| 📋 | Select | Dropdown menu | Yes |
| 🔗 | URL | URL input with validation | Yes |

**LiveView Implementation:**
```heex
<aside class="field-palette w-60 bg-base-200 p-4 overflow-y-auto">
  <h3 class="font-semibold mb-4">Fields</h3>

  <%= for field_type <- @available_field_types do %>
    <div
      id={"palette-field-#{field_type}"}
      class="draggable-field-tile"
      phx-hook="DraggableField"
      data-field-type={field_type}
    >
      <.icon name={field_icon(field_type)} />
      <span><%= field_label(field_type) %></span>
    </div>
  <% end %>

  <div class="divider"></div>

  <.button
    variant="outline"
    class="w-full"
    phx-click="preview_form"
  >
    👁️ Preview Form
  </.button>
</aside>
```

**JS Hook (required for drag):**
```javascript
// assets/js/hooks/draggable_field.js
export const DraggableField = {
  mounted() {
    this.el.draggable = true;
    this.el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('field-type', this.el.dataset.fieldType);
      e.dataTransfer.effectAllowed = 'copy';
    });
  }
}
```

---

### 3. Canvas Grid (Center)

**Component**: Custom `<.form_canvas>`

#### Drop Zone Behavior

**States:**
- **Empty**: "Drag fields here to start building"
- **Hover**: Highlight drop target
- **Populated**: Show fields in order with drag handles

**LiveView Implementation:**
```heex
<main class="form-canvas flex-1 p-6 bg-white">
  <div
    id="form-canvas-grid"
    phx-hook="FormDropZone"
    phx-update="ignore"
    class="grid grid-cols-1 gap-4 min-h-screen"
  >
    <%= if Enum.empty?(@form_fields) do %>
      <div class="empty-state text-center py-20 text-muted-foreground">
        <.icon name="hero-document-plus" class="w-16 h-16 mx-auto mb-4" />
        <p class="text-lg">Drag fields from the palette to start building</p>
        <p class="text-sm">or click fields to add them</p>
      </div>
    <% else %>
      <div id="form-fields" phx-update="stream">
        <%= for {dom_id, field} <- @streams.form_fields do %>
          <div
            id={dom_id}
            class="form-field-item"
            data-field-id={field.id}
            data-position={field.position}
          >
            <.form_field_in_grid
              field={field}
              selected={@selected_field_id == field.id}
            />
          </div>
        <% end %>
      </div>
    <% end %>
  </div>
</main>
```

**JS Hook (drop zone):**
```javascript
// assets/js/hooks/form_drop_zone.js
import Sortable from 'sortablejs';

export const FormDropZone = {
  mounted() {
    const grid = this.el;

    // Initialize SortableJS for drag-drop reordering
    this.sortable = Sortable.create(grid.querySelector('#form-fields'), {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: (evt) => {
        // Send reorder event to LiveView
        this.pushEvent('reorder_fields', {
          old_index: evt.oldIndex,
          new_index: evt.newIndex
        });
      }
    });

    // Handle drop from palette
    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      const fieldType = e.dataTransfer.getData('field-type');

      if (fieldType) {
        this.pushEvent('add_field', {
          field_type: fieldType,
          position: this.getDropPosition(e)
        });
      }
    });

    grid.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
      e.dataTransfer.dropEffect = 'copy';
    });
  },

  getDropPosition(event) {
    // Calculate position based on drop coordinates
    const fields = Array.from(this.el.querySelectorAll('.form-field-item'));
    // Logic to determine insertion point
    return fields.length; // Simplified - add to end
  },

  destroyed() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
}
```

---

### 4. Field in Canvas (Component)

**Component**: `<.form_field_in_grid>`

```heex
<div
  class={[
    "form-field-card p-4 border-2 rounded-lg",
    @selected && "border-primary",
    !@selected && "border-base-300"
  ]}
  phx-click="select_field"
  phx-value-field-id={@field.id}
>
  <!-- Drag Handle -->
  <div class="drag-handle cursor-move mb-2 flex items-center text-muted-foreground">
    <.icon name="hero-bars-3" class="w-5 h-5" />
    <span class="ml-2 text-sm"><%= @field.field_type |> to_string() |> String.capitalize() %></span>

    <!-- Required badge -->
    <%= if @field.required do %>
      <span class="badge badge-error badge-xs ml-2">Required</span>
    <% end %>
  </div>

  <!-- Field Preview -->
  <div class="field-preview">
    <label class="label">
      <span class="label-text font-medium">
        <%= @field.label %>
        <%= if @field.required, do: "*" %>
      </span>
    </label>

    <%= case @field.field_type do %>
      <% :text -> %>
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder={@field.placeholder}
          disabled
        />

      <% :email -> %>
        <input
          type="email"
          class="input input-bordered w-full"
          placeholder={@field.placeholder || "email@example.com"}
          disabled
        />

      <% :textarea -> %>
        <textarea
          class="textarea textarea-bordered w-full"
          placeholder={@field.placeholder}
          disabled
        ></textarea>

      <% :select -> %>
        <select class="select select-bordered w-full" disabled>
          <option><%= @field.placeholder || "Select an option..." %></option>
          <%= for option <- @field.options || [] do %>
            <option><%= option %></option>
          <% end %>
        </select>

      <% :checkbox -> %>
        <div class="form-control">
          <label class="label cursor-pointer justify-start">
            <input type="checkbox" class="checkbox" disabled />
            <span class="label-text ml-3"><%= @field.placeholder %></span>
          </label>
        </div>

      <% _ -> %>
        <input
          type={to_string(@field.field_type)}
          class="input input-bordered w-full"
          disabled
        />
    <% end %>
  </div>

  <!-- Field Actions -->
  <div class="field-actions mt-3 flex gap-2">
    <.button
      variant="ghost"
      size="sm"
      phx-click="duplicate_field"
      phx-value-field-id={@field.id}
    >
      <.icon name="hero-document-duplicate" class="w-4 h-4" />
    </.button>

    <.button
      variant="ghost"
      size="sm"
      class="text-error"
      phx-click="delete_field"
      phx-value-field-id={@field.id}
      data-confirm="Delete this field?"
    >
      <.icon name="hero-trash" class="w-4 h-4" />
    </.button>
  </div>
</div>
```

---

### 5. Properties Panel (Right)

**Component**: Custom `<.field_properties_panel>`

```heex
<aside class="properties-panel w-80 bg-base-100 border-l p-4 overflow-y-auto">
  <%= if @selected_field do %>
    <h3 class="font-semibold mb-4">Field Settings</h3>

    <.form
      for={@field_form}
      phx-change="update_field_property"
      phx-submit="save_field"
      class="space-y-4"
    >
      <!-- Label -->
      <.input
        field={@field_form[:label]}
        label="Label"
        required
      />

      <!-- Placeholder -->
      <.input
        field={@field_form[:placeholder]}
        label="Placeholder"
      />

      <!-- Required Toggle -->
      <div class="form-control">
        <label class="label cursor-pointer justify-start">
          <input
            type="checkbox"
            name={@field_form[:required].name}
            checked={@field_form[:required].value}
            class="toggle toggle-primary"
          />
          <span class="label-text ml-3">Required field</span>
        </label>
      </div>

      <!-- Field-specific options -->
      <%= case @selected_field.field_type do %>
        <% :text -> %>
          <.input
            field={@field_form[:min_length]}
            type="number"
            label="Min Length"
          />
          <.input
            field={@field_form[:max_length]}
            type="number"
            label="Max Length"
          />

        <% :number -> %>
          <.input
            field={@field_form[:min_value]}
            type="number"
            label="Minimum Value"
          />
          <.input
            field={@field_form[:max_value]}
            type="number"
            label="Maximum Value"
          />

        <% type when type in [:select, :radio] -> %>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Options (one per line)</span>
            </label>
            <textarea
              name={@field_form[:options].name}
              class="textarea textarea-bordered"
              rows="5"
            ><%= Enum.join(@field_form[:options].value || [], "\n") %></textarea>
          </div>

        <% _ -> %>
          <!-- No additional options -->
      <% end %>

      <!-- Position -->
      <.input
        field={@field_form[:position]}
        type="number"
        label="Position"
        readonly
      />

      <!-- Actions -->
      <div class="divider"></div>

      <.button
        variant="error"
        class="w-full"
        phx-click="delete_field"
        phx-value-field-id={@selected_field.id}
        data-confirm="Delete this field?"
      >
        <.icon name="hero-trash" class="w-4 h-4 mr-2" />
        Delete Field
      </.button>
    </.form>
  <% else %>
    <div class="empty-state text-center py-20 text-muted-foreground">
      <.icon name="hero-cursor-arrow-rays" class="w-12 h-12 mx-auto mb-4" />
      <p>Select a field to edit its properties</p>
    </div>
  <% end %>
</aside>
```

---

## LiveView State Management

### Socket Assigns

```elixir
# Mount assigns
assign(socket,
  form: form,  # Form changeset
  form_fields: [],  # List of FormField structs
  selected_field_id: nil,  # Currently selected field ID
  field_form: nil,  # Changeset for selected field
  available_field_types: [
    :text, :email, :phone, :textarea, :number,
    :date, :checkbox, :radio, :select, :url
  ],
  form_valid: false,
  can_publish: false
)

# Stream form_fields for efficient updates
stream(socket, :form_fields, form_fields)
```

### Event Handlers

```elixir
# Add field from palette
def handle_event("add_field", %{"field_type" => type, "position" => pos}, socket) do
  field_attrs = %{
    form_id: socket.assigns.form.id,
    field_type: type,
    label: default_label(type),
    position: pos,
    required: false
  }

  case Forms.create_form_field(field_attrs) do
    {:ok, field} ->
      {:noreply,
       socket
       |> stream_insert(:form_fields, field, at: pos)
       |> put_flash(:info, "Field added")
       |> assign(can_publish: true)}

    {:error, changeset} ->
      {:noreply, put_flash(socket, :error, "Failed to add field")}
  end
end

# Select field for editing
def handle_event("select_field", %{"field-id" => id}, socket) do
  field = Enum.find(socket.assigns.form_fields, &(&1.id == id))
  field_form = AshPhoenix.Form.for_update(field, :update)

  {:noreply, assign(socket, selected_field_id: id, field_form: field_form)}
end

# Update field property
def handle_event("update_field_property", %{"form_field" => params}, socket) do
  field = find_selected_field(socket)

  case Forms.update_form_field(field, params) do
    {:ok, updated_field} ->
      {:noreply,
       socket
       |> stream_insert(:form_fields, updated_field)
       |> assign(field_form: AshPhoenix.Form.for_update(updated_field, :update))}

    {:error, changeset} ->
      {:noreply, assign(socket, field_form: changeset)}
  end
end

# Reorder fields (drag-drop)
def handle_event("reorder_fields", %{"old_index" => old, "new_index" => new}, socket) do
  fields = socket.assigns.form_fields
  reordered = List.move(fields, old, new)

  # Update positions in database
  Enum.with_index(reordered, fn field, index ->
    Forms.update_form_field(field, %{position: index})
  end)

  {:noreply, assign(socket, form_fields: reordered)}
end

# Delete field
def handle_event("delete_field", %{"field-id" => id}, socket) do
  field = Enum.find(socket.assigns.form_fields, &(&1.id == id))

  case Forms.destroy_form_field(field) do
    :ok ->
      remaining_fields = Enum.reject(socket.assigns.form_fields, &(&1.id == id))

      {:noreply,
       socket
       |> stream_delete(:form_fields, field)
       |> assign(
         selected_field_id: nil,
         field_form: nil,
         can_publish: length(remaining_fields) > 0
       )
       |> put_flash(:info, "Field deleted")}

    {:error, _} ->
      {:noreply, put_flash(socket, :error, "Failed to delete field")}
  end
end

# Save draft
def handle_event("save_draft", _params, socket) do
  # Form auto-saves on field changes, just show confirmation
  {:noreply, put_flash(socket, :info, "Draft saved")}
end

# Publish form
def handle_event("publish_form", _params, socket) do
  form = socket.assigns.form

  case Forms.publish_form(form) do
    {:ok, published_form} ->
      {:noreply,
       socket
       |> put_flash(:info, "Form published successfully!")
       |> push_navigate(to: ~p"/forms/#{published_form.id}")}

    {:error, changeset} ->
      {:noreply, put_flash(socket, :error, "Cannot publish: #{format_errors(changeset)}")}
  end
end

# Preview form
def handle_event("preview_form", _params, socket) do
  form = socket.assigns.form

  {:noreply, push_event(socket, "open_preview", %{form_id: form.id})}
end
```

---

## States & Validation

### Loading States

```heex
<%= if @loading do %>
  <div class="loading-overlay">
    <span class="loading loading-spinner loading-lg"></span>
    <p>Loading form builder...</p>
  </div>
<% end %>
```

### Empty States

**No fields added:**
```heex
<div class="empty-state">
  <.icon name="hero-document-plus" class="w-16 h-16" />
  <p>Drag fields from the palette to start building</p>
</div>
```

**No field selected:**
```heex
<div class="empty-state">
  <.icon name="hero-cursor-arrow-rays" class="w-12 h-12" />
  <p>Select a field to edit its properties</p>
</div>
```

### Error States

**Invalid field configuration:**
```heex
<div class="alert alert-error">
  <.icon name="hero-exclamation-triangle" />
  <span>Field label is required</span>
</div>
```

**Cannot publish (no fields):**
```heex
<.button variant="success" disabled={!@can_publish}>
  Publish
  <%= if !@can_publish do %>
    <span class="tooltip tooltip-left" data-tip="Add at least 1 field to publish">
      <.icon name="hero-information-circle" />
    </span>
  <% end %>
</.button>
```

### Success Feedback

**Field added:**
```elixir
put_flash(socket, :info, "Field added successfully")
```

**Form published:**
```elixir
put_flash(socket, :info, "Form published! Share link: #{form.public_url}")
```

---

## Responsive Behavior

### Desktop (>1024px)
- Full three-column layout
- All drag-drop functionality enabled
- Properties panel always visible
- Palette always visible

### Tablet (640-1024px)
- Palette: Toggle button to show/hide
- Canvas: Expands when palette hidden
- Properties: 280px fixed width
- Drag-drop functional

### Mobile (<640px)
- **Alternative UI** (no drag-drop):
  - Tab 1: Field List (click to add)
  - Tab 2: Canvas (fields stack vertically)
  - Tab 3: Properties
- Simplified field addition: Tap field type → Field added to end
- Reordering: Up/Down buttons instead of drag-drop

**Mobile Implementation:**
```heex
<!-- Mobile tabs -->
<div class="tabs tabs-boxed lg:hidden">
  <a class={["tab", @mobile_tab == "palette" && "tab-active"]} phx-click="switch_tab" phx-value-tab="palette">
    Fields
  </a>
  <a class={["tab", @mobile_tab == "canvas" && "tab-active"]} phx-click="switch_tab" phx-value-tab="canvas">
    Canvas
  </a>
  <a class={["tab", @mobile_tab == "properties" && "tab-active"]} phx-click="switch_tab" phx-value-tab="properties">
    Properties
  </a>
</div>

<!-- Show selected tab content -->
<div class="lg:hidden">
  <%= case @mobile_tab do %>
    <% "palette" -> %>
      <.field_palette_mobile />
    <% "canvas" -> %>
      <.form_canvas_mobile />
    <% "properties" -> %>
      <.field_properties_panel />
  <% end %>
</div>
```

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Arrow keys to navigate fields in canvas
- Enter to select field
- Delete key to delete selected field
- Escape to deselect

### Screen Reader Support
```heex
<div role="main" aria-label="Form Builder">
  <aside aria-label="Field Palette" role="toolbar">
    <!-- Field palette -->
  </aside>

  <div aria-label="Form Canvas" role="region">
    <!-- Canvas -->
  </div>

  <aside aria-label="Field Properties" role="complementary">
    <!-- Properties -->
  </aside>
</div>
```

### ARIA Attributes
- `aria-label` on all buttons
- `aria-selected` on selected field
- `aria-required` on required fields in preview
- `aria-live="polite"` on success/error messages

---

## Performance Considerations

### Optimization Strategies
1. **Use LiveView Streams**: For efficient field list updates
2. **Debounce Property Updates**: Avoid excessive server roundtrips
3. **Lazy Load Preview**: Only render preview when requested
4. **Minimize Re-renders**: Use `phx-update="ignore"` on static elements

### Performance Targets
- Initial page load: <500ms
- Field addition: <100ms
- Property update: <200ms
- Drag-drop reorder: <150ms (perceived, immediate UI feedback)

---

## Implementation Files

### LiveView
`lib/clientt_crm_app_web/live/form_live/builder.ex`

### Templates
- `lib/clientt_crm_app_web/live/form_live/builder.html.heex` (main template)
- Components in `lib/clientt_crm_app_web/components/forms/`

### JS Hooks
- `assets/js/hooks/draggable_field.js`
- `assets/js/hooks/form_drop_zone.js`
- Import SortableJS: `npm install sortablejs`

### CSS
```css
/* assets/css/forms.css */
.form-field-card {
  transition: all 0.2s ease;
}

.form-field-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.sortable-ghost {
  opacity: 0.4;
  background: #f3f4f6;
}

.drag-handle {
  cursor: move;
}
```

---

## Testing Strategy

### Unit Tests
- Field creation logic
- Validation rules
- Position management
- Duplicate detection

### Integration Tests
- Add field flow
- Edit field properties
- Delete field
- Reorder fields
- Publish validation

### E2E Tests (Playwright)
```javascript
// test/e2e/form_builder.spec.js
test('can create form with drag-drop', async ({ page }) => {
  await page.goto('/forms/new');

  // Drag email field to canvas
  await page.dragAndDrop(
    '[data-field-type="email"]',
    '#form-canvas-grid'
  );

  // Verify field added
  await expect(page.locator('.form-field-card')).toHaveCount(1);

  // Edit field label
  await page.click('.form-field-card');
  await page.fill('[name="form_field[label]"]', 'Your Email');

  // Publish
  await page.click('button:has-text("Publish")');
  await expect(page).toHaveURL(/\/forms\/\w+/);
});
```

---

## Related Specifications

### Patterns
- [Drag-Drop Form Builder](../../patterns/forms-builder.md) - Detailed drag-drop pattern
- [Modal vs Detail View](../../patterns/modal-vs-detail.md) - Why this is a full page, not modal

### Components
- [Form Grid Canvas](../../components/forms-specific/form-grid-canvas.md)
- [Field Palette](../../components/forms-specific/form-fields-sidebar.md)
- [Draggable Field](../../components/forms-specific/draggable-field.md)
- [Properties Panel](../../components/forms-specific/field-properties-panel.md)

### Domain
- [Form Resource](../../../01-domains/forms/resources/form.md)
- [FormField Resource](../../../01-domains/forms/resources/form_field.md)
- [Form Management Feature](../../../01-domains/forms/features/form_management.feature.md)

---

**Priority**: CRITICAL - Must implement first
**Complexity**: HIGH - Most complex screen in Forms domain
**Status**: ✅ Specification complete, ready for implementation
