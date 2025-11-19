// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './',
  testMatch: ['**/*.spec.js'],

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Use 2 workers locally to prevent server overload; CI uses 1 for stability
  workers: process.env.CI ? 1 : 2,

  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Shared settings for all projects
  use: {
    // Base URL for your Phoenix application
    baseURL: process.env.BASE_URL || 'http://localhost:4002',

    // Viewport set to 1080p to limit screenshot size (max 8000px)
    viewport: { width: 1920, height: 1080 },

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure (viewport only, not full page)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },

    // Video on failure
    video: 'retain-on-failure',

    // Navigation timeout
    navigationTimeout: 10 * 1000,

    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },

    // Mobile viewports
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
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
