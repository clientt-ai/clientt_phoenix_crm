# Pattern: Drag-and-Drop Form Builder

**Pattern Type**: Interactive Layout
**Complexity**: HIGH
**Status**: ✅ Documented
**Last Updated**: 2025-11-17

---

## Overview

### Pattern Description
A drag-and-drop interface pattern that enables users to construct forms by dragging field types from a palette onto a canvas grid, with live property editing and visual feedback.

### When to Use
- Form builders and visual editors
- Dashboard customization interfaces
- Report builders
- Email template builders
- Any interface requiring visual composition

### When NOT to Use
- Simple forms with fixed fields (use standard forms)
- Mobile-first applications (drag-drop is difficult on touch)
- Accessibility-critical interfaces (provide alternative methods)

### Figma Reference
- **Source**: `figma_src/205 Forms Dashboard/src/components/pages/FormBuilderPage.tsx`
- **Example Implementation**: Forms Dashboard form builder

---

## Pattern Structure

### Three-Zone Layout

```
┌──────────────────────────────────────────────────────────────┐
│  SOURCE PALETTE  │  DROP CANVAS  │  PROPERTIES EDITOR        │
│  (Draggable)     │  (Drop Zone)  │  (Context Panel)          │
└──────────────────────────────────────────────────────────────┘
```

### Components

1. **Source Palette** - Contains draggable items
2. **Drop Canvas** - Accepts dropped items, allows reordering
3. **Properties Editor** - Edits selected item properties
4. **Visual Feedback** - Ghost elements, drop indicators, selection highlights

---

## Technology Stack for Phoenix LiveView

### Required Technologies

| Technology | Purpose | Installation |
|------------|---------|--------------|
| Phoenix LiveView | Server-side state management | Built-in |
| JavaScript Hooks | Client-side drag-drop events | Built-in |
| SortableJS | Drag-drop library | `npm install sortablejs` |
| Alpine.js (optional) | Client-side interactions | `npm install alpinejs` |

### Alternative: Native HTML5 Drag-Drop

Can be implemented without external libraries using HTML5 Drag-Drop API, but SortableJS provides better UX and cross-browser support.

---

## Implementation Pattern

### 1. LiveView Module Structure

```elixir
defmodule ClienttCrmAppWeb.FormLive.Builder do
  use ClienttCrmAppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:draggable_items, get_field_types())
     |> assign(:selected_item_id, nil)
     |> stream(:canvas_items, [])}
  end

  @impl true
  def handle_event("add_item", %{"item_type" => type, "position" => pos}, socket) do
    # Create new item on canvas
    item = create_canvas_item(type, pos)

    {:noreply,
     socket
     |> stream_insert(:canvas_items, item, at: pos)
     |> assign(:selected_item_id, item.id)}
  end

  @impl true
  def handle_event("reorder_items", %{"old_index" => old_idx, "new_index" => new_idx}, socket) do
    # Update item positions
    items = reorder_items(socket.assigns.canvas_items, old_idx, new_idx)

    {:noreply, assign(socket, canvas_items: items)}
  end

  @impl true
  def handle_event("select_item", %{"item_id" => id}, socket) do
    {:noreply, assign(socket, selected_item_id: id)}
  end

  @impl true
  def handle_event("update_item_property", params, socket) do
    # Update selected item properties
    item = find_item(socket, socket.assigns.selected_item_id)
    {:ok, updated_item} = update_item(item, params)

    {:noreply, stream_insert(socket, :canvas_items, updated_item)}
  end

  @impl true
  def handle_event("remove_item", %{"item_id" => id}, socket) do
    item = find_item(socket, id)

    {:noreply,
     socket
     |> stream_delete(:canvas_items, item)
     |> assign(:selected_item_id, nil)}
  end
end
```

---

### 2. Template Structure

```heex
<div class="builder-layout flex h-screen">
  <!-- Source Palette -->
  <aside class="palette w-60 bg-base-200 p-4">
    <h3 class="font-semibold mb-4">Draggable Items</h3>

    <%= for item <- @draggable_items do %>
      <div
        id={"palette-item-#{item.type}"}
        class="palette-item"
        phx-hook="DraggableItem"
        data-item-type={item.type}
      >
        <.icon name={item.icon} />
        <span><%= item.label %></span>
      </div>
    <% end %>
  </aside>

  <!-- Drop Canvas -->
  <main class="canvas flex-1 p-6 bg-white">
    <div
      id="drop-canvas"
      phx-hook="DropCanvas"
      class="min-h-full"
    >
      <%= if Enum.empty?(@streams.canvas_items) do %>
        <.empty_state message="Drag items here to start building" />
      <% else %>
        <div id="canvas-items" phx-update="stream">
          <%= for {dom_id, item} <- @streams.canvas_items do %>
            <div
              id={dom_id}
              class={[
                "canvas-item",
                @selected_item_id == item.id && "selected"
              ]}
              phx-click="select_item"
              phx-value-item-id={item.id}
            >
              <.canvas_item_component item={item} />
            </div>
          <% end %>
        </div>
      <% end %>
    </div>
  </main>

  <!-- Properties Editor -->
  <aside class="properties w-80 bg-base-100 border-l p-4">
    <%= if @selected_item_id do %>
      <.item_properties_form
        item={find_item(@canvas_items, @selected_item_id)}
      />
    <% else %>
      <.empty_state message="Select an item to edit properties" />
    <% end %>
  </aside>
</div>
```

---

### 3. JavaScript Hooks

#### DraggableItem Hook (Source Palette)

```javascript
// assets/js/hooks/draggable_item.js
export const DraggableItem = {
  mounted() {
    this.el.draggable = true;

    this.el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('item-type', this.el.dataset.itemType);
      e.dataTransfer.effectAllowed = 'copy';
      this.el.classList.add('dragging');
    });

    this.el.addEventListener('dragend', (e) => {
      this.el.classList.remove('dragging');
    });
  }
}
```

#### DropCanvas Hook (Canvas with SortableJS)

```javascript
// assets/js/hooks/drop_canvas.js
import Sortable from 'sortablejs';

export const DropCanvas = {
  mounted() {
    const canvasEl = this.el;
    const itemsContainer = canvasEl.querySelector('#canvas-items');

    // Initialize SortableJS for reordering existing items
    if (itemsContainer) {
      this.sortable = Sortable.create(itemsContainer, {
        animation: 150,
        handle: '.drag-handle',  // Specific handle for dragging
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',

        onEnd: (evt) => {
          // Notify LiveView of reorder
          this.pushEvent('reorder_items', {
            old_index: evt.oldIndex,
            new_index: evt.newIndex
          });
        }
      });
    }

    // Handle drops from palette (new items)
    canvasEl.addEventListener('dragover', (e) => {
      e.preventDefault(); // Required to allow drop
      e.dataTransfer.dropEffect = 'copy';
      this.showDropIndicator(e);
    });

    canvasEl.addEventListener('dragleave', (e) => {
      this.hideDropIndicator();
    });

    canvasEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.hideDropIndicator();

      const itemType = e.dataTransfer.getData('item-type');

      if (itemType) {
        const position = this.calculateDropPosition(e);

        // Notify LiveView to add item
        this.pushEvent('add_item', {
          item_type: itemType,
          position: position
        });
      }
    });
  },

  calculateDropPosition(event) {
    const items = Array.from(this.el.querySelectorAll('.canvas-item'));
    const mouseY = event.clientY;

    // Find insertion point based on mouse Y position
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      if (mouseY < rect.top + rect.height / 2) {
        return i;
      }
    }

    return items.length; // Add to end
  },

  showDropIndicator(event) {
    const position = this.calculateDropPosition(event);
    const items = this.el.querySelectorAll('.canvas-item');

    // Remove existing indicator
    this.hideDropIndicator();

    // Add indicator at insertion point
    if (items[position]) {
      items[position].classList.add('drop-before');
    } else if (items.length > 0) {
      items[items.length - 1].classList.add('drop-after');
    }
  },

  hideDropIndicator() {
    this.el.querySelectorAll('.drop-before, .drop-after').forEach(el => {
      el.classList.remove('drop-before', 'drop-after');
    });
  },

  destroyed() {
    if (this.sortable) {
      this.sortable.destroy();
    }
  }
}
```

#### Hook Registration

```javascript
// assets/js/app.js
import { DraggableItem } from './hooks/draggable_item';
import { DropCanvas } from './hooks/drop_canvas';

let Hooks = {
  DraggableItem,
  DropCanvas
};

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  params: {_csrf_token: csrfToken}
});
```

---

### 4. CSS Styling

```css
/* assets/css/drag_drop.css */

/* Palette Item */
.palette-item {
  @apply p-3 mb-2 bg-white rounded-lg border-2 border-base-300;
  @apply flex items-center gap-3 cursor-grab;
  @apply transition-all duration-150;
}

.palette-item:hover {
  @apply border-primary bg-primary/5 shadow-md;
}

.palette-item.dragging {
  @apply opacity-50 cursor-grabbing;
}

/* Canvas */
.canvas {
  position: relative;
}

.canvas-item {
  @apply p-4 mb-4 bg-base-100 rounded-lg border-2 border-base-300;
  @apply transition-all duration-150 cursor-pointer;
}

.canvas-item:hover {
  @apply shadow-md border-primary/50;
}

.canvas-item.selected {
  @apply border-primary border-2 shadow-lg;
}

/* Drag Handle (for reordering) */
.drag-handle {
  @apply cursor-move text-base-content/50;
  @apply hover:text-base-content;
}

/* SortableJS Classes */
.sortable-ghost {
  @apply opacity-40 bg-base-200;
}

.sortable-chosen {
  @apply border-primary shadow-lg;
}

.sortable-drag {
  @apply opacity-90 rotate-2 shadow-2xl;
}

/* Drop Indicators */
.drop-before {
  @apply border-t-4 border-t-primary;
  position: relative;
}

.drop-before::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #2278c0 0%, #1a5f99 100%);
  border-radius: 2px;
}

.drop-after {
  @apply border-b-4 border-b-primary;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center;
  @apply py-20 text-base-content/50;
  @apply border-2 border-dashed border-base-300 rounded-lg;
}

.empty-state:hover {
  @apply border-primary/50 bg-primary/5;
}
```

---

## Visual Feedback States

### 1. Dragging from Palette

**Visual Changes:**
- Source item: 50% opacity, `cursor: grabbing`
- Canvas: Show drop indicator at insertion point
- Cursor: Show "copy" cursor (green plus)

### 2. Reordering in Canvas

**Visual Changes:**
- Dragged item: Slight rotation, elevated shadow
- Ghost placeholder: Semi-transparent, shows where item was
- Other items: Smoothly shift position (animation)
- Drop indicator: Line showing insertion point

### 3. Item Selected

**Visual Changes:**
- Selected item: Primary color border, elevated shadow
- Properties panel: Show item-specific form
- Other items: Normal state

### 4. Hover States

**Palette:**
- Border color changes to primary
- Slight shadow increase
- Slight scale increase (1.02)

**Canvas Item:**
- Shadow increase
- Border color lightens

---

## Accessibility Considerations

### Keyboard Alternative

Drag-drop is not accessible via keyboard. Provide alternative methods:

```heex
<!-- Keyboard-friendly "Add Field" buttons -->
<div class="keyboard-controls mt-4">
  <h4 class="sr-only">Add fields (keyboard accessible)</h4>

  <%= for item <- @draggable_items do %>
    <.button
      variant="ghost"
      size="sm"
      phx-click="add_item"
      phx-value-item-type={item.type}
      phx-value-position={length(@canvas_items)}
    >
      <.icon name={item.icon} />
      Add <%= item.label %>
    </.button>
  <% end %>
</div>

<!-- Reordering via buttons -->
<div class="reorder-controls" role="toolbar" aria-label="Reorder item">
  <.button
    variant="ghost"
    size="xs"
    phx-click="move_up"
    phx-value-item-id={@item.id}
    disabled={@item.position == 0}
    aria-label="Move item up"
  >
    <.icon name="hero-arrow-up" />
  </.button>

  <.button
    variant="ghost"
    size="xs"
    phx-click="move_down"
    phx-value-item-id={@item.id}
    disabled={@item.position == @max_position}
    aria-label="Move item down"
  >
    <.icon name="hero-arrow-down" />
  </.button>
</div>
```

### Screen Reader Support

```heex
<div role="application" aria-label="Form Builder">
  <!-- Palette -->
  <aside role="toolbar" aria-label="Field Palette">
    <div
      role="button"
      tabindex="0"
      aria-label="Drag email field to canvas, or click to add"
    >
      Email Field
    </div>
  </aside>

  <!-- Canvas -->
  <div role="main" aria-label="Form Canvas">
    <div
      role="listitem"
      aria-label="Email field, position 1 of 3"
      aria-selected={@selected}
    >
      <!-- Canvas item -->
    </div>
  </div>

  <!-- Properties -->
  <aside role="complementary" aria-label="Field Properties">
    <!-- Properties form -->
  </aside>
</div>
```

### ARIA Live Regions

```heex
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <%= if @last_action == :add do %>
    Field added at position <%= @last_position %>
  <% end %>

  <%= if @last_action == :reorder do %>
    Field moved from position <%= @old_position %> to <%= @new_position %>
  <% end %>
</div>
```

---

## Mobile Alternative (No Drag-Drop)

### Tap-to-Add Pattern

```heex
<!-- Mobile: Tap field type to add -->
<div class="lg:hidden">
  <h3>Tap to add fields</h3>

  <%= for item <- @draggable_items do %>
    <.button
      class="w-full mb-2"
      phx-click="add_item"
      phx-value-item-type={item.type}
      phx-value-position={length(@canvas_items)}
    >
      <.icon name={item.icon} />
      Add <%= item.label %>
    </.button>
  <% end %>
</div>

<!-- Mobile: Up/Down buttons for reordering -->
<div class="flex gap-2 lg:hidden">
  <.button size="sm" phx-click="move_up" phx-value-item-id={@item.id}>
    ↑
  </.button>
  <.button size="sm" phx-click="move_down" phx-value-item-id={@item.id}>
    ↓
  </.button>
</div>
```

---

## Performance Optimization

### 1. Use LiveView Streams

```elixir
# Efficient updates for large lists
stream(socket, :canvas_items, items)
```

### 2. Debounce Property Updates

```javascript
// Debounce property changes to reduce server load
let propertyUpdateTimer;

function updateProperty(name, value) {
  clearTimeout(propertyUpdateTimer);

  propertyUpdateTimer = setTimeout(() => {
    liveView.pushEvent('update_item_property', {[name]: value});
  }, 300);
}
```

### 3. Client-Side Optimistic Updates

```javascript
// Update UI immediately, sync with server in background
function reorderItems(oldIndex, newIndex) {
  // Move item in DOM immediately
  moveElement(oldIndex, newIndex);

  // Notify server (will sync if there's a conflict)
  liveView.pushEvent('reorder_items', {old_index: oldIndex, new_index: newIndex});
}
```

### 4. Use `phx-update="ignore"` for Static Elements

```heex
<div id="static-palette" phx-update="ignore">
  <!-- Palette never changes, no need to re-render -->
</div>
```

---

## Testing Strategy

### Unit Tests (Elixir)

```elixir
# test/clientt_crm_app_web/live/form_live/builder_test.exs
defmodule ClienttCrmAppWeb.FormLive.BuilderTest do
  use ClienttCrmAppWeb.ConnCase, async: true

  test "adds item to canvas", %{conn: conn} do
    {:ok, view, _html} = live(conn, ~p"/forms/new")

    # Simulate drag-drop event
    view
    |> element("#drop-canvas")
    |> render_hook("add_item", %{"item_type" => "text", "position" => 0})

    # Verify item added
    assert has_element?(view, ".canvas-item")
  end

  test "reorders items", %{conn: conn} do
    # Setup with 3 items
    {:ok, view, _html} = live(conn, ~p"/forms/:id/edit")

    # Reorder
    view
    |> element("#drop-canvas")
    |> render_hook("reorder_items", %{"old_index" => 0, "new_index" => 2})

    # Verify new order
    assert get_item_positions(view) == [2, 0, 1]
  end
end
```

### E2E Tests (Playwright)

```javascript
// test/e2e/drag_drop.spec.js
import { test, expect } from '@playwright/test';

test('drag field from palette to canvas', async ({ page }) => {
  await page.goto('/forms/new');

  // Drag email field to canvas
  const emailField = page.locator('[data-item-type="email"]');
  const canvas = page.locator('#drop-canvas');

  await emailField.dragTo(canvas);

  // Verify field added
  await expect(page.locator('.canvas-item')).toHaveCount(1);
  await expect(page.locator('.canvas-item')).toContainText('Email');
});

test('reorder fields by dragging', async ({ page }) => {
  await page.goto('/forms/:id/edit'); // Form with 3 fields

  const firstField = page.locator('.canvas-item').first();
  const thirdField = page.locator('.canvas-item').nth(2);

  // Drag first field to third position
  await firstField.dragTo(thirdField, { targetPosition: { x: 0, y: 50 } });

  // Verify new order
  const fields = page.locator('.canvas-item');
  await expect(fields.nth(0)).not.toHaveText('Email');
  await expect(fields.nth(2)).toHaveText('Email');
});

test('keyboard alternative works', async ({ page }) => {
  await page.goto('/forms/new');

  // Use keyboard to add field
  await page.click('button:has-text("Add Email")');

  // Verify field added
  await expect(page.locator('.canvas-item')).toHaveCount(1);

  // Use keyboard to reorder
  await page.click('button[aria-label="Move item up"]');

  // Verify reordered
  // ... assertions
});
```

---

## Common Pitfalls

### ❌ Don't: Use drag-drop as only method
**Why**: Not accessible, difficult on mobile
**Fix**: Always provide keyboard/button alternative

### ❌ Don't: Forget to update server state
**Why**: UI and server get out of sync
**Fix**: Always send events to LiveView on changes

### ❌ Don't: Re-render entire canvas on every update
**Why**: Performance degrades with many items
**Fix**: Use LiveView streams and targeted updates

### ❌ Don't: Ignore visual feedback during drag
**Why**: User doesn't know where item will drop
**Fix**: Show drop indicators, ghost elements, animations

### ❌ Don't: Use touch events for drag-drop on mobile
**Why**: Conflicts with scrolling, poor UX
**Fix**: Use tap-to-add pattern on mobile

---

## Related Patterns

- [List-Detail Pattern](./list-detail.md) - Often used with drag-drop builders
- [Modal vs Detail View](./modal-vs-detail.md) - Full-page builder vs modal editor
- [Settings Tabs](./settings-tabs.md) - Alternative to drag-drop for configuration

---

## Examples in Codebase

### Primary Example
- **Screen**: [Form Builder](../screens/forms/form-builder.md)
- **Location**: `/forms/new`, `/forms/:id/edit`

### Future Examples
- Dashboard widget customization (future)
- Email template builder (future)
- Report builder (future)

---

## Resources

### Libraries
- [SortableJS](https://github.com/SortableJS/Sortable) - Best drag-drop library
- [HTML5 Drag-Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) - Native browser API

### Articles
- [Drag-Drop in Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/js-interop.html#client-hooks)
- [Accessible Drag-Drop](https://www.w3.org/WAI/ARIA/apg/patterns/dnd/)

---

**Status**: ✅ Pattern documented and ready for implementation
**Complexity**: HIGH
**Reusability**: HIGH - Can be adapted for many use cases
