# Icon Mapping - Figma Assets to Phoenix Icons

This document maps the Figma-extracted icon files (with hash names) to meaningful DaisyUI-style icon names for use in the Phoenix application.

## Icon Naming Convention

Following DaisyUI/Heroicons style naming:
- Descriptive, lowercase with hyphens
- Include size suffix when relevant (-sm, -md, -lg)
- Indicate color variant in filename only when necessary

## Icon Mappings

### KPI Card Icons (32x32, colored backgrounds)

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `cbba59a804fde32418282254241b365c332bb215.svg` | `file-text.svg` | Document/File icon | Total Forms KPI card | White on Blue (#2278c0) |
| `426fbb50892e3affb7e1c522393d0dc0cade340d.svg` | `send.svg` | Paper plane/Send icon | Total Submissions KPI | White on Pink (#f43098) |
| `0de8adfa7f888e8da64a7e61e4ac0d219926fc61.svg` | `users.svg` | Multiple users icon | Active Users KPI | White on Teal (#00d3bb) |
| `879760990f2c3153a132d0c946530cbe2e8f05fc.svg` | `trending-up.svg` | Chart trending up | Conversion Rate KPI | White on Violet (#7c3aed) |

### Trend Indicator Icons (16x16, green)

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `ba72ddbd8a78c4ab86d66ba97c1c0db5670bbf7e.svg` | `trending-up-sm.svg` | Small trending up arrow | Percentage changes in KPI cards | Green (#00c950) |

### Navigation Icons (20x16, white or colored)

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `9588dc5cd9aad4c8cb10fef4b7beaf241c94369b.svg` | `home.svg` | Dashboard/Home icon | Sidebar - Dashboard (active) | White |
| `d70111162e3508fbf7b3b28e5ce113f5bf874721.svg` | `file.svg` | File icon | Sidebar - Forms | Gray/Dark |
| `d08376e9abe4d1427b987d6ccca66a41cde159ca.svg` | `document-duplicate.svg` | Multiple documents | Sidebar - Landing Pages | Gray/Dark |
| `8fbaa558594128e89bf0780e028446ac8f263464.svg` | `chart-bar.svg` | Bar chart icon | Sidebar - Analytics | Gray/Dark |
| `97ff5a04e7d09a13d0137126d81f570e0855ee0b.svg` | `cog.svg` | Settings gear icon | Sidebar - Settings | Gray/Dark |

### Action Icons (16x16, various)

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `93c06b38e06c671f3a179226edd28c7f6534580b.svg` | `search.svg` | Magnifying glass | Header search, Table search | Dark gray (#18181B) |
| `d040ada84eeffcfddfc4dbf9e3c372b8e94827fd.svg` | `search-gray.svg` | Magnifying glass (duplicate) | Search inputs | Gray |
| `72cf818273b8466c6234158339dd156c59835a4b.svg` | `plus.svg` | Plus sign | "Create New" button | White |
| `49f1f46b8ac63cae497c3255fe79068c3b25996c.svg` | `adjustments.svg` | Filter/sliders icon | Table filter button | Gray/Dark |
| `9ec23305b37020c85805e2927f1b0e6615fa9758.svg` | `question-mark-circle.svg` | Help/Question mark | Header help button | Gray |
| `ac8bcbd52aabdf93837c02b4b160a577186951f6.svg` | `bell.svg` | Notification bell | Header notifications | Gray/Dark |

### AI/Special Feature Icons

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `2582da45011e75fddbe908c9e6f24fc71973ba86.svg` | `sparkles.svg` | AI sparkles icon | AI Forms Assistant header | White on gradient |
| `172ecca5042f6b91cf0c17a6386fd2de79d605fa.svg` | `sparkles-fill.svg` | Filled sparkles | "Create with AI" button | White |
| `cd7e05f76b1759196424510cd54bbd87b5be1985.svg` | `light-bulb.svg` | Light bulb icon | AI Insights section header | White on blue |
| `1538a333f51d798bbae0fd0bb992f5ae35eb45ac.svg` | `target.svg` | Target/bullseye icon | Top Performing Form insight | White/Blue |
| `a1a51dda24d4c4e6753dff254077c176527d3503.svg` | `light-bulb-outline.svg` | Light bulb outline | Optimization insight | White/Pink |
| `8f7179af9a296ab2b5ce2b53ba142e665ba4c0db.svg` | `trending-up-circle.svg` | Trending up in circle | Engagement Trend insight | White/Teal |

### Menu/System Icons

| Figma Hash | New Name | Description | Usage | Color |
|------------|----------|-------------|-------|-------|
| `e57bb22a8d561f0dd92d6696e106f1fdd7bd21f7.svg` | `menu-bars.svg` | Hamburger menu | Header menu toggle | Gray/Dark |

### Images (Not Icons)

| Figma Hash | New Name | Description | Usage | Type |
|------------|----------|-------------|-------|------|
| `b693f77e83051db5862967ace25f26d9b9c27404.png` | `clientt-logo.png` | Clientt brand logo | Sidebar header | PNG |
| `0d5da6ab018faf09b0940ac3e0ab4d6d514c431f.png` | `avatar-placeholder.png` | User avatar | Header user menu | PNG |

## Unused/Unknown Icons

These icons were exported but may not be actively used in the current dashboard design:

| Figma Hash | Possible Name | Notes |
|------------|---------------|-------|
| `30725fb4af3ccb91d10ead3c189f2dd1c6dda8af.svg` | `icon-unknown-1.svg` | Small geometric shape |
| `90d9aea6d1c5230100033611b27b292e2e3fe633.svg` | `icon-unknown-2.svg` | Small geometric shape |
| `9eec0d2718c8562c261b9025e2b5958e461641d9.svg` | `icon-unknown-3.svg` | Small geometric shape |
| `b0c00915d7557bf99ae04d7ef2e97d5c7b94cc9a.svg` | `icon-unknown-4.svg` | Small geometric shape |
| `913c8656ac71bb487fc2b738192be34e2a46c02b.svg` | `icon-unknown-5.svg` | Medium icon |
| `a46d5333547a96ee39e91db721789481bb0efd1e.svg` | `icon-unknown-6.svg` | Medium icon |
| `dec8ab7c70c4cf631ab47c7e95ce00c0853d4c8b.svg` | `icon-unknown-7.svg` | Small icon |

## Directory Structure

After copying and renaming:

```
clientt_crm_app/priv/static/images/
├── clientt-logo.png
├── avatar-placeholder.png
└── icons/
    ├── file-text.svg
    ├── send.svg
    ├── users.svg
    ├── trending-up.svg
    ├── trending-up-sm.svg
    ├── home.svg
    ├── file.svg
    ├── document-duplicate.svg
    ├── chart-bar.svg
    ├── cog.svg
    ├── search.svg
    ├── plus.svg
    ├── adjustments.svg
    ├── question-mark-circle.svg
    ├── bell.svg
    ├── sparkles.svg
    ├── sparkles-fill.svg
    ├── light-bulb.svg
    ├── target.svg
    ├── light-bulb-outline.svg
    ├── trending-up-circle.svg
    └── menu-bars.svg
```

## Usage in Phoenix Templates

### Using Icons in HEEx Templates

```heex
<!-- KPI Card Icon -->
<img src={~p"/images/icons/file-text.svg"} alt="Forms" class="w-8 h-8" />

<!-- Navigation Icon -->
<img src={~p"/images/icons/home.svg"} alt="Dashboard" class="w-5 h-5" />

<!-- Trend Indicator -->
<img src={~p"/images/icons/trending-up-sm.svg"} alt="Increase" class="w-4 h-4" />

<!-- Logo -->
<img src={~p"/images/clientt-logo.png"} alt="Clientt" class="h-8" />
```

### CSS Color Overrides

Many icons use `var(--stroke-0, defaultColor)` which can be overridden with CSS:

```css
.icon-blue {
  --stroke-0: #2278c0;
}

.icon-green {
  --stroke-0: #00c950;
}

.icon-white {
  --stroke-0: #ffffff;
}
```

## DaisyUI Integration

These icons follow similar naming conventions to DaisyUI/Heroicons and can be used with DaisyUI components:

```html
<button class="btn btn-primary gap-2">
  <img src="/images/icons/plus.svg" alt="" class="w-4 h-4" />
  Create New
</button>
```

## Icon Sizes Reference

| Size Class | Pixels | Usage |
|------------|--------|-------|
| `w-4 h-4` | 16x16 | Small icons (trends, inline) |
| `w-5 h-5` | 20x20 | Navigation icons |
| `w-6 h-6` | 24x24 | AI insight icons |
| `w-8 h-8` | 32x32 | KPI card icons |

## Next Steps

1. ✅ Icons directory created at `priv/static/images/icons/`
2. 🔄 Copy and rename icons with meaningful names
3. ⏳ Update component files to reference new icon paths
4. ⏳ Test icon display in Phoenix templates
5. ⏳ Add CSS variables for dynamic color theming

## Notes

- All SVG icons use `var(--stroke-0, fallbackColor)` for stroke colors
- Icons are scalable and can be sized with CSS
- Some icons have duplicate versions (different colors)
- Unknown icons kept for future reference but not actively used
- PNG files (logo, avatar) should be in parent images/ directory

---

**Last Updated:** 2025-11-12
**Status:** Mapping complete, ready for icon copy/rename
