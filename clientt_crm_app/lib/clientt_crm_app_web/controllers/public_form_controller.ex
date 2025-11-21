defmodule ClienttCrmAppWeb.PublicFormController do
  @moduledoc """
  Public API controller for embeddable form widget.

  Provides endpoints for fetching form metadata and submitting form data
  without authentication. Security is based on UUID obscurity.
  """

  use ClienttCrmAppWeb, :controller

  alias ClienttCrmApp.Forms.Form
  alias ClienttCrmApp.Forms.FormField
  alias ClienttCrmApp.Forms.Submission
  alias ClienttCrmAppWeb.Plugs.PublicCors

  require Ash.Query

  @doc """
  OPTIONS handler for CORS preflight requests.
  """
  def options(conn, _params) do
    conn
    |> send_resp(204, "")
  end

  @doc """
  GET /api/public/forms/:id

  Returns form metadata including fields, branding, and settings.
  Increments view_count on successful fetch.
  Only returns published forms.
  """
  def show(conn, %{"id" => id}) do
    origin = get_req_header(conn, "origin") |> List.first()

    case Ash.get(Form, id) do
      {:ok, form} ->
        # Check if form is published
        if form.status != :published do
          conn
          |> put_status(:not_found)
          |> json(%{error: "Form not found or not published"})
        else
          # Validate CORS if allowed_domains is set
          allowed_domains = get_in(form.settings, ["allowed_domains"]) || []

          if PublicCors.validate_origin(origin, allowed_domains) do
            # Increment view count
            Ash.update(form, %{}, action: :increment_view_count)

            # Load fields sorted by order_position
            {:ok, fields} =
              FormField
              |> Ash.Query.filter(form_id == ^id)
              |> Ash.Query.sort(order_position: :asc)
              |> Ash.read()

            # Build response
            response = %{
              id: form.id,
              name: form.name,
              description: form.description,
              branding: form.branding || %{},
              settings: sanitize_settings(form.settings || %{}),
              fields: Enum.map(fields, &serialize_field/1)
            }

            json(conn, response)
          else
            conn
            |> put_status(:forbidden)
            |> json(%{error: "Origin not allowed"})
          end
        end

      {:error, _} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Form not found"})
    end
  end

  @doc """
  POST /api/public/forms/:id/submissions

  Creates a new form submission.
  Validates form data against field definitions and validation rules.
  """
  def submit(conn, %{"id" => id} = params) do
    origin = get_req_header(conn, "origin") |> List.first()
    form_data = params["data"] || %{}
    metadata = params["metadata"] || %{}

    case Ash.get(Form, id) do
      {:ok, form} ->
        # Check if form is published
        if form.status != :published do
          conn
          |> put_status(:not_found)
          |> json(%{error: "Form not found or not published"})
        else
          # Validate CORS
          allowed_domains = get_in(form.settings, ["allowed_domains"]) || []

          if PublicCors.validate_origin(origin, allowed_domains) do
            # Load fields for validation
            {:ok, fields} =
              FormField
              |> Ash.Query.filter(form_id == ^id)
              |> Ash.Query.sort(order_position: :asc)
              |> Ash.read()

            # Validate form data
            case validate_submission(form_data, fields) do
              {:ok, validated_data} ->
                # Create submission
                submission_params = %{
                  form_id: form.id,
                  tenant_id: form.tenant_id,
                  form_data: validated_data,
                  submitter_email: extract_email(validated_data, fields),
                  metadata: Map.merge(metadata, %{"origin" => origin}),
                  submitted_at: DateTime.utc_now()
                }

                case Ash.create(Submission, submission_params, action: :create) do
                  {:ok, submission} ->
                    # Increment submission count
                    Ash.update(form, %{}, action: :increment_submission_count)

                    json(conn, %{
                      success: true,
                      submission_id: submission.id,
                      settings: %{
                        show_success_message: get_in(form.settings, ["show_success_message"]) != false,
                        success_message: get_in(form.settings, ["success_message"]) || "Thank you for your submission!",
                        redirect_url: get_in(form.settings, ["redirect_url"]),
                        callback_function: get_in(form.settings, ["callback_function"])
                      }
                    })

                  {:error, changeset} ->
                    conn
                    |> put_status(:unprocessable_entity)
                    |> json(%{
                      success: false,
                      errors: format_errors(changeset)
                    })
                end

              {:error, validation_errors} ->
                conn
                |> put_status(:unprocessable_entity)
                |> json(%{
                  success: false,
                  errors: validation_errors
                })
            end
          else
            conn
            |> put_status(:forbidden)
            |> json(%{error: "Origin not allowed"})
          end
        end

      {:error, _} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Form not found"})
    end
  end

  # Private functions

  defp sanitize_settings(settings) do
    # Only expose safe settings to the client
    %{
      "show_success_message" => Map.get(settings, "show_success_message", true),
      "success_message" => Map.get(settings, "success_message", "Thank you for your submission!"),
      "redirect_url" => Map.get(settings, "redirect_url"),
      "callback_function" => Map.get(settings, "callback_function"),
      "multi_step_enabled" => Map.get(settings, "multi_step_enabled", false),
      "steps" => Map.get(settings, "steps", [])
    }
  end

  defp serialize_field(field) do
    %{
      id: field.id,
      field_type: field.field_type,
      label: field.label,
      placeholder: field.placeholder,
      help_text: field.help_text,
      required: field.required,
      order_position: field.order_position,
      step: field.step,
      options: field.options || [],
      validation_rules: field.validation_rules || %{}
    }
  end

  defp validate_submission(form_data, fields) do
    # Layout elements that don't require validation
    layout_types = [:file, :heading, :separator, :spacer]

    errors =
      fields
      |> Enum.filter(fn field -> field.field_type not in layout_types end)
      |> Enum.reduce(%{}, fn field, acc ->
        field_name = field.id |> to_string()
        value = Map.get(form_data, field_name) || Map.get(form_data, field.label)

        case validate_field_value(field, value) do
          :ok -> acc
          {:error, messages} -> Map.put(acc, field_name, messages)
        end
      end)

    if map_size(errors) == 0 do
      {:ok, form_data}
    else
      {:error, Map.put(errors, "_summary", ["Please correct the errors below"])}
    end
  end

  defp validate_field_value(field, value) do
    errors = []
    rules = field.validation_rules || %{}

    # Required validation
    errors =
      if field.required and (is_nil(value) or value == "") do
        ["This field is required" | errors]
      else
        errors
      end

    # Skip other validations if value is empty and not required
    errors =
      if is_nil(value) or value == "" do
        errors
      else
        validate_value_rules(value, field.field_type, rules, errors)
      end

    if errors == [] do
      :ok
    else
      {:error, Enum.reverse(errors)}
    end
  end

  defp validate_value_rules(value, field_type, rules, errors) do
    errors
    |> validate_min_length(value, rules)
    |> validate_max_length(value, rules)
    |> validate_min_value(value, field_type, rules)
    |> validate_max_value(value, field_type, rules)
    |> validate_email_format(value, field_type)
    |> validate_url_format(value, field_type)
  end

  defp validate_min_length(errors, value, %{"min_length" => min}) when is_binary(value) do
    if String.length(value) < min do
      ["Must be at least #{min} characters" | errors]
    else
      errors
    end
  end
  defp validate_min_length(errors, _, _), do: errors

  defp validate_max_length(errors, value, %{"max_length" => max}) when is_binary(value) do
    if String.length(value) > max do
      ["Must be no more than #{max} characters" | errors]
    else
      errors
    end
  end
  defp validate_max_length(errors, _, _), do: errors

  defp validate_min_value(errors, value, :number, %{"min_value" => min}) do
    case parse_number(value) do
      {:ok, num} when num < min -> ["Must be at least #{min}" | errors]
      _ -> errors
    end
  end
  defp validate_min_value(errors, _, _, _), do: errors

  defp validate_max_value(errors, value, :number, %{"max_value" => max}) do
    case parse_number(value) do
      {:ok, num} when num > max -> ["Must be no more than #{max}" | errors]
      _ -> errors
    end
  end
  defp validate_max_value(errors, _, _, _), do: errors

  defp validate_email_format(errors, value, :email) when is_binary(value) do
    if String.match?(value, ~r/^[^\s@]+@[^\s@]+\.[^\s@]+$/) do
      errors
    else
      ["Please enter a valid email address" | errors]
    end
  end
  defp validate_email_format(errors, _, _), do: errors

  defp validate_url_format(errors, value, :url) when is_binary(value) do
    if String.match?(value, ~r/^https?:\/\/.+/) do
      errors
    else
      ["Please enter a valid URL" | errors]
    end
  end
  defp validate_url_format(errors, _, _), do: errors

  defp parse_number(value) when is_number(value), do: {:ok, value}
  defp parse_number(value) when is_binary(value) do
    case Float.parse(value) do
      {num, _} -> {:ok, num}
      :error ->
        case Integer.parse(value) do
          {num, _} -> {:ok, num}
          :error -> :error
        end
    end
  end
  defp parse_number(_), do: :error

  defp extract_email(form_data, fields) do
    # Find the first email field and extract its value
    email_field = Enum.find(fields, fn f -> f.field_type == :email end)

    if email_field do
      Map.get(form_data, email_field.id |> to_string()) ||
        Map.get(form_data, email_field.label)
    else
      nil
    end
  end

  defp format_errors(changeset) do
    errors =
      Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
        Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
          opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
        end)
      end)

    Map.put(errors, "_summary", ["Failed to save submission"])
  end
end
