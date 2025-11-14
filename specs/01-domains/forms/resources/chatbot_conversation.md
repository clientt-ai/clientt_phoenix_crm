# Resource: ChatbotConversation

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents a complete dialogue session between a lead and the chatbot, including all messages, context, and interaction metadata. Enables conversation history tracking, context preservation across interactions, and analysis of conversation patterns for optimization.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this conversation |
| chatbot_lead_id | uuid | Yes | valid lead | Associated lead |
| session_id | string | Yes | unique | Browser session identifier |
| messages | array(map) | Yes | valid JSON array | Ordered list of messages |
| context | map | No | valid JSON | Conversation context and state |
| status | atom | Yes | enum: [:active, :ended, :abandoned] | Conversation state |
| started_at | utc_datetime | Yes | - | When conversation began |
| ended_at | utc_datetime | No | - | When conversation concluded |
| last_message_at | utc_datetime | Yes | - | Timestamp of most recent message |
| message_count | integer | Yes | >= 0 | Total messages in conversation |
| duration | integer | No | >= 0 | Total conversation time (seconds) |
| ip_address | string | No | valid IPv4/IPv6 | Lead's IP address |
| user_agent | string | No | max 500 chars | Lead's browser |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Messages Array Structure

Ordered array of message objects:

```elixir
[
  %{
    id: "msg_001",
    role: "bot",  # "bot" or "user"
    content: "Hi there 👋 Ready to book your free demo?",
    timestamp: ~U[2025-11-14 14:30:00Z],
    message_type: "greeting",  # greeting, question, answer, action, etc.
    metadata: %{
      intent_detected: nil,
      confidence: nil
    }
  },
  %{
    id: "msg_002",
    role: "user",
    content: "I'd like to see your pricing first",
    timestamp: ~U[2025-11-14 14:30:15Z],
    message_type: "question",
    metadata: %{
      intent_detected: "pricing",
      confidence: 0.95
    }
  },
  %{
    id: "msg_003",
    role: "bot",
    content: "✨ Great! Before we show pricing, just a few quick questions...",
    timestamp: ~U[2025-11-14 14:30:17Z],
    message_type: "pre_connect_form_trigger",
    metadata: %{
      triggered_action: "show_pre_connect_form",
      form_intent: "pricing"
    }
  },
  %{
    id: "msg_004",
    role: "system",
    content: "Pre-connect form completed",
    timestamp: ~U[2025-11-14 14:31:00Z],
    message_type: "system_event",
    metadata: %{
      form_data: %{
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        company: "Acme Inc"
      }
    }
  },
  %{
    id: "msg_005",
    role: "bot",
    content: "Thanks John! Here's our pricing...",
    timestamp: ~U[2025-11-14 14:31:02Z],
    message_type: "personalized_response",
    metadata: %{
      personalization: %{
        first_name: "John",
        response_type: "pricing"
      },
      pricing_tiers_shown: ["Starter", "Pro", "Enterprise"]
    }
  }
]
```

### Context Map Structure

Preserves conversation state and lead information:

```elixir
%{
  # Lead information (collected via pre-connect form)
  user_info: %{
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    company: "Acme Inc"
  },

  # Detected intents throughout conversation
  intents: ["pricing", "features", "demo"],
  primary_intent: "pricing",

  # Conversation flow tracking
  current_step: "pricing_shown",
  completed_steps: ["greeting", "pre_connect_form", "pricing_shown"],
  next_suggested_action: "book_demo",

  # Quick actions clicked
  quick_actions_used: ["💰 Pricing", "📅 Book a demo"],

  # Forms/modals shown
  modals_shown: ["pre_connect_form", "email_capture", "calendar_booking"],

  # Booking attempt tracking
  booking_attempted: true,
  booking_completed: false,
  booking_id: nil,

  # Conversation quality metrics
  avg_response_time: 45,  # seconds
  user_satisfaction: nil,  # Will be set if feedback requested

  # Session information
  page_url: "https://example.com/pricing",
  referrer: "https://google.com",
  device_type: "desktop"
}
```

## Business Rules

### Invariants

- Messages array must maintain chronological order
- Each message must have unique ID within conversation
- message_count must match length of messages array
- Cannot add messages to ended conversation
- session_id must be unique and persist across page refreshes
- started_at must be before ended_at
- last_message_at must match timestamp of last message

### Validations

- **session_id**: Required, unique, 1-100 characters
- **messages**: Required, non-empty array for active conversations
- **status**: Must be valid enum value
- **message_count**: Must be >= 0 and match messages.length
- **duration**: Non-negative integer if present
- **started_at**: Cannot be in future
- **ended_at**: Must be after started_at if present

### Calculated Fields

- **is_active**: `status == :active`
- **is_short_conversation**: `message_count < 3`
- **avg_response_time_seconds**: Calculate from message timestamps
- **has_lead_info**: `context.user_info != nil`

## State Transitions

```
active → ended
  ↓
  → abandoned
```

**Valid Transitions**:

- `active → ended`: When conversation concludes naturally
  - User books demo
  - User completes desired action
  - User explicitly ends chat
  - Sets `ended_at` timestamp
  - Calculates `duration`

- `active → abandoned`: When user leaves without completing action
  - No message for 30 minutes
  - User closes chat window
  - Session expires
  - Sets `ended_at` timestamp

- `ended → active`: Cannot reopen ended conversations (must create new)
- `abandoned → active`: Cannot reactivate (must create new)

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one
- **ChatbotLead** (forms.chatbot_leads) - many-to-one

## Domain Events

### Published Events

- `forms.conversation_started`: Triggered on create
  - Payload: {conversation_id, lead_id, session_id, started_at}
  - Consumers: Analytics, Real-time dashboard

- `forms.message_received`: Triggered on each new message
  - Payload: {conversation_id, message, role, timestamp}
  - Consumers: Real-time UI updates, Analytics

- `forms.conversation_ended`: Triggered when status → :ended
  - Payload: {conversation_id, lead_id, duration, message_count, outcome}
  - Consumers: Analytics, Lead scoring

- `forms.conversation_abandoned`: Triggered when status → :abandoned
  - Payload: {conversation_id, last_message_at, abandonment_reason}
  - Consumers: Follow-up workflows, Analytics

## Access Patterns

### Queries

```elixir
# Get conversation by session ID
ChatbotConversations.get_by_session(session_id)

# List all conversations for a lead
ChatbotConversations.list_for_lead(lead_id)

# Get active conversations
ChatbotConversations.list_active_conversations(company_id)

# Get abandoned conversations (for follow-up)
ChatbotConversations.list_abandoned_conversations(company_id)

# Get conversations in date range
ChatbotConversations.list_for_range(company_id, start_date, end_date)

# Search messages
ChatbotConversations.search_messages(company_id, query: "pricing")
```

### Common Operations

**Start Conversation**:
```elixir
ChatbotConversations.start_conversation(%{
  company_id: uuid,
  chatbot_lead_id: lead_id,
  session_id: "sess_abc123",
  messages: [
    %{
      id: "msg_001",
      role: "bot",
      content: "Hi there 👋 Ready to book your free demo?",
      timestamp: DateTime.utc_now(),
      message_type: "greeting"
    }
  ],
  context: %{
    page_url: "https://example.com/pricing",
    device_type: "desktop"
  },
  status: :active,
  started_at: DateTime.utc_now(),
  last_message_at: DateTime.utc_now(),
  message_count: 1
})
# Publishes: forms.conversation_started
# Returns: {:ok, %ChatbotConversation{}}
```

**Add Message**:
```elixir
ChatbotConversations.add_message(conversation_id, %{
  role: "user",
  content: "I'd like to see pricing",
  message_type: "question",
  metadata: %{
    intent_detected: "pricing",
    confidence: 0.95
  }
})
# Appends to messages array
# Updates: last_message_at, message_count
# Publishes: forms.message_received
# Returns: {:ok, %ChatbotConversation{}}
```

**Update Context**:
```elixir
ChatbotConversations.update_context(conversation_id, %{
  user_info: %{
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    company: "Acme Inc"
  },
  primary_intent: "pricing"
})
# Merges into existing context
# Returns: {:ok, %ChatbotConversation{}}
```

**End Conversation**:
```elixir
ChatbotConversations.end_conversation(conversation_id, outcome: "booking_completed")
# Updates: status to :ended
# Sets: ended_at timestamp
# Calculates: duration
# Publishes: forms.conversation_ended
# Returns: {:ok, %ChatbotConversation{}}
```

**Mark as Abandoned**:
```elixir
ChatbotConversations.mark_abandoned(conversation_id, reason: "timeout")
# Updates: status to :abandoned
# Sets: ended_at timestamp
# Publishes: forms.conversation_abandoned
# Returns: {:ok, %ChatbotConversation{}}
```

## Real-Time Updates

ChatbotConversations use Phoenix LiveView for real-time UI:

**LiveView Integration**:
```elixir
defmodule ClienttCrmAppWeb.ChatbotLive do
  use ClienttCrmAppWeb, :live_view

  def mount(_params, %{"session_id" => session_id}, socket) do
    # Get or create conversation
    conversation = ChatbotConversations.get_or_create_by_session(session_id)

    # Subscribe to new messages
    Phoenix.PubSub.subscribe(ClienttCrmApp.PubSub, "conversation:#{conversation.id}")

    {:ok, assign(socket, conversation: conversation, messages: conversation.messages)}
  end

  def handle_event("send_message", %{"content" => content}, socket) do
    # Add user message
    {:ok, conversation} = ChatbotConversations.add_message(
      socket.assigns.conversation.id,
      %{role: "user", content: content}
    )

    # Generate bot response (async)
    Task.start(fn -> generate_bot_response(conversation.id, content) end)

    {:noreply, assign(socket, messages: conversation.messages)}
  end

  def handle_info({:new_message, message}, socket) do
    # Real-time message received via PubSub
    messages = socket.assigns.messages ++ [message]
    {:noreply, assign(socket, messages: messages)}
  end
end
```

## Conversation Analytics

### Key Metrics

- **Conversation duration**: Average time from start to end
- **Messages per conversation**: Average message count
- **Response time**: Bot and user average response times
- **Abandonment rate**: Abandoned / Total conversations
- **Conversion rate**: Ended with booking / Total conversations
- **Intent distribution**: Most common intents detected
- **Pre-connect completion rate**: Forms completed / Forms shown

### Aggregate Queries

```elixir
# Average conversation duration
ChatbotConversations.get_avg_duration(company_id)
# Returns: 342 (seconds)

# Conversations by outcome
ChatbotConversations.get_outcome_distribution(company_id)
# Returns: %{
#   booking_completed: 45,
#   information_only: 120,
#   abandoned: 35
# }

# Most common intents
ChatbotConversations.get_top_intents(company_id)
# Returns: [
#   %{intent: "pricing", count: 200},
#   %{intent: "features", count: 150},
#   %{intent: "demo", count: 100}
# ]
```

## Data Retention

- **Active conversations**: Retained indefinitely
- **Ended conversations**: Retained 90 days in hot storage, then archived
- **Abandoned conversations**: Retained 30 days, then deleted
- **Message history**: Retained with conversation

**Archival Job** (background):
```elixir
defmodule Forms.ConversationArchivalJob do
  def archive_old_conversations do
    cutoff_date = DateTime.add(DateTime.utc_now(), -90, :day)

    ChatbotConversations.list_ended_before(cutoff_date)
    |> Enum.each(&archive_to_cold_storage/1)
  end
end
```

## Performance Considerations

- **Message Appending**: Use PostgreSQL array append operations
- **Real-Time Updates**: PubSub for broadcasting new messages
- **Session Lookup**: Index on `(company_id, session_id)` for fast retrieval
- **Active Conversations**: Index on `(company_id, status)` for filtering
- **Message Search**: Consider full-text search index on messages content

## Testing Scenarios

### Unit Tests
- [ ] Start conversation with initial message
- [ ] Add message to active conversation
- [ ] Cannot add message to ended conversation
- [ ] Message count matches messages array length
- [ ] Context updates merge correctly
- [ ] State transitions follow state machine

### Integration Tests
- [ ] Starting conversation publishes event
- [ ] Adding message broadcasts via PubSub
- [ ] Ending conversation calculates duration
- [ ] Abandoned conversations detected by timeout job
- [ ] Message history preserved correctly

---

**Related Resources**:
- [ChatbotLead](./chatbot_lead.md) - Lead captured from conversation
- [CalendarBooking](./calendar_booking.md) - Bookings requested in conversation

**Related Features**:
- [Chatbot Interaction Feature](../features/chatbot_interaction.feature.md)
- [Lead Capture Feature](../features/lead_capture.feature.md)
