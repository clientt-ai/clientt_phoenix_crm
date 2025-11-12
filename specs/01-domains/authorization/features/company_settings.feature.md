# Feature: Company Settings

**Domain**: Authorization
**Priority**: medium
**Status**: approved
**Last Updated**: 2025-11-11

As a company admin
I want to configure company-specific settings
So that I can customize the CRM for my organization's needs

## Acceptance Criteria
- [ ] Admins can update company settings
- [ ] Admins can toggle feature flags
- [ ] User limits are enforced automatically
- [ ] Team limits are enforced automatically
- [ ] Settings are scoped per company
- [ ] All setting changes are audited

## Related Specifications
- Resource: [company_settings.md](../resources/company_settings.md)
- Resource: [company.md](../resources/company.md)
- Policy: [role_based_access.md](../policies/role_based_access.md)

---

## Scenarios

### Scenario: Admin updates general company settings
**Tags**: `@happy-path @domain:authorization @priority:medium @settings`

```gherkin
Given I am an admin of "Acme Corp"
And the current settings are:
  | field     | value |
  | timezone  | UTC   |
  | max_users | null  |
  | max_teams | null  |
When I update the settings to:
  | field     | value             |
  | timezone  | America/New_York  |
  | max_users | 50                |
  | max_teams | 20                |
Then the CompanySettings record is updated
And an audit log entry records:
  | field   | value                                                           |
  | action  | CompanySettingsUpdated                                          |
  | changes | {"timezone": {"from": "UTC", "to": "America/New_York"}, ...}    |
And a "settings_updated" event is published
```

---

### Scenario: Enable feature flag
**Tags**: `@happy-path @domain:authorization @feature-flags`

```gherkin
Given I am an admin of "Acme Corp"
And the feature "advanced_reports" is currently disabled
And the features map is:
  | feature          | enabled |
  | advanced_reports | false   |
  | api_access       | true    |
When I enable the "advanced_reports" feature
Then the features map is updated to:
  | feature          | enabled |
  | advanced_reports | true    |
  | api_access       | true    |
And all company members can now access advanced reports
And an audit log entry records "FeatureToggled"
And a "settings_updated" event is published with:
  | field            | value                                        |
  | setting_key      | features.advanced_reports                    |
  | old_value        | false                                        |
  | new_value        | true                                         |
```

---

### Scenario: Disable feature flag
**Tags**: `@happy-path @domain:authorization @feature-flags`

```gherkin
Given feature "api_access" is enabled for "Acme Corp"
When an admin disables "api_access"
Then the feature flag is set to false
And company members lose access to API
And an audit log entry records the change
```

---

### Scenario: Update branding settings
**Tags**: `@happy-path @domain:authorization @branding`

```gherkin
Given I am an admin of "Acme Corp"
When I update branding settings:
  | field          | value                        |
  | logo_url       | https://cdn.acme.com/logo.png|
  | primary_color  | #0066CC                      |
  | secondary_color| #FF6600                      |
Then the branding map is updated
And the company UI reflects the new branding
And an audit log entry records "CompanySettingsUpdated"
```

---

### Scenario: Non-admin attempts to update settings
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to update company settings
Then the action is rejected with error "Unauthorized: admin role required"
And no settings are changed
```

---

### Scenario: Manager attempts to update settings
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a manager (role: manager) of "Acme Corp"
When I attempt to update company settings
Then the action is rejected with error "Unauthorized: admin role required"
And no settings are changed
```

---

### Scenario: All company members can read settings
**Tags**: `@happy-path @domain:authorization @settings-read`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I view company settings
Then I can see all settings:
  | category | fields                           |
  | General  | timezone, max_users, max_teams   |
  | Features | all feature flags                |
  | Branding | logo_url, colors                 |
But I cannot modify any settings (read-only)
```

---

### Scenario: Enforce user limit when inviting
**Tags**: `@happy-path @domain:authorization @limits @user-limit`

```gherkin
Given "Acme Corp" has max_users set to 10
And there are currently 10 active authz_users
When an admin attempts to invite an 11th user
Then the invitation is rejected with error "User limit reached (10/10)"
And the admin sees a message:
  """
  You've reached your user limit.
  Options:
  - Remove inactive users
  - Upgrade your plan to increase limit
  """
And no invitation is created
```

---

### Scenario: User limit does not count inactive users
**Tags**: `@happy-path @domain:authorization @limits`

```gherkin
Given "Acme Corp" has max_users: 10
And there are 8 active authz_users
And there are 5 inactive authz_users
When an admin invites 2 new users
Then both invitations succeed
And the active user count is now 10
```

---

### Scenario: Set user limit below current user count
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given "Acme Corp" has 15 active authz_users
When an admin attempts to set max_users to 10
Then the update fails with error "Cannot set limit below current active user count (15)"
And the setting remains unchanged
And admin sees suggestion "Remove 5 users first, or set limit to at least 15"
```

---

### Scenario: Remove user limit (set to unlimited)
**Tags**: `@happy-path @domain:authorization @limits`

```gherkin
Given "Acme Corp" has max_users: 50
When an admin sets max_users to null
Then the user limit is removed
And the company can invite unlimited users
And an audit log entry records the change
```

---

### Scenario: Enforce team limit when creating team
**Tags**: `@happy-path @domain:authorization @limits @team-limit`

```gherkin
Given "Acme Corp" has max_teams set to 5
And there are currently 5 active teams
When an admin attempts to create a 6th team
Then the creation is rejected with error "Team limit reached (5/5)"
And the admin sees upgrade options
And no team is created
```

---

### Scenario: Team limit does not count archived teams
**Tags**: `@happy-path @domain:authorization @limits`

```gherkin
Given "Acme Corp" has max_teams: 5
And there are 3 active teams
And there are 2 archived teams
When an admin creates 2 new teams
Then both teams are created successfully
And the active team count is now 5
```

---

### Scenario: Validate feature flag against allowed features
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given I am an admin of "Acme Corp"
When I attempt to enable feature "invalid_feature_name"
Then the update fails with error "Unknown feature flag: invalid_feature_name"
And valid feature flags are listed:
  | feature          | description              |
  | advanced_reports | Advanced reporting tools |
  | api_access       | REST API access          |
  | custom_fields    | Custom field support     |
```

---

### Scenario: Settings are company-scoped
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given I am an admin of both "Acme Corp" and "Beta Inc"
And "Acme Corp" has timezone "America/New_York"
And "Beta Inc" has timezone "Europe/London"
When I update "Acme Corp" timezone to "America/Los_Angeles"
Then "Acme Corp" timezone is "America/Los_Angeles"
And "Beta Inc" timezone remains "Europe/London"
And settings do not leak between companies
```

---

## Scenario Outline: Timezone validation
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am an admin of "Acme Corp"
When I attempt to set timezone to "<timezone>"
Then the result is "<result>"
And the error is "<error>" if failed

Examples:
| timezone           | result  | error                        |
| UTC                | success |                              |
| America/New_York   | success |                              |
| Europe/London      | success |                              |
| Asia/Tokyo         | success |                              |
| Invalid/Timezone   | failure | Invalid timezone             |
|                    | failure | Timezone is required         |
| EST                | success | (valid IANA timezone)        |
```

---

## Scenario Outline: Limit validation
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am an admin of "Acme Corp"
And there are <current> active <resource_type>
When I attempt to set max_<resource_type> to <limit>
Then the result is "<result>"
And the error is "<error>" if failed

Examples:
| resource_type | current | limit | result  | error                                      |
| users         | 5       | 10    | success |                                            |
| users         | 5       | null  | success | (unlimited)                                |
| users         | 10      | 5     | failure | Cannot set below current count (10)        |
| users         | 5       | 0     | failure | Limit must be positive or null             |
| users         | 5       | -1    | failure | Limit must be positive or null             |
| teams         | 3       | 10    | success |                                            |
| teams         | 8       | 5     | failure | Cannot set below current count (8)         |
```

---

## Edge Cases

### EC-1: Concurrent setting updates
**Scenario:** Two admins update settings simultaneously
**Expected:** Last write wins, both changes audited
**Test:** Concurrent updates to different settings

### EC-2: Feature flag dependencies
**Scenario:** Some features may depend on others
**Expected:** Warning shown if disabling a dependency
**Test:** Disable base feature when dependent features are active

### EC-3: Branding validation
**Scenario:** Logo URL and colors must be valid formats
**Expected:** URL validation, color hex validation
**Test:** Invalid URLs and color codes

---

## Performance Considerations

- Settings read: < 50ms (cached)
- Settings update: < 100ms
- Feature flag toggle: < 50ms

---

## Future Enhancements

### FE-1: Setting Templates
- Predefined setting bundles (Startup, Enterprise, etc.)
- One-click configuration

### FE-2: Setting Permissions
- Allow managers to update specific settings
- Granular permissions per setting category

### FE-3: Setting Validation Rules
- Custom validation rules per company
- Business rules engine

---

## Related Features
- [user_management.feature.md](./user_management.feature.md) - User limit enforcement
- [team_management.feature.md](./team_management.feature.md) - Team limit enforcement
- [audit_logging.feature.md](./audit_logging.feature.md) - Settings change tracking
