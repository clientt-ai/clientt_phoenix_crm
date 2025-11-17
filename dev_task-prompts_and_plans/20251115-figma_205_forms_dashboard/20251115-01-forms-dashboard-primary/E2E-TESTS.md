# E2E Tests - Dashboard & Critical Paths

**Track:** 01 - Forms Dashboard Primary
**Priority:** P1 (Critical) - Must Pass Before Release
**Test Count:** 12-15 tests
**Execution Time:** 5-10 minutes
**Run:** Every commit (blocking CI/CD)

---

## Overview

This track focuses on **critical path tests** that verify core functionality. These tests MUST pass before any release and run on every commit.

**Test Coverage:**
- ✅ Authentication & authorization
- ✅ Dashboard KPIs display
- ✅ Form creation & publishing (critical path)
- ✅ Public form submission (critical path)
- ✅ Role-based access control (RBAC)

---

## Test Location

```
playwright_tests/tests/forms_dashboard/critical/
├── 01-authentication.spec.js
├── 02-dashboard-kpis.spec.js
├── 03-form-creation.spec.js
├── 04-form-submission.spec.js
└── 05-role-based-access.spec.js
```

---

## Test Suites

### 1. Authentication & Authorization (4-5 tests)
**File:** `01-authentication.spec.js`

**Tests:**
- ✅ User can sign in with valid credentials
- ✅ User cannot access dashboard without authentication
- ✅ Invalid credentials show error message
- ✅ User can sign out successfully
- ✅ Session timeout redirects to login

**Example:**
```javascript
test('user can sign in with valid credentials', async ({ page }) => {
  // Given: I am on the sign-in page
  await page.goto('/sign-in');

  // When: I enter valid credentials
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Then: I am redirected to the dashboard
  await page.waitForURL('**/dashboard');
  await expect(page.locator('[data-test="dashboard"]')).toBeVisible();
});
```

**Why Critical:** Security foundation - no authentication means no access control.

---

### 2. Dashboard KPIs (3-4 tests)
**File:** `02-dashboard-kpis.spec.js`

**Tests:**
- ✅ Total Forms KPI shows accurate count
- ✅ Total Submissions KPI shows accurate count
- ✅ Conversion Rate KPI calculates correctly
- ✅ KPIs update after creating form/submission

**Example:**
```javascript
test('total forms KPI shows accurate count', async ({ page }) => {
  // Given: I am logged in as form_admin
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // And: I have 5 forms in the system
  await createForms(page, 5);

  // When: I navigate to the dashboard
  await page.goto('/dashboard');

  // Then: Total Forms KPI shows 5
  const kpi = page.locator('[data-test="kpi-total-forms"]');
  const value = await kpi.locator('[data-test="kpi-value"]').textContent();
  expect(value.trim()).toBe('5');
});
```

**Why Critical:** Dashboard is the first thing users see - KPIs must be accurate.

---

### 3. Form Creation & Publishing (3-4 tests)
**File:** `03-form-creation.spec.js`

**Tests:**
- ✅ form_admin can create form with basic fields (text, email, textarea)
- ✅ form_admin can publish form (status changes to "published")
- ✅ Published form has unique public URL (slug)
- ✅ Draft form does not have public URL

**Example:**
```javascript
test('form_admin can create and publish form', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: I am on the form builder
  await page.goto('/forms/new');

  // When: I create a contact form
  await page.fill('[data-test="form-name"]', 'Contact Us');
  await page.fill('[data-test="form-description"]', 'Get in touch');

  // Add fields
  await page.click('[data-test="add-field-text"]');
  await page.fill('[data-test="field-label"]', 'Full Name');
  await page.check('[data-test="field-required"]');

  await page.click('[data-test="add-field-email"]');
  await page.fill('[data-test="field-label"]', 'Email');
  await page.check('[data-test="field-required"]');

  // Save as draft
  await page.click('[data-test="save-form"]');
  await page.waitForSelector('[data-test="toast-success"]');

  // Then: Form status is draft
  expect(await page.locator('[data-test="form-status"]').textContent()).toBe('draft');

  // When: I publish the form
  await page.click('[data-test="publish-button"]');
  await page.click('[data-test="confirm-publish"]');

  // Then: Form status is published and has public URL
  expect(await page.locator('[data-test="form-status"]').textContent()).toBe('published');
  const url = await page.locator('[data-test="form-public-url"]').textContent();
  expect(url).toContain('/f/contact-us');
});
```

**Why Critical:** Core business value - users must be able to create and publish forms.

---

### 4. Public Form Submission (2-3 tests)
**File:** `04-form-submission.spec.js`

**Tests:**
- ✅ Unauthenticated user can submit published form
- ✅ Submission data is saved correctly
- ✅ Confirmation message shown after submission

**Example:**
```javascript
test('unauthenticated user can submit published form', async ({ page }) => {
  // Given: A published form exists
  const formSlug = 'contact-us'; // Pre-created in setup

  // When: An unauthenticated user visits the public form
  await page.goto(`/f/${formSlug}`);

  // Then: The form is visible
  await expect(page.locator('[data-test="public-form"]')).toBeVisible();

  // When: User fills out and submits the form
  await page.fill('[data-test="field-full-name"]', 'John Doe');
  await page.fill('[data-test="field-email"]', 'john@example.com');
  await page.fill('[data-test="field-message"]', 'I need more information');
  await page.click('[data-test="submit-button"]');

  // Then: Success message is shown
  await expect(page.locator('[data-test="submission-success"]')).toBeVisible();
  await expect(page.locator('[data-test="success-message"]')).toContainText('Thank you');
});
```

**Why Critical:** Primary use case - public forms must accept submissions.

---

### 5. Role-Based Access Control (2-3 tests)
**File:** `05-role-based-access.spec.js`

**Tests:**
- ✅ form_admin can create forms, form_viewer cannot
- ✅ lead_admin can export submissions, lead_viewer cannot
- ✅ Unauthorized access returns 403 or redirects to login

**Role Matrix:**

| Feature | form_admin | form_viewer | lead_admin | lead_viewer | unauthenticated |
|---------|-----------|-------------|-----------|-------------|--------------------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Forms | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Form | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Form | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publish Form | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Submissions | ✅ | ❌ | ✅ | ✅ | ❌ |
| Export Submissions | ❌ | ❌ | ✅ | ❌ | ❌ |
| Submit Form | ❌ | ❌ | ❌ | ❌ | ✅ (public) |

**Example:**
```javascript
test('form_viewer cannot create forms', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-viewer.json' });

  // Given: I am logged in as form_viewer
  await page.goto('/forms');

  // Then: Create Form button is NOT visible
  await expect(page.locator('[data-test="create-form-button"]')).not.toBeVisible();

  // When: I try to directly navigate to form builder
  await page.goto('/forms/new');

  // Then: I am redirected or see 403
  await page.waitForURL(/\/(forms|403)/);
  expect(page.url()).not.toContain('/forms/new');
});
```

**Why Critical:** Security - roles must be enforced to prevent unauthorized actions.

---

## Test Data Requirements

### User Fixtures
```javascript
// fixtures/users.js
export const users = {
  formAdmin: {
    email: 'admin@example.com',
    password: 'SecurePass123!',
    roles: ['form_admin'],
  },
  formViewer: {
    email: 'viewer@example.com',
    password: 'SecurePass123!',
    roles: ['form_viewer'],
  },
  leadAdmin: {
    email: 'lead-admin@example.com',
    password: 'SecurePass123!',
    roles: ['lead_admin'],
  },
  leadViewer: {
    email: 'lead-viewer@example.com',
    password: 'SecurePass123!',
    roles: ['lead_viewer'],
  },
};
```

### Global Setup (Shared Authentication)
```javascript
// global-setup.js
// Authenticate once per role, save storage state
// Reuse across tests for fast execution

for (const [role, userData] of Object.entries(users)) {
  const page = await browser.newPage();
  await page.goto('/sign-in');
  await page.fill('[name="email"]', userData.email);
  await page.fill('[name="password"]', userData.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');

  await page.context().storageState({
    path: `playwright/.auth/${role}.json`
  });
}
```

---

## Success Criteria

Before marking critical tests complete:

- [ ] All tests pass on first run
- [ ] All tests pass 3 times in a row (no flakes)
- [ ] Tests run in parallel successfully
- [ ] Tests clean up their own data
- [ ] Tests pass in all 3 browsers (Chromium, Firefox, WebKit)
- [ ] CI/CD pipeline runs these tests on every PR
- [ ] Tests complete in < 10 minutes

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Critical Tests (PR Gate)

on:
  pull_request:
    branches: [main, develop]

jobs:
  critical-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup dependencies
        run: cd playwright_tests && npm ci
      - name: Install browsers
        run: npx playwright install --with-deps
      - name: Setup database
        run: cd clientt_crm_app && mix ash.setup
      - name: Run critical tests
        run: npm run test:critical
      - name: Upload report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: critical-test-failures
          path: playwright_tests/playwright-report/
```

---

## Related Documentation

- [Primary Overview](./00-PRIMARY-OVERVIEW.md) - Feature requirements this track implements
- [LiveView UI Track](../20251115-02-forms-liveview-ui/README.md) - UI components tested here
- [Domain Models Track](../20251115-03-forms-domain-models/README.md) - Data models tested here

---

**Priority:** P1 (Critical)
**Status:** ✅ Ready for implementation
**Next Step:** Implement Track 2 features, then write these critical tests
