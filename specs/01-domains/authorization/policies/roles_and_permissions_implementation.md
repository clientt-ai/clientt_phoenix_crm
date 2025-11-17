# Roles and Permissions - Current Implementation

**Type**: Implementation Guide
**Status**: In Development
**Last Updated**: 2025-11-17

> **Note**: This document describes the **current implementation state**. For the intended design specification, see [role_based_access.md](./role_based_access.md).

## Overview

The Clientt CRM application uses a role-based access control (RBAC) system implemented through the Ash Framework's policy system. Each user has a role within a company, and permissions are enforced at the resource level through declarative policies.

## Current System Roles

**Implementation**: `lib/clientt_crm_app/authorization/authz_user.ex:156`

The system currently supports **four roles** (updated from three):

| Role | Description | Status |
|------|-------------|--------|
| `admin` | Full administrative access | ✅ Fully specified |
| `manager` | Management-level access | ✅ Fully specified |
| `user` | Basic user access | ✅ Fully specified |
| `form_admin` | Forms-focused administrative access | ⚠️ **Added but not yet specified** |

### Role Differences from Specification

The [role_based_access.md](./role_based_access.md) specification defines three roles (admin, manager, user). The implementation has added a fourth role:

**`form_admin`**: Added 2025-11-17
- **Purpose**: Provide specialized access for marketing teams and form specialists
- **Permissions**: Not yet defined (TBD)
- **Recommendation**: Should have full access to Forms domain, limited access to Authorization domain

## Multi-Tenancy

**All permissions are scoped to a company.** Users can only access resources within their assigned company.

- Enforced through: `actor_attribute_equals(:company_id, :company_id)`
- Applies to: All read and write operations
- Exception: Public form submissions (unauthenticated)

## Forms Domain Permissions (NEW)

The Forms domain was implemented with role-based policies that are **currently in development mode**.

### Form Resource

**Implementation**: `lib/clientt_crm_app/forms/form.ex:347-403`

| Action | Admin | Manager | Form Admin | User | Current State |
|--------|-------|---------|------------|------|---------------|
| Read | ✅ | ✅ | TBD | ✅ | Dev mode (allows all) |
| Create | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Update | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Publish | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Archive | ✅ | ❌ | ❌ | ❌ | Dev mode (allows all) |
| Duplicate | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Delete | ❌ | ❌ | ❌ | ❌ | Forbidden (enforced) |

**Production Policy Example** (currently commented out):
```elixir
# From lib/clientt_crm_app/forms/form.ex:360
policy action(:create) do
  # authorize_if actor_attribute_in(:role, [:admin, :manager])  # <- Production
  # Placeholder during development
  authorize_if always()  # <- Currently active
end
```

### Form Field Resource

**Implementation**: `lib/clientt_crm_app/forms/form_field.ex:257-278`

| Action | Admin | Manager | Form Admin | User | Current State |
|--------|-------|---------|------------|------|---------------|
| Read | ✅ | ✅ | TBD | ✅ | Dev mode (allows all) |
| Create | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Update | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Reorder | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |
| Delete | ✅ | ✅ | TBD | ❌ | Dev mode (allows all) |

**Business Rules**:
- Fields can only be modified on draft forms
- Published forms have immutable fields

### Submission Resource

**Implementation**: `lib/clientt_crm_app/forms/submission.ex:350-392`

| Action | Admin | Manager | Form Admin | User | Public | Current State |
|--------|-------|---------|------------|------|--------|---------------|
| Read | ✅ | ✅ | TBD | ✅ | ❌ | Dev mode (allows all) |
| Create (Internal) | ✅ | ✅ | TBD | ❌ | ❌ | Dev mode (allows all) |
| Create (Public) | - | - | - | - | ✅ | Always allowed |
| Update Status | ✅ | ✅ | TBD | ❌ | ❌ | Dev mode (allows all) |
| Soft Delete | ✅ | ✅ | TBD | ❌ | ❌ | Dev mode (allows all) |
| Restore | ✅ | ✅ | TBD | ❌ | ❌ | Dev mode (allows all) |
| Hard Delete | ❌ | ❌ | ❌ | ❌ | ❌ | Forbidden (enforced) |

**Submission Status Workflow**:
```
new → contacted → qualified → converted
  ↓
spam (can transition from any status)
```

**Business Rules**:
- `form_data` and `metadata` are immutable after creation
- Only `status` and `deleted_at` can be updated
- Public submission endpoint at `/forms/:id/submit` requires no authentication
- Hard deletion forbidden to preserve audit trail

### Notification Resource

**Implementation**: `lib/clientt_crm_app/forms/notification.ex:182-213`

| Action | Admin | Manager | Form Admin | User | Current State |
|--------|-------|---------|------------|------|---------------|
| Read Own | ✅ | ✅ | ✅ | ✅ | Dev mode (allows all) |
| Mark as Read | ✅ | ✅ | ✅ | ✅ | Dev mode (allows all) |
| Mark as Unread | ✅ | ✅ | ✅ | ✅ | Dev mode (allows all) |
| Delete | ✅ | ✅ | ✅ | ✅ | Dev mode (allows all) |

**Production Intent**: All users can only access their own notifications
```elixir
# From lib/clientt_crm_app/forms/notification.ex:184
authorize_if actor_attribute_equals(:id, :user_id)
```

## ⚠️ Development Mode Status

**CRITICAL**: All policies are currently in **development mode** with placeholder authorization:

```elixir
policy action(:some_action) do
  # authorize_if actor_attribute_in(:role, [:admin, :manager])  # <- Production
  # Placeholder during development
  authorize_if always()  # <- Currently active (allows everyone)
end
```

### Files Requiring Policy Updates

When transitioning to production, update these files:

- [ ] `lib/clientt_crm_app/forms/form.ex:347-403`
- [ ] `lib/clientt_crm_app/forms/form_field.ex:257-278`
- [ ] `lib/clientt_crm_app/forms/submission.ex:350-392`
- [ ] `lib/clientt_crm_app/forms/notification.ex:182-213`
- [ ] `lib/clientt_crm_app/authorization/authz_user.ex:234-253`
- [ ] `lib/clientt_crm_app/authorization/company.ex` (policies section)

### Transition Steps

1. Uncomment intended policy lines
2. Remove or comment out `authorize_if always()` placeholders
3. Test with sample users (see below)
4. Verify proper actor context is set in LiveView/controllers
5. Add tests for each role's permissions

## Form Admin Role - Decision Required

**Status**: Role added to system but permissions undefined

**Context**: Added to support marketing teams and form specialists who need Forms domain access without full company admin privileges.

**Recommended Permissions**:

| Domain | Recommendation | Rationale |
|--------|---------------|-----------|
| Forms | Full access (create, update, publish, duplicate) | Core responsibility |
| Submissions | Full access (read, update status, soft delete, restore) | Lead management |
| Notifications | Own only | Standard user behavior |
| Users | Read only | Needs to see team members |
| Company | Read only | No company management needed |
| Teams | Read only | No team creation needed |

**Alternative Option**: Make `form_admin` equivalent to `manager` for Forms domain only.

**Decision Point**: Product/business team should determine exact scope of `form_admin` role.

## Testing Credentials

Sample users for testing all roles (seeded via `priv/repo/seeds.exs`):

| Email | Role | Password | Created |
|-------|------|----------|---------|
| sample_admin@clientt.com | admin | SampleAdmin123! | Initial seed |
| sample_manager@clientt.com | manager | SampleManager123! | Initial seed |
| sample_user@clientt.com | user | SampleUser123! | Initial seed |
| sample_form_admin@clientt.com | form_admin | SampleForm_admin123! | 2025-11-17 |

**Company**: Clientt Sample Inc. (slug: `clientt-sample`)

**Seed Command**: `mix run priv/repo/seeds.exs`

**Skill**: `.claude/skills/sample-data-manager.md`

## Authorization Domain Permissions

For Authorization domain permissions (Company, AuthzUser, Team, etc.), see:
- [role_based_access.md](./role_based_access.md) - Specification
- Implementation: Policies defined in respective resource files

## Implementation Roadmap

### Phase 1: Enable Production Policies
- [ ] Define `form_admin` permissions
- [ ] Enable production policies in Forms domain
- [ ] Add authorization tests
- [ ] Update documentation

### Phase 2: Field-Level Permissions (Future)
- [ ] Hide sensitive fields from certain roles
- [ ] Implement record-level permissions
- [ ] Add custom permissions per company

### Phase 3: Team-Based Permissions (Future)
- [ ] Implement team-scoped policies
- [ ] Team lead special permissions
- [ ] Team member isolation

## Differences from Specification

| Aspect | Specification ([role_based_access.md](./role_based_access.md)) | Current Implementation |
|--------|--------------------------------------------------------------|------------------------|
| Roles | 3 roles (admin, manager, user) | 4 roles (added form_admin) |
| Domains | Authorization domain only | Authorization + Forms domains |
| Policy Status | Defined and approved | Development mode (disabled) |
| Form Admin | Not specified | Added but undefined |

## Related Documentation

- **Specification**: [role_based_access.md](./role_based_access.md) - Intended design for Authorization domain
- **Security**: [row_level_security.md](./row_level_security.md) - Multi-tenancy enforcement
- **Invitations**: [invitation_security.md](./invitation_security.md) - Token validation
- **Sample Data**: `.claude/skills/sample-data-manager.md` - Test user management

## References

- Forms Domain: `lib/clientt_crm_app/forms.ex`
- Authorization Domain: `lib/clientt_crm_app/authorization.ex`
- Ash Authorization: https://hexdocs.pm/ash/authorization.html
- Sample Users Seed: `priv/repo/seeds.exs`

---

**Maintained by**: Development Team
**Review Frequency**: After each Forms domain update
**Next Review**: When transitioning to production policies
