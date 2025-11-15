# Track 4: Calendar Integration System

## Overview

Build a Calendly-like booking system with Google Calendar and Outlook integration for scheduling demo calls from forms.

**Dependencies:** Track 2 (LiveView UI), Track 3 (Domain Models)
**Estimated Time:** 2-3 weeks

## Features to Implement

### 1. Calendar Booking Widget
Interactive date/time picker for scheduling meetings

**Source:** `figma_src/205 Forms Dashboard/src/components/pages/CalendarBuilderPage.tsx`

**Components:**
- Two-panel layout (calendar left, booking form right)
- Date picker with availability highlighting
- Time slot selector (showing available times)
- Timezone selector
- Booking confirmation modal

**Key Features:**
- Show only available time slots
- Handle multiple timezones
- Buffer time between meetings
- Minimum notice period
- Maximum advance booking period

### 2. Team Availability Management
Configure when team members can take bookings

**Source:** `figma_src/205 Forms Dashboard/src/components/pages/TeamCalendarPage.tsx`

**Components:**
- Weekly schedule editor
- Day-specific time ranges
- Bulk actions (enable/disable all days)
- Override management (holidays, custom hours)
- Team member availability toggles

**Key Features:**
- Monday-Friday 9 AM - 5 PM default
- Per-day customization
- Date-specific overrides
- Timezone awareness
- Multiple team members

### 3. Google Calendar Integration
Two-way sync with Google Calendar

**OAuth Flow:**
1. User clicks "Connect Google Calendar"
2. Redirect to Google OAuth consent screen
3. User authorizes access
4. Callback receives authorization code
5. Exchange code for access/refresh tokens
6. Store encrypted tokens in database
7. Sync calendar list and availability

**Features:**
- Read calendar availability (free/busy)
- Create calendar events for bookings
- Update events when rescheduled
- Cancel events when booking cancelled
- Sync multiple calendars

### 4. Outlook Calendar Integration
Two-way sync with Microsoft Outlook/365

**OAuth Flow:**
1. User clicks "Connect Outlook"
2. Redirect to Microsoft OAuth consent screen
3. User authorizes access
4. Callback receives authorization code
5. Exchange code for access/refresh tokens
6. Store encrypted tokens in database
7. Sync calendar list and availability

**Features:**
- Read calendar availability (free/busy)
- Create calendar events for bookings
- Update events when rescheduled
- Cancel events when booking cancelled
- Sync multiple calendars

### 5. Email Confirmations
Send booking confirmations and reminders

**Email Types:**
- Booking confirmation (to attendee + team member)
- Reminder 24 hours before
- Reminder 1 hour before (optional)
- Cancellation notification
- Reschedule notification

**Include:**
- Meeting details (date, time, timezone)
- Calendar file attachment (.ics)
- Add to calendar links (Google, Outlook, Apple)
- Join meeting link (if applicable)
- Cancellation/reschedule link

## Technical Implementation

### Ash Resources (from Track 3)

Already defined:
- `Calendars.Booking` - Scheduled meetings
- `Calendars.Availability` - Team availability
- `Calendars.AvailabilityOverride` - Date overrides
- `Integrations.CalendarProvider` - OAuth connections

### LiveView Pages

#### Booking Widget
**File:** `lib/clientt_crm_app_web/live/calendar_live/booking.ex`

```elixir
defmodule ClienttCrmAppWeb.CalendarLive.Booking do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Calendars

  @impl true
  def mount(%{"form_id" => form_id}, _session, socket) do
    socket =
      socket
      |> assign(:form_id, form_id)
      |> assign(:selected_date, nil)
      |> assign(:selected_time, nil)
      |> assign(:timezone, "America/New_York")
      |> assign(:available_times, [])
      |> load_availability()

    {:ok, socket}
  end

  @impl true
  def handle_event("select_date", %{"date" => date}, socket) do
    date = Date.from_iso8601!(date)

    socket =
      socket
      |> assign(:selected_date, date)
      |> load_available_times(date)

    {:noreply, socket}
  end

  @impl true
  def handle_event("select_time", %{"time" => time}, socket) do
    {:noreply, assign(socket, :selected_time, time)}
  end

  @impl true
  def handle_event("confirm_booking", params, socket) do
    %{
      "name" => name,
      "email" => email
    } = params

    case Calendars.create_booking(%{
      user_id: socket.assigns.current_user.id,
      scheduled_at: build_datetime(socket.assigns.selected_date, socket.assigns.selected_time),
      timezone: socket.assigns.timezone,
      attendee_name: name,
      attendee_email: email,
      duration_minutes: 30
    }) do
      {:ok, booking} ->
        # Send confirmation email
        send_booking_confirmation(booking)

        # Create calendar event if integration connected
        create_calendar_event(booking)

        socket =
          socket
          |> put_flash(:info, "Booking confirmed!")
          |> push_navigate(to: ~p"/calendar/bookings")

        {:noreply, socket}

      {:error, changeset} ->
        {:noreply, assign(socket, :changeset, changeset)}
    end
  end

  defp load_available_times(socket, date) do
    user_id = socket.assigns.current_user.id
    timezone = socket.assigns.timezone

    times = Calendars.get_available_time_slots(
      user_id: user_id,
      date: date,
      timezone: timezone,
      duration_minutes: 30
    )

    assign(socket, :available_times, times)
  end

  defp build_datetime(date, time) do
    # Combine date and time into DateTime
    # Handle timezone conversion
  end

  defp send_booking_confirmation(booking) do
    # Use Swoosh to send email
  end

  defp create_calendar_event(booking) do
    # Delegate to calendar sync service
  end
end
```

#### Team Availability Settings
**File:** `lib/clientt_crm_app_web/live/settings_live/team_calendar.ex`

```elixir
defmodule ClienttCrmAppWeb.SettingsLive.TeamCalendar do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Calendars

  @days_of_week [
    {0, "Sunday"},
    {1, "Monday"},
    {2, "Tuesday"},
    {3, "Wednesday"},
    {4, "Thursday"},
    {5, "Friday"},
    {6, "Saturday"}
  ]

  @impl true
  def mount(_params, _session, socket) do
    user_id = socket.assigns.current_user.id

    socket =
      socket
      |> assign(:days_of_week, @days_of_week)
      |> load_availability(user_id)
      |> load_overrides(user_id)

    {:ok, socket}
  end

  @impl true
  def handle_event("toggle_day", %{"day" => day}, socket) do
    day = String.to_integer(day)
    user_id = socket.assigns.current_user.id

    case Calendars.toggle_day_availability(user_id, day) do
      {:ok, _} ->
        {:noreply, load_availability(socket, user_id)}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to update availability")}
    end
  end

  @impl true
  def handle_event("update_day_hours", params, socket) do
    %{
      "day" => day,
      "start_time" => start_time,
      "end_time" => end_time
    } = params

    day = String.to_integer(day)
    user_id = socket.assigns.current_user.id

    case Calendars.update_day_hours(user_id, day, start_time, end_time) do
      {:ok, _} ->
        {:noreply, load_availability(socket, user_id)}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Invalid time range")}
    end
  end

  @impl true
  def handle_event("add_override", params, socket) do
    %{
      "date" => date,
      "type" => type
    } = params

    user_id = socket.assigns.current_user.id

    case Calendars.create_availability_override(%{
      user_id: user_id,
      date: Date.from_iso8601!(date),
      override_type: String.to_atom(type)
    }) do
      {:ok, _} ->
        {:noreply, load_overrides(socket, user_id)}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to add override")}
    end
  end

  defp load_availability(socket, user_id) do
    availability = Calendars.get_team_availability(user_id)
    assign(socket, :availability, availability)
  end

  defp load_overrides(socket, user_id) do
    overrides = Calendars.get_availability_overrides(user_id)
    assign(socket, :overrides, overrides)
  end
end
```

### Calendar Sync Services

#### Google Calendar Service
**File:** `lib/clientt_crm_app/integrations/google_calendar.ex`

```elixir
defmodule ClienttCrmApp.Integrations.GoogleCalendar do
  @moduledoc """
  Google Calendar API integration for booking sync
  """

  @oauth_authorize_url "https://accounts.google.com/o/oauth2/v2/auth"
  @oauth_token_url "https://oauth2.googleapis.com/token"
  @calendar_api_base "https://www.googleapis.com/calendar/v3"

  def authorize_url(redirect_uri) do
    params = %{
      client_id: google_client_id(),
      redirect_uri: redirect_uri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar.events",
      access_type: "offline",
      prompt: "consent"
    }

    @oauth_authorize_url <> "?" <> URI.encode_query(params)
  end

  def exchange_code_for_tokens(code, redirect_uri) do
    body = %{
      code: code,
      client_id: google_client_id(),
      client_secret: google_client_secret(),
      redirect_uri: redirect_uri,
      grant_type: "authorization_code"
    }

    case Finch.build(:post, @oauth_token_url, [], Jason.encode!(body))
         |> Finch.request(ClienttCrmApp.Finch) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:error, _} = error ->
        error
    end
  end

  def refresh_access_token(refresh_token) do
    body = %{
      refresh_token: refresh_token,
      client_id: google_client_id(),
      client_secret: google_client_secret(),
      grant_type: "refresh_token"
    }

    case Finch.build(:post, @oauth_token_url, [], Jason.encode!(body))
         |> Finch.request(ClienttCrmApp.Finch) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:error, _} = error ->
        error
    end
  end

  def create_event(access_token, calendar_id, event_params) do
    url = "#{@calendar_api_base}/calendars/#{calendar_id}/events"
    headers = [{"Authorization", "Bearer #{access_token}"}]

    body = %{
      summary: event_params.summary,
      description: event_params.description,
      start: %{
        dateTime: DateTime.to_iso8601(event_params.start_time),
        timeZone: event_params.timezone
      },
      end: %{
        dateTime: DateTime.to_iso8601(event_params.end_time),
        timeZone: event_params.timezone
      },
      attendees: [
        %{email: event_params.attendee_email}
      ],
      conferenceData: event_params[:conference_data],
      reminders: %{
        useDefault: false,
        overrides: [
          %{method: "email", minutes: 1440}, # 24 hours
          %{method: "popup", minutes: 30}
        ]
      }
    }

    case Finch.build(:post, url, headers, Jason.encode!(body))
         |> Finch.request(ClienttCrmApp.Finch) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:error, _} = error ->
        error
    end
  end

  def get_free_busy(access_token, calendar_id, time_min, time_max) do
    url = "#{@calendar_api_base}/freeBusy"
    headers = [{"Authorization", "Bearer #{access_token}"}]

    body = %{
      timeMin: DateTime.to_iso8601(time_min),
      timeMax: DateTime.to_iso8601(time_max),
      items: [%{id: calendar_id}]
    }

    case Finch.build(:post, url, headers, Jason.encode!(body))
         |> Finch.request(ClienttCrmApp.Finch) do
      {:ok, %{status: 200, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:error, _} = error ->
        error
    end
  end

  defp google_client_id do
    Application.get_env(:clientt_crm_app, :google_client_id)
  end

  defp google_client_secret do
    Application.get_env(:clientt_crm_app, :google_client_secret)
  end
end
```

#### Outlook Calendar Service
**File:** `lib/clientt_crm_app/integrations/outlook_calendar.ex`

```elixir
defmodule ClienttCrmApp.Integrations.OutlookCalendar do
  @moduledoc """
  Microsoft Outlook/365 Calendar API integration
  """

  @oauth_authorize_url "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
  @oauth_token_url "https://login.microsoftonline.com/common/oauth2/v2.0/token"
  @graph_api_base "https://graph.microsoft.com/v1.0"

  def authorize_url(redirect_uri) do
    params = %{
      client_id: outlook_client_id(),
      redirect_uri: redirect_uri,
      response_type: "code",
      scope: "Calendars.ReadWrite offline_access",
      response_mode: "query"
    }

    @oauth_authorize_url <> "?" <> URI.encode_query(params)
  end

  def exchange_code_for_tokens(code, redirect_uri) do
    # Similar to Google, but using Microsoft endpoints
  end

  def create_event(access_token, event_params) do
    url = "#{@graph_api_base}/me/events"
    headers = [{"Authorization", "Bearer #{access_token}"}]

    body = %{
      subject: event_params.summary,
      body: %{
        contentType: "HTML",
        content: event_params.description
      },
      start: %{
        dateTime: DateTime.to_iso8601(event_params.start_time),
        timeZone: event_params.timezone
      },
      end: %{
        dateTime: DateTime.to_iso8601(event_params.end_time),
        timeZone: event_params.timezone
      },
      attendees: [
        %{
          emailAddress: %{address: event_params.attendee_email},
          type: "required"
        }
      ]
    }

    case Finch.build(:post, url, headers, Jason.encode!(body))
         |> Finch.request(ClienttCrmApp.Finch) do
      {:ok, %{status: 201, body: response_body}} ->
        {:ok, Jason.decode!(response_body)}

      {:error, _} = error ->
        error
    end
  end

  # Similar methods for get_free_busy, update_event, delete_event

  defp outlook_client_id do
    Application.get_env(:clientt_crm_app, :outlook_client_id)
  end

  defp outlook_client_secret do
    Application.get_env(:clientt_crm_app, :outlook_client_secret)
  end
end
```

### Availability Calculation Logic

**File:** `lib/clientt_crm_app/calendars/availability_calculator.ex`

```elixir
defmodule ClienttCrmApp.Calendars.AvailabilityCalculator do
  @moduledoc """
  Calculates available time slots for bookings based on:
  - Team member availability (weekly schedule)
  - Availability overrides (holidays, custom hours)
  - Existing bookings
  - External calendar busy times (Google/Outlook)
  - Buffer time between meetings
  - Minimum notice period
  - Maximum advance booking period
  """

  alias ClienttCrmApp.Calendars

  def get_available_slots(opts) do
    user_id = Keyword.fetch!(opts, :user_id)
    date = Keyword.fetch!(opts, :date)
    timezone = Keyword.get(opts, :timezone, "UTC")
    duration_minutes = Keyword.get(opts, :duration_minutes, 30)
    buffer_minutes = Keyword.get(opts, :buffer_minutes, 0)
    min_notice_hours = Keyword.get(opts, :min_notice_hours, 0)

    # 1. Get base availability for day of week
    day_availability = Calendars.get_day_availability(user_id, Date.day_of_week(date))

    # 2. Check for date override
    day_availability = apply_override(day_availability, user_id, date)

    # 3. Get existing bookings for the day
    existing_bookings = Calendars.get_bookings_for_date(user_id, date)

    # 4. Get external calendar busy times (if integrated)
    external_busy_times = get_external_busy_times(user_id, date)

    # 5. Combine all busy times
    all_busy_times = existing_bookings ++ external_busy_times

    # 6. Generate time slots
    available_slots = generate_time_slots(
      day_availability,
      all_busy_times,
      duration_minutes,
      buffer_minutes,
      timezone
    )

    # 7. Filter out slots in the past (considering min_notice_hours)
    now = DateTime.utc_now()
    min_booking_time = DateTime.add(now, min_notice_hours * 3600, :second)

    Enum.filter(available_slots, fn slot ->
      DateTime.compare(slot, min_booking_time) == :gt
    end)
  end

  defp apply_override(day_availability, user_id, date) do
    case Calendars.get_override_for_date(user_id, date) do
      %{override_type: :blocked} ->
        nil

      %{override_type: :custom_hours, start_time: start_time, end_time: end_time} ->
        %{start_time: start_time, end_time: end_time}

      nil ->
        day_availability
    end
  end

  defp get_external_busy_times(user_id, date) do
    # Fetch from Google/Outlook if connected
    case Calendars.get_calendar_integration(user_id) do
      %{provider: :google, access_token: token, calendar_id: cal_id} ->
        fetch_google_busy_times(token, cal_id, date)

      %{provider: :outlook, access_token: token} ->
        fetch_outlook_busy_times(token, date)

      nil ->
        []
    end
  end

  defp generate_time_slots(nil, _busy_times, _duration, _buffer, _timezone) do
    # No availability for this day
    []
  end

  defp generate_time_slots(availability, busy_times, duration_minutes, buffer_minutes, timezone) do
    # Convert start/end times to DateTime in the given timezone
    # Generate 30-minute (or duration) slots
    # Exclude slots that overlap with busy times
    # Apply buffer time
    # Return list of available DateTime slots
  end

  defp fetch_google_busy_times(access_token, calendar_id, date) do
    # Call Google Calendar API
  end

  defp fetch_outlook_busy_times(access_token, date) do
    # Call Microsoft Graph API
  end
end
```

### Email Templates

**File:** `lib/clientt_crm_app/mailer/booking_emails.ex`

```elixir
defmodule ClienttCrmApp.Mailer.BookingEmails do
  import Swoosh.Email

  def booking_confirmation(booking) do
    new()
    |> to(booking.attendee_email)
    |> from({"Clientt", "noreply@clientt.com"})
    |> subject("Your demo is confirmed!")
    |> html_body("""
    <h1>Demo Confirmed</h1>
    <p>Hi #{booking.attendee_name},</p>
    <p>Your demo is scheduled for:</p>
    <ul>
      <li><strong>Date:</strong> #{format_date(booking.scheduled_at)}</li>
      <li><strong>Time:</strong> #{format_time(booking.scheduled_at, booking.timezone)}</li>
      <li><strong>Timezone:</strong> #{booking.timezone}</li>
      <li><strong>Duration:</strong> #{booking.duration_minutes} minutes</li>
    </ul>
    #{if booking.meeting_url do
      "<p><a href='#{booking.meeting_url}'>Join Meeting</a></p>"
    end}
    <p><a href='#{calendar_file_url(booking)}'>Add to Calendar</a></p>
    """)
    |> text_body("""
    Demo Confirmed

    Hi #{booking.attendee_name},

    Your demo is scheduled for:
    - Date: #{format_date(booking.scheduled_at)}
    - Time: #{format_time(booking.scheduled_at, booking.timezone)}
    - Timezone: #{booking.timezone}
    - Duration: #{booking.duration_minutes} minutes

    #{booking.meeting_url || ""}

    Add to Calendar: #{calendar_file_url(booking)}
    """)
  end

  def booking_reminder(booking) do
    # Similar structure for reminders
  end

  defp format_date(datetime) do
    # Format date nicely
  end

  defp format_time(datetime, timezone) do
    # Format time in the given timezone
  end

  defp calendar_file_url(booking) do
    # Generate .ics file URL
  end
end
```

## Configuration

Add to `config/config.exs`:

```elixir
config :clientt_crm_app,
  google_client_id: System.get_env("GOOGLE_CLIENT_ID"),
  google_client_secret: System.get_env("GOOGLE_CLIENT_SECRET"),
  outlook_client_id: System.get_env("OUTLOOK_CLIENT_ID"),
  outlook_client_secret: System.get_env("OUTLOOK_CLIENT_SECRET")
```

Add to `.env` (not committed):
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
```

## Testing

### Unit Tests
- Availability calculation logic
- Time slot generation
- Timezone conversions
- Overlap detection

### Integration Tests
- OAuth flows (use mocks)
- Calendar event creation
- Free/busy fetching
- Email sending

### E2E Tests (Playwright)
- Complete booking flow
- Calendar integration connection
- Availability settings update
- Booking confirmation

## Security Considerations

1. **Token Encryption**
   - Encrypt access/refresh tokens before storing
   - Use Cloak or similar library

2. **OAuth Security**
   - Validate redirect URIs
   - Use PKCE for additional security
   - Store state parameter to prevent CSRF

3. **Rate Limiting**
   - Limit calendar API calls
   - Cache free/busy data (5-15 min TTL)

4. **Data Privacy**
   - Only request necessary calendar scopes
   - Allow users to disconnect integration
   - Clear tokens on disconnect

## Next Steps

1. Implement base availability management
2. Build booking widget UI
3. Add Google Calendar OAuth + sync
4. Add Outlook Calendar OAuth + sync
5. Implement email confirmations
6. Test thoroughly with multiple timezones
7. Add booking management (reschedule, cancel)

---

**Status:** Detailed spec complete
**Dependencies:** Tracks 2 & 3
**Estimated Time:** 2-3 weeks
