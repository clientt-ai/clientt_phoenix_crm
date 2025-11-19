# Policy: Row-Level Security (Multi-Tenancy)

**Domain**: Authorization
**Type**: authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Ensures complete data isolation between companies through automatic tenant_id filtering on all tenant-scoped queries. This policy enforces multi-tenancy at the framework level, preventing any cross-company data access.

## Scope

### Resources
- AuthzUser
- Team
- Invitation
- CompanySettings
- AuditLog
- All future tenant-scoped resources (Contacts, Deals, etc.)

### Actions
All CRUD operations:
- read, list (queries)
- create
- update
- destroy

### Actors
- All authenticated users with authz_user
- System (for automated operations)

## Rules

### Rule 1: Automatic Company Filtering on Reads
**Condition**: Any read or list action on tenant-scoped resource
**Requirement**: Query MUST be filtered by current_tenant_id from session

**Ash Implementation**:
```elixir
policies do
  policy action_type(:read) do
    authorize_if expr(tenant_id == ^actor(:current_tenant_id))
  end
end
```

**Examples**:
```yaml
# Allowed
actor: {authz_user_id: "alice-123", tenant_id: "acme-uuid"}
action: read
resource: Team
filter: tenant_id == "acme-uuid"
result: allowed (returns only Acme Corp teams)

# Denied
actor: {authz_user_id: "alice-123", tenant_id: "acme-uuid"}
action: read
resource: Team
filter: tenant_id == "beta-uuid"
result: denied (returns empty set, no error exposed)

# Denied (attempting to bypass filter)
actor: {authz_user_id: "alice-123", tenant_id: "acme-uuid"}
action: read
resource: Team
filter: [none specified - all teams]
result: denied (policy auto-applies tenant_id filter)
```

---

### Rule 2: Automatic Company ID on Creates
**Condition**: Creating a new tenant-scoped resource
**Requirement**: Resource MUST inherit tenant_id from actor's current_tenant_id

**Ash Implementation**:
```elixir
actions do
  create :create do
    change set_attribute(:tenant_id, actor(:current_tenant_id))
  end
end

policies do
  policy action_type(:create) do
    authorize_if expr(tenant_id == ^actor(:current_tenant_id))
  end
end
```

**Examples**:
```yaml
# Allowed
actor: {tenant_id: "acme-uuid"}
action: create
resource: Team
attributes: {name: "Engineering"}
result: allowed (team created with tenant_id: "acme-uuid")

# Denied (attempting to create for different company)
actor: {tenant_id: "acme-uuid"}
action: create
resource: Team
attributes: {tenant_id: "beta-uuid", name: "Sales"}
result: denied (tenant_id override rejected)
```

---

### Rule 3: Company ID Immutability on Updates
**Condition**: Updating an existing tenant-scoped resource
**Requirement**: Cannot change tenant_id after creation

**Ash Implementation**:
```elixir
actions do
  update :update do
    # tenant_id not in accept list
    accept [:name, :description, ...]  # excludes tenant_id
  end
end
```

**Examples**:
```yaml
# Allowed
actor: {tenant_id: "acme-uuid"}
action: update
resource: Team (tenant_id: "acme-uuid")
attributes: {name: "Engineering & Product"}
result: allowed (update succeeds)

# Denied (updating resource from different company)
actor: {tenant_id: "acme-uuid"}
action: update
resource: Team (tenant_id: "beta-uuid")
result: denied (cannot access team from different company)

# Denied (attempting to change tenant_id)
actor: {tenant_id: "acme-uuid"}
action: update
resource: Team (tenant_id: "acme-uuid")
attributes: {tenant_id: "beta-uuid"}
result: denied (tenant_id not accepted in update)
```

---

### Rule 4: Session-Based Company Context
**Condition**: User has multiple company memberships
**Requirement**: Session must store current_tenant_id and current_authz_user

**Session Structure**:
```elixir
%{
  current_authn_user: %User{id: "user-uuid", email: "user@example.com"},
  current_tenant_id: "acme-uuid",
  current_authz_user: %AuthzUser{
    id: "authz-uuid",
    authn_user_id: "user-uuid",
    tenant_id: "acme-uuid",
    role: :admin
  }
}
```

**Examples**:
```yaml
# Correct session setup
user: alice@example.com
companies: [Acme Corp, Beta Inc]
selected_company: Acme Corp
session:
  current_tenant_id: "acme-uuid"
  current_authz_user: [Acme Corp authz_user]
result: all queries filtered to Acme Corp

# Invalid session (missing company context)
user: alice@example.com
session:
  current_authn_user: [Alice]
  current_tenant_id: null
result: queries rejected (must select company first)
```

---

### Rule 5: Company Table Not Tenant-Scoped
**Condition**: Querying Company resource
**Requirement**: No automatic tenant_id filtering (users can see all their companies)

**Ash Implementation**:
```elixir
# Company resource policies
policies do
  policy action_type(:read) do
    # Filter by authz_user relationship, not tenant_id
    authorize_if relates_to_actor_via([:authz_users, :authn_user])
  end
end
```

**Examples**:
```yaml
# Allowed (user can see all their companies)
actor: alice@example.com
authz_users_for: [Acme Corp, Beta Inc, Gamma LLC]
action: list
resource: Company
result: returns all 3 companies

# Denied (cannot see companies user doesn't belong to)
actor: alice@example.com
authz_users_for: [Acme Corp]
action: read
resource: Company (id: "beta-uuid")
result: denied (no authz_user for Beta Inc)
```

---

### Rule 6: Bulk Operations Scoped
**Condition**: Bulk update or delete operations
**Requirement**: Operations automatically scoped to current_tenant_id

**Examples**:
```yaml
# Safe bulk operation
actor: {tenant_id: "acme-uuid"}
action: update_all
resource: AuthzUser
filter: status == :active
update: {last_active_at: now()}
result: only Acme Corp users updated (tenant_id filter auto-applied)

# Cannot affect other companies
actor: {tenant_id: "acme-uuid"}
action: destroy_all
resource: Team
result: only Acme Corp teams affected (Beta Inc teams unaffected)
```

---

## Authorization Matrix

| Actor Role | Tenant-Scoped Resource | Own Company | Other Company | No Company Context |
|------------|------------------------|-------------|---------------|-------------------|
| Admin      | Read                   | ✓           | ✗             | ✗                 |
| Admin      | Create                 | ✓           | ✗             | ✗                 |
| Admin      | Update                 | ✓           | ✗             | ✗                 |
| Admin      | Delete                 | ✓           | ✗             | ✗                 |
| Manager    | Read                   | ✓           | ✗             | ✗                 |
| Manager    | Create                 | ✓ (limited) | ✗             | ✗                 |
| Manager    | Update                 | ✓ (limited) | ✗             | ✗                 |
| Manager    | Delete                 | ✗           | ✗             | ✗                 |
| User       | Read                   | ✓           | ✗             | ✗                 |
| User       | Create                 | ✗           | ✗             | ✗                 |
| User       | Update                 | ✗           | ✗             | ✗                 |
| User       | Delete                 | ✗           | ✗             | ✗                 |

**Legend**:
- ✓ = Allowed (with tenant_id filtering)
- ✗ = Denied (policy prevents access)
- ✓ (limited) = Allowed with additional constraints (e.g., managers can create teams)

---

## Database Constraints

### Foreign Key Constraints
All tenant-scoped tables include tenant_id foreign key:
```sql
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_company
  FOREIGN KEY (tenant_id)
  REFERENCES authz_tenants(id)
  ON DELETE CASCADE;
```

### Indexes for Performance
Company_id indexed on all tenant-scoped tables:
```sql
CREATE INDEX idx_authz_users_company ON authz_users(tenant_id);
CREATE INDEX idx_teams_company ON authz_teams(tenant_id);
CREATE INDEX idx_invitations_company ON authz_invitations(tenant_id);
CREATE INDEX idx_audit_logs_company ON authz_audit_logs(tenant_id);
```

### Check Constraints
Some resources have additional company-scoped constraints:
```sql
-- Team name unique per company (not globally)
ALTER TABLE authz_teams
  ADD CONSTRAINT unique_team_name_per_company
  UNIQUE (tenant_id, name);

-- Only one pending invitation per email per company
CREATE UNIQUE INDEX idx_invitations_unique_pending
  ON authz_invitations(tenant_id, email)
  WHERE status = 'pending';
```

---

## Error Handling

### Scenario: User without company context attempts query
**Response**: `401 Unauthorized - Company context required`
**Action**: Redirect to company selection page

### Scenario: User attempts to access resource from different company
**Response**: `404 Not Found` (do not expose existence)
**Action**: Log security event, return empty result

### Scenario: Malicious tenant_id override attempt
**Response**: `403 Forbidden` or silently ignore and use session tenant_id
**Action**: Log security event, audit trail

---

## Testing Requirements

### Unit Tests
- [ ] Query without tenant_id filter is rejected
- [ ] Query with correct tenant_id returns data
- [ ] Query with wrong tenant_id returns empty
- [ ] Create inherits tenant_id from session
- [ ] Cannot update tenant_id
- [ ] Bulk operations scoped correctly

### Integration Tests
- [ ] User A cannot see User B's data (different companies)
- [ ] Company switching updates filters correctly
- [ ] Session tenant_id cannot be tampered with
- [ ] Direct ID access blocked across companies

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] Authorization bypass attempts fail
- [ ] Company_id override attempts rejected
- [ ] Bulk operations cannot leak across companies

---

## Performance Impact

- **Query overhead**: < 10ms per query (indexed tenant_id)
- **Index size**: ~5-10% increase in table size
- **Join performance**: No degradation (tenant_id in join conditions)

---

## Rollout Strategy

### Phase 1: Core Resources
- AuthzUser, Team, Invitation, AuditLog, CompanySettings

### Phase 2: Business Resources
- Contacts, Deals, Tasks, Notes

### Phase 3: Verification
- Security audit
- Penetration testing
- Performance benchmarking

---

## Related Policies
- [role_based_access.md](./role_based_access.md) - Role permissions within companies
- [invitation_security.md](./invitation_security.md) - Invitation token security

---

## References
- Feature: [multi_tenancy.feature.md](../features/multi_tenancy.feature.md)
- Domain: [domain.md](../domain.md) - Multi-Tenancy Implementation section
- Ash Documentation: https://hexdocs.pm/ash/policies.html
