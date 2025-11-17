# Forms Domain - Screen Specifications

**Domain**: Forms
**Status**: 🚧 In Progress
**Last Updated**: 2025-11-17
**Figma Source**: `figma_src/205 Forms Dashboard/`
**Related Domain Spec**: `specs/01-domains/forms/`

---

## Overview

This directory contains UI/UX specifications for all screens in the Forms domain. These specs bridge the gap between:
- Business requirements (`specs/01-domains/forms/`)
- Figma prototypes (`figma_src/205 Forms Dashboard/`)
- Phoenix LiveView implementation (`clientt_crm_app/lib/clientt_crm_app_web/`)

---

## Screen Inventory

### Core Screens (MVP - Phase 2)

| Screen | Complexity | Priority | Status | Figma Source (lines) |
|--------|------------|----------|--------|----------------------|
| [Form Builder](./form-builder.md) | HIGH | CRITICAL | ✅ Documented | FormBuilderPage.tsx (1,434) |
| [Forms List](./forms-list.md) | MEDIUM | HIGH | ⏳ Pending | FormsPage.tsx (786) |
| [Dashboard](./dashboard.md) | MEDIUM | HIGH | ⏳ Pending | DashboardPage.tsx (284) |
| [Form Analytics](./form-analytics.md) | MEDIUM | MEDIUM | ⏳ Pending | FormsAnalytics.tsx (633) |
| [Settings](./settings.md) | MEDIUM | MEDIUM | ⏳ Pending | SettingsPage.tsx (1,020) |
| [Notifications](./notifications.md) | LOW | LOW | ⏳ Pending | NotificationsPage.tsx (288) |

### Future Screens (Phase 3+)

| Screen | Status | Figma Source (lines) |
|--------|--------|----------------------|
| Team Calendar Settings | ⏸️ Future | TeamCalendarPage.tsx (404) |
| Calendar Integration | ⏸️ Future | CalendarIntegrationPage.tsx (231) |
| Calendar Builder | ⏸️ Future | CalendarBuilderPage.tsx (321) |
| Chatbot | ⏸️ Future | ChatbotPage.tsx (781) |

---

## Screen Structure Template

Each screen specification includes:

### 1. Screen Overview
- Purpose and user goals
- User roles and permissions required
- Related BDD scenarios
- Figma reference

### 2. Layout Structure
- Grid/flex layout specifications
- Responsive breakpoints
- Content hierarchy
- Component placement

### 3. Component Breakdown
- All UI elements used
- Component props/assigns
- State management
- Event handlers

### 4. Interactions
- User actions (clicks, form submissions)
- LiveView events
- Real-time updates
- Navigation flows

### 5. States & Validation
- Loading states
- Empty states
- Error states
- Success feedback
- Form validation

### 6. Responsive Behavior
- Mobile layout (<640px)
- Tablet layout (640-1024px)
- Desktop layout (>1024px)

### 7. Implementation Notes
- LiveView-specific patterns
- JS Hooks requirements
- Performance considerations
- Accessibility guidelines

---

## Related Documentation

### Domain Specifications
- [Forms Domain](../../../01-domains/forms/domain.md) - Business logic and rules
- [Form Management Feature](../../../01-domains/forms/features/form_management.feature.md) - User scenarios
- [Lead Management Feature](../../../01-domains/forms/features/lead_management.feature.md) - Submissions handling

### UI Patterns
- [Drag-Drop Form Builder](../../patterns/forms-builder.md) - Drag-drop interaction pattern
- [Collapsible Sidebar](../../patterns/sidebar-modules.md) - Navigation pattern
- [Settings Tabs](../../patterns/settings-tabs.md) - Tab navigation pattern
- [Modal vs Detail View](../../patterns/modal-vs-detail.md) - Decision framework

### Components
- [Form Builder Components](../../components/forms-specific/) - Form builder UI components
- [Dashboard Components](../../components/dashboard/) - KPI cards, charts, tables
- [Layout Components](../../components/layouts/) - Header, sidebar, navigation

### Development Plans
- [Track 2: LiveView UI](../../../../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-02-forms-liveview-ui/) - Implementation guide
- [UI Layout & Roles](../../../../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-00-forms-project-overview/UI-LAYOUT-AND-ROLES.md) - Layout architecture

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
1. ✅ **Form Builder** - Most complex, enables form creation
2. **Forms List** - View and manage forms
3. **Dashboard** - Overview and KPIs

### Phase 2: Analytics (Weeks 3-4)
4. **Form Analytics** - Performance metrics
5. **Settings** - Configuration and preferences

### Phase 3: Polish (Weeks 5-6)
6. **Notifications** - In-app notifications
7. Responsive refinements
8. Accessibility improvements

---

## Design Principles

### Consistency
- Use shared layout (header + sidebar)
- Follow design tokens for colors, spacing, typography
- Reuse components across screens

### Accessibility
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactions
- Screen reader friendly
- Sufficient color contrast

### Performance
- Page load times <500ms
- Optimize LiveView updates
- Use streams for lists
- Lazy load heavy components

### Mobile-First
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)

---

## Testing Strategy

### Visual Testing
- Screenshot comparison for each breakpoint
- Dark mode variants
- Empty states
- Error states

### Functional Testing
- User flow E2E tests (Playwright)
- Accessibility testing (axe)
- Cross-browser testing
- Performance testing

### BDD Scenarios
Each screen spec references specific BDD scenarios from domain feature files. These scenarios guide E2E test implementation.

---

## Status Key

- ✅ **Documented** - Spec complete and ready for implementation
- 🚧 **In Progress** - Spec being written
- ⏳ **Pending** - Queued for documentation
- ⏸️ **Future** - Not part of MVP, documented for reference

---

**Last Updated**: 2025-11-17
**Maintained By**: Development Team
**Review Status**: Awaiting team review
