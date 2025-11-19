// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:3000',
    // Viewport set to 1080p to limit screenshot size (max 8000px)
    viewport: { width: 1920, height: 1080 },
    trace: 'on-first-retry',
    // Screenshot on failure (viewport only, not full page)
    screenshot: {
      mode: 'only-on-failure',
      fullPage: false,
    },
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    cwd: '../../figma_src/205 Forms Dashboard',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
