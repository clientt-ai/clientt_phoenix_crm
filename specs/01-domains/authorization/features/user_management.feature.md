# Feature: User Management (AuthzUsers)

**Domain**: Authorization
**Priority**: high
**Status**: approved
**Last Updated**: 2025-11-11

As a company admin
I want to manage users in my company
So that I can control who has access and what permissions they have

## Acceptance Criteria
- [ ] Admins can invite users by email
- [ ] Users can accept invitations (new or existing authn_user)
- [ ] All company members can view member list
- [ ] Admins can change user roles
- [ ] Admins can remove users from company

## Related Specifications
- Resource: [authz_user.md](../resources/authz_user.md)
- Resource: [invitation.md](../resources/invitation.md)
- Policy: [role_based_access.md](../policies/role_based_access.md)
- Policy: [invitation_security.md](../policies/invitation_security.md)

---

## Scenarios

### Scenario: Admin invites new user to company
**Tags**: `@happy-path @domain:authorization @priority:high @invitation`

```gherkin
Given I am an admin of "Acme Corp"
And "newuser@example.com" has no existing authn_user account
When I invite "newuser@example.com" with:
  | field      | value  |
  | role       | user   |
  | team_id    | null   |
  | message    | Welcome to our team! |
Then an Invitation record is created with:
  | field                     | value                  |
  | email                     | newuser@example.com    |
  | tenant_id                | [Acme Corp id]         |
  | role                      | user                   |
  | status                    | pending                |
  | invited_by_authz_user_id  | [my authz_user id]     |
  | expires_at                | [now + 7 days]         |
And a cryptographically secure token (32+ bytes) is generated
And an invitation email is sent to "newuser@example.com" with:
  | field          | value                              |
  | subject        | You've been invited to join Acme Corp |
  | inviter_name   | [My name]                          |
  | company_name   | Acme Corp                          |
  | role           | User                               |
  | accept_url     | /invitations/accept?token=[token]  |
  | expires_in     | 7 days                             |
And an audit log entry records "InvitationSent"
And an "invitation_sent" event is published
```

---

### Scenario: Manager invites user to team
**Tags**: `@happy-path @domain:authorization @invitation @teams`

```gherkin
Given I am a manager of "Acme Corp"
And team "Engineering" exists in "Acme Corp"
When I invite "dev@example.com" with:
  | field      | value         |
  | role       | user          |
  | team_id    | [Engineering] |
  | team_role  | team_member   |
Then an Invitation is created with team assignment
And the invitation email mentions "Engineering team"
```

---

### Scenario: Non-admin attempts to invite user
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to invite "someone@example.com"
Then the action is rejected with error "Unauthorized: admin or manager role required"
And no Invitation is created
```

---

### Scenario: New user accepts invitation
**Tags**: `@happy-path @domain:authorization @invitation @onboarding`

```gherkin
Given an invitation exists for "newuser@example.com" to join "Acme Corp" with role "user"
And the invitation status is "pending"
And the invitation has not expired
And "newuser@example.com" has no authn_user account
When the user clicks the invitation link with valid token
Then they are redirected to registration page with email pre-filled (non-editable)
When they complete registration with password "SecurePass123!"
Then an authn_user is created for "newuser@example.com"
And an authz_user is created with:
  | field          | value              |
  | authn_user_id  | [new authn_user]   |
  | tenant_id     | [Acme Corp]        |
  | role           | user               |
  | status         | active             |
  | joined_at      | [now]              |
And the invitation status changes to "accepted"
And the invitation accepted_at is set to now
And the invitation accepted_by_authn_user_id is set
And an "AuthzUserCreated" event is published
And an "InvitationAccepted" event is published
And the user is automatically signed in
And the user is redirected to "Acme Corp" dashboard
And an audit log entry records "UserAdded"
```

---

### Scenario: Existing user accepts invitation to another company
**Tags**: `@happy-path @domain:authorization @invitation @multi-tenancy`

```gherkin
Given I have an existing authn_user account for "alice@example.com"
And I have an authz_user for "Acme Corp" (role: admin)
And I received an invitation to join "Beta Inc" with role "user"
And I am currently signed in
When I click the invitation link
Then I see a confirmation page: "Join Beta Inc as User?"
When I confirm acceptance
Then a new authz_user is created for me linking to "Beta Inc"
And the invitation status changes to "accepted"
And I can now switch to "Beta Inc" from my companies list
And I am automatically switched to "Beta Inc" context
And a notification shows "You've joined Beta Inc!"
```

---

### Scenario: User not signed in accepts invitation
**Tags**: `@happy-path @domain:authorization @invitation`

```gherkin
Given I have an authn_user account for "alice@example.com"
And I received an invitation to join "Beta Inc"
And I am not currently signed in
When I click the invitation link
Then I am redirected to sign-in page
And the invitation token is preserved in the URL/session
When I sign in successfully
Then the invitation acceptance flow continues automatically
And I join "Beta Inc" as described in previous scenario
```

---

### Scenario: Accept expired invitation
**Tags**: `@edge-case @domain:authorization @invitation @validation`

```gherkin
Given an invitation was created 8 days ago for "user@example.com"
And the invitation expires_at is in the past
When the user attempts to accept the invitation
Then the acceptance fails with error "This invitation has expired"
And they see a message "Please request a new invitation from [Company Admin]"
And no authz_user is created
And the invitation status remains "pending" (or changes to "expired")
```

---

### Scenario: Accept invitation for company already a member of
**Tags**: `@edge-case @domain:authorization @invitation @validation`

```gherkin
Given I am already a member of "Acme Corp" (have authz_user)
When I attempt to accept another invitation for "Acme Corp"
Then the acceptance fails with error "You are already a member of this company"
And I am redirected to "Acme Corp" dashboard
And the invitation is automatically marked as "revoked"
```

---

### Scenario: Duplicate pending invitation
**Tags**: `@edge-case @domain:authorization @invitation @validation`

```gherkin
Given an invitation exists for "user@example.com" to "Acme Corp" with status "pending"
When an admin attempts to invite "user@example.com" again to "Acme Corp"
Then the invitation fails with error "Pending invitation already exists"
And they see options to:
  | action | description                    |
  | Resend | Send the invitation email again |
  | Revoke | Cancel the existing invitation  |
And no new invitation is created
```

---

### Scenario: View company members list
**Tags**: `@happy-path @domain:authorization @member-management`

```gherkin
Given I am a member of "Acme Corp"
And "Acme Corp" has the following active authz_users:
  | email              | role    | team        | joined_at  |
  | admin@acme.com     | admin   | null        | 2025-01-15 |
  | manager@acme.com   | manager | Engineering | 2025-02-01 |
  | user@acme.com      | user    | Sales       | 2025-03-10 |
  | user2@acme.com     | user    | Sales       | 2025-03-12 |
When I view the members page
Then I see all 4 active authz_users
And each member shows:
  | field      | description                        |
  | email      | from authn_user relationship       |
  | role       | company-level role                 |
  | team       | team name (or "—" if no team)      |
  | joined_at  | formatted date                     |
And if I am admin or manager, I see action buttons:
  | action       | availability              |
  | Change Role  | admins only               |
  | Assign Team  | admins and managers       |
  | Remove       | admins only               |
```

---

### Scenario: Admin changes user role
**Tags**: `@happy-path @domain:authorization @role-management`

```gherkin
Given I am an admin of "Acme Corp"
And "user@acme.com" has role "user"
When I change their role to "manager"
Then their authz_user role is updated to "manager"
And they immediately have manager permissions
And an audit log entry records:
  | field        | value   |
  | action       | RoleChanged |
  | actor        | [my authz_user] |
  | resource_id  | [user's authz_user id] |
  | changes      | {"role": {"from": "user", "to": "manager"}} |
And a "RoleChanged" event is published
And a notification email is sent to "user@acme.com":
  | subject | Your role has been updated in Acme Corp |
  | body    | Your role has been changed to Manager   |
```

---

### Scenario: Remove user from company
**Tags**: `@happy-path @domain:authorization @member-management`

```gherkin
Given I am an admin of "Acme Corp"
And "user@acme.com" is a member (role: user)
When I remove "user@acme.com" from the company
Then their authz_user status changes to "inactive"
And they can no longer access "Acme Corp"
And they can no longer switch to "Acme Corp"
And if they have other companies, they can still access those
And their authn_user account remains active (for other companies)
And an audit log entry records "UserRemoved"
And a notification email is sent to "user@acme.com"
```

---

### Scenario: Re-invite previously removed user
**Tags**: `@happy-path @domain:authorization @invitation`

```gherkin
Given "user@acme.com" was previously a member of "Acme Corp"
And their authz_user status is "inactive"
When an admin invites "user@acme.com" again
Then a new invitation is created
When the user accepts the invitation
Then a new authz_user is created (separate from the old inactive one)
And they can access the company again
```

---

### Scenario: Non-admin attempts to change roles
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a user (role: user) of "Acme Corp"
When I attempt to change another user's role
Then the action is rejected with error "Unauthorized: admin role required"
And no changes occur
```

---

### Scenario: Non-admin attempts to remove user
**Tags**: `@error-case @domain:authorization @security`

```gherkin
Given I am a manager (role: manager) of "Acme Corp"
When I attempt to remove a user
Then the action is rejected with error "Unauthorized: admin role required"
And the user remains active
```

---

## Scenario Outline: Invitation validation constraints
**Tags**: `@validation @domain:authorization`

```gherkin
Given I am an admin of "Acme Corp"
When I attempt to invite "<email>" with role "<role>"
Then the result is "<result>"
And the error is "<error>" if failed

Examples:
| email                  | role     | result  | error                        |
| valid@example.com      | user     | success |                              |
| valid@example.com      | manager  | success |                              |
| valid@example.com      | admin    | success |                              |
| invalid-email          | user     | failure | Invalid email format         |
|                        | user     | failure | Email is required            |
| valid@example.com      | invalid  | failure | Invalid role                 |
| valid@example.com      | null     | failure | Role is required             |
```

---

## Edge Cases

### EC-1: User limit enforcement
**Scenario:** Company has max_users: 10 and 10 active users
**Expected:** 11th invitation fails with "User limit reached"
**Test:** Set max_users, attempt to exceed

### EC-2: Concurrent invitation acceptance
**Scenario:** Two people accept same invitation token simultaneously
**Expected:** First succeeds, second fails with "Invitation already accepted"
**Test:** Concurrent acceptance requests

### EC-3: Token security
**Scenario:** Invitation token must be cryptographically secure
**Expected:** Token is 32+ bytes, random, URL-safe
**Test:** Verify token generation uses SecureRandom

---

## Performance Considerations

- Member list query: < 200ms (up to 1000 members per company)
- Role change: < 100ms
- Invitation creation: < 150ms (including email send)

---

## Related Features
- [company_management.feature.md](./company_management.feature.md) - Managing companies
- [team_management.feature.md](./team_management.feature.md) - Assigning users to teams
- [audit_logging.feature.md](./audit_logging.feature.md) - Tracking changes
