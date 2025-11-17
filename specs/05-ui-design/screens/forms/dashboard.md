# Forms Dashboard Screen

**Screen Name**: Forms Dashboard
**Route**: `/forms/dashboard` or `/forms`
**Domain**: Forms
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/pages/DashboardPage.tsx` (284 lines)

---

## Overview

The Forms Dashboard is the primary landing page for the Forms module, providing a high-level overview of form performance, submissions, and user engagement. It serves as the command center for form management with quick actions and AI-powered insights.

**Purpose**: Give users an at-a-glance view of their forms ecosystem and enable quick actions.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Global)                                          │
├─────┬───────────────────────────────────────────────────┤
│     │ Page Header                                        │
│  S  │ - Title: "Forms Dashboard"                         │
│  i  │ - Quick Actions: Create Form, AI Generate          │
│  d  ├────────────────────────────────────────────────────┤
│  e  │ KPI Cards (Grid: 4 columns)                        │
│  b  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  a  │ │Forms │ │Submis│ │Active│ │Conver│             │
│  r  │ │      │ │sions │ │Users │ │sion  │             │
│     │ └──────┘ └──────┘ └──────┘ └──────┘             │
│     ├────────────────────────────────────────────────────┤
│     │ Performance Chart                                  │
│     │ (Submissions over time - 7d/30d/90d)              │
│     ├────────────────────────────────────────────────────┤
│     │ AI Insights Cards (2-3 cards)                     │
│     │ - Smart recommendations                            │
│     │ - Anomaly detection                                │
│     ├────────────────────────────────────────────────────┤
│     │ Recent Forms Table                                 │
│     │ - Last 10 forms with quick actions                │
└─────┴───────────────────────────────────────────────────┘
```

**Container**: `max-width: 1200px`, centered with `32px` padding

---

## Components

### 1. Page Header

**Layout**: Flex container with space-between alignment

**Elements**:
- **Title**: "Forms Dashboard"
  - Typography: `text-[38px] font-bold` (from design-tokens.md)
  - Color: `base-content`
- **Subtitle**: "Monitor your form performance and submissions"
  - Typography: `text-sm text-muted-foreground`
- **Quick Actions**:
  - Primary Button: "Create Form" (primary gradient)
  - Secondary Button: "AI Generate" (accent gradient with sparkle icon)

**LiveView Implementation**:
```elixir
<div class="flex items-center justify-between mb-8">
  <div>
    <h1 class="text-[38px] font-bold">Forms Dashboard</h1>
    <p class="text-sm text-muted-foreground">Monitor your form performance and submissions</p>
  </div>
  <div class="flex gap-2">
    <.button variant="primary-gradient" phx-click="create_form">
      <.icon name="hero-plus" class="w-4 h-4 mr-2" />
      Create Form
    </.button>
    <.button variant="accent-gradient" phx-click="open_ai_assistant">
      <.icon name="hero-sparkles" class="w-4 h-4 mr-2" />
      AI Generate
    </.button>
  </div>
</div>
```

---

### 2. KPI Cards

**Layout**: Grid with 4 columns (`grid-cols-4 gap-6`)

**Card Structure** (each):
- Icon (gradient background circle)
- Metric value (large, bold)
- Metric label
- Trend indicator (+/- percentage)
- Clickable for detail modal

**KPI Metrics**:

1. **Total Forms**
   - Icon: FileText (Heroicon: `hero-document-text`)
   - Value: `156` (dynamic)
   - Trend: `+12.5%`
   - Click: Opens breakdown modal (Active/Draft/Paused)

2. **Total Submissions**
   - Icon: Send (Heroicon: `hero-paper-airplane`)
   - Value: `3,428`
   - Trend: `+18.2%`
   - Click: Opens submission breakdown by form

3. **Active Users**
   - Icon: Users (Heroicon: `hero-users`)
   - Value: `1,892`
   - Trend: `+24.6%`
   - Click: Opens user breakdown (New/Returning/Registered)

4. **Conversion Rate**
   - Icon: TrendingUp (Heroicon: `hero-arrow-trending-up`)
   - Value: `68.4%`
   - Trend: `+5.3%`
   - Click: Opens conversion funnel analysis

**Visual Design**:
- Card: White background, `rounded-2xl`, subtle shadow
- Icon container: 48px circle with gradient background
- Value: `text-3xl font-bold`
- Trend: Green (positive) or Red (negative)

**LiveView Implementation**:
```elixir
<div class="grid grid-cols-4 gap-6">
  <.kpi_card
    icon="hero-document-text"
    label="Total Forms"
    value={@metrics.total_forms}
    trend={@metrics.forms_trend}
    phx-click="open_kpi_detail"
    phx-value-type="forms"
  />
  <!-- Repeat for other KPIs -->
</div>
```

**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/KPICard.tsx`

---

### 3. Performance Chart

**Component**: PerformanceChart
**Chart Type**: Line chart (submissions over time)
**Time Ranges**: 7 days, 30 days, 90 days (tabs)
**Data Points**: Daily submission counts

**Features**:
- Interactive hover tooltips
- Time range selector (tabs)
- Gradient fill under line
- Responsive to container width

**Visual Design**:
- Container: White card, `rounded-2xl`, `p-6`
- Chart height: `300px`
- Primary color: `#2278c0` (from design-tokens.md)
- Grid lines: Light gray

**LiveView Implementation**:
```elixir
<.card class="p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold">Submission Performance</h3>
    <.tabs value={@chart_range}>
      <.tab value="7d">7 Days</.tab>
      <.tab value="30d">30 Days</.tab>
      <.tab value="90d">90 Days</.tab>
    </.tabs>
  </div>
  <div id="performance-chart" phx-hook="Chart" data-type="line" data-values={Jason.encode!(@chart_data)}>
  </div>
</.card>
```

**JavaScript Hook**: Use Phoenix Hooks with Chart.js for client-side rendering

**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/PerformanceChart.tsx`

---

### 4. AI Insights Cards

**Component**: AIInsightsCards
**Layout**: 2-3 cards in horizontal grid

**Insight Types**:
1. **Anomaly Detection**
   - "⚠️ Newsletter Signup saw 40% drop in submissions"
   - Action: "Investigate Form"

2. **Optimization Suggestion**
   - "💡 Consider removing 2 fields from Contact Us (high abandonment)"
   - Action: "View Analysis"

3. **Opportunity**
   - "📈 Demo Booking Form converting 85% on mobile - replicate pattern"
   - Action: "Learn More"

**Visual Design**:
- Card: Gradient border (subtle accent)
- Icon: Emoji or gradient icon
- Text: `text-sm`
- Action: Link button

**Future Scope**: Initially show "Coming Soon" placeholder with gradient accent

**LiveView Implementation**:
```elixir
<div class="grid grid-cols-2 gap-4 mb-6">
  <%= if @ai_insights_enabled do %>
    <%= for insight <- @ai_insights do %>
      <.ai_insight_card insight={insight} />
    <% end %>
  <% else %>
    <.coming_soon_card
      title="AI Insights"
      description="Smart recommendations powered by AI (Coming Soon)"
      icon="hero-sparkles"
    />
  <% end %>
</div>
```

**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/AIInsightsCards.tsx`

---

### 5. Recent Forms Table

**Component**: RecentFormsTable
**Rows**: Last 10 forms (sorted by updated_at)

**Columns**:
1. Form Name (with icon)
2. Status (badge: Draft/Published/Paused)
3. Submissions (count with trend)
4. Conversion Rate (percentage)
5. Last Updated (relative time)
6. Actions (Edit/Analytics/Archive)

**Visual Design**:
- Table: DaisyUI `table` with zebra striping
- Status badges: Colored (Green/Yellow/Gray)
- Actions: Icon buttons (hover reveal)

**Interactions**:
- Click row: Navigate to form builder
- Click actions: Dropdown menu
- Empty state: "No forms yet" with Create Form CTA

**LiveView Implementation**:
```elixir
<.card class="p-6">
  <h3 class="text-lg font-semibold mb-4">Recent Forms</h3>
  <.table rows={@recent_forms}>
    <:col :let={form} label="Form Name">
      <div class="flex items-center gap-2">
        <.icon name="hero-document-text" class="w-4 h-4" />
        <span class="font-medium">{form.name}</span>
      </div>
    </:col>
    <:col :let={form} label="Status">
      <.badge variant={form.status}>{form.status}</.badge>
    </:col>
    <:col :let={form} label="Submissions">
      {form.submissions_count}
      <span class="text-xs text-success">+{form.submissions_trend}%</span>
    </:col>
    <:col :let={form} label="Conversion">
      {form.conversion_rate}%
    </:col>
    <:col :let={form} label="Updated">
      {relative_time(form.updated_at)}
    </:col>
    <:action :let={form}>
      <.dropdown>
        <.dropdown_item phx-click="edit_form" phx-value-id={form.id}>Edit</.dropdown_item>
        <.dropdown_item phx-click="view_analytics" phx-value-id={form.id}>Analytics</.dropdown_item>
        <.dropdown_item phx-click="archive_form" phx-value-id={form.id}>Archive</.dropdown_item>
      </.dropdown>
    </:action>
  </.table>
</.card>
```

**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/RecentFormsTable.tsx`

---

## State Management

### LiveView Assigns

```elixir
@assigns = %{
  metrics: %{
    total_forms: 156,
    forms_trend: 12.5,
    total_submissions: 3428,
    submissions_trend: 18.2,
    active_users: 1892,
    users_trend: 24.6,
    conversion_rate: 68.4,
    conversion_trend: 5.3
  },
  chart_data: [...],
  chart_range: "30d",
  ai_insights: [...],
  ai_insights_enabled: false,
  recent_forms: [...],
  kpi_detail_modal: nil
}
```

### Events

- `create_form`: Navigate to form builder
- `open_ai_assistant`: Open AI assistant modal
- `open_kpi_detail`: Show KPI detail modal with type parameter
- `change_chart_range`: Update chart time range
- `edit_form`: Navigate to form builder with form ID
- `view_analytics`: Navigate to form analytics page
- `archive_form`: Archive form (with confirmation)

---

## Responsive Design

### Desktop (> 1024px)
- KPI cards: 4 columns
- AI insights: 2-3 cards horizontal
- Full table with all columns

### Tablet (640px - 1024px)
- KPI cards: 2 columns, 2 rows
- AI insights: 2 cards
- Table: Hide "Last Updated" column

### Mobile (< 640px)
- KPI cards: 1 column, stacked
- AI insights: 1 card vertical stack
- Table: Card-based layout (not table)

---

## Data Loading

### Initial Load
```elixir
def mount(_params, _session, socket) do
  socket =
    socket
    |> assign(:metrics, fetch_dashboard_metrics())
    |> assign(:chart_data, fetch_chart_data("30d"))
    |> assign(:recent_forms, fetch_recent_forms(limit: 10))
    |> assign(:ai_insights, [])

  {:ok, socket}
end
```

### Real-time Updates
- Subscribe to PubSub topic: `"forms:#{company_id}"`
- Update metrics on form submission events
- Update recent forms on form update/create events

---

## Accessibility

- **Keyboard Navigation**: All cards and table rows keyboard accessible
- **Screen Reader**: Proper ARIA labels on KPI cards, chart data tables
- **Focus Management**: Clear focus indicators on interactive elements
- **Color Contrast**: WCAG AA compliant (4.5:1 minimum)

---

## Empty States

### No Forms Created
```
┌─────────────────────────────────────┐
│   📄 No Forms Yet                    │
│                                      │
│   Create your first form to start   │
│   collecting submissions             │
│                                      │
│   [Create Form] [AI Generate]       │
└─────────────────────────────────────┘
```

### No Submissions
- KPI cards show "0" with neutral trend
- Chart shows empty state with prompt to share forms

---

## Related Patterns

- **KPI Card Pattern**: See `components/dashboard/kpi-card.md`
- **Analytics Charts**: See `patterns/analytics-dashboard.md`
- **Tables**: See `patterns/list-detail.md`

---

## Implementation Notes

### Phoenix LiveView Considerations
1. Use PubSub for real-time metric updates
2. Cache dashboard metrics (5-minute TTL)
3. Lazy load chart data on time range change
4. Preload recent forms with associations

### Performance
- Debounce chart range changes (300ms)
- Pagination for recent forms (show more button)
- Cache AI insights (if enabled)

### Future Enhancements
- Export dashboard as PDF
- Customizable KPI cards (drag to reorder)
- Date range picker for chart
- AI assistant integration

---

## Related Screens

- **Forms List**: `/forms/list` - Full forms management
- **Form Builder**: `/forms/:id/builder` - Edit/create forms
- **Form Analytics**: `/forms/:id/analytics` - Detailed analytics

---

**Domain Spec**: `specs/01-domains/forms/domain.md`
**Dev Plan**: `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/TRACK-02-SCREENS.md`
**Last Updated**: 2025-11-17
