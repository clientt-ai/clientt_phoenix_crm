# Resource: AuditLog

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Provides immutable audit trail of all authorization changes within a company. Records who did what, when, and what changed. Critical for compliance, security, and debugging.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| tenant_id | uuid | Yes | valid Company id | Company this log belongs to |
| actor_authz_user_id | uuid | No | valid AuthzUser id | Who performed the action (null for system) |
| action | string | Yes | max: 100 | Action performed (e.g., "role_changed") |
| resource_type | string | Yes | max: 100 | Type of resource (e.g., "AuthzUser") |
| resource_id | uuid | Yes | - | ID of affected resource |
| changes | map | Yes | valid JSON | Before/after values |
| metadata | map | No | valid JSON | Additional context (IP, user agent, etc.) |
| created_at | utc_datetime_usec | Yes | - | When action occurred |

## Business Rules

### Invariants
- Audit logs are IMMUTABLE - no updates or deletes allowed
- All authorization changes must create an audit log entry
- Logs retained for minimum 2 years
- System actions have actor_authz_user_id = null

### Validations
- **action**: Required, max 100 characters
- **resource_type**: Required, max 100 characters
- **changes**: Must be a valid map
- **metadata**: Must be a valid map if provided

### Calculated Fields
- **actor_email**: Loaded from actor_authz_user.authn_user.email
- **action_summary**: Human-readable description of the change

## Logged Actions

### AuthzUser Actions
- `authz_user.created`: User joined company
- `authz_user.role_changed`: User role modified
- `authz_user.team_assigned`: User assigned to team
- `authz_user.team_removed`: User removed from team
- `authz_user.suspended`: User access suspended
- `authz_user.reactivated`: User access restored

### Company Actions
- `company.created`: Company created
- `company.updated`: Company details changed
- `company.archived`: Company archived

### Team Actions
- `team.created`: Team created
- `team.updated`: Team details changed
- `team.archived`: Team archived

### Invitation Actions
- `invitation.sent`: Invitation created
- `invitation.accepted`: Invitation accepted
- `invitation.revoked`: Invitation cancelled
- `invitation.resent`: Invitation resent

### Settings Actions
- `settings.updated`: Company settings changed
- `settings.feature_toggled`: Feature flag changed

## Changes Map Structure

### Example: Role Changed
```elixir
%{
  "field" => "role",
  "from" => "user",
  "to" => "manager",
  "reason" => "Promotion to team manager"
}
```

### Example: User Created
```elixir
%{
  "field" => "authz_user",
  "action" => "created",
  "email" => "user@example.com",
  "role" => "user",
  "team_id" => "uuid-or-null"
}
```

### Example: Settings Updated
```elixir
%{
  "field" => "max_users",
  "from" => 10,
  "to" => 50,
  "reason" => "Plan upgrade"
}
```

## Metadata Map Structure

```elixir
%{
  "ip_address" => "192.168.1.1",
  "user_agent" => "Mozilla/5.0...",
  "session_id" => "session-uuid",
  "request_id" => "req-uuid"
}
```

## Relationships

- **Belongs to**: Company via tenant_id (Many:1)
- **Belongs to**: AuthzUser via actor_authz_user_id (Many:1, optional)

## Domain Events

### Published Events
None (audit logs are the record, not the trigger)

### Subscribed Events
- All domain events → Create audit log entry

## Access Patterns

### Queries
- List audit logs for company (paginated, newest first)
- Filter by date range
- Filter by action type
- Filter by resource_type and resource_id
- Filter by actor
- Search for specific changes

### Common Operations
- **Create**: Records an action
  - Automatically created by change hooks
  - Cannot be created manually by users
  - System action

- **Read**: Available to company admins only
  - Paginated (large dataset)
  - Filterable and searchable

- **Update**: NOT ALLOWED (immutable)

- **Delete**: NOT ALLOWED (immutable, retention policy only)

## Ash Resource Implementation Notes

### Actions
```elixir
create :create do
  accept [:tenant_id, :actor_authz_user_id, :action, :resource_type, :resource_id, :changes, :metadata]
  # This action should only be called internally, not exposed to users
  change set_attribute(:created_at, &DateTime.utc_now/0)
end

read :read
read :list do
  # Paginated, sorted by created_at desc
  pagination offset?: true, countable: true, default_limit: 50
end

read :for_company do
  argument :tenant_id, :uuid, allow_nil?: false
  filter expr(tenant_id == ^arg(:tenant_id))
  pagination offset?: true, countable: true
end

read :for_resource do
  argument :resource_type, :string, allow_nil?: false
  argument :resource_id, :uuid, allow_nil?: false
  filter expr(resource_type == ^arg(:resource_type) and resource_id == ^arg(:resource_id))
end

read :by_actor do
  argument :actor_authz_user_id, :uuid, allow_nil?: false
  filter expr(actor_authz_user_id == ^arg(:actor_authz_user_id))
end

read :by_action do
  argument :action, :string, allow_nil?: false
  filter expr(action == ^arg(:action))
end

# NO UPDATE OR DESTROY ACTIONS - IMMUTABLE
```

### Policies
```elixir
policies do
  # Only admins can read audit logs
  policy action_type(:read) do
    authorize_if AuthzUserIsAdmin
    authorize_if expr(tenant_id == ^actor(:current_tenant_id))
  end

  # Create is system-only (not exposed to external actors)
  policy action(:create) do
    authorize_if always()  # Called internally by changes
  end

  # No updates or deletes allowed
end
```

### Calculations
```elixir
calculate :actor_email, :string do
  calculation load(actor_authz_user: [authn_user: :email]) do
    actor_authz_user&.authn_user&.email || "System"
  end
end

calculate :action_summary, :string do
  calculation fn records, _ ->
    Enum.map(records, fn record ->
      case record.action do
        "authz_user.role_changed" ->
          "Changed role from #{record.changes["from"]} to #{record.changes["to"]}"

        "authz_user.created" ->
          "Added #{record.changes["email"]} as #{record.changes["role"]}"

        "invitation.sent" ->
          "Invited #{record.changes["email"]}"

        _ ->
          record.action
      end
    end)
  end
end
```

### Validations
```elixir
validate present([:tenant_id, :action, :resource_type, :resource_id, :changes, :created_at])
validate string_length(:action, max: 100)
validate string_length(:resource_type, max: 100)
```

## Multi-Tenancy

**Tenant-Scoped**: YES
- All queries automatically filtered by tenant_id
- Admins can only see logs for their company

## Retention Policy

### Standard Retention
- Keep all logs for 2 years
- After 2 years, archive to cold storage or delete (compliance-dependent)

### Long-Term Retention (Optional)
- Critical actions (role changes, user additions/removals) retained indefinitely
- Non-critical actions (settings updates) retained for 2 years

## Audit Log UI Features

### Admin Audit Log Page
- **Filters**:
  - Date range picker
  - Action type dropdown
  - Resource type dropdown
  - Actor selector (specific user)

- **Display**:
  - Timestamp
  - Actor (email)
  - Action summary
  - Details (expandable)

- **Export**:
  - CSV export for compliance
  - Date range selection

## Security Considerations

- Audit logs are immutable (no tampering)
- Only admins can view logs
- System actions clearly marked (actor = null)
- IP address and user agent captured for security
- Cannot be deleted (only archived per retention policy)

## Testing Checklist

- [ ] Audit log created for all authorization actions
- [ ] Cannot update audit log
- [ ] Cannot delete audit log
- [ ] Only admins can read audit logs
- [ ] Queries filtered by tenant_id
- [ ] Can filter by date range
- [ ] Can filter by action type
- [ ] Can filter by resource
- [ ] Can filter by actor
- [ ] Pagination works correctly
- [ ] actor_email calculated correctly (including "System")
- [ ] action_summary calculated correctly
- [ ] changes map stored correctly
- [ ] metadata captured (IP, user agent)
- [ ] CSV export works
