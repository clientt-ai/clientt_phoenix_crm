# Authorization Domain - Getting Started

## Overview

This folder contains the complete BDD/DDD specification for the Authorization domain, which implements multi-tenant authorization for ClienttCRM.

## What's Here

### Core Specification
- **domain.md** - Domain definition, boundaries, events, and business rules

### Resource Specifications (6 resources)
All located in `resources/`:

1. **company.md** - Tenant organization (aggregate root)
2. **authz_user.md** - User authorization identity per company
3. **team.md** - Sub-groups within companies
4. **invitation.md** - Email-based invitation workflow
5. **company_settings.md** - Company configuration and limits
6. **audit_log.md** - Immutable audit trail

### Feature Specifications (6 feature files)
All located in `features/`:

1. **company_management.feature.md** - Company creation, switching, archival
2. **user_management.feature.md** - Invitations, role changes, member management
3. **team_management.feature.md** - Team creation, assignments, team roles
4. **company_settings.feature.md** - Settings management, feature flags, limits
5. **audit_logging.feature.md** - Audit trail, logging, compliance
6. **multi_tenancy.feature.md** - Data isolation, row-level security

### Policy Specifications (4 policy files)
All located in `policies/`:

1. **row_level_security.md** - Multi-tenancy enforcement, company_id filtering
2. **role_based_access.md** - RBAC authorization matrix for admin/manager/user
3. **invitation_security.md** - Token generation, validation, security
4. **rate_limiting.md** - Rate limiting for sensitive actions (1 per second per user)

### Integration Specifications (2 integration files)
Located in `../../03-integrations/`:

1. **accounts_to_authorization_integration.md** - Foreign key reference, user lifecycle events, first company auto-creation
2. **authorization_to_email_integration.md** - Email notifications for invitations and role changes

### Database Schema (1 generated file)
Located in root folder:

1. **DATABASE_SCHEMA.generated.md** - Consolidated database schema (tables, indexes, constraints, foreign keys)

### UI/UX Specifications (cross-domain)
Located in `../../05-ui-design/`:

- **README.md** - Design system overview, Figma workflow, LiveView implementation guidelines
- **design-tokens.md** - Global design tokens (colors, typography, spacing) for all domains
- **figma/FIGMA_LINK.md** - Link to shared Figma file (to be added before Phase 5)
- **components/** - Reusable component specifications (buttons, forms, tables, modals)
- **patterns/** - Common UI patterns (CRUD, list-detail, modal forms)
- **screens/authorization/** - Authorization domain screen specifications
- **screens/shared/** - Shared screens (dashboard, navigation)

## Quick Navigation

### For Developers
1. **Start here**: Read `domain.md` to understand the domain
2. **Then**: Review each resource spec in `resources/`
3. **BDD Scenarios**: Review feature specs in `features/` for acceptance criteria
4. **Authorization**: Review policy specs in `policies/` for security requirements
5. **Implementation**: Follow the Ash Resource Implementation Notes in each spec
6. **Testing**: Use feature specs for test-driven development

### For Architects
1. Review `domain.md` for domain boundaries and integration points
2. Check Domain Events section for pub/sub design
3. Review Multi-Tenancy Implementation section
4. Validate business rules and invariants

### For QA/Product
1. Review `domain.md` for business rules and invariants
2. **Primary**: Use BDD feature specs in `features/` for test scenarios (complete with Gherkin scenarios)
3. Reference original user stories in `dev_task_prompts/20251111-01-multitenancy/USER_STORIES.md`
4. Use resource specs for detailed acceptance criteria
5. Use policy specs for security testing requirements

## Implementation Order

Based on IMPLEMENTATION_PLAN.md:

### Phase 1 (Weeks 1-2): Core
1. Create `lib/clientt_crm_app/authorization.ex` (domain)
2. Implement `company.ex` resource per `resources/company.md`
3. Implement `authz_user.ex` resource per `resources/authz_user.md`
4. Implement policies per `policies/row_level_security.md` and `policies/role_based_access.md`
5. Write tests using scenarios from `features/company_management.feature.md` and `features/user_management.feature.md`

### Phase 2 (Week 3): Teams & Settings
1. Implement `team.ex` per `resources/team.md`
2. Implement `company_settings.ex` per `resources/company_settings.md`
3. Write tests using scenarios from `features/team_management.feature.md` and `features/company_settings.feature.md`

### Phase 3 (Week 4): Invitations
1. Implement `invitation.ex` per `resources/invitation.md`
2. Implement invitation security per `policies/invitation_security.md`
3. Implement email integration per `../../03-integrations/authorization_to_email_integration.md`
4. Write tests using invitation scenarios from `features/user_management.feature.md`

### Phase 4 (Week 5): Audit Logging
1. Implement `audit_log.ex` per `resources/audit_log.md`
2. Verify all policies are implemented (see `policies/` folder)
3. Add change hooks to all resources
4. Write tests using scenarios from `features/audit_logging.feature.md`

### Phase 5-6 (Weeks 6-8): UI & Migration
See IMPLEMENTATION_PLAN.md for details

## Key Design Decisions

### 1. Separation of Authentication and Authorization
- `authn_user` (users table) = WHO you are (login identity)
- `authz_user` (authz_users table) = WHAT you can do in each company
- Relationship: 1 authn_user → Many authz_users (one per company)

### 2. Row-Level Multi-Tenancy
- All tenant-scoped resources filtered by `company_id`
- Enforced through Ash policies
- Session stores `current_company_id` and `current_authz_user`

### 3. Simple RBAC (3 Roles)
- `admin` - Full company management
- `manager` - Team management, limited settings
- `user` - Standard resource access

### 4. Flat Team Structure
- Teams belong to company (no parent/child hierarchy in v1)
- Team roles: `team_lead`, `team_member`

## Related Documentation

### Original Specifications (Legacy)
These documents are in `dev_task_prompts/20251111-01-multitenancy/`:
- **SPECIFICATION.md** - Comprehensive technical spec (source material)
- **QUICK_REFERENCE.md** - Developer cheat sheet
- **USER_STORIES.md** - 21 user stories with acceptance criteria
- **IMPLEMENTATION_PLAN.md** - 8-week phased plan
- **README.md** - Overview and navigation

**Note**: The specifications in this `/specs` folder are the **source of truth** going forward. The `dev_task_prompts` folder contains the original detailed specification that was used to create these organized specs.

### Project Documentation
- **Project README**: `../../../README.md`
- **CLAUDE.md**: `../../../CLAUDE.md` (project-wide guidelines)
- **Ash Guidelines**: `.claude/skills/ash-guidelines/`

## Spec System Setup

This spec system was created following the `project_specs` skill guidelines:

### Why Use the Spec System?
- **Organized**: Numbered folders for natural sorting
- **Source of Truth**: Specs written before code
- **DDD/BDD**: Combines domain modeling with behavior scenarios
- **Maintainable**: Clear folder structure and naming conventions
- **Reviewable**: Specs can be reviewed via PR before implementation

### Folder Structure Explained
```
specs/
├── 01-domains/           # Domain models (START HERE)
│   └── authorization/
├── 02-features-cross-domain/  # Multi-domain features
├── 03-integrations/      # Domain communication
├── 04-architecture/      # System architecture
├── 90-generated-bdd/     # Auto-generated views (don't edit)
└── 99-coverage/          # Implementation tracking
```

## Specification Completion Status

### ✅ Completed (2025-11-11)

**Domain Specifications** (1/1): ✅
- domain.md

**Resource Specifications** (6/6): ✅
- company.md, authz_user.md, team.md, invitation.md, company_settings.md, audit_log.md

**Feature Specifications** (6/6): ✅ **NEW**
- company_management.feature.md
- user_management.feature.md
- team_management.feature.md
- company_settings.feature.md
- audit_logging.feature.md
- multi_tenancy.feature.md

**Policy Specifications** (4/4): ✅
- row_level_security.md
- role_based_access.md
- invitation_security.md
- rate_limiting.md

**Integration Specifications** (2/2): ✅ **NEW**
- accounts_to_authorization_integration.md
- authorization_to_email_integration.md

**Additional Files**:
- DATABASE_SCHEMA.generated.md
- UI/UX specifications (ui/ folder with README, design tokens, Figma link placeholder)

**Total**: 19 core specification files + 1 database schema + UI spec structure

**Note**: Last admin protection is not enforced. If a company has no admins, a DBA will manually restore access.

### What Was Added (2025-11-11)

Following project_specs skill guidelines, the following specifications were created to complete the BDD/DDD system:

1. **6 Feature Files**: Extracted from USER_STORIES.md, converted to proper Gherkin format with tags, covering all 21 user stories across 7 epics

2. **3 Policy Files**: Explicit authorization policies with authorization matrices, security considerations, and testing requirements

3. **2 Integration Files**: Cross-domain integration specifications with event contracts, data contracts, and error handling

### What Was Updated (2025-11-12)

Following comprehensive spec review and clarification, the following updates were made:

1. **Removed Last Admin Invariant**: Removed "must have at least one active admin" invariant from domain.md and company.md (DBA handles edge case)

2. **Added Rate Limiting Policy**: Created `rate_limiting.md` policy for sensitive actions (1 per second per user) to prevent abuse

3. **Database Schema Document**: Created `DATABASE_SCHEMA.generated.md` consolidating all table definitions, indexes, constraints, and foreign keys

4. **Company Archival Cascade**: Updated company.md to include automatic team archival when company is archived

5. **First Company Auto-Creation**: Updated domain.md and integration spec to specify Phase 1 implementation of automatic first company creation

6. **UI/UX Specifications**: Created cross-domain `specs/05-ui-design/` folder with complete design system structure (components, patterns, screens organized by domain)

### Why These Were Added

**Original State**:
- Original specs created in `dev_task_prompts/20251111-01-multitenancy/` (comprehensive but not following project structure)
- Resource and domain specs were excellent but lacked formal BDD features and policy specs

**Improvements**:
- Feature specs enable test-driven development with executable scenarios
- Policy specs make security model explicit and auditable
- Integration specs clarify cross-domain contracts
- Full compliance with project_specs skill system

**Going Forward**:
- Use `/specs/01-domains/authorization/` as source of truth
- Follow the spec templates for any new domains or resources
- Reference `dev_task_prompts/20251111-01-multitenancy/` for additional detail only

## Next Steps

1. **Review**: Team reviews this specification
2. **Approve**: Confirm design decisions and open questions
3. **Begin Phase 1**: Implement Company and AuthzUser resources
4. **Follow**: Use IMPLEMENTATION_PLAN.md for detailed tasks

## Questions or Issues?

1. Review resource specs for technical details
2. Check domain.md for business rules
3. Consult original SPECIFICATION.md for additional context
4. Reach out to project lead/architect

---

**Last Updated**: 2025-11-11
**Status**: Specification Complete - Ready for Implementation
