# Policy: Role-Based Access Control (RBAC)

**Domain**: Authorization
**Type**: authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Defines permissions for the three predefined roles (admin, manager, user) within a company. This policy determines what actions users can perform based on their company-level role and optional team-level role.

## Scope

### Resources
- Company
- AuthzUser
- Team
- Invitation
- CompanySettings
- AuditLog

### Actions
- read, list, create, update, destroy
- Custom actions (archive, invite, accept, etc.)

### Actors
- Admin (role: :admin)
- Manager (role: :manager)
- User (role: :user)

## Roles Overview

### Role: Admin
**Capabilities**: Full company management
**Permissions**: Can perform all actions within their company

### Role: Manager
**Capabilities**: Team management, limited settings
**Permissions**: Can manage teams, invite users, view most resources

### Role: User
**Capabilities**: Standard resource access
**Permissions**: Can view resources, no management capabilities

---

## Rules by Resource

### Company Resource

#### Rule: Anyone can create a company
**Rationale**: New users need to create their first company
```elixir
policy action(:create) do
  authorize_if always()
end
```

**Authorization Matrix**:
| Role    | Create | Read Own | Update | Archive |
|---------|--------|----------|--------|---------|
| Anyone  | ✓      | -        | -      | -       |
| Admin   | -      | ✓        | ✓      | ✓       |
| Manager | -      | ✓        | ✗      | ✗       |
| User    | -      | ✓        | ✗      | ✗       |

---

#### Rule: Members can read their companies
```elixir
policy action_type(:read) do
  authorize_if relates_to_actor_via([:authz_users, :authn_user])
end
```

**Examples**:
```yaml
# Allowed
actor: alice@example.com
companies: [Acme Corp, Beta Inc]
action: list
resource: Company
result: returns [Acme Corp, Beta Inc]

# Denied
actor: alice@example.com
companies: [Acme Corp]
action: read
resource: Company (id: "beta-uuid")
result: denied (not a member)
```

---

#### Rule: Only admins can update or archive
```elixir
policy action([:update, :archive]) do
  authorize_if expr(role == :admin)
end
```

**Examples**:
```yaml
# Allowed
actor: {authz_user: {role: admin, company_id: "acme"}}
action: update
resource: Company (id: "acme")
result: allowed

# Denied
actor: {authz_user: {role: manager, company_id: "acme"}}
action: update
resource: Company (id: "acme")
result: denied (admin required)
```

---

### AuthzUser Resource

#### Rule: All company members can read authz_users
```elixir
policy action_type(:read) do
  authorize_if expr(company_id == ^actor(:current_company_id))
end
```

**Authorization Matrix**:
| Role    | Read List | Change Role | Assign Team | Suspend |
|---------|-----------|-------------|-------------|---------|
| Admin   | ✓         | ✓           | ✓           | ✓       |
| Manager | ✓         | ✗           | ✓           | ✗       |
| User    | ✓         | ✗           | ✗           | ✗       |

---

#### Rule: Only admins can change roles
```elixir
policy action(:update_role) do
  authorize_if expr(role == :admin)
end
```

**Examples**:
```yaml
# Allowed
actor: {role: admin}
action: update_role
target: {authz_user: {role: user}}
changes: {role: manager}
result: allowed

# Denied
actor: {role: manager}
action: update_role
result: denied (admin required)
```

---

#### Rule: Admins and managers can assign to teams
```elixir
policy action(:assign_to_team) do
  authorize_if expr(role in [:admin, :manager])
end
```

**Examples**:
```yaml
# Allowed
actor: {role: manager}
action: assign_to_team
target: {authz_user_id: "bob"}
team: "Engineering"
result: allowed

# Denied
actor: {role: user}
action: assign_to_team
result: denied (manager or admin required)
```

---

#### Rule: Only admins can suspend users
```elixir
policy action([:suspend, :reactivate]) do
  authorize_if expr(role == :admin)
end
```

---

### Team Resource

#### Rule: All company members can read teams
```elixir
policy action_type(:read) do
  authorize_if expr(company_id == ^actor(:current_company_id))
end
```

**Authorization Matrix**:
| Role    | Read List | Create | Update | Archive |
|---------|-----------|--------|--------|---------|
| Admin   | ✓         | ✓      | ✓      | ✓       |
| Manager | ✓         | ✗      | ✗      | ✗       |
| User    | ✓         | ✗      | ✗      | ✗       |

---

#### Rule: Only admins can create, update, or archive teams
```elixir
policy action_type([:create, :update]) do
  authorize_if expr(role == :admin)
end
```

**Examples**:
```yaml
# Allowed
actor: {role: admin}
action: create
resource: Team
attributes: {name: "Engineering"}
result: allowed

# Denied
actor: {role: manager}
action: create
resource: Team
result: denied (admin required)
```

---

### Invitation Resource

#### Rule: Admins and managers can create invitations
```elixir
policy action(:create) do
  authorize_if expr(role in [:admin, :manager])
end
```

**Authorization Matrix**:
| Role    | Read List | Create | Revoke | Accept |
|---------|-----------|--------|--------|--------|
| Admin   | ✓         | ✓      | ✓      | -      |
| Manager | ✓         | ✓      | ✓ (own)| -      |
| User    | ✓         | ✗      | ✗      | -      |
| Anyone  | -         | -      | -      | ✓ (with valid token) |

---

#### Rule: Inviter can revoke their own invitations
```elixir
policy action(:revoke) do
  authorize_if expr(invited_by_authz_user_id == ^actor(:authz_user_id))
  # OR admin
  authorize_if expr(role == :admin)
end
```

**Examples**:
```yaml
# Allowed (inviter revokes)
actor: {authz_user_id: "alice"}
action: revoke
resource: Invitation (invited_by: "alice")
result: allowed

# Allowed (admin revokes)
actor: {role: admin}
action: revoke
resource: Invitation (invited_by: "bob")
result: allowed

# Denied (non-admin, different inviter)
actor: {role: manager, authz_user_id: "alice"}
action: revoke
resource: Invitation (invited_by: "bob")
result: denied
```

---

#### Rule: Anyone with valid token can accept
```elixir
policy action(:accept) do
  authorize_if TokenValid
end
```

---

### CompanySettings Resource

#### Rule: All company members can read settings
```elixir
policy action_type(:read) do
  authorize_if expr(company_id == ^actor(:current_company_id))
end
```

**Authorization Matrix**:
| Role    | Read | Update | Toggle Features |
|---------|------|--------|-----------------|
| Admin   | ✓    | ✓      | ✓               |
| Manager | ✓    | ✗      | ✗               |
| User    | ✓    | ✗      | ✗               |

---

#### Rule: Only admins can update settings
```elixir
policy action_type(:update) do
  authorize_if expr(role == :admin)
end
```

---

### AuditLog Resource

#### Rule: Only admins can read audit logs
```elixir
policy action_type(:read) do
  authorize_if expr(role == :admin)
end
```

**Authorization Matrix**:
| Role    | Read | Export | Filter |
|---------|------|--------|--------|
| Admin   | ✓    | ✓      | ✓      |
| Manager | ✗    | ✗      | ✗      |
| User    | ✗    | ✗      | ✗      |

---

#### Rule: System can create audit logs (no actor required)
```elixir
policy action(:create) do
  authorize_if always()  # System actions
end
```

---

#### Rule: No one can update or delete audit logs
```elixir
# No update or destroy actions defined
# Audit logs are immutable
```

---

## Team Roles

Team roles provide additional granular permissions within teams:

### Team Role: team_lead
**Scope**: Within assigned team only
**Additional Permissions**:
- View team member details
- (Future) Approve team member requests

### Team Role: team_member
**Scope**: Within assigned team only
**Permissions**:
- View team member list
- Access team-scoped resources

**Note**: Team roles do NOT override company roles. A user with role: user and team_role: team_lead still cannot manage company-level resources.

---

## Combined Role Examples

### Example 1: Admin + Team Lead
```yaml
actor:
  role: admin
  team_role: team_lead
  team_id: "engineering"
permissions:
  - Full company management (from admin)
  - Team lead capabilities (from team_lead)
  - Can manage all teams (from admin), not just Engineering
```

### Example 2: Manager + Team Member
```yaml
actor:
  role: manager
  team_role: team_member
  team_id: "sales"
permissions:
  - Can invite users (from manager)
  - Can assign users to teams (from manager)
  - Cannot create teams (admin only)
  - View Sales team details (from team_member)
```

### Example 3: User (no team)
```yaml
actor:
  role: user
  team_role: null
  team_id: null
permissions:
  - View company members
  - View teams
  - Cannot modify anything
```

---

## Authorization Checks

### Check Order
1. **Authentication**: Is user logged in? (authn_user exists)
2. **Company Context**: Is current_company_id set in session?
3. **Authorization Identity**: Does authz_user exist for this company?
4. **Multi-Tenancy**: Does resource belong to current company? (company_id match)
5. **Role Permission**: Does user's role allow this action?

### Pseudo-code
```elixir
def authorize(actor, action, resource) do
  with :ok <- check_authenticated(actor),
       :ok <- check_company_context(actor),
       :ok <- check_authz_user(actor),
       :ok <- check_company_id(actor, resource),
       :ok <- check_role_permission(actor.role, action) do
    :authorized
  else
    {:error, reason} -> {:forbidden, reason}
  end
end
```

---

## Error Messages

### By Role
```yaml
# User attempts admin action
error: "Unauthorized: admin role required"
http_status: 403

# Manager attempts admin action
error: "Unauthorized: admin role required"
http_status: 403

# No company context
error: "Company context required"
http_status: 401
redirect: /companies/select

# Wrong company
error: "Not found"  # Don't expose existence
http_status: 404
```

---

## Testing Requirements

### Unit Tests per Role
- [ ] Admin can perform all allowed actions
- [ ] Manager can perform manager actions, cannot perform admin actions
- [ ] User can read, cannot modify
- [ ] Team lead has team-specific permissions
- [ ] Team member has limited team permissions

### Boundary Tests
- [ ] Manager cannot create teams
- [ ] User cannot invite users
- [ ] Manager cannot change roles
- [ ] User cannot update settings
- [ ] Non-admin cannot view audit logs

---

## Future Enhancements (ABAC - Phase 2)

### Custom Roles
- Admins can define custom roles (e.g., "Sales Manager", "Viewer")
- Fine-grained permissions (e.g., "can_delete_contacts", "can_export_data")

### Permission Inheritance
- Roles can inherit from other roles
- Permission templates

### Resource-Specific Permissions
- Per-resource permission overrides
- Field-level permissions

---

## Related Policies
- [row_level_security.md](./row_level_security.md) - Multi-tenancy enforcement
- [invitation_security.md](./invitation_security.md) - Token validation

---

## References
- Features: All features in [../features/](../features/)
- Resources: All resources in [../resources/](../resources/)
- Ash Authorization: https://hexdocs.pm/ash/authorization.html
