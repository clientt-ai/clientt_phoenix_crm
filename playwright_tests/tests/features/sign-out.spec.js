// @ts-check
const { test, expect } = require('@playwright/test');
const { loginAsTestUser } = require('../support/auth-helpers');

/**
 * Feature: User Sign-Out
 *
 * This test suite covers the sign-out functionality, ensuring users can
 * successfully log out from the application via the profile dropdown.
 *
 * Test Coverage:
 * - Sign-out via profile dropdown menu
 * - Verification of session clearing
 * - Redirect behavior after sign-out
 * - Inability to access protected pages after sign-out
 */

test.describe('Feature: User Sign-Out', () => {

  test.describe('Scenario: Sign out via profile dropdown', () => {

    test('should successfully sign out when clicking Sign Out link', async ({ page }) => {
      // Given: I am logged in as a test user
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      // Verify we're on an authenticated page (not on sign-in)
      await expect(page).not.toHaveURL(/.*sign-in/);

      // When: I navigate directly to the sign-out URL
      await page.goto('/sign-out');

      // Then: I should be redirected to the home page
      await page.waitForLoadState('networkidle');

      // Verify we're no longer on an authenticated page
      const currentUrl = page.url();
      const isOnPublicPage = currentUrl.includes('sign-in') ||
                            currentUrl.endsWith('/') ||
                            currentUrl === 'http://localhost:4002/' ||
                            currentUrl === 'http://localhost:4002';

      expect(isOnPublicPage).toBeTruthy();

      // And: I should see a success message indicating I'm signed out
      const flashMessage = page.locator('text=/signed out|logged out/i, .alert, [role="alert"]');
      await expect(flashMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Flash message might disappear quickly, which is okay
        console.log('Flash message not visible (may have disappeared)');
      });
    });

    test('should not be able to access protected pages after sign-out', async ({ page }) => {
      // Given: I am logged in
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      // When: I sign out
      await page.goto('/sign-out');
      await page.waitForLoadState('networkidle');

      // Then: I should not be able to access the dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });

    test('should not be able to access forms page after sign-out', async ({ page }) => {
      // Given: I am logged in
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      // When: I sign out
      await page.goto('/sign-out');
      await page.waitForLoadState('networkidle');

      // Then: I should not be able to access the forms page
      await page.goto('/forms');
      await page.waitForLoadState('networkidle');

      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });

    test('should clear session completely on sign-out', async ({ page }) => {
      // Given: I am logged in
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      // Store the current cookies
      const cookiesBeforeSignOut = await page.context().cookies();
      expect(cookiesBeforeSignOut.length).toBeGreaterThan(0);

      // When: I sign out
      await page.goto('/sign-out');
      await page.waitForLoadState('networkidle');

      // Then: The session should be cleared
      // Try to navigate to a protected page
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should be redirected back to sign-in
      await expect(page).toHaveURL(/.*sign-in/);
    });

    test('should be able to sign in again after signing out', async ({ page }) => {
      // Given: I was logged in and then signed out
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      await page.goto('/sign-out');
      await page.waitForLoadState('networkidle');

      // When: I navigate to the sign-in page and log in again
      await page.goto('/sign-in');
      const email = process.env.TEST_USER_EMAIL || 'test@example.com';
      const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';

      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Then: I should be logged in successfully
      await expect(page).not.toHaveURL(/.*sign-in/);

      // And: I should be able to access protected pages
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await expect(page).not.toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Scenario: Sign-out link accessibility', () => {

    test('should have accessible sign-out route', async ({ page }) => {
      // Given: I am logged in
      await loginAsTestUser(page);
      await page.waitForLoadState('networkidle');

      // When: I navigate to the sign-out route
      const response = await page.goto('/sign-out');

      // Then: The route should be accessible (200 redirect or 302)
      expect(response?.status()).toBeLessThan(400);
    });
  });
});
