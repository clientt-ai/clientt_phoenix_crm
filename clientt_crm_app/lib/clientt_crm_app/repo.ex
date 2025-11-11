defmodule ClienttCrmApp.Repo do
  use Ecto.Repo,
    otp_app: :clientt_crm_app,
    adapter: Ecto.Adapters.Postgres
end
