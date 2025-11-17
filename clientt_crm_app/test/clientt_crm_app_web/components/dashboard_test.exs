defmodule ClienttCrmAppWeb.Components.DashboardTest do
  use ExUnit.Case, async: true
  import Phoenix.LiveViewTest

  alias ClienttCrmAppWeb.Components.Dashboard

  describe "kpi_card/1" do
    test "renders with required props" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        trend: nil
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "Total Forms"
      assert html =~ "156"
      assert html =~ "hero-document-text"
    end

    test "renders trend indicator when trend is positive" do
      assigns = %{
        label: "Active Users",
        value: 1892,
        icon: :hero_users,
        trend: 12.5
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "+12.5%"
      assert html =~ "text-success"
      assert html =~ "hero-arrow-trending-up"
    end

    test "renders trend indicator when trend is negative" do
      assigns = %{
        label: "Bounce Rate",
        value: "35.2%",
        icon: :hero_arrow_trending_down,
        trend: -5.3
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "-5.3%"
      assert html =~ "text-error"
      assert html =~ "hero-arrow-trending-down"
    end

    test "renders active state" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        active: true
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "ring-2 ring-primary"
    end

    test "includes click handler when clickable" do
      assigns = %{
        label: "Total Forms",
        value: 156,
        icon: :hero_document_text,
        clickable: true,
        rest: %{"phx-click" => "open_detail"}
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "phx-click=\"open_detail\""
      assert html =~ "cursor-pointer"
    end

    test "formats large numbers with commas" do
      assigns = %{
        label: "Total Submissions",
        value: 1_892_456,
        icon: :hero_paper_airplane
      }

      html = rendered_to_string(~H"""
      <Dashboard.kpi_card {assigns} />
      """)

      assert html =~ "1,892,456"
    end
  end

  describe "performance_chart/1" do
    test "renders chart container with data" do
      assigns = %{
        title: "Form Submissions",
        description: "Daily breakdown",
        data: [
          %{name: "Mon", submissions: 45},
          %{name: "Tue", submissions: 52}
        ]
      }

      html = rendered_to_string(~H"""
      <Dashboard.performance_chart {assigns} />
      """)

      assert html =~ "Form Submissions"
      assert html =~ "Daily breakdown"
      assert html =~ "phx-hook=\"AreaChart\""
      assert html =~ "canvas"
    end

    test "renders empty state when no data" do
      assigns = %{
        title: "Form Submissions",
        data: []
      }

      html = rendered_to_string(~H"""
      <Dashboard.performance_chart {assigns} />
      """)

      assert html =~ "Loading chart data..."
    end

    test "includes time range selector when provided" do
      assigns = %{
        title: "Submissions",
        data: [],
        time_ranges: ["7d", "30d", "90d"],
        selected_range: "30d"
      }

      html = rendered_to_string(~H"""
      <Dashboard.performance_chart {assigns} />
      """)

      assert html =~ "7 Days"
      assert html =~ "30 Days"
      assert html =~ "90 Days"
      assert html =~ "tab-active"
    end
  end

  describe "recent_forms_table/1" do
    test "renders table with forms" do
      assigns = %{
        forms: [
          %{
            id: "1",
            name: "Contact Form",
            status: :published,
            submission_count: 42,
            updated_at: ~U[2025-01-15 10:00:00Z]
          },
          %{
            id: "2",
            name: "Feedback Form",
            status: :draft,
            submission_count: 0,
            updated_at: ~U[2025-01-14 15:30:00Z]
          }
        ]
      }

      html = rendered_to_string(~H"""
      <Dashboard.recent_forms_table {assigns} />
      """)

      assert html =~ "Contact Form"
      assert html =~ "Feedback Form"
      assert html =~ "Published"
      assert html =~ "Draft"
      assert html =~ "42"
    end

    test "renders empty state when no forms" do
      assigns = %{
        forms: []
      }

      html = rendered_to_string(~H"""
      <Dashboard.recent_forms_table {assigns} />
      """)

      assert html =~ "No forms yet"
    end

    test "renders custom title" do
      assigns = %{
        title: "My Recent Forms",
        forms: []
      }

      html = rendered_to_string(~H"""
      <Dashboard.recent_forms_table {assigns} />
      """)

      assert html =~ "My Recent Forms"
    end

    test "limits rows to max_rows" do
      forms =
        Enum.map(1..10, fn i ->
          %{
            id: "#{i}",
            name: "Form #{i}",
            status: :published,
            submission_count: i,
            updated_at: ~U[2025-01-15 10:00:00Z]
          }
        end)

      assigns = %{
        forms: forms,
        max_rows: 3
      }

      html = rendered_to_string(~H"""
      <Dashboard.recent_forms_table {assigns} />
      """)

      # Should only show first 3 forms
      assert html =~ "Form 1"
      assert html =~ "Form 2"
      assert html =~ "Form 3"
      refute html =~ "Form 4"
    end
  end
end
