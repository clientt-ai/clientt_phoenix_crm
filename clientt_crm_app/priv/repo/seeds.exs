# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     ClienttCrmApp.Repo.insert!(%ClienttCrmApp.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

require Ash.Query

alias ClienttCrmApp.Accounts.User
alias ClienttCrmApp.Authorization.{Company, AuthzUser}

IO.puts("🌱 Starting database seeding...")

# Sample Company Configuration
company_name = "Clientt Sample Inc."
company_slug = "clientt-sample"

# All roles in the system
roles = [:admin, :manager, :user, :form_admin]

# Step 1: Create or get the sample company
IO.puts("\n📦 Setting up sample company: #{company_name}")

company =
  case Company
       |> Ash.Query.filter(slug == ^company_slug)
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      IO.puts("  ➕ Creating new company...")

      # First create a temporary admin user to bootstrap the company
      temp_admin_email = "temp_bootstrap_admin@clientt.com"

      temp_admin =
        case User
             |> Ash.Query.filter(email == ^temp_admin_email)
             |> Ash.read_one(authorize?: false) do
          {:ok, nil} ->
            {:ok, user} =
              User
              |> Ash.Changeset.for_create(:register_with_password, %{
                email: temp_admin_email,
                password: "TempBootstrap123!",
                password_confirmation: "TempBootstrap123!"
              })
              |> Ash.create(authorize?: false)

            user

          {:ok, user} ->
            user
        end

      # Create the company
      {:ok, new_company} =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: company_name,
          slug: company_slug,
          first_admin_authn_user_id: temp_admin.id
        })
        |> Ash.create(authorize?: false)

      IO.puts("  ✅ Company created with ID: #{new_company.id}")
      new_company

    {:ok, existing_company} ->
      IO.puts("  ✅ Company already exists with ID: #{existing_company.id}")
      existing_company

    {:error, error} ->
      IO.puts("  ❌ Error finding company: #{inspect(error)}")
      raise "Failed to setup company"
  end

# Step 2: Create sample users for each role
IO.puts("\n👥 Setting up sample users for all roles...")

for role <- roles do
  email = "sample_#{role}@clientt.com"
  display_name = "Sample #{String.capitalize(to_string(role))}"
  password = "Sample#{String.capitalize(to_string(role))}123!"

  IO.puts("\n  📧 Processing #{email} (#{role})...")

  # Create or get the authentication user
  authn_user =
    case User
         |> Ash.Query.filter(email == ^email)
         |> Ash.read_one(authorize?: false) do
      {:ok, nil} ->
        IO.puts("    ➕ Creating authentication user...")

        {:ok, user} =
          User
          |> Ash.Changeset.for_create(:register_with_password, %{
            email: email,
            password: password,
            password_confirmation: password
          })
          |> Ash.create(authorize?: false)

        IO.puts("    ✅ Authentication user created")
        user

      {:ok, existing_user} ->
        IO.puts("    ✅ Authentication user already exists")
        existing_user

      {:error, error} ->
        IO.puts("    ❌ Error with authentication user: #{inspect(error)}")
        nil
    end

  if authn_user do
    # Create or update the authorization user (AuthzUser)
    case AuthzUser
         |> Ash.Query.filter(authn_user_id == ^authn_user.id and company_id == ^company.id)
         |> Ash.read_one(authorize?: false) do
      {:ok, nil} ->
        IO.puts("    ➕ Creating authorization record...")

        case AuthzUser
             |> Ash.Changeset.for_create(:create, %{
               authn_user_id: authn_user.id,
               company_id: company.id,
               role: role,
               display_name: display_name
             })
             |> Ash.create(authorize?: false) do
          {:ok, _authz_user} ->
            IO.puts("    ✅ Authorization record created with role: #{role}")

          {:error, error} ->
            IO.puts("    ❌ Error creating authorization record: #{inspect(error)}")
        end

      {:ok, existing_authz} ->
        IO.puts("    ✅ Authorization record already exists")

        # Update role if different
        if existing_authz.role != role do
          IO.puts("    🔄 Updating role from #{existing_authz.role} to #{role}...")

          case existing_authz
               |> Ash.Changeset.for_update(:update_role, %{role: role})
               |> Ash.update(authorize?: false) do
            {:ok, _} ->
              IO.puts("    ✅ Role updated")

            {:error, error} ->
              IO.puts("    ❌ Error updating role: #{inspect(error)}")
          end
        end

      {:error, error} ->
        IO.puts("    ❌ Error finding authorization record: #{inspect(error)}")
    end
  end
end

IO.puts("\n" <> String.duplicate("=", 60))
IO.puts("✅ Seeding complete!")
IO.puts(String.duplicate("=", 60))
IO.puts("\n📝 Sample Users Created:")
IO.puts("   Company: #{company_name} (#{company_slug})")
IO.puts("")

for role <- roles do
  email = "sample_#{role}@clientt.com"
  password = "Sample#{String.capitalize(to_string(role))}123!"
  IO.puts("   • #{email}")
  IO.puts("     Role: #{role}")
  IO.puts("     Password: #{password}")
  IO.puts("")
end

IO.puts("🚀 You can now sign in with any of these accounts!")
IO.puts(String.duplicate("=", 60))
