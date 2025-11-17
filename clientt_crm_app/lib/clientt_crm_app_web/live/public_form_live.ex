defmodule ClienttCrmAppWeb.PublicFormLive do
  use ClienttCrmAppWeb, :live_view

  alias ClienttCrmApp.Forms

  @impl true
  def mount(%{"id" => form_id}, _session, socket) do
    case Forms.Form |> Ash.get(form_id) do
      {:ok, form} ->
        if form.status == :published do
          # Load form fields
          {:ok, fields} =
            Forms.FormField
            |> Ash.Query.for_read(:for_form, %{form_id: form_id})
            |> Ash.read()

          # Increment view count
          Forms.Form
          |> Ash.Changeset.for_update(:increment_view_count, %{form_id: form_id})
          |> Ash.update()

          {:ok,
           socket
           |> assign(:form, form)
           |> assign(:fields, fields)
           |> assign(:form_data, %{})
           |> assign(:errors, %{})
           |> assign(:submitted, false)
           |> assign(:page_title, form.name)}
        else
          {:ok,
           socket
           |> put_flash(:error, "This form is not currently accepting submissions")
           |> assign(:form, nil)
           |> assign(:fields, [])
           |> assign(:page_title, "Form Not Available")}
        end

      {:error, _} ->
        {:ok,
         socket
         |> put_flash(:error, "Form not found")
         |> assign(:form, nil)
         |> assign(:fields, [])
         |> assign(:page_title, "Form Not Found")}
    end
  end

  @impl true
  def handle_event("update_field", %{"field" => field_name, "value" => value}, socket) do
    form_data = Map.put(socket.assigns.form_data, field_name, value)
    {:noreply, assign(socket, :form_data, form_data)}
  end

  @impl true
  def handle_event("submit_form", params, socket) do
    # Extract form data from params
    form_data = extract_form_data(params, socket.assigns.fields)

    # Validate required fields
    case validate_form(form_data, socket.assigns.fields) do
      {:ok, _} ->
        # Extract UTM parameters and metadata
        metadata = extract_metadata(params)

        # Submit the form
        case Forms.Submission
             |> Ash.Changeset.for_create(:create_public_submission, %{
               form_id: socket.assigns.form.id,
               form_data: form_data,
               metadata: metadata
             })
             |> Ash.create() do
          {:ok, _submission} ->
            {:noreply,
             socket
             |> assign(:submitted, true)
             |> assign(:errors, %{})
             |> put_flash(:info, "Thank you for your submission!")}

          {:error, changeset} ->
            error_message =
              changeset.errors
              |> Enum.map(fn error -> error.message end)
              |> Enum.join(", ")

            {:noreply, put_flash(socket, :error, "Submission failed: #{error_message}")}
        end

      {:error, errors} ->
        {:noreply, assign(socket, :errors, errors)}
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <%= if @form do %>
        <div class="mx-auto max-w-2xl">
          <div class="bg-white shadow-lg sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h1 data-testid="form-title" class="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                <%= @form.name %>
              </h1>
              <%= if @form.description do %>
                <p data-testid="form-description" class="text-sm text-gray-600 mb-6"><%= @form.description %></p>
              <% end %>

              <%= if @submitted do %>
                <div data-testid="success-message" class="rounded-md bg-green-50 p-4 mb-6">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg
                        class="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-green-800">
                        Form submitted successfully!
                      </h3>
                      <div class="mt-2 text-sm text-green-700">
                        <p>Thank you for your submission. We'll be in touch soon.</p>
                      </div>
                    </div>
                  </div>
                </div>
              <% else %>
                <form phx-submit="submit_form" class="space-y-6">
                  <%= for field <- @fields do %>
                    <% slug = field.label |> String.downcase() |> String.replace(~r/\s+/, "-") |> String.replace(~r/[^\w-]/, "") %>
                    <div data-testid={"form-field-#{slug}"}>
                      <label
                        for={field.label}
                        class="block text-sm font-medium leading-6 text-gray-900"
                      >
                        <%= field.label %>
                        <%= if field.required do %>
                          <span data-testid="required-indicator" class="text-red-500">*</span>
                        <% end %>
                      </label>
                      <%= render_field_input(field, @errors) %>
                      <%= if field.help_text do %>
                        <p class="mt-1 text-sm text-gray-500"><%= field.help_text %></p>
                      <% end %>
                      <%= if @errors[field.label] do %>
                        <p class="mt-1 text-sm text-red-600"><%= @errors[field.label] %></p>
                      <% end %>
                    </div>
                  <% end %>

                  <div class="flex justify-end gap-3">
                    <button
                      type="submit"
                      data-testid="submit-form-button"
                      class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              <% end %>
            </div>
          </div>

          <%= if @form.branding && @form.branding["logo_url"] do %>
            <div class="mt-4 text-center">
              <img
                src={@form.branding["logo_url"]}
                alt="Company Logo"
                class="mx-auto h-8"
              />
            </div>
          <% end %>
        </div>
      <% else %>
        <div class="mx-auto max-w-2xl text-center">
          <div class="bg-white shadow sm:rounded-lg p-8">
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 class="mt-2 text-sm font-semibold text-gray-900">Form Not Available</h3>
            <p class="mt-1 text-sm text-gray-500">
              This form is not currently accepting submissions or does not exist.
            </p>
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  defp render_field_input(field, errors) do
    error_class = if errors[field.label], do: "border-red-300", else: "border-gray-300"
    # Create slug from label for testid
    slug = field.label |> String.downcase() |> String.replace(~r/\s+/, "-") |> String.replace(~r/[^\w-]/, "")
    assigns = %{field: field, errors: errors, error_class: error_class, slug: slug}

    case field.field_type do
      :textarea ->
        ~H"""
        <textarea
          name={@field.label}
          id={@field.label}
          data-testid={"textarea-#{@slug}"}
          rows="3"
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        ></textarea>
        """

      :email ->
        ~H"""
        <input
          type="email"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """

      :number ->
        ~H"""
        <input
          type="number"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """

      :phone ->
        ~H"""
        <input
          type="tel"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """

      :url ->
        ~H"""
        <input
          type="url"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """

      :date ->
        ~H"""
        <input
          type="date"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """

      :checkbox ->
        ~H"""
        <div class="mt-2">
          <input
            type="checkbox"
            name={@field.label}
            id={@field.label}
            data-testid={"checkbox-#{@slug}"}
            value="true"
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        """

      :select ->
        ~H"""
        <select
          name={@field.label}
          id={@field.label}
          data-testid={"select-#{@slug}"}
          required={@field.required}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        >
          <option value="">Select an option</option>
          <%= for option <- @field.options do %>
            <option value={option["value"] || option[:value]}>
              <%= option["label"] || option[:label] %>
            </option>
          <% end %>
        </select>
        """

      :radio ->
        ~H"""
        <div class="mt-2 space-y-2">
          <%= for option <- @field.options do %>
            <div class="flex items-center">
              <input
                type="radio"
                name={@field.label}
                id={"#{@field.label}_#{option["value"] || option[:value]}"}
                data-testid={"radio-#{@slug}"}
                value={option["value"] || option[:value]}
                required={@field.required}
                class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                for={"#{@field.label}_#{option["value"] || option[:value]}"}
                class="ml-2 block text-sm text-gray-700"
              >
                <%= option["label"] || option[:label] %>
              </label>
            </div>
          <% end %>
        </div>
        """

      _ ->
        ~H"""
        <input
          type="text"
          name={@field.label}
          id={@field.label}
          data-testid={"input-#{@slug}"}
          required={@field.required}
          placeholder={@field.placeholder}
          class={"mt-2 block w-full rounded-md #{@error_class} shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"}
        />
        """
    end
  end

  defp extract_form_data(params, fields) do
    fields
    |> Enum.reduce(%{}, fn field, acc ->
      value = params[field.label] || ""
      # Handle checkbox values
      value = if field.field_type == :checkbox, do: value == "true", else: value
      Map.put(acc, field.label, value)
    end)
  end

  defp validate_form(form_data, fields) do
    errors =
      fields
      |> Enum.filter(& &1.required)
      |> Enum.reduce(%{}, fn field, acc ->
        value = form_data[field.label]

        if is_nil(value) || value == "" || value == false do
          Map.put(acc, field.label, "This field is required")
        else
          acc
        end
      end)

    if errors == %{} do
      {:ok, form_data}
    else
      {:error, errors}
    end
  end

  defp extract_metadata(params) do
    %{}
    |> maybe_put_utm(params, "utm_source")
    |> maybe_put_utm(params, "utm_medium")
    |> maybe_put_utm(params, "utm_campaign")
    |> maybe_put_utm(params, "utm_term")
    |> maybe_put_utm(params, "utm_content")
  end

  defp maybe_put_utm(metadata, params, key) do
    case params[key] do
      nil -> metadata
      "" -> metadata
      value -> Map.put(metadata, key, value)
    end
  end
end
