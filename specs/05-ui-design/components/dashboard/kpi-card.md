# KPI Card Component

**Category**: Dashboard
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/KPICard.tsx` (52 lines)

---

## Overview

The KPI Card is a key metric display component used to showcase important statistics with optional trend indicators. It's clickable to reveal detailed breakdowns and includes visual feedback for user interaction.

**Purpose**: Display key performance indicators (KPIs) with values, trends, and icons in a visually appealing card format.

**Used In**:
- Dashboard screen (4 KPI cards)
- Forms List screen (summary cards)
- Analytics pages

---

## Visual Design

### Layout Structure

```
┌────────────────────────────────────────┐
│                              ┌──────┐  │
│  Label (small, muted)        │      │  │
│  Value (large, bold)         │ Icon │  │
│  ↗ +12.5% vs last month     │      │  │
│                              └──────┘  │
└────────────────────────────────────────┘
```

### Dimensions
- **Width**: Flexible (typically 1/4 of container in grid)
- **Height**: Auto (min ~120px)
- **Padding**: `24px` (Tailwind: `p-6`)
- **Border Radius**: `16px` (Tailwind: `rounded-2xl`)
- **Icon Container**: `64px × 64px` circle

### Spacing
- Label to value: `8px` (`mb-2`)
- Value to trend: `8px` (`mb-2`)
- Content to icon: Space-between with flex

---

## States

### Default
- White background
- Subtle shadow: `shadow`
- Border: None

### Hover
- Elevated shadow: `shadow-lg`
- Scale: `1.02` (subtle zoom)
- Transition: `150ms ease-in-out`
- Cursor: `pointer` (if clickable)

### Active (Selected)
- Ring: `ring-2 ring-primary`
- Enhanced shadow: `shadow-lg`
- Indicates selected state for drill-down

### Disabled
- Reduced opacity: `opacity-60`
- Cursor: `not-allowed`
- No hover effects

---

## Props/Assigns

```elixir
@assigns = %{
  # Required
  label: String.t(),           # "Total Forms"
  value: integer() | String.t(), # 156 or "156"
  icon: atom(),                 # :hero_document_text

  # Optional
  trend: float() | nil,         # 12.5 (percentage)
  trend_label: String.t(),      # "vs last month"
  color_class: String.t(),      # "bg-primary" (icon background)
  clickable: boolean(),         # true/false
  active: boolean(),            # true/false (selected state)

  # Events
  on_click: String.t() | nil,   # "open_kpi_detail"
  on_click_value: String.t() | nil # "forms"
}
```

---

## Variants

### Color Variants (Icon Background)

| Variant | Class | Usage |
|---------|-------|-------|
| Primary (Blue) | `bg-primary` or `bg-gradient-to-br from-[#2278c0] to-[#1a5f99]` | Forms, general metrics |
| Success (Green) | `bg-success` | Active items, positive metrics |
| Warning (Yellow) | `bg-warning` | Drafts, cautions |
| Accent (Fuchsia) | `bg-accent` or `bg-gradient-to-br from-[#ec4899] to-[#db2777]` | Special features, chatbot |
| Neutral (Gray) | `bg-neutral` | Paused, inactive items |

### Size Variants

**Standard** (Default):
- Icon container: `64px`
- Value: `text-3xl` (30px)
- Padding: `p-6` (24px)

**Compact** (For dense layouts):
- Icon container: `48px`
- Value: `text-2xl` (24px)
- Padding: `p-4` (16px)

---

## Behavior

### Interactions

1. **Click (if clickable)**
   - Triggers drill-down to detailed view
   - Shows detail modal with breakdown
   - Sets active state

2. **Hover**
   - Elevates card with shadow
   - Slightly scales up (102%)
   - Changes cursor to pointer

3. **Keyboard Navigation**
   - Focusable via Tab key
   - Enter/Space triggers click
   - Proper focus ring visible

---

## LiveView Implementation

### Basic Component

```elixir
defmodule ClienttCrmAppWeb.Components.Dashboard do
  use Phoenix.Component
  import ClienttCrmAppWeb.CoreComponents

  @doc """
  Renders a KPI card with value, trend, and icon.

  ## Examples

      <.kpi_card
        label="Total Forms"
        value={156}
        trend={12.5}
        icon={:hero_document_text}
      />

      <.kpi_card
        label="Active Users"
        value="1,892"
        trend={-5.3}
        icon={:hero_users}
        clickable={true}
        phx-click="open_user_detail"
      />
  """
  attr :label, :string, required: true
  attr :value, :any, required: true
  attr :trend, :float, default: nil
  attr :trend_label, :string, default: "vs last month"
  attr :icon, :atom, required: true
  attr :color_class, :string, default: "bg-primary"
  attr :clickable, :boolean, default: false
  attr :active, :boolean, default: false
  attr :rest, :global, include: ~w(phx-click phx-value-type)

  def kpi_card(assigns) do
    ~H"""
    <div
      class={[
        "card bg-base-100 shadow-md p-6 transition-all duration-150",
        @clickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        @active && "ring-2 ring-primary shadow-lg"
      ]}
      {@rest}
    >
      <div class="flex items-start justify-between">
        <!-- Content -->
        <div class="flex-1">
          <p class="text-sm text-base-content/60 mb-2">{@label}</p>
          <p class="text-3xl font-bold text-base-content mb-2">
            {format_value(@value)}
          </p>

          <%= if @trend do %>
            <div class="flex items-center gap-1">
              <.icon
                name={if @trend > 0, do: :hero_arrow_trending_up, else: :hero_arrow_trending_down}
                class={[
                  "w-4 h-4",
                  if(@trend > 0, do: "text-success", else: "text-error")
                ]}
              />
              <span class={[
                "text-sm font-medium",
                if(@trend > 0, do: "text-success", else: "text-error")
              ]}>
                {if @trend > 0, do: "+"}
                {Float.round(@trend, 1)}%
              </span>
              <span class="text-xs text-base-content/60 ml-1">
                {@trend_label}
              </span>
            </div>
          <% end %>
        </div>

        <!-- Icon -->
        <div class={[
          "w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0",
          @color_class
        ]}>
          <.icon name={@icon} class="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
    """
  end

  defp format_value(value) when is_integer(value) do
    Number.Delimit.number_to_delimited(value, precision: 0)
  end

  defp format_value(value), do: value
end
```

### Usage in Dashboard

```elixir
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <.kpi_card
    label="Total Forms"
    value={@metrics.total_forms}
    trend={@metrics.forms_trend}
    icon={:hero_document_text}
    color_class="bg-gradient-to-br from-[#2278c0] to-[#1a5f99]"
    clickable={true}
    phx-click="open_kpi_detail"
    phx-value-type="forms"
  />

  <.kpi_card
    label="Total Submissions"
    value={@metrics.total_submissions}
    trend={@metrics.submissions_trend}
    icon={:hero_paper_airplane}
    color_class="bg-success"
    clickable={true}
    phx-click="open_kpi_detail"
    phx-value-type="submissions"
  />

  <.kpi_card
    label="Active Users"
    value={@metrics.active_users}
    trend={@metrics.users_trend}
    icon={:hero_users}
    color_class="bg-accent"
    clickable={true}
    phx-click="open_kpi_detail"
    phx-value-type="users"
  />

  <.kpi_card
    label="Conversion Rate"
    value={"#{@metrics.conversion_rate}%"}
    trend={@metrics.conversion_trend}
    icon={:hero_arrow_trending_up}
    color_class="bg-warning"
    clickable={true}
    phx-click="open_kpi_detail"
    phx-value-type="conversion"
  />
</div>
```

### Compact Variant

```elixir
<.kpi_card
  label="Draft Forms"
  value={18}
  icon={:hero_pencil_square}
  color_class="bg-warning"
  class="p-4"  # Override padding
  # Adjust icon size via slot in enhanced version
/>
```

---

## Accessibility

### ARIA Attributes

```elixir
<div
  role={if @clickable, do: "button", else: "group"}
  tabindex={if @clickable, do: "0", else: nil}
  aria-label={"#{@label}: #{@value}#{if @trend, do: ", #{@trend}% change"}"}
  {@rest}
>
```

### Keyboard Navigation

- **Tab**: Focus on card (if clickable)
- **Enter/Space**: Trigger click event
- **Focus Ring**: Visible outline (Tailwind: `focus:ring-2 focus:ring-primary`)

### Screen Reader

The card announces:
- Label: "Total Forms"
- Value: "156"
- Trend: "Plus 12.5% vs last month"

Example announcement: "Total Forms: 156, plus 12.5% vs last month"

---

## Responsive Design

### Desktop (> 1024px)
```elixir
<div class="grid grid-cols-4 gap-6">
  <.kpi_card ... />
</div>
```

### Tablet (640px - 1024px)
```elixir
<div class="grid grid-cols-2 gap-4">
  <.kpi_card ... />
</div>
```

### Mobile (< 640px)
```elixir
<div class="grid grid-cols-1 gap-4">
  <.kpi_card ... />
</div>
```

Or use responsive Tailwind classes:
```elixir
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
```

---

## Testing

### Component Test

```elixir
defmodule ClienttCrmAppWeb.Components.DashboardTest do
  use ClienttCrmAppWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  describe "kpi_card/1" do
    test "renders with required props" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        trend: nil
      }

      html = render_component(&kpi_card/1, assigns)

      assert html =~ "Total Forms"
      assert html =~ "156"
      assert html =~ "hero-document-text"
    end

    test "renders trend indicator when trend is positive" do
      assigns = %{
        label: "Active Users",
        value: 1892,
        icon: :hero_users,
        trend: 12.5
      }

      html = render_component(&kpi_card/1, assigns)

      assert html =~ "+12.5%"
      assert html =~ "text-success"
      assert html =~ "hero-arrow-trending-up"
    end

    test "renders trend indicator when trend is negative" do
      assigns = %{
        label: "Bounce Rate",
        value: "35.2%",
        icon: :hero_arrow_trending_down,
        trend: -5.3
      }

      html = render_component(&kpi_card/1, assigns)

      assert html =~ "-5.3%"
      assert html =~ "text-error"
      assert html =~ "hero-arrow-trending-down"
    end

    test "renders active state" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        active: true
      }

      html = render_component(&kpi_card/1, assigns)

      assert html =~ "ring-2 ring-primary"
    end

    test "includes click handler when clickable" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        clickable: true,
        "phx-click": "open_detail"
      }

      html = render_component(&kpi_card/1, assigns)

      assert html =~ "phx-click=\"open_detail\""
      assert html =~ "cursor-pointer"
    end
  end
end
```

---

## Common Patterns

### With Gradient Background

```elixir
<.kpi_card
  label="Total Forms"
  value={156}
  icon={:hero_document_text}
  color_class="bg-gradient-to-br from-[#2278c0] to-[#1a5f99]"
/>
```

### Loading State

```elixir
<.kpi_card
  label="Total Forms"
  value={if @loading, do: "...", else: @total_forms}
  icon={:hero_document_text}
  class={if @loading, do: "animate-pulse"}
/>
```

### Error State

```elixir
<.kpi_card
  label="Total Forms"
  value={if @error, do: "Error", else: @total_forms}
  icon={:hero_exclamation_circle}
  color_class={if @error, do: "bg-error", else: "bg-primary"}
/>
```

---

## Related Components

- **Performance Chart**: Often used alongside KPI cards
- **Detail Modal**: Displays when KPI card is clicked
- **Badge**: For status indicators

---

## Dependencies

- **Phoenix.Component**: Function component framework
- **Heroicons**: Icon library
- **Tailwind CSS**: Styling
- **Number.Delimit**: Number formatting (for large values)

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11: Not supported (uses CSS Grid and transforms)

---

## Performance Notes

- Lightweight component (no JavaScript required unless clickable)
- CSS transitions for smooth animations
- No external API calls

---

## Design Tokens Used

From `specs/05-ui-design/design-tokens.md`:

- **Colors**: `bg-primary`, `bg-success`, `bg-warning`, `bg-accent`
- **Typography**: `text-sm`, `text-3xl`, `font-bold`
- **Spacing**: `p-6` (24px), `mb-2` (8px), `gap-1` (4px)
- **Border Radius**: `rounded-xl` (12px), `rounded-2xl` (16px)
- **Shadows**: `shadow-md`, `shadow-lg`
- **Transitions**: `transition-all duration-150`

---

**Last Updated**: 2025-11-17
**Maintained By**: ClienttCRM Design Team
