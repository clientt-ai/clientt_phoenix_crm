# Track 5: Chatbot Widget System

## Overview

Build an AI-powered sales chatbot widget that appears on form pages to engage leads, answer questions, and book demos.

**Source:** `figma_src/205 Forms Dashboard/src/components/ChatbotWidget.tsx`
**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models), Track 4 (Calendar for demo booking)
**Estimated Time:** 1-2 weeks

## Features to Implement

### 1. Chatbot Widget UI
Bottom-right expandable chat interface

**States:**
- **Collapsed:** Animated bubble with pulse effect (56x56px)
- **Expanded:** Chat window (380x600px on desktop, full-width on mobile)

**Components:**
- Chat bubble button
- Chat window with header
- Message list (scrollable)
- Quick action buttons
- Message input field
- Send button
- Pre-connect form modal

### 2. Message Threading
Persistent conversation history

**Features:**
- User messages (right-aligned, primary color)
- AI messages (left-aligned, muted background)
- Timestamps
- Typing indicator
- Auto-scroll to latest message
- Message history persistence

### 3. Pre-Connect Form
Lead capture before showing pricing/features

**Fields:**
- First Name (required)
- Last Name (required)
- Email (required)
- Company (optional)

**Flow:**
1. User clicks "Pricing" or "Features" button
2. Modal opens with friendly form
3. User fills in details
4. Form submits, modal closes
5. AI responds with personalized content using user's name
6. User info persisted for session

### 4. Quick Actions
Predefined conversation starters

**Actions:**
- 📅 Book a demo → Opens calendar booking flow
- 💰 Pricing → Shows pre-connect form, then pricing tiers
- ✨ Features → Shows pre-connect form, then feature list

### 5. Smart Demo Booking Flow
No redundant data collection

**Logic:**
- If user info already collected (via pre-connect) → Skip email capture, go straight to calendar
- If user info NOT collected → Show email capture first, then calendar
- Personalize greeting using collected info

### 6. Session State Management
Track user info and conversation state

**State:**
- User info (name, email, company)
- Conversation ID
- Message history
- Current intent (pricing, features, demo)
- Calendar connection status

### 7. AI Response Generation
Contextual, personalized responses

**Responses:**
- Greeting message
- Pricing tiers (after pre-connect)
- Feature breakdown (after pre-connect)
- Demo booking assistance
- FAQ answers (future AI integration)

**Personalization:**
- Use first name when available
- Tailor content based on company/role
- Reference previous messages

## Technical Implementation

### Ash Resources (from Track 3)

Already defined:
- `Chatbot.Conversation` - Chat sessions
- `Chatbot.Message` - Individual messages
- `Chatbot.ChatbotSettings` - Configuration

### LiveView Implementation

#### Chatbot Widget Component
**File:** `lib/clientt_crm_app_web/live/chatbot_live/widget.ex`

```elixir
defmodule ClienttCrmAppWeb.ChatbotLive.Widget do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Chatbot

  @impl true
  def mount(_params, session, socket) do
    session_id = session["session_id"] || generate_session_id()

    # Try to load existing conversation for this session
    conversation = Chatbot.get_or_create_conversation(session_id)

    socket =
      socket
      |> assign(:conversation_id, conversation.id)
      |> assign(:session_id, session_id)
      |> assign(:is_expanded, false)
      |> assign(:show_pre_connect, false)
      |> assign(:user_info, conversation.user_info || %{})
      |> assign(:messages, [])
      |> assign(:pending_intent, nil)
      |> assign(:calendar_connected, calendar_connected?(socket))
      |> load_messages(conversation.id)

    if connected?(socket) do
      # Subscribe to new messages
      Phoenix.PubSub.subscribe(
        ClienttCrmApp.PubSub,
        "chatbot:#{conversation.id}"
      )

      # Send initial greeting if new conversation
      if Enum.empty?(socket.assigns.messages) do
        send(self(), :send_greeting)
      end
    end

    {:ok, socket}
  end

  @impl true
  def handle_event("toggle_chat", _params, socket) do
    {:noreply, assign(socket, :is_expanded, !socket.assigns.is_expanded)}
  end

  @impl true
  def handle_event("send_message", %{"content" => content}, socket) do
    # Create user message
    {:ok, message} = Chatbot.create_message(%{
      conversation_id: socket.assigns.conversation_id,
      message_type: :user,
      content: content
    })

    # Broadcast to all connected clients
    Phoenix.PubSub.broadcast(
      ClienttCrmApp.PubSub,
      "chatbot:#{socket.assigns.conversation_id}",
      {:new_message, message}
    )

    # Generate AI response
    send(self(), {:generate_ai_response, content})

    {:noreply, socket}
  end

  @impl true
  def handle_event("quick_action", %{"action" => "book_demo"}, socket) do
    if socket.assigns.calendar_connected do
      # Check if we have user info
      if has_user_info?(socket) do
        # Skip email capture, go straight to calendar
        {:noreply, push_navigate(socket, to: ~p"/calendar/booking")}
      else
        # Show email capture first
        {:noreply, assign(socket, :show_email_capture, true)}
      end
    else
      # Show alert that calendar not connected
      {:noreply, put_flash(socket, :warning, "Please connect a calendar in Settings first")}
    end
  end

  @impl true
  def handle_event("quick_action", %{"action" => action}, socket)
      when action in ["pricing", "features"] do
    # Check if we already have user info
    if has_user_info?(socket) do
      # Generate response immediately
      send(self(), {:generate_ai_response, action})
      {:noreply, socket}
    else
      # Show pre-connect form first
      socket =
        socket
        |> assign(:show_pre_connect, true)
        |> assign(:pending_intent, action)

      {:noreply, socket}
    end
  end

  @impl true
  def handle_event("submit_pre_connect", params, socket) do
    user_info = %{
      first_name: params["first_name"],
      last_name: params["last_name"],
      email: params["email"],
      company: params["company"]
    }

    # Update conversation with user info
    {:ok, _conversation} = Chatbot.update_conversation(
      socket.assigns.conversation_id,
      %{user_info: user_info}
    )

    # Generate AI response for the pending intent
    send(self(), {:generate_ai_response, socket.assigns.pending_intent})

    socket =
      socket
      |> assign(:user_info, user_info)
      |> assign(:show_pre_connect, false)
      |> assign(:pending_intent, nil)

    {:noreply, socket}
  end

  @impl true
  def handle_info(:send_greeting, socket) do
    greeting = "Hi there 👋 Ready to book your free demo?"

    {:ok, message} = Chatbot.create_message(%{
      conversation_id: socket.assigns.conversation_id,
      message_type: :ai,
      content: greeting
    })

    Phoenix.PubSub.broadcast(
      ClienttCrmApp.PubSub,
      "chatbot:#{socket.assigns.conversation_id}",
      {:new_message, message}
    )

    {:noreply, socket}
  end

  @impl true
  def handle_info({:generate_ai_response, intent}, socket) do
    # Simulate thinking delay
    Process.sleep(1000)

    response = generate_response(intent, socket.assigns.user_info)

    {:ok, message} = Chatbot.create_message(%{
      conversation_id: socket.assigns.conversation_id,
      message_type: :ai,
      content: response,
      metadata: %{intent: intent}
    })

    Phoenix.PubSub.broadcast(
      ClienttCrmApp.PubSub,
      "chatbot:#{socket.assigns.conversation_id}",
      {:new_message, message}
    )

    {:noreply, socket}
  end

  @impl true
  def handle_info({:new_message, message}, socket) do
    {:noreply, update(socket, :messages, &(&1 ++ [message]))}
  end

  defp load_messages(socket, conversation_id) do
    messages = Chatbot.list_messages(conversation_id)
    assign(socket, :messages, messages)
  end

  defp has_user_info?(socket) do
    user_info = socket.assigns.user_info
    user_info[:email] != nil
  end

  defp calendar_connected?(socket) do
    # Check if current user has calendar integration
    case socket.assigns[:current_user] do
      nil -> false
      user -> ClienttCrmApp.Integrations.has_calendar_connected?(user.id)
    end
  end

  defp generate_session_id do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end

  defp generate_response("pricing", user_info) do
    first_name = user_info[:first_name] || "there"

    """
    Great question, #{first_name}! 💰

    Here are our pricing tiers:

    **Starter - $49/month**
    • Up to 5 forms
    • 500 submissions/month
    • Basic analytics
    • Email support

    **Pro - $99/month**
    • Unlimited forms
    • 5,000 submissions/month
    • Advanced analytics
    • Calendar integration
    • Chatbot
    • Priority support

    **Enterprise - Custom**
    • Unlimited everything
    • Custom integrations
    • Dedicated account manager
    • SLA guarantee

    Would you like to book a demo to discuss which plan is right for you?
    """
  end

  defp generate_response("features", user_info) do
    first_name = user_info[:first_name] || "there"

    """
    Hey #{first_name}! ✨ Here's what makes Clientt special:

    **📝 Form Builder**
    • Drag-and-drop interface
    • Custom fields & validation
    • Conditional logic
    • Multi-page forms

    **📅 Calendar Integration**
    • Sync with Google & Outlook
    • Smart availability
    • Automated reminders
    • Timezone handling

    **💬 AI Chatbot**
    • Lead qualification
    • 24/7 engagement
    • Smart routing
    • Conversation analytics

    **📊 Analytics**
    • Real-time KPIs
    • Conversion tracking
    • Lead scoring
    • Custom reports

    Want to see it in action? Book a demo!
    """
  end

  defp generate_response(message, _user_info) do
    # Default response for unrecognized intents
    """
    Thanks for your message! I can help you with:

    • Pricing information
    • Feature details
    • Booking a demo

    What would you like to know more about?
    """
  end
end
```

#### Chatbot Widget Template
**File:** `lib/clientt_crm_app_web/live/chatbot_live/widget.html.heex`

```heex
<div
  id="chatbot-widget"
  class="fixed bottom-6 right-6 z-50"
  phx-hook="ChatbotWidget"
>
  <%= if @is_expanded do %>
    <!-- Expanded Chat Window -->
    <div class="flex flex-col w-[380px] h-[600px] bg-card border rounded-2xl shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <.icon name="hero-sparkles" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-semibold">Clientt Assistant</h3>
            <p class="text-xs opacity-90">Online now</p>
          </div>
        </div>
        <button
          phx-click="toggle_chat"
          class="hover:bg-primary-foreground/10 rounded-lg p-2 transition-colors"
        >
          <.icon name="hero-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Messages -->
      <div
        id="message-list"
        phx-update="append"
        class="flex-1 overflow-y-auto p-4 space-y-4"
        phx-hook="AutoScroll"
      >
        <%= for message <- @messages do %>
          <div
            id={"message-#{message.id}"}
            class={[
              "flex",
              if(message.message_type == :user, do: "justify-end", else: "justify-start")
            ]}
          >
            <div class={[
              "max-w-[80%] rounded-2xl px-4 py-2",
              if(message.message_type == :user,
                do: "bg-primary text-primary-foreground",
                else: "bg-muted"
              )
            ]}>
              <p class="text-sm whitespace-pre-wrap">{message.content}</p>
              <p class="text-xs opacity-70 mt-1">
                {Calendar.strftime(message.inserted_at, "%I:%M %p")}
              </p>
            </div>
          </div>
        <% end %>
      </div>

      <!-- Quick Actions -->
      <div class="px-4 pb-2 flex gap-2 flex-wrap">
        <button
          phx-click="quick_action"
          phx-value-action="book_demo"
          class="btn btn-sm btn-outline"
        >
          📅 Book a demo
        </button>
        <button
          phx-click="quick_action"
          phx-value-action="pricing"
          class="btn btn-sm btn-outline"
        >
          💰 Pricing
        </button>
        <button
          phx-click="quick_action"
          phx-value-action="features"
          class="btn btn-sm btn-outline"
        >
          ✨ Features
        </button>
      </div>

      <!-- Input -->
      <div class="p-4 border-t">
        <form phx-submit="send_message" class="flex gap-2">
          <input
            type="text"
            name="content"
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            autocomplete="off"
          />
          <button type="submit" class="btn btn-primary">
            <.icon name="hero-paper-airplane" class="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  <% else %>
    <!-- Collapsed Bubble -->
    <button
      phx-click="toggle_chat"
      class="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow animate-pulse"
    >
      <.icon name="hero-chat-bubble-left-right" class="w-6 h-6 text-primary-foreground" />
    </button>
  <% end %>

  <!-- Pre-Connect Modal -->
  <%= if @show_pre_connect do %>
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card p-6 rounded-2xl max-w-md w-full mx-4">
        <h2 class="text-xl font-bold mb-2">✨ Great! Just a few quick questions...</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Before we show you <%= if @pending_intent == "pricing", do: "pricing", else: "our features" %>, tell us about yourself:
        </p>

        <form phx-submit="submit_pre_connect" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              First Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Last Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Company (optional)
            </label>
            <input
              type="text"
              name="company"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div class="flex gap-2">
            <button
              type="button"
              phx-click="close_pre_connect"
              class="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1"
            >
              Continue →
            </button>
          </div>
        </form>
      </div>
    </div>
  <% end %>
</div>
```

#### JavaScript Hook for Auto-Scroll
**File:** `assets/js/hooks/chatbot_widget.js`

```javascript
export const ChatbotWidget = {
  mounted() {
    this.scrollToBottom()
  },

  updated() {
    this.scrollToBottom()
  },

  scrollToBottom() {
    const messageList = this.el.querySelector('#message-list')
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight
    }
  }
}
```

### Chatbot Context Functions

**File:** `lib/clientt_crm_app/chatbot.ex`

```elixir
defmodule ClienttCrmApp.Chatbot do
  alias ClienttCrmApp.Chatbot.{Conversation, Message}

  def get_or_create_conversation(session_id) do
    case Conversation.by_session_id(session_id) do
      nil ->
        {:ok, conversation} = Conversation.create(%{session_id: session_id})
        conversation

      conversation ->
        conversation
    end
  end

  def update_conversation(conversation_id, attrs) do
    conversation_id
    |> Conversation.by_id!()
    |> Conversation.update(attrs)
  end

  def create_message(attrs) do
    Message.create(attrs)
  end

  def list_messages(conversation_id) do
    Message.for_conversation(conversation_id)
  end

  def close_conversation(conversation_id) do
    conversation_id
    |> Conversation.by_id!()
    |> Conversation.close()
  end
end
```

## Future: AI Integration

When ready to integrate real AI (OpenAI, Claude, etc.):

### AI Service Module
**File:** `lib/clientt_crm_app/ai/response_generator.ex`

```elixir
defmodule ClienttCrmApp.AI.ResponseGenerator do
  @moduledoc """
  Integrates with OpenAI or Claude API for intelligent responses
  """

  def generate_response(conversation_id, user_message) do
    # Load conversation history
    messages = ClienttCrmApp.Chatbot.list_messages(conversation_id)

    # Build context
    context = build_context(messages)

    # Call AI API
    case call_ai_api(context, user_message) do
      {:ok, response} -> response
      {:error, _} -> fallback_response()
    end
  end

  defp build_context(messages) do
    Enum.map(messages, fn msg ->
      %{
        role: if(msg.message_type == :user, do: "user", else: "assistant"),
        content: msg.content
      }
    end)
  end

  defp call_ai_api(context, user_message) do
    # Call OpenAI or Claude API
    # Return generated response
  end

  defp fallback_response do
    "I'm having trouble processing that. Can you rephrase?"
  end
end
```

## Configuration

Add to `config/config.exs`:

```elixir
config :clientt_crm_app, :chatbot,
  enabled: true,
  default_name: "Clientt Assistant",
  default_greeting: "Hi there 👋 Ready to book your free demo?",
  ai_enabled: false, # Set to true when AI integration ready
  ai_provider: :openai # or :claude
```

## Testing

### LiveView Tests
```elixir
defmodule ClienttCrmAppWeb.ChatbotLive.WidgetTest do
  use ClienttCrmAppWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Chatbot Widget" do
    test "mounts and shows collapsed state", %{conn: conn} do
      {:ok, view, html} = live(conn, ~p"/forms")

      assert html =~ "chatbot-widget"
      refute html =~ "Clientt Assistant"
    end

    test "expands on click", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/forms")

      html =
        view
        |> element("#chatbot-widget button")
        |> render_click()

      assert html =~ "Clientt Assistant"
      assert html =~ "Online now"
    end

    test "sends message", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/forms")

      # Expand chat
      view |> element("#chatbot-widget button") |> render_click()

      # Send message
      view
      |> form("form", %{content: "Hello!"})
      |> render_submit()

      assert render(view) =~ "Hello!"
    end

    test "shows pre-connect form for pricing", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/forms")

      # Expand chat
      view |> element("#chatbot-widget button") |> render_click()

      # Click pricing quick action
      html =
        view
        |> element("button[phx-value-action='pricing']")
        |> render_click()

      assert html =~ "Just a few quick questions"
      assert html =~ "First Name"
    end
  end
end
```

## Performance Considerations

1. **Message Pagination**
   - Load only recent messages initially
   - Implement "load more" for older messages

2. **PubSub Optimization**
   - Subscribe only to own conversation
   - Unsubscribe on widget close

3. **Response Caching**
   - Cache common responses (pricing, features)
   - Invalidate on settings change

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader announces new messages
- [ ] Focus management when opening/closing
- [ ] ARIA labels on all buttons
- [ ] Color contrast meets WCAG AA

## Next Steps

1. Implement basic chatbot widget (collapsed/expanded)
2. Add message threading
3. Build pre-connect form flow
4. Implement quick actions
5. Add smart demo booking logic
6. Test thoroughly
7. (Future) Integrate with AI API

---

**Status:** Detailed spec complete
**Dependencies:** Tracks 2, 3, 4
**Estimated Time:** 1-2 weeks
