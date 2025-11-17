# Design Tokens - ClienttCRM

**Status**: ✅ Updated with Figma Forms Dashboard Design Tokens
**Last Updated**: 2025-11-17
**Design System**: DaisyUI + Nexus + Tailwind CSS v4
**Figma Source**: `figma_src/205 Forms Dashboard/src/DEVELOPER_HANDOFF.md`

## Purpose

This document defines all design tokens (colors, typography, spacing, etc.) extracted from Figma designs. These tokens ensure consistency across **all domains** of the ClienttCRM application.

**Scope**: Cross-domain (used by Authorization, Contacts, Deals, Forms, and all other domains)

**Note**: Tokens extracted from Forms Dashboard Figma export. Will be expanded as additional domains are designed.

---

## Color Palette

### Brand Colors (Forms Dashboard)

**Source**: `figma_src/205 Forms Dashboard/src/DEVELOPER_HANDOFF.md`

| Token Name | Hex | CSS Variable | Gradient | Usage |
|------------|-----|--------------|----------|-------|
| Primary | `#2278c0` | `--primary` | `linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)` | Primary actions, form elements, calendar features |
| Primary Hover | `#1a5f99` | `--primary-hover` | - | Hover state for primary elements |
| Accent (Fuchsia) | `#ec4899` | `--accent` | `linear-gradient(135deg, #ec4899 0%, #db2777 100%)` | Chatbot features, highlights, special CTAs |
| Accent Hover | `#db2777` | `--accent-hover` | - | Hover state for accent elements |

**Implementation Example:**
```css
/* Primary button with gradient */
.btn-primary-gradient {
  background: linear-gradient(135deg, #2278c0 0%, #1a5f99 100%);
}

/* Chatbot accent gradient */
.chatbot-accent {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}
```

### DaisyUI Generic Colors (Fallback)

| Token Name | Hex | DaisyUI Class | Usage |
|------------|-----|---------------|-------|
| Secondary | `#10B981` | `secondary` | Secondary actions (generic) |
| Neutral | `#1F2937` | `neutral` | Neutral elements |

### Semantic Colors

| Token Name | Hex | DaisyUI Class | Usage |
|------------|-----|---------------|-------|
| Success | `#10B981` | `success` | Success messages, confirmations |
| Error | `#EF4444` | `error` | Errors, destructive actions |
| Warning | `#F59E0B` | `warning` | Warnings, cautions |
| Info | `#3B82F6` | `info` | Information, tips |

### Neutral Colors

| Token Name | Hex | Tailwind Class | Usage |
|------------|-----|----------------|-------|
| Base 100 | `#FFFFFF` | `base-100` | Background |
| Base 200 | `#F3F4F6` | `base-200` | Subtle background |
| Base 300 | `#E5E7EB` | `base-300` | Borders, dividers |
| Base Content | `#1F2937` | `base-content` | Primary text |

### Role-Specific Colors (Authorization)

| Token Name | Hex | Class | Usage |
|------------|-----|-------|-------|
| Admin | `#8B5CF6` | `badge-purple` | Admin role badge |
| Manager | `#3B82F6` | `badge-blue` | Manager role badge |
| User | `#6B7280` | `badge-gray` | User role badge |
| Team Lead | `#F59E0B` | `badge-warning` | Team lead badge |
| Team Member | `#10B981` | `badge-success` | Team member badge |

---

## Typography

### Font Family

| Token Name | Value | Usage |
|------------|-------|-------|
| Sans | `Inter, system-ui, sans-serif` | Body text, UI |
| Mono | `'Fira Code', monospace` | Code, tokens |

### Font Sizes

| Token Name | Size | Tailwind Class | Line Height | Usage |
|------------|------|----------------|-------------|-------|
| xs | 12px | `text-xs` | 16px | Captions, helper text |
| sm | 14px | `text-sm` | 20px | Small text, labels |
| base | 16px | `text-base` | 24px | Body text |
| lg | 18px | `text-lg` | 28px | Card headings (h3) |
| xl | 20px | `text-xl` | 28px | Section headings |
| 2xl | 24px | `text-2xl` | 32px | Large headings |
| 3xl | 30px | `text-3xl` | 36px | Page headings |
| 4xl | 38px | `text-[38px]` | 1.2 | Page titles (Forms Dashboard) |

### Font Weights

| Token Name | Value | Tailwind Class | Usage |
|------------|-------|----------------|-------|
| Normal | 400 | `font-normal` | Body text |
| Medium | 500 | `font-medium` | Emphasis |
| Semibold | 600 | `font-semibold` | Headings |
| Bold | 700 | `font-bold` | Strong emphasis |

---

## Spacing Scale

### Margins & Padding

| Token Name | Value | Tailwind Class | Usage |
|------------|-------|----------------|-------|
| 0 | 0 | `m-0` / `p-0` | No spacing |
| 1 | 4px | `m-1` / `p-1` | Minimal spacing |
| 2 | 8px | `m-2` / `p-2` | Tight spacing |
| 3 | 12px | `m-3` / `p-3` | Compact spacing |
| 4 | 16px | `m-4` / `p-4` | Default spacing |
| 6 | 24px | `m-6` / `p-6` | Comfortable spacing |
| 8 | 32px | `m-8` / `p-8` | Spacious |
| 12 | 48px | `m-12` / `p-12` | Large spacing |
| 16 | 64px | `m-16` / `p-16` | Extra large spacing |

### Gaps (Grid/Flex)

| Token Name | Value | Tailwind Class | Usage |
|------------|-------|----------------|-------|
| 1 | 4px | `gap-1` | Minimal gap |
| 2 | 8px | `gap-2` | Tight gap |
| 4 | 16px | `gap-4` | Default gap |
| 6 | 24px | `gap-6` | Comfortable gap |
| 8 | 32px | `gap-8` | Large gap |

---

## Border Radius

| Token Name | Value | Tailwind Class | DaisyUI | Usage |
|------------|-------|----------------|---------|-------|
| None | 0 | `rounded-none` | - | No rounding |
| Small | 4px | `rounded-sm` | - | Subtle rounding |
| Default | 8px | `rounded` | `rounded-box` | Cards, containers |
| Medium | 12px | `rounded-md` | - | Buttons |
| Large | 16px | `rounded-lg` | `rounded-btn` | Large buttons |
| Full | 9999px | `rounded-full` | `rounded-badge` | Pills, avatars |

---

## Shadows

| Token Name | Value | Tailwind Class | Usage |
|------------|-------|----------------|-------|
| None | none | `shadow-none` | Flat elements |
| Small | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Subtle elevation |
| Default | `0 1px 3px rgba(0,0,0,0.1)` | `shadow` | Cards |
| Medium | `0 4px 6px rgba(0,0,0,0.1)` | `shadow-md` | Elevated cards |
| Large | `0 10px 15px rgba(0,0,0,0.1)` | `shadow-lg` | Modals, dropdowns |
| XL | `0 20px 25px rgba(0,0,0,0.1)` | `shadow-xl` | Overlays |

---

## Transitions

| Property | Duration | Easing | Tailwind Class |
|----------|----------|--------|----------------|
| All | 150ms | ease-in-out | `transition` |
| Colors | 150ms | ease-in-out | `transition-colors` |
| Transform | 150ms | ease-in-out | `transition-transform` |
| Opacity | 150ms | ease-in-out | `transition-opacity` |

---

## Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Usage |
|------------|-----------|-----------------|-------|
| Mobile | 0px | (none) | Default |
| Tablet | 640px | `sm:` | Small screens |
| Desktop | 1024px | `lg:` | Large screens |
| Wide | 1280px | `xl:` | Extra large screens |

---

## Component-Specific Tokens

### Buttons

| Variant | Classes | Usage |
|---------|---------|-------|
| Primary | `btn btn-primary` | Main actions |
| Secondary | `btn btn-secondary` | Secondary actions |
| Ghost | `btn btn-ghost` | Subtle actions |
| Outline | `btn btn-outline` | Outlined buttons |
| Link | `btn btn-link` | Link-style buttons |
| Danger | `btn btn-error` | Destructive actions |
| Success | `btn btn-success` | Confirmations |

**Sizes**:
- `btn-xs`: Extra small
- `btn-sm`: Small
- `btn-md`: Default (no class needed)
- `btn-lg`: Large

### Forms

| Element | Classes | Usage |
|---------|---------|-------|
| Input | `input input-bordered` | Text inputs |
| Select | `select select-bordered` | Dropdowns |
| Textarea | `textarea textarea-bordered` | Multi-line input |
| Checkbox | `checkbox` | Checkboxes |
| Radio | `radio` | Radio buttons |
| Toggle | `toggle` | Toggle switches |
| Range | `range` | Sliders |

**States**:
- `input-error`: Error state
- `input-success`: Success state
- `input-disabled`: Disabled state

### Tables

| Variant | Classes | Usage |
|---------|---------|-------|
| Default | `table` | Basic table |
| Zebra | `table-zebra` | Alternating rows |
| Compact | `table-compact` | Dense table |
| Pinned | `table-pin-rows` | Fixed header |

### Cards

| Variant | Classes | Usage |
|---------|---------|-------|
| Default | `card` | Basic card |
| Bordered | `card bordered` | Card with border |
| Compact | `card-compact` | Smaller padding |
| Normal | `card-normal` | Default padding |
| Side | `card-side` | Horizontal layout |

### Badges

| Variant | Classes | Usage |
|---------|---------|-------|
| Default | `badge` | Basic badge |
| Primary | `badge badge-primary` | Primary badge |
| Secondary | `badge badge-secondary` | Secondary badge |
| Accent | `badge badge-accent` | Accent badge |
| Ghost | `badge badge-ghost` | Subtle badge |
| Outline | `badge badge-outline` | Outlined badge |

**Sizes**:
- `badge-xs`: Extra small
- `badge-sm`: Small
- `badge-md`: Default
- `badge-lg`: Large

---

## Status Indicators

### Authorization-Specific

| Status | Color | Badge Class | Icon | Usage |
|--------|-------|-------------|------|-------|
| Active | Green | `badge badge-success` | ✓ | Active user/team |
| Inactive | Gray | `badge badge-ghost` | — | Inactive user |
| Pending | Yellow | `badge badge-warning` | ⏳ | Pending invitation |
| Expired | Red | `badge badge-error` | ✗ | Expired invitation |
| Archived | Gray | `badge badge-outline` | 📦 | Archived company/team |

---

## Icons

**Library**: Heroicons (recommended for Phoenix LiveView)
**Alternative**: Font Awesome, Lucide

### Common Icons

| Usage | Heroicon | Class |
|-------|----------|-------|
| Add/Create | `plus` | `hero-plus` |
| Edit | `pencil` | `hero-pencil` |
| Delete | `trash` | `hero-trash` |
| Settings | `cog-6-tooth` | `hero-cog-6-tooth` |
| User | `user` | `hero-user` |
| Users | `users` | `hero-users` |
| Team | `user-group` | `hero-user-group` |
| Company | `building-office` | `hero-building-office` |
| Invite | `envelope` | `hero-envelope` |
| Check | `check` | `hero-check` |
| X | `x-mark` | `hero-x-mark` |
| Arrow Right | `arrow-right` | `hero-arrow-right` |
| Chevron Down | `chevron-down` | `hero-chevron-down` |

---

## Loading States

| State | Component | Usage |
|-------|-----------|-------|
| Spinner | `loading loading-spinner` | Page/section loading |
| Dots | `loading loading-dots` | Inline loading |
| Ring | `loading loading-ring` | Button loading |
| Ball | `loading loading-ball` | Alternative loader |

**Sizes**:
- `loading-xs`: Extra small
- `loading-sm`: Small
- `loading-md`: Default
- `loading-lg`: Large

---

## Empty States

| Context | Illustration | Message | Action |
|---------|--------------|---------|--------|
| No companies | Building icon | "No companies yet" | "Create Company" |
| No members | Users icon | "No members yet" | "Invite Members" |
| No teams | User group icon | "No teams yet" | "Create Team" |
| No invitations | Envelope icon | "No pending invitations" | - |
| No audit logs | Document icon | "No activity yet" | - |

---

## Responsive Design

### Mobile (< 640px)
- Single column layouts
- Full-width buttons
- Stacked forms
- Hidden secondary actions (show in menu)

### Tablet (640px - 1024px)
- Two-column layouts where appropriate
- Visible primary actions
- Side-by-side forms

### Desktop (> 1024px)
- Multi-column layouts
- All actions visible
- Wide tables with all columns
- Side navigation

---

## Accessibility

### Focus States
- Visible focus ring: `ring-2 ring-offset-2 ring-primary`
- Focus within: `focus-within:ring-2`

### Color Contrast
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text (18px+)
- Minimum 3:1 for UI components

### Screen Reader Text
```elixir
<span class="sr-only">Screen reader only text</span>
```

---

## DaisyUI Theme Configuration

```javascript
// tailwind.config.js
module.exports = {
  daisyui: {
    themes: [
      {
        clienttcrm: {
          "primary": "#2278c0",        // Forms Dashboard primary blue
          "secondary": "#10B981",
          "accent": "#ec4899",          // Forms Dashboard fuchsia (chatbot features)
          "neutral": "#1F2937",
          "base-100": "#FFFFFF",
          "base-200": "#F3F4F6",
          "base-300": "#E5E7EB",
          "base-content": "#1F2937",
          "info": "#3B82F6",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
        },
      },
    ],
  },
}
```

---

**Note**: These tokens will be finalized once Figma designs are complete. Update this document as designs evolve.
