defmodule ClienttCrmAppWeb.DashboardLive do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(_params, _session, socket) do
    import Ash.Query
    company_id = socket.assigns.current_company_id

    # Load forms data for dashboard stats (filtered by company)
    {:ok, forms} =
      Forms.Form
      |> for_read(:list)
      |> filter(company_id == ^company_id)
      |> Ash.read()

    # Load recent submissions (last 10, filtered by company)
    {:ok, recent_submissions} =
      Forms.Submission
      |> for_read(:list)
      |> filter(company_id == ^company_id)
      |> sort(submitted_at: :desc)
      |> limit(10)
      |> Ash.read()

    {:ok,
     socket
     |> assign(:forms, forms)
     |> assign(:recent_submissions, recent_submissions)
     |> assign(:page_title, "Dashboard")}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">
        Dashboard
      </h1>

      <div class="bg-white shadow sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-gray-900">
            Welcome, <%= @current_user.email %>!
          </h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Track your forms, submissions, and leads from your CRM dashboard.</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Total Forms</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= length(@forms) %>
          </dd>
          <div class="mt-2">
            <.link
              navigate={~p"/forms"}
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all →
            </.link>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Published Forms</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= count_by_status(@forms, :published) %>
          </dd>
          <div class="mt-2">
            <.link
              navigate={~p"/forms/new"}
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create new →
            </.link>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Total Submissions</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= total_submissions(@forms) %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">New Leads</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= count_submissions_by_status(@recent_submissions, :new) %>
          </dd>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Quick Actions -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div class="grid grid-cols-1 gap-3">
              <.link
                navigate={~p"/forms/new"}
                class="flex items-center justify-between rounded-md border border-gray-300 px-4 py-3 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div>
                  <p class="font-medium text-gray-900">Create New Form</p>
                  <p class="text-sm text-gray-500">Build a new lead capture form</p>
                </div>
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </.link>

              <.link
                navigate={~p"/forms"}
                class="flex items-center justify-between rounded-md border border-gray-300 px-4 py-3 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <div>
                  <p class="font-medium text-gray-900">Manage Forms</p>
                  <p class="text-sm text-gray-500">View and edit your forms</p>
                </div>
                <svg
                  class="h-5 w-5 text-gray-400"
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
              </.link>
            </div>
          </div>
        </div>

        <!-- Recent Submissions -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
              Recent Submissions
            </h3>

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
                <p class="mt-1 text-xs text-gray-400">
                  Publish a form to start receiving submissions.
                </p>
              </div>
            <% else %>
              <ul class="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                <%= for submission <- Enum.take(@recent_submissions, 5) do %>
                  <li class="py-3">
                    <.link
                      navigate={~p"/submissions/#{submission.id}"}
                      class="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded-md"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 truncate">
                            <%= submission.submitter_email || "Anonymous" %>
                          </p>
                          <p class="text-xs text-gray-500">
                            <%= format_relative_time(submission.submitted_at) %>
                          </p>
                        </div>
                        <span class={[
                          "ml-2 inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                          submission_status_class(submission.status)
                        ]}>
                          <%= format_status(submission.status) %>
                        </span>
                      </div>
                    </.link>
                  </li>
                <% end %>
              </ul>

              <%= if length(@recent_submissions) > 5 do %>
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <p class="text-xs text-gray-500 text-center">
                    Showing 5 of <%= length(@recent_submissions) %> recent submissions
                  </p>
                </div>
              <% end %>
            <% end %>
          </div>
        </div>
      </div>

      <!-- Active Forms -->
      <%= if @forms != [] do %>
        <div class="mt-8 bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold leading-6 text-gray-900">
                Your Forms
              </h3>
              <.link
                navigate={~p"/forms"}
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all →
              </.link>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <%= for form <- Enum.take(@forms, 6) do %>
                <.link
                  navigate={~p"/forms/#{form.id}"}
                  class="relative rounded-lg border border-gray-300 bg-white px-4 py-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class={[
                      "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                      status_badge_class(form.status)
                    ]}>
                      <%= format_status(form.status) %>
                    </span>
                  </div>
                  <h4 class="text-sm font-medium text-gray-900 mb-1">
                    <%= form.name %>
                  </h4>
                  <p class="text-xs text-gray-500 line-clamp-2 mb-3">
                    <%= form.description %>
                  </p>
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span><%= form.submission_count %> submissions</span>
                    <span><%= form.view_count %> views</span>
                  </div>
                </.link>
              <% end %>
            </div>
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  defp count_by_status(forms, status) do
    Enum.count(forms, fn f -> f.status == status end)
  end

  defp count_submissions_by_status(submissions, status) do
    Enum.count(submissions, fn s -> s.status == status end)
  end

  defp total_submissions(forms) do
    Enum.reduce(forms, 0, fn f, acc -> acc + f.submission_count end)
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

  defp format_relative_time(datetime) do
    now = DateTime.utc_now()
    diff = DateTime.diff(now, datetime, :second)

    cond do
      diff < 60 -> "Just now"
      diff < 3600 -> "#{div(diff, 60)}m ago"
      diff < 86400 -> "#{div(diff, 3600)}h ago"
      diff < 604800 -> "#{div(diff, 86400)}d ago"
      true -> Calendar.strftime(datetime, "%b %d")
    end
  end
end
