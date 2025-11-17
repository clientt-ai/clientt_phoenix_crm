# Header Component

**Category**: Layout
**Status**: ✅ Specified
**Figma Reference**: `figma_src/205 Forms Dashboard/src/components/Header.tsx` (62 lines)

---

## Overview

The Header is a fixed-position navigation bar at the top of the application, containing the sidebar toggle, global search, theme toggle, notifications, and user profile menu. It adapts its position based on sidebar state.

**Purpose**: Provide consistent global navigation and quick access to search, notifications, and user actions.

**Used In**: All pages across the application

---

## Visual Design

### Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│ [☰] [Search...                  ]  [🌙] [🔔 3] [👤 User ▼]   │
└────────────────────────────────────────────────────────────────┘
```

### Dimensions
- **Height**: `64px` fixed (Tailwind: `h-16`)
- **Width**: Dynamic based on sidebar state
  - Sidebar open: `left-64` (starts at 256px from left)
  - Sidebar closed: `left-0` (full width)
- **Padding**: Horizontal `24px` (Tailwind: `px-6`)
- **Z-index**: `z-30` (above content, below modals)

### Positioning
- **Fixed**: Top of viewport
- **Transition**: `300ms` smooth transition on sidebar toggle

---

## Layout Sections

### 1. Left Section (Sidebar Toggle + Search)

**Components**:
- **Menu Toggle Button**
  - Icon: Menu (Heroicon: `hero-bars-3`)
  - Padding: `8px` (`p-2`)
  - Hover: Gray background (`hover:bg-base-200`)
  - ARIA label: "Toggle sidebar"

- **Global Search**
  - Max width: `xl` (576px)
  - Flex: `flex-1`
  - Component: `<GlobalSearch />`

### 2. Right Section (Actions)

**Components** (left to right):
1. **Theme Toggle**
   - Sun/Moon icon toggle
   - Component: `<ThemeToggle />`

2. **Notifications Dropdown**
   - Bell icon with badge (unread count)
   - Component: `<NotificationsDropdown />`

3. **Profile Dropdown**
   - Avatar with user name
   - Chevron down icon
   - Component: `<ProfileDropdown />`

**Spacing**: `gap-2` (8px between items)

---

## Props/Assigns

```elixir
@assigns = %{
  # Sidebar state
  sidebar_open: boolean(),      # true/false

  # Search
  search_query: String.t(),     # Current search value

  # User info
  current_user: %User{},        # User struct
  unread_notifications: integer(), # Unread count

  # Callbacks
  # (handled via phx-click events)
}
```

---

## States

### Default
- White/card background
- Bottom border visible
- All actions clickable

### Sidebar Open
- Left margin: `256px` (`left-64`)
- Smooth `300ms` transition

### Sidebar Closed
- Left margin: `0` (`left-0`)
- Full width

### Scrolled (Optional)
- Enhanced shadow when page scrolled
- Backdrop blur effect

---

## LiveView Implementation

### Component Definition

```elixir
defmodule ClienttCrmAppWeb.Layouts do
  use ClienttCrmAppWeb, :html
  import ClienttCrmAppWeb.CoreComponents

  @doc """
  Renders the main application header with navigation and actions.
  """
  attr :current_user, :map, required: true
  attr :sidebar_open, :boolean, default: true
  attr :search_query, :string, default: ""
  attr :unread_notifications, :integer, default: 0

  def header(assigns) do
    ~H"""
    <header class={[
      "h-16 bg-base-100 border-b border-base-300 fixed top-0 right-0 z-30",
      "transition-all duration-300",
      @sidebar_open && "left-64" || "left-0"
    ]}>
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Left Section -->
        <div class="flex items-center gap-4 flex-1 max-w-xl">
          <!-- Sidebar Toggle -->
          <button
            phx-click="toggle_sidebar"
            class="p-2 rounded-lg hover:bg-base-200 transition-colors"
            aria-label="Toggle sidebar"
          >
            <.icon name="hero-bars-3" class="w-5 h-5 text-base-content/60" />
          </button>

          <!-- Global Search -->
          <.global_search query={@search_query} />
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Theme Toggle -->
          <.theme_toggle />

          <!-- Notifications -->
          <.notifications_dropdown count={@unread_notifications} />

          <!-- Profile Dropdown -->
          <.profile_dropdown user={@current_user} />
        </div>
      </div>
    </header>
    """
  end
end
```

### Integration in Root Layout

```elixir
# lib/clientt_crm_app_web/components/layouts/root.html.heex

<div class="min-h-screen bg-base-200">
  <!-- Sidebar -->
  <.sidebar
    current_page={@current_page}
    open={@sidebar_open}
  />

  <!-- Main Content -->
  <div class={[
    "transition-all duration-300",
    @sidebar_open && "ml-64" || "ml-0"
  ]}>
    <!-- Header -->
    <.header
      current_user={@current_user}
      sidebar_open={@sidebar_open}
      search_query={@search_query}
      unread_notifications={@unread_notifications}
    />

    <!-- Page Content -->
    <main class="pt-16 p-8">
      <%= @inner_content %>
    </main>
  </div>
</div>
```

---

## Sub-Components

### Global Search Component

```elixir
attr :query, :string, default: ""

def global_search(assigns) do
  ~H"""
  <form phx-change="search" phx-submit="search" class="flex-1 max-w-xl">
    <div class="relative">
      <.icon
        name="hero-magnifying-glass"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40"
      />
      <input
        type="search"
        name="q"
        value={@query}
        placeholder="Search forms, contacts, settings..."
        class="input input-bordered w-full pl-10"
        autocomplete="off"
      />
    </div>
  </form>
  """
end
```

### Theme Toggle Component

```elixir
def theme_toggle(assigns) do
  ~H"""
  <button
    phx-click="toggle_theme"
    class="btn btn-ghost btn-circle"
    aria-label="Toggle theme"
  >
    <!-- Sun icon (visible in dark mode) -->
    <.icon name="hero-sun" class="w-5 h-5 hidden dark:block" />
    <!-- Moon icon (visible in light mode) -->
    <.icon name="hero-moon" class="w-5 h-5 dark:hidden" />
  </button>
  """
end
```

### Notifications Dropdown Component

```elixir
attr :count, :integer, default: 0

def notifications_dropdown(assigns) do
  ~H"""
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle">
      <div class="indicator">
        <.icon name="hero-bell" class="w-5 h-5" />
        <%= if @count > 0 do %>
          <span class="badge badge-sm badge-primary indicator-item">
            {@count}
          </span>
        <% end %>
      </div>
    </label>
    <div
      tabindex="0"
      class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-80 mt-3 border border-base-300"
    >
      <div class="px-4 py-3 border-b border-base-300">
        <h3 class="font-semibold">Notifications</h3>
      </div>
      <!-- Notification list (simplified) -->
      <div class="max-h-96 overflow-y-auto">
        <%= if @count > 0 do %>
          <!-- Show notifications -->
          <.notification_item
            title="New form submission"
            message="Contact Us form received a new submission"
            time="2 minutes ago"
          />
        <% else %>
          <div class="p-8 text-center text-base-content/60">
            <p class="text-sm">No new notifications</p>
          </div>
        <% end %>
      </div>
      <div class="border-t border-base-300 p-2">
        <.link navigate="/notifications" class="btn btn-sm btn-ghost w-full">
          View All
        </.link>
      </div>
    </div>
  </div>
  """
end
```

### Profile Dropdown Component

```elixir
attr :user, :map, required: true

def profile_dropdown(assigns) do
  ~H"""
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="btn btn-ghost gap-2">
      <.avatar user={@user} size="sm" />
      <span class="hidden lg:inline">{@user.name}</span>
      <.icon name="hero-chevron-down" class="w-4 h-4" />
    </label>
    <ul
      tabindex="0"
      class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 border border-base-300"
    >
      <li class="menu-title px-4 py-2">
        <div>
          <p class="font-semibold text-sm">{@user.name}</p>
          <p class="text-xs text-base-content/60">{@user.email}</p>
        </div>
      </li>
      <div class="divider my-0"></div>
      <li>
        <.link navigate="/settings">
          <.icon name="hero-cog-6-tooth" class="w-4 h-4" />
          Settings
        </.link>
      </li>
      <li>
        <a href="/support">
          <.icon name="hero-question-mark-circle" class="w-4 h-4" />
          Help & Support
        </.link>
      </li>
      <div class="divider my-0"></div>
      <li>
        <a href="/auth/sign-out" data-method="delete" class="text-error">
          <.icon name="hero-arrow-right-on-rectangle" class="w-4 h-4" />
          Sign Out
        </a>
      </li>
    </ul>
  </div>
  """
end
```

---

## Events

### Sidebar Toggle

```elixir
def handle_event("toggle_sidebar", _params, socket) do
  {:noreply, update(socket, :sidebar_open, &(!&1))}
end
```

### Theme Toggle

```elixir
def handle_event("toggle_theme", _params, socket) do
  # Toggle theme via JavaScript hook or localStorage
  {:noreply, push_event(socket, "toggle-theme", %{})}
end
```

### Search

```elixir
def handle_event("search", %{"q" => query}, socket) do
  socket =
    socket
    |> assign(:search_query, query)
    |> push_event("search-results", %{query: query})

  {:noreply, socket}
end
```

---

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate through actions (toggle, search, theme, notifications, profile)
- **Enter/Space**: Activate buttons and open dropdowns
- **Escape**: Close dropdowns
- **Arrow Keys**: Navigate dropdown items

### ARIA Attributes

```elixir
<header role="banner" aria-label="Main navigation">
  <button aria-label="Toggle sidebar" aria-expanded={@sidebar_open}>
    <!-- Menu icon -->
  </button>

  <div role="search">
    <input aria-label="Search" />
  </div>

  <button aria-label="Toggle theme">
    <!-- Theme icon -->
  </button>

  <button aria-label="Notifications" aria-describedby="notification-count">
    <span id="notification-count" class="sr-only">{@count} unread</span>
  </button>
</header>
```

### Focus Management
- Visible focus rings on all interactive elements
- Skip to main content link (for screen readers)

---

## Responsive Design

### Desktop (> 1024px)
- Full header with all features
- User name visible in profile dropdown
- Search bar expanded

### Tablet (640px - 1024px)
- Search bar condensed
- User name hidden
- All icons visible

### Mobile (< 640px)
- Sidebar toggle always visible
- Search icon only (expands to full search on click)
- Notifications and profile icons only

```elixir
<!-- Mobile Search Toggle -->
<button class="lg:hidden btn btn-ghost btn-circle" phx-click="toggle_mobile_search">
  <.icon name="hero-magnifying-glass" />
</button>

<!-- Full Search (hidden on mobile unless toggled) -->
<div class={["hidden lg:block flex-1 max-w-xl", @mobile_search_open && "!block"]}>
  <.global_search query={@search_query} />
</div>
```

---

## Testing

### Component Test

```elixir
test "renders header with user info" do
  user = %User{name: "John Doe", email: "john@example.com"}

  assigns = %{
    current_user: user,
    sidebar_open: true,
    search_query: "",
    unread_notifications: 3
  }

  html = render_component(&header/1, assigns)

  assert html =~ "John Doe"
  assert html =~ "Toggle sidebar"
  assert html =~ "3" # Notification count
end

test "adapts position when sidebar is closed" do
  assigns = %{
    current_user: %User{},
    sidebar_open: false,
    unread_notifications: 0
  }

  html = render_component(&header/1, assigns)

  assert html =~ "left-0"
  refute html =~ "left-64"
end
```

---

## Performance Notes

- **Fixed Positioning**: Uses CSS `position: fixed` for consistent position
- **Smooth Transitions**: 300ms CSS transition for sidebar state changes
- **Debounced Search**: Search input debounced to avoid excessive queries
- **Dropdown Lazy Loading**: Notification list loaded only when dropdown opens

---

## Related Components

- **Sidebar**: Works in tandem with header for layout
- **Global Search**: Embedded in header
- **Notifications Dropdown**: Shows notification preview
- **Profile Dropdown**: User menu and settings

---

## Dependencies

- **Heroicons**: Icon library
- **DaisyUI**: Dropdown, button, avatar components
- **Tailwind CSS**: Layout and styling

---

## Design Tokens Used

From `specs/05-ui-design/design-tokens.md`:

- **Height**: `h-16` (64px)
- **Spacing**: `px-6` (24px), `gap-2` (8px), `gap-4` (16px)
- **Colors**: `bg-base-100`, `border-base-300`, `text-base-content`
- **Transitions**: `transition-all duration-300`
- **Z-index**: `z-30`

---

**Last Updated**: 2025-11-17
**Maintained By**: ClienttCRM Design Team
