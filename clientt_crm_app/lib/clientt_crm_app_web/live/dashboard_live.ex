defmodule ClienttCrmAppWeb.DashboardLive do
  use ClienttCrmAppWeb, :live_view

  on_mount {ClienttCrmAppWeb.LiveUserAuth, :live_user_required}

  @impl true
  def mount(_params, _session, socket) do
    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Dashboard
        </h1>

        <div class="bg-white shadow sm:rounded-lg mb-6">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              Welcome, <%= @current_user.email %>!
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>You are successfully logged in to your CRM dashboard.</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div class="space-y-2">
              <p class="text-sm text-gray-500">
                Your dashboard content will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end
end
