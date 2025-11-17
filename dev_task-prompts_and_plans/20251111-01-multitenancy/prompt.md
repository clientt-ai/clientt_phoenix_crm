i want to make my application multi-tenant/authorization starting with a table called "authz_companies".  Users can belong to one or more companies.
  Users can have different roles with each company they're apart of.  So a user can be configured on their company level and then on an application
  level.  Can you help me spec out this new domain.  The domain prefix for any new tables will be "authz_".  there should be a difference between
  authz_users and authn_users.  authn_users will be the login identity of a user, authz_users will be the authorization of a user that is linked to a
  authz_company.  Please help me spec this out using ddd and bdd and into proper project specs, feel free to ask me questions 