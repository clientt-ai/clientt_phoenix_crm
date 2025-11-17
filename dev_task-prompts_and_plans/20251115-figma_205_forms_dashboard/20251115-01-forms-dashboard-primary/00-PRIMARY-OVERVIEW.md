# Forms Dashboard - Primary Implementation Overview

## Executive Summary

This is the master planning document for implementing the Forms Dashboard module from the Figma export (figma_src/205 Forms Dashboard) into our Phoenix LiveView + Ash Framework CRM application.

**Source:** `figma_src/205 Forms Dashboard/`
**Target:** Phoenix LiveView Application at `clientt_crm_app/`
**Framework:** Elixir, Phoenix 1.8+, Ash Framework 3.0+, LiveView 1.1+

## What We're Building (MVP Scope)

A comprehensive Forms Management module that enables users to:

**MVP Features (6 weeks):**
- ✅ Create, manage, and publish custom forms
- ✅ Collect and track form submissions
- ✅ View analytics and KPIs for form performance
- ✅ Configure basic settings and preferences

**Future Features (Post-MVP):**
- 📅 Schedule demo calls via integrated calendar booking (Calendly-like)
- 💬 Engage leads through an AI chatbot widget
- 🔗 Configure integrations (Google Calendar, Outlook)
- 👥 Manage team availability for bookings

---

## 🎯 Critical Requirements

### UI Layout & Navigation
- **Shared Layout:** All authenticated pages use consistent header + sidebar
- **Header:** Persistent across all pages (logo, user menu, dark mode toggle)
- **Sidebar:** Persistent, role-based visibility, collapsible modules
- **Detail Views:** Prefer full-page views over modals for forms/editing
- **Responsive:** Mobile-friendly with hamburger menu

📄 **See:** `../20251115-00-forms-project-overview/UI-LAYOUT-AND-ROLES.md`

### Role-Based Access Control
Four roles for Forms domain:
- **Form Admin** - Full access to create, edit, delete forms
- **Form Viewer** - Read-only access to forms
- **Lead Admin** - Full access to submissions, can export
- **Lead Viewer** - Read-only access to submissions

📄 **See:** `../20251115-00-forms-project-overview/UI-LAYOUT-AND-ROLES.md`

---

## Major Components

### MVP Implementation (5 Tracks - 6 Weeks)

### Track 1: Core Forms Management (LiveView UI)
**Folder:** `20251115-02-forms-liveview-ui/`
**Scope:** Convert React/TypeScript components to Phoenix LiveView
- Dashboard overview page with unified KPIs
- Forms listing and management page
- Form builder interface
- Form analytics page
- Modular sidebar navigation system
- Settings pages (integrations, team calendar)

**Key Files to Create:**
- `lib/clientt_crm_app_web/live/forms_live/index.ex` (forms list)
- `lib/clientt_crm_app_web/live/forms_live/show.ex` (form details)
- `lib/clientt_crm_app_web/live/forms_live/form_builder.ex` (form builder)
- `lib/clientt_crm_app_web/live/dashboard_live/index.ex` (dashboard)
- `lib/clientt_crm_app_web/components/sidebar.ex` (sidebar component)

**Technology Mapping:**
- React → Phoenix LiveView
- TypeScript → Elixir
- Tailwind CSS v4.0 → Tailwind CSS (our version)
- Shadcn/ui components → Our Phoenix components / custom builds
- Lucide icons → Heroicons

### Track 2: Domain Models & Data Layer (Ash Resources)
**Folder:** `20251115-03-forms-domain-models/`
**Scope:** Create Ash resources and domain logic for Forms

**MVP Resources:**
- Form resource (form definitions, fields, settings)
- FormField resource (field definitions, validation rules)
- Submission resource (form responses, lead data)

**Key Files to Create:**
- `lib/clientt_crm_app/forms.ex` (Forms domain)
- `lib/clientt_crm_app/forms/form.ex` (Form resource)
- `lib/clientt_crm_app/forms/form_field.ex` (FormField resource)
- `lib/clientt_crm_app/forms/submission.ex` (Submission resource)

**Database Tables for MVP:**
- `forms` (id, name, description, settings, status, user_id, timestamps)
- `form_fields` (id, form_id, field_type, label, required, order, validation_rules, timestamps)
- `submissions` (id, form_id, submitted_data, lead_email, lead_name, metadata, timestamps)

**Note:** Calendar and chatbot resources are documented in future tracks but not implemented in MVP.

### Track 3: Analytics & KPIs
**Folder:** `20251115-04-forms-analytics-kpis/`
**Scope:** Metrics, reports, and data visualization
- Form submission statistics
- Conversion rate calculations
- Time-series data (submissions over time)
- Lead source tracking
- Form performance comparisons
- Dashboard KPI cards
- Charts and graphs

**Metrics to Track:**
- Total Forms
- Total Submissions
- Active Users
- Conversion Rate (%)
- Submissions by Form
- Submissions Over Time
- Top Performing Forms
- Average Completion Time

**Key Files to Create:**
- `lib/clientt_crm_app/analytics.ex` (Analytics context - calculations/aggregates)
- `lib/clientt_crm_app_web/live/analytics_live/index.ex` (Analytics page)
- `lib/clientt_crm_app_web/components/kpi_card.ex` (KPI display component)
- `lib/clientt_crm_app_web/components/charts.ex` (Chart components)

### Track 4: Settings & Configuration
**Folder:** `20251115-05-forms-settings-integrations/`
**Scope:** User settings and basic configuration

**MVP Settings:**
- User profile settings (name, email, password)
- Form-specific settings (default values, branding)
- Notification preferences (email alerts for submissions)
- "Coming Soon" placeholders for future integrations

**Key Features:**
- Settings page with tabs (General, Notifications, Integrations)
- User profile management
- Form defaults configuration
- Integration status cards with "Coming Soon" badges

**Key Files to Create:**
- `lib/clientt_crm_app_web/live/settings_live/index.ex` (Settings overview)
- `lib/clientt_crm_app_web/live/settings_live/profile.ex` (User profile)
- `lib/clientt_crm_app_web/live/settings_live/notifications.ex` (Notification prefs)
- `lib/clientt_crm_app_web/live/settings_live/integrations.ex` (Integration placeholders)

**Note:** Calendar and chatbot integration settings show "Coming Soon" placeholders only.

### Track 5: Module Navigation System
**Included in Track 1 (LiveView UI)**
**Scope:** Scalable sidebar navigation
- Collapsible module groups
- Active state management
- "Coming Soon" badges for disabled modules
- Breadcrumb navigation
- Mobile responsive menu
- Dark mode support

---

### Future Features (Post-MVP)

These features are fully documented but NOT implemented in MVP. UI shows "Coming Soon" placeholders.

#### Future Track: Calendar Integration System
**Folder:** `20251115-xx-future-calendar-integration/`
**Status:** 📅 Documented, not implemented
**Estimated Time:** 2-3 weeks post-MVP

**Scope:** Build Calendly-like booking functionality
- Calendar booking widget (date/time picker)
- Availability management (working hours, team schedules)
- Google Calendar integration (OAuth, sync)
- Outlook Calendar integration (OAuth, sync)
- Email confirmations and reminders
- Timezone handling

**UI Placeholder:** Show "Coming Soon" badge in form builder post-submission actions and settings integrations tab.

#### Future Track: Chatbot Widget System
**Folder:** `20251115-xx-future-chatbot-widget/`
**Status:** 💬 Documented, not implemented
**Estimated Time:** 1-2 weeks post-MVP

**Scope:** AI-powered sales chatbot
- Expandable chat widget (bottom-right)
- Quick action buttons (Book Demo, Pricing, Features)
- Pre-connect form (lead capture before content)
- Message threading and persistence
- AI response generation (OpenAI/Claude integration)
- Demo booking flow from chat

**UI Placeholder:** Show "Coming Soon" badge in sidebar navigation and settings integrations tab.

---

## Technology Stack Conversion

### Frontend
| Figma Export | Phoenix Target |
|--------------|----------------|
| React 18+ | Phoenix LiveView 1.1+ |
| TypeScript | Elixir |
| Tailwind CSS v4.0 | Tailwind CSS 3.x |
| Vite | esbuild |
| Shadcn/ui components | Phoenix Components + custom |
| Lucide React icons | Heroicons |
| React Router | Phoenix LiveView navigation |
| React state (useState) | LiveView assigns |

### Backend
| Figma Export | Phoenix Target |
|--------------|----------------|
| None (static) | Ash Framework 3.0+ |
| None | AshPostgres 2.0+ |
| None | PostgreSQL database |
| None | AshAuthentication 4.0+ |
| None | Phoenix PubSub (real-time) |

## Database Schema Overview

### MVP Schema (Implement Now)

#### Forms Domain

**🔴 UPDATED 2025-11-16: Multi-Tenancy & Role Architecture Changes**
- Added `company_id` to all tables (Q24 decision - forms belong to companies)
- Removed `user_roles` table (Q25 decision - roles stored in authz_users.feature_roles JSONB)
- Added submission metadata fields (Q27 decisions - notes, tags, soft delete)
- See: `ADDITIONAL-BLOCKING-QUESTIONS.md` for detailed rationale

```sql
-- Main forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,
  created_by_authz_user_id UUID NOT NULL REFERENCES authz_users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,  -- field definitions, styling, branding
  status VARCHAR(50) DEFAULT 'draft',  -- draft, published, archived
  slug VARCHAR(255) NOT NULL,  -- URL-friendly identifier
  view_count INTEGER DEFAULT 0,
  submission_count INTEGER DEFAULT 0,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, slug)  -- Slug unique within company (not globally)
);

-- Form fields (each form has multiple fields)
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,  -- Denormalized for query performance
  field_type VARCHAR(50) NOT NULL,  -- text, email, select, textarea, number, date, checkbox, radio
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  options JSONB,  -- for select/radio fields
  order_index INTEGER NOT NULL,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Form submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES authz_companies(id) ON DELETE CASCADE,  -- Denormalized for query performance
  -- Immutable submission data (Q27a: submissions are immutable)
  submitted_data JSONB NOT NULL,  -- Key-value pairs of field responses
  lead_email VARCHAR(255),
  lead_name VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,  -- IP, user agent, referrer, UTM params
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  -- Mutable lead management fields (Q27b: lead_admin can update these)
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  lead_status VARCHAR(50) DEFAULT 'new',  -- new, contacted, qualified, converted, closed_won, closed_lost
  -- Soft delete (Q27c: reversible deletion with audit trail)
  deleted_at TIMESTAMP,
  deleted_by_authz_user_id UUID REFERENCES authz_users(id),
  -- Timestamps
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance (multi-tenancy aware)
CREATE INDEX idx_forms_company_id ON forms(company_id);
CREATE INDEX idx_forms_company_status ON forms(company_id, status);  -- Composite for common query
CREATE INDEX idx_forms_created_by ON forms(created_by_authz_user_id);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_company_id ON form_fields(company_id);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_company_id ON submissions(company_id);
CREATE INDEX idx_submissions_deleted_at ON submissions(deleted_at) WHERE deleted_at IS NOT NULL;  -- Partial index
CREATE INDEX idx_submissions_lead_status ON submissions(company_id, lead_status);  -- For lead management views
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);
```

#### Authorization Integration (Form Roles)

**🔴 NEW 2025-11-16: Feature-Based Roles (Q25 decision)**

Form permissions are stored in `authz_users.feature_roles` JSONB field:

```sql
-- Migration to add feature_roles to existing authz_users table
ALTER TABLE authz_users
  ADD COLUMN feature_roles JSONB DEFAULT '{}'::JSONB;

-- Index for querying form roles efficiently
CREATE INDEX idx_authz_users_feature_roles_forms
  ON authz_users ((feature_roles->>'forms'));

-- Example data:
-- authz_user.feature_roles = {"forms": "form_admin", "calendar": "calendar_viewer"}
```

**Permission Mapping (in Elixir code, NOT database):**
- See: `lib/clientt_crm_app/authorization/permissions.ex`
- `form_admin`: create_form, update_form, delete_form, publish_form, view_all_submissions, export_submissions
- `form_viewer`: view_form, view_published_forms_only
- `lead_admin`: view_all_submissions, update_submission_metadata, delete_submission, export_submissions
- `lead_viewer`: view_submissions, export_submissions

**Role Assignment:**
- Company `admin` role can assign any form role via Settings > Team Members
- Form roles are company-scoped (via authz_user's company_id)
- New users have no form role by default (explicit grants required)
```

**Roles:**
- **form_admin** - Create, edit, delete, publish forms
- **form_viewer** - View forms (read-only)
- **lead_admin** - View, edit, export submissions
- **lead_viewer** - View submissions (read-only)
- **super_admin** - All permissions

#### Analytics
No separate tables needed - use Ash calculations and aggregates on existing Forms resources.

---

### Future Schema (Document Only - Do Not Implement)

#### Calendar Domain (Post-MVP)
```sql
-- Calendar bookings
CREATE TABLE calendar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, completed, cancelled, no_show
  attendee_email VARCHAR(255),
  attendee_name VARCHAR(255),
  meeting_url VARCHAR(255),
  calendar_event_id VARCHAR(255),  -- external calendar ID
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Team availability patterns
CREATE TABLE team_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,  -- 0-6 (Sun-Sat)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Date-specific overrides
CREATE TABLE availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  override_type VARCHAR(50) NOT NULL,  -- blocked, custom_hours
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Calendar provider integrations
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,  -- google, outlook
  access_token TEXT NOT NULL,  -- encrypted
  refresh_token TEXT NOT NULL,  -- encrypted
  token_expires_at TIMESTAMP,
  calendar_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Chatbot Domain (Post-MVP)
```sql
-- Chatbot conversations
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  user_info JSONB NOT NULL,  -- first_name, last_name, email, company
  session_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',  -- active, closed
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Chatbot messages
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL,  -- user, ai
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,  -- intent, confidence, quick_actions
  inserted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Implementation Phases (MVP - 6 Weeks)

### Phase 1: Foundation (Week 1-2)
**Priority:** Core domain models, layout, roles, and basic UI
**Tracks:** 1 (LiveView UI), 2 (Domain Models)

**Tasks:**
- ✅ **Layout & Navigation:**
  - Create shared header component (persistent across all pages)
  - Create shared sidebar component (role-based visibility)
  - Implement responsive layout (mobile hamburger menu)
  - Add dark mode toggle
- ✅ **Role-Based Access Control:**
  - Create `user_roles` database table and migration
  - Create `UserRole` Ash resource
  - Add roles relationship to `User` resource
  - Implement authorization helpers and policies
  - Add role checks to sidebar navigation
- ✅ **Forms Domain:**
  - Set up Forms domain with Ash resources (Form, FormField, Submission)
  - Create database migrations for forms tables
  - Add Ash policies for role-based access
- ✅ **UI Pages (Full-Page Detail Views):**
  - Build dashboard page (KPIs placeholder)
  - Build forms list page (with role-based create button)
  - Build form builder page (full-page, not modal)
  - Build form detail/submissions page (full-page)
- ✅ **Form Builder:**
  - Drag-and-drop field editor (basic fields: text, email, textarea, select, checkbox, radio)
  - Field configuration panel
  - Form preview
  - Client + server-side validation
- ✅ **Public Form Submission:**
  - Public form page (`/f/:slug`)
  - Form submission handling
  - Store submission data

**Deliverables:**
- ✅ Header and sidebar visible on all authenticated pages
- ✅ Role-based navigation (Form Admin/Viewer, Lead Admin/Viewer)
- ✅ Forms can be created, listed, edited, published (role-based)
- ✅ Form fields can be added and configured
- ✅ Submissions can be submitted and stored
- ✅ Dashboard shows basic structure (KPIs placeholder)
- ✅ All pages use full-page detail views (not modals)
- ✅ Calendar and chatbot show "Coming Soon" in UI

---

### Phase 2: Analytics & KPIs (Week 3-4)
**Priority:** Metrics tracking and visualization
**Tracks:** 3 (Analytics)

**Tasks:**
- ✅ Implement Ash calculations for conversion rates
- ✅ Add aggregates for submission counts, form stats
- ✅ Build analytics page with KPI cards
- ✅ Create time-series data queries (submissions over time)
- ✅ Integrate Chart.js for data visualization
- ✅ Add caching layer (Cachex) for expensive calculations
- ✅ Background job setup (Oban) if needed for performance

**Deliverables:**
- Dashboard shows real KPIs (Total Forms, Submissions, Conversion Rate)
- Analytics page with detailed form performance metrics
- Charts visualizing submissions over time
- Top performing forms list
- Field completion analytics
- Performant queries (<500ms page load)

---

### Phase 3: Settings & Polish (Week 5-6)
**Priority:** Configuration, UX, and production readiness
**Tracks:** 4 (Settings), 1 (UI Polish)

**Tasks:**
- ✅ Settings pages (General, Notifications, Integrations)
- ✅ User profile management
- ✅ Form default settings
- ✅ Notification preferences (email alerts for submissions)
- ✅ Integration placeholders (Calendar, Chatbot with "Coming Soon")
- ✅ Dark mode support
- ✅ Mobile responsive refinements
- ✅ Accessibility improvements (WCAG 2.1 AA)
- ✅ Performance optimization (query optimization, caching)
- ✅ Comprehensive testing (unit, integration, E2E)
- ✅ Error handling and validation improvements

**Deliverables:**
- Settings are fully configurable
- Full dark mode support
- Mobile-friendly UI across all pages
- WCAG 2.1 AA compliance
- Test coverage >70%
- Production-ready application
- Clear "Coming Soon" messaging for future features

---

### Post-MVP (Future Phases)

**Phase 4: Calendar Integration (2-3 weeks)**
- Implement calendar booking widget
- Google/Outlook OAuth integration
- Availability management
- Email confirmations

**Phase 5: Chatbot Widget (1-2 weeks)**
- Build chatbot UI
- Message threading
- AI integration (OpenAI/Claude)
- Demo booking from chat

## Design System Mapping

### Colors
| Figma Token | Tailwind Class | CSS Variable |
|-------------|----------------|--------------|
| Primary (#2278C0) | `bg-blue-600` | `--primary` |
| Accent (#00D3BB) | `bg-teal-400` | `--accent` |
| Muted (#F8F8F8) | `bg-gray-50` | `--muted` |
| Success | `bg-green-500` | `--success` |
| Warning | `bg-orange-500` | `--warning` |
| Error | `bg-red-500` | `--destructive` |

### Typography
| Element | Figma | Tailwind Class |
|---------|-------|----------------|
| Page Title | Inter 38px Bold | `text-[38px] font-bold` |
| Section Heading | Inter 24px SemiBold | `text-2xl font-semibold` |
| Body Text | Inter 14px Regular | `text-sm` |
| Small Text | Inter 12px Regular | `text-xs` |

### Spacing
- Base unit: 8px grid system
- Card padding: 24px (`p-6`)
- Section spacing: 32px (`space-y-8`)
- Border radius: 16px on cards (`rounded-2xl`)

### Components to Build
1. **KPI Card** - Stats display with icon, value, change percentage
2. **Form Card** - Form preview with actions (edit, delete, duplicate)
3. **Sidebar Module** - Collapsible navigation group
4. **Breadcrumb** - Page navigation trail
5. **Calendar Widget** - Date/time picker with availability
6. **Chat Bubble** - Message display with avatar
7. **Stats Chart** - Line/bar charts for analytics
8. **Integration Card** - Provider connection status
9. **Availability Editor** - Weekly schedule configurator
10. **Modal Dialog** - Confirmation, forms, booking flows

## Routing Structure

### MVP Routes (Implement Now)
```elixir
# Dashboard
/dashboard                               # Dashboard overview with KPIs

# Forms
/forms                                   # Forms listing
/forms/new                               # Create new form
/forms/:id                               # Form details (view submissions)
/forms/:id/edit                          # Form builder (edit fields)
/forms/:id/submissions                   # Submissions list for specific form

# Analytics
/analytics                               # Global analytics dashboard
/analytics/:form_id                      # Per-form analytics page

# Settings
/settings                                # Settings overview
/settings/profile                        # User profile settings
/settings/notifications                  # Notification preferences
/settings/integrations                   # Integration placeholders ("Coming Soon")

# Public (no auth required)
/f/:slug                                 # Public form submission page
```

### Future Routes (Post-MVP)
```elixir
# Calendar (Phase 4)
/calendar                                # Calendar integration overview
/calendar/bookings                       # Upcoming bookings list
/calendar/availability                   # Team availability settings

# Chatbot (Phase 5)
/chatbot                                 # Chatbot conversations list
/chatbot/:id                             # Conversation details

# Advanced Settings
/settings/team                           # Team calendar settings (Phase 4)
/settings/chatbot                        # Chatbot configuration (Phase 5)
```

## Testing Strategy

### Unit Tests
- Ash resource actions (create, read, update, destroy)
- Calculations and aggregates
- Validation logic
- Time slot availability calculations
- OAuth token handling

### Integration Tests
- Form submission flow
- Calendar booking flow
- Chatbot conversation flow
- External calendar sync
- Email sending

### E2E Tests (Playwright - already set up in project)
- Complete form builder workflow
- Complete booking workflow
- Complete chatbot conversation
- Settings configuration

### Performance Tests
- Dashboard load time with large datasets
- Form submission handling (concurrent)
- Calendar availability calculation (multiple team members)

## Security Considerations

1. **Authentication**
   - Use existing AshAuthentication system
   - All resources require authenticated user
   - Use `on_mount` LiveView guards

2. **Authorization**
   - Ash policies for resource access
   - Users can only see their own forms
   - Admin role for team-wide visibility

3. **Data Validation**
   - Form field validation on both client and server
   - Sanitize user-submitted form data
   - Validate calendar booking inputs

4. **External Integrations**
   - Encrypt OAuth tokens in database
   - Use HTTPS for all API calls
   - Validate webhook signatures
   - Rate limiting on chatbot

5. **Privacy**
   - GDPR compliance for form submissions
   - Data retention policies
   - Email opt-in/opt-out
   - Cookie consent for chatbot

## Dependencies to Add

### MVP Dependencies
```elixir
# mix.exs additions for MVP

# Caching for analytics (optional - only if performance requires)
{:cachex, "~> 3.6"},

# Background jobs for expensive calculations (optional)
{:oban, "~> 2.17"},

# Already present (no changes needed):
# {:jason, "~> 1.4"}           # JSON encoding/decoding
# {:swoosh, "~> 1.14"}         # Email delivery
# {:ex_machina, "~> 2.7"}      # Test factories
# {:faker, "~> 0.17"}          # Test data generation
```

### Future Dependencies (Post-MVP)
```elixir
# Phase 4: Calendar Integration
{:tzdata, "~> 1.1"},           # Timezone handling
{:oauth2, "~> 2.0"},           # OAuth for Google/Outlook
{:finch, "~> 0.16"},           # HTTP client for API calls
{:cloak, "~> 1.1"},            # Encryption for OAuth tokens

# Phase 5: Chatbot
{:req, "~> 0.4"},              # HTTP client for AI APIs
# OR {:openai, "~> 0.5"}       # OpenAI integration
```

## Success Metrics (MVP)

### Technical Metrics
- [ ] Tracks 1-4 (MVP) completed
- [ ] Test coverage >70%
- [ ] Page load times <500ms
- [ ] Zero N+1 queries in forms/submissions
- [ ] Mobile responsive (all breakpoints: 320px, 768px, 1024px, 1440px)
- [ ] Dark mode fully functional
- [ ] WCAG 2.1 AA compliant
- [ ] Calendar and chatbot show "Coming Soon" placeholders

### Feature Metrics
- [ ] Forms can be created, edited, and published
- [ ] Form fields can be added/removed/reordered
- [ ] Submissions are captured and stored correctly
- [ ] Analytics show real-time data on dashboard
- [ ] KPI calculations are accurate (conversion rate, counts)
- [ ] Charts display correctly (submissions over time)
- [ ] Settings are configurable (profile, notifications)
- [ ] Email notifications work for new submissions

### User Experience Metrics
- [ ] Form builder is intuitive and easy to use
- [ ] Dashboard loads in <500ms with real data
- [ ] No error states for happy path workflows
- [ ] Clear feedback for all actions (success/error messages)
- [ ] Public form submission works smoothly
- [ ] Mobile experience is equivalent to desktop
- [ ] Future features clearly marked as "Coming Soon"

### Post-MVP Metrics (Future)
- [ ] Calendar bookings work end-to-end
- [ ] External calendar sync (Google + Outlook)
- [ ] Chatbot conversations persist
- [ ] Booking flow is <3 clicks
- [ ] Chatbot response time <1s

## Next Steps

1. **Read this overview** to understand the MVP scope
2. **Review each MVP track folder** for detailed implementation plans:
   - `20251115-02-forms-liveview-ui/` - UI conversion (Track 1)
   - `20251115-03-forms-domain-models/` - Ash resources (Track 2)
   - `20251115-04-forms-analytics-kpis/` - Analytics (Track 3)
   - `20251115-05-forms-settings-integrations/` - Settings (Track 4)
3. **Review future track folders** (for reference only, do not implement):
   - `20251115-xx-future-calendar-integration/` - Calendar system
   - `20251115-xx-future-chatbot-widget/` - Chatbot
4. **Start with Phase 1** (Foundation) - Forms domain + basic UI
5. **Follow the 3 phases sequentially** (6 weeks total)
6. **Use existing Ash/Phoenix patterns** from the codebase
7. **Ensure "Coming Soon" placeholders** for calendar and chatbot features

## Questions to Clarify (MVP Scope)

Before creating specs and implementing, clarify:

### 1. Forms Scope (MVP - Track 1 & 2)
**Field Types:**
- **Q:** Start with basic field types only? (text, email, textarea, select, checkbox, radio)
- **Q:** Or include advanced types immediately? (number, date, phone, URL, file upload)
- **Recommendation:** Start with basic 6 types, add advanced types in Phase 3 if time permits

**Form Features:**
- **Q:** Conditional logic (show field X if field Y = value)? MVP or Future?
- **Q:** Multi-page forms? MVP or Future?
- **Q:** File upload support? MVP or Future?
- **Q:** Form templates/duplications? MVP or Future?
- **Recommendation:** Skip conditional logic, multi-page, and file uploads for MVP. Add basic form duplication.

**Validation:**
- **Q:** Client-side validation only, or also server-side?
- **Q:** Custom validation rules per field?
- **Recommendation:** Both client and server-side validation. Basic validation rules (required, email format, min/max length).

---

### 2. Analytics Scope (MVP - Track 3)
**Performance:**
- **Q:** Real-time calculations on page load, or background jobs?
- **Q:** Add caching layer (Cachex) immediately, or only if performance issues?
- **Recommendation:** Start with real-time Ash calculations. Add Cachex only if dashboard >500ms load time.

**Data Retention:**
- **Q:** How long to keep submission data? Forever? 1 year? Configurable?
- **Recommendation:** Keep forever for MVP, add retention policy in future.

**Export:**
- **Q:** Export formats? CSV only? PDF? Excel?
- **Q:** Export all submissions, or filtered/paginated?
- **Recommendation:** CSV export only for MVP. Export all submissions for a form.

**Metrics:**
- **Q:** Which KPIs are must-have vs nice-to-have?
- **Must-have:** Total Forms, Total Submissions, Conversion Rate
- **Nice-to-have:** Average completion time, lead source tracking, field analytics
- **Recommendation:** Implement must-haves first, add nice-to-haves in Phase 2 if time permits.

---

### 3. Settings Scope (MVP - Track 4)
**User Settings:**
- **Q:** User profile editing (name, email, password)? Or use existing auth system?
- **Recommendation:** Use existing AshAuthentication system for profile management. Add basic preferences (timezone, email notifications).

**Notification Preferences:**
- **Q:** Email notifications for new submissions? Real-time? Daily digest?
- **Q:** Notification channels? Email only? In-app? Slack/webhooks?
- **Recommendation:** Email notifications only. Send immediately on submission (via Swoosh).

**Form Defaults:**
- **Q:** Global form settings (default branding, colors, fonts)?
- **Q:** Per-form settings override global?
- **Recommendation:** Per-form settings only for MVP. Skip global defaults.

---

### 4. Future Features (Post-MVP)
**Calendar Integration (Phase 4):**
- Deferred to post-MVP
- Questions documented in `20251115-xx-future-calendar-integration/`

**Chatbot Widget (Phase 5):**
- Deferred to post-MVP
- Questions documented in `20251115-xx-future-chatbot-widget/`

**Additional Integrations:**
- **Q:** Zapier/webhooks for form submissions? MVP or Future?
- **Recommendation:** Future. Add webhook URL support in Phase 4.

---

### 5. Technical Decisions
**Testing:**
- **Q:** Target test coverage? 70%? 80%?
- **Recommendation:** 70% for MVP (pragmatic balance).

**Performance:**
- **Q:** Page load target? 500ms? 1s?
- **Recommendation:** <500ms for dashboard, <1s for form builder.

**Browser Support:**
- **Q:** Modern browsers only (last 2 versions)? Or IE11 support?
- **Recommendation:** Modern browsers only (Chrome, Firefox, Safari, Edge).

## Resources & References

### Figma Source
- **Path:** `figma_src/205 Forms Dashboard/`
- **Key Docs:**
  - `src/START_HERE.md` - Quick overview
  - `src/FEATURE_DOCUMENTATION.md` - Feature details
  - `src/MODULE_ARCHITECTURE.md` - Architecture guide
  - `src/IMPLEMENTATION_SUMMARY.md` - What was built

### Codebase References
- **CLAUDE.md** - Project overview and setup
- **Ash Guidelines:** `/ash-guidelines` skill
- **LiveView Guidelines:** `/liveview-guidelines` skill
- **Phoenix Guidelines:** `/phoenix-guidelines` skill
- **Existing Auth:** `lib/clientt_crm_app/accounts/` - User resource example

### External Documentation
- [Ash Framework Docs](https://hexdocs.pm/ash/)
- [Phoenix LiveView Docs](https://hexdocs.pm/phoenix_live_view/)
- [AshPostgres Docs](https://hexdocs.pm/ash_postgres/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

**Status:** ✅ MVP Planning Complete - Ready for Spec Creation
**MVP Scope:** 5 Tracks, 3 Phases, 6 Weeks
**Next:** Review MVP track folders (02-05), clarify questions above, then create specs
**Future:** Calendar and Chatbot tracks documented in `xx-future-*` folders
**Contact:** See individual track README files for specific questions
