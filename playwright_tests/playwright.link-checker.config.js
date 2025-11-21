// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

/**
 * Playwright configuration for Link Checker tests
 *
 * This config is optimized for crawling and checking links:
 * - Serial execution to avoid state conflicts
 * - Extended timeouts for full page crawling
 * - Custom reporter for link checker output
 *
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/link-checker',
  testMatch: ['**/*.spec.js'],

  // Global setup to seed the database before tests
  globalSetup: require.resolve('./global-setup.js'),

  // Extended timeout for crawling operations
  timeout: 120 * 1000,

  // Run tests serially to avoid state conflicts
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for link checker - we want accurate results
  workers: 1, // Single worker for consistent state

  // Reporter configuration
  reporter: [
    [path.join(__dirname, 'tests/link-checker/link-checker-reporter.js')],
    ['html', { open: 'never', outputFolder: 'playwright-report/link-checker' }],
    ['json', { outputFile: 'test-results/link-checker-playwright.json' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for your Phoenix application
    baseURL: process.env.BASE_URL || 'http://localhost:4002',

    // Viewport
    viewport: { width: 1920, height: 1080 },

    // Collect trace on failure for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },

    // Video on failure
    video: 'retain-on-failure',

    // Extended navigation timeout for slow pages
    navigationTimeout: 15 * 1000,

    // Extended action timeout
    actionTimeout: 15 * 1000,
  },

  // Only run on Chromium for link checking (faster)
  projects: [
    {
      name: 'link-checker',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Run your Phoenix server before starting the tests
  webServer: {
    command: 'cd ../clientt_crm_app && mix phx.server',
    url: 'http://localhost:4002',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
