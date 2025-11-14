# Forms Builder Module - Open Issues & Questions

**Date**: 2025-11-14
**Status**: Awaiting Review & Decisions
**Priority**: High - Blocks full implementation

---

## Critical Issues

### Issue #1: Incomplete Specification Set
**Priority**: 🔴 Critical
**Status**: Open
**Blocking**: Implementation

**Problem**:
Only 4 of 55 specification files (7.3%) have been created. The remaining 51 files are required before implementation can begin.

**Files Needed**:
- 14 Forms domain files (resources, features, policies)
- 11 Integrations domain files
- 3 Cross-domain integration specs
- 19 UI design specs (components, patterns, screens)

**Impact**:
- Cannot implement Ash resources without complete resource specs
- Cannot write tests without BDD feature specs
- Cannot build UI without screen/component specs
- Integration developers lack clear contracts

**Recommendation**:
Continue specification generation following the manifest in [SPEC_FILES_MANIFEST.md](./SPEC_FILES_MANIFEST.md).

**Effort Estimate**: 65 hours remaining

---

### Issue #2: React vs Phoenix LiveView Component Mapping
**Priority**: 🟠 High
**Status**: Open
**Blocking**: UI implementation

**Problem**:
The Figma source uses React + shadcn/ui components, but the target stack is Phoenix LiveView + DaisyUI. Component mapping needs validation.

**Known Mappings**:
| Figma/React Component | Target Phoenix Component | Status | Notes |
|-----------------------|--------------------------|--------|-------|
| shadcn/ui Button | DaisyUI btn | ✅ Clear | Direct mapping |
| shadcn/ui Card | DaisyUI card | ✅ Clear | Direct mapping |
| shadcn/ui Dialog | DaisyUI modal | ✅ Clear | Direct mapping |
| shadcn/ui Select | DaisyUI select | ✅ Clear | Direct mapping |
| shadcn/ui Calendar | Custom LiveView | ⚠️ Unclear | No DaisyUI equivalent |
| React hooks (useState) | LiveView assigns | ✅ Clear | Different paradigm |
| Chatbot widget | Custom LiveView | ⚠️ Unclear | Complex state management |
| Form builder drag-drop | LiveView + JS Hooks | ⚠️ Unclear | Requires JS interop |

**Questions**:
1. **Calendar Widget**: Should we use a third-party JS library (e.g., Flatpickr) or build custom?
2. **Drag-Drop Builder**: Best approach for drag-drop in LiveView? (SortableJS + hooks?)
3. **Chatbot State**: How to manage conversation state in LiveView?
4. **Real-Time Updates**: Should form builder use LiveView streams for real-time collaboration?

**Recommendation**:
- Create UI component specs that document DaisyUI + LiveView implementation approach
- Prototype complex components (calendar, drag-drop) before full implementation
- Consider Phoenix LiveView best practices for real-time features

---

### Issue #3: OAuth Implementation Strategy
**Priority**: 🟠 High
**Status**: Open
**Blocking**: Calendar integration

**Problem**:
OAuth flows for Google Calendar and Microsoft Outlook need implementation details clarified.

**Questions**:

**1. OAuth Library Choice**:
- Use existing Elixir OAuth libraries (e.g., `oauth2`, `assent`)?
- Build custom OAuth client?
- Recommendation: ?

**2. Token Storage**:
- Where to encrypt tokens? (Ash changes, database trigger, application layer?)
- Which encryption library? (`cloak_ecto`, custom?)
- Key management strategy?
- Recommendation: ?

**3. Token Refresh**:
- Background job frequency? (Currently: every 5 minutes)
- Use Oban, Quantum, or custom GenServer?
- How to handle refresh failures?
- Recommendation: ?

**4. OAuth Callback Handling**:
- Controller or LiveView for OAuth callbacks?
- How to return user to original page after OAuth flow?
- State parameter generation and validation strategy?
- Recommendation: ?

**5. PKCE Implementation**:
- Enforce PKCE for Google and Microsoft?
- Where to store code_verifier during OAuth flow?
- Session, database, or Phoenix.Token?
- Recommendation: ?

**Impact**:
- Calendar bookings cannot be created without OAuth
- Security vulnerabilities if implemented incorrectly
- User experience affected by OAuth flow design

---

### Issue #4: Real AI vs Scripted Chatbot Responses
**Priority**: 🟡 Medium
**Status**: Open
**Blocking**: Chatbot implementation

**Problem**:
Figma source shows scripted chatbot responses. Need to decide on AI integration strategy.

**Options**:

**Option A: Scripted Responses (MVP)**
- Pros: Faster to implement, no external API costs, predictable behavior
- Cons: Limited flexibility, requires manual response creation
- Effort: Low

**Option B: Rule-Based AI (Pattern Matching)**
- Pros: More flexible than scripts, still controllable, no external API
- Cons: Requires building rule engine, harder to maintain
- Effort: Medium

**Option C: External AI API (OpenAI, Claude)**
- Pros: Natural conversations, learns from context, minimal prompt engineering
- Cons: API costs, latency, requires prompt tuning, content moderation
- Effort: Medium

**Option D: Hybrid Approach**
- Pros: Scripted for common flows (pricing, features), AI for open questions
- Cons: More complex, need to decide routing logic
- Effort: High

**Questions**:
1. What's the budget for AI API calls?
2. Do we need conversation history analysis?
3. Is there a preference for a specific AI provider?
4. Should chatbot responses be multilingual?

**Recommendation**: Start with Option A (scripted) for MVP, plan for Option D (hybrid) in future.

---

### Issue #5: Form Builder Drag-Drop UX
**Priority**: 🟡 Medium
**Status**: Open
**Blocking**: Form builder UI

**Problem**:
Drag-drop form builders are complex in LiveView. Need to decide on implementation approach.

**Approaches**:

**Approach A: JavaScript Library + LiveView Hooks**
- Library: SortableJS, DragDropTouch
- LiveView receives drop events via `phx-hook`
- Pros: Rich UX, well-tested libraries
- Cons: More JS, potential sync issues

**Approach B: Pure LiveView with LiveView JS**
- Use `Phoenix.LiveView.JS` commands
- Handle drag/drop with CSS and LiveView events
- Pros: Minimal JS, stays in LiveView paradigm
- Cons: More limited UX, requires more LiveView code

**Approach C: LiveView Streams + Optimistic UI**
- Use LiveView streams for field list
- Optimistic updates on drag
- Pros: Fast perceived performance
- Cons: Complex state management

**Questions**:
1. Do we need live collaboration on form building (multiple users)?
2. Should form builder work offline?
3. Mobile support required for form builder?
4. Undo/redo functionality needed?

**Recommendation**: Approach A with SortableJS for desktop, simplified mobile experience.

---

## Domain Modeling Questions

### Question #1: Form Versioning
**Priority**: 🟡 Medium
**Status**: Open

**Question**: Should forms support versioning when edited after publishing?

**Context**:
- Published forms may need updates
- Existing submissions reference form structure
- Need to track what version of form was submitted

**Options**:
1. **No Versioning** (Current spec): Forms are immutable after first submission
2. **Simple Versioning**: Track version number, keep historical schemas
3. **Full Version Control**: Git-like branching, rollback, compare

**Impact**:
- Database schema complexity
- Form submission validation logic
- Analytics reporting accuracy

**Recommendation**: Start with Option 1, add versioning if needed.

---

### Question #2: Multi-Page Forms
**Priority**: 🟡 Medium
**Status**: Open

**Question**: Should forms support multiple pages/steps?

**Context**:
- Long forms benefit from pagination
- Reduces form abandonment
- Adds complexity to builder and submission logic

**Current Spec**: Single-page forms only

**If Yes, Need to Define**:
- How to represent pages in FormField model?
- Save progress between pages?
- Conditional page visibility?
- Page navigation controls?

**Recommendation**: Start with single-page, add multi-page in Phase 2.

---

### Question #3: Conditional Field Logic
**Priority**: 🟡 Medium
**Status**: Open

**Question**: Should fields support conditional visibility (show/hide based on other field values)?

**Context**:
- Common form builder feature
- Improves UX by hiding irrelevant fields
- Adds complexity to validation and rendering

**Examples**:
- "Show 'Company Name' if 'Are you a business?' is 'Yes'"
- "Show 'Other' text field if dropdown selection is 'Other'"

**If Yes, Need to Define**:
- How to model conditions in FormField?
- Validation logic with conditional fields?
- Frontend rendering strategy?
- Submission data structure?

**Recommendation**: Not required for MVP, add in Phase 2 if needed.

---

### Question #4: Team Calendar Shared Availability
**Priority**: 🟠 High
**Status**: Open

**Question**: Should calendar bookings support team member selection and round-robin assignment?

**Context**:
- Figma shows "Team Members Management" in calendar settings
- Multiple sales reps may share booking calendar
- Need fair distribution of leads

**Options**:
1. **Single Calendar**: All bookings go to one calendar (current spec)
2. **Team Selection**: Customer chooses team member
3. **Round-Robin**: Automatic assignment to lowest-load rep
4. **AI Assignment**: Assign based on lead fit

**If Yes, Need to Define**:
- TeamMember resource?
- Availability aggregation logic?
- Booking assignment algorithm?
- Team member preferences?

**Recommendation**: Start with Option 1, plan for Option 3 (round-robin) in Phase 2.

---

### Question #5: Lead Deduplication Strategy
**Priority**: 🟠 High
**Status**: Open

**Question**: How should we handle duplicate leads?

**Context**:
- Same person may submit multiple forms
- Same email may appear in form + chatbot
- Current spec: 30-day window for deduplication

**Options**:
1. **No Deduplication**: Every submission creates new lead
2. **Email-Based**: Merge leads with same email within 30 days
3. **Smart Matching**: Use email + name + company
4. **User-Controlled**: Show duplicates, let user merge

**If Email-Based, Need to Define**:
- Which lead data takes precedence?
- How to merge conversation history?
- How to handle changed data (email typo correction)?
- Archive old leads or keep both?

**Recommendation**: Option 2 (email-based) for MVP, with manual merge tools.

---

## Integration Questions

### Question #6: Calendar Availability Caching
**Priority**: 🟡 Medium
**Status**: Open

**Question**: How long should calendar availability be cached?

**Context**:
- Frequent availability checks to external APIs
- Google/Microsoft rate limits
- Need real-time accuracy

**Current Spec**: 5-minute TTL

**Tradeoffs**:
- **Shorter TTL** (1-2 min): More accurate, higher API usage
- **Current TTL** (5 min): Balanced approach
- **Longer TTL** (15-30 min): Lower API usage, stale data risk

**Questions**:
1. What's acceptable staleness for availability?
2. How to handle cache invalidation on booking creation?
3. Should cache TTL be configurable per company?

**Recommendation**: Keep 5-minute TTL, add cache invalidation on booking.

---

### Question #7: External Calendar Event Ownership
**Priority**: 🟠 High
**Status**: Open

**Question**: Whose calendar should events be created on?

**Context**:
- Company connects calendar (e.g., sales@company.com)
- Multiple users may schedule bookings
- Events created on connected calendar

**Options**:
1. **Company Calendar**: All events on connected calendar (current spec)
2. **Per-User Calendars**: Each user connects their own calendar
3. **Delegated Calendars**: Create on team member's calendar

**Impact**:
- OAuth flow complexity
- Multi-calendar synchronization
- Booking assignment logic

**Recommendation**: Option 1 for MVP, Option 3 for team features.

---

### Question #8: Booking Cancellation Handling
**Priority**: 🟡 Medium
**Status**: Open

**Question**: Should external calendar events be deleted or just marked cancelled?

**Context**:
- When booking is cancelled, need to update external calendar
- Google/Microsoft support event deletion or status update

**Options**:
1. **Delete Event**: Remove from calendar entirely
2. **Mark Cancelled**: Keep event but update status to "cancelled"
3. **User Choice**: Let company configure preference

**Tradeoffs**:
- **Delete**: Cleaner calendar, lose history
- **Mark Cancelled**: Audit trail, cluttered calendar

**Recommendation**: Option 1 (delete) by default, Option 3 (configurable) later.

---

## UI/UX Questions

### Question #9: Mobile Form Builder Support
**Priority**: 🟡 Medium
**Status**: Open

**Question**: Should the form builder work on mobile devices?

**Context**:
- Drag-drop is challenging on mobile
- Figma designs appear desktop-focused
- Users may want to edit on-the-go

**Options**:
1. **Desktop Only**: Require desktop/tablet for form building
2. **Simplified Mobile**: Basic editing, no drag-drop
3. **Full Mobile**: Touch-optimized drag-drop

**Questions**:
1. What percentage of users will build forms on mobile?
2. Is viewing submissions on mobile sufficient?

**Recommendation**: Option 1 for MVP, Option 2 for future.

---

### Question #10: Dashboard Module Activation
**Priority**: 🟡 Medium
**Status**: Open

**Question**: How should modules be activated/deactivated?

**Context**:
- Figma shows "Coming Soon" badges for CRM, CPQ, Billing, Support
- Need admin UI to activate modules
- May require feature flags or subscription tiers

**Questions**:
1. Are modules activated per company or globally?
2. Should activation be tied to subscription plans?
3. Who can activate modules (admin only)?
4. Should inactive modules be hidden or show "upgrade" prompts?

**Recommendation**: Define module activation in Authorization domain.

---

## Technical Debt & Concerns

### Concern #1: Performance at Scale
**Status**: Open
**Priority**: 🟡 Medium

**Concerns**:
- **Form Submissions**: High write volume - how to handle 1000+ submissions/hour?
- **Chatbot Conversations**: Many concurrent WebSocket connections?
- **Calendar Availability**: API rate limits with many users?
- **Real-Time Form Building**: LiveView scalability with live collaboration?

**Recommendation**: Plan load testing, consider read replicas, implement caching.

---

### Concern #2: Data Privacy & GDPR
**Status**: Open
**Priority**: 🟠 High

**Concerns**:
- Form submissions contain PII (names, emails, etc.)
- Lead data retention policies
- Right to deletion (GDPR Article 17)
- Data export requirements (GDPR Article 20)
- Consent tracking for marketing use

**Questions**:
1. Do we need explicit consent checkboxes in forms?
2. How long to retain form submissions and leads?
3. How to handle deletion requests?
4. Need data processing agreements with Google/Microsoft?

**Recommendation**: Add Privacy policy specs, implement data retention jobs.

---

### Concern #3: Security - Token Exposure
**Status**: Open
**Priority**: 🔴 Critical

**Concerns**:
- OAuth tokens must never appear in logs
- Encrypted tokens at rest
- Tokens not sent to frontend
- Audit logging of token access

**Questions**:
1. Which encryption library? (cloak_ecto recommended)
2. Key rotation strategy?
3. How to handle leaked tokens?
4. PCI/SOC2 compliance required?

**Recommendation**: Full security audit before production launch.

---

### Concern #4: Analytics & Reporting
**Status**: Open
**Priority**: 🟡 Medium

**Concerns**:
- Forms domain publishes many events
- Need analytics dashboard (mentioned in Figma)
- What metrics to track?
- Real-time vs batch analytics?

**Questions**:
1. Use external analytics service (Google Analytics, Mixpanel)?
2. Build internal analytics domain?
3. What's the reporting frequency (real-time, daily, weekly)?

**Recommendation**: Defer detailed analytics to Phase 2, track basic metrics in Phase 1.

---

## Specification Gaps

### Gap #1: Error Handling Patterns
**Status**: Open
**Priority**: 🟡 Medium

**Missing**:
- Error message conventions
- User-facing error messages vs logs
- Retry strategies for failures
- Circuit breaker patterns

**Recommendation**: Add error handling section to integration specs.

---

### Gap #2: Testing Strategy
**Status**: Open
**Priority**: 🟡 Medium

**Missing**:
- Unit test coverage targets
- Integration test scope
- E2E test scenarios
- Performance test benchmarks

**Recommendation**: Add testing section to GETTING_STARTED.md for each domain.

---

### Gap #3: Migration Strategy
**Status**: Open
**Priority**: 🟡 Medium

**Missing**:
- Database migration scripts
- Seed data for development
- Test data factories
- Production data migration plan

**Recommendation**: Create migration specs after database schemas finalized.

---

## Action Items

### Immediate (Before Continuing Specs)
- [ ] **Review** this ISSUES.md document
- [ ] **Answer** critical questions (#1-#5)
- [ ] **Make decisions** on domain modeling questions
- [ ] **Clarify** OAuth implementation strategy

### Short Term (During Spec Creation)
- [ ] **Create** remaining 51 specification files
- [ ] **Answer** integration questions (#6-#8)
- [ ] **Answer** UI/UX questions (#9-#10)
- [ ] **Address** security concerns

### Medium Term (During Implementation)
- [ ] **Prototype** complex components (calendar, drag-drop, chatbot)
- [ ] **Plan** load testing strategy
- [ ] **Conduct** security audit
- [ ] **Define** analytics requirements

---

## Decision Log

| Decision | Date | Decided By | Rationale |
|----------|------|------------|-----------|
| Separate Forms and Integrations domains | 2025-11-14 | Spec Author | Clear separation of concerns |
| XOR constraint on CalendarBooking | 2025-11-14 | Spec Author | Single source of truth |
| Immutable FormSubmissions | 2025-11-14 | Spec Author | Audit trail integrity |
| Company-scoped integrations | 2025-11-14 | Spec Author | Collaboration and admin simplicity |
| 5-minute availability cache TTL | 2025-11-14 | Spec Author | Balance accuracy and API usage |

---

## Summary

**Total Issues**: 10 critical/high, 10 medium
**Blocking Issues**: 5
**Decisions Needed**: 10+

**Recommendation**: Address critical issues #1-#5 before continuing specification work. Schedule team review meeting to make key decisions.

---

**Status**: Ready for team review
**Next Review Date**: TBD
**Owner**: TBD
