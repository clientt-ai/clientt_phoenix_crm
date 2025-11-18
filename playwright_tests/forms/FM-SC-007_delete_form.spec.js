const { test, expect } = require('@playwright/test');

/**
 * FM-SC-007: Delete Form
 *
 * This test verifies that users can delete form fields.
 * NOTE: Form deletion from listing is not yet implemented.
 * These tests focus on field deletion functionality.
 */

test.describe('FM-SC-007: Delete Form Fields', () => {

  let formName;
  let formUrl;

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Navigate to forms page via sidebar (like a manual tester would)
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Forms');

    // Create a test form with fields - click the Create Form button
    formName = `Delete Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Form for deletion testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Wait for notification to auto-dismiss before navigating
    // Notification may still be visible but should not block navigation

    // Navigate back to listing to get the proper edit URL
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');

    // Find the form and get its edit URL
    const formRow = page.locator('table tbody tr', { hasText: formName });
    const editLink = formRow.locator('a[href*="/edit"]');
    formUrl = await editLink.getAttribute('href');

    // Navigate to the edit page
    await editLink.click();
    await page.waitForLoadState('networkidle');

    // Add multiple fields for deletion testing
    const fields = ['Field One', 'Field Two', 'Field Three'];
    for (const label of fields) {
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', 'text');
      await page.fill('[data-testid="field-label-input"]', label);
      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${label}")`, { timeout: 5000 });
    }
  });

  test('should display delete button on form fields', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Verify delete buttons exist on fields
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await expect(fieldOne.locator('[data-testid="delete-field-button"]')).toBeVisible();
  });

  test('should show confirmation dialog when deleting field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Setup dialog handler to check for confirmation
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    // Click delete on a field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();

    // Verify confirmation was shown
    expect(dialogMessage).toContain('sure');
  });

  test('should cancel deletion when dismissing confirmation', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('[data-testid="form-field"]').count();

    // Setup dialog to dismiss (cancel)
    page.on('dialog', dialog => dialog.dismiss());

    // Click delete
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();

    // Wait for any potential deletion to process
    await page.waitForLoadState('networkidle');

    // Verify field is NOT deleted
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).toBeVisible();

    // Verify count unchanged
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should successfully delete field when confirmed', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator('[data-testid="form-field"]').count();

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
  });

  test('should delete multiple fields in sequence', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete first field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).not.toBeVisible({ timeout: 10000 });

    // Delete second field
    const fieldTwo = page.locator('[data-testid="form-field"]', { hasText: 'Field Two' });
    await fieldTwo.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible({ timeout: 10000 });

    // Verify only Field Three remains
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Three' })).toBeVisible();
  });

  test('should persist deletion after page reload', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete a field
    const fieldTwo = page.locator('[data-testid="form-field"]', { hasText: 'Field Two' });
    await fieldTwo.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible({ timeout: 10000 });

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify field is still gone
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Two' })).not.toBeVisible();

    // Verify other fields still exist
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).toBeVisible();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field Three' })).toBeVisible();
  });

  test('should show empty state when all fields deleted', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

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
  });

  test('should still have add field button after deletion', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Setup dialog to accept
    page.on('dialog', dialog => dialog.accept());

    // Delete a field
    const fieldOne = page.locator('[data-testid="form-field"]', { hasText: 'Field One' });
    await fieldOne.locator('[data-testid="delete-field-button"]').click();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Field One' })).not.toBeVisible({ timeout: 10000 });

    // Verify add field button still exists
    await expect(page.locator('[data-testid="add-field-button"]')).toBeVisible();

    // Verify can add new field after deletion
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'New Field');
    await page.click('[data-testid="save-field-button"]');

    await expect(page.locator('[data-testid="form-field"]', { hasText: 'New Field' })).toBeVisible({ timeout: 5000 });
  });

});
