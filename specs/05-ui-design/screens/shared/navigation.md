# Screen: Global Navigation

**Status**: Pending Implementation
**Last Updated**: 2025-11-12
**Priority**: High

---

## Overview

The global navigation provides consistent access to major sections of the application and user-related functions. It appears on all authenticated pages and adapts based on user role and company context.

---

## Access Requirements

### Authentication
- **Required**: Yes (shown only on authenticated pages)
- **Placement**: Persistent header/sidebar on all authenticated routes

---

## Layout Options

### Option A: Top Navigation Bar (Recommended)

```
┌────────────────────────────────────────────────────────┐
│ [Logo] Dashboard  Contacts  Deals  Tasks   [👤 User ▾] │
└────────────────────────────────────────────────────────┘
```

### Option B: Sidebar Navigation

```
┌──────────┬────────────────────────────────────┐
│ [Logo]   │                                    │
│          │                                    │
│ 📊 Dash  │        Main Content Area           │
│ 👥 Contacts                                   │
│ 💼 Deals  │                                    │
│ ✓ Tasks   │                                    │
│          │                                    │
│ [👤 User] │                                    │
└──────────┴────────────────────────────────────┘
```

### Option C: Hybrid (Top Bar + Sidebar)

Combination of compact top bar for user actions and sidebar for main navigation.

---

## Navigation Structure

### Primary Navigation Items

| Item | Icon | Route | Role Access |
|------|------|-------|-------------|
| Dashboard | 📊 | `/dashboard` | All |
| Contacts | 👥 | `/contacts` | All (future) |
| Deals | 💼 | `/deals` | All (future) |
| Tasks | ✓ | `/tasks` | All (future) |
| Reports | 📈 | `/reports` | Admin, Manager (future) |
| Settings | ⚙️ | `/settings` | Admin (future) |

### Secondary Navigation (User Menu)

Dropdown triggered by user avatar/name in top-right:

| Item | Action | Access |
|------|--------|--------|
| Profile | `/profile` | All |
| Company Settings | `/company/settings` | Admin only (future) |
| Switch Company | Modal/Dropdown | All with multiple companies (future) |
| Sign Out | Sign out action | All |

---

## Component Breakdown

### Top Navigation Bar (DaisyUI)

```heex
<div class="navbar bg-base-100 shadow-lg">
  <!-- Logo / Brand -->
  <div class="navbar-start">
    <.link navigate={~p"/dashboard"} class="btn btn-ghost normal-case text-xl">
      ClienttCRM
    </.link>
  </div>

  <!-- Primary Navigation -->
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><.link navigate={~p"/dashboard"}>Dashboard</.link></li>
      <li><.link navigate={~p"/contacts"}>Contacts</.link></li>
      <li><.link navigate={~p"/deals"}>Deals</.link></li>
      <li><.link navigate={~p"/tasks"}>Tasks</.link></li>
    </ul>
  </div>

  <!-- User Menu -->
  <div class="navbar-end">
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <.avatar user={@current_user} />
        </div>
      </label>
      <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <li class="menu-title">
          <span><%= @current_user.email %></span>
        </li>
        <li><.link navigate={~p"/profile"}>Profile</.link></li>
        <%= if admin?(@current_user) do %>
          <li><.link navigate={~p"/company/settings"}>Company Settings</.link></li>
        <% end %>
        <li><.link navigate={~p"/auth/sign-out"}>Sign Out</.link></li>
      </ul>
    </div>
  </div>
</div>
```

### Mobile Navigation (Hamburger Menu)

```heex
<div class="navbar-start">
  <!-- Mobile menu button -->
  <div class="dropdown">
    <label tabindex="0" class="btn btn-ghost lg:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
      </svg>
    </label>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-3">
      <li><.link navigate={~p"/dashboard"}>Dashboard</.link></li>
      <li><.link navigate={~p"/contacts"}>Contacts</.link></li>
      <li><.link navigate={~p"/deals"}>Deals</.link></li>
      <li><.link navigate={~p"/tasks"}>Tasks</.link></li>
    </ul>
  </div>
</div>
```

---

## Company Context (Multi-Tenancy)

### Company Switcher Component

Located in top navigation near user menu:

```heex
<div class="dropdown dropdown-end mr-4">
  <label tabindex="0" class="btn btn-ghost">
    <%= @current_company.name %> ▾
  </label>
  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
    <%= for company <- @user_companies do %>
      <li>
        <.link phx-click="switch_company" phx-value-id={company.id}>
          <%= company.name %>
          <%= if company.id == @current_company.id do %>
            <span class="badge badge-primary">Active</span>
          <% end %>
        </.link>
      </li>
    <% end %>
    <div class="divider my-0"></div>
    <li><.link navigate={~p"/companies/new"}>+ New Company</.link></li>
  </ul>
</div>
```

### Company Context Display

Show current company in navigation:

```
┌────────────────────────────────────────────────────────┐
│ [Logo] Acme Corp ▾  Dashboard  Contacts   [👤 User ▾]  │
│                     ^^^^^^^^^^^                         │
│                     Company switcher                    │
└────────────────────────────────────────────────────────┘
```

---

## Active State Indication

### Current Page Highlighting

```elixir
defp nav_link(assigns) do
  ~H"""
  <.link
    navigate={@href}
    class={[
      "btn btn-ghost",
      @active && "btn-active"
    ]}
  >
    <%= render_slot(@inner_block) %>
  </.link>
  """
end

# Usage
<.nav_link href={~p"/dashboard"} active={@current_page == :dashboard}>
  Dashboard
</.nav_link>
```

---

## Responsive Behavior

### Desktop (>1024px)
- Full horizontal navigation visible
- All primary items shown
- User menu in top-right

### Tablet (640-1024px)
- Horizontal navigation may collapse less critical items
- Hamburger menu for overflow items
- User menu remains visible

### Mobile (<640px)
- Hamburger menu for all primary navigation
- Logo and user menu visible
- Company switcher accessible via menu

---

## Notifications (Future)

### Notification Bell

Add notification dropdown to navigation:

```heex
<div class="dropdown dropdown-end mr-4">
  <label tabindex="0" class="btn btn-ghost btn-circle">
    <div class="indicator">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <%= if @unread_notifications > 0 do %>
        <span class="badge badge-xs badge-primary indicator-item"><%= @unread_notifications %></span>
      <% end %>
    </div>
  </label>
  <div tabindex="0" class="dropdown-content card card-compact w-64 p-2 shadow bg-base-100">
    <div class="card-body">
      <h3 class="card-title">Notifications</h3>
      <.notification_list notifications={@notifications} />
    </div>
  </div>
</div>
```

---

## Breadcrumbs (Future)

For deep navigation hierarchies:

```heex
<div class="text-sm breadcrumbs">
  <ul>
    <li><.link navigate={~p"/dashboard"}>Dashboard</.link></li>
    <li><.link navigate={~p"/contacts"}>Contacts</.link></li>
    <li>John Doe</li>
  </ul>
</div>
```

---

## Implementation Files

### Layout File
`lib/clientt_crm_app_web/components/layouts/app.html.heex`

Add navigation component to layout:

```heex
<!DOCTYPE html>
<html lang="en" class="[scrollbar-gutter:stable]">
  <head>
    <!-- head content -->
  </head>
  <body class="bg-base-200">
    <%= if @current_user do %>
      <.navigation current_user={@current_user} current_page={@current_page} />
    <% end %>

    <main class="container mx-auto px-4 py-6">
      <.flash_group flash={@flash} />
      <%= @inner_content %>
    </main>
  </body>
</html>
```

### Component File
`lib/clientt_crm_app_web/components/navigation.ex`

```elixir
defmodule ClienttCrmAppWeb.Components.Navigation do
  use Phoenix.Component
  import ClienttCrmAppWeb.CoreComponents

  attr :current_user, :any, required: true
  attr :current_page, :atom, default: nil

  def navigation(assigns) do
    ~H"""
    <nav class="navbar bg-base-100 shadow-lg">
      <!-- Navigation implementation -->
    </nav>
    """
  end
end
```

---

## BDD Scenarios

### Scenario: Authenticated user sees navigation

```gherkin
Given I am signed in as "user@example.com"
When I view any authenticated page
Then I should see the global navigation
And I should see navigation items:
  | Dashboard |
  | Contacts  |
  | Deals     |
  | Tasks     |
And I should see my user menu
```

### Scenario: User accesses user menu

```gherkin
Given I am signed in and on the dashboard
When I click my user avatar in the navigation
Then a dropdown menu should appear
And I should see the following options:
  | Profile       |
  | Sign Out      |
And my email "user@example.com" should be displayed
```

### Scenario: Admin sees admin-only navigation items

```gherkin
Given I am signed in as an admin
When I view the global navigation
And I open my user menu
Then I should see "Company Settings" in the dropdown
```

### Scenario: User clicks navigation item

```gherkin
Given I am on the dashboard
When I click "Contacts" in the navigation
Then I should be navigated to "/contacts"
And "Contacts" should be highlighted as active
```

---

## Accessibility

- Use semantic `<nav>` element
- Proper ARIA labels for dropdowns
- Keyboard navigation support (Tab, Enter, Escape)
- Skip navigation link for screen readers
- Sufficient color contrast for active states
- Focus indicators for all interactive elements

---

## Related Specifications

- Pattern: [authentication.md](../../patterns/authentication.md) - Root path behavior
- Screen: [dashboard.md](./dashboard.md) - Dashboard layout
- Domain: [authorization](../../../01-domains/authorization/) - User roles and permissions

---

**Status**: 📝 Specification complete, pending implementation
