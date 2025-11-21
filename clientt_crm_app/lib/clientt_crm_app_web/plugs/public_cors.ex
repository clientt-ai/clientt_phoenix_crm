defmodule ClienttCrmAppWeb.Plugs.PublicCors do
  @moduledoc """
  CORS plug for public form API endpoints.

  Handles Cross-Origin Resource Sharing for embeddable form widget.
  Checks form's allowed_domains setting if configured, otherwise allows all origins.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    origin = get_req_header(conn, "origin") |> List.first()

    conn
    |> put_resp_header("access-control-allow-origin", origin || "*")
    |> put_resp_header("access-control-allow-methods", "GET, POST, OPTIONS")
    |> put_resp_header("access-control-allow-headers", "content-type, accept, origin")
    |> put_resp_header("access-control-max-age", "3600")
    |> handle_preflight()
  end

  defp handle_preflight(%{method: "OPTIONS"} = conn) do
    conn
    |> send_resp(204, "")
    |> halt()
  end

  defp handle_preflight(conn), do: conn

  @doc """
  Validates origin against form's allowed_domains setting.
  Returns true if allowed, false otherwise.
  """
  def validate_origin(origin, allowed_domains) when is_list(allowed_domains) do
    case allowed_domains do
      [] -> true  # Empty list = allow all
      domains ->
        origin_host = extract_host(origin)
        Enum.any?(domains, fn domain ->
          String.contains?(origin_host, domain) or origin_host == domain
        end)
    end
  end

  def validate_origin(_origin, _), do: true

  defp extract_host(nil), do: ""
  defp extract_host(origin) do
    case URI.parse(origin) do
      %URI{host: host} when is_binary(host) -> host
      _ -> origin
    end
  end
end
