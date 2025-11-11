---
name: elixir-guidelines
description: Provides Elixir language best practices and common patterns. Use when writing Elixir code, working with lists, structs, OTP primitives, date/time handling, or debugging Mix tasks.
---

# Elixir Guidelines

This skill provides Elixir language best practices to help you write correct, idiomatic Elixir code.

## List Access

Elixir lists **do not support index based access via the access syntax**.

**Never do this (invalid)**:

```elixir
i = 0
mylist = ["blue", "green"]
mylist[i]  # This will NOT work
```

**Always do this instead**:

```elixir
i = 0
mylist = ["blue", "green"]
Enum.at(mylist, i)  # Use Enum.at, pattern matching, or List module
```

## Variable Rebinding in Block Expressions

Elixir variables are immutable, but can be rebound. For block expressions like `if`, `case`, `cond`, etc., you **must** bind the result of the expression to a variable if you want to use it. You **cannot** rebind the result inside the expression.

**Invalid approach**:

```elixir
# INVALID: rebinding inside the `if` - result never gets assigned
if connected?(socket) do
  socket = assign(socket, :val, val)
end
```

**Valid approach**:

```elixir
# VALID: rebind the result of the `if` to a new variable
socket =
  if connected?(socket) do
    assign(socket, :val, val)
  end
```

## Module Organization

- **Never** nest multiple modules in the same file as it can cause cyclic dependencies and compilation errors
- Each module should be in its own file

## Struct Access

- **Never** use map access syntax (`changeset[:field]`) on structs as they do not implement the Access behaviour by default
- For regular structs, you **must** access fields directly: `my_struct.field`
- Use higher level APIs when available: `Ecto.Changeset.get_field/2` for changesets

## Date and Time Handling

- Elixir's standard library has everything necessary for date and time manipulation
- Familiarize yourself with `Time`, `Date`, `DateTime`, and `Calendar` interfaces
- **Never** install additional dependencies unless asked or for date/time parsing (use `date_time_parser` package if needed)

## Atom Safety

- **Never** use `String.to_atom/1` on user input (creates memory leak risk)
- Atoms are not garbage collected, so dynamic atom creation can exhaust memory

## Naming Conventions

- Predicate function names should not start with `is_` and should end in a question mark
- Names like `is_thing` should be reserved for guards
- Example: `active?/1` not `is_active/1`

## OTP Primitives

Elixir's builtin OTP primitives like `DynamicSupervisor` and `Registry` require names in the child spec:

```elixir
{DynamicSupervisor, name: MyApp.MyDynamicSup}
```

Then use:

```elixir
DynamicSupervisor.start_child(MyApp.MyDynamicSup, child_spec)
```

## Concurrent Processing

- Use `Task.async_stream(collection, callback, options)` for concurrent enumeration with back-pressure
- Most times you'll want to pass `timeout: :infinity` as an option to avoid timeouts on long-running tasks

```elixir
Task.async_stream(items, &process_item/1, timeout: :infinity)
|> Enum.to_list()
```

## Mix Guidelines

### Reading Documentation

- Read the docs and options before using tasks: `mix help task_name`
- Mix help provides comprehensive information about available options

### Debugging Test Failures

- Run tests in a specific file: `mix test test/my_test.exs`
- Run all previously failed tests: `mix test --failed`
- Run a specific test by line number: `mix test test/my_test.exs:42`

### Dependency Management

- `mix deps.clean --all` is **almost never needed**
- **Avoid** using it unless you have good reason (e.g., corrupted build artifacts)
- Usually `mix deps.get` and `mix deps.compile` are sufficient
