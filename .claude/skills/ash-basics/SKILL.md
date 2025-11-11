---
name: ash-basics
description: Core Ash framework concepts - understanding, structure, data layers, and code generation
---

<!--
SPDX-FileCopyrightText: 2019 ash contributors <https://github.com/ash-project/ash/graphs.contributors>

SPDX-License-Identifier: MIT
-->

# Ash Framework Basics

## Understanding Ash

Ash is an opinionated, composable framework for building applications in Elixir. It provides a declarative approach to modeling your domain with resources at the center. Read documentation *before* attempting to use its features. Do not assume that you have prior knowledge of the framework or its conventions.

## Code Structure & Organization

- Organize code around domains and resources
- Each resource should be focused and well-named
- Create domain-specific actions rather than generic CRUD operations
- Put business logic inside actions rather than in external modules
- Use resources to model your domain entities

## Data Layers

Data layers determine how resources are stored and retrieved. Examples of data layers:

- **Postgres**: For storing resources in PostgreSQL (via `AshPostgres`)
- **ETS**: For in-memory storage (`Ash.DataLayer.Ets`)
- **Mnesia**: For distributed storage (`Ash.DataLayer.Mnesia`)
- **Embedded**: For resources embedded in other resources (`data_layer: :embedded`) (typically JSON under the hood)
- **Ash.DataLayer.Simple**: For resources that aren't persisted at all. Leave off the data layer, as this is the default.

Specify a data layer when defining a resource:

```elixir
defmodule MyApp.Post do
  use Ash.Resource,
    domain: MyApp.Blog,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "posts"
    repo MyApp.Repo
  end

  # ... attributes, relationships, etc.
end
```

For embedded resources:

```elixir
defmodule MyApp.Address do
  use Ash.Resource,
    data_layer: :embedded

  attributes do
    attribute :street, :string
    attribute :city, :string
    attribute :state, :string
    attribute :zip, :string
  end
end
```

Each data layer has its own configuration options and capabilities. Refer to the rules & documentation of the specific data layer package for more details.

## Generating Code

Use `mix ash.gen.*` tasks as a basis for code generation when possible. Check the task docs with `mix help <task>`.
Be sure to use `--yes` to bypass confirmation prompts. Use `--yes --dry-run` to preview the changes.

## Migrations and Schema Changes

After creating or modifying Ash code, run `mix ash.codegen <short_name_describing_changes>` to ensure any required additional changes are made (like migrations are generated). The name of the migration should be lower_snake_case. In a longer running dev session it's usually better to use `mix ash.codegen --dev` as you go and at the end run the final codegen with a sensible name describing all the changes made in the session.

## UUID Primary Keys (UUID v7)

This project is configured to use **UUID v7** for all primary keys by default. UUID v7 provides time-ordered, incremental UUIDs that offer better database index performance compared to random UUID v4.

### Configuration

The repo is configured in `lib/clientt_crm_app/repo.ex` with:

```elixir
@impl true
def uuid_v7_primary_key? do
  true
end
```

This ensures all resources using `uuid_primary_key :id` will automatically generate UUIDs using the `uuid_generate_v7()` PostgreSQL function.

### UUID v7 Function

The `uuid_generate_v7()` function is installed via database migrations and is compatible with PostgreSQL 13+. It's fully backwards compatible with PostgreSQL 17.

### Benefits of UUID v7

- **Time-ordered**: UUIDs are sortable by creation time
- **Better index performance**: Sequential IDs reduce B-tree fragmentation
- **Distributed-friendly**: Can generate IDs across multiple servers without collisions
- **Compatible**: Standard UUID type, works with all PostgreSQL tooling

### Usage in Resources

When defining resources, use `uuid_primary_key :id` as normal:

```elixir
defmodule MyApp.MyDomain.MyResource do
  use Ash.Resource,
    domain: MyApp.MyDomain,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "my_table"
    repo MyApp.Repo
  end

  attributes do
    uuid_primary_key :id  # Automatically uses UUID v7
    # ... other attributes
  end
end
```

The migration generator will automatically use `uuid_generate_v7()` for the default value.
