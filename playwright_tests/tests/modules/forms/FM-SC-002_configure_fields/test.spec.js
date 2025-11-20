const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * FM-SC-002: Configure Form Fields and Validation
 *
 * This test verifies that a user can add multiple field types to a form
 * and configure their validation rules successfully.
 *
 * Updated for new 3-column builder UI with field palette and properties panel.
 */

test.describe('FM-SC-002: Configure Form Fields and Validation', () => {
  const screenshotsDir = path.join(__dirname, '../../playwright_screenshots/playwright_tests/forms', path.basename(__dirname));
  let formId;

  // Helper function to capture screenshots with consistent naming
  async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: false
    });
  }

  // Helper to add a field from the palette
  async function addFieldFromPalette(page, fieldLabel) {
    // Find and click the button with the field label text
    const fieldButton = page.locator(`button:has-text("${fieldLabel}")`).first();
    await fieldButton.click();
    await page.waitForTimeout(500); // Wait for field to be added
  }

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await screenshot(page, '01-sign-in-page');

    await page.fill('input[name="user[email]"]', 'sample_admin@clientt.com');
    await page.fill('input[name="user[password]"]', 'Hang123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForURL('**/dashboard');
    await screenshot(page, '02-after-login');

    // Navigate to forms page
    await page.goto('/forms');
    await page.waitForURL('**/forms');

    // Verify sidebar navigation and page content are present
    await expect(page.locator('[data-testid="nav-forms"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Forms');
    await screenshot(page, '03-forms-listing-page');

    // Create a test form to configure
    const formName = `Config Test Form ${Date.now()}`;
    await page.click('[data-testid="create-form-button"]');
    await page.waitForURL('**/forms/new');

    // Wait for form input to be ready and fill form details
    const nameInput = page.locator('[data-testid="form-name-input"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(formName);
    await nameInput.blur();
    await page.waitForTimeout(500);

    const descInput = page.locator('[data-testid="form-description-input"]');
    await descInput.fill('Form for field configuration testing');
    await descInput.blur();
    await page.waitForTimeout(500);

    // Save the form first (required before adding fields)
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]').first()).toBeVisible({ timeout: 10000 });
    await screenshot(page, '04-form-created');

    // Extract form ID from URL for later use
    await page.waitForURL(/.*forms\/[a-zA-Z0-9-]+/);
    const url = page.url();
    const match = url.match(/forms\/([a-zA-Z0-9-]+)/);
    formId = match ? match[1] : null;
  });

  test('should add text input field with validation', async ({ page }) => {
    // Add a text field from the Contacts category (First Name)
    await addFieldFromPalette(page, 'First Name');
    await screenshot(page, '05-field-added');

    // Wait for the field to appear in the canvas
    const field = page.locator('[data-testid="form-field"]').first();
    await expect(field).toBeVisible({ timeout: 5000 });

    // The field should be selected automatically, showing properties panel
    // Update the field label
    const labelInput = page.locator('[data-testid="field-label-input"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.fill('Full Name');

    // Check the required checkbox
    const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
    await requiredCheckbox.check();
    await page.waitForTimeout(500); // Wait for auto-save
    await screenshot(page, '06-text-field-configured');

    // Verify field appears with updated label
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Full Name' })).toBeVisible();
    await screenshot(page, '07-text-field-added');
  });

  test('should add email field', async ({ page }) => {
    // Add an Email field from the Contacts category
    await addFieldFromPalette(page, 'Email');
    await screenshot(page, '08-email-field-added');

    // Wait for the field to appear
    const field = page.locator('[data-testid="form-field"]').first();
    await expect(field).toBeVisible({ timeout: 5000 });

    // Update the field label
    const labelInput = page.locator('[data-testid="field-label-input"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.fill('Email Address');

    // Check the required checkbox
    const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
    await requiredCheckbox.check();
    await page.waitForTimeout(500);
    await screenshot(page, '09-email-field-configured');

    // Verify field appears with updated label
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Email Address' })).toBeVisible();
  });

  test('should add dropdown field with options', async ({ page }) => {
    // Add a Select Dropdown field from the Choices category
    await addFieldFromPalette(page, 'Select Dropdown');
    await screenshot(page, '10-select-field-added');

    // Wait for the field to appear
    const field = page.locator('[data-testid="form-field"]').first();
    await expect(field).toBeVisible({ timeout: 5000 });

    // Update the field label
    const labelInput = page.locator('[data-testid="field-label-input"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.fill('Product Category');

    // Check the required checkbox
    const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
    await requiredCheckbox.check();

    // Add options (one per line in the textarea)
    const optionsTextarea = page.locator('textarea[name="options"]');
    await optionsTextarea.fill('Electronics\nClothing\nHome & Garden\nOther');
    await page.waitForTimeout(500);
    await screenshot(page, '11-select-field-configured');

    // Verify field appears with updated label
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Product Category' })).toBeVisible();
  });

  test('should add textarea field', async ({ page }) => {
    // Add a Text Area field from the General category
    await addFieldFromPalette(page, 'Text Area');
    await screenshot(page, '12-textarea-field-added');

    // Wait for the field to appear
    const field = page.locator('[data-testid="form-field"]').first();
    await expect(field).toBeVisible({ timeout: 5000 });

    // Update the field label
    const labelInput = page.locator('[data-testid="field-label-input"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.fill('Feedback Comments');

    // Check the required checkbox
    const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
    await requiredCheckbox.check();
    await page.waitForTimeout(500);
    await screenshot(page, '13-textarea-field-configured');

    // Verify field appears with updated label
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Feedback Comments' })).toBeVisible();
  });

  test('should add number field', async ({ page }) => {
    // Add a Number field from the General category
    await addFieldFromPalette(page, 'Number');
    await screenshot(page, '14-number-field-added');

    // Wait for the field to appear
    const field = page.locator('[data-testid="form-field"]').first();
    await expect(field).toBeVisible({ timeout: 5000 });

    // Update the field label
    const labelInput = page.locator('[data-testid="field-label-input"]');
    await expect(labelInput).toBeVisible({ timeout: 5000 });
    await labelInput.fill('Rating');

    // Check the required checkbox
    const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
    await requiredCheckbox.check();
    await page.waitForTimeout(500);
    await screenshot(page, '15-number-field-configured');

    // Verify field appears with updated label
    await expect(page.locator('[data-testid="form-field"]', { hasText: 'Rating' })).toBeVisible();
  });

  test('should configure multiple fields in sequence', async ({ page }) => {
    const fields = [
      { paletteLabel: 'First Name', configuredLabel: 'Full Name' },
      { paletteLabel: 'Email', configuredLabel: 'Email Address' },
      { paletteLabel: 'Select Dropdown', configuredLabel: 'Product Category', options: 'Option 1\nOption 2' },
      { paletteLabel: 'Text Area', configuredLabel: 'Feedback Comments' },
      { paletteLabel: 'Number', configuredLabel: 'Rating' }
    ];

    // Add each field
    for (let i = 0; i < fields.length; i++) {
      const fieldConfig = fields[i];

      // Add field from palette
      await addFieldFromPalette(page, fieldConfig.paletteLabel);

      // Wait for field to appear and properties panel to show
      const fieldCount = i + 1;
      await expect(page.locator('[data-testid="form-field"]')).toHaveCount(fieldCount, { timeout: 5000 });

      // Configure the field
      const labelInput = page.locator('[data-testid="field-label-input"]');
      await expect(labelInput).toBeVisible({ timeout: 5000 });
      await labelInput.fill(fieldConfig.configuredLabel);

      // Check required
      const requiredCheckbox = page.locator('[data-testid="field-required-checkbox"]');
      await requiredCheckbox.check();

      // Add options if this is a select field
      if (fieldConfig.options) {
        const optionsTextarea = page.locator('textarea[name="options"]');
        await optionsTextarea.fill(fieldConfig.options);
      }

      await page.waitForTimeout(300);
      await screenshot(page, `16-multiple-fields-${i + 1}-added`);
    }

    // Verify all 5 fields are present
    await expect(page.locator('[data-testid="form-field"]')).toHaveCount(5);
    await screenshot(page, '17-all-fields-added');
  });

});
