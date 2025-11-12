# Feature: Multi-Tenancy & Data Isolation

**Domain**: Authorization
**Priority**: critical
**Status**: approved
**Last Updated**: 2025-11-11

As a CRM platform
I want complete data isolation between companies
So that each company's data remains private and secure

## Acceptance Criteria
- [ ] All tenant-scoped queries filtered by company_id
- [ ] Users can only access data from their current company
- [ ] Cross-company data access prevented at framework level
- [ ] Company context stored in session
- [ ] Policies enforce row-level security
- [ ] No data leakage between companies

## Related Specifications
- Resource: [domain.md](../domain.md) - Multi-tenancy implementation
- Policy: [row_level_security.md](../policies/row_level_security.md)
- All tenant-scoped resources

---

## Scenarios

### Scenario: Data isolation between companies
**Tags**: `@critical @domain:authorization @priority:critical @multi-tenancy @security`

```gherkin
Given user "Alice" with authz_user in "Acme Corp" (company_id: uuid-1)
And user "Bob" with authz_user in "Beta Inc" (company_id: uuid-2)
And "Acme Corp" has 10 contacts, 5 deals, 3 teams
And "Beta Inc" has 8 contacts, 6 deals, 2 teams
When Alice queries contacts
Then she sees only the 10 contacts from "Acme Corp"
And she sees 0 contacts from "Beta Inc"
When Bob queries contacts
Then he sees only the 8 contacts from "Beta Inc"
And he sees 0 contacts from "Acme Corp"
And this is enforced at the Ash policy level
```

---

### Scenario: Cannot access resources by direct ID across companies
**Tags**: `@critical @domain:authorization @security @multi-tenancy`

```gherkin
Given Alice is a member of "Acme Corp" (company_id: uuid-1)
And Bob is a member of "Beta Inc" (company_id: uuid-2)
And Bob's team "Engineering" has id "team-456"
When Alice attempts to read team "team-456" by direct ID
Then the read is rejected with "Not found" (or unauthorized)
And Alice cannot bypass company_id filter
And the team data is not exposed
```

---

### Scenario: Cannot modify resources across companies
**Tags**: `@critical @domain:authorization @security @multi-tenancy`

```gherkin
Given Alice is an admin of "Acme Corp"
And Bob is a user in "Beta Inc" with authz_user id "authz-bob"
When Alice attempts to change Bob's role (authz-bob)
Then the action is rejected
And Bob's role remains unchanged
And cross-company modifications are prevented
```

---

### Scenario: Company context stored in session
**Tags**: `@happy-path @domain:authorization @multi-tenancy @session`

```gherkin
Given user "alice@example.com" logs in
And Alice has authz_users for both "Acme Corp" and "Beta Inc"
And Alice selects "Acme Corp" as active company
Then the session is updated with:
  | field                | value                     |
  | current_authn_user   | [Alice's authn_user]      |
  | current_company_id   | [Acme Corp uuid]          |
  | current_authz_user   | [Acme Corp authz_user]    |
And all subsequent queries use company_id from session
And the company context cannot be overridden by client
```

---

### Scenario: Automatic company_id filtering on queries
**Tags**: `@critical @domain:authorization @multi-tenancy @policies`

```gherkin
Given the current session has current_company_id: "uuid-1"
When any query is executed for tenant-scoped resources:
  | resource      |
  | AuthzUser     |
  | Team          |
  | Invitation    |
  | AuditLog      |
  | Contact       |
  | Deal          |
Then an automatic filter is applied: company_id == "uuid-1"
And users cannot override this filter
And queries for non-tenant resources (Company) are not filtered
```

---

### Scenario: Session company_id cannot be tampered with
**Tags**: `@critical @domain:authorization @security @multi-tenancy`

```gherkin
Given Alice is a member of "Acme Corp" only
And Alice's session has current_company_id: "acme-uuid"
When a malicious client attempts to modify the session to:
  | field              | malicious_value |
  | current_company_id | "beta-uuid"     |
Then the modification is rejected (server-side session)
And Alice's session remains scoped to "Acme Corp"
And no data from "Beta Inc" is accessible
```

---

### Scenario: Multi-company user sees correct data per context
**Tags**: `@happy-path @domain:authorization @multi-tenancy @context-switching`

```gherkin
Given Alice has authz_users for:
  | company   | role  |
  | Acme Corp | admin |
  | Beta Inc  | user  |
And "Acme Corp" has 5 team members
And "Beta Inc" has 8 team members
When Alice is in "Acme Corp" context
Then she sees 5 team members
When Alice switches to "Beta Inc" context
Then she sees 8 team members
And the team members lists are completely separate
```

---

### Scenario: Company-scoped relationships
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given team "Engineering" belongs to "Acme Corp"
And Alice (member of "Acme Corp") is assigned to "Engineering"
And Bob (member of "Beta Inc") creates a team "Engineering" in Beta Inc
When Alice queries her team
Then she sees "Engineering" from "Acme Corp" only
When Bob queries his team
Then he sees "Engineering" from "Beta Inc" only
And team names can be duplicated across companies
And relationships are scoped by company_id
```

---

### Scenario: Audit logs are company-scoped
**Tags**: `@happy-path @domain:authorization @multi-tenancy @audit`

```gherkin
Given "Acme Corp" has 50 audit log entries
And "Beta Inc" has 30 audit log entries
And Alice is an admin of "Acme Corp"
When Alice views the audit log
Then she sees only the 50 entries for "Acme Corp"
And she cannot see "Beta Inc" audit logs
And filtering is enforced by Ash policies
```

---

### Scenario: Invitations are company-scoped
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given Alice (admin of "Acme Corp") invites "user@example.com"
And Bob (admin of "Beta Inc") also invites "user@example.com"
Then two separate invitations exist:
  | company   | email            | status  |
  | Acme Corp | user@example.com | pending |
  | Beta Inc  | user@example.com | pending |
And both can be accepted independently
And the user will have separate authz_users for each company
```

---

### Scenario: LiveView assigns enforce company context
**Tags**: `@happy-path @domain:authorization @multi-tenancy @liveview`

```gherkin
Given a LiveView is mounted with on_mount hook
And the current_authn_user is Alice
And Alice has current_company_id: "acme-uuid"
Then the LiveView socket assigns include:
  | assign              | value               |
  | current_authn_user  | [Alice's authn_user]|
  | current_company_id  | "acme-uuid"         |
  | current_authz_user  | [Acme authz_user]   |
And all LiveView queries use these assigns
And LiveView cannot be mounted without valid company context
```

---

### Scenario: Cross-company join attempts are blocked
**Tags**: `@critical @domain:authorization @security @multi-tenancy`

```gherkin
Given Alice is assigned to team "Sales" in "Acme Corp"
And "Beta Inc" has a team "Engineering"
When a query attempts to join across companies:
  """
  Alice's AuthzUser (company: Acme) → Team Engineering (company: Beta)
  """
Then the join produces no results
And the foreign key references respect company_id boundaries
```

---

### Scenario: Resource creation inherits company_id
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given Alice is an admin of "Acme Corp" (company_id: uuid-1)
And current session has current_company_id: uuid-1
When Alice creates a new team "Marketing"
Then the team is created with company_id: uuid-1
And the company_id is set automatically from session
And Alice cannot create a team for another company
```

---

### Scenario: Prevent company_id override on create
**Tags**: `@critical @domain:authorization @security @multi-tenancy`

```gherkin
Given Alice is a member of "Acme Corp" (company_id: uuid-1)
And current session has current_company_id: uuid-1
When Alice attempts to create a team with explicitly set company_id: uuid-2
Then the creation is rejected or company_id is overridden to uuid-1
And no resources can be created for other companies
```

---

### Scenario: Bulk operations respect company boundaries
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given Alice is an admin of "Acme Corp"
And "Acme Corp" has 10 users
And "Beta Inc" has 8 users
When Alice performs bulk operation "update all users set status: inactive"
Then only the 10 users from "Acme Corp" are updated
And the 8 users from "Beta Inc" remain unchanged
And bulk operations automatically scoped by company_id
```

---

### Scenario: Company table is not tenant-scoped
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given Alice has authz_users for "Acme Corp" and "Beta Inc"
When Alice queries companies
Then she sees both companies in her list
And Company resource is not filtered by company_id
And this allows viewing all companies user belongs to
```

---

## Scenario Outline: Tenant-scoped resources enforce company_id
**Tags**: `@multi-tenancy @domain:authorization @comprehensive`

```gherkin
Given the current session has current_company_id: "<company_id>"
When querying resource "<resource>"
Then all results have company_id: "<company_id>"
And no results from other companies are returned

Examples:
| resource          | company_id |
| AuthzUser         | uuid-1     |
| Team              | uuid-1     |
| Invitation        | uuid-1     |
| CompanySettings   | uuid-1     |
| AuditLog          | uuid-1     |
| Contact (future)  | uuid-1     |
| Deal (future)     | uuid-1     |
```

---

## Edge Cases

### EC-1: User loses access to company
**Scenario:** Alice's authz_user is deactivated while she's using the app
**Expected:** Session invalidated, redirect to company selection
**Test:** Deactivate user while they have active session

### EC-2: Company is archived while user is active
**Scenario:** Admin archives company while users are working
**Expected:** All active sessions for that company invalidated
**Test:** Archive company, verify user sessions cleared

### EC-3: Race condition on company switching
**Scenario:** User switches companies rapidly
**Expected:** Session updates are serialized, queries always use current company_id
**Test:** Rapid company switching with concurrent queries

### EC-4: Database-level enforcement
**Scenario:** Direct database queries (bypassing Ash)
**Expected:** Application-level policies prevent this, but foreign keys provide safety
**Test:** Verify foreign key constraints on company_id

---

## Performance Considerations

- Company_id index on all tenant-scoped tables
- Query performance overhead: < 10ms per query
- Context switching: < 50ms
- No N+1 queries when loading company-scoped relationships

---

## Security Testing

### Test: SQL Injection Attempts
**Scenario:** Malicious company_id in query params
**Expected:** Parameterized queries prevent injection

### Test: Authorization Bypass Attempts
**Scenario:** Direct ID access across companies
**Expected:** Ash policies reject access

### Test: Session Hijacking
**Scenario:** Stolen session token
**Expected:** Server-side sessions prevent company_id tampering

---

## Compliance

- **SOC 2**: Complete data isolation between tenants
- **GDPR**: User data confined to company boundaries
- **ISO 27001**: Access controls enforced at framework level

---

## Related Features
- [company_management.feature.md](./company_management.feature.md) - Company switching
- [user_management.feature.md](./user_management.feature.md) - User context
- All features inherit multi-tenancy filtering
