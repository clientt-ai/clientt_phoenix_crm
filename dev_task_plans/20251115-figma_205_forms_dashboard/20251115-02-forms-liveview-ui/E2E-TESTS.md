# E2E Tests - LiveView UI & Layout

**Track:** 02 - Forms LiveView UI
**Priority:** P3 (Layout/UI) - Run Weekly
**Test Count:** 16-23 tests
**Execution Time:** 10-15 minutes
**Run:** Weekly regression builds

---

## Overview

This track focuses on **layout and UI consistency tests** that verify shared components, responsive design, and accessibility across the application.

**Test Coverage:**
- ✅ Shared layout (Header + Sidebar)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Dark mode (if MVP)
- ✅ Accessibility (WCAG AA compliance)

---

## Test Location

```
playwright_tests/tests/forms_dashboard/layout/
├── 01-shared-layout.spec.js
├── 02-responsive-design.spec.js
├── 03-dark-mode.spec.js
└── 04-accessibility.spec.js
```

---

## Test Suites

### 1. Shared Layout Tests (6-8 tests)
**File:** `01-shared-layout.spec.js`

**Header Tests:**
- ✅ Header displays user avatar and name
- ✅ Header dropdown shows sign out option
- ✅ Header dropdown shows settings link
- ✅ Logo click navigates to dashboard

**Sidebar Tests:**
- ✅ Sidebar shows role-appropriate modules
  - form_admin/form_viewer sees "Forms" module
  - lead_admin/lead_viewer sees "Leads" module
  - All users see "Dashboard" and "Settings"
- ✅ Navigation works (clicking sidebar links)
- ✅ Active page highlighted in sidebar
- ✅ Sidebar persists across page navigations

**Example:**
```javascript
test('sidebar shows role-appropriate modules', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/dashboard');

  // Form admin sees Forms module
  await expect(page.locator('[data-test="sidebar-forms"]')).toBeVisible();

  // Form admin does not see Leads module
  await expect(page.locator('[data-test="sidebar-leads"]')).not.toBeVisible();

  // All users see Dashboard and Settings
  await expect(page.locator('[data-test="sidebar-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-test="sidebar-settings"]')).toBeVisible();
});

test('active page is highlighted in sidebar', async ({ page }) => {
  await page.goto('/forms');

  // Forms link has active class
  const formsLink = page.locator('[data-test="sidebar-forms"]');
  const classes = await formsLink.getAttribute('class');
  expect(classes).toContain('active');

  // Dashboard link does not have active class
  const dashboardLink = page.locator('[data-test="sidebar-dashboard"]');
  const dashboardClasses = await dashboardLink.getAttribute('class');
  expect(dashboardClasses).not.toContain('active');
});
```

**Why Important:** Shared layout appears on every page - bugs here affect the entire application.

---

### 2. Responsive Design Tests (4-6 tests)
**File:** `02-responsive-design.spec.js`

**Viewport Sizes:**
- Desktop: 1920x1080 (Full HD)
- Tablet: 768x1024 (iPad)
- Mobile: 375x667 (iPhone)

**Tests:**
- ✅ Desktop layout shows expanded sidebar
- ✅ Tablet layout collapses sidebar to hamburger menu
- ✅ Mobile layout shows hamburger menu
- ✅ Forms list switches to single column on mobile
- ✅ Form builder fields stack on mobile
- ✅ Touch targets are ≥ 44x44px on mobile

**Example:**
```javascript
test('mobile layout shows hamburger menu', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/dashboard');

  // Sidebar is hidden by default
  await expect(page.locator('[data-test="sidebar"]')).not.toBeVisible();

  // Hamburger menu is visible
  await expect(page.locator('[data-test="hamburger-menu"]')).toBeVisible();

  // Click hamburger to open sidebar
  await page.click('[data-test="hamburger-menu"]');
  await expect(page.locator('[data-test="sidebar"]')).toBeVisible();
});

test('forms list is single column on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/forms');

  // Get grid layout
  const formsList = page.locator('[data-test="forms-list"]');
  const gridCols = await formsList.evaluate(el =>
    window.getComputedStyle(el).gridTemplateColumns
  );

  // Should be single column (one value in grid-template-columns)
  expect(gridCols.split(' ').length).toBe(1);
});
```

**Why Important:** Forms may be accessed on any device - responsive design ensures usability.

---

### 3. Dark Mode Tests (2-3 tests, if MVP)
**File:** `03-dark-mode.spec.js`

**Tests:**
- ✅ Toggle dark mode switch in header
- ✅ Theme persists across page navigations
- ✅ All pages render correctly in dark mode

**Example:**
```javascript
test('dark mode toggle works', async ({ page }) => {
  await page.goto('/dashboard');

  // Initially in light mode
  const body = page.locator('body');
  let classes = await body.getAttribute('class');
  expect(classes).not.toContain('dark');

  // Toggle dark mode
  await page.click('[data-test="dark-mode-toggle"]');

  // Body has dark class
  classes = await body.getAttribute('class');
  expect(classes).toContain('dark');
});

test('dark mode persists across navigation', async ({ page }) => {
  await page.goto('/dashboard');

  // Enable dark mode
  await page.click('[data-test="dark-mode-toggle"]');

  // Navigate to forms page
  await page.goto('/forms');

  // Dark mode still active
  const body = page.locator('body');
  const classes = await body.getAttribute('class');
  expect(classes).toContain('dark');
});
```

**Note:** Only implement if dark mode is part of MVP scope.

---

### 4. Accessibility Tests (4-6 tests)
**File:** `04-accessibility.spec.js`

**WCAG 2.1 Level AA Requirements:**
- ✅ Keyboard navigation works for all interactive elements
- ✅ Focus indicators visible
- ✅ Form labels properly associated with inputs
- ✅ ARIA labels present on icon buttons
- ✅ Color contrast meets 4.5:1 ratio
- ✅ Screen reader announces page changes

**Example:**
```javascript
import { injectAxe, checkA11y } from 'axe-playwright';

test('forms list is accessible', async ({ page }) => {
  await page.goto('/forms');

  // Run axe-core accessibility checks
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
  });
});

test('keyboard navigation works', async ({ page }) => {
  await page.goto('/forms');

  // Tab to Create Form button
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Check focus is on Create Form button
  const focused = await page.evaluate(() => document.activeElement.getAttribute('data-test'));
  expect(focused).toBe('create-form-button');

  // Press Enter to activate
  await page.keyboard.press('Enter');
  await page.waitForURL('**/forms/new');
});

test('form labels are properly associated', async ({ page }) => {
  await page.goto('/forms/new');

  // Check that label is associated with input
  const nameInput = page.locator('[data-test="form-name-input"]');
  const inputId = await nameInput.getAttribute('id');

  const label = page.locator(`label[for="${inputId}"]`);
  await expect(label).toBeVisible();
});

test('color contrast meets WCAG AA', async ({ page }) => {
  await page.goto('/dashboard');

  await injectAxe(page);
  await checkA11y(page, null, {
    rules: {
      'color-contrast': { enabled: true },
    },
  });
});
```

**Why Important:** Accessibility ensures the application is usable by everyone, including users with disabilities.

---

## Page Objects

### HeaderComponent
```javascript
// support/components/HeaderComponent.js
export class HeaderComponent {
  constructor(page) {
    this.page = page;
    this.logo = page.locator('[data-test="header-logo"]');
    this.userAvatar = page.locator('[data-test="user-avatar"]');
    this.userDropdown = page.locator('[data-test="user-dropdown"]');
    this.signOutButton = page.locator('[data-test="sign-out-button"]');
  }

  async clickLogo() {
    await this.logo.click();
    await this.page.waitForURL('**/dashboard');
  }

  async openUserDropdown() {
    await this.userAvatar.click();
    await this.userDropdown.waitFor({ state: 'visible' });
  }

  async signOut() {
    await this.openUserDropdown();
    await this.signOutButton.click();
    await this.page.waitForURL('**/sign-in');
  }
}
```

### SidebarComponent
```javascript
// support/components/SidebarComponent.js
export class SidebarComponent {
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('[data-test="sidebar"]');
    this.dashboardLink = page.locator('[data-test="sidebar-dashboard"]');
    this.formsLink = page.locator('[data-test="sidebar-forms"]');
    this.leadsLink = page.locator('[data-test="sidebar-leads"]');
    this.settingsLink = page.locator('[data-test="sidebar-settings"]');
  }

  async navigateTo(section) {
    const links = {
      dashboard: this.dashboardLink,
      forms: this.formsLink,
      leads: this.leadsLink,
      settings: this.settingsLink,
    };

    await links[section].click();
    await this.page.waitForURL(`**/${section}`);
  }

  async isActivePage(section) {
    const link = this.page.locator(`[data-test="sidebar-${section}"]`);
    const classes = await link.getAttribute('class');
    return classes.includes('active');
  }

  async hasModule(moduleName) {
    const link = this.page.locator(`[data-test="sidebar-${moduleName}"]`);
    return await link.isVisible();
  }
}
```

---

## Success Criteria

- [ ] All layout tests pass on desktop, tablet, mobile viewports
- [ ] Responsive breakpoints work correctly
- [ ] Dark mode (if MVP) works on all pages
- [ ] All pages pass axe-core accessibility checks
- [ ] Manual keyboard navigation works for all flows
- [ ] Tests pass in all 3 browsers

---

## Related Documentation

- [LiveView UI Implementation](./README.md) - Component implementation details
- [Primary Overview](../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md) - Feature requirements
- [Figma Source](../../figma_src/205 Forms Dashboard/src/components/layout/) - Original designs

---

**Priority:** P3 (Layout/UI)
**Status:** ✅ Ready for implementation
**Next Step:** Implement LiveView UI components, then write layout tests
