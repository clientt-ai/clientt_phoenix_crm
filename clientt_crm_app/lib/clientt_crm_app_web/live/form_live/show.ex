defmodule ClienttCrmAppWeb.FormLive.Show do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    # Load form
    {:ok, form} = Forms.Form |> Ash.get(id)

    # Load fields for this form
    {:ok, fields} =
      Forms.FormField
      |> Ash.Query.for_read(:for_form, %{form_id: id})
      |> Ash.read()

    # Load recent submissions (last 10)
    {:ok, recent_submissions} =
      Forms.Submission
      |> Ash.Query.for_read(:for_form, %{form_id: id})
      |> Ash.Query.sort(submitted_at: :desc)
      |> Ash.Query.limit(10)
      |> Ash.read()

    {:ok,
     socket
     |> assign(:form, form)
     |> assign(:fields, fields)
     |> assign(:recent_submissions, recent_submissions)
     |> assign(:page_title, form.name)}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :show, _params) do
    socket
  end

  @impl true
  def handle_event("archive_form", _params, socket) do
    case socket.assigns.form
         |> Ash.Changeset.for_update(:archive)
         |> Ash.update() do
      {:ok, form} ->
        {:noreply,
         socket
         |> assign(:form, form)
         |> put_flash(:info, "Form archived successfully")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to archive form")}
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
  def handle_event("copy_embed_code", _params, socket) do
    # TODO: Implement clipboard copy
    {:noreply, put_flash(socket, :info, "Embed code copied to clipboard")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <.link
          navigate={~p"/forms"}
          class="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Forms
        </.link>

        <div class="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
              <%= @form.name %>
            </h1>
            <p class="mt-2 text-sm text-gray-700">
              <%= @form.description %>
            </p>
            <div class="mt-2 flex items-center gap-2">
              <span class={[
                "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                status_badge_class(@form.status)
              ]}>
                <%= format_status(@form.status) %>
              </span>
              <%= if @form.published_at do %>
                <span class="text-xs text-gray-500">
                  Published <%= format_datetime(@form.published_at) %>
                </span>
              <% end %>
            </div>
          </div>

          <div class="mt-4 sm:mt-0 flex gap-2">
            <%= if @form.status == :draft do %>
              <button
                phx-click="publish_form"
                class="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
              >
                Publish Form
              </button>
            <% end %>

            <%= if @form.status == :published do %>
              <button
                phx-click="archive_form"
                class="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500"
              >
                Archive Form
              </button>
            <% end %>

            <.link
              navigate={~p"/forms/#{@form.id}/edit"}
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Edit Form
            </.link>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Total Submissions</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= @form.submission_count %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Total Views</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= @form.view_count %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Conversion Rate</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= conversion_rate(@form) %>%
          </dd>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Left Column: Form Fields -->
        <div>
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
                  Form Fields
                </h3>
                <%= if @form.status == :draft do %>
                  <.link
                    navigate={~p"/forms/#{@form.id}/edit"}
                    class="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Edit Fields
                  </.link>
                <% end %>
              </div>

              <%= if @fields == [] do %>
                <div class="text-center py-6">
                  <p class="text-sm text-gray-500">No fields added yet.</p>
                  <%= if @form.status == :draft do %>
                    <.link
                      navigate={~p"/forms/#{@form.id}/edit"}
                      class="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Add fields to get started →
                    </.link>
                  <% end %>
                </div>
              <% else %>
                <ul class="divide-y divide-gray-200">
                  <%= for field <- @fields do %>
                    <li class="py-4">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">
                            <%= field.label %>
                            <%= if field.required do %>
                              <span class="text-red-500">*</span>
                            <% end %>
                          </p>
                          <p class="text-sm text-gray-500">
                            <%= format_field_type(field.field_type) %>
                          </p>
                          <%= if field.help_text do %>
                            <p class="text-xs text-gray-400 mt-1"><%= field.help_text %></p>
                          <% end %>
                        </div>
                        <div class="text-sm text-gray-500">
                          Order: <%= field.order_position %>
                        </div>
                      </div>
                    </li>
                  <% end %>
                </ul>
              <% end %>
            </div>
          </div>

          <!-- Embed Code Section -->
          <%= if @form.status == :published do %>
            <div class="mt-6 bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                  Embed Code
                </h3>
                <div class="relative">
                  <pre class="bg-gray-50 rounded-md p-4 text-xs overflow-x-auto"><code>&lt;iframe src="<%= form_embed_url(@form) %>" width="100%" height="600" frameborder="0"&gt;&lt;/iframe&gt;</code></pre>
                  <button
                    phx-click="copy_embed_code"
                    class="absolute top-2 right-2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          <% end %>
        </div>

        <!-- Right Column: Recent Submissions -->
        <div>
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold leading-6 text-gray-900">
                  Recent Submissions
                </h3>
                <%= if @recent_submissions != [] do %>
                  <.link
                    navigate={~p"/forms/#{@form.id}/submissions"}
                    class="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    View All
                  </.link>
                <% end %>
              </div>

              <%= if @recent_submissions == [] do %>
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No submissions yet.</p>
                  <%= if @form.status == :published do %>
                    <p class="mt-1 text-xs text-gray-400">
                      Share this form to start receiving submissions.
                    </p>
                  <% end %>
                </div>
              <% else %>
                <ul class="divide-y divide-gray-200">
                  <%= for submission <- @recent_submissions do %>
                    <li class="py-4">
                      <.link
                        navigate={~p"/submissions/#{submission.id}"}
                        class="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">
                              <%= submission.submitter_email || "Anonymous" %>
                            </p>
                            <p class="text-xs text-gray-500">
                              <%= format_datetime(submission.submitted_at) %>
                            </p>
                          </div>
                          <span class={[
                            "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                            submission_status_class(submission.status)
                          ]}>
                            <%= format_status(submission.status) %>
                          </span>
                        </div>
                      </.link>
                    </li>
                  <% end %>
                </ul>
              <% end %>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp status_badge_class(:draft), do: "bg-gray-100 text-gray-800"
  defp status_badge_class(:published), do: "bg-green-100 text-green-800"
  defp status_badge_class(:archived), do: "bg-yellow-100 text-yellow-800"

  defp submission_status_class(:new), do: "bg-blue-100 text-blue-800"
  defp submission_status_class(:contacted), do: "bg-yellow-100 text-yellow-800"
  defp submission_status_class(:qualified), do: "bg-purple-100 text-purple-800"
  defp submission_status_class(:converted), do: "bg-green-100 text-green-800"
  defp submission_status_class(:spam), do: "bg-red-100 text-red-800"

  defp format_status(status), do: status |> Atom.to_string() |> String.capitalize()

  defp format_field_type(type) do
    case type do
      :text -> "Text Input"
      :email -> "Email"
      :textarea -> "Text Area"
      :number -> "Number"
      :phone -> "Phone"
      :url -> "URL"
      :date -> "Date"
      :checkbox -> "Checkbox"
      :select -> "Select Dropdown"
      :radio -> "Radio Buttons"
      _ -> type |> Atom.to_string() |> String.capitalize()
    end
  end

  defp format_datetime(datetime) do
    Calendar.strftime(datetime, "%b %d, %Y %I:%M %p")
  end

  defp conversion_rate(form) do
    if form.view_count > 0 do
      ((form.submission_count / form.view_count) * 100)
      |> Float.round(1)
    else
      0
    end
  end

  defp form_embed_url(form) do
    url(~p"/f/#{form.id}")
  end
end
