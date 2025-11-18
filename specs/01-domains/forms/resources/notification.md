# Resource: Notification

**Domain**: Forms (but could be shared across domains in future)
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

## Purpose

Represents an in-app notification for form-related events (new submissions, status changes, etc.). Displayed in the notification bell icon in the application header. Supports unread status tracking and provides a link to the related resource. Works in conjunction with email notifications (configured via user preferences).

## Attributes

| Attribute | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| id | uuid | Yes | - | Unique identifier |
| user_id | uuid | Yes | valid AuthzUser id | Recipient user reference |
| type | string | Yes | max: 50 | Notification type (e.g., "new_submission") |
| title | string | Yes | min: 1, max: 100 | Notification headline |
| message | string | No | max: 500 | Detailed notification text |
| link | string | No | max: 500, valid URL path | Path to related resource |
| metadata | map | No | valid JSONB | Additional context data |
| read_at | utc_datetime_usec | No | - | When user marked as read (null = unread) |
| created_at | utc_datetime_usec | Yes | - | Notification creation timestamp |

## Notification Types (Forms Domain)

| Type | Trigger Event | Title Example | Link |
|------|---------------|---------------|------|
| new_submission | forms.submission_created | "New form submission" | `/forms/{form_id}/submissions/{submission_id}` |
| submission_status_changed | forms.submission_status_changed | "Lead status updated to Qualified" | `/forms/{form_id}/submissions/{submission_id}` |
| form_published | forms.form_published | "Form 'Contact Us' is now live" | `/forms/{form_id}` |
| form_archived | forms.form_archived | "Form 'Contact Us' has been archived" | `/forms/{form_id}` |
| daily_digest | Scheduled job (daily) | "5 new submissions today" | `/dashboard` |

## Attribute Details

### metadata (JSONB)

Additional context for rendering notifications:

```elixir
# For new_submission type:
%{
  form_id: "uuid",
  form_name: "Contact Form",
  submission_id: "uuid",
  submitter_email: "john@example.com",
  submitter_name: "John Doe"
}

# For submission_status_changed type:
%{
  submission_id: "uuid",
  old_status: "new",
  new_status: "contacted",
  changed_by: "Jane Admin"
}

# For daily_digest type:
%{
  submissions_count: 5,
  new_count: 3,
  contacted_count: 2,
  forms_breakdown: [
    %{form_name: "Contact Us", count: 3},
    %{form_name: "Demo Request", count: 2}
  ]
}
```

### link (String)

Internal application path (not full URL):
- `/forms/{form_id}/submissions/{submission_id}` - View specific submission
- `/forms/{form_id}` - View form details
- `/dashboard` - Go to main dashboard

**Rendering**: Application prepends base URL when rendering links.

## Business Rules

### Invariants

- Each notification belongs to exactly one user
- Notifications are user-specific (no global notifications in MVP)
- Notifications are immutable once created (except read_at timestamp)
- Unread notifications have read_at = null
- Notifications are automatically created by event handlers (not manually)

### Validations

- **type**: 1-50 characters, typically follows pattern "domain.event_type"
- **title**: 1-100 characters, clear and actionable
- **message**: Optional, max 500 characters
- **link**: Must be valid internal path if provided
- **user_id**: Must reference valid authz_user

### Calculated Fields

- **is_read**: read_at IS NOT NULL
- **is_unread**: read_at IS NULL
- **time_ago**: Human-readable time since created_at ("2 hours ago", "3 days ago")

## State Transitions

```
[new] → unread → read
```

**States**:
- **unread**: read_at IS NULL (default state)
- **read**: read_at IS NOT NULL (user marked as read)

**Transitions**:
- `unread → read`: User clicks notification or marks as read
- No transition back to unread (one-way)

## Relationships

- **Belongs to**: AuthzUser (via user_id)

## Domain Events

### Published Events

- `notifications.notification_created`: Triggered when notification is created
  - Payload: {notification_id, user_id, type, title, created_at}
  - Consumers: WebSocket (push to connected users), Analytics

- `notifications.notification_read`: Triggered when notification is marked as read
  - Payload: {notification_id, user_id, read_at}
  - Consumers: Analytics

### Subscribed Events

Notifications are created in response to these events:

| Source Event | Notification Created |
|--------------|---------------------|
| forms.submission_created | new_submission (for all company users with notifications enabled) |
| forms.submission_status_changed | submission_status_changed (optional, for assigned user) |
| forms.form_published | form_published (for creator) |
| forms.form_archived | form_archived (for all company admins) |

## Access Patterns

### Queries

- **List notifications for user**: Filter by user_id, order by created_at DESC
- **Get unread count**: COUNT WHERE user_id = ? AND read_at IS NULL
- **Get unread notifications**: Filter by user_id AND read_at IS NULL, order by created_at DESC
- **Mark all as read**: Update all WHERE user_id = ? AND read_at IS NULL

### Common Operations

#### Create

**Required attributes**: user_id, type, title
**Optional attributes**: message, link, metadata

**Side effects**:
- Auto-set created_at to NOW()
- Publishes notifications.notification_created event
- **Pushes to user via WebSocket** if connected (real-time update)

**Authorization**: System only (not exposed via user-facing API)

**Note**: Notifications are created automatically by event handlers, not by users.

#### Read

**Available to**: User who owns the notification (user_id must match)
**Filtering**: Always filtered by user_id via Ash policy
**Ordering**: Default order by created_at DESC

#### Mark as Read

**Action**: Update read_at to NOW()

**Validations**:
- Can only mark own notifications as read
- Can only mark unread notifications (read_at IS NULL)

**Side effects**:
- Updates read_at timestamp
- Publishes notifications.notification_read event
- Decrements unread count in UI

**Authorization**: User can only mark their own notifications

#### Mark All as Read

**Action**: Batch update all unread notifications for user

**Process**:
1. Find all WHERE user_id = ? AND read_at IS NULL
2. Update read_at to NOW() for all
3. Publish batch event

**Authorization**: User can only mark their own notifications

#### Delete

**Action**: Hard delete notification from database

**Side effects**:
- Permanently removes notification
- Decrements total notification count

**Authorization**: User can only delete their own notifications

**Note**: Consider implementing auto-cleanup job to delete old notifications (e.g., >90 days)

## Notification Preferences

Users control notification delivery via user preferences (stored in authz_user or user_preferences table):

```elixir
# User notification preferences (separate from Notification resource)
%{
  notification_preference: "immediate",  # "immediate" | "daily" | "off"
  email_notifications: true,             # Send email in addition to in-app
  timezone: "America/New_York"           # For daily digest timing
}
```

### Preference Logic

**immediate** (default):
- In-app notification created instantly on event
- Email sent instantly via Swoosh
- User sees notification in bell icon immediately

**daily**:
- In-app notifications still created instantly
- Email sent ONCE per day with digest of all new notifications
- Digest sent at 9 AM user's timezone

**off**:
- In-app notifications still created (cannot disable in-app)
- No emails sent
- User can still view notifications in bell icon

## Notification Bell UI

### Header Component

```heex
<!-- Notification bell in app header -->
<div class="relative">
  <button class="relative" phx-click="toggle-notifications">
    <.icon name="hero-bell" class="w-6 h-6" />
    <%= if @unread_count > 0 do %>
      <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
        <%= @unread_count %>
      </span>
    <% end %>
  </button>

  <%= if @notifications_open do %>
    <div class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg">
      <div class="p-4 border-b flex justify-between">
        <h3 class="font-semibold">Notifications</h3>
        <button phx-click="mark-all-read" class="text-sm text-primary">
          Mark all as read
        </button>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <%= for notification <- @notifications do %>
          <a href={notification.link} class={"notification-item #{notification.is_read && "opacity-60"}"}>
            <div class="p-4 border-b hover:bg-gray-50">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-sm"><%= notification.title %></p>
                  <%= if notification.message do %>
                    <p class="text-xs text-gray-600 mt-1"><%= notification.message %></p>
                  <% end %>
                  <p class="text-xs text-gray-400 mt-1"><%= notification.time_ago %></p>
                </div>
                <%= unless notification.is_read do %>
                  <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                <% end %>
              </div>
            </div>
          </a>
        <% end %>
      </div>

      <%= if length(@notifications) == 0 do %>
        <div class="p-8 text-center text-gray-500">
          <.icon name="hero-bell-slash" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      <% end %>
    </div>
  <% end %>
</div>
```

## Email Notifications

### Immediate Email Template

**Subject**: "New form submission - {form_name}"

**Body**:
```
Hi {user_name},

You have a new form submission for "{form_name}":

Submitter: {submitter_name} ({submitter_email})
Submitted: {submitted_at}

[View Submission →]

---
To manage your notification preferences, visit Settings.
```

### Daily Digest Email Template

**Subject**: "{count} new submissions today"

**Body**:
```
Hi {user_name},

Here's your daily digest for {date}:

📋 5 new submissions across 2 forms

Contact Form: 3 submissions
  - John Doe (john@example.com) - 10:23 AM
  - Jane Smith (jane@example.com) - 2:45 PM
  - Bob Johnson (bob@example.com) - 4:12 PM

Demo Request: 2 submissions
  - Alice Brown (alice@example.com) - 11:30 AM
  - Charlie Davis (charlie@example.com) - 3:15 PM

[View All Submissions →]

---
To manage your notification preferences, visit Settings.
```

## Event Handlers

### New Submission Handler

```elixir
defmodule ClienttCrmApp.Forms.EventHandlers.SubmissionCreatedHandler do
  use Ash.Notifier

  def notify(%{action: :create, resource: Submission, data: submission}) do
    # Get all company users
    company_users = get_company_users(submission.tenant_id)

    Enum.each(company_users, fn authz_user ->
      # Check user's notification preference
      case authz_user.notification_preference do
        "immediate" ->
          create_in_app_notification(authz_user, submission)
          send_immediate_email(authz_user, submission)

        "daily" ->
          create_in_app_notification(authz_user, submission)
          # Email handled by daily digest job

        "off" ->
          create_in_app_notification(authz_user, submission)
          # No email sent
      end
    end)

    :ok
  end

  defp create_in_app_notification(user, submission) do
    Notifications.create_notification!(%{
      user_id: user.id,
      type: "new_submission",
      title: "New form submission",
      message: "#{submission.form.name} - #{submission.submitter_email}",
      link: "/forms/#{submission.form_id}/submissions/#{submission.id}",
      metadata: %{
        form_id: submission.form_id,
        form_name: submission.form.name,
        submission_id: submission.id,
        submitter_email: submission.submitter_email
      }
    })
  end
end
```

## Security & Authorization

### Policies

**Read**:
- Users can only read their own notifications (user_id must match)
- Filtering: Always filtered by user_id via Ash policy

**Create**:
- System only (event handlers)
- Not exposed via user-facing API

**Update** (mark as read):
- Users can only update their own notifications

**Delete**:
- Users can only delete their own notifications

### Multi-Tenancy

Notifications are user-scoped, not company-scoped (user can belong to multiple companies):

```elixir
# Ash policy example
policy action_type(:read) do
  authorize_if actor_attribute_equals(:id, :user_id)
end
```

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES authz_users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message VARCHAR(500),
  link VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX notifications_user_id_index ON notifications(user_id);
CREATE INDEX notifications_read_at_index ON notifications(user_id, read_at);
CREATE INDEX notifications_created_at_index ON notifications(created_at DESC);
CREATE INDEX notifications_type_index ON notifications(type);

-- Partial index for unread notifications (most common query)
CREATE INDEX notifications_unread_index ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;
```

## Example Usage

### Creating a Notification (System)

```elixir
# In event handler
notification = Notifications.create_notification!(%{
  user_id: authz_user.id,
  type: "new_submission",
  title: "New form submission",
  message: "Contact Form - john@example.com",
  link: "/forms/#{form_id}/submissions/#{submission_id}",
  metadata: %{
    form_id: form_id,
    submission_id: submission_id,
    submitter_email: "john@example.com"
  }
})
```

### Marking as Read

```elixir
notification
|> Notifications.mark_as_read!()
# Sets read_at to NOW()
```

### Getting Unread Count

```elixir
count = Notifications.unread_count_for_user(user_id)
# Returns integer
```

### Listing Unread Notifications

```elixir
notifications = Notifications.list_unread_for_user(user_id)
# Returns list ordered by created_at DESC
```

## Testing Checklist

- [ ] Create notification (should succeed)
- [ ] Create notification for invalid user (should fail)
- [ ] Read own notification (should succeed)
- [ ] Read other user's notification (should fail)
- [ ] Mark own notification as read (should succeed)
- [ ] Mark other user's notification as read (should fail)
- [ ] Mark all as read (should update all unread)
- [ ] Delete own notification (should succeed)
- [ ] Delete other user's notification (should fail)
- [ ] Get unread count (should return correct count)
- [ ] List unread notifications (should filter correctly)
- [ ] Event handler: Create notification on new submission
- [ ] Email: Send immediate email for "immediate" preference
- [ ] Email: Skip email for "off" preference

## Performance Considerations

- **Indexes**: user_id and read_at indexed for fast queries
- **Partial Index**: Unread notifications index for most common query
- **Pagination**: List views should paginate at 50 notifications per page
- **Cleanup Job**: Auto-delete notifications older than 90 days (future)
- **WebSocket**: Real-time push for new notifications (reduce polling)

## Future Enhancements (Phase 3+)

- **Notification Categories**: Group by type (submissions, status changes, etc.)
- **Notification Settings per Type**: Allow users to disable specific types
- **Push Notifications**: Browser push notifications for desktop/mobile
- **Notification Templates**: Admin-configurable templates
- **Bulk Actions**: Archive all, delete all read, etc.
- **Notification Sounds**: Optional sound alerts for new notifications
- **Cross-Domain Notifications**: Support notifications from other domains (not just Forms)

## Related Specifications

- Submission resource: `./submission.md`
- Form resource: `./form.md`
- User preferences: `../features/user_settings.feature.md`
- Email notifications: `../features/email_notifications.feature.md`
