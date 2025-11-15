# Additional Blocking Questions - CRITICAL REVIEW NEEDED

**Date:** 2025-11-15
**Status:** 🔴 CRITICAL - These questions MUST be answered before implementation
**Purpose:** Identify gaps in MVP-REVIEW-ISSUES-AND-QUESTIONS.md that could block implementation

---

## Overview

After cross-referencing:
- The existing `MVP-REVIEW-ISSUES-AND-QUESTIONS.md`
- The `UI-LAYOUT-AND-ROLES.md` specification
- The `FIGMA-COVERAGE-ANALYSIS.md` findings
- The existing `20251111-01-multitenancy` folder

I've identified **CRITICAL GAPS** that are not addressed in the current questions file. These must be resolved before specs can be created.

---

## 🚨 CRITICAL BLOCKING QUESTIONS (Must Answer Now)

### Q24: Multi-Tenancy / Organization Scoping ⚠️ MOST CRITICAL

**Context:**
- The project has a `dev_task_prompts/20251111-01-multitenancy/` folder with a complete multi-tenant spec
- That spec defines: Companies, Teams, User roles scoped to companies
- Current Forms database schema has `user_id` but NO `company_id` or `organization_id`
- User roles specification (UI-LAYOUT-AND-ROLES.md) doesn't mention company scoping

**Question:** Are Forms scoped to organizations/companies?

**Options:**
- **A) Yes - Forms belong to companies**
  - Forms table needs `company_id UUID REFERENCES companies(id)`
  - User roles are company-scoped (user is form_admin in Company A, not Company B)
  - Forms are only visible to users in the same company
  - Database policies enforce row-level security
  - Impacts: Database schema, Ash resources, policies, all LiveView pages

- **B) No - Forms are user-scoped only**
  - Forms belong to individual users (current schema)
  - User roles are global (form_admin can access all forms they create)
  - No company/organization isolation
  - Simpler implementation

- **C) Hybrid - Forms can be user-owned OR company-owned**
  - Forms table needs nullable `company_id`
  - User forms: `company_id = NULL`, visible only to creator
  - Company forms: `company_id = <id>`, visible to all users in company with proper role
  - Most flexible but most complex

**Impact if not answered:**
- ⛔ Cannot create correct database schema
- ⛔ Cannot write Ash resource policies
- ⛔ Cannot implement role-based access correctly
- ⛔ May need to rebuild database if wrong choice made

**Your Answer:** _______________________
**Notes:** _______________________

---

### Q25: User Role Assignment & Management

**Context:**
- UI-LAYOUT-AND-ROLES.md defines 4 roles: form_admin, form_viewer, lead_admin, lead_viewer
- Also mentions super_admin role
- No specification for HOW users get these roles

**Questions:**

**Q25a: Who can assign roles?**
- **Options:**
  - A) Only super_admin can assign all roles
  - B) Company admin can assign roles within their company
  - C) form_admin can grant form_viewer role (escalation prevention)
  - D) Self-service: Users can request roles, admin approves

**Your Answer:** _______________________

**Q25b: Role assignment UI - where does it live?**
- **Options:**
  - A) In Settings page (for MVP)
  - B) Separate admin panel (future)
  - C) No UI for MVP (assign via console/seeds)

**Your Answer:** _______________________

**Q25c: Default role for new users?**
- **Options:**
  - A) No roles by default (must be explicitly granted)
  - B) Everyone gets form_viewer by default
  - C) Configurable per company

**Your Answer:** _______________________

**Impact if not answered:**
- ⛔ Cannot create role assignment workflow
- ⛔ Cannot test the application (how do you become form_admin?)
- ⛔ Settings page scope unclear

---

### Q26: Form Status Workflow & Lifecycle

**Context:**
- Database schema shows `status VARCHAR(50) DEFAULT 'draft'`
- Comments suggest: draft, published, archived
- No specification of allowed transitions or permissions

**Questions:**

**Q26a: What statuses are allowed?**
- **Options:**
  - A) Draft, Published, Archived (as suggested)
  - B) Draft, Published only (no archiving for MVP)
  - C) Draft, Active, Paused, Archived (more granular)

**Your Answer:** _______________________

**Q26b: Can you unpublish a form?**
- **Options:**
  - A) Yes - Published → Draft (stops accepting submissions)
  - B) No - Published is permanent (must archive instead)
  - C) Yes - But only if no submissions exist

**Your Answer:** _______________________

**Q26c: Can archived forms be unarchived?**
- **Options:**
  - A) Yes - reversible operation
  - B) No - archiving is permanent

**Your Answer:** _______________________

**Q26d: What happens to existing submissions when form is archived?**
- **Options:**
  - A) Submissions remain viewable (read-only)
  - B) Submissions are hidden
  - C) Submissions are soft-deleted (can be recovered)

**Your Answer:** _______________________

**Impact if not answered:**
- ⛔ Cannot implement form management UI correctly
- ⛔ Cannot write proper Ash actions for status changes
- ⛔ User experience unclear (can I unpublish?)

---

### Q27: Submission Editing & Deletion

**Context:**
- No mention of whether submissions can be edited after submission
- No specification of who can delete submissions

**Questions:**

**Q27a: Can users edit their own submissions?**
- **Options:**
  - A) Yes - within time window (e.g., 1 hour after submission)
  - B) Yes - anytime before form is archived
  - C) No - submissions are immutable once submitted

**Recommendation:** Option C - Immutable submissions for data integrity
**Your Answer:** _______________________

**Q27b: Can lead_admin edit submissions?**
- **Options:**
  - A) Yes - can edit any field
  - B) Yes - can edit notes/tags only (not form data)
  - C) No - can only view

**Recommendation:** Option B - Add notes/tags for lead management without changing submission data
**Your Answer:** _______________________

**Q27c: Who can delete submissions?**
- **Options:**
  - A) lead_admin only
  - B) lead_admin + form_admin
  - C) No one (soft delete only, marked as deleted but retained)
  - D) super_admin only

**Recommendation:** Option C - Soft delete for audit trail
**Your Answer:** _______________________

**Impact if not answered:**
- ⛔ Cannot implement submission detail page correctly
- ⛔ Cannot write Ash policies for submissions
- ⛔ Potential data integrity issues

---

### Q28: Shared Layout Implementation Timing

**Context:**
- UI-LAYOUT-AND-ROLES.md specifies header + sidebar are required
- PRIMARY-OVERVIEW.md Phase 1 mentions layout but doesn't prioritize it clearly
- This affects all page implementations

**Question:** When must the shared layout be implemented?

**Options:**
- **A) Phase 1, Week 1 - Before any pages** ✅ RECOMMENDED
  - All pages built from start use consistent layout
  - No rework needed
  - RBAC built in from beginning

- **B) Phase 1, Week 2 - After first page works**
  - Build dashboard without layout first
  - Then refactor to add layout
  - More rework but validates approach faster

- **C) Phase 2 - After core features work**
  - Risk: Major refactoring mid-project
  - Not recommended

**Impact if not answered:**
- ⚠️ Developers may start building pages without layout
- ⚠️ Rework required if layout added later
- ⚠️ Inconsistent user experience during development

**Your Answer:** _______________________

---

## ⚠️ IMPORTANT QUESTIONS (Should Answer Now)

### Q29: Dark Mode Priority

**Context:**
- Listed in Phase 3 (Polish) in PRIMARY-OVERVIEW.md
- UI-LAYOUT-AND-ROLES.md shows dark mode toggle in header
- Tailwind CSS dark: classes are easy to add upfront

**Question:** Is dark mode must-have for MVP or nice-to-have?

**Options:**
- **A) Must-have for MVP** (Phase 1-2)
  - Implement dark mode classes from start
  - Toggle in header from day 1
  - Less rework

- **B) Nice-to-have** (Phase 3 if time permits)
  - Build light mode only initially
  - Add dark mode in polish phase
  - Potential rework

- **C) Post-MVP** (not in 6-week timeline)

**Recommendation:** Option A if using Tailwind (minimal extra effort to add `dark:` classes)

**Your Answer:** _______________________

---

### Q30: Form Builder Drag-and-Drop Implementation

**Context:**
- Figma shows drag-and-drop form builder (FormBuilderPage.tsx - 1,434 lines)
- No specification of how to implement in LiveView

**Question:** How should drag-and-drop be implemented?

**Options:**
- **A) JavaScript library + LiveView hooks**
  - Use SortableJS or similar via hooks
  - LiveView maintains state, JS handles drag UX
  - Standard approach for LiveView drag-drop

- **B) Pure LiveView** (phx-click to reorder)
  - No drag-drop, use up/down buttons
  - Simpler but less intuitive UX
  - Faster to implement

- **C) Custom JavaScript** (more control)
  - Write custom drag-drop in app.js
  - More work but fully customized

**Recommendation:** Option A - Use SortableJS with LiveView hooks (proven pattern)

**Your Answer:** _______________________

---

### Q31: Real-Time Submission Notifications

**Context:**
- Phoenix PubSub is available
- No specification of real-time features

**Question:** Should new submissions appear in real-time?

**Options:**
- **A) Yes - Use Phoenix PubSub**
  - Submissions broadcast to all users viewing form/dashboard
  - KPI cards update live
  - Modern UX

- **B) No - Manual refresh only**
  - Simpler implementation
  - Users click refresh to see new data

- **C) Polling** (refresh every 30s automatically)
  - Middle ground
  - No PubSub needed

**Recommendation:** Option A - PubSub is already available, adds great UX

**Your Answer:** _______________________

---

### Q32: Database Deletion Strategy

**Context:**
- No specification of soft vs hard deletes
- Audit trail implications

**Question:** Should records be soft-deleted or hard-deleted?

**Options:**
- **A) Soft delete everything** (add `deleted_at` timestamp)
  - Forms, FormFields, Submissions all soft-deleted
  - Can recover accidentally deleted data
  - Better for audit trails
  - Requires filtering `deleted_at IS NULL` in queries

- **B) Hard delete** (actual DELETE from database)
  - Simpler queries
  - No recovery possible
  - GDPR-friendly (data actually gone)

- **C) Hybrid**
  - Soft delete forms and submissions (valuable data)
  - Hard delete form fields (structural changes)

**Recommendation:** Option C - Hybrid approach

**Your Answer:** _______________________

---

### Q33: Form Versioning / Change Tracking

**Context:**
- Forms can be edited (fields added/removed/reordered)
- No specification of how to track changes
- Affects submission interpretation (if form structure changed)

**Question:** Should form structure changes be versioned?

**Options:**
- **A) Yes - Full versioning**
  - Create `form_versions` table
  - Each submission links to specific version
  - Can view historical form structure
  - Complex but robust

- **B) Yes - Snapshot approach**
  - Store form structure JSON in submissions table
  - Simpler than full versioning
  - Snapshot at submission time

- **C) No - Just track updated_at**
  - Submissions always interpreted with current form structure
  - Simplest but problematic if form changes significantly

- **D) Post-MVP** (don't implement for v1)

**Recommendation:** Option B or D - Snapshot if needed, otherwise post-MVP

**Your Answer:** _______________________

---

## 📋 ADDITIONAL CLARIFICATIONS NEEDED

### Q34: Forms Domain Name

**Context:**
- Track 3 suggests `lib/clientt_crm_app/forms.ex` as domain
- Should verify this doesn't conflict with existing domains

**Question:** Confirm domain name for Ash

**Your Answer (if different from "Forms"):** _______________________

---

### Q35: Authentication Flow for Form Submissions

**Context:**
- Forms can be submitted by external users (leads)
- Do submitters need to be authenticated?

**Question:** Are public form submissions allowed?

**Options:**
- **A) Yes - Public forms** (unauthenticated submissions)
  - Forms have public URL (slug-based)
  - Anyone can submit
  - No login required
  - Standard use case

- **B) No - Authenticated only**
  - Submitters must have user accounts
  - More secure but limits usage

**Recommendation:** Option A - Public submissions (standard form behavior)

**Your Answer:** _______________________

---

### Q36: Form Slug Generation

**Context:**
- Forms table has `slug VARCHAR(255) UNIQUE`
- Used for public URL: `/f/{slug}`

**Question:** How are slugs generated?

**Options:**
- **A) Auto-generated from form name** (e.g., "Contact Us" → "contact-us")
  - Handle conflicts by adding number: "contact-us-2"

- **B) User-specified** (editable in form settings)
  - More control but must validate uniqueness

- **C) Random** (UUIDs or short random strings)
  - Guaranteed unique but not SEO-friendly

**Recommendation:** Option A - Auto-generated with conflict resolution

**Your Answer:** _______________________

---

## 🔍 Cross-Reference Checklist

Verify these requirements from `UI-LAYOUT-AND-ROLES.md` are captured:

- [x] ✅ Shared header specification (captured in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ Shared sidebar specification (captured in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ 4 roles defined (form_admin, form_viewer, lead_admin, lead_viewer)
- [x] ✅ super_admin role (mentioned in UI-LAYOUT-AND-ROLES.md)
- [x] ✅ Role-based sidebar visibility (shown in code examples)
- [x] ✅ Detail views over modals preference (specified)
- [x] ✅ Mobile responsive requirement (mentioned)
- [ ] ❌ Role assignment workflow (Q25 - NOT in original questions)
- [ ] ❌ Company/org scoping (Q24 - NOT in original questions)
- [ ] ❌ Layout implementation timing (Q28 - NOT in original questions)

Verify these from `FIGMA-COVERAGE-ANALYSIS.md`:

- [x] ✅ All 12 pages inventoried
- [x] ✅ MVP vs Future separation
- [x] ✅ Component mapping
- [x] ✅ Technology conversion matrix
- [ ] ⚠️ Auth components (SignOutDialog, TwoFactorSetup) - Low priority, can use existing patterns
- [x] ✅ Contacts pages - Out of scope, documented as such

---

## 📊 Impact Assessment

### If Q24 (Multi-tenancy) is "Yes":

**Immediate Impacts:**
1. ⚠️ Database schema must change (add `company_id` to forms, form_fields, submissions)
2. ⚠️ UserRole resource needs company scoping
3. ⚠️ All Ash policies need company-level row-level security
4. ⚠️ LiveView pages need current_company context
5. ⚠️ Sidebar needs company switcher
6. ⚠️ Forms listing filtered by company
7. ⚠️ Analytics scoped to company

**Files Affected:**
- `00-PRIMARY-OVERVIEW.md` - Database schema
- `03-forms-domain-models/README.md` - All resources and policies
- `02-forms-liveview-ui/README.md` - All LiveView pages
- `UI-LAYOUT-AND-ROLES.md` - Sidebar, role definitions

**Estimated Rework:** 2-3 days if discovered after starting implementation

---

### If Q24 (Multi-tenancy) is "No":

**Immediate Impacts:**
1. ✅ Can proceed with current schema
2. ✅ Simpler policies (user-level only)
3. ⚠️ May need to add later (costly refactor)

**Recommendation:** Even if "No" for MVP, design schema to support adding `company_id` later (nullable column)

---

### If Q25 (Role Assignment) is "No UI for MVP":

**Immediate Impacts:**
1. ⚠️ Must create seed script to assign roles
2. ⚠️ Testing requires manual database updates
3. ⚠️ Settings page scope reduced

**Workaround:** Add simple role management to settings page (should take <1 day)

---

### If Q28 (Layout Timing) is "Phase 2" instead of "Phase 1":

**Immediate Impacts:**
1. ⚠️ Dashboard built without layout
2. ⚠️ Refactoring required when layout added
3. ⚠️ Inconsistent UX during development

**Recommendation:** Implement layout in Phase 1, Week 1 (before first pages)

---

## 🎯 Recommended Actions

### Immediate (Today):
1. ✅ Review this document
2. ✅ Answer Q24-Q28 (CRITICAL questions)
3. ✅ Update PRIMARY-OVERVIEW.md database schema if Q24 = "Yes"
4. ✅ Update UI-LAYOUT-AND-ROLES.md if company scoping needed

### Before Spec Creation:
1. ✅ Answer Q29-Q33 (IMPORTANT questions)
2. ✅ Update relevant track READMEs
3. ✅ Merge this file's answers into MVP-REVIEW-ISSUES-AND-QUESTIONS.md

### Before Implementation:
1. ✅ Confirm all 36 questions answered
2. ✅ Database schema finalized
3. ✅ Track READMEs updated
4. ✅ Everyone on team aligned

---

## 📝 Notes Section

**User Notes:**
[Space for user to write additional context, decisions, or concerns]

---

**Status:** 🔴 AWAITING CRITICAL ANSWERS
**Priority:** HIGHEST - Blocks all other work
**Reviewed By:** _______________________
**Date Reviewed:** _______________________
