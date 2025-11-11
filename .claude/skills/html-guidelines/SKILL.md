---
name: html-guidelines
description: Provides HEEx template and Phoenix HTML best practices. Use when writing Phoenix templates, forms, handling conditionals in HEEx, working with class attributes, or dealing with interpolation syntax.
---

# Phoenix HTML & HEEx Guidelines

This skill provides best practices for writing HEEx templates and Phoenix HTML code.

## Template Format

- Phoenix templates **always** use `~H` sigil or `.html.heex` files (HEEx)
- **Never** use the deprecated `~E` sigil

## Forms

### Modern Form Helpers

- **Always** use the imported `Phoenix.Component.form/1` and `Phoenix.Component.inputs_for/1`
- **Never** use `Phoenix.HTML.form_for` or `Phoenix.HTML.inputs_for` (these are outdated)

### Form Data with to_form/2

**Always** use `Phoenix.Component.to_form/2`:

```elixir
# In your LiveView or controller
assign(socket, form: to_form(changeset))
```

```heex
<!-- In your template -->
<.form for={@form} id="msg-form">
  <.input field={@form[:email]} label="Email" />
  <.input field={@form[:password]} type="password" label="Password" />
</.form>
```

## DOM IDs for Testing

**Always** add unique DOM IDs to key elements (forms, buttons, etc.) for testing:

```heex
<.form for={@form} id="product-form">
  <.button id="submit-button">Submit</.button>
</.form>
```

## App-Wide Imports

For "app wide" template imports, add them to `my_app_web.ex`'s `html_helpers` block. They'll be available to all LiveViews, LiveComponents, and modules using `use MyAppWeb, :html`.

## Conditionals

### No else if Support

Elixir supports `if/else` but **does NOT support `if/else if` or `if/elsif`**.

**Never do this (invalid)**:

```heex
<%!-- INVALID --%>
<%= if condition do %>
  ...
<% else if other_condition %>
  ...
<% end %>
```

**Always use cond or case instead**:

```heex
<%= cond do %>
  <% condition -> %>
    <p>First condition met</p>
  <% condition2 -> %>
    <p>Second condition met</p>
  <% true -> %>
    <p>Default case</p>
<% end %>
```

## Literal Curly Braces

HEEx requires special tag annotation for literal `{` or `}` characters.

For code snippets in `<pre>` or `<code>`, use `phx-no-curly-interpolation`:

```heex
<code phx-no-curly-interpolation>
  let obj = {key: "val"}
</code>
```

Within annotated tags, dynamic Elixir expressions still work with `<%= ... %>` syntax.

## Class Attributes

HEEx class attributes support lists—**always** use list `[...]` syntax for multiple classes.

### Conditional Classes

Use class list syntax to conditionally add classes:

```heex
<a class={[
  "px-2 text-white",
  @some_flag && "py-5",
  if(@other_condition, do: "border-red-500", else: "border-blue-100")
]}>Text</a>
```

**Important**: Always wrap `if` expressions inside `{...}` with parens.

### Invalid Syntax

**Never** omit the `[` and `]` brackets:

```heex
<%!-- INVALID - missing brackets --%>
<a class={
  "px-2 text-white",
  @some_flag && "py-5"
}>...</a>
<%!-- This raises a compile syntax error --%>
```

## Collections

- **Never** use `<% Enum.each %>` for generating template content
- **Always** use `<%= for item <- @collection do %>`

```heex
<%= for user <- @users do %>
  <div>{user.name}</div>
<% end %>
```

## Comments

HEEx HTML comments use `<%!-- comment --%>`.

```heex
<%!-- This is a HEEx comment --%>
<!-- This is a regular HTML comment -->
```

**Always** use HEEx comment syntax for template comments.

## Interpolation

HEEx allows interpolation via `{...}` and `<%= ... %>`, but `<%= %>` **only** works within tag bodies.

### Rules

- **Always** use `{...}` for interpolation within tag attributes
- **Always** use `{...}` for interpolation of values within tag bodies
- **Always** use `<%= ... %>` for block constructs (`if`, `cond`, `case`, `for`) within tag bodies

### Valid Interpolation

```heex
<div id={@id}>
  {@my_assign}
  <%= if @some_block_condition do %>
    {@another_assign}
  <% end %>
</div>
```

### Invalid Interpolation

**Never do this** (will cause syntax error):

```heex
<%!-- INVALID - DO NOT DO THIS --%>
<div id="<%= @invalid_interpolation %>">
  {if @invalid_block_construct do}
  {end}
</div>
```

## Summary

- Use `.html.heex` or `~H` for templates
- Use `Phoenix.Component.form/1` and `to_form/2` for forms
- Add unique DOM IDs to elements
- Use `cond` or `case` for multiple conditionals (no `else if`)
- Use `[...]` for class lists with conditional classes
- Use `{...}` in attributes, `<%= ... %>` for block constructs in bodies
- Use `<%!-- --%>` for HEEx comments
