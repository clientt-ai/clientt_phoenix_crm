defmodule ClienttCrmApp.Factory do
  @moduledoc """
  Test data factories for creating resources in tests.
  """

  alias ClienttCrmApp.{Accounts, Authorization, Forms}

  @doc """
  Creates a user for authentication (authn_user).
  """
  def user_fixture(attrs \\ %{}) do
    email = attrs[:email] || "user#{System.unique_integer([:positive])}@example.com"
    password = attrs[:password] || "Password123!@#"

    {:ok, user} =
      Accounts.AuthnUser
      |> Ash.Changeset.for_create(:register_with_password, %{
        email: email,
        password: password,
        password_confirmation: password
      })
      |> Ash.create(authorize?: false)

    user
  end

  @doc """
  Creates a company (tenant organization).
  """
  def company_fixture(attrs \\ %{}) do
    name = attrs[:name] || "Company #{System.unique_integer([:positive])}"
    slug = attrs[:slug] || "company-#{System.unique_integer([:positive])}"

    # Need a user to be the first admin
    first_admin_user = attrs[:first_admin_user] || user_fixture()

    {:ok, company} =
      Authorization.Company
      |> Ash.Changeset.for_create(:create, %{
        name: name,
        slug: slug,
        first_admin_authn_user_id: first_admin_user.id
      })
      |> Ash.create(authorize?: false)

    company
  end

  @doc """
  Creates an authorization user (authz_user) linking authn_user to company.
  """
  def authz_user_fixture(attrs \\ %{}) do
    company = attrs[:company] || company_fixture()
    authn_user = attrs[:authn_user] || user_fixture()
    role = attrs[:role] || :user

    # Check if authz_user already exists for this user+company
    existing =
      Authorization.AuthzUser
      |> Ash.Query.for_read(:get_by_user_and_company, %{
        authn_user_id: authn_user.id,
        tenant_id: company.id
      })
      |> Ash.read_one()

    case existing do
      {:ok, authz_user} when not is_nil(authz_user) ->
        authz_user

      _ ->
        {:ok, authz_user} =
          Authorization.AuthzUser
          |> Ash.Changeset.for_create(:create, %{
            authn_user_id: authn_user.id,
            tenant_id: company.id,
            role: role
          })
          |> Ash.create(authorize?: false)

        authz_user
    end
  end

  @doc """
  Creates a form.
  """
  def form_fixture(attrs \\ %{}) do
    company = attrs[:company] || company_fixture()
    created_by = attrs[:created_by] || authz_user_fixture(%{company: company, role: :admin})

    name = attrs[:name] || "Form #{System.unique_integer([:positive])}"
    description = attrs[:description] || "Test form description"

    {:ok, form} =
      Forms.Form
      |> Ash.Changeset.for_create(:create, %{
        name: name,
        description: description,
        branding: attrs[:branding] || %{},
        settings: attrs[:settings] || %{},
        tenant_id: company.id,
        created_by_id: created_by.id
      })
      |> Ash.create(authorize?: false)

    form
  end

  @doc """
  Creates a form field.
  """
  def form_field_fixture(attrs \\ %{}) do
    form = attrs[:form] || form_fixture()
    field_type = attrs[:field_type] || :text
    label = attrs[:label] || "Field #{System.unique_integer([:positive])}"

    # For select/radio types, ensure options are provided or use defaults
    options =
      if attrs[:options] do
        attrs[:options]
      else
        if field_type in [:select, :radio] do
          [
            %{label: "Option 1", value: "opt1"},
            %{label: "Option 2", value: "opt2"}
          ]
        else
          []
        end
      end

    field_attrs = %{
      form_id: form.id,
      field_type: field_type,
      label: label,
      placeholder: attrs[:placeholder],
      help_text: attrs[:help_text],
      required: attrs[:required] || false,
      order_position: attrs[:order_position] || 0,
      options: options,
      validation_rules: attrs[:validation_rules] || %{}
    }

    {:ok, field} =
      Forms.FormField
      |> Ash.Changeset.for_create(:create, field_attrs)
      |> Ash.create(authorize?: false)

    field
  end

  @doc """
  Creates a form submission.
  """
  def submission_fixture(attrs \\ %{}) do
    form = attrs[:form] || form_fixture()
    company = attrs[:company] || form.tenant_id

    # Ensure form is published if using public submission
    form =
      if attrs[:public] do
        unless form.status == :published do
          {:ok, updated_form} =
            form
            |> Ash.Changeset.for_update(:publish)
            |> Ash.update(authorize?: false)

          updated_form
        else
          form
        end
      else
        form
      end

    form_data = attrs[:form_data] || %{"field-1" => "Test Value"}
    metadata = attrs[:metadata] || %{}

    action = if attrs[:public], do: :create_public_submission, else: :create

    changeset_attrs =
      if attrs[:public] do
        %{
          form_id: form.id,
          form_data: form_data,
          metadata: metadata
        }
      else
        %{
          form_id: form.id,
          tenant_id: company,
          form_data: form_data,
          metadata: metadata,
          submitter_email: attrs[:submitter_email]
        }
      end

    {:ok, submission} =
      Forms.Submission
      |> Ash.Changeset.for_create(action, changeset_attrs)
      |> Ash.create(authorize?: false)

    submission
  end

  @doc """
  Creates a notification.
  """
  def notification_fixture(attrs \\ %{}) do
    user = attrs[:user] || authz_user_fixture()

    {:ok, notification} =
      Forms.Notification
      |> Ash.Changeset.for_create(:create, %{
        user_id: user.id,
        type: attrs[:type] || "new_submission",
        title: attrs[:title] || "Test Notification",
        message: attrs[:message] || "This is a test notification",
        link: attrs[:link],
        metadata: attrs[:metadata] || %{}
      })
      |> Ash.create(authorize?: false)

    notification
  end

  @doc """
  Publishes a form (helper).
  """
  def publish_form(form) do
    form
    |> Ash.Changeset.for_update(:publish)
    |> Ash.update(authorize?: false)
  end

  @doc """
  Archives a form (helper).
  """
  def archive_form(form) do
    form
    |> Ash.Changeset.for_update(:archive)
    |> Ash.update(authorize?: false)
  end
end
