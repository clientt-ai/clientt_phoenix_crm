# Track 6: Analytics & KPIs

## Overview

Implement analytics calculations, metrics tracking, and data visualization for form performance and lead insights.

**Source:** `figma_src/205 Forms Dashboard/src/components/pages/FormsAnalytics.tsx`
**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models)
**Estimated Time:** 1 week

## Metrics to Track

### Dashboard KPIs
Global metrics shown on main dashboard

1. **Total Forms**
   - Count of all forms (draft + published)
   - Change from previous period (%)

2. **Total Submissions**
   - Count of all form submissions
   - Change from previous period (%)

3. **Active Users**
   - Count of users who submitted forms in last 30 days
   - Change from previous period (%)

4. **Conversion Rate**
   - (Submissions / Views) * 100
   - Change from previous period (%)

### Per-Form Analytics
Detailed metrics for individual forms

1. **Submission Count**
   - Total submissions for this form
   - Time-series data (daily, weekly, monthly)

2. **View Count**
   - Total form views
   - Time-series data

3. **Conversion Rate**
   - Form-specific conversion rate
   - Trend over time

4. **Average Completion Time**
   - Time from form open to submit
   - Identify drop-off points

5. **Field Analytics**
   - Most/least completed fields
   - Fields causing abandonment
   - Validation error frequency

6. **Lead Source Tracking**
   - Where submissions came from (UTM params)
   - Referrer analysis
   - Landing page tracking

7. **Top Performing Forms**
   - Ranked by submissions
   - Ranked by conversion rate
   - Ranked by quality (if scoring implemented)

## Technical Implementation

### Ash Calculations & Aggregates

Most analytics can be computed using Ash's built-in capabilities without separate tables.

#### Form Resource Calculations
**File:** `lib/clientt_crm_app/forms/form.ex` (additions)

```elixir
calculations do
  # Already defined:
  # calculate :conversion_rate, :decimal, expr(...)

  calculate :submissions_this_month, :integer, expr(
    fragment(
      """
      (SELECT COUNT(*) FROM submissions
       WHERE form_id = ? AND submitted_at >= DATE_TRUNC('month', NOW()))
      """,
      id
    )
  )

  calculate :submissions_last_month, :integer, expr(
    fragment(
      """
      (SELECT COUNT(*) FROM submissions
       WHERE form_id = ?
       AND submitted_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
       AND submitted_at < DATE_TRUNC('month', NOW()))
      """,
      id
    )
  )

  calculate :submission_change_percent, :decimal, expr(
    fragment(
      """
      CASE
        WHEN ? > 0 THEN ((? - ?) * 100.0 / ?)
        ELSE 0
      END
      """,
      submissions_last_month,
      submissions_this_month,
      submissions_last_month,
      submissions_last_month
    )
  )

  calculate :avg_completion_time_seconds, :integer, expr(
    fragment(
      """
      (SELECT AVG(EXTRACT(EPOCH FROM (submitted_at - inserted_at)))
       FROM submissions WHERE form_id = ?)
      """,
      id
    )
  )
end

aggregates do
  # Already defined:
  # count :total_submissions, :submissions
  # max :last_submission_at, :submissions, :submitted_at

  count :new_submissions_count, :submissions do
    filter expr(status == :new)
  end

  count :converted_submissions_count, :submissions do
    filter expr(status == :converted)
  end

  count :submissions_this_week, :submissions do
    filter expr(submitted_at >= fragment("DATE_TRUNC('week', NOW())"))
  end

  count :submissions_today, :submissions do
    filter expr(submitted_at >= fragment("DATE_TRUNC('day', NOW())"))
  end
end
```

### Analytics Module

**File:** `lib/clientt_crm_app/analytics.ex`

```elixir
defmodule ClienttCrmApp.Analytics do
  @moduledoc """
  Analytics and metrics calculations for forms, submissions, and leads
  """

  alias ClienttCrmApp.Forms
  alias ClienttCrmApp.Repo
  import Ecto.Query

  @doc """
  Get dashboard KPIs for a user
  """
  def get_dashboard_kpis(user_id) do
    %{
      total_forms: count_total_forms(user_id),
      total_submissions: count_total_submissions(user_id),
      active_users: count_active_users(user_id),
      conversion_rate: calculate_global_conversion_rate(user_id),
      forms_change: calculate_forms_change(user_id),
      submissions_change: calculate_submissions_change(user_id),
      active_users_change: calculate_active_users_change(user_id),
      conversion_rate_change: calculate_conversion_rate_change(user_id)
    }
  end

  @doc """
  Get time-series data for submissions
  """
  def get_submissions_over_time(form_id, opts \\ []) do
    period = Keyword.get(opts, :period, :daily) # :daily, :weekly, :monthly
    limit = Keyword.get(opts, :limit, 30)

    trunc_format = case period do
      :daily -> "day"
      :weekly -> "week"
      :monthly -> "month"
    end

    query = from s in "submissions",
      where: s.form_id == ^form_id,
      group_by: fragment("DATE_TRUNC(?, ?)", ^trunc_format, s.submitted_at),
      select: %{
        period: fragment("DATE_TRUNC(?, ?)", ^trunc_format, s.submitted_at),
        count: count(s.id)
      },
      order_by: [desc: fragment("DATE_TRUNC(?, ?)", ^trunc_format, s.submitted_at)],
      limit: ^limit

    Repo.all(query)
  end

  @doc """
  Get top performing forms for a user
  """
  def get_top_forms(user_id, opts \\ []) do
    metric = Keyword.get(opts, :metric, :submissions) # :submissions, :conversion_rate
    limit = Keyword.get(opts, :limit, 5)

    forms = Forms.Form.for_user(user_id)
    |> Ash.Query.load([:total_submissions, :conversion_rate])
    |> Ash.read!()

    forms
    |> Enum.sort_by(fn form ->
      case metric do
        :submissions -> form.total_submissions
        :conversion_rate -> Decimal.to_float(form.conversion_rate || Decimal.new(0))
      end
    end, :desc)
    |> Enum.take(limit)
  end

  @doc """
  Get lead source breakdown for a form
  """
  def get_lead_sources(form_id) do
    query = from s in "submissions",
      where: s.form_id == ^form_id,
      group_by: fragment("metadata->>'utm_source'"),
      select: %{
        source: fragment("metadata->>'utm_source'"),
        count: count(s.id)
      },
      order_by: [desc: count(s.id)]

    Repo.all(query)
  end

  @doc """
  Get field completion rates for a form
  """
  def get_field_completion_rates(form_id) do
    # Analyze submitted_data JSON to see which fields are most/least filled
    query = from s in "submissions",
      where: s.form_id == ^form_id,
      select: s.submitted_data

    submissions = Repo.all(query)

    # Count how many times each field appears
    field_counts = submissions
    |> Enum.reduce(%{}, fn data, acc ->
      Enum.reduce(data, acc, fn {field_name, value}, inner_acc ->
        if value != nil and value != "" do
          Map.update(inner_acc, field_name, 1, &(&1 + 1))
        else
          inner_acc
        end
      end)
    end)

    total_submissions = length(submissions)

    # Calculate completion rate for each field
    field_counts
    |> Enum.map(fn {field_name, count} ->
      %{
        field: field_name,
        completion_count: count,
        completion_rate: (count / total_submissions * 100) |> Float.round(1)
      }
    end)
    |> Enum.sort_by(& &1.completion_rate, :desc)
  end

  # Private helper functions

  defp count_total_forms(user_id) do
    Forms.Form.for_user(user_id)
    |> Ash.Query.filter(status != :archived)
    |> Ash.count!()
  end

  defp count_total_submissions(user_id) do
    query = from f in "forms",
      where: f.user_id == ^user_id,
      join: s in "submissions", on: s.form_id == f.id,
      select: count(s.id)

    Repo.one(query) || 0
  end

  defp count_active_users(user_id) do
    # Unique lead emails in last 30 days
    thirty_days_ago = DateTime.utc_now() |> DateTime.add(-30, :day)

    query = from f in "forms",
      where: f.user_id == ^user_id,
      join: s in "submissions", on: s.form_id == f.id,
      where: s.submitted_at >= ^thirty_days_ago,
      select: count(s.lead_email, :distinct)

    Repo.one(query) || 0
  end

  defp calculate_global_conversion_rate(user_id) do
    query = from f in "forms",
      where: f.user_id == ^user_id,
      select: %{
        total_views: sum(f.view_count),
        total_submissions: sum(f.submission_count)
      }

    case Repo.one(query) do
      %{total_views: views, total_submissions: subs} when views > 0 ->
        (subs / views * 100) |> Float.round(1)

      _ ->
        0.0
    end
  end

  defp calculate_forms_change(user_id) do
    # Compare current month to last month
    this_month = count_forms_in_period(user_id, :this_month)
    last_month = count_forms_in_period(user_id, :last_month)

    calculate_percent_change(this_month, last_month)
  end

  defp calculate_submissions_change(user_id) do
    this_month = count_submissions_in_period(user_id, :this_month)
    last_month = count_submissions_in_period(user_id, :last_month)

    calculate_percent_change(this_month, last_month)
  end

  defp calculate_active_users_change(user_id) do
    this_month = count_active_users_in_period(user_id, :this_month)
    last_month = count_active_users_in_period(user_id, :last_month)

    calculate_percent_change(this_month, last_month)
  end

  defp calculate_conversion_rate_change(user_id) do
    this_month_rate = calculate_conversion_rate_in_period(user_id, :this_month)
    last_month_rate = calculate_conversion_rate_in_period(user_id, :last_month)

    if last_month_rate > 0 do
      ((this_month_rate - last_month_rate) / last_month_rate * 100) |> Float.round(1)
    else
      0.0
    end
  end

  defp calculate_percent_change(current, previous) do
    if previous > 0 do
      ((current - previous) / previous * 100) |> Float.round(1)
    else
      0.0
    end
  end

  defp count_forms_in_period(user_id, period) do
    {start_date, end_date} = period_dates(period)

    query = from f in "forms",
      where: f.user_id == ^user_id,
      where: f.inserted_at >= ^start_date and f.inserted_at < ^end_date,
      select: count(f.id)

    Repo.one(query) || 0
  end

  defp count_submissions_in_period(user_id, period) do
    {start_date, end_date} = period_dates(period)

    query = from f in "forms",
      where: f.user_id == ^user_id,
      join: s in "submissions", on: s.form_id == f.id,
      where: s.submitted_at >= ^start_date and s.submitted_at < ^end_date,
      select: count(s.id)

    Repo.one(query) || 0
  end

  defp count_active_users_in_period(user_id, period) do
    {start_date, end_date} = period_dates(period)

    query = from f in "forms",
      where: f.user_id == ^user_id,
      join: s in "submissions", on: s.form_id == f.id,
      where: s.submitted_at >= ^start_date and s.submitted_at < ^end_date,
      select: count(s.lead_email, :distinct)

    Repo.one(query) || 0
  end

  defp calculate_conversion_rate_in_period(user_id, period) do
    # This is complex - would need to track views per period
    # For now, return 0 - implement later
    0.0
  end

  defp period_dates(:this_month) do
    start_date = Timex.beginning_of_month(DateTime.utc_now())
    end_date = DateTime.utc_now()
    {start_date, end_date}
  end

  defp period_dates(:last_month) do
    last_month = DateTime.utc_now() |> Timex.shift(months: -1)
    start_date = Timex.beginning_of_month(last_month)
    end_date = Timex.end_of_month(last_month)
    {start_date, end_date}
  end
end
```

### Analytics LiveView

**File:** `lib/clientt_crm_app_web/live/analytics_live/index.ex`

```elixir
defmodule ClienttCrmAppWeb.AnalyticsLive.Index do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Analytics

  @impl true
  def mount(_params, _session, socket) do
    user_id = socket.assigns.current_user.id

    socket =
      socket
      |> assign(:page_title, "Analytics")
      |> assign(:selected_period, :daily)
      |> load_analytics(user_id)

    {:ok, socket}
  end

  @impl true
  def handle_params(%{"form_id" => form_id}, _uri, socket) do
    socket =
      socket
      |> assign(:selected_form_id, form_id)
      |> load_form_analytics(form_id)

    {:noreply, socket}
  end

  def handle_params(_params, _uri, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("change_period", %{"period" => period}, socket) do
    period_atom = String.to_atom(period)

    socket =
      socket
      |> assign(:selected_period, period_atom)

    socket = if socket.assigns[:selected_form_id] do
      load_form_analytics(socket, socket.assigns.selected_form_id)
    else
      socket
    end

    {:noreply, socket}
  end

  defp load_analytics(socket, user_id) do
    kpis = Analytics.get_dashboard_kpis(user_id)
    top_forms = Analytics.get_top_forms(user_id, limit: 5)

    socket
    |> assign(:kpis, kpis)
    |> assign(:top_forms, top_forms)
  end

  defp load_form_analytics(socket, form_id) do
    period = socket.assigns.selected_period

    submissions_data = Analytics.get_submissions_over_time(
      form_id,
      period: period,
      limit: 30
    )

    lead_sources = Analytics.get_lead_sources(form_id)
    field_completion = Analytics.get_field_completion_rates(form_id)

    socket
    |> assign(:submissions_data, submissions_data)
    |> assign(:lead_sources, lead_sources)
    |> assign(:field_completion, field_completion)
  end
end
```

### Chart Components

Use a charting library like Contex or Chart.js via hooks.

**File:** `lib/clientt_crm_app_web/components/stats_chart.ex`

```elixir
defmodule ClienttCrmAppWeb.Components.StatsChart do
  use Phoenix.Component

  attr :data, :list, required: true
  attr :type, :atom, default: :line # :line, :bar, :pie
  attr :title, :string, default: ""
  attr :height, :integer, default: 300

  def stats_chart(assigns) do
    ~H"""
    <div class="bg-card rounded-2xl border p-6">
      <%= if @title != "" do %>
        <h3 class="text-lg font-semibold mb-4">{@title}</h3>
      <% end %>

      <div
        id={"chart-#{:erlang.phash2(@data)}"}
        phx-hook="Chart"
        phx-update="ignore"
        data-chart-type={@type}
        data-chart-data={Jason.encode!(@data)}
        style={"height: #{@height}px"}
      >
        <!-- Chart will be rendered here by JS hook -->
      </div>
    </div>
    """
  end
end
```

**File:** `assets/js/hooks/chart.js`

```javascript
import Chart from 'chart.js/auto'

export const ChartHook = {
  mounted() {
    const chartType = this.el.dataset.chartType
    const chartData = JSON.parse(this.el.dataset.chartData)

    this.chart = new Chart(this.el, {
      type: chartType,
      data: this.formatData(chartData),
      options: this.getOptions(chartType)
    })
  },

  updated() {
    const chartData = JSON.parse(this.el.dataset.chartData)
    this.chart.data = this.formatData(chartData)
    this.chart.update()
  },

  destroyed() {
    this.chart.destroy()
  },

  formatData(data) {
    // Transform data to Chart.js format
    return {
      labels: data.map(d => d.period || d.label),
      datasets: [{
        label: 'Submissions',
        data: data.map(d => d.count || d.value),
        borderColor: 'rgb(34, 120, 192)',
        backgroundColor: 'rgba(34, 120, 192, 0.1)',
        tension: 0.3
      }]
    }
  },

  getOptions(chartType) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType !== 'line'
        }
      },
      scales: chartType === 'pie' ? {} : {
        y: {
          beginAtZero: true
        }
      }
    }
  }
}
```

## Data Visualization

### Charts to Implement
1. **Submissions Over Time** - Line chart
2. **Lead Sources** - Pie or bar chart
3. **Field Completion Rates** - Horizontal bar chart
4. **Top Forms** - Bar chart
5. **Conversion Rate Trend** - Line chart

### KPI Cards
Reuse the `KpiCard` component from Track 2:

```heex
<.kpi_card
  title="Total Forms"
  value={@kpis.total_forms}
  change={format_change(@kpis.forms_change)}
  icon="hero-document-text"
/>
```

## Performance Optimization

### Caching
```elixir
# Cache dashboard KPIs for 5 minutes
def get_dashboard_kpis(user_id) do
  Cachex.fetch(:analytics_cache, "kpis:#{user_id}", fn ->
    {:commit, calculate_kpis(user_id), ttl: :timer.minutes(5)}
  end)
end
```

### Background Jobs
For expensive calculations, use Oban:

```elixir
defmodule ClienttCrmApp.Workers.AnalyticsWorker do
  use Oban.Worker, queue: :analytics

  @impl Oban.Worker
  def perform(%Job{args: %{"user_id" => user_id}}) do
    # Calculate and cache analytics
    kpis = ClienttCrmApp.Analytics.calculate_kpis(user_id)

    Cachex.put(:analytics_cache, "kpis:#{user_id}", kpis)

    :ok
  end
end

# Schedule hourly
Oban.insert!(AnalyticsWorker.new(%{user_id: user.id}, schedule_in: 3600))
```

## Testing

### Unit Tests
```elixir
defmodule ClienttCrmApp.AnalyticsTest do
  use ClienttCrmApp.DataCase
  alias ClienttCrmApp.Analytics

  describe "get_dashboard_kpis/1" do
    test "calculates correct KPIs" do
      user = user_fixture()
      form = form_fixture(user_id: user.id, view_count: 100, submission_count: 25)

      kpis = Analytics.get_dashboard_kpis(user.id)

      assert kpis.total_forms == 1
      assert kpis.total_submissions == 25
      assert kpis.conversion_rate == 25.0
    end
  end

  describe "get_submissions_over_time/2" do
    test "returns time-series data" do
      form = form_fixture()

      # Create submissions over several days
      Enum.each(1..7, fn days_ago ->
        submission_fixture(
          form_id: form.id,
          submitted_at: DateTime.utc_now() |> DateTime.add(-days_ago, :day)
        )
      end)

      data = Analytics.get_submissions_over_time(form.id, period: :daily, limit: 7)

      assert length(data) == 7
      assert Enum.all?(data, &Map.has_key?(&1, :period))
      assert Enum.all?(data, &Map.has_key?(&1, :count))
    end
  end
end
```

## Dependencies

Add to `mix.exs`:

```elixir
{:cachex, "~> 3.6"},
{:timex, "~> 3.7"}, # For date calculations
{:oban, "~> 2.15"} # For background jobs (if not already present)
```

## Next Steps

1. Implement Analytics module with calculation functions
2. Add Ash calculations to Form resource
3. Build Analytics LiveView page
4. Implement chart components
5. Add caching layer
6. Test with realistic data volumes
7. Optimize slow queries

---

**Status:** Detailed spec complete
**Dependencies:** Tracks 2, 3
**Estimated Time:** 1 week
