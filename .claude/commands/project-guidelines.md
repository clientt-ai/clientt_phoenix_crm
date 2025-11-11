---
description: General project guidelines for this Phoenix application
---

# Project Guidelines

## Development Workflow

- Use `mix precommit` alias when done with all changes and fix any pending issues
- Use the already included `:req` (`Req`) library for HTTP requests
- **Avoid** `:httpoison`, `:tesla`, and `:httpc`
- Req is included by default and is the preferred HTTP client for Phoenix apps

## Phoenix v1.8 Conventions

### Layout Components

- **Always** begin LiveView templates with `<Layouts.app flash={@flash} ...>` which wraps all inner content
- The `MyAppWeb.Layouts` module is aliased in the `my_app_web.ex` file

### Current Scope

- When you encounter errors with no `current_scope` assign:
  - You failed to follow the Authenticated Routes guidelines, or
  - You failed to pass `current_scope` to `<Layouts.app>`
- **Always** fix by moving routes to proper `live_session` and ensure you pass `current_scope` as needed

### Flash Messages

- Phoenix v1.8 moved the `<.flash_group>` component to the `Layouts` module
- You are **forbidden** from calling `<.flash_group>` outside of the `layouts.ex` module

### Icons

- Out of the box, `core_components.ex` imports `<.icon name="hero-x-mark" class="w-5 h-5"/>` for hero icons
- **Always** use the `<.icon>` component for icons
- **Never** use `Heroicons` modules or similar

### Form Inputs

- **Always** use the imported `<.input>` component from `core_components.ex` when available
- Using `<.input>` will save steps and prevent errors
- If you override default input classes with custom values, no default classes are inherited
- Your custom classes must fully style the input

## JS and CSS Guidelines

### Styling

- **Use Tailwind CSS classes and custom CSS rules** to create polished, responsive, and visually stunning interfaces

### Tailwind v4

- Tailwind CSS v4 **no longer needs a tailwind.config.js**
- Uses new import syntax in `app.css`:

      @import "tailwindcss" source(none);
      @source "../css";
      @source "../js";
      @source "../../lib/my_app_web";

- **Always use and maintain this import syntax** in app.css for `phx.new` projects
- **Never** use `@apply` when writing raw CSS

### UI Components

- **Always** manually write your own tailwind-based components
- **Never** use daisyUI for a unique, world-class design

### Asset Bundling

- Out of the box **only the app.js and app.css bundles are supported**
- You cannot reference an external vendor'd script `src` or link `href` in the layouts
- You must import vendor deps into app.js and app.css to use them
- **Never write inline `<script>custom js</script>` tags within templates**

## UI/UX & Design Guidelines

- **Produce world-class UI designs** with focus on usability, aesthetics, and modern design principles
- Implement **subtle micro-interactions** (e.g., button hover effects, smooth transitions)
- Ensure **clean typography, spacing, and layout balance** for a refined, premium look
- Focus on **delightful details** like hover effects, loading states, and smooth page transitions
