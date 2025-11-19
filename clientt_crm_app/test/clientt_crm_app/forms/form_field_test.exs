defmodule ClienttCrmApp.Forms.FormFieldTest do
  use ClienttCrmApp.DataCase, async: true

  import ClienttCrmApp.Factory

  alias ClienttCrmApp.Forms

  describe "create/1" do
    test "creates a form field with valid attributes" do
      form = form_fixture()

      assert {:ok, field} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :text,
                 label: "Full Name",
                 placeholder: "Enter your full name",
                 help_text: "First and last name",
                 required: true,
                 order_position: 1
               })
               |> Ash.create(authorize?: false)

      assert field.form_id == form.id
      assert field.field_type == :text
      assert field.label == "Full Name"
      assert field.placeholder == "Enter your full name"
      assert field.help_text == "First and last name"
      assert field.required == true
      assert field.order_position == 1
    end

    test "creates fields with all 10 supported field types" do
      form = form_fixture()

      field_types = [:text, :email, :textarea, :select, :checkbox, :radio, :number, :date, :phone, :url]

      for field_type <- field_types do
        attrs = %{
          form_id: form.id,
          field_type: field_type,
          label: "Field #{field_type}",
          order_position: 0
        }

        # Add options for select and radio types (as maps with label and value)
        attrs =
          if field_type in [:select, :radio] do
            Map.put(attrs, :options, [
              %{label: "Option 1", value: "opt1"},
              %{label: "Option 2", value: "opt2"},
              %{label: "Option 3", value: "opt3"}
            ])
          else
            attrs
          end

        assert {:ok, field} =
                 Forms.FormField
                 |> Ash.Changeset.for_create(:create, attrs)
                 |> Ash.create(authorize?: false)

        assert field.field_type == field_type
      end
    end

    test "select and radio fields require options array" do
      form = form_fixture()

      # Test select without options - should fail
      assert {:error, %Ash.Error.Invalid{}} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :select,
                 label: "Select Field",
                 order_position: 0
               })
               |> Ash.create(authorize?: false)

      # Test radio without options - should fail
      assert {:error, %Ash.Error.Invalid{}} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :radio,
                 label: "Radio Field",
                 order_position: 0
               })
               |> Ash.create(authorize?: false)
    end

    test "select field with valid options succeeds" do
      form = form_fixture()

      options = [
        %{label: "USA", value: "usa"},
        %{label: "Canada", value: "can"},
        %{label: "Mexico", value: "mex"}
      ]

      assert {:ok, field} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :select,
                 label: "Country",
                 options: options,
                 order_position: 0
               })
               |> Ash.create(authorize?: false)

      # Options are stored as maps with string keys (JSONB converts atom keys to strings)
      assert field.options == [
               %{"label" => "USA", "value" => "usa"},
               %{"label" => "Canada", "value" => "can"},
               %{"label" => "Mexico", "value" => "mex"}
             ]
    end

    test "sets default values" do
      form = form_fixture()

      assert {:ok, field} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :text,
                 label: "Name",
                 order_position: 0
               })
               |> Ash.create(authorize?: false)

      assert field.required == false
      assert field.options == []
      assert field.validation_rules == %{}
    end
  end

  describe "update/1" do
    test "updates a form field" do
      field = form_field_fixture(%{label: "Original Label"})

      assert {:ok, updated_field} =
               field
               |> Ash.Changeset.for_update(:update, %{
                 label: "Updated Label",
                 help_text: "Updated help text"
               })
               |> Ash.update(authorize?: false)

      assert updated_field.label == "Updated Label"
      assert updated_field.help_text == "Updated help text"
    end

    test "can update required flag" do
      field = form_field_fixture(%{required: false})

      assert {:ok, updated_field} =
               field
               |> Ash.Changeset.for_update(:update, %{required: true})
               |> Ash.update(authorize?: false)

      assert updated_field.required == true
    end

    test "can update order_position" do
      field = form_field_fixture(%{order_position: 1})

      assert {:ok, updated_field} =
               field
               |> Ash.Changeset.for_update(:update, %{order_position: 5})
               |> Ash.update(authorize?: false)

      assert updated_field.order_position == 5
    end

    test "can add options to select field" do
      field =
        form_field_fixture(%{
          field_type: :select,
          options: [%{label: "Option 1", value: "opt1"}]
        })

      new_options = [
        %{label: "Option 1", value: "opt1"},
        %{label: "Option 2", value: "opt2"},
        %{label: "Option 3", value: "opt3"}
      ]

      assert {:ok, updated_field} =
               field
               |> Ash.Changeset.for_update(:update, %{options: new_options})
               |> Ash.update(authorize?: false)

      assert length(updated_field.options) == 3
    end
  end

  describe "destroy/1" do
    test "can delete form fields" do
      field = form_field_fixture()

      assert :ok =
               field
               |> Ash.Changeset.for_destroy(:destroy)
               |> Ash.destroy(authorize?: false)

      # Verify it's deleted - NotFound error may be wrapped in Invalid
      assert {:error, _error} = Forms.FormField |> Ash.get(field.id)
    end
  end

  describe "for_form/1" do
    test "returns fields for a specific form" do
      form1 = form_fixture()
      form2 = form_fixture()

      field1 = form_field_fixture(%{form: form1, label: "Field 1"})
      field2 = form_field_fixture(%{form: form1, label: "Field 2"})
      _field3 = form_field_fixture(%{form: form2, label: "Field 3"})

      {:ok, fields} =
        Forms.FormField
        |> Ash.Query.for_read(:for_form, %{form_id: form1.id})
        |> Ash.read(authorize?: false)

      field_ids = Enum.map(fields, & &1.id)
      assert field1.id in field_ids
      assert field2.id in field_ids
      assert length(fields) == 2
    end

    test "returns fields ordered by order_position" do
      form = form_fixture()

      field1 = form_field_fixture(%{form: form, order_position: 2, label: "Second"})
      field2 = form_field_fixture(%{form: form, order_position: 0, label: "First"})
      field3 = form_field_fixture(%{form: form, order_position: 1, label: "Middle"})

      {:ok, fields} =
        Forms.FormField
        |> Ash.Query.for_read(:for_form, %{form_id: form.id})
        |> Ash.read(authorize?: false)

      assert Enum.at(fields, 0).id == field2.id
      assert Enum.at(fields, 1).id == field3.id
      assert Enum.at(fields, 2).id == field1.id
    end
  end

  describe "validation_rules" do
    test "can store custom validation rules" do
      form = form_fixture()

      validation_rules = %{
        "min_length" => 5,
        "max_length" => 100,
        "pattern" => "^[a-zA-Z]+$"
      }

      assert {:ok, field} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :text,
                 label: "Username",
                 order_position: 0,
                 validation_rules: validation_rules
               })
               |> Ash.create(authorize?: false)

      assert field.validation_rules["min_length"] == 5
      assert field.validation_rules["max_length"] == 100
      assert field.validation_rules["pattern"] == "^[a-zA-Z]+$"
    end
  end

  describe "multi-tenancy" do
    test "fields belong to forms which belong to companies" do
      company_a = company_fixture()
      company_b = company_fixture()

      form_a = form_fixture(%{company: company_a})
      form_b = form_fixture(%{company: company_b})

      field_a = form_field_fixture(%{form: form_a, label: "Field A"})
      field_b = form_field_fixture(%{form: form_b, label: "Field B"})

      # Verify fields are associated with correct forms
      {:ok, loaded_field_a} = Forms.FormField |> Ash.get(field_a.id, load: [:form])
      {:ok, loaded_field_b} = Forms.FormField |> Ash.get(field_b.id, load: [:form])

      assert loaded_field_a.form.tenant_id == company_a.id
      assert loaded_field_b.form.tenant_id == company_b.id
    end
  end

  describe "field type variations" do
    test "number field can have validation rules for min/max" do
      form = form_fixture()

      assert {:ok, field} =
               Forms.FormField
               |> Ash.Changeset.for_create(:create, %{
                 form_id: form.id,
                 field_type: :number,
                 label: "Age",
                 order_position: 0,
                 validation_rules: %{"min" => 0, "max" => 120}
               })
               |> Ash.create(authorize?: false)

      assert field.validation_rules["min"] == 0
      assert field.validation_rules["max"] == 120
    end

    test "email field stores proper type" do
      field = form_field_fixture(%{field_type: :email, label: "Email Address"})
      assert field.field_type == :email
    end

    test "phone field stores proper type" do
      field = form_field_fixture(%{field_type: :phone, label: "Phone Number"})
      assert field.field_type == :phone
    end

    test "url field stores proper type" do
      field = form_field_fixture(%{field_type: :url, label: "Website"})
      assert field.field_type == :url
    end

    test "date field stores proper type" do
      field = form_field_fixture(%{field_type: :date, label: "Birth Date"})
      assert field.field_type == :date
    end

    test "checkbox field stores proper type" do
      field = form_field_fixture(%{field_type: :checkbox, label: "Accept Terms"})
      assert field.field_type == :checkbox
    end

    test "textarea field stores proper type" do
      field = form_field_fixture(%{field_type: :textarea, label: "Comments"})
      assert field.field_type == :textarea
    end
  end
end
