# Page Header Pattern

> **Last Updated:** 2024-11-21
> **Status:** Implemented

## Overview

This document defines the standard page header pattern used across the Forms module pages to ensure consistency in layout, typography, responsiveness, and dark mode support.

## Standard Header Pattern

### Structure

All page headers follow this consistent structure:

```html
<!-- Page Header -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
  <div>
    <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
      Page Title
    </h1>
    <p class="mt-1 text-sm text-base-content/60">
      Description text
    </p>
  </div>
  <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
    <!-- Action buttons -->
  </div>
</div>
```

### Typography

| Element | Classes |
|---------|---------|
| Page Title | `text-2xl md:text-3xl font-bold tracking-tight text-base-content` |
| Description | `mt-1 text-sm text-base-content/60` |

### Layout

- **Container**: `flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8`
- **Title Group**: Wrapped in a `<div>` on the left
- **Actions Group**: `mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3`

### Responsive Behavior

- **Mobile (< 640px)**: Title and actions stack vertically, actions stretch full width
- **Tablet/Desktop (>= 640px)**: Title and actions side by side

## Pages Using This Pattern

### Form Dashboard (`/forms_dashboard`)

- **Title**: "Form Dashboard"
- **Description**: "Track your forms, submissions, and leads"
- **Actions**: "View All Forms" (ghost button), "Create New Form" (primary button)
- **File**: `lib/clientt_crm_app_web/live/dashboard_live.ex`

### All Forms (`/forms`)

- **Title**: "All Forms"
- **Description**: "Manage and track your forms"
- **Actions**: Search input, "Create New Form" (primary button)
- **File**: `lib/clientt_crm_app_web/live/form_live/index.ex`

### Form Builder (`/forms/new`, `/forms/:id/edit`)

- **Title**: "Form Builder"
- **Description**: "Create and customize your form"
- **Actions**: Panel toggles, Preview link, "Save Form" (primary button)
- **Note**: Uses toolbar pattern with additional post-submission actions bar
- **File**: `lib/clientt_crm_app_web/live/form_live/builder.ex`

## Dark Mode Support

All headers use DaisyUI semantic color classes for dark mode compatibility:

- `text-base-content` - Primary text color
- `text-base-content/60` - Secondary/muted text color
- `text-base-content/40` - Tertiary/placeholder text color
- `bg-base-100` - Primary background
- `bg-base-200` - Secondary background
- `border-base-300` - Border color

**Avoid:** Hardcoded colors like `text-gray-900`, `bg-white`, `border-gray-200`

## Card Styling

Consistent card styling across all pages:

```html
<div class="bg-base-100 rounded-lg shadow-md border border-base-300 p-6 transition-shadow hover:shadow-lg">
  <!-- Card content -->
</div>
```

## Status Badge Classes

```elixir
defp status_badge_class(:draft), do: "bg-base-200 text-base-content"
defp status_badge_class(:published), do: "bg-success/20 text-success"
defp status_badge_class(:archived), do: "bg-warning/20 text-warning"
```

## Implementation Checklist

- [x] Form Dashboard header updated
- [x] All Forms header updated
- [x] Form Builder header updated
- [x] Dark mode support verified
- [x] Responsive behavior verified
- [x] Card styling made consistent
