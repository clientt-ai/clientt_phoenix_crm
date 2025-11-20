---
description: Managing Playwright test screenshots in the centralized submodule
---

# Playwright Screenshots

This skill covers managing Playwright test screenshots stored in the centralized `playwright_screenshots` submodule.

## Directory Structure

```
playwright_screenshots/
├── playwright_tests/           # Phoenix CRM test suite screenshots
│   ├── navigation/            # General navigation screenshots
│   ├── authentication/        # Auth flow screenshots
│   └── forms/                 # Form-specific test screenshots
│       ├── FM-SC-001_create_form/
│       ├── FM-SC-002_configure_fields/
│       ├── FM-SC-003_submit_valid/
│       ├── FM-SC-004_validation_invalid/
│       ├── FM-SC-005_list_forms/
│       ├── FM-SC-006_edit_form/
│       ├── FM-SC-007_delete_form/
│       └── FM-SC-008_field_types/
└── figma_playwright/          # Figma design test screenshots
    └── 205-forms-dashboard/
        ├── main/              # Dashboard page screenshots
        └── form-builder/      # Form builder component screenshots
```

## Naming Conventions

- **Numbered prefixes**: Use `01-`, `02-`, etc. for ordering
- **Descriptive names**: Use kebab-case: `01-sign-in-page.png`
- **Theme variants**: Append `-dark` or `-light`: `01-dashboard-dark.png`

## Path Configuration

### For playwright_tests form specs

```javascript
const path = require('path');

test.describe('FM-SC-XXX: Test Name', () => {
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

  // Use in tests:
  await screenshot(page, '01-step-description');
});
```

### For figma_playwright specs

```javascript
const path = require('path');

// For main dashboard screenshots
const screenshotsDir = path.join(
  __dirname,
  '../../playwright_screenshots/figma_playwright/205-forms-dashboard/main'
);

// For form builder screenshots
const screenshotsDir = path.join(
  __dirname,
  '../../playwright_screenshots/figma_playwright/205-forms-dashboard/form-builder'
);

async function screenshot(page, name) {
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}.png`),
    fullPage: false
  });
}
```

### For dark/light mode variants

```javascript
async function screenshot(page, name) {
  // Light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}-light.png`),
    fullPage: false
  });

  // Dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotsDir, `${name}-dark.png`),
    fullPage: false
  });
}
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

When adding new test scenarios:

1. Create directory in submodule:
```bash
mkdir -p playwright_screenshots/playwright_tests/forms/FM-SC-XXX_new_test
```

2. Update test spec with correct path:
```javascript
const screenshotsDir = path.join(
  __dirname,
  '../../playwright_screenshots/playwright_tests/forms',
  path.basename(__dirname)
);
```

3. Commit changes in both submodule and main repo.

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
