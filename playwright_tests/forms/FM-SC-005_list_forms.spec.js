const { test, expect } = require('@playwright/test');

/**
 * FM-SC-005: View and List All Forms
 *
 * This test verifies that users can view a list of all forms with
 * correct information displayed in the table.
 */

test.describe('FM-SC-005: View and List All Forms', () => {

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');

    // Navigate to forms page
    await page.goto("/forms");
    await page.waitForLoadState('networkidle');
  });

  test('should display forms listing page successfully', async ({ page }) => {
    // Verify we're on the forms page
    await expect(page).toHaveURL(/.*forms/);

    // Verify page heading
    await expect(page.locator('h1')).toContainText('Forms');

    // Verify "Create Form" button exists
    await expect(page.locator('a[href="/forms/new"]')).toBeVisible();

    // Verify table structure exists
    await expect(page.locator('table')).toBeVisible();

    // Verify table headers
    const headers = page.locator('table thead th');
    await expect(headers.first()).toContainText('Name');
  });

  test('should display existing forms in the table', async ({ page }) => {
    // Create a test form first
    const formName = `List Test Form ${Date.now()}`;

    await page.click('a[href="/forms/new"]');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Test description');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success notification
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Wait for notification to auto-dismiss before navigating
    // Notification may still be visible but should not block navigation

    // Navigate back to forms list
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');

    // Verify the form appears in the table
    const formRow = page.locator('table tbody tr', { hasText: formName });
    await expect(formRow).toBeVisible();

    // Verify status column shows Draft
    await expect(formRow.locator('td').nth(1)).toContainText('Draft');
  });

  test('should navigate to form builder when clicking Create Form', async ({ page }) => {
    // Click Create Form button
    await page.click('a[href="/forms/new"]');
    await page.waitForLoadState('networkidle');

    // Verify we're on the form builder page
    await expect(page).toHaveURL(/.*forms\/new/);
    await expect(page.locator('h1')).toContainText('Create Form');
  });

  test('should navigate to form edit when clicking Edit link', async ({ page }) => {
    // Ensure there's at least one form
    const firstEditLink = page.locator('table tbody tr td a[href*="/edit"]').first();

    if (await firstEditLink.isVisible()) {
      const href = await firstEditLink.getAttribute('href');
      await firstEditLink.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on the edit page
      await expect(page).toHaveURL(/.*forms\/.*\/edit/);
      await expect(page.locator('h1')).toContainText('Edit Form');
    } else {
      // Create a form first, then test edit
      const formName = `Edit Test Form ${Date.now()}`;

      await page.click('a[href="/forms/new"]');
      await page.waitForLoadState('networkidle');
      await page.fill('[data-testid="form-name-input"]', formName);
      await page.fill('[data-testid="form-description-input"]', 'Test');
      await page.click('[data-testid="save-form-button"]');
      await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

      // Wait for notification to auto-dismiss before navigating
      // Notification may still be visible but should not block navigation

      // Go back to listing and find edit link
      await page.click('a[href="/forms"]');
      await page.waitForLoadState('networkidle');

      const editLink = page.locator('table tbody tr', { hasText: formName }).locator('a[href*="/edit"]');
      await editLink.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/.*forms\/.*\/edit/);
    }
  });

});
