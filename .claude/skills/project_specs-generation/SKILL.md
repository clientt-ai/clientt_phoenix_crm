# BDD/DDD Specification Generator Skill

## Skill Purpose

This skill enables you to generate comprehensive BDD (Behavior-Driven Development) and DDD (Domain-Driven Design) specifications for software projects. Use it to create structured requirement artifacts that serve as living documentation and source of truth for implementation.

## When to Use This Skill

Trigger this skill when you need to:
- Set up a complete specification system for a project
- Create domain specifications (bounded contexts)
- Generate resource specifications (entities, aggregates)
- Write BDD feature scenarios with Given-When-Then
- Document integrations between domains
- Create authorization/validation policy specifications
- Establish folder structure for specs in a git repository

## Folder Structure

All specifications live in `/specs` with numbered prefixes for natural sorting:

```
/specs
├── README.md
├── 01-domains/                        # Domain models & bounded contexts
│   └── [domain-name]/
│       ├── domain.md                  # Domain definition
│       ├── resources/                 # Entities & aggregates
│       ├── features/                  # BDD scenarios
│       └── policies/                  # Authorization & rules
├── 02-features-cross-domain/          # Multi-domain features
├── 03-integrations/                   # Domain communication specs
├── 04-architecture/                   # System architecture (arc42)
├── 90-generated-bdd/                  # Auto-generated aggregated views
└── 99-coverage/                       # Metrics & tracking
```

**Numbering scheme**:
- 01-09: Core specifications (source files you edit)
- 90-99: Generated/derived content (don't edit directly)

## Specification Types

### 1. Domain Specification

**File**: `01-domains/[domain-name]/domain.md`

**Template**:
```markdown
# Domain: [DomainName]

**Status**: draft | review | approved
**Last Updated**: YYYY-MM-DD
**Owner**: [Team/Person]

## Domain Purpose
[What this bounded context handles]

## Ubiquitous Language
- **[Term]**: [Definition in domain context]

## Domain Boundaries

### In Scope
- [Responsibility 1]

### Out of Scope
- [What this domain does NOT handle]

### Integration Points
- **[OtherDomain]**: [How they interact]

## Core Business Rules
1. **[Rule]**: [Description and rationale]

## Domain Events

### Published Events
| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| [domain].[event] | [When] | [Data] | [Who] |

### Consumed Events
| Event Name | Source | Handler Action |
|------------|--------|----------------|
| [other].[event] | [Source] | [Action] |

## Resources in This Domain
- [Resource1] - [Purpose]

## Aggregate Roots
- **[Root]**: Ensures [invariant]
```

---

### 2. Resource Specification

**File**: `01-domains/[domain]/resources/[resource].md`

**Template**:
```markdown
# Resource: [ResourceName]

**Domain**: [DomainName]
**Status**: draft | review | approved | implemented
**Last Updated**: YYYY-MM-DD

## Purpose
[What this resource represents]

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| [attr] | [type] | [Y/N] | [rules] | [description] |

## Business Rules

### Invariants
- [Rule that must always be true]

### Validations
- [Field]: [Validation rule and rationale]

## State Transitions

```
[initial] -> [state1] -> [state2] -> [final]
```

**Valid Transitions**:
- `initial → state1`: When [condition]

## Relationships
- **Belongs to**: [Parent] (many-to-one)
- **Has many**: [Children] (one-to-many)
- **References**: [Other] (for ACL/read-only)

## Domain Events

### Published Events
- `[resource].[event]`: Triggered when [condition]
  - Payload: {field1, field2}

### Subscribed Events
- `[other].[event]`: Responds by [action]

## Access Patterns

### Queries
- List all [resources] for [context]
- Find [resource] by [criteria]

### Common Operations
- Create: Requires [data]
- Update: Can modify [fields]
- Delete: Cascades to [related]
```

---

### 3. Feature Specification (BDD)

**File**: 
- Single domain: `01-domains/[domain]/features/[feature].feature.md`
- Cross-domain: `02-features-cross-domain/[feature].feature.md`

**Template**:
```markdown
# Feature: [Feature Name]

**Domain**: [DomainName]
**Priority**: high | medium | low
**Status**: draft | review | approved | implemented

## Feature Description

As a [user role]
I want to [action]
So that [business value]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Scenarios

### Scenario: [Happy Path Name]
**Tags**: `@happy-path @domain:[domain]`
**Status**: implemented | pending

```gherkin
Given [precondition]
  And [another precondition]
When [action]
  And [another action]
Then [expected outcome]
  And [another outcome]
```

### Scenario: [Edge Case Name]
**Tags**: `@edge-case @domain:[domain]`
**Status**: implemented | pending

```gherkin
Given [edge condition]
When [action]
Then [expected handling]
```

### Scenario Outline: [Parameterized Name]
**Tags**: `@validation @domain:[domain]`
**Status**: implemented | pending

```gherkin
Given [setup with <parameter>]
When [action with <parameter>]
Then [outcome with <r>]

Examples:
| parameter | result | description |
| value1    | result1 | what this tests |
| value2    | result2 | what this tests |
```

## Cross-Domain Impacts

### Events Triggered
- `[domain].[event]`: [When and why]

### Events Consumed
- `[other].[event]`: [How it affects this]

## Security Considerations
- [ ] Authorization: [Who can do this]
- [ ] Validation: [What must be validated]
- [ ] Audit: [What must be logged]
```

---

### 4. Integration Specification

**File**: `03-integrations/[source]_to_[target]_integration.md`

**Template**:
```markdown
# Integration: [Source] to [Target]

**Type**: event-driven | api | shared-database
**Status**: draft | review | approved | implemented
**Last Updated**: YYYY-MM-DD

## Integration Purpose
[Why these domains communicate]

## Communication Pattern

### Direction
- [Source] → [Target]
- Type: [Async/Sync, Event/API]

### Trigger
[What causes this integration]

## Anti-Corruption Layer (ACL)

### Source Domain Model
```yaml
SourceResource:
  field1: type
  field2: type
```

### Target Domain Model
```yaml
TargetResource:
  field_a: type
  field_b: type
```

### Translation Rules
| Source Field | Target Field | Transformation | Notes |
|--------------|--------------|----------------|-------|
| field1 | field_a | direct | 1:1 mapping |
| field2 | field_b | transform() | [description] |

## Event Contract

### Event: `[source].[event_name]`

**Payload Schema**:
```json
{
  "event_type": "[source].[event]",
  "occurred_at": "timestamp",
  "aggregate_id": "uuid",
  "data": {
    "field1": "value"
  }
}
```

**Required Fields**: [List required fields]

## Consumer Behavior

### Processing Logic
1. [Step 1: What target domain does]
2. [Step 2: Transformations]

### Error Handling
- **Validation Error**: [What happens]
- **Business Rule Violation**: [What happens]
- **System Error**: [Retry policy]

### Idempotency
[How duplicates are prevented]

## Monitoring
- Metrics: [What to track]
- Alerts: [When to alert]
```

---

### 5. Policy Specification

**File**: `01-domains/[domain]/policies/[policy].md`

**Template**:
```markdown
# Policy: [PolicyName]

**Domain**: [DomainName]
**Type**: authorization | validation | business-rule | multi-tenancy
**Status**: draft | review | approved | implemented
**Last Updated**: YYYY-MM-DD

## Policy Purpose
[What this policy governs]

## Scope
**Applies to**:
- Resources: [List]
- Actions: [create, read, update, delete]
- Actors: [user roles, services]

## Policy Rules

### Rule 1: [Rule Name]
**Condition**: [When applies]
**Requirement**: [What must be true]
**Enforcement**: [How checked]

**Examples**:
```yaml
# Allowed
actor: admin
action: delete
resource: lead
result: allowed

# Denied
actor: sales_rep
action: delete
resource: lead
result: denied with "Insufficient permissions"
```

## Authorization Matrix

| Role | Resource | Create | Read | Update | Delete |
|------|----------|--------|------|--------|--------|
| Admin | Lead | ✓ | ✓ | ✓ | ✓ |
| Sales Rep | Lead | ✓ | ✓ | ✓ | ✗ |

## Multi-Tenancy Rules
- [Resource] must be scoped to `tenant_id`
- Cross-tenant access: [policy]

## Validation Rules

| Field | Validation | Error Message |
|-------|------------|---------------|
| email | RFC 5322 | "Invalid email" |
```

---

## Usage Instructions

### Setting Up a New Spec System

When asked to create a spec system:

1. **Ask about domains**: "What are the main bounded contexts/domains?"
2. **Create folder structure**:
   ```
   specs/
   ├── README.md
   ├── 01-domains/
   ├── 02-features-cross-domain/
   ├── 03-integrations/
   ├── 04-architecture/
   ├── 90-generated-bdd/
   └── 99-coverage/
   ```
3. **Generate domain.md** for each domain
4. **Create resource specs** for key entities
5. **Add README.md** with navigation guidance

### Creating Individual Specs

1. **Identify spec type**: Domain, resource, feature, integration, or policy
2. **Use appropriate template** from above
3. **Fill with concrete examples**: Use real data, not placeholders
4. **Add cross-references**: Link related specs
5. **Place in correct location**: Follow folder structure

### Best Practices

**DO**:
- Use concrete examples with specific data
- Write Given-When-Then scenarios for features
- Define clear business rules and invariants
- Link related specifications
- Use ubiquitous language from domain.md

**DON'T**:
- Use vague requirements ("should be fast")
- Include implementation details (database tables)
- Mix concerns (authorization in resource specs)
- Use placeholders like [TODO] or [TBD]
- Edit files in 90-generated-bdd/ (they're auto-generated)

### File Naming Conventions

- **Domains**: lowercase-with-hyphens (`sales`, `user-management`)
- **Resources**: lowercase_with_underscores (`lead.md`, `form_submission.md`)
- **Features**: lowercase_with_underscores (`lead_assignment.feature.md`)
- **Integrations**: `[source]_to_[target]_integration.md`
- **Policies**: descriptive (`lead_permissions.md`, `tenant_isolation.md`)

### Tags for BDD Features

```gherkin
@domain:[name]              # Which domain
@integration:[source]-[target]  # Which integration
@priority:[high|medium|low]     # Priority
@status:[draft|approved|implemented]
@happy-path                 # Main success scenario
@edge-case                  # Edge case handling
@error-case                 # Error handling
@smoke-test                 # Include in smoke tests
```

## Examples

### Example 1: Create Domain Spec

**User**: "Create a domain specification for Sales"

**Response**:
```markdown
# Domain: Sales

**Status**: draft
**Last Updated**: 2024-11-11
**Owner**: Sales Team

## Domain Purpose
Manages the sales pipeline from lead capture through opportunity closure, including lead qualification, territory assignment, and deal progression.

## Ubiquitous Language
- **Lead**: A potential customer who has shown interest
- **Opportunity**: A qualified lead with defined potential value
- **Territory**: Geographic or market segment assigned to sales reps
- **Qualification**: Process of determining if a lead meets sales criteria

## Domain Boundaries

### In Scope
- Lead management and qualification
- Opportunity tracking and progression
- Territory and rep assignment
- Sales forecasting

### Out of Scope
- Marketing campaign management (Marketing domain)
- Customer onboarding after sale (Success domain)
- Billing and invoicing (Billing domain)

### Integration Points
- **Forms**: Receives leads from form submissions
- **Marketing**: Receives campaign-generated leads
- **Billing**: Sends closed deals for invoicing

[Continue with rest of template...]
```

### Example 2: Create Resource Spec

**User**: "Create a resource spec for Lead in Sales domain"

**Response**: [Creates complete lead.md with attributes like id, email, company, status, assigned_to, territory, etc., with business rules about state transitions, validation rules, and relationships]

### Example 3: Create BDD Feature

**User**: "Create a BDD feature for automatic lead assignment"

**Response**: [Creates lead_assignment.feature.md with scenarios for assigning to lowest-load rep, handling capacity limits, territory-based assignment, etc.]

## Common Patterns

### Cross-Referencing Specs

In feature files, reference related specs:
```markdown
## Cross-Domain Impacts

### Integration Required
See: [03-integrations/forms_to_sales_integration.md](../../03-integrations/forms_to_sales_integration.md)

### Resources Affected
- [Lead](../resources/lead.md)
- [Territory](../resources/territory.md)
```

### Multi-Tenancy Considerations

Include tenant_id in resources:
```markdown
## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| tenant_id | uuid | Yes | valid tenant | Multi-tenancy scope |
```

And in policies:
```markdown
## Multi-Tenancy Rules
- All Lead queries must filter by `tenant_id`
- Cross-tenant access denied except for platform admins
```

## Generated BDD Views

The `90-generated-bdd/` folder contains auto-generated aggregated views:

- **all-scenarios.feature**: Every scenario from all domains
- **by-domain/[domain].feature**: Scenarios grouped by domain
- **by-persona/[role].feature**: Scenarios grouped by user role

**How to generate**: Ask "Aggregate all scenarios into specs/90-generated-bdd/"

**Important**: Never edit these files directly - they're regenerated from source feature specs.

## Integration with Implementation

When implementing features, reference the specs:

```
"Implement the Lead resource per specs/01-domains/sales/resources/lead.md"

"Implement lead assignment per specs/01-domains/sales/features/lead_assignment.feature.md"

"Implement the forms-to-sales integration per specs/03-integrations/forms_to_sales_integration.md"
```

## Remember

- Specs are source of truth - write them BEFORE code
- Review specs via PR before implementation
- Update specs when requirements change
- Use concrete examples, not abstractions
- Link related specifications
- Follow the folder structure consistently
