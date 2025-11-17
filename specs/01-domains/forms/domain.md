# Domain: Forms

**Status**: approved
**Last Updated**: 2025-11-16
**Owner**: Development Team
**MVP Phase**: 2

## Domain Purpose

Manages custom form creation, submission handling, and lead generation for the ClienttCRM application. Enables companies to create embeddable forms for their websites, collect submissions from potential leads, and track form performance with comprehensive analytics. Supports multi-tenant data isolation with company-scoped access control.

## Ubiquitous Language

- **Form**: A customizable data collection template with fields, branding, and configuration
- **FormField**: Individual input field within a form (text, email, select, etc.)
- **Submission**: A completed form submission from a potential lead (immutable once created)
- **Field Type**: Type of input field (10 types in MVP: text, email, textarea, select, checkbox, radio, number, date, phone, URL)
- **Lead**: A potential customer who submitted a form (synonymous with Submission in this context)
- **Lead Status**: Workflow state of a submission (new, contacted, qualified, converted, spam)
- **Form Analytics**: Performance metrics and insights about form usage and conversions
- **Conversion Rate**: Percentage of form views that result in submissions
- **Notification**: In-app or email alert about new form submissions
- **UTM Parameters**: URL tracking parameters for lead source attribution
- **Multi-tenancy**: Company-scoped data isolation using company_id filtering

## Domain Boundaries

### In Scope (MVP - Phase 2)

- **Form Management**:
  - CRUD operations for forms and form fields
  - 10 field types (text, email, textarea, select, checkbox, radio, number, date, phone, URL)
  - Single-page forms only
  - Form duplication for templates
  - Basic field validation (required, format, min/max length/value)

- **Submission Handling**:
  - Public form submission (no authentication required)
  - Lead status workflow (new → contacted → qualified → converted, or spam)
  - Immutable submission data (no editing after creation)
  - Soft delete with restore capability

- **Analytics & Reporting**:
  - Dashboard KPIs: Total Forms, Total Submissions, Conversion Rate
  - Advanced metrics: Active Users, Avg Completion Time, Lead Source Tracking, Field Completion Rate
  - Real-time calculation via Ash aggregates
  - CSV export with filtering (date range, lead status, deleted status)

- **Notifications**:
  - Email notifications (immediate, daily digest, or off)
  - In-app notifications (notification bell with unread count)
  - User-configurable preferences

### Out of Scope (Phase 3+)

- **Advanced Form Features**:
  - File upload fields (deferred due to storage/security complexity)
  - Conditional logic (show/hide fields based on answers)
  - Multi-page/step forms
  - Custom regex validation patterns
  - Cross-field validation

- **Advanced Export**:
  - Excel (XLSX) format
  - PDF export

- **Advanced Notifications**:
  - Slack/webhook integrations

- **Integrations**:
  - Calendar integration (Google/Outlook sync)
  - Chatbot integration
  - Third-party CRM integrations

### Integration Points

- **Authorization Domain**: Uses company_id for multi-tenant data isolation, authz_user for permissions
- **Accounts Domain**: Uses authn_user for notification preferences and profile settings
- **Email Service**: Sends notification emails via Swoosh
- **Public Web**: Forms are embeddable on external websites (public submission endpoint)

## Core Business Rules

1. **Multi-Tenancy**: All forms, fields, and submissions MUST be filtered by company_id - no cross-company data access
2. **Form-Field Relationship**: Forms can have 0 to many fields, fields belong to exactly one form
3. **Submission Immutability**: Once created, submission data cannot be modified (only status and deleted_at can change)
4. **Field Type Constraints**: MVP supports exactly 10 field types - file upload explicitly excluded
5. **Single-Page Forms**: No multi-page or conditional logic in MVP
6. **Lead Status Workflow**: Valid transitions: new → contacted → qualified → converted, or any status → spam
7. **Soft Delete**: Submissions can be soft-deleted (deleted_at timestamp) and restored
8. **Public Submission**: Forms must be accessible via public URL without authentication
9. **Form Duplication**: Must copy form + all fields with new IDs
10. **Validation Strategy**: Server-side validation via Ash is always enforced; client-side is optional for UX
11. **Notification Preferences**: Per-user setting (immediate/daily/off) stored in user preferences

## Domain Events

### Published Events

| Event Name | Trigger | Payload | Consumers |
|------------|---------|---------|-----------|
| forms.form_created | Form created | {form_id, company_id, name, created_by} | Analytics |
| forms.form_published | Form status → published | {form_id, company_id, published_at} | Analytics, Cache Invalidation |
| forms.form_archived | Form status → archived | {form_id, archived_by} | Analytics |
| forms.submission_created | New submission | {submission_id, form_id, company_id, submitted_at, metadata} | Notification Service, Analytics, Lead Scoring |
| forms.submission_status_changed | Lead status updated | {submission_id, old_status, new_status, changed_by} | Analytics, CRM Integration (future) |
| forms.notification_sent | Notification delivered | {notification_id, user_id, type, channel} | Analytics |

### Consumed Events

| Event Name | Source | Handler Action |
|------------|--------|----------------|
| authorization.authz_user_created | Authorization | Create default notification preferences for new user |
| (Future) integrations.calendar_booking_created | Calendar domain | Link submission to calendar event |

## Resources in This Domain

### MVP Resources (Implement Now)

- **Form** - Form definition with fields, branding, and configuration
- **FormField** - Individual field within a form (10 types)
- **Submission** - Completed form submission (lead data)
- **Notification** - In-app notification for form events

### Future Resources (Phase 3+ - Reference Only)

- **FormPage** - Multi-page form support
- **ConditionalRule** - Conditional logic rules
- **FormIntegration** - Third-party integrations (calendar, chatbot, webhooks)
- **FormTemplate** - Pre-built form templates

## Aggregate Roots

### Form Aggregate

**Root**: Form
**Ensures**: Form always has valid configuration, fields are properly ordered, and submissions maintain data integrity

**Entities in Aggregate**:
- Form (root)
- FormField (1:Many)
- Submission (1:Many)

**Invariants**:
- Form name must be unique within company
- Published forms cannot have fields added/removed (must archive and create new version)
- Field positions must be sequential (1, 2, 3, ...) with no gaps
- Form status transitions: draft → published → archived (one-way)
- Cannot delete form with submissions (must archive)

### Submission Aggregate

**Root**: Submission
**Ensures**: Submission data is immutable, lead status follows valid workflow

**Entities in Aggregate**:
- Submission (root)

**Invariants**:
- Submission data (form_data JSONB) is immutable after creation
- Only status and deleted_at can be updated
- Deleted submissions can be restored (deleted_at set to null)
- Lead status must follow valid workflow transitions

## Multi-Tenancy Implementation

### Row-Level Filtering

All resources include `company_id` and are automatically filtered by current company context through Ash policies.

**Tenant-Scoped Resources**:
- Form (filtered by company_id)
- FormField (via Form relationship)
- Submission (filtered by company_id)
- Notification (filtered by user's company via authz_user)

**Public Access** (exceptions to tenant filtering):
- Submission creation: Public endpoint accepts form_id, validates form exists and is published
- Form embed: Public endpoint renders form HTML/JSON for embedding

### Session Context

```elixir
# Required session assigns for authenticated users
%{
  current_authn_user: %User{},        # Authentication identity
  current_company_id: "uuid",          # Active company
  current_authz_user: %AuthzUser{}     # Authorization identity for current company
}

# Public submission (no session required)
# Only form_id and submission data validated
```

### Required Database Indexes

```sql
-- Critical for multi-tenancy performance
CREATE INDEX forms_company_id_index ON forms(company_id);
CREATE INDEX forms_status_index ON forms(status);
CREATE INDEX form_fields_form_id_index ON form_fields(form_id);
CREATE INDEX submissions_company_id_index ON submissions(company_id);
CREATE INDEX submissions_form_id_index ON submissions(form_id);
CREATE INDEX submissions_status_index ON submissions(status);
CREATE INDEX submissions_submitted_at_index ON submissions(submitted_at DESC);
CREATE INDEX submissions_deleted_at_index ON submissions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX notifications_user_id_read_at_index ON notifications(user_id, read_at);
```

## Security Considerations

### Authorization Policies

- **Forms**: Admins/Managers can create/update/archive; Users can view only
- **Submissions**: Admins/Managers can view/update status/delete; Users can view only
- **Public Submission**: No authentication required, rate-limited per IP (future)
- **Analytics**: All company members can view analytics for their company
- **Notifications**: Users can only view/manage their own notifications

### Data Isolation

- All Ash policies enforce company_id filtering on queries
- Public submission endpoint validates form belongs to company before accepting data
- Cannot bypass tenancy through direct IDs
- Cross-company data access prevented at framework level

### Input Validation

- **Server-side (ALWAYS)**: All validation via Ash validations (required, format, length, value ranges)
- **Client-side (SELECTIVE)**: Only simple validations for UX (email format, phone format, required fields)
- Submitted form data sanitized to prevent XSS attacks
- JSONB form_data validated against form field schema

### Public Endpoint Security

- Public form submission endpoint validates:
  - Form exists and status is published
  - All required fields are present
  - Field values match expected types
  - Data does not exceed reasonable size limits
- Future: Rate limiting per IP address to prevent spam

## Performance Targets (MVP)

- **Page Load Time**: <1 second for all pages (dashboard, forms, analytics)
- **Real-time Analytics**: Use Ash aggregates with optimized SQL queries (no Cachex/Oban unless needed)
- **Database Optimization**: All company_id, form_id, status columns indexed
- **Export Performance**: CSV generation <5 seconds for up to 10,000 submissions
- **Test Coverage**: 70% minimum (focus on critical paths)

## Analytics Implementation

### Dashboard KPIs

All metrics calculated in real-time via Ash aggregates:

1. **Total Forms**: COUNT(forms) WHERE status IN ('draft', 'published')
2. **Total Submissions**: COUNT(submissions) WHERE deleted_at IS NULL
3. **Conversion Rate**: (submissions / form_views) * 100 (requires view tracking)
4. **Active Users**: COUNT(DISTINCT submitter_email) WHERE submitted_at > NOW() - 30 days
5. **Average Completion Time**: AVG(submitted_at - first_viewed_at) (requires tracking)
6. **Lead Source Tracking**: GROUP BY metadata->>'utm_source'
7. **Field Completion Rate**: Per-field analysis of null/empty values in form_data

### Export Features

- **Format**: CSV only (XLSX and PDF in Phase 3)
- **Filtering**: Date range, lead status, include/exclude deleted
- **Columns**: All form fields + metadata (submitted_at, status, utm_source, etc.)

## Notification System

### Channels

1. **Email** (via Swoosh):
   - Immediate: Send email on every new submission
   - Daily Digest: Batch submissions and send once per day
   - Off: No emails sent

2. **In-App**:
   - Notification bell icon in header
   - Unread count badge
   - Notification list with mark-as-read functionality
   - Persisted in notifications table

### User Preferences

Stored per-user (in user_preferences or authz_user table):
- `notification_preference`: enum (immediate, daily, off)
- `timezone`: string (for date/time display in digest emails)

## Implementation Phases

### Phase 1: Domain Models (Week 1)
- Form, FormField, Submission resources
- Database migrations with indexes
- Ash actions and validations
- Multi-tenancy policies
- Unit tests (70% coverage)

### Phase 2: LiveView UI (Weeks 2-3)
- Dashboard with KPIs
- Forms CRUD (list, create, edit, builder)
- Form builder interface (drag-drop fields)
- Submissions list and detail views
- Analytics charts and visualizations

### Phase 3: Analytics & Export (Week 4)
- Real-time KPI calculations
- Charts and trend visualizations
- CSV export with filters
- Performance optimization if needed

### Phase 4: Notifications & Settings (Week 5)
- Notification resource and actions
- Email sending via Swoosh
- In-app notification UI
- User preferences (Settings page)
- Integration placeholders ("Coming Soon" cards)

### Phase 5: Testing & QA (Week 6)
- End-to-end testing
- Performance testing (<1s page load)
- Browser compatibility testing
- Security audit
- Bug fixes and polish

## Open Questions

All questions have been answered in MVP-SCOPE-FINALIZED.md. Key decisions:

1. **Field Types**: 10 types (no file upload in MVP) ✅
2. **Conditional Logic**: Deferred to Phase 3 ✅
3. **Multi-Page Forms**: Single-page only for MVP ✅
4. **Form Duplication**: Included in MVP ✅
5. **Validation**: Both client and server (pragmatic approach) ✅
6. **KPIs**: All 7 KPIs included in MVP ✅
7. **Caching**: No Cachex/Oban unless performance testing shows need ✅
8. **Export Format**: CSV only ✅
9. **Notifications**: Email + in-app ✅
10. **Browser Support**: Modern browsers + mobile ✅

## Related Specifications

- Resource Specs: `./resources/` (form.md, form_field.md, submission.md, notification.md)
- Feature Specs: `./features/` (BDD scenarios for user journeys)
- Policy Specs: `./policies/` (authorization rules and multi-tenancy policies)
- Original Planning: `../../../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/`
- MVP Scope Document: `../../../dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-00-forms-project-overview/MVP-SCOPE-FINALIZED.md`
