# Feature: Form Management

**Domain**: Forms
**Priority**: high
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

As a company admin or manager
I want to create, publish, and manage forms
So that I can collect lead information from potential customers

## Acceptance Criteria
- [ ] Admins and managers can create new forms
- [ ] Forms can be published when ready for use
- [ ] Published forms are accessible via public URL
- [ ] Forms can be archived when no longer needed
- [ ] Forms can be duplicated to create templates
- [ ] Form branding and settings are customizable
- [ ] Multi-tenancy: Users can only manage forms in their company

## Related Specifications
- Resource: [form.md](../resources/form.md)
- Resource: [form_field.md](../resources/form_field.md)
- Policy: [row_level_security.md](../policies/row_level_security.md)

---

## Scenarios

### Scenario: Create a new form
**Tags**: `@happy-path @domain:forms @priority:high @form-creation`

```gherkin
Given I am logged in as "admin@acme.com" with role "admin"
And my tenant_id is "company-123"
When I create a form with:
  | field       | value                                 |
  | name        | Contact Us                            |
  | description | Get in touch with our team            |
  | branding    | {"primary_color": "#3B82F6"}          |
  | settings    | {"success_message": "Thank you!"}     |
Then a Form record is created with:
  | field       | value                                 |
  | name        | Contact Us                            |
  | slug        | contact-us                            |
  | status      | draft                                 |
  | tenant_id  | company-123                           |
  | created_by  | [authz_user_id]                       |
And the forms.form_created event is published
And I can see the form in my forms list
```

**Technical Notes:**
- Slug auto-generated from name (e.g., "Contact Us" → "contact-us")
- Status defaults to 'draft'
- Branding and settings stored as JSONB
- Multi-tenancy: tenant_id auto-set from current session

---

### Scenario: Create form with duplicate name in same company
**Tags**: `@edge-case @domain:forms @validation`

```gherkin
Given I am logged in as "admin@acme.com" in company "company-123"
And a form exists with name "Contact Us" in company "company-123"
When I attempt to create a form with name "Contact Us"
Then the creation fails with error "Form name must be unique within company"
And no Form record is created
```

---

### Scenario: Create form with duplicate name in different company (should succeed)
**Tags**: `@multi-tenancy @domain:forms @happy-path`

```gherkin
Given a form exists with name "Contact Us" in company "company-123"
And I am logged in as "admin@other.com" in company "company-456"
When I create a form with name "Contact Us"
Then a Form record is created successfully
And the form belongs to company "company-456"
```

**Technical Notes:**
- Form names are unique per company, not globally
- Multi-tenancy ensures data isolation

---

### Scenario: Publish a form
**Tags**: `@happy-path @domain:forms @priority:high @form-publishing`

```gherkin
Given I am logged in as "manager@acme.com" with role "manager"
And a form exists with:
  | field  | value      |
  | name   | Contact Us |
  | status | draft      |
And the form has at least 1 field
When I publish the form
Then the form status changes to "published"
And published_at is set to current timestamp
And the forms.form_published event is published
And the form is accessible via public URL "/forms/embed/contact-us"
```

**Technical Notes:**
- Cannot publish without at least 1 field
- published_at timestamp immutable after first publish
- Public URL uses form slug

---

### Scenario: Attempt to publish form without fields
**Tags**: `@edge-case @domain:forms @validation`

```gherkin
Given I am logged in as "admin@acme.com"
And a form exists with status "draft"
And the form has 0 fields
When I attempt to publish the form
Then the publish fails with error "Form must have at least 1 field to publish"
And the form status remains "draft"
```

---

### Scenario: Update draft form
**Tags**: `@happy-path @domain:forms @form-editing`

```gherkin
Given I am logged in as "manager@acme.com"
And a form exists with:
  | field  | value      |
  | name   | Contact Us |
  | status | draft      |
When I update the form with:
  | field       | value                          |
  | name        | Contact Form                   |
  | description | Reach out to our sales team    |
  | branding    | {"primary_color": "#10B981"}   |
Then the form is updated successfully
And updated_at timestamp is refreshed
```

---

### Scenario: Attempt to update published form (should fail)
**Tags**: `@edge-case @domain:forms @validation @immutability`

```gherkin
Given I am logged in as "admin@acme.com"
And a form exists with status "published"
When I attempt to update the form name to "New Name"
Then the update fails with error "Cannot modify published forms"
And the form name remains unchanged
```

**Technical Notes:**
- Published forms are immutable (fields cannot be added/removed)
- To change published form, must create new version via duplication

---

### Scenario: Archive a published form
**Tags**: `@happy-path @domain:forms @form-archiving`

```gherkin
Given I am logged in as "admin@acme.com" with role "admin"
And a form exists with:
  | field  | value     |
  | name   | Old Form  |
  | status | published |
And the form has 50 submissions
When I archive the form
Then the form status changes to "archived"
And the forms.form_archived event is published
And the public URL returns 404
And existing submissions remain accessible
And the form fields are preserved (read-only)
```

**Technical Notes:**
- Only admins can archive (managers cannot)
- Submissions are never deleted when form is archived
- Archive action is one-way (cannot un-archive)

---

### Scenario: Attempt to archive as manager (should fail)
**Tags**: `@authorization @domain:forms @edge-case`

```gherkin
Given I am logged in as "manager@acme.com" with role "manager"
And a form exists with status "published"
When I attempt to archive the form
Then the action fails with error "Insufficient permissions"
And the form status remains "published"
```

---

### Scenario: Duplicate a form
**Tags**: `@happy-path @domain:forms @priority:medium @form-duplication`

```gherkin
Given I am logged in as "manager@acme.com"
And a form exists with:
  | field       | value              |
  | name        | Contact Us         |
  | slug        | contact-us         |
  | status      | published          |
And the form has 3 fields
When I duplicate the form
Then a new Form record is created with:
  | field       | value                |
  | name        | Contact Us (copy)    |
  | slug        | contact-us-copy      |
  | status      | draft                |
  | created_by  | [my_authz_user_id]   |
And all 3 fields are copied with new IDs
And field positions match the original form
And published_at is null (reset)
And the forms.form_duplicated event is published
```

**Technical Notes:**
- Duplication creates deep copy (form + all fields)
- New form always starts as 'draft' regardless of source status
- Useful for creating form templates
- Submissions are NOT copied

---

### Scenario: View forms list for my company
**Tags**: `@happy-path @domain:forms @multi-tenancy @form-listing`

```gherkin
Given I am logged in as "user@acme.com" in company "company-123"
And 3 forms exist in company "company-123":
  | name        | status    |
  | Contact Us  | published |
  | Demo Form   | draft     |
  | Old Form    | archived  |
And 2 forms exist in company "company-456"
When I view my forms list
Then I see 3 forms (all from my company)
And I do NOT see forms from other companies
And forms are ordered by updated_at DESC
```

**Technical Notes:**
- Multi-tenancy: Only show forms from user's current company
- Default ordering: most recently updated first
- Includes draft, published, and archived forms

---

### Scenario: Regular user cannot create forms
**Tags**: `@authorization @domain:forms @edge-case`

```gherkin
Given I am logged in as "viewer@acme.com" with role "user"
When I attempt to create a form
Then the action fails with error "Insufficient permissions"
And no Form record is created
```

**Technical Notes:**
- Only admin and manager roles can create forms
- Regular users can view forms only

---

### Scenario: Customize form branding
**Tags**: `@happy-path @domain:forms @form-customization`

```gherkin
Given I am logged in as "admin@acme.com"
And a form exists with status "draft"
When I update the form branding with:
  | field            | value                          |
  | primary_color    | #10B981                        |
  | logo_url         | https://acme.com/logo.png      |
  | background_color | #FFFFFF                        |
  | text_color       | #1F2937                        |
  | font_family      | Inter                          |
Then the form branding is updated
And the branding JSONB contains all 5 values
And I can preview the styled form
```

**Technical Notes:**
- Branding stored as JSONB
- Primary color must be valid hex format (#RRGGBB)
- Logo URL must be valid URL
- Form preview uses branding to render styled HTML

---

### Scenario: Configure form settings
**Tags**: `@happy-path @domain:forms @form-customization`

```gherkin
Given I am logged in as "manager@acme.com"
And a form exists with status "draft"
When I update the form settings with:
  | field                     | value                                   |
  | redirect_url              | https://acme.com/thank-you              |
  | success_message           | Thanks! We'll contact you within 24hrs  |
  | collect_utm_params        | true                                    |
  | allow_multiple_submissions| false                                   |
Then the form settings are updated
And the settings JSONB contains all 4 values
```

**Technical Notes:**
- Settings stored as JSONB
- redirect_url must be valid URL if provided
- collect_utm_params controls whether UTM parameters are captured in metadata

---

### Scenario: View form analytics summary
**Tags**: `@happy-path @domain:forms @analytics`

```gherkin
Given I am logged in as "admin@acme.com"
And a form exists with:
  | field  | value      |
  | name   | Contact Us |
  | status | published  |
And the form has 100 submissions
And 5 submissions are deleted
When I view the form details
Then I see analytics:
  | metric            | value |
  | total_submissions | 95    |
  | last_submission   | 2 hours ago |
  | conversion_rate   | 5.2%  |
```

**Technical Notes:**
- total_submissions excludes deleted
- Calculated via Ash aggregates
- Real-time calculation (no caching in MVP)

---

## Test Coverage Requirements

**Critical Paths** (Must Test):
- [ ] Create form with valid data
- [ ] Publish form (happy path)
- [ ] Archive form (admin only)
- [ ] Duplicate form (form + fields copied)
- [ ] Multi-tenancy: Cannot access other company's forms
- [ ] Authorization: Only admin/manager can create/update
- [ ] Validation: Cannot publish without fields
- [ ] Immutability: Cannot update published form

**Edge Cases** (Should Test):
- [ ] Duplicate name within company
- [ ] Invalid slug format
- [ ] Manager attempts to archive (should fail)
- [ ] User attempts to create (should fail)
- [ ] Update archived form (should fail)

**Performance** (Should Monitor):
- [ ] List forms with 100+ forms (pagination)
- [ ] Duplicate form with 50+ fields
- [ ] Form analytics calculation <500ms

---

## Related Features
- [form_builder.feature.md](./form_builder.feature.md) - Adding and managing fields
- [lead_management.feature.md](./lead_management.feature.md) - Viewing and managing submissions
- [analytics_dashboard.feature.md](./analytics_dashboard.feature.md) - Form performance metrics
