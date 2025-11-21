defmodule ClienttCrmAppWeb.PageController do
  use ClienttCrmAppWeb, :controller

  def home(conn, _params) do
    # Check if user is authenticated
    case conn.assigns[:current_user] do
      nil ->
        # Not authenticated, redirect to sign-in page
        redirect(conn, to: ~p"/sign-in")

      _user ->
        # Authenticated, redirect to dashboard
        redirect(conn, to: ~p"/forms_dashboard")
    end
  end
end
