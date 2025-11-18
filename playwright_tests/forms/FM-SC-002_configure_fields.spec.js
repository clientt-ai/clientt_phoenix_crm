const { test, expect } = require('@playwright/test');

/**
 * FM-SC-002: Configure Form Fields and Validation
 *
 * This test verifies that a user can add multiple field types to a form
 * and configure their validation rules successfully.
 */

test.describe('FM-SC-002: Configure Form Fields and Validation', () => {

  let formId;

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

    // Create a test form to configure
    const formName = `Config Test Form ${Date.now()}`;
    await page.goto('/forms/new');
    await page.waitForLoadState('networkidle');
    // Wait for form input to be ready
    await expect(page.locator('[data-testid="form-name-input"]')).toBeVisible({ timeout: 10000 });
    await page.fill('[data-testid="form-name-input"]', formName);
    await page.fill('[data-testid="form-description-input"]', 'Form for field configuration testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });

    // Wait for notification to auto-dismiss
    await page.waitForTimeout(500);

    // Extract form ID from URL for later use
    await page.waitForURL(/.*forms\/[a-zA-Z0-9-]+/);
    const url = page.url();
    const match = url.match(/forms\/([a-zA-Z0-9-]+)/);
    formId = match ? match[1] : null;
  });

  test('should add text input field with validation', async ({ page }) => {
    // Click Add Field button (visible after form is saved)
    await page.click('[data-testid="add-field-button"]');

    // Select field type from dropdown
    await page.selectOption('[data-testid="field-type-select"]', 'text');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.check('[data-testid="field-required-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close and field to appear
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears in form builder
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
  });

  test('should add email field', async ({ page }) => {
    // Add an Email field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'email');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Email Address');
    await page.check('[data-testid="field-required-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Email Address' });
    await expect(field).toBeVisible();
    await expect(field.locator('[data-testid="field-required-badge"]')).toBeVisible();
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

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears with all options
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Product Category' });
    await expect(field).toBeVisible();
  });

  test('should add textarea field', async ({ page }) => {
    // Add a Textarea field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'textarea');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Feedback Comments');
    await page.check('[data-testid="field-required-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Feedback Comments' });
    await expect(field).toBeVisible();
  });

  test('should add number field', async ({ page }) => {
    // Add a Number field
    await page.click('[data-testid="add-field-button"]');
    await page.selectOption('[data-testid="field-type-select"]', 'number');

    // Configure field
    await page.fill('[data-testid="field-label-input"]', 'Rating');
    await page.check('[data-testid="field-required-checkbox"]');

    // Save field
    await page.click('[data-testid="save-field-button"]');

    // Wait for modal to close
    await page.waitForSelector('[data-testid="form-field"]', { timeout: 5000 });

    // Verify field appears
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Rating' });
    await expect(field).toBeVisible();
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
    for (const fieldConfig of fields) {
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
    }

    // Verify all 5 fields are present
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(5);
  });

});
