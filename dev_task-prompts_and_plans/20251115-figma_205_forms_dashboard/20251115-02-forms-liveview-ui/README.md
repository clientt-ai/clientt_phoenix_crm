# Track 2: Phoenix LiveView UI Conversion

## Overview

This track covers converting all React/TypeScript components from the Figma export to Phoenix LiveView pages and components.

**Source Files:** `figma_src/205 Forms Dashboard/src/components/`
**Target Location:** `lib/clientt_crm_app_web/live/` and `lib/clientt_crm_app_web/components/`

---

## ⚠️ CRITICAL UI Requirements

Before implementing pages, review these required specifications:

### 1. Shared Layout (Header + Sidebar)
- **All authenticated pages** must use consistent header and sidebar
- **Header:** Persistent across all pages (no page-specific changes)
- **Sidebar:** Persistent, role-based visibility, collapsible modules
- **Mobile:** Responsive with hamburger menu

### 2. Role-Based Navigation
- Sidebar shows/hides modules based on user roles:
  - **Form Admin** / **Form Viewer** → Show Forms module
  - **Lead Admin** / **Lead Viewer** → Show Leads module
  - **All users** → Show Dashboard, Settings
- Action buttons (Create Form, Export) also role-gated

### 3. Detail Views Over Modals
- **Use full-page detail views** for:
  - Form creation/editing (Form Builder)
  - Form details/submissions
  - Settings pages
  - Analytics dashboards
- **Use modals only** for:
  - Confirmations (delete, publish)
  - Quick actions (status change)
  - Previews

📄 **Full Specification:** `../20251115-00-forms-project-overview/UI-LAYOUT-AND-ROLES.md`

---

## Components to Convert

### Priority 1: Core Pages (Week 1)
1. **Dashboard Page** (284 lines) → `dashboard_live/index.ex`
2. **Forms List Page** (786 lines) → `forms_live/index.ex`
3. **Form Builder Page** (1434 lines) → `forms_live/form_builder.ex`
4. **Sidebar Component** → `components/sidebar.ex`

### Priority 2: Forms Module Pages (Week 1-2)
5. **Forms Analytics** (633 lines) → `forms_live/analytics.ex`
6. **Calendar Integration Page** (231 lines) → `calendar_live/index.ex`
7. **Chatbot Page** (781 lines) → `chatbot_live/index.ex`

### Priority 3: Settings & Configuration (Week 2)
8. **Settings Page** (1020 lines) → `settings_live/index.ex`
9. **Team Calendar Page** (404 lines) → `settings_live/team_calendar.ex`
10. **Notifications Page** (288 lines) → `notifications_live/index.ex`

### Priority 4: Supporting Pages (Week 2)
11. **Calendar Builder** (321 lines) → `calendar_live/builder.ex`
12. **Contacts Page** (836 lines) → `contacts_live/index.ex`
13. **Contacts Analytics** (616 lines) → `contacts_live/analytics.ex`

## Sub-Tasks

See individual files in this folder:
- `01-dashboard-page.md` - Dashboard overview conversion
- `02-forms-list-page.md` - Forms listing page
- `03-form-builder-page.md` - Form builder interface
- `04-sidebar-navigation.md` - Modular sidebar system
- `05-analytics-pages.md` - Analytics visualizations
- `06-settings-pages.md` - Settings and configuration
- `07-shared-components.md` - Reusable UI components
- `08-styling-guide.md` - Tailwind CSS conversion guide
- `09-testing-plan.md` - LiveView testing strategy

## Technology Conversion Matrix

### UI Framework
| React Concept | Phoenix LiveView Equivalent |
|--------------|------------------------------|
| `useState` | `assign` in socket |
| `useEffect` | `handle_info` / `handle_event` |
| `props` | function parameters / assigns |
| Component | Function component or LiveComponent |
| Event handler (`onClick`) | `phx-click` / `handle_event` |
| Conditional render (`{cond && <div>}`) | `<%= if cond do %>` |
| Map over array (`map`) | `<%= for item <- items do %>` |
| Router navigation | `push_navigate` / `push_patch` |

### Styling
| React/Tailwind v4 | Phoenix/Tailwind v3 |
|-------------------|---------------------|
| `className="..."` | `class="..."` |
| Inline styles (rare) | `style` attr (rare) |
| CSS modules | Not used in this project |
| Dark mode (`dark:`) | Same in Tailwind |

### Icons
| Lucide React | Heroicons (Phoenix) |
|--------------|---------------------|
| `<FileText />` | `<.icon name="hero-document-text" />` |
| `<Users />` | `<.icon name="hero-users" />` |
| `<Calendar />` | `<.icon name="hero-calendar" />` |
| `<BarChart3 />` | `<.icon name="hero-chart-bar" />` |

### Forms
| React Pattern | LiveView Pattern |
|---------------|------------------|
| Controlled inputs (`value={state}`) | `phx-change` + `phx-submit` |
| Form libraries (React Hook Form) | Phoenix forms with changesets |
| Client validation | Server-side validation primary |
| onChange handlers | `handle_event("validate", ...)` |

## File Structure to Create

```
lib/clientt_crm_app_web/
├── live/
│   ├── dashboard_live/
│   │   └── index.ex                    # Dashboard overview
│   ├── forms_live/
│   │   ├── index.ex                    # Forms listing
│   │   ├── show.ex                     # Form details
│   │   ├── form_builder.ex             # Form builder
│   │   ├── analytics.ex                # Forms analytics
│   │   └── components/
│   │       ├── form_card.ex            # Form preview card
│   │       └── field_editor.ex         # Field editor component
│   ├── calendar_live/
│   │   ├── index.ex                    # Calendar integration overview
│   │   ├── builder.ex                  # Calendar builder
│   │   └── booking.ex                  # Booking widget (Track 4)
│   ├── chatbot_live/
│   │   ├── index.ex                    # Conversations list
│   │   ├── show.ex                     # Conversation details
│   │   └── widget.ex                   # Chatbot widget (Track 5)
│   ├── settings_live/
│   │   ├── index.ex                    # Settings overview
│   │   ├── integrations.ex             # Integrations settings
│   │   └── team_calendar.ex            # Team calendar settings
│   ├── notifications_live/
│   │   └── index.ex                    # Notifications
│   └── contacts_live/                  # (Future CRM module)
│       ├── index.ex
│       └── analytics.ex
└── components/
    ├── sidebar.ex                      # Main navigation sidebar
    ├── kpi_card.ex                     # KPI stat card
    ├── breadcrumb.ex                   # Breadcrumb navigation
    ├── stats_chart.ex                  # Charts for analytics
    └── ui/
        ├── card.ex                     # Card container
        ├── button.ex                   # Button variants
        ├── input.ex                    # Form inputs
        ├── select.ex                   # Dropdown select
        └── modal.ex                    # Modal dialogs
```

## Component Patterns

### Basic LiveView Page Template
```elixir
defmodule ClienttCrmAppWeb.FormsLive.Index do
  use ClienttCrmAppWeb, :live_view
  alias ClienttCrmApp.Forms

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      # Subscribe to real-time updates
      Phoenix.PubSub.subscribe(ClienttCrmApp.PubSub, "forms:updates")
    end

    socket =
      socket
      |> assign(:page_title, "Forms")
      |> assign(:search_query, "")
      |> load_forms()

    {:ok, socket}
  end

  @impl true
  def handle_params(params, _uri, socket) do
    {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  end

  defp apply_action(socket, :index, _params) do
    assign(socket, :page_title, "Forms")
  end

  @impl true
  def handle_event("search", %{"query" => query}, socket) do
    socket =
      socket
      |> assign(:search_query, query)
      |> load_forms()

    {:noreply, socket}
  end

  @impl true
  def handle_info({:form_created, form}, socket) do
    {:noreply, load_forms(socket)}
  end

  defp load_forms(socket) do
    forms = Forms.list_forms_for_user(socket.assigns.current_user)
    assign(socket, :forms, forms)
  end
end
```

### LiveComponent Pattern (for reusable components)
```elixir
defmodule ClienttCrmAppWeb.FormsLive.Components.FormCard do
  use ClienttCrmAppWeb, :live_component

  @impl true
  def render(assigns) do
    ~H"""
    <div class="rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{@form.name}</h3>
        <span class={[
          "px-2 py-1 text-xs rounded-full",
          status_color(@form.status)
        ]}>
          {@form.status}
        </span>
      </div>

      <p class="text-sm text-muted-foreground mb-4">
        {@form.description}
      </p>

      <div class="flex gap-2">
        <button
          phx-click="edit_form"
          phx-value-id={@form.id}
          class="btn btn-primary"
        >
          Edit
        </button>
        <button
          phx-click="delete_form"
          phx-value-id={@form.id}
          data-confirm="Are you sure?"
          class="btn btn-destructive"
        >
          Delete
        </button>
      </div>
    </div>
    """
  end

  defp status_color("published"), do: "bg-green-100 text-green-800"
  defp status_color("draft"), do: "bg-gray-100 text-gray-800"
  defp status_color("archived"), do: "bg-red-100 text-red-800"
end
```

### Function Component Pattern (simple, stateless)
```elixir
defmodule ClienttCrmAppWeb.Components.KpiCard do
  use Phoenix.Component

  attr :title, :string, required: true
  attr :value, :string, required: true
  attr :change, :string, default: nil
  attr :icon, :string, required: true
  attr :class, :string, default: ""

  def kpi_card(assigns) do
    ~H"""
    <div class={["rounded-2xl border bg-card p-6", @class]}>
      <div class="flex items-center justify-between mb-2">
        <p class="text-sm text-muted-foreground">{@title}</p>
        <.icon name={@icon} class="w-5 h-5 text-primary" />
      </div>

      <div class="flex items-baseline gap-2">
        <h2 class="text-3xl font-bold">{@value}</h2>
        {#if @change}
          <span class={[
            "text-sm font-medium",
            change_color(@change)
          ]}>
            {@change}
          </span>
        {/if}
      </div>
    </div>
    """
  end

  defp change_color("+" <> _), do: "text-green-600"
  defp change_color("-" <> _), do: "text-red-600"
  defp change_color(_), do: "text-gray-600"
end
```

## Routing Configuration

Add to `lib/clientt_crm_app_web/router.ex`:

```elixir
scope "/", ClienttCrmAppWeb do
  pipe_through [:browser, :require_authenticated_user]

  live "/dashboard", DashboardLive.Index, :index

  live "/forms", FormsLive.Index, :index
  live "/forms/new", FormsLive.FormBuilder, :new
  live "/forms/:id", FormsLive.Show, :show
  live "/forms/:id/edit", FormsLive.FormBuilder, :edit
  live "/forms/:id/analytics", FormsLive.Analytics, :show

  live "/calendar", CalendarLive.Index, :index
  live "/calendar/builder", CalendarLive.Builder, :new

  live "/chatbot", ChatbotLive.Index, :index
  live "/chatbot/:id", ChatbotLive.Show, :show

  live "/settings", SettingsLive.Index, :index
  live "/settings/integrations", SettingsLive.Integrations, :show
  live "/settings/team-calendar", SettingsLive.TeamCalendar, :show

  live "/notifications", NotificationsLive.Index, :index
end
```

## Design System Implementation

### Color Tokens (add to `assets/css/app.css`)
```css
@layer base {
  :root {
    --primary: 210 71% 45%; /* #2278C0 */
    --accent: 173 100% 42%; /* #00D3BB */
    --muted: 0 0% 97%; /* #F8F8F8 */
    --success: 142 71% 45%;
    --warning: 25 95% 53%;
    --destructive: 0 84% 60%;
  }

  .dark {
    --primary: 210 71% 55%;
    --accent: 173 100% 52%;
    --muted: 0 0% 15%;
  }
}
```

### Typography Classes
```css
.text-page-title {
  @apply text-[38px] font-bold leading-tight;
}

.text-section-heading {
  @apply text-2xl font-semibold;
}

.text-card-title {
  @apply text-lg font-semibold;
}
```

### Component Classes
```css
.card {
  @apply rounded-2xl border bg-card p-6;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-destructive {
  @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
}
```

## Real-Time Updates Pattern

```elixir
# In the LiveView mount/3
def mount(_params, _session, socket) do
  if connected?(socket) do
    Phoenix.PubSub.subscribe(ClienttCrmApp.PubSub, "forms:#{socket.assigns.current_user.id}")
    Phoenix.PubSub.subscribe(ClienttCrmApp.PubSub, "forms:all")
  end

  {:ok, socket}
end

# In the Ash resource (after_action hook)
defmodule ClienttCrmApp.Forms.Form do
  # ... resource definition ...

  changes do
    change after_action(fn changeset, result, _context ->
      Phoenix.PubSub.broadcast(
        ClienttCrmApp.PubSub,
        "forms:#{result.user_id}",
        {:form_updated, result}
      )

      Phoenix.PubSub.broadcast(
        ClienttCrmApp.PubSub,
        "forms:all",
        {:form_updated, result}
      )

      {:ok, result}
    end)
  end
end

# In the LiveView handle_info/2
def handle_info({:form_updated, form}, socket) do
  {:noreply, update_form_in_list(socket, form)}
end
```

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on icon buttons
- [ ] Form labels properly associated
- [ ] Error messages announced to screen readers
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Heading hierarchy logical (h1 → h2 → h3)
- [ ] Skip navigation links present
- [ ] Images have alt text
- [ ] Modal focus trapping works

## Mobile Responsive Patterns

```elixir
# Responsive grid
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

# Responsive text
class="text-2xl md:text-3xl lg:text-4xl"

# Responsive padding
class="p-4 md:p-6 lg:p-8"

# Hide on mobile
class="hidden md:block"

# Mobile menu
class="block md:hidden"
```

## Dark Mode Support

All components must work in both light and dark modes. Use semantic color tokens:

```elixir
# Good - uses semantic tokens
class="bg-background text-foreground border-border"

# Bad - hard-coded colors
class="bg-white text-black border-gray-300"
```

Test both modes:
```elixir
# In tests
describe "dark mode" do
  setup do
    # Set dark mode preference
    {:ok, theme: "dark"}
  end

  test "renders correctly in dark mode", %{conn: conn} do
    # Test dark mode rendering
  end
end
```

## Performance Considerations

### Code Splitting
- Use `live_view` for full pages
- Use `live_component` for complex, stateful sub-components
- Use function components for simple, stateless UI

### Data Loading
- Load data in `mount/3` for initial render
- Use `handle_params/3` for URL-based changes
- Implement pagination for large lists
- Use `temporary_assigns` for large datasets

```elixir
def mount(_params, _session, socket) do
  socket = assign(socket, :forms, temporary: [])
  {:ok, socket, temporary_assigns: [forms: []]}
end
```

### Debouncing Search
```elixir
# In handle_event for search input
def handle_event("search", %{"query" => query}, socket) do
  # Cancel previous search timer
  if socket.assigns[:search_timer] do
    Process.cancel_timer(socket.assigns.search_timer)
  end

  # Set new timer (300ms debounce)
  timer = Process.send_after(self(), {:execute_search, query}, 300)

  {:noreply, assign(socket, search_timer: timer, search_query: query)}
end

def handle_info({:execute_search, query}, socket) do
  {:noreply, load_forms(socket, query)}
end
```

## Testing Strategy

### LiveView Tests
```elixir
defmodule ClienttCrmAppWeb.FormsLive.IndexTest do
  use ClienttCrmAppWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Index" do
    test "displays forms", %{conn: conn} do
      user = user_fixture()
      form = form_fixture(user_id: user.id)

      {:ok, _view, html} = live(conn, ~p"/forms")

      assert html =~ form.name
      assert html =~ form.description
    end

    test "creates new form", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/forms/new")

      view
      |> form("#form-builder-form", form: %{name: "New Form"})
      |> render_submit()

      assert_redirect(view, ~p"/forms")
    end

    test "searches forms", %{conn: conn} do
      user = user_fixture()
      form1 = form_fixture(user_id: user.id, name: "Contact Form")
      form2 = form_fixture(user_id: user.id, name: "Survey Form")

      {:ok, view, _html} = live(conn, ~p"/forms")

      html =
        view
        |> form("#search-form", search: %{query: "Contact"})
        |> render_change()

      assert html =~ form1.name
      refute html =~ form2.name
    end
  end
end
```

## Common Pitfalls to Avoid

1. **N+1 Queries**
   - Always preload associations in Ash queries
   - Use `load` in resource definitions

2. **Not handling disconnection**
   - Check `connected?(socket)` before subscribing to PubSub
   - Handle the case where socket disconnects

3. **Large assigns**
   - Use `temporary_assigns` for lists
   - Don't store large data structures in assigns

4. **Missing CSRF**
   - All forms need `@csrf_token` in hidden input
   - Use `phx-update="ignore"` for third-party widgets

5. **Hard-coded URLs**
   - Use verified routes: `~p"/forms/#{form}"`
   - Not string interpolation: `"/forms/#{form.id}"`

## Next Steps

1. Review existing LiveView pages in codebase for patterns
2. Start with Priority 1 pages (Dashboard, Forms List)
3. Build shared components first (KPI card, sidebar)
4. Implement one page completely before moving to next
5. Test thoroughly including dark mode and mobile
6. Document any new patterns or components

## Resources

- `/liveview-guidelines` - Project LiveView patterns
- `/phoenix-guidelines` - Phoenix conventions
- `/html-guidelines` - HEEx template guidelines
- [Phoenix LiveView Docs](https://hexdocs.pm/phoenix_live_view/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

**Status:** Ready for Implementation
**Estimated Time:** 2 weeks for all pages
**Dependencies:** None (can start immediately)
