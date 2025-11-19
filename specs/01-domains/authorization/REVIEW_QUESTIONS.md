# Authorization Domain - Review Questions

**Date**: 2025-11-12
**Status**: In Progress
**Reviewer**: Claude Code

## Purpose

This document captures questions raised during comprehensive spec review that need clarification before Phase 1 implementation begins.

---

## Critical Issues (Block Implementation)

### Q1: Last Admin Invariant Contradiction ⚠️

**Found in:**
- `domain.md:115` - "Must have at least one active admin authz_user"
- `company.md:26` - "Must have at least one active admin authz_user at all times"

**Problem:** These are listed as **invariants** (must always be true), but we removed all enforcement logic per your request. An invariant without enforcement is contradictory.

**Question:** Should I remove these invariant statements from `domain.md` and `company.md`, or rephrase them as "recommended" rather than "must"?

**Suggested Options:**
- Option 1: Remove entirely
- Option 2: Rephrase as recommendation: "Companies should have at least one active admin. If no admins exist, DBA will manually restore access."
- Option 3: Other (specify)

**Answer:** Option 1 - Remove entirely

**Resolution:** Remove the "Must have at least one active admin authz_user" invariant from both `domain.md:115` and `company.md:26`. This is not enforced by the system (DBA handles edge case).

---

### Q2: Session Management Implementation

**Mentioned in:**
- `domain.md:136` - Session context structure
- `multi_tenancy.feature.md:84-90` - Session scenarios
- `row_level_security.md:155-167` - Session requirements

**Question:** How should session management be implemented in Phoenix LiveView?

**Options:**
- Option 1: Create `lib/clientt_crm_app_web/live_authz_auth.ex` module (similar to `live_user_auth.ex`)
- Option 2: Add `on_mount` hook for company context enforcement
- Option 3: Create session plug for HTTP requests
- Option 4: All of the above
- Option 5: Create a separate specification document for this

**Answer:** Option 4 - All of the above (LiveView module + on_mount + plug)

**Resolution:** Implement comprehensive session management:
- Create `lib/clientt_crm_app_web/live_authz_auth.ex` module for LiveView authorization helpers
- Add `on_mount` hook for company context enforcement in LiveViews
- Create session plug for HTTP requests to ensure company context on traditional requests
- All three components work together for complete multi-tenant session management

---

### Q3: Database Migrations & Constraints

**Found scattered across:** All resource specs

**Details needed:**
- Unique constraints: `(tenant_id, name)` for teams
- Partial unique index: `(tenant_id, email) WHERE status='pending'` for invitations
- Check constraints: `team_role_requires_team`
- Foreign keys with CASCADE behavior

**Question:** Should I create a consolidated database schema specification document?

**Would Include:**
- Table definitions
- Indexes
- Foreign keys
- Check constraints
- Triggers (for audit logging?)

**Answer:** Yes - Create consolidated database schema specification

**Resolution:** Create `DATABASE_SCHEMA.generated.md` that consolidates all database requirements from resource specs. Include:
- All table definitions
- All indexes (including partial indexes)
- All foreign keys with CASCADE/RESTRICT behavior
- All check constraints
- Triggers if needed (for audit logging)
- **Important**: Reference the source resource spec files that contain more detailed business logic
- **Filename**: Include "generated" to indicate it's derived from resource specs

---

## High Priority (Important for Clarity)

### Q4: Company Archival Cascade Behavior

**Found in:**
- `company.md:50` - Says archiving sets authz_users to inactive and revokes invitations
- `team.md:103` - Prevents archiving teams with active members

**Problem:** When a company is archived, what happens to teams?

**Question:** When a company is archived, should teams be:
- Option 1: Automatically archived (CASCADE style)
- Option 2: Remain active but inaccessible (due to inactive users)
- Option 3: Other behavior (specify)

**Answer:** Option 1 - Automatically archive all teams (CASCADE style)

**Resolution:** When a company is archived, automatically archive all teams as part of the company archival process. Update `company.md` archive action to include team archival in the cascade behavior.

---

### Q5: Audit Log Retention Enforcement

**Found in:** `audit_log.md:259` - Specifies 2-year retention

**Question:** How should 2-year retention be enforced?

**Options:**
- Option 1: Background job (Oban task) - automated cleanup
- Option 2: Manual DBA cleanup
- Option 3: Automated archival to cold storage (keep in DB but mark as archived)
- Option 4: No enforcement (rely on database size monitoring)

**Should this be added to implementation plan?**

**Answer:** Option 2 - Manual DBA cleanup

**Resolution:** No automated retention enforcement in Phase 1. Rely on DBA to manually clean up audit logs older than 2 years when needed. Document the 2-year retention policy in the spec but don't add automated cleanup to implementation plan.

---

### Q6: Domain Event Publishing

**Found in:** Every resource spec documents events, but no implementation spec exists

**Question:** Should I create a specification for event publishing?

**Would Include:**
- Event bus implementation (PubSub, EventStore, etc.)
- Event schema/contracts
- Event handlers and subscribers
- Event versioning
- Error handling for failed event delivery

**Options:**
- Option 1: Yes, create comprehensive event spec
- Option 2: Yes, but defer to Phase 2+
- Option 3: No, handle ad-hoc during implementation
- Option 4: Add brief section to domain.md only

**Answer:** Option 2 - Yes, but defer to Phase 2+

**Resolution:** Create comprehensive event specification but defer to Phase 2+. Phase 1 will focus on core CRUD operations. Event publishing system (PubSub, event handlers, error handling) will be specified and implemented in a later phase when integration with external services (email, analytics) becomes critical.

---

### Q7: First Company Auto-Creation

**Found in:** `domain.md:87` - "Optional: Auto-create default company for new users (migration only)"

**Question:** Is auto-creating first company needed for MVP (Phase 1)?

**Options:**
- Option 1: Yes, implement in Phase 1 (auto-create on first login)
- Option 2: No, users always explicitly create their first company
- Option 3: Yes, but only for migration from existing system

**Answer:** Option 1 - Yes, implement in Phase 1 (auto-create on first login)

**Resolution:** Implement automatic first company creation in Phase 1. When a new user completes registration and has no companies, automatically create their first company (e.g., "{FirstName}'s Company" or prompt for name). This improves onboarding UX by getting users into the app faster. Update implementation plan to include this in Phase 1.

---

## Medium Priority (Nice to Have)

### Q8: Calculated Fields Performance

**Found in:** Multiple resources use calculations: `member_count`, `admin_count`, `users_remaining`

**Question:** Should calculated fields be:
- Option 1: Real-time calculations (current approach) - always accurate but potentially slower
- Option 2: Cached with invalidation strategy - faster but more complex
- Option 3: Mixed approach (cache some, real-time for others)

**Should we document expected query performance in each resource spec?**

**Answer:** Option 1 - Real-time calculations using optimized SQL as needed

**Resolution:** Use real-time calculations for all calculated fields. Ensure performance through:
- Proper database indexes on foreign keys and filter columns
- Optimized SQL queries (Ash will generate efficient COUNT queries)
- No caching layer needed for Phase 1
- Document that calculations should use indexed columns for performance
- If performance issues arise later, can optimize specific calculations on a case-by-case basis

---

### Q9: Feature Flags Configuration

**Found in:** `company_settings.md:217-236` - Shows default feature flags

**Question:** How should feature flag defaults be managed?

**Options:**
- Option 1: Hardcoded in resource (simple, but requires code deploy to change)
- Option 2: Environment variables/config (flexible per deployment)
- Option 3: Database seed data (can be changed via migration)
- Option 4: Admin UI to set system-wide defaults

**Should different deployment environments (dev/staging/prod) have different defaults?**

**Answer:** Option 4 - Admin UI to set system-wide defaults

**Resolution:** Implement Admin UI to manage system-wide feature flag defaults. This provides maximum flexibility:
- Super admin can change defaults without code deployment
- Can enable/disable features for new companies globally
- Individual companies can still override defaults
- Need to implement super admin role/interface (may be Phase 2+)
- Initial defaults can be set via database seed for Phase 1
- UI for managing defaults added in later phase

---

### Q10: Rate Limiting Scope

**Found in:** `invitation_security.md` - Implements rate limiting on invitations (50/hour)

**Question:** Should we implement rate limiting on other sensitive actions?

**Candidates:**
- User role changes
- Team assignments
- Company settings updates
- Company archival
- Bulk operations

**Options:**
- Option 1: Yes, add rate limiting to all sensitive actions (specify limits)
- Option 2: Only invitations for Phase 1, expand later
- Option 3: No additional rate limiting

**Answer:** Option 1 - Yes, add rate limiting to all sensitive actions

**Resolution:** Implement rate limiting on sensitive actions with the following limits:
- **Scope**: Per user (per authz_user_id)
- **Limit**: 1 action per second (prevents rapid-fire abuse)
- **Actions to rate limit:**
  - User role changes: 1 per second per user
  - Team assignments: 1 per second per user
  - Company settings updates: 1 per second per user
  - Company archival: 1 per second per user
  - Bulk operations: 1 per second per user
- **Implementation**: Use validation or change hook to check last action timestamp
- **Error**: "Rate limit exceeded. Please wait before trying again."
- Note: Invitations remain at 50 per hour per company (existing spec)

---

## Low Priority (Documentation)

### Q11: Integration Specifications Review

**Found in:**
- `specs/03-integrations/accounts_to_authorization_integration.md`
- `specs/03-integrations/authorization_to_email_integration.md`

**Question:** Should I review these integration specs as well?

**Answer:** Yes

**Resolution:** Review the two integration specification files for completeness and consistency:
- `specs/03-integrations/accounts_to_authorization_integration.md`
- `specs/03-integrations/authorization_to_email_integration.md`
Ensure they align with domain and resource specs, have correct event contracts, and specify clear integration boundaries.

---

### Q12: UI/UX Specifications

**Gap:** Specs are comprehensive for backend logic, but no UI specifications exist

**Question:** For Phase 5-6 (UI implementation), should we create:
- Wireframes or mockups?
- User flow diagrams?
- Component specifications?
- LiveView component specs?

**Options:**
- Option 1: Yes, create comprehensive UI specs before Phase 5
- Option 2: Create during Phase 5 as needed
- Option 3: Not needed, work from feature specs
- Option 4: Create basic wireframes only

**Answer:** Option 1 - Yes, create comprehensive UI specs before Phase 5

**Resolution:** Create comprehensive UI/UX specifications before Phase 5 implementation:

**Design System:**
- **DaisyUI Figma Library 2.0**: Use as primary component library
- **Nexus Components**: Additional component library
- **Phoenix LiveView**: Target framework for implementation

**Figma → Implementation Workflow:**

**DO NOT** export HTML/TSX directly from Figma. Instead:

1. **Figma as Reference**: Use Figma designs as visual reference and specification
2. **Manual Implementation**: Build proper Phoenix LiveView components with HEEx templates
3. **DaisyUI Classes**: Apply DaisyUI Tailwind classes to match Figma designs
4. **LiveView Patterns**: Follow Phoenix LiveView best practices (not React/TSX)

**How to Supply Figma Designs:**

**Option A - Figma Link (Preferred):**
- Share Figma file link with view access
- Designers/Claude can inspect directly in Figma
- Preserves component structure, spacing, colors, typography

**Option B - Exported Assets:**
- Export individual screens as PNG/SVG for reference
- Include a design tokens file (colors, spacing, typography)
- Document component hierarchy and interactions

**Option C - Detailed Specs:**
- Screenshot each screen/flow
- Annotate with component names from DaisyUI/Nexus
- Document interactions, states, validation rules

**UI Spec Structure (to be created):**
```
specs/01-domains/authorization/ui/
├── README.md (how to use Figma designs)
├── design-tokens.md (colors, typography, spacing from DaisyUI)
├── components.md (mapping of Figma → DaisyUI → LiveView)
├── screens/
│   ├── company-list.md
│   ├── company-switcher.md
│   ├── member-management.md
│   ├── team-management.md
│   ├── invitation-flow.md
│   └── settings.md
└── figma/
    ├── FIGMA_LINK.md (link to shared Figma file)
    └── design-exports/ (PNG/SVG references if needed)
```

**Recommended Approach:**
1. Create Figma designs using DaisyUI Figma Library 2.0
2. Share Figma link in `specs/01-domains/authorization/ui/figma/FIGMA_LINK.md`
3. Create screen specs in markdown that reference Figma screens
4. Implement as LiveView components using DaisyUI Tailwind classes
5. Reference Nexus components where applicable

**When to Supply Figma Designs:**
- Before Phase 5 implementation begins
- After backend specs are approved and stable
- Coordinate with Phase 4 completion (audit logging)

---

## Summary

**Total Questions:** 12
- Critical: 3
- High Priority: 4
- Medium Priority: 3
- Low Priority: 2

**Status:** 12/12 answered ✅

---

## Notes

Add any additional notes or clarifications here as questions are answered.
