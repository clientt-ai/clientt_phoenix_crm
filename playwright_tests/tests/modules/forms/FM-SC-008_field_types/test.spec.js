const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-008: Form Field Type Configuration
 *
 * This test verifies that various form field types can be added
 * and configured correctly in the form builder.
 */

test.describe('FM-SC-008: Form Field Type Configuration', () => {
  const screenshotsDir = path.join(__dirname, '../../playwright_screenshots/playwright_tests/forms', path.basename(__dirname));
  let formUrl;
  let formName;

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

    // Create a new form for field type testing - click the Create Form button
    formName = `Field Types Test ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Field type validation testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '04-form-created');

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
    await screenshot(page, '05-text-field-configured');
    await page.click('[data-testid="save-field-button"]');

    // Verify field added
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Text Input');
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
    await screenshot(page, '06-text-field-added');
  });

  test('should add Email field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');
    await page.fill('[data-testid="field-label-input"]', 'Contact Email');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '07-email-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Contact Email' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Email');
    await screenshot(page, '08-email-field-added');
  });

  test('should add Number field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'number');
    await page.fill('[data-testid="field-label-input"]', 'Age');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '09-number-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Age' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Number');
    await screenshot(page, '10-number-field-added');
  });

  test('should add Date field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'date');
    await page.fill('[data-testid="field-label-input"]', 'Birth Date');
    await screenshot(page, '11-date-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Birth Date' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Date');
    await screenshot(page, '12-date-field-added');
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
    await screenshot(page, '13-select-field-configured');

    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Country' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Select Dropdown');
    await screenshot(page, '14-select-field-added');
  });

  test('should add Checkbox field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'checkbox');
    await page.fill('[data-testid="field-label-input"]', 'Accept Terms');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '15-checkbox-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Accept Terms' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Checkbox');
    await screenshot(page, '16-checkbox-field-added');
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
    await screenshot(page, '17-radio-field-configured');

    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Contact Method' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Radio Buttons');
    await screenshot(page, '18-radio-field-added');
  });

  test('should add Textarea field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');
    await page.fill('[data-testid="field-label-input"]', 'Comments');
    await page.fill('[data-testid="field-placeholder-input"]', 'Enter your comments here');
    await screenshot(page, '19-textarea-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Comments' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Text Area');
    await screenshot(page, '20-textarea-field-added');
  });

  test('should add Phone field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'phone');
    await page.fill('[data-testid="field-label-input"]', 'Phone Number');
    await screenshot(page, '21-phone-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Phone Number' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('Phone');
    await screenshot(page, '22-phone-field-added');
  });

  test('should add URL field', async ({ page }) => {
    await page.goto(formUrl);
    await page.waitForLoadState('networkidle');

    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'url');
    await page.fill('[data-testid="field-label-input"]', 'Website');
    await page.fill('[data-testid="field-placeholder-input"]', 'https://example.com');
    await screenshot(page, '23-url-field-configured');
    await page.click('[data-testid="save-field-button"]');

    const field = page.locator('[data-testid="form-field"]', { hasText: 'Website' });
    await expect(field).toBeVisible({ timeout: 5000 });
    await expect(field).toContainText('URL');
    await screenshot(page, '24-url-field-added');
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

    for (let i = 0; i < fieldTypes.length; i++) {
      const config = fieldTypes[i];
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', config.type);
      await page.fill('[data-testid="field-label-input"]', config.label);

      if (config.options) {
        await page.fill('textarea[name="options"]', config.options);
      }

      await page.click('[data-testid="save-field-button"]');
      await page.waitForSelector(`[data-testid="form-field"]:has-text("${config.label}")`, { timeout: 5000 });
      await screenshot(page, `25-all-types-field-${i + 1}-added`);
    }

    // Verify all fields added
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(10);
    await screenshot(page, '26-all-field-types-added');
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
    await screenshot(page, '27-field-in-preview');
  });

});
