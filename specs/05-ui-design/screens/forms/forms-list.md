# Forms List Screen

**Screen Name**: Forms List
**Route**: `/forms/list`
**Domain**: Forms
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/pages/FormsPage.tsx` (786 lines)

---

## Overview

The Forms List screen provides a comprehensive view of all forms with advanced filtering, sorting, and bulk actions. It's the main management interface for forms, offering quick access to edit, analytics, and status management.

**Purpose**: Enable users to view, search, filter, and manage all forms in one centralized location.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Global)                                          │
├─────┬───────────────────────────────────────────────────┤
│     │ Page Header + Actions                              │
│  S  │ ┌────────────┐  ┌───────┐  ┌───────┐            │
│  i  │ │ Search Box │  │Filter │  │ Sort  │ [+ Create] │
│  d  ├────────────────────────────────────────────────────┤
│  e  │ KPI Summary Cards (4 cards, condensed)            │
│  b  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  a  │ │Total │ │Active│ │Draft │ │Paused│             │
│  r  │ └──────┘ └──────┘ └──────┘ └──────┘             │
│     ├────────────────────────────────────────────────────┤
│     │ Tabs: All | Active | Draft | Paused | Archived   │
│     ├────────────────────────────────────────────────────┤
│     │ Forms Table                                        │
│     │ ┌─────────────────────────────────────────────┐  │
│     │ │ Name | Status | Submis. | Calendar | ... │    │
│     │ │ ─────────────────────────────────────────── │  │
│     │ │ [ Row with hover actions ]                  │  │
│     │ │ [ Row with hover actions ]                  │  │
│     │ └─────────────────────────────────────────────┘  │
│     ├────────────────────────────────────────────────────┤
│     │ Pagination (10/25/50 per page)                    │
└─────┴───────────────────────────────────────────────────┘
```

**Container**: `max-width: 1200px`, centered with `32px` padding

---

## Components

### 1. Page Header & Search

**Layout**: Flex container with space-between

**Elements**:
- **Title**: "All Forms"
  - Typography: `text-[38px] font-bold`
- **Search Bar**:
  - Input with search icon (Heroicon: `hero-magnifying-glass`)
  - Placeholder: "Search forms..."
  - Width: `400px`
  - Debounced search (300ms)
- **Filter Button**: Opens filter dropdown
  - Options: Status, Date Range, Calendar Sync
- **Sort Dropdown**:
  - Options: Name (A-Z), Recent, Submissions, Conversion
- **Create Form Button**: Primary gradient button

**LiveView Implementation**:
```elixir
<div class="flex items-center justify-between mb-6">
  <h1 class="text-[38px] font-bold">All Forms</h1>
  <div class="flex gap-3">
    <form phx-change="search" phx-submit="search">
      <.input
        type="search"
        name="query"
        value={@search_query}
        placeholder="Search forms..."
        class="w-[400px]"
      >
        <:leading_icon><.icon name="hero-magnifying-glass" /></:leading_icon>
      </.input>
    </form>

    <.dropdown>
      <:trigger><.button variant="outline">Filter</.button></:trigger>
      <.dropdown_item phx-click="filter" phx-value-status="active">Active</.dropdown_item>
      <.dropdown_item phx-click="filter" phx-value-status="draft">Draft</.dropdown_item>
      <.dropdown_item phx-click="filter" phx-value-status="paused">Paused</.dropdown_item>
    </.dropdown>

    <.dropdown>
      <:trigger><.button variant="outline">Sort</.button></:trigger>
      <.dropdown_item phx-click="sort" phx-value-by="name">Name (A-Z)</.dropdown_item>
      <.dropdown_item phx-click="sort" phx-value-by="recent">Most Recent</.dropdown_item>
      <.dropdown_item phx-click="sort" phx-value-by="submissions">Most Submissions</.dropdown_item>
    </.dropdown>

    <.button variant="primary-gradient" phx-click="create_form">
      <.icon name="hero-plus" class="w-4 h-4 mr-2" />
      Create Form
    </.button>
  </div>
</div>
```

---

### 2. KPI Summary Cards

**Layout**: Grid with 4 columns, condensed version

**Cards**:
1. **Total Forms**: Count of all forms (156)
2. **Active Forms**: Count of published forms (130)
3. **Draft Forms**: Count of draft forms (18)
4. **Paused Forms**: Count of paused forms (8)

**Visual Design**:
- Smaller than dashboard KPI cards
- Icon + value + label only (no trend)
- Clickable to filter table by status

**LiveView Implementation**:
```elixir
<div class="grid grid-cols-4 gap-4 mb-6">
  <.kpi_summary_card
    label="Total Forms"
    value={@total_forms}
    icon="hero-document-text"
    phx-click="filter_by_status"
    phx-value-status="all"
  />
  <.kpi_summary_card
    label="Active"
    value={@active_forms}
    icon="hero-check-circle"
    color="success"
    phx-click="filter_by_status"
    phx-value-status="active"
  />
  <.kpi_summary_card
    label="Draft"
    value={@draft_forms}
    icon="hero-pencil-square"
    color="warning"
    phx-click="filter_by_status"
    phx-value-status="draft"
  />
  <.kpi_summary_card
    label="Paused"
    value={@paused_forms}
    icon="hero-pause-circle"
    color="neutral"
    phx-click="filter_by_status"
    phx-value-status="paused"
  />
</div>
```

---

### 3. Status Tabs

**Component**: Tabs for quick status filtering
**Layout**: Horizontal tabs

**Tabs**:
- All (default)
- Active
- Draft
- Paused
- Archived

**LiveView Implementation**:
```elixir
<.tabs value={@active_tab} phx-change="change_tab">
  <.tab value="all">All</.tab>
  <.tab value="active">Active</.tab>
  <.tab value="draft">Draft</.tab>
  <.tab value="paused">Paused</.tab>
  <.tab value="archived">Archived</.tab>
</.tabs>
```

---

### 4. Forms Table

**Component**: Sortable, filterable table

**Columns**:

1. **Form Name** (Sortable)
   - Icon (document icon)
   - Form name (link to builder)
   - Calendar sync indicator (if enabled)

2. **Status** (Filterable)
   - Badge: Active (green), Draft (yellow), Paused (gray), Archived (red)

3. **Submissions** (Sortable)
   - Count with trend indicator
   - Example: `892 (+12%)`

4. **Calendar Bookings** (Sortable)
   - Count (only if calendar sync enabled)
   - Shows `-` if not enabled

5. **Conversion Rate** (Sortable)
   - Percentage (only for forms with demo/calendar)
   - Shows `-` if not applicable

6. **Date Created** (Sortable)
   - Formatted date: "Oct 15, 2025"

7. **Last Edited** (Sortable)
   - Relative time: "2 hours ago"

8. **Actions**
   - Dropdown menu (3-dot icon)
   - Options: Edit, Duplicate, Analytics, Pause/Resume, Archive, Delete

**Visual Design**:
- Table: DaisyUI `table table-zebra`
- Hover: Row highlight with actions reveal
- Sorting: Column headers with sort indicator icons
- Empty state: "No forms found" with Create Form CTA

**Row Interactions**:
- Click anywhere: Navigate to form builder
- Click actions dropdown: Show action menu
- Hover: Highlight row and show quick actions

**LiveView Implementation**:
```elixir
<.table
  rows={@forms}
  row_click={fn form -> "navigate_to_builder", form.id end}
  sortable={true}
>
  <:col :let={form} label="Form Name" sortable={true} sort_by={:name}>
    <div class="flex items-center gap-2">
      <.icon name="hero-document-text" class="w-4 h-4 text-muted-foreground" />
      <span class="font-medium">{form.name}</span>
      <%= if form.calendar_sync do %>
        <.icon name="hero-calendar" class="w-3 h-3 text-primary" />
      <% end %>
    </div>
  </:col>

  <:col :let={form} label="Status" sortable={true} sort_by={:status}>
    <.badge variant={status_variant(form.status)}>{form.status}</.badge>
  </:col>

  <:col :let={form} label="Submissions" sortable={true} sort_by={:submissions}>
    <div class="flex items-center gap-1">
      <span>{form.submissions}</span>
      <%= if form.submissions_trend > 0 do %>
        <span class="text-xs text-success">+{form.submissions_trend}%</span>
      <% end %>
    </div>
  </:col>

  <:col :let={form} label="Calendar Bookings" sortable={true} sort_by={:calendar_bookings}>
    {if form.calendar_sync, do: form.calendar_bookings, else: "-"}
  </:col>

  <:col :let={form} label="Conversion" sortable={true} sort_by={:conversion_rate}>
    {if form.conversion_rate, do: "#{form.conversion_rate}%", else: "-"}
  </:col>

  <:col :let={form} label="Created" sortable={true} sort_by={:inserted_at}>
    {format_date(form.inserted_at)}
  </:col>

  <:col :let={form} label="Last Edited" sortable={true} sort_by={:updated_at}>
    {relative_time(form.updated_at)}
  </:col>

  <:action :let={form}>
    <.dropdown>
      <:trigger><.icon name="hero-ellipsis-vertical" /></:trigger>
      <.dropdown_item phx-click="edit_form" phx-value-id={form.id}>
        <.icon name="hero-pencil" class="w-4 h-4 mr-2" />Edit
      </.dropdown_item>
      <.dropdown_item phx-click="duplicate_form" phx-value-id={form.id}>
        <.icon name="hero-document-duplicate" class="w-4 h-4 mr-2" />Duplicate
      </.dropdown_item>
      <.dropdown_item phx-click="view_analytics" phx-value-id={form.id}>
        <.icon name="hero-chart-bar" class="w-4 h-4 mr-2" />Analytics
      </.dropdown_item>
      <.dropdown_separator />
      <.dropdown_item phx-click="toggle_status" phx-value-id={form.id}>
        <.icon name={if form.status == "paused", do: "hero-play", else: "hero-pause"} class="w-4 h-4 mr-2" />
        {if form.status == "paused", do: "Resume", else: "Pause"}
      </.dropdown_item>
      <.dropdown_item phx-click="archive_form" phx-value-id={form.id}>
        <.icon name="hero-archive-box" class="w-4 h-4 mr-2" />Archive
      </.dropdown_item>
      <.dropdown_separator />
      <.dropdown_item phx-click="delete_form" phx-value-id={form.id} class="text-error">
        <.icon name="hero-trash" class="w-4 h-4 mr-2" />Delete
      </.dropdown_item>
    </.dropdown>
  </:action>
</.table>
```

---

### 5. Bulk Actions

**Feature**: Select multiple forms for bulk operations

**Actions**:
- Publish selected
- Pause selected
- Archive selected
- Delete selected

**UI**: Checkbox in first column, sticky action bar appears when rows selected

**LiveView Implementation**:
```elixir
<%= if Enum.any?(@selected_forms) do %>
  <div class="sticky bottom-0 bg-primary text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
    <span>{length(@selected_forms)} forms selected</span>
    <div class="flex gap-2">
      <.button variant="outline-white" phx-click="bulk_publish">Publish</.button>
      <.button variant="outline-white" phx-click="bulk_pause">Pause</.button>
      <.button variant="outline-white" phx-click="bulk_archive">Archive</.button>
      <.button variant="outline-white" phx-click="bulk_delete" class="text-error">Delete</.button>
    </div>
  </div>
<% end %>
```

---

### 6. Pagination

**Component**: Pagination controls
**Options**: 10, 25, 50, 100 items per page
**Display**: "Showing 1-10 of 156"

**LiveView Implementation**:
```elixir
<div class="flex items-center justify-between mt-4">
  <div class="flex items-center gap-2">
    <span class="text-sm text-muted-foreground">Show</span>
    <.select value={@per_page} phx-change="change_per_page">
      <option value="10">10</option>
      <option value="25">25</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </.select>
    <span class="text-sm text-muted-foreground">per page</span>
  </div>

  <div class="flex items-center gap-2">
    <span class="text-sm text-muted-foreground">
      Showing {@offset + 1}-{min(@offset + @per_page, @total_count)} of {@total_count}
    </span>
    <.button
      variant="outline"
      size="sm"
      disabled={@page == 1}
      phx-click="prev_page"
    >
      <.icon name="hero-chevron-left" />
    </.button>
    <.button
      variant="outline"
      size="sm"
      disabled={@page >= @total_pages}
      phx-click="next_page"
    >
      <.icon name="hero-chevron-right" />
    </.button>
  </div>
</div>
```

---

## State Management

### LiveView Assigns

```elixir
@assigns = %{
  forms: [...],
  total_forms: 156,
  active_forms: 130,
  draft_forms: 18,
  paused_forms: 8,
  search_query: "",
  active_tab: "all",
  filter: %{status: nil, date_range: nil},
  sort_by: :updated_at,
  sort_order: :desc,
  page: 1,
  per_page: 25,
  total_count: 156,
  total_pages: 7,
  selected_forms: []
}
```

### Events

- `search`: Filter forms by search query
- `filter`: Apply status/date filter
- `sort`: Change sort column and order
- `change_tab`: Switch status tab
- `change_per_page`: Update pagination limit
- `prev_page` / `next_page`: Navigate pages
- `create_form`: Navigate to form builder
- `edit_form`: Navigate to form builder with ID
- `duplicate_form`: Duplicate form (with confirmation)
- `view_analytics`: Navigate to analytics page
- `toggle_status`: Pause/resume form
- `archive_form`: Archive form
- `delete_form`: Delete form (with confirmation)
- `bulk_*`: Bulk actions on selected forms

---

## Responsive Design

### Desktop (> 1024px)
- All columns visible
- Search bar: 400px width
- KPI cards: 4 columns

### Tablet (640px - 1024px)
- Hide "Date Created" and "Calendar Bookings" columns
- Search bar: Full width
- KPI cards: 2 columns, 2 rows

### Mobile (< 640px)
- Card-based layout (no table)
- Each form as a card with key info
- Swipe actions for quick operations
- Stack search and filters vertically

---

## Data Loading & Performance

### Initial Load
```elixir
def mount(_params, _session, socket) do
  socket =
    socket
    |> assign(:page, 1)
    |> assign(:per_page, 25)
    |> assign(:sort_by, :updated_at)
    |> assign(:search_query, "")
    |> load_forms()

  {:ok, socket}
end

defp load_forms(socket) do
  query =
    Form
    |> filter_by_status(socket.assigns.active_tab)
    |> filter_by_search(socket.assigns.search_query)
    |> sort_by(socket.assigns.sort_by, socket.assigns.sort_order)

  forms = Repo.paginate(query, page: socket.assigns.page, per_page: socket.assigns.per_page)

  assign(socket, forms: forms.entries, total_count: forms.total_entries)
end
```

### Real-time Updates
- Subscribe to PubSub: `"forms:#{company_id}"`
- Update list on form create/update/delete events
- Optimistic updates for status changes

---

## Accessibility

- **Keyboard Navigation**: Full keyboard support for table, filters, sorting
- **Screen Reader**: Proper table headers, status announcements
- **Focus Management**: Clear focus indicators
- **ARIA Labels**: All icons and actions properly labeled

---

## Empty States

### No Forms
```
┌─────────────────────────────────────┐
│   📄 No Forms Yet                    │
│                                      │
│   Get started by creating your      │
│   first form                         │
│                                      │
│   [Create Form] [AI Generate]       │
└─────────────────────────────────────┘
```

### No Search Results
```
No forms found matching "search term"
Clear search to see all forms
```

---

## Related Patterns

- **List-Detail Pattern**: See `patterns/list-detail.md`
- **Sortable Tables**: See `patterns/sortable-tables.md`
- **Bulk Actions**: See `patterns/bulk-actions.md`

---

## Implementation Notes

### Phoenix LiveView Considerations
1. Use `Phoenix.LiveView.Stream` for efficient table updates
2. Debounce search input (300ms)
3. Cache filter/sort state in session
4. Preload associations for better performance

### Performance
- Pagination required for large form lists
- Index database columns: name, status, updated_at, submissions
- Use `Repo.paginate` from Scrivener

### Future Enhancements
- Saved filters/views
- Column customization (show/hide)
- Export to CSV/Excel
- Inline editing for form names
- Drag-to-reorder (with saved order)

---

## Related Screens

- **Dashboard**: `/forms/dashboard` - Overview metrics
- **Form Builder**: `/forms/:id/builder` - Edit specific form
- **Form Analytics**: `/forms/:id/analytics` - Form-specific analytics

---

**Domain Spec**: `specs/01-domains/forms/domain.md`
**Dev Plan**: `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/TRACK-02-SCREENS.md`
**Last Updated**: 2025-11-17
