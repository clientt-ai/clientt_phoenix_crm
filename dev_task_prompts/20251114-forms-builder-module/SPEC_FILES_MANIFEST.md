# Specification Files Manifest

**Project**: Forms Builder Module
**Date**: 2025-11-14
**Purpose**: Complete list of all spec files to create or update

---

## Legend

- 🆕 **NEW**: File needs to be created
- 📝 **UPDATE**: Existing file needs updates
- ✅ **EXISTS**: File exists, no changes needed

---

## 1. Forms Domain Specifications

### Domain Files
- 🆕 `specs/01-domains/forms/domain.md`
- 🆕 `specs/01-domains/forms/GETTING_STARTED.md`
- 🆕 `specs/01-domains/forms/REVIEW_QUESTIONS.md`
- 🆕 `specs/01-domains/forms/DATABASE_SCHEMA.generated.md` (auto-generated later)

### Resources (6 files)
- 🆕 `specs/01-domains/forms/resources/form.md`
- 🆕 `specs/01-domains/forms/resources/form_field.md`
- 🆕 `specs/01-domains/forms/resources/form_submission.md`
- 🆕 `specs/01-domains/forms/resources/calendar_booking.md`
- 🆕 `specs/01-domains/forms/resources/chatbot_lead.md`
- 🆕 `specs/01-domains/forms/resources/chatbot_conversation.md`

### Features (5 files)
- 🆕 `specs/01-domains/forms/features/form_builder.feature.md`
- 🆕 `specs/01-domains/forms/features/form_submission.feature.md`
- 🆕 `specs/01-domains/forms/features/calendar_booking.feature.md`
- 🆕 `specs/01-domains/forms/features/chatbot_interaction.feature.md`
- 🆕 `specs/01-domains/forms/features/lead_capture.feature.md`

### Policies (2 files)
- 🆕 `specs/01-domains/forms/policies/form_access.md`
- 🆕 `specs/01-domains/forms/policies/booking_authorization.md`

**Forms Domain Subtotal**: 18 files

---

## 2. Integrations Domain Specifications

### Domain Files
- 🆕 `specs/01-domains/integrations/domain.md`
- 🆕 `specs/01-domains/integrations/GETTING_STARTED.md`
- 🆕 `specs/01-domains/integrations/REVIEW_QUESTIONS.md`
- 🆕 `specs/01-domains/integrations/DATABASE_SCHEMA.generated.md` (auto-generated later)

### Resources (3 files)
- 🆕 `specs/01-domains/integrations/resources/calendar_connection.md`
- 🆕 `specs/01-domains/integrations/resources/chatbot_config.md`
- 🆕 `specs/01-domains/integrations/resources/integration_credential.md`

### Features (4 files)
- 🆕 `specs/01-domains/integrations/features/google_calendar_oauth.feature.md`
- 🆕 `specs/01-domains/integrations/features/microsoft_calendar_oauth.feature.md`
- 🆕 `specs/01-domains/integrations/features/calendar_sync.feature.md`
- 🆕 `specs/01-domains/integrations/features/chatbot_configuration.feature.md`

### Policies (2 files)
- 🆕 `specs/01-domains/integrations/policies/integration_security.md`
- 🆕 `specs/01-domains/integrations/policies/token_management.md`

**Integrations Domain Subtotal**: 13 files

---

## 3. Cross-Domain Integration Specifications

**Location**: `specs/03-integrations/`

- 🆕 `specs/03-integrations/forms_to_integrations_integration.md`
- 🆕 `specs/03-integrations/forms_to_authorization_integration.md`
- 🆕 `specs/03-integrations/integrations_to_external_calendars.md`

**Cross-Domain Subtotal**: 3 files

---

## 4. UI Design Specifications

### 4.1 Component Specs

**Location**: `specs/05-ui-design/components/`

- 🆕 `specs/05-ui-design/components/calendar-booking.md`
- 🆕 `specs/05-ui-design/components/chatbot-widget.md`
- 🆕 `specs/05-ui-design/components/form-builder.md`
- 🆕 `specs/05-ui-design/components/kpi-cards.md`
- 🆕 `specs/05-ui-design/components/pre-connect-form.md`

**Component Specs Subtotal**: 5 files

---

### 4.2 Pattern Specs

**Location**: `specs/05-ui-design/patterns/`

- 🆕 `specs/05-ui-design/patterns/module-navigation.md`
- 🆕 `specs/05-ui-design/patterns/post-submission-actions.md`
- 🆕 `specs/05-ui-design/patterns/lead-capture-flow.md`
- 🆕 `specs/05-ui-design/patterns/calendar-booking-flow.md`

**Pattern Specs Subtotal**: 4 files

---

### 4.3 Screen Specs - Shared

**Location**: `specs/05-ui-design/screens/shared/`

- 📝 `specs/05-ui-design/screens/shared/dashboard.md` (UPDATE)
- 📝 `specs/05-ui-design/screens/shared/navigation.md` (UPDATE)

**Shared Screens Subtotal**: 2 files (updates)

---

### 4.4 Screen Specs - Forms Module

**Location**: `specs/05-ui-design/screens/forms/`

**New folder and files**:
- 🆕 `specs/05-ui-design/screens/forms/forms-list.md`
- 🆕 `specs/05-ui-design/screens/forms/form-builder.md`
- 🆕 `specs/05-ui-design/screens/forms/calendar-builder.md`
- 🆕 `specs/05-ui-design/screens/forms/chatbot-management.md`
- 🆕 `specs/05-ui-design/screens/forms/analytics.md`
- 🆕 `specs/05-ui-design/screens/forms/settings-integrations.md`
- 🆕 `specs/05-ui-design/screens/forms/settings-team-calendar.md`

**Forms Screens Subtotal**: 7 files

---

### 4.5 Figma Reference

**Location**: `specs/05-ui-design/figma/`

- 🆕 `specs/05-ui-design/figma/forms-builder-module.md` (Reference to Figma source)

**Figma Reference Subtotal**: 1 file

---

**UI Design Total**: 19 files (17 new, 2 updates)

---

## 5. Dev Task Prompts Documentation

**Location**: `dev_task_prompts/20251114-forms-builder-module/`

- ✅ `dev_task_prompts/20251114-forms-builder-module/PLANNING.md` (CREATED)
- ✅ `dev_task_prompts/20251114-forms-builder-module/SPEC_FILES_MANIFEST.md` (THIS FILE)
- 🆕 `dev_task_prompts/20251114-forms-builder-module/ISSUES.md` (To be created after review)
- 🆕 `dev_task_prompts/20251114-forms-builder-module/FIGMA_SOURCE_SUMMARY.md` (Optional)

**Dev Task Prompts Subtotal**: 4 files (2 created, 2 pending)

---

## Grand Total

| Category | New Files | Updates | Total |
|----------|-----------|---------|-------|
| Forms Domain | 18 | 0 | 18 |
| Integrations Domain | 13 | 0 | 13 |
| Cross-Domain Integrations | 3 | 0 | 3 |
| UI Components | 5 | 0 | 5 |
| UI Patterns | 4 | 0 | 4 |
| UI Screens (Shared) | 0 | 2 | 2 |
| UI Screens (Forms) | 7 | 0 | 7 |
| UI Figma Reference | 1 | 0 | 1 |
| Dev Task Prompts | 2 | 0 | 2 |
| **GRAND TOTAL** | **53** | **2** | **55** |

---

## Execution Order

### Recommended Creation Order

**Phase 1: Domain Foundations** (Critical Path)
1. Forms domain structure (domain.md, GETTING_STARTED.md, REVIEW_QUESTIONS.md)
2. Integrations domain structure (domain.md, GETTING_STARTED.md, REVIEW_QUESTIONS.md)
3. Forms resources (all 6 resource files)
4. Integrations resources (all 3 resource files)

**Phase 2: Features & Policies**
5. Forms features (all 5 feature files)
6. Integrations features (all 4 feature files)
7. Forms policies (2 policy files)
8. Integrations policies (2 policy files)

**Phase 3: Integrations**
9. Cross-domain integration specs (all 3 files)

**Phase 4: UI Specifications**
10. UI component specs (5 files)
11. UI pattern specs (4 files)
12. UI screen specs - Forms (7 files)
13. UI screen specs - Shared updates (2 files)
14. Figma reference (1 file)

**Phase 5: Review & Issues**
15. Review all created specs
16. Create ISSUES.md with any open questions or concerns

---

## Dependencies

### Blocking Dependencies

- **Forms resources** must be created before **Forms features**
- **Integrations resources** must be created before **Integrations features**
- **Domain specs** must be created before **cross-domain integration specs**
- **Component specs** should be created before **screen specs** (so screens can reference components)

### Reference Dependencies

- **Forms features** reference **Authorization domain** (for multi-tenancy)
- **Integration features** reference **External APIs** (Google Calendar, Microsoft Graph)
- **Screen specs** reference **Figma source** (figma_src/105_form_builder_module/)
- **UI components** reference **DaisyUI library**

---

## Validation Checklist

Before marking specs as complete, verify:

- [ ] All Ash resource specs follow project_specs-generation skill format
- [ ] All BDD features use Gherkin syntax correctly
- [ ] All UI screens reference appropriate DaisyUI components
- [ ] All integration specs document data flow clearly
- [ ] All specs include multi-tenancy considerations
- [ ] All specs include authorization/security policies
- [ ] Phoenix LiveView patterns are documented consistently
- [ ] Cross-references between specs are accurate

---

## Progress Tracking

Use this section to track completion (will be moved to ISSUES.md after review):

### Forms Domain
- [ ] Domain structure (3/3 files)
- [ ] Resources (0/6 files)
- [ ] Features (0/5 files)
- [ ] Policies (0/2 files)

### Integrations Domain
- [ ] Domain structure (3/3 files)
- [ ] Resources (0/3 files)
- [ ] Features (0/4 files)
- [ ] Policies (0/2 files)

### Cross-Domain Integrations
- [ ] Integration specs (0/3 files)

### UI Design
- [ ] Components (0/5 files)
- [ ] Patterns (0/4 files)
- [ ] Forms screens (0/7 files)
- [ ] Shared screen updates (0/2 files)
- [ ] Figma reference (0/1 file)

---

**Status**: Manifest Complete, Ready for Execution
**Next Action**: Begin Phase 1 - Domain Foundations
