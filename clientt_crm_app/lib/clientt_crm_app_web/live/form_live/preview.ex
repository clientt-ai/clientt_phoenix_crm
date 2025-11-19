defmodule ClienttCrmAppWeb.FormLive.Preview do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(%{"id" => form_id}, _session, socket) do
    {:ok, form} = Forms.Form |> Ash.get(form_id)
    {:ok, fields} = Forms.FormField |> Ash.Query.for_read(:for_form, %{form_id: form_id}) |> Ash.read()

    {:ok,
     socket
     |> assign(:form, form)
     |> assign(:fields, fields)
     |> assign(:page_title, "Preview - #{form.name}")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-gray-100">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-4">
            <.link navigate={~p"/forms/#{@form.id}/edit"} class="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Builder
            </.link>
            <h1 class="text-xl font-bold text-gray-900">Form Preview</h1>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Preview Mode</span>
            <span class={"badge #{if @form.status == :published, do: "badge-success", else: "badge-warning"}"}>
              <%= @form.status |> Atom.to_string() |> String.capitalize() %>
            </span>
          </div>
        </div>
      </div>

      <!-- Preview Content -->
      <div class="py-8 px-4">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <!-- Form Header -->
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900"><%= @form.name %></h2>
              <%= if @form.description && @form.description != "" do %>
                <p class="mt-2 text-gray-600"><%= @form.description %></p>
              <% end %>
            </div>

            <!-- Form Fields -->
            <div class="space-y-6">
              <%= if @fields == [] do %>
                <div class="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p class="text-gray-500">No fields added to this form yet.</p>
                </div>
              <% else %>
                <%= for field <- @fields do %>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <%= field.label %>
                      <%= if field.required do %>
                        <span class="text-red-500">*</span>
                      <% end %>
                    </label>
                    <%= render_field(field) %>
                    <%= if field.help_text && field.help_text != "" do %>
                      <p class="mt-1 text-sm text-gray-500"><%= field.help_text %></p>
                    <% end %>
                  </div>
                <% end %>
              <% end %>
            </div>

            <!-- Submit Button -->
            <%= if @fields != [] do %>
              <div class="mt-8">
                <button class="btn btn-primary w-full" disabled>
                  Submit Form
                </button>
                <p class="mt-2 text-xs text-center text-gray-400">
                  Preview mode - form submission is disabled
                </p>
              </div>
            <% end %>
          </div>

          <!-- Public URL Info -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Share this form</h3>
            <div class="flex items-center gap-2">
              <input
                type="text"
                readonly
                value={"#{ClienttCrmAppWeb.Endpoint.url()}/f/#{@form.id}"}
                class="input input-bordered input-sm flex-1 bg-white"
              />
              <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp render_field(field) do
    assigns = %{field: field}

    case field.field_type do
      :textarea ->
        ~H"""
        <textarea
          rows="4"
          class="textarea textarea-bordered w-full"
          placeholder={@field.placeholder}
        ></textarea>
        """

      :select ->
        ~H"""
        <select class="select select-bordered w-full">
          <option disabled selected><%= @field.placeholder || "Select an option" %></option>
          <%= for option <- (@field.options || []) do %>
            <option><%= option["label"] || option[:label] %></option>
          <% end %>
        </select>
        """

      :checkbox ->
        ~H"""
        <div class="flex items-center">
          <input type="checkbox" class="checkbox checkbox-primary" />
          <span class="ml-2 text-sm text-gray-700"><%= @field.placeholder || "I agree" %></span>
        </div>
        """

      :radio ->
        ~H"""
        <div class="space-y-2">
          <%= for option <- (@field.options || [%{label: "Option 1"}, %{label: "Option 2"}]) do %>
            <div class="flex items-center">
              <input type="radio" name={@field.id} class="radio radio-primary" />
              <span class="ml-2 text-sm text-gray-700"><%= option["label"] || option[:label] %></span>
            </div>
          <% end %>
        </div>
        """

      _ ->
        ~H"""
        <input
          type={input_type(@field.field_type)}
          class="input input-bordered w-full"
          placeholder={@field.placeholder}
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
