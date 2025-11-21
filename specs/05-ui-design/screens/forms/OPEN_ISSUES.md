# Forms UI - Open Issues

> **Last Updated:** 2024-11-21

## Overview

This document tracks known UI issues and potential improvements for the Forms module pages.

---

## Completed Items (2024-11-21)

### Page Header Consistency

**Status:** Resolved

Fixed inconsistent page headers across Forms Dashboard, All Forms, and Form Builder pages:

- Standardized title font sizing (`text-2xl md:text-3xl`)
- Added consistent descriptions
- Unified responsive layout pattern
- Fixed dark mode support with DaisyUI semantic classes

### Dark Mode Support

**Status:** Resolved

Fixed dark mode issues in:

1. **Form Builder** (`/forms/new`):
   - Replaced hardcoded `bg-white`, `text-gray-*`, `border-gray-*` classes
   - Updated to DaisyUI semantic classes

2. **All Forms** (`/forms`):
   - Fixed status badge colors
   - Fixed empty state text colors
   - Fixed search input icon color

### Form Builder Responsiveness

**Status:** Resolved

- Added responsive header layout
- Made sidebars collapsible (Hide Fields / Show Fields, Hide Panel / Show Panel)
- Added responsive 3-column layout that stacks on mobile
- Limited sidebar heights on mobile view

---

## Open Issues

### 1. Form Builder - Mobile Layout Optimization

**Priority:** Medium
**Status:** Open

While basic responsiveness is implemented, the Form Builder could benefit from:

- [ ] Mobile-first sidebar drawer pattern (slide-in from left/right)
- [ ] Bottom sheet pattern for field properties on mobile
- [ ] Touch-friendly drag-and-drop reordering
- [ ] Larger touch targets for mobile

### 2. Form Builder - Empty State on Mobile

**Priority:** Low
**Status:** Open

When both sidebars are collapsed on mobile, the empty form canvas has limited visual guidance:

- [ ] Add floating action button for "Add Field" on mobile
- [ ] Consider inline help text or tooltips

### 3. Table Responsiveness on All Forms Page

**Priority:** Medium
**Status:** Open

The forms table on `/forms` does not adapt well to narrow screens:

- [ ] Consider card-based layout for mobile instead of table
- [ ] Or implement horizontal scroll with sticky first column
- [ ] Add responsive column hiding for less important columns

### 4. KPI Cards - Visual Hierarchy

**Priority:** Low
**Status:** Open

The KPI cards could have better visual hierarchy:

- [ ] Consider different card sizes for primary vs secondary metrics
- [ ] Add trend indicators (up/down arrows)
- [ ] Add sparkline charts for historical data

### 5. Form Builder - AI Assistant Panel

**Priority:** Low
**Status:** Blocked (Feature not implemented)

The AI Assistant panel in Form Builder shows placeholder content:

- [ ] Implement actual AI suggestions
- [ ] Remove "Coming Soon" badge when ready
- [ ] Consider collapsing panel by default until feature is ready

---

## Future Enhancements

### Accessibility

- [ ] Audit keyboard navigation in Form Builder
- [ ] Add ARIA labels to interactive elements
- [ ] Test with screen readers
- [ ] Ensure focus management when panels are toggled

### Performance

- [ ] Lazy load form fields list
- [ ] Virtual scrolling for forms with many fields
- [ ] Optimize re-renders when typing in form canvas

### User Experience

- [ ] Add keyboard shortcuts for common actions
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement undo/redo for form builder changes
- [ ] Add autosave functionality

---

## References

- [Page Header Pattern](/specs/05-ui-design/screens/shared/page-header-pattern.md)
- [Form Builder Spec](/specs/05-ui-design/screens/forms/form-builder.md)
- [Forms List Spec](/specs/05-ui-design/screens/forms/forms-list.md)
- [Dashboard Spec](/specs/05-ui-design/screens/forms/dashboard.md)
