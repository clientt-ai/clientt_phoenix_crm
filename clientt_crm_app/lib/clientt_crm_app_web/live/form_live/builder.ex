defmodule ClienttCrmAppWeb.FormLive.Builder do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @field_types [
    {:text, "Text Input"},
    {:email, "Email"},
    {:textarea, "Text Area"},
    {:number, "Number"},
    {:phone, "Phone"},
    {:url, "URL"},
    {:date, "Date"},
    {:checkbox, "Checkbox"},
    {:select, "Select Dropdown"},
    {:radio, "Radio Buttons"}
  ]

  @impl true
  def mount(params, _session, socket) do
    form_id = params["id"]

    {form, fields} =
      if form_id do
        # Load existing form
        {:ok, form} = Forms.Form |> Ash.get(form_id)
        {:ok, fields} = Forms.FormField |> Ash.Query.for_read(:for_form, %{form_id: form_id}) |> Ash.read()
        {form, fields}
      else
        # New form
        {nil, []}
      end

    {:ok,
     socket
     |> assign(:form, form)
     |> assign(:fields, fields)
     |> assign(:field_types, @field_types)
     |> assign(:editing_field, nil)
     |> assign(:show_field_modal, false)}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :new, _params) do
    socket
    |> assign(:page_title, "Create Form")
    |> assign(:form, nil)
  end

  defp apply_action(socket, :edit, %{"id" => _id}) do
    socket
    |> assign(:page_title, "Edit Form")
  end

  @impl true
  def handle_event("save_form", %{"name" => name, "description" => description}, socket) do
    form_attrs = %{
      name: name,
      description: description,
      company_id: socket.assigns.current_company_id,
      created_by_id: socket.assigns.current_user.id
    }

    result =
      if socket.assigns.form do
        # Update existing form
        socket.assigns.form
        |> Ash.Changeset.for_update(:update, %{name: name, description: description})
        |> Ash.update()
      else
        # Create new form
        Forms.Form
        |> Ash.Changeset.for_create(:create, form_attrs)
        |> Ash.create()
      end

    case result do
      {:ok, form} ->
        {:noreply,
         socket
         |> assign(:form, form)
         |> put_flash(:info, "Form saved successfully")}

      {:error, _changeset} ->
        {:noreply, put_flash(socket, :error, "Failed to save form")}
    end
  end

  @impl true
  def handle_event("add_field", _params, socket) do
    {:noreply,
     socket
     |> assign(:editing_field, nil)
     |> assign(:show_field_modal, true)}
  end

  @impl true
  def handle_event("edit_field", %{"id" => field_id}, socket) do
    field = Enum.find(socket.assigns.fields, &(&1.id == field_id))

    {:noreply,
     socket
     |> assign(:editing_field, field)
     |> assign(:show_field_modal, true)}
  end

  @impl true
  def handle_event("close_modal", _params, socket) do
    {:noreply, assign(socket, :show_field_modal, false)}
  end

  @impl true
  def handle_event("stop_propagation", _params, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("save_field", field_params, socket) do
    # Parse field type and required flag
    field_type = String.to_existing_atom(field_params["field_type"])
    required = field_params["required"] == "true"

    # Parse options if provided (for select/radio types)
    options =
      if field_params["options"] && field_params["options"] != "" do
        field_params["options"]
        |> String.split("\n")
        |> Enum.map(&String.trim/1)
        |> Enum.reject(&(&1 == ""))
        |> Enum.map(fn opt -> %{label: opt, value: String.downcase(opt)} end)
      else
        []
      end

    attrs = %{
      field_type: field_type,
      label: field_params["label"],
      placeholder: field_params["placeholder"] || "",
      help_text: field_params["help_text"] || "",
      required: required,
      order_position: String.to_integer(field_params["order_position"] || "0"),
      options: options
    }

    result =
      if socket.assigns.editing_field do
        # Update existing field
        socket.assigns.editing_field
        |> Ash.Changeset.for_update(:update, attrs)
        |> Ash.update()
      else
        # Create new field
        Forms.FormField
        |> Ash.Changeset.for_create(:create, Map.put(attrs, :form_id, socket.assigns.form.id))
        |> Ash.create()
      end

    case result do
      {:ok, field} ->
        # Reload fields
        {:ok, fields} =
          Forms.FormField
          |> Ash.Query.for_read(:for_form, %{form_id: socket.assigns.form.id})
          |> Ash.read()

        {:noreply,
         socket
         |> assign(:fields, fields)
         |> assign(:show_field_modal, false)
         |> assign(:editing_field, nil)
         |> put_flash(:info, "Field saved successfully")}

      {:error, changeset} ->
        error_message =
          changeset.errors
          |> Enum.map(fn error -> error.message end)
          |> Enum.join(", ")

        {:noreply, put_flash(socket, :error, "Failed to save field: #{error_message}")}
    end
  end

  @impl true
  def handle_event("delete_field", %{"id" => field_id}, socket) do
    field = Enum.find(socket.assigns.fields, &(&1.id == field_id))

    case Ash.destroy(field) do
      :ok ->
        updated_fields = Enum.reject(socket.assigns.fields, &(&1.id == field_id))

        {:noreply,
         socket
         |> assign(:fields, updated_fields)
         |> put_flash(:info, "Field deleted successfully")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to delete field")}
    end
  end

  @impl true
  def handle_event("publish_form", _params, socket) do
    case socket.assigns.form
         |> Ash.Changeset.for_update(:publish)
         |> Ash.update() do
      {:ok, form} ->
        {:noreply,
         socket
         |> assign(:form, form)
         |> put_flash(:info, "Form published successfully")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to publish form")}
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <.link navigate={~p"/forms"} class="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to Forms
          </.link>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            <%= if @form, do: "Edit Form", else: "Create Form" %>
          </h1>
        </div>
        <%= if @form && @form.status == :draft do %>
          <button
            phx-click="publish_form"
            data-testid="publish-form-button"
            class="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            Publish Form
          </button>
        <% end %>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Left Column: Form Settings -->
        <div>
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Form Settings
              </h3>

              <form phx-submit="save_form" class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium leading-6 text-gray-900">
                    Form Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    data-testid="form-name-input"
                    value={@form && @form.name}
                    class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium leading-6 text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    data-testid="form-description-input"
                    rows="3"
                    class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  ><%= @form && @form.description %></textarea>
                </div>

                <button
                  type="submit"
                  data-testid="save-form-button"
                  class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  <%= if @form, do: "Update Form", else: "Create Form" %>
                </button>
              </form>
            </div>
          </div>

          <%= if @form do %>
            <div class="mt-6 bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                  Form Fields
                </h3>

                <%= if @fields == [] do %>
                  <div class="text-center py-6">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">No fields yet. Add your first field to get started.</p>
                  </div>
                <% else %>
                  <ul class="divide-y divide-gray-200">
                    <%= for field <- @fields do %>
                      <li data-testid="form-field" class="py-4 flex justify-between items-center">
                        <div>
                          <p class="text-sm font-medium text-gray-900"><%= field.label %></p>
                          <p class="text-sm text-gray-500">
                            <%= format_field_type(field.field_type) %>
                            <%= if field.required do %>
                              <span data-testid="field-required-badge">• Required</span>
                            <% end %>
                          </p>
                        </div>
                        <div class="flex gap-2">
                          <button
                            phx-click="edit_field"
                            phx-value-id={field.id}
                            data-testid="edit-field-button"
                            class="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            phx-click="delete_field"
                            phx-value-id={field.id}
                            data-testid="delete-field-button"
                            data-confirm="Are you sure?"
                            class="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    <% end %>
                  </ul>
                <% end %>

                <button
                  phx-click="add_field"
                  data-testid="add-field-button"
                  class="mt-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Add Field
                </button>
              </div>
            </div>
          <% end %>
        </div>

        <!-- Right Column: Preview -->
        <div>
          <div class="bg-white shadow sm:rounded-lg sticky top-4">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Form Preview
              </h3>

              <%= if @form do %>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-2"><%= @form.name %></h4>
                  <p class="text-sm text-gray-600 mb-6"><%= @form.description %></p>

                  <%= if @fields != [] do %>
                    <div class="space-y-4">
                      <%= for field <- @fields do %>
                        <div>
                          <label class="block text-sm font-medium text-gray-700">
                            <%= field.label %>
                            <%= if field.required do %>
                              <span class="text-red-500">*</span>
                            <% end %>
                          </label>
                          <%= render_field_preview(field) %>
                          <%= if field.help_text do %>
                            <p class="mt-1 text-sm text-gray-500"><%= field.help_text %></p>
                          <% end %>
                        </div>
                      <% end %>
                    </div>
                  <% else %>
                    <p class="text-center text-sm text-gray-500">Add fields to see preview</p>
                  <% end %>
                </div>
              <% else %>
                <p class="text-center text-sm text-gray-500">Save form to see preview</p>
              <% end %>
            </div>
          </div>
        </div>
      </div>

      <!-- Field Modal -->
      <%= if @show_field_modal do %>
        <div
          class="relative z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          phx-click="close_modal"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div class="fixed inset-0 z-10 overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                phx-click="stop_propagation"
              >
                <div>
                  <h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">
                    <%= if @editing_field, do: "Edit Field", else: "Add Field" %>
                  </h3>

                  <form phx-submit="save_field" class="space-y-4">
                    <div>
                      <label for="field_type" class="block text-sm font-medium text-gray-700">
                        Field Type *
                      </label>
                      <select
                        name="field_type"
                        id="field_type"
                        data-testid="field-type-select"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <%= for {type, label} <- @field_types do %>
                          <option
                            value={type}
                            data-testid={"field-type-#{type}"}
                            selected={@editing_field && @editing_field.field_type == type}
                          >
                            <%= label %>
                          </option>
                        <% end %>
                      </select>
                    </div>

                    <div>
                      <label for="label" class="block text-sm font-medium text-gray-700">
                        Label *
                      </label>
                      <input
                        type="text"
                        name="label"
                        id="label"
                        data-testid="field-label-input"
                        value={@editing_field && @editing_field.label}
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label for="placeholder" class="block text-sm font-medium text-gray-700">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        name="placeholder"
                        id="placeholder"
                        data-testid="field-placeholder-input"
                        value={@editing_field && @editing_field.placeholder}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label for="help_text" class="block text-sm font-medium text-gray-700">
                        Help Text
                      </label>
                      <input
                        type="text"
                        name="help_text"
                        id="help_text"
                        data-testid="field-help-text-input"
                        value={@editing_field && @editing_field.help_text}
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label for="order_position" class="block text-sm font-medium text-gray-700">
                        Order Position *
                      </label>
                      <input
                        type="number"
                        name="order_position"
                        id="order_position"
                        value={@editing_field && @editing_field.order_position || 0}
                        required
                        min="0"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label for="options" class="block text-sm font-medium text-gray-700">
                        Options (one per line, for select/radio types)
                      </label>
                      <textarea
                        name="options"
                        id="options"
                        rows="3"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      ><%= if @editing_field && @editing_field.options do
                        Enum.map(@editing_field.options, fn opt -> opt["label"] || opt[:label] end)
                        |> Enum.join("\n")
                      end %></textarea>
                      <p class="mt-1 text-xs text-gray-500">
                        Required for select and radio field types
                      </p>
                    </div>

                    <div class="flex items-center">
                      <input
                        type="checkbox"
                        name="required"
                        id="required"
                        data-testid="field-required-checkbox"
                        value="true"
                        checked={@editing_field && @editing_field.required}
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label for="required" class="ml-2 block text-sm text-gray-900">
                        Required field
                      </label>
                    </div>

                    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                      <button
                        type="submit"
                        data-testid="save-field-button"
                        class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
                      >
                        Save Field
                      </button>
                      <button
                        type="button"
                        phx-click="close_modal"
                        data-testid="cancel-button"
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  defp format_field_type(type) do
    @field_types
    |> Enum.find(fn {t, _} -> t == type end)
    |> case do
      {_, label} -> label
      nil -> type |> Atom.to_string() |> String.capitalize()
    end
  end

  defp render_field_preview(field) do
    assigns = %{field: field}

    case field.field_type do
      :textarea ->
        ~H"""
        <textarea
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={@field.placeholder}
          disabled
        ></textarea>
        """

      :select ->
        ~H"""
        <select class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" disabled>
          <option>Select an option</option>
          <%= for option <- @field.options do %>
            <option><%= option["label"] || option[:label] || option %></option>
          <% end %>
        </select>
        """

      :checkbox ->
        ~H"""
        <input
          type="checkbox"
          class="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          disabled
        />
        """

      :radio ->
        ~H"""
        <div class="mt-2 space-y-2">
          <%= for option <- @field.options do %>
            <div class="flex items-center">
              <input
                type="radio"
                class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled
              />
              <label class="ml-2 text-sm text-gray-700">
                <%= option["label"] || option[:label] || option %>
              </label>
            </div>
          <% end %>
        </div>
        """

      _ ->
        ~H"""
        <input
          type={input_type(@field.field_type)}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder={@field.placeholder}
          disabled
        />
        """
    end
  end

  defp input_type(:email), do: "email"
  defp input_type(:number), do: "number"
  defp input_type(:phone), do: "tel"
  defp input_type(:url), do: "url"
  defp input_type(:date), do: "date"
  defp input_type(_), do: "text"
end
