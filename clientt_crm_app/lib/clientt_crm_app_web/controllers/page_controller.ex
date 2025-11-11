defmodule ClienttCrmAppWeb.PageController do
  use ClienttCrmAppWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
