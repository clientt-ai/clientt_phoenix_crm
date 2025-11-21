// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { createScreenshotHelper } = require('../../../../screenshot-config');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4002';

/**
 * EMB-SC-001: Embeddable Form Loading Tests
 *
 * Tests for loading embeddable forms on external websites.
 * The embed widget allows customers to place forms on their own sites
 * using a simple script tag and custom HTML element.
 */
test.describe('EMB-SC-001: Embeddable Form Loading', () => {
  // Helper function to capture screenshots with consistent naming
  const screenshot = createScreenshotHelper(__dirname);

  test.beforeEach(async ({ page }) => {
    // Load the test HTML page
    const testPagePath = path.join(__dirname, '..', 'test-page.html');
    await page.goto(`file://${testPagePath}`);
    await screenshot(page, '01-test-page-loaded');
  });

  test('should load embed script successfully', async ({ page }) => {
    // Add the embed script dynamically
    await page.evaluate((baseUrl) => {
      const script = document.createElement('script');
      script.src = `${baseUrl}/embed/clientt-forms.js`;
      document.head.appendChild(script);
      return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }, BASE_URL);

    // Verify the custom element is defined
    const customElementDefined = await page.evaluate(() => {
      return customElements.get('clientt-form') !== undefined;
    });

    expect(customElementDefined).toBe(true);
    await screenshot(page, '02-script-loaded-successfully');
  });

  test('should show error when form-id attribute is missing', async ({ page }) => {
    // Load the embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // Add form element without form-id
    await page.evaluate(() => {
      const container = document.getElementById('form-container');
      container.innerHTML = '<clientt-form></clientt-form>';
    });

    // Wait for error message to appear
    await page.waitForSelector('.clientt-error-summary', { timeout: 5000 });
    await screenshot(page, '03-error-missing-form-id');

    const errorText = await page.textContent('.clientt-error-summary');
    expect(errorText).toContain('Form ID is required');
  });

  test('should show error for invalid form ID', async ({ page }) => {
    // Load the embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // Add form element with invalid UUID
    await page.evaluate(() => {
      const container = document.getElementById('form-container');
      container.innerHTML = '<clientt-form form-id="invalid-uuid-12345"></clientt-form>';
    });

    // Wait for error message to appear
    await page.waitForSelector('.clientt-error-summary', { timeout: 10000 });
    await screenshot(page, '04-error-invalid-form-id');

    const errorText = await page.textContent('.clientt-error-summary');
    expect(errorText).toContain('Form not found');
  });

  test('should display loading spinner while fetching form', async ({ page }) => {
    // Load the embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // Slow down network to see loading state
    await page.route('**/api/public/forms/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    // Add form element
    await page.evaluate(() => {
      const container = document.getElementById('form-container');
      container.innerHTML = '<clientt-form form-id="00000000-0000-0000-0000-000000000001"></clientt-form>';
    });

    // Check for loading spinner
    const spinner = await page.waitForSelector('.clientt-spinner', { timeout: 2000 });
    expect(spinner).toBeTruthy();
    await screenshot(page, '05-loading-spinner-visible');
  });

  test('should inject styles into document head', async ({ page }) => {
    // Load the embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // Add a form element to trigger style injection
    await page.evaluate(() => {
      const container = document.getElementById('form-container');
      container.innerHTML = '<clientt-form form-id="test"></clientt-form>';
    });

    // Wait for styles to be injected (use 'attached' since style elements aren't visible)
    await page.waitForSelector('#clientt-form-styles', { state: 'attached', timeout: 5000 });

    // Verify styles exist
    const styleContent = await page.evaluate(() => {
      const style = document.getElementById('clientt-form-styles');
      return style ? style.textContent : null;
    });

    expect(styleContent).toContain('clientt-form');
    expect(styleContent).toContain('--clientt-primary-color');
    await screenshot(page, '06-styles-injected');
  });

  test('should apply custom CSS variables from host page', async ({ page }) => {
    // Load the embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // The test page already has custom CSS variables defined
    // We just need to verify they can be applied

    const customColor = await page.evaluate(() => {
      const form = document.createElement('clientt-form');
      document.getElementById('form-container').appendChild(form);
      const computedStyle = getComputedStyle(form);
      return computedStyle.getPropertyValue('--clientt-primary-color').trim();
    });

    expect(customColor).toBe('#FF5722');
    await screenshot(page, '07-custom-css-variables-applied');
  });
});

/**
 * Integration test with a real published form
 * These tests require a published form to exist in the database
 */
test.describe('EMB-SC-001: Embeddable Form Loading - Integration', () => {
  const screenshot = createScreenshotHelper(__dirname);

  test.skip('should load and render a published form', async ({ page }) => {
    // This test requires a real published form ID
    // Skip by default, enable when running against a seeded database

    const PUBLISHED_FORM_ID = process.env.TEST_FORM_ID;
    if (!PUBLISHED_FORM_ID) {
      test.skip();
      return;
    }

    // Navigate to test page
    const testPagePath = path.join(__dirname, '..', 'test-page.html');
    await page.goto(`file://${testPagePath}`);
    await screenshot(page, '08-integration-test-page');

    // Load embed script
    await page.addScriptTag({ url: `${BASE_URL}/embed/clientt-forms.js` });

    // Add form element
    await page.evaluate((formId) => {
      const container = document.getElementById('form-container');
      container.innerHTML = `<clientt-form form-id="${formId}"></clientt-form>`;
    }, PUBLISHED_FORM_ID);

    // Wait for form to load
    await page.waitForSelector('.clientt-form-title', { timeout: 10000 });
    await screenshot(page, '09-published-form-loaded');

    // Verify form elements
    const title = await page.textContent('.clientt-form-title');
    expect(title).toBeTruthy();

    // Verify at least one field rendered
    const fields = await page.$$('.clientt-field');
    expect(fields.length).toBeGreaterThan(0);
    await screenshot(page, '10-form-fields-rendered');

    // Verify submit button exists
    const submitBtn = await page.$('button[type="submit"]');
    expect(submitBtn).toBeTruthy();
    await screenshot(page, '11-submit-button-visible');
  });
});
