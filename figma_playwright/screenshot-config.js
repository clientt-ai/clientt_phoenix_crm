// @ts-check
const path = require('path');

/**
 * Screenshot Configuration Helper for Figma Playwright Tests
 *
 * Provides a consistent way to generate screenshot paths that always point to
 * the centralized playwright_screenshots/figma_playwright directory.
 */

// Root of the figma_playwright directory
const FIGMA_PLAYWRIGHT_ROOT = __dirname;

// Root of the project (parent of figma_playwright)
const PROJECT_ROOT = path.join(FIGMA_PLAYWRIGHT_ROOT, '..');

// Centralized screenshots directory for figma tests
const SCREENSHOTS_ROOT = path.join(PROJECT_ROOT, 'playwright_screenshots', 'figma_playwright');

/**
 * Get the screenshot directory for a figma test file
 *
 * @param {string} testFilePath - The __dirname of the test file
 * @returns {string} The screenshot directory path
 *
 * @example
 * // In figma_playwright/205 Forms Dashboard/FG-SC-001_capture_screenshots.spec.js
 * const screenshotsDir = getScreenshotDir(__dirname);
 * // Returns: /path/to/playwright_screenshots/figma_playwright/205-forms-dashboard
 */
function getScreenshotDir(testFilePath) {
  // Get the relative path from figma_playwright root to the test file directory
  const relativePath = path.relative(FIGMA_PLAYWRIGHT_ROOT, testFilePath);

  // Convert spaces to hyphens and lowercase for consistent naming
  const normalizedPath = relativePath
    .toLowerCase()
    .replace(/\s+/g, '-');

  // Construct the screenshot directory path
  return path.join(SCREENSHOTS_ROOT, normalizedPath);
}

/**
 * Create a screenshot helper function for a figma test file
 *
 * @param {string} testFilePath - The __dirname of the test file
 * @param {string} [subdirectory] - Optional subdirectory within the test folder (e.g., 'main', 'form-builder')
 * @returns {Function} A screenshot helper function
 *
 * @example
 * const screenshot = createScreenshotHelper(__dirname);
 * await screenshot(page, 'my-screenshot'); // Saves to correct directory with name 'my-screenshot.png'
 *
 * @example
 * const screenshot = createScreenshotHelper(__dirname, 'main');
 * // Saves to: playwright_screenshots/figma_playwright/205-forms-dashboard/main/
 */
function createScreenshotHelper(testFilePath, subdirectory = null) {
  let screenshotsDir = getScreenshotDir(testFilePath);

  if (subdirectory) {
    screenshotsDir = path.join(screenshotsDir, subdirectory);
  }

  return async function screenshot(page, name) {
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}.png`),
      fullPage: false
    });
  };
}

/**
 * Create a theme-aware screenshot helper that captures both light and dark modes
 *
 * @param {string} testFilePath - The __dirname of the test file
 * @param {string} [subdirectory] - Optional subdirectory within the test folder (e.g., 'main', 'form-builder')
 * @returns {Function} A theme screenshot helper function
 *
 * @example
 * const screenshot = createThemeScreenshotHelper(__dirname);
 * await screenshot(page, 'dashboard'); // Creates dashboard-light.png and dashboard-dark.png
 *
 * @example
 * const screenshot = createThemeScreenshotHelper(__dirname, 'main');
 * // Saves to: playwright_screenshots/figma_playwright/205-forms-dashboard/main/
 */
function createThemeScreenshotHelper(testFilePath, subdirectory = null) {
  let screenshotsDir = getScreenshotDir(testFilePath);

  if (subdirectory) {
    screenshotsDir = path.join(screenshotsDir, subdirectory);
  }

  return async function screenshot(page, name) {
    // Take light mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}-light.png`),
      fullPage: false
    });

    // Take dark mode screenshot
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(screenshotsDir, `${name}-dark.png`),
      fullPage: false
    });

    // Reset to light mode for next test
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
  };
}

module.exports = {
  getScreenshotDir,
  createScreenshotHelper,
  createThemeScreenshotHelper,
  FIGMA_PLAYWRIGHT_ROOT,
  PROJECT_ROOT,
  SCREENSHOTS_ROOT
};
