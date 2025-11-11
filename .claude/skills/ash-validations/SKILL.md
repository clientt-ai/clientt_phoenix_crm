---
name: ash-validations
description: Using validations and preparations in Ash resources
---

<!--
SPDX-FileCopyrightText: 2019 ash contributors <https://github.com/ash-project/ash/graphs.contributors>

SPDX-License-Identifier: MIT
-->

# Using Validations

Validations ensure that data meets your business requirements before it gets processed by an action. Unlike changes, validations cannot modify the changeset - they can only validate it or add errors.

Validations work on both changesets and queries. Built-in validations that support queries include:
- `action_is`, `argument_does_not_equal`, `argument_equals`, `argument_in`
- `compare`, `confirm`, `match`, `negate`, `one_of`, `present`, `string_length`
- Custom validations that implement the `supports/1` callback

Common validation patterns:

```elixir
# Built-in validations with custom messages
validate compare(:age, greater_than_or_equal_to: 18) do
  message "You must be at least 18 years old"
end
validate match(:email, "@")
validate one_of(:status, [:active, :inactive, :pending])

# Conditional validations with where clauses
validate present(:phone_number) do
  where present(:contact_method) and eq(:contact_method, "phone")
end

# only_when_valid? - skip validation if prior validations failed
validate expensive_validation() do
  only_when_valid? true
end

# Action-specific vs global validations
actions do
  create :sign_up do
    validate present([:email, :password])  # Only for this action
  end

  read :search do
    argument :email, :string
    validate match(:email, ~r/^[^\s]+@[^\s]+\.[^\s]+$/)  # Validates query arguments
  end
end

validations do
  validate present([:title, :body]), on: [:create, :update]  # Multiple actions
end
```

## Custom Validation Modules

Create custom validation modules for complex validation logic:

```elixir
defmodule MyApp.Validations.UniqueUsername do
  use Ash.Resource.Validation

  @impl true
  def init(opts), do: {:ok, opts}

  @impl true
  def validate(changeset, _opts, _context) do
    # Validation logic here
    # Return :ok or {:error, message}
  end
end

# Usage in resource:
validate {MyApp.Validations.UniqueUsername, []}
```

Make validations **atomic** when possible to ensure they work correctly with direct database operations by implementing the `atomic/3` callback in custom validation modules.

## Atomic Validations

```elixir
defmodule MyApp.Validations.IsEven do
  # transform and validate opts

  use Ash.Resource.Validation

  @impl true
  def init(opts) do
    if is_atom(opts[:attribute]) do
      {:ok, opts}
    else
      {:error, "attribute must be an atom!"}
    end
  end

  @impl true
  # This is optional, but useful to have in addition to validation
  # so you get early feedback for validations that can otherwise
  # only run in the datalayer
  def validate(changeset, opts, _context) do
    value = Ash.Changeset.get_attribute(changeset, opts[:attribute])

    if is_nil(value) || (is_number(value) && rem(value, 2) == 0) do
      :ok
    else
      {:error, field: opts[:attribute], message: "must be an even number"}
    end
  end

  @impl true
  def atomic(changeset, opts, context) do
    {:atomic,
      # the list of attributes that are involved in the validation
      [opts[:attribute]],
      # the condition that should cause the error
      # here we refer to the new value or the current value
      expr(rem(^atomic_ref(opts[:attribute]), 2) != 0),
      # the error expression
      expr(
        error(^InvalidAttribute, %{
          field: ^opts[:attribute],
          # the value that caused the error
          value: ^atomic_ref(opts[:attribute]),
          # the message to display
          message: ^(context.message || "%{field} must be an even number"),
          vars: %{field: ^opts[:attribute]}
        })
      )
    }
  end
end
```

## Avoid Redundant Validations

Don't add validations that duplicate attribute constraints:

```elixir
# WRONG - redundant validation
attribute :name, :string do
  allow_nil? false
  constraints min_length: 1
end

validate present(:name) do  # Redundant! allow_nil? false already handles this
  message "Name is required"
end

validate attribute_does_not_equal(:name, "") do  # Redundant! min_length: 1 already handles this
  message "Name cannot be empty"
end

# CORRECT - let attribute constraints handle basic validation
attribute :name, :string do
  allow_nil? false
  constraints min_length: 1
end
```

# Using Preparations

Preparations modify queries before they're executed. They are used to add filters, sorts, or other query modifications based on the query context.

Common preparation patterns:

```elixir
# Built-in preparations
prepare build(sort: [created_at: :desc])
prepare build(filter: [active: true])

# Conditional preparations with where clauses
prepare build(filter: [visible: true]) do
  where argument_equals(:include_hidden, false)
end

# only_when_valid? - skip preparation if prior validations failed
prepare expensive_preparation() do
  only_when_valid? true
end

# Action-specific vs global preparations
actions do
  read :recent do
    prepare build(sort: [created_at: :desc], limit: 10)
  end
end

preparations do
  prepare build(filter: [deleted: false]), on: [:read, :update]
end
```
