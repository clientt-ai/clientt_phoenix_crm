---
description: Phoenix framework guidelines and conventions
---

# Phoenix Guidelines

## Router Scopes

- Remember Phoenix router `scope` blocks include an optional alias which is prefixed for all routes within the scope
- **Always** be mindful of this when creating routes within a scope to avoid duplicate module prefixes

## Route Aliases

- You **never** need to create your own `alias` for route definitions - the `scope` provides the alias:

      scope "/admin", AppWeb.Admin do
        pipe_through :browser

        live "/users", UserLive, :index
      end

  The `UserLive` route would point to the `AppWeb.Admin.UserLive` module

## Phoenix.View

- `Phoenix.View` is no longer needed or included with Phoenix - don't use it
