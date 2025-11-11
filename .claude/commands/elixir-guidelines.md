---
description: Elixir language guidelines and best practices
---

# Elixir Guidelines

## List Access

- Elixir lists **do not support index based access via the access syntax**

  **Never do this (invalid)**:

      i = 0
      mylist = ["blue", "green"]
      mylist[i]

  Instead, **always** use `Enum.at`, pattern matching, or `List` for index based list access:

      i = 0
      mylist = ["blue", "green"]
      Enum.at(mylist, i)

## Variable Rebinding

- Elixir variables are immutable, but can be rebound. For block expressions like `if`, `case`, `cond`, etc., you **must** bind the result of the expression to a variable if you want to use it. You **cannot** rebind the result inside the expression:

      # INVALID: rebinding inside the `if` - result never gets assigned
      if connected?(socket) do
        socket = assign(socket, :val, val)
      end

      # VALID: rebind the result of the `if` to a new variable
      socket =
        if connected?(socket) do
          assign(socket, :val, val)
        end

## Module Organization

- **Never** nest multiple modules in the same file as it can cause cyclic dependencies and compilation errors

## Struct Access

- **Never** use map access syntax (`changeset[:field]`) on structs as they do not implement the Access behaviour by default
- For regular structs, you **must** access fields directly: `my_struct.field`
- Use higher level APIs when available: `Ecto.Changeset.get_field/2` for changesets

## Date/Time Handling

- Elixir's standard library has everything necessary for date and time manipulation
- Familiarize yourself with `Time`, `Date`, `DateTime`, and `Calendar` interfaces
- **Never** install additional dependencies unless asked or for date/time parsing (use `date_time_parser` package)

## Atoms

- Don't use `String.to_atom/1` on user input (memory leak risk)

## Naming Conventions

- Predicate function names should not start with `is_` and should end in a question mark
- Names like `is_thing` should be reserved for guards

## OTP Primitives

- Elixir's builtin OTP primitives like `DynamicSupervisor` and `Registry` require names in the child spec:
  ```elixir
  {DynamicSupervisor, name: MyApp.MyDynamicSup}
  ```
  Then use: `DynamicSupervisor.start_child(MyApp.MyDynamicSup, child_spec)`

## Concurrent Processing

- Use `Task.async_stream(collection, callback, options)` for concurrent enumeration with back-pressure
- Most times you'll want to pass `timeout: :infinity` as an option

## Mix Guidelines

- Read the docs and options before using tasks: `mix help task_name`
- To debug test failures:
  - Run tests in a specific file: `mix test test/my_test.exs`
  - Run all previously failed tests: `mix test --failed`
- `mix deps.clean --all` is **almost never needed** - avoid using it unless you have good reason
