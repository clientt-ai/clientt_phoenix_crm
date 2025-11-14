# Resource: CalendarBooking

**Domain**: Forms
**Status**: draft
**Last Updated**: 2025-11-14

## Purpose

Represents a scheduled demo or meeting created through form submission or chatbot interaction. Manages booking lifecycle from pending creation through completion, coordinates with external calendar providers via Integrations domain.

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| company_id | uuid | Yes | valid company | Company owning this booking |
| form_submission_id | uuid | No | valid submission | Associated form submission (if from form) |
| chatbot_lead_id | uuid | No | valid lead | Associated chatbot lead (if from chatbot) |
| calendar_connection_id | uuid | Yes | valid connection, active | External calendar connection |
| attendee_email | string | Yes | valid email | Attendee's email address |
| attendee_first_name | string | Yes | 1-100 chars | Attendee's first name |
| attendee_last_name | string | Yes | 1-100 chars | Attendee's last name |
| attendee_company | string | No | max 255 chars | Attendee's company name |
| attendee_phone | string | No | valid phone | Attendee's phone number |
| start_time | utc_datetime | Yes | future datetime | Meeting start time |
| end_time | utc_datetime | Yes | after start_time | Meeting end time |
| timezone | string | Yes | valid IANA timezone | Attendee's timezone |
| title | string | Yes | 1-255 chars | Meeting title |
| description | text | No | max 2000 chars | Meeting description/notes |
| meeting_url | string | No | valid URL | Video meeting link (if applicable) |
| external_event_id | string | No | - | Calendar provider's event ID |
| status | atom | Yes | enum: [:pending, :confirmed, :cancelled, :completed, :no_show, :failed] | Booking state |
| cancellation_reason | text | No | max 500 chars | Why booking was cancelled |
| custom_fields | map | No | valid JSON | Additional booking data |
| confirmation_sent_at | utc_datetime | No | - | When confirmation email sent |
| reminder_sent_at | utc_datetime | No | - | When reminder email sent |
| completed_at | utc_datetime | No | - | When meeting occurred |
| created_at | utc_datetime | Yes | - | Creation timestamp |
| updated_at | utc_datetime | Yes | - | Last update timestamp |

### Custom Fields Map Structure

```elixir
%{
  # Pre-booking questions
  referral_source: "Google Search",
  company_size: "10-50",
  role: "Marketing Manager",

  # Meeting preferences
  meeting_type: "product_demo",
  specific_interests: ["Feature A", "Integration B"],

  # Internal notes (not visible to attendee)
  lead_score: 85,
  assigned_sales_rep: "uuid",
  qualifying_notes: "High intent, budget confirmed"
}
```

## Business Rules

### Invariants

- Must have either form_submission_id OR chatbot_lead_id (not both, not neither)
- start_time must be in the future at creation time
- end_time must be after start_time
- Cannot have overlapping bookings for same calendar_connection_id
- status cannot transition from terminal states (:completed, :cancelled, :failed)
- external_event_id must be set when status becomes :confirmed
- Calendar connection must be active and connected

### Validations

- **attendee_email**: Required, valid RFC 5322 email format
- **attendee_first_name**: Required, 1-100 characters, non-blank
- **attendee_last_name**: Required, 1-100 characters, non-blank
- **start_time**: Required, must be at least 1 hour in future
- **end_time**: Required, must be after start_time, max 8 hours duration
- **timezone**: Required, valid IANA timezone (e.g., "America/New_York")
- **title**: Required, 1-255 characters
- **status**: Must be valid enum value
- **cancellation_reason**: Required when status is :cancelled

### Calculated Fields

- **duration_minutes**: `DateTime.diff(end_time, start_time, :minute)`
- **is_upcoming**: `DateTime.compare(start_time, DateTime.utc_now()) == :gt`
- **time_until_meeting**: Minutes until start_time
- **attendee_full_name**: `"#{attendee_first_name} #{attendee_last_name}"`

## State Transitions

```
pending → confirmed → completed
   ↓          ↓
   ↓      cancelled
   ↓          ↓
   → failed ←→ no_show
```

**Valid Transitions**:

- `pending → confirmed`: When external calendar event created successfully
  - Sets `external_event_id`
  - Triggers confirmation email
  - Sets `confirmation_sent_at`

- `pending → failed`: When calendar sync fails after retries
  - Sets `status` to :failed
  - Logs error reason
  - Notifies attendee of failure

- `confirmed → cancelled`: When either party cancels
  - Requires `cancellation_reason`
  - Deletes external calendar event
  - Sends cancellation notification

- `confirmed → completed`: Auto-transition 1 hour after end_time
  - Sets `completed_at` to actual end_time
  - Triggers post-meeting workflow

- `confirmed → no_show`: Manually marked by host
  - Sets `completed_at` to start_time
  - Does not send follow-up

- `failed → pending`: When retry is attempted
  - Clears previous error
  - Attempts calendar sync again

**Invalid Transitions**:

- From :completed to any other state (terminal)
- From :cancelled to :confirmed (must create new booking)
- From :failed directly to :confirmed (must go through pending)

## Relationships

### Belongs To
- **Company** (authorization.companies) - many-to-one
- **FormSubmission** (forms.form_submissions) - optional many-to-one
- **ChatbotLead** (forms.chatbot_leads) - optional many-to-one
- **CalendarConnection** (integrations.calendar_connections) - many-to-one

### Validations on Relationships
- Either form_submission_id or chatbot_lead_id must be present (XOR constraint)
- calendar_connection_id must reference an active, connected integration
- company_id must match the company of the associated form_submission or chatbot_lead

## Domain Events

### Published Events

- `forms.booking_requested`: Triggered on create (status: pending)
  - Payload: {booking_id, attendee_email, start_time, end_time, calendar_connection_id}
  - Consumers: Integrations domain (creates external event)

- `forms.booking_confirmed`: Triggered when external event created
  - Payload: {booking_id, external_event_id, attendee_email, confirmation_sent}
  - Consumers: Email service, Analytics

- `forms.booking_cancelled`: Triggered on cancellation
  - Payload: {booking_id, cancelled_by, cancellation_reason, refund_needed}
  - Consumers: Email service, Analytics

- `forms.booking_completed`: Triggered after meeting ends
  - Payload: {booking_id, completed_at, attended}
  - Consumers: CRM (future), Analytics

- `forms.booking_no_show`: Triggered when attendee doesn't join
  - Payload: {booking_id, scheduled_time}
  - Consumers: CRM (future), Analytics

- `forms.booking_failed`: Triggered when calendar sync fails
  - Payload: {booking_id, error_code, error_message}
  - Consumers: Email service (notify attendee), Support alerts

### Subscribed Events

- `integrations.booking_synced`: Updates status to :confirmed
  - Sets external_event_id
  - Sends confirmation email

- `integrations.booking_failed`: Updates status to :failed
  - Logs error details
  - Notifies attendee

- `integrations.calendar_disconnected`: Marks pending bookings as failed
  - Cannot complete booking without calendar connection

## Access Patterns

### Queries

```elixir
# List all bookings for company
CalendarBookings.list_bookings(company_id)

# Get upcoming bookings
CalendarBookings.list_upcoming_bookings(company_id)

# Get bookings by attendee email
CalendarBookings.get_by_attendee_email(company_id, email)

# Get bookings for date range
CalendarBookings.list_bookings_for_range(company_id, start_date, end_date)

# Get bookings by status
CalendarBookings.list_by_status(company_id, :confirmed)

# Get bookings for specific calendar connection
CalendarBookings.list_for_calendar(calendar_connection_id)

# Get no-show bookings
CalendarBookings.list_no_shows(company_id)

# Check for booking conflicts
CalendarBookings.has_conflict?(calendar_connection_id, start_time, end_time)
```

### Common Operations

**Create**:
```elixir
CalendarBookings.create_booking(%{
  company_id: uuid,
  form_submission_id: uuid,
  calendar_connection_id: uuid,
  attendee_email: "john@example.com",
  attendee_first_name: "John",
  attendee_last_name: "Doe",
  attendee_company: "Acme Inc",
  start_time: ~U[2025-11-20 14:00:00Z],
  end_time: ~U[2025-11-20 14:30:00Z],
  timezone: "America/New_York",
  title: "Product Demo with John Doe",
  description: "Discussing pricing and features",
  custom_fields: %{
    referral_source: "Website Form",
    company_size: "50-100"
  }
})
# Publishes: forms.booking_requested
# Returns: {:ok, %CalendarBooking{status: :pending}}
```

**Confirm** (called by Integrations domain):
```elixir
CalendarBookings.confirm_booking(booking_id, external_event_id: "google_123")
# Updates: status to :confirmed, external_event_id
# Sets: confirmation_sent_at
# Publishes: forms.booking_confirmed
# Returns: {:ok, %CalendarBooking{status: :confirmed}}
```

**Cancel**:
```elixir
CalendarBookings.cancel_booking(booking_id, reason: "Attendee requested reschedule")
# Updates: status to :cancelled, cancellation_reason
# Publishes: forms.booking_cancelled
# Returns: {:ok, %CalendarBooking{status: :cancelled}}
```

**Mark No-Show**:
```elixir
CalendarBookings.mark_no_show(booking_id)
# Updates: status to :no_show
# Publishes: forms.booking_no_show
# Returns: {:ok, %CalendarBooking{status: :no_show}}
```

**Auto-Complete** (background job):
```elixir
CalendarBookings.complete_past_bookings()
# Finds confirmed bookings with end_time < now - 1 hour
# Updates status to :completed
# Publishes: forms.booking_completed for each
```

## Authorization Policy

See: [Booking Authorization Policy](../policies/booking_authorization.md)

**Summary**:
- Company members can view all bookings in their company
- Only booking creator and company admins can cancel
- Public cannot access booking details
- Cross-company access denied

## Notifications

### Confirmation Email (Sent on Confirmed)
**To**: attendee_email
**Subject**: "Your Meeting is Confirmed - [title]"
**Content**:
- Meeting details (date, time, timezone)
- Calendar file attachment (.ics)
- Add to Calendar links (Google, Outlook, iCal)
- Meeting URL (if video call)
- Cancellation link

### Reminder Email (Sent 24 hours before)
**To**: attendee_email
**Subject**: "Reminder: Your Meeting Tomorrow - [title]"
**Content**:
- Meeting details
- Meeting URL
- Preparation notes

### Cancellation Email (Sent on Cancelled)
**To**: attendee_email
**Subject**: "Meeting Cancelled - [title]"
**Content**:
- Cancellation reason
- Rebooking link (if applicable)
- Contact information

## Performance Considerations

- **Conflict Checking**: Index on (calendar_connection_id, start_time, end_time) for overlap queries
- **Upcoming Bookings**: Index on (company_id, start_time) for efficient date range queries
- **Auto-Completion**: Background job runs every hour to mark completed meetings
- **Attendee Lookup**: Index on (company_id, attendee_email) for duplicate detection

## Analytics & Reporting

**Key Metrics**:
- Total bookings created
- Booking confirmation rate (confirmed / requested)
- Cancellation rate
- No-show rate
- Average booking duration
- Most popular time slots
- Bookings by source (form vs chatbot)
- Time from booking to meeting

## Testing Scenarios

### Unit Tests
- [ ] Create booking with valid attributes
- [ ] Cannot create booking without form_submission_id or chatbot_lead_id
- [ ] Cannot create booking with both form_submission_id and chatbot_lead_id
- [ ] start_time must be in future
- [ ] end_time must be after start_time
- [ ] Status transitions follow state machine
- [ ] Timezone validation accepts IANA timezones
- [ ] Email validation rejects invalid formats

### Integration Tests
- [ ] Creating booking publishes booking_requested event
- [ ] Confirming booking sends confirmation email
- [ ] Cancelling booking deletes external event
- [ ] Conflict detection prevents overlapping bookings
- [ ] Auto-completion job marks past bookings as completed
- [ ] Failed bookings retry calendar sync

---

**Related Resources**:
- [FormSubmission](./form_submission.md) - Form submissions that trigger bookings
- [ChatbotLead](./chatbot_lead.md) - Chatbot leads that request bookings
- [CalendarConnection](../../integrations/resources/calendar_connection.md) - External calendar connections

**Related Features**:
- [Calendar Booking Feature](../features/calendar_booking.feature.md)
- [Calendar Sync Feature](../../integrations/features/calendar_sync.feature.md)

**Related Integrations**:
- [Forms to Integrations](../../../03-integrations/forms_to_integrations_integration.md)
