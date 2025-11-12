// @ts-check
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../support/pages/login-page');

/**
 * Example: Using Page Object Model
 *
 * This demonstrates how to use the Page Object Model pattern
 * for cleaner, more maintainable tests.
 */

test.describe('Example: Using Page Object Model', () => {

  test('should login using page object', async ({ page }) => {
    // Given: I have a login page object
    const loginPage = new LoginPage(page);

    // When: I login with valid credentials
    const email = process.env.TEST_USER_EMAIL || 'test@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';

    await loginPage.login(email, password);

    // Then: I should be logged in
    await expect(page).not.toHaveURL(/.*sign-in/);
  });

  test('should show error for invalid credentials using page object', async ({ page }) => {
    // Given: I have a login page object
    const loginPage = new LoginPage(page);

    // When: I try to login with invalid credentials
    await loginPage.login('invalid@example.com', 'WrongPassword123!');

    // Then: I should see an error message
    const hasError = await loginPage.hasErrorMessage();
    expect(hasError).toBeTruthy();
  });
});
