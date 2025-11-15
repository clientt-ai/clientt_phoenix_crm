# Forms Builder - Chatbot AI Strategy

**Type**: Technical & Business Decision
**Priority**: 🟡 Medium
**Status**: Needs Investigation
**Created**: 2025-11-14

## Overview

This dev_prompt focuses on deciding the chatbot implementation strategy: scripted responses, rule-based AI, external AI API, or hybrid approach. This decision impacts implementation complexity, cost, UX, and maintenance.

## Parent Task

Source: `dev_task_prompts/20251114-forms-builder-module/ISSUES.md`
- Issue #4: Real AI vs Scripted Chatbot Responses

## Problem Statement

The Figma source shows a chatbot widget with demo booking and lead capture functionality. The current specification includes ChatbotConversation and ChatbotLead resources, but doesn't define how chatbot responses are generated.

**Key Questions**:
- Should chatbot use pre-written scripts or AI-generated responses?
- What's the budget for AI API calls?
- Do we need natural language understanding?
- Should chatbot be multilingual?

---

## Option A: Scripted Responses (MVP Recommendation)

**Implementation**: Pre-written response flows with button-based navigation

### How It Works

```elixir
# Conversation flow definition
defmodule Forms.ChatbotFlows do
  def get_greeting_flow do
    %{
      step: :greeting,
      message: "Hi there 👋 I'm here to help! What brings you here today?",
      options: [
        %{label: "Book a demo", next_step: :demo_booking},
        %{label: "View pricing", next_step: :pricing_info},
        %{label: "Learn about features", next_step: :features_info},
        %{label: "Talk to sales", next_step: :sales_contact}
      ]
    }
  end

  def get_demo_booking_flow do
    %{
      step: :demo_booking,
      message: "Great! I'd love to schedule a demo for you. Can I get your name?",
      expected_input: :text,
      validation: &validate_name/1,
      next_step: :demo_email
    }
  end

  def get_demo_email_flow do
    %{
      step: :demo_email,
      message: "Thanks! What's your email address?",
      expected_input: :email,
      validation: &validate_email/1,
      next_step: :demo_calendar
    }
  end
end
```

### User Experience

**Flow Example - Demo Booking**:
1. User: *Clicks chatbot bubble*
2. Bot: "Hi there 👋 What brings you here today?"
   - [Book a demo] [View pricing] [Features] [Talk to sales]
3. User: *Clicks [Book a demo]*
4. Bot: "Great! I'd love to schedule a demo. Can I get your name?"
5. User: *Types "John Smith"*
6. Bot: "Thanks John! What's your email address?"
7. User: *Types "john@example.com"*
8. Bot: "Perfect! Let me check available times..."
   - [Shows calendar picker]

### Pros

✅ **Faster to implement** (~1 week)
✅ **No external API costs**
✅ **Predictable behavior** (QA testing easier)
✅ **Low latency** (instant responses)
✅ **Easy to maintain** (update scripts in code/database)
✅ **Works offline** (no API dependency)
✅ **Multilingual support** (just translate scripts)

### Cons

❌ **Limited flexibility** (can't handle off-script questions)
❌ **Feels robotic** (users know it's scripted)
❌ **Manual flow creation** (requires writing all paths)
❌ **Can't learn from interactions**

### Implementation Details

**Database Schema**:
```elixir
# chatbot_conversations table
create table(:chatbot_conversations) do
  add :company_id, references(:companies)
  add :session_id, :uuid
  add :current_step, :string  # e.g., "demo_booking", "pricing_info"
  add :messages, {:array, :map}
  add :context, :map  # Store user inputs
  add :state, :string  # active, completed, abandoned
end

# chatbot_flow_definitions table (optional)
create table(:chatbot_flow_definitions) do
  add :company_id, references(:companies)
  add :flow_name, :string
  add :flow_config, :map  # JSON flow definition
  add :enabled, :boolean
end
```

**LiveView Implementation**:
```elixir
defmodule ClienttCrmAppWeb.ChatbotLive do
  def handle_event("send_message", %{"message" => message}, socket) do
    conversation = socket.assigns.conversation
    current_flow = ChatbotFlows.get_flow(conversation.current_step)

    # Validate input
    case validate_message(current_flow, message) do
      {:ok, validated} ->
        # Store message
        conversation = update_conversation(conversation, message)

        # Get next flow step
        next_flow = ChatbotFlows.get_next_step(current_flow, validated)

        # Send bot response
        bot_message = next_flow.message
        send_message(socket, bot_message, next_flow.options)

      {:error, reason} ->
        # Show validation error
        send_error(socket, current_flow.error_message)
    end
  end
end
```

### Cost Analysis

**One-Time Costs**:
- Development: ~40 hours ($4,000)
- Flow design: ~10 hours ($1,000)

**Ongoing Costs**:
- Maintenance: ~5 hours/month ($500/mo)
- Server costs: Included in LiveView hosting

**Total Year 1**: ~$11,000

---

## Option B: Rule-Based AI (Pattern Matching)

**Implementation**: Pattern matching with intent detection (no external AI API)

### How It Works

```elixir
defmodule Forms.ChatbotIntents do
  @demo_patterns [
    ~r/\b(demo|demonstration|show me|try|test)\b/i,
    ~r/\b(see|view|check out) (the product|your platform)\b/i,
    ~r/\bbook (a|an)? ?(demo|call|meeting)\b/i
  ]

  @pricing_patterns [
    ~r/\b(price|pricing|cost|how much|fee)\b/i,
    ~r/\b(plans|tiers|packages)\b/i
  ]

  def detect_intent(message) do
    cond do
      matches_patterns?(message, @demo_patterns) -> :demo_booking
      matches_patterns?(message, @pricing_patterns) -> :pricing_info
      matches_patterns?(message, @features_patterns) -> :features_info
      true -> :unknown
    end
  end

  defp matches_patterns?(message, patterns) do
    Enum.any?(patterns, &Regex.match?(&1, message))
  end
end
```

### User Experience

**Flow Example - Natural Input**:
1. User: "I'd like to see a demo"
2. Bot: "Great! I'd love to schedule a demo. Can I get your name?"
   - (Intent detected: :demo_booking)
3. User: "Sure, it's John Smith"
4. Bot: "Thanks John! What's your email?"
   - (Extracted: name = "John Smith")

### Pros

✅ **More flexible than scripts** (handles variations)
✅ **No external API costs**
✅ **Still fast** (local pattern matching)
✅ **Can extract entities** (name, email, company from text)
✅ **Handles typos** (fuzzy matching)

### Cons

❌ **More complex implementation** (~2-3 weeks)
❌ **Requires building rule engine**
❌ **Hard to maintain** (regex hell)
❌ **Limited natural language understanding**
❌ **Can't handle truly open-ended questions**

### Implementation Details

**Intent Detection**:
```elixir
defmodule Forms.ChatbotNLU do
  # Named entity recognition
  def extract_entities(message) do
    %{
      email: extract_email(message),
      name: extract_name(message),
      company: extract_company(message),
      phone: extract_phone(message)
    }
  end

  defp extract_email(message) do
    Regex.run(~r/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, message)
    |> case do
      [email] -> email
      nil -> nil
    end
  end

  defp extract_name(message) do
    # Use heuristics: "I'm X", "My name is X", "This is X"
    patterns = [
      ~r/\b(?:I'm|I am|Name is|This is) ([A-Z][a-z]+ [A-Z][a-z]+)\b/,
      ~r/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/  # Fallback: any capitalized words
    ]

    Enum.find_value(patterns, fn pattern ->
      case Regex.run(pattern, message) do
        [_, name] -> name
        _ -> nil
      end
    end)
  end
end
```

### Cost Analysis

**One-Time Costs**:
- Development: ~80 hours ($8,000)
- Rule tuning: ~20 hours ($2,000)
- Testing: ~10 hours ($1,000)

**Ongoing Costs**:
- Maintenance: ~10 hours/month ($1,000/mo)
- Rule updates: ~5 hours/month ($500/mo)

**Total Year 1**: ~$29,000

---

## Option C: External AI API (OpenAI, Claude, etc.)

**Implementation**: Use external AI service for natural conversations

### How It Works

```elixir
defmodule Forms.ChatbotAI do
  @system_prompt """
  You are a helpful sales assistant for Clientt CRM. Your goal is to:
  1. Understand what the visitor needs (demo, pricing, features)
  2. Collect their contact information (name, email, company)
  3. Book demos or pass qualified leads to sales

  Be friendly, concise, and professional. Always stay on-topic about Clientt CRM.
  """

  def generate_response(conversation_history, user_message) do
    messages = build_messages(conversation_history, user_message)

    # Call OpenAI API
    OpenAI.chat_completion(
      model: "gpt-4o-mini",
      messages: [
        %{role: "system", content: @system_prompt},
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150
    )
    |> parse_response()
  end

  defp parse_response({:ok, response}) do
    # Extract response and any structured data (via function calling)
    %{
      message: response.choices |> List.first() |> get_in(["message", "content"]),
      intent: extract_intent(response),
      entities: extract_entities(response)
    }
  end
end
```

### User Experience

**Flow Example - Natural Conversation**:
1. User: "Hey, I'm interested in your platform"
2. Bot: "Great to hear! I'd be happy to tell you more about Clientt CRM. What would you like to know? We could schedule a quick demo, discuss pricing, or I can answer specific questions."
3. User: "What makes you different from Salesforce?"
4. Bot: "Clientt CRM is designed specifically for small to mid-size B2B companies, making it much simpler and more affordable than Salesforce. We focus on forms, lead capture, and integrated calendar booking—without the complexity. Would you like to see it in action with a demo?"
5. User: "Sure, let's do that"
6. Bot: "Perfect! To schedule your demo, could you share your name and email?"

### Pros

✅ **Natural conversations** (feels human)
✅ **Handles anything** (open-ended questions)
✅ **Learns from context** (references earlier messages)
✅ **Can be creative** (helpful examples, analogies)
✅ **Minimal prompt engineering** (model is pre-trained)
✅ **Multilingual** (supports 50+ languages)

### Cons

❌ **API costs** ($$$)
❌ **Latency** (500ms-2s per response)
❌ **Requires moderation** (can go off-script)
❌ **Need prompt tuning** (to prevent hallucinations)
❌ **External dependency** (API downtime affects chatbot)
❌ **Data privacy** (sending user messages to third party)

### Implementation Details

**API Integration**:
```elixir
# config/config.exs
config :clientt_crm_app, :openai,
  api_key: System.get_env("OPENAI_API_KEY"),
  model: "gpt-4o-mini",  # or "claude-3-haiku" for Anthropic
  max_tokens: 150,
  temperature: 0.7

# lib/clientt_crm_app/chatbot/ai_provider.ex
defmodule Forms.ChatbotAI.OpenAIProvider do
  def chat_completion(messages, opts \\\\ []) do
    HTTPoison.post(
      "https://api.openai.com/v1/chat/completions",
      Jason.encode!(%{
        model: opts[:model] || "gpt-4o-mini",
        messages: messages,
        temperature: opts[:temperature] || 0.7,
        max_tokens: opts[:max_tokens] || 150
      }),
      [
        {"Authorization", "Bearer #{api_key()}"},
        {"Content-Type", "application/json"}
      ]
    )
    |> handle_response()
  end
end
```

**Content Moderation**:
```elixir
defmodule Forms.ChatbotAI.Moderator do
  @blocked_topics ["politics", "religion", "competitors"]

  def moderate_message(message) do
    cond do
      contains_pii?(message) -> {:error, "Please don't share sensitive info"}
      is_off_topic?(message) -> {:warn, "Let's keep this about Clientt CRM"}
      true -> {:ok, message}
    end
  end

  defp is_off_topic?(message) do
    # Use AI moderation API or keyword matching
    OpenAI.moderation(message)
    |> check_categories(@blocked_topics)
  end
end
```

### Cost Analysis

**Setup Costs**:
- Development: ~60 hours ($6,000)
- Prompt engineering: ~20 hours ($2,000)
- Moderation setup: ~10 hours ($1,000)

**API Costs** (per month):
- Model: gpt-4o-mini
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- Estimated usage:
  - 1,000 conversations/month
  - Avg 10 messages per conversation
  - Avg 100 tokens per message
  - **Monthly cost: ~$75-150**

**Ongoing Costs**:
- Maintenance: ~5 hours/month ($500/mo)
- Prompt tuning: ~2 hours/month ($200/mo)
- API costs: $75-150/month

**Total Year 1**: ~$18,200

---

## Option D: Hybrid Approach

**Implementation**: Scripted flows for common paths + AI for open questions

### How It Works

```elixir
defmodule Forms.ChatbotHybrid do
  def generate_response(conversation, user_message) do
    case detect_scenario(conversation, user_message) do
      :demo_booking ->
        # Use scripted flow
        ScriptedFlows.demo_booking(conversation, user_message)

      :pricing_inquiry ->
        # Use scripted flow
        ScriptedFlows.pricing_info(conversation, user_message)

      :open_question ->
        # Use AI
        ChatbotAI.generate_response(conversation.history, user_message)

      :sales_handoff ->
        # Structured flow
        ScriptedFlows.sales_contact(conversation, user_message)
    end
  end

  defp detect_scenario(conversation, message) do
    cond do
      in_demo_flow?(conversation) -> :demo_booking
      matches_pricing_pattern?(message) -> :pricing_inquiry
      matches_sales_pattern?(message) -> :sales_handoff
      true -> :open_question
    end
  end
end
```

### User Experience

**Flow Example - Hybrid**:
1. User: "What's the difference between your Pro and Enterprise plans?"
2. Bot (AI): "Great question! Our Pro plan is designed for teams up to 10 users and includes core features like form building and calendar booking. Enterprise adds advanced features like custom integrations, dedicated support, and SSO. Would you like to see the full pricing breakdown?"
3. User: "Yes, show me pricing"
4. Bot (Scripted): "Here's our pricing..." [Shows pricing table]
5. User: "Can I book a demo?"
6. Bot (Scripted): "Absolutely! Let me get your information..." [Starts demo flow]

### Pros

✅ **Best of both worlds** (natural + reliable)
✅ **Cost-effective** (AI only when needed)
✅ **Faster responses** (scripted paths are instant)
✅ **Handles edge cases** (AI for unexpected questions)

### Cons

❌ **Most complex** (two systems to maintain)
❌ **Need routing logic** (when to use which?)
❌ **Harder to test** (multiple code paths)

### Implementation Details

**Routing Logic**:
```elixir
defmodule Forms.ChatbotRouter do
  @scripted_intents [:demo_booking, :pricing, :features, :sales_contact]

  def route_message(conversation, message) do
    intent = IntentDetector.detect(message)

    case intent do
      intent when intent in @scripted_intents ->
        {:scripted, ScriptedFlows.get_flow(intent)}

      :general_question ->
        # Check if we can answer from knowledge base
        case KnowledgeBase.search(message) do
          {:ok, answer} -> {:scripted, answer}
          {:error, :not_found} -> {:ai, :open_question}
        end

      _ ->
        {:ai, :fallback}
    end
  end
end
```

### Cost Analysis

**One-Time Costs**:
- Development: ~100 hours ($10,000)
- Flow design: ~20 hours ($2,000)
- AI setup: ~20 hours ($2,000)

**Ongoing Costs**:
- Maintenance: ~10 hours/month ($1,000/mo)
- API costs: $30-60/month (less AI usage)

**Total Year 1**: ~$27,720

---

## Comparison Matrix

| Factor | Scripted | Rule-Based | AI API | Hybrid |
|--------|----------|------------|--------|--------|
| **Development Time** | 1 week | 2-3 weeks | 1.5 weeks | 2.5 weeks |
| **Implementation Cost** | $5,000 | $11,000 | $9,000 | $14,000 |
| **Monthly Costs** | $500 | $1,500 | $850 | $1,060 |
| **Year 1 Total Cost** | $11,000 | $29,000 | $18,200 | $27,720 |
| **Response Time** | <50ms | <100ms | 500-2000ms | 50-2000ms |
| **Natural Conversations** | ❌ | ⚠️ | ✅ | ✅ |
| **Handles Off-Script** | ❌ | ⚠️ | ✅ | ✅ |
| **Multilingual** | ⚠️ Manual | ⚠️ Manual | ✅ Auto | ✅ Auto |
| **Maintenance Burden** | Low | High | Medium | High |
| **Reliability** | ✅ | ✅ | ⚠️ API | ✅ |
| **Data Privacy** | ✅ | ✅ | ⚠️ Third-party | ⚠️ Partial |

---

## Recommendations

### For MVP (Phase 1)
**Recommendation**: **Option A - Scripted Responses**

**Rationale**:
- Fastest to market (1 week vs 2-3 weeks)
- Lowest cost ($11K/year vs $18K-$29K)
- Most reliable and predictable
- Easier to QA test
- No external dependencies
- Sufficient for main use cases (demo booking, pricing, features)

**Implementation Plan**:
1. Define 5 core flows:
   - Demo booking
   - Pricing inquiry
   - Features info
   - Sales contact
   - General support
2. Build flow engine in LiveView
3. Add analytics tracking
4. Launch MVP

### For Phase 2
**Recommendation**: **Option D - Hybrid Approach**

**Rationale**:
- MVP proves chatbot value
- Add AI for competitive advantage
- Handle edge cases gracefully
- Balance cost and capability

**Upgrade Path**:
1. Keep scripted flows for demo/pricing
2. Add AI for open-ended questions
3. Monitor AI usage and costs
4. Tune routing logic based on analytics

### For Phase 3 (Future)
**Potential**: **Full AI with Fine-Tuning**

- Train custom model on company data
- Personalized responses
- Lower API costs (self-hosted model)

---

## Decision Framework

Use this framework to make the final decision:

### Budget Considerations
- If budget < $15K/year → **Scripted**
- If budget $15K-$25K/year → **AI API**
- If budget > $25K/year → **Hybrid**

### Use Case Complexity
- If 90%+ users follow same paths → **Scripted**
- If users ask varied questions → **AI API** or **Hybrid**

### Competitive Pressure
- If competitors have basic chatbots → **Scripted**
- If competitors have AI chatbots → **AI API** or **Hybrid**

### Technical Capabilities
- If team has AI experience → **AI API** or **Hybrid**
- If team prefers simple solutions → **Scripted**

---

## Next Steps

1. **Review with stakeholders**
   - [ ] Product Owner
   - [ ] Engineering Lead
   - [ ] Finance (for budget approval)

2. **Make decision**
   - [ ] Select option
   - [ ] Document rationale
   - [ ] Set budget

3. **If AI selected, research providers**
   - [ ] OpenAI (GPT-4o-mini): $0.15-0.60 per 1M tokens
   - [ ] Anthropic (Claude 3 Haiku): $0.25-1.25 per 1M tokens
   - [ ] Open-source (Llama 3, Mistral): Self-hosted costs

4. **Prototype selected approach**
   - [ ] Build proof-of-concept
   - [ ] Test with sample conversations
   - [ ] Measure performance and costs

5. **Update specifications**
   - [ ] Update ChatbotConversation resource spec
   - [ ] Update ChatbotConfig resource spec
   - [ ] Create implementation guide

---

## Decision Template

- [ ] **Decision**: Option ___ selected
- [ ] **Decided By**: ___________
- [ ] **Date**: ___________
- [ ] **Budget Approved**: $_________/year
- [ ] **Rationale**: ___________
- [ ] **Timeline**: Implement in Phase ___
- [ ] **AI Provider** (if applicable): ___________

---

**Status**: Awaiting Decision
**Decision Deadline**: TBD
**Prototype Due**: TBD
