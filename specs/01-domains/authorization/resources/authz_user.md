# Resource: AuthzUser

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Represents a user's authorization identity within a specific company. Links an authn_user (login identity) to a company with a specific role and permissions. Enables users to have different roles in different companies.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| authn_user_id | uuid | Yes | valid User id | Reference to authentication user |
| company_id | uuid | Yes | valid Company id | Company this authorization belongs to |
| role | enum | Yes | one of: admin, manager, user | Company-level role |
| team_id | uuid | No | valid Team id in same company | Team membership (optional) |
| team_role | enum | No | one of: team_lead, team_member | Role within team (requires team_id) |
| status | enum | Yes | one of: active, inactive | Account status |
| display_name | string | No | max: 100 | Optional display name override |
| joined_at | utc_datetime_usec | Yes | - | When user joined company |
| last_active_at | utc_datetime_usec | No | - | Last activity timestamp |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Business Rules

### Invariants
- Each (authn_user_id, company_id) pair must be unique
- If team_role is set, team_id MUST be set (CHECK constraint)
- If team_id is set, team must belong to same company

### Validations
- **role**: Required, must be one of: admin, manager, user
- **status**: Required, must be one of: active, inactive
- **team_role**: If present, team_id must also be present
- **team_id**: If present, team must exist and belong to same company
- **display_name**: Max 100 characters if provided

### Calculated Fields
- **email**: Loaded from authn_user.email (read-only)
- **is_admin**: Returns true if role == :admin
- **is_team_lead**: Returns true if team_role == :team_lead
- **full_permissions**: Aggregated permissions based on role and team_role

## State Transitions

```
[invited] → active → inactive
              ↓
           suspended → active
```

**Valid Transitions**:
- `invited → active`: When user accepts invitation
- `active → inactive`: When user is removed or company archived
- `active → suspended`: Temporary access revocation
- `suspended → active`: Access restoration
- `inactive → active`: Re-invitation (creates new authz_user)

## Relationships

- **Belongs to**: User (authn_user) via authn_user_id (Many:1)
- **Belongs to**: Company via company_id (Many:1)
- **Belongs to**: Team via team_id (Many:1, optional)
- **Has many**: AuditLog entries as actor

## Domain Events

### Published Events
- `authorization.authz_user_created`: Triggered when user joins company
  - Payload: {authz_user_id, authn_user_id, company_id, role, team_id, created_by}
  - Consumers: Onboarding Service, Analytics, Notification Service

- `authorization.role_changed`: Triggered when role is updated
  - Payload: {authz_user_id, old_role, new_role, changed_by_authz_user_id}
  - Consumers: Notification Service, Cache Invalidation, Audit Log

- `authorization.team_member_added`: Triggered when assigned to team
  - Payload: {authz_user_id, team_id, team_role, assigned_by}
  - Consumers: Team Notification Service, Analytics

- `authorization.user_suspended`: Triggered when status changed to inactive
  - Payload: {authz_user_id, suspended_by, reason}
  - Consumers: Notification Service, Session Invalidation

### Subscribed Events
- `authorization.invitation_accepted`: Creates authz_user from invitation
- `authorization.company_archived`: Sets status to inactive for all company members

## Access Patterns

### Queries
- List all authz_users for a company (filtered by company_id)
- List all companies for an authn_user (via authn_user_id)
- Find authz_user by (authn_user_id, company_id) for context switching
- List team members (filtered by team_id)
- Check if user is admin of company

### Common Operations
- **Create**: Requires authn_user_id, company_id, role
  - Usually created via invitation acceptance
  - Validates company has space (respects max_users)
  - Records audit log entry

- **Read**: Available to all company members (filtered by company_id)
  - Loads email from authn_user

- **Update Role**: Changes role (admin/manager/user)
  - Restricted to admins
  - Sends notification email to user
  - Records audit log entry

- **Assign to Team**: Sets team_id and team_role
  - Restricted to admins and managers
  - Validates team belongs to same company
  - Records audit log entry

- **Suspend/Reactivate**: Changes status
  - Restricted to admins
  - Invalidates user sessions if suspended
  - Records audit log entry

## Ash Resource Implementation Notes

### Actions
```elixir
create :create do
  accept [:authn_user_id, :company_id, :role, :team_id, :team_role, :display_name]
  validate UniqueAuthzUserPerCompany
  validate TeamBelongsToCompany, where: [present(:team_id)]
  validate CompanyHasCapacity
  change CreateAuditLog
end

read :read
read :list
read :get_by_user_and_company do
  # For company switching - find authz_user for specific (authn_user, company) pair
  argument :authn_user_id, :uuid, allow_nil?: false
  argument :company_id, :uuid, allow_nil?: false
end

update :update_role do
  accept [:role]
  change SendRoleChangeNotification
  change CreateAuditLog
end

update :assign_to_team do
  accept [:team_id, :team_role]
  validate TeamBelongsToCompany, where: [present(:team_id)]
  validate TeamRoleRequiresTeam
  change CreateAuditLog
end

update :suspend do
  accept []
  change set_attribute(:status, :inactive)
  change InvalidateUserSessions
  change CreateAuditLog
end

update :reactivate do
  accept []
  change set_attribute(:status, :active)
  change CreateAuditLog
end
```

### Policies
```elixir
policies do
  # All actions require user to be member of the company
  policy action_type(:read) do
    authorize_if AuthzUserBelongsToCompany
  end

  # Only admins can change roles
  policy action(:update_role) do
    authorize_if AuthzUserIsAdmin
  end

  # Admins and managers can assign to teams
  policy action(:assign_to_team) do
    authorize_if expr(role in [:admin, :manager])
  end

  # Only admins can suspend/reactivate
  policy action([:suspend, :reactivate]) do
    authorize_if AuthzUserIsAdmin
  end
end
```

### Calculations
```elixir
calculate :email, :string do
  calculation load(authn_user: :email) do
    authn_user.email
  end
end

calculate :is_admin, :boolean do
  calculation expr(role == :admin)
end

calculate :is_team_lead, :boolean do
  calculation expr(team_role == :team_lead)
end

calculate :full_permissions, :map do
  calculation fn records, _ ->
    Enum.map(records, fn record ->
      %{
        company_role: record.role,
        team_role: record.team_role,
        is_admin: record.role == :admin,
        is_manager: record.role == :manager,
        is_team_lead: record.team_role == :team_lead,
        can_manage_company: record.role == :admin,
        can_manage_teams: record.role in [:admin, :manager],
        can_invite_users: record.role in [:admin, :manager]
      }
    end)
  end
end
```

### Validations
```elixir
validate present([:authn_user_id, :company_id, :role, :status])
validate unique_constraint([:authn_user_id, :company_id],
  message: "User already member of this company")
validate check_constraint(:team_role_requires_team,
  message: "team_role requires team_id to be set")
```

## Multi-Tenancy

**Tenant-Scoped**: YES
- All queries automatically filtered by company_id from session context
- Users see only authz_users within their current company
- Exception: Listing user's own companies (via authn_user_id)

## Security Considerations

- Cannot bypass company_id filter through direct IDs
- Role changes trigger email notifications
- Suspended users have sessions invalidated immediately
- Audit log records all role/status changes
- If a company has no admins, DBA can manually restore access

## Testing Checklist

- [ ] Can create authz_user with valid data
- [ ] Cannot create duplicate authz_user for same (authn_user, company)
- [ ] First authz_user of company must be admin
- [ ] Can assign user to team
- [ ] Cannot assign to team from different company
- [ ] team_role requires team_id (database constraint)
- [ ] Only admins can change roles
- [ ] Only admins can suspend users
- [ ] Admins and managers can assign to teams
- [ ] Regular users cannot modify roles or assignments
- [ ] Queries filtered by company_id
- [ ] Cannot read authz_users from other companies
- [ ] Email loaded correctly from authn_user
- [ ] Audit logs created for all changes
