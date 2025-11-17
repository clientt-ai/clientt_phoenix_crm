# UI Components Catalog

**Status**: ✅ Active
**Last Updated**: 2025-11-17
**Purpose**: Component-level specifications for Phoenix LiveView implementation

---

## Overview

This directory contains detailed specifications for UI components used across the ClienttCRM application. Each component spec provides:

- **Visual Design**: Layout, styling, states
- **Props/Assigns**: LiveView assigns and parameters
- **Behavior**: Interactions and events
- **Accessibility**: ARIA labels, keyboard navigation
- **Implementation**: Phoenix LiveView code examples
- **Figma Reference**: Links to source components

---

## Component Categories

### 📊 Dashboard Components (`dashboard/`)

Components for displaying metrics, charts, and data visualizations.

| Component | File | Used In | Status |
|-----------|------|---------|--------|
| KPI Card | `kpi-card.md` | Dashboard, Forms List | ✅ Specified |
| Performance Chart | `performance-chart.md` | Dashboard, Analytics | ✅ Specified |
| Recent Forms Table | `recent-forms-table.md` | Dashboard | ✅ Specified |

---

### 🎨 Layout Components (`layouts/`)

Structural components for page layout and navigation.

| Component | File | Used In | Status |
|-----------|------|---------|--------|
| Header | `header.md` | All pages | ✅ Specified |
| Sidebar | `sidebar.md` | All pages | ✅ Specified |
| Global Search | `global-search.md` | Header | ⏳ Pending |
| Profile Dropdown | `profile-dropdown.md` | Header | ⏳ Pending |
| Notifications Dropdown | `notifications-dropdown.md` | Header | ⏳ Pending |
| Theme Toggle | `theme-toggle.md` | Header | ⏳ Pending |

---

### 📝 Forms-Specific Components (`forms-specific/`)

Components unique to the Forms module, especially the form builder.

| Component | File | Used In | Status |
|-----------|------|---------|--------|
| Form Grid Canvas | `form-grid-canvas.md` | Form Builder | ✅ Specified |
| Form Fields Sidebar | `form-fields-sidebar.md` | Form Builder | ✅ Specified |
| Draggable Field | `draggable-field.md` | Form Builder | ⏳ Pending |
| Form Drop Zone | `form-drop-zone.md` | Form Builder | ⏳ Pending |

---

## Component Design Principles

### 1. Reusability
Components should be:
- Generic enough to use across domains
- Configurable via assigns/props
- Independent of specific business logic

### 2. Accessibility First
Every component must include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### 3. Responsive Design
All components should:
- Work on mobile, tablet, and desktop
- Use Tailwind responsive classes
- Gracefully degrade on smaller screens

### 4. LiveView Patterns
Follow Phoenix LiveView best practices:
- Use function components (`def` or `.component`)
- Leverage slots for flexibility
- Minimize JavaScript (use Hooks only when necessary)
- Proper event handling with `phx-*` attributes

---

## Component Spec Template

Each component spec should include:

```markdown
# Component Name

**Category**: Dashboard/Layout/Forms-Specific
**Status**: ✅ Specified / ⏳ Pending / 🚧 In Progress
**Figma Reference**: Path to Figma source file

## Overview
Brief description and purpose

## Visual Design
- Layout structure
- Spacing and sizing
- Color and typography
- States (default, hover, active, disabled)

## Props/Assigns
\```elixir
@assigns = %{
  # List all assigns
}
\```

## Variants
Different visual variants (if applicable)

## Behavior
- User interactions
- Events emitted
- State changes

## LiveView Implementation
\```elixir
# Code example
\```

## Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support

## Responsive Design
How component adapts to different screen sizes

## Usage Examples
Real-world usage scenarios

## Related Components
Links to related specs
```

---

## Naming Conventions

### File Names
- Lowercase with hyphens: `kpi-card.md`
- Match component name: `KPICard` → `kpi-card.md`

### Component Names (Phoenix)
- Function components: `def kpi_card(assigns)`
- Slots: Use descriptive names (`:leading_icon`, `:actions`)

### CSS Classes
- Use Tailwind utility classes
- DaisyUI component classes where applicable
- Custom classes only when necessary

---

## Figma to LiveView Conversion Notes

### React → Phoenix LiveView Mappings

| React Pattern | Phoenix LiveView Equivalent |
|---------------|------------------------------|
| `useState()` | LiveView assigns (`@state`) |
| `useEffect()` | LiveView lifecycle (`mount`, `handle_info`) |
| `props` | Function component assigns |
| `onClick` | `phx-click` |
| `onChange` | `phx-change` |
| `className` | `class` attribute |
| Component slots | `<:slot>` syntax |

### JavaScript Interop
For features requiring client-side JavaScript:
- Use Phoenix Hooks (`phx-hook`)
- Keep hooks minimal and focused
- Examples: Drag-drop, charts, animations

**Reference**: `figma_src/205 Forms Dashboard/src/components/`

---

## Component Dependencies

### Third-Party Libraries

Components may require:
- **Chart.js**: For performance charts and analytics
- **SortableJS**: For drag-and-drop (form builder)
- **Hero Icons**: Icon library (via `heroicons_elixir`)

### DaisyUI Components
We build on top of DaisyUI primitives:
- `btn`, `card`, `badge`, `table`
- `modal`, `dropdown`, `tabs`
- `input`, `select`, `checkbox`

---

## Testing Guidelines

### Component Tests
Each component should have:
- **Render tests**: Verify component renders correctly
- **Interaction tests**: Test event handling
- **Accessibility tests**: Validate ARIA attributes

Example:
```elixir
test "renders KPI card with value and trend" do
  assigns = %{value: 156, trend: 12.5, label: "Total Forms"}
  html = render_component(&kpi_card/1, assigns)

  assert html =~ "156"
  assert html =~ "12.5%"
  assert html =~ "Total Forms"
end
```

---

## Storybook-Style Catalog (Future)

**Goal**: Create a visual component catalog similar to Storybook.

**Approach**:
- Create a `/styleguide` route in the app
- Showcase all components with variants
- Interactive playground for props
- Copy-paste code examples

**Status**: 🎯 Future Enhancement

---

## Quick Links

### Screen Specs
- [Dashboard Screen](../screens/forms/dashboard.md)
- [Forms List Screen](../screens/forms/forms-list.md)
- [Form Builder Screen](../screens/forms/form-builder.md)

### Design System
- [Design Tokens](../design-tokens.md)
- [UI Patterns](../patterns/)

### Figma Source
- [Forms Dashboard Components](../../../figma_src/205 Forms Dashboard/src/components/)

---

## Component Status Summary

**Total Components**: 13
**Specified**: 5 (38%)
**Pending**: 8 (62%)

### Progress by Category
- **Dashboard**: 3/3 (100%) ✅
- **Layouts**: 2/6 (33%) 🟡
- **Forms-Specific**: 2/4 (50%) 🟡

---

## Next Steps

### High Priority
1. ✅ Complete dashboard components
2. ✅ Complete critical layout components (Header, Sidebar)
3. ✅ Complete form builder components

### Medium Priority
4. ⏳ Profile and notification dropdowns
5. ⏳ Remaining form builder components

### Low Priority
6. ⏳ Theme toggle
7. ⏳ Global search enhancements

---

**Maintained By**: ClienttCRM Development Team
**Questions**: See [ANALYSIS-AND-ISSUES.md](../ANALYSIS-AND-ISSUES.md)
