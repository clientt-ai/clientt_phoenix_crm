defmodule ClienttCrmApp.Forms.FormTest do
  use ClienttCrmApp.DataCase, async: true

  import ClienttCrmApp.Factory

  alias ClienttCrmApp.Forms

  describe "create/1" do
    test "creates a form with valid attributes" do
      company = company_fixture()
      created_by = authz_user_fixture(%{company: company, role: :admin})

      assert {:ok, form} =
               Forms.Form
               |> Ash.Changeset.for_create(:create, %{
                 name: "Contact Form",
                 description: "Get in touch",
                 company_id: company.id,
                 created_by_id: created_by.id
               })
               |> Ash.create()

      assert form.name == "Contact Form"
      assert form.description == "Get in touch"
      assert form.status == :draft
      assert form.slug == "contact-form"
      assert form.company_id == company.id
      assert form.created_by_id == created_by.id
      assert form.view_count == 0
      assert form.submission_count == 0
    end

    test "generates slug from name" do
      form = form_fixture(%{name: "My Awesome Form!"})
      assert form.slug == "my-awesome-form"
    end

    test "sets default status to draft" do
      form = form_fixture()
      assert form.status == :draft
    end

    test "initializes counters to zero" do
      form = form_fixture()
      assert form.view_count == 0
      assert form.submission_count == 0
    end
  end

  describe "update/1" do
    test "updates a draft form" do
      form = form_fixture(%{status: :draft})

      assert {:ok, updated_form} =
               form
               |> Ash.Changeset.for_update(:update, %{
                 name: "Updated Name",
                 description: "Updated description"
               })
               |> Ash.update()

      assert updated_form.name == "Updated Name"
      assert updated_form.description == "Updated description"
    end

    test "cannot update published form" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      assert {:error, %Ash.Error.Invalid{}} =
               published_form
               |> Ash.Changeset.for_update(:update, %{name: "New Name"})
               |> Ash.update()
    end

    test "cannot update archived form" do
      form = form_fixture()
      {:ok, archived_form} = archive_form(form)

      assert {:error, %Ash.Error.Invalid{}} =
               archived_form
               |> Ash.Changeset.for_update(:update, %{name: "New Name"})
               |> Ash.update()
    end
  end

  describe "publish/1" do
    test "publishes a draft form" do
      form = form_fixture(%{status: :draft})

      assert {:ok, published_form} =
               form
               |> Ash.Changeset.for_update(:publish)
               |> Ash.update()

      assert published_form.status == :published
      assert published_form.published_at != nil
    end

    test "sets published_at timestamp" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      assert %DateTime{} = published_form.published_at
    end
  end

  describe "archive/1" do
    test "archives a form" do
      form = form_fixture()

      assert {:ok, archived_form} =
               form
               |> Ash.Changeset.for_update(:archive)
               |> Ash.update()

      assert archived_form.status == :archived
    end

    test "can archive published form" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      assert {:ok, archived_form} =
               published_form
               |> Ash.Changeset.for_update(:archive)
               |> Ash.update()

      assert archived_form.status == :archived
    end
  end

  describe "destroy/1" do
    test "cannot delete forms" do
      form = form_fixture()

      assert {:error, %Ash.Error.Forbidden{}} =
               form
               |> Ash.Changeset.for_destroy(:destroy)
               |> Ash.destroy()
    end
  end

  describe "duplicate/1" do
    test "duplicates a form" do
      form = form_fixture(%{name: "Original Form", description: "Original description"})

      assert {:ok, duplicated_form} =
               Forms.Form
               |> Ash.Changeset.for_create(:duplicate, %{
                 source_form_id: form.id,
                 created_by_id: form.created_by_id
               })
               |> Ash.create()

      assert duplicated_form.name == "Original Form (copy)"
      assert duplicated_form.slug == String.slice(form.slug, 0, 50) <> "-copy"
      assert duplicated_form.description == form.description
      assert duplicated_form.status == :draft
      assert duplicated_form.company_id == form.company_id
      assert duplicated_form.published_at == nil
    end
  end

  describe "increment_view_count/1" do
    test "increments view count atomically" do
      form = form_fixture()
      assert form.view_count == 0

      {:ok, updated_form} =
        form
        |> Ash.Changeset.for_update(:increment_view_count)
        |> Ash.update()

      assert updated_form.view_count == 1
    end
  end

  describe "increment_submission_count/1" do
    test "increments submission count atomically" do
      form = form_fixture()
      assert form.submission_count == 0

      {:ok, updated_form} =
        form
        |> Ash.Changeset.for_update(:increment_submission_count)
        |> Ash.update()

      assert updated_form.submission_count == 1
    end
  end

  describe "for_company/1" do
    test "returns only forms for the specified company" do
      company_a = company_fixture(%{name: "Company A"})
      company_b = company_fixture(%{name: "Company B"})

      form_a1 = form_fixture(%{company: company_a, name: "Form A1"})
      form_a2 = form_fixture(%{company: company_a, name: "Form A2"})
      _form_b = form_fixture(%{company: company_b, name: "Form B"})

      {:ok, forms} =
        Forms.Form
        |> Ash.Query.for_read(:for_company, %{company_id: company_a.id})
        |> Ash.read()

      form_ids = Enum.map(forms, & &1.id)
      assert form_a1.id in form_ids
      assert form_a2.id in form_ids
      assert length(forms) == 2
    end
  end

  describe "published/0" do
    test "returns only published forms" do
      draft_form = form_fixture(%{name: "Draft"})
      published_form = form_fixture(%{name: "Published"})
      {:ok, published_form} = publish_form(published_form)

      {:ok, forms} =
        Forms.Form
        |> Ash.Query.for_read(:published)
        |> Ash.read()

      form_ids = Enum.map(forms, & &1.id)
      assert published_form.id in form_ids
      refute draft_form.id in form_ids
    end
  end

  describe "by_slug/1" do
    test "finds form by slug" do
      form = form_fixture(%{name: "Unique Form"})

      {:ok, found_form} =
        Forms.Form
        |> Ash.Query.for_read(:by_slug, %{slug: form.slug})
        |> Ash.read_one()

      assert found_form.id == form.id
    end
  end

  describe "calculations" do
    test "calculates conversion_rate" do
      form = form_fixture()

      # Update counters directly using Ecto for testing
      import Ecto.Query

      # Convert UUID string to binary for Postgres
      {:ok, form_id_binary} = Ecto.UUID.dump(form.id)

      ClienttCrmApp.Repo.update_all(
        from(f in "forms_forms", where: f.id == ^form_id_binary),
        set: [view_count: 100, submission_count: 25]
      )

      # Load calculation
      form = Forms.Form |> Ash.get!(form.id, load: [:conversion_rate])

      assert Decimal.to_float(form.conversion_rate) == 25.0
    end

    test "conversion_rate is 0 when view_count is 0" do
      form = form_fixture()
      form = Forms.Form |> Ash.get!(form.id, load: [:conversion_rate])

      assert Decimal.to_float(form.conversion_rate) == 0.0
    end

    test "is_published calculation" do
      draft_form = form_fixture()
      published_form = form_fixture()
      {:ok, published_form} = publish_form(published_form)

      draft_form = Forms.Form |> Ash.get!(draft_form.id, load: [:is_published])
      published_form = Forms.Form |> Ash.get!(published_form.id, load: [:is_published])

      assert draft_form.is_published == false
      assert published_form.is_published == true
    end
  end

  describe "multi-tenancy" do
    test "forms have unique names per company, not globally" do
      company_a = company_fixture(%{name: "Company A"})
      company_b = company_fixture(%{name: "Company B"})

      # Create form with same name in different companies - should succeed
      _form_a = form_fixture(%{company: company_a, name: "Contact Form"})
      _form_b = form_fixture(%{company: company_b, name: "Contact Form"})
    end

    test "cannot create forms with duplicate name in same company" do
      company = company_fixture()
      created_by = authz_user_fixture(%{company: company, role: :admin})
      _form1 = form_fixture(%{company: company, name: "Contact Form"})

      # Try to create duplicate - should fail
      assert {:error, %Ash.Error.Invalid{}} =
               Forms.Form
               |> Ash.Changeset.for_create(:create, %{
                 name: "Contact Form",
                 description: "Test",
                 company_id: company.id,
                 created_by_id: created_by.id
               })
               |> Ash.create(authorize?: false)
    end

    test "forms have unique slugs per company, not globally" do
      company_a = company_fixture(%{name: "Company A"})
      company_b = company_fixture(%{name: "Company B"})

      form_a = form_fixture(%{company: company_a, name: "Contact"})
      form_b = form_fixture(%{company: company_b, name: "Contact"})

      assert form_a.slug == form_b.slug
      assert form_a.company_id != form_b.company_id
    end
  end
end
