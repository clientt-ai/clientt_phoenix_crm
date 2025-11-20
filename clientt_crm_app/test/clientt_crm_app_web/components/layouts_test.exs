defmodule ClienttCrmAppWeb.LayoutsTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest

  alias ClienttCrmAppWeb.Layouts

  describe "header/1" do
    test "renders with required props" do
      user = %{email: "user@example.com"}

      assigns = %{
        current_user: user,
        sidebar_open: true,
        search_query: "",
        unread_notifications: 0
      }

      html = rendered_to_string(~H"""
      <Layouts.header {assigns} />
      """)

      assert html =~ "user@example.com"
      assert html =~ "Toggle sidebar"
      assert html =~ "hero-bars-3"
    end

    test "adapts position when sidebar is open" do
      user = %{email: "user@example.com"}

      assigns = %{
        current_user: user,
        sidebar_open: true,
        search_query: "",
        unread_notifications: 0
      }

      html = rendered_to_string(~H"""
      <Layouts.header {assigns} />
      """)

      assert html =~ "left-64"
    end

    test "adapts position when sidebar is closed" do
      user = %{email: "user@example.com"}

      assigns = %{
        current_user: user,
        sidebar_open: false,
        search_query: "",
        unread_notifications: 0
      }

      html = rendered_to_string(~H"""
      <Layouts.header {assigns} />
      """)

      assert html =~ "left-0"
      refute html =~ "left-64"
    end

    test "displays notification count when unread exists" do
      user = %{email: "user@example.com"}

      assigns = %{
        current_user: user,
        sidebar_open: true,
        search_query: "",
        unread_notifications: 5
      }

      html = rendered_to_string(~H"""
      <Layouts.header {assigns} />
      """)

      assert html =~ "5"
      assert html =~ "badge-primary"
    end

    test "includes search form with query value" do
      user = %{email: "user@example.com"}

      assigns = %{
        current_user: user,
        sidebar_open: true,
        search_query: "test query",
        unread_notifications: 0
      }

      html = rendered_to_string(~H"""
      <Layouts.header {assigns} />
      """)

      assert html =~ "test query"
      assert html =~ "hero-magnifying-glass"
    end
  end

  describe "sidebar/1" do
    test "renders navigation modules" do
      assigns = %{
        current_page: "dashboard",
        open: true
      }

      html = rendered_to_string(~H"""
      <Layouts.sidebar {assigns} />
      """)

      assert html =~ "Forms Portal"
      assert html =~ "Dashboard"
      assert html =~ "All Forms"
      assert html =~ "Form Builder"
      assert html =~ "Analytics"
    end

    test "marks active page" do
      assigns = %{
        current_page: "dashboard",
        open: true
      }

      html = rendered_to_string(~H"""
      <Layouts.sidebar {assigns} />
      """)

      # Active link should have primary background
      assert html =~ "bg-primary"
    end

    test "shows coming soon modules" do
      assigns = %{
        current_page: "",
        open: true
      }

      html = rendered_to_string(~H"""
      <Layouts.sidebar {assigns} />
      """)

      assert html =~ "CRM"
      assert html =~ "Soon"
      assert html =~ "Contacts"
      assert html =~ "Companies"
    end

    test "is hidden when closed" do
      assigns = %{
        current_page: "",
        open: false
      }

      html = rendered_to_string(~H"""
      <Layouts.sidebar {assigns} />
      """)

      assert html =~ "-translate-x-full"
    end

    test "is visible when open" do
      assigns = %{
        current_page: "",
        open: true
      }

      html = rendered_to_string(~H"""
      <Layouts.sidebar {assigns} />
      """)

      assert html =~ "translate-x-0"
      refute html =~ "-translate-x-full"
    end
  end

  describe "global_search/1" do
    test "renders search input with placeholder" do
      assigns = %{
        query: ""
      }

      html = rendered_to_string(~H"""
      <Layouts.global_search {assigns} />
      """)

      assert html =~ "Search forms, contacts, settings..."
      assert html =~ "hero-magnifying-glass"
    end

    test "includes current query value" do
      assigns = %{
        query: "my search"
      }

      html = rendered_to_string(~H"""
      <Layouts.global_search {assigns} />
      """)

      assert html =~ "my search"
    end
  end

  describe "notifications_dropdown/1" do
    test "shows no notifications state" do
      assigns = %{
        count: 0
      }

      html = rendered_to_string(~H"""
      <Layouts.notifications_dropdown {assigns} />
      """)

      assert html =~ "No new notifications"
      assert html =~ "hero-bell"
    end

    test "shows notification count badge" do
      assigns = %{
        count: 3
      }

      html = rendered_to_string(~H"""
      <Layouts.notifications_dropdown {assigns} />
      """)

      assert html =~ "3"
      assert html =~ "badge-primary"
    end
  end

  describe "profile_dropdown/1" do
    test "displays user email" do
      user = %{email: "john@example.com"}

      assigns = %{
        user: user
      }

      html = rendered_to_string(~H"""
      <Layouts.profile_dropdown {assigns} />
      """)

      assert html =~ "john@example.com"
    end

    test "shows user initial in avatar" do
      user = %{email: "alice@example.com"}

      assigns = %{
        user: user
      }

      html = rendered_to_string(~H"""
      <Layouts.profile_dropdown {assigns} />
      """)

      assert html =~ "A"
    end

    test "includes settings link" do
      user = %{email: "user@example.com"}

      assigns = %{
        user: user
      }

      html = rendered_to_string(~H"""
      <Layouts.profile_dropdown {assigns} />
      """)

      assert html =~ "Settings"
      assert html =~ "hero-cog-6-tooth"
    end

    test "includes sign out link" do
      user = %{email: "user@example.com"}

      assigns = %{
        user: user
      }

      html = rendered_to_string(~H"""
      <Layouts.profile_dropdown {assigns} />
      """)

      assert html =~ "Sign Out"
      assert html =~ "/sign-out"
    end
  end

  describe "badge/1" do
    test "renders with variant classes" do
      assigns = %{
        variant: "primary"
      }

      html = rendered_to_string(~H"""
      <Layouts.badge variant={@variant}>New</Layouts.badge>
      """)

      assert html =~ "badge-primary"
      assert html =~ "New"
    end

    test "supports custom classes" do
      assigns = %{
        variant: "info",
        class: "ml-2"
      }

      html = rendered_to_string(~H"""
      <Layouts.badge variant={@variant} class={@class}>Soon</Layouts.badge>
      """)

      assert html =~ "badge-info"
      assert html =~ "ml-2"
      assert html =~ "Soon"
    end
  end
end
