# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Phoenix CRM application built with the Ash Framework, featuring comprehensive authentication capabilities. The application uses Elixir/Phoenix with Ash Framework for declarative resource management, AshPostgres for database integration, and AshAuthentication for user management.

## Key Technologies

- **Phoenix Framework** (v1.8+): Web framework
- **Ash Framework** (v3.0+): Declarative resource framework for domain modeling
- **AshAuthentication** (v4.0+) & AshAuthentication.Phoenix (v2.0+): Authentication system
- **AshPostgres** (v2.0+): PostgreSQL data layer for Ash
- **Phoenix LiveView** (v1.1+): Real-time UI components
- **Tailwind CSS** (v4.1+): Styling
- **esbuild** (v0.25+): JavaScript bundler
- **PostgreSQL**: Database

## Development Setup Commands

```bash
# Initial setup (from clientt_crm_app directory)
mix setup
# This runs: deps.get, ash.setup, assets.setup, assets.build, run priv/repo/seeds.exs

# Start development server
mix phx.server
# Server runs on http://localhost:4000 by default (configurable via PORT env var)

# Development mailbox available at /dev/mailbox
# LiveDashboard available at /dev/dashboard
```

## Common Development Commands

All commands should be run from the `clientt_crm_app` directory.

### Testing
```bash
# Run all tests (includes ash.setup --quiet before running)
mix test

# Run specific test file
mix test test/path/to/test_file.exs

# Run specific test by line number
mix test test/path/to/test_file.exs:42
```

### Database Management
```bash
# Run Ash-specific setup (creates DB, runs migrations for all Ash resources)
mix ash.setup

# Reset database (tears down and sets up)
mix ash.reset

# Generate migrations for Ash resources
mix ash_postgres.generate_migrations

# Run migrations
mix ash_postgres.migrate

# Rollback migrations
mix ash_postgres.rollback
```

### Assets
```bash
# Install asset tools
mix assets.setup

# Build assets for development
mix assets.build

# Build and minify assets for production
mix assets.deploy
```

### Code Quality
```bash
# Pre-commit checks (compile with warnings as errors, unlock unused deps, format, test)
mix precommit

# Format code
mix format

# Compile with warnings as errors
mix compile --warning-as-errors
```

## Architecture Overview

### Ash Framework Structure

This application follows Ash Framework conventions with a declarative, resource-based architecture:

- **Domains**: Top-level organizational units (e.g., `ClienttCrmApp.Accounts`)
- **Resources**: Core business entities with declarative configuration (e.g., `User`, `Token`)
- **Actions**: CRUD operations and custom business logic defined on resources
- **Policies**: Authorization rules defined declaratively on resources

### Directory Structure

```
clientt_crm_app/
├── lib/
│   ├── clientt_crm_app/              # Domain logic
│   │   ├── accounts.ex                # Accounts domain (Ash.Domain)
│   │   ├── accounts/
│   │   │   ├── user.ex                # User resource (Ash.Resource)
│   │   │   ├── token.ex               # Token resource
│   │   │   └── user/senders/          # Email senders for auth workflows
│   │   ├── application.ex             # OTP application
│   │   ├── mailer.ex                  # Email configuration
│   │   ├── repo.ex                    # Ecto/Ash repository
│   │   └── secrets.ex                 # Token signing secrets
│   └── clientt_crm_app_web/           # Web layer (Phoenix)
│       ├── components/                # LiveView components
│       ├── controllers/               # Phoenix controllers
│       ├── endpoint.ex                # Phoenix endpoint
│       ├── gettext.ex                 # Internationalization
│       ├── router.ex                  # Route definitions
│       ├── telemetry.ex               # Metrics and monitoring
│       ├── auth_controller.ex         # Auth callback controller
│       ├── auth_overrides.ex          # Custom auth UI overrides
│       └── live_user_auth.ex          # LiveView auth helpers
├── config/                            # Configuration files
│   ├── config.exs                     # Base config
│   ├── dev.exs                        # Development config
│   ├── test.exs                       # Test config
│   ├── prod.exs                       # Production config
│   └── runtime.exs                    # Runtime config
├── priv/
│   ├── repo/
│   │   ├── migrations/                # Database migrations
│   │   └── seeds.exs                  # Seed data
│   └── static/                        # Static assets
└── test/                              # Test files
```

### Authentication System

The application uses AshAuthentication with multiple strategies:

1. **Password Authentication**: Email/password with bcrypt hashing
2. **Magic Link**: Passwordless email-based authentication
3. **Password Reset**: Token-based password reset flow
4. **Email Confirmation**: User email verification on registration

Key authentication components:
- User resource: `lib/clientt_crm_app/accounts/user.ex`
- Token resource: `lib/clientt_crm_app/accounts/token.ex`
- Authentication routes: `lib/clientt_crm_app_web/router.ex`
- Auth controller: `lib/clientt_crm_app_web/controllers/auth_controller.ex`
- LiveView auth: `lib/clientt_crm_app_web/live_user_auth.ex`

### Ash Resource Patterns

When working with Ash resources:

1. **Actions**: Define CRUD operations and custom actions in the `actions` block
2. **Attributes**: Define resource fields in the `attributes` block
3. **Relationships**: Define associations in the `relationships` block
4. **Policies**: Define authorization rules in the `policies` block
5. **Data Layer**: Configure database settings in the `postgres` block

Example resource structure:
```elixir
defmodule MyApp.MyDomain.MyResource do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: MyApp.MyDomain,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "table_name"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read, :create, :update, :destroy]
  end

  attributes do
    uuid_primary_key :id
    attribute :name, :string, allow_nil?: false
  end
end
```

### Phoenix Configuration

- **Development**: Runs on port 4000 (configurable via PORT env var)
- **Test**: Runs on port 4002, uses SQL sandbox for test isolation
- **Database**: PostgreSQL (dev: `clientt_crm_app_dev`, test: `clientt_crm_app_test`)
- **Mailer**: Development uses Swoosh local adapter (preview at /dev/mailbox)

## Ash-Specific Commands

```bash
# Generate a new Ash resource
mix ash.gen.resource

# Generate a new Ash domain
mix ash.gen.domain

# Generate Ash code (validators, changes, etc.)
mix ash.codegen

# Add an extension to a resource/domain
mix ash.extend

# View authentication routes
mix ash_authentication.phoenix.routes
```

## Important Notes

- All Ash-related work (migrations, resource changes) should use Ash tooling (`mix ash.*` and `mix ash_postgres.*`) rather than raw Ecto commands
- The application uses `mix ash.setup` instead of `mix ecto.setup` for database initialization
- Authentication is fully configured with password, magic link, password reset, and email confirmation strategies
- The codebase uses Spark DSL formatting with specific section ordering (see config/config.exs)
- LiveView components require appropriate auth guards via `on_mount` (see router.ex for examples)

## Additional Guidelines

For detailed Phoenix, Elixir, and project-specific guidelines, use these slash commands:

- `/project-guidelines` - Project workflow, Phoenix v1.8 conventions, JS/CSS, and UI/UX guidelines
- `/elixir-guidelines` - Elixir language patterns and best practices
- `/phoenix-guidelines` - Phoenix framework conventions
- `/html-guidelines` - HEEx template and Phoenix HTML guidelines
- `/liveview-guidelines` - LiveView patterns, streams, and testing
