# Performance Chart Component

**Category**: Dashboard
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/PerformanceChart.tsx` (82 lines)

---

## Overview

The Performance Chart displays time-series data (form submissions, conversions, etc.) as an interactive area chart with gradient fill. It adapts to dark mode and provides tooltip interactions.

**Purpose**: Visualize metrics over time (daily, weekly, monthly) with an elegant area chart.

**Used In**:
- Dashboard screen (submissions over time)
- Analytics screen (detailed metrics)
- Form-specific analytics

---

## Visual Design

### Layout Structure

```
┌──────────────────────────────────────────────────┐
│ Form Submissions This Week                       │
│ Daily breakdown of form responses                │
│                                                   │
│  80 ┤                            ╭─╮             │
│  60 ┤                    ╭───╮   │ │             │
│  40 ┤    ╭───╮       ╭───╯   ╰───╯ ╰───╮        │
│  20 ┤────╯   ╰───────╯               ╰──────    │
│   0 ┼─────────────────────────────────────────   │
│     Mon Tue Wed Thu Fri Sat Sun                  │
│                                                   │
│ [7 Days] [30 Days] [90 Days]  (optional tabs)   │
└──────────────────────────────────────────────────┘
```

### Dimensions
- **Height**: `300px` (dashboard), `400px` (analytics page)
- **Width**: Responsive (100% of container)
- **Padding**: `20px` (Tailwind: `p-5`)

### Colors
- **Line**: Primary blue `#2278c0`
- **Fill Gradient**: `#2278c0` at 30% opacity → 0% opacity
- **Grid Lines**: Border color with 50% opacity
- **Axis Labels**: Muted foreground color

---

## Chart Configuration

### Chart Type
**Area Chart** with gradient fill

**Key Features**:
- Smooth monotone curve
- Grid lines (dashed)
- X-axis (time labels)
- Y-axis (value labels)
- Interactive tooltips
- Responsive to container width

### Data Format

```elixir
data = [
  %{name: "Mon", submissions: 45},
  %{name: "Tue", submissions: 52},
  %{name: "Wed", submissions: 48},
  %{name: "Thu", submissions: 68},
  %{name: "Fri", submissions: 75},
  %{name: "Sat", submissions: 35},
  %{name: "Sun", submissions: 40}
]
```

---

## Props/Assigns

```elixir
@assigns = %{
  # Required
  title: String.t(),            # "Form Submissions This Week"
  description: String.t(),      # "Daily breakdown of form responses"
  data: list(map()),            # Chart data points

  # Optional
  height: integer(),            # 300 (default)
  data_key: String.t(),         # "submissions" (default)
  label_key: String.t(),        # "name" (default)
  color: String.t(),            # "#2278c0" (primary blue)
  show_grid: boolean(),         # true (default)
  show_tooltip: boolean(),      # true (default)

  # Time range selector (optional)
  time_ranges: list(String.t()), # ["7d", "30d", "90d"]
  selected_range: String.t(),    # "30d"
}
```

---

## LiveView Implementation

### Component Definition

```elixir
defmodule ClienttCrmAppWeb.Components.Dashboard do
  use Phoenix.Component
  import ClienttCrmAppWeb.CoreComponents

  @doc """
  Renders a performance chart using Chart.js via Phoenix Hook.

  ## Examples

      <.performance_chart
        title="Form Submissions This Week"
        description="Daily breakdown of form responses"
        data={@chart_data}
      />

      <.performance_chart
        title="Conversions Over Time"
        data={@conversion_data}
        data_key="conversions"
        color="#10b981"
        height={400}
      />
  """
  attr :title, :string, required: true
  attr :description, :string, default: nil
  attr :data, :list, required: true
  attr :height, :integer, default: 300
  attr :data_key, :string, default: "submissions"
  attr :label_key, :string, default: "name"
  attr :color, :string, default: "#2278c0"
  attr :show_grid, :boolean, default: true
  attr :show_tooltip, :boolean, default: true
  attr :time_ranges, :list, default: []
  attr :selected_range, :string, default: nil
  attr :id, :string, default: "performance-chart"

  def performance_chart(assigns) do
    ~H"""
    <div class="card bg-base-100 shadow-md p-5">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-base-content">{@title}</h3>
          <%= if @description do %>
            <p class="text-sm text-base-content/60 mt-1">{@description}</p>
          <% end %>
        </div>

        <!-- Time Range Selector (Optional) -->
        <%= if length(@time_ranges) > 0 do %>
          <div class="tabs tabs-boxed">
            <%= for range <- @time_ranges do %>
              <button
                class={["tab", @selected_range == range && "tab-active"]}
                phx-click="change_chart_range"
                phx-value-range={range}
              >
                {format_range_label(range)}
              </button>
            <% end %>
          </div>
        <% end %>
      </div>

      <!-- Chart Container -->
      <div
        id={@id}
        phx-hook="AreaChart"
        phx-update="ignore"
        data-chart-data={Jason.encode!(@data)}
        data-data-key={@data_key}
        data-label-key={@label_key}
        data-color={@color}
        data-height={@height}
        data-show-grid={@show_grid}
        data-show-tooltip={@show_tooltip}
        style={"height: #{@height}px;"}
      >
        <canvas></canvas>
      </div>

      <!-- Loading State -->
      <%= if Enum.empty?(@data) do %>
        <div class="flex items-center justify-center h-[300px]">
          <div class="text-center">
            <div class="loading loading-spinner loading-lg text-primary"></div>
            <p class="text-sm text-base-content/60 mt-2">Loading chart data...</p>
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  defp format_range_label("7d"), do: "7 Days"
  defp format_range_label("30d"), do: "30 Days"
  defp format_range_label("90d"), do: "90 Days"
  defp format_range_label(range), do: range
end
```

---

## JavaScript Hook (Chart.js Integration)

### Installation

Add to `assets/package.json`:
```json
{
  "dependencies": {
    "chart.js": "^4.4.0"
  }
}
```

### Hook Implementation

Create `assets/js/hooks/area_chart.js`:

```javascript
import Chart from 'chart.js/auto';

const AreaChart = {
  mounted() {
    this.chart = null;
    this.renderChart();

    // Watch for theme changes
    this.observer = new MutationObserver(() => {
      this.updateTheme();
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  },

  updated() {
    this.renderChart();
  },

  destroyed() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  renderChart() {
    const canvas = this.el.querySelector('canvas');
    if (!canvas) return;

    // Get data from attributes
    const data = JSON.parse(this.el.dataset.chartData || '[]');
    const dataKey = this.el.dataset.dataKey || 'submissions';
    const labelKey = this.el.dataset.labelKey || 'name';
    const color = this.el.dataset.color || '#2278c0';
    const showGrid = this.el.dataset.showGrid !== 'false';
    const showTooltip = this.el.dataset.showTooltip !== 'false';

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Check dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#ffffff' : '#18181b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create gradient
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `${color}4D`); // 30% opacity
    gradient.addColorStop(1, `${color}00`); // 0% opacity

    // Chart configuration
    const config = {
      type: 'line',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{
          label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
          data: data.map(d => d[dataKey]),
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curve
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: showTooltip,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} ${dataKey}`;
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              display: showGrid,
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: showGrid,
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    };

    // Create chart
    this.chart = new Chart(ctx, config);
  },

  updateTheme() {
    if (this.chart) {
      this.renderChart();
    }
  },
};

export default AreaChart;
```

### Register Hook

In `assets/js/app.js`:

```javascript
import AreaChart from './hooks/area_chart';

let Hooks = {
  AreaChart: AreaChart,
  // ... other hooks
};

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: Hooks,
  params: {_csrf_token: csrfToken}
});
```

---

## Usage Examples

### Basic Usage

```elixir
<.performance_chart
  title="Form Submissions This Week"
  description="Daily breakdown of form responses"
  data={[
    %{name: "Mon", submissions: 45},
    %{name: "Tue", submissions: 52},
    %{name: "Wed", submissions: 48},
    %{name: "Thu", submissions: 68},
    %{name: "Fri", submissions: 75},
    %{name: "Sat", submissions: 35},
    %{name: "Sun", submissions: 40}
  ]}
/>
```

### With Time Range Selector

```elixir
<.performance_chart
  title="Submission Performance"
  data={@chart_data}
  time_ranges={["7d", "30d", "90d"]}
  selected_range={@selected_range}
/>
```

### Custom Colors and Height

```elixir
<.performance_chart
  title="Conversion Rate Over Time"
  data={@conversion_data}
  data_key="conversions"
  color="#10b981"
  height={400}
/>
```

---

## Accessibility

### Keyboard Navigation
- Chart.js provides built-in keyboard navigation for tooltips
- Tab through chart elements
- Arrow keys navigate data points

### Screen Reader Support

```elixir
<div
  role="img"
  aria-label={"Chart showing #{@title}: #{describe_chart_data(@data)}"}
>
  <!-- Chart canvas -->
</div>
```

### Data Table Fallback

For accessibility, provide a data table alternative:

```elixir
<details class="mt-4">
  <summary class="text-sm text-base-content/60 cursor-pointer">
    View data as table
  </summary>
  <table class="table table-compact mt-2">
    <thead>
      <tr>
        <th>Date</th>
        <th>Submissions</th>
      </tr>
    </thead>
    <tbody>
      <%= for row <- @data do %>
        <tr>
          <td>{row.name}</td>
          <td>{row.submissions}</td>
        </tr>
      <% end %>
    </tbody>
  </table>
</details>
```

---

## Responsive Design

### Desktop (> 1024px)
- Full height: `300px`
- All axis labels visible
- Hover tooltips work well

### Tablet (640px - 1024px)
- Reduce height: `250px`
- Simplify axis labels (e.g., "Mon" instead of "Monday")

### Mobile (< 640px)
- Minimum height: `200px`
- Show fewer axis labels
- Touch-enabled tooltips

```elixir
<.performance_chart
  data={@data}
  height={if @mobile?, do: 200, else: 300}
/>
```

---

## Data Loading & Performance

### Lazy Loading

```elixir
def mount(_params, _session, socket) do
  # Load chart data asynchronously
  send(self(), :load_chart_data)

  {:ok, assign(socket, chart_data: [], chart_loading: true)}
end

def handle_info(:load_chart_data, socket) do
  chart_data = fetch_chart_data(socket.assigns.selected_range)

  {:noreply, assign(socket, chart_data: chart_data, chart_loading: false)}
end
```

### Caching

```elixir
defp fetch_chart_data(range) do
  cache_key = "chart_data:#{range}"

  Cachex.fetch(:app_cache, cache_key, fn ->
    data = Repo.aggregate_submissions_by_date(range)
    {:commit, data, ttl: :timer.minutes(5)}
  end)
end
```

---

## Testing

### Component Test

```elixir
test "renders performance chart with data" do
  assigns = %{
    title: "Form Submissions",
    description: "Daily breakdown",
    data: [
      %{name: "Mon", submissions: 45},
      %{name: "Tue", submissions: 52}
    ]
  }

  html = render_component(&performance_chart/1, assigns)

  assert html =~ "Form Submissions"
  assert html =~ "Daily breakdown"
  assert html =~ "phx-hook=\"AreaChart\""
end

test "renders empty state when no data" do
  assigns = %{
    title: "Form Submissions",
    data: []
  }

  html = render_component(&performance_chart/1, assigns)

  assert html =~ "Loading chart data..."
end
```

---

## Common Patterns

### Multiple Metrics

```elixir
<.performance_chart
  title="Submissions vs Conversions"
  data={@chart_data}
  datasets={[
    %{label: "Submissions", key: "submissions", color: "#2278c0"},
    %{label: "Conversions", key: "conversions", color: "#10b981"}
  ]}
/>
```

### Export Chart

Add export button:

```elixir
<button
  phx-click="export_chart"
  class="btn btn-sm btn-outline"
>
  <.icon name="hero-arrow-down-tray" class="w-4 h-4 mr-2" />
  Export PNG
</button>
```

---

## Related Components

- **KPI Card**: Often displayed above charts
- **Time Range Selector**: Tabs or dropdown for range selection
- **Data Table**: Accessibility fallback

---

## Dependencies

- **Chart.js** (^4.4.0): Charting library
- **Phoenix Hooks**: Client-side integration
- **Jason**: JSON encoding

---

## Performance Notes

- Use `phx-update="ignore"` to prevent re-rendering
- Destroy chart on unmount to prevent memory leaks
- Cache aggregated data server-side
- Debounce time range changes

---

## Design Tokens Used

From `specs/05-ui-design/design-tokens.md`:

- **Colors**: Primary `#2278c0`, Success `#10b981`
- **Typography**: `text-lg` (18px), `text-sm` (14px)
- **Spacing**: `p-5` (20px), `mb-4` (16px)
- **Border Radius**: `rounded-lg` (8px)

---

**Last Updated**: 2025-11-17
**Maintained By**: ClienttCRM Design Team
