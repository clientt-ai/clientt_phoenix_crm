# Specifications

This folder contains the specifications for ClienttCRM.

## Folder Structure

- **01-domains/** - Domain models and bounded contexts
  - Each domain has: `domain.md`, `/resources`, `/features`, `/policies`
- **02-features-cross-domain/** - Features spanning multiple domains
- **03-integrations/** - Specifications for domain communication
- **04-architecture/** - System architecture documentation (arc42)
- **90-generated-bdd/** - Auto-generated aggregated BDD views (don't edit)
- **99-coverage/** - Implementation tracking and metrics

## Domains

- **Authorization**: Multi-tenant authorization system with companies, users, teams, invitations, settings, and audit logging
- **Forms**: Custom form builder and lead management system with submission tracking, analytics, and notifications

## Getting Started

1. Read domain specifications: `01-domains/[domain]/domain.md`
2. Check resources: `01-domains/[domain]/resources/`
3. Review features: `01-domains/[domain]/features/`
4. Understand integrations: `03-integrations/`

## Workflow

1. **Write specs first** - Define requirements before coding
2. **Review via PR** - Team reviews specifications
3. **Approve** - Specs become source of truth
4. **Implement** - Code matches specifications
5. **Update** - Keep specs synchronized with code

## Current Specifications

### Authorization Domain
- **Status**: Specification complete, ready for implementation
- **Location**: `01-domains/authorization/`
- **Resources**: Company, AuthzUser, Team, Invitation, CompanySettings, AuditLog
- **Features**: Multi-company membership, role-based access, team organization, invitation workflow
- **Implementation Plan**: 8-week phased approach (320 hours estimated)

### Forms Domain
- **Status**: Specification complete, ready for implementation
- **Location**: `01-domains/forms/`
- **Resources**: Form, FormField, Submission, Notification
- **Features**: Form builder (10 field types), public submissions, lead management workflow, analytics & KPIs, email & in-app notifications, CSV export
- **MVP Scope**: Single-page forms, basic validation, real-time analytics, no file upload
- **Implementation Plan**: 6-week MVP (Phase 2)

### Related Documentation

**Authorization Domain:**
- Original task prompt: `../dev_task-prompts_and_plans/20251111-01-multitenancy/`

**Forms Domain:**
- Original planning: `../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/`
- MVP scope document: `../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-00-forms-project-overview/MVP-SCOPE-FINALIZED.md`

**Project-Wide:**
- **Project README**: `../README.md`
- **CLAUDE.md**: `../CLAUDE.md` (project-wide guidelines)
