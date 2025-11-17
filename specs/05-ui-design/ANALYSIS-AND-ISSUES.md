# UI Design Specs - Gap Analysis & Issues

**Analysis Date:** 2025-11-17
**Status:** 🔴 Critical Gaps Identified
**Priority:** HIGH - Required for Forms MVP Implementation

---

## Executive Summary

### Current State
The `specs/05-ui-design` directory contains:
- ✅ Basic README with structure and guidelines
- ✅ Design tokens file (mostly placeholders)
- ⚠️ Minimal component/pattern/screen specifications
- ❌ **No Forms domain UI specifications**

### Critical Finding
**There is a significant gap between:**
1. **Comprehensive domain specs** (`specs/01-domains/forms`)
2. **Detailed Figma prototype** (`figma_src/205 Forms Dashboard`)
3. **Thorough dev plans** (`dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard`)
4. **Sparse UI design specs** (`specs/05-ui-design`)

**Impact:** Development teams cannot begin Forms UI implementation without proper design specifications bridging the Figma prototype to Phoenix LiveView implementation.

---

## Gap Analysis by Category

### 1. Design Tokens (MEDIUM PRIORITY)

**File:** `design-tokens.md`

**Issues Found:**
- ❌ Missing Forms-specific color scheme from Figma:
  - Primary blue gradient: `#2278c0` → `#1a5f99`
  - Accent fuchsia gradient: `#ec4899` → `#db2777` (for chatbot features)
- ❌ Missing typography specifications from Figma (38px page titles, 18px card headings)
- ❌ Missing spacing system (8px base unit documented in Figma)
- ✅ Generic DaisyUI tokens are documented

**Required Actions:**
- [ ] Extract exact color values from Figma DEVELOPER_HANDOFF.md
- [ ] Document gradient specifications
- [ ] Add Forms-specific status colors
- [ ] Document spacing tokens from Figma design system

---

### 2. Components (CRITICAL PRIORITY)

**Directory:** `components/`

**Status:** ❌ EMPTY (only README template exists)

**Missing Components:**

#### Forms-Specific Components
From `figma_src/205 Forms Dashboard/src/components/`:

1. **Form Builder Components (7 components)**
   - `FormGridCanvas.tsx` (1,434 lines) - Drag-drop canvas
   - `FormFieldsSidebar.tsx` - Field palette
   - `FormDropZone.tsx` - Drop zone areas
   - `DraggableField.tsx` - Draggable field component
   - `DraggableFieldInGrid.tsx` - Field in canvas
   - `DraggableFieldTile.tsx` - Palette tile
   - **Phoenix equivalent:** Needs LiveView JS Hooks for drag-drop

2. **Dashboard Components (3 components)**
   - `KPICard.tsx` - Metric display cards
   - `PerformanceChart.tsx` - Analytics charts
   - `RecentFormsTable.tsx` - Forms list table
   - **Phoenix equivalent:** LiveView components with Chart.js

3. **Layout Components (7 components)**
   - `Header.tsx` - Main header
   - `Sidebar.tsx` - Collapsible sidebar with module system
   - `GlobalSearch.tsx` - Search functionality
   - `ProfileDropdown.tsx` - User menu
   - `NotificationsDropdown.tsx` - Notifications
   - `ThemeToggle.tsx` - Dark mode
   - `QuickActions.tsx` - Action buttons
   - **Status:** Partially documented in UI-LAYOUT-AND-ROLES.md but not in component specs

4. **AI/Analytics Components (2 components)**
   - `AIInsightsCards.tsx` - AI-powered insights
   - `AIAssistant.tsx` - AI assistant (future)
   - **Status:** Future scope, needs "Coming Soon" placeholders

**Required Actions:**
- [ ] Create `components/forms-specific/` directory
- [ ] Document each component with:
  - Purpose and usage
  - Figma reference
  - LiveView implementation pattern
  - Props/assigns
  - Code examples
  - Accessibility requirements

---

### 3. UI Patterns (CRITICAL PRIORITY)

**Directory:** `patterns/`

**Current Files:**
- `authentication.md` - Login/registration (exists)

**Missing Patterns:**

1. **Drag-and-Drop Form Builder**
   - Source: `FormBuilderPage.tsx` (1,434 lines)
   - Pattern: Field palette → Canvas grid → Property editor
   - Technology: Phoenix LiveView + JS Hooks (SortableJS or custom)
   - **Status:** ❌ Not documented

2. **List-Detail-Edit Pattern** (CRUD operations)
   - Source: `FormsPage.tsx` + `FormBuilderPage.tsx`
   - Pattern: Forms list → Form detail → Edit in builder
   - **Status:** ⚠️ Generic `list-detail.md` mentioned but not created

3. **Settings Tabs Navigation**
   - Source: `SettingsPage.tsx` (1,020 lines)
   - Pattern: 7 tabs (Profile, Integrations, Calendar, etc.)
   - **Status:** ❌ Not documented

4. **Collapsible Sidebar Modules**
   - Source: `Sidebar.tsx` + module system docs
   - Pattern: Expandable/collapsible navigation groups
   - **Status:** ❌ Not documented

5. **Real-time Analytics Dashboard**
   - Source: `DashboardPage.tsx` + `FormsAnalytics.tsx`
   - Pattern: KPI cards + Charts + Tables
   - **Status:** ❌ Not documented

6. **Modal vs Detail View Decision Pattern**
   - Source: `UI-LAYOUT-AND-ROLES.md`
   - Pattern: When to use modals vs full pages
   - **Status:** ⚠️ Documented in dev plans but not in UI specs

**Required Actions:**
- [ ] Create `patterns/forms-builder.md` - Drag-drop pattern
- [ ] Create `patterns/sidebar-modules.md` - Navigation pattern
- [ ] Create `patterns/settings-tabs.md` - Tab navigation pattern
- [ ] Create `patterns/analytics-dashboard.md` - Dashboard layout
- [ ] Create `patterns/modal-vs-detail.md` - Decision framework
- [ ] Update `list-detail.md` with Forms-specific examples

---

### 4. Screen Specifications (CRITICAL PRIORITY)

**Directory:** `screens/`

**Current Structure:**
```
screens/
├── shared/
│   ├── navigation.md (exists, generic)
│   └── dashboard.md (exists, placeholder)
├── authorization/ (exists, for different domain)
└── forms/ ❌ MISSING ENTIRELY
```

**Missing Screens for Forms Domain:**

From `figma_src/205 Forms Dashboard/`:

1. **Dashboard Page** (284 lines)
   - Global KPIs: Total Forms, Submissions, Conversion Rate
   - Quick actions
   - Recent forms table
   - **Status:** ❌ Not documented

2. **Forms List Page** (786 lines)
   - Filterable/sortable table
   - Create form button
   - Status badges (draft/published/archived)
   - **Status:** ❌ Not documented

3. **Form Builder Page** (1,434 lines - MOST COMPLEX)
   - Field palette sidebar
   - Drag-drop canvas grid
   - Property editor panel
   - Preview mode
   - **Status:** ❌ Not documented

4. **Form Analytics Page** (633 lines)
   - Per-form metrics
   - Time-series charts
   - Field completion rates
   - Lead source tracking
   - **Status:** ❌ Not documented

5. **Settings Page** (1,020 lines)
   - 7 tabs: Profile, Integrations, Calendar, Notifications, Security, Billing, Appearance
   - Cross-tab navigation
   - **Status:** ❌ Not documented

6. **Team Calendar Settings** (404 lines)
   - Availability configuration
   - Weekly hours setup
   - Team member toggles
   - **Status:** ❌ Not documented

7. **Notifications Page** (288 lines)
   - Notification list
   - Mark as read/unread
   - Filter by type
   - **Status:** ❌ Not documented

**Required Actions:**
- [ ] Create `screens/forms/` directory
- [ ] Create `screens/forms/dashboard.md`
- [ ] Create `screens/forms/forms-list.md`
- [ ] Create `screens/forms/form-builder.md` (HIGH PRIORITY)
- [ ] Create `screens/forms/form-analytics.md`
- [ ] Create `screens/forms/settings.md`
- [ ] Create `screens/forms/team-calendar.md`
- [ ] Create `screens/forms/notifications.md`

---

## Alignment Issues

### Issue 1: Design Tokens Not Extracted from Figma

**Problem:**
The `design-tokens.md` file contains generic DaisyUI tokens but not the actual color scheme used in the Figma prototype.

**Evidence:**
From `figma_src/205 Forms Dashboard/src/DEVELOPER_HANDOFF.md`:
```css
--primary: #2278c0;
--primary-hover: #1a5f99;
--primary-gradient: linear-gradient(135deg, #2278c0 0%, #1a5f99 100%);
--accent: #ec4899;
--accent-hover: #db2777;
--accent-gradient: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
```

**Current State:**
`design-tokens.md` shows:
```
Primary: #3B82F6
```

**Impact:** MEDIUM - Developers will implement wrong colors

**Fix:** Extract and document actual Figma color palette

---

### Issue 2: Component Conversion Not Documented

**Problem:**
Developer handoff docs describe 82 TSX components, but no Phoenix LiveView equivalents are documented in UI specs.

**Evidence:**
- `figma_src/205 Forms Dashboard/`: 21 reusable components + 49 shadcn/ui components
- `specs/05-ui-design/components/`: Empty (only README structure)

**Impact:** CRITICAL - No guidance on React → LiveView conversion

**Fix:** Create component specs with conversion patterns

---

### Issue 3: Forms Domain Screens Not Specified

**Problem:**
The Forms domain has no screen specifications despite having:
- Complete domain models (specs/01-domains/forms)
- Figma prototype (12 pages)
- Dev implementation plans (8 tracks)

**Evidence:**
- `specs/05-ui-design/screens/forms/` does not exist
- `screens/shared/` has only generic navigation and placeholder dashboard

**Impact:** CRITICAL - Cannot implement UI without screen specs

**Fix:** Create full screen specifications for all 8 Forms pages

---

### Issue 4: Drag-Drop Pattern Not Documented

**Problem:**
The most complex UI pattern (form builder with drag-drop) has no design specification.

**Evidence:**
- `FormBuilderPage.tsx`: 1,434 lines implementing drag-drop
- `patterns/` directory: Only `authentication.md` exists
- No documentation on LiveView + JS Hooks implementation

**Impact:** CRITICAL - Core feature cannot be implemented

**Fix:** Create comprehensive drag-drop pattern specification

---

### Issue 5: Dev Plans Reference Figma, but UI Specs Don't

**Problem:**
Disconnect between dev planning docs and UI design specs.

**Evidence:**
- Dev plans: Extensive Figma references, component inventories, conversion matrices
- UI specs: No Figma references, no component specs, minimal screens

**Impact:** MEDIUM - Redundant documentation, unclear source of truth

**Fix:** Treat UI specs as the source of truth, reference Figma appropriately

---

## Traceability Matrix

| Figma Page | Lines | Domain Spec | Dev Plan Track | UI Screen Spec | Status |
|------------|-------|-------------|----------------|----------------|--------|
| DashboardPage.tsx | 284 | ✅ domain.md | ✅ Track 2 | ❌ Missing | 🔴 |
| FormsPage.tsx | 786 | ✅ form_management.feature.md | ✅ Track 2 | ❌ Missing | 🔴 |
| FormBuilderPage.tsx | 1,434 | ✅ form.md | ✅ Track 2 | ❌ Missing | 🔴 |
| FormsAnalytics.tsx | 633 | ✅ domain.md | ✅ Track 4 | ❌ Missing | 🔴 |
| SettingsPage.tsx | 1,020 | ✅ domain.md | ✅ Track 5 | ❌ Missing | 🔴 |
| TeamCalendarPage.tsx | 404 | ⏸️ Future | ✅ Track 5 | ❌ Missing | 🟡 |
| NotificationsPage.tsx | 288 | ✅ notification.md | ✅ Track 2 | ❌ Missing | 🔴 |

**Coverage:** 0/7 screens documented (0%)

---

## Recommendations

### Immediate Actions (Week 1)

**Priority 1: Create Forms Screen Specifications**
1. Create `screens/forms/` directory structure
2. Document Form Builder page (highest complexity)
3. Document Forms List page
4. Document Dashboard with Forms-specific KPIs
5. Document Analytics page

**Priority 2: Document Critical Patterns**
1. Drag-drop form builder pattern
2. Collapsible sidebar modules pattern
3. Settings tabs navigation pattern

**Priority 3: Extract Figma Design Tokens**
1. Update color palette with actual Figma values
2. Document gradients
3. Document typography scale
4. Document spacing system

### Short-term Actions (Week 2)

**Priority 4: Component Specifications**
1. Create `components/forms-specific/` directory
2. Document form builder components (7 components)
3. Document dashboard components (3 components)
4. Document layout components (7 components)

**Priority 5: Update Existing Specs**
1. Update `screens/shared/dashboard.md` with Forms KPIs
2. Update `screens/shared/navigation.md` with Forms module
3. Create `patterns/modal-vs-detail.md`

### Long-term Actions (Week 3-4)

**Priority 6: Comprehensive Component Library**
1. Document all 49 shadcn/ui → Phoenix equivalents
2. Create component usage examples
3. Add accessibility guidelines
4. Create Storybook-style component catalog

**Priority 7: Design System Documentation**
1. Create comprehensive style guide
2. Document dark mode implementation
3. Create responsive design patterns
4. Add animation/transition guidelines

---

## Success Criteria

### Minimum Viable UI Specs (MVP)
- [ ] All 7 Forms screens documented
- [ ] 3 critical patterns documented (drag-drop, sidebar, settings tabs)
- [ ] Design tokens extracted from Figma
- [ ] 17 Forms-specific components documented
- [ ] Traceability: 100% of Figma pages → UI specs

### Complete UI Design System
- [ ] All patterns documented (6 patterns)
- [ ] All components documented (70+ components)
- [ ] Full design token library
- [ ] Accessibility guidelines per component
- [ ] Responsive patterns documented
- [ ] Animation library
- [ ] Dark mode specifications

---

## Files to Create (Checklist)

### Screens (7 files)
- [ ] `screens/forms/dashboard.md`
- [ ] `screens/forms/forms-list.md`
- [ ] `screens/forms/form-builder.md`
- [ ] `screens/forms/form-analytics.md`
- [ ] `screens/forms/settings.md`
- [ ] `screens/forms/team-calendar.md`
- [ ] `screens/forms/notifications.md`

### Patterns (5 files)
- [ ] `patterns/forms-builder.md` (drag-drop)
- [ ] `patterns/sidebar-modules.md`
- [ ] `patterns/settings-tabs.md`
- [ ] `patterns/analytics-dashboard.md`
- [ ] `patterns/modal-vs-detail.md`

### Components (3 directories, 17+ files)
- [ ] `components/forms-specific/README.md`
- [ ] `components/forms-specific/form-grid-canvas.md`
- [ ] `components/forms-specific/form-fields-sidebar.md`
- [ ] `components/forms-specific/draggable-field.md`
- [ ] `components/layouts/header.md`
- [ ] `components/layouts/sidebar.md`
- [ ] `components/dashboard/kpi-card.md`
- [ ] `components/dashboard/performance-chart.md`
- [ ] `components/dashboard/recent-forms-table.md`
- [ ] ... (plus 8 more component specs)

### Updates to Existing Files (3 files)
- [ ] `design-tokens.md` - Add Figma color palette
- [ ] `screens/shared/dashboard.md` - Add Forms KPIs
- [ ] `screens/shared/navigation.md` - Add Forms module navigation

---

## Estimated Effort

| Task | Effort | Priority |
|------|--------|----------|
| Screen specs (7 files) | 14 hours | HIGH |
| Pattern specs (5 files) | 10 hours | HIGH |
| Component specs (17 files) | 17 hours | MEDIUM |
| Design token extraction | 3 hours | MEDIUM |
| Existing file updates | 2 hours | LOW |
| **Total** | **46 hours** | **~1 week** |

---

## Conclusion

**Status:** 🔴 **CRITICAL GAPS IDENTIFIED**

The `specs/05-ui-design` directory is currently insufficient to support Forms MVP implementation. While comprehensive domain specs and dev plans exist, the UI design specifications are sparse and disconnected from the Figma prototype.

**Immediate Action Required:**
Populate `specs/05-ui-design` with Forms-specific screen specs, patterns, and components before development begins.

**Recommended Approach:**
1. Start with highest-priority items (Form Builder screen + drag-drop pattern)
2. Work in parallel on screen specs and pattern specs
3. Add component specs as screens are documented
4. Update design tokens as actual colors are needed

**Timeline:**
Allow 1 week of focused documentation effort to create minimum viable UI specs for Forms MVP development.

---

**Next Steps:** Begin with `screens/forms/form-builder.md` (highest complexity, highest priority).

---

**Analysis Completed By:** Claude Code
**Date:** 2025-11-17
**Review Status:** Ready for Team Review
