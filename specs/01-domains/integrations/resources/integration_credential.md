# Resource: IntegrationCredential

**Domain**: Integrations
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Generic encrypted credential storage for third-party integrations. Provides secure, auditable storage for API keys, OAuth tokens, webhook secrets, and other sensitive integration data. Supports credential rotation, expiration, and access logging.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this credential |
| integration_type | atom | Yes | enum: [:calendar, :chatbot_ai, :webhook, :email, :crm, :custom] | Type of integration |
| integration_name | string | Yes | 1-100 chars | Human-readable integration name |
| credential_key | string | Yes | 1-255 chars | Identifier for this credential |
| credential_value_encrypted | binary | Yes | encrypted | Encrypted credential value |
| credential_type | atom | Yes | enum: [:api_key, :oauth_token, :secret, :password, :certificate] | Credential format |
| expires_at | utc_datetime | No | - | Credential expiration (if applicable) |
| last_used_at | utc_datetime | No | - | Last time credential was accessed |
| use_count | integer | Yes | >= 0 | Number of times credential used |
| status | atom | Yes | enum: [:active, :expired, :revoked, :rotating] | Credential state |
| rotation_policy | map | No | valid JSON | Automatic rotation configuration |
| metadata | map | No | valid JSON | Additional credential context |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |
| revoked_at | utc_datetime | No | - | When credential was revoked |
| revoked_by | uuid | No | valid user | Who revoked the credential |

### Rotation Policy Map

```elixir
%{
  enabled: true,
  rotation_interval_days: 90,
  next_rotation_at: ~U[2025-02-14 00:00:00Z],
  auto_rotate: true,
  notify_before_days: 7,
  notification_emails: ["admin@company.com"]
}
```

### Metadata Map

```elixir
%{
  # OAuth-specific
  refresh_token_encrypted: "...",  # For OAuth credentials
  scope: "calendar.events calendar.readonly",
  provider_user_id: "123456",

  # API key specific
  rate_limit: 10000,  # requests per day
  api_version: "v3",

  # Access controls
  allowed_ip_ranges: ["10.0.0.0/8", "192.168.1.0/24"],
  allowed_environments: ["production", "staging"],

  # Audit
  created_by: "user_uuid",
  purpose: "Google Calendar integration",
  department: "Sales"
}
```

## Business Rules

### Invariants

- credential_value must always be encrypted at rest
- Cannot read credential_value in plaintext (only decrypt for use)
- Expired credentials (expires_at < now) cannot be used
- Revoked credentials cannot be reactivated (must create new)
- credential_key must be unique per (company_id, integration_type)
- use_count increments on each decryption
- Rotation creates new credential, marks old as :rotating then :expired

### Validations

- **integration_type**: Required, must be valid enum
- **integration_name**: Required, 1-100 characters
- **credential_key**: Required, unique per (company_id, integration_type)
- **credential_value_encrypted**: Required, binary format
- **credential_type**: Required, must be valid enum
- **status**: Required, must be valid enum
- **expires_at**: Must be future timestamp if present
- **revoked_by**: Required if status is :revoked

### Calculated Fields

- **is_active**: `status == :active and (expires_at == nil or expires_at > now)`
- **is_expired**: `expires_at != nil and expires_at <= now`
- **is_revoked**: `status == :revoked`
- **days_until_expiration**: `Date.diff(expires_at, Date.utc_today())`
- **needs_rotation**: Check against rotation_policy

## State Transitions

```
active → rotating → expired
  ↓          ↓
  → revoked ←
```

**Valid Transitions**:

- `active → rotating`: When rotation job starts
  - Creates new credential
  - Marks old as :rotating
  - Grace period for transition

- `rotating → expired`: When rotation completes
  - New credential active
  - Old credential expired
  - No longer usable

- `active → revoked`: When manually revoked
  - Sets revoked_at, revoked_by
  - Immediately unusable
  - Audit log entry

- `active → expired`: When expiration date passes
  - Automatic transition
  - Alert sent to admin

**Invalid Transitions**:
- From :expired or :revoked to :active (must create new credential)
- From :expired to :rotating

## Encryption

All credential values encrypted using AES-256:

```elixir
defmodule Integrations.CredentialVault do
  @cipher :aes_256_gcm
  @tag_length 16

  def encrypt(plaintext) do
    key = get_encryption_key()
    iv = :crypto.strong_rand_bytes(16)

    {ciphertext, tag} =
      :crypto.crypto_one_time_aead(@cipher, key, iv, plaintext, "", @tag_length, true)

    # Store: iv + tag + ciphertext
    iv <> tag <> ciphertext
  end

  def decrypt(encrypted_value) when is_binary(encrypted_value) do
    <<iv::binary-16, tag::binary-16, ciphertext::binary>> = encrypted_value
    key = get_encryption_key()

    case :crypto.crypto_one_time_aead(@cipher, key, iv, ciphertext, "", tag, false) do
      :error -> {:error, :decryption_failed}
      plaintext -> {:ok, plaintext}
    end
  end

  defp get_encryption_key do
    # Fetch from environment, use key derivation
    Application.get_env(:clientt_crm_app, :encryption_key)
    |> Base.decode64!()
  end
end
```

## Domain Events

### Published Events

- `integrations.credential_created`: Triggered on create
  - Payload: {credential_id, integration_type, company_id, created_at}
  - Consumers: Audit log, Analytics

- `integrations.credential_used`: Triggered on decryption
  - Payload: {credential_id, used_by, used_at}
  - Consumers: Audit log, Usage analytics

- `integrations.credential_rotated`: Triggered on rotation
  - Payload: {old_credential_id, new_credential_id, rotated_at}
  - Consumers: Audit log, Notification service

- `integrations.credential_revoked`: Triggered on revocation
  - Payload: {credential_id, revoked_by, reason}
  - Consumers: Audit log, Integration cleanup

- `integrations.credential_expired`: Triggered on expiration
  - Payload: {credential_id, expired_at}
  - Consumers: Alert service, Cleanup jobs

## Access Patterns

### Queries

```elixir
# Get active credential for integration
IntegrationCredentials.get_active(company_id, :calendar, "google_oauth")

# List all credentials for company
IntegrationCredentials.list_credentials(company_id)

# List expiring credentials
IntegrationCredentials.list_expiring(within_days: 7)

# List credentials needing rotation
IntegrationCredentials.list_needs_rotation()

# Get credential usage stats
IntegrationCredentials.get_usage_stats(credential_id)
```

### Common Operations

**Create Credential**:
```elixir
IntegrationCredentials.create_credential(%{
  company_id: uuid,
  integration_type: :calendar,
  integration_name: "Google Calendar",
  credential_key: "google_oauth_access_token",
  credential_value: "plaintext_token",  # Will be encrypted
  credential_type: :oauth_token,
  expires_at: DateTime.add(DateTime.utc_now(), 3600, :second),
  rotation_policy: %{
    enabled: true,
    rotation_interval_days: 90,
    auto_rotate: true
  },
  metadata: %{
    scope: "calendar.events",
    provider_user_id: "123456"
  }
})
# Encrypts credential_value
# Publishes: integrations.credential_created
# Returns: {:ok, %IntegrationCredential{}}
```

**Use Credential** (decrypt for API call):
```elixir
IntegrationCredentials.use_credential(credential_id)
# Validates: status == :active, not expired
# Decrypts: credential_value_encrypted
# Increments: use_count
# Sets: last_used_at
# Publishes: integrations.credential_used
# Returns: {:ok, plaintext_value}
```

**Rotate Credential**:
```elixir
IntegrationCredentials.rotate_credential(credential_id, new_value: "new_token")
# Marks old credential as :rotating
# Creates new credential with :active status
# Schedules old credential expiration (grace period)
# Publishes: integrations.credential_rotated
# Returns: {:ok, new_credential, old_credential}
```

**Revoke Credential**:
```elixir
IntegrationCredentials.revoke_credential(credential_id,
  revoked_by: user_id,
  reason: "Security incident"
)
# Sets status: :revoked
# Sets revoked_at, revoked_by
# Publishes: integrations.credential_revoked
# Returns: {:ok, %IntegrationCredential{status: :revoked}}
```

## Credential Rotation Job

Background job for automatic rotation:

```elixir
defmodule Integrations.CredentialRotationJob do
  use Oban.Worker, queue: :integrations

  @impl Oban.Worker
  def perform(_job) do
    IntegrationCredentials.list_needs_rotation()
    |> Enum.each(&rotate_if_supported/1)

    :ok
  end

  defp rotate_if_supported(credential) do
    case credential.integration_type do
      :calendar ->
        # Refresh OAuth token
        refresh_calendar_token(credential)

      :api_key ->
        # Generate new API key (if provider supports)
        regenerate_api_key(credential)

      _ ->
        # Send notification for manual rotation
        notify_admin_rotation_needed(credential)
    end
  end
end
```

## Security Considerations

1. **Encryption at Rest**: All credentials encrypted with AES-256-GCM
2. **Key Management**: Encryption key stored in environment, rotated quarterly
3. **Access Logging**: Every decryption logged with user and timestamp
4. **Least Privilege**: Only decrypt when needed for API calls
5. **No Plaintext Logs**: Never log decrypted values
6. **Secure Deletion**: Securely wipe memory after use
7. **Audit Trail**: Complete history of credential lifecycle
8. **Rate Limiting**: Limit decryption attempts to prevent brute force

## Audit Logging

Every credential operation logged:

```elixir
defmodule Integrations.CredentialAuditLog do
  def log_access(credential_id, action, user_id, metadata \\ %{}) do
    AuditLog.create(%{
      resource_type: "IntegrationCredential",
      resource_id: credential_id,
      action: action,  # :created, :accessed, :rotated, :revoked
      actor_id: user_id,
      metadata: metadata,
      timestamp: DateTime.utc_now()
    })
  end
end
```

## Performance Considerations

- **Encryption/Decryption**: Use NIF-based crypto for performance
- **Caching**: Never cache decrypted values
- **Indexing**: Index on `(company_id, integration_type, status)`
- **Cleanup**: Background job to purge old revoked credentials

## Testing Scenarios

### Unit Tests
- [ ] Create credential encrypts value
- [ ] Cannot read credential in plaintext
- [ ] use_credential increments use_count
- [ ] Expired credentials cannot be used
- [ ] Revoked credentials cannot be used
- [ ] Credential key uniqueness per company/type

### Integration Tests
- [ ] Rotation creates new credential
- [ ] Rotation job runs automatically
- [ ] Audit log records all accesses
- [ ] Expiration notification sent
- [ ] Revocation immediately disables use

---

**Related Resources**:
- [CalendarConnection](./calendar_connection.md) - Uses credentials for OAuth

**Related Features**:
- [Integration Security Policy](../policies/integration_security.md)
- [Token Management Policy](../policies/token_management.md)
