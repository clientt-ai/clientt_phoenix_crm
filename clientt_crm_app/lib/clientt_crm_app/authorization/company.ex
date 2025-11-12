defmodule ClienttCrmApp.Authorization.Company do
  @moduledoc """
  Company resource - Aggregate root for multi-tenant authorization.

  Represents a tenant organization in the multi-tenant CRM system.
  Users can belong to multiple companies with different roles in each.

  ## Aggregate Root
  This resource is the aggregate root for:
  - CompanySettings (1:1)
  - AuthzUser (1:Many)
  - Team (1:Many)
  - Invitation (1:Many)
  - AuditLog (1:Many)

  ## Business Rules
  - Slug must be globally unique across all companies
  - Once archived, cannot be reactivated (create new company instead)
  - Cannot delete company that has active authz_users (must archive first)
  """

  use Ash.Resource,
    otp_app: :clientt_crm_app,
    domain: ClienttCrmApp.Authorization,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "authz_companies"
    repo ClienttCrmApp.Repo
  end

  actions do
    defaults [:read]

    read :list do
      primary? true
    end

    create :create do
      primary? true
      accept [:name, :slug]

      argument :first_admin_authn_user_id, :uuid do
        allow_nil? false
      end

      change fn changeset, context ->
        # Set initial status to active
        changeset = Ash.Changeset.force_change_attribute(changeset, :status, :active)

        # After company is created, create the first admin authz_user and settings
        Ash.Changeset.after_action(changeset, fn changeset, company ->
          first_admin_id = Ash.Changeset.get_argument(changeset, :first_admin_authn_user_id)

          # Create first admin authz_user
          with {:ok, _authz_user} <-
                 ClienttCrmApp.Authorization.AuthzUser
                 |> Ash.Changeset.for_create(:create, %{
                   authn_user_id: first_admin_id,
                   company_id: company.id,
                   role: :admin
                 })
                 |> Ash.create(),
               # Create company settings
               {:ok, _settings} <-
                 ClienttCrmApp.Authorization.CompanySettings
                 |> Ash.Changeset.for_create(:create, %{
                   company_id: company.id
                 })
                 |> Ash.create() do
            {:ok, company}
          else
            {:error, error} -> {:error, error}
          end
        end)
      end
    end

    update :update do
      primary? true
      accept [:name]
    end

    update :archive do
      accept []
      require_atomic? false

      change fn changeset, _context ->
        Ash.Changeset.force_change_attribute(changeset, :status, :archived)
      end

      # TODO: Add after_action to cascade archival to authz_users, teams, and invitations
      # This will be implemented after migrations are set up and relationships are working
    end

    destroy :destroy do
      primary? false

      validate fn changeset, _context ->
        {:error, message: "Cannot delete companies. Use archive action instead."}
      end
    end
  end

  attributes do
    uuid_primary_key :id

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

    attribute :status, :atom do
      allow_nil? false
      public? true
      default :active
      constraints one_of: [:active, :archived]
    end

    attribute :settings_id, :uuid do
      allow_nil? true
      public? false
    end

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    has_many :authz_users, ClienttCrmApp.Authorization.AuthzUser do
      destination_attribute :company_id
    end

    has_many :teams, ClienttCrmApp.Authorization.Team do
      destination_attribute :company_id
    end

    has_one :settings, ClienttCrmApp.Authorization.CompanySettings do
      destination_attribute :company_id
    end

    # has_many :invitations, ClienttCrmApp.Authorization.Invitation
    # has_many :audit_logs, ClienttCrmApp.Authorization.AuditLog

    # Relationships will be uncommented as resources are created
  end

  calculations do
    # calculate :active_users_count, :integer do
    #   calculation fn records, _context ->
    #     # Count active authz_users for each company
    #   end
    # end

    # calculate :admin_count, :integer do
    #   calculation fn records, _context ->
    #     # Count admin authz_users for each company
    #   end
    # end

    # calculate :teams_count, :integer do
    #   calculation fn records, _context ->
    #     # Count active teams for each company
    #   end
    # end

    # Calculations will be implemented after related resources exist
  end

  identities do
    identity :unique_slug, [:slug]
  end

  policies do
    # Policy: Anyone can create a company (new user registration)
    policy action(:create) do
      authorize_if always()
    end

    # Policy: Members can read their companies
    policy action_type(:read) do
      # User can read companies they belong to (via authz_users relationship)
      # This will be implemented once AuthzUser resource exists
      authorize_if always()
    end

    # Policy: Only admins can update or archive
    policy action([:update, :archive]) do
      # authorize_if expr(exists(authz_users, authn_user_id == ^actor(:id) and role == :admin))
      # This will be implemented once AuthzUser resource exists and we have proper actor context
      authorize_if always()
    end
  end
end
