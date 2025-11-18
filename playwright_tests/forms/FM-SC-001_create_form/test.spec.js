const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-001: Create New Form Successfully
 *
 * This test verifies that a user can create a new form with basic configuration
 * and that the form is saved successfully in the system.
 */

test.describe('FM-SC-001: Create New Form Successfully', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');

  // Helper function to capture screenshots with consistent naming
  async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: true
    });
  }

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await screenshot(page, '01-sign-in-page');

    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete and dashboard to load
    await page.waitForLoadState('networkidle');
    await screenshot(page, '02-after-login');

    // Navigate to forms page
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    // Verify header and sidebar navigation are present on authenticated pages
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');
    await screenshot(page, '03-forms-listing-page');
  });

  test('should create a new form with valid data', async ({ page }) => {
    // Generate unique form name with timestamp
    const uniqueFormName = `Customer Feedback Form ${Date.now()}`;

    // Step 1-2: Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    // Wait for LiveView to fully connect
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="form-builder"]')).toBeVisible();
    await screenshot(page, '04-form-builder-empty');

    // Step 3: Enter form name
    await page.fill('[data-testid="form-name-input"]', uniqueFormName);

    // Step 4: Enter form description
    await page.fill(
      '[data-testid="form-description-input"]',
      'Collect customer feedback on product experience'
    );

    // Step 5: Select form category
    await page.selectOption('[data-testid="form-category-select"]', 'customer-service');

    // Step 6: Set form status
    await page.selectOption('[data-testid="form-status-select"]', 'draft');
    await screenshot(page, '05-form-builder-filled');

    // Step 7: Click Save button - wait for button to be ready first
    const saveButton = page.locator('[data-testid="save-form-button"]');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    // Debug: Log button state before clicking
    console.log('Save button found, clicking...');
    await saveButton.click();

    // Step 8: Verify success notification appears (allow time for LiveView to process)
    // Use .first() to get the actual notification (not the hidden client/server error containers)
    const successNotification = page.locator('[data-testid="success-notification"]').first();

    // Wait for success notification to appear
    await expect(successNotification).toBeVisible({ timeout: 10000 });
    await expect(successNotification).toContainText('Form saved successfully');
    await screenshot(page, '06-form-saved-success');

    // Step 9: Verify we're still on the form builder page (URL stays same after save)
    // The form is saved but user stays on builder page

    // Step 10: Navigate back to forms listing using the "Back to Forms" link
    // Wait for notification to auto-dismiss before clicking navigation
    // Notification may still be visible but should not block navigation
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');

    // Verify the form appears in the listing (table structure)
    const formRow = page.locator('table tbody tr', {
      hasText: uniqueFormName
    });
    await expect(formRow).toBeVisible();
    await screenshot(page, '07-form-in-listing');

    // Verify form details in the listing
    await expect(formRow.locator('td').first()).toContainText(uniqueFormName);
    await expect(formRow.locator('td').nth(1)).toContainText('Draft');
  });

  test('should validate required fields when creating form', async ({ page }) => {
    // Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    await screenshot(page, '08-create-form-empty');

    // Try to save without filling required fields
    await page.click('[data-testid="save-form-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-name-error"]')).toContainText(
      'Form name is required'
    );
    await screenshot(page, '09-validation-error-name-required');
  });

  test('should handle form name uniqueness validation', async ({ page }) => {
    // Use unique name with timestamp for this test
    const uniqueName = `Unique Form ${Date.now()}`;

    // Create first form
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');
    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', uniqueName);
    await page.fill('[data-testid="form-description-input"]', 'Test description');
    await screenshot(page, '10-first-form-filled');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success (allow time for LiveView to process)
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '11-first-form-saved');

    // Wait for notification to auto-dismiss before clicking navigation
    // Notification may still be visible but should not block navigation

    // Try to create another form with the same name - navigate via UI
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');
    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', uniqueName);
    await page.fill('[data-testid="form-description-input"]', 'Another description');
    await screenshot(page, '12-duplicate-form-filled');
    await page.click('[data-testid="save-form-button"]');

    // Verify uniqueness validation error - this should show in the form errors
    // The error may be "has already been taken" from Ash identity constraint
    const errorNotification = page.locator('[data-testid="error-notification"]').first();
    const nameError = page.locator('[data-testid="form-name-error"]');

    // Either error notification or field-level error should appear
    await expect(errorNotification.or(nameError)).toBeVisible({ timeout: 10000 });
    await screenshot(page, '13-duplicate-name-error');
  });

});
