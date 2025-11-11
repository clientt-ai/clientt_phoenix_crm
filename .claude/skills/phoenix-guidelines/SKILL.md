---
name: phoenix-guidelines
description: Provides Phoenix framework conventions and patterns. Use when working with Phoenix routers, scopes, routes, or dealing with Phoenix.View deprecation.
---

# Phoenix Framework Guidelines

This skill provides Phoenix framework conventions to help you write correct Phoenix applications.

## Router Scopes and Aliases

Phoenix router `scope` blocks include an optional alias which is prefixed for all routes within the scope. **Always** be mindful of this when creating routes within a scope to avoid duplicate module prefixes.

### Route Aliases

You **never** need to create your own `alias` for route definitions—the `scope` provides the alias automatically.

**Example**:

```elixir
scope "/admin", AppWeb.Admin do
  pipe_through :browser

  live "/users", UserLive, :index
  live "/posts", PostLive, :index
end
```

In the above example:
- The `UserLive` route points to the `AppWeb.Admin.UserLive` module
- The `PostLive` route points to the `AppWeb.Admin.PostLive` module

**Common mistake to avoid**:

```elixir
# DON'T DO THIS - redundant alias
scope "/admin", AppWeb.Admin do
  pipe_through :browser

  # UserLive already gets the AppWeb.Admin prefix from scope
  live "/users", AppWeb.Admin.UserLive, :index  # Redundant!
end
```

## Phoenix.View Deprecation

- `Phoenix.View` is no longer needed or included with Phoenix
- **Don't use it** in new code
- Phoenix 1.7+ uses function components and `Phoenix.Component` instead
- If you see `Phoenix.View` in legacy code, it should be migrated to `Phoenix.Component`

## General Best Practices

- Use function components (`def my_component(assigns)`) instead of class-based views
- Leverage `Phoenix.Component` for all template rendering
- Use `Phoenix.VerifiedRoutes` for compile-time verified route helpers
