defmodule ClienttCrmApp.Authorization.CompanySettings do
  @moduledoc """
  CompanySettings resource - Company-specific configuration and limits.

  Stores per-company customization including feature flags, branding,
  operational limits, and preferences. Automatically created when a company
  is created.

  ## Business Rules
  - One settings record per company (1:1 relationship)
  - If max_users is set, cannot invite users beyond limit
  - Features and branding must be valid JSON maps
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Authorization,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "authz_company_settings"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :for_company do
      get? true

      argument :company_id, :uuid do
        allow_nil? false
      end

      filter expr(company_id == ^arg(:company_id))
    end

    create :create do
      primary? true
      accept [:company_id, :max_users, :max_teams, :timezone]

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(:features, %{})
        |> Ash.Changeset.force_change_attribute(:branding, %{
          "logo_url" => nil,
          "primary_color" => "#3B82F6",
          "secondary_color" => "#10B981"
        })
      end
    end

    update :update do
      primary? true
      accept [:max_users, :max_teams, :timezone]

      validate fn changeset, _context ->
        # Validate max_users >= 1 if provided
        case Ash.Changeset.get_attribute(changeset, :max_users) do
          nil ->
            :ok

          max_users when is_integer(max_users) and max_users >= 1 ->
            :ok

          _invalid ->
            {:error, field: :max_users, message: "must be at least 1"}
        end
      end

      validate fn changeset, _context ->
        # Validate max_teams >= 1 if provided
        case Ash.Changeset.get_attribute(changeset, :max_teams) do
          nil ->
            :ok

          max_teams when is_integer(max_teams) and max_teams >= 1 ->
            :ok

          _invalid ->
            {:error, field: :max_teams, message: "must be at least 1"}
        end
      end
    end

    update :toggle_feature do
      require_atomic? false

      argument :feature_name, :string do
        allow_nil? false
      end

      argument :enabled, :boolean do
        allow_nil? false
      end

      change fn changeset, _context ->
        feature_name = Ash.Changeset.get_argument(changeset, :feature_name)
        enabled = Ash.Changeset.get_argument(changeset, :enabled)
        current_features = changeset.data.features || %{}

        updated_features = Map.put(current_features, feature_name, enabled)

        Ash.Changeset.force_change_attribute(changeset, :features, updated_features)
      end
    end

    update :update_branding do
      accept [:branding]
      require_atomic? false

      validate fn changeset, _context ->
        case Ash.Changeset.get_attribute(changeset, :branding) do
          nil ->
            :ok

          branding when is_map(branding) ->
            :ok

          _invalid ->
            {:error, field: :branding, message: "must be a valid map"}
        end
      end
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :company_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :max_users, :integer do
      allow_nil? true
      public? true
    end

    attribute :max_teams, :integer do
      allow_nil? true
      public? true
    end

    attribute :features, :map do
      allow_nil? false
      public? true
      default %{}
    end

    attribute :branding, :map do
      allow_nil? false
      public? true

      default %{
        "logo_url" => nil,
        "primary_color" => "#3B82F6",
        "secondary_color" => "#10B981"
      }
    end

    attribute :timezone, :string do
      allow_nil? true
      public? true
      constraints max_length: 100
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
  end

  calculations do
    # calculate :current_users_count, :integer do
    #   calculation fn records, _context ->
    #     # Load from company.active_users_count
    #   end
    # end

    # calculate :current_teams_count, :integer do
    #   calculation fn records, _context ->
    #     # Load from company.teams_count
    #   end
    # end

    # calculate :users_remaining, :integer do
    #   calculation fn records, _context ->
    #     # max_users - current_users_count (or nil if unlimited)
    #   end
    # end

    # calculate :has_capacity_for_users, :boolean do
    #   calculation fn records, _context ->
    #     # current_users_count < max_users (or true if unlimited)
    #   end
    # end

    # Calculations deferred until after full integration testing
  end

  identities do
    identity :unique_company, [:company_id]
  end

  policies do
    # Policy: Allow automatic creation during company creation
    policy action(:create) do
      authorize_if always()
    end

    # Policy: All company members can read settings
    policy action_type(:read) do
      # authorize_if expr(company_id == ^actor(:current_company_id))
      # This will be implemented with proper actor context
      authorize_if always()
    end

    # Policy: Only admins can update settings
    policy action([:update, :toggle_feature, :update_branding]) do
      # authorize_if AuthzUserIsAdmin
      # This will be implemented with proper actor context
      authorize_if always()
    end
  end
end
