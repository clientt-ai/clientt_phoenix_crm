# Specifications Review - Conflicts and Issues

**Date**: 2025-11-16
**Reviewer**: Claude Code
**Status**: 🟡 Issues Found - Action Required

---

## Executive Summary

This document identifies conflicts, inconsistencies, and issues found during a comprehensive review of the `/specs` folder. The review focused on comparing the newly created Forms domain specifications against the existing Authorization domain specifications and implementation.

**Summary of Issues**:
- ✅ **0 Critical Conflicts** (blocking issues)
- ⚠️ **7 Medium Issues** (should be resolved before implementation)
- ℹ️ **5 Low Issues** (nice to have, documentation improvements)

---

## Table of Contents

1. [Domain Structure Issues](#domain-structure-issues)
2. [Cross-Domain Integration Conflicts](#cross-domain-integration-conflicts)
3. [Resource Ownership Conflicts](#resource-ownership-conflicts)
4. [Database Schema Issues](#database-schema-issues)
5. [Naming and Convention Issues](#naming-and-convention-issues)
6. [Documentation Inconsistencies](#documentation-inconsistencies)
7. [Missing Specifications](#missing-specifications)
8. [Recommendations](#recommendations)

---

## 1. Domain Structure Issues

### ⚠️ ISSUE #1: Missing Integrations Domain Specification

**Severity**: Medium
**Location**: `specs/01-domains/integrations/`

**Description**:
The integrations folder exists but lacks a proper `domain.md` specification. Both Authorization and Forms domains reference "integrations" but the domain is not properly specified.

**Current State**:
```
specs/01-domains/integrations/
├── features/        # Empty directory
└── policies/        # Empty directory
```

**Expected State**:
- `domain.md` with clear domain purpose, boundaries, and resources
- Specification for how domains publish/consume events
- Event bus or message broker specification (if using one)

**Impact**:
- Unclear how cross-domain events are handled
- No specification for event schemas or delivery guarantees
- Forms domain references events consumed by "Notification Service" but this service is undefined

**Recommendation**:
Create a proper Integrations domain specification OR clarify that domain events are handled via:
- Ash Notifiers (lightweight, in-process)
- External event bus (e.g., EventStore, RabbitMQ)
- Simple module callbacks

---

## 2. Cross-Domain Integration Conflicts

### ⚠️ ISSUE #2: Notification Resource Ownership Ambiguity

**Severity**: Medium
**Location**:
- `specs/01-domains/forms/resources/notification.md`
- `specs/01-domains/authorization/domain.md` (references "Notification Service")

**Description**:
The Notification resource is defined in the Forms domain, but:
1. Authorization domain events reference a "Notification Service" consumer (lines 74, 76, 81, etc.)
2. Notification should be a shared resource across all domains, not Forms-specific
3. Authorization domain may also need in-app notifications (role changes, team assignments, etc.)

**Current Implementation**:
```elixir
# Forms domain specification
Resource: Notification (in Forms domain)
- user_id (references authz_user)
- type (e.g., "new_submission", "form_published")
```

**Conflicts**:
- Authorization domain needs notifications for role changes, team assignments, invitations
- Forms domain needs notifications for new submissions, status changes
- If Notification is Forms-specific, Authorization can't use it
- If Notification is shared, it shouldn't be in Forms domain

**Recommendation**:
**Option A** (Recommended): Move Notification to a shared domain
```
specs/01-domains/notifications/
├── domain.md
├── resources/
│   └── notification.md
└── features/
    └── notification_management.feature.md
```

**Option B**: Keep in Forms but rename to FormNotification
- Create separate AuthorizationNotification in Authorization domain
- Both implement a common notification interface

**Option C**: Create a shared "Common" or "Platform" domain
```
specs/01-domains/platform/
├── domain.md
├── resources/
│   ├── notification.md
│   └── user_preferences.md  # Shared notification preferences
```

---

### ⚠️ ISSUE #3: User Preferences Storage Conflict

**Severity**: Medium
**Location**:
- `specs/01-domains/forms/resources/notification.md` (lines 150-157)
- `specs/01-domains/authorization/resources/authz_user.md`

**Description**:
Forms domain specification states notification preferences stored in:
> "Per-user preference (stored in authz_user or user preferences table)"

However:
1. `authz_user` is in Authorization domain (cross-domain dependency)
2. No specification for which table should actually store preferences
3. Unclear if preferences are per-company (authz_user) or global (authn_user)

**Questions**:
- Should notification preferences be global (one setting across all companies)?
- Should they be per-company (different settings in each company)?
- Should they be stored in `authz_user`, `users`, or a separate `user_preferences` table?

**Current Forms Spec**:
```elixir
# User notification preferences (separate from Notification resource)
%{
  notification_preference: "immediate",  # "immediate" | "daily" | "off"
  email_notifications: true,
  timezone: "America/New_York"
}
```

**Recommendation**:
1. Create explicit `UserPreferences` resource specification
2. Decide on scope (global vs per-company)
3. Define where it lives (Accounts domain for global, Authorization for per-company)
4. Update Forms spec to reference the canonical location

**Suggested Approach**:
- Global email preferences → Accounts domain (authn_user)
- Per-company notification settings → Authorization domain (authz_user or separate table)

---

### ℹ️ ISSUE #4: Email Service Integration Not Specified

**Severity**: Low
**Location**:
- Multiple specs reference "Email Service" and Swoosh

**Description**:
Both Authorization and Forms domains reference email sending via Swoosh, but:
- No specification for email templates
- No specification for email sending service/module
- No specification for email queue/retry logic
- Inconsistent references ("Email Service" vs "Swoosh")

**Recommendation**:
Create a specification for email infrastructure:
```
specs/03-integrations/email_service/
├── email_service.md          # Email sending specification
├── templates.md              # Email template catalog
└── delivery_guarantees.md    # Retry, queuing, error handling
```

---

## 3. Resource Ownership Conflicts

### ⚠️ ISSUE #5: Notification Event Consumers Undefined

**Severity**: Medium
**Location**: All domain event specifications

**Description**:
Domain events list consumers like "Notification Service", "Analytics", "Cache Invalidation", etc., but these services are not defined anywhere in the specs.

**Examples**:

**Authorization Domain** (`authorization/domain.md`):
```
| authorization.role_changed | ... | Notification Service, Cache Invalidation |
| authorization.team_member_added | ... | Team Notification Service |
```

**Forms Domain** (`forms/domain.md`):
```
| forms.submission_created | ... | Notification Service, Analytics, Lead Scoring |
```

**Missing Specifications**:
- Where do these services live (separate domains, shared services)?
- How are they implemented (Ash Notifiers, GenServers, separate processes)?
- What are their interfaces and contracts?

**Recommendation**:
1. Create `specs/02-services/` directory for cross-cutting services:
   ```
   specs/02-services/
   ├── notification_service.md
   ├── analytics_service.md
   ├── cache_service.md
   └── lead_scoring_service.md  # Forms-specific
   ```

2. OR clarify in each domain spec that these are future integrations

3. OR implement as simple Ash Notifiers (in-process callbacks) and document this approach

---

## 4. Database Schema Issues

### ✅ NO CONFLICTS: Table Name Uniqueness

**Status**: ✅ No Issues
**Verification**: Checked Authorization database schema and Forms specs

**Authorization Tables** (implemented):
- `authz_tenants`
- `authz_users`
- `authz_teams`
- `authz_tenant_settings`
- `authz_invitations` (not yet implemented, but specified)
- `authz_audit_logs` (not yet implemented, but specified)

**Forms Tables** (proposed):
- `forms`
- `form_fields`
- `submissions`
- `notifications`

**Result**: ✅ No naming conflicts

---

### ⚠️ ISSUE #6: Inconsistent Table Naming Conventions

**Severity**: Low
**Location**: Database schemas across domains

**Description**:
Authorization domain uses `authz_` prefix for all tables, but Forms domain does not use any prefix.

**Current State**:
- Authorization: `authz_tenants`, `authz_users`, `authz_teams`
- Forms: `forms`, `form_fields`, `submissions`, `notifications`

**Recommendation**:
**Option A** (Recommended): Use prefixes for all domains
```sql
-- Authorization
authz_tenants
authz_users
authz_teams

-- Forms
forms_forms (or just forms_)
forms_fields
forms_submissions
forms_notifications
```

**Option B**: Remove prefixes from Authorization (breaking change)
```sql
-- Would require migration
companies
users  # CONFLICT with existing users table from Accounts!
teams
```

**Option C**: Keep as-is but document the convention
- Authorization uses `authz_` prefix (implemented, can't change easily)
- Forms uses no prefix (proposed, can still change)
- Future domains should decide based on conflict potential

**Verdict**: Recommend **Option A** - add `forms_` prefix to Forms domain tables for consistency and clarity.

---

### ℹ️ ISSUE #7: Missing Foreign Key Cascade Behavior Documentation

**Severity**: Low
**Location**: Forms resource specs

**Description**:
Forms domain specs define foreign keys but don't consistently specify ON DELETE behavior:
- What happens to `form_fields` when a `form` is deleted?
- What happens to `submissions` when a `form` is deleted?
- What happens to `notifications` when an `authz_user` is deleted?

**Current Forms Specs**:
```sql
-- form.md mentions "cascade delete" for form_fields
-- submission.md says "no cascade delete" for submissions
-- notification.md doesn't specify CASCADE behavior
```

**Authorization Schema** (for comparison):
```sql
-- Consistently specifies CASCADE behavior
ALTER TABLE authz_users
  ADD CONSTRAINT fk_authz_users_company
  FOREIGN KEY (tenant_id)
  REFERENCES authz_tenants(id)
  ON DELETE CASCADE;  -- Explicit!
```

**Recommendation**:
Add explicit ON DELETE behavior to all Forms domain foreign keys:
```sql
-- Forms
form_fields.form_id → forms.id (ON DELETE CASCADE)
submissions.form_id → forms.id (ON DELETE RESTRICT or SET NULL)
submissions.tenant_id → authz_tenants.id (ON DELETE CASCADE)
notifications.user_id → authz_users.id (ON DELETE CASCADE)
```

---

## 5. Naming and Convention Issues

### ✅ RESOLVED #8: Inconsistent Use of "authn_user" vs "User"

**Severity**: Low
**Location**: Cross-domain references
**Status**: RESOLVED (2025-11-17)

**Description**:
Authorization domain consistently uses "authn_user" terminology, but Forms domain references were inconsistent.

**Resolution**:
- Renamed `ClienttCrmApp.Accounts.User` module to `ClienttCrmApp.Accounts.AuthnUser`
- Renamed `users` table to `authn_users`
- Updated all references throughout codebase
- Migration: `20251117074533_rename_users_to_authn_users.exs`

**Implementation**:
```elixir
# Module name
ClienttCrmApp.Accounts.AuthnUser

# Table name
table "authn_users"

# Relationship
belongs_to :authn_user, ClienttCrmApp.Accounts.AuthnUser
```

---

### ℹ️ ISSUE #9: Policy File Name Duplication

**Severity**: Low
**Location**:
- `specs/01-domains/authorization/policies/row_level_security.md`
- `specs/01-domains/forms/policies/row_level_security.md`

**Description**:
Both domains have a `row_level_security.md` file, which is correct (domain-specific policies), but could be confusing without clear separation.

**Current State**:
✅ Files are in separate domain directories
✅ Each file is domain-specific
⚠️ Could be misread as conflicting specs

**Recommendation**:
Consider more specific naming:
- `authorization/policies/authorization_row_level_security.md`
- `forms/policies/forms_row_level_security.md`

OR keep as-is and add clear header notes in each file:
```markdown
# Policy: Row-Level Security (Multi-Tenancy)

**Domain**: Forms  ← Clearly identifies the domain
**Status**: approved
```

**Verdict**: ✅ Current approach is acceptable with domain headers. No change needed.

---

## 6. Documentation Inconsistencies

### ℹ️ ISSUE #10: Missing DATABASE_SCHEMA.generated.md for Forms

**Severity**: Low
**Location**: `specs/01-domains/forms/`

**Description**:
Authorization domain has a consolidated `DATABASE_SCHEMA.generated.md`, but Forms domain does not.

**Authorization** (has):
```
authorization/
├── DATABASE_SCHEMA.generated.md  ← Consolidated schema
├── GETTING_STARTED.md
├── REVIEW_QUESTIONS.md
└── domain.md
```

**Forms** (missing):
```
forms/
├── domain.md
└── resources/
    ├── form.md          ← Has SQL, but not consolidated
    ├── form_field.md    ← Has SQL
    └── submission.md    ← Has SQL
```

**Recommendation**:
Create `specs/01-domains/forms/DATABASE_SCHEMA.generated.md` that consolidates:
- All table definitions
- All foreign keys
- All indexes
- Migration order
- Ash generator commands

---

### ℹ️ ISSUE #11: Inconsistent Feature File Coverage

**Severity**: Low
**Location**: Feature specifications

**Description**:
Authorization domain has comprehensive feature files (6 features), but Forms domain only has 2 features.

**Authorization** (comprehensive):
```
features/
├── audit_logging.feature.md
├── company_management.feature.md
├── company_settings.feature.md
├── multi_tenancy.feature.md
├── team_management.feature.md
└── user_management.feature.md
```

**Forms** (incomplete):
```
features/
├── form_management.feature.md
└── lead_management.feature.md
```

**Missing Forms Features**:
- `form_builder.feature.md` - Field management, drag-drop, reordering
- `analytics_dashboard.feature.md` - KPIs, charts, visualizations
- `csv_export.feature.md` - Export with filters
- `email_notifications.feature.md` - Immediate, daily, off preferences
- `user_settings.feature.md` - Profile, notifications, integrations placeholder

**Recommendation**:
Create additional feature files referenced in Forms resources:
- form_builder.feature.md (referenced in form.md and form_field.md)
- analytics_dashboard.feature.md (referenced in domain.md)
- csv_export.feature.md (referenced in submission.md)

OR update references to point to existing features only.

---

### ℹ️ ISSUE #12: Missing GETTING_STARTED.md for Forms

**Severity**: Low
**Location**: `specs/01-domains/forms/`

**Description**:
Authorization has a `GETTING_STARTED.md` guide, but Forms does not.

**Recommendation**:
Create `specs/01-domains/forms/GETTING_STARTED.md` with:
- Quick start guide for implementing Forms domain
- Prerequisites (Authorization domain must be implemented first)
- Step-by-step implementation order
- Testing guidelines

---

## 7. Missing Specifications

### ⚠️ ISSUE #13: Missing Public API Specification

**Severity**: Medium
**Location**: Forms domain

**Description**:
Forms domain has public endpoints (form embed, form submission) but lacks a comprehensive API specification.

**Current State**:
Public endpoints mentioned in resource specs:
- `form.md` - Embed Endpoint, Submit Endpoint (brief description)
- `submission.md` - Submit Endpoint (brief description)

**Missing**:
- Complete API contract (request/response formats)
- Error codes and responses
- Rate limiting specification
- CORS configuration
- Authentication bypass rules
- API versioning strategy
- Public API security considerations (CSRF, XSS, SQL injection prevention)

**Recommendation**:
Create `specs/01-domains/forms/PUBLIC_API.md` with:
- Complete endpoint documentation
- Request/response examples
- Error handling
- Security considerations
- Rate limiting (referenced in specs but not specified)

---

## 8. Recommendations

### High Priority (Before Implementation)

1. **Resolve Notification Ownership** (Issue #2)
   - Decision needed: Move to shared domain OR rename to FormNotification
   - Update all references in Authorization domain

2. **Clarify User Preferences Storage** (Issue #3)
   - Create UserPreferences resource specification
   - Define storage location (authn_user, authz_user, or separate table)
   - Update Forms and Authorization specs

3. **Define Service Consumers** (Issue #5)
   - Document event consumer services (Notification Service, Analytics, etc.)
   - Choose implementation approach (Ash Notifiers vs separate services)
   - Create service specifications OR mark as future integrations

4. **Create Public API Specification** (Issue #13)
   - Document public form endpoints
   - Specify rate limiting implementation
   - Define security measures

### Medium Priority (Before MVP Release)

5. **Add Forms DATABASE_SCHEMA.generated.md** (Issue #10)
   - Consolidate all Forms domain SQL
   - Include migration order and foreign key behaviors

6. **Create Missing Feature Files** (Issue #11)
   - form_builder.feature.md
   - analytics_dashboard.feature.md
   - csv_export.feature.md

7. **Standardize Table Naming** (Issue #6)
   - Consider adding `forms_` prefix to Forms tables
   - Document naming convention for future domains

### Low Priority (Nice to Have)

8. **Create Integrations Domain Spec** (Issue #1)
   - Document event bus approach
   - Specify cross-domain communication patterns

9. **Create Email Service Specification** (Issue #4)
   - Email templates catalog
   - Retry and error handling

10. **Add Forms GETTING_STARTED.md** (Issue #12)
    - Implementation guide
    - Prerequisites and dependencies

---

## Decision Log

### Decisions Needed

| Issue | Decision Required | Owners | Deadline |
|-------|-------------------|--------|----------|
| #2 | Notification resource ownership | Architecture, Backend | Before Forms implementation |
| #3 | User preferences storage location | Architecture, Backend | Before Forms implementation |
| #5 | Event consumer implementation approach | Architecture, Backend | Before Forms implementation |
| #6 | Table naming convention (forms_ prefix?) | Architecture, DBA | Before migrations |

### Decisions Made

| Date | Issue | Decision | Rationale |
|------|-------|----------|-----------|
| 2025-11-16 | Table conflicts | No conflicts found between Authorization and Forms | Different table names, no overlap |

---

## Appendix

### Review Methodology

1. **Structural Review**: Compared folder structure, file naming, and organization patterns
2. **Cross-Domain Analysis**: Checked for resource ownership conflicts and dependencies
3. **Database Schema Review**: Verified table names, foreign keys, and constraints
4. **Convention Analysis**: Checked naming consistency and documentation patterns
5. **Implementation Verification**: Compared specs against existing Authorization implementation

### Files Reviewed

**Authorization Domain** (existing, implemented):
- domain.md
- DATABASE_SCHEMA.generated.md
- 6 resource specs
- 6 feature files
- 4 policy files
- Existing implementation in `lib/clientt_crm_app/authorization/`

**Forms Domain** (new, proposed):
- domain.md
- 4 resource specs
- 2 feature files
- 1 policy file
- No implementation yet

**Other**:
- specs/README.md
- Migration files in `priv/repo/migrations/`
- Accounts domain (existing)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Next Review**: After critical issues (#2, #3, #5) are resolved
