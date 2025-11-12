defmodule ClienttCrmApp.Authorization.CompanyTest do
  @moduledoc """
  Tests for Company resource.

  Based on BDD scenarios from:
  - specs/01-domains/authorization/features/company_management.feature.md
  - specs/01-domains/authorization/resources/company.md
  """

  use ClienttCrmApp.DataCase

  alias ClienttCrmApp.Authorization.Company
  alias ClienttCrmApp.Authorization.AuthzUser
  alias ClienttCrmApp.Accounts.User

  describe "create company" do
    test "creates company with valid attributes and first admin" do
      # Create a user for the admin (bypass authorization in tests)
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      # Create company with first admin
      company =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme-corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)

      assert company.name == "Acme Corp"
      assert company.slug == "acme-corp"
      assert company.status == :active

      # Verify first admin authz_user was created
      all_authz_users = Ash.read!(AuthzUser)
      authz_users = Enum.filter(all_authz_users, fn au -> au.company_id == company.id end)

      assert length(authz_users) == 1
      [authz_user] = authz_users
      assert authz_user.authn_user_id == user.id
      assert authz_user.role == :admin
      assert authz_user.status == :active
    end

    test "slug must be unique" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      # Create first company
      Company
      |> Ash.Changeset.for_create(:create, %{
        name: "Acme Corp",
        slug: "acme",
        first_admin_authn_user_id: user.id
      })
      |> Ash.create!(authorize?: false)

      # Attempt to create second company with same slug
      assert_raise Ash.Error.Invalid, fn ->
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Inc",
          slug: "acme",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "name must be at least 2 characters" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      assert_raise Ash.Error.Invalid, fn ->
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "A",
          slug: "a",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)
      end
    end

    test "slug must be lowercase and URL-safe" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      # Invalid: uppercase
      assert_raise Ash.Error.Invalid, fn ->
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "AcmeCorp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)
      end

      # Invalid: spaces
      assert_raise Ash.Error.Invalid, fn ->
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)
      end

      # Valid: lowercase with hyphens
      Company
      |> Ash.Changeset.for_create(:create, %{
        name: "Acme Corp",
        slug: "acme-corp",
        first_admin_authn_user_id: user.id
      })
      |> Ash.create!(authorize?: false)
    end
  end

  describe "read company" do
    test "can read company by id" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      company =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme-corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)

      fetched_company = Ash.get!(Company, company.id)
      assert fetched_company.id == company.id
      assert fetched_company.name == "Acme Corp"
    end

    test "can list companies" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      Company
      |> Ash.Changeset.for_create(:create, %{
        name: "Acme Corp",
        slug: "acme-corp",
        first_admin_authn_user_id: user.id
      })
      |> Ash.create!(authorize?: false)

      Company
      |> Ash.Changeset.for_create(:create, %{
        name: "Beta Inc",
        slug: "beta-inc",
        first_admin_authn_user_id: user.id
      })
      |> Ash.create!(authorize?: false)

      companies = Ash.read!(Company)
      assert length(companies) >= 2
    end
  end

  describe "update company" do
    test "can update company name" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      company =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme-corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)

      updated_company =
        company
        |> Ash.Changeset.for_update(:update, %{name: "Acme Corporation"})
        |> Ash.update!()

      assert updated_company.name == "Acme Corporation"
      assert updated_company.slug == "acme-corp"  # slug should not change
    end
  end

  describe "archive company" do
    test "can archive a company" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      company =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme-corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)

      archived_company =
        company
        |> Ash.Changeset.for_update(:archive, %{})
        |> Ash.update!()

      assert archived_company.status == :archived
    end
  end

  describe "destroy company" do
    test "cannot destroy company - must archive instead" do
      user =
        User
        |> Ash.Changeset.for_create(:register_with_password, %{
          email: "admin@example.com",
          password: "ValidPassword123!",
          password_confirmation: "ValidPassword123!"
        })
        |> Ash.create!(authorize?: false)

      company =
        Company
        |> Ash.Changeset.for_create(:create, %{
          name: "Acme Corp",
          slug: "acme-corp",
          first_admin_authn_user_id: user.id
        })
        |> Ash.create!(authorize?: false)

      assert_raise Ash.Error.Invalid, fn ->
        company
        |> Ash.Changeset.for_destroy(:destroy)
        |> Ash.destroy!()
      end
    end
  end
end
