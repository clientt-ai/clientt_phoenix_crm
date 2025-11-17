defmodule ClienttCrmAppWeb.SubmissionLive.Show do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  alias ClienttCrmApp.Forms

  @impl true
  def mount(%{"id" => id}, _session, socket) do
    # Load submission with form and fields
    {:ok, submission} =
      Forms.Submission
      |> Ash.get(id, load: [:form])

    # Load form fields to display with proper labels
    {:ok, fields} =
      Forms.FormField
      |> Ash.Query.for_read(:for_form, %{form_id: submission.form_id})
      |> Ash.read()

    {:ok,
     socket
     |> assign(:submission, submission)
     |> assign(:fields, fields)
     |> assign(:page_title, "Submission - #{submission.submitter_email || "Anonymous"}")}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :show, _params) do
    socket
  end

  @impl true
  def handle_event("update_status", %{"status" => status}, socket) do
    status_atom = String.to_existing_atom(status)

    case socket.assigns.submission
         |> Ash.Changeset.for_update(:update_status, %{status: status_atom})
         |> Ash.update() do
      {:ok, updated_submission} ->
        {:noreply,
         socket
         |> assign(:submission, updated_submission)
         |> put_flash(:info, "Status updated successfully")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to update status. Invalid status transition.")}
    end
  end

  @impl true
  def handle_event("delete_submission", _params, socket) do
    case Ash.destroy(socket.assigns.submission) do
      :ok ->
        {:noreply,
         socket
         |> put_flash(:info, "Submission deleted successfully")
         |> push_navigate(to: ~p"/forms/#{socket.assigns.submission.form_id}/submissions")}

      {:error, _} ->
        {:noreply, put_flash(socket, :error, "Failed to delete submission")}
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <.link navigate={~p"/forms"} class="hover:text-gray-700">
            Forms
          </.link>
          <span>/</span>
          <.link navigate={~p"/forms/#{@submission.form.id}"} class="hover:text-gray-700">
            <%= @submission.form.name %>
          </.link>
          <span>/</span>
          <.link
            navigate={~p"/forms/#{@submission.form_id}/submissions"}
            class="hover:text-gray-700"
          >
            Submissions
          </.link>
          <span>/</span>
          <span class="text-gray-900">Details</span>
        </div>

        <div class="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
              Submission Details
            </h1>
            <p class="mt-2 text-sm text-gray-700">
              Submitted <%= format_datetime(@submission.submitted_at) %>
            </p>
          </div>

          <div class="mt-4 sm:mt-0 flex gap-2">
            <button
              phx-click="delete_submission"
              data-confirm="Are you sure you want to delete this submission? This action cannot be undone."
              class="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Left Column: Submission Data (2/3 width) -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Submitted Information
              </h3>

              <dl class="divide-y divide-gray-200">
                <%= for field <- @fields do %>
                  <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt class="text-sm font-medium text-gray-900">
                      <%= field.label %>
                      <%= if field.required do %>
                        <span class="text-red-500">*</span>
                      <% end %>
                    </dt>
                    <dd class="mt-1 text-sm text-gray-700 sm:col-span-2 sm:mt-0">
                      <%= get_field_value(@submission.form_data, field) %>
                    </dd>
                  </div>
                <% end %>
              </dl>
            </div>
          </div>

          <!-- Metadata Section -->
          <%= if @submission.metadata && @submission.metadata != %{} do %>
            <div class="mt-6 bg-white shadow sm:rounded-lg">
              <div class="px-4 py-5 sm:p-6">
                <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                  Tracking Information
                </h3>

                <dl class="divide-y divide-gray-200">
                  <%= for {key, value} <- @submission.metadata do %>
                    <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt class="text-sm font-medium text-gray-500">
                        <%= format_metadata_key(key) %>
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <%= value %>
                      </dd>
                    </div>
                  <% end %>
                </dl>
              </div>
            </div>
          <% end %>
        </div>

        <!-- Right Column: Status & Actions (1/3 width) -->
        <div>
          <!-- Status Card -->
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Lead Status
              </h3>

              <div class="space-y-4">
                <div>
                  <span class={[
                    "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                    status_badge_class(@submission.status)
                  ]}>
                    <%= format_status(@submission.status) %>
                  </span>
                </div>

                <form phx-change="update_status">
                  <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select
                    name="status"
                    id="status"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="new" selected={@submission.status == :new}>New</option>
                    <option value="contacted" selected={@submission.status == :contacted}>
                      Contacted
                    </option>
                    <option value="qualified" selected={@submission.status == :qualified}>
                      Qualified
                    </option>
                    <option value="converted" selected={@submission.status == :converted}>
                      Converted
                    </option>
                    <option value="spam" selected={@submission.status == :spam}>Spam</option>
                  </select>
                </form>

                <div class="pt-4 border-t border-gray-200">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Workflow Transitions
                  </h4>
                  <div class="space-y-1 text-xs text-gray-600">
                    <p class={workflow_step_class(@submission.status, :new)}>
                      1. New Lead
                    </p>
                    <p class={workflow_step_class(@submission.status, :contacted)}>
                      2. Contacted
                    </p>
                    <p class={workflow_step_class(@submission.status, :qualified)}>
                      3. Qualified
                    </p>
                    <p class={workflow_step_class(@submission.status, :converted)}>
                      4. Converted
                    </p>
                    <%= if @submission.status == :spam do %>
                      <p class="text-red-600 font-semibold">
                        ✗ Marked as Spam
                      </p>
                    <% end %>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Information Card -->
          <div class="mt-6 bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
                Contact Information
              </h3>

              <dl class="space-y-3">
                <div>
                  <dt class="text-xs font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <%= if @submission.submitter_email do %>
                      <a
                        href={"mailto:#{@submission.submitter_email}"}
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        <%= @submission.submitter_email %>
                      </a>
                    <% else %>
                      <span class="text-gray-400">Not provided</span>
                    <% end %>
                  </dd>
                </div>

                <div>
                  <dt class="text-xs font-medium text-gray-500">Source</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <%= get_utm_source(@submission) %>
                  </dd>
                </div>

                <div>
                  <dt class="text-xs font-medium text-gray-500">Submitted</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    <%= format_datetime(@submission.submitted_at) %>
                  </dd>
                </div>

                <%= if @submission.deleted_at do %>
                  <div class="pt-3 border-t border-gray-200">
                    <dt class="text-xs font-medium text-red-600">Deleted</dt>
                    <dd class="mt-1 text-sm text-red-900">
                      <%= format_datetime(@submission.deleted_at) %>
                    </dd>
                  </div>
                <% end %>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp status_badge_class(:new), do: "bg-blue-100 text-blue-800"
  defp status_badge_class(:contacted), do: "bg-yellow-100 text-yellow-800"
  defp status_badge_class(:qualified), do: "bg-purple-100 text-purple-800"
  defp status_badge_class(:converted), do: "bg-green-100 text-green-800"
  defp status_badge_class(:spam), do: "bg-red-100 text-red-800"

  defp format_status(status), do: status |> Atom.to_string() |> String.capitalize()

  defp format_datetime(datetime) do
    Calendar.strftime(datetime, "%b %d, %Y %I:%M %p")
  end

  defp get_field_value(form_data, field) do
    key = field.label
    value = form_data[key] || form_data[to_string(key)]

    case value do
      nil -> raw("<span class=\"text-gray-400 italic\">Not provided</span>")
      "" -> raw("<span class=\"text-gray-400 italic\">Not provided</span>")
      val when is_boolean(val) -> if val, do: "Yes", else: "No"
      val when is_list(val) -> Enum.join(val, ", ")
      val -> to_string(val)
    end
  end

  defp get_utm_source(submission) do
    case submission.metadata do
      %{"utm_source" => source} when is_binary(source) -> source
      _ -> "Direct"
    end
  end

  defp format_metadata_key(key) do
    key
    |> String.replace("_", " ")
    |> String.split()
    |> Enum.map(&String.capitalize/1)
    |> Enum.join(" ")
  end

  defp workflow_step_class(current_status, step_status) do
    base_class = "flex items-center"

    cond do
      current_status == step_status ->
        "#{base_class} font-semibold text-indigo-600"

      status_reached?(current_status, step_status) ->
        "#{base_class} text-green-600"

      true ->
        "#{base_class} text-gray-400"
    end
  end

  defp status_reached?(current, check) do
    status_order = [:new, :contacted, :qualified, :converted]
    current_idx = Enum.find_index(status_order, &(&1 == current)) || -1
    check_idx = Enum.find_index(status_order, &(&1 == check)) || -1

    current_idx >= check_idx && current_idx > -1
  end
end
