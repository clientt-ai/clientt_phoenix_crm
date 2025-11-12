# UI/UX Design System - ClienttCRM

**Status**: Pending Figma Designs
**Last Updated**: 2025-11-12
**Design System**: DaisyUI + Nexus Components
**Target Framework**: Phoenix LiveView

## Purpose

This folder contains the complete UI/UX design system for ClienttCRM, including design tokens, component specifications, UI patterns, and screen designs organized by domain. This is a **cross-domain** resource used by all domains (Authorization, Contacts, Deals, etc.).

---

## Folder Structure

```
specs/05-ui-design/
├── README.md                      # This file - design system overview
├── design-tokens.md               # Global design tokens (colors, typography, spacing)
├── components/                    # Reusable component specifications
│   ├── buttons.md                 # Button variants and usage
│   ├── forms.md                   # Form inputs and validation
│   ├── tables.md                  # Data tables and lists
│   ├── modals.md                  # Modal dialogs
│   ├── navigation.md              # Nav bars, tabs, breadcrumbs
│   └── feedback.md                # Alerts, toasts, loading states
├── patterns/                      # Common UI patterns
│   ├── authentication.md          # Login, registration flows
│   ├── list-detail.md             # Master-detail pattern
│   ├── modal-forms.md             # Form in modal pattern
│   └── crud-operations.md         # Create, read, update, delete patterns
├── screens/                       # Screen specifications by domain
│   ├── authorization/             # Authorization domain screens
│   │   ├── company-list.md
│   │   ├── company-switcher.md
│   │   ├── member-management.md
│   │   ├── team-management.md
│   │   ├── settings.md
│   │   └── audit-log.md
│   ├── contacts/                  # Contacts domain screens (future)
│   │   ├── contact-list.md
│   │   └── contact-detail.md
│   └── shared/                    # Shared across all domains
│       ├── dashboard.md           # Main dashboard
│       ├── navigation.md          # App navigation
│       └── user-profile.md        # User settings
└── figma/
    ├── FIGMA_LINK.md              # Link to shared Figma file
    └── exports/                   # PNG/SVG exports (if needed)
```

---

## Design System Stack

### DaisyUI Figma Library 2.0

**Link**: https://www.figma.com/community/file/1164785901410077933

**Primary Component Library**:
- Pre-built Tailwind CSS components
- Consistent theming system
- Accessible by default
- Dark mode support

### Nexus Components

**Additional Component Library** (provide link or details)
- Custom components not in DaisyUI
- Industry-specific patterns

### Tailwind CSS v4

**Utility-First CSS Framework**:
- Latest version (v4.1+)
- Custom configuration in `tailwind.config.js`
- JIT (Just-In-Time) compilation
- See `CLAUDE.md` for project-specific setup

### Phoenix LiveView

**Target Framework**:
- Server-rendered HTML with HEEx templates
- Real-time updates via WebSocket
- No React/Vue/Angular - pure Phoenix

---

## ⚠️ Important: Figma → LiveView Workflow

### DO NOT Export HTML/TSX from Figma

**Incorrect Approach** ❌:
- Export Figma to HTML
- Export Figma to React/TSX
- Use Figma code generation

**Correct Approach** ✅:
1. **Figma as Visual Reference**: Treat designs as specification, not code
2. **Manual Implementation**: Write proper Phoenix LiveView components
3. **DaisyUI Classes**: Apply Tailwind + DaisyUI classes to match designs
4. **LiveView Patterns**: Follow Phoenix conventions (streams, assigns, events)

### Why Manual Implementation?

- Figma generates React-style code (incompatible with LiveView)
- Exported code doesn't follow Phoenix best practices
- LiveView requires server-side event handling
- Better performance with handcrafted HEEx templates

---

## How to Supply Figma Designs

### Option A: Figma Link (Strongly Preferred) ✅

**Steps**:
1. Create Figma file using DaisyUI Figma Library 2.0
2. Set permissions: "Anyone with link can view"
3. Add link to `figma/FIGMA_LINK.md`

**Advantages**:
- Developers inspect directly in Figma
- Automatic updates as designs evolve
- Preserves all design details (spacing, colors, interactions)
- Can view component structure and properties

### Option B: Exported Assets (Fallback)

If Figma link unavailable:
1. Export screens as PNG (2x resolution)
2. Save in `figma/exports/` folder
3. Document design tokens manually
4. Annotate with component names

### Option C: Screenshots + Detailed Specs

Last resort:
1. Screenshot each screen
2. Annotate with measurements and component names
3. Document all interactions and states
4. Include responsive behavior specs

---

## Design Workflow

### Phase 1: Design System Setup (Current)
- [x] Create folder structure
- [ ] Document design tokens
- [ ] Create Figma file with DaisyUI library
- [ ] Share Figma link

### Phase 2: Component Library (Before Implementation)
- [ ] Design core components (buttons, forms, tables, etc.)
- [ ] Document component variants and states
- [ ] Create component specs in `components/` folder

### Phase 3: UI Patterns (Before Implementation)
- [ ] Design common patterns (CRUD, list-detail, modal forms)
- [ ] Document interaction flows
- [ ] Create pattern specs in `patterns/` folder

### Phase 4: Screen Designs (Per Domain)
- [ ] Design Authorization domain screens
- [ ] Design Contacts domain screens (future)
- [ ] Design Deals domain screens (future)
- [ ] Create screen specs in `screens/{domain}/` folders

### Phase 5: Implementation
- [ ] Implement core components in LiveView
- [ ] Implement patterns
- [ ] Implement domain-specific screens
- [ ] Test across browsers and devices

---

## Component Specification Template

Each component spec should include:

### 1. Component Overview
- Purpose and use cases
- When to use vs alternatives
- Accessibility considerations

### 2. Figma Reference
- Link to Figma component
- Or image reference

### 3. Variants
| Variant | DaisyUI Class | Usage |
|---------|---------------|-------|
| Primary | `btn btn-primary` | Main actions |
| Secondary | `btn btn-secondary` | Secondary actions |

### 4. States
- Default
- Hover
- Active/Pressed
- Disabled
- Loading
- Error

### 5. LiveView Implementation
```elixir
<.button type="button" variant="primary" phx-click="save">
  Save Changes
</.button>
```

### 6. Props/Attributes
- Required props
- Optional props
- Default values

### 7. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader considerations

---

## Screen Specification Template

Each screen spec should include:

### 1. Screen Overview
- Purpose and user flow
- Related BDD scenarios
- User roles/permissions required

### 2. Figma Reference
- Link to specific Figma frame/page
- Or high-res screenshot

### 3. Layout Structure
- Grid/flex layout
- Responsive breakpoints
- Content hierarchy

### 4. Component Breakdown
| UI Element | DaisyUI Component | LiveView Component | Props/State |
|------------|-------------------|---------------------|-------------|
| Page title | - | `<.header>` | title, subtitle |
| Action button | `btn btn-primary` | `<.button>` | phx-click="create" |
| Data table | `table table-zebra` | `<.table>` | rows, columns |

### 5. Interactions
- Click handlers (phx-click, phx-submit)
- Form submissions
- Real-time updates (LiveView streams)
- Navigation

### 6. States & Validation
- Loading states
- Empty states
- Error states
- Success messages
- Form validation feedback

### 7. Responsive Behavior
- Mobile (<640px): Stack layout, hide secondary actions
- Tablet (640-1024px): Two columns, visible actions
- Desktop (>1024px): Full layout, all features visible

---

## LiveView Implementation Guidelines

### File Structure

```
lib/clientt_crm_app_web/
├── components/
│   ├── core_components.ex        # Core reusable components
│   ├── ui/                       # UI-specific components
│   │   ├── button.ex
│   │   ├── form.ex
│   │   ├── table.ex
│   │   └── modal.ex
│   └── layouts/
│       ├── root.html.heex        # HTML shell
│       └── app.html.heex         # App layout with nav
├── live/
│   ├── authorization/            # Authorization domain LiveViews
│   │   ├── company_live/
│   │   ├── member_live/
│   │   ├── team_live/
│   │   └── settings_live/
│   └── contacts/                 # Contacts domain LiveViews (future)
│       └── contact_live/
└── controllers/                  # Traditional controllers
```

### Component Patterns

**Phoenix Components (Function Components)**:
```elixir
# Define component
attr :variant, :string, default: "primary"
attr :type, :string, default: "button"
attr :class, :string, default: ""
attr :rest, :global, include: ~w(disabled form name value)

slot :inner_block, required: true

def button(assigns) do
  ~H"""
  <button
    type={@type}
    class={["btn", "btn-#{@variant}", @class]}
    {@rest}
  >
    <%= render_slot(@inner_block) %>
  </button>
  """
end

# Use component
<.button variant="primary" phx-click="save">
  Save Changes
</.button>
```

**LiveView Streams for Lists**:
```elixir
def mount(_params, _session, socket) do
  {:ok,
   socket
   |> stream(:members, list_members())}
end

# In template
<div id="members" phx-update="stream">
  <%= for {dom_id, member} <- @streams.members do %>
    <div id={dom_id} class="card">
      <%= member.email %>
    </div>
  <% end %>
</div>
```

### Authentication & Authorization Context

All LiveView routes require authentication and company context:

```elixir
# In router.ex
live_session :require_authz,
  on_mount: [
    {ClienttCrmAppWeb.LiveUserAuth, :ensure_authenticated},
    {ClienttCrmAppWeb.LiveAuthzAuth, :ensure_company_context}
  ] do

  scope "/companies/:company_id" do
    live "/members", MemberLive.Index, :index
    live "/teams", TeamLive.Index, :index
  end
end
```

---

## Design Principles

### 1. Consistency
- Use DaisyUI components consistently
- Follow established patterns
- Maintain visual hierarchy

### 2. Accessibility First
- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactions
- Screen reader friendly
- Sufficient color contrast

### 3. Mobile-First Responsive
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)

### 4. Performance
- Optimize images (WebP, lazy loading)
- Minimize CSS/JS payload
- Use LiveView for real-time updates (no SPA overhead)

### 5. Feedback & Guidance
- Loading states for async operations
- Clear error messages
- Success confirmations
- Empty states with actions

---

## Cross-Domain UI Elements

### Global Navigation

**Location**: `screens/shared/navigation.md`

**Components**:
- Company switcher dropdown
- User menu
- Main navigation (Dashboard, Contacts, Deals, etc.)
- Notifications

### Dashboard

**Location**: `screens/shared/dashboard.md`

**Components**:
- Welcome message
- Quick actions
- Recent activity feed
- Stats/metrics cards

---

## Domain-Specific Screens

### Authorization Domain

See: `screens/authorization/` folder

**Key Screens**:
1. **Company List** - View all companies user belongs to
2. **Company Switcher** - Modal/dropdown to switch active company
3. **Member Management** - Invite, manage roles, remove users
4. **Team Management** - Create teams, assign members
5. **Settings** - Company settings, limits, features, branding
6. **Audit Log** - View authorization changes (admin only)

### Contacts Domain (Future)

See: `screens/contacts/` folder

**Key Screens**:
1. **Contact List** - Browse and search contacts
2. **Contact Detail** - View/edit contact information
3. **Contact Create** - Add new contact

---

## Testing UI Components

### Visual Regression Testing

**Tool**: Percy, Chromatic, or similar
- Capture screenshots of components
- Detect visual changes in PRs
- Test across browsers

### Accessibility Testing

**Tools**:
- axe DevTools
- Lighthouse
- Manual keyboard testing

### Browser Testing

**Support**:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Responsive Testing

**Breakpoints**:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

---

## Next Steps

1. **Add Figma Link**: Share Figma file link in `figma/FIGMA_LINK.md`
2. **Design Tokens**: Finalize and document in `design-tokens.md`
3. **Component Library**: Design and spec core components
4. **UI Patterns**: Document common patterns
5. **Screen Designs**: Create domain-specific screen designs
6. **Implementation**: Begin LiveView implementation

---

## Questions?

**Design System**: See `design-tokens.md` and DaisyUI docs
**LiveView Patterns**: See `/.claude/commands/liveview-guidelines`
**Domain Specs**: See `../01-domains/{domain}/` for business logic
**Component Help**: Check `components/` folder for specs

---

**Status**: ⏳ Design system structure complete, awaiting Figma designs
