const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-002: Configure Form Fields and Validation
 *
 * This test verifies that a user can add multiple field types to a form
 * and configure their validation rules successfully.
 */

test.describe('FM-SC-002: Configure Form Fields and Validation', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  let formId;

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

    // Wait for authentication to complete
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

    // Create a test form to configure - click the Create Form button
    const formName = `Config Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForLoadState('networkidle');

    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Form for field configuration testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '04-form-created');

    // Wait for notification to auto-dismiss before continuing
    // Notification may still be visible but should not block navigation

    // Extract form ID from URL for later use
    await page.waitForURL(/.*forms\/[a-zA-Z0-9-]+/);
    const url = page.url();
    const match = url.match(/forms\/([a-zA-Z0-9-]+)/);
    formId = match ? match[1] : null;
  });

  test('should add text input field with validation', async ({ page }) => {
    // Click Add Field button (visible after form is saved)
    await page.click('[data-testid="add-field-button"]');
    await screenshot(page, '05-add-field-modal');

    // Select field type from dropdown
    await page.selectOption('[data-testid="field-type-select"]', 'text');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '06-text-field-configured');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close and field to appear
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears in form builder
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
    await screenshot(page, '07-text-field-added');
  });

  test('should add email field', async ({ page }) => {
    // Add an Email field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '08-email-field-configured');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
    await screenshot(page, '09-email-field-added');
  });

  test('should add dropdown field with options', async ({ page }) => {
    // Add a Select Dropdown field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'select');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Product Category');
    await page.check('[data-testid="field-required-checkbox"]');

    // Add options (one per line in the textarea)
    await page.fill('textarea[name="options"]', 'Electronics\nClothing\nHome & Garden\nOther');
    await screenshot(page, '10-select-field-configured');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears with all options
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Product Category' });
    await expect(field).toBeVisible();
    await screenshot(page, '11-select-field-added');
  });

  test('should add textarea field', async ({ page }) => {
    // Add a Textarea field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Feedback Comments');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '12-textarea-field-configured');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Feedback Comments' });
    await expect(field).toBeVisible();
    await screenshot(page, '13-textarea-field-added');
  });

  test('should add number field', async ({ page }) => {
    // Add a Number field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'number');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Rating');
    await page.check('[data-testid="field-required-checkbox"]');
    await screenshot(page, '14-number-field-configured');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Rating' });
    await expect(field).toBeVisible();
    await screenshot(page, '15-number-field-added');
  });

  test('should configure multiple fields in sequence', async ({ page }) => {
    const fields = [
      { type: 'text', label: 'Full Name' },
      { type: 'email', label: 'Email Address' },
      { type: 'select', label: 'Product Category', options: 'Option 1\nOption 2' },
      { type: 'textarea', label: 'Feedback Comments' },
      { type: 'number', label: 'Rating' }
    ];

    // Add each field
    for (let i = 0; i < fields.length; i++) {
      const fieldConfig = fields[i];
      await page.click('[data-testid="add-field-button"]');
      await page.selectOption('[data-testid="field-type-select"]', fieldConfig.type);
      await page.fill('[data-testid="field-label-input"]', fieldConfig.label);
      await page.check('[data-testid="field-required-checkbox"]');

      if (fieldConfig.options) {
        await page.fill('textarea[name="options"]', fieldConfig.options);
      }

      await page.click('[data-testid="save-field-button"]');

      // Wait for field to appear
      const field = page.locator('[data-testid="form-field"]', { hasText: fieldConfig.label });
      await expect(field).toBeVisible({ timeout: 5000 });
      await screenshot(page, `16-multiple-fields-${i + 1}-added`);
    }

    // Verify all 5 fields are present
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(5);
    await screenshot(page, '17-all-fields-added');
  });

});
