# Multi-Tenant Authorization System - Project Specification

**Project:** ClienttCRM Multi-Tenancy & Authorization
**Created:** 2025-11-11
**Status:** Specification Complete - Ready for Implementation

---

## Overview

This folder contains a comprehensive specification for implementing a multi-tenant authorization system in the ClienttCRM application. The system separates **authentication** (who you are) from **authorization** (what you can do) and supports users belonging to multiple companies with different roles.

### Key Features

- **Multi-company membership**: Users can belong to multiple companies
- **Role-based access control**: Simple predefined roles (Admin, Manager, User)
- **Team organization**: Sub-groups within companies with team-specific roles
- **Invitation system**: Email-based user invitations with acceptance workflow
- **Company settings**: Per-company configuration and feature flags
- **Audit logging**: Comprehensive, immutable audit trail of all authorization changes
- **Row-level security**: Data isolation between companies using Ash policies

---

## Document Guide

This specification is organized into four complementary documents:

### 1. SPECIFICATION.md (Main Document)
**Start here for comprehensive technical details**

**Contents:**
- Executive summary
- Domain-Driven Design (DDD) model
  - Entities: Company, AuthzUser, Team, Invitation, CompanySettings, AuditLog
  - Value objects: Role enums, status enums
  - Aggregates and relationships
- Behavior-Driven Design (BDD) scenarios
  - Gherkin-style acceptance criteria
  - User workflows
- Database schema (ERD + SQL DDL)
- Ash Framework implementation details
  - Domain definition
  - Resource outlines with actions, policies, calculations
- Multi-tenancy implementation (row-level security)
- Implementation phases (8-week plan)
- Security considerations
- Open questions and recommendations

**Best for:** Architects, lead developers, technical stakeholders

---

### 2. QUICK_REFERENCE.md
**Use this for quick lookups during development**

**Contents:**
- Core concepts explained simply (authn vs authz)
- Table reference (6 tables with key fields)
- Roles & permissions matrix
- Business rules summary
- Multi-tenancy implementation patterns
- Common queries (copy-paste examples)
- Domain events catalog
- File structure
- Implementation checklist
- Common patterns (create company, invite user, accept invitation, etc.)
- Testing strategy
- Troubleshooting guide

**Best for:** Developers during implementation, code reviews

---

### 3. USER_STORIES.md
**Reference this for understanding user requirements and acceptance criteria**

**Contents:**
- 21 detailed user stories across 7 epics:
  1. Company Management (4 stories)
  2. User Management (6 stories)
  3. Team Management (5 stories)
  4. Company Settings (3 stories)
  5. Audit Logging (2 stories)
  6. Multi-Tenancy & Data Isolation (2 stories)
  7. Migration & Onboarding (2 stories)
- Non-functional requirements (performance, security, scalability, usability)
- Edge cases & error handling (6 scenarios)
- Future enhancements (out of scope for v1)

**Best for:** Product managers, QA engineers, developers writing tests

---

### 4. IMPLEMENTATION_PLAN.md
**Follow this for step-by-step implementation guidance**

**Contents:**
- 8-week phased implementation plan
- Detailed tasks with estimated time
- Phase 1: Core Authorization Domain (Weeks 1-2)
  - Company, AuthzUser resources, policies, tests
- Phase 2: Teams & Settings (Week 3)
  - Team, CompanySettings resources, relationships
- Phase 3: Invitations (Week 4)
  - Invitation resource, email workflow, acceptance flow
- Phase 4: Audit Logging (Week 5)
  - AuditLog resource, change hooks
- Phase 5: UI & LiveView Integration (Weeks 6-7)
  - Company switcher, user/team management, settings, invitations
- Phase 6: Migration & Testing (Week 8)
  - Data migration, integration tests, security audit, deployment
- Risk mitigation strategies
- Post-launch monitoring plan

**Best for:** Project managers, developers executing the plan

---

## Quick Start

### For Architects/Tech Leads
1. Read **SPECIFICATION.md** (Executive Summary + DDD section)
2. Review database schema (ERD)
3. Understand multi-tenancy approach (row-level with Ash policies)
4. Review open questions and make decisions

### For Developers
1. Skim **SPECIFICATION.md** (DDD entities + BDD scenarios)
2. Keep **QUICK_REFERENCE.md** open during development
3. Follow **IMPLEMENTATION_PLAN.md** phase by phase
4. Reference **USER_STORIES.md** when writing tests

### For Product/QA
1. Read **USER_STORIES.md** thoroughly
2. Understand user journeys and acceptance criteria
3. Review edge cases and error handling
4. Use stories to write test plans

---

## Key Design Decisions

### Decision 1: Separation of Authentication and Authorization
**Rationale:** Allows a single login identity (authn_user) to have multiple authorization identities (authz_users), one per company. This enables users to belong to multiple companies with different roles in each.

**Implementation:**
- Existing `users` table → `authn_users` (login identity)
- New `authz_users` table → authorization identity (company-scoped)
- 1:Many relationship: one authn_user can have many authz_users

---

### Decision 2: Row-Level Multi-Tenancy
**Rationale:** Simpler to implement than schema-level tenancy, easier to query across companies when needed, and Ash policies provide robust enforcement.

**Implementation:**
- All tenant-scoped tables include `tenant_id`
- Ash policies automatically filter queries by current company context
- Session stores `current_tenant_id` and `current_authz_user`

---

### Decision 3: Simple RBAC (3 Roles)
**Rationale:** Sufficient for MVP, easier to understand for users, can be extended to custom roles/ABAC in Phase 2.

**Roles:**
- `admin`: Full company management
- `manager`: Team management, limited settings
- `user`: Standard resource access

---

### Decision 4: Teams as Flat Structure (No Hierarchy)
**Rationale:** Simpler for v1, covers most use cases (departments, project teams). Can add parent/child teams in future if needed.

**Implementation:**
- Team belongs to company
- AuthzUser can belong to one team (nullable)
- Team roles: `team_lead`, `team_member`

---

## Database Overview

### Tables Created (6 tables, all prefixed with `authz_`)

```
authz_tenants (root)
├── authz_tenant_settings (1:1)
├── authz_users (1:Many)
│   └── belongs to users (authn_users) (Many:1)
├── authz_teams (1:Many)
│   └── authz_users.team_id → authz_teams.id (Many:1)
├── authz_invitations (1:Many)
└── authz_audit_logs (1:Many)
```

**Total Columns:** ~70 columns across 6 tables
**Total Indexes:** ~20 indexes for performance
**Total Constraints:** ~15 check constraints + foreign keys

---

## Implementation Effort Estimate

### Total Time: 8 weeks (1-2 developers)

| Phase | Duration | Effort (hours) |
|-------|----------|----------------|
| Phase 1: Core (Company, AuthzUser) | 2 weeks | 80 hours |
| Phase 2: Teams & Settings | 1 week | 40 hours |
| Phase 3: Invitations | 1 week | 40 hours |
| Phase 4: Audit Logging | 1 week | 40 hours |
| Phase 5: UI & LiveView | 2 weeks | 80 hours |
| Phase 6: Migration & Testing | 1 week | 40 hours |
| **Total** | **8 weeks** | **320 hours** |

**Assumptions:**
- 1 experienced Elixir/Ash developer full-time
- OR 2 developers part-time (50% allocation each)
- No major blockers or scope changes
- Existing Ash/Phoenix knowledge

---

## Testing Strategy

### Unit Tests (~30 test files)
- One test file per resource (6 resources = 6 files)
- One test file per custom change/check (~10 files)
- Cover all actions, validations, policies, calculations

### Integration Tests (~10 test files)
- Full user journeys (signup → create company → invite → accept)
- Multi-tenancy isolation (critical!)
- Audit logging end-to-end

### Performance Tests (~5 test files)
- Query performance with 1000s of records
- Context switching overhead
- Company list with 50 companies

### Security Tests (~5 test files)
- Policy enforcement (cannot bypass tenant_id filter)
- Last admin protection
- Token security (invitations)
- Cross-tenant data access attempts

**Total Tests Estimated:** 100-150 test cases

---

## Security Checklist

Before going to production, verify:

- [ ] All tenant-scoped queries filtered by tenant_id (enforced by Ash policies)
- [ ] Cannot remove last admin from company
- [ ] Invitation tokens cryptographically secure (32+ bytes)
- [ ] Audit logs immutable (no update/delete actions)
- [ ] Session tenant_id cannot be overridden by client
- [ ] All forms have CSRF protection
- [ ] No SQL injection vulnerabilities (Ash should prevent)
- [ ] No authorization bypass via direct API calls
- [ ] Passwords required for sensitive actions (role changes, user removal)
- [ ] Rate limiting on invitation sends

---

## Open Questions & Decisions Needed

### Q1: Display Name Strategy
**Question:** Should authz_users have optional `display_name`, or always use authn_user email?

**Recommendation:** ✅ Optional display_name for flexibility (user might want different names per company)

**Status:** ✅ Included in spec

---

### Q2: Super Admin Role
**Question:** Do we need a global super admin (across all companies)?

**Recommendation:** Add separate `is_super_admin` boolean flag on authn_users for platform administration

**Status:** ⏸️ Deferred to Phase 2 (not in v1)

**Decision needed:** Confirm if super admin is needed for v1

---

### Q3: Billing Integration
**Question:** Should CompanySettings track billing/subscription info?

**Recommendation:** Create separate `Billing` domain; link via tenant_id

**Status:** ⏸️ Out of scope for multi-tenancy project

**Decision needed:** When to tackle billing?

---

### Q4: Permission Granularity
**Question:** Are 3 roles (admin, manager, user) sufficient?

**Current:** Yes for MVP

**Future:** May need custom permissions (ABAC expansion in Phase 2)

**Status:** ✅ Use simple RBAC for v1

---

### Q5: Team Hierarchy
**Question:** Should teams support parent/child relationships?

**Current:** Flat team structure

**Future:** Consider if org hierarchy needed

**Status:** ⏸️ Deferred to Phase 2

**Decision needed:** Confirm flat structure is acceptable for v1

---

## Glossary

| Term | Definition |
|------|------------|
| **authn_user** | Authentication user - login identity from `users` table |
| **authz_user** | Authorization user - company-scoped identity with roles |
| **Company** | Tenant organization in the multi-tenant system |
| **Team** | Sub-group within a company (e.g., "Engineering", "Sales") |
| **Row-level tenancy** | Multi-tenancy via tenant_id filtering on shared tables |
| **RBAC** | Role-Based Access Control |
| **ABAC** | Attribute-Based Access Control (future) |
| **Aggregate** | DDD pattern - cluster of entities treated as a single unit |
| **Domain Event** | Significant occurrence in the domain (e.g., UserCreated) |
| **Ash Policy** | Declarative authorization rule in Ash Framework |

---

## Related Documentation

- **Project README:** `../../README.md`
- **CLAUDE.md:** `../../CLAUDE.md` (project-wide guidelines)
- **Ash Documentation:** https://hexdocs.pm/ash
- **AshPostgres Documentation:** https://hexdocs.pm/ash_postgres
- **Phoenix LiveView Documentation:** https://hexdocs.pm/phoenix_live_view

---

## Contact & Support

For questions about this specification:

1. Review the four documents in this folder
2. Check "Open Questions" section above
3. Consult Ash Framework documentation
4. Reach out to project lead/architect

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-11 | Claude Code | Initial specification created |

---

## Next Steps

1. **Review & Approve** (1-2 days)
   - [ ] Review all four documents with team
   - [ ] Make decisions on open questions
   - [ ] Approve specification

2. **Environment Setup** (1 day)
   - [ ] Set up development branch
   - [ ] Review Ash version compatibility
   - [ ] Ensure PostgreSQL 14+ available

3. **Begin Phase 1** (Week 1-2)
   - [ ] Create Authorization domain
   - [ ] Implement Company resource
   - [ ] Implement AuthzUser resource
   - [ ] Follow IMPLEMENTATION_PLAN.md

4. **Weekly Check-ins**
   - [ ] Review progress against plan
   - [ ] Address blockers
   - [ ] Adjust timeline if needed

---

**Ready to start?** Begin with **Phase 1, Task 1.1** in IMPLEMENTATION_PLAN.md 🚀
