# Track 7: Settings & Integrations Management

## Overview

Build the settings UI for managing calendar integrations, chatbot configuration, and team availability.

**Source:**
- `figma_src/205 Forms Dashboard/src/components/pages/SettingsPage.tsx`
- `figma_src/205 Forms Dashboard/src/components/pages/TeamCalendarPage.tsx`

**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models), Track 4 (Calendar integration logic)
**Estimated Time:** 1 week

## Pages to Build

### 1. Settings Overview
Main settings page with tabs

**Tabs:**
- General (user profile, company settings)
- Integrations (calendar, chatbot)
- Team Calendar (availability management)
- Billing (future)
- Notifications (email preferences)

### 2. Integrations Tab
Configure external integrations

**Sections:**
- Calendar Integration
- Chatbot Settings
- Developer Handoff (API docs reference)

### 3. Team Calendar Tab
Manage booking availability

**Sections:**
- Availability Overview (stats)
- General Settings (duration, buffer, timezone)
- Weekly Availability
- Team Members
- Date Overrides

## Technical Implementation

### Settings LiveView

**File:** `lib/clientt_crm_app_web/live/settings_live/index.ex`

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.Index do
  use ClienttCrmAppWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:page_title, "Settings")
      |> assign(:active_tab, "general")

    {:ok, socket}
  end

  @impl true
  def handle_params(%{"tab" => tab}, _uri, socket) do
    {:noreply, assign(socket, :active_tab, tab)}
  end

  def handle_params(_params, _uri, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("change_tab", %{"tab" => tab}, socket) do
    {:noreply, push_patch(socket, to: ~p"/settings?tab=#{tab}")}
  end
end
```

### Integrations Tab LiveView

**File:** `lib/clientt_crm_app_web/live/settings_live/integrations.ex`

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.Integrations do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Integrations

  @impl true
  def mount(_params, _session, socket) do
    user_id = socket.assigns.current_user.id

    socket =
      socket
      |> assign(:page_title, "Integrations")
      |> load_integrations(user_id)
      |> load_chatbot_settings(user_id)

    {:ok, socket}
  end

  @impl true
  def handle_event("connect_google", _params, socket) do
    redirect_uri = url(~p"/auth/google/callback")
    authorize_url = ClienttCrmApp.Integrations.GoogleCalendar.authorize_url(redirect_uri)

    {:noreply, redirect(socket, external: authorize_url)}
  end

  @impl true
  def handle_event("connect_outlook", _params, socket) do
    redirect_uri = url(~p"/auth/outlook/callback")
    authorize_url = ClienttCrmApp.Integrations.OutlookCalendar.authorize_url(redirect_uri)

    {:noreply, redirect(socket, external: authorize_url)}
  end

  @impl true
  def handle_event("disconnect_calendar", %{"provider" => provider}, socket) do
    user_id = socket.assigns.current_user.id

    case Integrations.disconnect_calendar(user_id, provider) do
      {:ok, _} ->
        socket =
          socket
          |> put_flash(:info, "Calendar disconnected successfully")
          |> load_integrations(user_id)

        {:noreply, socket}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to disconnect calendar")}
    end
  end

  @impl true
  def handle_event("update_calendar_settings", params, socket) do
    %{
      "provider" => provider,
      "calendar_id" => calendar_id,
      "event_title" => event_title,
      "send_notifications" => send_notifications,
      "notification_email" => notification_email
    } = params

    user_id = socket.assigns.current_user.id

    settings = %{
      calendar_id: calendar_id,
      event_title_template: event_title,
      send_notifications: send_notifications == "true",
      notification_email: notification_email
    }

    case Integrations.update_calendar_settings(user_id, provider, settings) do
      {:ok, _} ->
        socket =
          socket
          |> put_flash(:info, "Settings saved successfully")
          |> load_integrations(user_id)

        {:noreply, socket}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to save settings")}
    end
  end

  @impl true
  def handle_event("update_chatbot_settings", params, socket) do
    user_id = socket.assigns.current_user.id

    attrs = %{
      is_enabled: params["is_enabled"] == "true",
      chatbot_name: params["chatbot_name"],
      greeting_message: params["greeting_message"],
      trigger_pages: parse_trigger_pages(params["trigger_pages"]),
      enable_demo_booking: params["enable_demo_booking"] == "true",
      demo_notification_routing: params["demo_notification_routing"],
      notification_email: params["notification_email"]
    }

    case Integrations.update_chatbot_settings(user_id, attrs) do
      {:ok, _} ->
        socket =
          socket
          |> put_flash(:info, "Chatbot settings saved")
          |> load_chatbot_settings(user_id)

        {:noreply, socket}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to save chatbot settings")}
    end
  end

  defp load_integrations(socket, user_id) do
    google_integration = Integrations.get_calendar_integration(user_id, :google)
    outlook_integration = Integrations.get_calendar_integration(user_id, :outlook)

    socket
    |> assign(:google_integration, google_integration)
    |> assign(:outlook_integration, outlook_integration)
    |> assign(:calendar_connected, google_integration != nil || outlook_integration != nil)
  end

  defp load_chatbot_settings(socket, user_id) do
    settings = Integrations.get_chatbot_settings(user_id)
    assign(socket, :chatbot_settings, settings)
  end

  defp parse_trigger_pages(trigger_pages) when is_binary(trigger_pages) do
    String.split(trigger_pages, ",") |> Enum.map(&String.trim/1)
  end

  defp parse_trigger_pages(trigger_pages) when is_list(trigger_pages), do: trigger_pages
end
```

### Integrations Template

**File:** `lib/clientt_crm_app_web/live/settings_live/integrations.html.heex`

```heex
<div class="max-w-[1200px] mx-auto p-8">
  <h1 class="text-[38px] font-bold mb-2">Integrations</h1>
  <p class="text-muted-foreground mb-8">
    Connect your calendar and configure chatbot settings
  </p>

  <!-- Calendar Integration Section -->
  <div class="bg-card rounded-2xl border p-6 mb-6">
    <h2 class="text-2xl font-semibold mb-4">Calendar Integration</h2>
    <p class="text-sm text-muted-foreground mb-6">
      Connect your calendar to enable demo booking from forms and chatbot
    </p>

    <!-- Google Calendar -->
    <div class="mb-6 pb-6 border-b">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <.icon name="hero-calendar" class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="font-semibold">Google Calendar</h3>
            <%= if @google_integration do %>
              <span class="inline-flex items-center gap-1 text-xs text-green-600">
                <.icon name="hero-check-circle" class="w-4 h-4" />
                Connected
              </span>
            <% else %>
              <span class="text-xs text-muted-foreground">Not connected</span>
            <% end %>
          </div>
        </div>

        <%= if @google_integration do %>
          <button
            phx-click="disconnect_calendar"
            phx-value-provider="google"
            data-confirm="Are you sure you want to disconnect Google Calendar?"
            class="btn btn-outline btn-sm"
          >
            Disconnect
          </button>
        <% else %>
          <button
            phx-click="connect_google"
            class="btn btn-primary"
          >
            Connect Account
          </button>
        <% end %>
      </div>

      <%= if @google_integration do %>
        <!-- Google Calendar Settings Form -->
        <form phx-submit="update_calendar_settings" class="space-y-4 bg-muted/50 p-4 rounded-lg">
          <input type="hidden" name="provider" value="google" />

          <div>
            <label class="block text-sm font-medium mb-1">
              Select Calendar
            </label>
            <select
              name="calendar_id"
              class="w-full px-4 py-2 border rounded-lg"
            >
              <option value="primary">Primary Calendar</option>
              <option value="team">Team Calendar</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Event Title Template
            </label>
            <input
              type="text"
              name="event_title"
              value={@google_integration.settings["event_title_template"] || "Demo with {{attendee_name}}"}
              placeholder="Demo with {{attendee_name}}"
              class="w-full px-4 py-2 border rounded-lg"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Use {{attendee_name}}, {{attendee_email}}, {{company}} as placeholders
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="send_notifications"
              id="google_notifications"
              value="true"
              checked={@google_integration.settings["send_notifications"] == true}
              class="rounded"
            />
            <label for="google_notifications" class="text-sm">
              Send confirmation emails
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Notification Email
            </label>
            <input
              type="email"
              name="notification_email"
              value={@google_integration.settings["notification_email"]}
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div class="flex gap-2">
            <button type="submit" class="btn btn-primary">
              Save Settings
            </button>
            <button type="button" class="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      <% end %>
    </div>

    <!-- Outlook Calendar (similar structure) -->
    <div class="mb-6">
      <!-- Similar to Google Calendar section -->
    </div>
  </div>

  <!-- Chatbot Settings Section -->
  <div class="bg-card rounded-2xl border p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-2xl font-semibold">Chatbot Settings</h2>
        <p class="text-sm text-muted-foreground">
          Configure your AI sales assistant
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">
          <%= if @chatbot_settings.is_enabled, do: "Active", else: "Inactive" %>
        </span>
        <input
          type="checkbox"
          phx-click="toggle_chatbot"
          checked={@chatbot_settings.is_enabled}
          class="toggle"
        />
      </div>
    </div>

    <%= if @chatbot_settings.is_enabled do %>
      <form phx-submit="update_chatbot_settings" class="space-y-6">
        <input type="hidden" name="is_enabled" value="true" />

        <div>
          <label class="block text-sm font-medium mb-1">
            Chatbot Name
          </label>
          <input
            type="text"
            name="chatbot_name"
            value={@chatbot_settings.chatbot_name}
            class="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Greeting Message
          </label>
          <textarea
            name="greeting_message"
            rows="3"
            class="w-full px-4 py-2 border rounded-lg"
          >{@chatbot_settings.greeting_message}</textarea>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Trigger Pages
          </label>
          <select
            name="trigger_pages"
            class="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">All Pages</option>
            <option value="forms">Form Pages Only</option>
            <option value="landing">Landing Pages Only</option>
            <option value="contact">Contact Form</option>
            <option value="pricing">Pricing Page</option>
          </select>
        </div>

        <!-- Demo Booking Settings -->
        <div class="bg-muted/50 p-4 rounded-lg space-y-4">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_demo_booking"
              id="enable_demo_booking"
              value="true"
              checked={@chatbot_settings.enable_demo_booking}
              class="rounded"
            />
            <label for="enable_demo_booking" class="text-sm font-medium">
              Enable "Book a Demo" button
            </label>
          </div>

          <%= if !@calendar_connected do %>
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p class="text-sm text-orange-800">
                <.icon name="hero-exclamation-triangle" class="w-4 h-4 inline" />
                Calendar integration required for demo booking
              </p>
            </div>
          <% end %>

          <div>
            <label class="block text-sm font-medium mb-1">
              Demo Confirmation Routing
            </label>
            <select
              name="demo_notification_routing"
              class="w-full px-4 py-2 border rounded-lg"
            >
              <option value="email">Email Notification</option>
              <option value="dashboard">Internal Dashboard Only</option>
              <option value="email_and_dashboard">Email + Dashboard</option>
              <option value="slack" disabled>Slack Channel (Coming Soon)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Notification Email
            </label>
            <input
              type="email"
              name="notification_email"
              value={@chatbot_settings.notification_email}
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary">
            Save Chatbot Settings
          </button>
          <button type="button" class="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    <% end %>
  </div>

  <!-- CTA to Team Calendar -->
  <div class="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border p-6">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
        <.icon name="hero-calendar" class="w-8 h-8 text-white" />
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-semibold mb-1">Manage Your Team's Availability</h3>
        <p class="text-sm text-muted-foreground">
          Set working hours, manage team members, and configure booking preferences
        </p>
      </div>
      <button
        phx-click="navigate_to_team_calendar"
        class="btn btn-primary"
      >
        Go to Team Calendar →
      </button>
    </div>
  </div>
</div>
```

### Team Calendar Settings

Most of the implementation is already covered in Track 4. The LiveView and template show:

1. **Availability Overview** - Stats cards showing active days, default duration, etc.
2. **General Settings** - Meeting duration, buffer time, advance booking period
3. **Weekly Availability** - Day-by-day time range editor
4. **Team Members** - Add/manage team members with active toggles
5. **Date Overrides** - Block dates or set custom hours

Refer to Track 4 README for the detailed implementation.

## Integration Context Functions

**File:** `lib/clientt_crm_app/integrations.ex`

```elixir
defmodule ClienttCrmApp.Integrations do
  alias ClienttCrmApp.Integrations.{CalendarProvider, ChatbotSettings}

  # Calendar Integration

  def get_calendar_integration(user_id, provider) do
    CalendarProvider.for_user_and_provider(user_id, provider)
  end

  def has_calendar_connected?(user_id) do
    CalendarProvider.for_user(user_id) != []
  end

  def disconnect_calendar(user_id, provider) do
    case get_calendar_integration(user_id, provider) do
      nil ->
        {:error, :not_found}

      integration ->
        CalendarProvider.disconnect(integration)
    end
  end

  def update_calendar_settings(user_id, provider, settings) do
    case get_calendar_integration(user_id, provider) do
      nil ->
        {:error, :not_found}

      integration ->
        CalendarProvider.update(integration, %{settings: settings})
    end
  end

  # Chatbot Settings

  def get_chatbot_settings(user_id) do
    case ChatbotSettings.for_user(user_id) do
      nil ->
        # Create default settings
        {:ok, settings} = ChatbotSettings.create(%{user_id: user_id})
        settings

      settings ->
        settings
    end
  end

  def update_chatbot_settings(user_id, attrs) do
    settings = get_chatbot_settings(user_id)
    ChatbotSettings.update(settings, attrs)
  end
end
```

## OAuth Callback Handlers

**File:** `lib/clientt_crm_app_web/controllers/auth_controller.ex`

```elixir
defmodule ClienttCrmAppWeb.AuthController do
  use ClienttCrmAppWeb, :controller
  alias ClienttCrmApp.Integrations

  def google_callback(conn, %{"code" => code}) do
    user_id = conn.assigns.current_user.id
    redirect_uri = url(~p"/auth/google/callback")

    case Integrations.GoogleCalendar.exchange_code_for_tokens(code, redirect_uri) do
      {:ok, %{"access_token" => access_token, "refresh_token" => refresh_token}} ->
        # Save integration
        {:ok, _integration} = Integrations.create_calendar_integration(%{
          user_id: user_id,
          provider: :google,
          access_token: access_token,
          refresh_token: refresh_token,
          token_expires_at: DateTime.add(DateTime.utc_now(), 3600, :second)
        })

        conn
        |> put_flash(:info, "Google Calendar connected successfully!")
        |> redirect(to: ~p"/settings?tab=integrations")

      {:error, _reason} ->
        conn
        |> put_flash(:error, "Failed to connect Google Calendar")
        |> redirect(to: ~p"/settings?tab=integrations")
    end
  end

  def outlook_callback(conn, %{"code" => code}) do
    # Similar to Google callback
  end
end
```

Add routes:

```elixir
scope "/auth", ClienttCrmAppWeb do
  pipe_through [:browser, :require_authenticated_user]

  get "/google/callback", AuthController, :google_callback
  get "/outlook/callback", AuthController, :outlook_callback
end
```

## Security Considerations

### Token Encryption

Use Cloak to encrypt OAuth tokens:

**File:** `lib/clientt_crm_app/vault.ex`

```elixir
defmodule ClienttCrmApp.Vault do
  use Cloak.Vault, otp_app: :clientt_crm_app
end

# In config/config.exs
config :clientt_crm_app, ClienttCrmApp.Vault,
  ciphers: [
    default: {Cloak.Ciphers.AES.GCM, tag: "AES.GCM.V1", key: Base.decode64!("your-key-here")}
  ]
```

Update `CalendarProvider` resource:

```elixir
attribute :access_token, ClienttCrmApp.Encrypted.Binary do
  allow_nil? false
end

attribute :refresh_token, ClienttCrmApp.Encrypted.Binary
```

### CSRF Protection

Ensure all forms have CSRF tokens (Phoenix provides this by default).

### OAuth State Parameter

Add state parameter to OAuth URLs to prevent CSRF:

```elixir
def authorize_url(redirect_uri) do
  state = :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)

  # Store state in session or database
  # Verify in callback

  params = %{
    # ... other params
    state: state
  }

  @oauth_authorize_url <> "?" <> URI.encode_query(params)
end
```

## Testing

### LiveView Tests

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.IntegrationsTest do
  use ClienttCrmAppWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Integrations page" do
    test "shows connect buttons when not connected", %{conn: conn} do
      {:ok, _view, html} = live(conn, ~p"/settings?tab=integrations")

      assert html =~ "Connect Account"
      assert html =~ "Google Calendar"
      assert html =~ "Outlook"
    end

    test "shows disconnect button when connected", %{conn: conn} do
      user = user_fixture()
      integration_fixture(user_id: user.id, provider: :google)

      {:ok, _view, html} = live(conn, ~p"/settings?tab=integrations")

      assert html =~ "Connected"
      assert html =~ "Disconnect"
    end

    test "updates chatbot settings", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/settings?tab=integrations")

      view
      |> form("form", %{
        chatbot_name: "My Assistant",
        greeting_message: "Hello there!",
        is_enabled: "true"
      })
      |> render_submit()

      assert render(view) =~ "Chatbot settings saved"
    end
  end
end
```

### Integration Tests

```elixir
defmodule ClienttCrmApp.IntegrationsTest do
  use ClienttCrmApp.DataCase
  alias ClienttCrmApp.Integrations

  describe "calendar integrations" do
    test "connects calendar successfully" do
      user = user_fixture()

      {:ok, integration} = Integrations.create_calendar_integration(%{
        user_id: user.id,
        provider: :google,
        access_token: "token",
        refresh_token: "refresh"
      })

      assert integration.provider == :google
      assert Integrations.has_calendar_connected?(user.id) == true
    end

    test "disconnects calendar" do
      user = user_fixture()
      integration = integration_fixture(user_id: user.id)

      {:ok, _} = Integrations.disconnect_calendar(user.id, :google)

      assert Integrations.has_calendar_connected?(user.id) == false
    end
  end

  describe "chatbot settings" do
    test "creates default settings for new user" do
      user = user_fixture()

      settings = Integrations.get_chatbot_settings(user.id)

      assert settings.is_enabled == true
      assert settings.chatbot_name == "Clientt Assistant"
    end

    test "updates chatbot settings" do
      user = user_fixture()

      {:ok, settings} = Integrations.update_chatbot_settings(user.id, %{
        chatbot_name: "Custom Bot"
      })

      assert settings.chatbot_name == "Custom Bot"
    end
  end
end
```

## Next Steps

1. Build Settings page with tabs
2. Implement Integrations tab UI
3. Add OAuth callback handlers
4. Implement token encryption
5. Build chatbot settings form
6. Add Team Calendar settings (see Track 4)
7. Test OAuth flows thoroughly
8. Add error handling for API failures

---

**Status:** Detailed spec complete
**Dependencies:** Tracks 2, 3, 4
**Estimated Time:** 1 week
