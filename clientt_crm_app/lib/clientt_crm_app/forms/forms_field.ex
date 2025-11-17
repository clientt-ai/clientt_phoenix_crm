defmodule ClienttCrmApp.Forms.FormField do
  @moduledoc """
  FormField resource - Individual input field within a form.

  Represents a single field in a form with type, label, validation rules,
  and configuration options.

  ## Field Types (MVP - 10 types)

  **Basic (6)**:
  - `:text` - Short text input
  - `:email` - Email address input with format validation
  - `:textarea` - Long text input (multiline)
  - `:select` - Dropdown selection (requires options)
  - `:checkbox` - Boolean yes/no checkbox
  - `:radio` - Single choice from radio buttons (requires options)

  **Advanced (4)**:
  - `:number` - Numeric input with min/max validation
  - `:date` - Date picker
  - `:phone` - Phone number input with format validation
  - `:url` - URL input with format validation

  **Excluded from MVP**:
  - File upload (Phase 3+ due to storage/security requirements)

  ## Business Rules
  - Must belong to a form
  - order_position determines display order (0-indexed)
  - select and radio types MUST have options array
  - Cannot modify fields on published forms
  - Validation rules stored as JSONB map
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Forms,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "forms_fields"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
      prepare build(sort: [order_position: :asc])
    end

    create :create do
      primary? true
      accept [:field_type, :label, :placeholder, :help_text, :required, :order_position, :options, :validation_rules]

      argument :form_id, :uuid do
        allow_nil? false
      end

      change fn changeset, _context ->
        form_id = Ash.Changeset.get_argument(changeset, :form_id)

        # Load form to get company_id and validate status
        form = ClienttCrmApp.Forms.Form |> Ash.get!(form_id)

        # Validate form is in draft status
        # TODO: Once Form resource is fully integrated, validate status
        # For now, allow creating fields

        changeset
        |> Ash.Changeset.force_change_attribute(:form_id, form_id)
        |> Ash.Changeset.force_change_attribute(:company_id, form.company_id)
      end

      # Validate select/radio types have options
      change fn changeset, _context ->
        field_type = Ash.Changeset.get_attribute(changeset, :field_type)
        options = Ash.Changeset.get_attribute(changeset, :options)

        if field_type in [:select, :radio] and (is_nil(options) or options == []) do
          Ash.Changeset.add_error(
            changeset,
            Ash.Error.Changes.InvalidChanges.exception(
              message: "#{field_type} field type requires at least one option"
            )
          )
        else
          changeset
        end
      end
    end

    update :update do
      primary? true
      accept [:field_type, :label, :placeholder, :help_text, :required, :order_position, :options, :validation_rules]
      require_atomic? false

      # Only allow updating fields on draft forms
      change fn changeset, _context ->
        # TODO: Load parent form and check status == :draft
        # For now, allow updates
        changeset
      end

      # Validate select/radio types have options
      change fn changeset, _context ->
        field_type = Ash.Changeset.get_attribute(changeset, :field_type)
        options = Ash.Changeset.get_attribute(changeset, :options)

        if field_type in [:select, :radio] and (is_nil(options) or options == []) do
          Ash.Changeset.add_error(
            changeset,
            Ash.Error.Changes.InvalidChanges.exception(
              message: "#{field_type} field type requires at least one option"
            )
          )
        else
          changeset
        end
      end
    end

    update :reorder do
      accept [:order_position]
    end

    read :for_form do
      argument :form_id, :uuid do
        allow_nil? false
      end

      prepare build(sort: [order_position: :asc])
      filter expr(form_id == ^arg(:form_id))
    end

    destroy :destroy do
      primary? true
      require_atomic? false

      # Only allow deleting fields on draft forms
      change fn changeset, _context ->
        # TODO: Load parent form and check status == :draft
        # For now, allow deletion
        changeset
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

    attribute :field_type, :atom do
      allow_nil? false
      public? true
      constraints one_of: [
        :text,
        :email,
        :textarea,
        :select,
        :checkbox,
        :radio,
        :number,
        :date,
        :phone,
        :url
      ]
    end

    attribute :label, :string do
      allow_nil? false
      public? true
      constraints min_length: 1, max_length: 255
    end

    attribute :placeholder, :string do
      allow_nil? true
      public? true
      constraints max_length: 255
    end

    attribute :help_text, :string do
      allow_nil? true
      public? true
    end

    attribute :required, :boolean do
      allow_nil? false
      public? true
      default false
    end

    attribute :order_position, :integer do
      allow_nil? false
      public? true
      default 0
      constraints min: 0
    end

    attribute :options, {:array, :map} do
      allow_nil? true
      public? true
      default []
      # Each option: %{label: "Option 1", value: "opt1"}
      # Required for select and radio types
      # Format: [%{label: "...", value: "..."}, %{label: "...", value: "..."}]
    end

    attribute :validation_rules, :map do
      allow_nil? true
      public? true
      default %{}
      # Structure: %{min_length: 5, max_length: 100, min_value: 0, max_value: 100, pattern: "regex"}
      # Supports: required (boolean), min_length, max_length, min_value, max_value
      # MVP does not support custom regex patterns or custom error messages
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
    calculate :is_required, :boolean, expr(required == true)

    calculate :has_validation, :boolean, expr(
      fragment("? IS NOT NULL AND ? != '{}'::jsonb", validation_rules, validation_rules)
    )

    calculate :requires_options, :boolean, expr(field_type in [:select, :radio])
  end

  identities do
    # Ensure field labels are unique within a form (optional, can remove if not desired)
    # identity :unique_label_per_form, [:form_id, :label]
  end

  policies do
    # Multi-tenancy inherited from parent form
    # Users can access fields if they can access the parent form

    # Policy: Can read fields if can read parent form
    policy action_type(:read) do
      # authorize_if relates_to_actor_via(:form, :company_id, :company_id)
      # Placeholder during development
      authorize_if always()
    end

    # Policy: Admin and Manager can create/update/delete fields on draft forms
    policy action([:create, :update, :reorder, :destroy]) do
      # authorize_if actor_attribute_in(:role, [:admin, :manager])
      # authorize_if relates_to_actor_via(:form, :company_id, :company_id)
      # authorize_if expr(form.status == :draft)
      # Placeholder during development
      authorize_if always()
    end
  end
end
