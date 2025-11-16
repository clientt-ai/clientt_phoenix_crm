# Forms Dashboard - Critical Decisions Summary

**Date:** 2025-11-16
**Status:** ✅ All Critical Blocking Questions Resolved
**Ready for:** Spec Generation & Implementation Planning

---

## Executive Summary

All critical blocking questions (Q24-Q28) for the Forms Dashboard implementation have been answered. The project will implement full multi-tenancy with company-based data isolation, feature-specific roles stored in JSONB, and comprehensive row-level security following existing authorization patterns.

**Key Decision:** Forms are company-scoped resources requiring `company_id` on all tables and proper isolation policies.

---

## Critical Decisions Made

### ✅ Q24: Multi-Tenancy Architecture

**Decision:** Forms belong to companies (Option A)

**Implementation:**
- Add `company_id UUID REFERENCES authz_companies(id)` to:
  - `forms` table
  - `form_fields` table
  - `submissions` table
- Implement Ash row-level security policies (automatic company filtering)
- All queries filtered by `current_company_id` from session
- Company_id automatically set on create, immutable after creation

**Rationale:**
- Project has existing multi-tenancy system (`lib/clientt_crm_app/authorization/`)
- Specs (`specs/01-domains/authorization/policies/row_level_security.md:20`) explicitly require company_id for "all future tenant-scoped resources"
- Ensures data isolation and consistency with existing architecture

**Updated Files:**
- `ADDITIONAL-BLOCKING-QUESTIONS.md` (Q24 answered)
- `20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md` (database schema updated)

---

### ✅ Q25: Role System & Assignment

**Decision:** Feature-based roles in JSONB (Option B)

**Implementation:**
```sql
-- Add to existing authz_users table
ALTER TABLE authz_users
  ADD COLUMN feature_roles JSONB DEFAULT '{}'::JSONB;

CREATE INDEX idx_authz_users_feature_roles_forms
  ON authz_users ((feature_roles->>'forms'));

-- Example: authz_user.feature_roles = {"forms": "form_admin"}
```

**Permission Mapping (in Elixir code):**
```elixir
# lib/clientt_crm_app/authorization/permissions.ex
@form_permissions %{
  form_admin: [:create_form, :update_form, :delete_form, :publish_form,
               :view_form, :view_all_submissions, :delete_submission, :export_submissions],
  form_viewer: [:view_form, :view_published_forms_only],
  lead_admin: [:view_all_submissions, :update_submission, :delete_submission,
               :export_submissions, :add_submission_notes],
  lead_viewer: [:view_submissions, :export_submissions]
}
```

**Role Assignment:**
- Q25a: Company `admin` role can assign any form role
- Q25b: UI in Settings page > Team Members tab
- Q25c: New users have NO form role by default (explicit grants required)

**Rationale:**
- Roles/permissions in code = version controlled, environment-agnostic
- No additional database tables needed
- Supports multiple feature-specific roles per user (future: calendar, etc.)

**Updated Files:**
- `ADDITIONAL-BLOCKING-QUESTIONS.md` (Q25a, Q25b, Q25c answered)
- `20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md` (authorization section updated)

---

### ✅ Q26: Form Status Workflow

**Decisions:**
- Q26a: Statuses = `draft`, `published`, `archived` (Option A)
- Q26b: Can unpublish (Published → Draft) ✅
- Q26c: Archiving is reversible (Archived → Draft) ✅
- Q26d: Archived form submissions remain viewable (read-only) ✅

**Implementation:**
```elixir
attribute :status, :atom do
  constraints one_of: [:draft, :published, :archived]
  default :draft
end

actions do
  update :publish   # draft → published
  update :unpublish # published → draft
  update :archive   # any → archived
  update :unarchive # archived → draft
end
```

**Rationale:**
- Matches existing Authorization domain patterns (active/archived)
- Flexibility without data loss
- Submissions always preserved for analytics/compliance

**Updated Files:**
- `ADDITIONAL-BLOCKING-QUESTIONS.md` (Q26a-d answered)

---

### ✅ Q27: Submission Editing & Deletion

**Decisions:**
- Q27a: Submissions are IMMUTABLE after submission (Option C)
- Q27b: lead_admin can edit notes/tags/metadata ONLY, NOT form data (Option B)
- Q27c: Soft delete with audit trail (Option C)

**Implementation:**
```elixir
# Submission resource
attributes do
  # IMMUTABLE form data
  attribute :data, :map, allow_nil?: false, writable?: [:create]

  # MUTABLE lead management metadata
  attribute :notes, :string
  attribute :tags, {:array, :string}, default: []
  attribute :lead_status, :atom  # new, contacted, qualified, converted, etc.

  # Soft delete tracking
  attribute :deleted_at, :utc_datetime_usec
  attribute :deleted_by_authz_user_id, :uuid
end

actions do
  # Submissions cannot be edited after creation
  update :update_metadata do  # lead_admin only
    accept [:notes, :tags, :lead_status]  # data NOT in accept list
  end

  update :delete do  # Soft delete
    change set_attribute(:deleted_at, &DateTime.utc_now/0)
    change set_attribute(:deleted_by_authz_user_id, actor(:id))
  end

  update :restore do  # Reversible
    change set_attribute(:deleted_at, nil)
  end
end
```

**Rationale:**
- Data integrity - immutable submissions preserve audit trail
- Lead management - can track follow-up without altering original data
- Compliance - soft delete supports audit requirements and GDPR (hard delete later if needed)

**Updated Files:**
- `ADDITIONAL-BLOCKING-QUESTIONS.md` (Q27a-c answered)
- `20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md` (submissions schema updated)

---

### ✅ Q28: Shared Layout Implementation Timing

**Decision:** Phase 1, Week 1 - BEFORE ANY PAGES (Option A)

**Implementation Order:**

**Week 1, Days 1-3: Session Management & Layout**
1. Create `lib/clientt_crm_app_web/live_authz_auth.ex` module
2. Implement `on_mount :require_company_context` hook
3. Create session plug for HTTP requests
4. Build shared header (company switcher)
5. Build shared sidebar (role-based navigation)

**Week 1, Day 4+: Feature Pages**
6. Start building dashboard, forms list, etc.
   - All pages automatically have company context
   - No rework needed

**Rationale (from specs):**
- `specs/01-domains/authorization/REVIEW_QUESTIONS.md:Q2` mandates these components
- Multi-tenancy requires company context in ALL LiveView pages
- Row-level security policies depend on `actor(:current_company_id)` from session
- Building pages without layout = guaranteed rework

**Updated Files:**
- `ADDITIONAL-BLOCKING-QUESTIONS.md` (Q28 answered with detailed implementation order)

---

## Additional Insights from Specs

### Multi-Tenancy Patterns (from specs/01-domains/authorization/)

**Row-Level Security Requirements:**
- ALL tenant-scoped tables MUST have `company_id` column
- Automatic filtering: `authorize_if expr(company_id == ^actor(:current_company_id))`
- Company_id is immutable (set on create, never updateable)
- Bulk operations automatically scoped to current company

**Session Structure:**
```elixir
%{
  current_authn_user: %User{id: "uuid", email: "user@example.com"},
  current_company_id: "acme-uuid",
  current_authz_user: %AuthzUser{
    id: "authz-uuid",
    company_id: "acme-uuid",
    role: :admin,
    feature_roles: %{forms: :form_admin}
  }
}
```

### Design System (from specs/05-ui-design/)

**DO NOT export HTML/TSX from Figma**
- Use Figma as design reference only
- Manually implement with Phoenix LiveView HEEx templates
- Use DaisyUI Tailwind classes to match designs
- Component library: DaisyUI Figma Library 2.0 + Nexus Components

---

## Database Schema Changes Summary

### New Tables (None - using existing authz_users)

### Modified Tables

**authz_users** (existing table):
```sql
ALTER TABLE authz_users
  ADD COLUMN feature_roles JSONB DEFAULT '{}'::JSONB;

CREATE INDEX idx_authz_users_feature_roles_forms
  ON authz_users ((feature_roles->>'forms'));
```

### New Tables for Forms

**forms:**
```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,  -- NEW
  created_by_authz_user_id UUID NOT NULL REFERENCES authz_users(id),         -- NEW (was user_id)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'draft',
  slug VARCHAR(255) NOT NULL,
  view_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(company_id, slug)  -- NEW: Slug unique per company
);

CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_forms_company_status ON forms(company_id, status);
CREATE INDEX idx_forms_created_by ON forms(created_by_authz_user_id);
```

**form_fields:**
```sql
CREATE TABLE form_fields (
  id UUID PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,  -- NEW
  field_type VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  options JSONB,
  order_index INTEGER NOT NULL,
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_form_fields_company_id ON form_fields(company_id);
```

**submissions:**
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,  -- NEW
  submitted_data JSONB NOT NULL,  -- Immutable
  lead_email VARCHAR(255),
  lead_name VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP NOT NULL,
  -- NEW: Lead management fields
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  lead_status VARCHAR(50) DEFAULT 'new',
  -- NEW: Soft delete
  deleted_at TIMESTAMP,
  deleted_by_authz_user_id UUID REFERENCES authz_users(id),
  inserted_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_submissions_company_id ON submissions(company_id);
CREATE INDEX idx_submissions_deleted_at ON submissions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_submissions_lead_status ON submissions(company_id, lead_status);
```

---

## Removed from Original Plans

**user_roles table** - DELETED
- Original plan had separate `user_roles` table
- Replaced with `authz_users.feature_roles` JSONB field
- Roles and permissions managed in code, not database

---

## Files Updated

1. ✅ `ADDITIONAL-BLOCKING-QUESTIONS.md` - All Q24-Q28 answered
2. ✅ `20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md` - Database schema updated
3. ✅ `.claude/skills/figma-to-dev-plans/SKILL.md` - Added Step 3: Check Specs
4. ✅ `.claude/skills/ash-guidelines/SKILL.md` - Added Multi-Tenancy section
5. ✅ `DECISIONS-SUMMARY-2025-11-16.md` - This file

---

## Next Steps

### Immediate (Before Implementation)

1. **Review MVP Scope Questions (Q1-Q23)** if needed
   - Field types for MVP
   - Validation rules
   - Export formats
   - Performance targets

2. **Create Ash Resource Specifications**
   - Form resource with company_id and policies
   - FormField resource
   - Submission resource with metadata fields
   - Permissions module

3. **Create Permission Module**
   - `lib/clientt_crm_app/authorization/permissions.ex`
   - Define @form_permissions map
   - Implement has_form_permission?/2 helper

### Week 1 (Before Feature Development)

4. **Implement Session Management**
   - `lib/clientt_crm_app_web/live_authz_auth.ex`
   - `on_mount :require_company_context` hook
   - Session plug for HTTP requests

5. **Build Shared Layout**
   - Header with company switcher
   - Sidebar with role-based navigation
   - Configure router with live_session

6. **Add feature_roles Migration**
   ```bash
   mix ash_postgres.generate_migrations --name add_feature_roles_to_authz_users
   ```

### Week 2+ (Feature Development)

7. **Implement Forms Domain**
   - Create Ash resources following multi-tenancy patterns
   - Implement row-level security policies
   - Test company isolation

8. **Build LiveView Pages**
   - Dashboard (with company context)
   - Forms list (filtered by company_id)
   - Form builder
   - Submission management

---

## Reference Documentation

**Existing Specs:**
- `specs/01-domains/authorization/policies/row_level_security.md` - Row-level security patterns
- `specs/01-domains/authorization/features/multi_tenancy.feature.md` - Multi-tenancy BDD scenarios
- `specs/01-domains/authorization/REVIEW_QUESTIONS.md` - Session management decisions

**Existing Code:**
- `lib/clientt_crm_app/authorization/company.ex` - Company resource example
- `lib/clientt_crm_app/authorization/authz_user.ex` - AuthzUser with company scoping
- `lib/clientt_crm_app/authorization/team.ex` - Team resource with policies

**Project Guidelines:**
- `/project-guidelines` - Phoenix v1.8 conventions, workflow
- `/elixir-guidelines` - Elixir patterns
- `/liveview-guidelines` - LiveView best practices
- `/html-guidelines` - HEEx template patterns

---

## Success Criteria

**Technical:**
- ✅ All tables have company_id where required
- ✅ Row-level security policies prevent cross-company data access
- ✅ Session management provides company context to all pages
- ✅ Permissions defined in code (not database)
- ✅ Submissions are immutable with mutable metadata
- ✅ Soft delete with audit trail

**Architectural:**
- ✅ Consistent with existing Authorization domain
- ✅ Follows specs/01-domains/authorization/ patterns
- ✅ Clean separation: authentication vs authorization
- ✅ Clean separation: form data (immutable) vs lead metadata (mutable)

**Security:**
- ✅ Complete data isolation between companies
- ✅ No data leakage via direct ID access
- ✅ Company_id cannot be tampered with
- ✅ Automatic filtering on all queries

---

**Status:** ✅ READY FOR IMPLEMENTATION
**Blocking Issues:** NONE
**Last Updated:** 2025-11-16
