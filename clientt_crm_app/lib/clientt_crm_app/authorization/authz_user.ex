defmodule ClienttCrmApp.Authorization.AuthzUser do
  @moduledoc """
  AuthzUser resource - Authorization identity linking authn_user to company.

  Represents a user's authorization identity within a specific company.
  Enables users to have different roles in different companies.

  ## Key Concepts
  - **authn_user_id**: Reference to authentication user (WHO you are)
  - **company_id**: Which company this authorization applies to
  - **role**: Company-level role (admin, manager, user)
  - **team_id/team_role**: Optional team membership and role

  ## Business Rules
  - Each (authn_user_id, company_id) pair must be unique
  - If team_role is set, team_id MUST be set
  - If team_id is set, team must belong to same company
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Authorization,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "authz_users"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
    end

    read :get_by_user_and_company do
      description "Find authz_user for company switching"
      get? true

      argument :authn_user_id, :uuid do
        allow_nil? false
      end

      argument :company_id, :uuid do
        allow_nil? false
      end

      filter expr(authn_user_id == ^arg(:authn_user_id) and company_id == ^arg(:company_id))
    end

    create :create do
      primary? true
      accept [:authn_user_id, :company_id, :role, :team_id, :team_role, :display_name]

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(:status, :active)
        |> Ash.Changeset.force_change_attribute(:joined_at, DateTime.utc_now())
      end

      # Validation: team_role requires team_id will be enforced by database constraint
    end

    update :update_role do
      accept [:role]

      validate fn changeset, _context ->
        # TODO: Add last admin validation
        # Prevent downgrading last admin in company
        :ok
      end
    end

    update :assign_to_team do
      accept [:team_id, :team_role]

      validate fn changeset, _context ->
        team_id = Ash.Changeset.get_attribute(changeset, :team_id)
        company_id = changeset.data.company_id

        if team_id do
          # TODO: Validate team belongs to same company
          # This will be implemented once Team resource exists
          :ok
        else
          :ok
        end
      end
    end

    update :remove_from_team do
      accept []

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(:team_id, nil)
        |> Ash.Changeset.force_change_attribute(:team_role, nil)
      end
    end

    update :suspend do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :inactive)
      end
    end

    update :reactivate do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :active)
      end
    end

    update :set_inactive do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :inactive)
      end
    end

    update :update_last_active do
      accept []

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :last_active_at, DateTime.utc_now())
      end
    end

    destroy :destroy do
      primary? true
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :authn_user_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :company_id, :uuid do
      allow_nil? false
      public? true
    end

    attribute :role, :atom do
      allow_nil? false
      public? true
      constraints one_of: [:admin, :manager, :user, :form_admin]
    end

    attribute :team_id, :uuid do
      allow_nil? true
      public? true
    end

    attribute :team_role, :atom do
      allow_nil? true
      public? true
      constraints one_of: [:team_lead, :team_member]
    end

    attribute :status, :atom do
      allow_nil? false
      public? true
      default :active
      constraints one_of: [:active, :inactive]
    end

    attribute :display_name, :string do
      allow_nil? true
      public? true
      constraints max_length: 100
    end

    attribute :joined_at, :utc_datetime_usec do
      allow_nil? false
      public? false
    end

    attribute :last_active_at, :utc_datetime_usec do
      allow_nil? true
      public? false
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :authn_user, ClienttCrmApp.Accounts.AuthnUser do
      source_attribute :authn_user_id
      destination_attribute :id
      allow_nil? false
    end

    belongs_to :company, ClienttCrmApp.Authorization.Company do
      source_attribute :company_id
      destination_attribute :id
      allow_nil? false
    end

    belongs_to :team, ClienttCrmApp.Authorization.Team do
      source_attribute :team_id
      destination_attribute :id
      allow_nil? true
    end
  end

  calculations do
    calculate :email, :string, expr(authn_user.email)

    calculate :is_admin, :boolean, expr(role == :admin)

    calculate :is_team_lead, :boolean, expr(team_role == :team_lead)

    # calculate :full_permissions, :map do
    #   # This will aggregate permissions based on role and team_role
    #   # Will be implemented after permission system is designed
    # end
  end

  identities do
    identity :unique_user_company, [:authn_user_id, :company_id]
  end

  policies do
    # Multi-tenancy: All queries automatically filtered by company_id
    # This will be implemented in the multi-tenancy policies task

    # Policy: Company members can read authz_users in their company
    policy action_type(:read) do
      authorize_if always()
    end

    # Policy: Admins can manage authz_users
    policy action([:create, :update_role, :assign_to_team, :remove_from_team, :suspend, :reactivate]) do
      # authorize_if expr(exists(company.authz_users, authn_user_id == ^actor(:id) and role == :admin))
      authorize_if always()
    end

    # Policy: Can destroy (remove from company)
    policy action(:destroy) do
      authorize_if always()
    end
  end
end
