# Domain: Authorization

**Status**: approved
**Last Updated**: 2025-11-11
**Owner**: Development Team

## Domain Purpose

Manages multi-tenant authorization for the ClienttCRM application, separating authentication (who you are) from authorization (what you can do in each company context). Enables users to belong to multiple companies with different roles and permissions in each, while providing complete data isolation between companies.

## Ubiquitous Language

- **authn_user**: Authentication user - the login identity from the `users` table (WHO you are)
- **authz_user**: Authorization user - company-scoped identity with roles and permissions (WHAT you can do)
- **Company**: Tenant organization in the multi-tenant system (equivalent to "tenant")
- **Team**: Sub-group within a company for organizing users (e.g., "Engineering", "Sales")
- **Row-level tenancy**: Multi-tenancy approach using company_id filtering on shared tables
- **RBAC**: Role-Based Access Control with predefined roles
- **Aggregate**: DDD pattern - cluster of entities treated as a single unit
- **Domain Event**: Significant occurrence in the domain (e.g., CompanyCreated, RoleChanged)
- **Invitation**: Email-based workflow for adding users to companies
- **Audit Log**: Immutable record of authorization changes

## Domain Boundaries

### In Scope

- Multi-company user membership (one user, multiple companies)
- Role-based access control (admin, manager, user)
- Team organization within companies
- User invitation workflow with email tokens
- Company-specific settings and configuration
- Comprehensive audit logging of authorization changes
- Row-level data isolation between companies
- Company context switching for users

### Out of Scope

- User authentication (handled by existing Accounts domain)
- Password management (Accounts domain)
- Billing and subscription management (future Billing domain)
- Super admin/platform administration (Phase 2)
- Custom roles and permissions (ABAC - Phase 2)
- Team hierarchy (Phase 2)
- SAML/SSO integration (Phase 2)

### Integration Points

- **Accounts Domain**: Consumes authn_user (User) for linking authorization identities
- **Future Domains**: All tenant-scoped domains will reference authz_companies.id as company_id
- **Email Service**: Sends invitation emails and role change notifications
- **Session Management**: Stores current_company_id and current_authz_user in user session

## Core Business Rules

1. **Separation of Authentication and Authorization**: A single authn_user (login identity) can have multiple authz_users (one per company membership), enabling multi-company access with different roles
2. **Unique Company Membership**: Each (authn_user_id, company_id) pair must be unique - a user can only have one authorization identity per company
3. **Row-Level Tenancy**: All tenant-scoped queries MUST be filtered by company_id through Ash policies
4. **Team Role Constraints**: If team_role is set, team_id MUST be set (enforced at database level)
5. **Invitation Uniqueness**: Only one pending invitation allowed per (email, company_id) combination
6. **Invitation Expiration**: Invitations expire after 7 days
7. **Immutable Audit Logs**: Audit log entries cannot be updated or deleted - only created
8. **Slug Uniqueness**: Company slugs must be globally unique and URL-safe
9. **First User is Admin**: When creating a company, the first user automatically becomes admin with full permissions

## Domain Events

### Published Events

| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| authorization.company_created | Company created | {company_id, name, slug, first_admin_authz_user_id} | Analytics, Welcome Email Service |
| authorization.authz_user_created | User joins company | {authz_user_id, company_id, authn_user_id, role} | Onboarding Service, Analytics |
| authorization.role_changed | User role updated | {authz_user_id, old_role, new_role, changed_by} | Notification Service, Cache Invalidation |
| authorization.team_created | Team created | {team_id, company_id, name} | Analytics |
| authorization.team_member_added | User assigned to team | {authz_user_id, team_id, team_role} | Team Notification Service |
| authorization.invitation_sent | Invitation created | {invitation_id, email, company_id, role} | Email Service |
| authorization.invitation_accepted | User accepts invite | {invitation_id, authz_user_id, accepted_by_authn_user_id} | Onboarding Service, Analytics |
| authorization.company_archived | Company archived | {company_id, archived_by} | Cleanup Service, Analytics |
| authorization.settings_updated | Company settings changed | {company_id, setting_key, old_value, new_value} | Feature Flag Service |
| authorization.user_suspended | User suspended from company | {authz_user_id, suspended_by} | Notification Service |

### Consumed Events

| Event Name | Source | Handler Action |
|------------|--------|----------------|
| accounts.user_created | Accounts domain | Auto-create first company for new users on first login (Phase 1) |
| (Future) billing.subscription_changed | Billing domain | Update company_settings.max_users limit |

## Resources in This Domain

- **Company** - Root aggregate representing a tenant organization
- **AuthzUser** - Authorization identity linking authn_user to company with role
- **Team** - Sub-group within company for organizing users
- **Invitation** - Email-based invitation to join a company
- **CompanySettings** - Company-specific configuration and feature flags
- **AuditLog** - Immutable log of all authorization changes

## Aggregate Roots

### Company Aggregate

**Root**: Company
**Ensures**: Company always has valid settings, at least one active admin, and maintains data isolation

**Entities in Aggregate**:
- Company (root)
- CompanySettings (1:1)
- AuthzUser (1:Many) - manages membership
- Team (1:Many) - manages organization
- Invitation (1:Many) - manages access requests
- AuditLog (1:Many) - records all changes

**Invariants**:
- Slug must be unique across all companies
- Status transitions: active → archived (one-way)
- Cannot delete company with active users (must archive)

## Multi-Tenancy Implementation

### Row-Level Filtering
All tenant-scoped resources include `company_id` and are automatically filtered by current company context through Ash policies.

**Tenant-Scoped Resources**:
- AuthzUser
- Team
- Invitation
- CompanySettings
- AuditLog

**Not Scoped** (accessible across companies):
- Company (users can belong to multiple companies)

### Session Context
```elixir
# Required session assigns for multi-tenancy
%{
  current_authn_user: %User{},        # Authentication identity
  current_company_id: "uuid",          # Active company
  current_authz_user: %AuthzUser{}     # Authorization identity for current company
}
```

### Company Switching
Users can switch between companies they belong to, which updates:
1. `current_company_id` in session
2. `current_authz_user` to the authz_user for selected company
3. All subsequent queries automatically filter by new company_id

## Security Considerations

### Authorization Policies
- All actions require appropriate role (admin, manager, user)
- Managers can manage teams but not company settings
- Users can only view, not manage
- All policies enforce company_id filtering

### Data Isolation
- Ash policies ensure company_id filter on all queries
- Cannot bypass tenancy through direct IDs
- Cross-company data access prevented at framework level

### Audit Requirements
- All authorization changes logged immutably
- Logs include: actor, action, resource, changes, timestamp
- Minimum 2-year retention

### Token Security
- Invitation tokens: 32+ bytes, cryptographically secure
- One-time use only
- 7-day expiration enforced

## Implementation Phases

### Phase 1: Core (Weeks 1-2)
- Company and AuthzUser resources
- Row-level tenancy policies
- Basic CRUD actions
- First company auto-creation on user registration

### Phase 2: Organization (Week 3)
- Team resource
- CompanySettings resource

### Phase 3: Invitations (Week 4)
- Invitation resource and workflow
- Email integration

### Phase 4: Audit (Week 5)
- AuditLog resource
- Change tracking hooks

### Phase 5: UI (Weeks 6-7)
- LiveView components
- Company switcher
- User/team management

### Phase 6: Migration (Week 8)
- Data migration from monolithic structure
- Integration testing
- Security audit

## Open Questions

1. **Super Admin Role**: Deferred to Phase 2 - do we need platform-level administration?
2. **Billing Integration**: Confirmed out of scope - will be separate domain
3. **Team Hierarchy**: Using flat structure for v1 - parent/child teams in Phase 2 if needed
4. **Custom Permissions**: Simple RBAC (3 roles) for v1 - ABAC expansion in Phase 2

## Related Specifications

- Resource Specs: `./resources/` (company.md, authz_user.md, team.md, etc.)
- Feature Specs: `./features/` (BDD scenarios for user journeys)
- Policy Specs: `./policies/` (authorization rules and multi-tenancy policies)
- Original Specification: `../../../dev_task_prompts/20251111-01-multitenancy/SPECIFICATION.md`
