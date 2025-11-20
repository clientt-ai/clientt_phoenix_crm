# MVP Review: Issues Found & Questions to Answer

**Date:** 2025-11-15
**Status:** 🔴 AWAITING ANSWERS - Do not proceed with spec creation until this is completed
**Purpose:** Review findings and scope clarifications needed before creating specs

---

## Instructions

1. Read through each section below
2. For each question, either:
   - ✅ Approve the recommendation by writing "APPROVED" or "YES"
   - ✏️ Provide your own answer/decision
   - ❓ Ask for clarification if needed
3. For each issue found, confirm the fix approach or suggest alternatives
4. Save this file when complete

---

## Part 1: Track README Inconsistencies

These issues were found in the track README files. They need to be fixed before creating specs.

### Track 2: LiveView UI (`20251115-02-forms-liveview-ui/README.md`)

**Issue 1: Calendar & Chatbot pages listed as implementation tasks**
- **Current:** Priority 2 includes "Calendar Integration Page" and "Chatbot Page" as if they need full implementation
- **Problem:** These are future features, not MVP
- **Proposed Fix:** Remove from implementation list. Add section on "Coming Soon" UI placeholders (disabled buttons, nav items with badges, settings cards)
- **Your Decision:** _______________________

**Issue 2: Team Calendar and other non-MVP pages included**
- **Current:** Priority 3 includes "Team Calendar Page", Priority 4 includes "Calendar Builder" and "Contacts" pages
- **Problem:** Not in MVP scope
- **Proposed Fix:** Remove these pages entirely from the track
- **Your Decision:** _______________________

**Issue 3: Missing guidance on placeholder UI**
- **Current:** No clear instructions on how to show "Coming Soon" for future features
- **Problem:** Developers won't know how to handle calendar/chatbot UI elements
- **Proposed Fix:** Add a dedicated section showing placeholder component examples (from the project overview README)
- **Your Decision:** _______________________

---

### Track 3: Domain Models (`20251115-03-forms-domain-models/README.md`)

**Issue 4: Calendar, Chatbot, Integrations domains listed as current work**
- **Current:** Sections 2-4 list Calendars, Integrations, and Chatbot domains as if they're part of this track
- **Problem:** These are future features
- **Proposed Fix:** Reorganize into two clear sections:
  - **MVP Resources:** Forms Domain only (Form, FormField, Submission)
  - **Future Resources:** Calendar, Chatbot, Integrations (reference only)
- **Your Decision:** _______________________

**Issue 5: Database schema includes non-MVP tables**
- **Current:** Full database schema with calendar_bookings, chatbot_conversations, etc.
- **Problem:** Might confuse developers about what to implement
- **Proposed Fix:** Split schema section:
  - **MVP Schema (Implement Now):** forms, form_fields, submissions tables only
  - **Future Schema (Reference Only):** All calendar/chatbot tables
- **Your Decision:** _______________________

**Issue 6: Incorrect track number reference**
- **Current:** References "Track 6" for Analytics
- **Problem:** Analytics is now Track 3 (MVP numbering) or Track 4 (folder numbering)
- **Proposed Fix:** Update to correct track number
- **Your Decision:** _______________________

---

### Track 4: Analytics (`20251115-04-forms-analytics-kpis/README.md`)

**Issue 7: Title says "Track 6" instead of current track number**
- **Current:** Title is "Track 6: Analytics & KPIs"
- **Problem:** Folder is `20251115-04`, and it's the 3rd MVP track
- **Proposed Fix:** Update title to "Track 3: Analytics & KPIs (MVP)" or "Track 4: Analytics & KPIs"
- **Your Decision:** _______________________

---

### Track 5: Settings (`20251115-05-forms-settings-integrations/README.md`)

**Issue 8: Title says "Track 7"**
- **Current:** Title is "Track 7: Settings & Integrations"
- **Problem:** Folder is `20251115-05`, and it's the 4th MVP track
- **Proposed Fix:** Update title to "Track 4: Settings & Configuration (MVP)" or "Track 5: Settings & Configuration"
- **Your Decision:** _______________________

**Issue 9: Dependencies include calendar integration logic**
- **Current:** Lists "Track 4 (Calendar integration logic)" as dependency
- **Problem:** Calendar is not in MVP
- **Proposed Fix:** Remove calendar from dependencies. Dependencies should be: Track 1 (LiveView UI), Track 2 (Domain Models)
- **Your Decision:** _______________________

**Issue 10: Full calendar/chatbot integration implementation described**
- **Current:** Sections describe building full OAuth flows, calendar provider connections, team availability UI
- **Problem:** These are future features
- **Proposed Fix:** Rewrite to focus on:
  - User Profile settings (use existing AshAuthentication)
  - Notification preferences (email alerts)
  - Integration placeholders (cards showing "Coming Soon" for calendar/chatbot)
  - Remove Team Calendar tab entirely
- **Your Decision:** _______________________

---

## Part 2: Scope Clarification Questions

Answer these questions to finalize the MVP scope before creating specs.

### Section A: Forms Scope (Tracks 1 & 2)

**Q1: Field types for MVP?**
- **Options:**
  - A) Basic 6 types only: text, email, textarea, select, checkbox, radio
  - B) Include advanced types: number, date, phone, URL, file upload
- **Recommendation:** Option A - Basic 6 types only. Add advanced types in Phase 3 if time permits.
- **Your Answer:** ✅ **CUSTOM: Option B excluding file upload**
- **Notes:** MVP will support 10 field types:
  - Basic: text, email, textarea, select, checkbox, radio
  - Advanced: number, date, phone, URL
  - Deferred: file upload (Phase 3+ due to storage/security requirements)

**Q2: Conditional logic?** (show field X if field Y = specific value)
- **Options:**
  - A) Include in MVP
  - B) Future phase only
- **Recommendation:** Option B - Future phase. Adds significant complexity to form builder UI and submission logic.
- **Your Answer:** ✅ **OPTION B - Future phase only**
- **Notes:** Defer to Phase 3 or post-MVP. Focus MVP on solid core form functionality first.

**Q3: Multi-page forms?**
- **Options:**
  - A) Include in MVP (forms can have multiple pages/steps)
  - B) Future phase only (single-page forms only for MVP)
- **Recommendation:** Option B - Single-page forms only for MVP. Multi-page adds complexity to builder and progress tracking.
- **Your Answer:** ✅ **OPTION B - Single-page forms only for MVP**
- **Notes:** Defer multi-page/step forms to Phase 3 or post-MVP. Single-page forms sufficient for most use cases.

**Q4: File upload support?**
- **Options:**
  - A) Include in MVP
  - B) Future phase only
- **Recommendation:** Option B - Future phase. Requires file storage setup (S3/R2), upload handling, security considerations.
- **Your Answer:** ✅ **OPTION B - Future phase only**
- **Notes:** Consistent with Q1 decision. Defer to Phase 3+ due to storage infrastructure, security, and cost requirements.

**Q5: Form duplication feature?**
- **Options:**
  - A) Include in MVP (basic "Duplicate Form" button that copies form + fields)
  - B) Future phase only
- **Recommendation:** Option A - Simple duplication is easy to implement and valuable for users.
- **Your Answer:** ✅ **OPTION A - Include in MVP**
- **Notes:** Simple Ash action to copy form + all fields. Enables form templates and reuse. High user value, minimal development time.

**Q6: Form validation?**
- **Options:**
  - A) Client-side only (JavaScript)
  - B) Server-side only (Ash validations)
  - C) Both client and server-side
- **Recommendation:** Option C - Both. Client-side for UX, server-side for security.
- **Your Answer:** ✅ **OPTION C - Both, with pragmatic approach**
- **Notes:**
  - **Server-side (ALWAYS):** All validation via Ash validations (security, source of truth)
  - **Client-side (SELECTIVE):** Only for simple, general validations:
    - Email format, phone format, number validation
    - Required fields, min/max length
    - Basic field type validation
  - **Custom/complex logic:** Server-side ONLY (avoid duplicating business logic)

**Q7: Validation rules?**
- **Options:**
  - A) Basic only (required, email format, min/max length)
  - B) Advanced (regex patterns, custom error messages, cross-field validation)
- **Recommendation:** Option A - Basic validation for MVP. Advanced rules can be added later.
- **Your Answer:** ✅ **OPTION A - Basic validation only**
- **Notes:** MVP supports: required, email/phone format, min/max length, min/max value. Defer custom regex, custom messages, and cross-field validation to Phase 3.

---

### Section B: Analytics Scope (Track 3)

**Q8: KPI calculation approach?**
- **Options:**
  - A) Real-time calculations on page load using Ash aggregates
  - B) Background jobs (Oban) that pre-calculate and cache results
  - C) Start with A, add B only if performance issues (>500ms load time)
- **Recommendation:** Option C - Start simple, optimize if needed.
- **Your Answer:** ✅ **OPTION C - Real-time with Ash aggregates, optimize if needed**
- **Notes:**
  - Use Ash aggregates (COUNT, etc.) for real-time calculation
  - Ensure optimized SQL queries with proper indexes (tenant_id, status, submitted_at)
  - Measure dashboard load time in testing
  - Add Oban background jobs + caching only if load time exceeds 500ms
  - Avoid premature optimization

**Q9: Caching layer (Cachex)?**
- **Options:**
  - A) Add immediately for all analytics queries
  - B) Add only if dashboard load time exceeds 500ms
  - C) Don't add for MVP
- **Recommendation:** Option B - Add only if needed. Avoid premature optimization.
- **Your Answer:** ✅ **OPTION C - Don't add for MVP**
- **Notes:** Skip Cachex for MVP. Focus on optimized SQL queries first (Q8). Add caching post-MVP only if performance testing shows it's needed.

**Q10: Data retention period?**
- **Options:**
  - A) Keep submissions forever
  - B) Keep for 1 year, then archive/delete
  - C) Configurable per user/form
- **Recommendation:** Option A for MVP - Keep forever. Add retention policies in future phase.
- **Your Answer:** ✅ **OPTION A - Keep submissions forever**
- **Notes:** No automatic deletion or archival for MVP. Preserves all historical data for analytics. Can add configurable retention policies post-MVP if storage becomes a concern.

**Q11: Export formats?**
- **Options:**
  - A) CSV only
  - B) CSV + Excel (XLSX)
  - C) CSV + Excel + PDF
- **Recommendation:** Option A - CSV only for MVP. Easy to implement, universally compatible.
- **Your Answer:** ✅ **OPTION A - CSV only**
- **Notes:** CSV format for MVP. Opens in Excel, Google Sheets, Numbers, etc. Simple implementation. Can add XLSX and PDF export in Phase 3 if requested.

**Q12: Export scope?**
- **Options:**
  - A) Export all submissions for a form (no filtering)
  - B) Export with filters (date range, status, etc.)
  - C) Export with pagination (select which submissions)
- **Recommendation:** Option A - Simple "Export All" for MVP.
- **Your Answer:** ✅ **OPTION B - Export with filters**
- **Notes:** Support filtering by:
  - Date range (submitted_at)
  - Lead status (new, contacted, qualified, etc.)
  - Deleted status (include/exclude deleted)
  - Export filtered results to CSV. More useful for forms with many submissions.

**Q13: Dashboard KPIs - must-have vs nice-to-have?**
- **Must-have (Phase 2):**
  - Total Forms
  - Total Submissions
  - Conversion Rate (submissions / views)
- **Nice-to-have (if time permits):**
  - Active Users (submitted in last 30 days)
  - Average completion time
  - Lead source tracking (UTM params)
  - Field completion analytics
- **Question:** Confirm must-have list, and priority for nice-to-haves?
- **Your Answer:** ✅ **Include ALL KPIs in MVP**
- **Notes:** MVP Dashboard will show:
  - **Must-have:** Total Forms, Total Submissions, Conversion Rate
  - **Nice-to-have (all included):**
    - Active Users (unique submitters in last 30 days)
    - Average Completion Time (calculated from form view to submission)
    - Lead Source Tracking (UTM parameters from metadata)
    - Field Completion Analytics (skip rate per field)
  - Comprehensive analytics from day 1

---

### Section C: Settings Scope (Track 4)

**Q14: User profile management?**
- **Options:**
  - A) Build custom profile edit page (name, email, password, avatar)
  - B) Use existing AshAuthentication system, add basic preferences only (timezone, notification settings)
  - C) Skip entirely for MVP (use account settings if they exist)
- **Recommendation:** Option B - Leverage existing auth system. Add lightweight preferences.
- **Your Answer:** ✅ **OPTION B - Use existing auth + add preferences**
- **Notes:**
  - Link to existing AshAuthentication account settings for password/email/profile
  - Add Forms-specific preferences in Settings page:
    - Timezone (for date/time display)
    - Notification preferences (Q15)
    - Default form settings (if applicable from Q17)
  - Don't duplicate existing auth functionality

**Q15: Email notifications for new submissions?**
- **Options:**
  - A) Send email immediately on submission (via Swoosh)
  - B) Daily digest email with all submissions
  - C) User can choose: immediate, daily, or off
  - D) Skip for MVP
- **Recommendation:** Option A or C - Immediate notifications are most valuable. Option C if time permits.
- **Your Answer:** ✅ **OPTION C - User can choose notification preference**
- **Notes:**
  - Add notification preferences to Settings page (Q14)
  - Options: Immediate, Daily Digest, Off
  - Per-user preference (stored in authz_user or user preferences table)
  - Default: Immediate (can be changed in settings)
  - Email sent via Swoosh when enabled

**Q16: Notification channels?**
- **Options:**
  - A) Email only
  - B) Email + in-app notifications
  - C) Email + in-app + Slack/webhook integrations
- **Recommendation:** Option A - Email only for MVP. Simplest to implement with existing Swoosh.
- **Your Answer:** ✅ **OPTION B - Email + in-app notifications**
- **Notes:**
  - **Email:** Via Swoosh (based on Q15 preferences)
  - **In-app:** Notification system with:
    - Notification bell icon in header
    - Unread count badge
    - Notification dropdown/panel
    - Mark as read functionality
  - Store notifications in database (notifications table)
  - Defer Slack/webhook integrations to Phase 3

**Q17: Form default settings?**
- **Options:**
  - A) Global defaults (apply to all new forms): branding colors, fonts, post-submission message
  - B) Per-form settings only (no global defaults)
- **Recommendation:** Option B - Per-form settings only. Global defaults add complexity.
- **Your Answer:** ✅ **OPTION B - Per-form settings only**
- **Notes:**
  - Each form configured individually (branding, colors, post-submission message, etc.)
  - Users can use form duplication (Q5) to create templates
  - Simpler implementation, more flexible
  - Can add global defaults in Phase 3 if users request it

**Q18: Integration placeholders in settings?**
- **Options:**
  - A) Show "Coming Soon" cards for Calendar and Chatbot integrations (with links to docs/roadmap)
  - B) Don't show anything about future integrations
- **Recommendation:** Option A - Helps users understand the roadmap.
- **Your Answer:** ✅ **OPTION A - Show "Coming Soon" cards**
- **Notes:**
  - Settings page includes "Integrations" section with:
    - Calendar Integration (Coming Soon badge)
    - Chatbot Integration (Coming Soon badge)
  - Cards show feature description and "Planned for Q2 2025" or similar
  - Optional: Link to roadmap or docs
  - Sets user expectations, shows product vision

---

### Section D: Technical Decisions

**Q19: Test coverage target?**
- **Options:**
  - A) 70% (pragmatic for MVP)
  - B) 80% (comprehensive)
  - C) 60% (minimal acceptable)
- **Recommendation:** Option A - 70% balances quality and speed.
- **Your Answer:** ✅ **OPTION A - 70% coverage (pragmatic for MVP)**
- **Notes:**
  - Target 70% test coverage across the codebase
  - Focus testing on critical paths:
    - Multi-tenancy data isolation (tenant_id filtering)
    - Form CRUD operations
    - Submission handling and immutability
    - Authorization policies (form roles, permissions)
    - Data validation (server-side)
  - Less critical for testing:
    - UI edge cases
    - Complex user workflows
    - Non-critical UX features
  - Realistic for 6-week MVP timeline
  - Balances quality assurance with development velocity

**Q20: Page load performance targets?**
- **Options:**
  - A) <500ms for all pages
  - B) <500ms for dashboard, <1s for form builder (more complex)
  - C) <1s for all pages
- **Recommendation:** Option B - Dashboard should be fast, form builder can be slightly slower.
- **Your Answer:** ✅ **OPTION C - <1s for all pages**
- **Notes:**
  - Target: All pages load in under 1 second
  - Simpler benchmark to track and measure
  - Allows flexibility for complex UIs (form builder, analytics)
  - Still provides good user experience
  - Focus on optimized SQL queries (indexes on tenant_id, status, submitted_at)
  - Monitor with Phoenix LiveDashboard in development
  - If any page consistently exceeds 1s, optimize that specific page

**Q21: Browser support?**
- **Options:**
  - A) Modern browsers only (last 2 versions of Chrome, Firefox, Safari, Edge)
  - B) Include IE11 support
  - C) Modern browsers + mobile Safari/Chrome (iOS/Android)
- **Recommendation:** Option C - Modern browsers + mobile. Skip IE11 (EOL'd).
- **Your Answer:** ✅ **OPTION C - Modern browsers + mobile**
- **Notes:**
  - **Desktop:** Last 2 versions of Chrome, Firefox, Safari, Edge
  - **Mobile:** Safari (iOS), Chrome (Android)
  - **No IE11 support** (EOL'd June 2022)
  - Phoenix LiveView works well on modern mobile browsers
  - Important for public form submissions (users may fill forms on mobile)
  - No polyfills needed, smaller bundle size
  - Test responsive design on mobile devices
  - Use modern CSS features (Grid, Flexbox, CSS variables)

**Q22: Track numbering convention?**
- **Options:**
  - A) Use folder numbers (Track 2, 3, 4, 5) - matches `20251115-0X` folder names
  - B) Use MVP sequence (Track 1, 2, 3, 4) - sequential MVP numbering
  - C) Use descriptive names only (no track numbers in titles)
- **Recommendation:** Option A - Consistency with folder structure.
- **Your Answer:** ✅ **OPTION A - Use folder numbers (Track 2, 3, 4, 5)**
- **Notes:**
  - Track 01: Project Overview (not an implementation track)
  - Track 02: Forms Dashboard - Primary (LiveView UI)
  - Track 03: Forms Domain Models
  - Track 04: Analytics & KPIs
  - Track 05: Settings & Configuration
  - Documentation uses "Track X" where X matches folder number
  - Easy to navigate: "Track 3" → `20251115-03-forms-domain-models/`
  - Update all track README titles to use this convention

**Q23: Dependencies to add immediately?**
- **Required:**
  - None (all needed dependencies already present: jason, swoosh, ash, ash_postgres, phoenix_live_view)
- **Optional (only if needed):**
  - Cachex (analytics caching)
  - Oban (background jobs)
- **Question:** Add optional dependencies immediately, or wait until performance issues appear?
- **Recommendation:** Wait until needed. Add Cachex/Oban only if dashboard >500ms.
- **Your Answer:** ✅ **OPTION C - Wait until performance issues appear**
- **Notes:**
  - **Do NOT add for MVP:** Cachex, Oban
  - Avoid premature optimization
  - Keep dependency footprint minimal
  - Add only when proven necessary:
    - **Cachex:** Only if dashboard load time exceeds 1s (Q20 target)
    - **Oban:** Only if background job processing becomes necessary
  - Immediate email sending via Swoosh is sufficient for MVP (Q15)
  - Consistent with Q8, Q9 decisions (optimize only if needed)
  - Can easily add dependencies post-MVP if performance testing shows need

---

## Part 3: Track README Update Plan

Once you've answered the questions above, I'll update the track READMEs with these changes:

### Track 2: LiveView UI
- [ ] Remove calendar/chatbot page implementations from Priority 2-4
- [ ] Add "Coming Soon Placeholders" section with code examples
- [ ] Update priorities to focus on: Dashboard, Forms, Form Builder, Analytics, Basic Settings
- [ ] Add clear note: "Calendar and Chatbot features show disabled UI with 'Coming Soon' badges"

### Track 3: Domain Models
- [ ] Reorganize into "MVP Resources" and "Future Resources" sections
- [ ] Split database schema into "MVP Schema" and "Future Schema"
- [ ] Remove calendar/chatbot from main implementation sections
- [ ] Update track number references
- [ ] Add clear warning: "Only implement Forms domain for MVP"

### Track 4: Analytics
- [ ] Update track number in title (based on Q22 answer)
- [ ] Confirm KPI priority based on Q13 answer
- [ ] Add notes about caching/background jobs (based on Q8-Q9 answers)

### Track 5: Settings
- [ ] Update track number in title (based on Q22 answer)
- [ ] Remove calendar integration from dependencies
- [ ] Rewrite to focus on: User Profile, Notifications, Form Defaults
- [ ] Add "Coming Soon Placeholders" section for integrations
- [ ] Remove Team Calendar tab
- [ ] Update based on Q14-Q18 answers

---

## Part 4: Next Steps After Completion

1. ✅ Review this document
2. ✅ Answer all questions (write your answers in the blanks above)
3. ✅ Approve or modify the proposed fixes for track issues
4. ✅ Save this file
5. ⏳ I will update all track READMEs based on your answers
6. ⏳ Create/update BDD specs for MVP features
7. ⏳ Ready to start implementation!

---

**Status:** 🔴 AWAITING YOUR ANSWERS
**Last Updated:** 2025-11-15
**File Location:** `dev_task-prompts_and_plans/20251115-00-project-overview/MVP-REVIEW-ISSUES-AND-QUESTIONS.md`
