# E2E Tests - Domain Models & Forms Management

**Track:** 03 - Forms Domain Models
**Priority:** P2 (Features) + P4 (Regression) - Run Nightly
**Test Count:** 18-23 tests
**Execution Time:** 12-18 minutes
**Run:** Nightly builds + pre-release

---

## Overview

This track focuses on **forms management and data integrity tests** that verify CRUD operations, form lifecycle, validation rules, and edge cases.

**Test Coverage:**
- ✅ Forms CRUD operations (P2)
- ✅ Form lifecycle (draft → published → archived) (P2)
- ✅ Submissions viewing and management (P2)
- ✅ Validation rules (P4)
- ✅ Edge cases and error handling (P4)

---

## Test Location

```
playwright_tests/tests/forms_dashboard/
├── features/forms/
│   ├── forms-list.spec.js
│   ├── form-builder.spec.js
│   ├── form-details.spec.js
│   ├── form-lifecycle.spec.js
│   └── form-duplication.spec.js
├── features/submissions/
│   ├── submission-list.spec.js
│   ├── submission-details.spec.js
│   └── submission-export.spec.js
└── regression/
    ├── validation.spec.js
    └── edge-cases.spec.js
```

---

## Feature Tests (P2)

### 1. Forms List Tests (3-4 tests)
**File:** `features/forms/forms-list.spec.js`

**Tests:**
- ✅ View all forms in list/grid
- ✅ Search forms by name
- ✅ Filter by status (draft, published, archived)
- ✅ Sort forms (name, created date, submissions)

**Example:**
```javascript
test('search forms by name', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: Multiple forms exist
  await createForm(page, { name: 'Contact Us' });
  await createForm(page, { name: 'Newsletter Signup' });
  await createForm(page, { name: 'Contact Form' });

  // When: I search for "Contact"
  await page.goto('/forms');
  await page.fill('[data-test="search-forms"]', 'Contact');

  // Then: Only matching forms are shown
  await expect(page.locator('[data-test^="form-card-"]')).toHaveCount(2);
  await expect(page.locator('[data-test="form-card-Contact Us"]')).toBeVisible();
  await expect(page.locator('[data-test="form-card-Contact Form"]')).toBeVisible();
  await expect(page.locator('[data-test="form-card-Newsletter Signup"]')).not.toBeVisible();
});

test('filter forms by status', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: Forms with different statuses
  await createForm(page, { name: 'Draft Form', status: 'draft' });
  await createForm(page, { name: 'Published Form', status: 'published' });

  await page.goto('/forms');

  // When: I filter by published
  await page.selectOption('[data-test="filter-status"]', 'published');

  // Then: Only published forms shown
  await expect(page.locator('[data-test="form-card-Published Form"]')).toBeVisible();
  await expect(page.locator('[data-test="form-card-Draft Form"]')).not.toBeVisible();
});
```

---

### 2. Form Builder Tests (5-6 tests)
**File:** `features/forms/form-builder.spec.js`

**Tests:**
- ✅ Add text, email, textarea, select, checkbox, radio fields
- ✅ Reorder fields (drag-drop or up/down buttons)
- ✅ Mark fields as required
- ✅ Set field validation rules (email format, min/max length)
- ✅ Save form as draft
- ✅ Preview form before publishing

**Example:**
```javascript
test('add multiple field types', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/forms/new');

  // Add text field
  await page.click('[data-test="add-field-text"]');
  await page.fill('[data-test="field-0-label"]', 'Full Name');
  await page.check('[data-test="field-0-required"]');

  // Add email field
  await page.click('[data-test="add-field-email"]');
  await page.fill('[data-test="field-1-label"]', 'Email Address');
  await page.check('[data-test="field-1-required"]');

  // Add select field
  await page.click('[data-test="add-field-select"]');
  await page.fill('[data-test="field-2-label"]', 'Department');
  await page.fill('[data-test="field-2-options"]', 'Sales\nSupport\nBilling');

  // Verify all fields present
  await expect(page.locator('[data-test="field-0"]')).toBeVisible();
  await expect(page.locator('[data-test="field-1"]')).toBeVisible();
  await expect(page.locator('[data-test="field-2"]')).toBeVisible();
});

test('set validation rules on field', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/forms/new');

  // Add text field with min/max length
  await page.click('[data-test="add-field-text"]');
  await page.fill('[data-test="field-0-label"]', 'Username');
  await page.fill('[data-test="field-0-min-length"]', '3');
  await page.fill('[data-test="field-0-max-length"]', '20');

  // Save and verify validation rules applied
  await page.click('[data-test="save-form"]');

  // Preview the form
  await page.click('[data-test="preview-button"]');

  // Try to submit with too short username
  await page.fill('[data-test="field-Username"]', 'ab');
  await page.click('[data-test="submit-button"]');

  // Validation error shown
  await expect(page.locator('[data-test="field-error-Username"]')).toContainText('at least 3 characters');
});
```

---

### 3. Form Lifecycle Tests (3-4 tests)
**File:** `features/forms/form-lifecycle.spec.js`

**Tests:**
- ✅ Create draft → Publish → Unpublish (if allowed)
- ✅ Cannot submit to draft form
- ✅ Can submit to published form
- ✅ Archived form shows "No longer accepting submissions"

**Example:**
```javascript
test('form lifecycle: draft to published to archived', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Create draft form
  await page.goto('/forms/new');
  await page.fill('[data-test="form-name"]', 'Event Registration');
  await page.click('[data-test="add-field-text"]');
  await page.fill('[data-test="field-0-label"]', 'Name');
  await page.click('[data-test="save-form"]');

  // Status is draft
  await expect(page.locator('[data-test="form-status"]')).toContainText('draft');

  // Draft form has no public URL
  await expect(page.locator('[data-test="form-public-url"]')).not.toBeVisible();

  // Publish the form
  await page.click('[data-test="publish-button"]');
  await page.click('[data-test="confirm-publish"]');

  // Status is published
  await expect(page.locator('[data-test="form-status"]')).toContainText('published');

  // Public URL is visible
  const publicUrl = await page.locator('[data-test="form-public-url"]').textContent();
  expect(publicUrl).toContain('/f/event-registration');

  // Archive the form
  await page.click('[data-test="archive-button"]');
  await page.click('[data-test="confirm-archive"]');

  // Status is archived
  await expect(page.locator('[data-test="form-status"]')).toContainText('archived');

  // Visit public URL - should show archived message
  await page.goto(publicUrl);
  await expect(page.locator('[data-test="archived-message"]')).toContainText('no longer accepting submissions');
});
```

---

### 4. Submissions Tests (4-5 tests)
**File:** `features/submissions/submission-list.spec.js`

**Tests:**
- ✅ lead_admin can view all submissions
- ✅ lead_viewer can view but not export
- ✅ View submission details (all field values)
- ✅ Export submissions to CSV (lead_admin only)
- ✅ Submission timestamps are accurate

**Example:**
```javascript
test('lead_admin can export submissions to CSV', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/lead-admin.json' });

  // Given: A form with submissions
  const formSlug = 'contact-us'; // Pre-created with 5 submissions

  await page.goto(`/forms/${formSlug}`);
  await page.click('[data-test="submissions-tab"]');

  // When: I click export CSV
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-test="export-csv-button"]'),
  ]);

  // Then: CSV is downloaded
  expect(download.suggestedFilename()).toMatch(/submissions.*\.csv/);

  // Verify CSV content
  const path = await download.path();
  const csvContent = await fs.readFile(path, 'utf-8');

  // Has header row
  expect(csvContent).toContain('Name,Email,Message,Submitted At');

  // Has data rows
  const rows = csvContent.split('\n');
  expect(rows.length).toBeGreaterThan(5); // Header + 5 submissions
});
```

---

## Regression Tests (P4)

### 5. Validation Tests (6-8 tests)
**File:** `regression/validation.spec.js`

**Tests:**
- ✅ Email field validates email format
- ✅ Required fields prevent form submission
- ✅ Min/max length validation enforced
- ✅ Number fields only accept numeric input
- ✅ Select field requires selection if required
- ✅ Checkbox/radio validation works
- ✅ Error messages are clear and actionable
- ✅ Multiple errors shown simultaneously

**Example:**
```javascript
test('email field validates format', async ({ page }) => {
  // Given: A published form with email field
  const formSlug = 'contact-us';

  await page.goto(`/f/${formSlug}`);

  // When: I enter invalid email
  await page.fill('[data-test="field-Email"]', 'invalid-email');
  await page.click('[data-test="submit-button"]');

  // Then: Validation error shown
  await expect(page.locator('[data-test="field-error-Email"]')).toContainText('valid email address');

  // When: I enter valid email
  await page.fill('[data-test="field-Email"]', 'valid@example.com');
  await page.click('[data-test="submit-button"]');

  // Then: No validation error
  await expect(page.locator('[data-test="field-error-Email"]')).not.toBeVisible();
});

test('required fields prevent submission', async ({ page }) => {
  const formSlug = 'contact-us';

  await page.goto(`/f/${formSlug}`);

  // Try to submit with empty required fields
  await page.click('[data-test="submit-button"]');

  // Validation errors shown for all required fields
  await expect(page.locator('[data-test="field-error-Name"]')).toContainText('required');
  await expect(page.locator('[data-test="field-error-Email"]')).toContainText('required');

  // Form is not submitted
  await expect(page.locator('[data-test="submission-success"]')).not.toBeVisible();
});
```

---

### 6. Edge Cases Tests (4-6 tests)
**File:** `regression/edge-cases.spec.js`

**Tests:**
- ✅ Form with 50+ fields renders correctly
- ✅ Form with very long field labels/descriptions
- ✅ Submission with special characters (emoji, quotes, etc.)
- ✅ Form deletion with existing submissions (confirm dialog)
- ✅ Empty states (no forms, no submissions)
- ✅ Concurrent form edits (optimistic locking if implemented)

**Example:**
```javascript
test('form with many fields renders correctly', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/forms/new');

  // Add 60 fields
  for (let i = 0; i < 60; i++) {
    await page.click('[data-test="add-field-text"]');
    await page.fill(`[data-test="field-${i}-label"]`, `Field ${i + 1}`);
  }

  // Save form
  await page.click('[data-test="save-form"]');

  // All fields should be visible (may need to scroll)
  const fieldCount = await page.locator('[data-test^="field-"]').count();
  expect(fieldCount).toBe(60);
});

test('submission with special characters', async ({ page }) => {
  const formSlug = 'contact-us';

  await page.goto(`/f/${formSlug}`);

  // Submit with emoji and quotes
  await page.fill('[data-test="field-Name"]', 'John "The Rock" Doe 😀');
  await page.fill('[data-test="field-Email"]', 'john@example.com');
  await page.fill('[data-test="field-Message"]', `Here's a message with 'quotes' and "double quotes"`);

  await page.click('[data-test="submit-button"]');

  // Success
  await expect(page.locator('[data-test="submission-success"]')).toBeVisible();

  // Verify data saved correctly (as admin)
  test.use({ storageState: 'playwright/.auth/lead-admin.json' });
  await page.goto(`/forms/${formSlug}/submissions`);

  // Special characters preserved
  await expect(page.locator('[data-test="submission-row"]').first()).toContainText('John "The Rock" Doe 😀');
});

test('empty state shown when no forms exist', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Delete all forms
  await deleteAllForms(page);

  await page.goto('/forms');

  // Empty state shown
  await expect(page.locator('[data-test="empty-state"]')).toBeVisible();
  await expect(page.locator('[data-test="empty-state"]')).toContainText('Create your first form');

  // Create form button in empty state
  await expect(page.locator('[data-test="empty-state-create-button"]')).toBeVisible();
});
```

---

## Test Data Requirements

### Form Fixtures
```javascript
// fixtures/forms.js
export const forms = {
  contactForm: {
    name: 'Contact Us',
    description: 'Get in touch with our team',
    status: 'published',
    fields: [
      { type: 'text', label: 'Full Name', required: true },
      { type: 'email', label: 'Email Address', required: true },
      { type: 'textarea', label: 'Message', required: true },
    ],
  },
  surveyForm: {
    name: 'Customer Survey',
    description: 'Help us improve',
    status: 'draft',
    fields: [
      { type: 'radio', label: 'Satisfaction', options: ['Very Satisfied', 'Satisfied', 'Neutral'], required: true },
      { type: 'textarea', label: 'Comments', required: false },
    ],
  },
};
```

### Helper Functions
```javascript
// support/helpers/forms.js
export async function createForm(page, formData) {
  await page.goto('/forms/new');
  await page.fill('[data-test="form-name"]', formData.name);
  await page.fill('[data-test="form-description"]', formData.description || '');

  for (const field of formData.fields || []) {
    await page.click(`[data-test="add-field-${field.type}"]`);
    // Configure field...
  }

  await page.click('[data-test="save-form"]');
  await page.waitForSelector('[data-test="toast-success"]');
}

export async function publishForm(page, formName) {
  await page.goto('/forms');
  const formCard = page.locator(`[data-test="form-card-${formName}"]`);
  await formCard.locator('[data-test="publish-button"]').click();
  await page.locator('[data-test="confirm-publish"]').click();
  await page.waitForSelector('[data-test="toast-success"]');
}
```

---

## Success Criteria

- [ ] All P2 feature tests pass 80%+
- [ ] All P4 regression tests pass
- [ ] Each MVP feature has at least one test
- [ ] Role variations tested for each feature
- [ ] Tests run in < 20 minutes
- [ ] No flaky tests

---

## Related Documentation

- [Domain Models Implementation](./README.md) - Ash resources and schemas
- [Primary Overview](../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md) - Feature requirements
- [Figma Source](../../figma_src/205 Forms Dashboard/src/components/pages/FormBuilderPage.tsx) - Original designs

---

**Priority:** P2 (Features) + P4 (Regression)
**Status:** ✅ Ready for implementation
**Next Step:** Implement domain models, then write feature and regression tests
