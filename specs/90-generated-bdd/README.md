# Generated BDD Views

⚠️ **DO NOT EDIT FILES IN THIS FOLDER DIRECTLY**

This folder contains auto-generated aggregated views of BDD scenarios.

## Source of Truth

The actual feature specifications are in:
- `/specs/01-domains/[domain]/features/` - Domain-specific features
- `/specs/02-features-cross-domain/` - Multi-domain features

## How to Update

To update these views:
1. Edit source feature files in the locations above
2. Request aggregation: "Aggregate all scenarios into specs/90-generated-bdd/"

Or create a script:
```bash
#!/bin/bash
# scripts/aggregate-scenarios.sh
# Regenerates all aggregated BDD views
```

## What's Here

- `all-scenarios.feature` - Every scenario in one file (when generated)
- `by-domain/` - Scenarios grouped by domain (when generated)
- `by-persona/` - Scenarios grouped by user role (when generated)

## Status

**Not yet generated** - BDD feature files will be created in Phase 3 of implementation.

Once feature specs are written in `01-domains/authorization/features/`, they can be aggregated here for:
- Test generation
- Documentation
- Stakeholder review
- QA planning

## Future Structure

When generated, this folder will contain:

```
90-generated-bdd/
├── README.md (this file)
├── all-scenarios.feature
├── by-domain/
│   └── authorization.feature
└── by-persona/
    ├── admin.feature
    ├── manager.feature
    └── user.feature
```

## Last Generated

Not yet generated

## Related

- See `USER_STORIES.md` in `dev_task_prompts/20251111-01-multitenancy/` for user story format
- BDD features will be created when implementing authorization domain
