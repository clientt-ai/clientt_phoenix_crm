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

alias ClienttCrmApp.Accounts.AuthnUser
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
        case AuthnUser
             |> Ash.Query.filter(email == ^temp_admin_email)
             |> Ash.read_one(authorize?: false) do
          {:ok, nil} ->
            {:ok, user} =
              AuthnUser
              |> Ash.Changeset.for_create(:register_with_password, %{
                email: temp_admin_email,
                password: "Hang123!",
                password_confirmation: "Hang123!"
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
  password = "Hang123!"

  IO.puts("\n  📧 Processing #{email} (#{role})...")

  # Create or get the authentication user
  authn_user =
    case AuthnUser
         |> Ash.Query.filter(email == ^email)
         |> Ash.read_one(authorize?: false) do
      {:ok, nil} ->
        IO.puts("    ➕ Creating authentication user...")

        {:ok, user} =
          AuthnUser
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
         |> Ash.Query.filter(authn_user_id == ^authn_user.id and tenant_id == ^company.id)
         |> Ash.read_one(authorize?: false) do
      {:ok, nil} ->
        IO.puts("    ➕ Creating authorization record...")

        case AuthzUser
             |> Ash.Changeset.for_create(:create, %{
               authn_user_id: authn_user.id,
               tenant_id: company.id,
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
  password = "Hang123!"
  IO.puts("   • #{email}")
  IO.puts("     Role: #{role}")
  IO.puts("     Password: #{password}")
  IO.puts("")
end

IO.puts("🚀 You can now sign in with any of these accounts!")
IO.puts(String.duplicate("=", 60))

# Step 3: Create sample forms with various field types
IO.puts("\n📋 Creating sample forms...")

alias ClienttCrmApp.Forms.{Form, FormField}

# Get the admin user to create forms
admin_email = "sample_admin@clientt.com"

{:ok, admin_authn_user} =
  AuthnUser
  |> Ash.Query.filter(email == ^admin_email)
  |> Ash.read_one(authorize?: false)

{:ok, admin_authz_user} =
  AuthzUser
  |> Ash.Query.filter(authn_user_id == ^admin_authn_user.id and tenant_id == ^company.id)
  |> Ash.read_one(authorize?: false)

# Sample Form 1: Contact Form (Published)
IO.puts("  📝 Creating Contact Form...")

contact_form =
  case Form
       |> Ash.Query.filter(tenant_id == ^company.id and slug == "contact-us")
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      {:ok, form} =
        Form
        |> Ash.Changeset.new()
        |> Ash.Changeset.set_argument(:tenant_id, company.id)
        |> Ash.Changeset.set_argument(:created_by_id, admin_authz_user.id)
        |> Ash.Changeset.for_create(
          :create,
          %{
            name: "Contact Us",
            description: "Get in touch with our team",
            branding: %{},
            settings: %{}
          }
        )
        |> Ash.create(authorize?: false)

      IO.puts("    ✅ Contact Form created")
      form

    {:ok, existing_form} ->
      IO.puts("    ✅ Contact Form already exists")
      existing_form
  end

# Add fields to Contact Form
contact_fields = [
  %{
    field_type: :text,
    label: "Full Name",
    placeholder: "John Doe",
    help_text: "Please enter your full name",
    required: true,
    order_position: 1
  },
  %{
    field_type: :email,
    label: "Email",
    placeholder: "john@example.com",
    help_text: "We'll never share your email",
    required: true,
    order_position: 2
  },
  %{
    field_type: :phone,
    label: "Phone",
    placeholder: "(555) 123-4567",
    help_text: "Optional contact number",
    required: false,
    order_position: 3
  },
  %{
    field_type: :textarea,
    label: "Message",
    placeholder: "How can we help you?",
    help_text: "Tell us about your inquiry",
    required: true,
    order_position: 4,
    validation_rules: %{"min_length" => 10, "max_length" => 500}
  }
]

for field_data <- contact_fields do
  case FormField
       |> Ash.Query.filter(
         form_id == ^contact_form.id and label == ^field_data.label
       )
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      FormField
      |> Ash.Changeset.new()
      |> Ash.Changeset.set_argument(:form_id, contact_form.id)
      |> Ash.Changeset.for_create(:create, field_data)
      |> Ash.create(authorize?: false)

      IO.puts("      ✅ Added field: #{field_data.label}")

    {:ok, _existing} ->
      IO.puts("      ✅ Field already exists: #{field_data.label}")
  end
end

# Sample Form 2: Job Application Form (Published)
IO.puts("\n  📝 Creating Job Application Form...")

job_form =
  case Form
       |> Ash.Query.filter(tenant_id == ^company.id and slug == "job-application")
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      {:ok, form} =
        Form
        |> Ash.Changeset.new()
        |> Ash.Changeset.set_argument(:tenant_id, company.id)
        |> Ash.Changeset.set_argument(:created_by_id, admin_authz_user.id)
        |> Ash.Changeset.for_create(
          :create,
          %{
            name: "Job Application",
            description: "Apply for open positions at our company",
            branding: %{},
            settings: %{}
          }
        )
        |> Ash.create(authorize?: false)

      IO.puts("    ✅ Job Application Form created")
      form

    {:ok, existing_form} ->
      IO.puts("    ✅ Job Application Form already exists")
      existing_form
  end

# Add fields to Job Application Form
job_fields = [
  %{
    field_type: :text,
    label: "Full Name",
    placeholder: "Jane Smith",
    required: true,
    order_position: 1
  },
  %{
    field_type: :email,
    label: "Email Address",
    placeholder: "jane@example.com",
    required: true,
    order_position: 2
  },
  %{
    field_type: :select,
    label: "Position",
    required: true,
    order_position: 3,
    options: [
      %{"label" => "Software Engineer", "value" => "software_engineer"},
      %{"label" => "Product Manager", "value" => "product_manager"},
      %{"label" => "Sales Representative", "value" => "sales_rep"},
      %{"label" => "Customer Support", "value" => "customer_support"}
    ]
  },
  %{
    field_type: :number,
    label: "Years of Experience",
    placeholder: "5",
    required: true,
    order_position: 4,
    validation_rules: %{"min" => 0, "max" => 50}
  },
  %{
    field_type: :textarea,
    label: "Cover Letter",
    placeholder: "Tell us why you'd be a great fit...",
    required: true,
    order_position: 5,
    validation_rules: %{"min_length" => 100, "max_length" => 2000}
  },
  %{
    field_type: :checkbox,
    label: "I agree to the terms and conditions",
    required: true,
    order_position: 6
  }
]

for field_data <- job_fields do
  case FormField
       |> Ash.Query.filter(
         form_id == ^job_form.id and label == ^field_data.label
       )
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      FormField
      |> Ash.Changeset.new()
      |> Ash.Changeset.set_argument(:form_id, job_form.id)
      |> Ash.Changeset.for_create(:create, field_data)
      |> Ash.create(authorize?: false)

      IO.puts("      ✅ Added field: #{field_data.label}")

    {:ok, _existing} ->
      IO.puts("      ✅ Field already exists: #{field_data.label}")
  end
end

# Sample Form 3: Event Registration (Draft)
IO.puts("\n  📝 Creating Event Registration Form...")

event_form =
  case Form
       |> Ash.Query.filter(tenant_id == ^company.id and slug == "event-registration")
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      {:ok, form} =
        Form
        |> Ash.Changeset.new()
        |> Ash.Changeset.set_argument(:tenant_id, company.id)
        |> Ash.Changeset.set_argument(:created_by_id, admin_authz_user.id)
        |> Ash.Changeset.for_create(
          :create,
          %{
            name: "Event Registration",
            description: "Register for our upcoming event",
            branding: %{},
            settings: %{}
          }
        )
        |> Ash.create(authorize?: false)

      IO.puts("    ✅ Event Registration Form created")
      form

    {:ok, existing_form} ->
      IO.puts("    ✅ Event Registration Form already exists")
      existing_form
  end

# Add fields to Event Registration Form
event_fields = [
  %{
    field_type: :text,
    label: "Attendee Name",
    required: true,
    order_position: 1
  },
  %{
    field_type: :email,
    label: "Email",
    required: true,
    order_position: 2
  },
  %{
    field_type: :radio,
    label: "Ticket Type",
    required: true,
    order_position: 3,
    options: [
      %{"label" => "General Admission", "value" => "general"},
      %{"label" => "VIP", "value" => "vip"},
      %{"label" => "Student", "value" => "student"}
    ]
  },
  %{
    field_type: :date,
    label: "Preferred Date",
    required: true,
    order_position: 4
  }
]

for field_data <- event_fields do
  case FormField
       |> Ash.Query.filter(
         form_id == ^event_form.id and label == ^field_data.label
       )
       |> Ash.read_one(authorize?: false) do
    {:ok, nil} ->
      FormField
      |> Ash.Changeset.new()
      |> Ash.Changeset.set_argument(:form_id, event_form.id)
      |> Ash.Changeset.for_create(:create, field_data)
      |> Ash.create(authorize?: false)

      IO.puts("      ✅ Added field: #{field_data.label}")

    {:ok, _existing} ->
      IO.puts("      ✅ Field already exists: #{field_data.label}")
  end
end

IO.puts("\n✅ Sample forms created successfully!")
IO.puts("\n📊 Forms Summary:")
IO.puts("   • Contact Us (Published) - #{contact_form.id}")
IO.puts("   • Job Application (Published) - #{job_form.id}")
IO.puts("   • Event Registration (Draft) - #{event_form.id}")
