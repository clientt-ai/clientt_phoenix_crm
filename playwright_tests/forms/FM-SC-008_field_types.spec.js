const { test, expect } = require('@playwright/test');

/**
 * FM-SC-008: Form Field Type Configuration
 *
 * This test verifies that various form field types can be added
 * and configured correctly in the form builder.
 */

test.describe('FM-SC-008: Form Field Type Configuration', () => {

  let formUrl;
  let formName;

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

    // Create a new form for field type testing - click the Create Form button
    formName = `Field Types Test ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');

    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Field type validation testing');
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
  });

  test('should add Text Input field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your name');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    // Verify field added
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Text Input');
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
  });

  test('should add Email field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');
    await page.fill('[data-testid="field-label-input"]', 'Contact Email');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Contact Email' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Email');
  });

  test('should add Number field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'number');
    await page.fill('[data-testid="field-label-input"]', 'Age');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Age' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Number');
  });

  test('should add Date field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'date');
    await page.fill('[data-testid="field-label-input"]', 'Birth Date');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Birth Date' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Date');
  });

  test('should add Select Dropdown field with options', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'select');
    await page.fill('[data-testid="field-label-input"]', 'Country');
    await page.check('[data-testid="field-required-checkbox"]');

    // Add options
    await page.fill('textarea[name="options"]', 'USA\nCanada\nUK\nAustralia');

    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Country' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Select Dropdown');
  });

  test('should add Checkbox field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'checkbox');
    await page.fill('[data-testid="field-label-input"]', 'Accept Terms');
    await page.check('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Accept Terms' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Checkbox');
  });

  test('should add Radio Button field with options', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'radio');
    await page.fill('[data-testid="field-label-input"]', 'Contact Method');
    await page.check('[data-testid="field-required-checkbox"]');

    // Add options
    await page.fill('textarea[name="options"]', 'Email\nPhone\nSMS');

    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Contact Method' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Radio Buttons');
  });

  test('should add Textarea field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');
    await page.fill('[data-testid="field-label-input"]', 'Comments');
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your comments here');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Comments' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Text Area');
  });

  test('should add Phone field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'phone');
    await page.fill('[data-testid="field-label-input"]', 'Phone Number');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Phone Number' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Phone');
  });

  test('should add URL field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'url');
    await page.fill('[data-testid="field-label-input"]', 'Website');
    await page.fill('[data-testid="field-placeholder-input"]', 'https://example.com');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Website' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('URL');
  });

  test('should add all field types to single form', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    const fieldTypes = [
      { type: 'text', label: 'Name' },
      { type: 'email', label: 'Email' },
      { type: 'number', label: 'Age' },
      { type: 'phone', label: 'Phone' },
      { type: 'url', label: 'Website' },
      { type: 'date', label: 'Date' },
      { type: 'checkbox', label: 'Agree' },
      { type: 'select', label: 'Country', options: 'USA\nCanada' },
      { type: 'radio', label: 'Contact', options: 'Email\nPhone' },
      { type: 'textarea', label: 'Notes' }
    ];

    for (const config of fieldTypes) {
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', config.type);
      await page.fill('[data-testid="field-label-input"]', config.label);

      if (config.options) {
        await page.fill('textarea[name="options"]', config.options);
      }

      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${config.label}")`, { timeout: 5000 });
    }

    // Verify all fields added
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(10);
  });

  test('should show correct field type in preview', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    // Add a text field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'text');
    await page.fill('[data-testid="field-label-input"]', 'Preview Test');
    await page.click('[data-testid="save-field-button"]');

    // Verify field appears in both the field list and preview
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Preview Test' })).toBeVisible({ timeout: 5000 });

    // The preview section should show the field label
    await expect(page.locator('label', { hasText: 'Preview Test' })).toBeVisible();
  });

});
