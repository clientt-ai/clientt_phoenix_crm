// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots', 'form-builder');

test.describe('FG-SC-002: Form Builder - Detailed Screenshots', () => {

  test.describe.configure({ mode: 'serial' });

  async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: true
    });
  }

  async function navigateToFormBuilder(page) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Forms page first
    await page.click('text=Forms');
    await page.waitForTimeout(500);

    // Click Create New Form button
    const createBtn = page.locator('button:has-text("Create New Form"), button:has-text("New")').first();
    await createBtn.click();
    await page.waitForTimeout(500);
  }

  test('01 - Form Builder - Initial Empty State', async ({ page }) => {
    await navigateToFormBuilder(page);
    await screenshot(page, '01-initial-empty-state');
  });

  test('02 - Form Builder - With Contact Fields Added', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Expand Contacts category and add fields
    const contactsCategory = page.locator('button:has-text("Contacts")');
    if (await contactsCategory.isVisible()) {
      await contactsCategory.click();
      await page.waitForTimeout(200);
    }

    // Add First Name field
    const firstNameField = page.locator('text=First Name').first();
    if (await firstNameField.isVisible()) {
      await firstNameField.click();
      await page.waitForTimeout(200);
    }

    // Add Last Name field
    const lastNameField = page.locator('text=Last Name').first();
    if (await lastNameField.isVisible()) {
      await lastNameField.click();
      await page.waitForTimeout(200);
    }

    // Add Email field
    const emailField = page.locator('text=Email').first();
    if (await emailField.isVisible()) {
      await emailField.click();
      await page.waitForTimeout(200);
    }

    await screenshot(page, '02-with-contact-fields');
  });

  test('03 - Form Builder - Field Selected (Properties Panel)', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Add a field first
    const contactsCategory = page.locator('button:has-text("Contacts")');
    if (await contactsCategory.isVisible()) {
      await contactsCategory.click();
      await page.waitForTimeout(200);
    }

    // Add Email field
    const emailField = page.locator('text=Email').first();
    if (await emailField.isVisible()) {
      await emailField.click();
      await page.waitForTimeout(300);
    }

    // Click on the field in the canvas to select it and show properties
    const fieldInCanvas = page.locator('[data-field-id]').first();
    if (await fieldInCanvas.count() > 0) {
      await fieldInCanvas.click();
      await page.waitForTimeout(300);
    } else {
      // Try clicking on field label in form
      const fieldLabel = page.locator('.grid-cols-12 >> text=Email').first();
      if (await fieldLabel.isVisible()) {
        await fieldLabel.click();
        await page.waitForTimeout(300);
      }
    }

    await screenshot(page, '03-field-selected-properties');
  });

  test('04 - Form Builder - AI Assistant Panel', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Click AI Assistant button
    const aiBtn = page.locator('button:has-text("AI Assistant")');
    if (await aiBtn.isVisible()) {
      await aiBtn.click();
      await page.waitForTimeout(500);
    }

    await screenshot(page, '04-ai-assistant-panel');
  });

  test('05 - Form Builder - Preview Dialog', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Add some fields first for preview
    const contactsCategory = page.locator('button:has-text("Contacts")');
    if (await contactsCategory.isVisible()) {
      await contactsCategory.click();
      await page.waitForTimeout(200);
    }

    // Add fields
    const fields = ['First Name', 'Email', 'Phone'];
    for (const field of fields) {
      const fieldBtn = page.locator(`text=${field}`).first();
      if (await fieldBtn.isVisible()) {
        await fieldBtn.click();
        await page.waitForTimeout(150);
      }
    }

    // Click Show Preview button
    const previewBtn = page.locator('button:has-text("Show Preview"), button:has-text("Preview")');
    if (await previewBtn.isVisible()) {
      await previewBtn.click();
      await page.waitForTimeout(500);
    }

    await screenshot(page, '05-preview-dialog');
  });

  test('06 - Form Builder - Design Options Expanded', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Look for Design Options or Theme & Design Options
    const designOptions = page.locator('text=Design Options, text=Theme & Design Options').first();
    if (await designOptions.isVisible()) {
      await designOptions.click();
      await page.waitForTimeout(300);
    } else {
      // Try the collapsible trigger
      const designTrigger = page.locator('button:has-text("Design"), [data-state] >> text=Design').first();
      if (await designTrigger.isVisible()) {
        await designTrigger.click();
        await page.waitForTimeout(300);
      }
    }

    await screenshot(page, '06-design-options-expanded');
  });

  test('07 - Form Builder - Post-Submission Actions', async ({ page }) => {
    await navigateToFormBuilder(page);

    // These buttons may be disabled if integrations aren't set up
    // Just capture the post-submission section as-is
    await page.waitForTimeout(500);

    await screenshot(page, '07-post-submission-actions');
  });

  test('08 - Form Builder - Redirect URL Dialog', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Click Redirect URL button
    const redirectBtn = page.locator('button:has-text("Redirect URL")');
    if (await redirectBtn.isVisible()) {
      await redirectBtn.click();
      await page.waitForTimeout(500);
    }

    await screenshot(page, '08-redirect-url-dialog');
  });

  test('09 - Form Builder - Multiple Field Types', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Add General fields
    const generalCategory = page.locator('button:has-text("General")');
    if (await generalCategory.isVisible()) {
      await generalCategory.click();
      await page.waitForTimeout(200);
    }

    // Add Short Answer
    const shortAnswer = page.locator('text=Short Answer').first();
    if (await shortAnswer.isVisible()) {
      await shortAnswer.click();
      await page.waitForTimeout(150);
    }

    // Add Dropdown
    const dropdown = page.locator('text=Dropdown').first();
    if (await dropdown.isVisible()) {
      await dropdown.click();
      await page.waitForTimeout(150);
    }

    // Add Date
    const dateField = page.locator('text=Date').first();
    if (await dateField.isVisible()) {
      await dateField.click();
      await page.waitForTimeout(150);
    }

    // Add Choices category fields
    const choicesCategory = page.locator('button:has-text("Choices")');
    if (await choicesCategory.isVisible()) {
      await choicesCategory.click();
      await page.waitForTimeout(200);
    }

    // Add Checkbox
    const checkbox = page.locator('text=Checkbox').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await page.waitForTimeout(150);
    }

    await screenshot(page, '09-multiple-field-types');
  });

  test('10 - Form Builder - Fields Sidebar Hidden', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Add a few fields first
    const contactsCategory = page.locator('button:has-text("Contacts")');
    if (await contactsCategory.isVisible()) {
      await contactsCategory.click();
      await page.waitForTimeout(200);
    }

    const emailField = page.locator('text=Email').first();
    if (await emailField.isVisible()) {
      await emailField.click();
      await page.waitForTimeout(150);
    }

    // Hide fields sidebar
    const hideFieldsBtn = page.locator('button:has-text("Hide Fields")');
    if (await hideFieldsBtn.isVisible()) {
      await hideFieldsBtn.click();
      await page.waitForTimeout(300);
    }

    await screenshot(page, '10-fields-sidebar-hidden');
  });

  test('11 - Form Builder - With Form Title and Description', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Fill in form title
    const titleInput = page.locator('input[placeholder*="Form Title"], input[placeholder*="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Customer Feedback Survey');
      await page.waitForTimeout(100);
    }

    // Fill in form description
    const descInput = page.locator('textarea[placeholder*="description"], textarea').first();
    if (await descInput.isVisible()) {
      await descInput.fill('Please take a moment to share your feedback with us. Your responses help us improve our services.');
      await page.waitForTimeout(100);
    }

    // Add some fields
    const contactsCategory = page.locator('button:has-text("Contacts")');
    if (await contactsCategory.isVisible()) {
      await contactsCategory.click();
      await page.waitForTimeout(200);
    }

    const fields = ['First Name', 'Email'];
    for (const field of fields) {
      const fieldBtn = page.locator(`text=${field}`).first();
      if (await fieldBtn.isVisible()) {
        await fieldBtn.click();
        await page.waitForTimeout(150);
      }
    }

    await screenshot(page, '11-with-title-description');
  });

  test('12 - Form Builder - Calendar Integration Dropdown', async ({ page }) => {
    await navigateToFormBuilder(page);

    // Open Calendar Integration dropdown
    const calendarDropdown = page.locator('button:has-text("Calendar Integration"), button:has-text("Select Calendar")');
    if (await calendarDropdown.isVisible()) {
      await calendarDropdown.click();
      await page.waitForTimeout(300);
    }

    await screenshot(page, '12-calendar-integration-dropdown');
  });

});
