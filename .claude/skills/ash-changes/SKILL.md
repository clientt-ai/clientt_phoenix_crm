---
name: ash-changes
description: Using changes to modify changesets before action execution
---

<!--
SPDX-FileCopyrightText: 2019 ash contributors <https://github.com/ash-project/ash/graphs.contributors>

SPDX-License-Identifier: MIT
-->

# Using Changes

Changes allow you to modify the changeset before it gets processed by an action. Unlike validations, changes can manipulate attribute values, add attributes, or perform other data transformations.

Common change patterns:

```elixir
# Built-in changes with conditions
change set_attribute(:status, "pending")
change relate_actor(:creator) do
  where present(:actor)
end
change atomic_update(:counter, expr(^counter + 1))

# Action-specific vs global changes
actions do
  create :sign_up do
    change set_attribute(:joined_at, expr(now()))  # Only for this action
  end
end

changes do
  change set_attribute(:updated_at, expr(now())), on: :update  # Multiple actions
  change manage_relationship(:items, type: :append), on: [:create, :update]
end
```

## Custom Change Modules

Create custom change modules for reusable transformation logic:

```elixir
defmodule MyApp.Changes.SlugifyTitle do
  use Ash.Resource.Change

  def change(changeset, _opts, _context) do
    title = Ash.Changeset.get_attribute(changeset, :title)

    if title do
      slug = title |> String.downcase() |> String.replace(~r/[^a-z0-9]+/, "-")
      Ash.Changeset.change_attribute(changeset, :slug, slug)
    else
      changeset
    end
  end
end

# Usage in resource:
change {MyApp.Changes.SlugifyTitle, []}
```

## Change Module with Lifecycle Hooks

Create a change module with lifecycle hooks to handle complex multi-step operations:

```elixir
defmodule MyApp.Changes.ProcessOrder do
  use Ash.Resource.Change

  def change(changeset, _opts, context) do
    changeset
    |> Ash.Changeset.before_transaction(fn changeset ->
      # Runs before the transaction starts
      # Use for external API calls, logging, etc.
      MyApp.ExternalService.reserve_inventory(changeset, scope: context)
      changeset
    end)
    |> Ash.Changeset.before_action(fn changeset ->
      # Runs inside the transaction before the main action
      # Use for related database changes in the same transaction
      Ash.Changeset.change_attribute(changeset, :processed_at, DateTime.utc_now())
    end)
    |> Ash.Changeset.after_action(fn changeset, result ->
      # Runs inside the transaction after the main action, only on success
      # Use for related database changes that depend on the result
      MyApp.Inventory.update_stock_levels(result, scope: context)
      {changeset, result}
    end)
    |> Ash.Changeset.after_transaction(fn changeset,
      {:ok, result} ->
        # Runs after the transaction completes (success or failure)
        # Use for notifications, external systems, etc.
        MyApp.Mailer.send_order_confirmation(result, scope: context)
        {changeset, result}

      {:error, error} ->
        # Runs after the transaction completes (success or failure)
        # Use for notifications, external systems, etc.
        MyApp.Mailer.send_order_issue_notice(result, scope: context)
        {:error, error}
    end)
  end
end

# Usage in resource:
change {MyApp.Changes.ProcessOrder, []}
```
