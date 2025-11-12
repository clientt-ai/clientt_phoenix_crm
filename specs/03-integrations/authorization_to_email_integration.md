# Integration: Authorization to Email Service

**Type**: event-driven
**Status**: approved
**Last Updated**: 2025-11-11

## Purpose

The Authorization domain sends transactional emails for invitation workflows, role changes, and authorization notifications via the Email Service. This integration is asynchronous and one-way (Authorization → Email).

## Integration Pattern

**Pattern**: Event-Driven (Pub/Sub)
- Authorization domain publishes events
- Email service subscribes to events and sends emails
- No synchronous dependencies (fire-and-forget with retries)

## Domain Responsibilities

### Authorization Domain (Source)
**Responsibilities**:
- Publish authorization events (invitation_sent, role_changed, etc.)
- Provide email context data (recipient, company name, role, etc.)
- Track invitation status (pending, accepted, etc.)

**Publishes**:
- invitation_sent
- invitation_accepted
- role_changed
- user_removed
- team_member_added

### Email Service (Target)
**Responsibilities**:
- Send transactional emails via SMTP/SendGrid/etc.
- Render email templates
- Track email delivery status
- Handle bounce/failure notifications

**Consumes**:
- Authorization events
- Email template data

---

## Event Contract

### Event: `authorization.invitation_sent`

**When**: Admin or manager invites a user to join company
**Payload**:
```json
{
  "event_type": "authorization.invitation_sent",
  "occurred_at": "2025-01-15T10:00:00Z",
  "aggregate_id": "invitation-uuid",
  "data": {
    "invitation_id": "invitation-uuid",
    "email": "newuser@example.com",
    "company_id": "company-uuid",
    "company_name": "Acme Corp",
    "company_slug": "acme-corp",
    "invited_by_authz_user_id": "inviter-authz-uuid",
    "inviter_email": "admin@acme.com",
    "inviter_name": "Admin User",
    "role": "user",
    "team_id": "team-uuid",
    "team_name": "Engineering",
    "team_role": "team_member",
    "token": "secure-invitation-token",
    "expires_at": "2025-01-22T10:00:00Z",
    "message": "Welcome to our team!",
    "accept_url": "https://app.clienttcrm.com/invitations/accept?token=..."
  }
}
```

**Email Template**: `invitation_to_company.html`
**Subject**: `You've been invited to join {{company_name}} on ClienttCRM`

**Email Content**:
```html
<h1>You're Invited!</h1>
<p>Hi there,</p>
<p>
  <strong>{{inviter_name}}</strong> ({{inviter_email}}) has invited you to join
  <strong>{{company_name}}</strong> as a <strong>{{role}}</strong>.
</p>

{{#if team_name}}
<p>You'll be joining the <strong>{{team_name}}</strong> team.</p>
{{/if}}

{{#if message}}
<p><em>"{{message}}"</em></p>
{{/if}}

<p>
  <a href="{{accept_url}}" style="...">Accept Invitation</a>
</p>

<p><small>This invitation expires in 7 days ({{expires_at}}).</small></p>
```

---

### Event: `authorization.invitation_accepted`

**When**: User accepts invitation and joins company
**Payload**:
```json
{
  "event_type": "authorization.invitation_accepted",
  "occurred_at": "2025-01-15T11:00:00Z",
  "aggregate_id": "invitation-uuid",
  "data": {
    "invitation_id": "invitation-uuid",
    "authz_user_id": "new-authz-user-uuid",
    "email": "newuser@example.com",
    "company_id": "company-uuid",
    "company_name": "Acme Corp",
    "invited_by_authz_user_id": "inviter-authz-uuid",
    "inviter_email": "admin@acme.com",
    "role": "user",
    "team_name": "Engineering"
  }
}
```

**Email Template**: `invitation_accepted_notification.html`
**Recipient**: Inviter (admin@acme.com)
**Subject**: `{{email}} has joined {{company_name}}`

**Email Content**:
```html
<h1>Invitation Accepted</h1>
<p>Hi {{inviter_name}},</p>
<p>
  Good news! <strong>{{email}}</strong> has accepted your invitation
  and joined <strong>{{company_name}}</strong> as a <strong>{{role}}</strong>.
</p>

{{#if team_name}}
<p>They've been added to the <strong>{{team_name}}</strong> team.</p>
{{/if}}

<p>
  <a href="https://app.clienttcrm.com/companies/{{company_slug}}/members">
    View Company Members
  </a>
</p>
```

---

### Event: `authorization.role_changed`

**When**: Admin changes a user's role
**Payload**:
```json
{
  "event_type": "authorization.role_changed",
  "occurred_at": "2025-01-15T12:00:00Z",
  "aggregate_id": "authz-user-uuid",
  "data": {
    "authz_user_id": "authz-user-uuid",
    "email": "user@acme.com",
    "company_id": "company-uuid",
    "company_name": "Acme Corp",
    "old_role": "user",
    "new_role": "manager",
    "changed_by_authz_user_id": "admin-authz-uuid",
    "changed_by_email": "admin@acme.com"
  }
}
```

**Email Template**: `role_changed_notification.html`
**Recipient**: User whose role changed (user@acme.com)
**Subject**: `Your role has been updated in {{company_name}}`

**Email Content**:
```html
<h1>Role Update</h1>
<p>Hi there,</p>
<p>
  Your role in <strong>{{company_name}}</strong> has been changed from
  <strong>{{old_role}}</strong> to <strong>{{new_role}}</strong>.
</p>

<p>
  {{#if new_role == "admin"}}
  You now have full administrative access to the company.
  {{else if new_role == "manager"}}
  You can now manage teams and invite users.
  {{else}}
  You have standard user access.
  {{/if}}
</p>

<p>Changed by: <strong>{{changed_by_email}}</strong></p>

<p>
  <a href="https://app.clienttcrm.com/companies/{{company_slug}}">
    Go to Dashboard
  </a>
</p>
```

---

### Event: `authorization.user_removed`

**When**: Admin removes a user from company
**Payload**:
```json
{
  "event_type": "authorization.user_removed",
  "occurred_at": "2025-01-15T13:00:00Z",
  "aggregate_id": "authz-user-uuid",
  "data": {
    "authz_user_id": "authz-user-uuid",
    "email": "user@acme.com",
    "company_id": "company-uuid",
    "company_name": "Acme Corp",
    "removed_by_authz_user_id": "admin-authz-uuid",
    "removed_by_email": "admin@acme.com"
  }
}
```

**Email Template**: `user_removed_notification.html`
**Recipient**: Removed user (user@acme.com)
**Subject**: `You've been removed from {{company_name}}`

**Email Content**:
```html
<h1>Access Removed</h1>
<p>Hi there,</p>
<p>
  You've been removed from <strong>{{company_name}}</strong> and
  no longer have access to the company's CRM.
</p>

<p>
  If you have questions, please contact <strong>{{removed_by_email}}</strong>.
</p>

<p>
  {{#if has_other_companies}}
  You still have access to your other companies.
  <a href="https://app.clienttcrm.com/companies">View My Companies</a>
  {{/if}}
</p>
```

---

### Event: `authorization.team_member_added`

**When**: User is assigned to a team
**Payload**:
```json
{
  "event_type": "authorization.team_member_added",
  "occurred_at": "2025-01-15T14:00:00Z",
  "aggregate_id": "authz-user-uuid",
  "data": {
    "authz_user_id": "authz-user-uuid",
    "email": "user@acme.com",
    "company_id": "company-uuid",
    "company_name": "Acme Corp",
    "team_id": "team-uuid",
    "team_name": "Engineering",
    "team_role": "team_member",
    "assigned_by_email": "manager@acme.com"
  }
}
```

**Email Template**: `team_member_added_notification.html`
**Recipient**: User added to team (user@acme.com)
**Subject**: `You've been added to the {{team_name}} team`

**Email Content**:
```html
<h1>Welcome to {{team_name}}!</h1>
<p>Hi there,</p>
<p>
  You've been added to the <strong>{{team_name}}</strong> team in
  <strong>{{company_name}}</strong> as a <strong>{{team_role}}</strong>.
</p>

<p>
  <a href="https://app.clienttcrm.com/companies/{{company_slug}}/teams/{{team_id}}">
    View Team
  </a>
</p>
```

---

## Email Service Implementation

### Mailer Configuration

**Development**:
```elixir
# config/dev.exs
config :clientt_crm_app, ClienttCrmApp.Mailer,
  adapter: Swoosh.Adapters.Local

# Preview emails at http://localhost:4002/dev/mailbox
```

**Production**:
```elixir
# config/runtime.exs
config :clientt_crm_app, ClienttCrmApp.Mailer,
  adapter: Swoosh.Adapters.Sendgrid,
  api_key: System.get_env("SENDGRID_API_KEY")
```

---

### Event Handler

```elixir
defmodule ClienttCrmApp.Authorization.Handlers.EmailNotificationHandler do
  use GenServer

  def handle_event(%{event_type: "authorization.invitation_sent"} = event) do
    send_invitation_email(event.data)
  end

  def handle_event(%{event_type: "authorization.role_changed"} = event) do
    send_role_changed_email(event.data)
  end

  def handle_event(%{event_type: "authorization.user_removed"} = event) do
    send_user_removed_email(event.data)
  end

  # ... other handlers

  defp send_invitation_email(data) do
    ClienttCrmApp.Mailer.send_email(
      to: data.email,
      from: "noreply@clienttcrm.com",
      subject: "You've been invited to join #{data.company_name}",
      template: "invitation_to_company",
      assigns: data
    )
  end
end
```

---

## Error Handling

### Email Delivery Failure
**Scenario**: SMTP server unavailable or email bounces
**Response**: Retry with exponential backoff (3 attempts)
**Fallback**: Log failure, alert admin, store in dead letter queue

**Retry Policy**:
```elixir
retry_policy = [
  max_attempts: 3,
  base_delay: 1000,  # 1 second
  max_delay: 30_000  # 30 seconds
]
```

**Example Flow**:
1. Attempt 1: Immediate send → Fails (SMTP timeout)
2. Attempt 2: Wait 1 second → Fails
3. Attempt 3: Wait 4 seconds → Fails
4. Give up → Log error → Store in dead letter queue

---

### Invalid Email Address
**Scenario**: Email address is malformed or doesn't exist
**Response**: Log validation error, mark invitation as failed
**Action**: Notify inviter that email address is invalid

---

### Unsubscribed User
**Scenario**: User has unsubscribed from transactional emails (future)
**Response**: Skip sending, log event
**Exception**: Critical security emails (role changes) always sent

---

## Idempotency

### Duplicate Event Handling
**Challenge**: Same event published multiple times (network retries)
**Solution**: Event ID-based deduplication

**Implementation**:
```elixir
defmodule EmailDeduplicator do
  def already_processed?(event_id) do
    # Check Redis cache or database
    Cache.get("email_sent:#{event_id}") != nil
  end

  def mark_processed(event_id) do
    # Store event ID with TTL (e.g., 24 hours)
    Cache.put("email_sent:#{event_id}", true, ttl: 86_400)
  end
end

def handle_event(event) do
  if EmailDeduplicator.already_processed?(event.id) do
    Logger.info("Skipping duplicate email event: #{event.id}")
    :ok
  else
    send_email(event.data)
    EmailDeduplicator.mark_processed(event.id)
  end
end
```

---

## Rate Limiting

**Per User**: Max 10 emails per hour
**Per Company**: Max 50 emails per hour
**Global**: Max 1000 emails per hour

**Enforcement**:
```elixir
defmodule EmailRateLimiter do
  def check_rate_limit(email, company_id) do
    user_count = count_emails_sent(email, last_hour: true)
    company_count = count_emails_sent(company_id, last_hour: true)

    cond do
      user_count >= 10 ->
        {:error, "Rate limit exceeded for user"}

      company_count >= 50 ->
        {:error, "Rate limit exceeded for company"}

      true ->
        :ok
    end
  end
end
```

---

## Email Templates

### Template Structure
```
lib/clientt_crm_app_web/emails/templates/
├── invitation_to_company.html.heex
├── invitation_accepted_notification.html.heex
├── role_changed_notification.html.heex
├── user_removed_notification.html.heex
└── team_member_added_notification.html.heex
```

### Template Example (HEEx)
```heex
<!-- invitation_to_company.html.heex -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Invitation to <%= @company_name %></title>
  </head>
  <body>
    <h1>You're Invited!</h1>
    <p>Hi there,</p>
    <p>
      <strong><%= @inviter_name %></strong> has invited you to join
      <strong><%= @company_name %></strong> as a <strong><%= @role %></strong>.
    </p>

    <%= if @team_name do %>
      <p>You'll be joining the <strong><%= @team_name %></strong> team.</p>
    <% end %>

    <%= if @message do %>
      <p><em>"<%= @message %>"</em></p>
    <% end %>

    <p>
      <a href="<%= @accept_url %>" style="background: #0066CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Accept Invitation
      </a>
    </p>

    <p style="color: #666; font-size: 14px;">
      This invitation expires on <%= Calendar.strftime(@expires_at, "%B %d, %Y at %I:%M %p %Z") %>.
    </p>
  </body>
</html>
```

---

## Testing Requirements

### Unit Tests
- [ ] Event handler calls mailer with correct data
- [ ] Email templates render correctly with all variables
- [ ] Rate limiting prevents spam
- [ ] Deduplication prevents duplicate emails

### Integration Tests
- [ ] End-to-end: Invitation sent → Email received
- [ ] Email delivery failure triggers retry
- [ ] Invalid email address handled gracefully

### Manual Testing
- [ ] Preview emails in /dev/mailbox (development)
- [ ] Send test invitations
- [ ] Verify email formatting across clients (Gmail, Outlook, etc.)

---

## Performance Considerations

- **Async Processing**: Emails sent via background job (Oban)
- **Batch Processing**: Group multiple emails when possible
- **Template Caching**: Compile templates once, reuse
- **Email Send Time**: < 100ms to queue, actual send is async

---

## Monitoring

### Metrics to Track
- Email send rate (per minute/hour)
- Email delivery success rate
- Email bounce rate
- Average delivery time
- Template rendering errors

### Alerts
- Alert if delivery success rate < 95%
- Alert if bounce rate > 5%
- Alert if rate limit frequently hit

---

## Compliance

### CAN-SPAM (US)
- Include unsubscribe link (transactional exemption applies)
- Include physical address in footer
- Accurate subject lines

### GDPR (EU)
- Transactional emails are legitimate interest
- Users can opt out of non-critical notifications
- Store consent for marketing emails (future)

---

## Future Enhancements

### FE-1: Email Preferences
- Users can opt out of role change notifications
- Users can choose digest vs real-time
- Company admins control notification types

### FE-2: Email Analytics
- Track open rates
- Track click-through rates
- A/B test subject lines

### FE-3: Localization
- Support multiple languages
- Detect user's preferred language
- Translate templates dynamically

---

## Related Specifications

- Feature: [user_management.feature.md](../specs/01-domains/authorization/features/user_management.feature.md)
- Resource: [invitation.md](../specs/01-domains/authorization/resources/invitation.md)
- Domain: [authorization](../specs/01-domains/authorization/)

---

## References

- Phoenix Mailer: https://hexdocs.pm/phoenix/Phoenix.Mailer.html
- Swoosh: https://hexdocs.pm/swoosh
- Oban: https://hexdocs.pm/oban (background job processing)
