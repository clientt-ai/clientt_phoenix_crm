# Feature: Lead Management

**Domain**: Forms
**Priority**: high
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

As a company admin or manager
I want to view and manage form submissions
So that I can track and convert leads through our sales workflow

## Acceptance Criteria
- [ ] Public forms accept submissions without authentication
- [ ] Submissions create in-app notifications for company users
- [ ] Submission data is immutable (cannot be edited)
- [ ] Lead status can be updated through workflow (new → contacted → qualified → converted)
- [ ] Submissions can be soft-deleted and restored
- [ ] Submissions can be filtered by status, date range, and form
- [ ] Multi-tenancy: Users can only view submissions for their company

## Related Specifications
- Resource: [submission.md](../resources/submission.md)
- Resource: [notification.md](../resources/notification.md)
- Resource: [form.md](../resources/form.md)
- Policy: [row_level_security.md](../policies/row_level_security.md)

---

## Scenarios

### Scenario: Submit form (public, no authentication)
**Tags**: `@happy-path @domain:forms @priority:high @public-submission`

```gherkin
Given a published form exists with slug "contact-us"
And the form has fields:
  | field_id  | field_type | label       | is_required |
  | field-1   | text       | Name        | true        |
  | field-2   | email      | Email       | true        |
  | field-3   | textarea   | Message     | false       |
And the form has collect_utm_params: true
When a visitor submits the form with:
  | field_id  | value                  |
  | field-1   | John Doe               |
  | field-2   | john@example.com       |
  | field-3   | I'm interested         |
And UTM parameters:
  | parameter   | value    |
  | utm_source  | google   |
  | utm_medium  | cpc      |
  | utm_campaign| fall-2025|
Then a Submission record is created with:
  | field           | value                              |
  | status          | new                                |
  | submitter_email | john@example.com                   |
  | company_id      | [form.company_id]                  |
  | submitted_at    | [current_timestamp]                |
And form_data contains:
  | field_id  | value                  |
  | field-1   | John Doe               |
  | field-2   | john@example.com       |
  | field-3   | I'm interested         |
And metadata contains:
  | key         | value     |
  | utm_source  | google    |
  | utm_medium  | cpc       |
  | utm_campaign| fall-2025 |
And the forms.submission_created event is published
And in-app notifications are created for all company users
And immediate emails are sent to users with "immediate" preference
```

**Technical Notes:**
- No authentication required (public endpoint)
- company_id inherited from form
- Status defaults to 'new'
- submitter_email extracted from email field (if present)
- Metadata includes UTM params, referrer, user_agent, IP

---

### Scenario: Submit form with missing required field
**Tags**: `@edge-case @domain:forms @validation @public-submission`

```gherkin
Given a published form exists with slug "contact-us"
And the form has a required email field
When a visitor submits the form without the email field
Then the submission fails with error "Email is required"
And no Submission record is created
And no notifications are sent
```

---

### Scenario: Submit form with invalid email format
**Tags**: `@edge-case @domain:forms @validation`

```gherkin
Given a published form exists
And the form has an email field
When a visitor submits with email "not-an-email"
Then the submission fails with error "Email must be a valid email address"
And no Submission record is created
```

---

### Scenario: Attempt to submit to draft form (should fail)
**Tags**: `@edge-case @domain:forms @validation`

```gherkin
Given a form exists with status "draft"
When a visitor attempts to submit the form
Then the submission fails with error "Form not found or no longer accepting submissions"
And no Submission record is created
```

**Technical Notes:**
- Only published forms accept submissions
- Draft and archived forms return 404 on public endpoint

---

### Scenario: View submissions list for my company
**Tags**: `@happy-path @domain:forms @multi-tenancy @submission-listing`

```gherkin
Given I am logged in as "manager@acme.com" in company "company-123"
And 5 submissions exist for forms in company "company-123":
  | submitter_email     | status    | submitted_at | deleted_at |
  | john@example.com    | new       | 1 hour ago   | null       |
  | jane@example.com    | contacted | 2 hours ago  | null       |
  | bob@example.com     | qualified | 1 day ago    | null       |
  | alice@example.com   | converted | 3 days ago   | null       |
  | spam@example.com    | spam      | 1 week ago   | null       |
And 3 submissions exist for forms in company "company-456"
When I view the submissions list
Then I see 5 submissions (all from my company)
And I do NOT see submissions from other companies
And submissions are ordered by submitted_at DESC
And deleted submissions are excluded by default
```

**Technical Notes:**
- Multi-tenancy: Only show submissions from user's current company
- Default ordering: most recent first
- Default filter: exclude soft-deleted (deleted_at IS NULL)

---

### Scenario: View submission details
**Tags**: `@happy-path @domain:forms @submission-detail`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with:
  | field           | value                  |
  | submitter_email | john@example.com       |
  | status          | new                    |
  | submitted_at    | 2025-11-16 10:00:00    |
And form_data contains:
  | field   | value                  |
  | name    | John Doe               |
  | email   | john@example.com       |
  | message | I'm interested         |
And metadata contains:
  | key        | value  |
  | utm_source | google |
  | utm_medium | cpc    |
When I view the submission details
Then I see all form field values
And I see metadata (UTM params, referrer, etc.)
And I see the submission timestamp
And I see the current status
And I can update the status
```

---

### Scenario: Update submission status (new → contacted)
**Tags**: `@happy-path @domain:forms @priority:high @status-workflow`

```gherkin
Given I am logged in as "manager@acme.com"
And a submission exists with status "new"
When I update the status to "contacted"
Then the submission status changes to "contacted"
And updated_at timestamp is refreshed
And the forms.submission_status_changed event is published with:
  | field       | value      |
  | old_status  | new        |
  | new_status  | contacted  |
  | changed_by  | [authz_id] |
```

---

### Scenario: Update status through full workflow
**Tags**: `@happy-path @domain:forms @status-workflow`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with status "new"
When I progress the submission through the workflow:
  | from      | to        |
  | new       | contacted |
  | contacted | qualified |
  | qualified | converted |
Then each status transition succeeds
And the final status is "converted"
```

**Technical Notes:**
- Valid workflow: new → contacted → qualified → converted
- Any status can transition to "spam"
- "converted" is terminal state (no further transitions)

---

### Scenario: Attempt invalid status transition
**Tags**: `@edge-case @domain:forms @validation @status-workflow`

```gherkin
Given I am logged in as "manager@acme.com"
And a submission exists with status "new"
When I attempt to update the status to "converted"
Then the update fails with error "Invalid status transition"
And the status remains "new"
```

**Technical Notes:**
- Cannot skip workflow steps (must follow: new → contacted → qualified → converted)
- Exception: Can always mark as "spam" from any status

---

### Scenario: Mark submission as spam
**Tags**: `@happy-path @domain:forms @status-workflow`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with status "contacted"
When I mark the submission as spam
Then the submission status changes to "spam"
And the submission can be filtered out of active leads view
```

**Technical Notes:**
- "spam" is terminal state (like "converted")
- Any status can transition to "spam"
- Useful for filtering out invalid/bot submissions

---

### Scenario: Attempt to update immutable submission data
**Tags**: `@edge-case @domain:forms @immutability @validation`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with form_data:
  | field | value        |
  | email | john@ex.com  |
When I attempt to update the form_data
Then the update fails with error "Submission data is immutable"
And the form_data remains unchanged
```

**Technical Notes:**
- form_data and metadata are immutable after creation
- Only status and deleted_at can be updated
- Ensures audit trail integrity

---

### Scenario: Soft delete a submission
**Tags**: `@happy-path @domain:forms @soft-delete`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with status "spam"
When I delete the submission
Then deleted_at is set to current timestamp
And the submission is excluded from default queries
And the submission data is preserved in database
And the forms.submission_deleted event is published
```

**Technical Notes:**
- Soft delete only (hard delete not recommended except for GDPR)
- Deleted submissions excluded from analytics
- Can be restored later

---

### Scenario: Restore soft-deleted submission
**Tags**: `@happy-path @domain:forms @soft-delete`

```gherkin
Given I am logged in as "admin@acme.com"
And a submission exists with deleted_at set
When I restore the submission
Then deleted_at is set to null
And the submission appears in default queries again
And the forms.submission_restored event is published
```

---

### Scenario: Filter submissions by status
**Tags**: `@happy-path @domain:forms @filtering`

```gherkin
Given I am logged in as "manager@acme.com"
And submissions exist with statuses:
  | status    | count |
  | new       | 10    |
  | contacted | 5     |
  | qualified | 3     |
  | converted | 2     |
  | spam      | 1     |
When I filter submissions by status "new"
Then I see 10 submissions with status "new"
And I do NOT see submissions with other statuses
```

---

### Scenario: Filter submissions by date range
**Tags**: `@happy-path @domain:forms @filtering`

```gherkin
Given I am logged in as "admin@acme.com"
And submissions exist:
  | submitted_at | submitter_email  |
  | 2025-11-01   | old@example.com  |
  | 2025-11-15   | new@example.com  |
  | 2025-11-16   | today@ex.com     |
When I filter submissions by date range "2025-11-15 to 2025-11-16"
Then I see 2 submissions
And I see "new@example.com" and "today@ex.com"
And I do NOT see "old@example.com"
```

---

### Scenario: Filter submissions by form
**Tags**: `@happy-path @domain:forms @filtering`

```gherkin
Given I am logged in as "manager@acme.com"
And 2 forms exist:
  | name        | id     |
  | Contact Us  | form-1 |
  | Demo Form   | form-2 |
And submissions exist:
  | form_id | count |
  | form-1  | 5     |
  | form-2  | 3     |
When I filter submissions by form "Contact Us"
Then I see 5 submissions from "Contact Us" form
And I do NOT see submissions from "Demo Form"
```

---

### Scenario: View submissions with UTM source breakdown
**Tags**: `@happy-path @domain:forms @analytics @utm-tracking`

```gherkin
Given I am logged in as "admin@acme.com"
And submissions exist with UTM sources:
  | utm_source | count |
  | google     | 10    |
  | facebook   | 5     |
  | linkedin   | 3     |
  | (none)     | 2     |
When I view the submissions analytics
Then I see a breakdown by UTM source:
  | source    | count |
  | google    | 10    |
  | facebook  | 5     |
  | linkedin  | 3     |
  | direct    | 2     |
```

**Technical Notes:**
- UTM parameters stored in metadata JSONB
- Queryable via JSONB operators
- Useful for lead source attribution

---

### Scenario: Search submissions by email
**Tags**: `@happy-path @domain:forms @search`

```gherkin
Given I am logged in as "manager@acme.com"
And submissions exist:
  | submitter_email      |
  | john@example.com     |
  | jane@example.com     |
  | bob@other.com        |
When I search for "example.com"
Then I see 2 submissions
And I see "john@example.com" and "jane@example.com"
And I do NOT see "bob@other.com"
```

**Technical Notes:**
- Search uses submitter_email column (indexed)
- Supports partial match (LIKE '%query%')
- Case-insensitive

---

### Scenario: Regular user can view but not update submissions
**Tags**: `@authorization @domain:forms @edge-case`

```gherkin
Given I am logged in as "viewer@acme.com" with role "user"
And a submission exists in my company
When I view the submission
Then I can see all submission details
When I attempt to update the status
Then the update fails with error "Insufficient permissions"
```

**Technical Notes:**
- Users (non-admin/manager) have read-only access
- Only admin and manager can update status or delete

---

### Scenario: Notification preferences - immediate email
**Tags**: `@happy-path @domain:forms @notifications @email`

```gherkin
Given I am a user with notification_preference "immediate"
And I belong to company "company-123"
When a submission is created for a form in "company-123"
Then an in-app notification is created for me
And an email is sent immediately to my email address
And the email subject is "New form submission - {form_name}"
```

---

### Scenario: Notification preferences - daily digest
**Tags**: `@happy-path @domain:forms @notifications @email`

```gherkin
Given I am a user with notification_preference "daily"
And I belong to company "company-123"
When 5 submissions are created throughout the day
Then 5 in-app notifications are created for me
And NO immediate emails are sent
And at 9 AM (my timezone) the next day
Then I receive 1 daily digest email with all 5 submissions
```

---

### Scenario: Notification preferences - off
**Tags**: `@happy-path @domain:forms @notifications`

```gherkin
Given I am a user with notification_preference "off"
When a submission is created
Then an in-app notification is still created
But NO email is sent
```

**Technical Notes:**
- In-app notifications always created (cannot be disabled)
- Email notifications respect user preference
- Default preference is "immediate"

---

## Test Coverage Requirements

**Critical Paths** (Must Test):
- [ ] Public form submission (happy path)
- [ ] Submission validation (required fields, email format)
- [ ] Status workflow transitions (new → contacted → qualified → converted)
- [ ] Multi-tenancy: Cannot view other company's submissions
- [ ] Immutability: Cannot update form_data
- [ ] Soft delete and restore
- [ ] Notification creation on new submission

**Edge Cases** (Should Test):
- [ ] Submit to draft form (should fail)
- [ ] Submit with missing required field
- [ ] Invalid status transition
- [ ] Manager attempts to update (should succeed)
- [ ] User attempts to update (should fail)
- [ ] Search by email

**Performance** (Should Monitor):
- [ ] List submissions with 10,000+ records (pagination)
- [ ] UTM source breakdown query <500ms
- [ ] Submission detail page load <300ms

---

## Related Features
- [form_management.feature.md](./form_management.feature.md) - Creating and publishing forms
- [analytics_dashboard.feature.md](./analytics_dashboard.feature.md) - Submission analytics and KPIs
- [csv_export.feature.md](./csv_export.feature.md) - Exporting submissions to CSV
