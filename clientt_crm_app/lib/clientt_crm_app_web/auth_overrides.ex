defmodule ClienttCrmAppWeb.AuthOverrides do
  use AshAuthentication.Phoenix.Overrides
  alias AshAuthentication.Phoenix.Components

  # Helper function for field classes with data-testid
  def field_class_with_testid(field, _strategy) do
    case field do
      :identity -> [{"data-testid", "email-input"}, {"class", "input input-bordered w-full"}]
      :password -> [{"data-testid", "password-input"}, {"class", "input input-bordered w-full"}]
      _ -> []
    end
  end

  # Override Password component to add data-testid attributes for testing
  override Components.Password do
    set :root_class, "space-y-4"
    set :field_class, &__MODULE__.field_class_with_testid/2
  end

  # Override sign in submit button
  override Components.SignIn do
    set :submit_button_options, [
      {"data-testid", "login-button"},
      {"class", "btn btn-primary w-full"}
    ]
  end

  # Override register submit button
  override Components.Password.RegisterForm do
    set :submit_button_options, [
      {"data-testid", "register-button"},
      {"class", "btn btn-primary w-full"}
    ]
  end

  # Override reset password submit button
  override Components.Password.ResetForm do
    set :submit_button_options, [
      {"data-testid", "reset-button"},
      {"class", "btn btn-primary w-full"}
    ]
  end
end
