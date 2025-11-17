defmodule ClienttCrmAppWeb.Components.Forms do
  @moduledoc """
  Forms-specific UI components for form building and editing.

  This module provides components used in the Form Builder:
  - Form Grid Canvas: Drag-drop canvas for form layout
  - Form Fields Sidebar: Categorized field types palette
  - Draggable Field: Individual form field in the canvas

  Based on Figma: figma_src/205 Forms Dashboard/src/components/
  """
  use Phoenix.Component
  import ClienttCrmAppWeb.CoreComponents

  @doc """
  Renders the form fields sidebar with categorized field types.

  ## Examples

      <.form_fields_sidebar
        on_add_field="add_field"
      />
  """
  attr :on_add_field, :string, default: "add_field"
  attr :ai_tools_enabled, :boolean, default: true

  def form_fields_sidebar(assigns) do
    ~H"""
    <div class="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pb-6">
      <div class="card bg-base-100">
        <!-- Header -->
        <div class="p-4 border-b border-base-300">
          <h2 class="text-lg font-semibold">Add Form Fields</h2>
          <p class="text-sm text-base-content/60 mt-1">
            Drag fields to your form
          </p>
        </div>

        <!-- Field Categories -->
        <div class="p-2">
          <!-- Contact Fields -->
          <.field_category
            title="Contact Fields"
            icon="hero-user"
            expanded={true}
          >
            <.draggable_field_tile type="text" icon="hero-user" label="Full Name" />
            <.draggable_field_tile type="email" icon="hero-envelope" label="Email" />
            <.draggable_field_tile type="tel" icon="hero-phone" label="Phone" />
            <.draggable_field_tile type="text" icon="hero-briefcase" label="Company" />
            <.draggable_field_tile type="text" icon="hero-map-pin" label="Address" />
          </.field_category>

          <!-- General Fields -->
          <.field_category
            title="General Fields"
            icon="hero-document-text"
            expanded={false}
          >
            <.draggable_field_tile type="text" icon="hero-bars-3-bottom-left" label="Single Line Text" />
            <.draggable_field_tile type="textarea" icon="hero-bars-3" label="Multi-line Text" />
            <.draggable_field_tile type="number" icon="hero-hashtag" label="Number" />
            <.draggable_field_tile type="url" icon="hero-link" label="Website URL" />
            <.draggable_field_tile type="date" icon="hero-calendar" label="Date" />
          </.field_category>

          <!-- Choice Fields -->
          <.field_category
            title="Choice Fields"
            icon="hero-queue-list"
            expanded={false}
          >
            <.draggable_field_tile type="select" icon="hero-chevron-down" label="Dropdown" />
            <.draggable_field_tile type="checkbox" icon="hero-check-circle" label="Checkboxes" />
            <.draggable_field_tile type="radio" icon="hero-radio" label="Radio Buttons" />
          </.field_category>

          <!-- Service Fields -->
          <.field_category
            title="Service Fields"
            icon="hero-calendar-days"
            expanded={false}
          >
            <.draggable_field_tile type="datetime" icon="hero-calendar" label="Appointment Date/Time" />
            <.draggable_field_tile type="select" icon="hero-list-bullet" label="Service Selection" />
          </.field_category>

          <!-- Payments -->
          <.field_category
            title="Payments"
            icon="hero-credit-card"
            expanded={false}
          >
            <.draggable_field_tile type="price" icon="hero-currency-dollar" label="Product/Service Price" />
            <.draggable_field_tile type="payment" icon="hero-credit-card" label="Payment Method" />
          </.field_category>

          <!-- Layout Elements -->
          <.field_category
            title="Layout"
            icon="hero-squares-2x2"
            expanded={false}
          >
            <.draggable_field_tile type="heading" icon="hero-bars-3-center-left" label="Heading" />
            <.draggable_field_tile type="separator" icon="hero-minus" label="Separator" />
            <.draggable_field_tile type="spacer" icon="hero-arrows-up-down" label="Spacer" />
          </.field_category>

          <%= if @ai_tools_enabled do %>
            <!-- AI Tools -->
            <.field_category
              title="AI Tools"
              icon="hero-sparkles"
              expanded={false}
            >
              <button
                phx-click="show_ai_assistant"
                class="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <.icon name="hero-sparkles" class="w-5 h-5 text-accent" />
                <span class="text-sm">AI Form Assistant</span>
              </button>
            </.field_category>
          <% end %>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t border-base-300">
          <button
            phx-click="open_design_options"
            class="btn btn-outline btn-sm w-full"
          >
            <.icon name="hero-paint-brush" class="w-4 h-4" />
            Design Options
          </button>
        </div>
      </div>
    </div>
    """
  end

  @doc """
  Renders a collapsible category of form fields.
  """
  attr :title, :string, required: true
  attr :icon, :atom, required: true
  attr :expanded, :boolean, default: false
  slot :inner_block, required: true

  def field_category(assigns) do
    ~H"""
    <div class="mb-2">
      <button
        phx-click="toggle_field_category"
        phx-value-category={@title}
        class="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold hover:bg-base-200 rounded-lg transition-colors"
      >
        <.icon name={@icon} class="w-4 h-4" />
        <span class="flex-1 text-left">{@title}</span>
        <.icon
          name={if @expanded, do: "hero-chevron-down", else: "hero-chevron-right"}
          class="w-4 h-4"
        />
      </button>

      <%= if @expanded do %>
        <div class="mt-1 space-y-1 px-2">
          {render_slot(@inner_block)}
        </div>
      <% end %>
    </div>
    """
  end

  @doc """
  Renders a draggable field tile in the sidebar.
  """
  attr :type, :string, required: true
  attr :icon, :atom, required: true
  attr :label, :string, required: true

  def draggable_field_tile(assigns) do
    ~H"""
    <div
      class="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 cursor-move transition-colors"
      draggable="true"
      data-field-type={@type}
      phx-hook="DraggableField"
    >
      <.icon name={@icon} class="w-4 h-4 text-base-content/60" />
      <span class="text-sm">{@label}</span>
    </div>
    """
  end

  @doc """
  Renders the form grid canvas for drag-drop form building.

  ## Examples

      <.form_grid_canvas
        fields={@fields}
        selected_field_id={@selected_field_id}
        on_select_field="select_field"
        on_remove_field="remove_field"
      />
  """
  attr :fields, :list, required: true
  attr :selected_field_id, :string, default: nil
  attr :border_color, :string, default: "#e5e7eb"
  attr :font_family, :string, default: "system-ui"
  attr :font_size, :string, default: "16px"
  attr :on_select_field, :string, default: "select_field"
  attr :on_remove_field, :string, default: "remove_field"

  def form_grid_canvas(assigns) do
    ~H"""
    <div
      class="min-h-[600px] bg-base-200 p-8 rounded-lg"
      phx-hook="FormDropZone"
      id="form-canvas"
      data-border-color={@border_color}
    >
      <div class="max-w-4xl mx-auto bg-base-100 shadow-lg rounded-lg p-8">
        <!-- Form Preview Header -->
        <div class="mb-6 pb-6 border-b border-base-300">
          <h2 class="text-2xl font-bold mb-2">Form Preview</h2>
          <p class="text-sm text-base-content/60">
            Add fields from the sidebar or drag to reorder
          </p>
        </div>

        <!-- Fields Grid -->
        <%= if Enum.empty?(@fields) do %>
          <!-- Empty State -->
          <div class="text-center py-16">
            <.icon name="hero-cursor-arrow-rays" class="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <h3 class="text-lg font-semibold mb-2">No fields yet</h3>
            <p class="text-sm text-base-content/60">
              Drag fields from the sidebar to get started
            </p>
          </div>
        <% else %>
          <div class="space-y-4" id="fields-container">
            <%= for field <- @fields do %>
              <.form_field_item
                field={field}
                selected={@selected_field_id == field.id}
                on_select={@on_select_field}
                on_remove={@on_remove_field}
              />
            <% end %>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  @doc """
  Renders a single form field item in the canvas.
  """
  attr :field, :map, required: true
  attr :selected, :boolean, default: false
  attr :on_select, :string, required: true
  attr :on_remove, :string, required: true

  def form_field_item(assigns) do
    ~H"""
    <div
      class={[
        "relative p-4 rounded-lg border-2 transition-all",
        @selected && "border-primary bg-primary/5" || "border-base-300 hover:border-base-400"
      ]}
      phx-click={@on_select}
      phx-value-id={@field.id}
      data-field-id={@field.id}
      draggable="true"
    >
      <!-- Field Label -->
      <label class="block text-sm font-medium mb-2">
        {@field.label}
        <%= if @field.required do %>
          <span class="text-error">*</span>
        <% end %>
      </label>

      <!-- Field Input Preview -->
      <.field_input_preview field={@field} />

      <!-- Field Description -->
      <%= if @field.description do %>
        <p class="text-xs text-base-content/60 mt-2">{@field.description}</p>
      <% end %>

      <!-- Actions (show on hover/select) -->
      <%= if @selected do %>
        <div class="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            phx-click="edit_field"
            phx-value-id={@field.id}
            class="btn btn-xs btn-ghost"
            title="Edit field"
          >
            <.icon name="hero-pencil" class="w-3 h-3" />
          </button>
          <button
            type="button"
            phx-click={@on_remove}
            phx-value-id={@field.id}
            class="btn btn-xs btn-ghost text-error"
            title="Remove field"
          >
            <.icon name="hero-trash" class="w-3 h-3" />
          </button>
        </div>
      <% end %>

      <!-- Drag Handle -->
      <div class="absolute left-2 top-1/2 -translate-y-1/2 cursor-move opacity-0 hover:opacity-100 transition-opacity">
        <.icon name="hero-bars-3" class="w-4 h-4 text-base-content/40" />
      </div>
    </div>
    """
  end

  @doc """
  Renders a preview of the field input based on type.
  """
  attr :field, :map, required: true

  def field_input_preview(assigns) do
    ~H"""
    <%= case @field.type do %>
      <% "text" -> %>
        <input
          type="text"
          placeholder={@field.placeholder || "Enter text..."}
          class="input input-bordered w-full"
          disabled
        />

      <% "email" -> %>
        <input
          type="email"
          placeholder={@field.placeholder || "your@email.com"}
          class="input input-bordered w-full"
          disabled
        />

      <% "tel" -> %>
        <input
          type="tel"
          placeholder={@field.placeholder || "(123) 456-7890"}
          class="input input-bordered w-full"
          disabled
        />

      <% "textarea" -> %>
        <textarea
          placeholder={@field.placeholder || "Enter your message..."}
          class="textarea textarea-bordered w-full"
          rows="3"
          disabled
        ></textarea>

      <% "number" -> %>
        <input
          type="number"
          placeholder={@field.placeholder || "0"}
          class="input input-bordered w-full"
          disabled
        />

      <% "date" -> %>
        <input
          type="date"
          class="input input-bordered w-full"
          disabled
        />

      <% "select" -> %>
        <select class="select select-bordered w-full" disabled>
          <option>{@field.placeholder || "Select an option..."}</option>
          <%= for option <- @field.options || [] do %>
            <option>{option}</option>
          <% end %>
        </select>

      <% "checkbox" -> %>
        <div class="space-y-2">
          <%= for option <- @field.options || ["Option 1", "Option 2"] do %>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="checkbox checkbox-sm" disabled />
              <span class="text-sm">{option}</span>
            </label>
          <% end %>
        </div>

      <% "radio" -> %>
        <div class="space-y-2">
          <%= for option <- @field.options || ["Option 1", "Option 2"] do %>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                name={"preview-#{@field.id}"}
                class="radio radio-sm"
                disabled
              />
              <span class="text-sm">{option}</span>
            </label>
          <% end %>
        </div>

      <% "heading" -> %>
        <h3 class="text-xl font-bold">{@field.label}</h3>

      <% "separator" -> %>
        <div class="divider"></div>

      <% "spacer" -> %>
        <div class="h-8"></div>

      <% _ -> %>
        <input
          type="text"
          placeholder="Unsupported field type"
          class="input input-bordered w-full"
          disabled
        />
    <% end %>
    """
  end
end
