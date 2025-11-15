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
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q2: Conditional logic?** (show field X if field Y = specific value)
- **Options:**
  - A) Include in MVP
  - B) Future phase only
- **Recommendation:** Option B - Future phase. Adds significant complexity to form builder UI and submission logic.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q3: Multi-page forms?**
- **Options:**
  - A) Include in MVP (forms can have multiple pages/steps)
  - B) Future phase only (single-page forms only for MVP)
- **Recommendation:** Option B - Single-page forms only for MVP. Multi-page adds complexity to builder and progress tracking.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q4: File upload support?**
- **Options:**
  - A) Include in MVP
  - B) Future phase only
- **Recommendation:** Option B - Future phase. Requires file storage setup (S3/R2), upload handling, security considerations.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q5: Form duplication feature?**
- **Options:**
  - A) Include in MVP (basic "Duplicate Form" button that copies form + fields)
  - B) Future phase only
- **Recommendation:** Option A - Simple duplication is easy to implement and valuable for users.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q6: Form validation?**
- **Options:**
  - A) Client-side only (JavaScript)
  - B) Server-side only (Ash validations)
  - C) Both client and server-side
- **Recommendation:** Option C - Both. Client-side for UX, server-side for security.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q7: Validation rules?**
- **Options:**
  - A) Basic only (required, email format, min/max length)
  - B) Advanced (regex patterns, custom error messages, cross-field validation)
- **Recommendation:** Option A - Basic validation for MVP. Advanced rules can be added later.
- **Your Answer:** _______________________
- **Notes:** _______________________

---

### Section B: Analytics Scope (Track 3)

**Q8: KPI calculation approach?**
- **Options:**
  - A) Real-time calculations on page load using Ash aggregates
  - B) Background jobs (Oban) that pre-calculate and cache results
  - C) Start with A, add B only if performance issues (>500ms load time)
- **Recommendation:** Option C - Start simple, optimize if needed.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q9: Caching layer (Cachex)?**
- **Options:**
  - A) Add immediately for all analytics queries
  - B) Add only if dashboard load time exceeds 500ms
  - C) Don't add for MVP
- **Recommendation:** Option B - Add only if needed. Avoid premature optimization.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q10: Data retention period?**
- **Options:**
  - A) Keep submissions forever
  - B) Keep for 1 year, then archive/delete
  - C) Configurable per user/form
- **Recommendation:** Option A for MVP - Keep forever. Add retention policies in future phase.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q11: Export formats?**
- **Options:**
  - A) CSV only
  - B) CSV + Excel (XLSX)
  - C) CSV + Excel + PDF
- **Recommendation:** Option A - CSV only for MVP. Easy to implement, universally compatible.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q12: Export scope?**
- **Options:**
  - A) Export all submissions for a form (no filtering)
  - B) Export with filters (date range, status, etc.)
  - C) Export with pagination (select which submissions)
- **Recommendation:** Option A - Simple "Export All" for MVP.
- **Your Answer:** _______________________
- **Notes:** _______________________

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
- **Your Answer:** _______________________
- **Notes:** _______________________

---

### Section C: Settings Scope (Track 4)

**Q14: User profile management?**
- **Options:**
  - A) Build custom profile edit page (name, email, password, avatar)
  - B) Use existing AshAuthentication system, add basic preferences only (timezone, notification settings)
  - C) Skip entirely for MVP (use account settings if they exist)
- **Recommendation:** Option B - Leverage existing auth system. Add lightweight preferences.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q15: Email notifications for new submissions?**
- **Options:**
  - A) Send email immediately on submission (via Swoosh)
  - B) Daily digest email with all submissions
  - C) User can choose: immediate, daily, or off
  - D) Skip for MVP
- **Recommendation:** Option A or C - Immediate notifications are most valuable. Option C if time permits.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q16: Notification channels?**
- **Options:**
  - A) Email only
  - B) Email + in-app notifications
  - C) Email + in-app + Slack/webhook integrations
- **Recommendation:** Option A - Email only for MVP. Simplest to implement with existing Swoosh.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q17: Form default settings?**
- **Options:**
  - A) Global defaults (apply to all new forms): branding colors, fonts, post-submission message
  - B) Per-form settings only (no global defaults)
- **Recommendation:** Option B - Per-form settings only. Global defaults add complexity.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q18: Integration placeholders in settings?**
- **Options:**
  - A) Show "Coming Soon" cards for Calendar and Chatbot integrations (with links to docs/roadmap)
  - B) Don't show anything about future integrations
- **Recommendation:** Option A - Helps users understand the roadmap.
- **Your Answer:** _______________________
- **Notes:** _______________________

---

### Section D: Technical Decisions

**Q19: Test coverage target?**
- **Options:**
  - A) 70% (pragmatic for MVP)
  - B) 80% (comprehensive)
  - C) 60% (minimal acceptable)
- **Recommendation:** Option A - 70% balances quality and speed.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q20: Page load performance targets?**
- **Options:**
  - A) <500ms for all pages
  - B) <500ms for dashboard, <1s for form builder (more complex)
  - C) <1s for all pages
- **Recommendation:** Option B - Dashboard should be fast, form builder can be slightly slower.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q21: Browser support?**
- **Options:**
  - A) Modern browsers only (last 2 versions of Chrome, Firefox, Safari, Edge)
  - B) Include IE11 support
  - C) Modern browsers + mobile Safari/Chrome (iOS/Android)
- **Recommendation:** Option C - Modern browsers + mobile. Skip IE11 (EOL'd).
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q22: Track numbering convention?**
- **Options:**
  - A) Use folder numbers (Track 2, 3, 4, 5) - matches `20251115-0X` folder names
  - B) Use MVP sequence (Track 1, 2, 3, 4) - sequential MVP numbering
  - C) Use descriptive names only (no track numbers in titles)
- **Recommendation:** Option A - Consistency with folder structure.
- **Your Answer:** _______________________
- **Notes:** _______________________

**Q23: Dependencies to add immediately?**
- **Required:**
  - None (all needed dependencies already present: jason, swoosh, ash, ash_postgres, phoenix_live_view)
- **Optional (only if needed):**
  - Cachex (analytics caching)
  - Oban (background jobs)
- **Question:** Add optional dependencies immediately, or wait until performance issues appear?
- **Recommendation:** Wait until needed. Add Cachex/Oban only if dashboard >500ms.
- **Your Answer:** _______________________
- **Notes:** _______________________

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
**File Location:** `dev_task_prompts/20251115-00-project-overview/MVP-REVIEW-ISSUES-AND-QUESTIONS.md`
