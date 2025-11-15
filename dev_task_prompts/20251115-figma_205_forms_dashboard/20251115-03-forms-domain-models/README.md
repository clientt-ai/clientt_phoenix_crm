# Track 3: Ash Domain Models & Data Layer

## Overview

This track covers creating all Ash resources, domains, and database schema for the Forms Dashboard functionality.

**Target Location:** `lib/clientt_crm_app/`
**Database:** PostgreSQL via AshPostgres

---

## ⚠️ CRITICAL Authorization Requirements

### Role-Based Access Control (RBAC)

All Forms domain resources must implement role-based policies:

**Roles:**
- **form_admin** - Create, edit, delete, publish forms
- **form_viewer** - View forms (read-only)
- **lead_admin** - View, edit, export submissions
- **lead_viewer** - View submissions (read-only)
- **super_admin** - All permissions

**Resources Requiring Policies:**
- `Form` - CRUD based on form_admin/form_viewer roles
- `FormField` - CRUD based on form_admin role (viewers cannot edit fields)
- `Submission` - Read based on lead_admin/lead_viewer, edit based on lead_admin

**Implementation:**
- Create `UserRole` resource in Accounts domain
- Add role relationships to `User` resource
- Add Ash policies to each Forms domain resource
- Create authorization helper functions

📄 **Full Specification:** `../20251115-00-forms-project-overview/UI-LAYOUT-AND-ROLES.md`

---

## Ash Domains to Create

### 1. Forms Domain
**File:** `lib/clientt_crm_app/forms.ex`

Resources:
- `Form` - Form definitions and configuration
- `FormField` - Individual form fields
- `Submission` - Form submissions / lead data
- `FormTemplate` - Reusable form templates (future)

### 2. Calendars Domain (Track 4 detail)
**File:** `lib/clientt_crm_app/calendars.ex`

Resources:
- `Booking` - Scheduled calendar bookings
- `Availability` - Team member availability
- `AvailabilityOverride` - Date-specific overrides

### 3. Integrations Domain
**File:** `lib/clientt_crm_app/integrations.ex`

Resources:
- `CalendarProvider` - Google/Outlook connections
- `ChatbotSettings` - Chatbot configuration

### 4. Chatbot Domain (Track 5 detail)
**File:** `lib/clientt_crm_app/chatbot.ex`

Resources:
- `Conversation` - Chat conversations
- `Message` - Individual chat messages

### 5. Analytics Domain (Track 6 detail)
**File:** `lib/clientt_crm_app/analytics.ex`

No separate resources - uses calculations and aggregates on existing resources.

## Database Schema

### Forms Domain Tables

#### `forms` table
```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  -- Settings structure:
  -- {
  --   "post_submission_action": "book_demo" | "open_chatbot" | "redirect",
  --   "redirect_url": "https://...",
  --   "enable_chatbot": true,
  --   "enable_calendar": true,
  --   "theme": {...},
  --   "notification_email": "..."
  -- }
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX forms_user_id_index ON forms(user_id);
CREATE INDEX forms_status_index ON forms(status);
CREATE INDEX forms_slug_index ON forms(slug);
```

#### `form_fields` table
```sql
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
    'text', 'email', 'tel', 'number', 'date', 'time', 'datetime',
    'textarea', 'select', 'radio', 'checkbox', 'file'
  )),
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  help_text TEXT,
  required BOOLEAN DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  options JSONB DEFAULT '[]'::jsonb,
  -- Options structure for select/radio/checkbox:
  -- [{"label": "Option 1", "value": "opt1"}, ...]
  validation_rules JSONB DEFAULT '{}'::jsonb,
  -- Validation rules structure:
  -- {
  --   "min_length": 5,
  --   "max_length": 100,
  --   "pattern": "^[A-Z].*",
  --   "error_message": "..."
  -- }
  conditional_logic JSONB,
  -- Conditional logic (future):
  -- {
  --   "show_if": {"field_id": "xxx", "operator": "equals", "value": "yes"}
  -- }
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX form_fields_form_id_index ON form_fields(form_id);
CREATE INDEX form_fields_order_index ON form_fields(form_id, order_position);
```

#### `submissions` table
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Submitted data structure:
  -- {
  --   "field_id_1": "value1",
  --   "email": "user@example.com",
  --   "name": "John Doe"
  -- }
  lead_email VARCHAR(255),
  lead_name VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Metadata structure:
  -- {
  --   "ip_address": "192.168.1.1",
  --   "user_agent": "...",
  --   "referrer": "https://...",
  --   "utm_source": "...",
  --   "utm_campaign": "..."
  -- }
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'converted', 'spam'
  )),
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX submissions_form_id_index ON submissions(form_id);
CREATE INDEX submissions_lead_email_index ON submissions(lead_email);
CREATE INDEX submissions_status_index ON submissions(status);
CREATE INDEX submissions_submitted_at_index ON submissions(submitted_at DESC);
```

### Calendars Domain Tables

#### `calendar_bookings` table
```sql
CREATE TABLE calendar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendee_email VARCHAR(255) NOT NULL,
  attendee_name VARCHAR(255),
  scheduled_at TIMESTAMP NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'
  )),
  meeting_url TEXT,
  notes TEXT,
  google_event_id VARCHAR(255),
  outlook_event_id VARCHAR(255),
  reminder_sent_at TIMESTAMP,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX calendar_bookings_user_id_index ON calendar_bookings(user_id);
CREATE INDEX calendar_bookings_scheduled_at_index ON calendar_bookings(scheduled_at);
CREATE INDEX calendar_bookings_status_index ON calendar_bookings(status);
```

#### `team_availability` table
```sql
CREATE TABLE team_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX team_availability_user_day_index
  ON team_availability(user_id, day_of_week) WHERE is_active = true;
CREATE INDEX team_availability_user_id_index ON team_availability(user_id);
```

#### `availability_overrides` table
```sql
CREATE TABLE availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  override_type VARCHAR(50) NOT NULL CHECK (override_type IN ('blocked', 'custom_hours')),
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT custom_hours_require_times CHECK (
    (override_type = 'custom_hours' AND start_time IS NOT NULL AND end_time IS NOT NULL)
    OR override_type = 'blocked'
  )
);

CREATE INDEX availability_overrides_user_date_index ON availability_overrides(user_id, date);
```

### Integrations Domain Tables

#### `calendar_integrations` table
```sql
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'outlook')),
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP,
  calendar_id VARCHAR(255),
  calendar_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  -- Settings structure:
  -- {
  --   "event_title_template": "Demo with {{attendee_name}}",
  --   "event_description_template": "...",
  --   "send_notifications": true,
  --   "notification_email": "..."
  -- }
  last_synced_at TIMESTAMP,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX calendar_integrations_user_provider_index
  ON calendar_integrations(user_id, provider) WHERE is_active = true;
CREATE INDEX calendar_integrations_user_id_index ON calendar_integrations(user_id);
```

#### `chatbot_settings` table
```sql
CREATE TABLE chatbot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  chatbot_name VARCHAR(100) DEFAULT 'Clientt Assistant',
  greeting_message TEXT DEFAULT 'Hi there 👋 Ready to book your free demo?',
  trigger_pages JSONB DEFAULT '["all"]'::jsonb,
  -- ["all", "forms", "landing", "contact", "pricing"]
  enable_demo_booking BOOLEAN DEFAULT true,
  demo_notification_routing VARCHAR(50) DEFAULT 'email' CHECK (
    demo_notification_routing IN ('email', 'dashboard', 'email_and_dashboard', 'slack')
  ),
  notification_email VARCHAR(255),
  settings JSONB DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX chatbot_settings_user_id_index ON chatbot_settings(user_id);
```

### Chatbot Domain Tables

#### `chatbot_conversations` table
```sql
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  user_info JSONB DEFAULT '{}'::jsonb,
  -- User info structure:
  -- {
  --   "first_name": "John",
  --   "last_name": "Doe",
  --   "email": "john@example.com",
  --   "company": "Acme Inc"
  -- }
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX chatbot_conversations_session_id_index ON chatbot_conversations(session_id);
CREATE INDEX chatbot_conversations_status_index ON chatbot_conversations(status);
```

#### `chatbot_messages` table
```sql
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('user', 'ai')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Metadata structure:
  -- {
  --   "intent": "pricing_inquiry",
  --   "confidence": 0.95,
  --   "quick_actions": ["book_demo", "view_features"]
  -- }
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX chatbot_messages_conversation_id_index ON chatbot_messages(conversation_id);
CREATE INDEX chatbot_messages_inserted_at_index ON chatbot_messages(inserted_at DESC);
```

## Ash Resource Definitions

### Forms Domain

#### Form Resource
**File:** `lib/clientt_crm_app/forms/form.ex`

```elixir
defmodule ClienttCrmApp.Forms.Form do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "forms"
    repo ClienttCrmApp.Repo

    references do
      reference :user, on_delete: :delete
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      constraints max_length: 255
    end

    attribute :description, :string

    attribute :slug, :string do
      allow_nil? true
      constraints max_length: 255
    end

    attribute :settings, :map do
      default %{}
    end

    attribute :status, :atom do
      constraints one_of: [:draft, :published, :archived]
      default :draft
    end

    attribute :view_count, :integer do
      default 0
      constraints min: 0
    end

    attribute :submission_count, :integer do
      default 0
      constraints min: 0
    end

    attribute :published_at, :utc_datetime

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, ClienttCrmApp.Accounts.User do
      allow_nil? false
    end

    has_many :fields, ClienttCrmApp.Forms.FormField
    has_many :submissions, ClienttCrmApp.Forms.Submission
  end

  calculations do
    calculate :conversion_rate, :decimal, expr(
      fragment("CASE WHEN ? > 0 THEN (? * 100.0 / ?) ELSE 0 END",
        view_count,
        submission_count,
        view_count
      )
    )

    calculate :is_published, :boolean, expr(status == :published)
  end

  aggregates do
    count :total_submissions, :submissions
    count :new_submissions, :submissions do
      filter expr(status == :new)
    end

    max :last_submission_at, :submissions, :submitted_at
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:name, :description, :settings]

      argument :user_id, :uuid do
        allow_nil? false
      end

      change manage_relationship(:user_id, :user, type: :append_target)
      change fn changeset, _context ->
        # Generate slug from name
        slug = changeset
          |> Ash.Changeset.get_attribute(:name)
          |> Slug.slugify()

        Ash.Changeset.change_attribute(changeset, :slug, slug)
      end
    end

    update :update do
      primary? true
      accept [:name, :description, :settings, :status]
    end

    update :publish do
      accept []
      change set_attribute(:status, :published)
      change set_attribute(:published_at, &DateTime.utc_now/0)
    end

    update :archive do
      accept []
      change set_attribute(:status, :archived)
    end

    update :increment_views do
      accept []
      change atomic_update(:view_count, expr(view_count + 1))
    end

    update :increment_submissions do
      accept []
      change atomic_update(:submission_count, expr(submission_count + 1))
    end

    read :for_user do
      argument :user_id, :uuid do
        allow_nil? false
      end

      filter expr(user_id == ^arg(:user_id))
    end

    read :published do
      filter expr(status == :published)
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if expr(user_id == ^actor(:id))
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if expr(user_id == ^actor(:id))
    end
  end

  code_interface do
    define :create
    define :update
    define :publish
    define :archive
    define :increment_views
    define :increment_submissions
    define :for_user, args: [:user_id]
    define :published
    define :read
    define :by_id, action: :read, get_by: [:id]
    define :destroy
  end
end
```

#### FormField Resource
**File:** `lib/clientt_crm_app/forms/form_field.ex`

```elixir
defmodule ClienttCrmApp.Forms.FormField do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "form_fields"
    repo ClienttCrmApp.Repo

    references do
      reference :form, on_delete: :delete
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :field_type, :atom do
      allow_nil? false
      constraints one_of: [
        :text, :email, :tel, :number, :date, :time, :datetime,
        :textarea, :select, :radio, :checkbox, :file
      ]
    end

    attribute :label, :string do
      allow_nil? false
      constraints max_length: 255
    end

    attribute :placeholder, :string
    attribute :help_text, :string

    attribute :required, :boolean do
      default false
    end

    attribute :order_position, :integer do
      default 0
      constraints min: 0
    end

    attribute :options, {:array, :map} do
      default []
      # Each option: %{label: "...", value: "..."}
    end

    attribute :validation_rules, :map do
      default %{}
    end

    attribute :conditional_logic, :map

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :form, ClienttCrmApp.Forms.Form do
      allow_nil? false
    end
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:field_type, :label, :placeholder, :help_text, :required,
              :order_position, :options, :validation_rules, :conditional_logic]

      argument :form_id, :uuid do
        allow_nil? false
      end

      change manage_relationship(:form_id, :form, type: :append_target)
    end

    update :update do
      primary? true
      accept [:field_type, :label, :placeholder, :help_text, :required,
              :order_position, :options, :validation_rules, :conditional_logic]
    end

    read :for_form do
      argument :form_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [order_position: :asc])
      filter expr(form_id == ^arg(:form_id))
    end
  end

  code_interface do
    define :create
    define :update
    define :for_form, args: [:form_id]
    define :read
    define :by_id, action: :read, get_by: [:id]
    define :destroy
  end
end
```

#### Submission Resource
**File:** `lib/clientt_crm_app/forms/submission.ex`

```elixir
defmodule ClienttCrmApp.Forms.Submission do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "submissions"
    repo ClienttCrmApp.Repo

    references do
      reference :form, on_delete: :delete
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :submitted_data, :map do
      allow_nil? false
      default %{}
    end

    attribute :lead_email, :string
    attribute :lead_name, :string

    attribute :metadata, :map do
      default %{}
    end

    attribute :status, :atom do
      constraints one_of: [:new, :contacted, :qualified, :converted, :spam]
      default :new
    end

    attribute :submitted_at, :utc_datetime do
      allow_nil? false
      default &DateTime.utc_now/0
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :form, ClienttCrmApp.Forms.Form do
      allow_nil? false
    end

    has_one :booking, ClienttCrmApp.Calendars.Booking
    has_one :conversation, ClienttCrmApp.Chatbot.Conversation
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      primary? true
      accept [:submitted_data, :lead_email, :lead_name, :metadata, :submitted_at]

      argument :form_id, :uuid do
        allow_nil? false
      end

      change manage_relationship(:form_id, :form, type: :append_target)

      # After creating submission, increment form's submission_count
      change after_action(fn _changeset, submission, _context ->
        ClienttCrmApp.Forms.Form
        |> Ash.Query.for_read(:read)
        |> Ash.Query.filter(id == ^submission.form_id)
        |> Ash.read_one!()
        |> ClienttCrmApp.Forms.Form.increment_submissions()

        {:ok, submission}
      end)
    end

    update :update do
      primary? true
      accept [:status]
    end

    read :for_form do
      argument :form_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [submitted_at: :desc])
      filter expr(form_id == ^arg(:form_id))
    end

    read :recent do
      argument :limit, :integer do
        default 10
      end

      prepare build(
        sort: [submitted_at: :desc],
        limit: arg(:limit)
      )
    end
  end

  code_interface do
    define :create
    define :update
    define :for_form, args: [:form_id]
    define :recent, args: [:limit]
    define :read
    define :by_id, action: :read, get_by: [:id]
    define :destroy
  end
end
```

### Forms Domain Definition
**File:** `lib/clientt_crm_app/forms.ex`

```elixir
defmodule ClienttCrmApp.Forms do
  use Ash.Domain

  resources do
    resource ClienttCrmApp.Forms.Form
    resource ClienttCrmApp.Forms.FormField
    resource ClienttCrmApp.Forms.Submission
  end
end
```

## Migrations

### Generate migrations
```bash
cd clientt_crm_app
mix ash_postgres.generate_migrations --name add_forms_domain
```

### Example generated migration
**File:** `priv/repo/migrations/20251115_add_forms_domain.exs`

```elixir
defmodule ClienttCrmApp.Repo.Migrations.AddFormsDomain do
  use Ecto.Migration

  def up do
    create table(:forms, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()")
      add :user_id, references(:users, type: :uuid, on_delete: :delete_all), null: false
      add :name, :string, null: false
      add :description, :text
      add :slug, :string
      add :settings, :jsonb, default: "{}"
      add :status, :string, default: "draft"
      add :view_count, :integer, default: 0
      add :submission_count, :integer, default: 0
      add :published_at, :utc_datetime

      timestamps()
    end

    create unique_index(:forms, [:slug])
    create index(:forms, [:user_id])
    create index(:forms, [:status])

    # ... (form_fields and submissions tables)
  end

  def down do
    drop table(:submissions)
    drop table(:form_fields)
    drop table(:forms)
  end
end
```

## Testing

### Resource Tests
**File:** `test/clientt_crm_app/forms/form_test.exs`

```elixir
defmodule ClienttCrmApp.Forms.FormTest do
  use ClienttCrmApp.DataCase
  alias ClienttCrmApp.Forms.Form

  describe "create/1" do
    test "creates a form with valid attributes" do
      user = user_fixture()

      assert {:ok, form} = Form.create(%{
        name: "Contact Form",
        description: "Get in touch",
        user_id: user.id
      })

      assert form.name == "Contact Form"
      assert form.status == :draft
      assert form.slug == "contact-form"
    end

    test "generates unique slug" do
      user = user_fixture()

      {:ok, form1} = Form.create(%{name: "Test Form", user_id: user.id})
      {:ok, form2} = Form.create(%{name: "Test Form", user_id: user.id})

      assert form1.slug != form2.slug
    end
  end

  describe "publish/1" do
    test "publishes a draft form" do
      form = form_fixture(status: :draft)

      assert {:ok, published} = Form.publish(form)
      assert published.status == :published
      assert published.published_at
    end
  end

  describe "calculations" do
    test "calculates conversion rate" do
      form = form_fixture(view_count: 100, submission_count: 25)

      form = Form.by_id!(form.id, load: [:conversion_rate])
      assert Decimal.to_float(form.conversion_rate) == 25.0
    end
  end
end
```

## Validation & Business Logic

### Custom Validations
Add to resources as needed:

```elixir
# In Form resource
validations do
  validate present(:name)
  validate string_length(:name, min: 3, max: 255)
  validate match(:slug, ~r/^[a-z0-9-]+$/, message: "must be lowercase alphanumeric with hyphens")
end
```

### Custom Changes
```elixir
# In Form resource
defmodule ClienttCrmApp.Forms.Changes.GenerateSlug do
  use Ash.Resource.Change

  def change(changeset, _opts, _context) do
    case Ash.Changeset.fetch_change(changeset, :name) do
      {:ok, name} ->
        slug = Slug.slugify(name)
        Ash.Changeset.change_attribute(changeset, :slug, slug)

      :error ->
        changeset
    end
  end
end

# Use in action:
change ClienttCrmApp.Forms.Changes.GenerateSlug
```

## Next Steps

1. Create Forms domain and resources
2. Generate and run migrations
3. Write comprehensive tests
4. Add validations and business logic
5. Implement calculations for analytics
6. Test with sample data
7. Move to Track 4 (Calendar domain)

## Resources

- `/ash-guidelines` - Ash framework best practices
- `/ash-basics` - Core Ash concepts
- `/ash-actions` - Action patterns
- `/ash-relationships` - Relationship management
- [Ash Framework Docs](https://hexdocs.pm/ash/)
- [AshPostgres Docs](https://hexdocs.pm/ash_postgres/)

---

**Status:** Ready for Implementation
**Estimated Time:** 1 week
**Dependencies:** None (foundational)
