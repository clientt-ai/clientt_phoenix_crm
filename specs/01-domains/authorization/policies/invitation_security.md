# Policy: Invitation Security

**Domain**: Authorization
**Type**: authorization + validation
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Ensures invitation tokens are secure, invitations cannot be abused, and the invitation acceptance flow maintains data integrity and security.

## Scope

### Resources
- Invitation

### Actions
- create (sending invitation)
- accept (accepting invitation)
- revoke (canceling invitation)
- check_expiration (system cleanup)

### Actors
- Admins and managers (create, revoke)
- Anyone with valid token (accept)
- System (check_expiration)

## Rules

### Rule 1: Cryptographically Secure Token Generation
**Condition**: Creating a new invitation
**Requirement**: Token must be at least 32 bytes, cryptographically random, URL-safe

**Implementation**:
```elixir
change GenerateInvitationToken do
  change fn changeset, _context ->
    # Generate 32 bytes = 256 bits of randomness
    token =
      :crypto.strong_rand_bytes(32)
      |> Base.url_encode64(padding: false)

    Ash.Changeset.change_attribute(changeset, :token, token)
  end
end
```

**Token Properties**:
- Length: 43 characters (base64-encoded 32 bytes)
- Character set: A-Z, a-z, 0-9, -, _ (URL-safe)
- Uniqueness: Enforced by database unique constraint
- One-time use: Marked as accepted after use

**Examples**:
```yaml
# Valid token
token: "dGhpc19pc19hX3NlY3VyZV90b2tlbl9leGFtcGxlXzMyX2J5dGVz"
length: 43 characters
entropy: 256 bits
result: secure

# Invalid token (too short)
token: "short"
length: 5 characters
result: rejected

# Invalid token (predictable)
token: "invitation-123"
result: rejected (not cryptographically random)
```

---

### Rule 2: Invitation Expiration
**Condition**: Creating invitation or accepting invitation
**Requirement**: Invitations expire after 7 days (configurable)

**Implementation**:
```elixir
change SetInvitationExpiry do
  change fn changeset, _context ->
    expires_at = DateTime.utc_now() |> DateTime.add(7, :day)
    Ash.Changeset.change_attribute(changeset, :expires_at, expires_at)
  end
end

validate InvitationNotExpired do
  validate fn changeset, _context ->
    expires_at = Ash.Changeset.get_attribute(changeset, :expires_at)

    if DateTime.compare(DateTime.utc_now(), expires_at) == :lt do
      :ok
    else
      {:error, "This invitation has expired. Please request a new invitation."}
    end
  end
end
```

**Examples**:
```yaml
# Valid invitation
created_at: 2025-01-01 10:00:00 UTC
expires_at: 2025-01-08 10:00:00 UTC
current_time: 2025-01-05 10:00:00 UTC
result: valid (2 days remaining)

# Expired invitation
created_at: 2025-01-01 10:00:00 UTC
expires_at: 2025-01-08 10:00:00 UTC
current_time: 2025-01-10 10:00:00 UTC
result: expired
error: "This invitation has expired"
```

---

### Rule 3: Unique Pending Invitation per Email per Company
**Condition**: Creating a new invitation
**Requirement**: Only one pending invitation allowed per (email, company_id) pair

**Database Constraint**:
```sql
CREATE UNIQUE INDEX idx_invitations_unique_pending
  ON authz_invitations(company_id, email)
  WHERE status = 'pending';
```

**Examples**:
```yaml
# Allowed (first invitation)
email: "user@example.com"
company: "Acme Corp"
existing_invitations: []
result: invitation created

# Denied (duplicate pending)
email: "user@example.com"
company: "Acme Corp"
existing_invitations:
  - status: pending
    expires_at: 2025-01-15
result: denied
error: "Pending invitation already exists"
options:
  - Resend existing invitation
  - Revoke and create new invitation

# Allowed (previous invitation accepted)
email: "user@example.com"
company: "Acme Corp"
existing_invitations:
  - status: accepted
    accepted_at: 2025-01-05
result: allowed (user already a member, but system prevents duplicate authz_user)
```

---

### Rule 4: Cannot Accept if Already Member
**Condition**: Accepting invitation
**Requirement**: User cannot accept invitation for company they're already a member of

**Implementation**:
```elixir
validate NotAlreadyMember do
  validate fn changeset, _context ->
    company_id = Ash.Changeset.get_attribute(changeset, :company_id)
    authn_user_id = actor(:authn_user_id)

    existing_authz_user =
      AuthzUser
      |> Ash.Query.filter(company_id: ^company_id)
      |> Ash.Query.filter(authn_user_id: ^authn_user_id)
      |> Ash.read_one()

    case existing_authz_user do
      nil -> :ok
      _existing -> {:error, "You are already a member of this company"}
    end
  end
end
```

**Examples**:
```yaml
# Allowed (new member)
invitee: "alice@example.com"
company: "Acme Corp"
existing_authz_user: null
result: invitation accepted, authz_user created

# Denied (already member)
invitee: "alice@example.com"
company: "Acme Corp"
existing_authz_user:
  role: "user"
  status: "active"
result: denied
error: "You are already a member of this company"
action: redirect to company dashboard
```

---

### Rule 5: Token Must Be Valid
**Condition**: Accepting invitation
**Requirement**: Token must match, invitation must be pending

**Implementation**:
```elixir
read :get_by_token do
  argument :token, :string, allow_nil?: false
  filter expr(token == ^arg(:token))
  filter expr(status == :pending)
end

validate TokenIsValid do
  validate fn changeset, _context ->
    invitation = changeset.data

    cond do
      invitation.status != :pending ->
        {:error, "This invitation has already been used or revoked"}

      DateTime.compare(DateTime.utc_now(), invitation.expires_at) == :gt ->
        {:error, "This invitation has expired"}

      true ->
        :ok
    end
  end
end
```

**Examples**:
```yaml
# Valid token
token: "[valid-token]"
status: pending
expires_at: [future date]
result: invitation found, ready to accept

# Invalid token (already accepted)
token: "[valid-token]"
status: accepted
result: error "This invitation has already been used"

# Invalid token (revoked)
token: "[valid-token]"
status: revoked
result: error "This invitation has been revoked"

# Invalid token (wrong token)
token: "[invalid-token]"
result: error "Invitation not found"
```

---

### Rule 6: Rate Limiting on Invitation Creation
**Condition**: Creating invitations
**Requirement**: Limit invitations per company per hour (prevent spam)

**Implementation**:
```elixir
validate RateLimitInvitations do
  validate fn changeset, _context ->
    company_id = Ash.Changeset.get_attribute(changeset, :company_id)
    one_hour_ago = DateTime.utc_now() |> DateTime.add(-1, :hour)

    recent_count =
      Invitation
      |> Ash.Query.filter(company_id: ^company_id)
      |> Ash.Query.filter(created_at > ^one_hour_ago)
      |> Ash.count!()

    if recent_count < 50 do
      :ok
    else
      {:error, "Rate limit exceeded. Maximum 50 invitations per hour."}
    end
  end
end
```

**Rate Limits**:
- Per company: 50 invitations per hour
- Per user (future): 10 invitations per hour
- Global (future): 1000 invitations per hour

---

### Rule 7: Email Validation
**Condition**: Creating invitation
**Requirement**: Email must be valid format

**Implementation**:
```elixir
validate format(:email, ~r/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
```

**Examples**:
```yaml
# Valid emails
- valid@example.com
- user.name@company.co.uk
- user+tag@example.com

# Invalid emails
- invalid-email
- @example.com
- user@
- user @example.com  # space
```

---

### Rule 8: Invitation Ownership
**Condition**: Revoking invitation
**Requirement**: Only inviter or admin can revoke

**Implementation**:
```elixir
policies do
  policy action(:revoke) do
    # Inviter can revoke their own invitations
    authorize_if expr(invited_by_authz_user_id == ^actor(:authz_user_id))

    # OR admin can revoke any invitation
    authorize_if expr(role == :admin)
  end
end
```

**Examples**:
```yaml
# Allowed (inviter revokes)
actor: alice@acme.com (authz_user_id: "alice-123")
invitation:
  invited_by_authz_user_id: "alice-123"
action: revoke
result: allowed

# Allowed (admin revokes)
actor: admin@acme.com (role: admin)
invitation:
  invited_by_authz_user_id: "alice-123"
action: revoke
result: allowed

# Denied (different user, not admin)
actor: bob@acme.com (role: user, authz_user_id: "bob-456")
invitation:
  invited_by_authz_user_id: "alice-123"
action: revoke
result: denied
```

---

## Security Considerations

### Token Transmission
- Tokens sent via email (HTTPS-encrypted in transit)
- Tokens included in URL query parameter (acceptable for one-time use)
- Alternative: POST-based acceptance with token in body (more secure)

### Token Storage
- Tokens stored in database (plain text acceptable for invitations)
- One-time use prevents replay attacks
- Expiration provides time-bound access

### Brute Force Protection
- Token length (32 bytes) makes brute force impractical
- Rate limiting on acceptance attempts (future)
- Account lockout after N failed attempts (future)

---

## Error Handling

### Error Messages
```yaml
# Expired invitation
error: "This invitation has expired"
code: "invitation_expired"
message: "Please request a new invitation from the company admin"
http_status: 410 (Gone)

# Already accepted
error: "This invitation has already been used"
code: "invitation_already_used"
http_status: 410 (Gone)

# Already member
error: "You are already a member of this company"
code: "already_member"
action: redirect to company dashboard
http_status: 409 (Conflict)

# Invalid token
error: "Invitation not found"
code: "invitation_not_found"
http_status: 404 (Not Found)
# Note: Don't distinguish between invalid token and expired for security

# Duplicate pending
error: "Pending invitation already exists"
code: "duplicate_pending_invitation"
options:
  - resend_url: "/invitations/[id]/resend"
  - revoke_url: "/invitations/[id]/revoke"
http_status: 409 (Conflict)

# Rate limit
error: "Rate limit exceeded"
code: "rate_limit_exceeded"
message: "Maximum 50 invitations per hour"
retry_after: 3600  # seconds
http_status: 429 (Too Many Requests)
```

---

## Testing Requirements

### Security Tests
- [ ] Token is cryptographically random (entropy test)
- [ ] Token is at least 32 bytes
- [ ] Token is URL-safe
- [ ] Cannot guess token via brute force
- [ ] Expired invitations cannot be accepted
- [ ] Accepted invitations cannot be reused
- [ ] Invalid token returns generic error (no info leak)
- [ ] Rate limiting prevents spam

### Functional Tests
- [ ] Can create invitation with valid data
- [ ] Cannot create duplicate pending invitation
- [ ] Can accept invitation with valid token
- [ ] Cannot accept expired invitation
- [ ] Cannot accept if already member
- [ ] Inviter can revoke invitation
- [ ] Admin can revoke any invitation
- [ ] Non-admin cannot revoke others' invitations

### Edge Case Tests
- [ ] Concurrent acceptance of same invitation
- [ ] Invitation for existing authn_user
- [ ] Invitation for new authn_user
- [ ] Multiple invitations for same email (different companies)
- [ ] Token collision (extremely rare, but handled)

---

## Invitation Lifecycle

### State Transitions
```
[created] → pending → accepted ✓
            pending → expired ✗
            pending → revoked ✗
```

### State Details
```yaml
pending:
  - Initial state
  - Can be accepted
  - Can be revoked
  - Can expire

accepted:
  - Final state (terminal)
  - Cannot transition
  - Immutable

expired:
  - Final state (terminal)
  - System-triggered
  - Cannot be accepted
  - Can request new invitation

revoked:
  - Final state (terminal)
  - User-triggered
  - Cannot be accepted
  - Can send new invitation
```

---

## Compliance

### GDPR
- Invitation emails contain minimal PII
- Can delete invitation records after acceptance/expiration
- Audit log tracks who invited whom

### SOC 2
- Secure token generation
- Audit trail of invitations
- Access controls on invitation management

---

## Performance Considerations

- Token generation: < 1ms (cryptographically secure but fast)
- Token validation: < 10ms (indexed lookup)
- Rate limit check: < 50ms (count query with index)
- Expiration check (background job): Batch process, runs hourly

---

## Related Policies
- [role_based_access.md](./role_based_access.md) - Who can create/revoke invitations
- [row_level_security.md](./row_level_security.md) - Invitations scoped by company

---

## References
- Feature: [user_management.feature.md](../features/user_management.feature.md) - Invitation scenarios
- Resource: [invitation.md](../resources/invitation.md) - Invitation resource spec
- Security: OWASP Token-Based Authentication Best Practices
