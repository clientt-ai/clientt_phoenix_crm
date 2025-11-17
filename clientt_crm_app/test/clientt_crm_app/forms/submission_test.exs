defmodule ClienttCrmApp.Forms.SubmissionTest do
  use ClienttCrmApp.DataCase, async: true

  import ClienttCrmApp.Factory

  alias ClienttCrmApp.Forms

  describe "create_public_submission/1" do
    test "creates submission without authentication for published form" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      form_data = %{
        "field-1" => "John Doe",
        "field-2" => "john@example.com",
        "field-3" => "I'm interested"
      }

      metadata = %{
        "utm_source" => "google",
        "utm_medium" => "cpc",
        "utm_campaign" => "fall-2025"
      }

      assert {:ok, submission} =
               Forms.Submission
               |> Ash.Changeset.for_create(:create_public_submission, %{
                 form_id: published_form.id,
                 form_data: form_data,
                 metadata: metadata
               })
               |> Ash.create()

      assert submission.status == :new
      assert submission.form_id == published_form.id
      assert submission.company_id == published_form.company_id
      assert submission.form_data == form_data
      assert submission.metadata == metadata
      assert submission.submitter_email == "john@example.com"
      assert %DateTime{} = submission.submitted_at
    end

    test "extracts submitter_email from form_data" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      {:ok, submission} =
               Forms.Submission
               |> Ash.Changeset.for_create(:create_public_submission, %{
                 form_id: published_form.id,
                 form_data: %{"email" => "test@example.com", "name" => "Test User"},
                 metadata: %{}
               })
               |> Ash.create()

      assert submission.submitter_email == "test@example.com"
    end

    test "increments form submission_count" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)
      assert published_form.submission_count == 0

      {:ok, _submission} =
        Forms.Submission
        |> Ash.Changeset.for_create(:create_public_submission, %{
          form_id: published_form.id,
          form_data: %{"field" => "value"},
          metadata: %{}
        })
        |> Ash.create()

      # Reload form to check count
      updated_form = Forms.Form |> Ash.get!(published_form.id)
      assert updated_form.submission_count == 1
    end

    test "cannot submit to draft form" do
      draft_form = form_fixture()

      assert_raise Ash.Error.Invalid, fn ->
        Forms.Submission
        |> Ash.Changeset.for_create(:create_public_submission, %{
          form_id: draft_form.id,
          form_data: %{"field" => "value"},
          metadata: %{}
        })
        |> Ash.create!()
      end
    end

    test "cannot submit to archived form" do
      form = form_fixture()
      {:ok, archived_form} = archive_form(form)

      assert_raise Ash.Error.Invalid, fn ->
        Forms.Submission
        |> Ash.Changeset.for_create(:create_public_submission, %{
          form_id: archived_form.id,
          form_data: %{"field" => "value"},
          metadata: %{}
        })
        |> Ash.create!()
      end
    end
  end

  describe "update_status/1" do
    test "updates submission status through workflow: new -> contacted" do
      submission = submission_fixture(%{public: true})
      assert submission.status == :new

      assert {:ok, updated_submission} =
               submission
               |> Ash.Changeset.for_update(:update_status, %{status: :contacted})
               |> Ash.update()

      assert updated_submission.status == :contacted
    end

    test "completes full workflow: new -> contacted -> qualified -> converted" do
      submission = submission_fixture(%{public: true})

      # new -> contacted
      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :contacted})
        |> Ash.update()

      assert submission.status == :contacted

      # contacted -> qualified
      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :qualified})
        |> Ash.update()

      assert submission.status == :qualified

      # qualified -> converted
      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :converted})
        |> Ash.update()

      assert submission.status == :converted
    end

    test "can mark as spam from any status" do
      submission = submission_fixture(%{public: true})

      {:ok, spam_submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :spam})
        |> Ash.update()

      assert spam_submission.status == :spam
    end

    test "cannot skip workflow steps" do
      submission = submission_fixture(%{public: true})
      assert submission.status == :new

      # Cannot jump from new to converted
      assert {:error, %Ash.Error.Invalid{}} =
               submission
               |> Ash.Changeset.for_update(:update_status, %{status: :converted})
               |> Ash.update()
    end

    test "converted is terminal state" do
      submission = submission_fixture(%{public: true})

      # Move to converted
      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :contacted})
        |> Ash.update()

      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :qualified})
        |> Ash.update()

      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :converted})
        |> Ash.update()

      # Cannot transition from converted
      assert {:error, %Ash.Error.Invalid{}} =
               submission
               |> Ash.Changeset.for_update(:update_status, %{status: :qualified})
               |> Ash.update()
    end

    test "spam is terminal state" do
      submission = submission_fixture(%{public: true})

      {:ok, submission} =
        submission
        |> Ash.Changeset.for_update(:update_status, %{status: :spam})
        |> Ash.update()

      # Cannot transition from spam
      assert {:error, %Ash.Error.Invalid{}} =
               submission
               |> Ash.Changeset.for_update(:update_status, %{status: :contacted})
               |> Ash.update()
    end
  end

  describe "soft_delete/1" do
    test "soft deletes submission" do
      submission = submission_fixture(%{public: true})
      assert submission.deleted_at == nil

      {:ok, deleted_submission} =
        submission
        |> Ash.Changeset.for_update(:soft_delete)
        |> Ash.update()

      assert %DateTime{} = deleted_submission.deleted_at
    end

    test "soft deleted submissions excluded from default queries" do
      form = form_fixture()
      {:ok, published_form} = publish_form(form)

      submission1 = submission_fixture(%{form: published_form, public: true})
      submission2 = submission_fixture(%{form: published_form, public: true})

      # Soft delete one
      {:ok, _deleted} =
        submission1
        |> Ash.Changeset.for_update(:soft_delete)
        |> Ash.update()

      # Query for form submissions (default excludes deleted)
      {:ok, submissions} =
        Forms.Submission
        |> Ash.Query.for_read(:for_form, %{form_id: published_form.id})
        |> Ash.read()

      submission_ids = Enum.map(submissions, & &1.id)
      assert submission2.id in submission_ids
      refute submission1.id in submission_ids
    end
  end

  describe "restore/1" do
    test "restores soft deleted submission" do
      submission = submission_fixture(%{public: true})

      {:ok, deleted_submission} =
        submission
        |> Ash.Changeset.for_update(:soft_delete)
        |> Ash.update()

      assert deleted_submission.deleted_at != nil

      {:ok, restored_submission} =
        deleted_submission
        |> Ash.Changeset.for_update(:restore)
        |> Ash.update()

      assert restored_submission.deleted_at == nil
    end
  end

  describe "destroy/1" do
    test "cannot hard delete submissions" do
      submission = submission_fixture(%{public: true})

      assert {:error, %Ash.Error.Forbidden{}} =
               submission
               |> Ash.Changeset.for_destroy(:destroy)
               |> Ash.destroy()
    end
  end

  describe "for_form/1" do
    test "returns submissions for specific form" do
      form1 = form_fixture()
      form2 = form_fixture()
      {:ok, form1} = publish_form(form1)
      {:ok, form2} = publish_form(form2)

      submission1 = submission_fixture(%{form: form1, public: true})
      _submission2 = submission_fixture(%{form: form2, public: true})

      {:ok, submissions} =
        Forms.Submission
        |> Ash.Query.for_read(:for_form, %{form_id: form1.id})
        |> Ash.read()

      submission_ids = Enum.map(submissions, & &1.id)
      assert submission1.id in submission_ids
      assert length(submissions) == 1
    end
  end

  describe "by_status/1" do
    test "filters submissions by status" do
      form = form_fixture()
      {:ok, form} = publish_form(form)

      new_submission = submission_fixture(%{form: form, public: true})

      contacted_submission = submission_fixture(%{form: form, public: true})

      {:ok, contacted_submission} =
        contacted_submission
        |> Ash.Changeset.for_update(:update_status, %{status: :contacted})
        |> Ash.update()

      {:ok, submissions} =
        Forms.Submission
        |> Ash.Query.for_read(:by_status, %{status: :contacted})
        |> Ash.read()

      submission_ids = Enum.map(submissions, & &1.id)
      assert contacted_submission.id in submission_ids
      refute new_submission.id in submission_ids
    end
  end

  describe "calculations" do
    test "calculates utm_source from metadata" do
      form = form_fixture()
      {:ok, form} = publish_form(form)

      submission =
        submission_fixture(%{
          form: form,
          public: true,
          metadata: %{"utm_source" => "google", "utm_medium" => "cpc"}
        })

      submission = Forms.Submission |> Ash.get!(submission.id, load: [:utm_source, :utm_medium])

      assert submission.utm_source == "google"
      assert submission.utm_medium == "cpc"
    end

    test "status calculations" do
      submission = submission_fixture(%{public: true})
      submission = Forms.Submission |> Ash.get!(submission.id, load: [:is_new, :is_contacted])

      assert submission.is_new == true
      assert submission.is_contacted == false
    end
  end

  describe "multi-tenancy" do
    test "submissions inherit company_id from form" do
      company_a = company_fixture()
      form_a = form_fixture(%{company: company_a})
      {:ok, form_a} = publish_form(form_a)

      {:ok, submission} =
        Forms.Submission
        |> Ash.Changeset.for_create(:create_public_submission, %{
          form_id: form_a.id,
          form_data: %{"field" => "value"},
          metadata: %{}
        })
        |> Ash.create()

      assert submission.company_id == company_a.id
    end

    test "for_company returns only submissions for that company" do
      company_a = company_fixture()
      company_b = company_fixture()

      form_a = form_fixture(%{company: company_a})
      form_b = form_fixture(%{company: company_b})
      {:ok, form_a} = publish_form(form_a)
      {:ok, form_b} = publish_form(form_b)

      submission_a = submission_fixture(%{form: form_a, public: true})
      _submission_b = submission_fixture(%{form: form_b, public: true})

      {:ok, submissions} =
        Forms.Submission
        |> Ash.Query.for_read(:for_company, %{company_id: company_a.id})
        |> Ash.read()

      submission_ids = Enum.map(submissions, & &1.id)
      assert submission_a.id in submission_ids
      assert length(submissions) == 1
    end
  end
end
