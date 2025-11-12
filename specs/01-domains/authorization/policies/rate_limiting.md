# Policy: Rate Limiting for Sensitive Actions

**Domain**: Authorization
**Type**: security + validation
**Status**: approved
**Last Updated**: 2025-11-12

## Purpose

Prevents abuse and rapid-fire attacks on sensitive authorization actions by rate limiting operations to 1 action per second per user. Provides protection against accidental button-mashing, automated attacks, and resource exhaustion.

## Scope

### Resources
- AuthzUser (role changes, team assignments, suspend/reactivate)
- Company (updates, archival)
- Team (create, update, archive)
- CompanySettings (updates, feature toggles)
- Invitation (already has 50/hour company-level limit, this adds user-level protection)

### Actions
All sensitive write operations:
- update_role
- assign_to_team
- suspend / reactivate
- archive (company or team)
- update (company settings, team)
- toggle_feature

### Actors
- All authenticated users (authz_users)
- Rate limit is per authz_user_id

---

## Rule: 1 Action Per Second Per User

**Condition**: User attempts to perform sensitive action
**Requirement**: User can only perform 1 action per second across all rate-limited actions

**Scope**: Per user (per authz_user_id)
**Window**: Rolling 1-second window
**Applies to**: All sensitive actions listed above

---

## Implementation

### Approach A: Timestamp-Based Validation (Recommended)

Track last action timestamp per user, reject if < 1 second has elapsed.

**Implementation**:

```elixir
# Add to authz_users table (or create separate rate_limit_tracking table)
ALTER TABLE authz_users ADD COLUMN last_sensitive_action_at timestamp;
CREATE INDEX idx_authz_users_last_action ON authz_users(last_sensitive_action_at);

# Validation in Ash
validate RateLimitSensitiveActions do
  validate fn changeset, context ->
    actor_id = context.actor.id
    now = DateTime.utc_now()

    # Get last action timestamp for this user
    last_action_at =
      AuthzUser
      |> Ash.Query.filter(id == ^actor_id)
      |> Ash.read_one!()
      |> Map.get(:last_sensitive_action_at)

    case last_action_at do
      nil ->
        :ok  # First action, allow

      timestamp ->
        diff = DateTime.diff(now, timestamp, :millisecond)

        if diff >= 1000 do
          :ok  # More than 1 second elapsed, allow
        else
          remaining = 1000 - diff
          {:error, "Rate limit exceeded. Please wait #{remaining}ms before trying again."}
        end
    end
  end
end

# Change to update timestamp after successful action
change UpdateLastActionTimestamp do
  change fn changeset, context ->
    actor_id = context.actor.id
    now = DateTime.utc_now()

    # Update authz_user's last action timestamp
    AuthzUser
    |> Ash.Changeset.for_update(:update_last_action, %{last_sensitive_action_at: now})
    |> Ash.update!()

    changeset
  end
end
```

### Approach B: In-Memory Rate Limiting (Alternative)

Use GenServer or ETS table to track action timestamps in memory.

**Pros**: Faster, no database updates
**Cons**: Lost on server restart, requires distributed coordination for multi-node

```elixir
defmodule ClienttCrmApp.Authorization.RateLimiter do
  use GenServer

  @rate_limit_ms 1000  # 1 second

  def start_link(_) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def check_rate_limit(authz_user_id) do
    GenServer.call(__MODULE__, {:check, authz_user_id})
  end

  def init(_) do
    # ETS table: {authz_user_id, last_action_timestamp}
    :ets.new(:rate_limits, [:named_table, :public, read_concurrency: true])
    {:ok, %{}}
  end

  def handle_call({:check, authz_user_id}, _from, state) do
    now = System.monotonic_time(:millisecond)

    case :ets.lookup(:rate_limits, authz_user_id) do
      [] ->
        # First action, allow
        :ets.insert(:rate_limits, {authz_user_id, now})
        {:reply, :ok, state}

      [{^authz_user_id, last_timestamp}] ->
        diff = now - last_timestamp

        if diff >= @rate_limit_ms do
          # Rate limit passed, update timestamp
          :ets.insert(:rate_limits, {authz_user_id, now})
          {:reply, :ok, state}
        else
          remaining = @rate_limit_ms - diff
          {:reply, {:error, "Rate limit exceeded. Please wait #{remaining}ms."}, state}
        end
    end
  end
end
```

---

## Actions to Rate Limit

### AuthzUser Actions

```elixir
# authz_user.ex
update :update_role do
  accept [:role]

  validate RateLimitSensitiveActions  # Rate limit check
  validate OnlyAdminCanChangeRoles

  change SendRoleChangeNotification
  change CreateAuditLog
  change UpdateLastActionTimestamp  # Update rate limit timestamp
end

update :assign_to_team do
  accept [:team_id, :team_role]

  validate RateLimitSensitiveActions
  validate TeamBelongsToCompany

  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :suspend do
  accept []

  validate RateLimitSensitiveActions
  validate OnlyAdminCanSuspend

  change set_attribute(:status, :inactive)
  change InvalidateUserSessions
  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :reactivate do
  accept []

  validate RateLimitSensitiveActions
  validate OnlyAdminCanReactivate

  change set_attribute(:status, :active)
  change CreateAuditLog
  change UpdateLastActionTimestamp
end
```

### Company Actions

```elixir
# company.ex
update :update do
  accept [:name]

  validate RateLimitSensitiveActions
  validate OnlyAdminCanUpdate

  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :archive do
  accept []

  validate RateLimitSensitiveActions
  validate OnlyAdminCanArchive

  change set_attribute(:status, :archived)
  change ArchiveCompanyMembers
  change RevokeCompanyInvitations
  change ArchiveCompanyTeams
  change CreateAuditLog
  change UpdateLastActionTimestamp
end
```

### Team Actions

```elixir
# team.ex
create :create do
  accept [:company_id, :name, :description]

  validate RateLimitSensitiveActions
  validate OnlyAdminCanCreateTeams

  change set_attribute(:status, :active)
  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :update do
  accept [:name, :description]

  validate RateLimitSensitiveActions
  validate OnlyAdminCanUpdateTeams

  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :archive do
  accept []

  validate RateLimitSensitiveActions
  validate ValidateNoActiveMembers

  change set_attribute(:status, :archived)
  change CreateAuditLog
  change UpdateLastActionTimestamp
end
```

### CompanySettings Actions

```elixir
# company_settings.ex
update :update do
  accept [:max_users, :max_teams, :timezone]

  validate RateLimitSensitiveActions
  validate OnlyAdminCanUpdate
  validate PositiveLimits

  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :toggle_feature do
  argument :feature_name, :string, allow_nil?: false
  argument :enabled, :boolean, allow_nil?: false

  validate RateLimitSensitiveActions
  validate OnlyAdminCanToggleFeatures

  change ToggleFeatureFlag
  change PublishFeatureToggledEvent
  change CreateAuditLog
  change UpdateLastActionTimestamp
end

update :update_branding do
  accept [:branding]

  validate RateLimitSensitiveActions
  validate OnlyAdminCanUpdate

  change CreateAuditLog
  change UpdateLastActionTimestamp
end
```

---

## Error Handling

### Error Message

```elixir
{:error, "Rate limit exceeded. Please wait 327ms before trying again."}
```

**User-Friendly Message**:
- "Please wait a moment before trying again"
- Show remaining time if < 500ms: "Please wait 327ms"
- Otherwise: "Please wait a moment"

### HTTP Status Code

- **429 Too Many Requests**
- Header: `Retry-After: 1` (seconds)

### UI Behavior

**Recommended**:
- Disable action buttons for 1 second after action
- Show loading state during action
- Display toast/alert if rate limit hit: "Please wait a moment before trying again"

**Example LiveView Implementation**:
```elixir
def handle_event("update_role", params, socket) do
  case AuthzUser.update_role(user, params, actor: socket.assigns.current_authz_user) do
    {:ok, updated_user} ->
      {:noreply,
       socket
       |> put_flash(:info, "Role updated successfully")
       |> assign(disable_buttons: true)
       |> push_event("enable_buttons_after_delay", %{delay: 1000})}

    {:error, %{errors: [%{message: "Rate limit exceeded" <> _}]}} ->
      {:noreply, put_flash(socket, :error, "Please wait a moment before trying again")}

    {:error, error} ->
      {:noreply, put_flash(socket, :error, "Failed to update role")}
  end
end
```

---

## Exemptions

### Actions NOT Rate Limited

**Read Operations**:
- All read/list/get actions (no rate limit)
- Audit log viewing
- Member list viewing

**Low-Risk Writes**:
- User profile updates (name, avatar) - not company-wide impact
- Password changes (handled by Accounts domain)

**Already Rate Limited Elsewhere**:
- Invitations (already have 50/hour per company limit)

---

## Monitoring

### Metrics to Track

- **Rate limit hits**: Count of rejected actions per user/company/action
- **Legitimate hits**: Users accidentally clicking twice (expected)
- **Suspicious patterns**: Same user hitting limit repeatedly (potential abuse)

### Logging

```elixir
Logger.warning("Rate limit exceeded",
  authz_user_id: actor_id,
  action: action_name,
  remaining_ms: remaining,
  company_id: company_id
)
```

### Alerts

- **Alert if**: Same user hits rate limit > 10 times in 1 minute
- **Indicates**: Potential automated attack or bug in UI

---

## Testing Requirements

### Unit Tests

- [ ] Rate limit prevents action within 1 second
- [ ] Rate limit allows action after 1 second
- [ ] First action always allowed (no previous timestamp)
- [ ] Error message includes remaining time
- [ ] Timestamp updated after successful action

### Integration Tests

- [ ] Multiple actions by same user rate limited
- [ ] Actions by different users not affected
- [ ] Rate limit applies across different action types
- [ ] Rate limit resets after 1 second

### Load Tests

- [ ] Rate limiter handles concurrent requests
- [ ] No race conditions on timestamp updates
- [ ] Performance impact < 5ms per action

---

## Security Considerations

### Why 1 Second?

- **Prevents button-mashing**: Users accidentally double-clicking
- **Stops automated attacks**: Scripts/bots trying rapid operations
- **UX-friendly**: 1 second is fast enough not to annoy users
- **Resource protection**: Prevents database flooding

### Why Per-User?

- **Fair**: One user can't block others
- **Granular**: Targets individual bad actors
- **Scalable**: Linear growth with user count

---

## Performance Impact

### Approach A (Database Timestamp)

- **Read overhead**: 1 query to get last timestamp (~5ms)
- **Write overhead**: 1 update to set new timestamp (~10ms)
- **Total**: ~15ms per sensitive action
- **Mitigation**: Index on `last_sensitive_action_at`

### Approach B (In-Memory)

- **Read overhead**: ETS lookup (~0.01ms)
- **Write overhead**: ETS insert (~0.01ms)
- **Total**: ~0.02ms per sensitive action
- **Trade-off**: Lost on restart, needs distributed coordination

**Recommendation**: Start with Approach A (database), migrate to Approach B if needed.

---

## Configuration

### Rate Limit Tuning

```elixir
# config/config.exs
config :clientt_crm_app, ClienttCrmApp.Authorization,
  sensitive_action_rate_limit_ms: 1000  # 1 second default

# Can adjust per environment:
# config/dev.exs
config :clientt_crm_app, ClienttCrmApp.Authorization,
  sensitive_action_rate_limit_ms: 500  # 0.5 seconds in dev (faster testing)

# config/prod.exs
config :clientt_crm_app, ClienttCrmApp.Authorization,
  sensitive_action_rate_limit_ms: 1000  # 1 second in prod
```

---

## Related Policies

- [invitation_security.md](./invitation_security.md) - Invitation-specific rate limiting (50/hour)
- [role_based_access.md](./role_based_access.md) - Role-based permissions

---

## References

- OWASP: Rate Limiting Best Practices
- Phoenix Rate Limiting: https://hexdocs.pm/plug/Plug.RateLimiter.html
- Ash Validations: https://hexdocs.pm/ash/validations.html

---

**Implementation Priority**: Phase 1 (core security)
**Complexity**: Low-Medium
**Impact**: High (prevents abuse and resource exhaustion)
