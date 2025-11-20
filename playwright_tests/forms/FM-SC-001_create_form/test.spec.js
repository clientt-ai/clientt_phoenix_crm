const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-001: Create New Form Successfully
 *
 * This test verifies that a user can create a new form with basic configuration
 * and that the form is saved successfully in the system.
 *
 * Updated for new 3-column builder UI with inline editing.
 */

test.describe('FM-SC-001: Create New Form Successfully', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');

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

    // Wait for authentication to complete and dashboard to load
    await page.waitForLoadState('networkidle');
    await screenshot(page, '02-after-login');

    // Navigate to forms page
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    // Verify sidebar navigation and page content are present
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');
    await screenshot(page, '03-forms-listing-page');
  });

  test('should create a new form with valid data', async ({ page }) => {
    // Generate unique form name with timestamp
    const uniqueFormName = `Customer Feedback Form ${Date.now()}`;

    // Step 1-2: Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    // Wait for LiveView navigation to complete
    await page.waitForURL('**/forms/new');
    await expect(page.locator('[data-testid="form-builder"]')).toBeVisible({ timeout: 10000 });
    await screenshot(page, '04-form-builder-empty');

    // Step 3: Enter form name (inline editing)
    const nameInput = page.locator('[data-testid="form-name-input"]');
    await nameInput.fill(uniqueFormName);
    // Trigger blur to ensure the value is saved
    await nameInput.blur();
    await page.waitForTimeout(500); // Wait for debounce

    // Step 4: Enter form description (inline editing)
    const descInput = page.locator('[data-testid="form-description-input"]');
    await descInput.fill('Collect customer feedback on product experience');
    await descInput.blur();
    await page.waitForTimeout(500); // Wait for debounce

    await screenshot(page, '05-form-builder-filled');

    // Step 5: Click Save button - wait for button to be ready first
    const saveButton = page.locator('[data-testid="save-form-button"]');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    // Debug: Log button state before clicking
    console.log('Save button found, clicking...');
    await saveButton.click();

    // Step 6: Verify success notification appears (allow time for LiveView to process)
    // Use .first() to get the actual notification (not the hidden client/server error containers)
    const successNotification = page.locator('[data-testid="success-notification"]').first();

    // Wait for success notification to appear
    await expect(successNotification).toBeVisible({ timeout: 10000 });
    await expect(successNotification).toContainText('Form saved successfully');
    await screenshot(page, '06-form-saved-success');

    // Step 7: Navigate back to forms listing using the "Back" link
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
    // Form status should be Draft by default
    await expect(formRow.locator('[data-testid="form-status"]')).toContainText('Draft');
  });

  test('should validate required fields when creating form', async ({ page }) => {
    // Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await screenshot(page, '08-create-form-empty');

    // Clear the default title and try to save without filling it
    const nameInput = page.locator('[data-testid="form-name-input"]');
    await nameInput.fill('');
    await nameInput.blur();
    await page.waitForTimeout(500);

    // Click save button
    await page.click('[data-testid="save-form-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="form-name-error"]')).toContainText('required');
    await screenshot(page, '09-validation-error-name-required');
  });

  test('should handle form name uniqueness validation', async ({ page }) => {
    // Use unique name with timestamp for this test
    const uniqueName = `Unique Form ${Date.now()}`;

    // Create first form
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Wait for form input to be ready
    const nameInput = page.locator('[data-testid="form-name-input"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(uniqueName);
    await nameInput.blur();
    await page.waitForTimeout(500);

    const descInput = page.locator('[data-testid="form-description-input"]');
    await descInput.fill('Test description');
    await descInput.blur();
    await page.waitForTimeout(500);

    await screenshot(page, '10-first-form-filled');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success (allow time for LiveView to process)
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '11-first-form-saved');

    // Try to create another form with the same name - navigate via UI
    await page.click('a[href="/forms"]');
    await page.waitForURL('**/forms');
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Wait for form input to be ready
    const nameInput2 = page.locator('[data-testid="form-name-input"]');
    await expect(nameInput2).toBeVisible({ timeout: 10000 });
    await nameInput2.fill(uniqueName);
    await nameInput2.blur();
    await page.waitForTimeout(500);

    const descInput2 = page.locator('[data-testid="form-description-input"]');
    await descInput2.fill('Another description');
    await descInput2.blur();
    await page.waitForTimeout(500);

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
