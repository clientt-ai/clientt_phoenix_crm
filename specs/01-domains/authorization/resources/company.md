# Resource: Company

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Represents a tenant organization in the multi-tenant CRM system. Acts as the aggregate root for all authorization-related entities. Users can belong to multiple companies with different roles in each.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| name | string | Yes | min: 2, max: 100 | Company display name |
| slug | string | Yes | unique, lowercase, alphanumeric + hyphens, max: 50 | URL-safe identifier |
| status | enum | Yes | one of: active, archived | Company operational status |
| settings_id | uuid | No | valid CompanySettings id | Reference to settings (1:1) |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Business Rules

### Invariants
- Slug must be globally unique across all companies
- Once archived, cannot be reactivated (create new company instead)
- Cannot delete company that has active authz_users (must archive first)

### Validations
- **name**: 2-100 characters, must not be blank
- **slug**: lowercase, alphanumeric + hyphens only, no spaces, globally unique
- **status**: Can only transition active → archived (one-way)

### Calculated Fields
- **active_users_count**: Count of authz_users with status: active
- **admin_count**: Count of authz_users with role: admin and status: active
- **teams_count**: Count of teams with status: active

## State Transitions

```
[new] → active → archived
```

**Valid Transitions**:
- `active → archived`: When company ceases operations
  - Triggers: All authz_users set to inactive, all pending invitations revoked, all teams archived
  - Validation: Cannot be undone

## Relationships

- **Has one**: CompanySettings (1:1)
- **Has many**: AuthzUser (1:Many)
- **Has many**: Team (1:Many)
- **Has many**: Invitation (1:Many)
- **Has many**: AuditLog (1:Many)

## Domain Events

### Published Events
- `authorization.company_created`: Triggered when company is created
  - Payload: {company_id, name, slug, first_admin_authz_user_id, created_at}
  - Consumers: Analytics, Welcome Email Service

- `authorization.company_archived`: Triggered when company is archived
  - Payload: {company_id, archived_by_authz_user_id, archived_at}
  - Consumers: Cleanup Service, Analytics, Notification Service

### Subscribed Events
None

## Access Patterns

### Queries
- List all companies for a given authn_user (via authz_users)
- Find company by slug (public lookup)
- Find company by id
- Get company with settings, teams, and user counts

### Common Operations
- **Create**: Requires name and slug
  - Creates CompanySettings automatically
  - Creates first authz_user (admin) for creator
  - Records audit log entry

- **Read**: Available to all members (via authz_user relationship)

- **Update**: Can modify name, cannot modify slug after creation
  - Restricted to admins only
  - Records audit log entry

- **Archive**: Sets status to archived
  - Cascades: All authz_users → inactive, all pending invitations → revoked, all teams → archived
  - Restricted to admins only
  - Requires confirmation
  - Records audit log entry

- **Delete**: Not allowed (use archive instead)

## Ash Resource Implementation Notes

### Actions
```elixir
create :create do
  # Creates Company + CompanySettings + first AuthzUser (admin) in transaction
  argument :first_admin_authn_user_id, :uuid, allow_nil?: false
  change CreateCompanyWithAdmin
end

read :read
read :list

update :update do
  accept [:name]
  # Cannot update slug
end

update :archive do
  change set_attribute(:status, :archived)
  change ArchiveCompanyMembers  # Sets all authz_users to inactive
  change RevokeCompanyInvitations  # Revokes all pending invitations
  change ArchiveCompanyTeams  # Archives all teams
end
```

### Policies
```elixir
policies do
  # Anyone can create a company
  policy action(:create) do
    authorize_if always()
  end

  # Members can read their companies
  policy action(:read) do
    authorize_if relates_to_actor_via([:authz_users, :authn_user])
  end

  # Only admins can update or archive
  policy action([:update, :archive]) do
    authorize_if AuthzUserIsAdmin
  end
end
```

### Calculations
```elixir
calculate :active_users_count, :integer do
  calculation count(authz_users, query: [filter: expr(status == :active)])
end

calculate :admin_count, :integer do
  calculation count(authz_users, query: [filter: expr(status == :active and role == :admin)])
end

calculate :can_be_archived, :boolean do
  # Can only archive if there are active users to notify
  calculation expr(active_users_count > 0)
end
```

### Validations
```elixir
validate slug_format()
validate unique_slug()
validate present(:name)
validate string_length(:name, min: 2, max: 100)
validate string_length(:slug, max: 50)
```

## Multi-Tenancy

**Not Tenant-Scoped**: Company is not filtered by company_id since users can belong to multiple companies. Access is controlled through authz_user relationships.

## Security Considerations

- Slug is public and can be used for company lookup (like GitHub orgs)
- Archiving a company is irreversible and affects all members
- Only admins can modify company details
- Company creation is open (any authenticated user can create a company)

## Testing Checklist

- [ ] Can create company with valid name and slug
- [ ] Cannot create company with duplicate slug
- [ ] Cannot create company with invalid slug (uppercase, spaces, special chars)
- [ ] First user automatically becomes admin
- [ ] CompanySettings automatically created
- [ ] Can read companies user belongs to
- [ ] Cannot read companies user doesn't belong to
- [ ] Only admins can update company
- [ ] Only admins can archive company
- [ ] Archiving company deactivates all authz_users
- [ ] Archiving company revokes all pending invitations
- [ ] Archiving company archives all teams
- [ ] Cannot archive already archived company
- [ ] Audit logs created for create, update, archive actions
