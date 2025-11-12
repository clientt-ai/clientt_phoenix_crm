# Multi-Tenant Authorization - User Stories

## Epic 1: Company Management

### US-1.1: Create First Company
**As a** new user
**I want to** create my first company
**So that** I can start using the CRM for my organization

**Acceptance Criteria:**
- Given I am logged in (have authn_user)
- When I create a company with name "Acme Corp" and slug "acme-corp"
- Then a Company record is created with status "active"
- And I automatically become the first admin (authz_user with role: admin)
- And default CompanySettings are created (max_users: null, features: {})
- And an audit log entry records "CompanyCreated"

**Technical Notes:**
- Single transaction: Company + CompanySettings + AuthzUser
- First user always gets admin role
- Slug validation: lowercase, alphanumeric + hyphens only

---

### US-1.2: View My Companies
**As a** user who belongs to multiple companies
**I want to** see a list of all my companies
**So that** I can switch between them

**Acceptance Criteria:**
- Given I have authz_users for companies "Acme Corp" and "Beta Inc"
- When I view my companies list
- Then I see both companies with my role in each
- And I can see which company is currently active

**UI Mockup:**
```
My Companies:
[•] Acme Corp (Admin)
[ ] Beta Inc (User)
```

---

### US-1.3: Switch Active Company
**As a** user belonging to multiple companies
**I want to** switch my active company context
**So that** I can work with data from different organizations

**Acceptance Criteria:**
- Given I'm currently in "Acme Corp" (company_id: 1)
- When I switch to "Beta Inc" (company_id: 2)
- Then my session updates to company_id: 2
- And my current_authz_user is the one for Beta Inc
- And all queries now filter by company_id: 2
- And I see Beta Inc's data and team members

**Technical Notes:**
- Update session assigns: current_company_id, current_authz_user
- LiveView: Use assign(:current_authz_user, ...)
- All tenant-scoped queries automatically refiltered

---

### US-1.4: Archive Company
**As a** company admin
**I want to** archive my company
**So that** we stop using the CRM but retain historical data

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I archive the company
- Then company status changes to "archived"
- And all authz_users for the company become inactive
- And all pending invitations are revoked
- And historical data is preserved
- And users can no longer access the company

---

## Epic 2: User Management (AuthzUsers)

### US-2.1: Invite User to Company
**As a** company admin
**I want to** invite a new user by email
**So that** they can join my company

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I invite "newuser@example.com" with role "user"
- Then an Invitation is created with status "pending"
- And a secure token is generated
- And an invitation email is sent to "newuser@example.com"
- And the invitation expires in 7 days
- And an audit log entry records "InvitationSent"

**Email Template:**
```
Subject: You've been invited to join Acme Corp on ClienttCRM

Hi there!

[Admin Name] has invited you to join Acme Corp as a User.

[Accept Invitation Button - links to /invitations/accept?token=...]

This invitation expires in 7 days.
```

---

### US-2.2: Accept Invitation (New User)
**As a** person who received an invitation
**I want to** accept the invitation and create an account
**So that** I can access the company's CRM

**Acceptance Criteria:**
- Given I received an invitation for "newuser@example.com"
- And I don't have an authn_user account yet
- When I click the invitation link
- Then I'm prompted to create an account (email pre-filled)
- When I complete registration
- Then an authn_user is created
- And an authz_user is created for the company with specified role
- And the invitation status changes to "accepted"
- And I'm automatically signed in and redirected to the company

**Flow:**
1. Click invitation link → Invitation acceptance page
2. No account → Register page (email pre-filled, non-editable)
3. Create password → Account created
4. AuthzUser created → Signed in → Company dashboard

---

### US-2.3: Accept Invitation (Existing User)
**As a** existing user who received an invitation
**I want to** accept the invitation
**So that** I can access another company

**Acceptance Criteria:**
- Given I already have an authn_user account for "user@example.com"
- And I received an invitation to join "Beta Inc"
- When I click the invitation link
- And I sign in (if not already signed in)
- Then an authz_user is created linking me to "Beta Inc"
- And the invitation status changes to "accepted"
- And I can now switch to "Beta Inc" from my companies list

**Flow:**
1. Click invitation link → Check if signed in
2. If not signed in → Sign in page → Return to acceptance
3. If signed in → Create authz_user → Success page → Switch to new company

---

### US-2.4: View Company Members
**As a** company member
**I want to** see all members of my company
**So that** I know who has access

**Acceptance Criteria:**
- Given I am a member of "Acme Corp"
- When I view the members page
- Then I see a list of all active authz_users
- And I can see each member's email, role, team, and join date
- And admins/managers see additional options (change role, remove user)

**UI Mockup:**
```
Company Members (12 active)

Email                Role     Team         Joined      Actions
admin@acme.com      Admin    —            2025-01-15  [Change Role] [Remove]
manager@acme.com    Manager  Engineering  2025-02-01  [Change Role] [Remove]
user@acme.com       User     Sales        2025-03-10  [Change Role] [Remove]
```

---

### US-2.5: Change User Role
**As a** company admin
**I want to** change a user's role
**So that** I can adjust their permissions

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- And "user@acme.com" has role "user"
- When I change their role to "manager"
- Then their authz_user role is updated to "manager"
- And they immediately have manager permissions
- And an audit log entry records the change (from: user, to: manager)
- And a notification email is sent to the user

**Validation:**
- Cannot change the last admin's role to non-admin (error shown)

---

### US-2.6: Remove User from Company
**As a** company admin
**I want to** remove a user from my company
**So that** they no longer have access

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I remove "user@acme.com"
- Then their authz_user status changes to "inactive"
- And they can no longer access Acme Corp
- And their authn_user account remains (for other companies)
- And an audit log entry records "UserRemoved"

**Validation:**
- Cannot remove the last admin (error shown)
- Removed users can be re-invited later

---

## Epic 3: Team Management

### US-3.1: Create Team
**As a** company admin
**I want to** create a team
**So that** I can organize users into groups

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I create a team "Engineering" with description "Development team"
- Then a Team record is created for Acme Corp
- And the team status is "active"
- And an audit log entry records "TeamCreated"

**Validation:**
- Team name must be unique within company
- Team name required (min 2 characters)

---

### US-3.2: Assign User to Team
**As a** company admin or manager
**I want to** assign a user to a team
**So that** they have team-specific access

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- And user "bob@acme.com" has no team assignment
- And team "Engineering" exists
- When I assign Bob to Engineering with team_role "team_member"
- Then Bob's authz_user is updated with team_id and team_role
- And an audit log entry records "TeamMemberAdded"
- And Bob can now see team-specific resources

---

### US-3.3: Promote to Team Lead
**As a** company admin
**I want to** promote a team member to team lead
**So that** they can manage their team

**Acceptance Criteria:**
- Given Bob is a team_member of "Engineering"
- When I change his team_role to "team_lead"
- Then Bob's team_role is updated
- And Bob can now manage Engineering team members
- And an audit log entry records the change

---

### US-3.4: View Team Members
**As a** team member
**I want to** view my team members
**So that** I know who's on my team

**Acceptance Criteria:**
- Given I am a member of team "Engineering"
- When I view the team page
- Then I see all members of Engineering
- And I can see each member's role and email
- And team leads see additional management options

---

### US-3.5: Archive Team
**As a** company admin
**I want to** archive a team
**So that** we can retire unused teams

**Acceptance Criteria:**
- Given team "Engineering" has no active members (all reassigned)
- When I archive the team
- Then team status changes to "archived"
- And the team no longer appears in active teams list
- And historical data is preserved

**Validation:**
- Cannot archive team with active members (error shown)
- Must reassign members first

---

## Epic 4: Company Settings

### US-4.1: Update Company Settings
**As a** company admin
**I want to** update company settings
**So that** I can configure our CRM instance

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I update settings (max_users: 50, timezone: "America/New_York")
- Then CompanySettings are updated
- And an audit log entry records the changes

**Settings Categories:**
- General: name, timezone
- Limits: max_users, max_teams
- Features: feature flags (enabled/disabled)
- Branding: logo_url, primary_color, secondary_color

---

### US-4.2: Enable/Disable Feature
**As a** company admin
**I want to** toggle feature flags
**So that** I can control which features my company uses

**Acceptance Criteria:**
- Given feature "advanced_reports" is disabled
- When I enable "advanced_reports"
- Then the feature flag is set to true
- And all company members can now access advanced reports
- And an audit log entry records "FeatureToggled"

---

### US-4.3: Enforce User Limit
**As a** company with max_users set
**I want** the system to enforce the user limit
**So that** we don't exceed our subscription

**Acceptance Criteria:**
- Given Acme Corp has max_users: 10
- And there are currently 10 active authz_users
- When an admin tries to invite an 11th user
- Then the invitation is rejected with error "User limit reached"
- And the admin is prompted to upgrade or remove inactive users

---

## Epic 5: Audit Logging

### US-5.1: View Audit Log
**As a** company admin
**I want to** view the audit log
**So that** I can track authorization changes

**Acceptance Criteria:**
- Given I am an admin of "Acme Corp"
- When I view the audit log page
- Then I see all authorization changes for Acme Corp
- And I can filter by: date range, action type, actor, resource
- And I can export the log as CSV

**Log Entries Include:**
- Timestamp
- Actor (who made the change)
- Action (e.g., "RoleChanged")
- Resource (e.g., "AuthzUser: user@acme.com")
- Changes (before → after)
- Metadata (IP address, user agent)

---

### US-5.2: Automatic Audit Logging
**As a** compliance officer
**I want** all authorization changes automatically logged
**So that** we have a complete audit trail

**Acceptance Criteria:**
- When any authorization change occurs (role change, user added, team assigned, etc.)
- Then an immutable audit log entry is created
- And the entry cannot be edited or deleted
- And the entry includes actor, action, resource, changes, and timestamp

**Logged Actions:**
- user_added, user_removed, role_changed
- team_created, team_archived, team_member_added, team_member_removed
- invitation_sent, invitation_accepted, invitation_revoked
- company_created, company_archived, company_settings_updated

---

## Epic 6: Multi-Tenancy & Data Isolation

### US-6.1: Data Isolation Between Companies
**As a** user of Company A
**I want** to only see Company A's data
**So that** other companies' data remains private

**Acceptance Criteria:**
- Given I am a member of "Acme Corp" (company_id: 1)
- And there is data for "Beta Inc" (company_id: 2)
- When I query any tenant-scoped resource (contacts, deals, etc.)
- Then I only see data for company_id: 1
- And I cannot access company_id: 2 data even with direct IDs
- And this is enforced at the framework level (Ash policies)

**Test Scenarios:**
- User A (Acme Corp) cannot read User B's (Beta Inc) contacts
- User A cannot modify User B's data
- User A cannot even query User B's data (returns empty/error)

---

### US-6.2: Company Context in Session
**As a** developer
**I want** the current company context stored in session
**So that** all queries are automatically scoped

**Technical Specification:**
```elixir
# Session assigns after login + company selection
%{
  current_authn_user: %User{id: "...", email: "user@example.com"},
  current_company_id: "company-uuid",
  current_authz_user: %AuthzUser{
    id: "authz-uuid",
    authn_user_id: "...",
    company_id: "company-uuid",
    role: :admin
  }
}
```

All LiveViews use `on_mount {ClienttCrmAppWeb.LiveUserAuth, :require_authz_user}`

---

## Epic 7: Migration & Onboarding

### US-7.1: Migrate Existing Users
**As a** platform admin
**I want to** migrate existing authn_users to the new multi-tenant system
**So that** current users can continue using the CRM

**Migration Steps:**
1. Create a default company "Default Organization" for each existing user
2. Create authz_user linking user to their default company (role: admin)
3. Create default CompanySettings
4. Associate all existing user data (contacts, deals) with the default company
5. Add company_id to all tenant-scoped tables

**Rollback Plan:**
- Backup database before migration
- Migration is reversible
- Users can rename/reconfigure their default company after migration

---

### US-7.2: Onboarding New User
**As a** new user accepting an invitation
**I want** a guided onboarding experience
**So that** I can quickly learn the system

**Flow:**
1. Accept invitation → Create account
2. Welcome screen: "Welcome to [Company Name]!"
3. Quick tour: Company switcher, team membership, role explanation
4. Redirect to main dashboard

---

## Non-Functional Requirements

### NFR-1: Performance
- Company list query: < 100ms (up to 50 companies per user)
- Member list query: < 200ms (up to 1000 members per company)
- Context switching: < 50ms
- Row-level filtering overhead: < 10ms per query

### NFR-2: Security
- All tenant-scoped queries enforced by Ash policies (cannot be bypassed)
- Invitation tokens: cryptographically secure (32+ bytes)
- Audit logs: immutable, cannot be deleted
- Password for sensitive actions: role changes, user removal

### NFR-3: Scalability
- Support up to 10,000 companies
- Support up to 1,000 users per company
- Support up to 100 teams per company
- Audit log retention: 2 years (archived after that)

### NFR-4: Usability
- Company switcher: always visible in header
- Current company: clearly indicated
- Role badges: visible on user profiles
- Invitation flow: maximum 3 steps

---

## Edge Cases & Error Handling

### EC-1: Last Admin Protection
- **Scenario:** Trying to remove/downgrade the last admin
- **Expected:** Error message "Cannot remove the last admin. Promote another user first."
- **UI:** Show list of other users with "Promote to Admin" action

### EC-2: Duplicate Invitation
- **Scenario:** Inviting an email that already has a pending invitation
- **Expected:** Error "Pending invitation already exists. Resend or revoke existing invitation."
- **Action:** Show existing invitation with [Resend] and [Revoke] buttons

### EC-3: Expired Invitation
- **Scenario:** Accepting an invitation after 7 days
- **Expected:** Error "This invitation has expired. Please request a new invitation."
- **Action:** Prompt to contact the company admin

### EC-4: User Already Member
- **Scenario:** Accepting invitation for a company the user already belongs to
- **Expected:** Error "You are already a member of this company."
- **Action:** Redirect to company dashboard

### EC-5: User Limit Reached
- **Scenario:** Inviting user when max_users limit reached
- **Expected:** Error "User limit reached (10/10). Upgrade plan or remove inactive users."
- **Action:** Show upgrade options or inactive users list

### EC-6: Team with Members
- **Scenario:** Trying to archive a team with active members
- **Expected:** Error "Cannot archive team with active members. Reassign members first."
- **UI:** Show team members with bulk reassignment tool

---

## Future Enhancements (Out of Scope for v1)

### FE-1: Custom Roles & Permissions (ABAC)
- Allow admins to create custom roles
- Fine-grained permissions (e.g., "can_view_reports", "can_delete_contacts")
- Permission inheritance

### FE-2: Team Hierarchy
- Parent/child teams
- Org chart visualization
- Inherited permissions

### FE-3: External Identity Providers
- SAML SSO
- LDAP integration
- Auto-provisioning from directory

### FE-4: Multi-Company Dashboards
- View aggregated data across all user's companies
- Company comparison reports

### FE-5: Granular Audit Search
- Full-text search on audit logs
- Advanced filters (IP range, time patterns)
- Anomaly detection

---

**Total User Stories:** 21 core stories + 7 non-functional requirements + 6 edge cases + 5 future enhancements
