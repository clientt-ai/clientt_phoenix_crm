# Resource: Invitation

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Represents an email-based invitation for a user to join a company. Manages the invitation workflow including token generation, expiration, and acceptance tracking.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid Company id | Company user is invited to |
| email | string | Yes | valid email, lowercase | Email address of invitee |
| invited_by_authz_user_id | uuid | Yes | valid AuthzUser id | Who sent the invitation |
| role | enum | Yes | one of: admin, manager, user | Assigned role upon acceptance |
| team_id | uuid | No | valid Team id in same company | Optional team assignment |
| team_role | enum | No | one of: team_lead, team_member | Team role (requires team_id) |
| token | string | Yes | unique, 32+ bytes | Secure invitation token |
| status | enum | Yes | one of: pending, accepted, revoked, expired | Invitation status |
| message | string | No | max: 500 | Optional personal message from inviter |
| expires_at | utc_datetime_usec | Yes | - | When invitation expires (7 days) |
| accepted_at | utc_datetime_usec | No | - | When invitation was accepted |
| accepted_by_authn_user_id | uuid | No | valid User id | Who accepted (for existing users) |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Business Rules

### Invariants
- Only one pending invitation allowed per (email, company_id)
- If team_role is set, team_id MUST be set
- Token must be cryptographically secure (32+ bytes)
- Invitations expire after 7 days
- Cannot invite email that's already an active member (check authz_users)

### Validations
- **email**: Required, valid email format, lowercase
- **role**: Required, must be one of: admin, manager, user
- **token**: Unique, generated automatically, 32+ bytes
- **status**: Must be one of: pending, accepted, revoked, expired
- **team_role**: If present, team_id must also be present
- **team_id**: If present, team must belong to same company
- **expires_at**: Automatically set to 7 days from creation
- **message**: Max 500 characters if provided

### Calculated Fields
- **is_expired**: Returns true if expires_at < now() and status == pending
- **inviter_email**: Loaded from invited_by_authz_user.authn_user.email

## State Transitions

```
pending → accepted
   ↓
revoked

pending → expired (automatic after 7 days)
```

**Valid Transitions**:
- `pending → accepted`: When user accepts invitation
  - Creates authz_user
  - Sets accepted_at and accepted_by_authn_user_id

- `pending → revoked`: When admin cancels invitation
  - Manual action

- `pending → expired`: Automatic after expires_at
  - Background job or validation on acceptance

## Relationships

- **Belongs to**: Company via company_id (Many:1)
- **Belongs to**: AuthzUser via invited_by_authz_user_id (Many:1) - the inviter
- **Belongs to**: Team via team_id (Many:1, optional)
- **Belongs to**: User via accepted_by_authn_user_id (Many:1, optional) - who accepted

## Domain Events

### Published Events
- `authorization.invitation_sent`: Triggered when invitation created
  - Payload: {invitation_id, email, company_id, role, team_id, invited_by, token}
  - Consumers: Email Service (sends invitation email)

- `authorization.invitation_accepted`: Triggered when invitation accepted
  - Payload: {invitation_id, authz_user_id, accepted_by_authn_user_id, accepted_at}
  - Consumers: Onboarding Service, Analytics, Notification Service

- `authorization.invitation_revoked`: Triggered when invitation revoked
  - Payload: {invitation_id, revoked_by_authz_user_id}
  - Consumers: Analytics

### Subscribed Events
None

## Access Patterns

### Queries
- List all pending invitations for a company
- Find invitation by token (for acceptance)
- Check if email has pending invitation for company
- List invitations sent by specific user

### Common Operations
- **Create (Send)**: Requires email, company_id, role
  - Restricted to admins and managers
  - Generates secure token
  - Sets expires_at to 7 days from now
  - Validates user not already member
  - Validates no pending invitation exists
  - Respects company max_users limit
  - Sends email via domain event
  - Records audit log entry

- **Read**: Available to company admins and managers

- **Accept**: Processes invitation acceptance
  - Public action (token-based, no auth required)
  - Validates token is valid and not expired
  - Creates authz_user with specified role and team
  - Links to authn_user (existing or newly created)
  - Sets status to accepted
  - Records accepted_at and accepted_by_authn_user_id
  - Records audit log entry

- **Revoke**: Cancels pending invitation
  - Restricted to admins and original inviter
  - Sets status to revoked
  - Records audit log entry

- **Resend**: Generates new token and extends expiration
  - Restricted to admins and managers
  - Updates token and expires_at
  - Sends new email

## Ash Resource Implementation Notes

### Actions
```elixir
create :send do
  accept [:company_id, :email, :role, :team_id, :team_role, :message]
  argument :invited_by_authz_user_id, :uuid, allow_nil?: false

  validate EmailNotAlreadyMember
  validate NoPendingInvitation
  validate CompanyHasCapacity
  validate TeamBelongsToCompany, where: [present(:team_id)]
  validate TeamRoleRequiresTeam

  change GenerateSecureToken
  change SetExpiresAt  # 7 days from now
  change set_attribute(:status, :pending)
  change SendInvitationEmail
  change CreateAuditLog
end

read :read
read :list_pending do
  filter expr(status == :pending and expires_at > ^DateTime.utc_now())
end

read :find_by_token do
  get_by [:token]
end

update :accept do
  accept []
  argument :accepted_by_authn_user_id, :uuid, allow_nil?: false

  validate ValidateNotExpired
  validate ValidateStatusPending

  change CreateAuthzUserFromInvitation
  change set_attribute(:status, :accepted)
  change set_attribute(:accepted_at, &DateTime.utc_now/0)
  change CreateAuditLog
end

update :revoke do
  accept []
  validate ValidateStatusPending
  change set_attribute(:status, :revoked)
  change CreateAuditLog
end

update :resend do
  accept []
  validate ValidateStatusPending
  change GenerateSecureToken
  change SetExpiresAt  # Reset to 7 days from now
  change SendInvitationEmail
  change CreateAuditLog
end
```

### Policies
```elixir
policies do
  # Admins and managers can send invitations
  policy action(:send) do
    authorize_if expr(role in [:admin, :manager])
  end

  # Admins and managers can view invitations
  policy action_type(:read) do
    authorize_if expr(role in [:admin, :manager])
    authorize_if expr(company_id == ^actor(:current_company_id))
  end

  # Accept is public (token-based)
  policy action(:accept) do
    authorize_if always()
  end

  # Only admins and inviter can revoke
  policy action(:revoke) do
    authorize_if AuthzUserIsAdmin
    authorize_if expr(invited_by_authz_user_id == ^actor(:id))
  end

  # Admins and managers can resend
  policy action(:resend) do
    authorize_if expr(role in [:admin, :manager])
  end
end
```

### Calculations
```elixir
calculate :is_expired, :boolean do
  calculation expr(expires_at < ^DateTime.utc_now() and status == :pending)
end

calculate :inviter_email, :string do
  calculation load(invited_by_authz_user: [authn_user: :email]) do
    invited_by_authz_user.authn_user.email
  end
end
```

### Validations
```elixir
validate present([:company_id, :email, :role, :token, :status, :expires_at])
validate email_format(:email)
validate lowercase(:email)
validate string_length(:message, max: 500)
validate unique_constraint([:email, :company_id, :status],
  where: "status = 'pending'",
  message: "Pending invitation already exists for this email")
validate check_constraint(:team_role_requires_team,
  message: "team_role requires team_id to be set")
```

## Multi-Tenancy

**Tenant-Scoped**: YES
- All queries automatically filtered by company_id from session context
- Invitations are company-specific
- Exception: Acceptance is public (token-based, no company context needed)

## Security Considerations

- Token must be cryptographically secure (use :crypto.strong_rand_bytes/1)
- Token is single-use only
- 7-day expiration prevents stale invitations
- Cannot invite someone who's already a member
- Respects company max_users limit
- Acceptance creates audit log entry

## Email Template

### Subject
"You've been invited to join {company_name} on ClienttCRM"

### Body
```
Hi there!

{inviter_name} has invited you to join {company_name} as a {role}.

{optional_personal_message}

[Accept Invitation Button]
Link: https://app.clienttcrm.com/invitations/accept?token={token}

This invitation expires in 7 days ({expires_at}).

---
If you didn't expect this invitation, you can safely ignore this email.
```

## Testing Checklist

- [ ] Can create invitation with valid data
- [ ] Cannot invite existing member
- [ ] Cannot create duplicate pending invitation
- [ ] Token is cryptographically secure
- [ ] expires_at set to 7 days from creation
- [ ] Email sent when invitation created
- [ ] Can accept invitation with valid token
- [ ] Cannot accept expired invitation
- [ ] Cannot accept revoked invitation
- [ ] Accepting creates authz_user
- [ ] Can revoke pending invitation
- [ ] Only admins/managers can send invitations
- [ ] Can resend invitation (new token, new expiration)
- [ ] Queries filtered by company_id
- [ ] team_role requires team_id (database constraint)
- [ ] Respects company max_users limit
- [ ] Audit logs created for all operations
