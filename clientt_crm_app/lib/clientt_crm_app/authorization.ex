defmodule ClienttCrmApp.Authorization do
  @moduledoc """
  Authorization domain for multi-tenant access control.

  Manages company-based multi-tenancy, role-based access control (RBAC),
  and authorization identities separate from authentication.

  ## Key Concepts

  - **authn_user**: Authentication user (WHO you are) from Accounts domain
  - **authz_user**: Authorization user (WHAT you can do in each company)
  - **Company**: Tenant organization (aggregate root)
  - **Team**: Sub-group within a company
  - **Row-level tenancy**: Multi-tenancy using tenant_id filtering

  ## Resources

  - `Company` - Tenant organization (aggregate root)
  - `AuthzUser` - Authorization identity linking authn_user to company with role
  - `Team` - Sub-group within company for organizing users
  - `Invitation` - Email-based invitation to join a company
  - `CompanySettings` - Company-specific configuration and feature flags
  - `AuditLog` - Immutable log of all authorization changes
  """

  use Ash.Domain,
    otp_app: :clientt_crm_app

  resources do
    resource ClienttCrmApp.Authorization.Company
    resource ClienttCrmApp.Authorization.AuthzUser
    resource ClienttCrmApp.Authorization.Team
    resource ClienttCrmApp.Authorization.CompanySettings
  end
end
