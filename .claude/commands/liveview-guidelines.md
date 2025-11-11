---
description: Phoenix LiveView guidelines and best practices
---

# Phoenix LiveView Guidelines

## Navigation

- **Never** use deprecated `live_redirect` and `live_patch` functions
- **Always** use in templates: `<.link navigate={href}>` and `<.link patch={href}>`
- **Always** use in LiveViews: `push_navigate` and `push_patch`

## LiveComponents

- **Avoid LiveComponents** unless you have a strong, specific need for them

## Naming & Routes

- LiveViews should be named with a `Live` suffix: `AppWeb.WeatherLive`
- The default `:browser` scope is **already aliased** with `AppWeb`, so use: `live "/weather", WeatherLive`

## JavaScript Hooks

- When using `phx-hook="MyHook"` and the hook manages its own DOM, **must** also set `phx-update="ignore"`
- **Never** write embedded `<script>` tags in HEEx
- **Always** write scripts and hooks in `assets/js` directory and integrate with `assets/js/app.js`

## LiveView Streams

### When to Use Streams

- **Always** use LiveView streams for collections instead of regular lists to avoid memory ballooning and runtime termination

### Stream Operations

- Basic append: `stream(socket, :messages, [new_msg])`
- Reset stream: `stream(socket, :messages, [new_msg], reset: true)` (for filtering)
- Prepend: `stream(socket, :messages, [new_msg], at: -1)`
- Delete: `stream_delete(socket, :messages, msg)`

### Stream Template Syntax

- Template **must** set `phx-update="stream"` on parent element with a DOM id
- Consume `@streams.stream_name` and use id as DOM id for each child:

  ```heex
  <div id="messages" phx-update="stream">
    <div :for={{id, msg} <- @streams.messages} id={id}>
      {msg.text}
    </div>
  </div>
  ```

### Stream Limitations

- LiveView streams are **not enumerable** - cannot use `Enum.filter/2` or `Enum.reject/2`
- To filter/prune/refresh items, **must refetch data and re-stream with `reset: true`**:

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

- Streams **do not support counting or empty states**
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

- Use `Phoenix.LiveViewTest` module and `LazyHTML` for assertions
- Form tests use `render_submit/2` and `render_change/2`
- Create step-by-step test plan splitting major cases into small, isolated files
- Start with simpler tests verifying content exists, gradually add interaction tests

### Test Best Practices

- **Always reference key element IDs** added in LiveView templates
- **Never** test against raw HTML
- **Always** use `element/2`, `has_element/2`: `assert has_element?(view, "#my-form")`
- Favor testing for presence of key elements over text content (which can change)
- Focus on testing outcomes rather than implementation details
- Be aware `Phoenix.Component` functions might produce different HTML than expected

### Debugging Test Failures

- Add debug statements to print actual HTML using `LazyHTML` selectors:

  ```elixir
  html = render(view)
  document = LazyHTML.from_fragment(html)
  matches = LazyHTML.filter(document, "your-complex-selector")
  IO.inspect(matches, label: "Matches")
  ```
