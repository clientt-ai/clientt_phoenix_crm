defmodule ClienttCrmApp.Forms.Notification do
  @moduledoc """
  Notification resource - In-app notifications for users.

  Represents in-app notifications displayed in the UI for form-related events.

  **TODO: MOVE TO SHARED DOMAIN**
  This resource should be moved to a shared domain (e.g., Platform or Notifications)
  because both Forms and Authorization domains need notifications.
  See: specs/CONFLICTS_AND_ISSUES.md Issue #2

  ## Notification Types (Forms Domain)

  - `new_submission` - New form submission received
  - `submission_status_changed` - Lead status updated
  - `form_published` - Form is now live
  - `form_archived` - Form has been archived

  ## Business Rules
  - Users can only read their own notifications
  - Notifications are always created (cannot be disabled)
  - Email notifications respect user preferences (immediate, daily, off)
  - read_at timestamp indicates if notification has been viewed
  - link points to related resource (e.g., /forms/submissions/:id)
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "notifications"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
      prepare build(sort: [created_at: :desc])
    end

    create :create do
      primary? true
      accept [:user_id, :type, :title, :message, :link, :metadata]

      change fn changeset, _context ->
        # Ensure read_at is nil (unread by default)
        Ash.Changeset.force_change_attribute(changeset, :read_at, nil)
      end
    end

    update :mark_as_read do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :read_at, DateTime.utc_now())
      end
    end

    update :mark_as_unread do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :read_at, nil)
      end
    end

    read :for_user do
      argument :user_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [created_at: :desc])
      filter expr(user_id == ^arg(:user_id))
    end

    read :unread_for_user do
      argument :user_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [created_at: :desc])
      filter expr(user_id == ^arg(:user_id) and is_nil(read_at))
    end

    read :by_type do
      argument :type, :string do
        allow_nil? false
      end

      prepare build(sort: [created_at: :desc])
      filter expr(type == ^arg(:type))
    end

    destroy :destroy do
      primary? true
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :user_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :type, :string do
      allow_nil? false
      public? true
      constraints max_length: 50
      # Types: new_submission, submission_status_changed, form_published, form_archived
    end

    attribute :title, :string do
      allow_nil? false
      public? true
      constraints min_length: 1, max_length: 255
    end

    attribute :message, :string do
      allow_nil? true
      public? true
    end

    attribute :link, :string do
      allow_nil? true
      public? true
      constraints max_length: 500
      # Path to related resource (e.g., /forms/submissions/uuid)
    end

    attribute :metadata, :map do
      allow_nil? true
      public? true
      default %{}
      # Additional context: %{form_id: "...", submission_id: "...", old_status: "...", new_status: "..."}
    end

    attribute :read_at, :utc_datetime_usec do
      allow_nil? true
      public? false
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :user, ClienttCrmApp.Authorization.AuthzUser do
      source_attribute :user_id
      destination_attribute :id
      allow_nil? false
    end
  end

  calculations do
    calculate :is_read, :boolean, expr(not is_nil(read_at))
    calculate :is_unread, :boolean, expr(is_nil(read_at))

    calculate :age_in_hours, :integer, expr(
      fragment(
        "EXTRACT(EPOCH FROM (NOW() - ?))::integer / 3600",
        created_at
      )
    )
  end

  aggregates do
    # No aggregates needed for MVP
  end

  identities do
    # No unique constraints
  end

  policies do
    # Policy: Users can only read their own notifications
    policy action_type(:read) do
      # authorize_if actor_attribute_equals(:id, :user_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: System creates notifications (internal API)
    policy action(:create) do
      # authorize_if always() # System-level action
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Users can mark their own notifications as read
    policy action([:mark_as_read, :mark_as_unread]) do
      # authorize_if actor_attribute_equals(:id, :user_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Users can delete their own notifications
    policy action(:destroy) do
      # authorize_if actor_attribute_equals(:id, :user_id)
      # Placeholder during development
      authorize_if always()
    end
  end
end
