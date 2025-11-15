# UI Layout & Authorization Requirements

**Date:** 2025-11-15
**Status:** ✅ Required for MVP
**Purpose:** Define shared layout structure and role-based access control

---

## UI Layout Architecture

### Shared Layout Structure

All authenticated pages use a consistent layout with:
- **Header** (top) - Persistent across all pages
- **Sidebar** (left) - Persistent, role-based visibility
- **Main Content** (right) - Page-specific content

```
┌─────────────────────────────────────────────────────┐
│ HEADER (persistent)                                 │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │  MAIN CONTENT                            │
│ (role-   │  (page-specific)                         │
│  based)  │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

---

## Header Component

### Specification

**File:** `lib/clientt_crm_app_web/components/layouts/app_header.ex`

**Elements:**
- Logo/Brand (left)
- Search bar (center) - optional for MVP, can be added later
- User menu dropdown (right):
  - Profile
  - Settings
  - Dark mode toggle
  - Sign out

**Behavior:**
- Header is **always visible** when user is logged in
- Header is **consistent** across all pages (no page-specific changes)
- Responsive: Collapses to hamburger menu on mobile (<768px)

**Example Structure:**
```heex
<header class="header bg-white dark:bg-gray-900 border-b">
  <div class="header-container flex items-center justify-between px-6 py-4">
    <!-- Logo -->
    <div class="logo">
      <.link navigate={~p"/dashboard"}>
        <img src={~p"/images/logo.svg"} alt="CRM" class="h-8" />
      </.link>
    </div>

    <!-- Search (optional - future) -->
    <div class="search flex-1 max-w-xl mx-8">
      <!-- Search bar component -->
    </div>

    <!-- User Menu -->
    <div class="user-menu">
      <button phx-click="toggle_user_menu" class="flex items-center gap-2">
        <span>{@current_user.email}</span>
        <.icon name="hero-chevron-down" />
      </button>

      <%= if @show_user_menu do %>
        <div class="dropdown-menu absolute right-0 mt-2">
          <.link navigate={~p"/settings/profile"}>Profile</.link>
          <.link navigate={~p"/settings"}>Settings</.link>
          <button phx-click="toggle_dark_mode">Dark Mode</button>
          <.link href={~p"/sign-out"} method="delete">Sign Out</.link>
        </div>
      <% end %>
    </div>
  </div>
</header>
```

---

## Sidebar Component

### Specification

**File:** `lib/clientt_crm_app_web/components/layouts/sidebar.ex`

**Elements:**
- Navigation modules (collapsible sections)
- Module items (pages within each module)
- Role-based visibility
- Active state indicators

**Navigation Structure:**

```
Dashboard (always visible)

📄 Forms (if user has Form Admin or Form Viewer role)
  ├─ Forms List
  ├─ Analytics
  └─ [Create Form button - Form Admin only]

📊 Leads (if user has Lead Admin or Lead Viewer role)
  ├─ All Submissions
  ├─ Lead Analytics
  └─ [Export - Lead Admin only]

📅 Calendar (Coming Soon badge)
  └─ [Disabled/grayed out]

💬 Chatbot (Coming Soon badge)
  └─ [Disabled/grayed out]

⚙️ Settings (always visible)
  ├─ Profile
  ├─ Notifications
  └─ Integrations
```

**Behavior:**
- Sidebar is **always visible** when user is logged in
- Sidebar **changes** based on user roles:
  - Hide entire modules if user has no access
  - Hide specific actions (buttons) if user lacks permissions
- Collapsible modules (expand/collapse state persisted in session)
- Mobile: Sidebar becomes overlay/drawer (<768px)

**Example Structure:**
```heex
<aside class="sidebar bg-gray-50 dark:bg-gray-800 w-64 border-r">
  <nav class="sidebar-nav p-4 space-y-2">
    <!-- Dashboard - Always visible -->
    <.link navigate={~p"/dashboard"} class={["nav-item", active_class(@current_path, "/dashboard")]}>
      <.icon name="hero-home" /> Dashboard
    </.link>

    <!-- Forms Module - Role-based -->
    <%= if has_role?(@current_user, ["form_admin", "form_viewer"]) do %>
      <div class="nav-module">
        <button phx-click="toggle_module" phx-value-module="forms" class="nav-module-header">
          <.icon name="hero-document-text" /> Forms
          <.icon name={if @expanded_modules["forms"], do: "hero-chevron-down", else: "hero-chevron-right"} />
        </button>

        <%= if @expanded_modules["forms"] do %>
          <div class="nav-module-items ml-6 space-y-1">
            <.link navigate={~p"/forms"} class={["nav-item", active_class(@current_path, "/forms")]}>
              Forms List
            </.link>
            <.link navigate={~p"/analytics"} class={["nav-item", active_class(@current_path, "/analytics")]}>
              Analytics
            </.link>

            <%= if has_role?(@current_user, "form_admin") do %>
              <.link navigate={~p"/forms/new"} class="nav-item nav-action">
                <.icon name="hero-plus" /> Create Form
              </.link>
            <% end %>
          </div>
        <% end %>
      </div>
    <% end %>

    <!-- Leads Module - Role-based -->
    <%= if has_role?(@current_user, ["lead_admin", "lead_viewer"]) do %>
      <div class="nav-module">
        <button phx-click="toggle_module" phx-value-module="leads" class="nav-module-header">
          <.icon name="hero-user-group" /> Leads
          <.icon name={if @expanded_modules["leads"], do: "hero-chevron-down", else: "hero-chevron-right"} />
        </button>

        <%= if @expanded_modules["leads"] do %>
          <div class="nav-module-items ml-6 space-y-1">
            <.link navigate={~p"/forms/:form_id/submissions"} class={["nav-item"]}>
              All Submissions
            </.link>
            <.link navigate={~p"/analytics"} class={["nav-item"]}>
              Lead Analytics
            </.link>
          </div>
        <% end %>
      </div>
    <% end %>

    <!-- Future Modules - Coming Soon -->
    <div class="nav-module opacity-60">
      <div class="nav-module-header cursor-not-allowed">
        <.icon name="hero-calendar" /> Calendar
        <span class="badge badge-sm badge-warning ml-2">Soon</span>
      </div>
    </div>

    <div class="nav-module opacity-60">
      <div class="nav-module-header cursor-not-allowed">
        <.icon name="hero-chat-bubble-left-right" /> Chatbot
        <span class="badge badge-sm badge-warning ml-2">Soon</span>
      </div>
    </div>

    <!-- Settings - Always visible -->
    <.link navigate={~p"/settings"} class={["nav-item", active_class(@current_path, "/settings")]}>
      <.icon name="hero-cog-6-tooth" /> Settings
    </.link>
  </nav>
</aside>
```

---

## Role-Based Access Control (RBAC)

### Forms Domain Roles

**Role Definitions:**

1. **Form Admin**
   - Full access to Forms module
   - Can create, edit, delete, publish forms
   - Can view all submissions
   - Can export submission data
   - Can configure form settings

2. **Form Viewer**
   - Read-only access to Forms module
   - Can view forms (cannot edit)
   - Can view submissions
   - Cannot create, delete, or publish forms
   - Cannot export data

3. **Lead Admin**
   - Full access to Leads/Submissions
   - Can view, edit, update submission status
   - Can assign submissions to team members
   - Can export lead data
   - Can view lead analytics

4. **Lead Viewer**
   - Read-only access to Leads/Submissions
   - Can view submissions
   - Can view lead analytics
   - Cannot edit, export, or assign leads

### Role Assignment

**Default Role:** New users get **no roles** by default (must be assigned by admin)

**Super Admin:** Has all roles automatically (form_admin, form_viewer, lead_admin, lead_viewer)

### Implementation

**Database Schema:**

```sql
-- User roles junction table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN (
    'form_admin',
    'form_viewer',
    'lead_admin',
    'lead_viewer',
    'super_admin'
  )),
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX user_roles_user_id_index ON user_roles(user_id);
CREATE INDEX user_roles_role_index ON user_roles(role);
```

**Ash Resource:**

**File:** `lib/clientt_crm_app/accounts/user_role.ex`

```elixir
defmodule ClienttCrmApp.Accounts.UserRole do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Accounts,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "user_roles"
    repo ClienttCrmApp.Repo
  end

  attributes do
    uuid_primary_key :id

    attribute :role, :atom do
      allow_nil? false
      constraints one_of: [:form_admin, :form_viewer, :lead_admin, :lead_viewer, :super_admin]
    end

    create_timestamp :granted_at
  end

  relationships do
    belongs_to :user, ClienttCrmApp.Accounts.User do
      allow_nil? false
    end

    belongs_to :granted_by, ClienttCrmApp.Accounts.User
  end

  actions do
    defaults [:read]

    create :grant do
      accept [:role]
      argument :user_id, :uuid, allow_nil?: false
      argument :granted_by_id, :uuid

      change manage_relationship(:user_id, :user, type: :append)
      change manage_relationship(:granted_by_id, :granted_by, type: :append)
    end

    destroy :revoke
  end

  code_interface do
    define :grant, args: [:user_id, :role, :granted_by_id]
    define :revoke
  end
end
```

**User Resource Update:**

**File:** `lib/clientt_crm_app/accounts/user.ex` (additions)

```elixir
# Add to existing User resource

relationships do
  # ... existing relationships ...

  has_many :user_roles, ClienttCrmApp.Accounts.UserRole do
    destination_attribute :user_id
  end
end

calculations do
  calculate :roles, {:array, :atom}, expr(user_roles.role)

  calculate :has_form_access, :boolean, expr(
    fragment("? IN (SELECT role FROM user_roles WHERE user_id = ?)",
      ["form_admin", "form_viewer"], id)
  )

  calculate :has_lead_access, :boolean, expr(
    fragment("? IN (SELECT role FROM user_roles WHERE user_id = ?)",
      ["lead_admin", "lead_viewer"], id)
  )
end
```

**Helper Module:**

**File:** `lib/clientt_crm_app_web/live/authorization_helpers.ex`

```elixir
defmodule ClienttCrmAppWeb.AuthorizationHelpers do
  @moduledoc """
  Helper functions for role-based authorization in LiveViews.
  """

  def has_role?(%{roles: roles}, required_role) when is_atom(required_role) do
    required_role in roles || :super_admin in roles
  end

  def has_role?(%{roles: roles}, required_roles) when is_list(required_roles) do
    :super_admin in roles || Enum.any?(required_roles, &(&1 in roles))
  end

  def has_role?(_, _), do: false

  def can_create_forms?(user), do: has_role?(user, :form_admin)
  def can_view_forms?(user), do: has_role?(user, [:form_admin, :form_viewer])
  def can_edit_forms?(user), do: has_role?(user, :form_admin)
  def can_delete_forms?(user), do: has_role?(user, :form_admin)

  def can_view_leads?(user), do: has_role?(user, [:lead_admin, :lead_viewer])
  def can_edit_leads?(user), do: has_role?(user, :lead_admin)
  def can_export_leads?(user), do: has_role?(user, :lead_admin)
end
```

### Ash Policies

**File:** `lib/clientt_crm_app/forms/form.ex` (add policies section)

```elixir
policies do
  # Super admins have full access
  policy action_type(:*) do
    authorize_if relates_to_actor_via([:user, :user_roles], expr(role == :super_admin))
  end

  # Form admins have full access to forms
  policy action_type([:read, :create, :update, :destroy]) do
    authorize_if relates_to_actor_via([:user, :user_roles], expr(role == :form_admin))
  end

  # Form viewers can only read
  policy action_type(:read) do
    authorize_if relates_to_actor_via([:user, :user_roles], expr(role == :form_viewer))
  end

  # Users can only access their own forms
  policy action_type(:*) do
    authorize_if expr(user_id == ^actor(:id))
  end
end
```

---

## UI Pattern: Detail Views vs Modals

### Guiding Principle

**Prefer full-page detail views over modals** for complex forms and data displays.

### When to Use Detail Views (Full Pages)

✅ **Use detail views for:**
- Form creation/editing (Form Builder)
- Form details/submissions view
- User profile editing
- Settings pages
- Analytics dashboards
- Any workflow requiring multiple fields or steps

**Example:**
- `/forms/new` - Full page for form builder
- `/forms/:id/edit` - Full page for editing form
- `/forms/:id/submissions` - Full page showing submission list
- `/forms/:id/submissions/:submission_id` - Full page showing submission details

### When to Use Modals

✅ **Use modals for:**
- Confirmations (delete, publish, archive)
- Quick actions (duplicate form, change status)
- Small forms (1-3 fields max)
- Previews (form preview, submission preview)
- Alerts and notifications

**Example:**
```heex
<!-- Delete confirmation modal -->
<.modal id="delete-form-modal">
  <h3>Delete Form?</h3>
  <p>Are you sure you want to delete "{@form.name}"? This action cannot be undone.</p>
  <.button phx-click="confirm_delete" class="btn-danger">Delete</.button>
  <.button phx-click="cancel">Cancel</.button>
</.modal>

<!-- Quick status change modal -->
<.modal id="change-status-modal">
  <h3>Change Submission Status</h3>
  <.form for={@form} phx-submit="update_status">
    <.input field={@form[:status]} type="select" options={@status_options} />
    <.button type="submit">Update</.button>
  </.form>
</.modal>
```

### Routing Convention

**Detail views use clean URLs:**
```
/forms                          # List view
/forms/new                      # Create (full page)
/forms/:id                      # Detail view (full page)
/forms/:id/edit                 # Edit (full page)
/forms/:id/submissions          # Submissions list (full page)
/forms/:id/submissions/:sub_id  # Submission detail (full page)
/analytics                      # Analytics (full page)
/settings                       # Settings (full page)
/settings/profile               # Profile edit (full page)
```

**Modals use events (no URL change):**
```elixir
# Triggered by phx-click, no route needed
handle_event("show_delete_modal", %{"id" => id}, socket)
handle_event("show_status_modal", %{"id" => id}, socket)
```

---

## Implementation Checklist

### Layout Components
- [ ] Create shared header component (`layouts/app_header.ex`)
- [ ] Create shared sidebar component (`layouts/sidebar.ex`)
- [ ] Create root layout (`layouts/app.html.heex`) with header + sidebar
- [ ] Implement responsive behavior (mobile hamburger menu)
- [ ] Add dark mode toggle functionality

### Authorization
- [ ] Create `user_roles` database table
- [ ] Create `UserRole` Ash resource
- [ ] Add roles relationship to `User` resource
- [ ] Add role calculations to `User` resource
- [ ] Create `AuthorizationHelpers` module
- [ ] Add Ash policies to `Form` resource
- [ ] Add Ash policies to `Submission` resource

### Role Management UI
- [ ] Create admin page for assigning roles (`/settings/team` - future)
- [ ] Add role badges to user profile
- [ ] Show role-based navigation in sidebar

### Detail Views
- [ ] Implement all forms as full-page detail views
- [ ] Implement all settings as full pages
- [ ] Implement submission details as full page
- [ ] Use modals only for confirmations and quick actions

---

**Status:** ✅ Required for MVP
**Priority:** High - Implement in Phase 1 (Foundation)
**Dependencies:** Existing AshAuthentication User resource
**References:**
- LiveView UI track (`20251115-02-forms-liveview-ui/`)
- Domain Models track (`20251115-03-forms-domain-models/`)
- Primary Overview (`20251115-01-forms-dashboard-primary/`)
