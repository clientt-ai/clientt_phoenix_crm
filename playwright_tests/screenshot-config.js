// @ts-check
const path = require('path');

/**
 * Screenshot Configuration Helper
 *
 * Provides a consistent way to generate screenshot paths that always point to
 * the centralized playwright_screenshots directory, regardless of test nesting depth.
 */

// Root of the playwright_tests directory
const PLAYWRIGHT_TESTS_ROOT = __dirname;

// Root of the project (parent of playwright_tests)
const PROJECT_ROOT = path.join(PLAYWRIGHT_TESTS_ROOT, '..');

// Centralized screenshots directory
const SCREENSHOTS_ROOT = path.join(PROJECT_ROOT, 'playwright_screenshots');

/**
 * Get the screenshot directory for a test file
 *
 * @param {string} testFilePath - The __dirname of the test file
 * @returns {string} The screenshot directory path
 *
 * @example
 * // In playwright_tests/forms/FM-SC-001_create_form/test.spec.js
 * const screenshotsDir = getScreenshotDir(__dirname);
 * // Returns: /path/to/playwright_screenshots/playwright_tests/forms/FM-SC-001_create_form
 *
 * @example
 * // In playwright_tests/navigation/NAV-SC-001_sidebar_links/test.spec.js
 * const screenshotsDir = getScreenshotDir(__dirname);
 * // Returns: /path/to/playwright_screenshots/playwright_tests/navigation/NAV-SC-001_sidebar_links
 */
function getScreenshotDir(testFilePath) {
  // Get the relative path from playwright_tests root to the test file directory
  const relativePath = path.relative(PLAYWRIGHT_TESTS_ROOT, testFilePath);

  // Construct the screenshot directory path
  return path.join(SCREENSHOTS_ROOT, 'playwright_tests', relativePath);
}

/**
 * Create a screenshot helper function for a test file
 *
 * @param {string} testFilePath - The __dirname of the test file
 * @returns {Function} A screenshot helper function
 *
 * @example
 * const screenshot = createScreenshotHelper(__dirname);
 * await screenshot(page, 'my-screenshot'); // Saves to correct directory with name 'my-screenshot.png'
 */
function createScreenshotHelper(testFilePath) {
  const screenshotsDir = getScreenshotDir(testFilePath);

  return async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: false
    });
  };
}

module.exports = {
  getScreenshotDir,
  createScreenshotHelper,
  PLAYWRIGHT_TESTS_ROOT,
  PROJECT_ROOT,
  SCREENSHOTS_ROOT
};
