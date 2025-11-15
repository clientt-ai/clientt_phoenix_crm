# Forms Builder - OAuth Implementation Strategy

**Type**: Technical Investigation & Architecture Decision
**Priority**: 🟠 High
**Status**: Needs Investigation
**Created**: 2025-11-14
**Blocking**: Calendar integration implementation

## Overview

This dev_prompt focuses on making critical technical decisions for OAuth 2.0 implementation to integrate with Google Calendar and Microsoft Outlook. The implementation must be secure, scalable, and maintainable.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Issue #3: OAuth Implementation Strategy
- Concern #3: Security - Token Exposure

## Problem Statement

Calendar bookings require OAuth integration with external providers (Google Calendar, Microsoft Outlook). Need to decide on library choice, token management, encryption strategy, and OAuth flow implementation.

## Critical Decisions Needed

### Decision #1: OAuth Library Choice

**Question**: Which Elixir library should we use for OAuth 2.0?

**Options**:

#### Option A: `oauth2` library
- **Library**: [oauth2](https://github.com/scrogson/oauth2)
- **Pros**:
  - Mature, well-tested library
  - Supports multiple providers
  - Handles token refresh automatically
  - Good documentation
- **Cons**:
  - Lower-level API, more code to write
  - Need to handle provider-specific quirks
- **Effort**: Medium
- **GitHub Stars**: 700+
- **Last Updated**: Active

#### Option B: `assent` library
- **Library**: [assent](https://github.com/pow-auth/assent)
- **Pros**:
  - Higher-level API, less boilerplate
  - Pre-configured strategies for Google, Microsoft
  - Part of Pow ecosystem (battle-tested)
  - Built-in PKCE support
- **Cons**:
  - Heavier dependency
  - May be overkill if only using OAuth (not full auth)
- **Effort**: Low
- **GitHub Stars**: 400+
- **Last Updated**: Active

#### Option C: `ueberauth` + provider strategies
- **Library**: [ueberauth](https://github.com/ueberauth/ueberauth)
- **Pros**:
  - Popular, widely used
  - Many provider strategies available
  - Good Phoenix integration
  - Well-documented
- **Cons**:
  - Designed for user authentication, not API integration
  - May need custom callback handling
- **Effort**: Medium
- **GitHub Stars**: 1.6k+
- **Last Updated**: Active

#### Option D: Custom OAuth client
- **Pros**:
  - Full control over implementation
  - No external dependencies
  - Tailored to exact needs
- **Cons**:
  - High effort
  - Security risks (rolling your own crypto)
  - Maintenance burden
- **Effort**: High
- **Recommendation**: ❌ Not recommended

**Research Tasks**:
- [ ] Test `oauth2` library with Google Calendar API
- [ ] Test `oauth2` library with Microsoft Graph API
- [ ] Test `assent` library with Google and Microsoft strategies
- [ ] Test `ueberauth` library with Google and Microsoft
- [ ] Compare error handling in each library
- [ ] Compare token refresh implementation
- [ ] Document code examples for each option

**Recommendation**: TBD (after research)

---

### Decision #2: Token Encryption Strategy

**Question**: How should we encrypt OAuth tokens at rest?

**Options**:

#### Option A: `cloak_ecto`
- **Library**: [cloak_ecto](https://github.com/danielberkompas/cloak_ecto)
- **Approach**: Transparent encryption at Ecto schema level
- **Pros**:
  - Automatic encryption/decryption
  - Works seamlessly with Ash resources
  - Well-documented
  - Supports key rotation
- **Cons**:
  - All-or-nothing encryption (must encrypt entire field)
  - Performance overhead on reads
- **Effort**: Low
- **Example**:
  ```elixir
  encrypted_field :access_token_encrypted, :binary
  encrypted_field :refresh_token_encrypted, :binary
  ```

#### Option B: Custom encryption module
- **Approach**: Manual encryption in Ash changes
- **Pros**:
  - Full control over when/how encryption happens
  - Can optimize for specific use cases
  - No external dependency
- **Cons**:
  - More code to maintain
  - Security risks if implemented incorrectly
  - Need to handle key rotation manually
- **Effort**: Medium
- **Example**:
  ```elixir
  change fn changeset, _context ->
    case Changeset.get_change(changeset, :access_token) do
      nil -> changeset
      token ->
        encrypted = TokenEncryption.encrypt(token)
        Changeset.put_change(changeset, :access_token_encrypted, encrypted)
    end
  end
  ```

#### Option C: Database-level encryption
- **Approach**: PostgreSQL pgcrypto extension
- **Pros**:
  - Encryption happens at database level
  - No application code changes
  - Very fast
- **Cons**:
  - Harder to rotate keys
  - All apps accessing DB need encryption key
  - Backup/restore complexity
- **Effort**: Low (if supported by infrastructure)

**Research Tasks**:
- [ ] Benchmark `cloak_ecto` performance with large datasets
- [ ] Test `cloak_ecto` integration with Ash resources
- [ ] Research key rotation strategy for `cloak_ecto`
- [ ] Test custom encryption with `:crypto` module
- [ ] Evaluate pgcrypto feasibility
- [ ] Document encryption key management strategy

**Recommendation**: TBD (likely Option A - `cloak_ecto`)

---

### Decision #3: Encryption Key Management

**Question**: Where and how should encryption keys be stored?

**Options**:

#### Option A: Environment variable
- **Approach**: Store key in `ENCRYPTION_KEY` env var
- **Pros**:
  - Simple, standard practice
  - Works with all deployment platforms
  - Easy to rotate (restart app with new key)
- **Cons**:
  - Key visible in process environment
  - Need secure way to inject key
- **Effort**: Low

#### Option B: Secrets manager (Vault, AWS Secrets Manager)
- **Approach**: Fetch key from external secrets service
- **Pros**:
  - Most secure
  - Centralized key management
  - Audit logging
  - Automatic rotation support
- **Cons**:
  - Additional infrastructure dependency
  - Complexity
  - Cost
- **Effort**: Medium-High

#### Option C: Encrypted config file
- **Approach**: Store encrypted key in repo, decrypt at runtime
- **Pros**:
  - Version controlled
  - No external dependencies
- **Cons**:
  - Master key still needs to be stored somewhere
  - Rotation complexity
- **Effort**: Medium

**Research Tasks**:
- [ ] Document key rotation procedure for each option
- [ ] Evaluate deployment platform secrets support (Fly.io, Heroku, AWS)
- [ ] Test key derivation from master secret
- [ ] Document key backup/recovery process

**Recommendation**: Option A for MVP, Option B for production

---

### Decision #4: Token Refresh Strategy

**Question**: How should we handle automatic token refresh?

**Options**:

#### Option A: Oban background job (every 5 minutes)
- **Approach**: Oban worker checks for expiring tokens
- **Pros**:
  - Reliable, persistent jobs
  - Built-in retry logic
  - Already using Oban in project
  - Can schedule per connection
- **Cons**:
  - 5-minute granularity
  - Database polling overhead
- **Effort**: Low
- **Example**:
  ```elixir
  defmodule Integrations.TokenRefreshJob do
    use Oban.Worker, queue: :integrations

    @impl Oban.Worker
    def perform(_job) do
      CalendarConnections.list_expiring_soon(within_minutes: 5)
      |> Enum.each(&refresh_token/1)
      :ok
    end
  end
  ```

#### Option B: GenServer with timers
- **Approach**: GenServer schedules refresh per connection
- **Pros**:
  - More precise timing
  - Lower overhead than polling
  - In-memory state
- **Cons**:
  - Lost on app restart (need to rebuild state)
  - More complex supervision tree
  - Harder to debug
- **Effort**: Medium

#### Option C: Lazy refresh (on-demand)
- **Approach**: Refresh token when API call fails with 401
- **Pros**:
  - No background jobs needed
  - Only refresh when necessary
- **Cons**:
  - First API call after expiration will fail
  - Slower user experience
  - More complex error handling
- **Effort**: Low

**Research Tasks**:
- [ ] Benchmark Oban overhead with 1000+ connections
- [ ] Test GenServer approach with process monitoring
- [ ] Test lazy refresh with retry logic
- [ ] Document failure modes for each approach

**Recommendation**: Option A (Oban) for reliability

---

### Decision #5: OAuth Callback Handling

**Question**: How should OAuth callbacks be handled?

**Options**:

#### Option A: Phoenix Controller
- **Approach**: Standard Phoenix controller for `/auth/google/callback`
- **Pros**:
  - Simple, standard pattern
  - Easy to test
  - Clear separation of concerns
- **Cons**:
  - Need to redirect back to LiveView after callback
  - State management across request/response
- **Effort**: Low
- **Example**:
  ```elixir
  defmodule ClienttCrmAppWeb.AuthController do
    def callback(conn, %{"code" => code, "state" => state}) do
      # Exchange code for tokens
      # Store in database
      # Redirect back to settings page
    end
  end
  ```

#### Option B: LiveView handle_params
- **Approach**: LiveView handles OAuth callback directly
- **Pros**:
  - No redirect needed
  - State stays in LiveView
  - Real-time UI updates
- **Cons**:
  - OAuth callback may not work with LiveView mounting
  - More complex error handling
- **Effort**: Medium

**Research Tasks**:
- [ ] Test OAuth callback in Phoenix controller
- [ ] Test OAuth callback in LiveView
- [ ] Document state parameter validation
- [ ] Test redirect flow after successful OAuth

**Recommendation**: Option A (Controller) for simplicity

---

### Decision #6: PKCE Implementation

**Question**: Should we enforce PKCE (Proof Key for Code Exchange)?

**Background**: PKCE adds security for public clients by preventing authorization code interception.

**Options**:

#### Option A: Enforce PKCE for all OAuth flows
- **Pros**:
  - More secure (especially for mobile/SPA in future)
  - Best practice
  - Required by some providers
- **Cons**:
  - Slightly more complex implementation
  - Need to store `code_verifier` during flow
- **Effort**: Low (if library supports)

#### Option B: Optional PKCE
- **Pros**:
  - Simpler implementation
  - Works with all providers
- **Cons**:
  - Less secure
  - Not future-proof
- **Effort**: Low

**Research Tasks**:
- [ ] Test PKCE implementation with `oauth2` library
- [ ] Verify Google Calendar supports PKCE
- [ ] Verify Microsoft Graph supports PKCE
- [ ] Document `code_verifier` storage strategy (Phoenix.Token?)

**Recommendation**: Option A (Enforce PKCE) for security

---

### Decision #7: Code Verifier Storage (for PKCE)

**Question**: Where should we store the `code_verifier` during OAuth flow?

**Options**:

#### Option A: Phoenix.Token (signed session)
- **Approach**: Store in signed token, pass via `state` parameter
- **Pros**:
  - No database needed
  - Stateless
  - Automatic expiration
- **Cons**:
  - Visible in URL (state parameter)
  - Size limits
- **Effort**: Low

#### Option B: Database table (temporary OAuth states)
- **Approach**: Store in `oauth_states` table, cleanup after callback
- **Pros**:
  - Not visible in URL
  - Can store additional context
  - Audit trail
- **Cons**:
  - Database writes
  - Need cleanup job for expired states
- **Effort**: Medium

#### Option C: Session storage
- **Approach**: Store in Phoenix session
- **Pros**:
  - Simple
  - Built-in expiration
- **Cons**:
  - Session size limits
  - Need session cookie storage
- **Effort**: Low

**Research Tasks**:
- [ ] Test Phoenix.Token with PKCE verifier
- [ ] Test database-backed OAuth state storage
- [ ] Test session storage approach
- [ ] Document cleanup strategy

**Recommendation**: Option A (Phoenix.Token) for simplicity

---

## Implementation Architecture

Based on decisions above, document the full OAuth flow:

```elixir
# 1. User clicks "Connect Google Calendar"
CalendarConnections.start_oauth_flow(company_id, :google)
  |> Generate PKCE code_verifier and code_challenge
  |> Create Phoenix.Token with verifier
  |> Build authorization URL with state=token
  |> Redirect to Google

# 2. Google redirects to /auth/google/callback?code=...&state=...
AuthController.callback(conn, params)
  |> Validate state parameter (Phoenix.Token.verify)
  |> Extract code_verifier from token
  |> Exchange code for tokens (with code_verifier)
  |> Encrypt tokens with cloak_ecto
  |> Store in calendar_connections table
  |> Publish integrations.calendar_connected event
  |> Redirect to settings page with success message

# 3. Background job refreshes tokens before expiration
TokenRefreshJob (runs every 5 min)
  |> Query connections with expiring tokens
  |> For each connection:
    |> Decrypt refresh_token
    |> Call provider token endpoint
    |> Encrypt new access_token
    |> Update connection record
    |> Reset error_count
    |> Publish integrations.token_refreshed event

# 4. Creating calendar events uses encrypted tokens
CalendarBookings.create_booking(params)
  |> Load calendar_connection
  |> Decrypt access_token (audit log)
  |> Call Google Calendar API
  |> Create event
  |> Store external_event_id
  |> Increment connection.use_count
```

**Documentation Tasks**:
- [ ] Create sequence diagrams for OAuth flows
- [ ] Document error handling for each step
- [ ] Document retry strategies
- [ ] Document token revocation flow

---

## Security Checklist

Before implementation, verify:

- [ ] Tokens are encrypted at rest (AES-256)
- [ ] Tokens are never logged in plaintext
- [ ] Tokens are never sent to frontend
- [ ] Token decryption is audit logged
- [ ] State parameter is validated (CSRF protection)
- [ ] PKCE is enforced
- [ ] Token refresh errors trigger alerts
- [ ] Failed token access locks credential after N attempts
- [ ] Encryption keys are rotated quarterly
- [ ] OAuth callback uses HTTPS only
- [ ] Redirect URI is whitelisted at provider

---

## Testing Strategy

### Unit Tests
- [ ] Test OAuth authorization URL generation
- [ ] Test state parameter generation and validation
- [ ] Test PKCE code_verifier/code_challenge generation
- [ ] Test token encryption/decryption
- [ ] Test token refresh logic
- [ ] Test error handling (invalid code, expired token, revoked token)

### Integration Tests
- [ ] Test full OAuth flow with Google (sandbox)
- [ ] Test full OAuth flow with Microsoft (sandbox)
- [ ] Test token refresh with real provider
- [ ] Test token revocation
- [ ] Test concurrent token refresh requests
- [ ] Test OAuth flow cancellation

### Security Tests
- [ ] Test CSRF protection (invalid state parameter)
- [ ] Test token encryption strength
- [ ] Test token never appears in logs
- [ ] Test token never sent to frontend
- [ ] Penetration testing OAuth flows

---

## Performance Considerations

- **Token Refresh Job**: Schedule per connection vs. batch job
- **Encryption Overhead**: Benchmark cloak_ecto performance
- **Database Connections**: Connection pooling for HTTP requests
- **Rate Limiting**: Handle Google/Microsoft API rate limits
- **Circuit Breaker**: After N consecutive failures, pause refresh

**Benchmarking Tasks**:
- [ ] Benchmark token encryption/decryption (target: < 10ms)
- [ ] Benchmark token refresh (target: < 500ms)
- [ ] Load test with 1000+ concurrent OAuth callbacks
- [ ] Load test with 10,000+ connections needing refresh

---

## Deliverables

This investigation should produce:

1. **Architecture Decision Record** (`OAUTH_ARCHITECTURE.md`)
   - Final decisions for all 7 questions
   - Rationale for each decision
   - Tradeoffs considered

2. **Implementation Guide** (`OAUTH_IMPLEMENTATION_GUIDE.md`)
   - Step-by-step implementation instructions
   - Code examples
   - Configuration requirements

3. **Security Audit Document** (`OAUTH_SECURITY_AUDIT.md`)
   - Security checklist results
   - Threat model
   - Mitigation strategies

4. **Testing Plan** (`OAUTH_TESTING_PLAN.md`)
   - Test scenarios
   - Integration test setup
   - Security test procedures

5. **API Integration Specs** (update existing specs)
   - Update `calendar_connection.md` with final decisions
   - Update OAuth feature specs with implementation details

---

## Timeline

**Estimated**: 2-3 weeks
- Week 1: Library research and prototyping
- Week 2: Security research and encryption testing
- Week 3: Documentation and team review

## Success Criteria

This research is successful when:
- [ ] All 7 decisions are made with documented rationale
- [ ] Security audit checklist is complete
- [ ] OAuth flow is prototyped end-to-end
- [ ] Implementation guide is written
- [ ] Team review and approval obtained

## Next Steps

1. Review this README with team
2. Set up OAuth app credentials (Google, Microsoft)
3. Start library research and prototyping
4. Schedule security review midway through
5. Document all decisions in ADR format

---

**Status**: Awaiting Start
**Owner**: TBD
**Start Date**: TBD
**Security Review Date**: TBD
**Final Review Date**: TBD
