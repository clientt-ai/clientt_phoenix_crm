# Multi-Tenant Authorization - Implementation Plan

## Overview

This document provides a detailed, phase-by-phase implementation plan for the multi-tenant authorization system. Each phase includes specific tasks, estimated effort, and dependencies.

**Total Estimated Time:** 8 weeks
**Team Size:** 1-2 developers

---

## Phase 1: Core Authorization Domain (Weeks 1-2)

**Goal:** Establish the foundational authorization domain with Company and AuthzUser resources.

### Week 1: Domain Setup & Company Resource

#### Task 1.1: Create Authorization Domain Module
**File:** `lib/clientt_crm_app/authorization.ex`

```bash
mix ash.gen.domain ClienttCrmApp.Authorization
```

**Manual Steps:**
- [ ] Define domain module
- [ ] Configure resources list (will be empty initially)
- [ ] Update `config/config.exs` to include domain in `:ash_domains`

**Estimated Time:** 30 minutes

---

#### Task 1.2: Create Company Resource
**File:** `lib/clientt_crm_app/authorization/company.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.Company \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes: name, slug, status, settings_id, timestamps
- [ ] Add postgres configuration (table: authz_companies)
- [ ] Define actions:
  - [ ] `:create` - Create company with validations
  - [ ] `:read`, `:list` - Query companies
  - [ ] `:update` - Update company details
  - [ ] `:archive` - Custom action to archive company
  - [ ] `:suspend` - Custom action to suspend company
  - [ ] `:reactivate` - Custom action to reactivate
- [ ] Add validations:
  - [ ] Name: min 2 chars, required
  - [ ] Slug: unique, URL-safe (lowercase, alphanumeric, hyphens)
  - [ ] Status: enum validation
- [ ] Add calculations:
  - [ ] `:active_user_count` - Count active authz_users
  - [ ] `:team_count` - Count teams
- [ ] Add relationships (will define later):
  - [ ] `has_many :authz_users`
  - [ ] `has_many :teams`
  - [ ] `has_one :settings`

**Estimated Time:** 3 hours

---

#### Task 1.3: Create AuthzUser Resource
**File:** `lib/clientt_crm_app/authorization/authz_user.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.AuthzUser \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes:
  - [ ] authn_user_id (uuid)
  - [ ] company_id (uuid)
  - [ ] role (enum: admin, manager, user)
  - [ ] team_id (uuid, nullable)
  - [ ] team_role (enum: team_lead, team_member, nullable)
  - [ ] status (enum: active, inactive, suspended)
  - [ ] display_name (string, nullable)
  - [ ] joined_at, last_active_at (timestamps)
  - [ ] created_at, updated_at
- [ ] Add postgres configuration (table: authz_users)
- [ ] Add identity: [:authn_user_id, :company_id] (unique constraint)
- [ ] Define actions:
  - [ ] `:create` - Create authz_user
  - [ ] `:read`, `:list` - Query authz_users
  - [ ] `:update_role` - Custom action to change role (with last admin check)
  - [ ] `:assign_to_team` - Assign user to team
  - [ ] `:remove_from_team` - Remove team assignment
  - [ ] `:suspend`, `:reactivate`
  - [ ] `:update_last_active` - Touch last_active_at
- [ ] Add relationships:
  - [ ] `belongs_to :authn_user` (ClienttCrmApp.Accounts.User)
  - [ ] `belongs_to :company` (Company)
  - [ ] `belongs_to :team` (Team, nullable)
- [ ] Add calculations:
  - [ ] `:email` - Load from authn_user.email
  - [ ] `:full_permissions` - Derive from role + team_role
- [ ] Add validations:
  - [ ] Role required
  - [ ] team_role requires team_id (and vice versa)
  - [ ] Status required

**Estimated Time:** 4 hours

---

#### Task 1.4: Add Multi-Tenancy Policies
**Files:** `lib/clientt_crm_app/authorization/authz_user.ex`, `company.ex`

**Manual Steps:**
- [ ] Add policies to AuthzUser:
  - [ ] Company admins can manage authz_users in their company
  - [ ] Users can read authz_users in their company
  - [ ] Automatically filter by current company_id
- [ ] Add policies to Company:
  - [ ] Users can read their own companies (via authz_user relationship)
  - [ ] Admins can update their own companies
  - [ ] System can create companies
- [ ] Create custom check: `ValidateNotLastAdmin`
  - [ ] File: `lib/clientt_crm_app/authorization/checks/validate_not_last_admin.ex`
  - [ ] Prevents removing/downgrading last admin

**Estimated Time:** 3 hours

---

### Week 2: Database Migrations & Testing

#### Task 1.5: Generate Migrations
```bash
mix ash_postgres.generate_migrations --name add_authorization_domain
```

**Manual Review:**
- [ ] Review generated migration for authz_companies
- [ ] Review generated migration for authz_users
- [ ] Add custom SQL for check constraints:
  - [ ] `chk_status` on companies
  - [ ] `chk_role`, `chk_team_role`, `chk_status` on authz_users
  - [ ] `chk_team_role_requires_team` on authz_users
- [ ] Add indexes:
  - [ ] `idx_authz_companies_slug`, `idx_authz_companies_status`
  - [ ] `idx_authz_users_authn_user`, `idx_authz_users_company`, `idx_authz_users_status`

**Estimated Time:** 2 hours

---

#### Task 1.6: Run Migrations
```bash
mix ash_postgres.migrate
```

**Validation:**
- [ ] Check database schema (psql or TablePlus)
- [ ] Verify constraints are in place
- [ ] Verify indexes created

**Estimated Time:** 30 minutes

---

#### Task 1.7: Unit Tests - Company Resource
**File:** `test/clientt_crm_app/authorization/company_test.exs`

**Test Cases:**
- [ ] Create company successfully
- [ ] Validate name required
- [ ] Validate slug uniqueness
- [ ] Validate slug format (URL-safe)
- [ ] Archive company (status changes to archived)
- [ ] Calculate active_user_count
- [ ] Calculate team_count

**Estimated Time:** 3 hours

---

#### Task 1.8: Unit Tests - AuthzUser Resource
**File:** `test/clientt_crm_app/authorization/authz_user_test.exs`

**Test Cases:**
- [ ] Create authz_user successfully
- [ ] Validate (authn_user_id, company_id) uniqueness
- [ ] Validate team_role requires team_id
- [ ] Update role successfully
- [ ] Cannot remove last admin (error)
- [ ] Assign to team successfully
- [ ] Remove from team successfully
- [ ] Calculate email from authn_user
- [ ] Calculate full_permissions

**Estimated Time:** 4 hours

---

#### Task 1.9: Integration Test - Create Company with First Admin
**File:** `test/clientt_crm_app/authorization/integration/create_company_test.exs`

**Test Scenario:**
- [ ] Given an authn_user
- [ ] When creating a company
- [ ] Then company, settings, and authz_user (admin) are created in one transaction

**Estimated Time:** 2 hours

---

## Phase 2: Teams & Settings (Week 3)

**Goal:** Add Team and CompanySettings resources with relationships.

### Task 2.1: Create Team Resource
**File:** `lib/clientt_crm_app/authorization/team.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.Team \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes: company_id, name, description, status, timestamps
- [ ] Add postgres configuration (table: authz_teams)
- [ ] Add identity: [:company_id, :name] (unique per company)
- [ ] Define actions: create, read, list, update, archive
- [ ] Add relationships: `belongs_to :company`, `has_many :authz_users`
- [ ] Add calculations: `:member_count`, `:lead_count`
- [ ] Add policies: admins can manage teams, all users can read teams

**Estimated Time:** 3 hours

---

### Task 2.2: Create CompanySettings Resource
**File:** `lib/clientt_crm_app/authorization/company_settings.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.CompanySettings \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes: company_id, max_users, max_teams, features (map), branding (map), timezone, timestamps
- [ ] Add postgres configuration (table: authz_company_settings)
- [ ] Add identity: [:company_id] (unique)
- [ ] Define actions: create, read, update, toggle_feature
- [ ] Add relationships: `belongs_to :company`
- [ ] Add validations: validate max_users against current count

**Estimated Time:** 2 hours

---

### Task 2.3: Update Relationships
**Files:** `company.ex`, `authz_user.ex`

**Manual Steps:**
- [ ] Add `has_many :teams` to Company
- [ ] Add `has_one :settings` to Company
- [ ] Add `belongs_to :team` to AuthzUser (already done in Phase 1, verify)
- [ ] Add `has_many :authz_users` to Team

**Estimated Time:** 1 hour

---

### Task 2.4: Generate Migrations for Teams & Settings
```bash
mix ash_postgres.generate_migrations --name add_teams_and_settings
```

**Manual Review:**
- [ ] Review migrations
- [ ] Add check constraints
- [ ] Add indexes
- [ ] Run migrations

**Estimated Time:** 1 hour

---

### Task 2.5: Create Company Action (with settings + first admin)
**File:** Update `company.ex` `:create` action

**Manual Steps:**
- [ ] Add custom change: `CreateCompanyWithDefaults`
  - [ ] File: `lib/clientt_crm_app/authorization/changes/create_company_with_defaults.ex`
  - [ ] Creates CompanySettings record
  - [ ] Creates first AuthzUser (admin role) for creator
- [ ] Add argument: `first_admin_authn_user_id`
- [ ] Wrap in transaction

**Estimated Time:** 3 hours

---

### Task 2.6: Unit Tests - Team Resource
**File:** `test/clientt_crm_app/authorization/team_test.exs`

**Test Cases:**
- [ ] Create team successfully
- [ ] Validate name uniqueness per company
- [ ] Archive team (must have no active members)
- [ ] Calculate member_count

**Estimated Time:** 2 hours

---

### Task 2.7: Unit Tests - CompanySettings Resource
**File:** `test/clientt_crm_app/authorization/company_settings_test.exs`

**Test Cases:**
- [ ] Create settings successfully
- [ ] Update settings successfully
- [ ] Toggle feature flag
- [ ] Validate max_users against current count

**Estimated Time:** 2 hours

---

## Phase 3: Invitations (Week 4)

**Goal:** Implement full invitation workflow with email sending and acceptance.

### Task 3.1: Create Invitation Resource
**File:** `lib/clientt_crm_app/authorization/invitation.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.Invitation \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes: company_id, email, invited_by_authz_user_id, role, team_id, team_role, token, status, expires_at, accepted_at, accepted_by_authn_user_id, message, timestamps
- [ ] Add postgres configuration (table: authz_invitations)
- [ ] Add identity: [:token] (unique)
- [ ] Define actions:
  - [ ] `:create` - Send invitation
  - [ ] `:read`, `:list`, `:get_by_token`
  - [ ] `:accept` - Accept invitation
  - [ ] `:revoke` - Revoke invitation
  - [ ] `:check_expiration` - Mark expired invitations (background job)
- [ ] Add relationships: `belongs_to :company`, `belongs_to :invited_by`, `belongs_to :accepted_by`
- [ ] Add policies: admins/managers can create, token holder can accept

**Estimated Time:** 4 hours

---

### Task 3.2: Token Generation Change
**File:** `lib/clientt_crm_app/authorization/changes/generate_invitation_token.ex`

**Manual Steps:**
- [ ] Implement Ash.Resource.Change
- [ ] Generate secure token (32 bytes, URL-safe base64)
- [ ] Set expires_at (7 days from now)
- [ ] Set status to "pending"

**Estimated Time:** 1 hour

---

### Task 3.3: Email Sender - Invitation Email
**File:** `lib/clientt_crm_app/authorization/senders/send_invitation_email.ex`

**Manual Steps:**
- [ ] Create email template (HEEx): `lib/clientt_crm_app_web/emails/invitation.html.heex`
- [ ] Implement sender module
- [ ] Include invitation link with token
- [ ] Add company name, inviter name, role

**Estimated Time:** 2 hours

---

### Task 3.4: Acceptance Change
**File:** `lib/clientt_crm_app/authorization/changes/accept_invitation.ex`

**Manual Steps:**
- [ ] Implement Ash.Resource.Change
- [ ] Validate invitation is pending and not expired
- [ ] Check if user already has authz_user for company (error if yes)
- [ ] Create AuthzUser with specified role/team
- [ ] Update invitation status to "accepted"
- [ ] Set accepted_at and accepted_by_authn_user_id

**Estimated Time:** 3 hours

---

### Task 3.5: Expiration Check (Background Job)
**File:** `lib/clientt_crm_app/authorization/workers/expire_invitations.ex`

**Manual Steps:**
- [ ] Create Oban worker (or GenServer if no Oban)
- [ ] Schedule to run daily
- [ ] Query pending invitations where expires_at < now()
- [ ] Update status to "expired"

**Estimated Time:** 2 hours

---

### Task 3.6: Generate Migrations for Invitations
```bash
mix ash_postgres.generate_migrations --name add_invitations
```

**Manual Review:**
- [ ] Review migration
- [ ] Add partial unique index: (company_id, email) WHERE status = 'pending'
- [ ] Add check constraints for status, role, team_role
- [ ] Add indexes
- [ ] Run migrations

**Estimated Time:** 1 hour

---

### Task 3.7: Unit Tests - Invitation Resource
**File:** `test/clientt_crm_app/authorization/invitation_test.exs`

**Test Cases:**
- [ ] Create invitation successfully (token generated, email sent)
- [ ] Validate only one pending invitation per email+company
- [ ] Accept invitation (creates authz_user)
- [ ] Cannot accept expired invitation
- [ ] Cannot accept if user already member
- [ ] Revoke invitation successfully
- [ ] Expiration job marks old invitations as expired

**Estimated Time:** 4 hours

---

### Task 3.8: Integration Test - Full Invitation Flow
**File:** `test/clientt_crm_app/authorization/integration/invitation_flow_test.exs`

**Test Scenarios:**
- [ ] New user: Invite → Register → Accept → AuthzUser created
- [ ] Existing user: Invite → Sign in → Accept → AuthzUser created
- [ ] Expired invitation: Invite → Wait 7 days → Accept fails
- [ ] Duplicate invitation: Invite → Invite again → Error

**Estimated Time:** 3 hours

---

## Phase 4: Audit Logging (Week 5)

**Goal:** Implement comprehensive audit logging for all authorization changes.

### Task 4.1: Create AuditLog Resource
**File:** `lib/clientt_crm_app/authorization/audit_log.ex`

```bash
mix ash.gen.resource ClienttCrmApp.Authorization.AuditLog \
  --domain ClienttCrmApp.Authorization \
  --uuid-primary-key id
```

**Manual Steps:**
- [ ] Add attributes: company_id, actor_authz_user_id, action, resource_type, resource_id, changes (map), metadata (map), created_at
- [ ] Add postgres configuration (table: authz_audit_logs)
- [ ] Define actions: create (only), read, list
- [ ] NO update or destroy actions (immutable)
- [ ] Add relationships: `belongs_to :company`, `belongs_to :actor`
- [ ] Add policies: only admins can read audit logs
- [ ] Add filters: by date range, action, actor, resource

**Estimated Time:** 3 hours

---

### Task 4.2: Audit Log Change (Generic)
**File:** `lib/clientt_crm_app/authorization/changes/create_audit_log.ex`

**Manual Steps:**
- [ ] Implement Ash.Resource.Change
- [ ] Extract before/after values from changeset
- [ ] Determine action type from context
- [ ] Create AuditLog entry with:
  - [ ] company_id from current context
  - [ ] actor_authz_user_id from actor
  - [ ] action (e.g., "user_added", "role_changed")
  - [ ] resource_type, resource_id
  - [ ] changes (before/after map)
  - [ ] metadata (IP, user agent, timestamp)

**Estimated Time:** 3 hours

---

### Task 4.3: Add Audit Logging to Resources
**Files:** `authz_user.ex`, `team.ex`, `invitation.ex`, `company.ex`, `company_settings.ex`

**Manual Steps:**
- [ ] Add `CreateAuditLog` change to:
  - [ ] AuthzUser: create, update_role, assign_to_team, suspend, reactivate
  - [ ] Team: create, archive
  - [ ] Invitation: create, accept, revoke
  - [ ] Company: create, archive, suspend
  - [ ] CompanySettings: update, toggle_feature
- [ ] Configure action mapping (e.g., create → "user_added")

**Estimated Time:** 4 hours

---

### Task 4.4: Generate Migrations for Audit Logs
```bash
mix ash_postgres.generate_migrations --name add_audit_logs
```

**Manual Review:**
- [ ] Review migration
- [ ] Add indexes on company_id, actor_authz_user_id, created_at, (resource_type, resource_id)
- [ ] Run migrations

**Estimated Time:** 1 hour

---

### Task 4.5: Unit Tests - AuditLog Resource
**File:** `test/clientt_crm_app/authorization/audit_log_test.exs`

**Test Cases:**
- [ ] Create audit log entry successfully
- [ ] Cannot update audit log (error)
- [ ] Cannot delete audit log (error)
- [ ] Filter by date range
- [ ] Filter by action type
- [ ] Only admins can read audit logs

**Estimated Time:** 2 hours

---

### Task 4.6: Integration Test - Audit Logging
**File:** `test/clientt_crm_app/authorization/integration/audit_logging_test.exs`

**Test Scenarios:**
- [ ] Changing user role creates audit log entry
- [ ] Creating team creates audit log entry
- [ ] Accepting invitation creates audit log entry
- [ ] Audit log includes before/after changes
- [ ] Audit log includes actor information

**Estimated Time:** 2 hours

---

## Phase 5: UI & LiveView Integration (Weeks 6-7)

**Goal:** Build user-facing UI for company management, user management, teams, and invitations.

### Week 6: Core UI Components

#### Task 5.1: Company Switcher Component
**File:** `lib/clientt_crm_app_web/components/company_switcher.ex`

**Manual Steps:**
- [ ] Create LiveComponent for company switcher
- [ ] Query user's authz_users → companies
- [ ] Display current company
- [ ] Dropdown to select other companies
- [ ] On select: update session, redirect/reload

**UI Mockup:**
```
Header:
  [Logo] [•] Acme Corp ▼  [User Menu]

Dropdown:
  [•] Acme Corp (Admin)
  [ ] Beta Inc (User)
  [ ] Create New Company
```

**Estimated Time:** 4 hours

---

#### Task 5.2: User Management LiveView
**File:** `lib/clientt_crm_app_web/live/authorization/user_live/index.ex`

**Manual Steps:**
- [ ] List all authz_users for current company
- [ ] Display: email, role, team, joined_at
- [ ] Actions: Change role (modal), Remove user (confirm), Invite user (link)
- [ ] Filters: by role, by team, by status
- [ ] Search by email
- [ ] Pagination

**Routes:**
- [ ] `GET /company/users` - List users
- [ ] Update router.ex

**Estimated Time:** 6 hours

---

#### Task 5.3: Invite User LiveView
**File:** `lib/clientt_crm_app_web/live/authorization/invitation_live/new.ex`

**Manual Steps:**
- [ ] Form: email, role, team (optional), team_role (if team selected), message (optional)
- [ ] Validate email format
- [ ] On submit: create invitation
- [ ] Show success message with invitation link (for manual sharing)
- [ ] Email sent automatically

**Routes:**
- [ ] `GET /company/invitations/new` - Invite user form

**Estimated Time:** 4 hours

---

#### Task 5.4: Accept Invitation Page
**File:** `lib/clientt_crm_app_web/live/authorization/invitation_live/accept.ex`

**Manual Steps:**
- [ ] Extract token from URL query params
- [ ] Load invitation by token
- [ ] Check if user signed in:
  - [ ] If yes: Show company details, "Accept" button → accept invitation
  - [ ] If no: Show company details, "Sign In to Accept" button → sign in, return to accept
- [ ] Handle new user: "Create Account" button → registration page (email pre-filled)
- [ ] After acceptance: Redirect to company dashboard

**Routes:**
- [ ] `GET /invitations/accept?token=...` - Accept invitation page

**Flow Diagram:**
```
/invitations/accept?token=ABC
  ↓
Is user signed in?
  ├─ No → /sign-in?return_to=/invitations/accept?token=ABC
  │        ↓
  │      Sign in → Return to /invitations/accept?token=ABC
  │
  └─ Yes → Show invitation details
            ↓
          Does authn_user exist?
            ├─ No → Create account → Accept invitation
            └─ Yes → Accept invitation
                      ↓
                    Redirect to /dashboard (company context set)
```

**Estimated Time:** 5 hours

---

#### Task 5.5: Team Management LiveView
**File:** `lib/clientt_crm_app_web/live/authorization/team_live/index.ex`

**Manual Steps:**
- [ ] List all teams for current company
- [ ] Display: name, description, member_count, status
- [ ] Actions: Create team (modal), Edit team (modal), Archive team (confirm), View members (link)
- [ ] View members:
  - [ ] List authz_users for team
  - [ ] Assign user to team (modal)
  - [ ] Remove from team (confirm)
  - [ ] Change team role (inline select)

**Routes:**
- [ ] `GET /company/teams` - List teams
- [ ] `GET /company/teams/:id/members` - Team members

**Estimated Time:** 6 hours

---

### Week 7: Settings & Polish

#### Task 5.6: Company Settings LiveView
**File:** `lib/clientt_crm_app_web/live/authorization/settings_live/index.ex`

**Manual Steps:**
- [ ] Tabs: General, Limits, Features, Branding
- [ ] General: company name, timezone
- [ ] Limits: max_users, max_teams
- [ ] Features: toggle feature flags (checkboxes)
- [ ] Branding: logo_url, primary_color, secondary_color (color pickers)
- [ ] Save button (updates CompanySettings)

**Routes:**
- [ ] `GET /company/settings` - Company settings

**Estimated Time:** 5 hours

---

#### Task 5.7: Audit Log LiveView (Admin Only)
**File:** `lib/clientt_crm_app_web/live/authorization/audit_log_live/index.ex`

**Manual Steps:**
- [ ] List audit logs for current company
- [ ] Display: timestamp, actor, action, resource, changes
- [ ] Filters: date range (from/to), action type, actor
- [ ] Export to CSV (button)
- [ ] Pagination

**Routes:**
- [ ] `GET /company/audit-logs` - Audit logs (admin only)

**Estimated Time:** 4 hours

---

#### Task 5.8: Update Authentication Flow
**Files:** `lib/clientt_crm_app_web/live_user_auth.ex`, `router.ex`

**Manual Steps:**
- [ ] After sign in: Check if user has authz_users
  - [ ] If 0: Redirect to "Create Company" page
  - [ ] If 1: Auto-select that company → Dashboard
  - [ ] If 2+: Show company selector → Dashboard
- [ ] Store in session: current_company_id, current_authz_user
- [ ] Add `on_mount` hook: `:require_authz_user` (verifies company context)
- [ ] All protected routes use `:require_authz_user` instead of `:require_authenticated_user`

**Estimated Time:** 4 hours

---

#### Task 5.9: Create Company LiveView
**File:** `lib/clientt_crm_app_web/live/authorization/company_live/new.ex`

**Manual Steps:**
- [ ] Form: company name, slug (auto-generated from name, editable)
- [ ] Validate slug uniqueness
- [ ] On submit: create company (also creates settings + authz_user admin)
- [ ] Redirect to company dashboard

**Routes:**
- [ ] `GET /companies/new` - Create company

**Estimated Time:** 3 hours

---

#### Task 5.10: UI/UX Polish
**Manual Steps:**
- [ ] Add loading states (skeletons, spinners)
- [ ] Add success/error toasts
- [ ] Add confirmation modals (remove user, archive team, etc.)
- [ ] Add empty states (no teams, no members, no audit logs)
- [ ] Add role badges (color-coded: admin=red, manager=blue, user=green)
- [ ] Add breadcrumbs (Company / Users, Company / Teams, etc.)
- [ ] Mobile responsiveness

**Estimated Time:** 6 hours

---

## Phase 6: Migration & Testing (Week 8)

**Goal:** Migrate existing users, perform comprehensive testing, and security audit.

### Task 6.1: Data Migration Script
**File:** `priv/repo/migrations/YYYYMMDDHHMMSS_migrate_users_to_authz.exs`

**Manual Steps:**
- [ ] Create migration (not Ash-generated, manual Ecto migration)
- [ ] For each existing authn_user:
  - [ ] Create default company "[User Email]'s Company"
  - [ ] Generate unique slug
  - [ ] Create CompanySettings (defaults)
  - [ ] Create AuthzUser (role: admin)
  - [ ] Migrate user's existing data (contacts, deals, etc.) to company_id
- [ ] Log migration results
- [ ] Rollback plan

**Estimated Time:** 6 hours

---

### Task 6.2: Add company_id to Existing Resources
**Files:** CRM resources (e.g., Contact, Deal, etc.)

**Manual Steps:**
- [ ] Add `company_id` attribute to tenant-scoped resources
- [ ] Add `belongs_to :company` relationship
- [ ] Add policies to filter by current company_id
- [ ] Generate migrations to add column + index
- [ ] Update seed data

**Estimated Time:** 4 hours

---

### Task 6.3: Integration Testing
**File:** `test/clientt_crm_app/authorization/integration/full_flow_test.exs`

**Test Scenarios:**
- [ ] Full user journey:
  - [ ] Sign up → Create company → Invite user → Accept invitation → Switch companies
- [ ] Multi-tenancy isolation:
  - [ ] User A cannot access User B's company data
  - [ ] Queries scoped correctly
- [ ] Role-based access:
  - [ ] Admin can manage users, manager can view, user cannot manage

**Estimated Time:** 6 hours

---

### Task 6.4: Performance Testing
**File:** `test/clientt_crm_app/authorization/performance_test.exs`

**Test Scenarios:**
- [ ] Company list query with 50 companies < 100ms
- [ ] Member list query with 1000 members < 200ms
- [ ] Context switching < 50ms
- [ ] Row-level filtering overhead < 10ms

**Estimated Time:** 4 hours

---

### Task 6.5: Security Audit
**Checklist:**
- [ ] Review all Ash policies (ensure no bypasses)
- [ ] Test row-level security (cannot access other company data)
- [ ] Test last admin protection (cannot remove/downgrade)
- [ ] Test invitation token security (cryptographically secure, no collisions)
- [ ] Test audit log immutability (cannot update/delete)
- [ ] Review session management (company_id cannot be overridden by client)
- [ ] Test CSRF protection on all forms
- [ ] Test SQL injection (Ash should prevent, but verify)
- [ ] Test authorization bypass attempts

**Estimated Time:** 6 hours

---

### Task 6.6: Documentation
**Files:**
- [ ] Update README.md with multi-tenancy overview
- [ ] Update CLAUDE.md with authorization domain info
- [ ] Create user guide: "Managing Your Company"
- [ ] Create user guide: "Inviting Team Members"
- [ ] Create admin guide: "Understanding Roles & Permissions"

**Estimated Time:** 4 hours

---

### Task 6.7: Deployment Preparation
**Manual Steps:**
- [ ] Update environment variables (if any new secrets)
- [ ] Run migrations on staging
- [ ] Test on staging
- [ ] Performance test on staging (with production-like data)
- [ ] Plan production deployment (maintenance window if needed)
- [ ] Backup production database before migration

**Estimated Time:** 4 hours

---

## Summary Checklist

### Phase 1: Core (Weeks 1-2) ✅
- [ ] Authorization domain created
- [ ] Company resource
- [ ] AuthzUser resource
- [ ] Multi-tenancy policies
- [ ] Migrations
- [ ] Unit tests
- [ ] Integration tests

### Phase 2: Teams & Settings (Week 3) ✅
- [ ] Team resource
- [ ] CompanySettings resource
- [ ] Relationships
- [ ] Company creation (with settings + admin)
- [ ] Migrations
- [ ] Unit tests

### Phase 3: Invitations (Week 4) ✅
- [ ] Invitation resource
- [ ] Token generation
- [ ] Email templates
- [ ] Acceptance flow
- [ ] Expiration job
- [ ] Migrations
- [ ] Unit + integration tests

### Phase 4: Audit Logging (Week 5) ✅
- [ ] AuditLog resource
- [ ] Audit changes on all resources
- [ ] Migrations
- [ ] Unit + integration tests

### Phase 5: UI (Weeks 6-7) ✅
- [ ] Company switcher
- [ ] User management LiveView
- [ ] Team management LiveView
- [ ] Invitation flow (new + accept)
- [ ] Settings page
- [ ] Audit log page
- [ ] Updated auth flow
- [ ] UI polish

### Phase 6: Migration & Testing (Week 8) ✅
- [ ] Data migration script
- [ ] Add company_id to existing resources
- [ ] Integration testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment

---

## Risk Mitigation

### Risk 1: Data Migration Failure
**Mitigation:**
- Full database backup before migration
- Test migration on copy of production data
- Rollback plan (reverse migration script)

### Risk 2: Performance Degradation
**Mitigation:**
- Add indexes on company_id to all tenant-scoped tables
- Query optimization (use Ash's preloading efficiently)
- Consider caching for company settings

### Risk 3: Security Vulnerabilities
**Mitigation:**
- Comprehensive security audit before deployment
- Penetration testing (if budget allows)
- Code review by another developer

### Risk 4: User Confusion (Multi-Company UX)
**Mitigation:**
- Clear company switcher (always visible)
- Current company badge on all pages
- User guide and tooltips

---

## Post-Launch Monitoring

### Week 1 After Launch
- [ ] Monitor error logs (especially authorization errors)
- [ ] Monitor query performance (slow query log)
- [ ] Monitor user feedback (support tickets)
- [ ] Track invitation acceptance rate

### Week 2-4 After Launch
- [ ] Analyze audit logs for patterns
- [ ] Identify performance bottlenecks
- [ ] Gather user feedback (surveys)
- [ ] Plan Phase 2 features (custom roles, team hierarchy, etc.)

---

**End of Implementation Plan**

**Next Steps:**
1. Review this plan with team
2. Confirm timeline and resource allocation
3. Begin Phase 1: Core Authorization Domain
4. Set up project tracking (Jira, Linear, etc.) with these tasks
