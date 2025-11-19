# Feature: Audit Logging

**Domain**: Authorization
**Priority**: high
**Status**: approved
**Last Updated**: 2025-11-11

As a compliance officer or company admin
I want a complete, immutable audit trail of all authorization changes
So that I can track who did what and when for security and compliance

## Acceptance Criteria
- [ ] All authorization changes automatically logged
- [ ] Audit logs are immutable (cannot be edited or deleted)
- [ ] Admins can view and filter audit logs
- [ ] Audit logs include actor, action, resource, changes, and metadata
- [ ] Logs retained for minimum 2 years
- [ ] Export capability for compliance reporting

## Related Specifications
- Resource: [audit_log.md](../resources/audit_log.md)
- All other resources (all changes audited)

---

## Scenarios

### Scenario: Automatic logging of user addition
**Tags**: `@happy-path @domain:authorization @priority:high @audit`

```gherkin
Given I am an admin of "Acme Corp"
When I invite "newuser@example.com" and they accept
Then an audit log entry is created with:
  | field                 | value                        |
  | tenant_id            | [Acme Corp id]               |
  | actor_authz_user_id   | [my authz_user id]           |
  | action                | user_added                   |
  | resource_type         | AuthzUser                    |
  | resource_id           | [new authz_user id]          |
  | changes               | {"status": "added", ...}     |
  | metadata.ip_address   | [my IP]                      |
  | metadata.user_agent   | [my browser]                 |
  | created_at            | [timestamp]                  |
And the log entry is immutable
```

---

### Scenario: Automatic logging of role change
**Tags**: `@happy-path @domain:authorization @audit`

```gherkin
Given "user@acme.com" has role "user"
And I am an admin
When I change their role to "manager"
Then an audit log entry is created with:
  | field          | value                                             |
  | action         | role_changed                                      |
  | resource_type  | AuthzUser                                         |
  | resource_id    | [user's authz_user id]                            |
  | changes        | {"role": {"from": "user", "to": "manager"}}       |
  | actor_authz_user_id | [my authz_user id]                           |
And the old role "user" is recorded
And the new role "manager" is recorded
```

---

### Scenario: Automatic logging of team assignment
**Tags**: `@happy-path @domain:authorization @audit`

```gherkin
Given "bob@acme.com" has no team
When an admin assigns Bob to "Engineering" team
Then an audit log entry is created with:
  | field   | value                                                          |
  | action  | team_member_added                                              |
  | changes | {"team_id": {"from": null, "to": "[Engineering id]"}, ...}     |
```

---

### Scenario: Automatic logging of company archival
**Tags**: `@happy-path @domain:authorization @audit`

```gherkin
Given I am an admin of "Acme Corp"
When I archive the company
Then an audit log entry is created with:
  | field          | value                                      |
  | action         | company_archived                           |
  | resource_type  | Company                                    |
  | resource_id    | [Acme Corp id]                             |
  | changes        | {"status": {"from": "active", "to": "archived"}} |
```

---

### Scenario: Automatic logging of invitation sent
**Tags**: `@happy-path @domain:authorization @audit`

```gherkin
Given I am an admin of "Acme Corp"
When I invite "newuser@example.com" with role "user"
Then an audit log entry is created with:
  | field          | value                                |
  | action         | invitation_sent                      |
  | resource_type  | Invitation                           |
  | resource_id    | [invitation id]                      |
  | changes        | {"email": "newuser@example.com", "role": "user"} |
  | metadata       | {"invited_email": "newuser@example.com"} |
```

---

### Scenario: Automatic logging of settings update
**Tags**: `@happy-path @domain:authorization @audit`

```gherkin
Given I am an admin of "Acme Corp"
When I update max_users from null to 50
Then an audit log entry is created with:
  | field   | value                                             |
  | action  | company_settings_updated                          |
  | changes | {"max_users": {"from": null, "to": 50}}           |
```

---

### Scenario: System actions logged without actor
**Tags**: `@happy-path @domain:authorization @audit @system`

```gherkin
Given an invitation was created 8 days ago
When the system expires the invitation automatically
Then an audit log entry is created with:
  | field                 | value                              |
  | actor_authz_user_id   | null (system action)               |
  | action                | invitation_expired                 |
  | metadata.triggered_by | scheduled_job                      |
```

---

### Scenario: Admin views audit log
**Tags**: `@happy-path @domain:authorization @audit-viewing`

```gherkin
Given I am an admin of "Acme Corp"
And there are 50 audit log entries for "Acme Corp"
When I view the audit log page
Then I see all authorization changes for "Acme Corp" only
And each entry displays:
  | field         | description                        |
  | timestamp     | when the change occurred           |
  | actor         | who made the change (email)        |
  | action        | what action (user_added, etc.)     |
  | resource      | what was changed (AuthzUser, etc.) |
  | changes       | before → after values              |
And entries are sorted by timestamp (newest first)
And I can paginate through entries
```

---

### Scenario: Filter audit log by date range
**Tags**: `@happy-path @domain:authorization @audit-filtering`

```gherkin
Given I am an admin viewing the audit log
When I filter by date range "2025-01-01" to "2025-01-31"
Then I see only entries created within that range
And the count shows "X entries in January 2025"
```

---

### Scenario: Filter audit log by action type
**Tags**: `@happy-path @domain:authorization @audit-filtering`

```gherkin
Given I am an admin viewing the audit log
When I filter by action type "role_changed"
Then I see only role change entries
And I can see all role promotions and demotions
```

---

### Scenario: Filter audit log by actor
**Tags**: `@happy-path @domain:authorization @audit-filtering`

```gherkin
Given I am an admin viewing the audit log
And there are actions performed by multiple admins
When I filter by actor "admin@acme.com"
Then I see only entries where actor_authz_user_id belongs to that admin
And system actions (actor_id: null) are excluded
```

---

### Scenario: Filter audit log by resource type
**Tags**: `@happy-path @domain:authorization @audit-filtering`

```gherkin
Given I am an admin viewing the audit log
When I filter by resource_type "AuthzUser"
Then I see only entries related to user changes
And entries for teams, settings, etc. are excluded
```

---

### Scenario: Export audit log as CSV
**Tags**: `@happy-path @domain:authorization @audit-export`

```gherkin
Given I am an admin viewing filtered audit log (20 entries)
When I click "Export as CSV"
Then a CSV file is downloaded with all 20 entries
And the CSV includes columns:
  | column        | description                 |
  | timestamp     | ISO 8601 format             |
  | actor_email   | who made the change         |
  | action        | action type                 |
  | resource_type | what was changed            |
  | resource_id   | resource identifier         |
  | changes_json  | full changes object as JSON |
  | ip_address    | from metadata               |
```

---

### Scenario: Non-admin attempts to view audit log
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to access the audit log page
Then the access is denied with error "Unauthorized: admin role required"
And I see a message "Only admins can view audit logs"
```

---

### Scenario: Manager attempts to view audit log
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a manager (role: manager) of "Acme Corp"
When I attempt to access the audit log page
Then the access is denied with error "Unauthorized: admin role required"
```

---

### Scenario: Cannot modify audit log entries
**Tags**: `@edge-case @domain:authorization @immutability`

```gherkin
Given an audit log entry exists with id "log-123"
When I attempt to update the entry
Then the update is rejected with error "Audit logs are immutable"
And no changes occur
```

---

### Scenario: Cannot delete audit log entries
**Tags**: `@edge-case @domain:authorization @immutability`

```gherkin
Given an audit log entry exists with id "log-123"
When I attempt to delete the entry
Then the deletion is rejected with error "Audit logs cannot be deleted"
And the entry remains in the database
```

---

### Scenario: Audit logs scoped by company
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given I am an admin of "Acme Corp"
And "Acme Corp" has 30 audit log entries
And "Beta Inc" has 20 audit log entries
When I view the audit log
Then I see only the 30 entries for "Acme Corp"
And I cannot see "Beta Inc" entries
And tenant_id filtering is enforced by policies
```

---

### Scenario: Audit log includes metadata
**Tags**: `@happy-path @domain:authorization @audit-metadata`

```gherkin
Given I am an admin performing an action
When any authorization change occurs
Then the audit log captures metadata:
  | field        | source                        |
  | ip_address   | request IP (X-Forwarded-For)  |
  | user_agent   | browser user agent            |
  | request_id   | unique request identifier     |
And metadata is stored as JSONB for flexibility
```

---

## Scenario Outline: All authorization actions are logged
**Tags**: `@audit @domain:authorization @comprehensive`

```gherkin
When the action "<action>" occurs
Then an audit log entry is created with action "<action>"

Examples:
| action                      |
| user_added                  |
| user_removed                |
| role_changed                |
| team_created                |
| team_archived               |
| team_member_added           |
| team_member_removed         |
| team_role_changed           |
| invitation_sent             |
| invitation_accepted         |
| invitation_revoked          |
| invitation_expired          |
| company_created             |
| company_archived            |
| company_settings_updated    |
| feature_toggled             |
```

---

## Edge Cases

### EC-1: High-volume logging performance
**Scenario:** System handles high volume of changes
**Expected:** Async logging, no performance impact on main actions
**Test:** Benchmark 1000 concurrent user changes

### EC-2: Audit log retention
**Scenario:** Logs older than 2 years
**Expected:** Archived to cold storage, still queryable
**Test:** Query logs older than retention period

### EC-3: Actor identification for system actions
**Scenario:** Background jobs trigger changes
**Expected:** actor_authz_user_id is null, metadata explains trigger
**Test:** Scheduled invitation expiration

---

## Performance Considerations

- Audit log write: < 10ms (async preferred)
- Audit log query: < 200ms (up to 10,000 entries with filters)
- Export: < 2s for 1,000 entries
- Pagination: 50 entries per page

---

## Compliance Notes

- **SOC 2**: Complete audit trail required
- **GDPR**: User data changes must be logged
- **HIPAA**: Access logs for protected data
- **Retention**: Minimum 2 years, configurable per company

---

## Related Features
- All features publish events that trigger audit logging
- [user_management.feature.md](./user_management.feature.md) - User action auditing
- [team_management.feature.md](./team_management.feature.md) - Team action auditing
- [company_settings.feature.md](./company_settings.feature.md) - Settings change auditing
