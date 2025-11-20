const { test, expect } = require('@playwright/test');
const { createScreenshotHelper } = require('../../../../screenshot-config');

/**
 * NAV-SC-001: Sidebar Navigation Links
 *
 * This test verifies that all sidebar navigation links work correctly
 * and navigate to the expected pages without errors.
 */

test.describe('NAV-SC-001: Sidebar Navigation Links', () => {
  // Helper function to capture screenshots with consistent naming
  const screenshot = createScreenshotHelper(__dirname);

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await screenshot(page, '01-sign-in-page');

    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'Hang123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await screenshot(page, '02-after-login');
  });

  test('should navigate to Dashboard via sidebar', async ({ page }) => {
    // First go to forms page to ensure sidebar is loaded
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Click on Dashboard link in sidebar
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');

    // Verify we're on the dashboard page
    await expect(page).toHaveURL(/.*\/dashboard$/);

    // Verify page content loads without errors
    await expect(page.locator('main')).toBeVisible();

    // Check for no error alerts
    const errorAlert = page.locator('[role="alert"]:has-text("error")');
    await expect(errorAlert).not.toBeVisible();

    await screenshot(page, '03-dashboard-page');
  });

  test('should navigate to All Forms via sidebar', async ({ page }) => {
    // Click on All Forms link in sidebar
    await page.click('a[href="/forms"]');
    await page.waitForURL(/.*\/forms$/);

    // Verify we're on the forms listing page
    await expect(page).toHaveURL(/.*\/forms$/);

    // Verify page content loads
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');

    // Check for no error alerts
    const errorAlert = page.locator('[role="alert"]:has-text("error")');
    await expect(errorAlert).not.toBeVisible();

    await screenshot(page, '04-all-forms-page');
  });

  test('should navigate to Form Builder via sidebar', async ({ page }) => {
    // Click on Form Builder link in sidebar
    await page.click('a[href="/forms/new"]');
    await page.waitForURL('**/forms/new');

    // Verify we're on the form builder page
    await expect(page).toHaveURL(/.*forms\/new/);

    // Verify page content loads
    await expect(page.locator('main')).toBeVisible();

    // Check for no error alerts
    const errorAlert = page.locator('[role="alert"]:has-text("error")');
    await expect(errorAlert).not.toBeVisible();

    await screenshot(page, '05-form-builder-page');
  });

  // NOTE: Analytics route (/forms/analytics) is not implemented yet
  // NOTE: Settings route (/settings) is not implemented yet

  test('should verify existing sidebar links are visible', async ({ page }) => {
    // Navigate to a page first to see sidebar
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Verify sidebar links are visible (using testids for specificity)
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-form-builder"]')).toBeVisible();

    await screenshot(page, '06-sidebar-links-visible');
  });

  test('should navigate through all sidebar links in sequence', async ({ page }) => {
    // Start at forms listing
    await page.goto('/forms');
    await page.waitForURL('**/forms');
    await expect(page.locator('main')).toBeVisible();
    await screenshot(page, '07-sequence-forms');

    // Navigate to Dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('main')).toBeVisible();
    await screenshot(page, '08-sequence-dashboard');

    // Navigate to All Forms
    await page.click('a[href="/forms"]');
    await page.waitForURL(/.*\/forms$/);
    await expect(page.locator('main')).toBeVisible();
    await screenshot(page, '09-sequence-all-forms');

    // Navigate to Form Builder
    await page.click('a[href="/forms/new"]');
    await page.waitForURL('**/forms/new');
    await expect(page.locator('main')).toBeVisible();
    await screenshot(page, '10-sequence-form-builder');

    // Navigate back to Dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('main')).toBeVisible();
    await screenshot(page, '11-sequence-back-to-dashboard');
  });

  test('should handle rapid navigation between sidebar links', async ({ page }) => {
    // Navigate to forms page first
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Rapid navigation sequence
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');

    await page.click('a[href="/forms/new"]');
    await page.waitForURL('**/forms/new');

    await page.click('a[href="/forms"]');
    await page.waitForURL(/.*\/forms$/);

    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard');

    // Verify final page loaded correctly
    await expect(page.locator('main')).toBeVisible();

    // Check for no error alerts
    const errorAlert = page.locator('[role="alert"]:has-text("error")');
    await expect(errorAlert).not.toBeVisible();

    await screenshot(page, '12-rapid-navigation-complete');
  });

});
