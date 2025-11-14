# Domain: Integrations

**Status**: draft
**Last Updated**: 2025-11-14
**Owner**: Platform Team

## Domain Purpose

Manages external service integrations including OAuth authentication, calendar synchronization (Google Calendar, Microsoft Outlook), chatbot configuration, and third-party API interactions. This domain handles secure credential storage, token refresh, API communication, and integration state management.

## Ubiquitous Language

- **Calendar Connection**: An active OAuth link to an external calendar provider (Google, Microsoft)
- **Integration Credential**: Encrypted OAuth tokens and API keys for external services
- **Chatbot Config**: Configuration settings for chatbot behavior, appearance, and triggers
- **Token Refresh**: Automatic renewal of expired OAuth access tokens using refresh tokens
- **Calendar Sync**: Bidirectional synchronization of availability and bookings with external calendars
- **OAuth Flow**: Multi-step authentication process with external providers
- **Calendar Provider**: External calendar service (Google Calendar, Microsoft Outlook)
- **Integration State**: Connection status (disconnected, connecting, connected, error, expired)
- **Availability Slot**: Time range when calendar bookings can be scheduled

## Domain Boundaries

### In Scope

- OAuth authentication flows (Google, Microsoft)
- Secure token storage and encryption
- Token refresh automation
- Calendar connection management
- Calendar availability queries
- Event creation on external calendars
- Chatbot configuration storage
- Integration health monitoring
- API rate limit handling
- Connection state management

### Out of Scope

- Form creation and management (Forms domain)
- Lead qualification logic (Forms domain)
- User authentication (Accounts domain)
- Multi-tenant authorization (Authorization domain)
- Email delivery (handled by Mailer)
- UI rendering (Phoenix LiveView layer)
- Business logic for bookings (Forms domain owns CalendarBooking)

### Integration Points

- **Forms**: Receives calendar booking requests, provides availability data
- **Authorization**: Validates company context for integrations
- **Accounts**: Associates integrations with user accounts
- **External APIs**: Google Calendar API, Microsoft Graph API

## Core Business Rules

1. **Single Active Connection Per Provider**: Only one active Google/Microsoft connection per company
2. **Token Encryption At Rest**: All OAuth tokens must be encrypted in database
3. **Automatic Token Refresh**: Refresh tokens 5 minutes before expiration
4. **Connection Expiry**: Connections expire after 90 days without refresh
5. **Rate Limit Compliance**: Must respect provider API rate limits (Google: 10k/day)
6. **Idempotent Event Creation**: External event creation must be idempotent
7. **Availability Cache**: Cache calendar availability for 5 minutes
8. **Retry Policy**: Failed API calls retry 3 times with exponential backoff
9. **State Consistency**: Connection state must match actual provider status
10. **Secure Callback Validation**: OAuth callbacks must validate state parameter

## Domain Events

### Published Events

| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| integrations.calendar_connected | OAuth success | {connection_id, provider, company_id} | Forms |
| integrations.calendar_disconnected | User disconnects | {connection_id, provider, company_id} | Forms |
| integrations.booking_synced | Event created | {booking_id, event_id, provider} | Forms |
| integrations.booking_failed | Event creation fails | {booking_id, error, provider} | Forms |
| integrations.token_refreshed | Token auto-renewed | {connection_id, expires_at} | Analytics |
| integrations.token_expired | Refresh failed | {connection_id, provider} | Email, Forms |
| integrations.rate_limit_reached | API limit hit | {provider, reset_at} | Analytics |
| integrations.connection_error | API error | {connection_id, error_code} | Email |

### Consumed Events

| Event Name | Source | Handler Action |
|------------|--------|----------------|
| forms.booking_requested | Forms | Create event on external calendar |
| authorization.company_deleted | Authorization | Disconnect all integrations, revoke tokens |
| accounts.user_deleted | Accounts | Disconnect user's integrations |

## Resources in This Domain

- **CalendarConnection** - OAuth connection to external calendar provider
- **IntegrationCredential** - Encrypted OAuth tokens and API keys
- **ChatbotConfig** - Chatbot configuration and settings

## Aggregate Roots

- **CalendarConnection**: Ensures OAuth flow integrity and token validity
  - Invariant: Must have valid access_token and refresh_token
  - Invariant: Only one active connection per provider per company
  - Invariant: Tokens must be encrypted at rest
  - Invariant: State parameter must be unique and validated

- **IntegrationCredential**: Ensures secure credential management
  - Invariant: All tokens encrypted with application secret
  - Invariant: Cannot be read in plaintext after storage
  - Invariant: Must have expiration timestamp
  - Invariant: Scope must match intended usage

- **ChatbotConfig**: Ensures chatbot configuration validity
  - Invariant: One config per company
  - Invariant: Greeting message cannot exceed 500 characters
  - Invariant: Trigger pages must be valid page identifiers

## State Machine Diagrams

### Calendar Connection Lifecycle
```
disconnected → connecting → connected → expired
      ↑            ↓            ↓          ↓
      ←←←←← error ←←←←←←←←←←←←←←←←←←
```

**Valid Transitions**:
- `disconnected → connecting`: When OAuth flow initiates
- `connecting → connected`: When OAuth callback succeeds and tokens stored
- `connecting → error`: When OAuth fails or callback validation fails
- `connecting → disconnected`: When user cancels OAuth flow
- `connected → expired`: When token refresh fails
- `connected → error`: When API calls fail repeatedly
- `connected → disconnected`: When user explicitly disconnects
- `expired → connecting`: When user re-authenticates
- `error → connecting`: When retry is attempted
- `error → disconnected`: When giving up after max retries

### Token Refresh Cycle
```
valid → expiring_soon → refreshing → refreshed → valid
  ↓                         ↓
  ↓                    refresh_failed
  ↓                         ↓
  → expired ←←←←←←←←←←←←←←←←←
```

**Valid Transitions**:
- `valid → expiring_soon`: When 5 minutes from expiration
- `expiring_soon → refreshing`: When refresh job starts
- `refreshing → refreshed`: When new tokens obtained
- `refreshed → valid`: When tokens stored successfully
- `refreshing → refresh_failed`: When refresh API call fails
- `refresh_failed → expired`: After 3 retry failures
- `valid → expired`: When tokens expire without refresh

## OAuth Security

### Google Calendar OAuth
- **Scopes Required**: `calendar.events`, `calendar.readonly`
- **Redirect URI**: `https://app.clienttcrm.com/auth/google/callback`
- **Authorization Endpoint**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token Endpoint**: `https://oauth2.googleapis.com/token`
- **PKCE**: Required for enhanced security
- **State Parameter**: Random 32-byte string, validated on callback

### Microsoft Outlook OAuth
- **Scopes Required**: `Calendars.ReadWrite`, `Calendars.Read`
- **Redirect URI**: `https://app.clienttcrm.com/auth/microsoft/callback`
- **Authorization Endpoint**: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
- **Token Endpoint**: `https://login.microsoftonline.com/common/oauth2/v2.0/token`
- **PKCE**: Optional but recommended
- **State Parameter**: Random 32-byte string, validated on callback

## External API Integration

### Google Calendar API
- **Base URL**: `https://www.googleapis.com/calendar/v3`
- **Rate Limits**: 10,000 requests/day per project
- **Key Endpoints**:
  - `GET /calendars/{calendarId}/events`: List events
  - `POST /calendars/{calendarId}/events`: Create event
  - `GET /freeBusy`: Check availability
- **Error Handling**: Retry on 429, 500, 502, 503, 504
- **Timeout**: 30 seconds

### Microsoft Graph API
- **Base URL**: `https://graph.microsoft.com/v1.0`
- **Rate Limits**: Varies by subscription tier
- **Key Endpoints**:
  - `GET /me/calendars`: List calendars
  - `POST /me/calendar/events`: Create event
  - `POST /me/calendar/getSchedule`: Check availability
- **Error Handling**: Retry on 429, 500, 502, 503, 504
- **Timeout**: 30 seconds

## Multi-Tenancy Strategy

All integrations are company-scoped:

- Calendar connections belong to companies
- Multiple users in company share integration
- Company admin can disconnect integrations
- Row-level security via Ash policies

## Performance Considerations

- **Token Refresh**: Background job runs every 5 minutes checking expiring tokens
- **Availability Caching**: Cache GET requests for 5 minutes with Redis
- **API Rate Limiting**: Implement request queue with rate limiter
- **Connection Pooling**: Reuse HTTP connections to external APIs
- **Circuit Breaker**: Open circuit after 5 consecutive failures, retry after 1 minute

## Data Retention Policies

- **Active Connections**: Retain indefinitely while active
- **Disconnected Connections**: Retain 30 days for audit trail, then purge
- **Expired Tokens**: Purge immediately after refresh failure
- **API Logs**: Retain 7 days for debugging
- **Error Logs**: Retain 30 days for analysis

## Monitoring & Alerting

Key metrics to track:

- OAuth success/failure rates per provider
- Token refresh success/failure rates
- API call latencies (p50, p95, p99)
- API error rates by status code
- Rate limit near-miss events
- Connection health by provider
- Time to token expiration

Alert conditions:

- Token refresh failure rate > 5% in 5 minutes
- API error rate > 10% in 5 minutes
- Rate limit threshold > 80%
- More than 5 connection errors for same company in 1 hour

## Security Considerations

1. **Encryption at Rest**: Use AES-256 encryption for all tokens
2. **Encryption in Transit**: All API calls over HTTPS/TLS 1.3
3. **Secret Rotation**: Application encryption key rotated quarterly
4. **Token Scoping**: Request minimal required OAuth scopes
5. **PKCE**: Use PKCE for OAuth flows when supported
6. **State Validation**: Always validate state parameter on OAuth callbacks
7. **Audit Logging**: Log all token access and refresh events
8. **Token Lifetime**: Respect provider token expiration policies
9. **Revocation**: Support token revocation on disconnect
10. **Error Messages**: Never expose tokens in error messages or logs

---

**Related Documentation**:
- [Google OAuth Feature](./features/google_calendar_oauth.feature.md)
- [Microsoft OAuth Feature](./features/microsoft_calendar_oauth.feature.md)
- [Calendar Sync Feature](./features/calendar_sync.feature.md)
- [Forms to Integrations Integration](../../03-integrations/forms_to_integrations_integration.md)
