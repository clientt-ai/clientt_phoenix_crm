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

### Related Documentation
- **Original task prompt**: `../dev_task_prompts/20251111-01-multitenancy/`
- **Project README**: `../README.md`
- **CLAUDE.md**: `../CLAUDE.md` (project-wide guidelines)
