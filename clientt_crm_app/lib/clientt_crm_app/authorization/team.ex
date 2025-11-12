defmodule ClienttCrmApp.Authorization.Team do
  @moduledoc """
  Team resource - Sub-group within a company for organizing users.

  Represents departments, project teams, or other organizational units within
  a company. Provides an additional layer of access control and organization
  beyond company-level roles.

  ## Business Rules
  - Team name must be unique within a company (not globally unique)
  - Cannot delete team with active members (must archive instead)
  - All team members must belong to the same company as the team
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Authorization,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "authz_teams"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
    end

    read :list_for_company do
      argument :company_id, :uuid do
        allow_nil? false
      end

      filter expr(company_id == ^arg(:company_id) and status == :active)
    end

    create :create do
      primary? true
      accept [:company_id, :name, :description]

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :active)
      end
    end

    update :update do
      primary? true
      accept [:name, :description]
    end

    update :archive do
      accept []
      require_atomic? false

      validate fn changeset, _context ->
        # Check if team has active members
        team = changeset.data

        case ClienttCrmApp.Authorization.AuthzUser
             |> Ash.Query.for_read(:list)
             |> Ash.read!(authorize?: false) do
          authz_users ->
            active_members =
              Enum.filter(authz_users, fn au ->
                au.team_id == team.id and au.status == :active
              end)

            if length(active_members) > 0 do
              {:error,
               field: :status,
               message:
                 "Cannot archive team with active members. Reassign #{length(active_members)} member(s) first."}
            else
              :ok
            end
        end
      end

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :archived)
      end
    end

    destroy :destroy do
      primary? false
      require_atomic? false

      validate fn _changeset, _context ->
        {:error, message: "Cannot delete teams. Use archive action instead."}
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

    attribute :description, :string do
      allow_nil? true
      public? true
      constraints max_length: 500
    end

    attribute :status, :atom do
      allow_nil? false
      public? true
      default :active
      constraints one_of: [:active, :archived]
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

    has_many :authz_users, ClienttCrmApp.Authorization.AuthzUser do
      destination_attribute :team_id
    end
  end

  calculations do
    # calculate :member_count, :integer do
    #   calculation fn teams, _context ->
    #     # Count active authz_users for each team
    #     # Will be implemented after relationships are fully working
    #   end
    # end

    # calculate :team_leads_count, :integer do
    #   calculation fn teams, _context ->
    #     # Count team_lead authz_users for each team
    #   end
    # end

    # calculate :has_members, :boolean do
    #   calculation fn teams, _context ->
    #     # Returns member_count > 0
    #   end
    # end

    # Calculations deferred until after full integration testing
  end

  identities do
    identity :unique_name_per_company, [:company_id, :name]
  end

  policies do
    # Policy: All company members can read teams
    policy action_type(:read) do
      # authorize_if expr(company_id == ^actor(:current_company_id))
      # This will be implemented with proper actor context
      authorize_if always()
    end

    # Policy: Only admins can create, update, or archive teams
    policy action([:create, :update, :archive]) do
      # authorize_if AuthzUserIsAdmin
      # This will be implemented with proper actor context
      authorize_if always()
    end

    # Policy: Cannot destroy teams
    policy action(:destroy) do
      authorize_if always()
    end
  end
end
