# Forms Builder Module - Specification Continuation

**Type**: Actionable Implementation Task
**Priority**: 🔴 Critical
**Status**: Ready to Execute
**Created**: 2025-11-14

## Overview

This dev_prompt contains actionable tasks to complete the Forms Builder Module specifications. These tasks are straightforward and can be executed without requiring investigation or stakeholder decisions.

## Parent Task

This is a continuation of the main Forms Builder Module planning from:
- **Parent Folder**: `dev_task_prompts/20251114-forms-builder-module/`
- **Related Issues**: See parent folder's `ISSUES.md` Issue #1

## Current Progress

**Completed**: 12 of 55 files (22%)
- ✅ 2 domain specifications
- ✅ 9 resource specifications
- ✅ 1 BDD feature specification

**Remaining**: 43 files (78%)

## Tasks to Complete

### 1. BDD Feature Specifications (8 files)

**Forms Domain** (4 files, ~4 hours):
- [ ] `specs/01-domains/forms/features/form_submission.feature.md`
  - Scenarios: Form submission, validation, post-submission actions
  - Cross-reference: Form, FormField, FormSubmission resources

- [ ] `specs/01-domains/forms/features/calendar_booking.feature.md`
  - Scenarios: Booking flow, availability check, confirmation, cancellation
  - Cross-reference: CalendarBooking resource, CalendarConnection integration

- [ ] `specs/01-domains/forms/features/chatbot_interaction.feature.md`
  - Scenarios: Chat widget interaction, message flow, lead capture
  - Cross-reference: ChatbotConversation, ChatbotLead resources

- [ ] `specs/01-domains/forms/features/lead_capture.feature.md`
  - Scenarios: Lead creation, scoring, deduplication, qualification
  - Cross-reference: ChatbotLead resource

**Integrations Domain** (4 files, ~4 hours):
- [ ] `specs/01-domains/integrations/features/google_calendar_oauth.feature.md`
  - Scenarios: OAuth flow, token refresh, error handling
  - Cross-reference: CalendarConnection resource

- [ ] `specs/01-domains/integrations/features/microsoft_calendar_oauth.feature.md`
  - Scenarios: OAuth flow, token refresh, error handling
  - Cross-reference: CalendarConnection resource

- [ ] `specs/01-domains/integrations/features/calendar_sync.feature.md`
  - Scenarios: Event creation, availability check, sync errors
  - Cross-reference: CalendarConnection, CalendarBooking resources

- [ ] `specs/01-domains/integrations/features/chatbot_configuration.feature.md`
  - Scenarios: Widget config, theme customization, working hours
  - Cross-reference: ChatbotConfig resource

### 2. Policy Specifications (4 files, ~4 hours)

**Forms Policies** (2 files):
- [ ] `specs/01-domains/forms/policies/form_access.md`
  - Authorization rules for form creation, editing, publishing
  - Row-level security for company isolation
  - Admin vs member permissions

- [ ] `specs/01-domains/forms/policies/booking_authorization.md`
  - Who can view/manage bookings
  - Privacy rules for booking data
  - Cross-company access prevention

**Integrations Policies** (2 files):
- [ ] `specs/01-domains/integrations/policies/integration_security.md`
  - Who can connect integrations
  - OAuth flow authorization
  - Token access controls

- [ ] `specs/01-domains/integrations/policies/token_management.md`
  - Encryption-at-rest requirements
  - Token decryption audit logging
  - Rotation policies

### 3. Cross-Domain Integration Specs (3 files, ~6 hours)

- [ ] `specs/03-integrations/forms_to_integrations_integration.md`
  - Events: forms.booking_requested → integrations creates calendar event
  - Data flow: Form submission → Calendar booking → External calendar

- [ ] `specs/03-integrations/forms_to_authorization_integration.md`
  - Events: authorization.company_deleted → forms archives all company forms
  - Multi-tenancy enforcement

- [ ] `specs/03-integrations/integrations_to_external_calendars.md`
  - API contracts for Google Calendar and Microsoft Outlook
  - Webhook handling (future)
  - Error recovery patterns

### 4. Domain Documentation (4 files, ~4 hours)

**Forms Domain**:
- [ ] `specs/01-domains/forms/GETTING_STARTED.md`
  - Developer onboarding guide
  - How to run tests
  - How to create a new resource
  - Common queries and patterns

- [ ] `specs/01-domains/forms/REVIEW_QUESTIONS.md`
  - Checklist for code reviews
  - Common gotchas
  - Performance considerations

**Integrations Domain**:
- [ ] `specs/01-domains/integrations/GETTING_STARTED.md`
  - OAuth setup and testing
  - Token encryption setup
  - Background job configuration

- [ ] `specs/01-domains/integrations/REVIEW_QUESTIONS.md`
  - Security checklist
  - OAuth best practices
  - Rate limiting considerations

### 5. Additional Pattern Documentation (3 files, ~3 hours)

- [ ] `specs/patterns/error_handling.md`
  - Error message conventions
  - User-facing vs log messages
  - Retry strategies
  - Circuit breaker patterns

- [ ] `specs/patterns/testing_strategy.md`
  - Unit test coverage targets
  - Integration test scope
  - E2E test scenarios (Playwright)
  - Performance test benchmarks

- [ ] `specs/patterns/migration_strategy.md`
  - Database migration workflow
  - Seed data for development
  - Test data factories
  - Production data migration plan

### 6. UI Specifications (19 files, ~20 hours)

**Components** (5 files):
- [ ] `specs/02-ui/components/form_field_editor.md`
- [ ] `specs/02-ui/components/drag_drop_field_list.md`
- [ ] `specs/02-ui/components/chatbot_widget.md`
- [ ] `specs/02-ui/components/calendar_picker.md`
- [ ] `specs/02-ui/components/lead_score_badge.md`

**Patterns** (4 files):
- [ ] `specs/02-ui/patterns/form_validation.md`
- [ ] `specs/02-ui/patterns/real_time_preview.md`
- [ ] `specs/02-ui/patterns/modal_workflows.md`
- [ ] `specs/02-ui/patterns/toast_notifications.md`

**Screens** (9 files):
- [ ] `specs/02-ui/screens/forms_list.md`
- [ ] `specs/02-ui/screens/form_builder.md`
- [ ] `specs/02-ui/screens/form_submissions_list.md`
- [ ] `specs/02-ui/screens/submission_detail.md`
- [ ] `specs/02-ui/screens/calendar_bookings_list.md`
- [ ] `specs/02-ui/screens/booking_detail.md`
- [ ] `specs/02-ui/screens/chatbot_leads_list.md`
- [ ] `specs/02-ui/screens/lead_detail.md`
- [ ] `specs/02-ui/screens/integration_settings.md`

**Reference**:
- [ ] `specs/02-ui/figma_reference.md`
  - Mapping from Figma to Phoenix LiveView
  - Component equivalencies
  - Design system notes

## Execution Order

Follow this order for best dependency management:

1. **Week 1**: Complete BDD features (8 files)
2. **Week 2**: Complete policies and integrations (7 files)
3. **Week 3**: Complete domain docs and patterns (7 files)
4. **Week 4**: Complete UI specs (19 files)
5. **Week 5**: Final review and issue documentation

## Quality Checklist

For each specification file created, ensure:
- [ ] Follows BDD/DDD template structure
- [ ] Contains concrete examples (no placeholders like "TBD")
- [ ] Cross-references related resources/features
- [ ] Includes business rules and validations
- [ ] Documents state transitions (if applicable)
- [ ] Provides code examples where helpful
- [ ] Lists testing scenarios
- [ ] Considers security implications
- [ ] Notes performance considerations

## Templates to Use

Refer to these existing files as templates:
- **BDD Feature**: `specs/01-domains/forms/features/form_builder.feature.md`
- **Resource**: `specs/01-domains/forms/resources/form.md`
- **Domain**: `specs/01-domains/forms/domain.md`

## Success Criteria

This task is complete when:
- ✅ All 43 remaining specification files are created
- ✅ All files pass the quality checklist
- ✅ Cross-references are validated (no broken links)
- ✅ Files are organized according to manifest
- ✅ Final review document is created

## Estimated Effort

**Total**: ~44 hours
- BDD features: 8 hours
- Policies: 4 hours
- Integrations: 6 hours
- Domain docs: 4 hours
- Patterns: 3 hours
- UI specs: 20 hours

**Timeline**: 5-6 weeks (assuming ~8 hours/week)

## Related Investigation Tasks

Some specifications may be affected by decisions made in these investigation tasks:
- `dev_task_prompts/20251114-forms-ui-component-research/` - UI component choices
- `dev_task_prompts/20251114-forms-oauth-implementation/` - OAuth technical decisions
- `dev_task_prompts/20251114-forms-business-logic-decisions/` - Feature scope decisions

**Recommendation**: Start with BDD features and policies (don't require investigation decisions), then pause for investigation results before completing UI specs.

## Output Location

All files created should go into the `specs/` directory following this structure:
```
specs/
├── 01-domains/
│   ├── forms/
│   │   ├── features/*.feature.md
│   │   ├── policies/*.md
│   │   ├── GETTING_STARTED.md
│   │   └── REVIEW_QUESTIONS.md
│   └── integrations/
│       ├── features/*.feature.md
│       ├── policies/*.md
│       ├── GETTING_STARTED.md
│       └── REVIEW_QUESTIONS.md
├── 02-ui/
│   ├── components/*.md
│   ├── patterns/*.md
│   ├── screens/*.md
│   └── figma_reference.md
├── 03-integrations/
│   └── *.md
└── patterns/
    └── *.md
```

## Next Steps

1. Review this README
2. Start with BDD feature specifications
3. Mark tasks complete in this README as you go
4. Create progress updates in this folder
5. Document any new issues discovered

---

**Status**: Ready to Begin
**Owner**: TBD
**Start Date**: TBD
