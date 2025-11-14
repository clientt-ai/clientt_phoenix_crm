# Domain: Forms

**Status**: draft
**Last Updated**: 2025-11-14
**Owner**: Product Team

## Domain Purpose

Manages the complete form lifecycle from creation through submission, including form building, field configuration, submission handling, calendar booking workflows, and chatbot-driven lead capture. This domain enables users to create custom forms, capture leads, schedule demos, and qualify prospects through conversational interfaces.

## Ubiquitous Language

- **Form**: A customizable data collection interface with fields, validation rules, and post-submission actions
- **Form Field**: An individual input element within a form (text, email, select, checkbox, etc.)
- **Form Submission**: A completed form with user-provided data and submission metadata
- **Calendar Booking**: A scheduled demo or meeting created after form submission or chatbot interaction
- **Chatbot Lead**: A prospective customer captured through conversational chatbot interaction
- **Chatbot Conversation**: The complete dialogue history between a lead and the chatbot
- **Post-Submission Action**: Automated workflow triggered when a form is submitted (calendar booking, chatbot, redirect)
- **Lead Qualification**: Process of evaluating lead quality through form data and chatbot interactions
- **Pre-Connect Form**: Initial data capture modal shown before displaying pricing, features, or booking calendars

## Domain Boundaries

### In Scope

- Form creation and management (drag-drop builder)
- Form field configuration and validation rules
- Form submission capture and storage
- Calendar booking workflow (date/time selection, attendee management)
- Chatbot interaction management
- Lead capture through forms and chatbot
- Post-submission action orchestration
- Form analytics and conversion tracking
- Multi-step form workflows
- Conditional field logic

### Out of Scope

- OAuth integration with external calendars (Integrations domain)
- Email notification delivery (handled by existing Mailer)
- Multi-tenant authorization (Authorization domain)
- User authentication (Accounts domain)
- Payment collection (future Billing domain)
- CRM contact synchronization (future CRM domain)
- Marketing campaign management (future Marketing domain)

### Integration Points

- **Integrations**: Sends calendar booking requests, receives calendar availability
- **Authorization**: Validates company context and user permissions
- **Accounts**: References user information for form ownership
- **Email (via Mailer)**: Sends booking confirmations and lead notifications

## Core Business Rules

1. **Form Ownership**: Every form must belong to a company and have an owner (user)
2. **Field Ordering**: Form fields must maintain explicit order for display sequence
3. **Submission Immutability**: Once submitted, form data cannot be modified (audit trail)
4. **Calendar Booking Uniqueness**: Each booking must have unique start time per calendar connection
5. **Lead Email Uniqueness**: Chatbot leads with same email within 30 days are treated as returning leads
6. **Post-Submission Single Execution**: Each post-submission action executes exactly once per submission
7. **Conversation Context Preservation**: Chatbot conversations preserve lead context across interactions
8. **Booking Requires Calendar Connection**: Calendar bookings cannot be created without active calendar integration
9. **Form Field Validation**: All required fields must be completed before submission
10. **Lead Intent Tracking**: Every chatbot lead must have associated intent (pricing, features, demo)

## Domain Events

### Published Events

| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| forms.form_created | New form created | {form_id, company_id, owner_id, name} | Analytics |
| forms.form_published | Form activated | {form_id, publish_date} | Analytics |
| forms.submission_received | Form submitted | {submission_id, form_id, data, company_id} | Integrations, Email |
| forms.booking_requested | Calendar booking initiated | {booking_id, submission_id, attendee_email, time_slot} | Integrations |
| forms.booking_confirmed | Booking successfully created | {booking_id, event_id, confirmation_sent} | Email, Analytics |
| forms.lead_captured | Chatbot lead captured | {lead_id, email, intent, company_id} | Integrations, Email |
| forms.conversation_started | Chatbot conversation initiated | {conversation_id, lead_id, session_id} | Analytics |
| forms.lead_qualified | Lead meets qualification criteria | {lead_id, score, intent} | Future CRM domain |

### Consumed Events

| Event Name | Source | Handler Action |
|------------|--------|----------------|
| integrations.calendar_connected | Integrations | Enable calendar booking features |
| integrations.calendar_disconnected | Integrations | Disable calendar booking features |
| integrations.booking_synced | Integrations | Update booking status with external event ID |
| integrations.booking_failed | Integrations | Mark booking as failed, notify lead |
| authorization.company_deleted | Authorization | Cascade delete all forms for company |
| accounts.user_deleted | Accounts | Reassign form ownership or archive |

## Resources in This Domain

- **Form** - Customizable data collection interface
- **FormField** - Individual input fields within a form
- **FormSubmission** - Captured form data from users
- **CalendarBooking** - Scheduled demos and meetings
- **ChatbotLead** - Leads captured through chatbot interactions
- **ChatbotConversation** - Complete dialogue history with leads

## Aggregate Roots

- **Form**: Ensures consistency of form fields, validation rules, and configuration
  - Invariant: All fields must have unique names within a form
  - Invariant: At least one field must be required
  - Invariant: Published forms cannot have structural changes without versioning

- **FormSubmission**: Ensures immutability and completeness of submitted data
  - Invariant: All required fields must have values
  - Invariant: Cannot be modified after creation (append-only)
  - Invariant: Must reference a published form

- **CalendarBooking**: Ensures booking validity and prevents conflicts
  - Invariant: Start time must be in the future
  - Invariant: End time must be after start time
  - Invariant: Cannot overlap with existing bookings for same calendar
  - Invariant: Requires valid calendar connection

- **ChatbotLead**: Ensures lead data completeness and deduplication
  - Invariant: Email must be unique within 30-day window per company
  - Invariant: Must have at least first name, last name, and email
  - Invariant: Intent must be one of: pricing, features, demo

## State Machine Diagrams

### Form Lifecycle
```
draft → published → archived
   ↓        ↓
   → unpublished ←
```

**Valid Transitions**:
- `draft → published`: When form has at least one field and validation passes
- `published → unpublished`: When form needs to be taken offline temporarily
- `published → archived`: When form is no longer needed but data must be preserved
- `unpublished → published`: When form is ready to go live again
- `draft → archived`: When draft form is abandoned

### Booking Lifecycle
```
pending → confirmed → completed
   ↓          ↓
   ↓      cancelled
   ↓          ↓
   → failed ←→ no_show
```

**Valid Transitions**:
- `pending → confirmed`: When calendar sync succeeds
- `pending → failed`: When calendar sync fails
- `confirmed → cancelled`: When booking is cancelled by either party
- `confirmed → completed`: When booking time has passed and meeting occurred
- `confirmed → no_show`: When attendee doesn't join meeting
- `failed → pending`: When retry is attempted

### Lead Qualification States
```
new → contacted → qualified → converted
 ↓                    ↓
 → unqualified ←←←←←←←
```

**Valid Transitions**:
- `new → contacted`: When first chatbot interaction completes
- `contacted → qualified`: When lead meets qualification criteria (intent + complete info)
- `contacted → unqualified`: When lead doesn't meet criteria
- `qualified → converted`: When booking is confirmed or deal is created
- `qualified → unqualified`: When lead goes cold

## Multi-Tenancy Strategy

All resources in this domain are company-scoped:

- Forms are owned by companies and users
- Submissions are isolated per company
- Bookings are company-specific
- Leads are scoped to company context
- Row-level security enforced via Ash policies

## Performance Considerations

- **Form Submissions**: High write volume, optimize for append-only operations
- **Chatbot Conversations**: Frequent reads during active conversations, cache recent messages
- **Calendar Availability**: Cache external calendar data with 5-minute TTL
- **Lead Deduplication**: Index on (company_id, email, created_at) for fast lookups

## Data Retention Policies

- **Form Submissions**: Retain indefinitely for audit trail
- **Chatbot Conversations**: Retain 90 days, archive to cold storage
- **Calendar Bookings**: Retain 2 years after completion
- **Leads**: Retain indefinitely for CRM integration

## Analytics & Metrics

Key metrics tracked by this domain:

- Form creation rate
- Form publish rate
- Submission conversion rate per form
- Average time to complete form
- Booking request rate
- Booking confirmation rate
- Lead capture rate via chatbot
- Lead qualification rate
- Intent distribution (pricing vs features vs demo)

---

**Related Documentation**:
- [Form Builder Feature](./features/form_builder.feature.md)
- [Calendar Booking Feature](./features/calendar_booking.feature.md)
- [Chatbot Interaction Feature](./features/chatbot_interaction.feature.md)
- [Forms to Integrations Integration](../../03-integrations/forms_to_integrations_integration.md)
