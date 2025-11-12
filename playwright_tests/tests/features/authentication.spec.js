// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Feature: User Authentication
 *
 * This test suite covers the authentication functionality of the CRM application
 * following BDD patterns (Given-When-Then).
 */

test.describe('Feature: User Authentication', () => {

  test.describe('Scenario: User Registration', () => {

    test('should allow a new user to register with valid credentials', async ({ page }) => {
      // Given: I am on the registration page
      await page.goto('/sign-in');
      await page.click('text=Register');

      // When: I fill in the registration form with valid details
      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const password = 'SecurePassword123!';

      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);
      await page.fill('input[name="user[password_confirmation]"]', password);

      // And: I submit the registration form
      await page.click('button[type="submit"]');

      // Then: I should see a success message or be redirected
      await expect(page).toHaveURL(/.*sign-in|.*dashboard/);
      // Note: Adjust expectations based on your app's behavior after registration
    });

    test('should show validation errors for invalid email format', async ({ page }) => {
      // Given: I am on the registration page
      await page.goto('/sign-in');
      await page.click('text=Register');

      // When: I enter an invalid email format
      await page.fill('input[name="user[email]"]', 'invalid-email');
      await page.fill('input[name="user[password]"]', 'SecurePassword123!');
      await page.fill('input[name="user[password_confirmation]"]', 'SecurePassword123!');

      // And: I submit the form
      await page.click('button[type="submit"]');

      // Then: I should see a validation error
      await expect(page.locator('text=/email|invalid/i')).toBeVisible();
    });
  });

  test.describe('Scenario: User Login', () => {

    test('should allow a user to login with valid credentials', async ({ page }) => {
      // Given: I have a registered account
      const email = process.env.TEST_USER_EMAIL || 'test@example.com';
      const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';

      // When: I navigate to the login page
      await page.goto('/sign-in');

      // And: I enter my credentials
      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);

      // And: I submit the login form
      await page.click('button[type="submit"]');

      // Then: I should be logged in and redirected to the dashboard
      await page.waitForLoadState('networkidle');
      // Note: Adjust the URL pattern based on your app's post-login redirect
      await expect(page).not.toHaveURL(/.*sign-in/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Given: I am on the login page
      await page.goto('/sign-in');

      // When: I enter invalid credentials
      await page.fill('input[name="user[email]"]', 'invalid@example.com');
      await page.fill('input[name="user[password]"]', 'WrongPassword123!');

      // And: I submit the form
      await page.click('button[type="submit"]');

      // Then: I should see an error message
      await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible();
    });
  });

  test.describe('Scenario: User Logout', () => {

    test('should allow a logged-in user to logout', async ({ page }) => {
      // Given: I am logged in
      const email = process.env.TEST_USER_EMAIL || 'test@example.com';
      const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';

      await page.goto('/sign-in');
      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // When: I click the logout button
      await page.click('text=/log out|sign out/i');

      // Then: I should be logged out and redirected to the sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Scenario: Password Reset', () => {

    test('should allow a user to request a password reset', async ({ page }) => {
      // Given: I am on the login page
      await page.goto('/sign-in');

      // When: I click on the "Forgot Password" link
      await page.click('text=/forgot.*password|reset.*password/i');

      // And: I enter my email address
      await page.fill('input[name="user[email]"]', 'test@example.com');

      // And: I submit the form
      await page.click('button[type="submit"]');

      // Then: I should see a confirmation message
      await expect(page.locator('text=/reset|sent|check.*email/i')).toBeVisible();
    });
  });
});
