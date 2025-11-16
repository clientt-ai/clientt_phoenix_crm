defmodule ClienttCrmApp.Forms.Form do
  @moduledoc """
  Form resource - Aggregate root for custom form builder.

  Represents a customizable data collection template with configuration,
  branding, and settings. Forms can be published to collect submissions.

  ## Aggregate Root
  This resource is the aggregate root for:
  - FormField (1:Many) - Individual input fields
  - Submission (1:Many) - Form submissions / leads

  ## State Transitions
  draft → published → archived

  ## Business Rules
  - Slug must be unique within company (not globally)
  - Name must be unique within company
  - Must have at least 1 field to publish
  - Published forms are immutable (cannot add/remove/edit fields)
  - Cannot delete forms (use archive instead)
  - Only admin and manager roles can create/update forms
  - Form duplication creates deep copy (form + all fields)
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "forms"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
      prepare build(sort: [updated_at: :desc])
    end

    create :create do
      primary? true
      accept [:name, :description, :branding, :settings]

      argument :company_id, :uuid do
        allow_nil? false
      end

      argument :created_by_id, :uuid do
        allow_nil? false
      end

      change fn changeset, _context ->
        # Set company_id and created_by from arguments
        company_id = Ash.Changeset.get_argument(changeset, :company_id)
        created_by_id = Ash.Changeset.get_argument(changeset, :created_by_id)

        # Generate slug from name
        name = Ash.Changeset.get_attribute(changeset, :name)

        slug =
          if name do
            name
            |> String.downcase()
            |> String.replace(~r/[^a-z0-9\s-]/, "")
            |> String.replace(~r/\s+/, "-")
            |> String.slice(0, 50)
          else
            nil
          end

        changeset
        |> Ash.Changeset.force_change_attribute(:company_id, company_id)
        |> Ash.Changeset.force_change_attribute(:created_by_id, created_by_id)
        |> Ash.Changeset.force_change_attribute(:status, :draft)
        |> Ash.Changeset.change_attribute(:slug, slug)
      end
    end

    update :update do
      primary? true
      accept [:name, :description, :branding, :settings]

      # Only allow updating draft forms
      validate fn changeset, _context ->
        status = changeset.data.status

        if status == :draft do
          :ok
        else
          {:error, message: "Cannot modify published or archived forms"}
        end
      end
    end

    update :publish do
      accept []

      # Validate form has at least 1 field before publishing
      validate fn changeset, _context ->
        # TODO: Once FormField resource exists, validate field count > 0
        # For now, allow publish without validation
        :ok
      end

      change fn changeset, _context ->
        now = DateTime.utc_now()

        changeset
        |> Ash.Changeset.force_change_attribute(:status, :published)
        |> Ash.Changeset.force_change_attribute(:published_at, now)
      end
    end

    update :archive do
      accept []

      # Only admins can archive
      # This will be enforced by policies once AuthzUser integration is complete

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :archived)
      end
    end

    update :increment_view_count do
      accept []

      change atomic_update(:view_count, expr(view_count + 1))
    end

    update :increment_submission_count do
      accept []

      change atomic_update(:submission_count, expr(submission_count + 1))
    end

    # Duplicate action creates a copy of form + all fields
    create :duplicate do
      accept []

      argument :source_form_id, :uuid do
        allow_nil? false
      end

      argument :created_by_id, :uuid do
        allow_nil? false
      end

      change fn changeset, context ->
        source_id = Ash.Changeset.get_argument(changeset, :source_form_id)
        created_by_id = Ash.Changeset.get_argument(changeset, :created_by_id)

        # Load source form
        source_form =
          ClienttCrmApp.Forms.Form
          |> Ash.get!(source_id)

        # Create copy with " (copy)" suffix
        copy_name = "#{source_form.name} (copy)"
        copy_slug = "#{source_form.slug}-copy"

        changeset
        |> Ash.Changeset.force_change_attribute(:company_id, source_form.company_id)
        |> Ash.Changeset.force_change_attribute(:created_by_id, created_by_id)
        |> Ash.Changeset.force_change_attribute(:name, copy_name)
        |> Ash.Changeset.force_change_attribute(:slug, copy_slug)
        |> Ash.Changeset.force_change_attribute(:description, source_form.description)
        |> Ash.Changeset.force_change_attribute(:branding, source_form.branding)
        |> Ash.Changeset.force_change_attribute(:settings, source_form.settings)
        |> Ash.Changeset.force_change_attribute(:status, :draft)
        |> Ash.Changeset.after_action(fn _changeset, new_form ->
          # TODO: After creating form, duplicate all fields from source
          # This will be implemented once FormField resource exists
          {:ok, new_form}
        end)
      end
    end

    read :for_company do
      argument :company_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [updated_at: :desc])
      filter expr(company_id == ^arg(:company_id))
    end

    read :published do
      filter expr(status == :published)
    end

    read :by_slug do
      get? true

      argument :slug, :string do
        allow_nil? false
      end

      filter expr(slug == ^arg(:slug))
    end

    destroy :destroy do
      primary? false

      # Prevent deletion - use archive instead
      validate fn _changeset, _context ->
        {:error, message: "Cannot delete forms. Use archive action instead."}
      end
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :company_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :name, :string do
      allow_nil? false
      public? true
      constraints min_length: 2, max_length: 100
    end

    attribute :slug, :string do
      allow_nil? false
      public? true
      constraints min_length: 2, max_length: 50, match: ~r/^[a-z0-9-]+$/
    end

    attribute :description, :string do
      allow_nil? true
      public? true
    end

    attribute :branding, :map do
      allow_nil? true
      public? true
      default %{}
      # Structure: %{primary_color: "#3B82F6", logo_url: "...", background_color: "#FFFFFF", text_color: "#1F2937", font_family: "Inter"}
    end

    attribute :settings, :map do
      allow_nil? true
      public? true
      default %{}
      # Structure: %{redirect_url: "...", success_message: "...", collect_utm_params: true, allow_multiple_submissions: false}
    end

    attribute :status, :atom do
      allow_nil? false
      public? true
      default :draft
      constraints one_of: [:draft, :published, :archived]
    end

    attribute :view_count, :integer do
      allow_nil? false
      public? true
      default 0
      constraints min: 0
    end

    attribute :submission_count, :integer do
      allow_nil? false
      public? true
      default 0
      constraints min: 0
    end

    attribute :published_at, :utc_datetime_usec do
      allow_nil? true
      public? false
    end

    attribute :created_by_id, :uuid do
      allow_nil? false
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

    belongs_to :created_by, ClienttCrmApp.Authorization.AuthzUser do
      source_attribute :created_by_id
      destination_attribute :id
      allow_nil? false
    end

    has_many :fields, ClienttCrmApp.Forms.FormField do
      destination_attribute :form_id
    end

    has_many :submissions, ClienttCrmApp.Forms.Submission do
      destination_attribute :form_id
    end
  end

  calculations do
    calculate :conversion_rate, :decimal, expr(
      fragment(
        "CASE WHEN ? > 0 THEN ROUND((? * 100.0 / ?)::numeric, 2) ELSE 0 END",
        view_count,
        submission_count,
        view_count
      )
    )

    calculate :is_published, :boolean, expr(status == :published)
    calculate :is_draft, :boolean, expr(status == :draft)
    calculate :is_archived, :boolean, expr(status == :archived)
  end

  aggregates do
    count :total_fields, :fields
    count :total_submissions, :submissions
    count :new_submissions, :submissions do
      filter expr(status == :new)
    end

    max :last_submission_at, :submissions, :submitted_at
  end

  identities do
    # Slug must be unique within company, not globally
    identity :unique_slug_per_company, [:company_id, :slug]
    # Name must be unique within company
    identity :unique_name_per_company, [:company_id, :name]
  end

  policies do
    # Multi-tenancy: All queries automatically filtered by company_id
    # Users can only access forms in their current company

    # Policy: Read forms in own company
    policy action_type(:read) do
      # authorize_if actor_attribute_equals(:company_id, :company_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can create forms
    policy action(:create) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can update draft forms
    policy action(:update) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # authorize_if expr(status == :draft)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can publish forms
    policy action(:publish) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Only Admin can archive
    policy action(:archive) do
      # authorize_if actor_attribute_equals(:role, :admin)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can duplicate
    policy action(:duplicate) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Prevent deletion
    policy action(:destroy) do
      forbid_if always()
    end
  end
end
