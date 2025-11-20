# Multi-Tenant Authorization Domain Specification

**Version:** 1.0
**Date:** 2025-11-11
**Status:** Draft

## Executive Summary

This specification defines a multi-tenant authorization system for the CRM application, separating authentication (`authn_`) from authorization (`authz_`) concerns. The system supports users belonging to multiple companies with different roles, teams within companies, invitation workflows, and comprehensive audit logging.

## Domain Overview

### Bounded Context: Authorization

**Purpose:** Manage company-based multi-tenancy, user authorization, roles, teams, and access control.

**Separation of Concerns:**
- **Authentication Domain (`authn_`)**: Handles user identity, login credentials, and session management (existing `ClienttCrmApp.Accounts`)
- **Authorization Domain (`authz_`)**: Handles company membership, roles, permissions, and access control (new `ClienttCrmApp.Authorization`)

### Key Design Decisions

1. **1:Many authn_user → authz_user relationship**: A single login identity can have multiple authorization identities (one per company membership)
2. **Row-level tenancy**: All tenant data includes `tenant_id` with Ash policy enforcement
3. **Simple RBAC**: Predefined roles (Admin, Manager, User) with fixed permissions
4. **Team support**: Sub-organizations within companies with team-specific roles

---

## Domain-Driven Design (DDD)

### Entities

#### 1. Company (Aggregate Root)
**Table:** `authz_tenants`

**Purpose:** Represents a tenant organization in the multi-tenant system.

**Attributes:**
- `id` (uuid, PK)
- `name` (string, required) - Company name
- `slug` (string, required, unique) - URL-friendly identifier
- `status` (enum: active, suspended, archived) - Company lifecycle status
- `settings_id` (uuid, FK → authz_tenant_settings) - Company-specific configuration
- `created_at` (utc_datetime_usec)
- `updated_at` (utc_datetime_usec)

**Relationships:**
- `has_many :authz_users` - Users belonging to this company
- `has_many :teams` - Teams within this company
- `has_many :invitations` - Pending invitations for this company
- `has_one :settings` - Company-specific settings
- `has_many :audit_logs` - Authorization changes for this company

**Business Rules:**
- Slug must be unique and URL-safe
- Company name required (min 2 characters)
- At least one Admin user must exist per active company
- Cannot delete company with active users (must archive first)

**Domain Events:**
- `CompanyCreated`
- `CompanyStatusChanged`
- `CompanyArchived`

---

#### 2. AuthzUser (Entity)
**Table:** `authz_users`

**Purpose:** Represents an authorization identity for a user within a specific company context. This is separate from the authentication identity (`authn_users`).

**Attributes:**
- `id` (uuid, PK)
- `authn_user_id` (uuid, FK → users, required) - Link to authentication identity
- `tenant_id` (uuid, FK → authz_tenants, required) - Company membership
- `role` (enum: admin, manager, user) - Company-level role
- `team_id` (uuid, FK → authz_teams, nullable) - Optional team membership
- `team_role` (enum: team_lead, team_member, nullable) - Team-specific role
- `status` (enum: active, inactive, suspended) - User status within company
- `display_name` (string, nullable) - Optional display name for this company context
- `joined_at` (utc_datetime_usec) - When user joined this company
- `last_active_at` (utc_datetime_usec, nullable) - Last activity timestamp
- `created_at` (utc_datetime_usec)
- `updated_at` (utc_datetime_usec)

**Relationships:**
- `belongs_to :authn_user` (ClienttCrmApp.Accounts.User) - Authentication identity
- `belongs_to :company` - Company membership
- `belongs_to :team` (nullable) - Optional team membership
- `has_many :audit_logs` - Authorization changes performed by this user

**Business Rules:**
- One `authn_user` can have multiple `authz_users` (one per company)
- Each (`authn_user_id`, `tenant_id`) pair must be unique
- `team_role` can only be set if `team_id` is present
- Cannot change role to non-admin if user is the last admin in company
- Email comes from `authn_user` relationship (not duplicated)

**Domain Events:**
- `AuthzUserCreated`
- `RoleChanged`
- `TeamAssigned`
- `UserSuspended`
- `UserReactivated`

---

#### 3. Team (Entity)
**Table:** `authz_teams`

**Purpose:** Sub-organization within a company for grouping users and scoping permissions.

**Attributes:**
- `id` (uuid, PK)
- `tenant_id` (uuid, FK → authz_tenants, required)
- `name` (string, required)
- `description` (text, nullable)
- `status` (enum: active, archived)
- `created_at` (utc_datetime_usec)
- `updated_at` (utc_datetime_usec)

**Relationships:**
- `belongs_to :company`
- `has_many :authz_users` - Team members

**Business Rules:**
- Team name must be unique within company
- Cannot delete team with active members (must reassign or archive)
- At least one team_lead should exist per active team (warning, not enforced)

**Domain Events:**
- `TeamCreated`
- `TeamArchived`
- `TeamMemberAdded`
- `TeamMemberRemoved`

---

#### 4. Invitation (Entity)
**Table:** `authz_invitations`

**Purpose:** Email-based invitation system for adding users to companies.

**Attributes:**
- `id` (uuid, PK)
- `tenant_id` (uuid, FK → authz_tenants, required)
- `email` (ci_string, required) - Invitee email
- `invited_by_authz_user_id` (uuid, FK → authz_users, required)
- `role` (enum: admin, manager, user) - Role to assign upon acceptance
- `team_id` (uuid, FK → authz_teams, nullable) - Optional team assignment
- `team_role` (enum: team_lead, team_member, nullable)
- `token` (string, required, unique) - Secure invitation token
- `status` (enum: pending, accepted, expired, revoked)
- `expires_at` (utc_datetime_usec) - Invitation expiry (default: 7 days)
- `accepted_at` (utc_datetime_usec, nullable)
- `accepted_by_authn_user_id` (uuid, FK → users, nullable)
- `message` (text, nullable) - Optional personal message from inviter
- `created_at` (utc_datetime_usec)
- `updated_at` (utc_datetime_usec)

**Relationships:**
- `belongs_to :company`
- `belongs_to :invited_by` (AuthzUser)
- `belongs_to :accepted_by` (Accounts.User, nullable)
- `belongs_to :team` (nullable)

**Business Rules:**
- Token must be cryptographically secure (min 32 bytes)
- Expires in 7 days by default (configurable)
- Cannot accept expired invitations
- Cannot have multiple pending invitations for same email+company
- If invitee authn_user exists and already has authz_user for company, reject invitation

**Domain Events:**
- `InvitationCreated`
- `InvitationSent`
- `InvitationAccepted`
- `InvitationExpired`
- `InvitationRevoked`

---

#### 5. CompanySettings (Entity)
**Table:** `authz_tenant_settings`

**Purpose:** Store company-specific configuration and feature flags.

**Attributes:**
- `id` (uuid, PK)
- `tenant_id` (uuid, FK → authz_tenants, required, unique)
- `max_users` (integer, nullable) - User limit for company (null = unlimited)
- `max_teams` (integer, nullable) - Team limit
- `features` (map/jsonb) - Feature flags (e.g., `%{advanced_reports: true}`)
- `branding` (map/jsonb) - Branding config (logo_url, primary_color, etc.)
- `timezone` (string, default: "UTC")
- `created_at` (utc_datetime_usec)
- `updated_at` (utc_datetime_usec)

**Relationships:**
- `belongs_to :company`

**Business Rules:**
- One settings record per company
- `max_users` validated against current active authz_users count
- `features` map validated against allowed feature keys

**Domain Events:**
- `CompanySettingsUpdated`
- `FeatureToggled`

---

#### 6. AuditLog (Entity)
**Table:** `authz_audit_logs`

**Purpose:** Immutable audit trail of all authorization changes.

**Attributes:**
- `id` (uuid, PK)
- `tenant_id` (uuid, FK → authz_tenants, required)
- `actor_authz_user_id` (uuid, FK → authz_users, nullable) - Who performed action
- `action` (enum: user_added, role_changed, team_assigned, invitation_sent, etc.)
- `resource_type` (string) - e.g., "AuthzUser", "Team", "Invitation"
- `resource_id` (uuid, nullable) - ID of affected resource
- `changes` (map/jsonb) - Before/after values
- `metadata` (map/jsonb) - Additional context (IP, user agent, etc.)
- `created_at` (utc_datetime_usec)

**Relationships:**
- `belongs_to :company`
- `belongs_to :actor` (AuthzUser, nullable)

**Business Rules:**
- Immutable - no updates or deletes allowed
- `actor_authz_user_id` can be null for system actions
- Retention policy: keep for 2 years minimum (configurable)

**Domain Events:**
- `AuditLogCreated` (for real-time monitoring/alerts)

---

### Value Objects

#### Role (Enum)
```elixir
@role_types [:admin, :manager, :user]
```

**Permissions by Role:**
- `admin`: Full company access, manage users, teams, settings, billing
- `manager`: Manage assigned teams, view company data, limited settings
- `user`: Standard access to company resources, no management capabilities

#### TeamRole (Enum)
```elixir
@team_role_types [:team_lead, :team_member]
```

#### CompanyStatus (Enum)
```elixir
@company_status_types [:active, :suspended, :archived]
```

#### InvitationStatus (Enum)
```elixir
@invitation_status_types [:pending, :accepted, :expired, :revoked]
```

#### UserStatus (Enum)
```elixir
@user_status_types [:active, :inactive, :suspended]
```

---

### Aggregates

#### Company Aggregate
**Root:** Company
**Entities:** CompanySettings, Teams, AuthzUsers (within company context), Invitations
**Invariants:**
- Company must have at least one active admin
- Cannot exceed max_users setting
- Cannot exceed max_teams setting

---

## Behavior-Driven Design (BDD)

### Feature: Company Management

**Scenario: Create a new company**
```gherkin
Given an authenticated user (authn_user)
When they create a company with name "Acme Corp" and slug "acme-corp"
Then a new company record is created
And the user becomes the first AuthzUser with role "admin" for that company
And default CompanySettings are created
And a "CompanyCreated" event is emitted
And an audit log entry is created
```

**Scenario: Archive a company**
```gherkin
Given a company with status "active"
And the current user is an admin of that company
When they archive the company
Then the company status changes to "archived"
And all authz_users for that company become inactive
And all pending invitations are revoked
And a "CompanyArchived" event is emitted
```

---

### Feature: User Authorization (AuthzUser)

**Scenario: User joins a company via invitation**
```gherkin
Given an invitation for "user@example.com" to join "Acme Corp" with role "user"
And the invitation is pending and not expired
And the user has an authn_user account with email "user@example.com"
When they accept the invitation
Then a new AuthzUser is created linking their authn_user_id to the company
And the AuthzUser has role "user"
And the invitation status changes to "accepted"
And an "AuthzUserCreated" event is emitted
And an audit log entry is created
```

**Scenario: User already belongs to company**
```gherkin
Given a user with authn_user_id "123"
And they already have an authz_user for company "Acme Corp"
When they try to accept another invitation for "Acme Corp"
Then the acceptance fails with error "Already a member"
```

**Scenario: Change user role**
```gherkin
Given an authz_user "Alice" with role "user" in company "Acme Corp"
And the current user is an admin of "Acme Corp"
When they change Alice's role to "manager"
Then Alice's authz_user role is updated to "manager"
And a "RoleChanged" event is emitted
And an audit log entry records the change from "user" to "manager"
```

**Scenario: Cannot remove last admin**
```gherkin
Given a company "Acme Corp" with only one admin authz_user
When attempting to change that admin's role to "user"
Then the action fails with error "Cannot remove last admin"
And the role remains "admin"
```

**Scenario: User context switching**
```gherkin
Given a user with authn_user account "user@example.com"
And they have authz_users for companies "Acme Corp" (role: admin) and "Beta Inc" (role: user)
When they sign in and select "Acme Corp" as active company
Then their current session is scoped to company "Acme Corp"
And they have admin permissions
When they switch to "Beta Inc"
Then their session is scoped to company "Beta Inc"
And they have user permissions
```

---

### Feature: Team Management

**Scenario: Create a team**
```gherkin
Given a company "Acme Corp"
And the current user is an admin of "Acme Corp"
When they create a team "Engineering" with description "Development team"
Then a new team record is created for "Acme Corp"
And a "TeamCreated" event is emitted
And an audit log entry is created
```

**Scenario: Assign user to team**
```gherkin
Given an authz_user "Bob" in company "Acme Corp" with no team assignment
And a team "Engineering" in "Acme Corp"
And the current user is an admin
When they assign Bob to "Engineering" with team_role "team_member"
Then Bob's authz_user record is updated with team_id and team_role
And a "TeamMemberAdded" event is emitted
And an audit log entry is created
```

---

### Feature: Invitation Workflow

**Scenario: Send invitation**
```gherkin
Given a company "Acme Corp"
And the current user is an admin authz_user
When they invite "newuser@example.com" with role "user"
Then an invitation record is created with status "pending"
And a secure token is generated
And an invitation email is sent to "newuser@example.com"
And the invitation expires in 7 days
And an "InvitationSent" event is emitted
```

**Scenario: Accept invitation (new user)**
```gherkin
Given a pending invitation for "newuser@example.com"
And no authn_user exists for "newuser@example.com"
When they click the invitation link with token
Then they are prompted to create an account (authn_user)
After account creation
Then an authz_user is created for the company
And the invitation status changes to "accepted"
And an "InvitationAccepted" event is emitted
```

**Scenario: Invitation expires**
```gherkin
Given a pending invitation created 8 days ago
When the expiration check runs
Then the invitation status changes to "expired"
And an "InvitationExpired" event is emitted
```

---

### Feature: Multi-Tenancy & Data Isolation

**Scenario: Row-level security**
```gherkin
Given user "Alice" with authz_user in company "Acme Corp" (tenant_id: 1)
And user "Bob" with authz_user in company "Beta Inc" (tenant_id: 2)
And a contact "John Doe" belonging to company "Acme Corp"
When Alice queries contacts
Then she sees "John Doe"
When Bob queries contacts
Then he does NOT see "John Doe"
```

**Scenario: Company context filtering**
```gherkin
Given the current session is scoped to tenant_id "1"
When any query is executed for tenant-scoped resources
Then an automatic filter `tenant_id: 1` is applied
And users cannot override this filter
```

---

## Database Schema

### ERD Overview
```
authn_users (existing)
    ↓ 1:Many
authz_users ────┐
    ↓           │
    │           │ Many:1
    │       authz_tenants (aggregate root)
    │           │
    │           ├─→ authz_tenant_settings (1:1)
    │           ├─→ authz_teams (1:Many)
    │           ├─→ authz_invitations (1:Many)
    │           └─→ authz_audit_logs (1:Many)
    │
    └─→ authz_teams (Many:1, nullable)
```

### Table Definitions

#### `authz_tenants`
```sql
CREATE TABLE authz_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  settings_id UUID UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_status CHECK (status IN ('active', 'suspended', 'archived'))
);

CREATE INDEX idx_authz_tenants_slug ON authz_tenants(slug);
CREATE INDEX idx_authz_tenants_status ON authz_tenants(status);
```

#### `authz_tenant_settings`
```sql
CREATE TABLE authz_tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES authz_tenants(id) ON DELETE CASCADE,
  max_users INTEGER,
  max_teams INTEGER,
  features JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authz_tenant_settings_company ON authz_tenant_settings(tenant_id);
```

#### `authz_users`
```sql
CREATE TABLE authz_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authn_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES authz_tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  team_id UUID REFERENCES authz_teams(id) ON DELETE SET NULL,
  team_role VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  display_name VARCHAR(255),
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT authz_users_unique_user_company UNIQUE (authn_user_id, tenant_id),
  CONSTRAINT chk_role CHECK (role IN ('admin', 'manager', 'user')),
  CONSTRAINT chk_team_role CHECK (team_role IN ('team_lead', 'team_member') OR team_role IS NULL),
  CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT chk_team_role_requires_team CHECK (
    (team_id IS NOT NULL AND team_role IS NOT NULL) OR
    (team_id IS NULL AND team_role IS NULL)
  )
);

CREATE INDEX idx_authz_users_authn_user ON authz_users(authn_user_id);
CREATE INDEX idx_authz_users_company ON authz_users(tenant_id);
CREATE INDEX idx_authz_users_team ON authz_users(team_id);
CREATE INDEX idx_authz_users_status ON authz_users(status);
```

#### `authz_teams`
```sql
CREATE TABLE authz_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES authz_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT authz_teams_unique_name_per_company UNIQUE (tenant_id, name),
  CONSTRAINT chk_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX idx_authz_teams_company ON authz_teams(tenant_id);
CREATE INDEX idx_authz_teams_status ON authz_teams(status);
```

#### `authz_invitations`
```sql
CREATE TABLE authz_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES authz_tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by_authz_user_id UUID NOT NULL REFERENCES authz_users(id),
  role VARCHAR(20) NOT NULL,
  team_id UUID REFERENCES authz_teams(id) ON DELETE SET NULL,
  team_role VARCHAR(20),
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by_authn_user_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_role CHECK (role IN ('admin', 'manager', 'user')),
  CONSTRAINT chk_team_role CHECK (team_role IN ('team_lead', 'team_member') OR team_role IS NULL),
  CONSTRAINT chk_status CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

CREATE INDEX idx_authz_invitations_company ON authz_invitations(tenant_id);
CREATE INDEX idx_authz_invitations_email ON authz_invitations(email);
CREATE INDEX idx_authz_invitations_token ON authz_invitations(token);
CREATE INDEX idx_authz_invitations_status ON authz_invitations(status);
CREATE UNIQUE INDEX idx_authz_invitations_unique_pending ON authz_invitations(tenant_id, email)
  WHERE status = 'pending';
```

#### `authz_audit_logs`
```sql
CREATE TABLE authz_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES authz_tenants(id) ON DELETE CASCADE,
  actor_authz_user_id UUID REFERENCES authz_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_authz_audit_logs_company ON authz_audit_logs(tenant_id);
CREATE INDEX idx_authz_audit_logs_actor ON authz_audit_logs(actor_authz_user_id);
CREATE INDEX idx_authz_audit_logs_resource ON authz_audit_logs(resource_type, resource_id);
CREATE INDEX idx_authz_audit_logs_created_at ON authz_audit_logs(created_at);
```

---

## Ash Framework Implementation

### Domain Definition

**File:** `lib/clientt_crm_app/authorization.ex`

```elixir
defmodule ClienttCrmApp.Authorization do
  use Ash.Domain,
    otp_app: :clientt_crm_app

  resources do
    resource ClienttCrmApp.Authorization.Company
    resource ClienttCrmApp.Authorization.CompanySettings
    resource ClienttCrmApp.Authorization.AuthzUser
    resource ClienttCrmApp.Authorization.Team
    resource ClienttCrmApp.Authorization.Invitation
    resource ClienttCrmApp.Authorization.AuditLog
  end
end
```

---

### Resource Outlines

#### Company Resource
**File:** `lib/clientt_crm_app/authorization/company.ex`

**Key Actions:**
- `:create` - Create new company (also creates default settings and first admin authz_user)
- `:read`, `:list` - Query companies
- `:update` - Update company details
- `:archive` - Archive company (custom action)
- `:suspend` - Suspend company (custom action)
- `:reactivate` - Reactivate suspended company

**Key Policies:**
- Admins can manage their own companies
- System can create companies
- Users can read their own companies

**Calculations:**
- `:active_user_count` - Count of active authz_users
- `:team_count` - Count of teams
- `:is_at_user_limit` - Check if max_users reached

---

#### AuthzUser Resource
**File:** `lib/clientt_crm_app/authorization/authz_user.ex`

**Key Actions:**
- `:create` - Create authz_user (via invitation acceptance or company creation)
- `:read`, `:list` - Query authz_users (scoped to current company)
- `:update_role` - Change user's company role (custom action with admin check)
- `:assign_to_team` - Assign user to team with team role
- `:remove_from_team` - Remove team assignment
- `:suspend` - Suspend user
- `:reactivate` - Reactivate user
- `:update_last_active` - Update last_active_at timestamp

**Key Policies:**
- Company admins can manage authz_users in their company
- Users can read authz_users in their company
- Cannot remove last admin

**Calculations:**
- `:email` - Load from authn_user relationship
- `:full_permissions` - Combine company role + team role permissions

**Relationships:**
- `belongs_to :authn_user` (ClienttCrmApp.Accounts.User)
- `belongs_to :company`
- `belongs_to :team` (nullable)

---

#### Team Resource
**File:** `lib/clientt_crm_app/authorization/team.ex`

**Key Actions:**
- `:create` - Create team (company-scoped)
- `:read`, `:list` - Query teams (scoped to current company)
- `:update` - Update team details
- `:archive` - Archive team (must have no active members)

**Key Policies:**
- Company admins can manage teams
- Managers and users can read teams

**Calculations:**
- `:member_count` - Count of authz_users in team
- `:lead_count` - Count of team leads

---

#### Invitation Resource
**File:** `lib/clientt_crm_app/authorization/invitation.ex`

**Key Actions:**
- `:create` - Send invitation (generates token, sends email)
- `:read`, `:list` - Query invitations (company-scoped)
- `:accept` - Accept invitation (creates authz_user)
- `:revoke` - Revoke invitation
- `:check_expiration` - Background job to expire old invitations

**Key Policies:**
- Company admins and managers can create invitations
- Anyone with valid token can accept their own invitation
- Inviter can revoke their own invitations

**Changes:**
- Generate secure token on create
- Send email notification on create
- Create authz_user on acceptance
- Create audit log entries

---

#### CompanySettings Resource
**File:** `lib/clientt_crm_app/authorization/company_settings.ex`

**Key Actions:**
- `:create` - Auto-created with company
- `:read` - Get settings
- `:update` - Update settings (admin only)
- `:toggle_feature` - Enable/disable feature flag

**Key Policies:**
- Company admins can update settings
- All company members can read settings

**Validations:**
- Validate `max_users` against current user count
- Validate feature flags against allowed features list

---

#### AuditLog Resource
**File:** `lib/clientt_crm_app/authorization/audit_log.ex`

**Key Actions:**
- `:create` - Create audit log entry (auto-triggered by changes)
- `:read`, `:list` - Query audit logs (company-scoped, admin only)

**Key Policies:**
- Only company admins can read audit logs
- System can create audit logs
- No updates or deletes allowed (immutable)

**Filters:**
- By date range
- By action type
- By actor
- By resource type/id

---

## Multi-Tenancy Implementation

### Row-Level Security with Ash Policies

All tenant-scoped resources (AuthzUser, Team, Invitation, AuditLog, CompanySettings) must include:

1. **Company ID on all queries:**
```elixir
# In each resource's policies block
policies do
  # Automatically scope all queries to current company context
  policy action_type(:read) do
    authorize_if relates_to_actor(:company, via: [:current_authz_user])
  end
end
```

2. **Company context in session:**
```elixir
# Store in conn after login/company selection
%{
  current_authn_user: %User{id: "..."},
  current_tenant_id: "...",
  current_authz_user: %AuthzUser{id: "...", role: :admin, tenant_id: "..."}
}
```

3. **Tenant filtering:**
```elixir
# All queries automatically filtered
ClienttCrmApp.Authorization
|> Ash.Query.for_read(:list)
|> Ash.Query.filter(tenant_id: ^current_tenant_id)
|> Ash.read!(actor: current_authz_user)
```

---

## Implementation Phases

### Phase 1: Core Authorization Domain (Week 1-2)
- [ ] Create Authorization domain module
- [ ] Implement Company resource (basic CRUD)
- [ ] Implement AuthzUser resource (basic CRUD)
- [ ] Implement 1:Many authn_user → authz_user relationship
- [ ] Add row-level tenancy policies
- [ ] Generate and run migrations
- [ ] Write unit tests for resources

### Phase 2: Teams & Settings (Week 3)
- [ ] Implement Team resource
- [ ] Implement CompanySettings resource
- [ ] Add team assignment logic to AuthzUser
- [ ] Add company creation flow (creates company + settings + first admin)
- [ ] Write unit tests

### Phase 3: Invitations (Week 4)
- [ ] Implement Invitation resource
- [ ] Build invitation email templates
- [ ] Create invitation acceptance flow
- [ ] Add token generation and validation
- [ ] Handle expiration logic (background job)
- [ ] Write integration tests for full invitation workflow

### Phase 4: Audit Logging (Week 5)
- [ ] Implement AuditLog resource
- [ ] Add audit log changes/hooks to all resources
- [ ] Create audit log UI for admins
- [ ] Write tests for audit logging

### Phase 5: UI & LiveView Integration (Week 6-7)
- [ ] Company switcher component
- [ ] User management LiveView (list, invite, change roles)
- [ ] Team management LiveView
- [ ] Company settings page
- [ ] Invitation acceptance page
- [ ] Update authentication flow to handle company selection

### Phase 6: Migration & Testing (Week 8)
- [ ] Migrate existing users to authz_users
- [ ] Create default company for existing users
- [ ] Integration testing
- [ ] Performance testing (multi-tenancy queries)
- [ ] Security audit (policy enforcement)

---

## Security Considerations

### Authentication vs Authorization
- **Authentication (authn_users):** "Who are you?" - Login credentials, sessions
- **Authorization (authz_users):** "What can you do?" - Permissions within company context

### Row-Level Security
- All queries for tenant-scoped data MUST include tenant_id filter
- Ash policies enforce this at the framework level
- Never trust client-provided tenant_id; always use session context

### Invitation Security
- Use cryptographically secure tokens (32+ bytes)
- Expire invitations after 7 days
- Rate limit invitation sends per company
- Validate email format
- Check for existing memberships before acceptance

### Role Changes
- Audit all role changes
- Prevent last admin removal
- Require current password for sensitive role elevations

### Data Isolation
- Each query scoped to `current_authz_user.tenant_id`
- No cross-tenant data leakage
- Validate all foreign keys belong to same company

---

## Open Questions

1. **Display Name Strategy:** Should authz_users have optional display_name, or always use authn_user email?
   - **Recommendation:** Optional display_name for flexibility (user might want different names per company)

2. **Super Admin Role:** Do we need a global super admin (across all companies)?
   - **Recommendation:** Add separate `is_super_admin` flag on authn_users for platform administration

3. **Billing Integration:** Should CompanySettings track billing/subscription info?
   - **Recommendation:** Create separate `Billing` domain; link via tenant_id

4. **Permission Granularity:** Are 3 roles (admin, manager, user) sufficient?
   - **Current:** Yes for MVP
   - **Future:** May need custom permissions (see ABAC expansion in Phase 2)

5. **Team Hierarchy:** Should teams support parent/child relationships?
   - **Current:** Flat team structure
   - **Future:** Consider if org hierarchy needed

---

## Glossary

- **authn_user**: Authentication user (login identity from `users` table)
- **authz_user**: Authorization user (company-scoped identity with roles)
- **Company**: Tenant organization
- **Team**: Sub-group within a company
- **Row-level tenancy**: Multi-tenancy via tenant_id filtering on shared tables
- **RBAC**: Role-Based Access Control
- **Aggregate**: DDD pattern - cluster of entities treated as a single unit

---

## Appendix: Domain Events

### Event Schema
All domain events follow this structure:
```elixir
%DomainEvent{
  id: UUID,
  event_type: String,
  aggregate_type: String,
  aggregate_id: UUID,
  data: Map,
  metadata: %{
    actor_id: UUID,
    timestamp: DateTime,
    tenant_id: UUID
  }
}
```

### Event Catalog

| Event | Aggregate | Trigger | Consumers |
|-------|-----------|---------|-----------|
| `CompanyCreated` | Company | Company creation | Analytics, Email notifications |
| `CompanyArchived` | Company | Company archival | Cleanup jobs, Analytics |
| `AuthzUserCreated` | AuthzUser | User joins company | Onboarding emails, Analytics |
| `RoleChanged` | AuthzUser | Role update | Audit log, Permission cache invalidation |
| `TeamCreated` | Team | Team creation | Analytics |
| `TeamMemberAdded` | Team | User assigned to team | Team notifications |
| `InvitationSent` | Invitation | Invitation created | Email service |
| `InvitationAccepted` | Invitation | Invitation accepted | Onboarding flow, Analytics |
| `AuditLogCreated` | AuditLog | Any authorization change | Security monitoring, Compliance |

---

**End of Specification**

**Next Steps:**
1. Review this specification with stakeholders
2. Identify any missing requirements
3. Approve and move to implementation Phase 1
4. Create Ash resource files following this spec
5. Generate migrations
6. Begin testing
