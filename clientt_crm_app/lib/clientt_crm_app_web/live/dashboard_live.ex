defmodule ClienttCrmAppWeb.DashboardLive do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(_params, _session, socket) do
    import Ash.Query
    tenant_id = socket.assigns.current_tenant_id

    # Load forms data for dashboard stats (filtered by company)
    {:ok, forms} =
      Forms.Form
      |> for_read(:list)
      |> filter(tenant_id == ^tenant_id)
      |> Ash.read()

    # Load recent submissions (last 10, filtered by company)
    {:ok, recent_submissions} =
      Forms.Submission
      |> for_read(:list)
      |> filter(tenant_id == ^tenant_id)
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
      <h1 class="text-3xl font-bold tracking-tight text-base-content mb-6">
        Dashboard
      </h1>

      <div class="bg-base-100 shadow sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-base font-semibold leading-6 text-base-content">
            Welcome, <%= @current_user.email %>!
          </h3>
          <div class="mt-2 max-w-xl text-sm text-base-content/60">
            <p>Track your forms, submissions, and leads from your CRM dashboard.</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div class="overflow-hidden rounded-lg bg-base-100 px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-base-content/60">Total Forms</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-base-content">
            <%= length(@forms) %>
          </dd>
          <div class="mt-2">
            <.link
              navigate={~p"/forms"}
              class="text-sm font-medium text-primary hover:text-primary/80"
            >
              View all →
            </.link>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-base-100 px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-base-content/60">Published Forms</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-base-content">
            <%= count_by_status(@forms, :published) %>
          </dd>
          <div class="mt-2">
            <.link
              navigate={~p"/forms/new"}
              class="text-sm font-medium text-primary hover:text-primary/80"
            >
              Create new →
            </.link>
          </div>
        </div>

        <div class="overflow-hidden rounded-lg bg-base-100 px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-base-content/60">Total Submissions</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-base-content">
            <%= total_submissions(@forms) %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-base-100 px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-base-content/60">New Leads</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-base-content">
            <%= count_submissions_by_status(@recent_submissions, :new) %>
          </dd>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <!-- Quick Actions -->
        <div class="bg-base-100 shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-base-content mb-4">
              Quick Actions
            </h3>
            <div class="grid grid-cols-1 gap-3">
              <.link
                navigate={~p"/forms/new"}
                class="flex items-center justify-between rounded-md border border-base-300 px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div>
                  <p class="font-medium text-base-content">Create New Form</p>
                  <p class="text-sm text-base-content/60">Build a new lead capture form</p>
                </div>
                <svg
                  class="h-5 w-5 text-base-content/40"
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
                class="flex items-center justify-between rounded-md border border-base-300 px-4 py-3 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div>
                  <p class="font-medium text-base-content">Manage Forms</p>
                  <p class="text-sm text-base-content/60">View and edit your forms</p>
                </div>
                <svg
                  class="h-5 w-5 text-base-content/40"
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
        <div class="bg-base-100 shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-base-content mb-4">
              Recent Submissions
            </h3>

            <%= if @recent_submissions == [] do %>
              <div class="text-center py-6">
                <svg
                  class="mx-auto h-12 w-12 text-base-content/40"
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
                <p class="mt-2 text-sm text-base-content/60">No submissions yet.</p>
                <p class="mt-1 text-xs text-base-content/40">
                  Publish a form to start receiving submissions.
                </p>
              </div>
            <% else %>
              <ul class="divide-y divide-base-300 max-h-80 overflow-y-auto">
                <%= for submission <- Enum.take(@recent_submissions, 5) do %>
                  <li class="py-3">
                    <.link
                      navigate={~p"/submissions/#{submission.id}"}
                      class="block hover:bg-base-200 -mx-2 px-2 py-1 rounded-md"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-base-content truncate">
                            <%= submission.submitter_email || "Anonymous" %>
                          </p>
                          <p class="text-xs text-base-content/60">
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
                <div class="mt-3 pt-3 border-t border-base-300">
                  <p class="text-xs text-base-content/60 text-center">
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
        <div class="mt-8 bg-base-100 shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold leading-6 text-base-content">
                Your Forms
              </h3>
              <.link
                navigate={~p"/forms"}
                class="text-sm font-medium text-primary hover:text-primary/80"
              >
                View all →
              </.link>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <%= for form <- Enum.take(@forms, 6) do %>
                <.link
                  navigate={~p"/forms/#{form.id}"}
                  class="relative rounded-lg border border-base-300 bg-base-100 px-4 py-4 shadow-sm hover:border-primary/70 hover:shadow-md transition-all"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class={[
                      "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                      status_badge_class(form.status)
                    ]}>
                      <%= format_status(form.status) %>
                    </span>
                  </div>
                  <h4 class="text-sm font-medium text-base-content mb-1">
                    <%= form.name %>
                  </h4>
                  <p class="text-xs text-base-content/60 line-clamp-2 mb-3">
                    <%= form.description %>
                  </p>
                  <div class="flex items-center justify-between text-xs text-base-content/60">
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

  defp status_badge_class(:draft), do: "bg-base-200 text-base-content"
  defp status_badge_class(:published), do: "bg-success/20 text-success dark:bg-success/30"
  defp status_badge_class(:archived), do: "bg-warning/20 text-warning dark:bg-warning/30"

  defp submission_status_class(:new), do: "bg-info/20 text-info dark:bg-info/30"
  defp submission_status_class(:contacted), do: "bg-warning/20 text-warning dark:bg-warning/30"
  defp submission_status_class(:qualified), do: "bg-accent/20 text-accent dark:bg-accent/30"
  defp submission_status_class(:converted), do: "bg-success/20 text-success dark:bg-success/30"
  defp submission_status_class(:spam), do: "bg-error/20 text-error dark:bg-error/30"

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
