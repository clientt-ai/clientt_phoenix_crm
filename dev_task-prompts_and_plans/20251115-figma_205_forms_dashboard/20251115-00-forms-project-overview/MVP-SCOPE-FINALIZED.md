# MVP Scope Finalized - Forms Dashboard

**Date:** 2025-11-16
**Status:** ✅ APPROVED - Ready for implementation
**Based on:** MVP-REVIEW-ISSUES-AND-QUESTIONS.md (all questions answered)

---

## Summary

This document captures all finalized decisions for the Forms Dashboard MVP (Phase 2). All track READMEs have been updated to reflect this scope.

---

## 1. Forms Features (Tracks 2 & 3)

### Field Types (Q1)
**Decision:** ✅ **10 field types (Basic 6 + Advanced 4, NO file upload)**

**Included:**
- Basic: text, email, textarea, select, checkbox, radio
- Advanced: number, date, phone, URL

**Excluded from MVP:**
- File upload (Phase 3+ due to storage/security requirements)

### Conditional Logic (Q2)
**Decision:** ✅ **Future phase only**
- Defer to Phase 3 or post-MVP
- Adds significant complexity to form builder UI and submission logic

### Multi-Page Forms (Q3)
**Decision:** ✅ **Single-page forms only for MVP**
- No multi-page/step forms in MVP
- Sufficient for most use cases
- Defer to Phase 3

### File Upload Support (Q4)
**Decision:** ✅ **Future phase only**
- Defer to Phase 3+ (consistent with Q1)
- Requires storage infrastructure (S3/R2), security, cost considerations

### Form Duplication (Q5)
**Decision:** ✅ **Include in MVP**
- Simple "Duplicate Form" button that copies form + all fields
- Enables form templates and reuse
- High user value, minimal development time
- Implemented as simple Ash action

### Form Validation (Q6)
**Decision:** ✅ **Both client and server-side (pragmatic approach)**

**Server-side (ALWAYS):**
- All validation via Ash validations (security, source of truth)

**Client-side (SELECTIVE):**
- Only simple, general validations:
  - Email format, phone format, number validation
  - Required fields, min/max length
  - Basic field type validation
- Custom/complex logic: Server-side ONLY

### Validation Rules (Q7)
**Decision:** ✅ **Basic validation only**

**MVP supports:**
- Required
- Email/phone format
- Min/max length
- Min/max value

**Defer to Phase 3:**
- Custom regex patterns
- Custom error messages
- Cross-field validation

---

## 2. Analytics Features (Track 4)

### KPI Dashboard (Q13)
**Decision:** ✅ **Include ALL KPIs in MVP**

**Must-Have:**
- Total Forms
- Total Submissions
- Conversion Rate

**Nice-to-Have (ALL INCLUDED):**
- Active Users (unique submitters in last 30 days)
- Average Completion Time
- Lead Source Tracking (UTM parameters)
- Field Completion Analytics (skip rate per field)

**Result:** Comprehensive analytics from day 1

### KPI Calculation Approach (Q8)
**Decision:** ✅ **Real-time with Ash aggregates, optimize if needed**

**Implementation:**
- Use Ash aggregates (COUNT, etc.) for real-time calculation
- Ensure optimized SQL queries with proper indexes
- Measure dashboard load time in testing
- Add Oban background jobs + caching **only if** load time exceeds 500ms
- Avoid premature optimization

**Required Indexes:**
```sql
CREATE INDEX forms_company_id_index ON forms(company_id);
CREATE INDEX submissions_company_id_index ON submissions(company_id);
CREATE INDEX submissions_form_id_index ON submissions(form_id);
CREATE INDEX submissions_status_index ON submissions(status);
CREATE INDEX submissions_submitted_at_index ON submissions(submitted_at DESC);
```

### Caching Layer (Q9)
**Decision:** ✅ **Don't add for MVP**
- Skip Cachex for MVP
- Focus on optimized SQL queries first (Q8)
- Add caching post-MVP only if performance testing shows need

### Data Retention (Q10)
**Decision:** ✅ **Keep submissions forever**
- No automatic deletion or archival for MVP
- Preserves all historical data for analytics
- Can add configurable retention policies post-MVP if storage becomes concern

### Export Format (Q11)
**Decision:** ✅ **CSV only**
- CSV format for MVP
- Opens in Excel, Google Sheets, Numbers, etc.
- Simple implementation
- Can add XLSX and PDF export in Phase 3

### Export Scope (Q12)
**Decision:** ✅ **Export with filters**

**Filtering by:**
- Date range (submitted_at)
- Lead status (new, contacted, qualified, etc.)
- Deleted status (include/exclude deleted)

**Result:** More useful for forms with many submissions

---

## 3. Settings Features (Track 5)

### User Profile Management (Q14)
**Decision:** ✅ **Use existing auth + add preferences**

**Implementation:**
- Link to existing AshAuthentication account settings for password/email/profile
- Add Forms-specific preferences in Settings page:
  - Timezone (for date/time display)
  - Notification preferences (Q15)
- Don't duplicate existing auth functionality

### Email Notifications (Q15)
**Decision:** ✅ **User can choose notification preference**

**Options:**
- Immediate (default)
- Daily Digest
- Off

**Storage:**
- Per-user preference (stored in authz_user or user preferences table)
- Email sent via Swoosh when enabled

### Notification Channels (Q16)
**Decision:** ✅ **Email + in-app notifications**

**Email:**
- Via Swoosh (based on Q15 preferences)

**In-app:**
- Notification bell icon in header
- Unread count badge
- Notification dropdown/panel
- Mark as read functionality
- Store notifications in database (notifications table)

**Defer to Phase 3:**
- Slack/webhook integrations

### Form Default Settings (Q17)
**Decision:** ✅ **Per-form settings only**

**Implementation:**
- Each form configured individually (branding, colors, post-submission message, etc.)
- Users can use form duplication (Q5) to create templates
- Simpler implementation, more flexible
- Can add global defaults in Phase 3 if users request it

### Integration Placeholders (Q18)
**Decision:** ✅ **Show "Coming Soon" cards**

**Settings page includes "Integrations" section with:**
- Calendar Integration (Coming Soon badge)
- Chatbot Integration (Coming Soon badge)
- Cards show feature description and "Planned for Phase 3"
- Optional: Link to roadmap or docs
- Sets user expectations, shows product vision

---

## 4. Technical Decisions

### Test Coverage Target (Q19)
**Decision:** ✅ **70% coverage (pragmatic for MVP)**

**Focus testing on critical paths:**
- Multi-tenancy data isolation (company_id filtering)
- Form CRUD operations
- Submission handling and immutability
- Authorization policies (form roles, permissions)
- Data validation (server-side)

**Less critical for testing:**
- UI edge cases
- Complex user workflows
- Non-critical UX features

**Result:** Realistic for 6-week MVP timeline, balances quality assurance with development velocity

### Page Load Performance (Q20)
**Decision:** ✅ **<1s for all pages**

**Implementation:**
- Target: All pages load in under 1 second
- Simpler benchmark to track and measure
- Allows flexibility for complex UIs (form builder, analytics)
- Focus on optimized SQL queries (indexes on company_id, status, submitted_at)
- Monitor with Phoenix LiveDashboard in development
- If any page consistently exceeds 1s, optimize that specific page

### Browser Support (Q21)
**Decision:** ✅ **Modern browsers + mobile**

**Supported:**
- Desktop: Last 2 versions of Chrome, Firefox, Safari, Edge
- Mobile: Safari (iOS), Chrome (Android)

**Not Supported:**
- IE11 (EOL'd June 2022)

**Notes:**
- Phoenix LiveView works well on modern mobile browsers
- Important for public form submissions (users may fill forms on mobile)
- No polyfills needed, smaller bundle size
- Test responsive design on mobile devices
- Use modern CSS features (Grid, Flexbox, CSS variables)

### Track Numbering Convention (Q22)
**Decision:** ✅ **Use folder numbers (Track 2, 3, 4, 5)**

**Mapping:**
- Track 01: Project Overview (not an implementation track)
- Track 02: Forms Dashboard - Primary (LiveView UI)
- Track 03: Forms Domain Models
- Track 04: Analytics & KPIs
- Track 05: Settings & Configuration

**Result:** Documentation uses "Track X" where X matches folder number, easy to navigate

### Dependencies to Add (Q23)
**Decision:** ✅ **Wait until performance issues appear**

**Do NOT add for MVP:**
- Cachex
- Oban

**Only add when proven necessary:**
- **Cachex:** Only if dashboard load time exceeds 1s (Q20 target)
- **Oban:** Only if background job processing becomes necessary

**Immediate email sending via Swoosh is sufficient for MVP (Q15)**

**Result:** Keep dependency footprint minimal, can easily add post-MVP if performance testing shows need

---

## 5. What's NOT in MVP

### Excluded Features (Phase 3+)

**Calendar Integration:**
- Google/Outlook calendar sync
- Automated booking from forms
- Team availability management
- Calendar widget

**Chatbot:**
- AI chatbot widget
- Conversation tracking
- Demo booking via chatbot

**Advanced Form Features:**
- File upload
- Conditional logic
- Multi-page forms
- Custom regex validation
- Cross-field validation

**Advanced Export:**
- Excel (XLSX) export
- PDF export

**Advanced Notifications:**
- Slack/webhook integrations

**UI Features:**
- Team Calendar tab in Settings
- Full calendar/chatbot integration setup in Settings

---

## 6. Track README Updates Completed

All track READMEs have been updated to reflect the finalized MVP scope:

✅ **Track 2: LiveView UI** (`20251115-02-forms-liveview-ui/README.md`)
- Removed calendar/chatbot pages from implementation list
- Added "Coming Soon Placeholder Patterns" section with examples
- Updated file structure for MVP scope
- Added notes about disabled/placeholder UI

✅ **Track 3: Domain Models** (`20251115-03-forms-domain-models/README.md`)
- Reorganized into "MVP Resources" and "Future Resources" sections
- Split database schema into "MVP Schema" and "Future Schema"
- Added clear warnings about only implementing Forms domain for MVP
- Updated field types (10 types, no file upload)
- Added notes about multi-tenancy (company_id)

✅ **Track 4: Analytics** (`20251115-04-forms-analytics-kpis/README.md`)
- Fixed track number (from 6 to 4)
- Confirmed all KPIs included in MVP
- Added performance optimization notes (no Cachex/Oban unless needed)
- Updated dependencies (only Timex required, Cachex/Oban deferred)
- Added export format notes (CSV only with filters)

✅ **Track 5: Settings** (`20251115-05-forms-settings-integrations/README.md`)
- Fixed track number (from 7 to 5)
- Removed calendar from dependencies
- Rewrote to focus on: User Profile, Notifications, Integration Placeholders
- Removed Team Calendar tab
- Added Notification resource definition
- Added "Coming Soon" integration placeholders template
- Simplified testing to match MVP scope

---

## 7. Multi-Tenancy

**Critical for ALL tracks:**

All database tables must include:
```sql
company_id UUID NOT NULL
```

**Required indexes:**
```sql
CREATE INDEX [table]_company_id_index ON [table](company_id);
```

**Ash resource policies must filter by company_id for data isolation**

---

## 8. Implementation Timeline

**Total Time:** 6 weeks (MVP)

**Track 2 (LiveView UI):** 2 weeks
- Priority 1: Core pages (Week 1)
- Priority 2: Forms module pages (Week 1-2)
- Priority 3: Settings & configuration (Week 2)

**Track 3 (Domain Models):** 1 week
- Forms domain only (Form, FormField, Submission)
- Database migrations
- Tests

**Track 4 (Analytics):** 1 week
- All KPIs and analytics
- CSV export with filters
- Charts and visualizations

**Track 5 (Settings):** 3-4 days
- Profile tab (link to auth + preferences)
- Notifications tab (email + in-app)
- Integrations tab (placeholders only)

---

## 9. Next Steps

1. ✅ Review and approve MVP scope (COMPLETED)
2. ✅ Update all track READMEs (COMPLETED)
3. ⏳ Begin implementation starting with Track 3 (Domain Models)
4. ⏳ Parallel work on Track 2 (LiveView UI) after domain models
5. ⏳ Implement Track 4 (Analytics) after Track 2 & 3
6. ⏳ Implement Track 5 (Settings) toward end of MVP
7. ⏳ Testing and QA (70% coverage target)
8. ⏳ Performance testing (<1s page load target)
9. ⏳ Deploy MVP

---

**Status:** 🟢 APPROVED - All decisions finalized, ready to start implementation
**Last Updated:** 2025-11-16
**File Location:** `dev_task-prompts_and_plans/20251115-00-forms-project-overview/MVP-SCOPE-FINALIZED.md`
