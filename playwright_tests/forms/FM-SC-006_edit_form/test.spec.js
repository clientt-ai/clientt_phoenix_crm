const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-006: Edit Existing Form
 *
 * This test verifies that users can edit an existing form's basic information
 * and field configuration, then save the changes successfully.
 */

test.describe('FM-SC-006: Edit Existing Form', () => {
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

    // Create a test form to edit - click the Create Form button
    formName = `Edit Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Original description');
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
    await screenshot(page, '05-edit-page-loaded');

    // Add initial fields
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.click('[data-testid="save-field-button"]');
    await page.waitForSelector('[data-testid="form-field"]:has-text("Email Address")', { timeout: 5000 });
    await screenshot(page, '06-initial-fields-added');
  });

  test('should load form edit page with pre-filled data', async ({ page }) => {
    // Navigate to forms listing
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Find and click edit link for our form
    const formRow = page.locator('table tbody tr', { hasText: formName });
    await expect(formRow).toBeVisible();

    const editLink = formRow.locator('a[href*="/edit"]');
    await editLink.click();
    await page.waitForURL('**/forms/*/edit');

    // Verify form edit page loads with current data
    await expect(page).toHaveURL(/.*forms\/.*\/edit|forms\/[a-zA-Z0-9-]+$/);
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue(formName);
    await expect(page.locator('[data-testid="form-description-input"]')).toHaveValue('Original description');
    await screenshot(page, '07-prefilled-data');
  });

  test('should edit basic form information', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Edit form name and description
    const newName = `Updated Form ${Date.now()}`;
    await page.fill('[data-testid="form-name-input"]', newName);
    await page.fill('[data-testid="form-description-input"]', 'Updated description');
    await screenshot(page, '08-edited-form-info');

    // Save changes
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '09-changes-saved');

    // Verify changes in listing
    await page.goto('/forms');
    await page.waitForURL('**/forms');
    const formRow = page.locator('table tbody tr', { hasText: newName });
    await expect(formRow).toBeVisible();
    await screenshot(page, '10-updated-in-listing');
  });

  test('should edit existing form field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Click edit button on the Full Name field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await fullNameField.locator('[data-testid="edit-field-button"]').click();
    await screenshot(page, '11-editing-field');

    // Change label
    await page.fill('[data-testid="field-label-input"]', 'Customer Name');
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your full name');
    await screenshot(page, '12-field-edited');

    // Save field changes
    await page.click('[data-testid="save-field-button"]');

    // Verify field updated
    const updatedField = page.locator('[data-testid="form-field"]', { hasText: 'Customer Name' });
    await expect(updatedField).toBeVisible({ timeout: 5000 });

    // Verify old name is gone
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Full Name' })).not.toBeVisible();
    await screenshot(page, '13-field-updated');
  });

  test('should remove a field from the form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Count initial fields
    const initialCount = await page.locator('[data-testid="form-field"]').count();
    await screenshot(page, '14-before-field-deletion');

    // Click delete button on Email Address field
    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });

    // Handle browser confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await emailField.locator('[data-testid="delete-field-button"]').click();

    // Verify field is removed
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Email Address' })).not.toBeVisible({ timeout: 10000 });

    // Verify count decreased
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount - 1);
    await screenshot(page, '15-after-field-deletion');
  });

  test('should add a new field to existing form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Count initial fields
    const initialCount = await page.locator('[data-testid="form-field"]').count();

    // Add a new field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');
    await page.fill('[data-testid="field-label-input"]', 'Comments');
    await screenshot(page, '16-adding-new-field');
    await page.click('[data-testid="save-field-button"]');

    // Verify new field appears
    const newField = page.locator('[data-testid="form-field"]', { hasText: 'Comments' });
    await expect(newField).toBeVisible({ timeout: 5000 });

    // Verify count increased
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount + 1);
    await screenshot(page, '17-new-field-added');
  });

  test('should maintain form ID when editing name', async ({ page }) => {
    // Extract form ID from URL
    const match = formUrl.match(/forms\/([a-zA-Z0-9-]+)/);
    const formId = match ? match[1] : null;

    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Change form name
    const newName = `Renamed Form ${Date.now()}`;
    await page.fill('[data-testid="form-name-input"]', newName);
    await screenshot(page, '18-renaming-form');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Verify URL still contains the same ID
    const newUrl = page.url();
    expect(newUrl).toContain(formId);
    await screenshot(page, '19-form-renamed');
  });

  test('should navigate from listing to edit and back', async ({ page }) => {
    // Start at listing
    await page.goto('/forms');
    await page.waitForURL('**/forms');
    await screenshot(page, '20-listing-page');

    // Find and click edit
    const formRow = page.locator('table tbody tr', { hasText: formName });
    const editLink = formRow.locator('a[href*="/edit"]');
    await editLink.click();
    await page.waitForURL('**/forms/*/edit');

    // Verify we're on edit page
    await expect(page).toHaveURL(/.*forms\/.*\/edit|forms\/[a-zA-Z0-9-]+$/);
    await screenshot(page, '21-edit-page');

    // Navigate back to listing
    await page.click('a[href="/forms"]');
    await page.waitForURL('**/forms');

    // Verify we're back at listing
    await expect(page).toHaveURL(/.*forms$/);
    await expect(page.locator('table')).toBeVisible();
    await screenshot(page, '22-back-to-listing');
  });

  test('should update multiple fields in sequence', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForURL('**/forms/*/edit');

    // Edit first field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await fullNameField.locator('[data-testid="edit-field-button"]').click();
    await page.fill('[data-testid="field-label-input"]', 'First Name');
    await page.click('[data-testid="save-field-button"]');
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'First Name' })).toBeVisible({ timeout: 5000 });
    await screenshot(page, '23-first-field-updated');

    // Edit second field
    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await emailField.locator('[data-testid="edit-field-button"]').click();
    await page.fill('[data-testid="field-label-input"]', 'Work Email');
    await page.click('[data-testid="save-field-button"]');
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Work Email' })).toBeVisible({ timeout: 5000 });
    await screenshot(page, '24-second-field-updated');

    // Verify both updates persisted
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'First Name' })).toBeVisible();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Work Email' })).toBeVisible();
    await screenshot(page, '25-both-fields-updated');
  });

});
