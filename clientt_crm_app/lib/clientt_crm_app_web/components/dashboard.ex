defmodule ClienttCrmAppWeb.Components.Dashboard do
  @moduledoc """
  Dashboard-specific UI components for metrics, charts, and data visualization.

  This module provides components used in dashboard screens:
  - KPI Card: Display key performance indicators with trends
  - Performance Chart: Time-series area charts
  - Recent Forms Table: Compact table for recent form submissions

  Based on specs in: specs/05-ui-design/components/dashboard/
  """
  use Phoenix.Component
  import ClienttCrmAppWeb.CoreComponents
  use ClienttCrmAppWeb, :verified_routes

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

  @doc """
  Renders a compact table of recent forms with inline status badges.

  ## Examples

      <.recent_forms_table
        title="Recent Forms"
        forms={@recent_forms}
        on_row_click="navigate_to_form"
      />
  """
  attr :title, :string, default: "Recent Forms"
  attr :forms, :list, required: true
  attr :show_header, :boolean, default: true
  attr :max_rows, :integer, default: 5
  attr :on_row_click, :string, default: nil

  def recent_forms_table(assigns) do
    ~H"""
    <div class="card bg-base-100 shadow-md p-5">
      <%= if @show_header do %>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-base-content">{@title}</h3>
          <.link navigate={~p"/forms"} class="text-sm text-primary hover:underline">
            View All →
          </.link>
        </div>
      <% end %>

      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Form Name</th>
              <th>Status</th>
              <th>Submissions</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <%= for form <- Enum.take(@forms, @max_rows) do %>
              <tr
                class={[
                  "hover:bg-base-200 transition-colors",
                  @on_row_click && "cursor-pointer"
                ]}
                phx-click={@on_row_click}
                phx-value-id={form.id}
              >
                <td>
                  <div class="flex items-center gap-2">
                    <.icon name="hero-document-text" class="w-4 h-4 text-base-content/60" />
                    <span class="font-medium">{form.name}</span>
                  </div>
                </td>
                <td>
                  <.form_status_badge status={form.status} />
                </td>
                <td>
                  <span class="text-sm text-base-content/60">{form.submission_count || 0}</span>
                </td>
                <td>
                  <span class="text-xs text-base-content/60">
                    {relative_time(form.updated_at)}
                  </span>
                </td>
              </tr>
            <% end %>
          </tbody>
        </table>

        <%= if Enum.empty?(@forms) do %>
          <div class="text-center py-8">
            <.icon name="hero-document-text" class="w-12 h-12 mx-auto text-base-content/20 mb-2" />
            <p class="text-sm text-base-content/60">No forms yet</p>
          </div>
        <% end %>
      </div>
    </div>
    """
  end

  # Helper Components

  @doc """
  Renders a status badge for forms.
  """
  attr :status, :atom, required: true

  defp form_status_badge(assigns) do
    ~H"""
    <span class={[
      "badge badge-sm",
      status_badge_class(@status)
    ]}>
      {format_status(@status)}
    </span>
    """
  end

  # Helper Functions

  defp format_value(value) when is_integer(value) do
    # Format large numbers with commas
    value
    |> Integer.to_string()
    |> String.graphemes()
    |> Enum.reverse()
    |> Enum.chunk_every(3)
    |> Enum.join(",")
    |> String.reverse()
  end

  defp format_value(value), do: value

  defp format_range_label("7d"), do: "7 Days"
  defp format_range_label("30d"), do: "30 Days"
  defp format_range_label("90d"), do: "90 Days"
  defp format_range_label(range), do: range

  defp status_badge_class(:published), do: "badge-success"
  defp status_badge_class(:draft), do: "badge-warning"
  defp status_badge_class(:paused), do: "badge-neutral"
  defp status_badge_class(_), do: "badge-ghost"

  defp format_status(status) do
    status
    |> Atom.to_string()
    |> String.capitalize()
  end

  defp relative_time(datetime) do
    # Simple relative time formatting
    # In production, consider using a library like Timex
    now = DateTime.utc_now()
    diff = DateTime.diff(now, datetime, :second)

    cond do
      diff < 60 -> "just now"
      diff < 3600 -> "#{div(diff, 60)}m ago"
      diff < 86400 -> "#{div(diff, 3600)}h ago"
      diff < 604800 -> "#{div(diff, 86400)}d ago"
      true -> Calendar.strftime(datetime, "%b %d, %Y")
    end
  end
end
