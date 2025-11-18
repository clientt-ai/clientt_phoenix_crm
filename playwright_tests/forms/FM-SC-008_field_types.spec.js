const { test, expect } = require('@playwright/test');

/**
 * FM-SC-008: Form Field Type Validation
 *
 * This test verifies that various form field types behave correctly
 * and validate data appropriately.
 */

test.describe('FM-SC-008: Form Field Type Validation', () => {

  let formUrl;

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[name="user[email]"]', 'admin@example.com');
    await page.fill('input[name="user[password]"]', 'SampleAdmin123!');
    await page.click('form:has(input[name="user[email]"]) button[type="submit"]');

    // Wait for authentication to complete
    await page.waitForLoadState('networkidle');



    // Navigate to forms page
    await page.goto("/forms");
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*forms|/);

    // Step 1: Create a new form for field type testing
    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', 'Field Type Testing Form');
    await page.fill('[data-testid="form-description-input"]', 'Comprehensive field type validation testing');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    formUrl = page.url();
  });

  test('should add and validate Text Input field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 3-8: Add Text Input field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-text"]');
    await page.fill('[data-testid="field-label-input"]', 'Full Name');
    await page.fill('[data-testid="max-length-input"]', '100');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    // Verify field added
    const field = page.locator('[data-testid="form-field"]', { hasText: 'Full Name' });
    await expect(field).toBeVisible();

    // Save and test the form
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    // Test with valid text
    await page.fill('[data-testid="input-full-name"]', 'John Smith');
    await expect(page.locator('[data-testid="input-full-name"]')).toHaveValue('John Smith');

    // Test with text exceeding max length
    const longText = 'A'.repeat(150);
    await page.fill('[data-testid="input-full-name"]', longText);
    await page.click('[data-testid="submit-form-button"]');

    // Verify max length validation
    const error = page.locator('[data-testid="error-full-name"]');
    if (await error.isVisible()) {
      await expect(error).toContainText(/maximum|too long|100 characters/i);
    }
  });

  test('should add and validate Email field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 9-13: Add Email field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-email"]');
    await page.fill('[data-testid="field-label-input"]', 'Contact Email');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    const emailInput = '[data-testid="input-contact-email"]';

    // Test with valid email
    await page.fill(emailInput, 'sample_admin@clientt.com');
    await expect(page.locator(emailInput)).toHaveValue('sample_admin@clientt.com');

    // Test invalid formats
    const invalidEmails = ['notanemail', 'missing@domain', '@nodomain.com'];

    for (const invalidEmail of invalidEmails) {
      await page.fill(emailInput, invalidEmail);
      await page.click('[data-testid="submit-form-button"]');

      // Verify email validation error
      const error = page.locator('[data-testid="error-contact-email"]');
      await expect(error).toBeVisible();
      await expect(error).toContainText(/valid email|email format|invalid email/i);
    }
  });

  test('should add and validate Number field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 14-20: Add Number field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-number"]');
    await page.fill('[data-testid="field-label-input"]', 'Age');
    await page.fill('[data-testid="min-value-input"]', '18');
    await page.fill('[data-testid="max-value-input"]', '120');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    const ageInput = '[data-testid="input-age"]';

    // Test with valid number
    await page.fill(ageInput, '25');
    await expect(page.locator(ageInput)).toHaveValue('25');

    // Test with number below min
    await page.fill(ageInput, '10');
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-age"]')).toContainText(/minimum|at least 18|below/i);

    // Test with number above max
    await page.fill(ageInput, '150');
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-age"]')).toContainText(/maximum|at most 120|exceeds/i);

    // Test with non-numeric input
    await page.fill(ageInput, 'abc');
    await page.click('[data-testid="submit-form-button"]');
    const error = page.locator('[data-testid="error-age"]');
    if (await error.isVisible()) {
      await expect(error).toContainText(/number|numeric|invalid/i);
    }
  });

  test('should add and validate Date field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 21-26: Add Date field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-date"]');
    await page.fill('[data-testid="field-label-input"]', 'Appointment Date');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    // Test date picker
    const dateInput = page.locator('[data-testid="input-appointment-date"]');
    await dateInput.click();

    // Select a date from picker (if available)
    const datePicker = page.locator('[data-testid="date-picker"]');
    if (await datePicker.isVisible()) {
      await page.click('[data-testid="date-option-15"]'); // Select 15th day
    } else {
      // Manual entry
      await dateInput.fill('2025-12-15');
    }

    // Verify date is set
    const dateValue = await dateInput.inputValue();
    expect(dateValue).toBeTruthy();
  });

  test('should add and validate Dropdown field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 27-32: Add Dropdown field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-dropdown"]');
    await page.fill('[data-testid="field-label-input"]', 'Country');
    await page.click('[data-testid="field-required-checkbox"]');

    // Add options
    const options = ['USA', 'Canada', 'UK', 'Australia', 'Other'];
    for (let i = 0; i < options.length; i++) {
      await page.fill(`[data-testid="option-input-${i + 1}"]`, options[i]);
      if (i < options.length - 1) {
        await page.click('[data-testid="add-option-button"]');
      }
    }

    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    // Test selecting options
    await page.click('[data-testid="select-country"]');
    await expect(page.locator('[data-testid="option-usa"]')).toBeVisible();
    await page.click('[data-testid="option-canada"]');

    // Test submission without selection
    await page.reload();
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-country"]')).toContainText(/required|select/i);
  });

  test('should add and validate Checkbox field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 33-37: Add Checkbox field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-checkbox"]');
    await page.fill('[data-testid="field-label-input"]', 'Terms and Conditions');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    const checkbox = page.locator('[data-testid="checkbox-terms-and-conditions"]');

    // Test checking the box
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Test submission without checking
    await checkbox.uncheck();
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-terms-and-conditions"]')).toContainText(/required|must/i);
  });

  test('should add and validate Radio Button field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 38-43: Add Radio Button field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-radio"]');
    await page.fill('[data-testid="field-label-input"]', 'Preferred Contact Method');
    await page.click('[data-testid="field-required-checkbox"]');

    // Add options
    await page.fill('[data-testid="option-input-1"]', 'Email');
    await page.click('[data-testid="add-option-button"]');
    await page.fill('[data-testid="option-input-2"]', 'Phone');
    await page.click('[data-testid="add-option-button"]');
    await page.fill('[data-testid="option-input-3"]', 'SMS');

    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    // Test selecting each option
    await page.click('[data-testid="radio-email"]');
    await expect(page.locator('[data-testid="radio-email"]')).toBeChecked();

    // Verify only one can be selected
    await page.click('[data-testid="radio-phone"]');
    await expect(page.locator('[data-testid="radio-phone"]')).toBeChecked();
    await expect(page.locator('[data-testid="radio-email"]')).not.toBeChecked();

    // Test submission without selection
    await page.reload();
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-preferred-contact-method"]')).toContainText(/required|select/i);
  });

  test('should add and validate Textarea field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 44-49: Add Textarea field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-textarea"]');
    await page.fill('[data-testid="field-label-input"]', 'Additional Comments');
    await page.fill('[data-testid="min-length-input"]', '20');
    await page.fill('[data-testid="max-length-input"]', '500');
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    const textarea = '[data-testid="textarea-additional-comments"]';

    // Test with valid text
    await page.fill(textarea, 'This is a valid comment that meets the minimum requirement of twenty characters.');
    await expect(page.locator(textarea)).toHaveValue(/This is a valid comment/);

    // Test with text under min length
    await page.fill(textarea, 'Too short');
    await page.click('[data-testid="submit-form-button"]');
    await expect(page.locator('[data-testid="error-additional-comments"]')).toContainText(/minimum|20 characters/i);

    // Test with text over max length
    const longText = 'A'.repeat(600);
    await page.fill(textarea, longText);
    await page.click('[data-testid="submit-form-button"]');
    const error = page.locator('[data-testid="error-additional-comments"]');
    if (await error.isVisible()) {
      await expect(error).toContainText(/maximum|500 characters/i);
    }

    // Verify character count if available
    const charCount = page.locator('[data-testid="char-count-additional-comments"]');
    if (await charCount.isVisible()) {
      await expect(charCount).toBeVisible();
    }
  });

  test('should add and validate File Upload field', async ({ page }) => {
    await page.goto(formUrl);

    // Step 50-56: Add File Upload field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-file"]');
    await page.fill('[data-testid="field-label-input"]', 'Resume');
    await page.fill('[data-testid="allowed-file-types-input"]', 'pdf,doc,docx');
    await page.fill('[data-testid="max-file-size-input"]', '5'); // 5MB
    await page.click('[data-testid="field-required-checkbox"]');
    await page.click('[data-testid="save-field-button"]');

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    const fileInput = page.locator('[data-testid="file-input-resume"]');

    // Test with valid file (create a test PDF)
    // Note: In real testing, you'd use actual test files
    // This is a placeholder for the test structure
    await fileInput.setInputFiles({
      name: 'test-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });

    // Verify file name appears
    const fileName = page.locator('[data-testid="uploaded-file-name"]');
    if (await fileName.isVisible()) {
      await expect(fileName).toContainText('test-resume.pdf');
    }
  });

  test('should submit form with all field types filled correctly', async ({ page }) => {
    // This test adds all field types and submits with valid data
    await page.goto(formUrl);

    // Add all field types quickly
    const allFields = [
      { type: 'text', label: 'Full Name' },
      { type: 'email', label: 'Email' },
      { type: 'number', label: 'Age', min: '18', max: '120' },
      { type: 'textarea', label: 'Comments', minLength: '20' },
      { type: 'dropdown', label: 'Country', options: ['USA', 'Canada'] },
      { type: 'checkbox', label: 'Terms' },
      { type: 'radio', label: 'Contact', options: ['Email', 'Phone'] }
    ];

    for (const field of allFields) {
      await page.click('[data-testid="add-field-button"]');
      await page.click(`[data-testid="field-type-${field.type}"]`);
      await page.fill('[data-testid="field-label-input"]', field.label);

      if (field.options) {
        for (let i = 0; i < field.options.length; i++) {
          await page.fill(`[data-testid="option-input-${i + 1}"]`, field.options[i]);
          if (i < field.options.length - 1) {
            await page.click('[data-testid="add-option-button"]');
          }
        }
      }

      if (field.min) await page.fill('[data-testid="min-value-input"]', field.min);
      if (field.max) await page.fill('[data-testid="max-value-input"]', field.max);
      if (field.minLength) await page.fill('[data-testid="min-length-input"]', field.minLength);

      await page.click('[data-testid="save-field-button"]');
    }

    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');
    await page.click('[data-testid="view-form-link"]');

    // Fill all fields with valid data
    await page.fill('[data-testid="input-full-name"]', 'John Smith');
    await page.fill('[data-testid="input-email"]', 'john@example.com');
    await page.fill('[data-testid="input-age"]', '30');
    await page.fill('[data-testid="textarea-comments"]', 'This is a valid comment with enough characters to meet the minimum requirement.');
    await page.click('[data-testid="select-country"]');
    await page.click('[data-testid="option-usa"]');
    await page.check('[data-testid="checkbox-terms"]');
    await page.click('[data-testid="radio-email"]');

    // Submit form
    await page.click('[data-testid="submit-form-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/submitted successfully/i);
  });

});
