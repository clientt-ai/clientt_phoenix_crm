defmodule ClienttCrmAppWeb.FormLive.Index do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(_params, _session, socket) do
    # Load forms for current user's company
    import Ash.Query
    tenant_id = socket.assigns.current_tenant_id

    {:ok, forms} =
      Forms.Form
      |> for_read(:list)
      |> filter(tenant_id == ^tenant_id)
      |> Ash.read()

    # Calculate KPIs
    total_forms = length(forms)
    total_submissions = Enum.sum(Enum.map(forms, & &1.submission_count))
    active_forms = Enum.count(forms, &(&1.status == :published))
    conversion_rate = if Enum.sum(Enum.map(forms, & &1.view_count)) > 0 do
      total_submissions / Enum.sum(Enum.map(forms, & &1.view_count)) * 100
    else
      0.0
    end

    {:ok,
     socket
     |> assign(:forms, forms)
     |> assign(:filtered_forms, forms)
     |> assign(:search_query, "")
     |> assign(:total_forms, total_forms)
     |> assign(:total_submissions, total_submissions)
     |> assign(:active_forms, active_forms)
     |> assign(:conversion_rate, Float.round(conversion_rate, 1))
     |> assign(:page_title, "All Forms")
     |> assign(:current_page, "forms")}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :index, _params) do
    socket
    |> assign(:page_title, "All Forms")
  end

  @impl true
  def handle_event("search", %{"query" => query}, socket) do
    filtered = if query == "" do
      socket.assigns.forms
    else
      query_lower = String.downcase(query)
      Enum.filter(socket.assigns.forms, fn form ->
        String.contains?(String.downcase(form.name), query_lower) ||
        (form.description && String.contains?(String.downcase(form.description), query_lower))
      end)
    end

    {:noreply,
     socket
     |> assign(:search_query, query)
     |> assign(:filtered_forms, filtered)}
  end

  @impl true
  def handle_event("delete", %{"id" => id}, socket) do
    # TODO: Implement form archiving (forms cannot be deleted, only archived)
    {:noreply, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">All Forms</h1>
          <p class="mt-2 text-sm text-gray-700">
            Manage and track your forms
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center gap-3">
          <!-- Search -->
          <div class="relative">
            <input
              type="text"
              placeholder="Search forms..."
              value={@search_query}
              phx-keyup="search"
              phx-value-query={@search_query}
              class="input input-bordered input-sm w-64 pl-9"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <.link
            navigate={~p"/forms/new"}
            data-testid="create-form-button"
            class="btn btn-primary btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Form
          </.link>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Forms -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Forms</p>
              <p class="text-2xl font-semibold text-gray-900"><%= @total_forms %></p>
            </div>
          </div>
        </div>

        <!-- Total Submissions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Submissions</p>
              <p class="text-2xl font-semibold text-gray-900"><%= @total_submissions %></p>
            </div>
          </div>
        </div>

        <!-- Active Forms -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Forms</p>
              <p class="text-2xl font-semibold text-gray-900"><%= @active_forms %></p>
            </div>
          </div>
        </div>

        <!-- Conversion Rate -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 p-3 bg-orange-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p class="text-2xl font-semibold text-gray-900"><%= @conversion_rate %>%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Forms Table -->
      <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Name
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Type
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Submissions
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Date Created
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Last Edited
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <%= for form <- @filtered_forms do %>
              <tr data-testid="form-card">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  <.link navigate={~p"/forms/#{form.id}"} data-testid="form-title" class="text-primary hover:text-primary/80">
                    <%= form.name %>
                  </.link>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    Form
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <%= form.submission_count %>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <span data-testid="form-status" class={[
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    status_badge_class(form.status)
                  ]}>
                    <%= format_status(form.status) %>
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <%= format_date(form.created_at) %>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <%= format_date(form.updated_at) %>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <.link
                    navigate={~p"/forms/#{form.id}/edit"}
                    data-testid="edit-form-button"
                    class="text-primary hover:text-primary/80 mr-4"
                  >
                    Edit
                  </.link>
                  <%= if form.status == :published do %>
                    <.link
                      navigate={~p"/forms/#{form.id}/submissions"}
                      data-testid="view-submissions-button"
                      class="text-primary hover:text-primary/80"
                    >
                      Submissions
                    </.link>
                  <% end %>
                </td>
              </tr>
            <% end %>

            <%= if @filtered_forms == [] do %>
              <tr>
                <td colspan="7" class="px-3 py-12 text-center text-sm text-gray-500" data-testid="no-results">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                    />
                  </svg>
                  <%= if @search_query != "" do %>
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">No forms found</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      No forms match your search "<%= @search_query %>"
                    </p>
                  <% else %>
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">No forms</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Get started by creating a new form.
                    </p>
                  <% end %>
                  <div class="mt-6">
                    <.link
                      navigate={~p"/forms/new"}
                      data-testid="create-form-button"
                      class="btn btn-primary btn-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Form
                    </.link>
                  </div>
                </td>
              </tr>
            <% end %>
          </tbody>
        </table>
      </div>
    </div>
    """
  end

  defp status_badge_class(:draft), do: "bg-gray-100 text-gray-700"
  defp status_badge_class(:published), do: "bg-green-100 text-green-700"
  defp status_badge_class(:archived), do: "bg-yellow-100 text-yellow-700"

  defp format_status(status), do: status |> Atom.to_string() |> String.capitalize()

  defp format_date(datetime) do
    Calendar.strftime(datetime, "%b %d, %Y")
  end
end
