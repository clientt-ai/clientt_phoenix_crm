# Notifications Screen

**Screen Name**: Notifications
**Route**: `/notifications` (global) or `/forms/notifications`
**Domain**: Cross-domain (Forms, Contacts, Calendar, etc.)
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/pages/NotificationsPage.tsx` (288 lines)

---

## Overview

The Notifications screen displays a centralized feed of system events, form submissions, milestones, and alerts. Users can filter, mark as read/unread, and delete notifications.

**Purpose**: Keep users informed of important events and activities across the CRM platform.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header (Global)                                          │
├─────┬───────────────────────────────────────────────────┤
│     │ Page Header                                        │
│  S  │ ┌─────────────────────────────────────────┐      │
│  i  │ │ Notifications  [Filter] [Mark All Read] │      │
│  d  │ └─────────────────────────────────────────┘      │
│  e  ├────────────────────────────────────────────────────┤
│  b  │ Filter Tabs                                        │
│  a  │ All | Unread | Form Submissions | Alerts          │
│  r  ├────────────────────────────────────────────────────┤
│     │ Notification List                                  │
│     │ ┌──────────────────────────────────────────────┐ │
│     │ │ 🔵 [Icon] New Form Submission      [×] [🗑]  │ │
│     │ │     Contact Us Form received...              │ │
│     │ │     2 minutes ago                            │ │
│     │ ├──────────────────────────────────────────────┤ │
│     │ │ 🔵 [Icon] Milestone Reached        [×] [🗑]  │ │
│     │ │     Newsletter Signup hit 1,000...          │ │
│     │ │     1 hour ago                               │ │
│     │ ├──────────────────────────────────────────────┤ │
│     │ │ ⚪ [Icon] Low Conversion Rate      [×] [🗑]  │ │
│     │ │     Quote Request form...          (read)    │ │
│     │ │     Yesterday                                │ │
│     │ └──────────────────────────────────────────────┘ │
└─────┴───────────────────────────────────────────────────┘
```

**Container**: `max-width: 800px`, centered with `32px` padding

---

## Components

### 1. Page Header

**Layout**: Flex container with space-between

**Elements**:
- **Title**: "Notifications"
  - Typography: `text-[38px] font-bold`
  - Icon: Bell (Heroicon: `hero-bell`)
- **Action Buttons**:
  - Filter Dropdown (optional, can use tabs instead)
  - "Mark All as Read" button
  - Settings icon (link to notification settings in Settings page)

**LiveView Implementation**:
```elixir
<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-3">
    <.icon name="hero-bell" class="w-8 h-8" />
    <h1 class="text-[38px] font-bold">Notifications</h1>
    <%= if @unread_count > 0 do %>
      <.badge variant="primary">{@unread_count} new</.badge>
    <% end %>
  </div>

  <div class="flex gap-2">
    <.button
      variant="outline"
      size="sm"
      phx-click="mark_all_read"
      disabled={@unread_count == 0}
    >
      <.icon name="hero-check-circle" class="w-4 h-4 mr-2" />
      Mark All Read
    </.button>
    <.button variant="ghost" size="sm" phx-click="navigate_to_settings">
      <.icon name="hero-cog-6-tooth" class="w-5 h-5" />
    </.button>
  </div>
</div>
```

---

### 2. Filter Tabs

**Component**: Tabs for filtering notification types

**Tabs**:
- **All**: Show all notifications (default)
- **Unread**: Only unread notifications
- **Form Submissions**: Form submission events
- **Milestones**: Achievement milestones
- **Alerts**: Warning and alert notifications

**LiveView Implementation**:
```elixir
<.tabs value={@active_filter} phx-change="change_filter" class="mb-6">
  <.tab value="all">
    All
    <%= if @total_count > 0 do %>
      <.badge variant="neutral" class="ml-2">{@total_count}</.badge>
    <% end %>
  </.tab>

  <.tab value="unread">
    Unread
    <%= if @unread_count > 0 do %>
      <.badge variant="primary" class="ml-2">{@unread_count}</.badge>
    <% end %>
  </.tab>

  <.tab value="form_submission">Form Submissions</.tab>
  <.tab value="milestone">Milestones</.tab>
  <.tab value="alert">Alerts</.tab>
</.tabs>
```

---

### 3. Notification List

**Component**: Scrollable list of notification cards

**Notification Types & Icons**:

1. **Form Submission**
   - Icon: FileText (Heroicon: `hero-document-text`)
   - Color: Blue (`primary`)
   - Example: "Contact Us Form received a new submission"

2. **Page Published**
   - Icon: Globe (Heroicon: `hero-globe-alt`)
   - Color: Green (`success`)
   - Example: "Product Launch 2024 is now live"

3. **Milestone**
   - Icon: TrendingUp (Heroicon: `hero-arrow-trending-up`)
   - Color: Purple (`accent`)
   - Example: "Newsletter Signup hit 1,000 submissions!"

4. **Alert**
   - Icon: AlertCircle (Heroicon: `hero-exclamation-circle`)
   - Color: Red/Orange (`warning` or `error`)
   - Example: "Quote Request form conversion dropped below 10%"

**Notification Card Structure**:
- Unread indicator (blue dot or highlighted background)
- Type icon (with colored background)
- Title (bold)
- Message (truncated if long)
- Timestamp (relative time)
- Actions: Mark as read/unread, Delete

**Visual Design**:
- Unread: White background with blue left border (4px)
- Read: Light gray background (`base-200`)
- Hover: Slight elevation shadow
- Card padding: `16px`
- Gap between cards: `8px`

**LiveView Implementation**:
```elixir
<div class="space-y-2">
  <%= for notification <- @notifications do %>
    <.notification_card
      notification={notification}
      on_mark_read="mark_read"
      on_delete="delete_notification"
    />
  <% end %>
</div>

<!-- Notification Card Component -->
<.card
  class={[
    "p-4 cursor-pointer transition-all hover:shadow-md",
    if(!@notification.is_read, do: "bg-white border-l-4 border-l-primary", else: "bg-base-200")
  ]}
  phx-click="view_notification"
  phx-value-id={@notification.id}
>
  <div class="flex items-start gap-4">
    <!-- Icon -->
    <div class={[
      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
      notification_icon_bg(@notification.type)
    ]}>
      <.icon name={notification_icon(@notification.type)} class="w-5 h-5 text-white" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <h3 class={[
            "text-sm",
            if(!@notification.is_read, do: "font-semibold", else: "font-normal")
          ]}>
            {@notification.title}
          </h3>
          <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
            {@notification.message}
          </p>
          <p class="text-xs text-muted-foreground mt-2">
            {relative_time(@notification.inserted_at)}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-1">
          <.button
            variant="ghost"
            size="sm"
            phx-click="toggle_read"
            phx-value-id={@notification.id}
            title={if @notification.is_read, do: "Mark as unread", else: "Mark as read"}
          >
            <.icon
              name={if @notification.is_read, do: "hero-envelope", else: "hero-envelope-open"}
              class="w-4 h-4"
            />
          </.button>

          <.button
            variant="ghost"
            size="sm"
            phx-click="delete_notification"
            phx-value-id={@notification.id}
            title="Delete"
            class="text-error hover:text-error"
          >
            <.icon name="hero-trash" class="w-4 h-4" />
          </.button>
        </div>
      </div>
    </div>
  </div>
</.card>
```

---

### 4. Notification Detail Modal (Optional)

**Trigger**: Click on notification card

**Content**:
- Full notification details
- Related form/page link
- Quick actions based on type
- Mark as read button

**LiveView Implementation**:
```elixir
<.modal show={@selected_notification != nil} on_close="close_notification_detail">
  <:title>{@selected_notification.title}</:title>
  <p class="text-sm text-muted-foreground mb-4">
    {relative_time(@selected_notification.inserted_at)}
  </p>
  <p>{@selected_notification.message}</p>

  <%= if @selected_notification.related_url do %>
    <div class="mt-4">
      <.button variant="primary" phx-click="navigate_to" phx-value-url={@selected_notification.related_url}>
        View Details
      </.button>
    </div>
  <% end %>
</.modal>
```

---

## State Management

### LiveView Assigns

```elixir
@assigns = %{
  notifications: [...],
  active_filter: "all",
  unread_count: 5,
  total_count: 24,
  selected_notification: nil,
  page: 1,
  per_page: 20,
  has_more: true
}
```

### Events

- `change_filter`: Switch filter tab
- `mark_all_read`: Mark all notifications as read
- `mark_read`: Mark single notification as read
- `toggle_read`: Toggle read/unread status
- `delete_notification`: Delete notification (with confirmation)
- `view_notification`: Open notification detail
- `navigate_to`: Navigate to related resource
- `load_more`: Load next page (infinite scroll)

---

## Data Loading

### Initial Load
```elixir
def mount(_params, _session, socket) do
  socket =
    socket
    |> assign(:active_filter, "all")
    |> assign(:page, 1)
    |> load_notifications()
    |> assign(:unread_count, count_unread_notifications())

  {:ok, socket}
end

defp load_notifications(socket) do
  notifications =
    Notification
    |> filter_by_type(socket.assigns.active_filter)
    |> order_by(desc: :inserted_at)
    |> limit(20)
    |> Repo.all()

  assign(socket, notifications: notifications)
end
```

### Real-time Updates
```elixir
def handle_info({:new_notification, notification}, socket) do
  # Prepend new notification to list
  notifications = [notification | socket.assigns.notifications]
  unread_count = socket.assigns.unread_count + 1

  socket =
    socket
    |> assign(:notifications, notifications)
    |> assign(:unread_count, unread_count)
    |> push_event("toast", %{message: notification.title, type: "info"})

  {:noreply, socket}
end
```

### PubSub Subscription
```elixir
# Subscribe to notifications channel
Phoenix.PubSub.subscribe(MyApp.PubSub, "notifications:#{user_id}")
```

---

## Notification Types Configuration

### Helper Functions
```elixir
defp notification_icon(type) do
  case type do
    :form_submission -> "hero-document-text"
    :page_published -> "hero-globe-alt"
    :milestone -> "hero-arrow-trending-up"
    :alert -> "hero-exclamation-circle"
  end
end

defp notification_icon_bg(type) do
  case type do
    :form_submission -> "bg-primary"
    :page_published -> "bg-success"
    :milestone -> "bg-accent"
    :alert -> "bg-warning"
  end
end
```

---

## Responsive Design

### Desktop (> 1024px)
- Max width: `800px`
- All actions visible
- Hover effects on cards

### Tablet (640px - 1024px)
- Full width with padding
- All features visible

### Mobile (< 640px)
- Full width
- Stack tabs vertically or use dropdown
- Swipe to delete gesture
- Simplified actions (show on row expansion)

---

## Pagination & Infinite Scroll

**Strategy**: Infinite scroll with "Load More" button fallback

**LiveView Implementation**:
```elixir
<!-- Infinite scroll hook -->
<div
  id="notifications-list"
  phx-hook="InfiniteScroll"
  phx-update="append"
  class="space-y-2"
>
  <%= for notification <- @notifications do %>
    <div id={"notification-#{notification.id}"}>
      <.notification_card notification={notification} />
    </div>
  <% end %>
</div>

<%= if @has_more do %>
  <div class="text-center mt-4">
    <.button
      variant="outline"
      phx-click="load_more"
      disabled={@loading}
    >
      {if @loading, do: "Loading...", else: "Load More"}
    </.button>
  </div>
<% end %>
```

---

## Accessibility

- **Keyboard Navigation**: Arrow keys to navigate notifications
- **Screen Reader**: Announce unread count, notification types
- **Focus Management**: Clear focus indicators
- **ARIA Live Region**: Announce new notifications

**Implementation**:
```elixir
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {if @unread_count > 0, do: "#{@unread_count} unread notifications"}
</div>
```

---

## Empty States

### No Notifications
```
┌─────────────────────────────────────┐
│   🔔 No Notifications                │
│                                      │
│   You're all caught up!              │
│   We'll notify you of important     │
│   events here.                       │
└─────────────────────────────────────┘
```

### No Unread Notifications
```
┌─────────────────────────────────────┐
│   ✓ All Caught Up!                   │
│                                      │
│   No unread notifications            │
└─────────────────────────────────────┘
```

---

## Notification Settings

**Location**: Settings → Notifications tab

**Options**:
- Email notifications (on/off by type)
- In-app notifications (on/off by type)
- Notification frequency (real-time, daily digest, weekly digest)
- Quiet hours

**Reference**: See `screens/forms/settings.md` → Notifications tab

---

## Related Patterns

- **Notification Badge**: Header bell icon with count badge
- **Toast Notifications**: Temporary in-app notifications
- **Real-time Updates**: PubSub for instant notifications

---

## Implementation Notes

### Phoenix LiveView Considerations
1. Subscribe to PubSub topic for real-time notifications
2. Use `phx-update="append"` for infinite scroll
3. Debounce mark as read actions (avoid race conditions)
4. Broadcast notifications across user sessions

### Performance
- Lazy load older notifications
- Cache unread count
- Index notifications by user_id, is_read, type
- Archive old notifications (>30 days)

### Future Enhancements
- Push notifications (browser API)
- Notification preferences per form
- Bulk actions (delete all read, archive all)
- Notification search
- Grouped notifications (e.g., "5 new form submissions")

---

## Related Screens

- **Settings**: `/settings/notifications` - Notification preferences
- **Dashboard**: `/forms/dashboard` - Notification bell in header

---

**Domain Spec**: `specs/01-domains/forms/notification.md`
**Dev Plan**: `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/TRACK-02-SCREENS.md`
**Last Updated**: 2025-11-17
