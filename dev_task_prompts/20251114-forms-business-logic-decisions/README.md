# Forms Builder - Business Logic & Feature Scope Decisions

**Type**: Business Decision & Requirements Clarification
**Priority**: 🟠 High
**Status**: Needs Stakeholder Input
**Created**: 2025-11-14

## Overview

This dev_prompt focuses on business logic decisions and feature scope clarifications for the Forms Builder module. These decisions will shape the product roadmap and determine MVP vs. future feature scope.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Question #1: Form Versioning
- Question #2: Multi-Page Forms
- Question #3: Conditional Field Logic
- Question #4: Team Calendar Shared Availability
- Question #5: Lead Deduplication Strategy
- Question #7: External Calendar Event Ownership
- Question #8: Booking Cancellation Handling
- Question #10: Dashboard Module Activation

## Stakeholders

**Decision Makers**:
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] UX Designer
- [ ] Sales/Customer Success (for calendar features)

**Consultation**:
- [ ] Security Team (for data retention)
- [ ] Compliance Team (for GDPR implications)

---

## Decision #1: Form Versioning

**Priority**: 🟡 Medium
**Timeline**: Before Phase 1 implementation

### Question

Should published forms support versioning when edited after they have submissions?

### Context

- Users may need to update published forms (fix typos, add fields, etc.)
- Existing submissions reference the form structure
- Analytics and reports need to know which version was submitted
- Form exports need to map to correct field schema

### Current Specification

Forms are effectively immutable after first submission:
- Published forms cannot be deleted if they have submissions
- Forms can only be archived (not deleted)
- No explicit versioning mechanism

### Business Impact

**If No Versioning**:
- ❌ Cannot update published forms with submissions
- ❌ Must create new form for any changes
- ✅ Simpler implementation
- ✅ No data migration complexity

**If Simple Versioning**:
- ✅ Can update forms and keep historical submissions valid
- ✅ Reports show correct field labels for each submission
- ❌ More complex database schema
- ❌ Need version comparison UI

**If Full Version Control**:
- ✅ Can branch, rollback, compare versions
- ✅ Audit trail of all changes
- ❌ High implementation complexity
- ❌ May be overkill for MVP

### Options

#### Option A: No Versioning (Current Spec)
**Behavior**:
- Published forms are immutable after first submission
- To make changes, must unpublish form (stops new submissions)
- Or create duplicate form with changes

**User Flow**:
1. User tries to edit published form with submissions
2. System shows warning: "This form has 50 submissions. Create new version?"
3. User clicks "Create New Version"
4. System duplicates form with new slug: `lead-capture-form-v2`
5. Old form can be unpublished

**Pros**:
- Simple implementation
- No data migration needed
- Clear separation of old vs. new

**Cons**:
- Awkward user experience
- URL changes (breaks embedded forms)
- Analytics split across multiple forms

**Effort**: Already implemented in current spec

#### Option B: Simple Versioning
**Behavior**:
- Forms track `version` integer (auto-increment)
- Editing published form creates new version
- Submissions reference `form_id` + `form_version`
- Reports group by version

**User Flow**:
1. User edits published form
2. System prompts: "Save as new version? (Version 2)"
3. User confirms
4. System increments version, saves changes
5. New submissions use v2, old submissions stay on v1

**Schema Changes**:
```elixir
# forms table
add :current_version, :integer, default: 1

# form_versions table (new)
create table(:form_versions) do
  add :form_id, references(:forms)
  add :version, :integer
  add :fields_snapshot, :map  # Store field structure
  add :settings_snapshot, :map
  add :created_at, :utc_datetime
end

# form_submissions table (update)
add :form_version, :integer  # Which version was submitted
```

**Pros**:
- Better UX (can update forms)
- Same URL (no breaks)
- Historical accuracy in reports

**Cons**:
- Medium implementation complexity
- Schema migration required
- Need version comparison UI

**Effort**: ~1 week implementation

#### Option C: Full Version Control
**Behavior**:
- Forms support branching, rollback, diff
- Version graph (like git)
- Can preview any historical version

**Effort**: ~3-4 weeks implementation
**Recommendation**: ❌ Overkill for MVP

### Recommendation

**For MVP**: Option A (No Versioning)
**For Phase 2**: Option B (Simple Versioning)

**Rationale**:
- MVP can launch without versioning
- Simple versioning adds enough value for Phase 2
- Full version control is not needed

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Rationale**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #2: Multi-Page Forms

**Priority**: 🟡 Medium
**Timeline**: Before Phase 2 implementation

### Question

Should forms support multiple pages/steps (wizard-style forms)?

### Context

- Long forms can benefit from pagination
- Reduces form abandonment
- Common in modern form builders (Typeform, Google Forms)
- Adds complexity to builder, validation, and submission logic

### Current Specification

Single-page forms only. All fields render on one page.

### Business Impact

**If Single-Page Only**:
- ✅ Simpler implementation
- ✅ Faster to market
- ❌ Long forms have poor UX
- ❌ Competitive disadvantage

**If Multi-Page**:
- ✅ Better UX for long forms
- ✅ Can save progress between pages
- ✅ Conditional page visibility
- ❌ More complex implementation
- ❌ More complex analytics

### Use Cases

**Example: Sales Qualification Form**
- Page 1: Basic Contact Info (name, email, company)
- Page 2: Company Details (size, industry, budget)
- Page 3: Needs Assessment (pain points, timeline)
- Page 4: Demo Scheduling

**Benefit**: User sees progress, doesn't feel overwhelmed

### Options

#### Option A: Single-Page Only (Current Spec)
**Effort**: Already implemented
**Pros**: Simple, fast to market
**Cons**: Poor UX for long forms

#### Option B: Multi-Page with Progress Tracking
**New Attributes Needed**:
```elixir
# form_fields table
add :page_number, :integer, default: 1
add :page_title, :string

# forms table - settings
%{
  settings: %{
    multi_page_enabled: true,
    show_progress_bar: true,
    save_progress: true  # Allow user to resume later
  }
}
```

**User Flow**:
1. User enables "Multi-Page" in form settings
2. User organizes fields into pages (drag-drop)
3. Each page has title and optional description
4. Submitter sees "Step 1 of 3" progress indicator
5. Can go back/forward between pages
6. Can save progress and resume later (optional)

**Validation Logic**:
- Validate page-by-page or all at end?
- Show errors on current page only?

**Submission Data Structure**:
```elixir
# Same structure, just UI difference
%FormSubmission{
  data: %{
    # All fields regardless of page
    "name" => "John",
    "email" => "john@example.com",
    "company_size" => "11-50"
  },
  metadata: %{
    pages_completed: 3,
    time_per_page: [20, 45, 30],  # seconds
    abandonment_page: nil  # or page number if abandoned
  }
}
```

**Pros**:
- Better UX for long forms
- Improves completion rates
- Competitive feature

**Cons**:
- Medium complexity
- Need page navigation UI
- Analytics more complex

**Effort**: ~2 weeks implementation

#### Option C: Conditional Page Logic
Like Option B, but pages can be conditionally shown/hidden.

**Example**: Show "Enterprise Features" page only if company size > 100

**Effort**: ~3 weeks (includes Option B + conditional logic)

### Recommendation

**For MVP**: Option A (Single-Page Only)
**For Phase 2**: Option B (Multi-Page with Progress)
**For Phase 3**: Option C (Conditional Page Logic)

**Rationale**:
- MVP should focus on core form building
- Multi-page is common enough to prioritize for Phase 2
- Conditional page logic is advanced feature for Phase 3

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #3: Conditional Field Logic

**Priority**: 🟡 Medium
**Timeline**: Before Phase 2 implementation

### Question

Should fields support conditional visibility (show/hide based on other field values)?

### Context

- Common feature in form builders
- Improves UX by hiding irrelevant fields
- Adds complexity to validation and rendering
- Current spec mentions it but not fully defined

### Current Specification

FormField resource has `conditional_logic` map attribute, but implementation details not specified.

### Use Cases

**Example 1**: Show "Company Name" only if "Are you a business?" is "Yes"
**Example 2**: Show "Other" text field only if dropdown selection is "Other"
**Example 3**: Show "Phone Number" only if "Preferred Contact" is "Phone"

### Options

#### Option A: No Conditional Logic (Simplified MVP)
**Pros**: Simpler implementation
**Cons**: All fields always visible (poor UX for complex forms)
**Effort**: Remove `conditional_logic` from spec

#### Option B: Simple Show/Hide Rules
**Implementation**:
```elixir
# FormField conditional_logic map
%{
  visibility_rules: [
    %{
      field_name: "customer_type",
      operator: "equals",  # equals, not_equals, contains
      value: "business"
    }
  ],
  logic_operator: "and"  # or "or" for multiple rules
}
```

**Supported Operators**:
- `equals`, `not_equals`
- `contains`, `not_contains` (for text)
- `greater_than`, `less_than` (for numbers)
- `is_empty`, `is_not_empty`

**Validation**: Only validate visible fields

**Frontend Rendering**:
```javascript
// LiveView JS hook
phx-hook="ConditionalField"
data-depends-on="customer_type"
data-show-when="business"
```

**Pros**:
- Common use cases covered
- Medium implementation complexity

**Cons**:
- Need JavaScript for real-time show/hide
- Validation logic more complex

**Effort**: ~1 week implementation

#### Option C: Advanced Logic with Field Chaining
Support complex rules like:
- "Show field C if A=X AND B=Y"
- "Show field D if A=X OR B=Y"
- Field C depends on B, which depends on A (chaining)

**Effort**: ~2-3 weeks implementation

### Recommendation

**For MVP**: Option A (No Conditional Logic) - defer to Phase 2
**For Phase 2**: Option B (Simple Show/Hide Rules)
**For Phase 3**: Option C (Advanced Logic)

**Rationale**:
- MVP can launch without conditional logic
- Simple rules cover 80% of use cases
- Advanced logic is rarely needed

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #4: Team Calendar & Round-Robin Assignment

**Priority**: 🟠 High
**Timeline**: Before Phase 1 implementation

### Question

Should calendar bookings support team member selection and round-robin assignment?

### Context

- Figma shows "Team Members Management" in calendar settings
- Sales teams often have multiple reps sharing lead flow
- Need fair distribution of bookings
- Current spec: single calendar per company

### Use Cases

**Scenario 1: Sales Team**
- Company has 5 sales reps
- Bookings should be distributed evenly
- Rep with fewest bookings gets next lead

**Scenario 2: Support Team**
- Customer chooses support tier (Basic, Premium, Enterprise)
- Enterprise customers assigned to senior reps
- Basic customers use round-robin

### Options

#### Option A: Single Calendar Only (Current Spec)
**Behavior**:
- One calendar connection per company
- All bookings go to that calendar
- No team member selection

**Pros**:
- Simple implementation (already specced)
- Fast to market

**Cons**:
- Doesn't support team use case
- Competitive disadvantage

**Effort**: Already implemented in spec

#### Option B: Team Member Selection (User Choice)
**Implementation**:
```elixir
# New resource: TeamMember
attributes do
  uuid_primary_key :id
  attribute :company_id, :uuid
  attribute :user_id, :uuid
  attribute :calendar_connection_id, :uuid
  attribute :display_name, :string
  attribute :avatar_url, :string
  attribute :bio, :text
  attribute :booking_enabled, :boolean, default: true
end

# CalendarBooking update
add :assigned_team_member_id, references(:team_members)
```

**User Flow (Customer)**:
1. Customer fills out form
2. After form submission, sees team member selection
3. Selects available team member
4. Books demo on that member's calendar

**User Flow (Admin)**:
1. Admin connects multiple team members' calendars
2. Each member has own OAuth connection
3. Admin enables/disables members for bookings

**Pros**:
- Customer has control
- Can showcase team member expertise
- Works with personal calendars

**Cons**:
- Customer may not know who to choose
- Uneven distribution (popular reps get overbooked)
- Each member needs OAuth connection

**Effort**: ~2 weeks implementation

#### Option C: Round-Robin Assignment (Automatic)
**Implementation**:
```elixir
# TeamMember attributes
add :booking_load, :integer, default: 0  # Current bookings
add :max_bookings_per_day, :integer
add :priority, :integer  # Higher = more bookings

# Assignment algorithm
defmodule Integrations.RoundRobinAssignment do
  def assign_next_available(company_id, requested_date) do
    TeamMembers.list_available(company_id, requested_date)
    |> Enum.sort_by(&{&1.booking_load, -&1.priority})
    |> List.first()
  end
end
```

**User Flow**:
1. Customer fills out form
2. System automatically assigns to team member with lowest load
3. Booking created on that member's calendar
4. Member's `booking_load` increments

**Pros**:
- Fair distribution
- No customer decision needed
- Optimizes team utilization

**Cons**:
- Complex algorithm
- Need availability aggregation
- Member preferences (timezone, skills)

**Effort**: ~3 weeks implementation

#### Option D: Hybrid (Both Options)
**Behavior**:
- Admin chooses: "Team Selection" or "Round-Robin"
- Forms can offer customer choice or auto-assign
- Flexible for different use cases

**Effort**: ~4 weeks implementation

### Recommendation

**For MVP**: Option A (Single Calendar)
**For Phase 2**: Option C (Round-Robin Assignment)
**For Phase 3**: Option D (Hybrid with Customer Choice)

**Rationale**:
- MVP should focus on single-user companies
- Round-robin is more valuable than customer choice
- Hybrid approach is future enhancement

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Use Cases**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #5: Lead Deduplication Strategy

**Priority**: 🟠 High
**Timeline**: Before Phase 1 implementation

### Question

How should we handle duplicate leads (same person submitting multiple forms or chatbot interactions)?

### Context

- Same person may submit multiple forms
- Same email may appear in form submission + chatbot
- Current spec suggests 30-day email-based deduplication
- Need to decide: merge leads or keep separate?

### Use Cases

**Scenario 1: Multiple Form Submissions**
- User submits "Contact Us" form on Monday
- Same user submits "Demo Request" form on Wednesday
- Should we create 2 leads or 1 lead with 2 submissions?

**Scenario 2: Form + Chatbot**
- User submits form on website
- Same user uses chatbot 2 days later
- Should chatbot lead reference original lead?

**Scenario 3: Email Typo Correction**
- User submits with email: `john@example.com`
- User later submits with email: `john@exmple.com` (typo)
- Are these the same person?

### Options

#### Option A: No Deduplication
**Behavior**:
- Every submission creates new lead
- Every chatbot interaction creates new lead
- No merging

**Pros**:
- Simplest implementation
- No complex merge logic
- Clear audit trail

**Cons**:
- Duplicate leads in CRM
- Inflated lead counts
- Sales confusion

**Effort**: Already implemented in spec (remove dedup logic)

#### Option B: Email-Based Deduplication (30-day window)
**Current Spec Implementation**:
```elixir
# Before creating ChatbotLead
existing_lead = ChatbotLeads.find_duplicate(
  email: params.email,
  within_days: 30
)

case existing_lead do
  nil ->
    # Create new lead
    ChatbotLeads.create_lead(params)

  lead ->
    # Update existing lead with new interaction
    ChatbotLeads.add_interaction(lead, params)
end
```

**Merge Strategy**:
- Keep older lead
- Append new interaction to conversation history
- Update `updated_at` timestamp
- Increment interaction count
- Recalculate lead score

**Pros**:
- Reduces duplicates
- Cleaner CRM
- More accurate analytics

**Cons**:
- May merge unrelated people (shared email)
- Lose some interaction context
- Complex merge logic

**Effort**: ~1 week implementation

#### Option C: Smart Matching (Email + Name + Company)
**Behavior**:
- Match on email (required)
- AND match on name (if provided)
- AND match on company (if provided)

**Example**:
```elixir
defmodule Forms.LeadDeduplication do
  def find_duplicate(params) do
    query = ChatbotLeads
      |> where(email: ^params.email)
      |> where(inserted_at > ago(30, "day"))

    # Fuzzy match name if provided
    query = if params.name do
      query |> where(fragment("similarity(name, ?) > 0.8", ^params.name))
    else
      query
    end

    Repo.one(query)
  end
end
```

**Pros**:
- More accurate matching
- Fewer false positives

**Cons**:
- More complex
- Requires pg_trgm extension for fuzzy matching
- Slower queries

**Effort**: ~2 weeks implementation

#### Option D: User-Controlled Merge
**Behavior**:
- System shows potential duplicates
- User manually merges or dismisses

**UI**:
```
⚠️ Potential duplicate found:
  Lead #123: john@example.com (submitted 2024-11-10)
  Current: john@example.com (submitted 2024-11-14)

  [Merge Leads] [Keep Separate]
```

**Pros**:
- User has control
- No false merges
- Can review before merging

**Cons**:
- Requires manual work
- Slows down sales workflow

**Effort**: ~2 weeks implementation

### Recommendation

**For MVP**: Option B (Email-Based, 30-day window)
**For Phase 2**: Add Option D (User-Controlled Merge for review)
**For Phase 3**: Option C (Smart Matching) as automation

**Rationale**:
- Email-based dedup covers 80% of cases
- 30-day window prevents false merges
- Manual review for edge cases in Phase 2

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Dedup Window**: ___ days
- [ ] **Merge Strategy**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #6: External Calendar Event Ownership

**Priority**: 🟠 High
**Timeline**: Before Phase 1 implementation

### Question

Whose calendar should events be created on in a team environment?

### Context

- Company connects calendar (e.g., sales@company.com)
- Multiple users may schedule bookings
- Events created on external calendar
- Who "owns" the event?

### Options

#### Option A: Company Calendar (Current Spec)
**Behavior**:
- All events created on connected company calendar
- One OAuth connection per company
- All team members share same calendar

**Pros**:
- Simple implementation
- One OAuth flow
- Centralized calendar

**Cons**:
- Doesn't support personal calendars
- All bookings in one calendar (messy)
- No individual team member tracking

**Effort**: Already implemented in spec

#### Option B: Per-User Calendars
**Behavior**:
- Each user connects their own calendar
- Bookings created on individual calendars
- Multiple OAuth connections per company

**Pros**:
- Personal calendar support
- Individual team member tracking
- Cleaner calendar separation

**Cons**:
- Each user needs OAuth flow
- More complex connection management
- Availability aggregation harder

**Effort**: ~2 weeks (modify calendar_connections)

#### Option C: Delegated Calendars
**Behavior**:
- Company connects shared calendar
- Events created on behalf of team members
- Uses Google Calendar "delegate" feature

**Pros**:
- Single OAuth, multiple calendars
- Supports team assignment

**Cons**:
- Requires calendar delegation setup
- Not supported by all providers
- Complex permission management

**Effort**: ~3 weeks (research + implementation)

### Recommendation

**For MVP**: Option A (Company Calendar)
**For Phase 2**: Option B (Per-User Calendars) when team features added

**Rationale**:
- MVP targets single-user companies
- Per-user calendars needed when team features added
- Delegated calendars too complex

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Decision #7: Booking Cancellation Handling

**Priority**: 🟡 Medium
**Timeline**: Before Phase 1 implementation

### Question

When a booking is cancelled, should the external calendar event be deleted or marked cancelled?

### Context

- Google/Microsoft support both deletion and status update
- Tradeoff: clean calendar vs. audit trail

### Options

#### Option A: Delete Event
**Behavior**:
- Remove event from external calendar entirely

**Pros**:
- Cleaner calendar
- No clutter

**Cons**:
- Lose external calendar history
- No audit trail on calendar

**Effort**: Low

#### Option B: Mark Cancelled (Update Status)
**Behavior**:
- Keep event but update status to "cancelled"
- Event appears as "Cancelled: Demo with John"

**Pros**:
- Audit trail on calendar
- Can see cancellation history

**Cons**:
- Cluttered calendar
- Cancelled events still visible

**Effort**: Low

#### Option C: Configurable per Company
**Behavior**:
- Admin chooses preference in settings
- Default: delete

**Pros**:
- Flexible for different workflows

**Cons**:
- More configuration options
- Need to test both paths

**Effort**: Medium

### Recommendation

**For MVP**: Option A (Delete Event) by default
**For Phase 2**: Option C (Configurable)

**Rationale**:
- Most users prefer clean calendars
- Can add configurability later
- Internal audit trail sufficient (CalendarBooking record)

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Default Behavior**: ___________

---

## Decision #8: Dashboard Module Activation

**Priority**: 🟡 Medium
**Timeline**: Before Dashboard implementation

### Question

How should modules be activated/deactivated in the dashboard?

### Context

- Figma shows "Coming Soon" badges for CRM, CPQ, Billing, Support
- Need admin UI to activate modules
- May tie to subscription plans (future)

### Options

#### Option A: All Modules Always Active
**Behavior**:
- All modules visible to all companies
- "Coming Soon" is just a badge (not enforcement)

**Pros**:
- Simplest implementation
- No feature flags

**Cons**:
- No control over feature rollout
- Can't tie to subscription plans

**Effort**: None

#### Option B: Admin Toggle (Manual Activation)
**Behavior**:
- Admin can enable/disable modules per company
- Boolean flags in `companies` table

**Schema**:
```elixir
# companies table
add :modules_enabled, {:array, :string}, default: ["forms"]
# Example: ["forms", "crm", "billing"]
```

**Pros**:
- Simple feature flags
- Admin control

**Cons**:
- Manual process
- Doesn't scale with subscription plans

**Effort**: ~1 day

#### Option C: Subscription-Based Activation
**Behavior**:
- Subscription plans define modules
- Company's plan determines active modules

**Schema**:
```elixir
# subscription_plans table
create table(:subscription_plans) do
  add :name, :string  # "Starter", "Pro", "Enterprise"
  add :modules_included, {:array, :string}
  add :price, :integer
end

# companies table
add :subscription_plan_id, references(:subscription_plans)
```

**Pros**:
- Ties to revenue
- Upsell opportunity
- Automated activation

**Cons**:
- Requires billing integration
- More complex

**Effort**: ~2 weeks

### Recommendation

**For MVP**: Option A (All Active) - no enforcement
**For Phase 2**: Option B (Admin Toggle) for beta rollout
**For Phase 3**: Option C (Subscription-Based) for monetization

**Rationale**:
- MVP can show all modules (fake "Coming Soon")
- Admin toggle useful for gradual rollout
- Subscription plans come with billing module

### Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Timeline**: Implement in Phase ___

---

## Summary of Recommendations

| Decision | MVP Recommendation | Phase 2 | Phase 3 |
|----------|-------------------|---------|---------|
| Form Versioning | No versioning | Simple versioning | - |
| Multi-Page Forms | Single-page only | Multi-page | Conditional pages |
| Conditional Logic | No conditional logic | Simple rules | Advanced rules |
| Team Calendars | Single calendar | Round-robin | Hybrid |
| Lead Deduplication | Email-based (30-day) | + Manual merge | Smart matching |
| Calendar Ownership | Company calendar | Per-user calendars | - |
| Booking Cancellation | Delete event | Configurable | - |
| Module Activation | All active (fake) | Admin toggle | Subscription-based |

---

## Next Steps

1. **Schedule Decision Meeting**
   - [ ] Invite stakeholders
   - [ ] Review each decision
   - [ ] Make final calls
   - [ ] Document in this README

2. **Update Specifications**
   - [ ] Update resource specs with decisions
   - [ ] Update feature specs with scope
   - [ ] Update PLANNING.md with phase definitions

3. **Create Roadmap**
   - [ ] Define MVP scope
   - [ ] Plan Phase 2 features
   - [ ] Estimate timelines

---

**Status**: Awaiting Stakeholder Review
**Meeting Scheduled**: TBD
**Decision Deadline**: TBD
