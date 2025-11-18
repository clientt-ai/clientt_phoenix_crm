# Multi-Tenant Authorization - Quick Reference

## Core Concepts

### Authentication vs Authorization
- **authn_users** (`users` table) → WHO you are (login identity)
- **authz_users** (`authz_users` table) → WHAT you can do (company-scoped permissions)
- **Relationship:** 1 authn_user → Many authz_users (one per company)

### Example User Journey
```
1. User creates account → authn_user created (email: user@example.com)
2. User creates Company A → authz_user #1 created (tenant_id: A, role: admin)
3. User invited to Company B → authz_user #2 created (tenant_id: B, role: user)
4. User signs in → selects Company A → session has authz_user #1 context
5. User switches to Company B → session has authz_user #2 context
```

## Database Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `authz_tenants` | Tenant organizations | id, name, slug, status |
| `authz_users` | User-company membership + roles | authn_user_id, tenant_id, role, team_id |
| `authz_teams` | Sub-groups within companies | tenant_id, name, status |
| `authz_invitations` | Email invites to join companies | email, tenant_id, token, status |
| `authz_tenant_settings` | Company configuration | tenant_id, max_users, features, branding |
| `authz_audit_logs` | Immutable audit trail | tenant_id, action, resource_type, changes |

## Roles & Permissions

### Company Roles (3 levels)
```elixir
:admin    # Full company access, manage users/teams/settings
:manager  # Manage teams, view company data, limited settings
:user     # Standard resource access, no management
```

### Team Roles (2 levels)
```elixir
:team_lead    # Manage team members, team-level permissions
:team_member  # Standard team access
```

### Permission Matrix

| Action | Admin | Manager | User |
|--------|-------|---------|------|
| Manage company settings | ✅ | ❌ | ❌ |
| Invite users | ✅ | ✅ | ❌ |
| Assign roles | ✅ | ✅ (team only) | ❌ |
| Create teams | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| Access company data | ✅ | ✅ | ✅ |

## Key Business Rules

### Companies
- Slug must be unique and URL-safe
- Must have at least 1 active admin
- Cannot delete company with active users (archive instead)

### AuthzUsers
- Each (authn_user_id, tenant_id) pair is unique
- Cannot remove last admin from company
- team_role requires team_id (enforced at DB level)
- Email comes from authn_user (not duplicated)

### Teams
- Team name unique per company
- Cannot delete team with active members

### Invitations
- Token: 32+ bytes, cryptographically secure
- Expires in 7 days
- Only one pending invitation per email+company
- Cannot invite existing members

## Multi-Tenancy Implementation

### Session Context
```elixir
# After login + company selection
%{
  current_authn_user: %User{id: "auth-123"},
  current_tenant_id: "company-456",
  current_authz_user: %AuthzUser{
    id: "authz-789",
    authn_user_id: "auth-123",
    tenant_id: "company-456",
    role: :admin
  }
}
```

### Row-Level Filtering
All tenant-scoped queries automatically filtered:
```elixir
# Automatic tenant_id filter applied
AuthzUser
|> Ash.Query.for_read(:list)
# Ash policies add: |> Ash.Query.filter(tenant_id: ^current_tenant_id)
|> Ash.read!(actor: current_authz_user)
```

### Tenant-Scoped Resources
- ✅ AuthzUser
- ✅ Team
- ✅ Invitation
- ✅ AuditLog
- ✅ CompanySettings
- ❌ Company (not scoped - users can belong to multiple)

## Common Queries

### Get user's companies
```elixir
AuthzUser
|> Ash.Query.for_read(:list)
|> Ash.Query.filter(authn_user_id: ^current_authn_user.id)
|> Ash.Query.load([:company])
|> Ash.read!()
```

### Get company members
```elixir
AuthzUser
|> Ash.Query.for_read(:list)
|> Ash.Query.filter(tenant_id: ^current_tenant_id)
|> Ash.Query.filter(status: :active)
|> Ash.Query.load([:authn_user])
|> Ash.read!()
```

### Check if user is admin
```elixir
current_authz_user.role == :admin
```

### Get user's permissions in current context
```elixir
%{
  company_role: current_authz_user.role,
  team_role: current_authz_user.team_role,
  is_admin: current_authz_user.role == :admin,
  tenant_id: current_authz_user.tenant_id
}
```

## Domain Events

| Event | When | Use Cases |
|-------|------|-----------|
| `CompanyCreated` | New company | Analytics, welcome email |
| `AuthzUserCreated` | User joins company | Onboarding flow |
| `RoleChanged` | Role updated | Audit, cache invalidation |
| `InvitationSent` | Invitation created | Send email |
| `InvitationAccepted` | User accepts | Analytics, onboarding |

## File Structure

```
lib/clientt_crm_app/
├── authorization.ex              # Domain module
└── authorization/
    ├── company.ex               # Company resource (aggregate root)
    ├── authz_user.ex            # AuthzUser resource
    ├── team.ex                  # Team resource
    ├── invitation.ex            # Invitation resource
    ├── company_settings.ex      # Settings resource
    ├── audit_log.ex             # AuditLog resource
    └── changes/                 # Custom Ash changes
        ├── create_audit_log.ex
        ├── send_invitation_email.ex
        └── validate_last_admin.ex
```

## Implementation Checklist

### Phase 1: Core (Week 1-2)
- [ ] Create Authorization domain
- [ ] Company resource
- [ ] AuthzUser resource
- [ ] Row-level tenancy policies
- [ ] Migrations
- [ ] Tests

### Phase 2: Teams & Settings (Week 3)
- [ ] Team resource
- [ ] CompanySettings resource
- [ ] Team assignment logic
- [ ] Tests

### Phase 3: Invitations (Week 4)
- [ ] Invitation resource
- [ ] Email templates
- [ ] Acceptance flow
- [ ] Expiration logic
- [ ] Tests

### Phase 4: Audit (Week 5)
- [ ] AuditLog resource
- [ ] Audit hooks on all resources
- [ ] Admin UI
- [ ] Tests

### Phase 5: UI (Week 6-7)
- [ ] Company switcher
- [ ] User management LiveView
- [ ] Team management LiveView
- [ ] Settings page
- [ ] Invitation pages

### Phase 6: Migration (Week 8)
- [ ] Migrate existing users
- [ ] Integration tests
- [ ] Security audit

## Common Patterns

### Creating a Company (with first admin)
```elixir
# This should be a single transaction creating:
# 1. Company
# 2. CompanySettings
# 3. AuthzUser (first admin)
# 4. AuditLog entry

Company
|> Ash.Changeset.for_create(:create, %{
  name: "Acme Corp",
  slug: "acme-corp",
  first_admin_authn_user_id: current_authn_user.id
})
|> Ash.create!()
```

### Inviting a User
```elixir
Invitation
|> Ash.Changeset.for_create(:create, %{
  tenant_id: current_tenant_id,
  email: "newuser@example.com",
  role: :user,
  team_id: team_id,  # optional
  team_role: :team_member,  # optional
  invited_by_authz_user_id: current_authz_user.id
})
|> Ash.create!()
# This triggers email send + creates audit log
```

### Accepting an Invitation
```elixir
Invitation
|> Ash.get!(token)
|> Ash.Changeset.for_update(:accept, %{
  accepted_by_authn_user_id: current_authn_user.id
})
|> Ash.update!()
# This creates AuthzUser + updates invitation status + creates audit log
```

### Changing User Role
```elixir
authz_user
|> Ash.Changeset.for_update(:update_role, %{
  role: :manager
})
|> Ash.update!(actor: current_authz_user)
# This validates not removing last admin + creates audit log
```

### Switching Company Context
```elixir
# In LiveView or controller
def switch_company(socket, tenant_id) do
  authz_user =
    AuthzUser
    |> Ash.Query.for_read(:get_by_user_and_company)
    |> Ash.Query.filter(
      authn_user_id: ^socket.assigns.current_authn_user.id,
      tenant_id: ^tenant_id
    )
    |> Ash.read_one!()

  socket
  |> assign(:current_tenant_id, tenant_id)
  |> assign(:current_authz_user, authz_user)
end
```

## Testing Strategy

### Unit Tests (per resource)
- Test all actions (create, read, update, custom)
- Test validations
- Test policies (authorization)
- Test calculations
- Test domain events

### Integration Tests
- Full invitation workflow
- Company creation with first admin
- Role change with audit logging
- Team assignment
- Multi-tenancy isolation (critical!)

### Security Tests
- Cannot access other company's data
- Cannot remove last admin
- Cannot override tenant_id in queries
- Token security (invitation tokens)
- Policy enforcement

## Troubleshooting

### "Cannot remove last admin"
- Check: Does company have other active admins?
- Fix: Promote another user to admin first

### "User already member of company"
- Check: Does authz_user already exist for (authn_user_id, tenant_id)?
- Fix: Use update instead of create

### "Invitation expired"
- Check: Is invitation.expires_at < now()?
- Fix: Request new invitation

### Cross-tenant data leak
- Check: Are all queries filtered by tenant_id?
- Fix: Ensure Ash policies are correctly applied

### Team role without team
- Check: DB constraint ensures team_role requires team_id
- Fix: Set both or neither
