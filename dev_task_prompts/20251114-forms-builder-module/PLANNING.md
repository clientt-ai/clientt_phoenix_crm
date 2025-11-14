# Forms Builder Module - Specification Planning

**Date**: 2025-11-14
**Source**: figma_src/105_form_builder_module
**Target**: Phoenix LiveView implementation with Ash Framework

## Overview

This document outlines the plan for translating the Forms Builder Module (imported from Figma) into Phoenix LiveView specifications following the Clientt CRM spec structure.

## Source Analysis

The Figma module contains:

### Module System
- **Dashboard**: Unified overview with global KPIs
- **Forms Module** (Active):
  - Forms Management
  - Calendar Integration
  - Chatbot
  - Analytics
- **Coming Soon Modules**: CRM, CPQ, Billing, Support

### Key Features
1. **Demo Calendar Builder**: Calendly-like booking system with Google/Outlook integration
2. **Sales Chatbot Widget**: AI-powered assistant with lead capture
3. **Settings Integration Page**: Calendar connections and chatbot configuration
4. **Team Calendar & Availability**: Team scheduling and working hours management
5. **Post-Submission Actions**: Form completion workflows

### Technical Stack (Figma Source)
- React 18+ with TypeScript
- Tailwind CSS v4.0
- shadcn/ui components
- Lucide React icons

### Target Stack (Phoenix Implementation)
- Phoenix LiveView (v1.1+)
- Ash Framework (v3.0+)
- Tailwind CSS v4.1+
- DaisyUI components
- HEEx templates

---

## Specification Changes Required

### 1. New Domain: Forms

**Location**: `specs/01-domains/forms/`

**Structure**:
```
specs/01-domains/forms/
├── domain.md
├── resources/
│   ├── form.md
│   ├── form_field.md
│   ├── form_submission.md
│   ├── calendar_booking.md
│   ├── chatbot_lead.md
│   └── chatbot_conversation.md
├── features/
│   ├── form_builder.feature.md
│   ├── form_submission.feature.md
│   ├── calendar_booking.feature.md
│   ├── chatbot_interaction.feature.md
│   └── lead_capture.feature.md
├── policies/
│   ├── form_access.md
│   └── booking_authorization.md
├── GETTING_STARTED.md
├── REVIEW_QUESTIONS.md
└── DATABASE_SCHEMA.generated.md
```

**Resources to Define**:
1. **Form**: Form definition with fields, validation, settings
2. **FormField**: Individual form fields (text, email, select, etc.)
3. **FormSubmission**: Submitted form data with metadata
4. **CalendarBooking**: Demo bookings with attendee info
5. **ChatbotLead**: Lead information captured via chatbot
6. **ChatbotConversation**: Conversation history and context

**Features to Spec**:
1. Form builder with drag-drop interface
2. Form submission and validation
3. Calendar booking workflow
4. Chatbot interaction flow
5. Lead capture and qualification

---

### 2. New Domain: Integrations

**Location**: `specs/01-domains/integrations/`

**Structure**:
```
specs/01-domains/integrations/
├── domain.md
├── resources/
│   ├── calendar_connection.md
│   ├── chatbot_config.md
│   └── integration_credential.md
├── features/
│   ├── google_calendar_oauth.feature.md
│   ├── microsoft_calendar_oauth.feature.md
│   ├── calendar_sync.feature.md
│   └── chatbot_configuration.feature.md
├── policies/
│   ├── integration_security.md
│   └── token_management.md
├── GETTING_STARTED.md
└── DATABASE_SCHEMA.generated.md
```

**Resources to Define**:
1. **CalendarConnection**: OAuth tokens and calendar provider info
2. **ChatbotConfig**: Chatbot settings and behavior
3. **IntegrationCredential**: Encrypted OAuth credentials

**Features to Spec**:
1. Google Calendar OAuth flow
2. Microsoft Outlook OAuth flow
3. Calendar availability checking
4. Booking creation and sync
5. Chatbot configuration

---

### 3. UI Design Specs Updates

**Location**: `specs/05-ui-design/`

#### 3.1 New Module Navigation Structure

**File**: `specs/05-ui-design/patterns/module-navigation.md` (NEW)

Content:
- Collapsible module groups
- "Coming Soon" states
- Module activation pattern
- Navigation hierarchy

#### 3.2 New Component Specs

**Location**: `specs/05-ui-design/components/`

New files needed:
1. **calendar-booking.md**: Calendar booking widget component
2. **chatbot-widget.md**: Chatbot bubble and conversation UI
3. **form-builder.md**: Form builder interface components
4. **kpi-cards.md**: Dashboard KPI card component
5. **pre-connect-form.md**: Lead capture modal component

#### 3.3 New Screen Specs

**Location**: `specs/05-ui-design/screens/`

Create new folder structure:
```
specs/05-ui-design/screens/
├── shared/
│   ├── dashboard.md (UPDATE)
│   └── navigation.md (UPDATE)
└── forms/
    ├── forms-list.md (NEW)
    ├── form-builder.md (NEW)
    ├── calendar-builder.md (NEW)
    ├── chatbot-management.md (NEW)
    ├── analytics.md (NEW)
    ├── settings-integrations.md (NEW)
    └── settings-team-calendar.md (NEW)
```

**New Screen Specs Required**:

1. **forms-list.md**: Forms management dashboard
   - List all forms
   - Create new form
   - View submissions
   - Analytics overview

2. **form-builder.md**: Form creation/editing interface
   - Field palette
   - Drag-drop builder
   - Field configuration
   - Post-submission actions
   - Validation rules

3. **calendar-builder.md**: Calendar booking configuration
   - Two-panel layout (calendar + form)
   - Time slot selection
   - Custom questions
   - Timezone handling
   - Confirmation modal

4. **chatbot-management.md**: Chatbot configuration
   - Widget settings
   - Greeting message
   - Quick actions
   - Trigger pages
   - Pre-connect form

5. **analytics.md**: Form analytics dashboard
   - Submission stats
   - Conversion rates
   - Popular forms
   - Lead sources

6. **settings-integrations.md**: Integration settings page
   - Calendar provider connections
   - OAuth flow UI
   - Connected accounts
   - Notification settings

7. **settings-team-calendar.md**: Team availability management
   - Weekly schedule
   - Team members
   - Booking settings
   - Date overrides

**Updated Screen Specs**:

1. **dashboard.md**: Add Forms module KPIs
   - Total forms created
   - Total submissions
   - Conversion rate
   - Active bookings

2. **navigation.md**: Add module system navigation
   - Collapsible modules
   - Sub-navigation
   - Coming soon badges
   - Active states

---

### 4. Integration Specs

**Location**: `specs/03-integrations/`

New files needed:

1. **forms_to_integrations_integration.md**
   - How Forms domain connects to Integrations domain
   - Calendar booking creation flow
   - Chatbot lead capture flow

2. **forms_to_authorization_integration.md**
   - Multi-tenant form ownership
   - Company-scoped forms
   - User permissions for forms

3. **integrations_to_external_calendars.md**
   - Google Calendar API integration
   - Microsoft Graph API integration
   - OAuth token management
   - Availability sync

---

### 5. New Patterns Documentation

**Location**: `specs/05-ui-design/patterns/`

New files needed:

1. **post-submission-actions.md**
   - Calendar booking trigger
   - Chatbot auto-open
   - Redirect URL configuration

2. **lead-capture-flow.md**
   - Pre-connect form pattern
   - Progressive data collection
   - Context preservation

3. **calendar-booking-flow.md**
   - Email capture
   - Date/time selection
   - Confirmation process
   - Calendar integration

---

## Implementation Phases

### Phase 1: Domain Specifications (Week 1)
**Priority**: Critical
**Effort**: 40 hours

Tasks:
- [ ] Create Forms domain structure
- [ ] Define all Forms resources (Form, FormField, FormSubmission, etc.)
- [ ] Write BDD feature specs for form creation and submission
- [ ] Define CalendarBooking resource with relationships
- [ ] Define ChatbotLead and ChatbotConversation resources

### Phase 2: Integration Specifications (Week 2)
**Priority**: Critical
**Effort**: 24 hours

Tasks:
- [ ] Create Integrations domain structure
- [ ] Define CalendarConnection resource with OAuth flow
- [ ] Define ChatbotConfig resource
- [ ] Write BDD feature specs for OAuth flows
- [ ] Document integration security policies

### Phase 3: UI Design Specifications (Week 3)
**Priority**: High
**Effort**: 32 hours

Tasks:
- [ ] Create Forms screen specs (7 screens)
- [ ] Update shared screen specs (dashboard, navigation)
- [ ] Create new component specs (5 components)
- [ ] Document UI patterns (3 patterns)
- [ ] Map Figma designs to DaisyUI components

### Phase 4: Cross-Domain Integration Specs (Week 4)
**Priority**: High
**Effort**: 16 hours

Tasks:
- [ ] Write forms_to_integrations integration spec
- [ ] Write forms_to_authorization integration spec
- [ ] Write integrations_to_external_calendars spec
- [ ] Document data flow across domains

### Phase 5: Review & Validation (Week 5)
**Priority**: Medium
**Effort**: 8 hours

Tasks:
- [ ] Review all specs for consistency
- [ ] Validate BDD scenarios
- [ ] Check integration points
- [ ] Ensure Phoenix LiveView patterns are followed
- [ ] Verify Ash Framework conventions

---

## Key Considerations

### 1. Multi-Tenancy
All Forms resources must be company-scoped:
- Forms belong to companies
- Submissions are company-isolated
- Calendar bookings are company-specific
- Row-level security policies required

### 2. OAuth Security
- Store tokens encrypted at rest
- Implement token refresh mechanism
- Use PKCE for enhanced security
- Proper scope management

### 3. Real-Time Updates
Leverage Phoenix LiveView for:
- Form builder updates
- Live submission notifications
- Calendar availability updates
- Chatbot conversations

### 4. API Integrations
External APIs to integrate:
- Google Calendar API
- Microsoft Graph API
- (Future) AI services for chatbot

### 5. Component Mapping

| Figma/React Component | Phoenix/DaisyUI Equivalent |
|----------------------|---------------------------|
| shadcn/ui Button | DaisyUI btn |
| shadcn/ui Card | DaisyUI card |
| shadcn/ui Dialog | DaisyUI modal |
| shadcn/ui Select | DaisyUI select |
| shadcn/ui Calendar | Custom LiveView component |
| React state management | LiveView assigns |
| React hooks | LiveView lifecycle |

---

## Expected Outcomes

After completing all phases:

1. ✅ Complete domain specifications for Forms and Integrations
2. ✅ BDD feature specs for all user flows
3. ✅ UI design specs for all screens and components
4. ✅ Integration specs for cross-domain communication
5. ✅ Security and authorization policies
6. ✅ Database schema documentation
7. ✅ Phoenix LiveView implementation guidelines

---

## Open Questions

1. **Forms Domain**:
   - Should forms support conditional logic (show/hide fields based on answers)?
   - Do we need form versioning?
   - Should we support multi-page forms?

2. **Calendar Integration**:
   - Do we need team member selection for bookings?
   - Should we support recurring bookings?
   - What's the maximum advance booking period?

3. **Chatbot**:
   - Will we use a real AI service or scripted responses initially?
   - Should conversation history be preserved long-term?
   - Do we need chatbot analytics separate from forms analytics?

4. **Multi-Module System**:
   - How should modules be activated/deactivated?
   - Should module access be role-based?
   - Do we need module-level settings?

---

## Success Criteria

Specifications are complete when:

- [ ] All Ash resources have complete attribute definitions
- [ ] All relationships between resources are documented
- [ ] All BDD scenarios cover happy paths and edge cases
- [ ] All UI screens have component breakdowns
- [ ] All integrations have data flow diagrams
- [ ] All security policies are defined
- [ ] Database schemas are generated and reviewed
- [ ] Phoenix LiveView patterns are documented
- [ ] Review questions are answered

---

## Next Steps

1. Review this plan with team
2. Answer open questions
3. Begin Phase 1 implementation
4. Schedule weekly spec review meetings
5. Track progress in dev_task_prompts folder

---

**Document Version**: 1.0
**Last Updated**: 2025-11-14
**Status**: Planning Complete, Ready for Execution
