---
name: playwright-helpers
description: Using helper functions, page objects, and fixtures for maintainable Playwright tests
---

# Playwright Helpers and Patterns

This guide covers reusable patterns, helper functions, page objects, and fixtures for writing maintainable Playwright tests.

## Helper Functions

Helper functions are located in `playwright_tests/tests/support/`.

### Authentication Helpers

Located in `tests/support/auth-helpers.js`:

```javascript
const { loginAsTestUser, login, logout, register, generateTestEmail } = require('../support/auth-helpers');

// Login with test user from environment
test('my test', async ({ page }) => {
  await loginAsTestUser(page);
  // User is now logged in
});

// Login with specific credentials
await login(page, 'user@example.com', 'password');

// Logout
await logout(page);

// Register new user
const email = generateTestEmail('testuser');
await register(page, email, 'Password123!');

// Generate unique email
const uniqueEmail = generateTestEmail(); // testuser1699999999@example.com
```

### Screenshot Helpers

**IMPORTANT**: All screenshots must be 1080p (1920x1080) viewport only.

```javascript
// Screenshot helper function pattern
const path = require('path');

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', `${name}.png`),
    fullPage: false  // MUST be false - never use fullPage: true
  });
}

// Usage in test
test('my test', async ({ page }) => {
  await page.goto('/dashboard');
  await screenshot(page, '01-dashboard');

  await page.click('[data-testid="create-button"]');
  await screenshot(page, '02-create-dialog');
});
```

**Screenshot Rules:**
- Always use `fullPage: false`
- Screenshots captured at 1920x1080 viewport only
- Never exceed 8000 pixels in any dimension
- Use descriptive names with step numbers (e.g., `01-sign-in`, `02-after-login`)

### General Test Helpers

Located in `tests/support/test-helpers.js`:

```javascript
const {
  waitForElement,
  fillForm,
  waitForNetworkIdle,
  elementExists,
  clickWithRetry,
  getTextContent,
  waitForURL,
  performSearch,
} = require('../support/test-helpers');

// Wait for element to be visible
await waitForElement(page, '.result', 10000);

// Fill multiple form fields
await fillForm(page, {
  'input[name="name"]': 'John Doe',
  'input[name="email"]': 'john@example.com',
  'input[name="phone"]': '555-1234',
});

// Wait for network to be idle
await waitForNetworkIdle(page);

// Check if element exists (doesn't have to be visible)
const exists = await elementExists(page, '.optional-element');

// Click with retry logic
await clickWithRetry(page, '.sometimes-hidden-button', 3);

// Get text content
const heading = await getTextContent(page, 'h1');

// Wait for specific URL
await waitForURL(page, /.*dashboard/, 10000);

// Perform search
await performSearch(page, 'contact name');
```

## Page Object Model (POM)

Page Objects encapsulate page-specific logic and selectors, making tests more maintainable.

### Creating a Page Object

Located in `tests/support/pages/`:

```javascript
// tests/support/pages/contacts-page.js
class ContactsPage {
  constructor(page) {
    this.page = page;

    // Selectors
    this.addButton = '[data-test="add-contact"]';
    this.searchInput = 'input[type="search"]';
    this.contactsList = '.contacts-list';
    this.contactItem = '.contact-item';
  }

  async goto() {
    await this.page.goto('/contacts');
    await this.page.waitForLoadState('networkidle');
  }

  async addContact(name, email, phone) {
    await this.page.click(this.addButton);
    await this.page.fill('input[name="name"]', name);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="phone"]', phone);
    await this.page.click('button[type="submit"]');
    await this.page.waitForLoadState('networkidle');
  }

  async searchContacts(query) {
    await this.page.fill(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async getContactCount() {
    return await this.page.locator(this.contactItem).count();
  }

  async clickContact(name) {
    await this.page.click(`${this.contactItem} >> text=${name}`);
  }

  async isContactVisible(name) {
    return await this.page.locator(`text=${name}`).isVisible();
  }
}

module.exports = { ContactsPage };
```

### Using Page Objects in Tests

```javascript
const { test, expect } = require('@playwright/test');
const { ContactsPage } = require('../support/pages/contacts-page');
const { loginAsTestUser } = require('../support/auth-helpers');

test.describe('Contact Management', () => {

  test('should create a new contact', async ({ page }) => {
    // Given: I am logged in and on the contacts page
    await loginAsTestUser(page);
    const contactsPage = new ContactsPage(page);
    await contactsPage.goto();

    // When: I add a new contact
    await contactsPage.addContact('Jane Doe', 'jane@example.com', '555-5678');

    // Then: The contact should be visible
    const isVisible = await contactsPage.isContactVisible('Jane Doe');
    expect(isVisible).toBeTruthy();
  });

  test('should search for contacts', async ({ page }) => {
    // Given: I am on the contacts page with existing contacts
    await loginAsTestUser(page);
    const contactsPage = new ContactsPage(page);
    await contactsPage.goto();

    // When: I search for a contact
    await contactsPage.searchContacts('Jane');

    // Then: Search results should be displayed
    const count = await contactsPage.getContactCount();
    expect(count).toBeGreaterThan(0);
  });
});
```

## Page Object Best Practices

1. **Encapsulate selectors**: Store all selectors in the page object
2. **Encapsulate interactions**: Create methods for common actions
3. **Return page objects**: For method chaining
4. **Keep it focused**: One page object per page/component
5. **Use descriptive names**: Method names should explain what they do

### Advanced Page Object Example

```javascript
class DashboardPage {
  constructor(page) {
    this.page = page;
    this.header = page.locator('header');
    this.navigation = page.locator('nav');
    this.logoutButton = page.locator('[data-test="logout"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
    return this; // Enable chaining
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL(/.*sign-in/);
    return this; // Enable chaining
  }

  async navigateTo(section) {
    await this.page.click(`nav >> text=${section}`);
    await this.page.waitForLoadState('networkidle');
    return this; // Enable chaining
  }

  async getWelcomeMessage() {
    return await this.page.locator('.welcome-message').textContent();
  }
}

// Usage with chaining
await new DashboardPage(page)
  .goto()
  .navigateTo('Contacts');
```

## Custom Fixtures

Fixtures provide reusable test setups. Located in `tests/fixtures/`.

### Authenticated Fixture

Located in `tests/fixtures/authenticated.js`:

```javascript
const { test } = require('../fixtures/authenticated');
const { expect } = require('@playwright/test');

test.describe('Authenticated Tests', () => {

  test('should access dashboard', async ({ page }) => {
    // User is already logged in
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

### Creating Custom Fixtures

```javascript
// tests/fixtures/with-test-data.js
const { test as base } = require('@playwright/test');
const { loginAsTestUser } = require('../support/auth-helpers');

const test = base.extend({
  // Authenticated page with test data
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login and create test data
    await loginAsTestUser(page);

    // Create test contact
    await page.goto('/contacts');
    await page.click('[data-test="add-contact"]');
    await page.fill('input[name="name"]', 'Test Contact');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Use the page
    await use(page);

    // Cleanup: Delete test data
    await page.goto('/contacts');
    await page.click('[data-test="contact-test-contact"]');
    await page.click('[data-test="delete-contact"]');
    await page.click('[data-test="confirm-delete"]');
  },
});

module.exports = { test };
```

### Using Custom Fixtures

```javascript
const { test } = require('../fixtures/with-test-data');
const { expect } = require('@playwright/test');

test('should find test contact', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/contacts');
  await expect(authenticatedPage.locator('text=Test Contact')).toBeVisible();
});
```

## Component Fixtures

For reusable page components:

```javascript
const { test as base } = require('@playwright/test');
const { LoginPage } = require('../support/pages/login-page');
const { ContactsPage } = require('../support/pages/contacts-page');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
  },
});

// Usage
test('my test', async ({ loginPage, contactsPage }) => {
  await loginPage.login('user@example.com', 'password');
  await contactsPage.goto();
  await contactsPage.addContact('Name', 'email@example.com', '555-1234');
});
```

## Organizing Helpers

### Directory Structure

```
tests/support/
├── auth-helpers.js          # Authentication operations
├── test-helpers.js          # General utilities
├── data-helpers.js          # Test data generation
├── api-helpers.js           # API interactions
└── pages/                   # Page Object Models
    ├── login-page.js
    ├── dashboard-page.js
    ├── contacts-page.js
    └── deals-page.js
```

### Creating Helper Modules

```javascript
// tests/support/data-helpers.js
function generateContact(overrides = {}) {
  const timestamp = Date.now();
  return {
    name: `Test Contact ${timestamp}`,
    email: `contact${timestamp}@example.com`,
    phone: `555-${timestamp.toString().slice(-4)}`,
    ...overrides,
  };
}

function generateDeal(overrides = {}) {
  const timestamp = Date.now();
  return {
    title: `Deal ${timestamp}`,
    value: Math.floor(Math.random() * 100000),
    stage: 'prospecting',
    ...overrides,
  };
}

module.exports = { generateContact, generateDeal };
```

### Using Helper Modules

```javascript
const { generateContact } = require('../support/data-helpers');
const { fillForm } = require('../support/test-helpers');

test('create contact with generated data', async ({ page }) => {
  const contact = generateContact({ name: 'Specific Name' });

  await page.goto('/contacts/new');
  await fillForm(page, {
    'input[name="name"]': contact.name,
    'input[name="email"]': contact.email,
    'input[name="phone"]': contact.phone,
  });
  await page.click('button[type="submit"]');

  await expect(page.locator(`text=${contact.name}`)).toBeVisible();
});
```

## API Helpers

For API interactions during tests:

```javascript
// tests/support/api-helpers.js
async function createContactViaAPI(request, contactData) {
  const response = await request.post('/api/contacts', {
    data: contactData,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}

async function deleteContactViaAPI(request, contactId) {
  await request.delete(`/api/contacts/${contactId}`);
}

module.exports = { createContactViaAPI, deleteContactViaAPI };
```

### Using API Helpers

```javascript
const { test, expect } = require('@playwright/test');
const { createContactViaAPI } = require('../support/api-helpers');

test('verify contact created via API appears in UI', async ({ page, request }) => {
  // Given: A contact exists (created via API)
  const contact = await createContactViaAPI(request, {
    name: 'API Contact',
    email: 'api@example.com',
  });

  // When: I view the contacts page
  await page.goto('/contacts');

  // Then: The contact should be visible
  await expect(page.locator('text=API Contact')).toBeVisible();
});
```

## Combining Patterns

```javascript
const { test } = require('../fixtures/authenticated');
const { expect } = require('@playwright/test');
const { ContactsPage } = require('../support/pages/contacts-page');
const { generateContact } = require('../support/data-helpers');
const { waitForNetworkIdle } = require('../support/test-helpers');

test.describe('Complete Contact Workflow', () => {

  test('should create, edit, and delete contact', async ({ page }) => {
    // Setup: Page object and test data
    const contactsPage = new ContactsPage(page);
    const contact = generateContact();

    // Given: I am on the contacts page (authenticated by fixture)
    await contactsPage.goto();

    // When: I create a contact
    await contactsPage.addContact(contact.name, contact.email, contact.phone);
    await waitForNetworkIdle(page);

    // Then: The contact should be visible
    expect(await contactsPage.isContactVisible(contact.name)).toBeTruthy();

    // When: I edit the contact
    await contactsPage.clickContact(contact.name);
    await page.click('[data-test="edit-contact"]');
    await page.fill('input[name="phone"]', '555-9999');
    await page.click('button[type="submit"]');

    // Then: The changes should be saved
    await expect(page.locator('text=555-9999')).toBeVisible();

    // Cleanup: Delete the contact
    await page.click('[data-test="delete-contact"]');
    await page.click('[data-test="confirm-delete"]');
    await waitForNetworkIdle(page);

    // Verify deletion
    expect(await contactsPage.isContactVisible(contact.name)).toBeFalsy();
  });
});
```

## Tips

1. **Start simple**: Use helpers before creating page objects
2. **Refactor gradually**: Convert repetitive code to helpers/page objects
3. **Keep helpers focused**: One responsibility per helper function
4. **Document complex helpers**: Add JSDoc comments
5. **Test helpers independently**: Ensure they work correctly
6. **Avoid over-abstraction**: Don't create helpers for one-off operations

## Resources

- Helper examples: `playwright_tests/tests/support/`
- Page object examples: `playwright_tests/tests/support/pages/`
- Fixture examples: `playwright_tests/tests/fixtures/`
- Usage examples: `playwright_tests/tests/examples/`
