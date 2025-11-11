---
name: liveview-guidelines
description: Provides Phoenix LiveView best practices including navigation, streams, JavaScript hooks, and testing. Use when building LiveViews, working with real-time collections, managing streams, or writing LiveView tests.
---

# Phoenix LiveView Guidelines

This skill provides best practices for building Phoenix LiveView applications.

## Navigation

### Modern Navigation Functions

- **Never** use deprecated `live_redirect` and `live_patch` functions
- **Always** use these alternatives:
  - In templates: `<.link navigate={href}>` and `<.link patch={href}>`
  - In LiveViews: `push_navigate/2` and `push_patch/2`

```heex
<%!-- Template navigation --%>
<.link navigate={~p"/users"}>View Users</.link>
<.link patch={~p"/users/new"}>New User</.link>
```

```elixir
# LiveView navigation
{:noreply, push_navigate(socket, to: ~p"/dashboard")}
{:noreply, push_patch(socket, to: ~p"/users/#{user.id}")}
```

## LiveComponents

- **Avoid LiveComponents** unless you have a strong, specific need for them
- Function components are usually sufficient and simpler
- LiveComponents add complexity with lifecycle callbacks and state management

## Naming and Routes

### LiveView Naming

LiveViews should be named with a `Live` suffix: `AppWeb.WeatherLive`

### Route Definition

The default `:browser` scope is **already aliased** with `AppWeb`, so use:

```elixir
live "/weather", WeatherLive
```

Not:

```elixir
live "/weather", AppWeb.WeatherLive  # Redundant!
```

## JavaScript Hooks

When using `phx-hook="MyHook"` and the hook manages its own DOM, you **must** also set `phx-update="ignore"`:

```heex
<div id="chart" phx-hook="ChartHook" phx-update="ignore">
  <%!-- Hook manages this DOM --%>
</div>
```

### Script Organization

- **Never** write embedded `<script>` tags in HEEx templates
- **Always** write scripts and hooks in `assets/js` directory
- Integrate hooks with `assets/js/app.js`

## LiveView Streams

### When to Use Streams

**Always** use LiveView streams for collections instead of regular lists to avoid memory ballooning and runtime termination.

### Stream Operations

```elixir
# Basic append
stream(socket, :messages, [new_msg])

# Reset stream (for filtering/refreshing)
stream(socket, :messages, filtered_messages, reset: true)

# Prepend
stream(socket, :messages, [new_msg], at: -1)

# Delete item
stream_delete(socket, :messages, msg)
```

### Stream Template Syntax

Template **must** set `phx-update="stream"` on parent element with a DOM id. Consume `@streams.stream_name` and use id as DOM id for each child:

```heex
<div id="messages" phx-update="stream">
  <div :for={{id, msg} <- @streams.messages} id={id}>
    {msg.text}
  </div>
</div>
```

### Stream Limitations

**Not Enumerable**: LiveView streams are **not enumerable**—cannot use `Enum.filter/2`, `Enum.reject/2`, or similar functions.

To filter/prune/refresh items, **must refetch data and re-stream with `reset: true`**:

```elixir
def handle_event("filter", %{"filter" => filter}, socket) do
  messages = list_messages(filter)

  {:noreply,
   socket
   |> assign(:messages_empty?, messages == [])
   |> stream(:messages, messages, reset: true)}
end
```

### Empty States

Streams **do not support counting or empty states** directly.

- Track counts using separate assigns
- For empty states, use Tailwind classes:

```heex
<div id="tasks" phx-update="stream">
  <div class="hidden only:block">No tasks yet</div>
  <div :for={{id, task} <- @streams.tasks} id={id}>
    {task.name}
  </div>
</div>
```

This only works if the empty state is the only HTML block alongside the stream for-comprehension.

### Deprecated

- **Never** use deprecated `phx-update="append"` or `phx-update="prepend"` for collections

## LiveView Tests

### Testing Tools

- Use `Phoenix.LiveViewTest` module for LiveView testing
- Use `LazyHTML` (included) for making assertions
- Form tests use `render_submit/2` and `render_change/2`

### Test Organization

- Create step-by-step test plan splitting major cases into small, isolated files
- Start with simpler tests verifying content exists
- Gradually add interaction tests

### Best Practices

**Reference Element IDs**:

```elixir
assert has_element?(view, "#product-form")
assert has_element?(view, "#submit-button")
```

**Never test against raw HTML**:

```elixir
# BAD
assert html =~ "Product Form"

# GOOD
assert has_element?(view, "#product-form")
```

**Test element presence over text content**:
- Text content can change
- Element IDs are more stable

**Focus on outcomes, not implementation details**

**Be aware of component output**:
- `Phoenix.Component` functions might produce different HTML than expected
- Test against the actual output HTML structure

### Debugging Test Failures

When facing test failures with element selectors, use `LazyHTML` to debug:

```elixir
html = render(view)
document = LazyHTML.from_fragment(html)
matches = LazyHTML.filter(document, "your-complex-selector")
IO.inspect(matches, label: "Matches")
```

## Summary

- Use modern navigation: `<.link navigate>`, `push_navigate`
- Avoid LiveComponents unless necessary
- Name LiveViews with `Live` suffix
- Use `phx-update="ignore"` with hooks that manage DOM
- Always use streams for collections
- Reset streams to filter: `stream(socket, :items, items, reset: true)`
- Test with element IDs, not raw HTML
- Use `LazyHTML` for debugging test failures
