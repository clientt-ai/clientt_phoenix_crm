# Playwright E2E Tests for Clientt CRM

This directory contains end-to-end tests for the Clientt CRM Phoenix application using Playwright.

## Overview

This test suite is designed to:
- Run independently of the Phoenix application
- Follow BDD (Behavior-Driven Development) patterns
- Align with feature specifications
- Provide comprehensive coverage of user workflows

## Directory Structure

```
playwright_tests/
├── tests/
│   ├── modules/                      # Module-based test files (organized by feature/module)
│   │   ├── direct_links/             # Direct URL navigation tests
│   │   │   ├── unauthenticated/      # Public pages (sign-in, register, etc.)
│   │   │   └── authenticated/        # Authenticated pages by role
│   │   │       ├── admin/            # Admin role screenshots
│   │   │       ├── manager/          # Manager role screenshots
│   │   │       ├── user/             # User role screenshots
│   │   │       └── form_admin/       # Form admin role screenshots
│   │   ├── forms/                    # Form module tests (FM-SC-001 to FM-SC-008)
│   │   ├── navigation/               # Navigation module tests (NAV-SC-001, etc.)
│   │   └── {module_name}/            # Additional module tests go here
│   ├── features/                     # Feature-based test files (BDD scenarios)
│   │   ├── authentication.spec.js
│   │   └── navigation.spec.js
│   ├── examples/                     # Example tests demonstrating patterns
│   │   └── using-page-objects.spec.js
│   ├── support/                      # Helper functions and utilities
│   │   ├── auth-helpers.js           # Authentication helpers
│   │   ├── test-helpers.js           # General test utilities
│   │   └── pages/                    # Page Object Models
│   │       └── login-page.js
│   └── fixtures/                     # Test fixtures and setup
│       └── authenticated.js          # Pre-authenticated test fixture
├── screenshot-config.js              # Centralized screenshot path helper
├── playwright.config.js              # Playwright configuration
├── package.json                      # Node dependencies
├── .env.example                      # Environment variables template
└── README.md                         # This file
```

## Prerequisites

- Node.js (v18 or higher recommended)
- Phoenix application running on `http://localhost:4002` (or configured BASE_URL)
- Test user account with credentials set in `.env`

## Setup

### 1. Install Dependencies

```bash
cd playwright_tests
npm install
```

### 2. Install Playwright Browsers

```bash
npm run install:browsers
```

This installs the required browsers (Chromium, Firefox, WebKit) for testing.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your test settings:

```env
BASE_URL=http://localhost:4002
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=SecurePassword123!
```

### 4. Start Your Phoenix Application

In a separate terminal, from the `clientt_crm_app` directory:

```bash
mix phx.server
```

The application should be running on `http://localhost:4002`.

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode (with browser UI)

```bash
npm run test:headed
```

### Run Tests with UI Mode (interactive)

```bash
npm run test:ui
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Specific Feature Tests

```bash
npm run test:feature
```

### Run a Specific Test File

```bash
npx playwright test tests/features/authentication.spec.js
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Screenshots

### Using the Centralized Screenshot Helper

All tests should use the centralized screenshot configuration helper for consistent paths:

```javascript
const { createScreenshotHelper } = require('../../../../screenshot-config');

test.describe('My Test Suite', () => {
  const screenshot = createScreenshotHelper(__dirname);

  test('my test', async ({ page }) => {
    await page.goto('/some-page');
    await screenshot(page, '01-page-loaded');

    await page.click('button');
    await screenshot(page, '02-after-click');
  });
});
```

**Key Benefits:**
- ✅ Works at any nesting depth - no manual path calculation
- ✅ Screenshots automatically saved to correct location
- ✅ Mirrors test directory structure in screenshots directory
- ✅ All screenshots are 1920x1080 viewport (fullPage: false)

**Screenshot Paths:**
```
Test: playwright_tests/tests/modules/forms/FM-SC-001_create_form/test.spec.js
Screenshots: playwright_screenshots/playwright_tests/tests/modules/forms/FM-SC-001_create_form/

Test: playwright_tests/tests/modules/direct_links/authenticated/admin/test.spec.js
Screenshots: playwright_screenshots/playwright_tests/tests/modules/direct_links/authenticated/admin/
```

### Theme Variants (Light/Dark Mode)

For tests that need both light and dark mode screenshots:

```javascript
const { createScreenshotHelper } = require('../../../../screenshot-config');

test.describe('Theme Tests', () => {
  const screenshot = createScreenshotHelper(__dirname);

  async function captureThemeScreenshots(page, name) {
    // Light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-light`);

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-dark`);
  }

  test('dashboard theme', async ({ page }) => {
    await page.goto('/dashboard');
    await captureThemeScreenshots(page, '01-dashboard');
    // Creates: 01-dashboard-light.png and 01-dashboard-dark.png
  });
});
```

## Writing Tests

### BDD Pattern

Tests follow the Given-When-Then pattern:

```javascript
test('should do something', async ({ page }) => {
  // Given: Setup/preconditions
  await page.goto('/some-page');

  // When: Action
  await page.click('button');

  // Then: Assertion
  await expect(page.locator('.result')).toBeVisible();
});
```

### Using Helper Functions

```javascript
const { loginAsTestUser } = require('../support/auth-helpers');
const { waitForNetworkIdle } = require('../support/test-helpers');

test('my test', async ({ page }) => {
  await loginAsTestUser(page);
  await waitForNetworkIdle(page);
  // ... rest of test
});
```

### Using Page Object Model

```javascript
const { LoginPage } = require('../support/pages/login-page');

test('login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password');
});
```

### Using Authenticated Fixture

For tests that require authentication:

```javascript
const { test } = require('./fixtures/authenticated');
const { expect } = require('@playwright/test');

test('authenticated test', async ({ page }) => {
  // User is already logged in
  await page.goto('/dashboard');
  // ... test logic
});
```

## Test Organization

### Module Tests (`tests/modules/`)

**NEW:** Module-based tests are organized by application module or feature area. Each module has its own directory containing related test scenarios.

**Location:** `tests/modules/{module_name}/`

**Current Modules:**
- **direct_links/** - Direct URL navigation and screenshot tests
  - **unauthenticated/** - Public pages (sign-in, register, password-reset)
  - **authenticated/** - Authenticated pages by role (admin, manager, user, form_admin)
  - Tests light and dark mode themes for all pages
- **forms/** - Form builder tests (FM-SC-001 to FM-SC-008)
  - Create, configure, validate, list, edit, delete forms
  - Field type testing and validation
- **navigation/** - Navigation tests (NAV-SC-001, etc.)
  - Sidebar navigation, routing, etc.

**Adding New Module Tests:**

When creating new module tests, place them in `tests/modules/{module_name}/`:

```bash
# Example: Creating a new contacts module test
mkdir -p playwright_tests/tests/modules/contacts
```

Then create test files following the naming convention:
- `{MODULE}-SC-{NUMBER}_{description}/test.spec.js`
- Example: `CONT-SC-001_create_contact/test.spec.js`

### Feature Tests (`tests/features/`)

Organize tests by application features or user stories. Each feature file should contain related scenarios:

- `authentication.spec.js` - User registration, login, logout, password reset
- `navigation.spec.js` - Page navigation, routing, protected routes
- Add more features as needed (contacts, deals, reports, etc.)

### Example Tests (`tests/examples/`)

Demonstrate testing patterns and best practices. Use these as templates for new tests.

### Support Files (`tests/support/`)

Reusable helper functions, utilities, and page objects:

- **auth-helpers.js** - Authentication-related functions
- **test-helpers.js** - General utility functions
- **pages/** - Page Object Models for different pages

### Fixtures (`tests/fixtures/`)

Custom test fixtures for common setups:

- **authenticated.js** - Fixture that automatically logs in before each test

## Best Practices

### 1. Follow BDD Patterns

Structure tests with clear Given-When-Then comments:

```javascript
test('scenario description', async ({ page }) => {
  // Given: Initial state
  // When: Action performed
  // Then: Expected outcome
});
```

### 2. Use Page Object Model

Encapsulate page-specific logic in Page Objects:

```javascript
class ContactsPage {
  constructor(page) {
    this.page = page;
    this.addButton = 'button[data-test="add-contact"]';
  }

  async addContact(name, email) {
    await this.page.click(this.addButton);
    // ... implementation
  }
}
```

### 3. Use Helper Functions

Extract common operations into helper functions to reduce duplication.

### 4. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```javascript
test('should display error message when login fails with invalid credentials', ...)
```

### 5. Wait for Network Idle

After navigation or form submissions:

```javascript
await page.waitForLoadState('networkidle');
```

### 6. Use Data Attributes for Selectors

When possible, use `data-test` attributes in your Phoenix templates:

```heex
<button data-test="submit-form">Submit</button>
```

Then in tests:

```javascript
await page.click('[data-test="submit-form"]');
```

### 7. Generate Unique Test Data

For tests that create data:

```javascript
const { generateTestEmail } = require('../support/auth-helpers');
const email = generateTestEmail('newuser');
```

## Debugging

### Debug Mode

Run tests in debug mode to step through:

```bash
npm run test:debug
```

### Playwright Inspector

Use the Playwright Inspector for interactive debugging:

```bash
PWDEBUG=1 npx playwright test
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots (in `test-results/`)
- Videos (in `test-results/`)
- Traces (for replay in Playwright Trace Viewer)

### View Test Report

After running tests:

```bash
npm run test:report
```

## CI/CD Integration

The configuration is CI-ready. In CI environments:

- Tests run in headless mode
- Browser installation happens automatically
- Retries failed tests (2 retries in CI)
- Captures artifacts on failure

Example GitHub Actions:

```yaml
- name: Install dependencies
  run: |
    cd playwright_tests
    npm ci
    npx playwright install --with-deps

- name: Run tests
  run: |
    cd playwright_tests
    npm test
```

## Mapping BDD Scenarios to Tests

Each BDD scenario from your specification documents should have a corresponding test:

1. **Identify the Feature**: Determine which feature the scenario belongs to
2. **Create/Update Feature File**: Add test to appropriate file in `tests/features/`
3. **Follow BDD Structure**: Use Given-When-Then comments
4. **Use Descriptive Names**: Test name should match scenario description

Example mapping:

**BDD Spec:**
```
Feature: User Authentication
  Scenario: Successful user login
    Given a registered user exists
    When the user enters valid credentials
    Then the user should be logged in
```

**Playwright Test:**
```javascript
test.describe('Feature: User Authentication', () => {
  test('should allow a user to login with valid credentials', async ({ page }) => {
    // Given: a registered user exists
    const email = 'test@example.com';
    const password = 'SecurePassword123!';

    // When: the user enters valid credentials
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', email);
    await page.fill('input[name="user[password]"]', password);
    await page.click('button[type="submit"]');

    // Then: the user should be logged in
    await expect(page).not.toHaveURL(/.*sign-in/);
  });
});
```

## Code Generation

Playwright can help generate test code:

```bash
npm run test:codegen
```

This opens your application and records your actions, generating test code automatically.

## Troubleshooting

### Phoenix Server Not Running

Error: `webServer: timeout...`

**Solution:** Ensure Phoenix server is accessible at the BASE_URL

### Browser Installation Issues

Error: `Executable doesn't exist...`

**Solution:** Run `npm run install:browsers`

### Flaky Tests

**Solutions:**
- Use `page.waitForLoadState('networkidle')` after navigation
- Use explicit waits: `await page.waitForSelector(selector)`
- Increase timeout in `playwright.config.js`

### Selector Not Found

**Solutions:**
- Verify the selector in the browser's DevTools
- Use Playwright Inspector: `npm run test:debug`
- Add `data-test` attributes to elements

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

## Contributing

When adding new tests:

1. Follow the existing directory structure
2. Use BDD patterns (Given-When-Then)
3. Create helper functions for reusable logic
4. Update this README if adding new patterns or utilities
5. Ensure tests pass before committing

## Support

For issues or questions:
- Check existing test examples
- Review Playwright documentation
- Consult project-specific guidelines in the main CLAUDE.md
