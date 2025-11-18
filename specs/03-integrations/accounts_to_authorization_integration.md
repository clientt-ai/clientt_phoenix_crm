# Integration: Accounts to Authorization

**Type**: data-reference + event-driven
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

The Authorization domain references AuthnUser from the Accounts domain to link authentication identity with company-scoped authorization identities. This integration enables users to have a single login (authn_user) while maintaining separate authorization contexts (authz_users) for each company they belong to.

## Integration Pattern

**Pattern**: Foreign Key Reference + Event Subscription
- Authorization domain consumes Accounts.AuthnUser as a read-only reference
- Authorization domain subscribes to user lifecycle events
- No circular dependencies (one-way relationship)

## Domain Responsibilities

### Accounts Domain (Source)
**Responsibilities**:
- Manage authentication (login, password, sessions)
- Manage user profile (email, confirmed status)
- Publish user lifecycle events

**Provides**:
- AuthnUser identity
- Email address
- Account status (confirmed, locked)

### Authorization Domain (Target)
**Responsibilities**:
- Manage authorization (roles, permissions, company membership)
- Link authn_user to companies via authz_users
- Enforce multi-tenancy and access control

**Consumes**:
- User ID (authn_user_id)
- Email (via relationship loading)
- User lifecycle events

---

## Data Contract

### Reference: AuthzUser → AuthnUser

**Foreign Key**:
```sql
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_authn_user
  FOREIGN KEY (authn_user_id)
  REFERENCES authn_users(id)
  ON DELETE CASCADE;
```

**Relationship in Ash**:
```elixir
# In AuthzUser resource
relationships do
  belongs_to :authn_user, ClienttCrmApp.Accounts.AuthnUser do
    source_attribute :authn_user_id
    destination_attribute :id
    allow_nil? false
  end
end
```

**Cardinality**: Many-to-One
- Many authz_users (one per company) → One authn_user

---

## ACL (Anti-Corruption Layer)

The Authorization domain translates Accounts concepts into its own domain language:

| Accounts Field           | Authorization Field | Transform              | Notes                          |
|--------------------------|---------------------|------------------------|--------------------------------|
| authn_users.id           | authz_users.authn_user_id | direct reference   | Immutable after creation       |
| authn_users.email        | (calculated)        | loaded via relationship| Read-only, displayed to users  |
| authn_users.confirmed_at | (not used)          | -                      | May use for eligibility checks |
| authn_users.locked_at    | (not used)          | -                      | Future: prevent company access |

### Terminology Translation

| Accounts Term      | Authorization Term  | Mapping                                    |
|--------------------|---------------------|---------------------------------------------|
| AuthnUser          | authn_user          | Authentication identity (who you are)       |
| -                  | authz_user          | Authorization identity (what you can do)    |
| Email              | Email               | Same concept (loaded from authn_user)       |
| Login              | -                   | Handled by Accounts only                    |
| Role (future?)     | role                | Different: Accounts may have platform roles |

---

## Event Contract

### Subscribed Events

#### Event: `accounts.user_created`

**When**: New user completes registration
**Payload**:
```json
{
  "event_type": "accounts.user_created",
  "occurred_at": "2025-01-15T10:30:00Z",
  "aggregate_id": "user-uuid",
  "data": {
    "user_id": "user-uuid",
    "email": "user@example.com",
    "confirmed_at": "2025-01-15T10:30:00Z"
  }
}
```

**Authorization Handler**:
```elixir
defmodule ClienttCrmApp.Authorization.Handlers.UserCreatedHandler do
  def handle(%{data: %{user_id: user_id, email: email}}) do
    # Phase 1: Auto-create first company for new users on first login
    # This improves onboarding UX by getting users into the app faster

    company_name = generate_default_company_name(email)
    company_slug = generate_slug(email)

    Company.create(%{
      name: company_name,
      slug: company_slug,
      first_admin_authn_user_id: user_id
    })

    :ok
  end

  defp generate_default_company_name(email) do
    # Extract name from email or prompt user
    # Example: "alice@example.com" → "Alice's Company"
    name = email |> String.split("@") |> List.first() |> String.capitalize()
    "#{name}'s Company"
  end

  defp generate_slug(email) do
    # Generate URL-safe slug from email
    email
    |> String.split("@")
    |> List.first()
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9]+/, "-")
  end
end
```

**Action**:
- **Phase 1**: Auto-create first company for new users on registration/first login
- Company name: Generated from email (e.g., "Alice's Company") or user can customize
- User becomes admin of their first company automatically

---

#### Event: `accounts.user_deleted`

**When**: User account is permanently deleted
**Payload**:
```json
{
  "event_type": "accounts.user_deleted",
  "occurred_at": "2025-01-15T11:00:00Z",
  "aggregate_id": "user-uuid",
  "data": {
    "user_id": "user-uuid",
    "email": "user@example.com",
    "deleted_by": "admin-uuid"
  }
}
```

**Authorization Handler**:
```elixir
defmodule ClienttCrmApp.Authorization.Handlers.UserDeletedHandler do
  def handle(%{data: %{user_id: user_id}}) do
    # Foreign key CASCADE handles deletion of authz_users
    # But may want to audit or notify companies

    # Find all companies the user belonged to
    companies = get_user_companies(user_id)

    # Send notifications to company admins
    Enum.each(companies, fn company ->
      notify_company_admins(company, "User #{email} has deleted their account")
    end)

    :ok
  end
end
```

**Action**:
- Foreign key CASCADE automatically deletes all authz_users for that authn_user
- Optional: Notify company admins of user account deletion

---

#### Event: `accounts.user_email_changed`

**When**: User changes their email address
**Payload**:
```json
{
  "event_type": "accounts.user_email_changed",
  "occurred_at": "2025-01-15T12:00:00Z",
  "aggregate_id": "user-uuid",
  "data": {
    "user_id": "user-uuid",
    "old_email": "old@example.com",
    "new_email": "new@example.com"
  }
}
```

**Authorization Handler**:
```elixir
defmodule ClienttCrmApp.Authorization.Handlers.UserEmailChangedHandler do
  def handle(%{data: %{user_id: user_id, old_email: old, new_email: new}}) do
    # No action needed in Authorization domain
    # Email is loaded via relationship, so will automatically reflect new value

    # Optional: Update audit logs or notifications
    :ok
  end
end
```

**Action**:
- No action needed (email loaded dynamically via relationship)
- Optional: Record in audit log for compliance

---

### Published Events

The Authorization domain does NOT publish events back to Accounts. The relationship is one-way.

---

## Query Patterns

### Loading Email from AuthzUser

**Ash Query**:
```elixir
AuthzUser
|> Ash.Query.for_read(:list)
|> Ash.Query.load(:authn_user)
|> Ash.read!()
```

**Result**:
```elixir
[
  %AuthzUser{
    id: "authz-uuid",
    authn_user_id: "user-uuid",
    tenant_id: "company-uuid",
    role: :admin,
    authn_user: %AuthnUser{
      id: "user-uuid",
      email: "user@example.com"
    }
  }
]
```

**Calculated Attribute** (Recommended):
```elixir
# In AuthzUser resource
calculate :email, :string do
  calculation fn records, _context ->
    # Batch load authn_users
    authn_user_ids = Enum.map(records, & &1.authn_user_id)
    authn_users = Accounts.AuthnUser.get_by_ids(authn_user_ids)
    authn_user_map = Map.new(authn_users, &{&1.id, &1})

    Enum.map(records, fn authz_user ->
      authn_user_map[authz_user.authn_user_id].email
    end)
  end
end
```

---

### Finding AuthzUsers for a Given User

**Query**:
```elixir
# Find all companies for user "alice@example.com"
authn_user = Accounts.AuthnUser.get_by_email!("alice@example.com")

authz_users =
  AuthzUser
  |> Ash.Query.filter(authn_user_id: ^authn_user.id)
  |> Ash.Query.load(:company)
  |> Ash.read!()

companies = Enum.map(authz_users, & &1.company)
```

---

## Error Handling

### Error: Invalid authn_user_id on AuthzUser Creation
**Scenario**: Attempting to create authz_user with non-existent authn_user_id
**Response**: Foreign key constraint violation
**HTTP Status**: 422 Unprocessable Entity
**Error Message**: "Invalid user reference"

**Example**:
```elixir
AuthzUser.create(%{
  authn_user_id: "non-existent-uuid",
  tenant_id: "valid-company-uuid",
  role: :user
})

# Result:
{:error, %Ash.Error.Invalid{
  errors: [
    %{field: :authn_user_id, message: "Invalid user reference"}
  ]
}}
```

---

### Error: User Account Deleted While Active Session
**Scenario**: User's authn_user is deleted while they have active authz_user sessions
**Response**: Cascade delete removes all authz_users, sessions invalidated
**Action**: Redirect to login page with message "Account no longer exists"

---

## Idempotency

### AuthzUser Creation
**Constraint**: Unique (authn_user_id, tenant_id)
```sql
ALTER TABLE authz_users
  ADD CONSTRAINT authz_users_unique_user_company
  UNIQUE (authn_user_id, tenant_id);
```

**Behavior**: Attempting to create duplicate authz_user for same (user, company) fails
**Error**: "User already a member of this company"

---

## Migration Considerations

### Existing Users → Multi-Tenant System

**Migration Strategy**:
1. Create default company for each existing authn_user
2. Create authz_user linking user to their default company (role: admin)
3. Associate all existing user data with default company

**Migration Script** (pseudo-code):
```elixir
for user <- Accounts.AuthnUser.list_all!() do
  # Create default company
  company = Authorization.Company.create!(%{
    name: "#{user.email}'s Organization",
    slug: generate_slug(user.email),
    first_admin_authn_user_id: user.id
  })

  # AuthzUser automatically created by Company.create
  # with first_admin_authn_user_id
end
```

---

## Security Considerations

### No Circular Dependencies
- Authorization depends on Accounts (one-way)
- Accounts has NO knowledge of Authorization domain
- Prevents circular imports and complexity

### Data Isolation
- Authorization cannot modify authn_user data
- Email changes in Accounts automatically reflected in Authorization
- No data duplication (email not stored in authz_users)

### Cascade Deletion
- When authn_user deleted → all authz_users deleted
- Prevents orphaned authorization records
- Companies remain (may have other members)

---

## Testing Requirements

### Integration Tests
- [ ] Can create authz_user with valid authn_user_id
- [ ] Cannot create authz_user with invalid authn_user_id
- [ ] Email loaded correctly from authn_user relationship
- [ ] Cascade delete removes authz_users when authn_user deleted
- [ ] Cannot create duplicate authz_user for same (user, company)
- [ ] User can belong to multiple companies (multiple authz_users)

### Event Handler Tests
- [ ] user_created event handled (no action in v1)
- [ ] user_deleted event handled (cascade + notifications)
- [ ] user_email_changed event handled (no action needed)

---

## Performance Considerations

- **Email loading**: Use batch loading or calculated attributes to avoid N+1
- **Foreign key lookups**: Indexed (authn_user_id on authz_users)
- **Cascade deletion**: May be slow with many authz_users, consider async

---

## Related Specifications

- Resource: [authz_user.md](../specs/01-domains/authorization/resources/authz_user.md)
- Resource: [company.md](../specs/01-domains/authorization/resources/company.md)
- Domain: [accounts](../specs/01-domains/accounts/) (if exists)

---

## Future Enhancements

### FE-1: User Eligibility Checks
- Check if authn_user email is confirmed before allowing authz_user creation
- Require verified email for invitations

### FE-2: User Account Locking
- If authn_user is locked, prevent access to all companies
- Synchronize lock status across domains

### FE-3: SSO Integration
- Link authn_user to external identity providers
- Map external roles to company roles
