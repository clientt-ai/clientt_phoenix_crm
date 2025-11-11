---
name: project-guidelines
description: Provides project-specific guidelines for Phoenix development including workflow, Phoenix v1.8 conventions, Tailwind CSS v4, asset bundling, and UI/UX best practices. Use when setting up development workflow, working with assets, styling, or ensuring project conventions.
---

# Project Guidelines

This skill provides project-specific guidelines for developing this Phoenix application.

## Development Workflow

### Pre-commit Checks

- Use `mix precommit` alias when done with all changes
- This runs: compile with warnings as errors, unlock unused deps, format, and test
- Fix any pending issues before committing

### HTTP Client

- Use the already included `:req` (`Req`) library for HTTP requests
- **Avoid** `:httpoison`, `:tesla`, and `:httpc`
- Req is included by default and is the preferred HTTP client for Phoenix apps

```elixir
# Use Req for HTTP requests
Req.get!("https://api.example.com/data")
Req.post!("https://api.example.com/users", json: %{name: "Alice"})
```

## Phoenix v1.8 Conventions

### Layout Components

- **Always** begin LiveView templates with `<Layouts.app flash={@flash} ...>` which wraps all inner content
- The `MyAppWeb.Layouts` module is aliased in the `my_app_web.ex` file—no need to alias it again

```heex
<Layouts.app flash={@flash} current_scope={@current_scope}>
  <%!-- Your content here --%>
</Layouts.app>
```

### Current Scope Issues

When you encounter errors with no `current_scope` assign:

1. You failed to follow Authenticated Routes guidelines, OR
2. You failed to pass `current_scope` to `<Layouts.app>`

**Fix** by moving routes to proper `live_session` and ensure you pass `current_scope` as needed.

### Flash Messages

- Phoenix v1.8 moved the `<.flash_group>` component to the `Layouts` module
- You are **forbidden** from calling `<.flash_group>` outside of the `layouts.ex` module

### Icons

- Out of the box, `core_components.ex` imports `<.icon name="hero-x-mark" class="w-5 h-5"/>` for hero icons
- **Always** use the `<.icon>` component for icons
- **Never** use `Heroicons` modules or similar

```heex
<.icon name="hero-user" class="w-6 h-6" />
<.icon name="hero-envelope" class="w-5 h-5" />
```

### Form Inputs

- **Always** use the imported `<.input>` component from `core_components.ex` when available
- Using `<.input>` will save steps and prevent errors

```heex
<.input field={@form[:email]} label="Email" type="email" />
<.input field={@form[:password]} label="Password" type="password" />
```

**Class Override Warning**: If you override default input classes with custom values, no default classes are inherited. Your custom classes must fully style the input.

## JS and CSS Guidelines

### Styling Philosophy

**Use Tailwind CSS classes and custom CSS rules** to create polished, responsive, and visually stunning interfaces.

### Tailwind CSS v4

Tailwind CSS v4 **no longer needs a tailwind.config.js** and uses new import syntax in `app.css`:

```css
@import "tailwindcss" source(none);
@source "../css";
@source "../js";
@source "../../lib/my_app_web";
```

**Important**:
- **Always use and maintain this import syntax** in app.css for projects generated with `phx.new`
- **Never** use `@apply` when writing raw CSS in Tailwind v4

### UI Components

- **Always** manually write your own Tailwind-based components
- **Never** use daisyUI for a unique, world-class design
- Build custom components that match your brand and design system

### Asset Bundling

Out of the box **only the app.js and app.css bundles are supported**:

- You **cannot** reference an external vendor'd script `src` or link `href` in the layouts
- You **must** import vendor deps into app.js and app.css to use them
- **Never write inline `<script>custom js</script>` tags within templates**

**Example** (in `assets/js/app.js`):

```javascript
// Import vendor libraries
import Chart from "chart.js/auto"
import Alpine from "alpinejs"

// Make available globally if needed
window.Chart = Chart
window.Alpine = Alpine
Alpine.start()
```

## UI/UX & Design Guidelines

### Design Philosophy

**Produce world-class UI designs** with focus on:
- Usability
- Aesthetics
- Modern design principles

### Micro-interactions

Implement **subtle micro-interactions**:
- Button hover effects
- Smooth transitions
- Loading states
- Focus states

```heex
<button class="
  px-4 py-2 bg-blue-600 text-white rounded-lg
  transition-all duration-200
  hover:bg-blue-700 hover:shadow-lg
  active:scale-95
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
">
  Click me
</button>
```

### Typography and Layout

Ensure **clean typography, spacing, and layout balance** for a refined, premium look:

- Use consistent spacing scales (Tailwind's spacing is great)
- Maintain visual hierarchy with font sizes and weights
- Use proper line heights for readability
- Ensure adequate contrast ratios

### Delightful Details

Focus on **delightful details**:
- Hover effects on interactive elements
- Loading states for async operations
- Smooth page transitions
- Empty states with helpful guidance
- Success/error feedback with appropriate styling

### Examples

**Card with hover effect**:

```heex
<div class="
  group p-6 bg-white rounded-xl shadow-sm
  transition-all duration-300
  hover:shadow-xl hover:-translate-y-1
">
  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
    {@title}
  </h3>
  <p class="mt-2 text-gray-600">{@description}</p>
</div>
```

**Loading state**:

```heex
<div :if={@loading} class="flex items-center justify-center">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
</div>
```

## Summary

- Run `mix precommit` before committing
- Use Req library for HTTP requests
- Follow Phoenix v1.8 conventions (Layouts.app, icons, inputs)
- Use Tailwind v4 import syntax in app.css
- Never use `@apply` in raw CSS
- Build custom components, avoid daisyUI
- Import vendor deps into app.js/app.css
- Focus on world-class UI with micro-interactions and delightful details
