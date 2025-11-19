---
name: playwright-basics
description: Core Playwright concepts, setup, and test execution for E2E testing
---

# Playwright Basics

Playwright is a Node.js library for end-to-end testing of web applications. This guide covers the essentials for testing the Clientt CRM Phoenix application.

## Project Structure

The Playwright tests are located in the `playwright_tests/` directory at the project root, independent of the Phoenix application:

```
playwright_tests/
├── tests/
│   ├── features/            # Feature-based tests (BDD scenarios)
│   ├── examples/            # Example test patterns
│   ├── support/             # Helper functions and page objects
│   └── fixtures/            # Custom test fixtures
├── playwright.config.js     # Configuration
├── package.json            # Dependencies
└── README.md               # Documentation
```

## Running Tests

All commands should be run from the `playwright_tests` directory:

```bash
# Run all tests
npm test

# Run with browser UI visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug

# Run specific test file
npx playwright test tests/features/authentication.spec.js

# Run specific browser
npx playwright test --project=chromium
```

## Basic Test Structure

```javascript
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {

  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/some-path');

    // Interact with elements
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Wait for navigation/network
    await page.waitForLoadState('networkidle');

    // Make assertions
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });
});
```

## Common Playwright Operations

### Navigation

```javascript
// Navigate to URL
await page.goto('/sign-in');

// Navigate with options
await page.goto('/dashboard', { waitUntil: 'networkidle' });

// Go back/forward
await page.goBack();
await page.goForward();

// Reload
await page.reload();
```

### Finding Elements

```javascript
// CSS selectors
await page.locator('.class-name')
await page.locator('#id')
await page.locator('button[type="submit"]')

// Text content
await page.locator('text=Sign In')
await page.locator('text=/log.*out/i')  // Regex

// Data attributes (preferred)
await page.locator('[data-test="submit-button"]')

// Get multiple elements
const items = await page.locator('.list-item').all();
```

### Interactions

```javascript
// Click
await page.click('button');

// Fill input
await page.fill('input[name="email"]', 'test@example.com');

// Type (with delay between keystrokes)
await page.type('input', 'Hello', { delay: 100 });

// Check/uncheck
await page.check('input[type="checkbox"]');
await page.uncheck('input[type="checkbox"]');

// Select dropdown
await page.selectOption('select#country', 'USA');

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file');

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello World');
```

### Waiting

```javascript
// Wait for load state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for selector
await page.waitForSelector('.result');
await page.waitForSelector('.loading', { state: 'hidden' });

// Wait for URL
await page.waitForURL('**/dashboard');
await page.waitForURL(/.*success/);

// Wait for timeout (avoid if possible)
await page.waitForTimeout(1000);
```

### Assertions

```javascript
const { expect } = require('@playwright/test');

// Page assertions
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveTitle(/CRM/);

// Element assertions
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('.error')).toBeHidden();
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('input')).toHaveValue('test@example.com');
await expect(page.locator('button')).toBeEnabled();
await expect(page.locator('button')).toBeDisabled();

// Count
await expect(page.locator('.item')).toHaveCount(5);
```

## Configuration

The `playwright.config.js` file contains:

- **baseURL**: Default URL for the application (`http://localhost:4002`)
- **timeout**: Maximum test execution time (30 seconds)
- **projects**: Browser configurations (chromium, firefox, webkit)
- **webServer**: Automatically starts Phoenix server before tests
- **use**: Shared settings (screenshots, videos, traces)

### Required Viewport and Screenshot Settings

**IMPORTANT**: Always configure 1080p viewport in playwright.config.js:

```javascript
module.exports = defineConfig({
  use: {
    // 1080p viewport for all screenshots
    viewport: { width: 1920, height: 1080 },

    // Screenshot on failure (viewport only, not full page)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,  // MUST be false
    },
  },

  projects: [
    {
      name: 'chromium',
      // Explicit viewport to override device presets
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
```

**Why this matters:**
- Device presets (like `devices['Desktop Chrome']`) may override global viewport settings
- Always explicitly set viewport in each project configuration
- `fullPage: false` ensures screenshots stay at 1920x1080 max

## Environment Variables

Create a `.env` file in `playwright_tests/`:

```env
BASE_URL=http://localhost:4002
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=SecurePassword123!
```

Access in tests:

```javascript
const email = process.env.TEST_USER_EMAIL;
```

## Test Hooks

```javascript
test.describe('Feature', () => {

  // Runs once before all tests
  test.beforeAll(async () => {
    // Setup code
  });

  // Runs before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Runs after each test
  test.afterEach(async ({ page }) => {
    // Cleanup
  });

  // Runs once after all tests
  test.afterAll(async () => {
    // Teardown code
  });

  test('my test', async ({ page }) => {
    // Test code
  });
});
```

## Debugging

### Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector for stepping through tests.

### Console Logs

```javascript
// Listen to console messages
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

// Listen to page errors
page.on('pageerror', error => console.log('PAGE ERROR:', error));
```

### Screenshots

**IMPORTANT**: All screenshots must be captured at 1080p (1920x1080) viewport only. Do NOT use fullPage: true.

```javascript
// Take screenshot at 1080p viewport (CORRECT)
await page.screenshot({
  path: 'screenshots/my-screenshot.png',
  fullPage: false  // Always use false to capture viewport only
});

// Helper function pattern for consistent screenshots
async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', `${name}.png`),
    fullPage: false  // Never use fullPage: true
  });
}
```

**Screenshot Configuration Rules:**
- Always use `fullPage: false` to capture viewport only (1920x1080)
- Screenshots should never exceed 8000 pixels in any dimension
- Viewport is set in playwright.config.js as `{ width: 1920, height: 1080 }`

### Pause Execution

```javascript
// Pause in headed mode
await page.pause();
```

## Best Practices

1. **Use baseURL**: Configure in `playwright.config.js` and use relative paths
2. **Wait for network idle**: After navigation and form submissions
3. **Use data-test attributes**: More stable than CSS classes
4. **Explicit waits**: Use `waitForSelector` instead of `waitForTimeout`
5. **Isolate tests**: Each test should be independent
6. **Clean up**: Remove test data after tests (or use transactions)
7. **Use fixtures**: For common setup like authentication

## Common Patterns

### Form Submission

```javascript
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password');
await page.click('button[type="submit"]');
await page.waitForLoadState('networkidle');
```

### Authentication Check

```javascript
// Check if logged in
const isLoggedIn = !page.url().includes('sign-in');
```

### Multiple Windows/Tabs

```javascript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]')
]);

await newPage.waitForLoadState();
```

## Troubleshooting

### Test Timeouts

- Increase timeout in config: `timeout: 60 * 1000`
- Add explicit waits: `await page.waitForLoadState('networkidle')`

### Element Not Found

- Use Playwright Inspector: `npm run test:debug`
- Check selector in browser DevTools
- Add waits: `await page.waitForSelector('.element')`

### Flaky Tests

- Use proper waits (networkidle, selector visible)
- Avoid fixed timeouts
- Check for race conditions
- Ensure test isolation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- Project README: `playwright_tests/README.md`
