---
description: Managing Playwright test screenshots in the centralized submodule
---

# Playwright Screenshots

This skill covers managing Playwright test screenshots stored in the centralized `playwright_screenshots` submodule.

## Directory Structure

```
playwright_screenshots/
├── playwright_tests/                    # Phoenix CRM test suite screenshots
│   └── tests/
│       └── modules/                      # Module-based test screenshots
│           ├── direct_links/             # Direct URL navigation screenshots
│           │   ├── unauthenticated/      # Public pages (sign-in, register, etc.)
│           │   └── authenticated/        # Authenticated pages by role
│           │       ├── admin/            # Admin role screenshots
│           │       ├── manager/          # Manager role screenshots
│           │       ├── user/             # User role screenshots
│           │       └── form_admin/       # Form admin role screenshots
│           ├── forms/                    # Form module screenshots
│           │   ├── FM-SC-001_create_form/
│           │   ├── FM-SC-002_configure_fields/
│           │   ├── FM-SC-003_submit_valid/
│           │   ├── FM-SC-004_validation_invalid/
│           │   ├── FM-SC-005_list_forms/
│           │   ├── FM-SC-006_edit_form/
│           │   ├── FM-SC-007_delete_form/
│           │   └── FM-SC-008_field_types/
│           └── navigation/               # Navigation module screenshots
│               └── NAV-SC-001_sidebar_links/
└── figma_playwright/                    # Figma design test screenshots
    └── 205-forms-dashboard/
        ├── main/                         # Dashboard page screenshots
        └── form-builder/                 # Form builder component screenshots
```

## Naming Conventions

- **Numbered prefixes**: Use `01-`, `02-`, etc. for ordering
- **Descriptive names**: Use kebab-case: `01-sign-in-page.png`
- **Theme variants**: Append `-dark` or `-light`: `01-dashboard-dark.png`

## Path Configuration

### Using the Centralized Screenshot Helper (RECOMMENDED)

**All tests should use the centralized screenshot configuration helper:**

```javascript
const { createScreenshotHelper } = require('../../../../screenshot-config');

test.describe('FM-SC-XXX: Test Name', () => {
  const screenshot = createScreenshotHelper(__dirname);

  // Use in tests:
  test('my test', async ({ page }) => {
    await page.goto('/some-page');
    await screenshot(page, '01-step-description');
  });
});
```

**Key Benefits:**
- ✅ Works at any nesting depth
- ✅ Automatically maintains correct folder structure
- ✅ Screenshots mirror test directory structure
- ✅ No manual path calculation needed

**Path Calculation:**
The helper automatically calculates the correct path based on `__dirname`:

```javascript
// For: playwright_tests/tests/modules/forms/FM-SC-001_create_form/test.spec.js
// Screenshots go to: playwright_screenshots/playwright_tests/tests/modules/forms/FM-SC-001_create_form/

// For: playwright_tests/tests/modules/direct_links/authenticated/admin/test.spec.js
// Screenshots go to: playwright_screenshots/playwright_tests/tests/modules/direct_links/authenticated/admin/
```

### For figma_playwright Tests

**Figma tests have their own screenshot helper** at `figma_playwright/screenshot-config.js`:

```javascript
const { createScreenshotHelper, createThemeScreenshotHelper } = require('../screenshot-config');

test.describe('FG-SC-XXX: Test Name', () => {
  // For regular screenshots
  const screenshot = createScreenshotHelper(__dirname, 'subdirectory');

  // For theme-aware screenshots (light/dark mode)
  const screenshot = createThemeScreenshotHelper(__dirname, 'main');

  test('my test', async ({ page }) => {
    await page.goto('/page');
    await screenshot(page, '01-screenshot-name');
    // Creates: 01-screenshot-name-light.png and 01-screenshot-name-dark.png
  });
});
```

**Examples:**
```javascript
// For: figma_playwright/205 Forms Dashboard/FG-SC-001_capture_screenshots.spec.js
const screenshot = createThemeScreenshotHelper(__dirname, 'main');
// Screenshots go to: playwright_screenshots/figma_playwright/205-forms-dashboard/main/

// For: figma_playwright/205 Forms Dashboard/FG-SC-002_form_builder_screenshots.spec.js
const screenshot = createScreenshotHelper(__dirname, 'form-builder');
// Screenshots go to: playwright_screenshots/figma_playwright/205-forms-dashboard/form-builder/
```

### Legacy Manual Path Configuration (NOT RECOMMENDED)

Only use manual paths if you have a specific need:

```javascript
const path = require('path');

const screenshotsDir = path.join(
  __dirname,
  '../../playwright_screenshots/playwright_tests/forms',
  path.basename(__dirname)
);

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}.png`),
    fullPage: false
  });
}
```

### For dark/light mode variants

Use the centralized helper with theme switching:

```javascript
const { createScreenshotHelper } = require('../../../../screenshot-config');

test.describe('My Tests', () => {
  const screenshot = createScreenshotHelper(__dirname);

  async function captureThemeScreenshots(page, name) {
    // Light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-light`);

    // Dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(300);
    await screenshot(page, `${name}-dark`);

    // Reset to light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
  }

  test('my test', async ({ page }) => {
    await page.goto('/dashboard');
    await captureThemeScreenshots(page, '01-dashboard');
  });
});
```

## Git Submodule Commands

### Initial Clone

```bash
# Clone project with submodule
git clone --recurse-submodules https://github.com/clientt-ai/clientt_phoenix_crm_01.git

# Or initialize after clone
git submodule init
git submodule update
```

### Update Submodule

```bash
# Pull latest screenshots from remote
git submodule update --remote playwright_screenshots

# Update reference in main repo
git add playwright_screenshots
git commit -m "Update screenshot submodule"
```

### Push Screenshot Changes

```bash
# Navigate to submodule
cd playwright_screenshots

# Stage and commit changes
git add .
git commit -m "Update screenshots for [feature]"
git push origin main

# Return to main project and update reference
cd ..
git add playwright_screenshots
git commit -m "Update screenshot submodule reference"
```

### Check Submodule Status

```bash
# View submodule status
git submodule status

# Check for local changes in submodule
cd playwright_screenshots && git status
```

## Adding New Test Directories

When adding new test scenarios, the screenshot directories are **automatically created** when you use the helper:

1. Create your test file in the appropriate location:
```bash
mkdir -p playwright_tests/tests/modules/{module_name}/{TEST-SC-XXX_description}
```

2. Use the screenshot helper in your test:
```javascript
const { createScreenshotHelper } = require('../../../../screenshot-config');

test.describe('TEST-SC-XXX: Description', () => {
  const screenshot = createScreenshotHelper(__dirname);

  test('my test', async ({ page }) => {
    await page.goto('/page');
    await screenshot(page, '01-screenshot-name');
  });
});
```

3. Screenshots will automatically be saved to the correct location:
```
playwright_screenshots/playwright_tests/tests/modules/{module_name}/{TEST-SC-XXX_description}/
```

4. Commit changes in both the test file and submodule.

## Repository URLs

- **Main Project**: https://github.com/clientt-ai/clientt_phoenix_crm_01
- **Screenshots Submodule**: https://github.com/clientt-ai/clientt_phoenix_crm_screenshots

## Troubleshooting

### Screenshots not saving
- Verify the submodule directory exists: `ls playwright_screenshots/`
- Check path is correct in test spec
- Ensure directory structure matches expected path

### Submodule not initialized
```bash
git submodule init
git submodule update
```

### Detached HEAD in submodule
```bash
cd playwright_screenshots
git checkout main
```
