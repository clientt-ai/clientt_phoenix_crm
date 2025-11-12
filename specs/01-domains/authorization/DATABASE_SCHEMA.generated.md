# Database Schema - Authorization Domain

**Status**: Generated from Resource Specs
**Last Updated**: 2025-11-12
**Domain**: Authorization

## Purpose

This document consolidates all database requirements for the Authorization domain from individual resource specifications. It provides a complete reference for database migrations, indexes, constraints, and foreign keys.

**Important**: This is a **generated** document derived from resource specs. For detailed business logic and validation rules, refer to the source resource specification files.

## Source Files

This schema is generated from the following specifications:
- [company.md](./resources/company.md) - Company resource
- [authz_user.md](./resources/authz_user.md) - Authorization user resource
- [team.md](./resources/team.md) - Team resource
- [invitation.md](./resources/invitation.md) - Invitation resource
- [company_settings.md](./resources/company_settings.md) - Company settings resource
- [audit_log.md](./resources/audit_log.md) - Audit log resource

---

## Tables

### authz_companies

**Purpose**: Tenant organizations (aggregate root)
**Source**: [company.md](./resources/company.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | varchar(100) | NO | - | Company display name |
| slug | varchar(50) | NO | - | URL-safe identifier (unique) |
| status | varchar(20) | NO | 'active' | Enum: active, archived |
| settings_id | uuid | YES | - | FK to authz_company_settings |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `slug` UNIQUE (globally unique)

**Indexes**:
- `idx_companies_slug` ON (slug) - Fast lookup by slug
- `idx_companies_status` ON (status) - Filter by status

---

### authz_users

**Purpose**: Authorization identities linking authn_user to company
**Source**: [authz_user.md](./resources/authz_user.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| authn_user_id | uuid | NO | - | FK to users (authentication) |
| company_id | uuid | NO | - | FK to authz_companies |
| role | varchar(20) | NO | - | Enum: admin, manager, user |
| team_id | uuid | YES | - | FK to authz_teams (optional) |
| team_role | varchar(20) | YES | - | Enum: team_lead, team_member |
| status | varchar(20) | NO | 'active' | Enum: active, inactive |
| display_name | varchar(100) | YES | - | Optional display name override |
| joined_at | timestamp | NO | now() | When user joined company |
| last_active_at | timestamp | YES | - | Last activity timestamp |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE (authn_user_id, company_id)` - One authz_user per (user, company) pair

**Check Constraints**:
- `team_role_requires_team` - `(team_role IS NULL OR team_id IS NOT NULL)`

**Indexes**:
- `idx_authz_users_company` ON (company_id) - Multi-tenancy filtering
- `idx_authz_users_authn_user` ON (authn_user_id) - User lookup
- `idx_authz_users_team` ON (team_id) - Team member queries
- `idx_authz_users_role` ON (role) - Filter by role
- `idx_authz_users_status` ON (status) - Filter by status

---

### authz_teams

**Purpose**: Sub-groups within companies for organizing users
**Source**: [team.md](./resources/team.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| company_id | uuid | NO | - | FK to authz_companies |
| name | varchar(100) | NO | - | Team name (unique per company) |
| description | varchar(500) | YES | - | Optional team description |
| status | varchar(20) | NO | 'active' | Enum: active, archived |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `UNIQUE (company_id, name)` - Team name unique per company (not globally)

**Indexes**:
- `idx_teams_company` ON (company_id) - Multi-tenancy filtering
- `idx_teams_status` ON (status) - Filter by status

---

### authz_invitations

**Purpose**: Email-based invitations to join companies
**Source**: [invitation.md](./resources/invitation.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| company_id | uuid | NO | - | FK to authz_companies |
| email | varchar(255) | NO | - | Email address of invitee |
| invited_by_authz_user_id | uuid | NO | - | FK to authz_users (inviter) |
| role | varchar(20) | NO | - | Enum: admin, manager, user |
| team_id | uuid | YES | - | FK to authz_teams (optional) |
| team_role | varchar(20) | YES | - | Enum: team_lead, team_member |
| token | varchar(255) | NO | - | Secure invitation token (unique) |
| status | varchar(20) | NO | 'pending' | Enum: pending, accepted, revoked, expired |
| message | varchar(500) | YES | - | Optional personal message |
| expires_at | timestamp | NO | - | When invitation expires (7 days) |
| accepted_at | timestamp | YES | - | When invitation was accepted |
| accepted_by_authn_user_id | uuid | YES | - | FK to users (who accepted) |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `token` UNIQUE (cryptographically secure token)

**Partial Unique Indexes**:
- `idx_invitations_unique_pending` UNIQUE ON (company_id, email) WHERE status = 'pending'
  - Only one pending invitation per (company, email) pair

**Check Constraints**:
- `team_role_requires_team` - `(team_role IS NULL OR team_id IS NOT NULL)`

**Indexes**:
- `idx_invitations_company` ON (company_id) - Multi-tenancy filtering
- `idx_invitations_email` ON (email) - Lookup by email
- `idx_invitations_token` ON (token) - Fast token lookup for acceptance
- `idx_invitations_status` ON (status) - Filter by status
- `idx_invitations_invited_by` ON (invited_by_authz_user_id) - Who invited

---

### authz_company_settings

**Purpose**: Company-specific configuration and limits
**Source**: [company_settings.md](./resources/company_settings.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| company_id | uuid | NO | - | FK to authz_companies (1:1) |
| max_users | integer | YES | - | Maximum users allowed (null = unlimited) |
| max_teams | integer | YES | - | Maximum teams allowed (null = unlimited) |
| features | jsonb | NO | '{}' | Feature flags |
| branding | jsonb | NO | '{}' | Branding configuration |
| timezone | varchar(100) | YES | - | Company timezone (IANA format) |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

**Primary Key**: `id`

**Unique Constraints**:
- `company_id` UNIQUE (1:1 relationship with company)

**Check Constraints**:
- `max_users_positive` - `(max_users IS NULL OR max_users >= 1)`
- `max_teams_positive` - `(max_teams IS NULL OR max_teams >= 1)`

**Indexes**:
- `idx_company_settings_company` UNIQUE ON (company_id) - 1:1 relationship

---

### authz_audit_logs

**Purpose**: Immutable audit trail of all authorization changes
**Source**: [audit_log.md](./resources/audit_log.md)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| company_id | uuid | NO | - | FK to authz_companies |
| actor_authz_user_id | uuid | YES | - | FK to authz_users (null for system) |
| action | varchar(100) | NO | - | Action performed |
| resource_type | varchar(100) | NO | - | Type of resource affected |
| resource_id | uuid | NO | - | ID of affected resource |
| changes | jsonb | NO | '{}' | Before/after values |
| metadata | jsonb | YES | - | Additional context (IP, user agent) |
| created_at | timestamp | NO | now() | When action occurred |

**Primary Key**: `id`

**Indexes**:
- `idx_audit_logs_company` ON (company_id) - Multi-tenancy filtering
- `idx_audit_logs_actor` ON (actor_authz_user_id) - Filter by actor
- `idx_audit_logs_resource` ON (resource_type, resource_id) - Resource history
- `idx_audit_logs_action` ON (action) - Filter by action type
- `idx_audit_logs_created_at` ON (created_at DESC) - Chronological queries

**Note**: No UPDATE or DELETE operations allowed (immutable)

---

## Foreign Keys

### authz_users Foreign Keys

```sql
-- Link to authentication user (Accounts domain)
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_authn_user
  FOREIGN KEY (authn_user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

-- Link to company
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_company
  FOREIGN KEY (company_id)
  REFERENCES authz_companies(id)
  ON DELETE CASCADE;

-- Link to team (optional)
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_team
  FOREIGN KEY (team_id)
  REFERENCES authz_teams(id)
  ON DELETE SET NULL;
```

### authz_teams Foreign Keys

```sql
-- Link to company
ALTER TABLE authz_teams
  ADD CONSTRAINT fk_teams_company
  FOREIGN KEY (company_id)
  REFERENCES authz_companies(id)
  ON DELETE CASCADE;
```

### authz_invitations Foreign Keys

```sql
-- Link to company
ALTER TABLE authz_invitations
  ADD CONSTRAINT fk_invitations_company
  FOREIGN KEY (company_id)
  REFERENCES authz_companies(id)
  ON DELETE CASCADE;

-- Link to inviter
ALTER TABLE authz_invitations
  ADD CONSTRAINT fk_invitations_invited_by
  FOREIGN KEY (invited_by_authz_user_id)
  REFERENCES authz_users(id)
  ON DELETE CASCADE;

-- Link to team (optional)
ALTER TABLE authz_invitations
  ADD CONSTRAINT fk_invitations_team
  FOREIGN KEY (team_id)
  REFERENCES authz_teams(id)
  ON DELETE SET NULL;

-- Link to authn_user who accepted (optional)
ALTER TABLE authz_invitations
  ADD CONSTRAINT fk_invitations_accepted_by
  FOREIGN KEY (accepted_by_authn_user_id)
  REFERENCES users(id)
  ON DELETE SET NULL;
```

### authz_company_settings Foreign Keys

```sql
-- Link to company (1:1)
ALTER TABLE authz_company_settings
  ADD CONSTRAINT fk_company_settings_company
  FOREIGN KEY (company_id)
  REFERENCES authz_companies(id)
  ON DELETE CASCADE;
```

### authz_audit_logs Foreign Keys

```sql
-- Link to company
ALTER TABLE authz_audit_logs
  ADD CONSTRAINT fk_audit_logs_company
  FOREIGN KEY (company_id)
  REFERENCES authz_companies(id)
  ON DELETE CASCADE;

-- Link to actor (optional - null for system actions)
ALTER TABLE authz_audit_logs
  ADD CONSTRAINT fk_audit_logs_actor
  FOREIGN KEY (actor_authz_user_id)
  REFERENCES authz_users(id)
  ON DELETE SET NULL;
```

---

## Performance Indexes Summary

### Critical for Multi-Tenancy
- `authz_users.company_id` - Filters all authz_user queries by company
- `authz_teams.company_id` - Filters all team queries by company
- `authz_invitations.company_id` - Filters all invitation queries by company
- `authz_company_settings.company_id` - 1:1 relationship lookup
- `authz_audit_logs.company_id` - Filters all audit log queries by company

### Critical for Performance
- `authz_invitations.token` - Fast token lookup for invitation acceptance
- `authz_audit_logs.created_at DESC` - Chronological audit log queries

### Unique Constraints (Also serve as indexes)
- `authz_companies.slug` - Fast company lookup by slug
- `authz_users.(authn_user_id, company_id)` - Prevent duplicate memberships
- `authz_teams.(company_id, name)` - Team name unique per company
- `authz_invitations.token` - Secure token uniqueness
- `authz_invitations.(company_id, email) WHERE status='pending'` - Prevent duplicate pending invitations

---

## Migration Order

When creating migrations, follow this order to satisfy foreign key constraints:

1. **authz_companies** (no dependencies)
2. **authz_company_settings** (depends on authz_companies)
3. **authz_teams** (depends on authz_companies)
4. **authz_users** (depends on users, authz_companies, authz_teams)
5. **authz_invitations** (depends on authz_companies, authz_users, authz_teams, users)
6. **authz_audit_logs** (depends on authz_companies, authz_users)

---

## Ash Postgres Generators

When using Ash Framework, generate migrations with:

```bash
# Generate migrations for all Authorization resources
mix ash_postgres.generate_migrations --name add_authorization_domain

# Review generated migration files before running
# Migrations will be in priv/repo/migrations/

# Run migrations
mix ash_postgres.migrate
```

Ash will automatically generate:
- Table definitions
- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Check constraints

**Important**: Review generated migrations to ensure:
- Partial unique indexes are correct (Ash may not auto-generate these)
- JSONB columns have proper defaults
- CASCADE behaviors are as expected

---

## Data Types

### Enums

The following enums should be implemented as VARCHAR with CHECK constraints:

```sql
-- authz_companies.status
CHECK (status IN ('active', 'archived'))

-- authz_users.role
CHECK (role IN ('admin', 'manager', 'user'))

-- authz_users.team_role
CHECK (team_role IN ('team_lead', 'team_member'))

-- authz_users.status
CHECK (status IN ('active', 'inactive'))

-- authz_teams.status
CHECK (status IN ('active', 'archived'))

-- authz_invitations.role
CHECK (role IN ('admin', 'manager', 'user'))

-- authz_invitations.team_role
CHECK (team_role IN ('team_lead', 'team_member'))

-- authz_invitations.status
CHECK (status IN ('pending', 'accepted', 'revoked', 'expired'))
```

### JSONB Columns

**authz_company_settings.features**:
```json
{
  "advanced_reports": false,
  "api_access": false,
  "custom_fields": false,
  "export_data": true,
  "team_management": true,
  "audit_logs": false
}
```

**authz_company_settings.branding**:
```json
{
  "logo_url": null,
  "primary_color": "#3B82F6",
  "secondary_color": "#10B981",
  "favicon_url": null
}
```

**authz_audit_logs.changes**:
```json
{
  "field": "role",
  "from": "user",
  "to": "manager",
  "reason": "Promotion"
}
```

**authz_audit_logs.metadata**:
```json
{
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "session_id": "session-uuid",
  "request_id": "req-uuid"
}
```

---

## Retention Policies

### Audit Logs
- **Minimum Retention**: 2 years
- **Enforcement**: Manual DBA cleanup (no automated process in Phase 1)
- **Query**: `DELETE FROM authz_audit_logs WHERE created_at < (NOW() - INTERVAL '2 years');`

---

## Database Size Estimates

Assuming average company has:
- 20 active users
- 5 teams
- 10 pending invitations
- 1000 audit log entries per year

**Per Company (first year)**:
- authz_companies: ~1 KB
- authz_company_settings: ~1 KB
- authz_users: 20 × 500 bytes = 10 KB
- authz_teams: 5 × 300 bytes = 1.5 KB
- authz_invitations: 10 × 700 bytes = 7 KB
- authz_audit_logs: 1000 × 1 KB = 1 MB

**Total per company**: ~1.02 MB per year

**With indexes**: ~1.5 MB per company per year

**For 100 companies**: ~150 MB per year (very manageable)

---

## Related Specifications

- [domain.md](./domain.md) - Domain overview and multi-tenancy
- [policies/row_level_security.md](./policies/row_level_security.md) - Multi-tenancy enforcement
- All resource specs in [resources/](./resources/) folder

---

**Note**: This is a generated document. For business logic, validations, calculations, and detailed specifications, always refer to the source resource specification files.
