defmodule ClienttCrmAppWeb.LiveUserAuth do
  @moduledoc """
  Helpers for authenticating users in LiveViews.
  """

  import Phoenix.Component
  use ClienttCrmAppWeb, :verified_routes

  # This is used for nested liveviews to fetch the current user.
  # To use, place the following at the top of that liveview:
  # on_mount {ClienttCrmAppWeb.LiveUserAuth, :current_user}
  def on_mount(:current_user, _params, session, socket) do
    {:cont, AshAuthentication.Phoenix.LiveSession.assign_new_resources(socket, session)}
  end

  def on_mount(:live_user_optional, _params, _session, socket) do
    if socket.assigns[:current_user] do
      {:cont, socket}
    else
      {:cont, assign(socket, :current_user, nil)}
    end
  end

  def on_mount(:live_user_required, _params, _session, socket) do
    if socket.assigns[:current_user] do
      # Load user's primary company (first active authz_user)
      socket = load_user_company(socket)
      {:cont, socket}
    else
      {:halt, Phoenix.LiveView.redirect(socket, to: ~p"/sign-in")}
    end
  end

  defp load_user_company(socket) do
    case get_user_company_id(socket.assigns.current_user) do
      {:ok, company_id} ->
        assign(socket, :current_company_id, company_id)

      {:error, _} ->
        # No company found - user needs to be added to a company
        assign(socket, :current_company_id, nil)
    end
  end

  defp get_user_company_id(user) do
    # Get user's first active company from AuthzUser
    import Ash.Query

    case ClienttCrmApp.Authorization.AuthzUser
         |> filter(authn_user_id == ^user.id and status == :active)
         |> limit(1)
         |> Ash.read() do
      {:ok, [authz_user | _]} -> {:ok, authz_user.company_id}
      {:ok, []} -> {:error, :no_company}
      {:error, error} -> {:error, :error}
    end
  end

  def on_mount(:live_no_user, _params, _session, socket) do
    if socket.assigns[:current_user] do
      {:halt, Phoenix.LiveView.redirect(socket, to: ~p"/")}
    else
      {:cont, assign(socket, :current_user, nil)}
    end
  end
end
