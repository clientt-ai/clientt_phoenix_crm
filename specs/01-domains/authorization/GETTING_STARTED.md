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

### Folders
- **features/** - BDD feature scenarios (to be created in Phase 3)
- **policies/** - Authorization policy specs (to be created in Phase 4)
- **resources/** - Entity/resource specifications (complete)

## Quick Navigation

### For Developers
1. **Start here**: Read `domain.md` to understand the domain
2. **Then**: Review each resource spec in `resources/`
3. **Implementation**: Follow the Ash Resource Implementation Notes in each spec
4. **Reference**: Keep resource specs open while coding

### For Architects
1. Review `domain.md` for domain boundaries and integration points
2. Check Domain Events section for pub/sub design
3. Review Multi-Tenancy Implementation section
4. Validate business rules and invariants

### For QA/Product
1. Review `domain.md` for business rules
2. Reference original user stories in `dev_task_prompts/20251111-01-multitenancy/USER_STORIES.md`
3. BDD features will be created in `features/` during implementation
4. Use resource specs for acceptance criteria

## Implementation Order

Based on IMPLEMENTATION_PLAN.md:

### Phase 1 (Weeks 1-2): Core
1. Create `lib/clientt_crm_app/authorization.ex` (domain)
2. Implement `company.ex` resource per `resources/company.md`
3. Implement `authz_user.ex` resource per `resources/authz_user.md`
4. Add policies for row-level tenancy
5. Write tests

### Phase 2 (Week 3): Teams & Settings
1. Implement `team.ex` per `resources/team.md`
2. Implement `company_settings.ex` per `resources/company_settings.md`
3. Write tests

### Phase 3 (Week 4): Invitations
1. Implement `invitation.ex` per `resources/invitation.md`
2. Create BDD features in `features/`
3. Implement email workflow
4. Write tests

### Phase 4 (Week 5): Audit Logging
1. Implement `audit_log.ex` per `resources/audit_log.md`
2. Create policy specs in `policies/`
3. Add change hooks to all resources
4. Write tests

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

## Why Weren't the Skills Used Initially?

**Investigation Result**:
The `project_specs-setup_spec_system` and `project_specs-generation` skills exist in `.claude/skills/` but are **not registered** in the available skills list. This means they exist as documentation but can't be invoked programmatically.

**What Was Done**:
1. Original specs created in `dev_task_prompts/20251111-01-multitenancy/` (comprehensive but not following project structure)
2. After investigation, manually followed the skill instructions to create proper `/specs` structure
3. Migrated content into organized spec system following BDD/DDD templates

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
