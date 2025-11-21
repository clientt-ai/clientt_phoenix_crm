# Embeddable Forms Module - Testing Artifacts

## Overview

This directory contains comprehensive testing artifacts for the Embeddable Forms Module, which allows customers to embed Clientt forms on external websites (e.g., Wix, WordPress, custom sites).

**Key Features Tested:**
- Widget script loading and initialization
- Custom HTML element (`<clientt-form>`) functionality
- Form rendering with CSS variable theming
- Form submission via public API
- Multi-step form navigation
- Error handling and validation
- CORS and security

## Directory Structure

```
specs/06-test_plans/embeddable_forms/
├── README.md                           # This file
├── Embeddable_Forms_Test_Status.md     # Master test tracker and status
└── manual_tests/                       # Manual test scenarios
    └── EMB-SC-001_load_form.md         # Form loading tests
```

## Architecture

The embeddable forms feature consists of:

1. **Embed Script** (`/embed/clientt-forms.js`)
   - Custom HTML element definition
   - CSS injection with customizable variables
   - Form fetching and rendering
   - Validation and submission handling

2. **Public API**
   - `GET /api/public/forms/:id` - Fetch form metadata
   - `POST /api/public/forms/:id/submissions` - Submit form data

3. **CORS Middleware**
   - Validates origin against allowed domains
   - Handles preflight OPTIONS requests

## Usage Example

```html
<!-- On external website -->
<script src="https://app.clientt.com/embed/clientt-forms.js"></script>
<clientt-form form-id="your-form-uuid"></clientt-form>

<!-- With custom styling -->
<style>
  :root {
    --clientt-primary-color: #FF5722;
    --clientt-font-family: 'Helvetica', sans-serif;
  }
</style>
```

## Test Scenarios

| ID | Scenario | Manual Test | Automation | Status |
|----|----------|-------------|------------|--------|
| EMB-SC-001 | Load Form on External Page | ✓ | ✓ | Active |
| EMB-SC-002 | Submit Form Successfully | Planned | Planned | Pending |
| EMB-SC-003 | Multi-Step Form Navigation | Planned | Planned | Pending |
| EMB-SC-004 | Custom CSS Variables | ✓ | ✓ | Active |
| EMB-SC-005 | Error Handling | ✓ | ✓ | Active |
| EMB-SC-006 | CORS Validation | Planned | Planned | Pending |

## Getting Started

### For QA Testers (Manual Testing)

1. **Setup Test Environment**
   - Ensure a published form exists in the database
   - Have access to an external HTML page (or use `test-page.html`)

2. **Execute Tests**
   - Open the manual test from `manual_tests/`
   - Follow step-by-step instructions
   - Verify expected results

### For Developers (Automated Testing)

```bash
# Run all embeddable form tests
npx playwright test tests/modules/embeddable_forms/

# Run specific test
npx playwright test tests/modules/embeddable_forms/EMB-SC-001_load_form/

# Run with UI
npx playwright test tests/modules/embeddable_forms/ --headed

# View test report
npx playwright test --reporter=html
npx playwright show-report
```

## CSS Variables Reference

The embed widget supports these CSS variables for customization:

| Variable | Default | Description |
|----------|---------|-------------|
| `--clientt-primary-color` | `#3B82F6` | Primary button/focus color |
| `--clientt-text-color` | `inherit` | Text color |
| `--clientt-background-color` | `transparent` | Form background |
| `--clientt-border-color` | `#D1D5DB` | Input border color |
| `--clientt-error-color` | `#EF4444` | Error message color |
| `--clientt-success-color` | `#10B981` | Success message color |
| `--clientt-font-family` | `inherit` | Font family |
| `--clientt-font-size` | `16px` | Base font size |
| `--clientt-spacing` | `1rem` | Field spacing |
| `--clientt-input-padding` | `0.5rem 0.75rem` | Input padding |
| `--clientt-input-border-radius` | `0.375rem` | Input border radius |
| `--clientt-heading-size` | `1.25em` | Heading element size |
| `--clientt-spacer-height` | `1.5rem` | Spacer element height |

## Supported Field Types

| Field Type | Supported | Notes |
|------------|-----------|-------|
| text | ✓ | Single-line text input |
| email | ✓ | Email validation |
| phone/tel | ✓ | Phone number input |
| url | ✓ | URL validation |
| number | ✓ | Numeric input with min/max |
| date | ✓ | Date picker |
| textarea | ✓ | Multi-line text |
| select | ✓ | Dropdown selection |
| checkbox | ✓ | Single or multiple |
| radio | ✓ | Radio button group |
| heading | ✓ | Section heading |
| separator | ✓ | Horizontal rule |
| spacer | ✓ | Vertical spacing |
| file | ✗ | Not supported |
| datetime | ✗ | Not supported (use date) |
| payment | ✗ | Not supported |

## Quick Links

- **Test Status Tracker**: [Embeddable_Forms_Test_Status.md](./Embeddable_Forms_Test_Status.md)
- **Manual Tests**: [manual_tests/](./manual_tests/)
- **Playwright Tests**: [playwright_tests/tests/modules/embeddable_forms/](../../../playwright_tests/tests/modules/embeddable_forms/)
- **Screenshots**: [playwright_screenshots/playwright_tests/tests/modules/embeddable_forms/](../../../playwright_screenshots/playwright_tests/tests/modules/embeddable_forms/)

## Related Documentation

- **Form Resource Spec**: [specs/01-domains/forms/resources/form.md](../../01-domains/forms/resources/form.md)
- **Form Builder UI**: [specs/05-ui-design/screens/forms/form-builder.md](../../05-ui-design/screens/forms/form-builder.md)

---

Last Updated: 2025-11-21
Version: 1.0.0
