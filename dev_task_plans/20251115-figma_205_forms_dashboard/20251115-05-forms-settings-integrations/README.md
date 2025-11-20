# Track 5: Settings & Configuration (MVP)

## Overview

Build the MVP settings UI for user preferences, notification settings, and future integration placeholders.

**Source:**
- `figma_src/205 Forms Dashboard/src/components/pages/SettingsPage.tsx` (adapted for MVP scope)

**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models)
**Estimated Time:** 3-4 days (reduced scope for MVP)

**MVP Scope:**
- User profile settings (link to existing AshAuthentication)
- Notification preferences (email + in-app)
- Integration placeholders (calendar/chatbot "Coming Soon" cards)
- NO calendar/chatbot implementation in MVP

## Pages to Build (MVP Scope)

### Settings Page with Tabs

**MVP Tabs:**

1. **Profile Tab**
   - Link to existing AshAuthentication account settings
   - Forms-specific preferences:
     - Timezone selection (for date/time display)
     - Default form settings (optional per Q17)

2. **Notifications Tab** (Per Q15, Q16 Decisions)
   - Email notification preferences:
     - Immediate (default)
     - Daily Digest
     - Off
   - In-app notification settings:
     - Notification bell in header
     - Unread count badge
     - Mark as read functionality
   - Store in `user_preferences` or `authz_user` table

3. **Integrations Tab** (Per Q18 Decision)
   - **Coming Soon placeholders only:**
     - Calendar Integration card (disabled, shows "Planned for Phase 3")
     - Chatbot Integration card (disabled, shows "Planned for Phase 3")
   - No actual OAuth implementation in MVP
   - Sets user expectations, shows product vision

**NOT in MVP:**
- Team Calendar tab (future feature)
- Billing tab (future)
- Full calendar/chatbot integration setup

## Technical Implementation

### Settings LiveView (MVP)

**File:** `lib/clientt_crm_app_web/live/settings_live/index.ex`

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.Index do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Accounts

  @impl true
  def mount(_params, _session, socket) do
    user = socket.assigns.current_user
    preferences = load_user_preferences(user.id)

    socket =
      socket
      |> assign(:page_title, "Settings")
      |> assign(:active_tab, "profile")
      |> assign(:preferences, preferences)
      |> assign(:notification_settings, preferences.notification_settings || %{})

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

  @impl true
  def handle_event("update_preferences", params, socket) do
    user_id = socket.assigns.current_user.id

    attrs = %{
      timezone: params["timezone"],
      notification_preference: params["notification_preference"]
    }

    case update_user_preferences(user_id, attrs) do
      {:ok, preferences} ->
        socket =
          socket
          |> put_flash(:info, "Settings saved successfully")
          |> assign(:preferences, preferences)

        {:noreply, socket}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to save settings")}
    end
  end

  defp load_user_preferences(user_id) do
    # Load from database or return defaults
    %{
      timezone: "UTC",
      notification_preference: "immediate", # immediate, daily, off
      notification_settings: %{
        email_enabled: true,
        in_app_enabled: true
      }
    }
  end

  defp update_user_preferences(user_id, attrs) do
    # Save to database
    {:ok, Map.merge(load_user_preferences(user_id), attrs)}
  end
end
```

## Notifications System (MVP Per Q15, Q16)

### Notification Resource

**File:** `lib/clientt_crm_app/accounts/notification.ex`

```elixir
defmodule ClienttCrmApp.Accounts.Notification do
  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Accounts,
    data_layer: AshPostgres.DataLayer

  postgres do
    table "notifications"
    repo ClienttCrmApp.Repo
  end

  attributes do
    uuid_primary_key :id

    attribute :user_id, :uuid, allow_nil?: false
    attribute :type, :string, allow_nil?: false # "new_submission", "form_published", etc.
    attribute :title, :string, allow_nil?: false
    attribute :message, :string
    attribute :link, :string # URL to related resource
    attribute :read_at, :utc_datetime
    attribute :metadata, :map, default: %{}

    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :user, ClienttCrmApp.Accounts.User
  end

  actions do
    defaults [:read, :destroy]

    create :create do
      accept [:user_id, :type, :title, :message, :link, :metadata]
    end

    update :mark_as_read do
      accept []
      change set_attribute(:read_at, &DateTime.utc_now/0)
    end

    read :unread_for_user do
      argument :user_id, :uuid, allow_nil?: false
      filter expr(user_id == ^arg(:user_id) and is_nil(read_at))
      prepare build(sort: [inserted_at: :desc])
    end
  end

  aggregates do
    count :unread_count, :user_id do
      filter expr(is_nil(read_at))
    end
  end
end
```

### Email Notification Sender

**File:** `lib/clientt_crm_app/notifications/email_sender.ex`

```elixir
defmodule ClienttCrmApp.Notifications.EmailSender do
  import Swoosh.Email
  alias ClienttCrmApp.Mailer

  def send_new_submission_notification(user, submission, form) do
    case user.notification_preference do
      "immediate" ->
        send_immediate_email(user, submission, form)

      "daily" ->
        # Queue for daily digest (implement with Oban if needed later)
        :ok

      "off" ->
        :ok
    end
  end

  defp send_immediate_email(user, submission, form) do
    email =
      new()
      |> to(user.email)
      |> from({"Clientt CRM", "notifications@clienttcrm.com"})
      |> subject("New form submission: #{form.name}")
      |> html_body("""
      <h2>New Submission Received</h2>
      <p>Form: #{form.name}</p>
      <p>Lead: #{submission.lead_email}</p>
      <p><a href="https://app.clienttcrm.com/forms/#{form.id}">View submission</a></p>
      """)

    Mailer.deliver(email)
  end
end
```

### Coming Soon Integrations Template (MVP Placeholder)

**File:** `lib/clientt_crm_app_web/live/settings_live/integrations.html.heex` (simplified for MVP)

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

```heex
<div class="max-w-[1200px] mx-auto p-8">
  <h1 class="text-[38px] font-bold mb-2">Integrations</h1>
  <p class="text-muted-foreground mb-8">
    Future integrations will be available here
  </p>

  <!-- Calendar Integration - Coming Soon -->
  <div class="bg-card rounded-2xl border p-6 mb-6 opacity-60 cursor-not-allowed">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <.icon name="hero-calendar" class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 class="text-xl font-semibold">Calendar Integration</h3>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
            Coming in Phase 3
          </span>
        </div>
      </div>
    </div>

    <p class="text-sm text-muted-foreground mb-4">
      Connect Google Calendar or Outlook to enable automated booking from forms.
      Schedule demos and meetings directly from lead submissions.
    </p>

    <div class="space-y-2 text-sm mb-4">
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">Two-way calendar sync</span>
      </div>
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">Automated booking from forms</span>
      </div>
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">Team availability management</span>
      </div>
    </div>

    <button class="btn btn-outline" disabled>
      Connect Calendar (Coming Soon)
    </button>
  </div>

  <!-- Chatbot Integration - Coming Soon -->
  <div class="bg-card rounded-2xl border p-6 mb-6 opacity-60 cursor-not-allowed">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <.icon name="hero-chat-bubble-left-right" class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 class="text-xl font-semibold">AI Chatbot Widget</h3>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
            Coming in Phase 3
          </span>
        </div>
      </div>
    </div>

    <p class="text-sm text-muted-foreground mb-4">
      AI-powered sales assistant to engage visitors, answer questions, and book demos
      automatically. Integrates with your forms and calendar.
    </p>

    <div class="space-y-2 text-sm mb-4">
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">24/7 automated lead qualification</span>
      </div>
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">Instant demo booking</span>
      </div>
      <div class="flex items-center gap-2">
        <.icon name="hero-check" class="w-4 h-4 text-muted-foreground" />
        <span class="text-muted-foreground">Custom conversation flows</span>
      </div>
    </div>

    <button class="btn btn-outline" disabled>
      Configure Chatbot (Coming Soon)
    </button>
  </div>

  <!-- Info Card -->
  <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
    <div class="flex items-start gap-3">
      <.icon name="hero-information-circle" class="w-6 h-6 text-blue-600 flex-shrink-0" />
      <div>
        <h4 class="font-semibold text-blue-900 mb-1">More integrations coming soon</h4>
        <p class="text-sm text-blue-800">
          We're working on Calendar and Chatbot integrations for Phase 3.
          These features will enhance your forms with automated booking and AI-powered lead qualification.
          Stay tuned for updates!
        </p>
      </div>
    </div>
  </div>
</div>
```

## Future Features (NOT in MVP)

**The following sections are for Phase 3+ reference only:**

### Calendar & Chatbot Integration (Phase 3+)

Full OAuth implementation for Google Calendar and Outlook will be added in Phase 3, including:
- OAuth callback handlers
- Token encryption with Cloak
- CalendarProvider and ChatbotSettings resources
- Two-way calendar sync
- Automated booking from forms

Refer to future feature specifications for implementation details.

## Testing (MVP Scope)

### Settings Page Tests

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.IndexTest do
  use ClienttCrmAppWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Settings page" do
    test "shows profile tab", %{conn: conn} do
      {:ok, _view, html} = live(conn, ~p"/settings?tab=profile")

      assert html =~ "Timezone"
      assert html =~ "Notification Preferences"
    end

    test "shows notifications tab", %{conn: conn} do
      {:ok, _view, html} = live(conn, ~p"/settings?tab=notifications")

      assert html =~ "Email Notifications"
      assert html =~ "In-App Notifications"
      assert html =~ "immediate"
      assert html =~ "daily"
    end

    test "shows integrations tab with coming soon placeholders", %{conn: conn} do
      {:ok, _view, html} = live(conn, ~p"/settings?tab=integrations")

      assert html =~ "Calendar Integration"
      assert html =~ "AI Chatbot Widget"
      assert html =~ "Coming in Phase 3"
      assert html =~ "disabled"
    end

    test "updates notification preferences", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/settings?tab=profile")

      view
      |> form("form", %{
        timezone: "America/New_York",
        notification_preference: "daily"
      })
      |> render_submit()

      assert render(view) =~ "Settings saved successfully"
    end
  end
end
```

### Notification Tests

```elixir
defmodule ClienttCrmApp.NotificationsTest do
  use ClienttCrmApp.DataCase
  alias ClienttCrmApp.Accounts.Notification

  describe "notifications" do
    test "creates notification for user" do
      user = user_fixture()

      {:ok, notification} = Notification.create(%{
        user_id: user.id,
        type: "new_submission",
        title: "New form submission",
        message: "Contact Form received a new submission"
      })

      assert notification.type == "new_submission"
    end

    test "marks notification as read" do
      notification = notification_fixture()

      {:ok, updated} = Notification.mark_as_read(notification)

      assert updated.read_at != nil
    end

    test "gets unread notifications for user" do
      user = user_fixture()
      notification_fixture(user_id: user.id)
      notification_fixture(user_id: user.id)

      unread = Notification.unread_for_user(user.id)

      assert length(unread) == 2
    end
  end
end
```

## Next Steps (MVP)

1. Build Settings page with 3 tabs (Profile, Notifications, Integrations)
2. Implement user preferences storage
3. Build notification system (Notification resource + email sender)
4. Create in-app notification UI (bell icon, dropdown, mark as read)
5. Add "Coming Soon" placeholders for calendar/chatbot integrations
6. Test notification delivery (email + in-app)
7. Test user preference updates

---

**Status:** MVP spec complete
**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models)
**Estimated Time:** 3-4 days (reduced from 1 week due to limited MVP scope)
