defmodule ClienttCrmAppWeb.Layouts do
  @moduledoc """
  This module holds layouts and related functionality
  used by your application.
  """
  use ClienttCrmAppWeb, :html

  # Embed all files in layouts/* within this module.
  # The default root.html.heex file contains the HTML
  # skeleton of your application, namely HTML headers
  # and other static content.
  embed_templates "layouts/*"

  # The app layout is now defined in app.html.heex template
  # It includes sidebar and header for authenticated pages

  @doc """
  Shows the flash group with standard titles and content.

  ## Examples

      <.flash_group flash={@flash} />
  """
  attr :flash, :map, required: true, doc: "the map of flash messages"
  attr :id, :string, default: "flash-group", doc: "the optional id of flash container"

  def flash_group(assigns) do
    ~H"""
    <div id={@id} aria-live="polite">
      <.flash kind={:info} flash={@flash} />
      <.flash kind={:error} flash={@flash} />

      <.flash
        id="client-error"
        kind={:error}
        title={gettext("We can't find the internet")}
        phx-disconnected={show(".phx-client-error #client-error") |> JS.remove_attribute("hidden")}
        phx-connected={hide("#client-error") |> JS.set_attribute({"hidden", ""})}
        hidden
      >
        {gettext("Attempting to reconnect")}
        <.icon name="hero-arrow-path" class="ml-1 size-3 motion-safe:animate-spin" />
      </.flash>

      <.flash
        id="server-error"
        kind={:error}
        title={gettext("Something went wrong!")}
        phx-disconnected={show(".phx-server-error #server-error") |> JS.remove_attribute("hidden")}
        phx-connected={hide("#server-error") |> JS.set_attribute({"hidden", ""})}
        hidden
      >
        {gettext("Attempting to reconnect")}
        <.icon name="hero-arrow-path" class="ml-1 size-3 motion-safe:animate-spin" />
      </.flash>
    </div>
    """
  end

  @doc """
  Provides dark vs light theme toggle based on themes defined in app.css.

  See <head> in root.html.heex which applies the theme before page load.
  """
  def theme_toggle(assigns) do
    ~H"""
    <div class="card relative flex flex-row items-center border-2 border-base-300 bg-base-300 rounded-full">
      <div class="absolute w-1/3 h-full rounded-full border-1 border-base-200 bg-base-100 brightness-200 left-0 [[data-theme=light]_&]:left-1/3 [[data-theme=dark]_&]:left-2/3 transition-[left]" />

      <button
        class="flex p-2 cursor-pointer w-1/3"
        phx-click={JS.dispatch("phx:set-theme")}
        data-phx-theme="system"
      >
        <.icon name="hero-computer-desktop-micro" class="size-4 opacity-75 hover:opacity-100" />
      </button>

      <button
        class="flex p-2 cursor-pointer w-1/3"
        phx-click={JS.dispatch("phx:set-theme")}
        data-phx-theme="light"
      >
        <.icon name="hero-sun-micro" class="size-4 opacity-75 hover:opacity-100" />
      </button>

      <button
        class="flex p-2 cursor-pointer w-1/3"
        phx-click={JS.dispatch("phx:set-theme")}
        data-phx-theme="dark"
      >
        <.icon name="hero-moon-micro" class="size-4 opacity-75 hover:opacity-100" />
      </button>
    </div>
    """
  end

  @doc """
  Renders the main application header with navigation and actions.

  Based on spec: specs/05-ui-design/components/layouts/header.md

  ## Examples

      <.app_header
        current_user={@current_user}
        sidebar_open={@sidebar_open}
        search_query={@search_query}
        unread_notifications={@unread_notifications}
      />
  """
  attr :current_user, :map, required: true
  attr :sidebar_open, :boolean, default: true
  attr :search_query, :string, default: ""
  attr :unread_notifications, :integer, default: 0

  def app_header(assigns) do
    ~H"""
    <header class={[
      "h-16 bg-base-100 border-b border-base-300 fixed top-0 right-0 z-30",
      "transition-all duration-300",
      @sidebar_open && "left-64" || "left-0"
    ]}>
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Left Section -->
        <div class="flex items-center gap-4 flex-1 max-w-xl">
          <!-- Sidebar Toggle -->
          <button
            phx-click="toggle_sidebar"
            class="p-2 rounded-lg hover:bg-base-200 transition-colors"
            aria-label="Toggle sidebar"
          >
            <.icon name="hero-bars-3" class="w-5 h-5 text-base-content/60" />
          </button>

          <!-- Global Search -->
          <.global_search query={@search_query} />
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2">
          <!-- Theme Toggle -->
          <.theme_toggle />

          <!-- Notifications -->
          <.notifications_dropdown count={@unread_notifications} />

          <!-- Profile Dropdown -->
          <.profile_dropdown user={@current_user} />
        </div>
      </div>
    </header>
    """
  end

  @doc """
  Renders the collapsible sidebar with navigation modules.

  Based on spec: specs/05-ui-design/components/layouts/sidebar.md

  ## Examples

      <.sidebar
        current_page={@current_page}
        open={@sidebar_open}
      />
  """
  attr :current_page, :string, default: ""
  attr :open, :boolean, default: true

  def sidebar(assigns) do
    ~H"""
    <aside class={[
      "h-screen bg-base-100 border-r border-base-300 fixed top-0 left-0 z-40",
      "transition-transform duration-300",
      @open && "translate-x-0" || "-translate-x-full",
      "w-64"
    ]}>
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="h-16 px-6 flex items-center border-b border-base-300">
          <.link navigate={~p"/"} class="flex items-center gap-2">
            <img src={~p"/images/logo.svg"} width="32" alt="Clientt CRM" />
            <span class="text-lg font-bold">Clientt CRM</span>
          </.link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-4">
          <!-- Forms Portal Module -->
          <.sidebar_module
            title="Forms Portal"
            icon="hero-document-text"
            expanded={true}
          >
            <.sidebar_link navigate={~p"/dashboard"} active={@current_page == "dashboard"} data-testid="nav-dashboard">
              <.icon name="hero-chart-bar" class="w-4 h-4" />
              Dashboard
            </.sidebar_link>
            <.sidebar_link navigate={~p"/forms"} active={@current_page == "forms"} data-testid="nav-forms">
              <.icon name="hero-document-duplicate" class="w-4 h-4" />
              All Forms
            </.sidebar_link>
            <.sidebar_link navigate={~p"/forms/new"} active={@current_page == "form-builder"} data-testid="nav-form-builder">
              <.icon name="hero-plus-circle" class="w-4 h-4" />
              Form Builder
            </.sidebar_link>
            <.sidebar_link disabled={true} data-testid="nav-analytics">
              <.icon name="hero-chart-pie" class="w-4 h-4" />
              Analytics
              <.badge variant="info" class="ml-auto">Soon</.badge>
            </.sidebar_link>
          </.sidebar_module>

          <!-- CRM Module (Coming Soon) -->
          <.sidebar_module
            title="CRM"
            icon="hero-users"
            expanded={false}
            disabled={true}
          >
            <.sidebar_link disabled={true}>
              <.icon name="hero-user-group" class="w-4 h-4" />
              Contacts
              <.badge variant="info" class="ml-auto">Soon</.badge>
            </.sidebar_link>
            <.sidebar_link disabled={true}>
              <.icon name="hero-building-office" class="w-4 h-4" />
              Companies
              <.badge variant="info" class="ml-auto">Soon</.badge>
            </.sidebar_link>
          </.sidebar_module>

          <!-- Settings -->
          <div class="mt-auto pt-4 border-t border-base-300">
            <.sidebar_link disabled={true}>
              <.icon name="hero-cog-6-tooth" class="w-4 h-4" />
              Settings
              <.badge variant="info" class="ml-auto">Soon</.badge>
            </.sidebar_link>
          </div>
        </nav>
      </div>
    </aside>
    """
  end

  # Sidebar Sub-components

  @doc """
  Renders a collapsible sidebar module/section.
  """
  attr :title, :string, required: true
  attr :icon, :atom, required: true
  attr :expanded, :boolean, default: false
  attr :disabled, :boolean, default: false
  slot :inner_block, required: true

  def sidebar_module(assigns) do
    ~H"""
    <div class="mb-4">
      <button
        class={[
          "w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg",
          "hover:bg-base-200 transition-colors",
          @disabled && "opacity-50 cursor-not-allowed"
        ]}
        phx-click={!@disabled && "toggle_sidebar_module"}
        phx-value-module={@title}
      >
        <.icon name={@icon} class="w-5 h-5" />
        <span class="flex-1 text-left">{@title}</span>
        <%= if !@disabled do %>
          <.icon
            name={if @expanded, do: "hero-chevron-down", else: "hero-chevron-right"}
            class="w-4 h-4"
          />
        <% end %>
      </button>

      <%= if @expanded do %>
        <div class="mt-1 ml-2 space-y-1">
          {render_slot(@inner_block)}
        </div>
      <% end %>
    </div>
    """
  end

  @doc """
  Renders a sidebar navigation link.
  """
  attr :navigate, :string, default: nil
  attr :active, :boolean, default: false
  attr :disabled, :boolean, default: false
  attr :rest, :global
  slot :inner_block, required: true

  def sidebar_link(assigns) do
    ~H"""
    <.link
      navigate={@navigate}
      class={[
        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
        @active && "bg-primary text-primary-content font-medium",
        !@active && !@disabled && "hover:bg-base-200",
        @disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      ]}
      {@rest}
    >
      {render_slot(@inner_block)}
    </.link>
    """
  end

  # Header Sub-components

  @doc """
  Renders the global search input.
  """
  attr :query, :string, default: ""

  def global_search(assigns) do
    ~H"""
    <form phx-change="search" phx-submit="search" class="flex-1 max-w-xl">
      <div class="relative">
        <.icon
          name="hero-magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40"
        />
        <input
          type="search"
          name="q"
          value={@query}
          placeholder="Search forms, contacts, settings..."
          class="input input-bordered w-full pl-10"
          autocomplete="off"
        />
      </div>
    </form>
    """
  end

  @doc """
  Renders the notifications dropdown.
  """
  attr :count, :integer, default: 0

  def notifications_dropdown(assigns) do
    ~H"""
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <div class="indicator">
          <.icon name="hero-bell" class="w-5 h-5" />
          <%= if @count > 0 do %>
            <span class="badge badge-sm badge-primary indicator-item">
              {@count}
            </span>
          <% end %>
        </div>
      </label>
      <div
        tabindex="0"
        class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-80 mt-3 border border-base-300"
      >
        <div class="px-4 py-3 border-b border-base-300">
          <h3 class="font-semibold">Notifications</h3>
        </div>
        <%= if @count > 0 do %>
          <div class="max-h-96 overflow-y-auto">
            <p class="p-4 text-sm text-base-content/60">Notification items here...</p>
          </div>
        <% else %>
          <div class="p-8 text-center text-base-content/60">
            <p class="text-sm">No new notifications</p>
          </div>
        <% end %>
        <div class="border-t border-base-300 p-2">
          <.link navigate={~p"/notifications"} class="btn btn-sm btn-ghost w-full">
            View All
          </.link>
        </div>
      </div>
    </div>
    """
  end

  @doc """
  Renders the profile dropdown menu.
  """
  attr :user, :map, required: true

  def profile_dropdown(assigns) do
    ~H"""
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost gap-2">
        <div class="avatar placeholder">
          <div class="bg-neutral text-neutral-content rounded-full w-8">
            <span class="text-xs">
              {(to_string(@user.email) || "U") |> String.first() |> String.upcase()}
            </span>
          </div>
        </div>
        <span class="hidden lg:inline">{@user.email}</span>
        <.icon name="hero-chevron-down" class="w-4 h-4" />
      </label>
      <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-3 border border-base-300"
      >
        <li class="menu-title px-4 py-2">
          <div>
            <p class="font-semibold text-sm">{@user.email}</p>
          </div>
        </li>
        <div class="divider my-0"></div>
        <li class="disabled opacity-50">
          <span class="cursor-not-allowed">
            <.icon name="hero-cog-6-tooth" class="w-4 h-4" />
            Settings
            <span class="badge badge-sm badge-info ml-auto">Soon</span>
          </span>
        </li>
        <li>
          <a href="/support">
            <.icon name="hero-question-mark-circle" class="w-4 h-4" />
            Help & Support
          </a>
        </li>
        <div class="divider my-0"></div>
        <li>
          <a href="/auth/sign-out" data-method="delete" class="text-error">
            <.icon name="hero-arrow-right-on-rectangle" class="w-4 h-4" />
            Sign Out
          </a>
        </li>
      </ul>
    </div>
    """
  end

  @doc """
  Renders a badge component.
  """
  attr :variant, :string, default: "ghost", values: ~w(primary secondary accent info success warning error ghost)
  attr :class, :string, default: ""
  slot :inner_block, required: true

  def badge(assigns) do
    ~H"""
    <span class={["badge badge-#{@variant}", @class]}>
      {render_slot(@inner_block)}
    </span>
    """
  end
end
