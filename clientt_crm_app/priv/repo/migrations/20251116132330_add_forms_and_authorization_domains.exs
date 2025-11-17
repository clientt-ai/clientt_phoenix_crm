defmodule ClienttCrmApp.Repo.Migrations.AddFormsAndAuthorizationDomains do
  @moduledoc """
  Creates Forms and Authorization domain tables.

  This migration combines the initial forms domain creation with the
  final table naming convention (forms_*, forms_fields with company_id).
  """

  use Ecto.Migration

  def up do
    # Update users table ID default
    alter table(:authn_users) do
      modify :id, :uuid, default: fragment("gen_random_uuid()")
    end

    # Create submissions table with final name
    create table(:forms_submissions, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :company_id, :uuid, null: false
      add :form_id, :uuid, null: false
      add :form_data, :map, null: false, default: %{}
      add :submitter_email, :text
      add :metadata, :map, default: %{}
      add :status, :text, null: false, default: "new"
      add :submitted_at, :utc_datetime_usec, null: false
      add :deleted_at, :utc_datetime_usec

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create notifications table
    create table(:notifications, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :user_id, :uuid, null: false
      add :type, :text, null: false
      add :title, :text, null: false
      add :message, :text
      add :link, :text
      add :metadata, :map, default: %{}
      add :read_at, :utc_datetime_usec

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create forms table with final name
    create table(:forms_forms, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :company_id, :uuid, null: false
      add :name, :text, null: false
      add :slug, :text, null: false
      add :description, :text
      add :branding, :map, default: %{}
      add :settings, :map, default: %{}
      add :status, :text, null: false, default: "draft"
      add :view_count, :bigint, null: false, default: 0
      add :submission_count, :bigint, null: false, default: 0
      add :published_at, :utc_datetime_usec
      add :created_by_id, :uuid, null: false

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create form_fields table with final name and company_id included
    create table(:forms_fields, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :company_id, :uuid, null: false
      add :form_id, :uuid, null: false
      add :field_type, :text, null: false
      add :label, :text, null: false
      add :placeholder, :text
      add :help_text, :text
      add :required, :boolean, null: false, default: false
      add :order_position, :bigint, null: false, default: 0
      add :options, {:array, :map}, default: []
      add :validation_rules, :map, default: %{}

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create authz_users table (shell first, then add columns)
    create table(:authz_users, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
    end

    # Add notifications foreign key to authz_users
    alter table(:notifications) do
      modify :user_id,
             references(:authz_users,
               column: :id,
               name: "notifications_user_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    # Add authz_users columns
    alter table(:authz_users) do
      add :authn_user_id,
          references(:authn_users,
            column: :id,
            name: "authz_users_authn_user_id_fkey",
            type: :uuid,
            prefix: "public"
          ),
          null: false

      add :company_id, :uuid, null: false
      add :role, :text, null: false
      add :team_id, :uuid
      add :team_role, :text
      add :status, :text, null: false, default: "active"
      add :display_name, :text
      add :joined_at, :utc_datetime_usec, null: false
      add :last_active_at, :utc_datetime_usec

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create authz_teams table
    create table(:authz_teams, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :company_id, :uuid, null: false
      add :name, :text, null: false
      add :description, :text
      add :status, :text, null: false, default: "active"

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create authz_company_settings table
    create table(:authz_company_settings, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
      add :company_id, :uuid, null: false
      add :max_users, :bigint
      add :max_teams, :bigint
      add :features, :map, null: false, default: %{}
      add :branding, :map, null: false
      add :timezone, :text

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    # Create authz_companies table (shell first, then add columns)
    create table(:authz_companies, primary_key: false) do
      add :id, :uuid, null: false, default: fragment("gen_random_uuid()"), primary_key: true
    end

    # Add foreign keys for forms_submissions
    alter table(:forms_submissions) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "forms_submissions_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )

      modify :form_id,
             references(:forms_forms,
               column: :id,
               name: "forms_submissions_form_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    # Add foreign keys for forms_forms
    alter table(:forms_forms) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "forms_forms_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )

      modify :created_by_id,
             references(:authz_users,
               column: :id,
               name: "forms_forms_created_by_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    # Add foreign keys for forms_fields
    alter table(:forms_fields) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "forms_fields_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )

      modify :form_id,
             references(:forms_forms,
               column: :id,
               name: "forms_fields_form_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    # Create forms_forms unique indexes
    create unique_index(:forms_forms, [:company_id, :name],
             name: "forms_forms_unique_name_per_company_index"
           )

    create unique_index(:forms_forms, [:company_id, :slug],
             name: "forms_forms_unique_slug_per_company_index"
           )

    # Add authz_users foreign keys
    alter table(:authz_users) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "authz_users_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )

      modify :team_id,
             references(:authz_teams,
               column: :id,
               name: "authz_users_team_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    create unique_index(:authz_users, [:authn_user_id, :company_id],
             name: "authz_users_unique_user_company_index"
           )

    # Add authz_teams foreign keys
    alter table(:authz_teams) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "authz_teams_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    create unique_index(:authz_teams, [:company_id, :name],
             name: "authz_teams_unique_name_per_company_index"
           )

    # Add authz_company_settings foreign keys
    alter table(:authz_company_settings) do
      modify :company_id,
             references(:authz_companies,
               column: :id,
               name: "authz_company_settings_company_id_fkey",
               type: :uuid,
               prefix: "public"
             )
    end

    create unique_index(:authz_company_settings, [:company_id],
             name: "authz_company_settings_unique_company_index"
           )

    # Add authz_companies columns
    alter table(:authz_companies) do
      add :name, :text, null: false
      add :slug, :text, null: false
      add :status, :text, null: false, default: "active"
      add :settings_id, :uuid

      add :created_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")

      add :updated_at, :utc_datetime_usec,
        null: false,
        default: fragment("(now() AT TIME ZONE 'utc')")
    end

    create unique_index(:authz_companies, [:slug], name: "authz_companies_unique_slug_index")
  end

  def down do
    drop_if_exists unique_index(:authz_companies, [:slug],
                     name: "authz_companies_unique_slug_index"
                   )

    alter table(:authz_companies) do
      remove :updated_at
      remove :created_at
      remove :settings_id
      remove :status
      remove :slug
      remove :name
    end

    drop_if_exists unique_index(:authz_company_settings, [:company_id],
                     name: "authz_company_settings_unique_company_index"
                   )

    drop constraint(:authz_company_settings, "authz_company_settings_company_id_fkey")

    alter table(:authz_company_settings) do
      modify :company_id, :uuid
    end

    drop_if_exists unique_index(:authz_teams, [:company_id, :name],
                     name: "authz_teams_unique_name_per_company_index"
                   )

    drop constraint(:authz_teams, "authz_teams_company_id_fkey")

    alter table(:authz_teams) do
      modify :company_id, :uuid
    end

    drop_if_exists unique_index(:authz_users, [:authn_user_id, :company_id],
                     name: "authz_users_unique_user_company_index"
                   )

    drop constraint(:authz_users, "authz_users_company_id_fkey")

    drop constraint(:authz_users, "authz_users_team_id_fkey")

    alter table(:authz_users) do
      modify :team_id, :uuid
      modify :company_id, :uuid
    end

    drop_if_exists unique_index(:forms_forms, [:company_id, :slug],
                     name: "forms_forms_unique_slug_per_company_index"
                   )

    drop_if_exists unique_index(:forms_forms, [:company_id, :name],
                     name: "forms_forms_unique_name_per_company_index"
                   )

    drop constraint(:forms_fields, "forms_fields_company_id_fkey")

    drop constraint(:forms_fields, "forms_fields_form_id_fkey")

    alter table(:forms_fields) do
      modify :form_id, :uuid
      modify :company_id, :uuid
    end

    drop constraint(:forms_forms, "forms_forms_company_id_fkey")

    drop constraint(:forms_forms, "forms_forms_created_by_id_fkey")

    alter table(:forms_forms) do
      modify :created_by_id, :uuid
      modify :company_id, :uuid
    end

    drop constraint(:forms_submissions, "forms_submissions_company_id_fkey")

    drop constraint(:forms_submissions, "forms_submissions_form_id_fkey")

    alter table(:forms_submissions) do
      modify :form_id, :uuid
      modify :company_id, :uuid
    end

    drop table(:authz_companies)

    drop table(:authz_company_settings)

    drop table(:authz_teams)

    drop constraint(:authz_users, "authz_users_authn_user_id_fkey")

    alter table(:authz_users) do
      remove :updated_at
      remove :created_at
      remove :last_active_at
      remove :joined_at
      remove :display_name
      remove :status
      remove :team_role
      remove :team_id
      remove :role
      remove :company_id
      remove :authn_user_id
    end

    drop constraint(:notifications, "notifications_user_id_fkey")

    alter table(:notifications) do
      modify :user_id, :uuid
    end

    drop table(:authz_users)

    drop table(:forms_fields)

    drop table(:forms_forms)

    drop table(:notifications)

    drop table(:forms_submissions)

    alter table(:authn_users) do
      modify :id, :uuid, default: fragment("uuid_generate_v7()")
    end
  end
end
