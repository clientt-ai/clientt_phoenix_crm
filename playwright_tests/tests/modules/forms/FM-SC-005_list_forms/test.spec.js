const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-005: View and List All Forms
 *
 * This test verifies that users can view a list of all forms with
 * correct information displayed in the table.
 */

test.describe('FM-SC-005: View and List All Forms', () => {
  const screenshotsDir = path.join(__dirname, '../../playwright_screenshots/playwright_tests/forms', path.basename(__dirname));

  // Helper function to capture screenshots with consistent naming
  async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: false
    });
  }

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await screenshot(page, '01-sign-in-page');

    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'Hang123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForURL('**/dashboard');
    await screenshot(page, '02-after-login');

    // Navigate to forms page
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Verify header and sidebar navigation are present on authenticated pages
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');
    await screenshot(page, '03-forms-listing-page');
  });

  test('should display forms listing page successfully', async ({ page }) => {
    // Verify we're on the forms page
    await expect(page).toHaveURL(/.*forms/);

    // Verify page heading
    await expect(page.locator('h1')).toContainText('Forms');

    // Verify "Create Form" button exists (use testid to avoid matching sidebar link)
    await expect(page.locator('[data-testid="create-form-button"]')).toBeVisible();

    // Verify table structure exists
    await expect(page.locator('table')).toBeVisible();

    // Verify table headers
    const headers = page.locator('table thead th');
    await expect(headers.first()).toContainText('Name');
    await screenshot(page, '04-listing-page-verified');
  });

  test('should display existing forms in the table', async ({ page }) => {
    // Create a test form first
    const formName = `List Test Form ${Date.now()}`;

    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await screenshot(page, '05-create-form-page');
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Test description');
    await screenshot(page, '06-form-filled');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success notification
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '07-form-saved');

    // Wait for notification to auto-dismiss before navigating
    // Notification may still be visible but should not block navigation

    // Navigate back to forms list
    await page.click('a[href="/forms"]');
    await page.waitForURL('**/forms');

    // Verify the form appears in the table
    const formRow = page.locator('table tbody tr', { hasText: formName });
    await expect(formRow).toBeVisible();

    // Verify status column shows Draft
    await expect(formRow.locator('td').nth(1)).toContainText('Draft');
    await screenshot(page, '08-form-in-listing');
  });

  test('should navigate to form builder when clicking Create Form', async ({ page }) => {
    // Click Create Form button
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Verify we're on the form builder page
    await expect(page).toHaveURL(/.*forms\/new/);
    await expect(page.locator('h1')).toContainText('Create Form');
    await screenshot(page, '09-create-form-navigation');
  });

  test('should navigate to form edit when clicking Edit link', async ({ page }) => {
    // Ensure there's at least one form
    const firstEditLink = page.locator('table tbody tr td a[href*="/edit"]').first();

    if (await firstEditLink.isVisible()) {
      const href = await firstEditLink.getAttribute('href');
      await firstEditLink.click();
      await page.waitForURL('**/forms/*/edit');

      // Verify we're on the edit page
      await expect(page).toHaveURL(/.*forms\/.*\/edit/);
      await expect(page.locator('h1')).toContainText('Edit Form');
      await screenshot(page, '10-edit-form-navigation');
    } else {
      // Create a form first, then test edit
      const formName = `Edit Test Form ${Date.now()}`;

      await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
      await page.fill('[data-testid="form-name-input"]', formName);
      await page.fill('[data-testid="form-description-input"]', 'Test');
      await page.click('[data-testid="save-form-button"]');
      await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
      await screenshot(page, '11-form-created-for-edit');

      // Wait for notification to auto-dismiss before navigating
      // Notification may still be visible but should not block navigation

      // Go back to listing and find edit link
      await page.click('a[href="/forms"]');
      await page.waitForLoadState('networkidle');

      const editLink = page.locator('table tbody tr', { hasText: formName }).locator('a[href*="/edit"]');
      await editLink.click();
      await page.waitForURL('**/forms/*/edit');

      await expect(page).toHaveURL(/.*forms\/.*\/edit/);
      await screenshot(page, '12-edit-form-page');
    }
  });

});
