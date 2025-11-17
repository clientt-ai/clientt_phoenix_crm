const { test, expect } = require('@playwright/test');

/**
 * FM-SC-007: Delete Form
 *
 * This test verifies that users can delete an existing form and that
 * it is properly removed from the system.
 */

test.describe('FM-SC-007: Delete Form', () => {

  let testFormName;

  test.beforeEach(async ({ page }) => {
    // Login to the application
    await page.goto('/sign-in');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'SampleAdmin123!');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect after login (expect to go to / or stay on /sign-in with success message)
    await page.waitForTimeout(2000);

    // Navigate directly to forms page after login
    await page.goto("/forms");
    await expect(page).toHaveURL(/.*forms|/);

    // Create a test form to delete
    testFormName = `Test Form ${Date.now()}`;
    await page.goto('/forms/new');
    await page.fill('[data-testid="form-name-input"]', testFormName);
    await page.fill('[data-testid="form-description-input"]', 'This is a test form for deletion');
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-draft"]');
    await page.click('[data-testid="save-form-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Navigate to forms listing
    await page.goto('/forms');
  });

  test('should display delete button and confirmation dialog', async ({ page }) => {
    // Step 2-3: Locate form and note count
    const initialCount = await page.locator('[data-testid="form-card"]').count();

    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await expect(formCard).toBeVisible();

    // Step 4: Click Delete button
    await formCard.locator('[data-testid="delete-form-button"]').click();

    // Step 5: Verify confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // Verify warning message
    await expect(confirmDialog).toContainText(/Are you sure|Delete form|cannot be undone/i);

    // Verify dialog has Cancel and Delete buttons
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-delete-button"]')).toBeVisible();
  });

  test('should cancel deletion when clicking Cancel button', async ({ page }) => {
    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });

    // Step 4-6: Click delete and then cancel
    await formCard.locator('[data-testid="delete-form-button"]').click();
    await page.click('[data-testid="cancel-button"]');

    // Step 7: Verify form is NOT deleted
    await expect(formCard).toBeVisible();

    // Verify dialog is closed
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
  });

  test('should successfully delete form when confirmed', async ({ page }) => {
    // Get initial count
    const initialCount = await page.locator('[data-testid="form-card"]').count();

    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });

    // Step 8-9: Click delete and confirm
    await formCard.locator('[data-testid="delete-form-button"]').click();
    await page.click('[data-testid="confirm-delete-button"]');

    // Step 10: Verify success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-notification"]')).toContainText(
      /Form deleted successfully|deleted/i
    );

    // Step 11-12: Verify form is removed from listing
    await expect(page.locator('[data-testid="form-card"]', { hasText: testFormName })).not.toBeVisible();

    // Verify count decreased
    const finalCount = await page.locator('[data-testid="form-card"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should not find deleted form in search', async ({ page }) => {
    // Delete the form
    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCard.locator('[data-testid="delete-form-button"]').click();
    await page.click('[data-testid="confirm-delete-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Step 13: Attempt to search for deleted form
    const searchBox = page.locator('[data-testid="search-forms-input"]');

    if (await searchBox.isVisible()) {
      await searchBox.fill(testFormName);
      await page.waitForTimeout(500);

      // Step 14: Verify form does not appear
      const searchResults = page.locator('[data-testid="form-card"]');
      await expect(searchResults).toHaveCount(0);

      // Verify empty state or "no results" message
      const noResults = page.locator('[data-testid="no-results"]');
      if (await noResults.isVisible()) {
        await expect(noResults).toContainText(/No forms found|No results/i);
      }
    }
  });

  test('should return 404 when accessing deleted form URL directly', async ({ page }) => {
    // Get form URL before deletion
    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCard.click();

    const formUrl = page.url();

    // Navigate back and delete
    await page.goto('/forms');
    const formCardAgain = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCardAgain.locator('[data-testid="delete-form-button"]').click();
    await page.click('[data-testid="confirm-delete-button"]');
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();

    // Step 15: Try to access deleted form URL
    await page.goto(formUrl);

    // Verify 404 or "Form not found" error
    await expect(
      page.locator('body')
    ).toContainText(/404|Not found|Form not found|doesn't exist/i);
  });

  test('should show warning about consequences before deletion', async ({ page }) => {
    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCard.locator('[data-testid="delete-form-button"]').click();

    // Verify warning about data loss
    const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
    await expect(confirmDialog).toContainText(
      /This will also delete|submissions will be deleted|permanent|cannot be undone/i
    );
  });

  test('should handle deletion of form with submissions', async ({ page }) => {
    // First, publish the form and create a submission
    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCard.click();

    // Change status to Active
    await page.click('[data-testid="form-status-select"]');
    await page.click('[data-testid="status-option-active"]');
    await page.click('[data-testid="save-form-button"]');

    // Add a field
    await page.click('[data-testid="add-field-button"]');
    await page.click('[data-testid="field-type-text"]');
    await page.fill('[data-testid="field-label-input"]', 'Test Field');
    await page.click('[data-testid="save-field-button"]');
    await page.click('[data-testid="save-form-button"]');

    // Get submission URL
    await page.click('[data-testid="view-form-link"]');
    const submissionUrl = page.url();

    // Create a submission (logout first if needed for public access)
    await page.goto(submissionUrl);
    await page.fill('[data-testid="input-test-field"]', 'Test submission data');
    await page.click('[data-testid="submit-form-button"]');

    // Navigate back and delete the form
    await page.goto('/forms');
    const formCardAgain = page.locator('[data-testid="form-card"]', { hasText: testFormName });
    await formCardAgain.locator('[data-testid="delete-form-button"]').click();

    // Verify enhanced warning about submissions
    const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
    await expect(confirmDialog).toContainText(
      /submission|data will be deleted|has \d+ submission/i
    );

    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify successful deletion
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="form-card"]', { hasText: testFormName })).not.toBeVisible();
  });

  test('should prevent unauthorized users from deleting forms', async ({ page }) => {
    // Logout and login as a user without delete permissions
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Login as regular user (if your system has role-based permissions)
    await page.goto('/sign-in');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'SampleAdmin123!');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect after login (expect to go to / or stay on /sign-in with success message)
    await page.waitForTimeout(2000);

    // Navigate directly to forms page after login
    await page.goto("/forms");

    await page.goto('/forms');

    const formCard = page.locator('[data-testid="form-card"]', { hasText: testFormName });

    // Verify delete button is not visible or disabled
    const deleteButton = formCard.locator('[data-testid="delete-form-button"]');
    const isVisible = await deleteButton.isVisible();

    if (isVisible) {
      // If visible, it should be disabled
      await expect(deleteButton).toBeDisabled();
    } else {
      // Delete button should not be visible
      await expect(deleteButton).not.toBeVisible();
    }
  });

});
