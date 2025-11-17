# Roles and Permissions Specification

## Overview

The Clientt CRM application uses a role-based access control (RBAC) system implemented through the Ash Framework's policy system. Each user has a role within a company, and permissions are enforced at the resource level through declarative policies.

## System Roles

Defined in: `lib/clientt_crm_app/authorization/authz_user.ex:156`

The system supports four roles:

| Role | Description | Intended Use Case |
|------|-------------|-------------------|
| `admin` | Full administrative access | Company owners, IT administrators |
| `manager` | Management-level access | Team leads, department managers |
| `form_admin` | Forms-focused administrative access | Marketing teams, form specialists |
| `user` | Basic user access | Standard employees, read-only users |

### Role Hierarchy

```
admin (highest privileges)
  ├── manager
  ├── form_admin
  └── user (lowest privileges)
```

**Note**: The hierarchy is not strictly enforced in code. Each role has specific permissions defined by resource policies.

## Multi-Tenancy

**All permissions are scoped to a company.** Users can only access resources within their assigned company.

- Enforced through: `actor_attribute_equals(:company_id, :company_id)`
- Applies to: All read and write operations
- Exception: Public form submissions (unauthenticated)

## Permission Breakdown by Domain

### Forms Domain

#### Form Resource (`ClienttCrmApp.Forms.Form`)

**File**: `lib/clientt_crm_app/forms/form.ex:347-403`

| Action | Admin | Manager | Form Admin | User | Notes |
|--------|-------|---------|------------|------|-------|
| Read | ✅ | ✅ | ✅ | ✅ | All company members |
| Create | ✅ | ✅ | TBD | ❌ | Create new forms |
| Update | ✅ | ✅ | TBD | ❌ | Only draft forms |
| Publish | ✅ | ✅ | TBD | ❌ | Make form live |
| Archive | ✅ | ❌ | ❌ | ❌ | Admin only |
| Duplicate | ✅ | ✅ | TBD | ❌ | Clone existing form |
| Delete | ❌ | ❌ | ❌ | ❌ | Forbidden (use archive) |
| View Count | ✅ | ✅ | ✅ | ✅ | Internal operation |
| Submission Count | ✅ | ✅ | ✅ | ✅ | Internal operation |

**Intended Production Policies**:
```elixir
# Read: All company members
authorize_if actor_attribute_equals(:company_id, :company_id)

# Create/Update/Publish/Duplicate: Admin and Manager
authorize_if actor_attribute_in(:role, [:admin, :manager])

# Archive: Admin only
authorize_if actor_attribute_equals(:role, :admin)

# Delete: Always forbidden
forbid_if always()
```

#### Form Field Resource (`ClienttCrmApp.Forms.FormField`)

**File**: `lib/clientt_crm_app/forms/form_field.ex:257-278`

| Action | Admin | Manager | Form Admin | User | Notes |
|--------|-------|---------|------------|------|-------|
| Read | ✅ | ✅ | ✅ | ✅ | All company members |
| Create | ✅ | ✅ | TBD | ❌ | Add fields to form |
| Update | ✅ | ✅ | TBD | ❌ | Modify field settings |
| Reorder | ✅ | ✅ | TBD | ❌ | Change field order |
| Delete | ✅ | ✅ | TBD | ❌ | Remove field |

**Business Rules**:
- Fields can only be modified on draft forms
- Published forms have immutable fields
- Deleting a field doesn't delete submission data

#### Submission Resource (`ClienttCrmApp.Forms.Submission`)

**File**: `lib/clientt_crm_app/forms/submission.ex:350-392`

| Action | Admin | Manager | Form Admin | User | Public |
|--------|-------|---------|------------|------|--------|
| Read | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create (Internal) | ✅ | ✅ | TBD | ❌ | ❌ |
| Create (Public) | - | - | - | - | ✅ |
| Update Status | ✅ | ✅ | TBD | ❌ | ❌ |
| Soft Delete | ✅ | ✅ | TBD | ❌ | ❌ |
| Restore | ✅ | ✅ | TBD | ❌ | ❌ |
| Hard Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

**Submission Status Workflow**:
```
new → contacted → qualified → converted
  ↓
spam (can transition from any status)
```

**Business Rules**:
- `form_data` and `metadata` are immutable after creation
- Only `status` and `deleted_at` can be updated
- Public submission endpoint requires no authentication
- Hard deletion is forbidden (audit trail preservation)

#### Notification Resource (`ClienttCrmApp.Forms.Notification`)

**File**: `lib/clientt_crm_app/forms/notification.ex:182-213`

| Action | Admin | Manager | Form Admin | User | Notes |
|--------|-------|---------|------------|------|-------|
| Read Own | ✅ | ✅ | ✅ | ✅ | Users see only their notifications |
| Mark as Read | ✅ | ✅ | ✅ | ✅ | Own notifications only |
| Mark as Unread | ✅ | ✅ | ✅ | ✅ | Own notifications only |
| Delete | ✅ | ✅ | ✅ | ✅ | Own notifications only |

**Intended Production Policies**:
```elixir
# All notification actions: User can only access their own
authorize_if actor_attribute_equals(:id, :user_id)
```

### Authorization Domain

#### AuthzUser Resource (`ClienttCrmApp.Authorization.AuthzUser`)

**File**: `lib/clientt_crm_app/authorization/authz_user.ex:234-253`

| Action | Admin | Manager | Form Admin | User | Notes |
|--------|-------|---------|------------|------|-------|
| Read | ✅ | ✅ | ✅ | ✅ | Within company only |
| Create | ✅ | ❌ | ❌ | ❌ | Add users to company |
| Update Role | ✅ | ❌ | ❌ | ❌ | Change user roles |
| Assign to Team | ✅ | ❌ | ❌ | ❌ | Team management |
| Remove from Team | ✅ | ❌ | ❌ | ❌ | Team management |
| Suspend | ✅ | ❌ | ❌ | ❌ | Deactivate user |
| Reactivate | ✅ | ❌ | ❌ | ❌ | Reactivate user |
| Destroy | ✅ | ❌ | ❌ | ❌ | Remove from company |

**Business Rules**:
- Cannot downgrade last admin in company (TODO: implement validation)
- Users can have different roles in different companies
- Team assignment requires team to belong to same company

#### Company Resource (`ClienttCrmApp.Authorization.Company`)

**File**: `lib/clientt_crm_app/authorization/company.ex`

| Action | Admin | Manager | Form Admin | User | Notes |
|--------|-------|---------|------------|------|-------|
| Read Own | ✅ | ✅ | ✅ | ✅ | Current company only |
| Update | ✅ | ❌ | ❌ | ❌ | Company settings |
| Create | Special | - | - | - | First admin during signup |

## Form Admin Role - TBD

**Status**: `form_admin` role has been added to the system but permissions are not yet defined.

**Recommended Permissions** (to be implemented):
- Full access to Forms domain (create, update, publish, duplicate)
- Full access to Submissions (read, update status, export)
- Read access to company users
- No access to user management or company settings

**Decision Required**: Should `form_admin` have the same permissions as `manager` for Forms, or should it be more restricted?

## Current Implementation Status

⚠️ **IMPORTANT: Development Mode Active**

All policies are currently in **development mode** with placeholder authorization:

```elixir
policy action(:some_action) do
  # authorize_if actor_attribute_in(:role, [:admin, :manager])  # <- Production
  # Placeholder during development
  authorize_if always()  # <- Currently active (allows everyone)
end
```

### To Enable Production Policies

1. Uncomment the intended policy lines
2. Remove or comment out `authorize_if always()`
3. Test authorization with different roles
4. Ensure proper actor context is set in LiveView/controllers

### Files Requiring Policy Updates

- [ ] `lib/clientt_crm_app/forms/form.ex:347-403`
- [ ] `lib/clientt_crm_app/forms/form_field.ex:257-278`
- [ ] `lib/clientt_crm_app/forms/submission.ex:350-392`
- [ ] `lib/clientt_crm_app/forms/notification.ex:182-213`
- [ ] `lib/clientt_crm_app/authorization/authz_user.ex:234-253`
- [ ] `lib/clientt_crm_app/authorization/company.ex` (policies section)

## Permission Matrix Summary

### By Resource Type

| Resource | Admin | Manager | Form Admin | User |
|----------|-------|---------|------------|------|
| **Forms** | Full | Create/Update/Publish | TBD | Read only |
| **Submissions** | Full | Full (except hard delete) | TBD | Read only |
| **Notifications** | Own only | Own only | Own only | Own only |
| **Users** | Full | Read only | Read only | Read only |
| **Company** | Full | Read only | Read only | Read only |

### Forbidden Actions (All Roles)

- Hard delete forms (use archive instead)
- Hard delete submissions (use soft delete)
- Edit submission data after creation (immutable audit trail)
- Access resources outside own company

## Testing Credentials

Sample users for testing roles:

| Email | Role | Password |
|-------|------|----------|
| sample_admin@clientt.com | admin | SampleAdmin123! |
| sample_manager@clientt.com | manager | SampleManager123! |
| sample_form_admin@clientt.com | form_admin | SampleForm_admin123! |
| sample_user@clientt.com | user | SampleUser123! |

**Company**: Clientt Sample Inc. (slug: `clientt-sample`)

**Seed File**: `priv/repo/seeds.exs`

## Future Considerations

### Additional Roles

Consider adding:
- `sales_admin`: Full access to leads/submissions, limited form access
- `viewer`: Read-only access to everything
- `api_user`: Programmatic access via API tokens

### Permission Granularity

Current system uses coarse-grained RBAC. Future enhancements:
- Field-level permissions (hide sensitive fields from certain roles)
- Record-level permissions (user can only see their own created forms)
- Time-based permissions (temporary elevated access)
- Custom permissions per company (company-specific role definitions)

### Team-Based Permissions

The `AuthzUser` resource supports team membership and team roles:
- `team_id`: UUID of team user belongs to
- `team_role`: `:team_lead` or `:team_member`

Team-based policies not yet implemented.

## References

- Ash Framework Policies: https://hexdocs.pm/ash/policies.html
- Authorization Domain: `lib/clientt_crm_app/authorization.ex`
- Forms Domain: `lib/clientt_crm_app/forms.ex`
- Sample Data Manager Skill: `.claude/skills/sample-data-manager.md`

---

**Last Updated**: 2025-11-17
**Status**: Draft - Policies in development mode
**Next Steps**: Define `form_admin` permissions, enable production policies
