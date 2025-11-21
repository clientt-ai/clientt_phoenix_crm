# Embeddable Forms - Test Status Tracker

## Overview

This document tracks the testing status for the Embeddable Forms feature, which allows customers to embed Clientt forms on external websites.

## Test Execution Summary

| Metric | Value |
|--------|-------|
| Total Test Scenarios | 6 |
| Automated Tests | 6 |
| Manual Tests | 1 |
| Last Test Run | 2025-11-21 |
| Pass Rate | 100% (6/6 passing) |

## Test Scenarios

### EMB-SC-001: Load Form on External Page

**Status**: ✅ Passing

| Test Case | Automation | Status | Last Run |
|-----------|------------|--------|----------|
| Load embed script successfully | ✅ Playwright | Pass | 2025-11-21 |
| Show error for missing form-id | ✅ Playwright | Pass | 2025-11-21 |
| Show error for invalid form ID | ✅ Playwright | Pass | 2025-11-21 |
| Display loading spinner | ✅ Playwright | Pass | 2025-11-21 |
| Inject styles into head | ✅ Playwright | Pass | 2025-11-21 |
| Apply custom CSS variables | ✅ Playwright | Pass | 2025-11-21 |
| Load and render published form | ⏸️ Skipped | N/A | Requires TEST_FORM_ID |

**Playwright Test File**: `playwright_tests/tests/modules/embeddable_forms/EMB-SC-001_load_form/test.spec.js`

### EMB-SC-002: Submit Form Successfully

**Status**: 📋 Planned

| Test Case | Automation | Status |
|-----------|------------|--------|
| Submit valid form data | Planned | Pending |
| Handle server validation errors | Planned | Pending |
| Show success message | Planned | Pending |
| Execute callback function | Planned | Pending |
| Handle redirect after submission | Planned | Pending |

### EMB-SC-003: Multi-Step Form Navigation

**Status**: 📋 Planned

| Test Case | Automation | Status |
|-----------|------------|--------|
| Render step indicators | Planned | Pending |
| Navigate to next step | Planned | Pending |
| Navigate to previous step | Planned | Pending |
| Validate current step before next | Planned | Pending |
| Submit on final step | Planned | Pending |

### EMB-SC-004: Custom CSS Variables

**Status**: ✅ Passing (included in EMB-SC-001)

| Test Case | Automation | Status |
|-----------|------------|--------|
| Apply host page CSS variables | ✅ Playwright | Pass |

### EMB-SC-005: Error Handling

**Status**: ✅ Passing (included in EMB-SC-001)

| Test Case | Automation | Status |
|-----------|------------|--------|
| Missing form-id attribute | ✅ Playwright | Pass |
| Invalid/non-existent form ID | ✅ Playwright | Pass |
| Network error handling | Planned | Pending |

### EMB-SC-006: CORS Validation

**Status**: 📋 Planned

| Test Case | Automation | Status |
|-----------|------------|--------|
| Allow requests from allowed domains | Planned | Pending |
| Block requests from unauthorized origins | Planned | Pending |
| Handle preflight OPTIONS requests | Planned | Pending |

## Test Environment

### Prerequisites

- Phoenix server running on `http://localhost:4002`
- Published form in database (for integration tests)
- Playwright installed: `npx playwright install`

### Running Tests

```bash
# Navigate to playwright_tests directory
cd playwright_tests

# Run all embeddable form tests
npx playwright test tests/modules/embeddable_forms/

# Run with specific browser
npx playwright test tests/modules/embeddable_forms/ --project=chromium

# Run with headed mode for debugging
npx playwright test tests/modules/embeddable_forms/ --headed

# Run integration test with real form
TEST_FORM_ID=<uuid> npx playwright test tests/modules/embeddable_forms/
```

## Screenshots

Screenshots are saved to:
```
playwright_screenshots/playwright_tests/tests/modules/embeddable_forms/EMB-SC-001_load_form/
```

| Screenshot | Description |
|------------|-------------|
| 01-test-page-loaded.png | Test HTML page loaded |
| 02-script-loaded-successfully.png | Embed script loaded |
| 03-error-missing-form-id.png | Error for missing form-id |
| 04-error-invalid-form-id.png | Error for invalid UUID |
| 05-loading-spinner-visible.png | Loading spinner state |
| 06-styles-injected.png | Styles injected into head |
| 07-custom-css-variables-applied.png | Custom CSS variables |

## Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| File uploads not supported | By Design | Security consideration |
| Datetime picker not implemented | Planned | Use date field for now |
| Payment fields not supported | Planned | Future Stripe integration |

## Change History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-21 | 1.0.0 | Initial test plan and automation |

---

Last Updated: 2025-11-21
