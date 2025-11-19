# UI Sync Plan: Forms Dashboard

**Date:** 2025-11-19
**Status:** Implementation In Progress - Primary Features Completed
**Branch:** 20251119-ui-from-v4
**Last Session:** Interrupted during implementation

---

## Executive Summary

This document analyzes the UI/CSS differences between the Figma design (`figma_playwright/205 Forms Dashboard`) and the current LiveView implementation (`playwright_tests/forms`). The analysis identifies significant gaps in visual design, layout structure, and functionality that need to be addressed to align the implementation with the Figma design.

**Key Finding:** The current implementation uses a simplified form-based approach, while the Figma design uses a sophisticated 3-column visual builder pattern. This represents a significant UI architecture change.

---

## Key Decisions (2025-11-19)

The following decisions have been made for this UI sync:

### 1. Color Scheme
**Decision:** Update primary colors to match Figma (teal/cyan)
- Change primary button color from purple/indigo to teal (#14B8A6)
- Apply globally across the application

### 2. AI Assistant
**Decision:** Show as "Coming Soon"
- Include AI Assistant panel in UI layout
- Display with "Coming Soon" badge
- Disable all interactions
- Do NOT implement backend functionality

### 3. No Modals Rule
**Decision:** Convert all modals to pages with sidebar/header
- **Add Field modal** → Inline properties panel (already in Figma design)
- **Preview modal** → Dedicated preview page or full-width preview section
- **Redirect URL dialog** → Inline configuration section
- All interactions should stay within the page context
- Maintain consistent navigation with sidebar always visible

### 4. Implementation Priority
**Decision:** Functional parity is the priority
- Focus on matching Figma functionality first
- Visual polish (spacing, shadows, etc.) is secondary
- Ensure all user workflows are supported before refinement

---

## Screenshot Comparison Summary

### Figma Source Files
- `figma_playwright/205 Forms Dashboard/screenshots/main/02-forms-page-light.png`
- `figma_playwright/205 Forms Dashboard/screenshots/form-builder/01-initial-empty-state.png`
- `figma_playwright/205 Forms Dashboard/screenshots/form-builder/02-with-contact-fields.png`
- `figma_playwright/205 Forms Dashboard/screenshots/form-builder/03-field-selected-properties.png`

### Current Implementation Files
- `playwright_tests/forms/FM-SC-001_create_form/screenshots/03-forms-listing-page.png`
- `playwright_tests/forms/FM-SC-001_create_form/screenshots/04-form-builder-empty.png`
- `playwright_tests/forms/FM-SC-002_configure_fields/screenshots/05-add-field-modal.png`
- `playwright_tests/forms/FM-SC-002_configure_fields/screenshots/06-text-field-configured.png`

---

## 1. Forms Listing Page Differences

### 1.1 KPI Cards Section (Missing)

**Figma Design:**
- 4 KPI cards at top: Total Forms, Total Submissions, Active Users, Conversion Rate
- Each card shows: value, percentage change, trend indicator, icon
- Cards use colored backgrounds (cyan, purple, green icons)

**Current Implementation:**
- No KPI cards
- Page starts directly with page title and table

**Implementation Tasks:**
- [ ] Create KPI card component with icon, value, trend indicator
- [ ] Add CSS for card grid layout (4 columns)
- [ ] Implement real-time calculations for each KPI
- [ ] Add trend arrows (up/down with percentage)

### 1.2 Table Structure

**Figma Design:**
| Column | Present |
|--------|---------|
| Name | Yes |
| Type | Yes (badge: "Form") |
| Submissions | Yes (number) |
| Status | Yes (colored badge: Active/Draft/Paused) |
| Date Created | Yes |
| Last Edited | Yes |
| Actions | Yes (implicit) |

**Current Implementation:**
| Column | Present |
|--------|---------|
| Name | Yes (as link) |
| Status | Yes (plain text) |
| Submissions | Yes |
| Views | Yes |
| Updated | Yes |
| Actions | Yes ("Edit" link) |

**Missing/Different:**
- [ ] Add "Type" column with badge
- [ ] Add "Date Created" column
- [ ] Rename "Updated" to "Last Edited"
- [ ] Convert status to colored badges (green=Active, gray=Draft, orange=Paused)
- [ ] Replace "Edit" text with icon buttons or dropdown menu

### 1.3 Page Header

**Figma Design:**
- Title: "All Forms"
- Subtitle: "Manage and track your forms"
- Primary button: "+ Create New Form" (with plus icon)
- Search input with icon

**Current Implementation:**
- Title: "Forms"
- Subtitle: "Create and manage your forms to capture leads and gather information."
- Primary button: "Create Form" (no icon)
- No search input

**Implementation Tasks:**
- [ ] Update title to "All Forms"
- [ ] Update subtitle text
- [ ] Add search input with icon
- [ ] Add plus icon to "Create New Form" button

### 1.4 Sidebar Differences

**Figma Design:**
- "Forms Portal" with chevron expander
- "Coming Soon" badges for: CRM, CPQ, Billing, Customer Portal, Support
- Lock icons on disabled items
- User profile at bottom with name and plan info

**Current Implementation:**
- "Forms Portal" with chevron (collapsed by default)
- Sub-items: Dashboard, All Forms, Form Builder, Analytics
- CRM item (no badge)
- Settings item
- User info in top header

**Implementation Tasks:**
- [ ] Add "Coming Soon" badges to future features
- [ ] Add lock icons on disabled sidebar items
- [ ] Move user profile to bottom of sidebar
- [ ] Show user plan (e.g., "Pro Plan")

---

## 2. Form Builder Page Differences

### 2.1 Layout Architecture (Major Change)

**Figma Design:** 3-Column Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header: Back | Title | Toolbar buttons | Save          │
├─────────┬─────────────────────────┬─────────────────────┤
│ Fields  │   Form Canvas           │  Properties Panel   │
│ Palette │   (Title, Description)  │  (Field config)     │
│         │   [Field 1]             │                     │
│ Contacts│   [Field 2]             │  OR                 │
│ General │                         │  AI Assistant       │
│ Choices │                         │  OR                 │
│ ...     │                         │  Design Options     │
└─────────┴─────────────────────────┴─────────────────────┘
```

**Current Implementation:** 2-Column Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header: Back to Forms | Title                | Publish │
├─────────────────────────────────┬───────────────────────┤
│  Form Settings                  │  Form Preview         │
│  - Form Name                    │  (Live preview)       │
│  - Description                  │                       │
│  - Category                     │                       │
│  - Status                       │                       │
│  [Create/Update Form]           │                       │
├─────────────────────────────────┤                       │
│  Form Fields                    │                       │
│  [Add Field] button             │                       │
│  - Modal for field config       │                       │
└─────────────────────────────────┴───────────────────────┘
```

**Implementation Tasks:**
- [ ] Redesign to 3-column responsive layout
- [ ] Create left sidebar with categorized field palette
- [ ] Create central canvas with drag-drop zones
- [ ] Create right panel that switches between Properties/AI/Design

### 2.2 Toolbar (Missing)

**Figma Design:**
- "Back" button with arrow
- "Hide Fields" button with gear icon
- "AI Assistant" button with sparkle icon
- "Show Preview" button with eye icon
- "Save Form" primary button with save icon

**Current Implementation:**
- "Back to Forms" link
- "Publish Form" primary button
- No other toolbar buttons

**Implementation Tasks:**
- [ ] Add toolbar component with button group
- [ ] Implement "Hide Fields" toggle
- [ ] Add "AI Assistant" button (can be placeholder)
- [ ] Add "Show Preview" button/modal
- [ ] Update Save button styling

### 2.3 Post-Submission Actions (Missing)

**Figma Design:**
- Section header: "Post-Submission Actions"
- Subtitle: "Configure what happens after form submission"
- Three action buttons:
  - "Book a Demo" (calendar icon) - disabled/gray
  - "Open Chatbot" (chat icon) - disabled/gray
  - "Redirect URL" (link icon) - active

**Current Implementation:**
- Not present

**Implementation Tasks:**
- [ ] Add post-submission actions section
- [ ] Create action button components
- [ ] Implement Redirect URL modal
- [ ] Add "Coming Soon" state for Book a Demo and Open Chatbot

### 2.4 Field Palette (Major Change)

**Figma Design:**
- Section header: "Add Form Fields"
- Subtitle: "Drag and drop fields to your form"
- Categorized accordions:
  - Contacts (First Name, Last Name, Email, Phone, Address, Company)
  - General
  - Choices
  - Service Inquiry
  - Payments (Future badge)
  - Buttons
- Each field shows icon and label
- Grid layout (2 columns)

**Current Implementation:**
- "Form Fields" section
- "Add Field" button opens modal
- Modal has dropdown for field type selection
- No visual field palette
- No drag and drop

**Implementation Tasks:**
- [ ] Create accordion component for field categories
- [ ] Create field type buttons with icons
- [ ] Implement drag and drop with LiveView (JS hooks)
- [ ] Add visual feedback for drag operations
- [ ] Add "Future" badges for upcoming features

### 2.5 Form Canvas

**Figma Design:**
- Editable "Form Title" inline
- Editable "Add a description for your form..." placeholder
- Fields shown as cards with:
  - Drag handle (6 dots)
  - Label with asterisk if required
  - Type badge (text, email, etc.)
  - Placeholder text
  - Delete button (X)
- Column width indicator on hover ("12 / 12 columns (100%)")
- Selected field has blue border

**Current Implementation:**
- Form Name in input field
- Description in textarea
- Fields shown in "Form Fields" section below settings
- No drag handles
- No inline editing
- No column indicators

**Implementation Tasks:**
- [ ] Implement inline editing for title and description
- [ ] Create field card component with drag handle
- [ ] Add field type badges
- [ ] Implement field selection with blue border
- [ ] Add delete button on fields
- [ ] Add column width indicator

### 2.6 Properties Panel (Missing)

**Figma Design:**
When field is selected:
- Section header: "Field Properties" with gear icon
- Field Label input
- Placeholder input
- Description (Optional) textarea
- Required Field toggle switch
- "Delete Field" button (red)

**Current Implementation:**
- Modal dialog for field configuration
- Contains: Field Type, Label, Placeholder, Help Text, Order Position, Options, Required checkbox

**Implementation Tasks:**
- [ ] Create side panel component
- [ ] Convert modal fields to panel inputs
- [ ] Add toggle switch component for required field
- [ ] Style delete button as destructive action
- [ ] Show/hide panel based on field selection

### 2.7 AI Assistant Panel (Future Feature)

**Figma Design:**
- Section header: "AI Forms Assistant" with sparkle icon
- Description: "Get intelligent suggestions to improve your form"
- Suggestion cards with "Apply Suggestion" buttons

**Current Implementation:**
- Not present

**Implementation Tasks:**
- [ ] Create AI assistant panel component
- [ ] Add placeholder suggestions
- [ ] Style suggestion cards
- [ ] Add "Coming Soon" or disabled state for MVP

### 2.8 Design Options Panel (Missing)

**Figma Design:**
- Collapsible accordion: "Design Options"
- Contains form styling options (colors, fonts, etc.)

**Current Implementation:**
- Not present

**Implementation Tasks:**
- [ ] Create design options accordion
- [ ] Add form styling controls (can be minimal for MVP)

---

## 3. Global UI Differences

### 3.1 Header

**Figma Design:**
- Hamburger menu button
- Global search bar: "Search forms, pages, analytics..."
- Dark mode toggle
- Notification bell with red badge
- User avatar with dropdown

**Current Implementation:**
- Hamburger menu
- Search bar: "Search forms, contacts, settings..."
- System/Light/Dark theme toggle (3 buttons)
- Notification bell (no badge)
- User email dropdown

**Implementation Tasks:**
- [ ] Update search placeholder text
- [ ] Add notification count badge
- [ ] Simplify theme toggle (single button)

### 3.2 Color Scheme

**Figma Design:**
- Primary buttons: Teal/Cyan (#14B8A6 approx)
- Status badges: Green (Active), Gray (Draft), Orange (Paused)
- Icon backgrounds: Cyan, Purple, Green variations

**Current Implementation:**
- Primary buttons: Purple/Indigo
- Status: Plain text
- Limited color usage

**Implementation Tasks:**
- [ ] Update primary color from purple to teal
- [ ] Add status badge colors
- [ ] Create icon background color utilities

### 3.3 Typography & Spacing

**Figma Design:**
- Larger headings
- More generous spacing
- Subtle shadows on cards

**Current Implementation:**
- Standard heading sizes
- Tighter spacing
- Minimal shadows

**Implementation Tasks:**
- [ ] Review and update heading sizes
- [ ] Increase padding/margins
- [ ] Add card shadows

---

## 4. Out of Scope (Per MVP Decisions)

The following features shown in Figma are explicitly out of scope per `DECISIONS-SUMMARY-2025-11-16.md` and `MVP-SCOPE-FINALIZED.md`:

### 4.1 Features to Show as "Coming Soon"
- Book a Demo (Calendar integration)
- Open Chatbot
- AI Forms Assistant (full functionality)
- Payments field category
- CRM, CPQ, Billing, Customer Portal, Support sidebar items

### 4.2 Features Deferred to Phase 3+
- File upload field type
- Conditional logic
- Multi-page forms
- Custom regex validation
- Slack/webhook integrations

### 4.3 Implementation Note
For out-of-scope features:
- Show UI elements with "Coming Soon" badges
- Disable interaction (grayed out, disabled buttons)
- Include in layout for visual consistency
- Do NOT implement backend functionality

---

## 5. Implementation Priority

**Focus: Functional Parity First**

### Priority 1: Core Layout & Navigation (Functional)
1. **Form Builder 3-column layout** - Core UX pattern, no modals
2. **Properties panel (replaces modal)** - Field configuration without modal
3. **Field palette with categories** - Core builder functionality
4. **Preview page (replaces modal)** - `/forms/:id/preview` route

### Priority 2: Dashboard Features (Functional)
5. **KPI cards on forms listing** - Key dashboard feature
6. **Table columns and actions** - Full data display
7. **Search functionality** - Forms filtering
8. **Post-submission actions section** - Including inline Redirect URL config

### Priority 3: Builder Interactions (Functional)
9. **Field selection and editing** - Click to select, edit in panel
10. **Drag and drop** - Reorder fields (requires JS hooks)
11. **Inline title/description editing** - Canvas editing experience
12. **Toolbar buttons** - Hide Fields, Preview, Save actions

### Priority 4: Color & Styling (Visual)
13. **Primary color update** - Teal (#14B8A6) globally
14. **Status badges with colors** - Active/Draft/Paused
15. **Coming Soon badges** - AI Assistant, Calendar, Chatbot
16. **Typography and spacing** - Visual consistency

---

## 6. Technical Considerations

### 6.1 LiveView Patterns Needed
- JS Hooks for drag and drop
- Streams for field list management
- Form components with nested changesets
- Side panel state management

### 6.2 CSS/Tailwind Updates
- 3-column grid layout
- Accordion component styles
- Toggle switch component
- Badge variants (status colors)
- Card shadows and borders

### 6.3 Component Library
New components to create:
- `kpi_card.ex` - Dashboard KPI cards
- `field_palette.ex` - Categorized field selector
- `properties_panel.ex` - Field configuration panel
- `field_card.ex` - Draggable field in canvas
- `status_badge.ex` - Colored status indicators
- `toggle_switch.ex` - Boolean toggle
- `accordion.ex` - Collapsible sections

### 6.4 Existing Code to Update
- `lib/clientt_crm_app_web/live/form_live/` - Form LiveView pages
- `lib/clientt_crm_app_web/components/` - Shared components
- `assets/css/` - Tailwind customizations

---

## 7. Estimated Scope

### High-Level Estimates

| Area | Complexity | Notes |
|------|------------|-------|
| Forms Listing UI | Medium | Add KPIs, update table, search |
| Form Builder Layout | High | 3-column redesign, state management |
| Field Palette | Medium | Accordion, drag source |
| Canvas Fields | Medium-High | Drag target, selection, inline edit |
| Properties Panel | Medium | Side panel, field binding |
| Styling Updates | Low-Medium | Colors, spacing, badges |

### Dependencies
- Form Builder layout should be done before Field Palette and Properties Panel
- KPI cards require analytics queries (may already exist)
- Drag and drop requires JS hooks setup

---

## 8. Files to Reference

### Existing Documentation
- `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-00-forms-project-overview/DECISIONS-SUMMARY-2025-11-16.md`
- `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-00-forms-project-overview/MVP-SCOPE-FINALIZED.md`
- `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-02-forms-liveview-ui/README.md`

### Guidelines
- `/project-guidelines` - UI/UX conventions
- `/liveview-guidelines` - LiveView patterns, streams, hooks
- `/html-guidelines` - HEEx templates

### Figma Screenshots
- `figma_playwright/205 Forms Dashboard/screenshots/main/` - Main pages
- `figma_playwright/205 Forms Dashboard/screenshots/form-builder/` - Builder states

---

## 9. Execution Status

### ✅ COMPLETED Items

#### Priority 1: Core Layout & Navigation
- [x] **Form Builder 3-column layout** (`builder.ex:481-741`) - Full redesign with left field palette, center canvas, right properties panel
- [x] **Properties panel replaces modal** - Field configuration now in right side panel instead of modal
- [x] **Field palette with categories** - Accordion with Contacts, General, Choices categories
- [x] **Preview page** - Created `/forms/:id/preview` route and `preview.ex` LiveView

#### Priority 2: Dashboard Features
- [x] **KPI cards on forms listing** (`index.ex:117-177`) - Total Forms, Total Submissions, Active Forms, Conversion Rate
- [x] **Table columns and actions** - Added Type, Date Created, Last Edited columns; status badges with colors
- [x] **Search functionality** (`index.ex:89-102`) - Real-time search with icon
- [x] **Post-submission actions section** (`builder.ex:451-479`) - Book a Demo (disabled), Open Chatbot (disabled), Redirect URL

#### Priority 3: Builder Interactions
- [x] **Field selection and editing** - Click to select field, edit in properties panel
- [x] **Inline title/description editing** (`builder.ex:538-561`) - Direct editing in canvas
- [x] **Toolbar buttons** (`builder.ex:412-447`) - Back, Hide Fields, AI Assistant (Coming Soon), Show Preview, Save Form
- [x] **Field cards with drag handles** - Visual drag handles on each field
- [x] **Delete button on fields** - X button when field selected

#### Priority 4: Color & Styling
- [x] **Status badges with colors** (`index.ex:307-309`) - Green for published, gray for draft, yellow for archived
- [x] **Coming Soon badges** - AI Assistant, disabled buttons for Book a Demo/Chatbot

#### Router Updates
- [x] **Preview route added** (`router.ex:46`) - `live "/forms/:id/preview", FormLive.Preview, :preview`

### ⏳ IN PROGRESS / NEEDS VERIFICATION

1. **Drag and drop JS hooks** - UI exists but `phx-hook="FieldReorder"` may need wiring
2. **Primary color update to teal** - Currently using generic "primary" which may need Tailwind/DaisyUI config update

### 📋 REMAINING Tasks

#### Priority 4: Color & Styling (Continued)
- [ ] Update primary color from purple to teal (#14B8A6) in Tailwind config
- [ ] Review and update heading sizes
- [ ] Increase padding/margins for visual consistency
- [ ] Add card shadows per Figma design

#### Sidebar Updates (Lower Priority)
- [ ] Add "Coming Soon" badges to CRM, CPQ, Billing, etc. in sidebar
- [ ] Add lock icons on disabled sidebar items
- [ ] Move user profile to bottom of sidebar
- [ ] Show user plan info

#### Header Updates (Lower Priority)
- [ ] Add notification count badge
- [ ] Simplify theme toggle to single button

---

## 10. Next Steps (Resuming Work)

**Immediate Actions:**
1. Verify the FieldReorder JS hook is properly wired up for drag and drop
2. Update primary color to teal (#14B8A6) in Tailwind/DaisyUI config
3. Test all implemented features work correctly
4. Run Playwright tests to verify UI changes

**Then:**
5. Address remaining Priority 4 styling tasks
6. Update sidebar with Coming Soon badges (if needed for this sprint)

---

## 11. Resolved Questions

All questions have been answered (see Key Decisions section above):

1. ✅ **Primary color:** Update globally to teal (#14B8A6)
2. ✅ **AI Assistant:** Show as "Coming Soon" with disabled interactions
3. ✅ **Modals:** No modals allowed - convert all to pages/inline panels
4. ✅ **Priority:** Functional parity first, visual polish second

---

## 12. Modal Conversion Requirements

Per the "No Modals" decision, the following must be converted:

### Current Modal → New Approach

| Current Modal | Conversion Approach |
|---------------|---------------------|
| Add Field modal | Use Properties panel (right side panel) - click field type in palette, configure in panel |
| Preview dialog | Navigate to `/forms/:id/preview` page with full layout |
| Redirect URL dialog | Inline expandable section in Post-Submission Actions |
| Field edit modal | Properties panel updates when field selected in canvas |
| Confirmation dialogs | Inline confirmation with undo option, or dedicated confirmation page for destructive actions |

### Implementation Notes
- All pages must include sidebar navigation
- Use browser back button for navigation (LiveView `push_patch`)
- Toast notifications for success/error feedback instead of modal alerts
- Inline validation errors instead of modal error dialogs

---

**Status:** ⏳ Implementation In Progress - Primary Features Complete
**Last Updated:** 2025-11-19 (Execution status added after session interruption)
