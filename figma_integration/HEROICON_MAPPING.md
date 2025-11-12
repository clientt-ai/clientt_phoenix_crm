# Hero Icons Mapping for 205 Forms Dashboard

**Hero Icons Version:** v2.2.0 (already installed)
**Documentation:** https://heroicons.com

Instead of using the exported Figma SVGs, we should use Hero Icons which are already configured in your Phoenix project.

## How to Use Hero Icons

```heex
<!-- Basic usage -->
<.icon name="hero-home" />

<!-- With custom size -->
<.icon name="hero-user-group" class="size-8" />

<!-- Solid variant -->
<.icon name="hero-chart-bar-solid" />

<!-- Mini variant -->
<.icon name="hero-x-mark-mini" />
```

## Dashboard Icon Mapping

### KPI Card Icons (32x32, colored backgrounds)

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| Total Forms | `file-text.svg` | `hero-document-text` | outline | `size-8` |
| Total Submissions | `send.svg` | `hero-paper-airplane` | outline | `size-8` |
| Active Users | `users.svg` | `hero-user-group` | outline | `size-8` |
| Conversion Rate | `trending-up.svg` | `hero-arrow-trending-up` | outline | `size-8` |

```heex
<!-- Total Forms KPI -->
<div class="bg-blue-600 rounded-2xl size-16 flex items-center justify-center">
  <.icon name="hero-document-text" class="size-8 text-white" />
</div>

<!-- Total Submissions KPI -->
<div class="bg-pink-600 rounded-2xl size-16 flex items-center justify-center">
  <.icon name="hero-paper-airplane" class="size-8 text-white" />
</div>

<!-- Active Users KPI -->
<div class="bg-teal-500 rounded-2xl size-16 flex items-center justify-center">
  <.icon name="hero-user-group" class="size-8 text-white" />
</div>

<!-- Conversion Rate KPI -->
<div class="bg-violet-600 rounded-2xl size-16 flex items-center justify-center">
  <.icon name="hero-arrow-trending-up" class="size-8 text-white" />
</div>
```

### Trend Indicator Icons (16x16, green)

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| Percentage changes | `trending-up-sm.svg` | `hero-arrow-trending-up` | mini | `size-4` |

```heex
<!-- Percentage change indicator -->
<div class="flex items-center gap-1">
  <.icon name="hero-arrow-trending-up-mini" class="size-4 text-green-500" />
  <span class="text-green-500 text-sm">+12%</span>
</div>
```

### Navigation Icons (20x16, sidebar menu)

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| Dashboard | `home.svg` | `hero-home` | solid (active) / outline | `size-5` |
| Forms | `file.svg` | `hero-document` | outline | `size-5` |
| Landing Pages | `document-duplicate.svg` | `hero-document-duplicate` | outline | `size-5` |
| Analytics | `chart-bar.svg` | `hero-chart-bar` | outline | `size-5` |
| Settings | `cog.svg` | `hero-cog-6-tooth` | outline | `size-5` |

```heex
<!-- Active nav item (Dashboard) -->
<button class="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
  <.icon name="hero-home-solid" class="size-5" />
  <span>Dashboard</span>
</button>

<!-- Inactive nav item -->
<button class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100">
  <.icon name="hero-document" class="size-5 text-gray-700" />
  <span>Forms</span>
</button>
```

### Action Icons (16x16, buttons & inputs)

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| Search (header, table) | `search.svg` | `hero-magnifying-glass` | outline | `size-4` |
| Create New button | `plus.svg` | `hero-plus` | outline/solid | `size-4` |
| Filter button | `adjustments.svg` | `hero-adjustments-horizontal` | outline | `size-4` |
| Help button | `question-mark-circle.svg` | `hero-question-mark-circle` | outline | `size-5` |
| Notifications | `bell.svg` | `hero-bell` | outline | `size-5` |

```heex
<!-- Search input -->
<div class="relative">
  <.icon name="hero-magnifying-glass" class="absolute left-3 top-3 size-4 text-gray-400" />
  <input type="text" placeholder="Search..." class="pl-10 pr-4 py-2" />
</div>

<!-- Create button -->
<button class="btn btn-primary gap-2">
  <.icon name="hero-plus" class="size-4" />
  Create New
</button>

<!-- Filter button -->
<button class="btn btn-ghost btn-square">
  <.icon name="hero-adjustments-horizontal" class="size-5" />
</button>
```

### AI Feature Icons

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| AI Assistant header | `sparkles.svg` | `hero-sparkles` | outline/solid | `size-5` |
| Create with AI button | `sparkles-fill.svg` | `hero-sparkles-solid` | solid | `size-4` |
| AI Insights header | `light-bulb.svg` | `hero-light-bulb` | outline/solid | `size-5` |
| Top performing insight | `target.svg` | `hero-chart-bar-square` | outline | `size-6` |
| Optimization insight | `light-bulb-outline.svg` | `hero-light-bulb` | outline | `size-6` |
| Engagement trend | `trending-up-circle.svg` | `hero-arrow-trending-up` | outline | `size-6` |

```heex
<!-- AI Assistant header -->
<div class="flex items-center gap-3">
  <div class="bg-gradient-to-br from-blue-600 to-pink-600 rounded-lg size-10 flex items-center justify-center">
    <.icon name="hero-sparkles-solid" class="size-5 text-white" />
  </div>
  <div>
    <h3 class="font-semibold">AI Forms Assistant</h3>
    <p class="text-sm text-gray-600">Generate a new form using AI</p>
  </div>
</div>

<!-- AI Insights -->
<div class="flex items-center gap-2 rounded-full bg-blue-100 size-12 justify-center">
  <.icon name="hero-chart-bar-square" class="size-6 text-blue-600" />
</div>
```

### System/Menu Icons

| Dashboard Component | Figma Export | Use Hero Icon | Variant | Size |
|---------------------|--------------|---------------|---------|------|
| Menu toggle | `menu-bars.svg` | `hero-bars-3` | outline | `size-5` |

```heex
<!-- Hamburger menu -->
<button class="btn btn-ghost btn-square">
  <.icon name="hero-bars-3" class="size-5" />
</button>
```

## Logo & Images

These should remain as PNG files (not icons):

| Component | File | Location |
|-----------|------|----------|
| Clientt Logo | `clientt-logo.png` | `priv/static/images/` |
| User Avatar | `avatar-placeholder.png` | `priv/static/images/` |

```heex
<!-- Logo -->
<img src={~p"/images/clientt-logo.png"} alt="Clientt" class="h-8" />

<!-- Avatar -->
<img src={~p"/images/avatar-placeholder.png"} alt="User" class="size-10 rounded-full" />
```

## Hero Icons Style Guide

### Variants

- **Outline** (default): Thin, light style - use for most UI
- **Solid**: Filled style - use for active states, emphasis
- **Mini**: Smaller 20x20 icons - use for inline text, tight spaces

### Sizes

```heex
<!-- Tailwind size classes -->
<.icon name="hero-home" class="size-3" /> <!-- 12x12px -->
<.icon name="hero-home" class="size-4" /> <!-- 16x16px - default -->
<.icon name="hero-home" class="size-5" /> <!-- 20x20px -->
<.icon name="hero-home" class="size-6" /> <!-- 24x24px -->
<.icon name="hero-home" class="size-8" /> <!-- 32x32px -->
```

### Colors

```heex
<!-- Text color utilities -->
<.icon name="hero-home" class="size-5 text-gray-700" />
<.icon name="hero-home" class="size-5 text-blue-600" />
<.icon name="hero-home" class="size-5 text-white" />
<.icon name="hero-home" class="size-5 text-green-500" />
```

## Component Examples

### KPI Card Component

```heex
<div class="bg-white rounded-2xl border border-gray-200 p-6">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <p class="text-sm text-gray-600">Total Forms</p>
      <p class="text-2xl font-semibold mt-2">156</p>
      <div class="flex items-center gap-1 mt-3">
        <.icon name="hero-arrow-trending-up-mini" class="size-4 text-green-500" />
        <span class="text-sm text-green-500">+12%</span>
        <span class="text-xs text-gray-500">vs last month</span>
      </div>
    </div>
    <div class="bg-blue-600 rounded-2xl size-16 flex items-center justify-center">
      <.icon name="hero-document-text" class="size-8 text-white" />
    </div>
  </div>
</div>
```

### Navigation Item Component

```heex
defp nav_item(assigns) do
  ~H"""
  <.link
    navigate={@href}
    class={[
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      if(@active, do: "bg-blue-600 text-white shadow-lg", else: "hover:bg-gray-100")
    ]}
  >
    <.icon
      name={@icon}
      class={[
        "size-5",
        if(@active, do: "", else: "text-gray-700")
      ]}
    />
    <span class="font-medium"><%= @label %></span>
  </.link>
  """
end

<!-- Usage -->
<.nav_item href="/dashboard" icon="hero-home-solid" label="Dashboard" active={true} />
<.nav_item href="/forms" icon="hero-document" label="Forms" active={false} />
```

## Benefits of Using Hero Icons

✅ **Already installed** - No additional dependencies
✅ **Consistent design** - All icons from same family
✅ **Better performance** - Bundled in CSS, no HTTP requests
✅ **Maintained** - Updated by Tailwind Labs
✅ **Accessible** - Proper ARIA attributes
✅ **Themeable** - Easy color/size customization
✅ **Multiple variants** - Outline, solid, mini

## Migration Steps

1. ❌ **Remove** the copied SVG icons from `priv/static/images/icons/`
2. ✅ **Use** Hero Icons component: `<.icon name="hero-..." />`
3. ✅ **Keep** PNG images (logo, avatar) in `priv/static/images/`
4. ✅ **Update** components to use Hero Icons mapping above

## Available Hero Icons

Browse all available icons at: https://heroicons.com

Common icons you'll need:
- `hero-home`, `hero-home-solid`
- `hero-document`, `hero-document-text`
- `hero-paper-airplane`
- `hero-user-group`
- `hero-arrow-trending-up`
- `hero-chart-bar`, `hero-chart-bar-square`
- `hero-sparkles`, `hero-sparkles-solid`
- `hero-light-bulb`
- `hero-magnifying-glass`
- `hero-bell`
- `hero-cog-6-tooth`
- `hero-adjustments-horizontal`
- `hero-plus`
- `hero-bars-3`

---

**Recommendation:** Delete the `icons/` directory and use Hero Icons exclusively for all iconography in the dashboard.
