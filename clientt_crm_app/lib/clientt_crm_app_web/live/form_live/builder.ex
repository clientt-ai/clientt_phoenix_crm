defmodule ClienttCrmAppWeb.FormLive.Builder do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  # Field categories with their field types
  @field_categories [
    {:contacts, "Contacts", [
      {:text, "First Name", "hero-user"},
      {:text, "Last Name", "hero-user"},
      {:email, "Email", "hero-envelope"},
      {:phone, "Phone", "hero-phone"},
      {:text, "Address", "hero-map-pin"},
      {:text, "Company", "hero-building-office"}
    ]},
    {:general, "General", [
      {:text, "Text Input", "hero-pencil"},
      {:textarea, "Text Area", "hero-document-text"},
      {:number, "Number", "hero-hashtag"},
      {:date, "Date", "hero-calendar"},
      {:url, "URL", "hero-link"}
    ]},
    {:choices, "Choices", [
      {:select, "Select Dropdown", "hero-chevron-down"},
      {:radio, "Radio Buttons", "hero-stop-circle"},
      {:checkbox, "Checkbox", "hero-check-square"}
    ]}
  ]

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
     |> assign(:field_categories, @field_categories)
     |> assign(:selected_field, nil)
     |> assign(:expanded_categories, [:contacts, :general, :choices])
     |> assign(:show_fields_panel, true)
     |> assign(:form_errors, %{})
     |> assign(:field_errors, %{})
     |> assign(:form_title, form && form.name || "Form Title")
     |> assign(:form_description, form && form.description || "")}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :new, _params) do
    socket
    |> assign(:page_title, "Form Builder")
    |> assign(:form, nil)
  end

  defp apply_action(socket, :edit, %{"id" => _id}) do
    socket
    |> assign(:page_title, "Form Builder")
  end

  # Form events
  @impl true
  def handle_event("save_form", _params, socket) do
    name = socket.assigns.form_title
    description = socket.assigns.form_description
    errors = validate_form_settings(name)

    cond do
      is_nil(socket.assigns.current_tenant_id) || is_nil(socket.assigns.current_authz_user_id) ->
        {:noreply, put_flash(socket, :error, "No company assigned. Please contact administrator.")}

      errors != %{} ->
        {:noreply, assign(socket, :form_errors, errors)}

      true ->
        form_attrs = %{
          name: name,
          description: description,
          tenant_id: socket.assigns.current_tenant_id,
          created_by_id: socket.assigns.current_authz_user_id
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
             |> assign(:form_errors, %{})
             |> put_flash(:info, "Form saved successfully")}

          {:error, error} ->
            form_errors = extract_ash_errors(error)
            {:noreply,
             socket
             |> assign(:form_errors, form_errors)
             |> put_flash(:error, "Failed to save form")}
        end
    end
  end

  @impl true
  def handle_event("update_title", params, socket) do
    value = params["value"] || params["target"]["value"] || socket.assigns.form_title
    {:noreply, assign(socket, :form_title, value)}
  end

  @impl true
  def handle_event("update_description", params, socket) do
    value = params["value"] || params["target"]["value"] || socket.assigns.form_description
    {:noreply, assign(socket, :form_description, value)}
  end

  @impl true
  def handle_event("toggle_fields_panel", _params, socket) do
    {:noreply, assign(socket, :show_fields_panel, !socket.assigns.show_fields_panel)}
  end

  @impl true
  def handle_event("toggle_category", %{"category" => category}, socket) do
    category_atom = String.to_existing_atom(category)
    expanded = socket.assigns.expanded_categories

    new_expanded =
      if category_atom in expanded do
        List.delete(expanded, category_atom)
      else
        [category_atom | expanded]
      end

    {:noreply, assign(socket, :expanded_categories, new_expanded)}
  end

  # Field events
  @impl true
  def handle_event("add_field_type", %{"type" => type, "label" => label}, socket) do
    if is_nil(socket.assigns.form) do
      {:noreply, put_flash(socket, :error, "Please save the form first")}
    else
      field_type = String.to_existing_atom(type)

      # Get the next order position
      next_position = length(socket.assigns.fields)

      attrs = %{
        field_type: field_type,
        label: label,
        placeholder: "",
        help_text: "",
        required: false,
        order_position: next_position,
        options: [],
        form_id: socket.assigns.form.id
      }

      case Forms.FormField
           |> Ash.Changeset.for_create(:create, attrs)
           |> Ash.create() do
        {:ok, field} ->
          # Reload fields
          {:ok, fields} =
            Forms.FormField
            |> Ash.Query.for_read(:for_form, %{form_id: socket.assigns.form.id})
            |> Ash.read()

          {:noreply,
           socket
           |> assign(:fields, fields)
           |> assign(:selected_field, field)
           |> put_flash(:info, "Field added")}

        {:error, _} ->
          {:noreply, put_flash(socket, :error, "Failed to add field")}
      end
    end
  end

  @impl true
  def handle_event("select_field", %{"id" => field_id}, socket) do
    field = Enum.find(socket.assigns.fields, &(&1.id == field_id))
    {:noreply, assign(socket, :selected_field, field)}
  end

  @impl true
  def handle_event("deselect_field", _params, socket) do
    {:noreply, assign(socket, :selected_field, nil)}
  end

  @impl true
  def handle_event("update_field", field_params, socket) do
    field = socket.assigns.selected_field

    if is_nil(field) do
      {:noreply, socket}
    else
      # Parse options if provided
      options =
        if field_params["options"] && field_params["options"] != "" do
          field_params["options"]
          |> String.split("\n")
          |> Enum.map(&String.trim/1)
          |> Enum.reject(&(&1 == ""))
          |> Enum.map(fn opt -> %{label: opt, value: String.downcase(opt)} end)
        else
          field.options || []
        end

      attrs = %{
        label: field_params["label"] || field.label,
        placeholder: field_params["placeholder"] || field.placeholder,
        help_text: field_params["help_text"] || field.help_text,
        required: field_params["required"] == "true",
        options: options
      }

      case field
           |> Ash.Changeset.for_update(:update, attrs)
           |> Ash.update() do
        {:ok, updated_field} ->
          # Reload fields
          {:ok, fields} =
            Forms.FormField
            |> Ash.Query.for_read(:for_form, %{form_id: socket.assigns.form.id})
            |> Ash.read()

          {:noreply,
           socket
           |> assign(:fields, fields)
           |> assign(:selected_field, updated_field)
           |> assign(:field_errors, %{})}

        {:error, error} ->
          field_errors = extract_ash_errors(error)
          {:noreply, assign(socket, :field_errors, field_errors)}
      end
    end
  end

  @impl true
  def handle_event("delete_field", _params, socket) do
    field = socket.assigns.selected_field

    if is_nil(field) do
      {:noreply, socket}
    else
      case Ash.destroy(field) do
        :ok ->
          updated_fields = Enum.reject(socket.assigns.fields, &(&1.id == field.id))

          {:noreply,
           socket
           |> assign(:fields, updated_fields)
           |> assign(:selected_field, nil)
           |> put_flash(:info, "Field deleted")}

        {:error, _} ->
          {:noreply, put_flash(socket, :error, "Failed to delete field")}
      end
    end
  end

  @impl true
  def handle_event("reorder_field", %{"from_index" => from_index, "to_index" => to_index}, socket) do
    fields = socket.assigns.fields

    if from_index != to_index and from_index >= 0 and to_index >= 0 do
      # Reorder in memory
      {field, remaining} = List.pop_at(fields, from_index)
      reordered = List.insert_at(remaining, to_index, field)

      # Update order_position for all fields
      reordered
      |> Enum.with_index()
      |> Enum.each(fn {f, idx} ->
        if f.order_position != idx do
          f
          |> Ash.Changeset.for_update(:update, %{order_position: idx})
          |> Ash.update()
        end
      end)

      # Reload fields to get updated order
      {:ok, updated_fields} =
        Forms.FormField
        |> Ash.Query.for_read(:for_form, %{form_id: socket.assigns.form.id})
        |> Ash.read()

      {:noreply, assign(socket, :fields, updated_fields)}
    else
      {:noreply, socket}
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

  defp validate_form_settings(name) do
    errors = %{}

    errors =
      if name == nil || String.trim(name) == "" do
        Map.put(errors, :name, "Form name is required")
      else
        errors
      end

    errors
  end

  defp extract_ash_errors(error) do
    errors =
      case error do
        %Ash.Error.Invalid{errors: errs} -> errs
        %{errors: errs} -> errs
        errs when is_list(errs) -> errs
        _ -> []
      end

    errors
    |> Enum.reduce(%{}, fn err, acc ->
      {field, message} =
        case err do
          %{field: f, message: m} -> {f, m}
          %Ash.Error.Changes.InvalidAttribute{field: f, message: m} -> {f, m}
          %{vars: vars, message: m} -> {Map.get(vars, :field, :unknown), m}
          _ -> {:unknown, "An error occurred"}
        end

      if field == :name do
        Map.put(acc, :name, message)
      else
        Map.put(acc, field, message)
      end
    end)
  end

  @impl true
  def render(assigns) do
    ~H"""
    <Layouts.flash_group flash={@flash} />
    <div data-testid="form-builder" class="h-full flex flex-col">
      <!-- Toolbar -->
      <div class="border-b border-gray-200 bg-white px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <.link navigate={~p"/forms"} class="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </.link>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p class="text-sm text-gray-500">Create and customize your form with AI assistance</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              phx-click="toggle_fields_panel"
              class="btn btn-ghost btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <%= if @show_fields_panel, do: "Hide Fields", else: "Show Fields" %>
            </button>
            <button class="btn btn-ghost btn-sm" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              AI Assistant
              <span class="badge badge-xs badge-warning ml-1">Soon</span>
            </button>
            <.link navigate={~p"/forms/#{@form && @form.id}/preview"} class="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Show Preview
            </.link>
            <button
              phx-click="save_form"
              data-testid="save-form-button"
              class="btn btn-primary btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Form
            </button>
          </div>
        </div>
      </div>

      <!-- Post-Submission Actions -->
      <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Post-Submission Actions</h3>
            <p class="text-xs text-gray-500">Configure what happens after form submission</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a Demo
            </button>
            <button class="btn btn-ghost btn-sm" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Open Chatbot
            </button>
            <button class="btn btn-outline btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Redirect URL
            </button>
          </div>
        </div>
      </div>

      <!-- Main 3-Column Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel: Field Palette -->
        <%= if @show_fields_panel do %>
          <div class="w-72 border-r border-gray-200 bg-white overflow-y-auto">
            <div class="p-4">
              <h3 class="text-sm font-semibold text-gray-900">Add Form Fields</h3>
              <p class="text-xs text-gray-500 mt-1">Click to add fields to your form</p>
            </div>

            <div class="px-2 pb-4">
              <%= for {category_id, category_name, fields} <- @field_categories do %>
                <div class="mb-2">
                  <button
                    phx-click="toggle_category"
                    phx-value-category={category_id}
                    class="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <span class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <%= category_name %>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class={"h-4 w-4 text-gray-400 transition-transform #{if category_id in @expanded_categories, do: "rotate-90"}"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <%= if category_id in @expanded_categories do %>
                    <div class="grid grid-cols-2 gap-2 mt-2 px-2">
                      <%= for {field_type, field_label, _icon} <- fields do %>
                        <button
                          phx-click="add_field_type"
                          phx-value-type={field_type}
                          phx-value-label={field_label}
                          class="flex flex-col items-center p-3 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <%= field_label %>
                        </button>
                      <% end %>
                    </div>
                  <% end %>
                </div>
              <% end %>
            </div>
          </div>
        <% end %>

        <!-- Center Panel: Form Canvas -->
        <div class="flex-1 overflow-y-auto bg-gray-100 p-6" phx-click="deselect_field">
          <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <!-- Form Title & Description -->
              <div class="mb-6">
                <input
                  type="text"
                  value={@form_title}
                  phx-blur="update_title"
                  phx-keyup="update_title"
                  phx-debounce="300"
                  data-testid="form-name-input"
                  placeholder="Form Title"
                  class="text-2xl font-bold text-gray-900 border-0 p-0 w-full focus:ring-0 placeholder-gray-300 hover:bg-gray-50 focus:bg-gray-50 rounded px-1 -mx-1"
                />
                <%= if @form_errors[:name] do %>
                  <p data-testid="form-name-error" class="mt-1 text-sm text-red-600"><%= @form_errors[:name] %></p>
                <% end %>
                <textarea
                  phx-blur="update_description"
                  phx-keyup="update_description"
                  phx-debounce="300"
                  data-testid="form-description-input"
                  placeholder="Add a description for your form..."
                  rows="2"
                  class="mt-2 text-sm text-gray-500 border-0 p-0 w-full focus:ring-0 placeholder-gray-300 resize-none hover:bg-gray-50 focus:bg-gray-50 rounded px-1 -mx-1"
                ><%= @form_description %></textarea>
              </div>

              <!-- Fields List -->
              <div id="fields-container" class="space-y-3" phx-hook="FieldReorder">
                <%= if @fields == [] do %>
                  <div class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">
                      <%= if @form, do: "Click a field type to add it here", else: "Save form first, then add fields" %>
                    </p>
                  </div>
                <% else %>
                  <%= for field <- @fields do %>
                    <div
                      phx-click="select_field"
                      phx-value-id={field.id}
                      data-testid="form-field"
                      data-field-id={field.id}
                      draggable="true"
                      class={"relative p-4 rounded-lg border-2 cursor-pointer transition-all #{if @selected_field && @selected_field.id == field.id, do: "border-primary bg-primary/5", else: "border-gray-200 hover:border-gray-300"}"}
                    >
                      <div class="flex items-start gap-3">
                        <!-- Drag Handle -->
                        <div class="flex-shrink-0 mt-1 text-gray-400 cursor-move">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="5" r="1.5" />
                            <circle cx="15" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="15" cy="19" r="1.5" />
                          </svg>
                        </div>

                        <!-- Field Content -->
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="font-medium text-gray-900"><%= field.label %></span>
                            <%= if field.required do %>
                              <span class="text-red-500">*</span>
                            <% end %>
                            <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              <%= format_field_type(field.field_type) %>
                            </span>
                          </div>
                          <%= render_field_preview(field) %>
                        </div>

                        <!-- Delete Button -->
                        <%= if @selected_field && @selected_field.id == field.id do %>
                          <button
                            phx-click="delete_field"
                            data-testid="delete-field-button"
                            class="flex-shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        <% end %>
                      </div>
                    </div>
                  <% end %>
                <% end %>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Properties or AI Assistant -->
        <div class="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <%= if @selected_field do %>
            <!-- Field Properties -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 class="font-semibold text-gray-900">Field Properties</h3>
              </div>

              <form phx-change="update_field" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                  <input
                    type="text"
                    name="label"
                    value={@selected_field.label}
                    data-testid="field-label-input"
                    class="input input-bordered input-sm w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                  <input
                    type="text"
                    name="placeholder"
                    value={@selected_field.placeholder}
                    data-testid="field-placeholder-input"
                    class="input input-bordered input-sm w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="help_text"
                    rows="2"
                    data-testid="field-help-text-input"
                    class="textarea textarea-bordered textarea-sm w-full"
                  ><%= @selected_field.help_text %></textarea>
                </div>

                <%= if @selected_field.field_type in [:select, :radio] do %>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                    <textarea
                      name="options"
                      rows="3"
                      class="textarea textarea-bordered textarea-sm w-full"
                    ><%= if @selected_field.options do
                      Enum.map(@selected_field.options, fn opt -> opt["label"] || opt[:label] end)
                      |> Enum.join("\n")
                    end %></textarea>
                  </div>
                <% end %>

                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-gray-700">Required Field</label>
                  <input
                    type="checkbox"
                    name="required"
                    value="true"
                    checked={@selected_field.required}
                    data-testid="field-required-checkbox"
                    class="toggle toggle-primary toggle-sm"
                  />
                </div>
              </form>

              <button
                phx-click="delete_field"
                data-testid="delete-field-panel-button"
                class="btn btn-error btn-outline w-full mt-6"
              >
                Delete Field
              </button>
            </div>
          <% else %>
            <!-- AI Assistant (Coming Soon) -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 class="font-semibold text-gray-900">AI Forms Assistant</h3>
                <span class="badge badge-warning badge-xs">Coming Soon</span>
              </div>

              <p class="text-sm text-gray-500 mb-4">
                Get intelligent suggestions to improve your form
              </p>

              <div class="space-y-3 opacity-50">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-700">Add phone number field for direct contact</p>
                  <button class="btn btn-ghost btn-xs mt-2" disabled>Apply Suggestion</button>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-700">Add message field for detailed feedback</p>
                  <button class="btn btn-ghost btn-xs mt-2" disabled>Apply Suggestion</button>
                </div>
              </div>
            </div>
          <% end %>
        </div>
      </div>
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
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-sm"
          placeholder={@field.placeholder}
          disabled
        ></textarea>
        """

      :select ->
        ~H"""
        <select class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-sm" disabled>
          <option><%= @field.placeholder || "Select an option" %></option>
        </select>
        """

      :checkbox ->
        ~H"""
        <div class="mt-1 flex items-center">
          <input type="checkbox" class="h-4 w-4 rounded border-gray-300" disabled />
          <span class="ml-2 text-sm text-gray-500"><%= @field.placeholder || "Checkbox option" %></span>
        </div>
        """

      :radio ->
        ~H"""
        <div class="mt-1 space-y-1">
          <%= for option <- (@field.options || [%{label: "Option 1"}, %{label: "Option 2"}]) do %>
            <div class="flex items-center">
              <input type="radio" class="h-4 w-4 border-gray-300" disabled />
              <span class="ml-2 text-sm text-gray-500"><%= option["label"] || option[:label] %></span>
            </div>
          <% end %>
        </div>
        """

      _ ->
        ~H"""
        <input
          type={input_type(@field.field_type)}
          class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-sm"
          placeholder={@field.placeholder || "Enter #{@field.label}"}
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
