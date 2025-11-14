# Resource: CalendarConnection

**Domain**: Integrations
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents an active OAuth connection to an external calendar provider (Google Calendar or Microsoft Outlook). Manages OAuth tokens, connection state, calendar configuration, and synchronization settings. Enables booking creation on external calendars.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this connection |
| provider | atom | Yes | enum: [:google, :microsoft] | Calendar provider |
| access_token_encrypted | binary | Yes | encrypted | OAuth access token (encrypted) |
| refresh_token_encrypted | binary | Yes | encrypted | OAuth refresh token (encrypted) |
| token_expires_at | utc_datetime | Yes | future datetime | When access token expires |
| provider_user_id | string | Yes | - | User ID from provider |
| provider_email | string | Yes | valid email | Email address from provider |
| calendar_id | string | No | - | Selected calendar ID |
| calendar_name | string | No | max 255 chars | Selected calendar name |
| calendar_timezone | string | Yes | valid IANA timezone | Calendar's timezone |
| scope | string | Yes | - | OAuth scopes granted |
| settings | map | No | valid JSON | Connection configuration |
| state | atom | Yes | enum: [:disconnected, :connecting, :connected, :error, :expired] | Connection status |
| last_synced_at | utc_datetime | No | - | Last successful sync |
| last_error | string | No | max 1000 chars | Most recent error message |
| error_count | integer | Yes | >= 0 | Consecutive error count |
| connected_at | utc_datetime | No | - | When OAuth flow completed |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Settings Map Structure

```elixir
%{
  # Event creation settings
  event_title_template: "Demo with {{attendee_name}}",
  event_description_template: "Product demo requested via {{form_name}}",
  default_event_duration: 30,  # minutes
  buffer_time_before: 0,       # minutes
  buffer_time_after: 15,        # minutes

  # Notification settings
  send_confirmation_email: true,
  confirmation_email_to: "bookings@company.com",
  include_calendar_invite: true,

  # Availability settings
  check_conflicts: true,
  max_advance_booking: 30,     # days
  min_notice_time: 60,         # minutes

  # Integration behavior
  auto_refresh_token: true,
  sync_deletions: true,        # Delete from external calendar when cancelled
  retry_failed_bookings: true,

  # Webhook configuration (future)
  webhook_url: nil,
  webhook_secret: nil
}
```

## Business Rules

### Invariants

- Only one active connection per provider per company
- Tokens must always be encrypted at rest
- token_expires_at must be in future for connected state
- Cannot have both Google and Microsoft connected simultaneously (current MVP limitation)
- provider_email must match OAuth user
- error_count reset to 0 on successful operation
- state must be :connected to create bookings

### Validations

- **provider**: Required, must be :google or :microsoft
- **access_token_encrypted**: Required, binary format
- **refresh_token_encrypted**: Required, binary format
- **token_expires_at**: Required, must be future timestamp for :connected state
- **provider_user_id**: Required, non-empty string
- **provider_email**: Required, valid email format
- **calendar_timezone**: Required, valid IANA timezone
- **scope**: Required, must contain minimum scopes for calendar access
- **state**: Required, must be valid enum value
- **error_count**: Non-negative integer

### Calculated Fields

- **is_connected**: `state == :connected`
- **is_token_expiring_soon**: `DateTime.diff(token_expires_at, DateTime.utc_now(), :minute) < 5`
- **needs_refresh**: `is_token_expiring_soon or state == :expired`
- **has_errors**: `error_count > 0`
- **days_since_sync**: `Date.diff(Date.utc_today(), last_synced_at)`

## State Transitions

```
disconnected → connecting → connected → expired
      ↑            ↓            ↓          ↓
      ←←←←← error ←←←←←←←←←←←←←←←←←←
```

**Valid Transitions**:

- `disconnected → connecting`: When OAuth flow initiates
  - Generates state parameter for CSRF protection
  - Redirects user to provider's authorization URL

- `connecting → connected`: When OAuth callback succeeds
  - Sets access_token_encrypted, refresh_token_encrypted
  - Sets token_expires_at
  - Sets connected_at timestamp
  - Publishes integrations.calendar_connected event

- `connecting → error`: When OAuth fails
  - Sets last_error with failure reason
  - Increments error_count
  - May retry or require manual reconnection

- `connecting → disconnected`: When user cancels OAuth flow
  - Cleans up OAuth state

- `connected → expired`: When token refresh fails
  - Sets state to :expired
  - Publishes integrations.token_expired event
  - Sends notification to company admin

- `connected → error`: When API calls fail repeatedly
  - Sets last_error
  - Increments error_count
  - Opens circuit breaker after 5 consecutive failures

- `connected → disconnected`: When user explicitly disconnects
  - Revokes tokens with provider (if supported)
  - Deletes encrypted tokens
  - Publishes integrations.calendar_disconnected event

- `expired → connecting`: When user re-authenticates
  - Starts new OAuth flow

- `error → connecting`: When retry is attempted
  - Attempts token refresh or new OAuth flow

## Token Encryption

Tokens must be encrypted at rest using application encryption key:

```elixir
defmodule Integrations.TokenEncryption do
  # Use cloak_ecto or similar for encryption
  use Cloak.Ecto.Schema

  encrypted_field :access_token_encrypted, :binary
  encrypted_field :refresh_token_encrypted, :binary

  # Tokens are never returned in plaintext via API
  # Only decrypted internally for API calls
end
```

**Security Requirements**:
- Encryption key stored in environment variable
- Encryption key rotated quarterly
- Tokens never logged or exposed in errors
- Tokens deleted immediately on disconnect

## OAuth Flows

### Google Calendar OAuth

**Authorization URL**:
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id={CLIENT_ID}&
  redirect_uri={REDIRECT_URI}&
  response_type=code&
  scope=https://www.googleapis.com/auth/calendar.events&
  access_type=offline&
  prompt=consent&
  state={RANDOM_STATE}
```

**Required Scopes**:
- `https://www.googleapis.com/auth/calendar.events` - Create/update events
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendars

**Token Refresh**:
```elixir
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}&
refresh_token={REFRESH_TOKEN}&
grant_type=refresh_token
```

### Microsoft Outlook OAuth

**Authorization URL**:
```
https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
  client_id={CLIENT_ID}&
  redirect_uri={REDIRECT_URI}&
  response_type=code&
  scope=Calendars.ReadWrite offline_access&
  state={RANDOM_STATE}
```

**Required Scopes**:
- `Calendars.ReadWrite` - Create/update events
- `Calendars.Read` - Read calendars
- `offline_access` - Get refresh token

**Token Refresh**:
```elixir
POST https://login.microsoftonline.com/common/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}&
refresh_token={REFRESH_TOKEN}&
grant_type=refresh_token
```

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one
  - Only one active connection per provider per company

### Has Many
- **CalendarBookings** (forms.calendar_bookings) - one-to-many
  - All bookings created via this connection

## Domain Events

### Published Events

- `integrations.calendar_connected`: Triggered when OAuth succeeds
  - Payload: {connection_id, provider, company_id, provider_email, connected_at}
  - Consumers: Forms (enable booking features), Analytics, Email (confirmation)

- `integrations.calendar_disconnected`: Triggered on disconnect
  - Payload: {connection_id, provider, company_id, disconnected_at, reason}
  - Consumers: Forms (disable booking features), Analytics

- `integrations.token_refreshed`: Triggered on successful refresh
  - Payload: {connection_id, token_expires_at, refreshed_at}
  - Consumers: Analytics (connection health monitoring)

- `integrations.token_expired`: Triggered when refresh fails
  - Payload: {connection_id, provider, company_id, error}
  - Consumers: Email (alert admin), Forms (disable bookings)

- `integrations.connection_error`: Triggered on API errors
  - Payload: {connection_id, error_code, error_message, error_count}
  - Consumers: Monitoring, Email (if error_count > 3)

### Subscribed Events

- `forms.booking_requested`: Creates event on external calendar
- `forms.booking_cancelled`: Deletes event from external calendar
- `authorization.company_deleted`: Disconnect and revoke tokens

## Access Patterns

### Queries

```elixir
# Get active connection for company
CalendarConnections.get_active_connection(company_id)

# Get connection by provider
CalendarConnections.get_by_provider(company_id, :google)

# List connections requiring token refresh
CalendarConnections.list_expiring_soon(within_minutes: 5)

# Get connections with errors
CalendarConnections.list_with_errors(company_id)

# Get connected calendars
CalendarConnections.list_connected(company_id)
```

### Common Operations

**Initiate OAuth Flow**:
```elixir
CalendarConnections.start_oauth_flow(company_id, :google)
# Creates connection with state: :connecting
# Generates random state parameter
# Returns: {:ok, authorization_url}
```

**Handle OAuth Callback**:
```elixir
CalendarConnections.handle_oauth_callback(%{
  code: "auth_code_from_provider",
  state: "csrf_state_token",
  company_id: uuid
})
# Validates state parameter
# Exchanges code for tokens
# Encrypts and stores tokens
# Sets state to :connected
# Publishes: integrations.calendar_connected
# Returns: {:ok, %CalendarConnection{state: :connected}}
```

**Refresh Access Token** (background job):
```elixir
CalendarConnections.refresh_token(connection_id)
# Decrypts refresh_token
# Calls provider token endpoint
# Encrypts and stores new access_token
# Updates token_expires_at
# Resets error_count to 0
# Publishes: integrations.token_refreshed
# Returns: {:ok, %CalendarConnection{}}
```

**Disconnect**:
```elixir
CalendarConnections.disconnect(connection_id, reason: "User requested")
# Attempts token revocation with provider (Google supported, Microsoft not)
# Deletes encrypted tokens
# Sets state to :disconnected
# Publishes: integrations.calendar_disconnected
# Returns: {:ok, %CalendarConnection{state: :disconnected}}
```

**Record Error**:
```elixir
CalendarConnections.record_error(connection_id, error: "API rate limit exceeded")
# Increments error_count
# Sets last_error
# Changes state to :error if error_count >= 5
# Publishes: integrations.connection_error
# Returns: {:ok, %CalendarConnection{}}
```

## Token Refresh Job

Background job runs every 5 minutes:

```elixir
defmodule Integrations.TokenRefreshJob do
  use Oban.Worker, queue: :integrations

  @impl Oban.Worker
  def perform(_job) do
    # Find connections with tokens expiring in next 5 minutes
    CalendarConnections.list_expiring_soon(within_minutes: 5)
    |> Enum.each(&refresh_with_retry/1)

    :ok
  end

  defp refresh_with_retry(connection) do
    case CalendarConnections.refresh_token(connection.id) do
      {:ok, _} -> :ok
      {:error, reason} ->
        # Retry up to 3 times
        retry_or_expire(connection, reason)
    end
  end
end
```

## Performance Considerations

- **Token Encryption**: Use hardware encryption if available
- **Token Refresh**: Background job prevents expiration
- **API Calls**: Connection pooling for HTTP requests
- **Error Tracking**: Circuit breaker pattern after 5 consecutive failures
- **Indexing**: Index on `(company_id, provider, state)` for queries

## Testing Scenarios

### Unit Tests
- [ ] Create connection with encrypted tokens
- [ ] Tokens never returned in plaintext
- [ ] State transitions follow state machine
- [ ] Only one active connection per provider per company
- [ ] Token refresh updates expiration timestamp
- [ ] Error count increments on failures

### Integration Tests
- [ ] OAuth flow completes successfully
- [ ] OAuth callback validates state parameter
- [ ] Token refresh prevents expiration
- [ ] Failed refresh triggers expiration
- [ ] Disconnect revokes tokens with provider
- [ ] Creating booking uses connection tokens

---

**Related Resources**:
- [CalendarBooking](../../forms/resources/calendar_booking.md) - Bookings using this connection
- [IntegrationCredential](./integration_credential.md) - Encrypted credential storage

**Related Features**:
- [Google OAuth Feature](../features/google_calendar_oauth.feature.md)
- [Microsoft OAuth Feature](../features/microsoft_calendar_oauth.feature.md)
- [Calendar Sync Feature](../features/calendar_sync.feature.md)

**Related Integrations**:
- [Forms to Integrations](../../../03-integrations/forms_to_integrations_integration.md)
