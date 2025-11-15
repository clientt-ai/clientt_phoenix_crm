# Forms Builder Module - Master Index

**Created**: 2025-11-14
**Status**: Organized into Focused Dev Prompts
**Last Updated**: 2025-11-14

## Overview

This master index provides navigation to all dev_prompt folders related to the Forms Builder Module. The original large dev_prompt has been split into focused, actionable tasks and investigation areas.

---

## Quick Navigation

### 📋 Actionable Tasks (Ready to Execute)

**[Forms Specification Continuation](../20251114-forms-specs-continuation/README.md)**
- **Status**: ✅ Ready to Start
- **Type**: Implementation Task
- **Effort**: ~44 hours over 5-6 weeks
- **Priority**: 🔴 Critical
- **What**: Create remaining 43 specification files (BDD features, policies, integrations, UI specs)
- **Blocking**: No decisions needed, can start immediately
- **Owner**: TBD

---

### 🔍 Investigation Tasks (Need Research/Decisions)

#### Technical Investigations

**[UI Component Research & Prototyping](../20251114-forms-ui-component-research/README.md)**
- **Status**: ⚠️ Needs Investigation
- **Type**: Research & Prototyping
- **Effort**: ~4-5 weeks
- **Priority**: 🟠 High
- **What**: Research component mappings from React/shadcn to LiveView/DaisyUI
- **Key Questions**:
  - Which calendar widget library to use?
  - How to implement drag-drop in LiveView?
  - How to manage chatbot state?
  - Mobile form builder support level?
- **Blocking**: UI implementation
- **Owner**: TBD

**[OAuth Implementation Strategy](../20251114-forms-oauth-implementation/README.md)**
- **Status**: ⚠️ Needs Investigation
- **Type**: Technical Decision
- **Effort**: ~2-3 weeks
- **Priority**: 🟠 High
- **What**: Make critical decisions for OAuth integration
- **Key Decisions**:
  1. Which OAuth library? (oauth2, assent, ueberauth)
  2. Token encryption strategy? (cloak_ecto recommended)
  3. Key management? (env var, secrets manager)
  4. Token refresh approach? (Oban background job)
  5. Callback handling? (Controller or LiveView)
  6. PKCE enforcement? (Yes, recommended)
  7. Code verifier storage? (Phoenix.Token)
- **Blocking**: Calendar integration
- **Owner**: TBD

**[Chatbot AI Strategy](../20251114-forms-chatbot-strategy/README.md)**
- **Status**: ⚠️ Needs Investigation
- **Type**: Technical & Business Decision
- **Effort**: ~1-2 weeks investigation
- **Priority**: 🟡 Medium
- **What**: Decide chatbot implementation approach
- **Options**:
  - Option A: Scripted responses (~$11K/year) - **MVP Recommendation**
  - Option B: Rule-based AI (~$29K/year)
  - Option C: AI API (OpenAI/Claude) (~$18K/year)
  - Option D: Hybrid approach (~$28K/year)
- **Blocking**: Chatbot implementation
- **Owner**: TBD

**[Performance & Analytics Strategy](../20251114-forms-performance-analytics/README.md)**
- **Status**: ⚠️ Needs Investigation
- **Type**: Performance Research & Analytics Design
- **Effort**: ~8 weeks
- **Priority**: 🟡 Medium
- **What**: Optimize performance and design analytics
- **Key Areas**:
  - Form submission scalability (100+ submissions/min)
  - Live preview performance
  - Chatbot real-time messages (1,000+ concurrent)
  - Calendar availability caching (5-min TTL recommended)
  - Analytics event tracking and aggregation
- **Blocking**: Scalability and product insights
- **Owner**: TBD

---

#### Business Decisions

**[Business Logic & Feature Scope](../20251114-forms-business-logic-decisions/README.md)**
- **Status**: ⚠️ Needs Stakeholder Input
- **Type**: Business Decision
- **Effort**: 1 decision meeting + updates
- **Priority**: 🟠 High
- **What**: Make product scope decisions
- **Key Decisions**:
  1. **Form Versioning**: No versioning (MVP) → Simple versioning (Phase 2)
  2. **Multi-Page Forms**: Single-page (MVP) → Multi-page (Phase 2)
  3. **Conditional Logic**: No conditional logic (MVP) → Simple rules (Phase 2)
  4. **Team Calendars**: Single calendar (MVP) → Round-robin (Phase 2)
  5. **Lead Deduplication**: Email-based 30-day window (MVP)
  6. **Calendar Ownership**: Company calendar (MVP) → Per-user (Phase 2)
  7. **Booking Cancellation**: Delete event (MVP) → Configurable (Phase 2)
  8. **Module Activation**: All active (MVP) → Admin toggle (Phase 2)
- **Blocking**: Spec finalization, MVP scope
- **Owner**: Product Owner + Engineering Lead

---

#### Security & Compliance

**[Security & GDPR Compliance](../20251114-forms-security-compliance/README.md)**
- **Status**: ⚠️ Needs Security Review
- **Type**: Security Audit & Compliance
- **Effort**: ~3-4 weeks
- **Priority**: 🔴 **CRITICAL** (Blocks Production)
- **What**: Address security vulnerabilities and GDPR requirements
- **Critical Issues**:
  1. **OAuth Token Exposure**: Encryption, audit logging, rate limiting
  2. **Form Submission PII**: GDPR compliance (right to access, deletion, rectification)
  3. **Multi-Tenancy Isolation**: PostgreSQL RLS + Ash policies
  4. **XSS Prevention**: Input sanitization, CSP headers
  5. **SQL Injection**: Query audit
- **GDPR Checklist**:
  - [ ] Privacy policy
  - [ ] Consent management
  - [ ] Data export endpoint
  - [ ] Data deletion/anonymization
  - [ ] DPAs with vendors (Google, Microsoft)
  - [ ] Data retention automation
- **Blocking**: Production launch
- **Owner**: Security Team + Legal

---

## Original Planning Documents

These documents are still relevant and provide context:

- **[README.md](./README.md)** - Original overview and quick links
- **[PLANNING.md](./PLANNING.md)** - 5-phase implementation plan
- **[SPEC_FILES_MANIFEST.md](./SPEC_FILES_MANIFEST.md)** - Complete checklist of 55 spec files
- **[EXECUTION_SUMMARY.md](./EXECUTION_SUMMARY.md)** - Initial execution summary (4 files created)
- **[PROGRESS_UPDATE.md](./PROGRESS_UPDATE.md)** - Current progress (12 files, 22% complete)
- **[ISSUES.md](./ISSUES.md)** - Original consolidated issues document (now split into focused folders)

---

## Recommended Workflow

### Phase 0: Investigations & Decisions (Parallel, 2-4 weeks)

Run these in parallel to unblock implementation:

1. **Week 1-2**:
   - [ ] **Business Decisions** - Schedule stakeholder meeting, make scope decisions
   - [ ] **OAuth Strategy** - Start library research and prototyping
   - [ ] **Security Audit** - Begin security review and GDPR compliance work

2. **Week 3-4**:
   - [ ] **UI Component Research** - Prototype complex components
   - [ ] **Chatbot Strategy** - Make implementation approach decision
   - [ ] **OAuth Strategy** - Finalize technical decisions

### Phase 1: MVP Specification Completion (4-6 weeks)

Once critical decisions are made:

1. **Week 1-2**:
   - [ ] **Continue Spec Creation** - Complete BDD features (8 files)
   - [ ] **Continue Spec Creation** - Complete policies (4 files)

2. **Week 3-4**:
   - [ ] **Continue Spec Creation** - Complete integrations (3 files)
   - [ ] **Continue Spec Creation** - Complete domain docs (4 files)

3. **Week 5-6**:
   - [ ] **Continue Spec Creation** - Complete UI specs (19 files)
   - [ ] **Security Implementation** - Implement critical security measures

### Phase 2: Implementation (follows spec completion)

This phase is NOT part of current scope (specs only, no implementation).

---

## Decision Tracking

### Decisions Made

| Decision | Date | Decided By | Outcome | Document |
|----------|------|------------|---------|----------|
| Separate Forms and Integrations domains | 2025-11-14 | Spec Author | ✅ Approved | PLANNING.md |
| XOR constraint on CalendarBooking | 2025-11-14 | Spec Author | ✅ Approved | calendar_booking.md |
| Immutable FormSubmissions | 2025-11-14 | Spec Author | ✅ Approved | form_submission.md |
| Company-scoped integrations | 2025-11-14 | Spec Author | ✅ Approved | domain.md |

### Decisions Pending

| Decision | Owner | Target Date | Blocking |
|----------|-------|-------------|----------|
| **Business Logic Decisions** (8 decisions) | Product Owner | TBD | Spec finalization |
| **OAuth Library Choice** | Engineering Lead | TBD | Calendar integration |
| **Token Encryption Strategy** | Engineering Lead | TBD | Calendar integration |
| **Chatbot AI Approach** | Product + Engineering | TBD | Chatbot implementation |
| **UI Component Choices** (5 decisions) | Engineering + UX | TBD | UI implementation |
| **Security Audit Completion** | Security Team | TBD | **Production launch** |

---

## Communication

### Status Updates

- **Weekly Status**: Update PROGRESS_UPDATE.md with latest file counts
- **Decision Log**: Update decision tracking table above when decisions made
- **Blockers**: Document in relevant dev_prompt folder README

### Meetings Needed

- [ ] **Business Logic Decision Meeting** (1-2 hours)
  - Attendees: Product Owner, Engineering Lead, UX Designer
  - Outcome: Finalize MVP scope for 8 key decisions

- [ ] **Security Review Meeting** (2-3 hours)
  - Attendees: Security Team, Engineering Lead, Legal/Compliance
  - Outcome: Security checklist completion, GDPR compliance plan

- [ ] **Technical Architecture Review** (2 hours)
  - Attendees: Engineering team
  - Outcome: OAuth, UI components, chatbot decisions

---

## File Organization

```
dev_task_prompts/
├── 20251114-forms-builder-module/           # Original (this folder)
│   ├── INDEX.md                              # ← YOU ARE HERE
│   ├── README.md                             # Overview
│   ├── PLANNING.md                           # 5-phase plan
│   ├── SPEC_FILES_MANIFEST.md                # 55-file checklist
│   ├── EXECUTION_SUMMARY.md                  # Initial summary
│   ├── PROGRESS_UPDATE.md                    # Current progress
│   └── ISSUES.md                             # Original issues (reference)
│
├── 20251114-forms-specs-continuation/        # ✅ ACTIONABLE
│   └── README.md                             # 43 spec files to create
│
├── 20251114-forms-ui-component-research/     # 🔍 INVESTIGATION
│   └── README.md                             # Component mapping research
│
├── 20251114-forms-oauth-implementation/      # 🔍 INVESTIGATION
│   └── README.md                             # OAuth technical decisions
│
├── 20251114-forms-chatbot-strategy/          # 🔍 INVESTIGATION
│   └── README.md                             # AI vs scripted chatbot
│
├── 20251114-forms-business-logic-decisions/  # 🔍 INVESTIGATION
│   └── README.md                             # 8 business decisions
│
├── 20251114-forms-security-compliance/       # 🔴 CRITICAL
│   └── README.md                             # Security audit & GDPR
│
└── 20251114-forms-performance-analytics/     # 🔍 INVESTIGATION
    └── README.md                             # Performance & analytics
```

---

## Summary Statistics

### Work Breakdown

| Category | Files Created | Files Remaining | % Complete |
|----------|--------------|----------------|------------|
| **Domain Specs** | 2 | 0 | 100% ✅ |
| **Resource Specs** | 9 | 0 | 100% ✅ |
| **BDD Features** | 1 | 8 | 11% 🟡 |
| **Policies** | 0 | 4 | 0% 🔴 |
| **Integrations** | 0 | 3 | 0% 🔴 |
| **Domain Docs** | 0 | 4 | 0% 🔴 |
| **UI Specs** | 0 | 19 | 0% 🔴 |
| **Patterns** | 0 | 3 | 0% 🔴 |
| **TOTAL** | **12** | **43** | **22%** |

### Investigation Status

| Investigation Area | Status | Timeline | Priority |
|-------------------|--------|----------|----------|
| Business Logic Decisions | ⚠️ Awaiting stakeholders | 1 meeting | 🟠 High |
| OAuth Implementation | ⚠️ Needs research | 2-3 weeks | 🟠 High |
| UI Components | ⚠️ Needs prototyping | 4-5 weeks | 🟠 High |
| Chatbot Strategy | ⚠️ Needs decision | 1-2 weeks | 🟡 Medium |
| Security & Compliance | ⚠️ Needs audit | 3-4 weeks | 🔴 **CRITICAL** |
| Performance & Analytics | ⚠️ Needs benchmarking | 8 weeks | 🟡 Medium |

### Timeline Estimate

- **Investigations**: 2-4 weeks (parallel)
- **Spec Completion**: 4-6 weeks (after decisions)
- **Security Implementation**: 3-4 weeks (parallel with specs)
- **Total**: ~8-12 weeks to complete all specifications and critical security work

---

## Next Steps

### Immediate (This Week)
1. [ ] Review this INDEX.md with team
2. [ ] Schedule Business Logic Decision Meeting
3. [ ] Assign owners to each investigation area
4. [ ] Start security audit process
5. [ ] Begin OAuth library research

### Short Term (Next 2 Weeks)
1. [ ] Complete all investigations
2. [ ] Make all critical decisions
3. [ ] Update specifications with decisions
4. [ ] Begin spec continuation work

### Medium Term (Next 4-6 Weeks)
1. [ ] Complete all 43 remaining specification files
2. [ ] Complete security implementation
3. [ ] Final review and sign-off

---

## Questions?

- **Spec questions**: See individual dev_prompt folder READMEs
- **Decision questions**: Contact assigned decision owner
- **Security questions**: Contact Security Team
- **General questions**: Reference original ISSUES.md or PLANNING.md

---

**Last Updated**: 2025-11-14
**Maintained By**: TBD
**Review Frequency**: Weekly during active development
