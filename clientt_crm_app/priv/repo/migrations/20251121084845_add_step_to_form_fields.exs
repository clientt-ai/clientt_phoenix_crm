defmodule ClienttCrmApp.Repo.Migrations.AddStepToFormFields do
  use Ecto.Migration

  def change do
    alter table(:forms_fields) do
      add :step, :integer, null: true
      # nil = single page form, 1+ = step number for multi-step forms
    end
  end
end
