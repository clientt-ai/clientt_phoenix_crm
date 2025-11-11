---
description: HEEx template and Phoenix HTML guidelines
---

# Phoenix HTML & HEEx Guidelines

## Template Format

- Phoenix templates **always** use `~H` or `.html.heex` files (HEEx)
- **Never** use `~E`

## Forms

- **Always** use the imported `Phoenix.Component.form/1` and `Phoenix.Component.inputs_for/1`
- **Never** use `Phoenix.HTML.form_for` or `Phoenix.HTML.inputs_for` (outdated)
- **Always** use `Phoenix.Component.to_form/2`:
  ```elixir
  assign(socket, form: to_form(...))
  ```
  ```heex
  <.form for={@form} id="msg-form">
  ```

## DOM IDs

- **Always** add unique DOM IDs to key elements (forms, buttons, etc.) for testing:
  ```heex
  <.form for={@form} id="product-form">
  ```

## Imports

- For "app wide" template imports, add them to `my_app_web.ex`'s `html_helpers` block
- They'll be available to all LiveViews, LiveComponents, and modules using `use MyAppWeb, :html`

## Conditionals

- Elixir supports `if/else` but **does NOT support `if/else if` or `if/elsif`**
- **Never use `else if` or `elseif` in Elixir**
- **Always** use `cond` or `case` for multiple conditionals

  **Never do this (invalid)**:
  ```heex
  <%= if condition do %>
    ...
  <% else if other_condition %>
    ...
  <% end %>
  ```

  **Always do this**:
  ```heex
  <%= cond do %>
    <% condition -> %>
      ...
    <% condition2 -> %>
      ...
    <% true -> %>
      ...
  <% end %>
  ```

## Literal Curly Braces

- HEEx requires special tag annotation for literal `{` or `}` characters
- For code snippets in `<pre>` or `<code>`, use `phx-no-curly-interpolation`:
  ```heex
  <code phx-no-curly-interpolation>
    let obj = {key: "val"}
  </code>
  ```
- Within annotated tags, dynamic Elixir expressions still work with `<%= ... %>`

## Class Attributes

- HEEx class attrs support lists - **always** use list `[...]` syntax
- Use class list syntax to conditionally add classes:
  ```heex
  <a class={[
    "px-2 text-white",
    @some_flag && "py-5",
    if(@other_condition, do: "border-red-500", else: "border-blue-100")
  ]}>Text</a>
  ```
- **Always** wrap `if`'s inside `{...}` expressions with parens
- **Never** omit the `[` and `]` (invalid syntax):
  ```heex
  <%!-- INVALID --%>
  <a class={
    "px-2 text-white",
    @some_flag && "py-5"
  }>
  ```

## Collections

- **Never** use `<% Enum.each %>` for generating template content
- **Always** use `<%= for item <- @collection do %>`

## Comments

- HEEx HTML comments use `<%!-- comment --%>`
- **Always** use this syntax for template comments

## Interpolation

- HEEx allows interpolation via `{...}` and `<%= ... %>`
- `<%= %>` **only** works within tag bodies
- **Always** use `{...}` syntax for:
  - Interpolation within tag attributes
  - Interpolation of values within tag bodies
- **Always** use `<%= ... %>` for block constructs (`if`, `cond`, `case`, `for`) within tag bodies

  **Always do this**:
  ```heex
  <div id={@id}>
    {@my_assign}
    <%= if @some_block_condition do %>
      {@another_assign}
    <% end %>
  </div>
  ```

  **Never do this** (syntax error):
  ```heex
  <%!-- INVALID --%>
  <div id="<%= @invalid_interpolation %>">
    {if @invalid_block_construct do}
    {end}
  </div>
  ```
