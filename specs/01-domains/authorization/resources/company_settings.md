# Resource: CompanySettings

**Domain**: Authorization
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

Stores company-specific configuration, feature flags, branding, and operational limits. Provides per-company customization of the CRM experience and enforces usage constraints.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid Company id | Company these settings belong to (1:1) |
| max_users | integer | No | >= 1 if set | Maximum users allowed (null = unlimited) |
| max_teams | integer | No | >= 1 if set | Maximum teams allowed (null = unlimited) |
| features | map | Yes | valid JSON | Feature flags (e.g., {"advanced_reports": true}) |
| branding | map | Yes | valid JSON | Branding config (logo_url, colors) |
| timezone | string | No | valid timezone | Company timezone (e.g., "America/New_York") |
| created_at | utc_datetime_usec | Yes | - | Creation timestamp |
| updated_at | utc_datetime_usec | Yes | - | Last update timestamp |

## Business Rules

### Invariants
- One settings record per company (1:1 relationship)
- If max_users is set, cannot invite users beyond limit
- Features and branding must be valid JSON maps

### Validations
- **max_users**: If provided, must be >= 1
- **max_teams**: If provided, must be >= 1
- **features**: Must be a valid map
- **branding**: Must be a valid map
- **timezone**: If provided, must be valid IANA timezone

### Calculated Fields
- **current_users_count**: Count of active authz_users for company
- **current_teams_count**: Count of active teams for company
- **users_remaining**: max_users - current_users_count (if max_users set)
- **has_feature**: Function to check if specific feature is enabled

### Default Values
```elixir
features: %{}
branding: %{
  logo_url: nil,
  primary_color: "#3B82F6",    # Blue
  secondary_color: "#10B981"   # Green
}
```

## Relationships

- **Belongs to**: Company via company_id (1:1)

## Domain Events

### Published Events
- `authorization.settings_updated`: Triggered when settings change
  - Payload: {company_id, setting_key, old_value, new_value, updated_by}
  - Consumers: Feature Flag Service, Analytics

- `authorization.feature_toggled`: Triggered when feature flag changes
  - Payload: {company_id, feature_name, enabled, toggled_by}
  - Consumers: Feature Flag Service, Cache Invalidation

### Subscribed Events
- `billing.subscription_changed`: Updates max_users based on plan
  - Payload: {company_id, plan, max_users}
  - Action: Update max_users limit

## Access Patterns

### Queries
- Get settings for current company
- Check if company has specific feature enabled
- Get companies with specific feature enabled

### Common Operations
- **Create**: Automatically created when company is created
  - Uses default values
  - No manual creation needed

- **Read**: Available to all company members

- **Update**: Modify settings
  - Restricted to admins
  - Individual fields can be updated
  - Records audit log entry for each change

- **Update Features**: Toggle feature flags
  - Restricted to admins
  - Updates features map
  - Records audit log entry

- **Update Branding**: Customize company appearance
  - Restricted to admins
  - Updates branding map
  - Records audit log entry

## Ash Resource Implementation Notes

### Actions
```elixir
create :create do
  accept [:company_id, :max_users, :max_teams, :timezone]
  change set_attribute(:features, %{})
  change set_attribute(:branding, %{
    logo_url: nil,
    primary_color: "#3B82F6",
    secondary_color: "#10B981"
  })
end

read :read
read :for_company do
  argument :company_id, :uuid, allow_nil?: false
  filter expr(company_id == ^arg(:company_id))
end

update :update do
  accept [:max_users, :max_teams, :timezone]
  validate positive_limits()
  change CreateAuditLog
end

update :toggle_feature do
  argument :feature_name, :string, allow_nil?: false
  argument :enabled, :boolean, allow_nil?: false

  change ToggleFeatureFlag
  change PublishFeatureToggledEvent
  change CreateAuditLog
end

update :update_branding do
  accept [:branding]
  validate valid_branding()
  change CreateAuditLog
end
```

### Policies
```elixir
policies do
  # All company members can read settings
  policy action_type(:read) do
    authorize_if expr(company_id == ^actor(:current_company_id))
  end

  # Only admins can update settings
  policy action_type(:update) do
    authorize_if AuthzUserIsAdmin
  end
end
```

### Calculations
```elixir
calculate :current_users_count, :integer do
  calculation load(company: :active_users_count) do
    company.active_users_count
  end
end

calculate :current_teams_count, :integer do
  calculation load(company: :teams_count) do
    company.teams_count
  end
end

calculate :users_remaining, :integer do
  calculation fn records, _ ->
    Enum.map(records, fn record ->
      if record.max_users do
        max(0, record.max_users - (record.current_users_count || 0))
      else
        nil  # Unlimited
      end
    end)
  end
end

calculate :has_capacity_for_users, :boolean do
  calculation fn records, _ ->
    Enum.map(records, fn record ->
      if record.max_users do
        (record.current_users_count || 0) < record.max_users
      else
        true  # Unlimited
      end
    end)
  end
end
```

### Validations
```elixir
validate present(:company_id)
validate numericality(:max_users, greater_than_or_equal_to: 1)
validate numericality(:max_teams, greater_than_or_equal_to: 1)
validate timezone_valid()
```

## Multi-Tenancy

**Tenant-Scoped**: YES
- Automatically filtered by company_id
- Each company has exactly one settings record

## Feature Flags

### Standard Features (v1)
```elixir
%{
  "advanced_reports" => false,
  "api_access" => false,
  "custom_fields" => false,
  "export_data" => true,
  "team_management" => true,
  "audit_logs" => false
}
```

### Future Features (Phase 2+)
```elixir
%{
  "custom_roles" => false,
  "sso" => false,
  "webhooks" => false,
  "api_rate_limit_high" => false
}
```

## Branding Configuration

### Branding Map Structure
```elixir
%{
  "logo_url" => "https://cdn.example.com/logos/company.png",
  "primary_color" => "#3B82F6",    # Hex color code
  "secondary_color" => "#10B981",  # Hex color code
  "favicon_url" => "https://cdn.example.com/favicons/company.ico"
}
```

## Usage Limits Enforcement

### max_users Enforcement
When an invitation is created or accepted:
1. Check `current_users_count` against `max_users`
2. If limit reached, reject with error: "User limit reached ({current}/{max})"
3. Suggest upgrade or removal of inactive users

### max_teams Enforcement
When a team is created:
1. Check `current_teams_count` against `max_teams`
2. If limit reached, reject with error: "Team limit reached ({current}/{max})"
3. Suggest upgrade or archiving unused teams

## Security Considerations

- Only admins can modify settings
- Feature flags cannot be bypassed
- Usage limits enforced at action level (cannot be circumvented)
- Audit all settings changes

## Testing Checklist

- [ ] Settings created automatically with company
- [ ] Default values set correctly
- [ ] Only admins can update settings
- [ ] All company members can read settings
- [ ] Can update max_users and max_teams
- [ ] max_users limit enforced on invitation
- [ ] max_teams limit enforced on team creation
- [ ] Can toggle feature flags
- [ ] Can update branding
- [ ] current_users_count calculation accurate
- [ ] current_teams_count calculation accurate
- [ ] users_remaining calculation accurate
- [ ] Queries filtered by company_id
- [ ] Audit logs created for all updates
