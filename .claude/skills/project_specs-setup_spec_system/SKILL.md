---
name: project_specs-setup_spec_system
description: Set up BDD/DDD specification folder structure and initial files for a project
---

# Spec System Setup Skill

## Purpose
Set up BDD/DDD specification folder structure and initial files for a project.

## When to Use

**Use this skill FIRST** when initializing a specification system. This is the entry point for spec creation.

Trigger this skill when:
- Starting a new project that needs specifications
- Adding specifications to an existing project
- User asks to "set up specs" or "create a spec system"

**After Setup:**
- Use `project_specs-generation` to create individual specification documents
- Use `project_specs-quick_reference` for fast template lookups

**Proactive Usage:**
When starting a new feature or domain, suggest setting up specs first if they don't exist yet.

**Integration:**
- Specs should be created before implementing code (see `ash-guidelines`, `liveview-guidelines`)
- Use git to track spec changes alongside code changes

## Folder Structure to Create

```bash
mkdir -p specs/{01-domains,02-features-cross-domain,03-integrations,04-architecture,05-ui-design/{components,patterns,screens,figma},90-generated-bdd/{by-domain,by-persona},99-coverage}
```

Creates:
```
specs/
├── 01-domains/
├── 02-features-cross-domain/
├── 03-integrations/
├── 04-architecture/
├── 05-ui-design/                   # Cross-domain UI/UX specifications
│   ├── components/                 # Reusable component specs
│   ├── patterns/                   # Common UI patterns
│   ├── screens/                    # Screen designs by domain
│   └── figma/                      # Figma links and exports
├── 90-generated-bdd/
│   ├── by-domain/
│   └── by-persona/
└── 99-coverage/
```

## Setup Workflow

### 1. Ask About Domains
"What are the main bounded contexts/domains in your system?"

Example answers: "Sales, Marketing, Forms", "Users, Products, Orders", etc.

### 2. Create Domain Folders
For each domain:
```bash
mkdir -p specs/01-domains/[domain-name]/{resources,features,policies}
```

### 3. Create README.md

**File**: `specs/README.md`

```markdown
# Specifications

This folder contains the specifications for [Project Name].

## Folder Structure

- **01-domains/** - Domain models and bounded contexts
  - Each domain has: `domain.md`, `/resources`, `/features`, `/policies`
- **02-features-cross-domain/** - Features spanning multiple domains
- **03-integrations/** - Specifications for domain communication
- **04-architecture/** - System architecture documentation (arc42)
- **05-ui-design/** - Cross-domain UI/UX design system (DaisyUI, Tailwind, Figma)
  - Design tokens, components, patterns, screen specs organized by domain
- **90-generated-bdd/** - Auto-generated aggregated BDD views (don't edit)
- **99-coverage/** - Implementation tracking and metrics

## Domains

- **[Domain1]**: [Brief description]
- **[Domain2]**: [Brief description]
- **[Domain3]**: [Brief description]

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
```

### 4. Create Domain Specs

For each domain, create `01-domains/[domain]/domain.md`:

```markdown
# Domain: [DomainName]

**Status**: draft
**Last Updated**: [Today's date]
**Owner**: [Team]

## Domain Purpose
[One paragraph explaining what this domain handles]

## Ubiquitous Language
- **[Key Term 1]**: [Definition]
- **[Key Term 2]**: [Definition]
- **[Key Term 3]**: [Definition]

## Domain Boundaries

### In Scope
- [Core responsibility 1]
- [Core responsibility 2]
- [Core responsibility 3]

### Out of Scope
- [What belongs in other domains]
- [What's not handled here]

### Integration Points
- **[Other Domain]**: [How they interact - events, APIs, etc]

## Core Business Rules
1. **[Rule Name]**: [Description and why it exists]
2. **[Rule Name]**: [Description and why it exists]

## Domain Events

### Published Events
| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| [domain].[action] | [When published] | {data} | [Which domains] |

### Consumed Events
| Event Name | Source | Handler Action |
|------------|--------|----------------|
| [other].[action] | [Source domain] | [What we do] |

## Resources in This Domain
- **[Resource1]** - [Brief purpose]
- **[Resource2]** - [Brief purpose]
- **[Resource3]** - [Brief purpose]

## Aggregate Roots
- **[Root1]**: Ensures [which invariant]
```

### 5. Create Generated BDD README

**File**: `specs/90-generated-bdd/README.md`

```markdown
# Generated BDD Views

⚠️ **DO NOT EDIT FILES IN THIS FOLDER DIRECTLY**

This folder contains auto-generated aggregated views of BDD scenarios.

## Source of Truth

The actual feature specifications are in:
- `/specs/01-domains/[domain]/features/`
- `/specs/02-features-cross-domain/`

## How to Update

To update these views:
1. Edit source feature files
2. Run aggregation: "Aggregate all scenarios into specs/90-generated-bdd/"

Or create a script:
```bash
#!/bin/bash
# scripts/aggregate-scenarios.sh
# Regenerates all aggregated BDD views
```

## What's Here

- `all-scenarios.feature` - Every scenario in one file
- `by-domain/` - Scenarios grouped by domain
- `by-persona/` - Scenarios grouped by user role

## Last Generated
[Date] by [Person/CI]
```

### 6. Create Initial Resource Specs

For each domain's key resources, create resource specs in:
`01-domains/[domain]/resources/[resource].md`

Ask: "What are the main entities/resources in [domain]?"

## Example Output

When asked "Create a spec system for a CRM with domains: Sales, Marketing, Forms":

1. Create folder structure
2. Create specs/README.md with CRM context
3. Create domain specs:
   - `01-domains/sales/domain.md`
   - `01-domains/marketing/domain.md`
   - `01-domains/forms/domain.md`
4. Create resource folders for each
5. Create 90-generated-bdd/README.md
6. Suggest next steps:
   - "Now create resource specs for key entities"
   - "Create feature specs for main workflows"
   - "Document integrations between domains"

## Checklist

- [ ] Created folder structure
- [ ] Created specs/README.md
- [ ] Created domain.md for each domain
- [ ] Created resource folders
- [ ] Created 90-generated-bdd/README.md
- [ ] Explained next steps to user

## Questions to Ask

1. "What are the main domains/bounded contexts?"
2. "For [domain], what are the key entities/resources?"
3. "Are there any cross-domain workflows we should document?"
4. "Do you need multi-tenancy support?"
5. "Should I create initial resource specs or just the structure?"

## Templates Location

Full templates available in main SPEC_SYSTEM.md or skill-bdd-ddd-spec-generator.md

## Quick Start Commands

After setup, user can:
```
"Create a resource spec for Lead in Sales domain"
"Create a BDD feature for lead assignment"  
"Create an integration from Forms to Sales"
"Generate domain spec for [new domain]"
```
