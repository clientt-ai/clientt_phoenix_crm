# Policy: Row-Level Security (Multi-Tenancy)

**Domain**: Forms
**Status**: approved
**Last Updated**: 2025-11-16
**MVP Phase**: 2

## Purpose

Enforces company-scoped data isolation for all Forms domain resources. Ensures users can only access forms, fields, and submissions belonging to their current company. Prevents cross-company data leakage through Ash framework-level policies.

## Scope

**Resources Protected**:
- Form (via company_id)
- FormField (via form.company_id)
- Submission (via company_id)
- Notification (via user_id)

**Exclusions**:
- Public form submission endpoint (no actor required, validates form ownership separately)

## Policy Rules

### Forms

#### Read Policy
```elixir
policy action_type(:read) do
  description "Users can read forms in their current company"

  # Company members can read all forms in their company
  authorize_if actor_attribute_equals(:company_id, :company_id)

  # Public access for published forms (embed endpoint)
  authorize_if expr(status == :published and is_nil(^actor))
end
```

#### Create Policy
```elixir
policy action_type(:create) do
  description "Admin and Manager can create forms in their company"

  # Must be admin or manager
  authorize_if actor_attribute_in(:role, [:admin, :manager])

  # Ensure company_id matches actor's company
  change set_attribute(:company_id, ^actor(:company_id))
end
```

#### Update Policy
```elixir
policy action_type(:update) do
  description "Admin and Manager can update draft forms in their company"

  # Must be admin or manager
  authorize_if actor_attribute_in(:role, [:admin, :manager])

  # Must belong to actor's company
  authorize_if actor_attribute_equals(:company_id, :company_id)

  # Can only update draft forms
  authorize_if expr(status == :draft)
end
```

#### Publish Policy
```elixir
policy action(:publish) do
  description "Admin and Manager can publish forms"

  authorize_if actor_attribute_in(:role, [:admin, :manager])
  authorize_if actor_attribute_equals(:company_id, :company_id)
end
```

#### Archive Policy
```elixir
policy action(:archive) do
  description "Only Admin can archive forms"

  authorize_if actor_attribute_equals(:role, :admin)
  authorize_if actor_attribute_equals(:company_id, :company_id)
end
```

#### Delete Policy
```elixir
policy action_type(:destroy) do
  description "Delete not allowed (use archive instead)"

  forbid_if always()
end
```

### FormFields

#### Read Policy
```elixir
policy action_type(:read) do
  description "Inherit access from parent form"

  # Company members can read fields if they can read the parent form
  authorize_if relates_to_actor_via(:form, :company_id, :company_id)

  # Public access for published forms
  authorize_if expr(form.status == :published and is_nil(^actor))
end
```

#### Create/Update/Delete Policy
```elixir
policy action_type([:create, :update, :destroy]) do
  description "Can only modify fields in draft forms they can access"

  # Must be admin or manager
  authorize_if actor_attribute_in(:role, [:admin, :manager])

  # Form must be in their company
  authorize_if relates_to_actor_via(:form, :company_id, :company_id)

  # Form must be draft
  authorize_if expr(form.status == :draft)
end
```

### Submissions

#### Read Policy
```elixir
policy action_type(:read) do
  description "Company members can read submissions in their company"

  authorize_if actor_attribute_equals(:company_id, :company_id)
end
```

#### Create Policy (Public)
```elixir
policy action(:create_public_submission) do
  description "Public submission - no actor required"

  # No authentication required
  authorize_if always()

  # Validation: Form must be published
  validate attribute(:form, matches(status: :published))

  # Auto-set company_id from form
  change load(:form)
  change set_attribute(:company_id, arg(:form).company_id)
end
```

#### Update Status Policy
```elixir
policy action(:update_status) do
  description "Admin and Manager can update submission status"

  authorize_if actor_attribute_in(:role, [:admin, :manager])
  authorize_if actor_attribute_equals(:company_id, :company_id)
end
```

#### Delete Policy
```elixir
policy action(:delete) do
  description "Admin and Manager can soft-delete submissions"

  authorize_if actor_attribute_in(:role, [:admin, :manager])
  authorize_if actor_attribute_equals(:company_id, :company_id)

  # Soft delete only (set deleted_at)
  change set_attribute(:deleted_at, &DateTime.utc_now/0)
end
```

### Notifications

#### Read Policy
```elixir
policy action_type(:read) do
  description "Users can only read their own notifications"

  # Match notification.user_id with actor's authz_user id
  authorize_if actor_attribute_equals(:id, :user_id)
end
```

#### Create Policy
```elixir
policy action_type(:create) do
  description "System only - not exposed to users"

  # Only allow via internal API (event handlers)
  authorize_if always()
end
```

#### Update Policy (Mark as Read)
```elixir
policy action(:mark_as_read) do
  description "Users can mark their own notifications as read"

  authorize_if actor_attribute_equals(:id, :user_id)
end
```

#### Delete Policy
```elixir
policy action_type(:destroy) do
  description "Users can delete their own notifications"

  authorize_if actor_attribute_equals(:id, :user_id)
end
```

## Session Context Requirements

All authenticated requests must include:

```elixir
%{
  current_authn_user: %User{id: "uuid"},           # Authentication identity
  current_company_id: "uuid",                      # Active company
  current_authz_user: %AuthzUser{                  # Authorization identity
    id: "uuid",
    authn_user_id: "uuid",
    company_id: "uuid",                            # Same as current_company_id
    role: :admin | :manager | :user
  }
}
```

## Testing Multi-Tenancy

### Test Scenarios

#### Scenario: Cannot read other company's forms
```elixir
test "user cannot read forms from other companies" do
  # Setup two companies
  company_a = create_company("Company A")
  company_b = create_company("Company B")

  # Create users in each company
  user_a = create_authz_user(company_a, role: :admin)
  user_b = create_authz_user(company_b, role: :admin)

  # User A creates a form
  form_a = create_form(company_a, created_by: user_a)

  # User B attempts to read User A's form
  assert {:error, %Ash.Error.Forbidden{}} =
    Forms.get_form(form_a.id, actor: user_b)
end
```

#### Scenario: Cannot update other company's submissions
```elixir
test "user cannot update submissions from other companies" do
  company_a = create_company("Company A")
  company_b = create_company("Company B")

  user_a = create_authz_user(company_a, role: :admin)
  user_b = create_authz_user(company_b, role: :admin)

  form_a = create_form(company_a)
  submission_a = create_submission(form_a)

  # User B attempts to update User A's submission
  assert {:error, %Ash.Error.Forbidden{}} =
    Forms.update_submission_status(
      submission_a.id,
      %{status: :contacted},
      actor: user_b
    )
end
```

#### Scenario: Cannot delete other company's forms
```elixir
test "user cannot archive forms from other companies" do
  company_a = create_company("Company A")
  company_b = create_company("Company B")

  user_a = create_authz_user(company_a, role: :admin)
  user_b = create_authz_user(company_b, role: :admin)

  form_a = create_form(company_a)

  # User B attempts to archive User A's form
  assert {:error, %Ash.Error.Forbidden{}} =
    Forms.archive_form(form_a.id, actor: user_b)
end
```

#### Scenario: Public submission works without actor
```elixir
test "public can submit to published form without authentication" do
  company = create_company("Company A")
  form = create_form(company, status: :published)
  add_field(form, type: :email, label: "Email", required: true)

  # No actor required
  submission = Forms.create_public_submission!(%{
    form_id: form.id,
    form_data: %{
      "field-1" => "john@example.com"
    }
  })

  assert submission.company_id == company.id
  assert submission.status == :new
end
```

#### Scenario: Cannot submit to other company's draft form
```elixir
test "cannot submit to draft form" do
  company = create_company("Company A")
  form = create_form(company, status: :draft)

  assert {:error, %Ash.Error.Invalid{}} =
    Forms.create_public_submission(%{
      form_id: form.id,
      form_data: %{"field-1" => "value"}
    })
end
```

## Database-Level Enforcement

While Ash policies are the primary enforcement mechanism, consider adding database-level constraints for defense in depth:

### Row-Level Security (PostgreSQL RLS)

```sql
-- Enable RLS on forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see forms from their company
CREATE POLICY forms_company_isolation ON forms
  FOR ALL
  TO authenticated_users
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Similar policies for submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY submissions_company_isolation ON submissions
  FOR ALL
  TO authenticated_users
  USING (company_id = current_setting('app.current_company_id')::uuid);
```

**Note**: PostgreSQL RLS is optional for MVP - Ash policies provide sufficient protection. Consider adding RLS in production for additional security layer.

## Audit Logging

All multi-tenancy policy violations should be logged:

```elixir
defmodule ClienttCrmApp.Forms.AuditLogger do
  def log_policy_violation(actor, resource, action, reason) do
    Logger.warning("""
    Multi-tenancy policy violation:
    - Actor: #{actor.id} (company: #{actor.company_id})
    - Resource: #{inspect(resource.__struct__)} #{resource.id}
    - Action: #{action}
    - Reason: #{reason}
    """)

    # Optionally create AuditLog record
    AuditLog.create!(%{
      actor_id: actor.id,
      resource_type: resource.__struct__,
      resource_id: resource.id,
      action: action,
      result: :forbidden,
      metadata: %{reason: reason}
    })
  end
end
```

## Performance Considerations

- **Indexes**: Ensure all `company_id` columns are indexed
- **Query Filtering**: Policies add WHERE clauses - verify query plans
- **Eager Loading**: When loading related resources, ensure policies apply to all

### Required Indexes

```sql
CREATE INDEX forms_company_id_index ON forms(company_id);
CREATE INDEX submissions_company_id_index ON submissions(company_id);
```

### Query Plan Verification

```sql
-- Verify that company_id filter is using index
EXPLAIN ANALYZE
SELECT * FROM forms WHERE company_id = 'uuid';

-- Should show "Index Scan using forms_company_id_index"
```

## Common Pitfalls

### ❌ Bypassing Policies with Direct Ecto Queries

```elixir
# DON'T DO THIS - bypasses Ash policies
Repo.get!(Form, form_id)
```

### ✅ Always Use Ash Actions

```elixir
# DO THIS - enforces policies
Forms.get_form!(form_id, actor: current_authz_user)
```

### ❌ Forgetting to Set Actor

```elixir
# DON'T DO THIS - no multi-tenancy enforcement
Forms.list_forms!()
```

### ✅ Always Provide Actor

```elixir
# DO THIS
Forms.list_forms!(actor: current_authz_user)
```

### ❌ Using Wrong Actor

```elixir
# DON'T DO THIS - using authn_user instead of authz_user
Forms.list_forms!(actor: current_authn_user)
```

### ✅ Use AuthzUser as Actor

```elixir
# DO THIS - authz_user has company_id and role
Forms.list_forms!(actor: current_authz_user)
```

## Related Specifications

- Domain: [domain.md](../domain.md) - Multi-tenancy overview
- Resource: [form.md](../resources/form.md) - Form policies
- Resource: [submission.md](../resources/submission.md) - Submission policies
- Authorization Domain: [../../authorization/policies/row_level_security.md](../../authorization/policies/row_level_security.md)
