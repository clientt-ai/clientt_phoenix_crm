# Screen: User Dashboard

**Route**: `/dashboard`
**Status**: Implemented (Basic Version)
**Last Updated**: 2025-11-12
**Priority**: High

---

## Overview

The dashboard is the main landing page for authenticated users. It provides a welcome message, quick actions, and will eventually display relevant metrics, recent activity, and shortcuts to key features.

---

## Access Requirements

### Authentication
- **Required**: Yes
- **Guard**: `on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}`
- **Unauthenticated behavior**: Redirect to `/sign-in`

### Authorization
- **Current**: Any authenticated user
- **Future**: May vary by company context and user role

---

## Current Implementation

### File Location
`lib/clientt_crm_app_web/live/dashboard_live.ex`

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Navigation (app layout)                  │
├─────────────────────────────────────────┤
│                                          │
│  Dashboard                               │ ← Page title (h1)
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ Welcome, user@example.com!        │  │ ← Welcome card
│  │                                   │  │
│  │ You are successfully logged in    │  │
│  │ to your CRM dashboard.            │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │ Quick Actions                     │  │ ← Actions card
│  │                                   │  │
│  │ Your dashboard content will       │  │
│  │ appear here.                      │  │
│  └───────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Current Components

#### Page Header
```heex
<h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">
  Dashboard
</h1>
```

#### Welcome Card
```heex
<div class="bg-white shadow sm:rounded-lg mb-6">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="text-base font-semibold leading-6 text-gray-900">
      Welcome, <%= @current_user.email %>!
    </h3>
    <div class="mt-2 max-w-xl text-sm text-gray-500">
      <p>You are successfully logged in to your CRM dashboard.</p>
    </div>
  </div>
</div>
```

#### Quick Actions Card
```heex
<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
      Quick Actions
    </h3>
    <div class="space-y-2">
      <p class="text-sm text-gray-500">
        Your dashboard content will appear here.
      </p>
    </div>
  </div>
</div>
```

---

## Responsive Behavior

### Desktop (>1024px)
- Max width: 3xl (48rem / 768px)
- Centered layout
- Full card spacing

### Tablet (640-1024px)
- Max width: 3xl (48rem / 768px)
- Centered layout
- Responsive padding

### Mobile (<640px)
- Full width with padding
- Cards adapt to smaller screen
- Reduced spacing

---

## Styling

### Tailwind Classes Used

**Container**:
- `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` - Outer container
- `mx-auto max-w-3xl` - Content max width

**Typography**:
- `text-3xl font-bold tracking-tight text-gray-900` - Page title
- `text-base font-semibold leading-6 text-gray-900` - Card titles
- `text-sm text-gray-500` - Body text

**Cards**:
- `bg-white shadow sm:rounded-lg` - Card container
- `px-4 py-5 sm:p-6` - Card padding
- `mb-6` - Card spacing

---

## Future Enhancements

### Phase 1: Company Context (After Multi-Tenancy)

Add company switcher and company-specific dashboard:

```heex
<div class="flex justify-between items-center mb-6">
  <h1 class="text-3xl font-bold">Dashboard</h1>
  <.company_switcher current_tenant={@current_tenant} />
</div>

<div class="alert alert-info mb-6">
  Viewing: <%= @current_tenant.name %>
</div>
```

### Phase 2: Stats Cards

Add key metrics:

```heex
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  <.stat_card title="Total Contacts" value={@stats.total_contacts} icon="users" />
  <.stat_card title="Active Deals" value={@stats.active_deals} icon="briefcase" />
  <.stat_card title="This Month Revenue" value={@stats.monthly_revenue} icon="currency" />
  <.stat_card title="Tasks Due" value={@stats.tasks_due} icon="check" />
</div>
```

### Phase 3: Recent Activity Feed

Show recent actions:

```heex
<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
      Recent Activity
    </h3>
    <.activity_feed items={@recent_activities} />
  </div>
</div>
```

### Phase 4: Quick Actions Grid

Actionable buttons:

```heex
<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
  <.action_card
    title="New Contact"
    icon="user-plus"
    phx-click="create_contact" />
  <.action_card
    title="New Deal"
    icon="dollar-sign"
    phx-click="create_deal" />
  <.action_card
    title="Send Email"
    icon="mail"
    phx-click="compose_email" />
  <.action_card
    title="Schedule Task"
    icon="calendar"
    phx-click="create_task" />
</div>
```

### Phase 5: Customizable Widgets

Allow users to customize their dashboard:

- Drag-and-drop widget placement
- Show/hide widgets based on preferences
- Role-based default layouts
- Save layout preferences per user

---

## User Flows

### Flow 1: First Time User

```
User logs in → Redirected to /dashboard
  ↓
Sees welcome message with their email
  ↓
Sees placeholder for future content
  ↓
(Future) Guided tour or onboarding checklist
```

### Flow 2: Returning User

```
User logs in → Redirected to /dashboard
  ↓
Sees personalized dashboard with:
  - Company context (if multi-tenant)
  - Recent activity
  - Key metrics
  - Quick actions
```

---

## BDD Scenarios

### Scenario: Authenticated user views dashboard

```gherkin
Given I am signed in as "alice@example.com"
When I visit "/dashboard"
Then I should see the page title "Dashboard"
And I should see "Welcome, alice@example.com!"
And I should see "You are successfully logged in to your CRM dashboard"
And I should see "Quick Actions"
```

### Scenario: Unauthenticated user cannot access dashboard

```gherkin
Given I am not signed in
When I attempt to visit "/dashboard"
Then I should be redirected to "/sign-in"
And I should not see the dashboard content
```

### Scenario: User navigates from root to dashboard

```gherkin
Given I am signed in as "bob@example.com"
When I visit "/"
Then I should be redirected to "/dashboard"
And I should see "Welcome, bob@example.com!"
```

---

## Accessibility

### Current Implementation
- Semantic HTML structure with proper heading hierarchy
- Sufficient color contrast (gray-900 on white, gray-500 on white)
- Responsive design works on all screen sizes

### Required Improvements
- Add skip navigation link
- Ensure keyboard navigation works for all interactive elements
- Add ARIA labels where needed
- Test with screen readers

---

## Performance Considerations

### Current
- Minimal data loading (just current user)
- Static content renders quickly
- No database queries

### Future
- Implement pagination for activity feeds
- Cache frequently accessed stats
- Use LiveView streams for real-time updates
- Lazy load non-critical widgets

---

## Testing

### Integration Tests

```elixir
defmodule ClienttCrmAppWeb.DashboardLiveTest do
  use ClienttCrmAppWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Dashboard" do
    test "redirects unauthenticated users to sign-in", %{conn: conn} do
      assert {:error, {:redirect, %{to: "/sign-in"}}} =
        live(conn, ~p"/dashboard")
    end

    test "authenticated user sees welcome message", %{conn: conn} do
      user = user_fixture(%{email: "test@example.com"})
      {:ok, _view, html} =
        conn
        |> log_in_user(user)
        |> live(~p"/dashboard")

      assert html =~ "Dashboard"
      assert html =~ "Welcome, test@example.com!"
      assert html =~ "Quick Actions"
    end

    test "displays current user email correctly", %{conn: conn} do
      user = user_fixture(%{email: "alice@example.com"})
      {:ok, view, _html} =
        conn
        |> log_in_user(user)
        |> live(~p"/dashboard")

      assert render(view) =~ "alice@example.com"
    end
  end
end
```

---

## Related Specifications

- Pattern: [authentication.md](../../patterns/authentication.md) - Authentication flow
- Screen: [navigation.md](./navigation.md) - Global navigation (future)
- Domain: [authorization](../../../01-domains/authorization/) - User and company management

---

**Status**: ✅ Basic implementation complete, awaiting feature enhancements
