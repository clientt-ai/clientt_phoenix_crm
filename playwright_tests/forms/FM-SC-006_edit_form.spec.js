const { test, expect } = require('@playwright/test');

/**
 * FM-SC-006: Edit Existing Form
 *
 * This test verifies that users can edit an existing form's basic information
 * and field configuration, then save the changes successfully.
 */

test.describe('FM-SC-006: Edit Existing Form', () => {

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

    // Create a test form to edit - click the Create Form button
    formName = `Edit Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');

    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Original description');
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
  });

  test('should load form edit page with pre-filled data', async ({ page }) => {
    // Navigate to forms listing
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    // Find and click edit link for our form
    const formRow = page.locator('table tbody tr', { hasText: formName });
    await expect(formRow).toBeVisible();

    const editLink = formRow.locator('a[href*="/edit"]');
    await editLink.click();
    await page.waitForLoadState('networkidle');

    // Verify form edit page loads with current data
    await expect(page).toHaveURL(/.*forms\/.*\/edit|forms\/[a-zA-Z0-9-]+$/);
    await expect(page.locator('[data-testid="form-name-input"]')).toHaveValue(formName);
    await expect(page.locator('[data-testid="form-description-input"]')).toHaveValue('Original description');
  });

  test('should edit basic form information', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Edit form name and description
    const newName = `Updated Form ${Date.now()}`;
    await page.fill('[data-testid="form-name-input"]', newName);
    await page.fill('[data-testid="form-description-input"]', 'Updated description');

    // Save changes
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Verify changes in listing
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');
    const formRow = page.locator('table tbody tr', { hasText: newName });
    await expect(formRow).toBeVisible();
  });

  test('should edit existing form field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Click edit button on the Full Name field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await fullNameField.locator('[data-testid="edit-field-button"]').click();

    // Change label
    await page.fill('[data-testid="field-label-input"]', 'Customer Name');
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your full name');

    // Save field changes
    await page.click('[data-testid="save-field-button"]');

    // Verify field updated
    const updatedField = page.locator('[data-testid="form-field"]', { hasText: 'Customer Name' });
    await expect(updatedField).toBeVisible({ timeout: 5000 });

    // Verify old name is gone
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Full Name' })).not.toBeVisible();
  });

  test('should remove a field from the form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Count initial fields
    const initialCount = await page.locator('[data-testid="form-field"]').count();

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
  });

  test('should add a new field to existing form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Count initial fields
    const initialCount = await page.locator('[data-testid="form-field"]').count();

    // Add a new field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');
    await page.fill('[data-testid="field-label-input"]', 'Comments');
    await page.click('[data-testid="save-field-button"]');

    // Verify new field appears
    const newField = page.locator('[data-testid="form-field"]', { hasText: 'Comments' });
    await expect(newField).toBeVisible({ timeout: 5000 });

    // Verify count increased
    const finalCount = await page.locator('[data-testid="form-field"]').count();
    expect(finalCount).toBe(initialCount + 1);
  });

  test('should maintain form ID when editing name', async ({ page }) => {
    // Extract form ID from URL
    const match = formUrl.match(/forms\/([a-zA-Z0-9-]+)/);
    const formId = match ? match[1] : null;

    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Change form name
    const newName = `Renamed Form ${Date.now()}`;
    await page.fill('[data-testid="form-name-input"]', newName);
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Verify URL still contains the same ID
    const newUrl = page.url();
    expect(newUrl).toContain(formId);
  });

  test('should navigate from listing to edit and back', async ({ page }) => {
    // Start at listing
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    // Find and click edit
    const formRow = page.locator('table tbody tr', { hasText: formName });
    const editLink = formRow.locator('a[href*="/edit"]');
    await editLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on edit page
    await expect(page).toHaveURL(/.*forms\/.*\/edit|forms\/[a-zA-Z0-9-]+$/);

    // Navigate back to listing
    await page.click('a[href="/forms"]');
    await page.waitForLoadState('networkidle');

    // Verify we're back at listing
    await expect(page).toHaveURL(/.*forms$/);
    await expect(page.locator('table')).toBeVisible();
  });

  test('should update multiple fields in sequence', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Edit first field
    const fullNameField = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await fullNameField.locator('[data-testid="edit-field-button"]').click();
    await page.fill('[data-testid="field-label-input"]', 'First Name');
    await page.click('[data-testid="save-field-button"]');
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'First Name' })).toBeVisible({ timeout: 5000 });

    // Edit second field
    const emailField = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await emailField.locator('[data-testid="edit-field-button"]').click();
    await page.fill('[data-testid="field-label-input"]', 'Work Email');
    await page.click('[data-testid="save-field-button"]');
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Work Email' })).toBeVisible({ timeout: 5000 });

    // Verify both updates persisted
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'First Name' })).toBeVisible();
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Work Email' })).toBeVisible();
  });

});
