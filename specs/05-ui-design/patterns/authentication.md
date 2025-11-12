# UI Pattern: Authentication & Navigation

**Status**: Implemented
**Last Updated**: 2025-11-12
**Priority**: Critical

## Overview

This document describes the authentication-based navigation pattern used throughout the application. It ensures users are properly redirected based on their authentication state when accessing different parts of the application.

---

## Root Path Behavior (`/`)

### Purpose
The root path acts as an intelligent entry point that redirects users based on their authentication status.

### User Flow

```
User visits "/"
    ↓
Is user authenticated?
    ↓
    ├─ YES → Redirect to "/dashboard"
    │         (User's main dashboard)
    │
    └─ NO  → Redirect to "/sign-in"
              (Login page)
```

### Implementation

**Controller**: `lib/clientt_crm_app_web/controllers/page_controller.ex`

```elixir
def home(conn, _params) do
  # Check if user is authenticated
  case conn.assigns[:current_user] do
    nil ->
      # Not authenticated, redirect to sign-in page
      redirect(conn, to: ~p"/sign-in")

    _user ->
      # Authenticated, redirect to dashboard
      redirect(conn, to: ~p"/dashboard")
  end
end
```

**Router**: `lib/clientt_crm_app_web/router.ex`

```elixir
scope "/", ClienttCrmAppWeb do
  pipe_through :browser

  get "/", PageController, :home

  ash_authentication_live_session :authenticated_routes do
    live "/dashboard", DashboardLive, :index
  end
end
```

---

## Authentication States

### Unauthenticated User

**Condition**: `conn.assigns[:current_user]` is `nil`

**Behavior**:
- Visiting `/` redirects to `/sign-in`
- Visiting `/dashboard` redirects to `/sign-in` (enforced by LiveView guard)
- Can access public routes: `/sign-in`, `/register`, `/reset`, `/auth/*`

**LiveView Guard**: `on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_no_user}`

### Authenticated User

**Condition**: `conn.assigns[:current_user]` exists

**Behavior**:
- Visiting `/` redirects to `/dashboard`
- Can access all authenticated routes
- Cannot access auth pages (automatically redirected away)

**LiveView Guard**: `on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}`

---

## Protected Routes

### Authenticated Routes Pattern

All authenticated LiveView routes use the `ash_authentication_live_session` wrapper:

```elixir
ash_authentication_live_session :authenticated_routes do
  # Routes here require authentication
  live "/dashboard", DashboardLive, :index
  # Future authenticated routes...
end
```

### LiveView Authentication Guards

Each LiveView specifies its authentication requirement at the module level:

```elixir
defmodule ClienttCrmAppWeb.DashboardLive do
  use ClienttCrmAppWeb, :live_view

  # Requires authenticated user
  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  # ...
end
```

**Available Guards**:

| Guard | Behavior | Use Case |
|-------|----------|----------|
| `:live_user_required` | Redirect to `/sign-in` if not authenticated | Protected pages (dashboard, settings) |
| `:live_user_optional` | Allow both authenticated and unauthenticated | Public pages with optional features |
| `:live_no_user` | Redirect to `/` if authenticated | Auth pages (sign-in, register) |

---

## Sign-In Page Behavior

**Route**: `/sign-in`

**Unauthenticated Users**:
- Display login form
- Options: Password login, Magic link
- Links to `/register` and `/reset`

**Authenticated Users**:
- Automatically redirected to `/` (which then redirects to `/dashboard`)
- Prevents re-login while already logged in

**Implementation**:
```elixir
sign_in_route register_path: "/register",
              reset_path: "/reset",
              auth_routes_prefix: "/auth",
              on_mount: [{ClienttCrmAppWeb.LiveUserAuth, :live_no_user}],
              # ...
```

---

## Dashboard Page

**Route**: `/dashboard`

**Purpose**: Main landing page for authenticated users

**Protection**:
- Requires authentication via `on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}`
- Unauthenticated users are redirected to `/sign-in`

**Content**:
- Welcome message with user email
- Quick actions section
- Placeholder for dashboard widgets (to be implemented)

**Implementation**: `lib/clientt_crm_app_web/live/dashboard_live.ex`

---

## User Journey Examples

### Journey 1: New User Signs Up

```
1. User visits "clientt.com" (root path)
   → Redirected to "/sign-in"

2. User clicks "Register" link
   → Navigated to "/register"

3. User completes registration form
   → Account created, user authenticated
   → Redirected to "/dashboard"

4. User visits root path "/" again
   → Redirected to "/dashboard" (already authenticated)
```

### Journey 2: Returning User Logs In

```
1. User visits "clientt.com" (root path)
   → Redirected to "/sign-in"

2. User enters credentials and submits
   → Authenticated successfully
   → Redirected to "/dashboard"

3. User bookmarks "clientt.com" and visits later
   → Session still active
   → Redirected directly to "/dashboard"
```

### Journey 3: User Logs Out

```
1. User on "/dashboard" (authenticated)
   → Clicks "Sign out"

2. Session destroyed
   → Redirected to "/sign-in"

3. User tries to visit "/dashboard" directly
   → Not authenticated
   → Redirected to "/sign-in"

4. User visits "/" (root path)
   → Not authenticated
   → Redirected to "/sign-in"
```

### Journey 4: Direct Dashboard Access

```
1. User (not authenticated) visits "/dashboard" directly
   → LiveView guard detects no authentication
   → Redirected to "/sign-in"

2. User logs in
   → Authenticated successfully
   → Redirected to "/dashboard"
```

---

## BDD Scenarios

### Scenario: Unauthenticated user visits root path

```gherkin
Given I am not signed in
When I visit "/"
Then I should be redirected to "/sign-in"
And I should see the login form
```

### Scenario: Authenticated user visits root path

```gherkin
Given I am signed in as "user@example.com"
When I visit "/"
Then I should be redirected to "/dashboard"
And I should see "Welcome, user@example.com"
```

### Scenario: Unauthenticated user accesses dashboard

```gherkin
Given I am not signed in
When I visit "/dashboard"
Then I should be redirected to "/sign-in"
And I should see the login form
```

### Scenario: Authenticated user accesses dashboard

```gherkin
Given I am signed in as "user@example.com"
When I visit "/dashboard"
Then I should see the dashboard page
And I should see "Welcome, user@example.com"
```

### Scenario: Authenticated user visits sign-in page

```gherkin
Given I am signed in as "user@example.com"
When I visit "/sign-in"
Then I should be redirected to "/"
And then automatically redirected to "/dashboard"
```

---

## Security Considerations

### Session Management

- Sessions are managed via Phoenix sessions (cookie-based)
- Session data loaded by `:load_from_session` plug
- Current user available in `conn.assigns[:current_user]`

### CSRF Protection

- All forms protected by `:protect_from_forgery` plug
- LiveView forms automatically include CSRF tokens

### Route Protection

- Controller routes rely on session checks
- LiveView routes use `on_mount` guards for protection
- Guards execute before LiveView mounts, preventing unauthorized access

---

## Future Enhancements

1. **Company Context**: After multi-tenancy is implemented:
   ```
   "/" → "/dashboard" → Check company context → Redirect to company dashboard
   ```

2. **Onboarding Flow**: First-time users might see:
   ```
   "/dashboard" (first visit) → "/onboarding"
   ```

3. **Custom Landing Pages**: Based on user roles:
   ```
   Admin → "/admin/dashboard"
   Manager → "/manager/dashboard"
   User → "/dashboard"
   ```

---

## Related Files

**Router**: `lib/clientt_crm_app_web/router.ex:44`
- Root path definition

**Controller**: `lib/clientt_crm_app_web/controllers/page_controller.ex:4`
- Root path redirect logic

**LiveView**: `lib/clientt_crm_app_web/live/dashboard_live.ex`
- Dashboard implementation

**Auth Guards**: `lib/clientt_crm_app_web/live_user_auth.ex:24`
- LiveView authentication guards

---

## Testing

### Controller Tests

```elixir
test "GET / redirects unauthenticated user to sign-in", %{conn: conn} do
  conn = get(conn, ~p"/")
  assert redirected_to(conn) == ~p"/sign-in"
end

test "GET / redirects authenticated user to dashboard", %{conn: conn} do
  user = user_fixture()
  conn = conn |> log_in_user(user) |> get(~p"/")
  assert redirected_to(conn) == ~p"/dashboard"
end
```

### LiveView Tests

```elixir
test "unauthenticated user cannot access dashboard", %{conn: conn} do
  {:error, {:redirect, %{to: "/sign-in"}}} =
    live(conn, ~p"/dashboard")
end

test "authenticated user can access dashboard", %{conn: conn} do
  user = user_fixture()
  {:ok, _view, html} =
    conn
    |> log_in_user(user)
    |> live(~p"/dashboard")

  assert html =~ "Welcome"
  assert html =~ user.email
end
```

---

**Status**: ✅ Implemented and documented
