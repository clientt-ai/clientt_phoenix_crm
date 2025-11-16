# Additional Blocking Questions - CRITICAL REVIEW NEEDED

**Date:** 2025-11-15
**Status:** 🔴 CRITICAL - These questions MUST be answered before implementation
**Purpose:** Identify gaps in MVP-REVIEW-ISSUES-AND-QUESTIONS.md that could block implementation

---

## Overview

After cross-referencing:
- The existing `MVP-REVIEW-ISSUES-AND-QUESTIONS.md`
- The `UI-LAYOUT-AND-ROLES.md` specification
- The `FIGMA-COVERAGE-ANALYSIS.md` findings
- The existing `20251111-01-multitenancy` folder

I've identified **CRITICAL GAPS** that are not addressed in the current questions file. These must be resolved before specs can be created.

---

## 🚨 CRITICAL BLOCKING QUESTIONS (Must Answer Now)

### Q24: Multi-Tenancy / Organization Scoping ⚠️ MOST CRITICAL

**Context:**
- The project has a `dev_task-prompts_and_plans/20251111-01-multitenancy/` folder with a complete multi-tenant spec
- That spec defines: Companies, Teams, User roles scoped to companies
- Current Forms database schema has `user_id` but NO `company_id` or `organization_id`
- User roles specification (UI-LAYOUT-AND-ROLES.md) doesn't mention company scoping

**Question:** Are Forms scoped to organizations/companies?

**Options:**
- **A) Yes - Forms belong to companies**
  - Forms table needs `company_id UUID REFERENCES companies(id)`
  - User roles are company-scoped (user is form_admin in Company A, not Company B)
  - Forms are only visible to users in the same company
  - Database policies enforce row-level security
  - Impacts: Database schema, Ash resources, policies, all LiveView pages

- **B) No - Forms are user-scoped only**
  - Forms belong to individual users (current schema)
  - User roles are global (form_admin can access all forms they create)
  - No company/organization isolation
  - Simpler implementation

- **C) Hybrid - Forms can be user-owned OR company-owned**
  - Forms table needs nullable `company_id`
  - User forms: `company_id = NULL`, visible only to creator
  - Company forms: `company_id = <id>`, visible to all users in company with proper role
  - Most flexible but most complex

**Impact if not answered:**
- ⛔ Cannot create correct database schema
- ⛔ Cannot write Ash resource policies
- ⛔ Cannot implement role-based access correctly
- ⛔ May need to rebuild database if wrong choice made

**Your Answer:** ✅ **OPTION A - YES, Forms belong to companies**

**Decision Date:** 2025-11-16
**Rationale:**
- Project has existing multi-tenancy system with Companies, AuthzUsers, Teams
- Specs folder (`specs/01-domains/authorization/policies/row_level_security.md:20`) explicitly states "All future tenant-scoped resources (Contacts, Deals, etc.)" must have company_id
- Forms are tenant-scoped resources requiring complete data isolation
- Consistency with existing architecture is critical

**Implementation Impact:**
- ✅ Add `company_id UUID REFERENCES authz_companies(id)` to forms, form_fields, submissions tables
- ✅ Implement Ash policies following row_level_security.md patterns
- ✅ All queries automatically filtered by `current_company_id` from session
- ✅ Forms created with automatic company_id from actor context
- ✅ Company_id is immutable after creation
- ✅ LiveView pages require company context via `on_mount` hook

**Notes:** This decision aligns with the comprehensive multi-tenancy architecture already implemented in the Authorization domain. See `specs/01-domains/authorization/` for detailed patterns to follow.

---

### Q25: User Role Assignment & Management

**Context:**
- UI-LAYOUT-AND-ROLES.md defines 4 roles: form_admin, form_viewer, lead_admin, lead_viewer
- Also mentions super_admin role
- No specification for HOW users get these roles

**Decision Date:** 2025-11-16

**✅ ROLE STORAGE ARCHITECTURE: Feature Roles (JSONB)**

**Implementation:**
- Add `feature_roles JSONB DEFAULT '{}'` to existing `authz_users` table
- Store form roles in JSONB: `%{forms: :form_admin}`
- Supports future features: `%{forms: :form_admin, calendar: :calendar_admin}`
- Roles and permissions defined in Elixir code (NOT database tables)

**Migration:**
```sql
ALTER TABLE authz_users
  ADD COLUMN feature_roles JSONB DEFAULT '{}';

CREATE INDEX idx_authz_users_feature_roles_forms
  ON authz_users ((feature_roles->>'forms'));
```

**Permission Mapping (in code):**
```elixir
# lib/clientt_crm_app/authorization/permissions.ex
defmodule ClienttCrmApp.Authorization.Permissions do
  @form_permissions %{
    form_admin: [:create_form, :update_form, :delete_form, :publish_form,
                 :view_form, :view_all_submissions, :delete_submission, :export_submissions],
    form_viewer: [:view_form, :view_published_forms_only],
    lead_admin: [:view_all_submissions, :update_submission, :delete_submission,
                 :export_submissions, :add_submission_notes],
    lead_viewer: [:view_submissions, :export_submissions]
  }

  def has_form_permission?(authz_user, permission) do
    form_role = get_in(authz_user.feature_roles, ["forms"])
    permission in Map.get(@form_permissions, form_role, [])
  end
end
```

**Rationale:**
- Roles/permissions in code = version controlled, environment-agnostic
- JSONB enables multiple feature-specific roles per user
- No additional tables needed
- Clear separation: company role vs feature roles

---

**Q25a: Who can assign roles?** ✅ **OPTION B - Company admin assigns roles**

**Answer:** Company `admin` role can assign any form role within their company.

**Implementation:**
- Ash policy: `authorize_if actor_attribute_equals(:role, :admin)`
- Only admins can update `feature_roles` field
- Form roles are scoped to company (via authz_user's company_id)

---

**Q25b: Role assignment UI - where does it live?** ✅ **OPTION A - Settings page (for MVP)**

**Answer:** Settings page includes "Team & Permissions" section

**Implementation:**
- Settings page has tab: "Team Members"
- Shows all authz_users in current company
- Admin can edit feature_roles for each user
- Simple dropdown: [No Form Role, Form Admin, Form Viewer, Lead Admin, Lead Viewer]

---

**Q25c: Default role for new users?** ✅ **OPTION A - No roles by default**

**Answer:** New authz_users have `feature_roles: %{}` (no form role)

**Rationale:**
- Explicit permission grants (security best practice)
- Company admin must explicitly assign form roles
- Prevents accidental access to sensitive form data

---

### Q26: Form Status Workflow & Lifecycle

**Context:**
- Database schema shows `status VARCHAR(50) DEFAULT 'draft'`
- Comments suggest: draft, published, archived
- No specification of allowed transitions or permissions

**Questions:**

**Decision Date:** 2025-11-16

**✅ STATUS PATTERN: Following Authorization Domain Conventions**

**Q26a: What statuses are allowed?** ✅ **OPTION A - Draft, Published, Archived**

**Implementation:**
```elixir
attribute :status, :atom do
  constraints one_of: [:draft, :published, :archived]
  default :draft
end
```

**Rationale:** Matches existing pattern in Authorization domain (Company, Team use active/archived pattern)

---

**Q26b: Can you unpublish a form?** ✅ **OPTION A - Yes, Published → Draft**

**Answer:** Forms can be unpublished (reverted to draft status)

**Implementation:**
- Action: `update :unpublish` changes status from `:published` to `:draft`
- Form stops accepting new submissions when in draft
- Existing submissions remain intact
- form_admin permission required

**Use Case:** Stop accepting submissions temporarily (e.g., form needs updates, max submissions reached)

---

**Q26c: Can archived forms be unarchived?** ✅ **OPTION A - Yes, reversible**

**Answer:** Archiving is reversible (can unarchive to draft status)

**Implementation:**
- Action: `update :unarchive` changes status from `:archived` to `:draft`
- Cannot unarchive directly to published (must go through draft → publish workflow)
- form_admin permission required

**Rationale:** Flexibility without risk (unarchive to draft, review, then re-publish if needed)

---

**Q26d: What happens to existing submissions when form is archived?** ✅ **OPTION A - Remain viewable (read-only)**

**Answer:** Submissions remain visible and exportable when form is archived

**Implementation:**
- Archived forms show in forms list with "Archived" badge
- Submissions table still shows all historical submissions
- Cannot add new submissions to archived forms
- Can still export, view, and analyze existing submissions
- lead_admin and lead_viewer can still access submission data

**Rationale:** Data preservation - never lose submission history

---

### Q27: Submission Editing & Deletion

**Context:**
- No mention of whether submissions can be edited after submission
- No specification of who can delete submissions

**Questions:**

**Decision Date:** 2025-11-16

**Q27a: Can users edit their own submissions?** ✅ **OPTION C - Immutable submissions**

**Answer:** Submissions cannot be edited after submission (immutable)

**Implementation:**
- No `update` action on Submission resource for regular users
- Submission form data is read-only after creation
- If user needs to correct data, they must submit a new submission

**Rationale:**
- Data integrity - maintain accurate audit trail
- Compliance - some industries require immutable records
- Analytics accuracy - prevents retroactive data changes affecting reports

---

**Q27b: Can lead_admin edit submissions?** ✅ **OPTION B - Edit notes/tags only**

**Answer:** lead_admin can add metadata (notes, tags, status) but NOT edit form field data

**Implementation:**
```elixir
# Submission resource
attributes do
  # Immutable form data
  attribute :data, :map, allow_nil?: false, writable?: [:create]

  # Mutable metadata (lead management)
  attribute :notes, :string
  attribute :tags, {:array, :string}, default: []
  attribute :lead_status, :atom  # new, contacted, qualified, converted, etc.
end

actions do
  update :update_metadata do
    accept [:notes, :tags, :lead_status]
    # data field NOT in accept list
  end
end

policies do
  policy action(:update_metadata) do
    authorize_if has_form_permission(:update_submission)  # lead_admin
  end
end
```

**Rationale:**
- Preserves submission integrity while enabling lead management
- lead_admin can track follow-up without altering original data
- Clear separation: form data (immutable) vs lead metadata (mutable)

---

**Q27c: Who can delete submissions?** ✅ **OPTION C - Soft delete with audit trail**

**Answer:** lead_admin and form_admin can soft-delete submissions

**Implementation:**
```elixir
# Add to submissions table
attribute :deleted_at, :utc_datetime_usec
attribute :deleted_by_authz_user_id, :uuid

actions do
  update :delete do  # Soft delete
    accept []
    change set_attribute(:deleted_at, &DateTime.utc_now/0)
    change set_attribute(:deleted_by_authz_user_id, actor(:id))
  end

  update :restore do  # Undelete
    accept []
    change set_attribute(:deleted_at, nil)
    change set_attribute(:deleted_by_authz_user_id, nil)
  end
end

# Default reads exclude deleted
read :list do
  primary? true
  filter expr(is_nil(deleted_at))
end

# Admins can see deleted
read :list_including_deleted do
  filter expr(true)  # No filter, shows all
end
```

**Rationale:**
- Audit compliance - track who deleted what and when
- Reversible - can restore accidentally deleted submissions
- GDPR-friendly - can hard-delete later if user requests data removal

---

### Q28: Shared Layout Implementation Timing

**Decision Date:** 2025-11-16

**✅ OPTION A - Phase 1, Week 1 - BEFORE ANY PAGES**

**Answer:** Shared layout with company context MUST be implemented FIRST, before building any feature pages

**Rationale (from specs/01-domains/authorization/):**
- Multi-tenancy requires company context in ALL pages
- `specs/.../REVIEW_QUESTIONS.md:Q2` mandates:
  - `lib/clientt_crm_app_web/live_authz_auth.ex` module
  - `on_mount` hook for company context enforcement
  - Session plug for HTTP requests
- Cannot build ANY LiveView pages without company_id filtering
- Row-level security policies require `actor(:current_company_id)` from session

**Implementation Order (Phase 1, Week 1):**

1. **Session Management** (Day 1-2)
   ```elixir
   # lib/clientt_crm_app_web/live_authz_auth.ex
   defmodule ClienttCrmAppWeb.LiveAuthzAuth do
     import Phoenix.LiveView
     import Phoenix.Component

     def on_mount(:require_company_context, _params, session, socket) do
       socket =
         socket
         |> assign_current_company(session)
         |> assign_current_authz_user(session)

       if socket.assigns[:current_company_id] do
         {:cont, socket}
       else
         {:halt, redirect(socket, to: "/select-company")}
       end
     end
   end
   ```

2. **Shared Layout Components** (Day 2-3)
   - Header with company switcher
   - Sidebar with navigation (role-based visibility)
   - Main content area wrapper

3. **Router Configuration** (Day 3)
   ```elixir
   live_session :authenticated_with_company,
     on_mount: [
       {ClienttCrmAppWeb.LiveUserAuth, :ensure_authenticated},
       {ClienttCrmAppWeb.LiveAuthzAuth, :require_company_context}
     ] do
     # All form pages go here
   end
   ```

4. **Then Start Building Feature Pages** (Day 4+)
   - Dashboard
   - Forms list
   - Form builder
   - etc.

**Impact:**
- ✅ Zero rework - all pages built correctly from start
- ✅ Consistent UX - company context always available
- ✅ Security enforced - no pages bypass multi-tenancy
- ✅ Clean architecture - separation of concerns

---

## ⚠️ IMPORTANT QUESTIONS (Should Answer Now)

### Q29: Dark Mode Priority

**Context:**
- Listed in Phase 3 (Polish) in PRIMARY-OVERVIEW.md
- UI-LAYOUT-AND-ROLES.md shows dark mode toggle in header
- Tailwind CSS dark: classes are easy to add upfront

**Question:** Is dark mode must-have for MVP or nice-to-have?

**Options:**
- **A) Must-have for MVP** (Phase 1-2)
  - Implement dark mode classes from start
  - Toggle in header from day 1
  - Less rework

- **B) Nice-to-have** (Phase 3 if time permits)
  - Build light mode only initially
  - Add dark mode in polish phase
  - Potential rework

- **C) Post-MVP** (not in 6-week timeline)

**Recommendation:** Option A if using Tailwind (minimal extra effort to add `dark:` classes)

**Your Answer:** ✅ **OPTION A - Must-have for MVP (Phase 1-2)**

**Decision Date:** 2025-11-16

**Implementation:**
- Use DaisyUI's built-in dark theme support
- Apply `dark:` class variants as components are built
- Add theme toggle in shared header (moon/sun icon)
- Store user preference in browser localStorage or user preferences
- Test both light and dark modes during development

**Rationale:**
- DaisyUI provides dark theme out of the box (minimal extra effort)
- Adding dark mode later requires revisiting every component (more work)
- Modern UX expectation - users appreciate dark mode option
- Tailwind `dark:` classes are simple to add during initial development
- Better to build it in from start than retrofit

**Notes:** Move dark mode from Phase 3 to Phase 1 in PRIMARY-OVERVIEW.md

---

### Q30: Form Builder Drag-and-Drop Implementation

**Context:**
- Figma shows drag-and-drop form builder (FormBuilderPage.tsx - 1,434 lines)
- No specification of how to implement in LiveView

**Question:** How should drag-and-drop be implemented?

**Options:**
- **A) JavaScript library + LiveView hooks**
  - Use SortableJS or similar via hooks
  - LiveView maintains state, JS handles drag UX
  - Standard approach for LiveView drag-drop

- **B) Pure LiveView** (phx-click to reorder)
  - No drag-drop, use up/down buttons
  - Simpler but less intuitive UX
  - Faster to implement

- **C) Custom JavaScript** (more control)
  - Write custom drag-drop in app.js
  - More work but fully customized

**Recommendation:** Option A - Use SortableJS with LiveView hooks (proven pattern)

**Your Answer:** ✅ **OPTION A - SortableJS + LiveView hooks**

**Decision Date:** 2025-11-16

**Implementation:**
```javascript
// assets/js/app.js - Add SortableJS hook
import Sortable from 'sortablejs'

let Hooks = {}
Hooks.Sortable = {
  mounted() {
    let group = this.el.dataset.group
    Sortable.create(this.el, {
      animation: 150,
      group: group,
      handle: '.drag-handle',
      onEnd: (evt) => {
        this.pushEvent('reorder', {
          from: evt.oldIndex,
          to: evt.newIndex
        })
      }
    })
  }
}
```

```elixir
# Form builder LiveView
def handle_event("reorder", %{"from" => from, "to" => to}, socket) do
  fields = reorder_fields(socket.assigns.fields, from, to)
  {:noreply, assign(socket, fields: fields)}
end
```

**Rationale:**
- Proven pattern in LiveView ecosystem
- Great UX with smooth drag animations
- LiveView maintains authoritative state
- JavaScript only handles UI interactions
- Well-documented with many community examples

**Dependencies:**
- Add `sortablejs` to package.json: `npm install sortablejs --save`

**Notes:** This approach is used successfully in many production LiveView apps for drag-drop interfaces

---

### Q31: Real-Time Submission Notifications

**Context:**
- Phoenix PubSub is available
- No specification of real-time features

**Question:** Should new submissions appear in real-time?

**Options:**
- **A) Yes - Use Phoenix PubSub**
  - Submissions broadcast to all users viewing form/dashboard
  - KPI cards update live
  - Modern UX

- **B) No - Manual refresh only**
  - Simpler implementation
  - Users click refresh to see new data

- **C) Polling** (refresh every 30s automatically)
  - Middle ground
  - No PubSub needed

**Recommendation:** Option A - PubSub is already available, adds great UX

**Your Answer:** ✅ **OPTION A - Yes, use Phoenix PubSub**

**Decision Date:** 2025-11-16

**Implementation:**
```elixir
# When new submission is created
defmodule ClienttCrmApp.Forms.Submission do
  # ... resource definition ...

  changes do
    change after_action(fn changeset, submission, _context ->
      # Broadcast to company-scoped topic
      Phoenix.PubSub.broadcast(
        ClienttCrmApp.PubSub,
        "company:#{submission.company_id}:submissions",
        {:new_submission, submission}
      )
      {:ok, submission}
    end)
  end
end

# In dashboard LiveView
def mount(_params, _session, socket) do
  company_id = socket.assigns.current_company_id
  Phoenix.PubSub.subscribe(ClienttCrmApp.PubSub, "company:#{company_id}:submissions")
  {:ok, load_dashboard_data(socket)}
end

def handle_info({:new_submission, submission}, socket) do
  # Update KPIs and submission list
  {:noreply,
    socket
    |> update_kpis()
    |> prepend_submission(submission)
    |> put_flash(:info, "New submission received!")}
end
```

**Rationale:**
- PubSub already available (no new dependencies)
- Modern, collaborative UX
- Perfect for teams monitoring forms together
- KPIs and submission lists update automatically
- Scoped to company (multi-tenancy safe)

**Features Enabled:**
- Dashboard KPIs update live when new submission arrives
- Submission list shows new entries immediately
- Form detail page updates submission count in real-time
- Optional toast notification for new submissions

**Notes:** Use company-scoped topics to ensure proper multi-tenancy isolation

---

### Q32: Database Deletion Strategy

**Context:**
- No specification of soft vs hard deletes
- Audit trail implications

**Question:** Should records be soft-deleted or hard-deleted?

**Options:**
- **A) Soft delete everything** (add `deleted_at` timestamp)
  - Forms, FormFields, Submissions all soft-deleted
  - Can recover accidentally deleted data
  - Better for audit trails
  - Requires filtering `deleted_at IS NULL` in queries

- **B) Hard delete** (actual DELETE from database)
  - Simpler queries
  - No recovery possible
  - GDPR-friendly (data actually gone)

- **C) Hybrid**
  - Soft delete forms and submissions (valuable data)
  - Hard delete form fields (structural changes)

**Recommendation:** Option C - Hybrid approach

**Your Answer:** ✅ **OPTION C - Hybrid approach**

**Decision Date:** 2025-11-16

**Implementation:**

**Forms - Soft Delete:**
```elixir
# Form resource
attributes do
  attribute :deleted_at, :utc_datetime_usec
  attribute :deleted_by_authz_user_id, :uuid
end

actions do
  destroy :delete do  # Soft delete
    soft? true
    change set_attribute(:deleted_at, &DateTime.utc_now/0)
    change set_attribute(:deleted_by_authz_user_id, actor(:id))
  end
end

# Default reads exclude deleted
read :list do
  primary? true
  filter expr(is_nil(deleted_at))
end
```

**Submissions - Soft Delete (already decided in Q27c):**
- Same pattern as Forms
- Preserves submission data for audit/compliance

**FormFields - Hard Delete:**
```elixir
# FormField resource - NO deleted_at attribute
actions do
  destroy :destroy do
    # Actual database DELETE
    # Cascades when form is edited
  end
end
```

**Rationale:**
- **Forms:** Valuable historical data, may want to restore
- **Submissions:** Critical business data, audit compliance (Q27c)
- **FormFields:** Structural elements that change frequently, hard delete simplifies form editing

**Database Schema:**
```sql
-- Forms table: includes soft delete fields
ALTER TABLE forms
  ADD COLUMN deleted_at TIMESTAMP,
  ADD COLUMN deleted_by_authz_user_id UUID REFERENCES authz_users(id);

-- Submissions table: includes soft delete fields (from Q27c)
ALTER TABLE submissions
  ADD COLUMN deleted_at TIMESTAMP,
  ADD COLUMN deleted_by_authz_user_id UUID REFERENCES authz_users(id);

-- FormFields table: NO soft delete (hard delete on cascade)
-- No changes needed
```

**Notes:** Consistent with Q27c decision. Forms and submissions preserve audit trail, FormFields allow clean structural changes.

---

### Q33: Form Versioning / Change Tracking

**Context:**
- Forms can be edited (fields added/removed/reordered)
- No specification of how to track changes
- Affects submission interpretation (if form structure changed)

**Question:** Should form structure changes be versioned?

**Options:**
- **A) Yes - Full versioning**
  - Create `form_versions` table
  - Each submission links to specific version
  - Can view historical form structure
  - Complex but robust

- **B) Yes - Snapshot approach**
  - Store form structure JSON in submissions table
  - Simpler than full versioning
  - Snapshot at submission time

- **C) No - Just track updated_at**
  - Submissions always interpreted with current form structure
  - Simplest but problematic if form changes significantly

- **D) Post-MVP** (don't implement for v1)

**Recommendation:** Option B or D - Snapshot if needed, otherwise post-MVP

**Your Answer:** ✅ **OPTION B - Snapshot approach**

**Decision Date:** 2025-11-16

**Implementation:**
```elixir
# Submission resource
attributes do
  # Immutable submission data (from form fields)
  attribute :data, :map, allow_nil?: false, writable?: [:create]

  # NEW: Snapshot of form structure at submission time
  attribute :form_snapshot, :map, allow_nil?: false, writable?: [:create]
  # Contains: %{
  #   form_name: "Contact Form",
  #   fields: [
  #     %{id: "uuid", label: "Name", field_type: "text", order: 1},
  #     %{id: "uuid", label: "Email", field_type: "email", order: 2},
  #     ...
  #   ]
  # }

  # Lead metadata (mutable - from Q27b)
  attribute :notes, :string
  attribute :tags, {:array, :string}
  attribute :lead_status, :atom
end

# On submission creation
changes do
  change fn changeset, _context ->
    form_id = Ash.Changeset.get_attribute(changeset, :form_id)

    # Load form with all fields
    form = Form
      |> Ash.Query.filter(id == ^form_id)
      |> Ash.Query.load(:fields)
      |> Ash.read_one!()

    # Create snapshot
    snapshot = %{
      form_name: form.name,
      form_settings: form.settings,
      fields: Enum.map(form.fields, fn field ->
        %{
          id: field.id,
          label: field.label,
          field_type: field.field_type,
          placeholder: field.placeholder,
          required: field.required,
          options: field.options,
          order: field.order_index
        }
      end)
    }

    Ash.Changeset.force_change_attribute(changeset, :form_snapshot, snapshot)
  end
end
```

**Database Schema:**
```sql
-- Add to submissions table
ALTER TABLE submissions
  ADD COLUMN form_snapshot JSONB NOT NULL DEFAULT '{}';

CREATE INDEX idx_submissions_form_snapshot
  ON submissions USING GIN (form_snapshot);
```

**Rationale:**
- **Simple:** No additional tables, just one JSONB column
- **Complete:** Preserves exact form structure at submission time
- **Flexible:** Can always interpret submission correctly even if form changes
- **Queryable:** GIN index allows searching within snapshot if needed

**Use Cases:**
- Display submission with original field labels (even if form was edited)
- Export submissions with correct historical field names
- Audit trail of form structure changes
- Analytics on field changes over time

**Notes:** Snapshot is created automatically on submission and is immutable (same as submission data from Q27a)

---

## 📋 ADDITIONAL CLARIFICATIONS NEEDED

### Q34: Forms Domain Name

**Context:**
- Track 3 suggests `lib/clientt_crm_app/forms.ex` as domain
- Should verify this doesn't conflict with existing domains

**Question:** Confirm domain name for Ash

**Your Answer:** ✅ **Use "Forms" - No conflicts found**

**Decision Date:** 2025-11-16

**Verification:**
Existing domains in `lib/clientt_crm_app/`:
- `accounts.ex` - User authentication (AshAuthentication)
- `authorization.ex` - Multi-tenancy (Companies, Teams, AuthzUsers)
- ✅ **No "forms.ex" exists - safe to use**

**Implementation:**
```elixir
# lib/clientt_crm_app/forms.ex
defmodule ClienttCrmApp.Forms do
  use Ash.Domain

  resources do
    resource ClienttCrmApp.Forms.Form
    resource ClienttCrmApp.Forms.FormField
    resource ClienttCrmApp.Forms.Submission
  end
end
```

**Directory Structure:**
```
lib/clientt_crm_app/
├── accounts.ex (existing)
├── authorization.ex (existing)
├── forms.ex (NEW)
└── forms/
    ├── form.ex (NEW)
    ├── form_field.ex (NEW)
    └── submission.ex (NEW)
```

**Notes:** "Forms" domain name confirmed - no conflicts with existing domains (accounts, authorization)

---

### Q35: Authentication Flow for Form Submissions

**Context:**
- Forms can be submitted by external users (leads)
- Do submitters need to be authenticated?

**Question:** Are public form submissions allowed?

**Options:**
- **A) Yes - Public forms** (unauthenticated submissions)
  - Forms have public URL (slug-based)
  - Anyone can submit
  - No login required
  - Standard use case

- **B) No - Authenticated only**
  - Submitters must have user accounts
  - More secure but limits usage

**Recommendation:** Option A - Public submissions (standard form behavior)

**Your Answer:** ✅ **OPTION A - Yes, public forms (unauthenticated submissions)**

**Decision Date:** 2025-11-16

**Implementation:**

**Public Form URL:**
- Route: `/f/{slug}` (e.g., `/f/contact-us`)
- No authentication required
- Form renders with public layout (no sidebar/header)

**Router Configuration:**
```elixir
# lib/clientt_crm_app_web/router.ex

# Public form submission (no auth required)
scope "/f", ClienttCrmAppWeb do
  pipe_through :browser  # No :require_authenticated_user

  live "/:slug", PublicFormLive.Show, :show
end

# Authenticated form management
scope "/forms", ClienttCrmAppWeb do
  pipe_through [:browser, :require_authenticated_user]

  live "/", FormLive.Index, :index
  live "/new", FormLive.New, :new
  live "/:id", FormLive.Show, :show
  # ... etc
end
```

**Security Measures:**
- Rate limiting on submission endpoint (prevent spam)
- Optional CAPTCHA support (can add in Phase 3 if needed)
- CSRF protection via Phoenix (already built-in)
- Sanitize submitted data (prevent XSS)

**Submission Creation:**
```elixir
# Public submission - no actor required
Submission
|> Ash.Changeset.for_create(:public_create, %{
  form_id: form.id,
  company_id: form.company_id,  # Inherited from form
  data: submitted_data,
  metadata: %{
    ip_address: get_ip(socket),
    user_agent: get_user_agent(socket),
    referrer: get_referrer(socket)
  }
})
|> Ash.create()
```

**Use Cases:**
- Website contact forms
- Lead capture forms
- Event registration
- Newsletter signup
- Customer feedback forms

**Notes:** Standard form behavior. Forms are created/managed by authenticated users, but submissions are public. Company context inherited from the form itself.

---

### Q36: Form Slug Generation

**Context:**
- Forms table has `slug VARCHAR(255) UNIQUE`
- Used for public URL: `/f/{slug}`

**Question:** How are slugs generated?

**Options:**
- **A) Auto-generated from form name** (e.g., "Contact Us" → "contact-us")
  - Handle conflicts by adding number: "contact-us-2"

- **B) User-specified** (editable in form settings)
  - More control but must validate uniqueness

- **C) Random** (UUIDs or short random strings)
  - Guaranteed unique but not SEO-friendly

**Recommendation:** Option A - Auto-generated with conflict resolution

**Your Answer:** ✅ **OPTION C - Random UUIDs**

**Decision Date:** 2025-11-16

**Implementation:**
```elixir
# Form resource
defmodule ClienttCrmApp.Forms.Form do
  use Ash.Resource, ...

  attributes do
    uuid_primary_key :id

    # Slug is auto-generated UUID-based short string
    attribute :slug, :string do
      allow_nil? false
      writable? [:create]  # Immutable after creation
      default &generate_slug/0
    end

    # ... other attributes
  end

  # Generate short random slug
  defp generate_slug do
    # Use first 8 chars of UUID for shorter URLs
    # e.g., "a3f8b2c1" instead of full UUID
    :crypto.strong_rand_bytes(8)
    |> Base.url_encode64(padding: false)
    |> binary_part(0, 8)
    |> String.downcase()
  end

  # Alternative: Use full UUID if preferred
  # defp generate_slug, do: Ash.UUID.generate()
end
```

**Database Schema:**
```sql
-- Slug unique constraint per company (from Q24)
ALTER TABLE forms
  ADD CONSTRAINT unique_slug_per_company
  UNIQUE (company_id, slug);

-- Index for fast slug lookups
CREATE INDEX idx_forms_slug ON forms(slug);
```

**Public URL Examples:**
- `/f/a3f8b2c1` (8-char random string)
- `/f/x7k9m2p4`
- `/f/b5n8q1r3`

**Rationale:**
- **Guaranteed uniqueness:** No conflicts, no collision handling needed
- **Security:** Obscures form IDs, harder to enumerate forms
- **Simple:** No validation logic, no conflict resolution
- **Immutable:** Slug never changes once created
- **Shorter option:** 8-char strings more user-friendly than full UUIDs

**Trade-offs Accepted:**
- ❌ Not SEO-friendly (no keywords in URL)
- ❌ Not memorable for sharing
- ✅ But prioritizes security and simplicity

**Notes:** Using 8-character base64-encoded random strings instead of full UUIDs for slightly better UX while maintaining uniqueness guarantees

---

## 🔍 Cross-Reference Checklist

Verify these requirements from `UI-LAYOUT-AND-ROLES.md` are captured:

- [x] ✅ Shared header specification (captured in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ Shared sidebar specification (captured in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ 4 roles defined (form_admin, form_viewer, lead_admin, lead_viewer)
- [x] ✅ super_admin role (mentioned in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ Role-based sidebar visibility (shown in code examples)
- [x] ✅ Detail views over modals preference (specified)
- [x] ✅ Mobile responsive requirement (mentioned)
- [ ] ❌ Role assignment workflow (Q25 - NOT in original questions)
- [ ] ❌ Company/org scoping (Q24 - NOT in original questions)
- [ ] ❌ Layout implementation timing (Q28 - NOT in original questions)

Verify these from `FIGMA-COVERAGE-ANALYSIS.md`:

- [x] ✅ All 12 pages inventoried
- [x] ✅ MVP vs Future separation
- [x] ✅ Component mapping
- [x] ✅ Technology conversion matrix
- [ ] ⚠️ Auth components (SignOutDialog, TwoFactorSetup) - Low priority, can use existing patterns
- [x] ✅ Contacts pages - Out of scope, documented as such

---

## 📊 Impact Assessment

### If Q24 (Multi-tenancy) is "Yes":

**Immediate Impacts:**
1. ⚠️ Database schema must change (add `company_id` to forms, form_fields, submissions)
2. ⚠️ UserRole resource needs company scoping
3. ⚠️ All Ash policies need company-level row-level security
4. ⚠️ LiveView pages need current_company context
5. ⚠️ Sidebar needs company switcher
6. ⚠️ Forms listing filtered by company
7. ⚠️ Analytics scoped to company

**Files Affected:**
- `00-PRIMARY-OVERVIEW.md` - Database schema
- `03-forms-domain-models/README.md` - All resources and policies
- `02-forms-liveview-ui/README.md` - All LiveView pages
- `UI-LAYOUT-AND-ROLES.md` - Sidebar, role definitions

**Estimated Rework:** 2-3 days if discovered after starting implementation

---

### If Q24 (Multi-tenancy) is "No":

**Immediate Impacts:**
1. ✅ Can proceed with current schema
2. ✅ Simpler policies (user-level only)
3. ⚠️ May need to add later (costly refactor)

**Recommendation:** Even if "No" for MVP, design schema to support adding `company_id` later (nullable column)

---

### If Q25 (Role Assignment) is "No UI for MVP":

**Immediate Impacts:**
1. ⚠️ Must create seed script to assign roles
2. ⚠️ Testing requires manual database updates
3. ⚠️ Settings page scope reduced

**Workaround:** Add simple role management to settings page (should take <1 day)

---

### If Q28 (Layout Timing) is "Phase 2" instead of "Phase 1":

**Immediate Impacts:**
1. ⚠️ Dashboard built without layout
2. ⚠️ Refactoring required when layout added
3. ⚠️ Inconsistent UX during development

**Recommendation:** Implement layout in Phase 1, Week 1 (before first pages)

---

## 🎯 Recommended Actions

### Immediate (Today):
1. ✅ Review this document
2. ✅ Answer Q24-Q28 (CRITICAL questions)
3. ✅ Update PRIMARY-OVERVIEW.md database schema if Q24 = "Yes"
4. ✅ Update UI-LAYOUT-AND-ROLES.md if company scoping needed

### Before Spec Creation:
1. ✅ Answer Q29-Q33 (IMPORTANT questions)
2. ✅ Update relevant track READMEs
3. ✅ Merge this file's answers into MVP-REVIEW-ISSUES-AND-QUESTIONS.md

### Before Implementation:
1. ✅ Confirm all 36 questions answered
2. ✅ Database schema finalized
3. ✅ Track READMEs updated
4. ✅ Everyone on team aligned

---

## 📝 Notes Section

**User Notes:**
[Space for user to write additional context, decisions, or concerns]

---

**Status:** 🔴 AWAITING CRITICAL ANSWERS
**Priority:** HIGHEST - Blocks all other work
**Reviewed By:** _______________________
**Date Reviewed:** _______________________
