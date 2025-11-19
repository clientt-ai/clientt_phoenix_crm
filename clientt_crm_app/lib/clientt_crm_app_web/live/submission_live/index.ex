defmodule ClienttCrmAppWeb.SubmissionLive.Index do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(%{"form_id" => form_id}, _session, socket) do
    # Load form
    {:ok, form} = Forms.Form |> Ash.get(form_id)

    # Load submissions for this form
    {:ok, submissions} =
      Forms.Submission
      |> Ash.Query.for_read(:for_form, %{form_id: form_id})
      |> Ash.read()

    {:ok,
     socket
     |> assign(:form, form)
     |> assign(:submissions, submissions)
     |> assign(:page_title, "Submissions - #{form.name}")}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :index, _params) do
    socket
  end

  @impl true
  def handle_event("update_status", %{"id" => id, "status" => status}, socket) do
    submission = Enum.find(socket.assigns.submissions, &(&1.id == id))
    status_atom = String.to_existing_atom(status)

    case submission
         |> Ash.Changeset.for_update(:update_status, %{status: status_atom})
         |> Ash.update() do
      {:ok, updated_submission} ->
        updated_submissions =
          Enum.map(socket.assigns.submissions, fn s ->
            if s.id == id, do: updated_submission, else: s
          end)

        {:noreply,
         socket
         |> assign(:submissions, updated_submissions)
         |> put_flash(:info, "Status updated successfully")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to update status")}
    end
  end

  @impl true
  def handle_event("export_csv", _params, socket) do
    csv_content = generate_csv(socket.assigns.submissions, socket.assigns.form)

    {:noreply,
     socket
     |> push_event("download_csv", %{
       content: csv_content,
       filename: "submissions_#{socket.assigns.form.name}_#{Date.utc_today()}.csv"
     })}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <.link
            navigate={~p"/forms/#{@form.id}"}
            class="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to Form
          </.link>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Submissions for <%= @form.name %>
          </h1>
          <p class="mt-2 text-sm text-gray-700">
            <%= length(@submissions) %> total submissions
          </p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            phx-click="export_csv"
            class="btn btn-primary btn-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Total Submissions</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= length(@submissions) %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">New</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= count_by_status(@submissions, :new) %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Contacted</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= count_by_status(@submissions, :contacted) %>
          </dd>
        </div>

        <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt class="truncate text-sm font-medium text-gray-500">Converted</dt>
          <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            <%= count_by_status(@submissions, :converted) %>
          </dd>
        </div>
      </div>

      <!-- Submissions Table -->
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
                      Email
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Source
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Submitted
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <%= for submission <- @submissions do %>
                    <tr>
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <%= submission.submitter_email || "N/A" %>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          phx-change="update_status"
                          phx-value-id={submission.id}
                          name="status"
                          class={[
                            "rounded-md border-0 py-1.5 pl-3 pr-10 text-sm ring-1 ring-inset focus:ring-2 focus:ring-inset",
                            status_select_class(submission.status)
                          ]}
                        >
                          <option value="new" selected={submission.status == :new}>New</option>
                          <option value="contacted" selected={submission.status == :contacted}>
                            Contacted
                          </option>
                          <option value="qualified" selected={submission.status == :qualified}>
                            Qualified
                          </option>
                          <option value="converted" selected={submission.status == :converted}>
                            Converted
                          </option>
                          <option value="spam" selected={submission.status == :spam}>Spam</option>
                        </select>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <%= get_utm_source(submission) %>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <%= format_datetime(submission.submitted_at) %>
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <.link
                          navigate={~p"/submissions/#{submission.id}"}
                          class="text-primary hover:text-primary/80"
                        >
                          View
                        </.link>
                      </td>
                    </tr>
                  <% end %>

                  <%= if @submissions == [] do %>
                    <tr>
                      <td colspan="5" class="px-3 py-12 text-center text-sm text-gray-500">
                        <p>No submissions yet.</p>
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

  defp count_by_status(submissions, status) do
    Enum.count(submissions, fn s -> s.status == status end)
  end

  defp status_select_class(:new), do: "ring-blue-300 focus:ring-blue-600"
  defp status_select_class(:contacted), do: "ring-yellow-300 focus:ring-yellow-600"
  defp status_select_class(:qualified), do: "ring-purple-300 focus:ring-purple-600"
  defp status_select_class(:converted), do: "ring-green-300 focus:ring-green-600"
  defp status_select_class(:spam), do: "ring-red-300 focus:ring-red-600"

  defp get_utm_source(submission) do
    case submission.metadata do
      %{"utm_source" => source} when is_binary(source) -> source
      _ -> "Direct"
    end
  end

  defp format_datetime(datetime) do
    Calendar.strftime(datetime, "%b %d, %Y %I:%M %p")
  end

  defp generate_csv(submissions, form) do
    # Get all unique field keys from form_data
    field_keys =
      submissions
      |> Enum.flat_map(fn s -> Map.keys(s.form_data) end)
      |> Enum.uniq()

    # Build header row
    header =
      ["Email", "Status", "Source", "Submitted At" | field_keys]
      |> Enum.join(",")

    # Build data rows
    rows =
      submissions
      |> Enum.map(fn submission ->
        base_fields = [
          escape_csv_field(submission.submitter_email || ""),
          escape_csv_field(to_string(submission.status)),
          escape_csv_field(get_utm_source(submission)),
          escape_csv_field(format_datetime(submission.submitted_at))
        ]

        # Add form data fields
        form_fields =
          field_keys
          |> Enum.map(fn key ->
            value = submission.form_data[key] || submission.form_data[to_string(key)] || ""
            escape_csv_field(format_csv_value(value))
          end)

        (base_fields ++ form_fields) |> Enum.join(",")
      end)

    [header | rows] |> Enum.join("\n")
  end

  defp escape_csv_field(value) do
    value_str = to_string(value)

    if String.contains?(value_str, [",", "\"", "\n"]) do
      "\"#{String.replace(value_str, "\"", "\"\"")}\""
    else
      value_str
    end
  end

  defp format_csv_value(value) when is_list(value), do: Enum.join(value, "; ")
  defp format_csv_value(value) when is_boolean(value), do: if(value, do: "Yes", else: "No")
  defp format_csv_value(value), do: to_string(value)
end
