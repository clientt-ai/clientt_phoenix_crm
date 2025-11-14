# Resource: ChatbotConfig

**Domain**: Integrations
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents the configuration and settings for the chatbot widget, including appearance, behavior, triggers, and integration with calendar bookings. One configuration per company, controls how the chatbot interacts with visitors across all pages.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company, unique | Company owning this config |
| enabled | boolean | Yes | - | Whether chatbot is active |
| chatbot_name | string | Yes | 1-100 chars | Display name for chatbot |
| greeting_message | text | Yes | 1-500 chars | Initial message shown to visitors |
| avatar_url | string | No | valid URL | Custom avatar image URL |
| trigger_pages | atom | Yes | enum: [:all, :forms_only, :landing_only, :custom] | Where chatbot appears |
| custom_page_patterns | list(string) | No | valid URL patterns | Specific pages if trigger_pages is :custom |
| demo_button_enabled | boolean | Yes | - | Show "Book a demo" quick action |
| pricing_button_enabled | boolean | Yes | - | Show "Pricing" quick action |
| features_button_enabled | boolean | Yes | - | Show "Features" quick action |
| confirmation_routing | atom | Yes | enum: [:email, :internal, :both, :slack] | Where to send booking confirmations |
| notification_email | string | No | valid email | Email for notifications |
| slack_webhook_url | string | No | valid URL | Slack webhook for notifications |
| theme | map | No | valid JSON | Appearance customization |
| auto_open_conditions | map | No | valid JSON | When to auto-open chatbot |
| working_hours | map | No | valid JSON | Show "offline" message outside hours |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Theme Map Structure

```elixir
%{
  # Colors
  primary_color: "#2278c0",  # Clientt blue
  accent_color: "#00d3bb",   # Teal
  bubble_background: "#2278c0",
  chat_background: "#ffffff",
  user_message_color: "#2278c0",
  bot_message_color: "#f8f8f8",

  # Positioning
  position: "bottom-right",  # bottom-right, bottom-left
  margin_bottom: 24,         # pixels
  margin_side: 24,           # pixels

  # Bubble
  bubble_size: 56,           # pixels
  bubble_icon: "default",    # default, custom_url

  # Window
  window_width: 380,         # pixels
  window_height: 600,        # pixels

  # Typography
  font_family: "Inter, sans-serif",
  font_size_base: 14,        # pixels

  # Dark mode support
  dark_mode_enabled: true
}
```

### Auto Open Conditions Map

```elixir
%{
  # Time-based triggers
  delay_seconds: 30,         # Auto-open after 30 seconds on page
  scroll_percentage: 50,     # Auto-open after scrolling 50% of page

  # Behavior triggers
  exit_intent: true,         # Show on mouse leaving viewport
  inactivity_seconds: 60,    # Show after 60 seconds of no interaction

  # Form-related triggers
  after_form_submission: true,  # Auto-open after form submit
  abandoned_form: true,         # Show if user leaves form incomplete

  # Visitor context
  first_visit_only: false,   # Only auto-open on first visit
  returning_visitor: true,   # Show to returning visitors

  # UTM-based triggers
  utm_triggers: [
    %{utm_source: "google", utm_campaign: "summer_2024", auto_open: true}
  ]
}
```

### Working Hours Map

```elixir
%{
  enabled: true,
  timezone: "America/New_York",

  # Schedule
  monday: %{enabled: true, start: "09:00", end: "17:00"},
  tuesday: %{enabled: true, start: "09:00", end: "17:00"},
  wednesday: %{enabled: true, start: "09:00", end: "17:00"},
  thursday: %{enabled: true, start: "09:00", end: "17:00"},
  friday: %{enabled: true, start: "09:00", end: "17:00"},
  saturday: %{enabled: false},
  sunday: %{enabled: false},

  # Offline behavior
  offline_message: "We're currently offline. Leave us a message!",
  allow_offline_messages: true
}
```

## Business Rules

### Invariants

- One ChatbotConfig per company (company_id unique)
- Cannot delete config (can only disable)
- demo_button_enabled requires active calendar connection
- notification_email required if confirmation_routing includes :email
- slack_webhook_url required if confirmation_routing is :slack
- custom_page_patterns required if trigger_pages is :custom

### Validations

- **chatbot_name**: Required, 1-100 characters
- **greeting_message**: Required, 1-500 characters
- **avatar_url**: Valid URL format if present
- **trigger_pages**: Must be valid enum value
- **confirmation_routing**: Must be valid enum value
- **notification_email**: Valid email format, required for email routing
- **slack_webhook_url**: Valid HTTPS URL, required for Slack routing
- **theme.primary_color**: Valid hex color code
- **working_hours.timezone**: Valid IANA timezone

### Calculated Fields

- **is_active**: `enabled == true`
- **has_calendar_connection**: Check if company has active calendar connection
- **is_within_working_hours**: Check current time against working_hours
- **should_auto_open**: Evaluate auto_open_conditions for current visitor

## Relationships

### Belongs To
- **Company** (authorization.companies) - one-to-one
  - Unique per company

### References
- **CalendarConnection** - Checks if demo booking enabled

## Domain Events

### Published Events

- `integrations.chatbot_enabled`: Triggered when enabled changes to true
  - Payload: {config_id, company_id, enabled_at}
  - Consumers: Analytics

- `integrations.chatbot_disabled`: Triggered when enabled changes to false
  - Payload: {config_id, company_id, disabled_at, reason}
  - Consumers: Analytics

- `integrations.chatbot_config_updated`: Triggered on configuration changes
  - Payload: {config_id, changes}
  - Consumers: Analytics, Cache invalidation

## Access Patterns

### Queries

```elixir
# Get config for company
ChatbotConfigs.get_by_company(company_id)

# Get active configs
ChatbotConfigs.list_enabled_configs()

# Get configs requiring calendar connection
ChatbotConfigs.list_with_demo_button_enabled()
```

### Common Operations

**Create Config** (automatically created with company):
```elixir
ChatbotConfigs.create_config(%{
  company_id: uuid,
  enabled: true,
  chatbot_name: "Clientt Assistant",
  greeting_message: "Hi there 👋 Ready to book your free demo?",
  trigger_pages: :all,
  demo_button_enabled: true,
  pricing_button_enabled: true,
  features_button_enabled: true,
  confirmation_routing: :both,
  notification_email: "sales@company.com",
  theme: %{
    primary_color: "#2278c0",
    position: "bottom-right"
  }
})
# Returns: {:ok, %ChatbotConfig{}}
```

**Update Config**:
```elixir
ChatbotConfigs.update_config(config_id, %{
  greeting_message: "Welcome! How can I help you today?",
  trigger_pages: :custom,
  custom_page_patterns: [
    "/pricing",
    "/features/*",
    "/contact"
  ]
})
# Publishes: integrations.chatbot_config_updated
# Returns: {:ok, %ChatbotConfig{}}
```

**Enable/Disable**:
```elixir
ChatbotConfigs.enable(config_id)
# Sets enabled: true
# Publishes: integrations.chatbot_enabled

ChatbotConfigs.disable(config_id, reason: "Under maintenance")
# Sets enabled: false
# Publishes: integrations.chatbot_disabled
```

**Check Calendar Requirement**:
```elixir
ChatbotConfigs.validate_demo_button(config_id)
# Returns: {:ok, config} | {:error, "Calendar not connected"}
# Ensures demo_button_enabled requires active calendar connection
```

## Frontend Integration

### JavaScript Embed Code

```html
<!-- Chatbot Widget Embed -->
<script>
  window.clienttChatbot = {
    companyId: "{{COMPANY_ID}}",
    configId: "{{CONFIG_ID}}",
    sessionId: "{{GENERATED_SESSION_ID}}"
  };
</script>
<script src="https://cdn.clientt.com/chatbot.js" async></script>
```

### LiveView Integration

```elixir
defmodule ClienttCrmAppWeb.ChatbotLive do
  use ClienttCrmAppWeb, :live_view

  def mount(_params, %{"company_id" => company_id}, socket) do
    config = ChatbotConfigs.get_by_company(company_id)

    # Check if should auto-open
    should_auto_open = evaluate_auto_open(config, socket)

    {:ok, assign(socket,
      config: config,
      auto_open: should_auto_open,
      is_within_hours: is_within_working_hours?(config)
    )}
  end

  def handle_event("toggle_chatbot", _, socket) do
    # Toggle chatbot open/closed state
    {:noreply, update(socket, :chatbot_open, &(!&1))}
  end
end
```

## Working Hours Evaluation

```elixir
defmodule Integrations.WorkingHours do
  def is_within_hours?(config) do
    return true unless config.working_hours.enabled

    now = DateTime.now!(config.working_hours.timezone)
    day_name = day_atom(now)
    day_config = config.working_hours[day_name]

    return false unless day_config.enabled

    current_time = Time.truncate(now, :second)
    start_time = Time.from_iso8601!(day_config.start <> ":00")
    end_time = Time.from_iso8601!(day_config.end <> ":00")

    Time.compare(current_time, start_time) != :lt and
      Time.compare(current_time, end_time) == :lt
  end

  defp day_atom(datetime) do
    case Date.day_of_week(datetime) do
      1 -> :monday
      2 -> :tuesday
      3 -> :wednesday
      4 -> :thursday
      5 -> :friday
      6 -> :saturday
      7 -> :sunday
    end
  end
end
```

## Performance Considerations

- **Config Caching**: Cache config per company with 5-minute TTL
- **Frontend Embedding**: CDN for chatbot JavaScript
- **Auto-Open Evaluation**: Client-side JavaScript for conditions
- **Working Hours**: Calculated server-side, cached

## Testing Scenarios

### Unit Tests
- [ ] Create config with default values
- [ ] One config per company (uniqueness)
- [ ] demo_button requires calendar connection
- [ ] notification_email required for email routing
- [ ] Custom page patterns validated
- [ ] Working hours evaluated correctly

### Integration Tests
- [ ] Enabling chatbot publishes event
- [ ] Config updates invalidate cache
- [ ] Demo button validation checks calendar
- [ ] Auto-open conditions evaluated correctly

---

**Related Resources**:
- [CalendarConnection](./calendar_connection.md) - Required for demo booking
- [ChatbotLead](../../forms/resources/chatbot_lead.md) - Leads captured via chatbot

**Related Features**:
- [Chatbot Configuration Feature](../features/chatbot_configuration.feature.md)
