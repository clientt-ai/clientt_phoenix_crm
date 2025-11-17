defmodule ClienttCrmAppWeb.FormLive.Index do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(_params, _session, socket) do
    # Load forms for current user's company
    import Ash.Query
    company_id = socket.assigns.current_company_id

    {:ok, forms} =
      Forms.Form
      |> for_read(:list)
      |> filter(company_id == ^company_id)
      |> Ash.read()

    {:ok,
     socket
     |> assign(:forms, forms)
     |> assign(:page_title, "Forms")}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :index, _params) do
    socket
    |> assign(:page_title, "Forms")
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
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">Forms</h1>
          <p class="mt-2 text-sm text-gray-700">
            Create and manage your forms to capture leads and gather information.
          </p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <.link
            navigate={~p"/forms/new"}
            data-testid="create-form-button"
            class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Form
          </.link>
        </div>
      </div>

      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Submissions
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Views
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Updated
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <%= for form <- @forms do %>
                    <tr data-testid="form-card">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <.link navigate={~p"/forms/#{form.id}"} data-testid="form-title" class="text-indigo-600 hover:text-indigo-900">
                          <%= form.name %>
                        </.link>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span data-testid="form-status" class={[
                          "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          status_badge_class(form.status)
                        ]}>
                          <%= format_status(form.status) %>
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <%= form.submission_count %>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <%= form.view_count %>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <%= format_date(form.updated_at) %>
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <.link
                          navigate={~p"/forms/#{form.id}/edit"}
                          data-testid="edit-form-button"
                          class="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </.link>
                        <%= if form.status == :published do %>
                          <.link
                            navigate={~p"/forms/#{form.id}/submissions"}
                            data-testid="view-submissions-button"
                            class="text-indigo-600 hover:text-indigo-900"
                          >
                            View Submissions
                          </.link>
                        <% end %>
                      </td>
                    </tr>
                  <% end %>

                  <%= if @forms == [] do %>
                    <tr>
                      <td colspan="6" class="px-3 py-12 text-center text-sm text-gray-500" data-testid="no-results">
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
                        <h3 class="mt-2 text-sm font-semibold text-gray-900">No forms</h3>
                        <p class="mt-1 text-sm text-gray-500">
                          Get started by creating a new form.
                        </p>
                        <div class="mt-6">
                          <.link
                            navigate={~p"/forms/new"}
                            data-testid="create-form-button"
                            class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Create Form
                          </.link>
                        </div>
                      </td>
                    </tr>
                  <% end %>
                </tbody>
              </table>
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

  defp format_status(status), do: status |> Atom.to_string() |> String.capitalize()

  defp format_date(datetime) do
    Calendar.strftime(datetime, "%b %d, %Y")
  end
end
