const { test, expect } = require('@playwright/test');

/**
 * FM-SC-001: Create New Form Successfully
 *
 * This test verifies that a user can create a new form with basic configuration
 * and that the form is saved successfully in the system.
 */

test.describe('FM-SC-001: Create New Form Successfully', () => {

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

  test('should create a new form with valid data', async ({ page }) => {
    // Generate unique form name with timestamp
    const uniqueFormName = `Customer Feedback Form ${Date.now()}`;

    // Step 1-2: Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    // Wait for LiveView to fully connect
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="form-builder"]')).toBeVisible();

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

    // Step 7: Click Save button - wait for button to be ready first
    const saveButton = page.locator('[data-testid="save-form-button"]');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    // Debug: Log button state before clicking
    console.log('Save button found, clicking...');
    await saveButton.click();

    // Wait for LiveView to process
    await page.waitForTimeout(2000);

    // Step 8: Verify success notification appears (allow time for LiveView to process)
    // Use .first() to get the actual notification (not the hidden client/server error containers)
    const successNotification = page.locator('[data-testid="success-notification"]').first();

    // Wait for success notification to appear
    await expect(successNotification).toBeVisible({ timeout: 10000 });
    await expect(successNotification).toContainText('Form saved successfully');

    // Step 9: Verify we're still on the form builder page (URL stays same after save)
    // The form is saved but user stays on builder page

    // Step 10: Navigate back to forms listing using the "Back to Forms" link
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');

    // Verify the form appears in the listing (table structure)
    const formRow = page.locator('table tbody tr', {
      hasText: uniqueFormName
    });
    await expect(formRow).toBeVisible();

    // Verify form details in the listing
    await expect(formRow.locator('td').first()).toContainText(uniqueFormName);
    await expect(formRow.locator('td').nth(1)).toContainText('Draft');
  });

  test('should validate required fields when creating form', async ({ page }) => {
    // Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');

    // Try to save without filling required fields
    await page.click('[data-testid="save-form-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-name-error"]')).toContainText(
      'Form name is required'
    );
  });

  test('should handle form name uniqueness validation', async ({ page }) => {
    // Use unique name with timestamp for this test
    const uniqueName = `Unique Form ${Date.now()}`;

    // Create first form
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', uniqueName);
    await page.fill('[data-testid="form-description-input"]', 'Test description');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success (allow time for LiveView to process)
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Try to create another form with the same name
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="form-name-input"]', uniqueName);
    await page.fill('[data-testid="form-description-input"]', 'Another description');
    await page.click('[data-testid="save-form-button"]');

    // Wait for LiveView to process
    await page.waitForTimeout(2000);

    // Verify uniqueness validation error - this should show in the form errors
    // The error may be "has already been taken" from Ash identity constraint
    const errorNotification = page.locator('[data-testid="error-notification"]').first();
    const nameError = page.locator('[data-testid="form-name-error"]');

    // Either error notification or field-level error should appear
    await expect(errorNotification.or(nameError)).toBeVisible({ timeout: 10000 });
  });

});
