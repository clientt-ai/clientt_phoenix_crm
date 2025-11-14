# Feature: Form Builder

**Domain**: Forms
**Priority**: high
**Status**: draft

## Feature Description

As a company user
I want to create and configure custom forms with drag-drop fields
So that I can capture leads and submissions tailored to my business needs

## Acceptance Criteria

- [ ] Users can create new forms with names and descriptions
- [ ] Users can add fields via drag-drop or field palette
- [ ] Fields can be reordered via drag-drop
- [ ] Field properties (label, required, validation) can be configured
- [ ] Forms can be saved as drafts
- [ ] Forms can be published to make them publicly accessible
- [ ] Published forms cannot have structural changes without versioning
- [ ] Forms display live preview while building
- [ ] Post-submission actions can be configured
- [ ] Forms can be unpublished and archived

## Scenarios

### Scenario: Create New Form
**Tags**: `@happy-path @domain:forms @priority:high`
**Status**: pending

```gherkin
Given I am logged in as a company member
  And I am on the Forms dashboard
When I click "Create New Form"
  And I enter "Lead Capture Form" as the form name
  And I enter "Capture leads from landing page" as the description
  And I click "Create Form"
Then a new form should be created with status "draft"
  And I should see the form builder interface
  And the form should have a unique slug "lead-capture-form"
  And I should see an empty field palette
```

### Scenario: Add Text Field to Form
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder for "Lead Capture Form"
When I click "Add Field" in the field palette
  And I select "Text" as the field type
  And I enter "First Name" as the field label
  And I enter "first_name" as the field name
  And I check "Required"
  And I click "Add to Form"
Then the field should appear in the form preview
  And the field should have order 0
  And the form should have 1 field
  And the field should be marked as required
```

### Scenario: Add Email Field with Validation
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder for "Lead Capture Form"
  And the form has 1 field (First Name)
When I add an "Email" field
  And I enter "Email Address" as the label
  And I enter "email" as the field name
  And I check "Required"
  And I set placeholder to "you@example.com"
  And I set help text to "We'll never share your email"
  And I click "Add to Form"
Then the email field should appear after the First Name field
  And the email field should have order 1
  And the email field should have email validation enabled
  And I should see the placeholder in the preview
```

### Scenario: Reorder Fields via Drag-Drop
**Tags**: `@happy-path @domain:forms @ui-interaction`
**Status**: pending

```gherkin
Given I am in the form builder
  And the form has these fields in order:
    | Order | Field Name   | Type  |
    | 0     | first_name   | text  |
    | 1     | email        | email |
    | 2     | company_name | text  |
When I drag the "email" field above "first_name"
Then the fields should be reordered as:
    | Order | Field Name   | Type  |
    | 0     | email        | email |
    | 1     | first_name   | text  |
    | 2     | company_name | text  |
  And the changes should be saved automatically
```

### Scenario: Add Select Field with Options
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder
When I add a "Select" field
  And I enter "Company Size" as the label
  And I configure these options:
    | Value | Label           |
    | 1-10  | 1-10 employees  |
    | 11-50 | 11-50 employees |
    | 51+   | 51+ employees   |
  And I set display style to "dropdown"
  And I check "Required"
  And I click "Add to Form"
Then the select field should have 3 choices
  And the default display should be a dropdown
  And the field should be required
```

### Scenario: Configure Conditional Field Logic
**Tags**: `@edge-case @domain:forms @advanced`
**Status**: pending

```gherkin
Given I am in the form builder
  And the form has a field "customer_type" with options "Individual" and "Business"
When I add a text field "Company Name"
  And I enable conditional logic
  And I set the rule: Show "Company Name" when "customer_type" equals "Business"
  And I save the field
Then the "Company Name" field should have conditional logic configured
  And in the preview, "Company Name" should be hidden by default
When I select "Business" in the preview "customer_type" field
Then "Company Name" should become visible
```

### Scenario: Configure Post-Submission Calendar Booking Action
**Tags**: `@happy-path @domain:forms @integration`
**Status**: pending

```gherkin
Given I am in the form builder
  And my company has a connected Google Calendar
  And the form is saved as a draft
When I navigate to "Post-Submission Actions"
  And I click "Add Action"
  And I select "Calendar Booking"
  And I select my Google Calendar connection
  And I set meeting duration to 30 minutes
  And I add custom question "How did you hear about us?"
  And I enable the action
  And I save the configuration
Then the calendar booking action should be configured
  And the action should be associated with my Google Calendar
  And submissions should trigger the booking flow
```

### Scenario: Publish Form
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder
  And the form has at least 1 required field
  And the form status is "draft"
When I click "Publish Form"
Then the form status should change to "published"
  And a public URL should be generated: "/f/lead-capture-form"
  And the form should receive a published_at timestamp
  And I should see the public URL
  And I should receive a confirmation message
  And a "forms.form_published" event should be published
```

### Scenario Outline: Validate Form Cannot Be Published Without Required Fields
**Tags**: `@validation @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder
  And the form has <field_count> fields
  And <required_count> fields are marked as required
When I attempt to publish the form
Then the publication should <result>
  And I should see <message>

Examples:
| field_count | required_count | result | message                                        |
| 0           | 0              | fail   | "Form must have at least one field"            |
| 3           | 0              | fail   | "Form must have at least one required field"   |
| 3           | 1              | succeed| "Form published successfully"                  |
| 5           | 3              | succeed| "Form published successfully"                  |
```

### Scenario: Unpublish Form
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I have a published form "Lead Capture Form"
  And the form has 5 submissions
When I click "Unpublish Form"
  And I confirm the action
Then the form status should change to "unpublished"
  And the form should have an unpublished_at timestamp
  And the public URL should return 404
  And existing submissions should remain intact
  And I should be able to re-publish the form later
```

### Scenario: Archive Form with Submissions
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I have a form with status "published"
  And the form has 25 submissions
When I click "Archive Form"
  And I provide reason "Campaign ended"
  And I confirm the action
Then the form status should change to "archived"
  And the form should have an archived_at timestamp
  And the public URL should return 404
  And all 25 submissions should remain accessible
  And the form should not be editable
  And I should not be able to publish the form again
```

### Scenario: Attempt to Delete Form with Submissions
**Tags**: `@edge-case @domain:forms @validation`
**Status**: pending

```gherkin
Given I have a form with 10 submissions
When I attempt to delete the form
Then the deletion should be prevented
  And I should see error message "Cannot delete form with submissions. Archive instead."
  And the form should remain in the database
  And I should be offered to archive the form
```

### Scenario: Delete Draft Form Without Submissions
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I have a draft form with 0 submissions
When I click "Delete Form"
  And I confirm the deletion
Then the form should be permanently deleted
  And all associated fields should be deleted
  And I should be redirected to the forms list
```

### Scenario: Live Preview Updates
**Tags**: `@ui-interaction @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder
  And I have a form with 3 fields
When I update the field label from "Email" to "Email Address"
Then the preview should update immediately
  And I should see "Email Address" in the preview
When I change the submit button text to "Get Started"
Then the preview submit button should show "Get Started"
  And the changes should be auto-saved
```

### Scenario: Configure Form Settings
**Tags**: `@happy-path @domain:forms`
**Status**: pending

```gherkin
Given I am in the form builder
When I navigate to "Form Settings"
  And I set submit button text to "Send Message"
  And I set success message to "Thank you! We'll be in touch soon."
  And I enable "Allow multiple submissions"
  And I set notification email to "sales@company.com"
  And I save the settings
Then the settings should be persisted
  And the submit button preview should show "Send Message"
  And submissions should send notifications to "sales@company.com"
```

## Cross-Domain Impacts

### Events Triggered
- `forms.form_created`: When new form is created
- `forms.form_published`: When form status changes to published
- `forms.field_added`: When field is added to form
- `forms.field_reordered`: When fields are reordered
- `forms.form_archived`: When form is archived

### Events Consumed
- `authorization.company_deleted`: Archive all forms for company

## Security Considerations

- [ ] **Authorization**: Only company members can create forms
- [ ] **Authorization**: Only form owner and admins can edit forms
- [ ] **Validation**: Form slug must be unique per company
- [ ] **Validation**: Field names must be unique within a form
- [ ] **Validation**: At least one required field before publishing
- [ ] **Audit**: Log all form creation, publishing, and archival events
- [ ] **Data Protection**: Published forms are publicly accessible (no PII in form structure)

## Performance Considerations

- Live preview updates should debounce (300ms delay)
- Drag-drop should use optimistic UI updates
- Auto-save should debounce (1 second delay)
- Field palette should lazy-load field type configurations

## Related Specifications

- [Form Resource](../resources/form.md)
- [FormField Resource](../resources/form_field.md)
- [Form Submission Feature](./form_submission.feature.md)
- [Calendar Booking Feature](./calendar_booking.feature.md)
