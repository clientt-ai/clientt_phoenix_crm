// @ts-check

/**
 * General Test Helper Functions
 *
 * Reusable utility functions for common test operations.
 */

/**
 * Waits for an element to be visible with custom timeout
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForElement(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Fills a form with provided data
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object.<string, string>} formData - Key-value pairs where key is selector and value is the input value
 * @returns {Promise<void>}
 */
async function fillForm(page, formData) {
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
  }
}

/**
 * Takes a screenshot with a descriptive name
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @returns {Promise<void>}
 */
async function takeScreenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Waits for network to be idle
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} [timeout=30000] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForNetworkIdle(page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Checks if an element exists in the DOM (doesn't have to be visible)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<boolean>}
 */
async function elementExists(page, selector) {
  return (await page.locator(selector).count()) > 0;
}

/**
 * Clicks an element with retry logic
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @returns {Promise<void>}
 */
async function clickWithRetry(page, selector, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.click(selector, { timeout: 5000 });
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Extracts text content from an element
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - Element selector
 * @returns {Promise<string>}
 */
async function getTextContent(page, selector) {
  return await page.locator(selector).textContent() || '';
}

/**
 * Waits for a specific URL pattern
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {RegExp|string} urlPattern - URL pattern to wait for
 * @param {number} [timeout=10000] - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForURL(page, urlPattern, timeout = 10000) {
  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Performs a search operation (common pattern in CRM apps)
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} searchTerm - Term to search for
 * @param {string} [searchInputSelector='input[type="search"]'] - Search input selector
 * @returns {Promise<void>}
 */
async function performSearch(page, searchTerm, searchInputSelector = 'input[type="search"]') {
  await page.fill(searchInputSelector, searchTerm);
  await page.keyboard.press('Enter');
  await waitForNetworkIdle(page);
}

module.exports = {
  waitForElement,
  fillForm,
  takeScreenshot,
  waitForNetworkIdle,
  elementExists,
  clickWithRetry,
  getTextContent,
  waitForURL,
  performSearch,
};
