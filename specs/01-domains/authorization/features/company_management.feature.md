# Feature: Company Management

**Domain**: Authorization
**Priority**: high
**Status**: approved
**Last Updated**: 2025-11-11

As a user
I want to create and manage companies
So that I can organize my work across multiple organizations

## Acceptance Criteria
- [ ] Users can create new companies
- [ ] Users can view all companies they belong to
- [ ] Users can switch between companies
- [ ] Admins can archive companies
- [ ] First user of company automatically becomes admin
- [ ] Company slugs are unique and URL-safe

## Related Specifications
- Resource: [company.md](../resources/company.md)
- Resource: [authz_user.md](../resources/authz_user.md)
- Policy: [row_level_security.md](../policies/row_level_security.md)

---

## Scenarios

### Scenario: Create first company
**Tags**: `@happy-path @domain:authorization @priority:high @company-creation`

```gherkin
Given I am logged in as "alice@example.com" (authn_user)
And I have no existing companies
When I create a company with:
  | field | value      |
  | name  | Acme Corp  |
  | slug  | acme-corp  |
Then a Company record is created with status "active"
And I automatically become the first authz_user with role "admin"
And default CompanySettings are created with:
  | field      | value |
  | max_users  | null  |
  | max_teams  | null  |
  | features   | {}    |
  | timezone   | UTC   |
And an audit log entry records "CompanyCreated"
And the company_created event is published with:
  | field                    | value         |
  | company_id               | [company_id]  |
  | first_admin_authz_user_id| [authz_id]    |
```

**Technical Notes:**
- Single transaction: Company + CompanySettings + AuthzUser
- First user always gets admin role
- Slug validation: lowercase, alphanumeric + hyphens only

---

### Scenario: Create company with invalid slug
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given I am logged in as "alice@example.com"
When I attempt to create a company with slug "Acme Corp!"
Then the creation fails with error "Slug must be lowercase alphanumeric with hyphens only"
And no Company record is created
```

---

### Scenario: Create company with duplicate slug
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given a company exists with slug "acme-corp"
And I am logged in as "bob@example.com"
When I attempt to create a company with slug "acme-corp"
Then the creation fails with error "Slug already taken"
And no Company record is created
```

---

### Scenario: View my companies list
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given I am logged in as "alice@example.com"
And I have authz_users for:
  | company    | role    |
  | Acme Corp  | admin   |
  | Beta Inc   | user    |
  | Gamma LLC  | manager |
When I view my companies list
Then I see all 3 companies with my role in each
And I can see which company is currently active
And companies are sorted by name alphabetically
```

---

### Scenario: Switch active company
**Tags**: `@happy-path @domain:authorization @multi-tenancy @context-switching`

```gherkin
Given I am logged in as "alice@example.com"
And I have authz_users for:
  | company   | role  | company_id |
  | Acme Corp | admin | uuid-1     |
  | Beta Inc  | user  | uuid-2     |
And I am currently in "Acme Corp" (company_id: uuid-1)
And my current permissions are "admin"
When I switch to "Beta Inc"
Then my session is updated with:
  | field                | value  |
  | current_company_id   | uuid-2 |
  | current_authz_user   | [Beta Inc authz_user] |
And my current permissions are "user"
And all subsequent queries filter by company_id: uuid-2
And I see Beta Inc's data and team members
And I no longer see Acme Corp's data
```

**Technical Notes:**
- Update session assigns: current_company_id, current_authz_user
- LiveView: Use assign(:current_authz_user, ...)
- All tenant-scoped queries automatically refiltered

---

### Scenario: Attempt to switch to company I don't belong to
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am logged in as "alice@example.com"
And I belong to "Acme Corp" only
And "Delta Corp" exists but I'm not a member
When I attempt to switch to "Delta Corp"
Then the switch is rejected with error "Access denied"
And my current company remains "Acme Corp"
And no session changes occur
```

---

### Scenario: Archive company as admin
**Tags**: `@happy-path @domain:authorization @company-lifecycle`

```gherkin
Given I am an admin of "Acme Corp"
And "Acme Corp" has status "active"
And "Acme Corp" has 5 active authz_users
And "Acme Corp" has 2 pending invitations
When I archive the company
Then the company status changes to "archived"
And all 5 authz_users status changes to "inactive"
And both pending invitations status changes to "revoked"
And historical data is preserved
And a "CompanyArchived" event is published
And an audit log entry records the archival with actor
And users can no longer switch to or access "Acme Corp"
```

---

### Scenario: Non-admin attempts to archive company
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to archive the company
Then the action is rejected with error "Unauthorized: admin role required"
And the company status remains "active"
```

---

### Scenario: Archive already archived company
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given "Acme Corp" has status "archived"
And I am an admin authz_user for the company
When I attempt to archive the company again
Then the action fails with error "Company is already archived"
```

---

## Scenario Outline: Validate company name constraints
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am logged in as "alice@example.com"
When I attempt to create a company with name "<name>"
Then the result is "<result>"
And the error message is "<error>" if failed

Examples:
| name                                                                                      | result  | error                           |
| A                                                                                         | failure | Name must be at least 2 chars   |
| AB                                                                                        | success |                                 |
| Valid Company Name                                                                        | success |                                 |
| [101 characters long name...]                                                            | failure | Name must be max 100 chars      |
|                                                                                           | failure | Name is required                |
| Acme Corp                                                                                 | success |                                 |
```

---

## Scenario Outline: Validate slug format constraints
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am logged in as "alice@example.com"
When I attempt to create a company with slug "<slug>"
Then the result is "<result>"
And the error message is "<error>" if failed

Examples:
| slug              | result  | error                                  |
| acme-corp         | success |                                        |
| acme              | success |                                        |
| acme-corp-123     | success |                                        |
| Acme-Corp         | failure | Slug must be lowercase                 |
| acme corp         | failure | Slug cannot contain spaces             |
| acme_corp         | success | (underscores allowed as alternative)   |
| acme!corp         | failure | Slug must be alphanumeric + hyphens    |
| [51 chars slug]   | failure | Slug must be max 50 chars              |
|                   | failure | Slug is required                       |
```

---

## Edge Cases

### EC-1: Company creation transaction rollback
**Scenario:** If AuthzUser creation fails after Company is created
**Expected:** Entire transaction rolls back, no Company or Settings created
**Test:** Simulate constraint violation on authz_users table

### EC-2: Session handling on company archive
**Scenario:** User is actively using a company when it gets archived
**Expected:** User's session is invalidated, redirect to company selection
**Test:** Archive company while user has active session

### EC-3: Multiple users creating same slug simultaneously
**Scenario:** Race condition on slug uniqueness
**Expected:** Database unique constraint prevents duplicates, one succeeds
**Test:** Concurrent company creation with same slug

---

## Performance Considerations

- Company list query: < 100ms (up to 50 companies per user)
- Context switching: < 50ms
- Archive operation: < 500ms (including cascade updates)

---

## Related Features
- [user_management.feature.md](./user_management.feature.md) - Managing company members
- [team_management.feature.md](./team_management.feature.md) - Organizing users in teams
- [multi_tenancy.feature.md](./multi_tenancy.feature.md) - Data isolation
