defmodule ClienttCrmApp.Repo do
  use AshPostgres.Repo,
    otp_app: :clientt_crm_app

  @impl true
  def installed_extensions do
    # Add extensions here, and the migration generator will install them.
    # The "ash-functions" extension includes uuid_generate_v7() for time-ordered UUIDs
    ["ash-functions", "citext"]
  end

  # Don't open unnecessary transactions
  # will default to `false` in 4.0
  @impl true
  def prefer_transaction? do
    false
  end

  @impl true
  def min_pg_version do
    %Version{major: 16, minor: 0, patch: 0}
  end

  # Note: This project uses UUID v7 for all UUID primary keys.
  # The uuid_generate_v7() function is installed via the "ash-functions" extension.
  # When creating new resources with uuid_primary_key, ensure migrations use
  # uuid_generate_v7() instead of gen_random_uuid() for better index performance.
end
