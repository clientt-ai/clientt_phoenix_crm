defmodule ClienttCrmApp.Forms.Submission do
  @moduledoc """
  Submission resource - Form submission and lead data.

  Represents a completed form submission with lead data, workflow status,
  and metadata (UTM parameters, referrer, IP, etc.).

  ## Lead Status Workflow

  Valid transitions:
  - new → contacted → qualified → converted
  - Any status → spam

  Terminal states: converted, spam

  ## Immutability

  **CRITICAL**: Once created, `form_data` and `metadata` are IMMUTABLE.
  Only `status` and `deleted_at` can be updated after creation.

  ## Business Rules
  - Submission data cannot be edited after creation (audit trail)
  - submitter_email extracted from form_data for indexing
  - company_id inherited from parent form (multi-tenancy)
  - Soft delete only (deleted_at timestamp)
  - Public submission endpoint requires no authentication
  - Only published forms can receive submissions
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "submissions"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
      prepare build(sort: [submitted_at: :desc])
    end

    # Public submission action (no authentication required)
    create :create_public_submission do
      accept [:form_data, :metadata]

      argument :form_id, :uuid do
        allow_nil? false
      end

      change fn changeset, _context ->
        form_id = Ash.Changeset.get_argument(changeset, :form_id)

        # Load form to get company_id and validate status
        form = ClienttCrmApp.Forms.Form |> Ash.get!(form_id)

        # Validate form is published
        if form.status != :published do
          raise Ash.Error.Invalid.InvalidChanges,
            message: "Form not found or no longer accepting submissions"
        end

        # Extract submitter_email from form_data if present
        form_data = Ash.Changeset.get_attribute(changeset, :form_data)

        submitter_email =
          if is_map(form_data) do
            # Look for email field in form_data
            Enum.find_value(form_data, fn {_key, value} ->
              if is_binary(value) and String.contains?(value, "@") do
                value
              else
                nil
              end
            end)
          else
            nil
          end

        now = DateTime.utc_now()

        changeset
        |> Ash.Changeset.force_change_attribute(:form_id, form_id)
        |> Ash.Changeset.force_change_attribute(:company_id, form.company_id)
        |> Ash.Changeset.force_change_attribute(:status, :new)
        |> Ash.Changeset.force_change_attribute(:submitted_at, now)
        |> Ash.Changeset.change_attribute(:submitter_email, submitter_email)
        |> Ash.Changeset.after_action(fn _changeset, submission ->
          # Increment form's submission_count
          ClienttCrmApp.Forms.Form
          |> Ash.get!(form_id)
          |> Ash.Changeset.for_update(:increment_submission_count)
          |> Ash.update!()

          # TODO: Publish domain event forms.submission_created
          # TODO: Create in-app notifications for company users
          # TODO: Send email notifications based on user preferences

          {:ok, submission}
        end)
      end
    end

    # Internal create action (authenticated, for admin/manager)
    create :create do
      primary? true
      accept [:form_data, :submitter_email, :metadata, :submitted_at]

      argument :form_id, :uuid do
        allow_nil? false
      end

      argument :company_id, :uuid do
        allow_nil? false
      end

      change fn changeset, _context ->
        form_id = Ash.Changeset.get_argument(changeset, :form_id)
        company_id = Ash.Changeset.get_argument(changeset, :company_id)
        now = DateTime.utc_now()

        changeset
        |> Ash.Changeset.force_change_attribute(:form_id, form_id)
        |> Ash.Changeset.force_change_attribute(:company_id, company_id)
        |> Ash.Changeset.force_change_attribute(:status, :new)
        |> Ash.Changeset.force_change_attribute(:submitted_at, now)
      end
    end

    # Update status action (for lead workflow)
    update :update_status do
      accept [:status]

      # Validate status transitions
      validate fn changeset, _context ->
        old_status = changeset.data.status
        new_status = Ash.Changeset.get_attribute(changeset, :status)

        valid_transition =
          case {old_status, new_status} do
            # Forward workflow transitions
            {:new, :contacted} -> true
            {:contacted, :qualified} -> true
            {:qualified, :converted} -> true

            # Can mark as spam from any status
            {_, :spam} -> true

            # Same status (no-op)
            {same, same} -> true

            # Terminal states cannot transition
            {:converted, _} -> false
            {:spam, _} -> false

            # Invalid transitions
            _ -> false
          end

        if valid_transition do
          :ok
        else
          {:error, message: "Invalid status transition from #{old_status} to #{new_status}"}
        end
      end
    end

    # Soft delete action
    update :soft_delete do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :deleted_at, DateTime.utc_now())
      end
    end

    # Restore action
    update :restore do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :deleted_at, nil)
      end
    end

    # Read actions with filters

    read :for_form do
      argument :form_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [submitted_at: :desc])
      filter expr(form_id == ^arg(:form_id) and is_nil(deleted_at))
    end

    read :for_company do
      argument :company_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [submitted_at: :desc])
      filter expr(company_id == ^arg(:company_id) and is_nil(deleted_at))
    end

    read :by_status do
      argument :status, :atom do
        allow_nil? false
      end

      prepare build(sort: [submitted_at: :desc])
      filter expr(status == ^arg(:status) and is_nil(deleted_at))
    end

    read :recent do
      argument :limit, :integer do
        default 10
      end

      prepare build(
        sort: [submitted_at: :desc],
        limit: arg(:limit)
      )

      filter expr(is_nil(deleted_at))
    end

    read :including_deleted do
      prepare build(sort: [submitted_at: :desc])
    end

    destroy :destroy do
      primary? false

      # Prevent hard deletion - use soft_delete instead
      validate fn _changeset, _context ->
        {:error, message: "Cannot hard delete submissions. Use soft_delete action instead."}
      end
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :company_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :form_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :form_data, :map do
      allow_nil? false
      public? true
      default %{}
      # Structure: %{"field-uuid-1" => "value1", "field-uuid-2" => "value2"}
      # IMMUTABLE after creation
    end

    attribute :submitter_email, :string do
      allow_nil? true
      public? true
      constraints max_length: 255
    end

    attribute :metadata, :map do
      allow_nil? true
      public? true
      default %{}
      # Structure: %{utm_source: "...", utm_medium: "...", utm_campaign: "...", referrer: "...", ip_address: "...", user_agent: "..."}
      # IMMUTABLE after creation
    end

    attribute :status, :atom do
      allow_nil? false
      public? true
      default :new
      constraints one_of: [:new, :contacted, :qualified, :converted, :spam]
    end

    attribute :submitted_at, :utc_datetime_usec do
      allow_nil? false
      public? false
    end

    attribute :deleted_at, :utc_datetime_usec do
      allow_nil? true
      public? false
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :company, ClienttCrmApp.Authorization.Company do
      source_attribute :company_id
      destination_attribute :id
      allow_nil? false
    end

    belongs_to :form, ClienttCrmApp.Forms.Form do
      source_attribute :form_id
      destination_attribute :id
      allow_nil? false
    end
  end

  calculations do
    calculate :is_deleted, :boolean, expr(not is_nil(deleted_at))

    calculate :is_new, :boolean, expr(status == :new)
    calculate :is_contacted, :boolean, expr(status == :contacted)
    calculate :is_qualified, :boolean, expr(status == :qualified)
    calculate :is_converted, :boolean, expr(status == :converted)
    calculate :is_spam, :boolean, expr(status == :spam)

    calculate :utm_source, :string, expr(
      fragment("?->>'utm_source'", metadata)
    )

    calculate :utm_medium, :string, expr(
      fragment("?->>'utm_medium'", metadata)
    )

    calculate :utm_campaign, :string, expr(
      fragment("?->>'utm_campaign'", metadata)
    )
  end

  identities do
    # No unique constraints - multiple submissions allowed
  end

  policies do
    # Multi-tenancy: Users can only access submissions in their company

    # Policy: Company members can read submissions
    policy action_type(:read) do
      # authorize_if actor_attribute_equals(:company_id, :company_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Public can create submissions (no actor)
    policy action(:create_public_submission) do
      authorize_if always()
    end

    # Policy: Admin and Manager can create submissions
    policy action(:create) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can update status
    policy action(:update_status) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # authorize_if actor_attribute_equals(:company_id, :company_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can soft delete
    policy action([:soft_delete, :restore]) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # authorize_if actor_attribute_equals(:company_id, :company_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Prevent hard deletion
    policy action(:destroy) do
      forbid_if always()
    end
  end
end
