# Spec System Quick Skill

## When to Use
Creating BDD/DDD specifications: domains, resources, features, integrations, policies.

## Folder Structure
```
/specs
├── 01-domains/[domain]/
│   ├── domain.md
│   ├── resources/[resource].md
│   ├── features/[feature].feature.md
│   └── policies/[policy].md
├── 02-features-cross-domain/[feature].feature.md
├── 03-integrations/[source]_to_[target]_integration.md
├── 04-architecture/[arc42 docs]
├── 90-generated-bdd/ (auto-generated, don't edit)
└── 99-coverage/ (reports)
```

## Quick Templates

### Domain (domain.md)
```markdown
# Domain: [Name]

**Status**: draft | review | approved

## Domain Purpose
[What this bounded context handles]

## Ubiquitous Language
- **[Term]**: [Definition]

## Domain Boundaries
### In Scope
- [Responsibility]
### Out of Scope  
- [Not handled here]

## Domain Events
### Published Events
| Event | Trigger | Payload | Consumers |
### Consumed Events
| Event | Source | Action |

## Resources
- [Resource] - [Purpose]
```

### Resource (resource.md)
```markdown
# Resource: [Name]

**Domain**: [Domain]
**Status**: draft | review | approved | implemented

## Purpose
[What it represents]

## Attributes
| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| tenant_id | uuid | Yes | valid tenant | Multi-tenancy |

## Business Rules
### Invariants
- [Must always be true]
### Validations
- [Field]: [Rule]

## State Transitions
```
new -> active -> closed
```

## Relationships
- **Belongs to**: [Parent]
- **Has many**: [Children]

## Domain Events
### Published Events
- `[resource].[event]`: When [condition]
### Subscribed Events  
- `[other].[event]`: Responds by [action]
```

### Feature (feature.feature.md)
```markdown
# Feature: [Name]

**Domain**: [Domain]
**Priority**: high | medium | low
**Status**: draft | review | approved | implemented

As a [role]
I want to [action]
So that [value]

## Acceptance Criteria
- [ ] [Criterion]

## Scenarios

### Scenario: [Happy Path]
**Tags**: `@happy-path @domain:[domain]`

```gherkin
Given [precondition]
When [action]
Then [outcome]
```

### Scenario: [Edge Case]
**Tags**: `@edge-case @domain:[domain]`

```gherkin
Given [edge condition]
When [action]
Then [handling]
```

### Scenario Outline: [Variations]
**Tags**: `@validation @domain:[domain]`

```gherkin
Given [setup with <param>]
When [action with <param>]
Then [outcome with <r>]

Examples:
| param | result | notes |
| val1  | res1   | tests X |
```
```

### Integration (integration.md)
```markdown
# Integration: [Source] to [Target]

**Type**: event-driven | api
**Status**: draft | review | approved | implemented

## Purpose
[Why communicate]

## Event Contract

### Event: `[source].[event]`

**Payload**:
```json
{
  "event_type": "[source].[event]",
  "occurred_at": "timestamp",
  "aggregate_id": "uuid",
  "data": { }
}
```

## ACL Translation
| Source Field | Target Field | Transform |
|--------------|--------------|-----------|
| field1 | field_a | direct |

## Error Handling
- **Validation Error**: [Action]
- **System Error**: [Retry policy]

## Idempotency
[How handled]
```

### Policy (policy.md)
```markdown
# Policy: [Name]

**Domain**: [Domain]
**Type**: authorization | validation | business-rule
**Status**: draft | review | approved | implemented

## Purpose
[What governs]

## Scope
- Resources: [List]
- Actions: [CRUD]
- Actors: [Roles]

## Rules

### Rule: [Name]
**Condition**: [When]
**Requirement**: [What]

**Examples**:
```yaml
# Allowed
actor: admin
action: delete
result: allowed

# Denied  
actor: user
action: delete
result: denied
```

## Authorization Matrix
| Role | Resource | Create | Read | Update | Delete |
|------|----------|--------|------|--------|--------|
| Admin | X | ✓ | ✓ | ✓ | ✓ |
| User | X | ✓ | ✓ | ✗ | ✗ |
```

## Best Practices

**DO**:
- Use real examples, not placeholders
- Write concrete Given-When-Then scenarios
- Define clear invariants and validations
- Link related specs
- Use numbered folders (01-, 02-, 90-)

**DON'T**:
- Be vague ("should be fast")
- Include implementation (DB tables)
- Mix concerns
- Edit 90-generated-bdd/ files

## Common Commands

```bash
# Create system
"Create spec system with domains: Sales, Marketing"

# Create specs
"Create domain spec for [domain]"
"Create resource spec for [resource] in [domain]"
"Create BDD feature for [feature]"
"Create integration from [source] to [target]"
"Create policy for [policy name]"

# Implement
"Implement per specs/01-domains/sales/resources/lead.md"
```

## File Naming
- Domains: `sales`, `user-management`
- Resources: `lead.md`, `form_submission.md`
- Features: `lead_assignment.feature.md`
- Integrations: `forms_to_sales_integration.md`
- Policies: `lead_permissions.md`

## Tags
```gherkin
@domain:[name]
@integration:[source]-[target]
@priority:[high|medium|low]
@status:[draft|approved|implemented]
@happy-path
@edge-case
@error-case
```
