# Resource: ChatbotLead

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents a prospective customer captured through chatbot interaction. ChatbotLeads store contact information, intent, qualification status, and context collected during conversational interactions. Enables lead tracking, deduplication, and progression through sales funnel.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this lead |
| email | string | Yes | valid email, unique within window | Lead's email address |
| first_name | string | Yes | 1-100 chars | Lead's first name |
| last_name | string | Yes | 1-100 chars | Lead's last name |
| company_name | string | No | max 255 chars | Lead's company |
| phone | string | No | valid phone | Lead's phone number |
| intent | atom | Yes | enum: [:pricing, :features, :demo, :support, :general] | Primary interest |
| source | atom | Yes | enum: [:chatbot, :form_then_chatbot, :direct_booking] | How lead was captured |
| qualification_status | atom | Yes | enum: [:new, :contacted, :qualified, :unqualified, :converted] | Lead stage |
| lead_score | integer | Yes | 0-100 | Calculated lead quality score |
| metadata | map | No | valid JSON | Additional lead context |
| utm_params | map | No | valid JSON | Attribution parameters |
| ip_address | string | No | valid IPv4/IPv6 | Lead's IP address |
| user_agent | string | No | max 500 chars | Lead's browser |
| captured_at | utc_datetime | Yes | - | When lead was captured |
| contacted_at | utc_datetime | No | - | When first contacted |
| qualified_at | utc_datetime | No | - | When qualified |
| converted_at | utc_datetime | No | - | When converted to customer |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Metadata Map Structure

```elixir
%{
  # Chatbot interaction data
  initial_question: "Can I see your pricing?",
  interaction_count: 5,
  total_conversation_time: 342,  # seconds
  pre_connect_form_completed: true,

  # Lead context
  referral_source: "Google Search",
  landing_page: "/features",
  page_visits: 3,
  time_on_site: 1234,  # seconds

  # Qualification data
  budget_range: "10k-50k",
  timeline: "Q1 2025",
  decision_maker: true,
  team_size: "11-50",
  current_solution: "Competitor X",
  pain_points: ["Manual data entry", "Poor reporting"],

  # Engagement signals
  downloaded_content: ["Pricing PDF", "Feature Guide"],
  attended_webinar: false,
  requested_trial: false,

  # Internal notes
  assigned_sales_rep: "uuid",
  follow_up_date: "2025-01-15",
  internal_notes: "High intent, budget confirmed"
}
```

## Business Rules

### Invariants

- Email must be unique within 30-day window per company (deduplication)
- Must have first_name, last_name, and email at minimum
- intent must be one of valid enum values
- lead_score must be 0-100
- qualification_status transitions must follow state machine
- converted_at can only be set when status is :converted
- Cannot delete leads (soft delete only, audit trail)

### Validations

- **email**: Required, valid RFC 5322 format, unique per company within 30 days
- **first_name**: Required, 1-100 characters, non-blank
- **last_name**: Required, 1-100 characters, non-blank
- **company_name**: Optional, max 255 characters
- **phone**: Optional, valid phone number format
- **intent**: Required, must be valid enum value
- **source**: Required, must be valid enum value
- **qualification_status**: Required, must be valid enum value
- **lead_score**: Required, integer 0-100
- **captured_at**: Required, cannot be in future

### Calculated Fields

- **full_name**: `"#{first_name} #{last_name}"`
- **is_qualified**: `qualification_status == :qualified`
- **is_converted**: `qualification_status == :converted`
- **days_since_captured**: `Date.diff(Date.utc_today(), captured_at)`
- **is_hot_lead**: `lead_score >= 75`

## State Transitions

```
new → contacted → qualified → converted
 ↓                    ↓
 → unqualified ←←←←←←←
```

**Valid Transitions**:

- `new → contacted`: When first chatbot interaction completes or sales rep reaches out
  - Sets `contacted_at` timestamp
  - May trigger sales notification

- `contacted → qualified`: When lead meets qualification criteria
  - Sets `qualified_at` timestamp
  - Publishes qualified event
  - May assign to sales rep

- `contacted → unqualified`: When lead doesn't meet criteria
  - Records reason in metadata
  - May trigger nurture campaign

- `qualified → converted`: When booking confirmed or deal created
  - Sets `converted_at` timestamp
  - Creates opportunity in CRM (future)

- `qualified → unqualified`: When lead goes cold or disqualifies
  - Records reason in metadata
  - May move to nurture campaign

**Invalid Transitions**:
- Cannot go from :unqualified back to :qualified (must create new lead)
- Cannot go from :converted to any other state (terminal)
- Cannot skip states (e.g., :new → :qualified without :contacted)

## Lead Scoring

Lead score (0-100) calculated from multiple factors:

```elixir
defmodule Forms.LeadScoring do
  def calculate_score(lead) do
    score = 0

    # Intent weighting (0-30 points)
    score = score + intent_score(lead.intent)

    # Engagement weighting (0-25 points)
    score = score + engagement_score(lead.metadata)

    # Company fit (0-20 points)
    score = score + company_fit_score(lead)

    # Behavioral signals (0-15 points)
    score = score + behavioral_score(lead.metadata)

    # Source quality (0-10 points)
    score = score + source_score(lead.source)

    min(score, 100)
  end

  defp intent_score(:demo), do: 30
  defp intent_score(:pricing), do: 25
  defp intent_score(:features), do: 20
  defp intent_score(:support), do: 10
  defp intent_score(:general), do: 5

  defp engagement_score(metadata) do
    score = 0
    if metadata[:interaction_count] >= 5, do: score = score + 10
    if metadata[:total_conversation_time] >= 300, do: score = score + 10
    if metadata[:page_visits] >= 3, do: score = score + 5
    score
  end

  defp company_fit_score(lead) do
    score = 0
    if has_company_email?(lead.email), do: score = score + 10
    if metadata_match?(:team_size, ["11-50", "51-200", "201+"]), do: score = score + 10
    score
  end

  defp behavioral_score(metadata) do
    score = 0
    if metadata[:requested_trial], do: score = score + 10
    if metadata[:downloaded_content], do: score = score + 5
    score
  end

  defp source_score(:chatbot), do: 10
  defp source_score(:form_then_chatbot), do: 8
  defp source_score(:direct_booking), do: 10
end
```

## Lead Deduplication

Leads with same email within 30-day window are considered duplicates:

```elixir
defmodule Forms.LeadDeduplication do
  # Check for existing lead before creating new one
  def find_or_create_lead(company_id, lead_params) do
    email = lead_params.email
    cutoff_date = DateTime.add(DateTime.utc_now(), -30, :day)

    case get_recent_lead(company_id, email, cutoff_date) do
      nil ->
        # No recent lead, create new
        ChatbotLeads.create_lead(lead_params)

      existing_lead ->
        # Found recent lead, update instead
        ChatbotLeads.update_lead(existing_lead.id, %{
          intent: merge_intent(existing_lead.intent, lead_params.intent),
          metadata: merge_metadata(existing_lead.metadata, lead_params.metadata),
          lead_score: recalculate_score(existing_lead, lead_params)
        })
        {:ok, existing_lead, :updated}
    end
  end

  defp merge_intent(old_intent, new_intent) do
    # If intent escalates (general → features → pricing → demo), update
    intent_priority = %{demo: 4, pricing: 3, features: 2, support: 1, general: 0}

    if intent_priority[new_intent] > intent_priority[old_intent] do
      new_intent
    else
      old_intent
    end
  end
end
```

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one

### Has Many
- **ChatbotConversations** (forms.chatbot_conversations) - one-to-many
  - All conversations with this lead

- **CalendarBookings** (forms.calendar_bookings) - one-to-many
  - Bookings requested by this lead

### Future Relationships
- **Opportunities** (crm.opportunities) - Lead conversion to deal
- **Contacts** (crm.contacts) - Link to CRM contact record

## Domain Events

### Published Events

- `forms.lead_captured`: Triggered when lead created
  - Payload: {lead_id, email, intent, source, lead_score, company_id}
  - Consumers: Email (welcome message), Analytics, Sales notifications

- `forms.lead_qualified`: Triggered when status → :qualified
  - Payload: {lead_id, lead_score, qualification_reason, qualified_at}
  - Consumers: Sales (assignment), CRM (future), Email

- `forms.lead_converted`: Triggered when status → :converted
  - Payload: {lead_id, converted_at, conversion_type}
  - Consumers: CRM (future), Analytics, Revenue tracking

- `forms.lead_updated`: Triggered when lead data changes
  - Payload: {lead_id, changes, updated_by}
  - Consumers: Analytics, Audit log

## Access Patterns

### Queries

```elixir
# List all leads for company
ChatbotLeads.list_leads(company_id)

# Get qualified leads only
ChatbotLeads.list_qualified_leads(company_id)

# Get leads by intent
ChatbotLeads.list_by_intent(company_id, :demo)

# Get high-scoring leads
ChatbotLeads.list_hot_leads(company_id, min_score: 75)

# Find lead by email
ChatbotLeads.get_by_email(company_id, "john@example.com")

# Get recent leads (last 7 days)
ChatbotLeads.list_recent_leads(company_id, days: 7)

# Search leads
ChatbotLeads.search_leads(company_id, query: "Acme")

# Get leads needing follow-up
ChatbotLeads.list_needs_follow_up(company_id)
```

### Common Operations

**Create Lead**:
```elixir
ChatbotLeads.create_lead(%{
  company_id: uuid,
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  company_name: "Acme Inc",
  intent: :pricing,
  source: :chatbot,
  qualification_status: :new,
  metadata: %{
    initial_question: "What's your pricing?",
    interaction_count: 3,
    referral_source: "Google Search"
  },
  utm_params: %{
    utm_source: "google",
    utm_campaign: "summer_2024"
  },
  captured_at: DateTime.utc_now()
})
# Calculates lead_score automatically
# Publishes: forms.lead_captured
# Returns: {:ok, %ChatbotLead{lead_score: 45}}
```

**Update Qualification Status**:
```elixir
ChatbotLeads.qualify_lead(lead_id, reason: "Budget confirmed, timeline Q1")
# Updates: qualification_status to :qualified
# Sets: qualified_at timestamp
# Publishes: forms.lead_qualified
# Returns: {:ok, %ChatbotLead{}}
```

**Mark as Contacted**:
```elixir
ChatbotLeads.mark_contacted(lead_id, by: user_id)
# Updates: qualification_status to :contacted
# Sets: contacted_at timestamp
# Returns: {:ok, %ChatbotLead{}}
```

**Convert Lead**:
```elixir
ChatbotLeads.convert_lead(lead_id, booking_id: booking_id)
# Updates: qualification_status to :converted
# Sets: converted_at timestamp
# Publishes: forms.lead_converted
# Returns: {:ok, %ChatbotLead{}}
```

## Performance Considerations

- **Email Lookup**: Index on `(company_id, email)` for deduplication checks
- **Recent Leads**: Index on `(company_id, captured_at)` for 30-day window queries
- **Qualified Leads**: Index on `(company_id, qualification_status)` for filtering
- **Lead Scoring**: Calculate on creation and major updates, cache result
- **Hot Leads**: Index on `(company_id, lead_score)` for high-score queries

## Testing Scenarios

### Unit Tests
- [ ] Create lead with minimum required fields
- [ ] Email uniqueness within 30-day window
- [ ] Lead score calculation (0-100 range)
- [ ] State transitions follow state machine
- [ ] Cannot skip qualification states
- [ ] Deduplication merges recent leads

### Integration Tests
- [ ] Creating lead publishes event
- [ ] Qualifying lead sends sales notification
- [ ] Converting lead creates CRM opportunity (future)
- [ ] Deduplication updates existing lead instead of creating duplicate

---

**Related Resources**:
- [ChatbotConversation](./chatbot_conversation.md) - Conversation history with lead
- [CalendarBooking](./calendar_booking.md) - Bookings from lead
- [FormSubmission](./form_submission.md) - Form submissions from same email

**Related Features**:
- [Lead Capture Feature](../features/lead_capture.feature.md)
- [Chatbot Interaction Feature](../features/chatbot_interaction.feature.md)
