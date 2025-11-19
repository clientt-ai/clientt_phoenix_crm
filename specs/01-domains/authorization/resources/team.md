# Resource: Team

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Represents a sub-group within a company for organizing users into departments, project teams, or other organizational units. Provides additional layer of access control and organization beyond company-level roles.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| tenant_id | uuid | Yes | valid Company id | Company this team belongs to |
| name | string | Yes | unique per company, max: 100 | Team name |
| description | string | No | max: 500 | Optional team description |
| status | enum | Yes | one of: active, archived | Team operational status |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Business Rules

### Invariants
- Team name must be unique within a company (not globally unique)
- Cannot delete team with active members (must archive instead)
- All team members must belong to the same company as the team

### Validations
- **name**: Required, 2-100 characters, unique per company
- **description**: Max 500 characters if provided
- **status**: Must be one of: active, archived
- **tenant_id**: Must reference valid company

### Calculated Fields
- **member_count**: Count of authz_users with this team_id and status: active
- **team_leads_count**: Count of authz_users with team_role: team_lead
- **has_members**: Returns true if member_count > 0

## State Transitions

```
[new] → active → archived
```

**Valid Transitions**:
- `active → archived`: When team is no longer needed
  - Validation: Can only archive if no active members
  - Requirement: All members must be reassigned first

## Relationships

- **Belongs to**: Company via tenant_id (Many:1)
- **Has many**: AuthzUser via team_id (1:Many)

## Domain Events

### Published Events
- `authorization.team_created`: Triggered when team is created
  - Payload: {team_id, tenant_id, name, created_by_authz_user_id}
  - Consumers: Analytics

- `authorization.team_member_added`: Triggered when user assigned to team
  - Payload: {team_id, authz_user_id, team_role, assigned_by}
  - Consumers: Team Notification Service, Analytics

- `authorization.team_member_removed`: Triggered when user removed from team
  - Payload: {team_id, authz_user_id, removed_by}
  - Consumers: Notification Service

- `authorization.team_archived`: Triggered when team is archived
  - Payload: {team_id, archived_by_authz_user_id}
  - Consumers: Analytics

### Subscribed Events
None

## Access Patterns

### Queries
- List all active teams for a company (filtered by tenant_id, status: active)
- Find team by id
- Find team by name within company
- List teams with member counts
- Get team with all members loaded

### Common Operations
- **Create**: Requires name and tenant_id
  - Restricted to company admins
  - Creates with status: active
  - Records audit log entry

- **Read**: Available to all company members

- **Update**: Can modify name and description
  - Restricted to admins
  - Cannot move team to different company
  - Records audit log entry

- **Archive**: Sets status to archived
  - Restricted to admins
  - Validation: Cannot archive team with active members
  - Requirement: Must reassign all members first
  - Records audit log entry

- **Delete**: Not allowed (use archive instead)

## Ash Resource Implementation Notes

### Actions
```elixir
create :create do
  accept [:tenant_id, :name, :description]
  validate unique_team_name_per_company()
  change set_attribute(:status, :active)
  change CreateAuditLog
end

read :read
read :list
read :list_for_company do
  argument :tenant_id, :uuid, allow_nil?: false
  filter expr(tenant_id == ^arg(:tenant_id) and status == :active)
end

update :update do
  accept [:name, :description]
  validate unique_team_name_per_company()
  change CreateAuditLog
end

update :archive do
  accept []
  validate ValidateNoActiveMembers
  change set_attribute(:status, :archived)
  change CreateAuditLog
end
```

### Policies
```elixir
policies do
  # All company members can read teams
  policy action_type(:read) do
    authorize_if expr(tenant_id == ^actor(:current_tenant_id))
  end

  # Only admins can create, update, or archive teams
  policy action_type([:create, :update]) do
    authorize_if AuthzUserIsAdmin
  end
end
```

### Calculations
```elixir
calculate :member_count, :integer do
  calculation count(authz_users, query: [filter: expr(status == :active)])
end

calculate :team_leads_count, :integer do
  calculation count(authz_users, query: [filter: expr(team_role == :team_lead and status == :active)])
end

calculate :has_members, :boolean do
  calculation expr(member_count > 0)
end
```

### Validations
```elixir
validate present([:tenant_id, :name, :status])
validate string_length(:name, min: 2, max: 100)
validate string_length(:description, max: 500)
validate unique_constraint([:tenant_id, :name],
  message: "Team name already exists in this company")
```

## Multi-Tenancy

**Tenant-Scoped**: YES
- All queries automatically filtered by tenant_id from session context
- Teams are scoped to their company
- Cannot access teams from other companies

## Security Considerations

- Team names only need to be unique per company, not globally
- Cannot archive team with active members (prevents orphaned users)
- Only admins can manage teams
- All team operations logged in audit trail

## Testing Checklist

- [ ] Can create team with valid name and tenant_id
- [ ] Cannot create team with duplicate name in same company
- [ ] Can create teams with same name in different companies
- [ ] Only admins can create teams
- [ ] All company members can read teams
- [ ] Can update team name and description
- [ ] Cannot update tenant_id after creation
- [ ] Cannot archive team with active members
- [ ] Must reassign members before archiving
- [ ] member_count calculation accurate
- [ ] team_leads_count calculation accurate
- [ ] Queries filtered by tenant_id
- [ ] Cannot read teams from other companies
- [ ] Audit logs created for all operations
