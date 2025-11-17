const { test, expect } = require('@playwright/test');

/**
 * FM-SC-001: Create New Form Successfully
 *
 * This test verifies that a user can create a new form with basic configuration
 * and that the form is saved successfully in the system.
 */

test.describe('FM-SC-001: Create New Form Successfully', () => {

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login and redirect
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to Forms section
    await page.click('[data-testid="nav-forms"]');
    await expect(page).toHaveURL(/.*forms/);
  });

  test('should create a new form with valid data', async ({ page }) => {
    // Step 1-2: Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');
    await expect(page.locator('[data-testid="form-builder"]')).toBeVisible();

    // Step 3: Enter form name
    await page.fill('[data-testid="form-name-input"]', 'Customer Feedback Form');

    // Step 4: Enter form description
    await page.fill(
      '[data-testid="form-description-input"]',
      'Collect customer feedback on product experience'
    );

    // Step 5: Select form category
    await page.click('[data-testid="form-category-select"]');
    await page.click('[data-testid="category-option-customer-service"]');

    // Step 6: Set form status
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-draft"]');

    // Step 7: Click Save button
    await page.click('[data-testid="save-form-button"]');

    // Step 8: Verify success notification appears
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      'Form created successfully'
    );

    // Step 9: Verify redirect to form details or form builder page
    await expect(page).toHaveURL(/.*forms\/[a-zA-Z0-9-]+/);

    // Step 10: Navigate back to forms listing
    await page.click('[data-testid="nav-forms"]');

    // Verify the form appears in the listing
    const formCard = page.locator('[data-testid="form-card"]', {
      hasText: 'Customer Feedback Form'
    });
    await expect(formCard).toBeVisible();

    // Verify form details in the listing
    await expect(formCard.locator('[data-testid="form-name"]')).toContainText(
      'Customer Feedback Form'
    );
    await expect(formCard.locator('[data-testid="form-status"]')).toContainText('Draft');
  });

  test('should validate required fields when creating form', async ({ page }) => {
    // Click on "Create New Form" button
    await page.click('[data-testid="create-form-button"]');

    // Try to save without filling required fields
    await page.click('[data-testid="save-form-button"]');

    // Verify validation errors appear
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-name-error"]')).toContainText(
      'Form name is required'
    );
  });

  test('should handle form name uniqueness validation', async ({ page }) => {
    // Create first form
    await page.click('[data-testid="create-form-button"]');
    await page.fill('[data-testid="form-name-input"]', 'Unique Form Name');
    await page.fill('[data-testid="form-description-input"]', 'Test description');
    await page.click('[data-testid="save-form-button"]');

    // Wait for success
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Try to create another form with the same name
    await page.click('[data-testid="nav-forms"]');
    await page.click('[data-testid="create-form-button"]');
    await page.fill('[data-testid="form-name-input"]', 'Unique Form Name');
    await page.fill('[data-testid="form-description-input"]', 'Another description');
    await page.click('[data-testid="save-form-button"]');

    // Verify uniqueness validation error
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-name-error"]')).toContainText(
      'Form name already exists'
    );
  });

});
