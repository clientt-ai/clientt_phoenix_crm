const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-007: Delete Form
 *
 * This test verifies that users can delete form fields.
 * NOTE: Form deletion from listing is not yet implemented.
 * These tests focus on field deletion functionality.
 */

test.describe('FM-SC-007: Delete Form Fields', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  let formName;
  let formUrl;

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

    // Create a test form with fields - click the Create Form button
    formName = `Delete Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Form for deletion testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '04-form-created');

    // Wait for notification to auto-dismiss before navigating
    // Notification may still be visible but should not block navigation

    // Navigate back to listing to get the proper edit URL
    await page.click('a[href="/forms"]');
    await page.waitForURL('**/forms');

    // Find the form and get its edit URL
    const formRow = page.locator('table tbody tr', { hasText: formName });
    const editLink = formRow.locator('a[href*="/edit"]');
    formUrl = await editLink.getAttribute('href');

    // Navigate to the edit page
    await editLink.click();
    await page.waitForURL('**/forms/*/edit');

    // Add multiple fields for deletion testing
    const fields = ['Field One', 'Field Two', 'Field Three'];
    for (const label of fields) {
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', 'text');
      await page.fill('[data-testid="field-label-input"]', label);
      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${label}")`, { timeout: 5000 });
    }
    await screenshot(page, '05-fields-added');
  });

  test('should display delete button on form fields', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Verify delete buttons exist on fields
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await expect(fieldOne.locator('[data-testid="delete-field-button"]')).toBeVisible();
    await screenshot(page, '06-delete-button-visible');
  });

  test('should show confirmation dialog when deleting field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Setup dialog handler to check for confirmation
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    // Click delete on a field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();
    await screenshot(page, '07-confirmation-dialog');

    // Verify confirmation was shown
    expect(dialogMessage).toContain('sure');
  });

  test('should cancel deletion when dismissing confirmation', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    const initialCount = await page.locator('[data-testid="form-field"]').count();
    await screenshot(page, '08-before-cancel');

    // Setup dialog to dismiss (cancel)
    page.on('dialog', dialog => dialog.dismiss());

    // Click delete
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();

    // Wait a moment for any potential deletion to process
    await page.waitForTimeout(500);

    // Verify field is NOT deleted
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).toBeVisible();

    // Verify count unchanged
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount);
    await screenshot(page, '09-deletion-cancelled');
  });

  test('should successfully delete field when confirmed', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    const initialCount = await page.locator('[data-testid="form-field"]').count();
    await screenshot(page, '10-before-delete');

    // Setup dialog to accept (confirm)
    page.on('dialog', dialog => dialog.accept());

    // Click delete
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();

    // Verify success notification
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Verify field is removed
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).not.toBeVisible();

    // Verify count decreased
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount - 1);
    await screenshot(page, '11-after-delete');
  });

  test('should delete multiple fields in sequence', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete first field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).not.toBeVisible({ timeout: 10000 });
    await screenshot(page, '12-first-field-deleted');

    // Delete second field
    const fieldTwo = page.locator('[data-testid="form-field"]', { hasText: 'Field Two' });
    await fieldTwo.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible({ timeout: 10000 });
    await screenshot(page, '13-second-field-deleted');

    // Verify only Field Three remains
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Three' })).toBeVisible();
    await screenshot(page, '14-only-one-field-remains');
  });

  test('should persist deletion after page reload', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete a field
    const fieldTwo = page.locator('[data-testid="form-field"]', { hasText: 'Field Two' });
    await fieldTwo.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible({ timeout: 10000 });
    await screenshot(page, '15-before-reload');

    // Reload the page
    await page.reload();
    await page.waitForURL('**/forms/*/edit');

    // Verify field is still gone
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible();

    // Verify other fields still exist
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).toBeVisible();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Three' })).toBeVisible();
    await screenshot(page, '16-after-reload');
  });

  test('should show empty state when all fields deleted', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete all fields
    const fields = ['Field One', 'Field Two', 'Field Three'];
    for (const label of fields) {
      const field = page.locator('[data-testid="form-field"]', { hasText: label });
      if (await field.isVisible()) {
        await field.locator('[data-testid="delete-field-button"]').click();
        await expect(page.locator('[data-testid="form-field"]', { hasText: label })).not.toBeVisible({ timeout: 10000 });
      }
    }

    // Verify no fields remain
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(0);

    // Verify empty state message appears
    await expect(page.locator('text=No fields yet')).toBeVisible();
    await screenshot(page, '17-empty-state');
  });

  test('should still have add field button after deletion', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete a field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).not.toBeVisible({ timeout: 10000 });

    // Verify add field button still exists
    await expect(page.locator('[data-testid="add-field-button"]')).toBeVisible();
    await screenshot(page, '18-add-button-visible');

    // Verify can add new field after deletion
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'New Field');
    await page.click('[data-testid="save-field-button"]');

    await expect(page.locator('[data-testid="form-field"]', { hasText: 'New Field' })).toBeVisible({ timeout: 5000 });
    await screenshot(page, '19-new-field-added');
  });

});
