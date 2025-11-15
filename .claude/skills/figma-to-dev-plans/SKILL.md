---
name: figma-to-dev-plans
description: Convert Figma source exports into comprehensive dev_task-prompts_and_plans with implementation guides, component inventories, phased planning, and E2E test plans for Phoenix LiveView
---

# Figma to Dev Plans Skill

Convert exported Figma code folders (React/TypeScript) into comprehensive development task prompts and plans with implementation guides, coverage analysis, and phased planning for Phoenix LiveView conversion.

## Overview

This skill automates the process of analyzing a Figma source export and generating a complete `dev_task-prompts_and_plans` folder structure with:
- Component and page inventories
- Technology conversion matrices (React → Phoenix LiveView)
- Database schema requirements
- Implementation phases and timelines
- Testing strategies
- Coverage analysis

## When to Use This Skill

Use this skill when you have:
- A Figma code export folder in `figma_src/` (React/TypeScript/Vite)
- Need to plan Phoenix LiveView implementation
- Want comprehensive development task prompts
- Need to track component coverage and references

## Prerequisites

- Figma source export exists in `figma_src/` folder
- Export contains React/TypeScript components (TSX files)
- Have access to the codebase structure (`lib/`, `test/`, etc.)
- Understand the target technology stack (Phoenix, Ash, LiveView)

## Step-by-Step Process

### Step 1: Analyze Figma Export Structure

**Goal:** Understand what's in the Figma export

**Actions:**
1. Ask user for the Figma source folder path
   - Example: `figma_src/205 Forms Dashboard/`

2. Inventory the export:
   ```bash
   # Count total files
   find "figma_src/[folder]" -name "*.tsx" | wc -l

   # List pages
   ls -1 "figma_src/[folder]/src/components/pages/"

   # List components
   ls -1 "figma_src/[folder]/src/components/"

   # Count lines per page
   wc -l "figma_src/[folder]/src/components/pages/"*.tsx | sort -rn
   ```

3. Read package.json to understand dependencies:
   - UI libraries (shadcn/ui, Material UI, etc.)
   - Icon libraries (Lucide, Font Awesome, etc.)
   - Chart libraries (Chart.js, Recharts, etc.)
   - Form libraries (React Hook Form, Formik, etc.)

4. Create component inventory:
   - **Pages** - Top-level routes/screens
   - **Components** - Reusable UI components
   - **UI Components** - Library components (shadcn/ui, etc.)
   - **Utilities** - Helper functions, hooks

**Output:** Complete file and component inventory with line counts

---

### Step 2: Identify Feature Domains

**Goal:** Group components into logical implementation tracks

**Analysis:**
1. Group pages by feature domain:
   - Forms management → Forms domain
   - Analytics/dashboards → Analytics domain
   - Settings → Settings domain
   - Calendar → Calendar domain
   - Chatbot → Chatbot domain
   - CRM/Contacts → CRM domain

2. Identify cross-cutting concerns:
   - Layout components (Header, Sidebar, Navigation)
   - Authentication pages (Login, Signup, Reset Password)
   - Shared components (KPI cards, tables, charts)

3. Determine MVP scope:
   - Which features are core/essential?
   - Which features can be "Coming Soon"?
   - What's the logical implementation order?

**Ask the user:**
- "Which features are MVP priority?"
- "Which features should be marked as 'Coming Soon'?"
- "Any specific implementation order requirements?"

**Output:** Feature domain groupings with MVP vs Future classification

---

### Step 3: Define Implementation Tracks

**Goal:** Create logical tracks for development

**Standard Tracks:**

1. **Track 0: Project Overview** (`YYYYMMDD-00-[name]-project-overview/`)
   - README.md with navigation guide
   - MVP scope and feature list
   - Technology conversion reference
   - Implementation phases
   - Success criteria

2. **Track 1: Primary Overview** (`YYYYMMDD-01-[name]-primary/`)
   - 00-PRIMARY-OVERVIEW.md (executive summary)
   - Complete feature breakdown
   - Database schema overview
   - All implementation phases detailed

3. **Track 2: LiveView UI Conversion** (`YYYYMMDD-02-[name]-liveview-ui/`)
   - Component conversion patterns (React → LiveView)
   - Page-by-page implementation guide
   - Routing configuration
   - Design system migration
   - Testing strategy

4. **Track 3: Domain Models** (`YYYYMMDD-03-[name]-domain-models/`)
   - Ash resources and domains
   - Database schema (SQL)
   - Role-based access control
   - Calculations and aggregates
   - Validation rules

5. **Track N: Feature-Specific Tracks**
   - One track per major feature domain
   - Example: Analytics, Settings, Calendar, etc.
   - Each track follows similar structure

6. **Track xx: Future Features** (`YYYYMMDD-xx-[name]-future-[feature]/`)
   - Documented but not in MVP
   - "Coming Soon" placeholders in UI
   - Complete specs for future implementation

**Folder Naming Convention:**
- Format: `YYYYMMDD-NN-[name]-[description]`
- Example: `20251115-02-forms-liveview-ui`
- MVP tracks: `00-05` (or however many needed)
- Future tracks: `xx-future-[feature]`

**Output:** Track structure with folder names and descriptions

---

### Step 4: Create Project Overview (Track 0)

**File:** `YYYYMMDD-00-[name]-project-overview/README.md`

**Contents:**
```markdown
# [Feature Name] Implementation - Development Task Prompts

## Overview
[Brief description of what's being built]

**Figma Source:** `figma_src/[folder]/`
**Target Stack:** Elixir, Phoenix 1.8+, Ash Framework 3.0+, LiveView 1.1+, PostgreSQL

## Quick Start
1. Read First: [Link to PRIMARY OVERVIEW]
2. Choose Your Track: Based on role/feature
3. Follow the MVP Phases: [Number] phases over [Number] weeks

## Current Scope: MVP Implementation
- ✅ Feature 1
- ✅ Feature 2
- ⏸️ Future Feature 1
- ⏸️ Future Feature 2

## Folder Structure
[Directory tree with all tracks]

## Implementation Tracks (MVP)
[Description of each MVP track]

## Future Phases (Post-MVP)
[Description of future tracks]

## MVP Implementation Phases
[Detailed phase breakdown]

## Technology Conversion Reference
[React → LiveView mapping table]

## Quick Reference by Role
[Frontend, Backend, Full-Stack developer paths]

## Common Questions
[FAQ about the implementation]

## UI Placeholders for Future Features
[Code examples for "Coming Soon" badges]

## Success Criteria (MVP)
[Technical and feature metrics]

## Resources & Documentation
[Links to project docs, external docs, Figma source]
```

**Output:** Complete project overview with navigation

---

### Step 5: Create Primary Overview (Track 1)

**File:** `YYYYMMDD-01-[name]-primary/00-PRIMARY-OVERVIEW.md`

**Contents:**
```markdown
# [Feature Name] - Primary Implementation Overview

## Executive Summary
[Comprehensive overview]

**Source:** `figma_src/[folder]/`
**Target:** Phoenix LiveView Application at `clientt_crm_app/`

## What We're Building (MVP Scope)
[Detailed feature list with MVP vs Future]

## Critical Requirements
[UI layout, RBAC, architectural requirements]

## Major Components
[All tracks with detailed descriptions]

### Track N: [Track Name]
**Folder:** `YYYYMMDD-0N-[folder]/`
**Scope:** [What this track covers]
**Key Files to Create:** [List of files]
**Technology Mapping:** [Conversions needed]
**Database Tables:** [If applicable]

## MVP Database Schema
[Complete SQL schema]

## Implementation Phases
[Detailed phase breakdown with tasks]

### Phase 1: Foundation (Week X-Y)
**Priority:** [Focus area]
**Tasks:**
- ✅ Task 1
- ✅ Task 2

**Deliverables:**
- [What's complete at end of phase]

## Technology Stack
[Complete tech stack for implementation]

## Testing Strategy
[Unit, integration, E2E testing approaches]

## Performance Considerations
[N+1 queries, caching, optimization]

## Security Considerations
[RBAC, policies, XSS prevention, etc.]

## Timeline & Milestones
[Week-by-week breakdown]

## Questions to Clarify Before Starting
[List of questions for stakeholders]

## Success Metrics
[How to measure completion]

## Resources
[Links to all relevant documentation]
```

**Output:** Comprehensive primary overview document

---

### Step 6: Create LiveView UI Track (Track 2)

**File:** `YYYYMMDD-02-[name]-liveview-ui/README.md`

**Contents:**
```markdown
# Track 2: Phoenix LiveView UI Conversion

## Overview
Convert React/TypeScript components to Phoenix LiveView

**Source Files:** `figma_src/[folder]/src/components/`
**Target Location:** `lib/[app]_web/live/` and `lib/[app]_web/components/`

## Critical UI Requirements
[Layout, navigation, RBAC, responsive design]

## Components to Convert

### Priority 1: Core Pages (Week 1)
1. **[Page Name]** ([Lines] lines) → `[target_path]`
   - [Description]
   - [Key components]
   - [Special considerations]

### Priority 2: [Feature] Pages (Week 2)
[Continue listing all pages]

## Technology Conversion Matrix

| React Concept | Phoenix LiveView Equivalent |
|--------------|------------------------------|
| useState | assign in socket |
| useEffect | handle_info / handle_event |
[Complete mapping table]

## File Structure to Create
[Directory tree for LiveView files]

## Component Patterns
[Code examples for:
- Basic LiveView page template
- LiveComponent pattern
- Function component pattern
]

## Routing Configuration
[Router.ex additions]

## Design System Implementation
[Color tokens, typography, component classes]

## Real-Time Updates Pattern
[PubSub integration examples]

## Accessibility Checklist
[WCAG requirements]

## Mobile Responsive Patterns
[Responsive class examples]

## Dark Mode Support
[Theme implementation]

## Performance Considerations
[Code splitting, data loading, debouncing]

## Testing Strategy
[LiveView test examples]

## Common Pitfalls to Avoid
[N+1 queries, missing CSRF, hard-coded URLs, etc.]

## Next Steps
[Implementation order and guidance]
```

**Output:** Complete UI conversion guide

---

### Step 7: Create Domain Models Track (Track 3)

**File:** `YYYYMMDD-03-[name]-domain-models/README.md`

**Contents:**
```markdown
# Track 3: Ash Domain Models & Data Layer

## Overview
Create Ash resources and database schema

**Figma Source:**
- `figma_src/[folder]/src/components/pages/[Page].tsx` (field types)
- [List relevant source files]

**Target Location:** `lib/[app]/`
**Database:** PostgreSQL via AshPostgres

## Critical Authorization Requirements
[RBAC roles and policies]

## Ash Domains to Create

### 1. [Domain Name] Domain
**File:** `lib/[app]/[domain].ex`

Resources:
- [Resource 1] - [Description]
- [Resource 2] - [Description]

## Resources to Implement

### Resource: [ResourceName]
**File:** `lib/[app]/[domain]/[resource].ex`
**Table:** `[table_name]`

**Attributes:**
[List all attributes with types]

**Relationships:**
[belongs_to, has_many, etc.]

**Actions:**
[CRUD + custom actions]

**Policies:**
[Authorization rules]

**Code Example:**
[Complete Ash resource definition]

## Database Schema (SQL)
[Complete CREATE TABLE statements]

## Migrations
[ash_postgres.generate_migrations commands]

## Calculations & Aggregates
[For analytics, derived data]

## Testing Strategy
[Resource test examples]

## Common Pitfalls
[Ash-specific issues to avoid]
```

**Output:** Complete domain models guide

---

### Step 8: Create Feature-Specific Tracks (Track 4+)

For each major feature domain (Analytics, Settings, etc.):

**File:** `YYYYMMDD-0N-[name]-[feature]/README.md`

**Contents:**
```markdown
# Track N: [Feature Name]

## Overview
[What this track implements]

**Source:** `figma_src/[folder]/src/components/pages/[Feature].tsx`
**Dependencies:** Track 2 (UI), Track 3 (Domain)
**Estimated Time:** [Duration]

## [Feature-Specific Sections]
[Metrics to track, pages to build, integrations, etc.]

## Technical Implementation
[LiveView code, Ash resources, calculations]

## Testing
[Feature-specific tests]

## Resources
[Documentation links]
```

**Output:** Feature implementation guides

---

### Step 9: Create Coverage Analysis

**File:** `YYYYMMDD-00-[name]-project-overview/FIGMA-COVERAGE-ANALYSIS.md`

**Contents:**
```markdown
# Figma Source Coverage Analysis

**Date:** [YYYY-MM-DD]
**Figma Source:** `figma_src/[folder]/`
**Dev Task Prompts:** `dev_task-prompts_and_plans/[parent-folder]/`

## Executive Summary
[Coverage status, issues found, component coverage %]

## Figma Export Inventory

### Statistics
- Total TypeScript Files: [N]
- Page Components: [N] ([Total Lines])
- Reusable Components: [N]
- UI Library Components: [N]

### Pages Breakdown
| Page | Lines | Track Coverage | Status |
|------|-------|----------------|--------|
[Complete table]

### Reusable Components
| Component | Purpose | Track Coverage | Status |
|-----------|---------|----------------|--------|
[Complete table]

### UI Library Components
[List all library components with conversion plan]

## Dev Task Prompts Coverage Analysis

### Track-by-Track Coverage
[For each track:
- Folder name
- Figma references (with line numbers)
- Coverage status
- Issues found
]

## Gap Analysis

### Critical Gaps (Must Fix)
[List issues with priority, impact, fix]

### Minor Gaps (Nice to Have)
[List minor issues]

## Recommendations
[High/Medium/Low priority fixes]

## Traceability Matrix
| Figma Page | Lines | Dev Task Track | README Section | Status |
|------------|-------|----------------|----------------|--------|
[Complete mapping]

## Component Mapping Verification
[Verify all components are documented]

## Conclusion
[Overall assessment, issues summary, next steps]
```

**Output:** Complete coverage analysis

---

### Step 10: Create UI Layout & Roles Specification (if applicable)

**File:** `YYYYMMDD-00-[name]-project-overview/UI-LAYOUT-AND-ROLES.md`

**Contents:**
```markdown
# UI Layout & Role-Based Access Control

## Overview
[Shared layout requirements and RBAC specification]

## Shared Layout Architecture

### Header Component
[Description and code example]

### Sidebar Component
[Description and code example with role-based visibility]

### Layout Integration
[How pages use the shared layout]

## Role-Based Access Control (RBAC)

### Roles Definition
[List all roles with permissions]

### Database Schema
[user_roles table SQL]

### Ash Resources
[UserRole resource definition]

### Authorization Helpers
[Helper functions for role checks]

### LiveView Integration
[How to use roles in LiveView]

## UI Patterns

### Detail Views vs Modals
[Guidelines for when to use each]

### Responsive Design
[Mobile, tablet, desktop breakpoints]

### Dark Mode
[Theme support]
```

**Output:** UI layout and RBAC specification

---

### Step 11: Verify and Fix Gaps

**Actions:**

1. **Check Figma References:**
   - Grep for "figma_src" in all track READMEs
   - Ensure every track (except overview) references source files
   - Add missing references

2. **Verify Component Coverage:**
   - Cross-reference component inventory with track documentation
   - Ensure all pages are mapped to implementation tracks
   - Document components that are intentionally out of scope

3. **Fix Broken Links:**
   - Check all markdown links work
   - Remove references to non-existent files
   - Add references to created documentation files

4. **Validate Consistency:**
   - Track numbers match across all READMEs
   - MVP scope is consistent everywhere
   - Phase descriptions match across documents
   - Timeline estimates are consistent

**Output:** All gaps fixed, documentation complete

---

### Step 12: Create E2E Test Documentation for Each Track

**Goal:** Generate E2E test documentation aligned with each implementation track

**Actions:**

1. **Analyze Features by Track:**
   - Review all MVP tracks (1-5)
   - Extract user-facing features specific to each track
   - Identify test priorities per track
   - Map features to user roles

2. **Define Test Priorities per Track:**
   - **Track 1 (Dashboard Primary):** P1 Critical path tests
     - Authentication & authorization
     - Dashboard KPIs
     - Form creation/publishing/submission
     - Role-based access control
   - **Track 2 (LiveView UI):** P3 Layout/UI tests
     - Shared layout (header, sidebar)
     - Responsive design
     - Dark mode (if MVP)
     - Accessibility
   - **Track 3 (Domain Models):** P2 Features + P4 Regression
     - Forms CRUD operations
     - Form lifecycle
     - Submissions management
     - Validation rules
     - Edge cases
   - **Track 4 (Analytics):** P2 Features
     - Dashboard KPIs
     - Per-form analytics
     - Chart visualization
     - Date range filtering
   - **Track 5 (Settings):** P2 Features
     - Profile management
     - Notification preferences
     - Integration placeholders

3. **Create E2E-TESTS.md in Each Track Folder:**

   File: `YYYYMMDD-0N-[track-name]/E2E-TESTS.md`

   Contents for each track:
   - Track name and priority level
   - Test count estimate
   - Execution time
   - When to run (commit/nightly/weekly)
   - Test location (folder structure)
   - Test suites with examples
   - Page objects needed
   - Test data requirements
   - Success criteria
   - Related documentation links

4. **Track-Specific Content:**

   **Track 1 (E2E-TESTS.md):**
   - 12-15 critical path tests
   - 5-10 min execution
   - Run on every commit (blocking CI/CD)
   - Authentication, form creation, submission, RBAC tests

   **Track 2 (E2E-TESTS.md):**
   - 16-23 layout/UI tests
   - 10-15 min execution
   - Run weekly
   - Shared layout, responsive, accessibility tests

   **Track 3 (E2E-TESTS.md):**
   - 18-23 forms management tests
   - 12-18 min execution
   - Run nightly + pre-release
   - CRUD, lifecycle, validation, edge case tests

   **Track 4 (E2E-TESTS.md):**
   - 5-7 analytics tests
   - 5-8 min execution
   - Run nightly
   - KPI calculations, chart rendering tests

   **Track 5 (E2E-TESTS.md):**
   - 4-6 settings tests
   - 4-6 min execution
   - Run nightly
   - Profile, notifications, integrations tests

5. **Future Track Placeholders:**
   Create brief E2E-TESTS.md for future tracks noting:
   - Status: Coming Soon
   - E2E tests will be created when track moves to MVP
   - Placeholder behaviors tested in Settings track

6. **Test Examples in Each File:**
   - BDD format (Given/When/Then)
   - Code examples for key test scenarios
   - Page object usage patterns
   - Helper function examples
   - Test data setup

**Output:** E2E test documentation embedded in each track folder, aligned with track features

---

## Folder Structure Created

```
dev_task-prompts_and_plans/
└── YYYYMMDD-[name]/
    ├── YYYYMMDD-00-[name]-project-overview/
    │   ├── README.md
    │   ├── FIGMA-COVERAGE-ANALYSIS.md
    │   ├── ADDITIONAL-BLOCKING-QUESTIONS.md (if needed)
    │   ├── REVIEW-COMPLETE-SUMMARY.md (if needed)
    │   └── UI-LAYOUT-AND-ROLES.md (optional)
    ├── YYYYMMDD-01-[name]-primary/
    │   ├── 00-PRIMARY-OVERVIEW.md
    │   └── E2E-TESTS.md                    # ← P1 critical path tests
    ├── YYYYMMDD-02-[name]-liveview-ui/
    │   ├── README.md
    │   └── E2E-TESTS.md                    # ← P3 layout/UI tests
    ├── YYYYMMDD-03-[name]-domain-models/
    │   ├── README.md
    │   └── E2E-TESTS.md                    # ← P2 features + P4 regression
    ├── YYYYMMDD-04-[name]-[feature]/
    │   ├── README.md
    │   └── E2E-TESTS.md                    # ← P2 feature tests
    ├── YYYYMMDD-05-[name]-[feature]/
    │   ├── README.md
    │   └── E2E-TESTS.md                    # ← P2 feature tests
    └── YYYYMMDD-xx-[name]-future-[feature]/
        ├── README.md
        └── E2E-TESTS.md                    # ← Placeholder (Coming Soon)
```

## Templates

### Technology Conversion Matrix Template

```markdown
## Technology Conversion Reference

### Frontend
| React/Figma | Phoenix LiveView |
|-------------|------------------|
| React components | LiveView pages + components |
| TypeScript | Elixir |
| useState | socket assigns |
| useEffect | handle_info / handle_event |
| onClick | phx-click / handle_event |
| Props | function parameters / assigns |
| Conditional render | `<%= if ... do %>` |
| Map over array | `<%= for item <- items do %>` |
| Router navigation | push_navigate / push_patch |

### Styling
| React/Figma | Phoenix |
|-------------|---------|
| className="..." | class="..." |
| Tailwind v4 | Tailwind v3 |
| styled-components | Inline Tailwind classes |

### Icons
| [Icon Library] | Heroicons (Phoenix) |
|----------------|---------------------|
| <IconName /> | <.icon name="hero-[name]" /> |

### Forms
| React Pattern | LiveView Pattern |
|---------------|------------------|
| Controlled inputs | phx-change + phx-submit |
| Form libraries | Phoenix forms with changesets |
| Client validation | Server-side validation primary |

### Backend (New)
| Figma (static) | Phoenix Implementation |
|----------------|------------------------|
| No backend | Ash Framework 3.0+ |
| No database | PostgreSQL + AshPostgres |
| No auth | AshAuthentication 4.0+ |
| No real-time | Phoenix LiveView + PubSub |
```

### Database Schema Template

```sql
-- [Feature] Database Schema

-- [Table Name]
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Attributes
  [attribute_name] [type] [constraints],

  -- Relationships
  [relation]_id UUID REFERENCES [table](id) ON DELETE CASCADE,

  -- Metadata
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[table]_[column] ON [table]([column]);
```

### Phase Planning Template

```markdown
### Phase N: [Phase Name] (Week X-Y)
**Priority:** [Focus area]

**Tasks:**
- ✅ **[Category]:**
  - [Specific task 1]
  - [Specific task 2]
- ✅ **[Category]:**
  - [Specific task 1]

**Deliverables:**
- [What's complete at end of phase]
- [Measurable outcome]

**Success Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

## Best Practices

### Naming Conventions
- Use YYYYMMDD format for dates (today's date)
- Use kebab-case for folder names
- MVP tracks: `00-05` (or as many as needed)
- Future tracks: `xx-future-[feature]`
- Be descriptive but concise

### Documentation Structure
- Overview at top with source references
- Critical requirements early
- Code examples throughout
- Clear implementation order
- Testing strategies included
- Common pitfalls documented

### Figma References
- Always reference source files in each track
- Include line numbers where relevant
- Specify what's being extracted (field types, layouts, etc.)
- Reference actual TSX files, not just folders

### MVP Scoping
- Clearly separate MVP from Future
- Use ✅ for MVP, ⏸️ for Future
- Document "Coming Soon" placeholder patterns
- Explain why features are future scope

### Coverage Analysis
- List ALL components from Figma export
- Track which are documented, which aren't
- Calculate coverage percentages
- Provide traceability matrix
- Document intentional exclusions

## Common Patterns

### For Dashboard/Analytics Features
- KPI calculations using Ash aggregates
- Chart.js integration patterns
- Time-series data queries
- Caching strategies
- Background jobs for expensive calculations

### For Form Builder Features
- Drag-and-drop LiveView patterns
- Dynamic form field generation
- Field validation rules
- Form preview rendering
- Submission handling

### For Settings Features
- Tab navigation in LiveView
- Form changesets for settings
- Feature flags
- Integration placeholders

### For Calendar Features
- Availability calculation
- Time zone handling
- OAuth integration stubs
- "Coming Soon" placeholders

## Checklist

When using this skill to convert Figma source to dev prompts:

- [ ] Analyzed Figma export structure (file count, pages, components)
- [ ] Read package.json for dependencies
- [ ] Identified feature domains and groupings
- [ ] Determined MVP vs Future scope with user
- [ ] Defined implementation tracks (number and names)
- [ ] Created Track 0: Project Overview README
- [ ] Created Track 1: Primary Overview document
- [ ] Created Track 2: LiveView UI conversion guide
- [ ] Created Track 3: Domain Models guide
- [ ] Created Track 4+: Feature-specific guides
- [ ] Created future track folders (if applicable)
- [ ] Created coverage analysis document
- [ ] Created UI layout spec (if applicable)
- [ ] Created E2E test documentation for each track
  - [ ] Created E2E-TESTS.md in Track 1 (critical path tests)
  - [ ] Created E2E-TESTS.md in Track 2 (layout/UI tests)
  - [ ] Created E2E-TESTS.md in Track 3 (features + regression)
  - [ ] Created E2E-TESTS.md in Track 4 (analytics tests)
  - [ ] Created E2E-TESTS.md in Track 5 (settings tests)
  - [ ] Created E2E-TESTS.md placeholders in future tracks
- [ ] Added Figma references to all tracks
- [ ] Verified component coverage (no gaps)
- [ ] Fixed any broken documentation links
- [ ] Validated consistency across all READMEs
- [ ] Created traceability matrix
- [ ] Provided recommendations for fixes
- [ ] Organized all folders under parent directory

## Output Summary

Provide user with:

1. **Folder Structure:** Complete hierarchy created
2. **File Count:** Number of README/markdown files generated
3. **Component Coverage:** X% of Figma components documented
4. **Page Coverage:** X% of Figma pages mapped to tracks
5. **Track Count:** N MVP tracks + M future tracks
6. **MVP Timeline:** Total weeks estimated
7. **E2E Test Plan:** E2E-TESTS.md created in each track with:
   - Track-specific test documentation
   - ~X total tests across P1-P4 priorities
   - Execution times per track
   - Test priorities aligned with track features
8. **Issues Found:** List of gaps or inconsistencies
9. **Recommendations:** High/medium/low priority fixes
10. **Next Steps:** What to do before starting implementation

## Example Invocation

**Using the skill:**
```
User: "Convert the figma_src/205 Forms Dashboard folder to dev plans"
# Or invoke directly: /figma-to-dev-plans
```

**Workflow:**

Skill:
1. Analyzes figma_src/205 Forms Dashboard/
   - Finds 82 TSX files
   - 12 pages (7,634 total lines)
   - 21 reusable components
   - 49 shadcn/ui library components

2. Asks user:
   - "Which features are MVP priority?"
   - "Should Calendar and Chatbot be 'Coming Soon'?"

3. Creates structure:
   - dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/
   - 8 track folders (5 MVP + 2 Future + 1 Overview)
   - 11 markdown documentation files

4. Generates:
   - Project overview with navigation
   - Primary overview (executive summary)
   - LiveView UI conversion guide with E2E-TESTS.md
   - Domain models guide with E2E-TESTS.md
   - Analytics guide with E2E-TESTS.md
   - Settings guide with E2E-TESTS.md
   - Future Calendar guide with E2E-TESTS.md placeholder
   - Future Chatbot guide with E2E-TESTS.md placeholder
   - Coverage analysis document
   - UI layout & roles specification
   - E2E test documentation embedded in each track:
     - Track 1: P1 critical path tests (12-15 tests)
     - Track 2: P3 layout/UI tests (16-23 tests)
     - Track 3: P2 features + P4 regression (18-23 tests)
     - Track 4: P2 analytics tests (5-7 tests)
     - Track 5: P2 settings tests (4-6 tests)

5. Reports:
   - 95% component coverage
   - 83% page coverage (2 Contacts pages out of scope)
   - 5 MVP tracks over 6 weeks
   - E2E test plan: 5 track-specific E2E-TESTS.md files + 2 placeholders
   - 4 test priorities (P1-P4), ~55-75 tests total
   - Execution: 5-10 min (P1 critical), 40-60 min (all tests)
   - 1 medium-priority issue (missing figma_src references)
   - 4 low-priority issues
```

## Success Criteria

This skill is complete when:

1. ✅ Complete folder structure created with all tracks
2. ✅ All markdown documentation files generated
3. ✅ Every track (except overview) references figma_src
4. ✅ Coverage analysis shows no critical gaps
5. ✅ Technology conversion matrices included
6. ✅ Database schemas defined
7. ✅ Implementation phases planned
8. ✅ Testing strategies documented
9. ✅ E2E test documentation created in each track:
   - E2E-TESTS.md in all MVP tracks
   - Track-aligned test priorities
   - Test examples with code
   - Page object patterns
10. ✅ User understands next steps
11. ✅ Traceability matrix shows component mapping

## Integration with Development Workflow

The generated dev_task-prompts_and_plans serve as:

1. **Planning Reference** - Before writing code
2. **Implementation Guide** - During development
3. **Coverage Checklist** - Track what's implemented
4. **Onboarding Documentation** - For new developers
5. **Spec Source** - For creating BDD/DDD specs

**Next Step After Skill Completion:**
Use `/project_specs-generation` skill to create detailed BDD specs from the dev_task-prompts_and_plans.

## Related Skills

- **figma-import** - For live Figma imports via MCP (different from this skill - that one imports from Figma Desktop app)
- **project_specs-generation** - Generate BDD/DDD specs from dev_task-prompts_and_plans
- **playwright-basics** - Core Playwright concepts for implementing E2E tests
- **playwright-bdd-testing** - Writing BDD-style Playwright tests
- **playwright-helpers** - Helper functions and page objects for tests
- **ash-basics** - Understanding Ash resources when implementing
- **liveview-guidelines** - Phoenix LiveView patterns during implementation

---

**Skill Name:** `figma-to-dev-plans`
**Status:** ✅ Ready to use
**Version:** 2.0
**Created:** 2025-11-15
**Last Updated:** 2025-11-15
**Changelog:**
- v2.0: **BREAKING CHANGE** - E2E test documentation now embedded in each track folder (E2E-TESTS.md) instead of separate playwright_tests_plan/ folder
- v1.3: Updated Step 12 to create organized Playwright test plan folder
- v1.2: Added Step 12 (Playwright test plan generation)
- v1.1: Renamed from figma-src-to-dev-prompts, updated folder references
- v1.0: Initial creation
**Based on:** Forms Dashboard conversion (dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard)
**Output Folder:** Creates `dev_task-prompts_and_plans/YYYYMMDD-[name]/` structure
**Output Files:** 10-12 track markdown files, each with E2E-TESTS.md (5 MVP tracks + 2 future track placeholders)
```