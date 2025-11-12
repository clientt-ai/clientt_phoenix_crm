# Feature: Team Management

**Domain**: Authorization
**Priority**: medium
**Status**: approved
**Last Updated**: 2025-11-11

As a company admin or manager
I want to organize users into teams
So that I can structure permissions and organization hierarchically

## Acceptance Criteria
- [ ] Admins can create teams within their company
- [ ] Admins and managers can assign users to teams
- [ ] Team names are unique per company
- [ ] Team members can view their team
- [ ] Team leads can manage team members
- [ ] Cannot archive team with active members

## Related Specifications
- Resource: [team.md](../resources/team.md)
- Resource: [authz_user.md](../resources/authz_user.md)
- Policy: [role_based_access.md](../policies/role_based_access.md)

---

## Scenarios

### Scenario: Admin creates team
**Tags**: `@happy-path @domain:authorization @priority:medium @team-creation`

```gherkin
Given I am an admin of "Acme Corp"
When I create a team with:
  | field       | value                  |
  | name        | Engineering            |
  | description | Development team       |
Then a Team record is created with:
  | field       | value                  |
  | company_id  | [Acme Corp id]         |
  | name        | Engineering            |
  | description | Development team       |
  | status      | active                 |
And an audit log entry records "TeamCreated"
And a "team_created" event is published
```

---

### Scenario: Create team with duplicate name in same company
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given I am an admin of "Acme Corp"
And a team "Engineering" already exists in "Acme Corp"
When I attempt to create another team "Engineering"
Then the creation fails with error "Team name already exists in this company"
And no Team record is created
```

---

### Scenario: Create teams with same name in different companies
**Tags**: `@happy-path @domain:authorization @multi-tenancy`

```gherkin
Given I am an admin of "Acme Corp"
And team "Engineering" exists in "Beta Inc" (different company)
When I create a team "Engineering" in "Acme Corp"
Then the team is created successfully
And both teams exist independently
And team names are scoped to their respective companies
```

---

### Scenario: Non-admin attempts to create team
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to create a team "Sales"
Then the action is rejected with error "Unauthorized: admin role required"
And no Team record is created
```

---

### Scenario: Admin assigns user to team
**Tags**: `@happy-path @domain:authorization @team-assignment`

```gherkin
Given I am an admin of "Acme Corp"
And user "bob@acme.com" exists with no team assignment
And team "Engineering" exists in "Acme Corp"
When I assign "bob@acme.com" to "Engineering" with team_role "team_member"
Then Bob's authz_user record is updated with:
  | field      | value        |
  | team_id    | [Engineering id] |
  | team_role  | team_member  |
And an audit log entry records "TeamMemberAdded"
And a "team_member_added" event is published
And Bob can now see team-specific resources
And Bob appears in the Engineering team members list
```

---

### Scenario: Manager assigns user to team
**Tags**: `@happy-path @domain:authorization @team-assignment`

```gherkin
Given I am a manager (role: manager) of "Acme Corp"
And team "Sales" exists
When I assign a user to "Sales" team
Then the assignment succeeds
And the user is added to the team
```

---

### Scenario: User attempts to assign team member
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to assign another user to a team
Then the action is rejected with error "Unauthorized: admin or manager role required"
And no assignment occurs
```

---

### Scenario: Assign user to team from different company
**Tags**: `@error-case @domain:authorization @multi-tenancy @validation`

```gherkin
Given I am an admin of "Acme Corp"
And user "alice@acme.com" is a member of "Acme Corp"
And team "Engineering" exists in "Beta Inc" (different company)
When I attempt to assign Alice to the Beta Inc "Engineering" team
Then the assignment fails with error "Team must belong to same company as user"
And no assignment occurs
```

---

### Scenario: Promote team member to team lead
**Tags**: `@happy-path @domain:authorization @team-roles`

```gherkin
Given I am an admin of "Acme Corp"
And "bob@acme.com" is assigned to team "Engineering" with team_role "team_member"
When I change Bob's team_role to "team_lead"
Then Bob's authz_user team_role is updated to "team_lead"
And Bob can now manage Engineering team members
And an audit log entry records the change:
  | field   | value                                                     |
  | action  | TeamRoleChanged                                           |
  | changes | {"team_role": {"from": "team_member", "to": "team_lead"}} |
And a notification is sent to Bob
```

---

### Scenario: Remove user from team
**Tags**: `@happy-path @domain:authorization @team-assignment`

```gherkin
Given "bob@acme.com" is assigned to team "Engineering"
And I am an admin of "Acme Corp"
When I remove Bob from the team
Then Bob's authz_user record is updated with:
  | field      | value |
  | team_id    | null  |
  | team_role  | null  |
And an audit log entry records "TeamMemberRemoved"
And Bob no longer sees team-specific resources
```

---

### Scenario: View team members list
**Tags**: `@happy-path @domain:authorization @team-viewing`

```gherkin
Given I am a member of team "Engineering"
And "Engineering" has the following members:
  | email              | team_role   |
  | lead@acme.com      | team_lead   |
  | dev1@acme.com      | team_member |
  | dev2@acme.com      | team_member |
When I view the "Engineering" team page
Then I see all 3 team members
And each member shows:
  | field      | description      |
  | email      | user email       |
  | team_role  | team lead/member |
  | company_role | admin/manager/user |
And if I am a team_lead or admin, I see management options
```

---

### Scenario: Team lead views their team
**Tags**: `@happy-path @domain:authorization @team-viewing`

```gherkin
Given I am a team_lead of "Engineering"
When I view the "Engineering" team page
Then I see all team members
And I see options to:
  | action         | description                    |
  | View Details   | See team member profile        |
  | Contact        | Send message to team member    |
And admins see additional actions (remove, change role)
```

---

### Scenario: Archive team with no members
**Tags**: `@happy-path @domain:authorization @team-lifecycle`

```gherkin
Given I am an admin of "Acme Corp"
And team "Engineering" exists with 0 active members
When I archive the team
Then the team status changes to "archived"
And the team no longer appears in active teams list
And historical data referencing the team is preserved
And an audit log entry records "TeamArchived"
```

---

### Scenario: Attempt to archive team with active members
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given I am an admin of "Acme Corp"
And team "Engineering" has 5 active members
When I attempt to archive the team
Then the action fails with error "Cannot archive team with active members"
And I see a message "Reassign all members first"
And I see a list of team members with bulk reassignment options
And the team status remains "active"
```

---

### Scenario: Update team details
**Tags**: `@happy-path @domain:authorization @team-management`

```gherkin
Given I am an admin of "Acme Corp"
And team "Engineering" exists with description "Dev team"
When I update the team with:
  | field       | value                          |
  | name        | Engineering & Product          |
  | description | Development and product team   |
Then the team record is updated
And an audit log entry records the changes
And the team name remains unique within the company
```

---

### Scenario: Cannot change team's company
**Tags**: `@edge-case @domain:authorization @validation`

```gherkin
Given I am an admin of both "Acme Corp" and "Beta Inc"
And team "Engineering" belongs to "Acme Corp"
When I attempt to move the team to "Beta Inc"
Then the action fails with error "Cannot change team's company"
And the team remains in "Acme Corp"
```

---

## Scenario Outline: Team name validation
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am an admin of "Acme Corp"
When I attempt to create a team with name "<name>"
Then the result is "<result>"
And the error is "<error>" if failed

Examples:
| name                | result  | error                        |
| E                   | failure | Name must be at least 2 chars|
| Engineering         | success |                              |
| Sales & Marketing   | success |                              |
| [101 chars name]    | failure | Name must be max 100 chars   |
|                     | failure | Name is required             |
```

---

## Scenario Outline: Team role constraints
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am an admin of "Acme Corp"
And user "bob@acme.com" exists
And team "Engineering" exists
When I attempt to assign Bob with team_id "<team_id>" and team_role "<team_role>"
Then the result is "<result>"
And the error is "<error>" if failed

Examples:
| team_id       | team_role   | result  | error                              |
| [Engineering] | team_lead   | success |                                    |
| [Engineering] | team_member | success |                                    |
| [Engineering] | null        | failure | team_role required when team_id set|
| null          | team_lead   | failure | team_id required when team_role set|
| null          | null        | success | (no team assignment)               |
```

---

## Edge Cases

### EC-1: Reassign all team members before archiving
**Scenario:** Bulk reassignment tool for archiving teams
**Expected:** UI allows selecting new team for all members, then archives
**Test:** Archive team with multiple members after bulk reassignment

### EC-2: Team lead permissions
**Scenario:** Team leads should have limited team management
**Expected:** Can view team, cannot modify team settings or remove members
**Test:** Team lead attempts various admin actions

### EC-3: Multiple team assignment (future)
**Scenario:** Currently users can only belong to one team
**Expected:** Constraint enforced, future may support multiple teams
**Test:** Attempt to assign user to second team

---

## Performance Considerations

- Team list query: < 100ms (up to 100 teams per company)
- Team members query: < 150ms (up to 100 members per team)
- Team assignment: < 50ms

---

## Related Features
- [user_management.feature.md](./user_management.feature.md) - Managing company members
- [company_settings.feature.md](./company_settings.feature.md) - Max teams limit
- [multi_tenancy.feature.md](./multi_tenancy.feature.md) - Team data isolation
