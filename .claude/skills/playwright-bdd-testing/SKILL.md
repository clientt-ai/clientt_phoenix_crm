---
name: playwright-bdd-testing
description: Writing BDD-style Playwright tests aligned with feature specifications
---

# Playwright BDD Testing

This guide covers writing Behavior-Driven Development (BDD) style tests with Playwright for the Clientt CRM application.

## BDD Philosophy

BDD tests follow the Given-When-Then pattern to make tests readable and aligned with business requirements:

- **Given**: Setup and preconditions
- **When**: The action being performed
- **Then**: Expected outcomes and assertions

## Test Structure

### Feature-Based Organization

Tests in `playwright_tests/tests/features/` are organized by application features:

```
tests/features/
├── authentication.spec.js      # User login, registration, logout
├── navigation.spec.js          # Page navigation and routing
├── contacts.spec.js            # Contact management
├── deals.spec.js               # Deal pipeline
└── reports.spec.js             # Reporting features
```

Each feature file contains related scenarios using `test.describe` blocks.

### BDD Test Template

```javascript
// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Feature: [Feature Name]
 *
 * [Brief description of what this feature does]
 */

test.describe('Feature: [Feature Name]', () => {

  test.describe('Scenario: [Scenario Name]', () => {

    test('should [expected behavior]', async ({ page }) => {
      // Given: [Initial state/preconditions]
      await page.goto('/initial-page');

      // When: [Action performed]
      await page.click('button');

      // Then: [Expected outcome]
      await expect(page.locator('.result')).toBeVisible();
    });
  });
});
```

## Mapping BDD Specs to Tests

### Example Specification

```
Feature: Contact Management
  As a CRM user
  I want to create and manage contacts
  So that I can track customer information

  Scenario: Creating a new contact
    Given I am logged in as a CRM user
    When I navigate to the contacts page
    And I click the "Add Contact" button
    And I fill in the contact form with valid information
    And I submit the form
    Then I should see the new contact in the contacts list
    And I should see a success notification
```

### Corresponding Playwright Test

```javascript
/**
 * Feature: Contact Management
 *
 * CRM users can create and manage contacts to track customer information.
 */

test.describe('Feature: Contact Management', () => {

  test.describe('Scenario: Creating a new contact', () => {

    test('should create a new contact with valid information', async ({ page }) => {
      // Given: I am logged in as a CRM user
      await loginAsTestUser(page);

      // When: I navigate to the contacts page
      await page.goto('/contacts');

      // And: I click the "Add Contact" button
      await page.click('[data-test="add-contact-button"]');

      // And: I fill in the contact form with valid information
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="email"]', 'john@example.com');
      await page.fill('input[name="phone"]', '555-1234');

      // And: I submit the form
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Then: I should see the new contact in the contacts list
      await expect(page.locator('text=John Doe')).toBeVisible();

      // And: I should see a success notification
      await expect(page.locator('.notification.success')).toBeVisible();
    });
  });
});
```

## BDD Best Practices

### 1. Use Descriptive Names

Test names should clearly describe the scenario:

```javascript
// Good
test('should display validation error when email format is invalid', ...)

// Bad
test('email validation', ...)
```

### 2. Group Related Scenarios

Use nested `test.describe` blocks:

```javascript
test.describe('Feature: User Authentication', () => {

  test.describe('Scenario: User Registration', () => {
    test('should allow registration with valid credentials', ...)
    test('should show error for duplicate email', ...)
  });

  test.describe('Scenario: User Login', () => {
    test('should login with valid credentials', ...)
    test('should show error for invalid credentials', ...)
  });
});
```

### 3. Keep Steps Clear

Each Given-When-Then step should be obvious:

```javascript
test('scenario', async ({ page }) => {
  // Given: Clear setup
  const email = generateTestEmail();
  await page.goto('/register');

  // When: Single clear action
  await fillRegistrationForm(page, { email, password: 'Pass123!' });
  await page.click('button[type="submit"]');

  // Then: Clear assertions
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### 4. Use Helper Functions

Extract common operations:

```javascript
const { loginAsTestUser } = require('../support/auth-helpers');
const { fillForm, waitForNetworkIdle } = require('../support/test-helpers');

test('authenticated scenario', async ({ page }) => {
  // Given: I am logged in
  await loginAsTestUser(page);

  // When: I perform action
  await page.goto('/contacts');

  // Then: I see result
  await expect(page.locator('h1')).toContainText('Contacts');
});
```

## Common BDD Scenarios

### Authentication Scenarios

```javascript
test.describe('Feature: User Authentication', () => {

  test.describe('Scenario: Successful Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Given: I have valid credentials
      const email = process.env.TEST_USER_EMAIL;
      const password = process.env.TEST_USER_PASSWORD;

      // When: I submit the login form
      await page.goto('/sign-in');
      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);
      await page.click('button[type="submit"]');

      // Then: I should be logged in
      await expect(page).not.toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Scenario: Failed Login', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      // Given: I have invalid credentials
      // When: I submit the login form with invalid credentials
      await page.goto('/sign-in');
      await page.fill('input[name="user[email]"]', 'invalid@example.com');
      await page.fill('input[name="user[password]"]', 'WrongPassword');
      await page.click('button[type="submit"]');

      // Then: I should see an error message
      await expect(page.locator('text=/invalid|error/i')).toBeVisible();
    });
  });
});
```

### CRUD Scenarios

```javascript
test.describe('Feature: Contact Management', () => {

  test.beforeEach(async ({ page }) => {
    // Given: I am logged in
    await loginAsTestUser(page);
  });

  test.describe('Scenario: Create Contact', () => {
    test('should create contact with valid data', async ({ page }) => {
      // When: I create a new contact
      await page.goto('/contacts');
      await page.click('[data-test="add-contact"]');
      await page.fill('input[name="name"]', 'Jane Smith');
      await page.fill('input[name="email"]', 'jane@example.com');
      await page.click('button[type="submit"]');

      // Then: The contact should appear in the list
      await expect(page.locator('text=Jane Smith')).toBeVisible();
    });
  });

  test.describe('Scenario: Update Contact', () => {
    test('should update contact information', async ({ page }) => {
      // Given: A contact exists
      await page.goto('/contacts');
      await page.click('text=Jane Smith');

      // When: I update the contact
      await page.click('[data-test="edit-contact"]');
      await page.fill('input[name="phone"]', '555-9999');
      await page.click('button[type="submit"]');

      // Then: The changes should be saved
      await expect(page.locator('text=555-9999')).toBeVisible();
    });
  });

  test.describe('Scenario: Delete Contact', () => {
    test('should delete contact with confirmation', async ({ page }) => {
      // Given: A contact exists
      await page.goto('/contacts');

      // When: I delete the contact
      await page.click('[data-test="contact-jane-smith"]');
      await page.click('[data-test="delete-contact"]');
      await page.click('[data-test="confirm-delete"]');

      // Then: The contact should be removed
      await expect(page.locator('text=Jane Smith')).not.toBeVisible();
    });
  });
});
```

### Navigation Scenarios

```javascript
test.describe('Feature: Application Navigation', () => {

  test.describe('Scenario: Protected Routes', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      // Given: I am not logged in
      // When: I try to access a protected route
      await page.goto('/dashboard');

      // Then: I should be redirected to the sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });
});
```

## Data-Driven Testing

For scenarios with multiple data sets:

```javascript
const testCases = [
  { email: 'invalid', expected: 'Invalid email format' },
  { email: '', expected: 'Email is required' },
  { email: 'a@b', expected: 'Invalid email format' },
];

testCases.forEach(({ email, expected }) => {
  test(`should show "${expected}" for email: "${email}"`, async ({ page }) => {
    // Given: I am on the registration page
    await page.goto('/register');

    // When: I enter an invalid email
    await page.fill('input[name="user[email]"]', email);
    await page.click('button[type="submit"]');

    // Then: I should see the validation error
    await expect(page.locator(`text=${expected}`)).toBeVisible();
  });
});
```

## Using Custom Fixtures

For scenarios requiring authentication:

```javascript
// Use authenticated fixture
const { test } = require('../fixtures/authenticated');
const { expect } = require('@playwright/test');

test.describe('Feature: Dashboard (Authenticated)', () => {

  test('should display user dashboard', async ({ page }) => {
    // Given: I am logged in (handled by fixture)

    // When: I navigate to the dashboard
    await page.goto('/dashboard');

    // Then: I should see my dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

## Tagging Tests

Use test annotations for filtering:

```javascript
test('slow operation', async ({ page }) => {
  test.slow(); // Mark as slow (3x timeout)
  // ... test code
});

test('skip in CI', async ({ page }) => {
  test.skip(!!process.env.CI, 'Skipping in CI');
  // ... test code
});

test.only('debug this test', async ({ page }) => {
  // Only this test will run
});
```

## Reporting

Tests generate reports showing BDD scenarios:

```bash
npm run test:report
```

The HTML report groups tests by Feature > Scenario > Test.

## Tips

1. **One scenario per test**: Keep tests focused
2. **Use meaningful data**: Test data should make sense in context
3. **Avoid test interdependence**: Each test should run independently
4. **Clean up test data**: Remove created data after tests
5. **Document complex scenarios**: Add comments explaining business logic
6. **Align with specs**: Keep tests synchronized with BDD specifications

## Resources

- Project BDD specifications (if available in `/specs` or `/docs`)
- Playwright test examples: `playwright_tests/tests/features/`
- Helper functions: `playwright_tests/tests/support/`
