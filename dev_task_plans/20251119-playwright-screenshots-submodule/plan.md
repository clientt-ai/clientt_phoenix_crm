# Playwright Screenshots Submodule - Implementation Plan

## Objective
Centralize all Playwright screenshots from `playwright_tests/` and `figma_playwright/` into a dedicated Git submodule for better organization, separate version control, and reduced main repository bloat.

## Current State Analysis

### Existing Screenshot Locations
1. **playwright_tests/**
   - `screenshots/` (8 files) - General navigation screenshots
   - `forms/FM-SC-*/screenshots/` - Form-specific test screenshots (multiple directories)

2. **figma_playwright/205 Forms Dashboard/**
   - `screenshots/main/` - Main dashboard screenshots
   - `screenshots/form-builder/` - Form builder screenshots

### Existing Configs
- `playwright_tests/playwright.config.js` - Phoenix CRM test suite
- `figma_playwright/205 Forms Dashboard/playwright.config.js` - Figma test suite

---

## Implementation Steps

### Phase 1: Repository Setup

#### Step 1.1: Create GitHub Repository
```bash
# Create new repository: clientt-ai/clientt_phoenix_crm_screenshots
# Initialize with README
gh repo create clientt-ai/clientt_phoenix_crm_screenshots --public --clone
```

#### Step 1.2: Set Up Initial Structure
```bash
cd clientt_phoenix_crm_screenshots
mkdir -p playwright_tests/{navigation,forms,authentication}
mkdir -p figma_playwright/205-forms-dashboard/{main,form-builder}
touch .gitkeep
git add . && git commit -m "Initial submodule structure"
git push origin main
```

#### Step 1.3: Add Submodule to Main Project
```bash
cd /path/to/clientt_phoenix_crm_01
git submodule add git@github.com:clientt-ai/clientt_phoenix_crm_screenshots.git playwright_screenshots
git commit -m "Add playwright_screenshots submodule"
```

---

### Phase 2: Configuration Updates

#### Step 2.1: Update playwright_tests/playwright.config.js

Add screenshot output directory configuration:

```javascript
// Add to defineConfig
use: {
  // ... existing settings

  // Custom screenshot output directory
  screenshotPath: '../playwright_screenshots/playwright_tests',
},
```

For test specs that manually save screenshots, update paths from:
```javascript
await page.screenshot({ path: 'screenshots/01-page.png' });
```
To:
```javascript
await page.screenshot({ path: '../playwright_screenshots/playwright_tests/navigation/01-page.png' });
```

#### Step 2.2: Update figma_playwright Configuration

Update `figma_playwright/205 Forms Dashboard/playwright.config.js`:

```javascript
use: {
  // ... existing settings

  // Custom screenshot output directory
  screenshotPath: '../../playwright_screenshots/figma_playwright/205-forms-dashboard',
},
```

Update test specs to use new paths:
```javascript
// From
await page.screenshot({ path: 'screenshots/main/01-dashboard.png' });
// To
await page.screenshot({ path: '../../playwright_screenshots/figma_playwright/205-forms-dashboard/main/01-dashboard.png' });
```

---

### Phase 3: Screenshot Migration

#### Step 3.1: Migrate playwright_tests Screenshots

```bash
# Navigate to project root
cd /path/to/clientt_phoenix_crm_01

# Move general screenshots
mv playwright_tests/screenshots/*.png playwright_screenshots/playwright_tests/navigation/

# Move form-specific screenshots
for dir in playwright_tests/forms/FM-SC-*/screenshots; do
  form_name=$(basename $(dirname "$dir"))
  mkdir -p "playwright_screenshots/playwright_tests/forms/$form_name"
  mv "$dir"/*.png "playwright_screenshots/playwright_tests/forms/$form_name/"
done

# Remove old directories
rm -rf playwright_tests/screenshots
rm -rf playwright_tests/forms/*/screenshots
```

#### Step 3.2: Migrate figma_playwright Screenshots

```bash
# Move figma screenshots
mv "figma_playwright/205 Forms Dashboard/screenshots"/* \
   playwright_screenshots/figma_playwright/205-forms-dashboard/

# Remove old directory
rm -rf "figma_playwright/205 Forms Dashboard/screenshots"
```

#### Step 3.3: Commit Changes in Submodule

```bash
cd playwright_screenshots
git add .
git commit -m "Migrate existing screenshots from main project"
git push origin main

# Update submodule reference in main project
cd ..
git add playwright_screenshots
git commit -m "Update submodule with migrated screenshots"
```

---

### Phase 4: Test Spec Updates

#### Step 4.1: Update playwright_tests Specs

Files requiring path updates:
- `tests/features/authentication.spec.js`
- `tests/features/navigation.spec.js`
- `forms/FM-SC-*/` test files

Use search and replace:
```javascript
// Find: path: 'screenshots/
// Replace: path: '../playwright_screenshots/playwright_tests/navigation/

// Find: path: './screenshots/
// Replace: path: '../playwright_screenshots/playwright_tests/forms/<test-name>/
```

#### Step 4.2: Update figma_playwright Specs

Files requiring updates:
- `FG-SC-001_capture_screenshots.spec.js`
- `FG-SC-002_form_builder_screenshots.spec.js`

Update all screenshot paths to use new submodule location.

---

### Phase 5: Documentation & Skills

#### Step 5.1: Create Skill Documentation

Create `.claude/skills/playwright-screenshots.md`:

```markdown
# Playwright Screenshots Skill

## Overview
Manage Playwright test screenshots stored in the centralized submodule.

## Directory Structure
playwright_screenshots/
├── playwright_tests/
│   ├── navigation/        # General navigation screenshots
│   ├── authentication/    # Auth flow screenshots
│   └── forms/
│       ├── FM-SC-001_create_form/
│       ├── FM-SC-002_configure_fields/
│       └── ...
└── figma_playwright/
    └── 205-forms-dashboard/
        ├── main/          # Dashboard page screenshots
        └── form-builder/  # Builder component screenshots

## Naming Conventions
- Use numbered prefixes: `01-`, `02-`, etc.
- Descriptive kebab-case names: `01-sign-in-page.png`
- Dark/light variants: `01-dashboard-dark.png`, `01-dashboard-light.png`

## Path Configuration

### For playwright_tests specs:
```javascript
await page.screenshot({
  path: '../playwright_screenshots/playwright_tests/navigation/01-page-name.png'
});
```

### For forms test specs:
```javascript
await page.screenshot({
  path: `../playwright_screenshots/playwright_tests/forms/${testName}/01-step.png`
});
```

### For figma_playwright specs:
```javascript
await page.screenshot({
  path: '../../playwright_screenshots/figma_playwright/205-forms-dashboard/main/01-page.png'
});
```

## Submodule Commands

```bash
# Update submodule to latest
git submodule update --remote playwright_screenshots

# Push screenshot changes
cd playwright_screenshots && git add . && git commit -m "Update screenshots" && git push

# Clone project with submodule
git clone --recurse-submodules <repo-url>
```
```

---

### Phase 6: Verification

#### Step 6.1: Verify Submodule Setup
```bash
# Check submodule status
git submodule status

# Verify directory structure
tree playwright_screenshots -L 3
```

#### Step 6.2: Run Tests
```bash
# Run playwright_tests suite
cd playwright_tests && npx playwright test --project=chromium

# Run figma_playwright suite
cd "figma_playwright/205 Forms Dashboard" && npx playwright test
```

#### Step 6.3: Verify Screenshot Output
- Confirm screenshots are written to submodule directories
- Verify no screenshots in old locations
- Check git status in both main repo and submodule

---

## File Changes Summary

### New Files
- `/playwright_screenshots/` (submodule)
- `.claude/skills/playwright-screenshots.md`
- `dev_task_plans/20251119-playwright-screenshots-submodule/plan.md`

### Modified Files
- `playwright_tests/playwright.config.js`
- `figma_playwright/205 Forms Dashboard/playwright.config.js`
- All `.spec.js` files with screenshot paths

### Deleted Directories
- `playwright_tests/screenshots/`
- `playwright_tests/forms/*/screenshots/`
- `figma_playwright/205 Forms Dashboard/screenshots/`

---

## Rollback Plan

If issues arise:
1. Remove submodule: `git rm playwright_screenshots`
2. Restore screenshots from submodule repo to original locations
3. Revert config changes

---

## Notes

- The submodule allows independent versioning of screenshots
- Large binary files won't bloat the main repository history
- Screenshots can be updated separately from code changes
- Consider Git LFS for the submodule if screenshot count grows significantly
