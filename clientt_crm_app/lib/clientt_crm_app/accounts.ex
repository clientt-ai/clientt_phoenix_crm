defmodule ClienttCrmApp.Accounts do
  use Ash.Domain,
    otp_app: :clientt_crm_app

  resources do
    resource ClienttCrmApp.Accounts.Token
    resource ClienttCrmApp.Accounts.AuthnUser
  end
end
