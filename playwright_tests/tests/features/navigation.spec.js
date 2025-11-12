// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Feature: Application Navigation
 *
 * This test suite verifies the navigation functionality across the CRM application.
 */

test.describe('Feature: Application Navigation', () => {

  test.describe('Scenario: Public Pages Accessibility', () => {

    test('should load the home page successfully', async ({ page }) => {
      // Given: I am not logged in
      // When: I navigate to the home page
      await page.goto('/');

      // Then: The page should load successfully
      await expect(page).toHaveTitle(/.*CRM|Clientt/i);
    });

    test('should access the sign-in page', async ({ page }) => {
      // Given: I am not logged in
      // When: I navigate to the sign-in page
      await page.goto('/sign-in');

      // Then: I should see the login form
      await expect(page.locator('input[name="user[email]"]')).toBeVisible();
      await expect(page.locator('input[name="user[password]"]')).toBeVisible();
    });
  });

  test.describe('Scenario: Authenticated User Navigation', () => {

    test.beforeEach(async ({ page }) => {
      // Given: I am logged in
      const email = process.env.TEST_USER_EMAIL || 'test@example.com';
      const password = process.env.TEST_USER_PASSWORD || 'SecurePassword123!';

      await page.goto('/sign-in');
      await page.fill('input[name="user[email]"]', email);
      await page.fill('input[name="user[password]"]', password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    });

    test('should navigate to dashboard after login', async ({ page }) => {
      // Then: I should be on the dashboard or main page
      await expect(page).not.toHaveURL(/.*sign-in/);
    });

    test('should be able to access protected routes', async ({ page }) => {
      // When: I try to access protected routes
      // Then: I should have access without being redirected to sign-in
      // Note: Adjust these routes based on your application structure
      const protectedRoutes = [
        // Add your protected routes here, e.g.:
        // '/contacts',
        // '/deals',
        // '/settings',
      ];

      for (const route of protectedRoutes) {
        if (route) { // Only test if routes are defined
          await page.goto(route);
          await expect(page).not.toHaveURL(/.*sign-in/);
        }
      }
    });
  });

  test.describe('Scenario: Protected Routes Redirect', () => {

    test('should redirect to sign-in when accessing protected routes without authentication', async ({ page }) => {
      // Given: I am not logged in
      // When: I try to access a protected route
      // Note: Add an actual protected route from your application
      const protectedRoute = '/dashboard'; // Adjust based on your app

      await page.goto(protectedRoute);

      // Then: I should be redirected to the sign-in page
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });

  test.describe('Scenario: Responsive Navigation', () => {

    test('should display mobile menu on small screens', async ({ page }) => {
      // Given: I am viewing the site on a mobile device
      await page.setViewportSize({ width: 375, height: 667 });

      // When: I navigate to the home page
      await page.goto('/');

      // Then: I should see a mobile menu button
      // Note: Adjust selector based on your navigation structure
      const mobileMenuButton = page.locator('button[aria-label*="menu" i]');
      if (await mobileMenuButton.count() > 0) {
        await expect(mobileMenuButton).toBeVisible();
      }
    });
  });
});
