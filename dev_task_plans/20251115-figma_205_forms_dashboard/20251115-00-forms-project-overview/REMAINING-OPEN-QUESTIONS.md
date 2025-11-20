# Remaining Open Questions - Forms Dashboard

**Date:** 2025-11-16
**Status:** 📋 For Review & Decision
**Priority:** Low to Medium (non-blocking for MVP start)

---

## Overview

All **CRITICAL blocking questions (Q24-Q28)** have been resolved. The remaining questions are scope/feature decisions and implementation details that can be decided during development or deferred to later phases.

**Total Remaining:** 31 questions
- **MVP Scope Questions:** 23 (Q1-Q23)
- **Implementation Details:** 8 (Q29-Q36)

---

## Categorization by Priority

### 🟢 LOW PRIORITY (Can be decided during implementation)

**These can use the recommendations as defaults and adjust if needed:**

- Q1-Q7: Forms feature scope (field types, validation, etc.)
- Q8-Q13: Analytics scope (KPIs, exports, caching)
- Q14-Q18: Settings scope (profile, notifications)
- Q19-Q23: Technical decisions (test coverage, performance, dependencies)
- Q29-Q33: Implementation approaches (dark mode, drag-drop, real-time, versioning)

### 🟡 MEDIUM PRIORITY (Should decide before starting those features)

**Recommended to decide before implementing specific features:**

- Q34: Forms domain name (decide before creating Ash domain)
- Q35: Public form submissions (decide before building submission endpoint)
- Q36: Slug generation strategy (decide before building form creation)

---

## Complete Question List with Recommendations

### Section A: Forms Feature Scope (Q1-Q7)

#### Q1: Field Types for MVP
**Recommendation:** Basic 6 types only (text, email, textarea, select, checkbox, radio)
- ✅ Easy to implement
- ✅ Covers 90% of use cases
- ⏳ Add advanced types (number, date, phone, URL, file) in Phase 3

**When to decide:** Before building form builder UI

---

#### Q2: Conditional Logic
**Recommendation:** Future phase only (skip for MVP)
- ❌ Adds significant complexity to builder UI
- ❌ Complex submission validation logic
- ⏳ Implement in Phase 3 or post-MVP

**When to decide:** Before designing form builder architecture

---

#### Q3: Multi-Page Forms
**Recommendation:** Single-page forms only for MVP
- ❌ Multi-page adds progress tracking complexity
- ❌ Requires step validation and navigation
- ⏳ Defer to post-MVP

**When to decide:** Before building form builder

---

#### Q4: File Upload Support
**Recommendation:** Future phase only
- ❌ Requires file storage setup (S3/R2/Cloudflare R2)
- ❌ Security considerations (virus scanning, size limits)
- ❌ Bandwidth/storage costs
- ⏳ Defer to Phase 3 or post-MVP

**When to decide:** Before finalizing form field types

---

#### Q5: Form Duplication Feature
**Recommendation:** Include in MVP ✅
- ✅ Easy to implement (copy form + fields)
- ✅ High user value
- ✅ Common use case (templates)

**Implementation:** Simple Ash action to clone form with all fields

**When to decide:** Before implementing forms list UI

---

#### Q6: Form Validation Strategy
**Recommendation:** Both client and server-side ✅
- ✅ Client-side: Better UX (immediate feedback)
- ✅ Server-side: Security (never trust client)
- ✅ Ash provides server-side validation out of the box

**Implementation:**
- Server: Ash validations
- Client: LiveView form validation helpers

**When to decide:** Architecture decision (should do this)

---

#### Q7: Validation Rules Complexity
**Recommendation:** Basic validation only for MVP
- ✅ Required, email format, min/max length
- ❌ Regex patterns, custom messages, cross-field validation (Phase 3)

**When to decide:** Before building form field configuration UI

---

### Section B: Analytics Scope (Q8-Q13)

#### Q8: KPI Calculation Approach
**Recommendation:** Real-time with Ash aggregates, optimize if needed
- ✅ Start simple: Calculate on page load
- ✅ Ash aggregates are optimized
- ⏳ Add caching/background jobs only if >500ms load time

**When to decide:** Before implementing analytics dashboard

---

#### Q9: Caching Layer (Cachex)
**Recommendation:** Add only if dashboard >500ms
- ❌ Avoid premature optimization
- ⏳ Measure first, optimize if needed

**When to decide:** After analytics MVP is working

---

#### Q10: Data Retention Period
**Recommendation:** Keep submissions forever (MVP)
- ✅ Simple (no cleanup jobs needed)
- ✅ Preserves all historical data
- ⏳ Add retention policies post-MVP if needed

**When to decide:** Before production launch (data storage planning)

---

#### Q11: Export Formats
**Recommendation:** CSV only for MVP
- ✅ Easy to implement
- ✅ Universally compatible (Excel, Google Sheets, etc.)
- ⏳ Add XLSX/PDF in Phase 3

**When to decide:** Before implementing export feature

---

#### Q12: Export Scope
**Recommendation:** Export all submissions (no filtering) for MVP
- ✅ Simplest implementation
- ⏳ Add filters (date range, status) in Phase 3

**When to decide:** Before implementing export feature

---

#### Q13: Dashboard KPIs Priority
**Recommendation from original:**
- **Must-have:** Total Forms, Total Submissions, Conversion Rate
- **Nice-to-have:** Active Users, Average completion time, Lead source tracking, Field completion analytics

**When to decide:** Before implementing analytics dashboard

**Suggested Decision:** Stick with must-have for MVP, add nice-to-haves in Phase 3

---

### Section C: Settings Scope (Q14-Q18)

#### Q14: User Profile Management
**Recommendation:** Use existing AshAuthentication + basic preferences
- ✅ Leverage existing auth system (don't rebuild)
- ✅ Add lightweight preferences (timezone, notification settings)
- ❌ Skip custom profile edit page

**When to decide:** Before implementing settings page

---

#### Q15: Email Notifications for Submissions
**Recommendation:** Immediate notifications (Option A or C)
- ✅ High user value
- ✅ Swoosh already configured
- **Option A:** Send immediately (simpler)
- **Option C:** User can choose (immediate/daily/off) - more flexible

**When to decide:** Before implementing submission handling

**Suggested:** Start with Option A, add preferences (Option C) in Phase 2 if time permits

---

#### Q16: Notification Channels
**Recommendation:** Email only for MVP
- ✅ Simplest (Swoosh already available)
- ⏳ Add in-app notifications in Phase 3
- ⏳ Add Slack/webhooks post-MVP

**When to decide:** Before implementing notifications

---

#### Q17: Form Default Settings
**Recommendation:** Per-form settings only (no global defaults)
- ✅ Simpler implementation
- ❌ Global defaults add complexity
- ⏳ Can add global defaults post-MVP if users request

**When to decide:** Before implementing form settings UI

---

#### Q18: Integration Placeholders in Settings
**Recommendation:** Show "Coming Soon" cards
- ✅ Helps users understand roadmap
- ✅ Sets expectations
- ✅ Easy to implement (static UI)

**When to decide:** Before implementing settings page

---

### Section D: Technical Decisions (Q19-Q23)

#### Q19: Test Coverage Target
**Recommendation:** 70% (pragmatic)
- ✅ Balances quality and speed
- ✅ Realistic for 6-week MVP

**When to decide:** Team decision (should agree on this)

---

#### Q20: Page Load Performance Targets
**Recommendation:** <500ms dashboard, <1s form builder
- ✅ Dashboard should be fast (simple queries)
- ✅ Form builder can be slightly slower (complex UI)

**When to decide:** Before implementation (for performance budgets)

---

#### Q21: Browser Support
**Recommendation:** Modern browsers + mobile (no IE11)
- ✅ Chrome, Firefox, Safari, Edge (last 2 versions)
- ✅ Mobile Safari/Chrome (iOS/Android)
- ❌ IE11 (EOL'd, not worth the effort)

**When to decide:** Before frontend development

---

#### Q22: Track Numbering Convention
**Recommendation:** Use folder numbers (Track 2, 3, 4, 5)
- ✅ Consistency with folder structure
- ✅ Easier to reference

**When to decide:** Before updating track documentation

**Note:** This is already in use, just needs confirmation

---

#### Q23: Optional Dependencies
**Recommendation:** Wait until needed
- ❌ Don't add Cachex or Oban upfront
- ✅ Add only if performance issues >500ms

**When to decide:** During performance testing

---

### Section E: Implementation Details (Q29-Q36)

#### Q29: Dark Mode Priority
**Recommendation:** Include from start if using Tailwind ✅
- ✅ Minimal extra effort (`dark:` classes)
- ✅ DaisyUI includes dark mode support
- ✅ Less rework than adding later

**When to decide:** Before starting UI implementation

**Suggested Decision:** Include dark mode from start (recommended)

---

#### Q30: Form Builder Drag-and-Drop
**Recommendation:** SortableJS + LiveView hooks
- ✅ Proven pattern for LiveView
- ✅ Great UX
- ✅ LiveView maintains state, JS handles drag

**Alternative:** Up/down buttons (simpler, less intuitive)

**When to decide:** Before implementing form builder

**Suggested Decision:** Use SortableJS (recommended approach)

---

#### Q31: Real-Time Submission Notifications
**Recommendation:** Use Phoenix PubSub ✅
- ✅ PubSub already available
- ✅ Modern UX (live updates)
- ✅ Not much extra work

**Alternative:** Manual refresh or polling

**When to decide:** Before implementing dashboard/submission views

**Suggested Decision:** Use PubSub (recommended for modern feel)

---

#### Q32: Database Deletion Strategy
**Recommendation:** Hybrid approach
- ✅ Soft delete forms and submissions (valuable data, audit trail)
- ✅ Hard delete form fields (structural changes)

**Note:** This was partially addressed in Q27 (submissions use soft delete)

**When to decide:** Before implementing delete actions

**Status:** Submissions already use soft delete (Q27). Need to decide for Forms.

---

#### Q33: Form Versioning / Change Tracking
**Recommendation:** Post-MVP or snapshot approach
- **Option B:** Store form structure snapshot in submissions (simpler)
- **Option D:** Don't implement for MVP (simplest)

**Problem:** If form changes significantly after submissions, historical submissions may be hard to interpret

**When to decide:** Before finalizing submission schema

**Suggested Decision:**
- **MVP:** Option D (skip versioning)
- **If needed:** Add form structure snapshot to submissions table later

---

#### Q34: Forms Domain Name
**Recommendation:** Use "Forms" (as planned)

**Question:** Does this conflict with existing domains?

**Check:** `lib/clientt_crm_app/` for existing domains

**When to decide:** Before creating Ash domain

**Action needed:** Quick verification

---

#### Q35: Public Form Submissions
**Recommendation:** Yes - public submissions ✅
- ✅ Standard form behavior
- ✅ Public URL: `/f/{slug}`
- ✅ No login required for submitters

**Alternative:** Authenticated only (limits use cases)

**When to decide:** Before implementing submission endpoint

**Suggested Decision:** Allow public submissions (recommended)

---

#### Q36: Form Slug Generation
**Recommendation:** Auto-generate from form name
- ✅ User-friendly URLs
- ✅ SEO-friendly
- ✅ Handle conflicts with numbers ("contact-us-2")

**Alternative:** Random slugs (ugly but guaranteed unique)

**When to decide:** Before implementing form creation

**Suggested Decision:** Auto-generate from name (recommended)

---

## Recommendations for Quick Decision-Making

### Option 1: Accept All Recommendations
Simply accept all the recommendations provided. They represent sensible defaults for an MVP.

**Pros:**
- ✅ Fastest path forward
- ✅ Can adjust later if needed
- ✅ Recommendations are well-reasoned

**Cons:**
- ⚠️ May not match your specific preferences

---

### Option 2: Decide High-Impact Questions Only
Focus on questions that significantly affect architecture:

**Must Decide Now:**
- Q6: Both client and server validation ✅
- Q19: 70% test coverage ✅
- Q20: Performance targets ✅
- Q21: Browser support ✅
- Q29: Dark mode from start ✅
- Q30: Drag-drop approach ✅
- Q31: Real-time with PubSub ✅
- Q34: Verify domain name ✅
- Q35: Public submissions ✅
- Q36: Slug generation ✅

**Can Decide Later:**
- All feature scope questions (Q1-Q5, Q7-Q18)
- Optimization questions (Q8-Q9, Q23)
- Q32-Q33 (deletion/versioning)

---

### Option 3: Defer All to Implementation Time
Start implementing with recommendations as defaults, adjust when you reach each feature.

**Pros:**
- ✅ Don't need to decide everything upfront
- ✅ Can make informed decisions with working code

**Cons:**
- ⚠️ May require some rework
- ⚠️ Architecture decisions harder to change later

---

## Suggested Action Plan

### Immediate (Today/This Week)

1. **Verify domain name (Q34):**
   ```bash
   ls -la lib/clientt_crm_app/*.ex
   # Check if "forms" conflicts with existing
   ```

2. **Accept architectural recommendations:**
   - Q6: Both validation ✅
   - Q19-Q21: Test coverage, performance, browsers ✅
   - Q29-Q31: Dark mode, drag-drop, real-time ✅
   - Q35-Q36: Public forms, slug generation ✅

3. **Document acceptance:**
   - Update ADDITIONAL-BLOCKING-QUESTIONS.md with Q29-Q36 answers
   - Update MVP-REVIEW-ISSUES-AND-QUESTIONS.md with Q1-Q23 answers
   - Or simply reference this document and the recommendations

---

### Before Each Feature (During Implementation)

**Before Form Builder:**
- Review Q1-Q7 (can stick with recommendations)

**Before Analytics:**
- Review Q8-Q13 (can stick with recommendations)

**Before Settings:**
- Review Q14-Q18 (can stick with recommendations)

**Before Optimization:**
- Review Q8-Q9, Q23, Q32-Q33 based on actual performance

---

## Status Summary

**CRITICAL Questions:** ✅ All resolved (Q24-Q28)

**Remaining Questions:** 31 (Q1-Q23, Q29-Q36)
- All have sensible recommendations
- None are blocking for starting implementation
- Can be decided incrementally

**Recommendation:** Accept all recommendations as defaults, adjust during implementation if needed.

---

## Files to Update (After Decisions)

If you want to formally document all decisions:

1. `ADDITIONAL-BLOCKING-QUESTIONS.md` - Add Q29-Q36 answers
2. `MVP-REVIEW-ISSUES-AND-QUESTIONS.md` - Add Q1-Q23 answers
3. Track READMEs - Update based on final scope decisions
4. `DECISIONS-SUMMARY-2025-11-16.md` - Append additional decisions

**Or:** Simply proceed with recommendations and document actual implementation choices as you go.

---

**Status:** 📋 READY FOR DECISION (or proceed with recommendations)
**Blocking Issues:** NONE
**Priority:** LOW to MEDIUM
**Last Updated:** 2025-11-16
