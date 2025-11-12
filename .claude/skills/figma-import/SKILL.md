---
name: figma-import
description: Import and update Figma designs with intelligent icon mapping to Hero Icons, DaisyUI component matching, and organized frame structure
---

# Figma Import & Update Skill

Import and update Figma designs into the `figma_integration` folder with intelligent icon mapping, DaisyUI component matching, and organized frame structure.

## Overview

This skill helps you:
1. Extract design data from Figma
2. Map Figma icons to Hero Icons (already installed)
3. Match UI elements to DaisyUI components
4. Create shared/reusable components
5. Organize frames with HTML representations and documentation

## Prerequisites

- Figma Desktop app running with MCP server configured
- Access to the Figma file you want to import
- Target node ID or URL from Figma

## Folder Structure Created

```
figma_integration/
├── components/              # Shared/reusable components
│   ├── Button.jsx
│   ├── Card.jsx
│   └── ...
├── frames/                  # Individual frames from Figma
│   ├── [frame-name]/
│   │   ├── index.html      # HTML representation
│   │   ├── description.md  # Frame documentation
│   │   └── metadata.json   # Frame metadata
│   └── ...
├── ICON_MAPPING.md         # Hero Icons mapping reference
├── COMPONENT_MAPPING.md    # DaisyUI component mapping
└── README.md               # Integration overview
```

## Step-by-Step Process

### Step 1: Get Figma Design Context

First, extract the design from Figma using the Figma MCP tools.

**Ask the user:**
- "What is the Figma node ID or URL you want to import?"
- "Is this a new import or updating an existing integration?"

**Then use:**
```
mcp__figma-desktop__get_design_context with the node ID
```

This will return:
- HTML/CSS code representation
- Design tokens (colors, spacing, typography)
- Component hierarchy
- Asset references

### Step 2: Extract Metadata

Get additional context:
```
mcp__figma-desktop__get_metadata for structural overview
mcp__figma-desktop__get_variable_defs for design tokens
mcp__figma-desktop__get_screenshot for visual reference
```

### Step 3: Icon Mapping Analysis

**Analyze the design for icons:**

1. Look for SVG elements or icon references in the extracted code
2. For each icon found:
   - Identify its semantic meaning (e.g., "search", "home", "settings")
   - Search Hero Icons documentation for equivalent
   - Map the Figma icon to Hero Icon name

**Hero Icons Reference:**
- Browse available icons: https://heroicons.com
- Common mappings:
  - Search/magnifying glass → `hero-magnifying-glass`
  - Home → `hero-home` (outline) or `hero-home-solid`
  - Settings/cog → `hero-cog-6-tooth`
  - User → `hero-user` or `hero-user-circle`
  - Menu bars → `hero-bars-3`
  - Close/X → `hero-x-mark`
  - Plus/add → `hero-plus`
  - Arrow trending → `hero-arrow-trending-up`
  - Document → `hero-document-text`
  - Bell → `hero-bell`
  - Chart → `hero-chart-bar`
  - Sparkles/AI → `hero-sparkles` or `hero-sparkles-solid`

**Create/Update ICON_MAPPING.md:**
Document all icon mappings found with:
- Original Figma icon name/description
- Mapped Hero Icon name
- Usage context
- Size and variant recommendations

### Step 4: DaisyUI Component Mapping

**Analyze UI elements and map to DaisyUI:**

DaisyUI components to look for:
- **Buttons**: `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-square`
- **Cards**: `.card`, `.card-body`, `.card-title`
- **Badges**: `.badge`, `.badge-primary`
- **Inputs**: `.input`, `.input-bordered`
- **Alerts**: `.alert`, `.alert-info`, `.alert-success`
- **Stats**: `.stat`, `.stats`
- **Tables**: `.table`, `.table-zebra`
- **Tabs**: `.tabs`, `.tab`
- **Modals**: `.modal`
- **Navbars**: `.navbar`
- **Drawers**: `.drawer`
- **Dropdowns**: `.dropdown`

**Mapping Strategy:**
1. Identify common UI patterns in Figma design
2. Find equivalent DaisyUI component
3. Map Figma styles to DaisyUI utility classes
4. Note any custom styles that extend DaisyUI

**Create/Update COMPONENT_MAPPING.md:**
```markdown
# DaisyUI Component Mapping

## Buttons

| Figma Component | DaisyUI Class | Notes |
|----------------|---------------|-------|
| Primary Button | `btn btn-primary` | Blue gradient in Figma → use primary |
| Secondary Button | `btn btn-ghost` | Transparent background |
| Icon Button | `btn btn-square btn-ghost` | Square shape, no text |

## Cards
...
```

### Step 5: Identify Shared Components

**Extract reusable components:**

Look for patterns that appear multiple times:
- Navigation items
- Cards with similar structure
- Buttons with consistent styling
- Form inputs
- List items
- Headers/footers

**For each shared component:**
1. Create a file in `figma_integration/components/`
2. Name it semantically (e.g., `NavItem.jsx`, `KPICard.jsx`)
3. Include:
   - Component code (React/JSX as reference)
   - Props interface/documentation
   - Hero Icon references (not hardcoded paths)
   - DaisyUI class mappings
   - Usage examples

**Example structure:**
```jsx
// components/KPICard.jsx
// Description: Metric card with icon, value, and trend indicator
// DaisyUI: card, stat
// Icons: Hero Icons (configurable)

export default function KPICard({ icon, title, value, trend, trendValue }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-base-content/60">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {/* Use: <.icon name="hero-arrow-trending-up-mini" class="size-4 text-success" /> */}
                <span className="text-sm text-success">{trendValue}</span>
              </div>
            )}
          </div>
          <div className="bg-primary rounded-2xl size-16 flex items-center justify-center">
            {/* Use: <.icon name={icon} class="size-8 text-white" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Create Frame Structure

For each frame/screen in the Figma design:

**Create folder:** `figma_integration/frames/[frame-name]/`

**1. index.html**
Generate an HTML file with:
- Complete HTML structure of the frame
- Tailwind CSS classes (DaisyUI compatible)
- Hero Icon placeholders with comments
- Semantic HTML structure
- Responsive classes where applicable

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Frame Name]</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Frame content here -->
  <!-- Use HTML comments to indicate where Phoenix LiveView components should go -->
  <!-- Icon: hero-home-solid, size-5 -->

</body>
</html>
```

**2. description.md**
Create documentation with:
- Frame purpose/context
- Key features/interactions
- Components used
- Icon mappings specific to this frame
- DaisyUI components used
- Notes for Phoenix LiveView conversion

```markdown
# [Frame Name]

## Purpose
Brief description of what this screen/frame does.

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Components Used
- KPICard (x4) - Dashboard metrics
- RecentFormsTable - Data table
- NavItem (x5) - Sidebar navigation

## Icon Mappings
| Element | Hero Icon | Size | Variant |
|---------|-----------|------|---------|
| Dashboard Nav | hero-home-solid | size-5 | solid |
| Search Input | hero-magnifying-glass | size-4 | outline |

## DaisyUI Components
- `.card` - Metric cards
- `.table` - Recent forms table
- `.btn` - Action buttons
- `.input` - Search input

## Phoenix LiveView Notes
- Use Phoenix.Component for KPI cards
- Table should use LiveView streams for real-time updates
- Navigation should use Phoenix.LiveView.Router live_session
```

**3. metadata.json**
Store structured data:
```json
{
  "frame_name": "Dashboard",
  "node_id": "98:1234",
  "figma_url": "https://figma.com/file/...",
  "dimensions": {
    "width": 1920,
    "height": 1080
  },
  "components": [
    "Header",
    "Sidebar",
    "KPICards",
    "RecentFormsTable",
    "AIInsights"
  ],
  "icons": [
    "hero-home-solid",
    "hero-document",
    "hero-magnifying-glass"
  ],
  "daisy_components": [
    "card",
    "table",
    "btn",
    "input"
  ],
  "extracted_date": "2025-11-12",
  "last_updated": "2025-11-12"
}
```

### Step 7: Create/Update Documentation

**ICON_MAPPING.md** - Complete icon reference
- All icons used across all frames
- Categorized by usage (navigation, actions, metrics, etc.)
- Include size and variant recommendations
- Phoenix LiveView usage examples

**COMPONENT_MAPPING.md** - DaisyUI mapping guide
- All UI patterns mapped to DaisyUI
- Custom styling notes
- Color scheme mapping
- Typography scale mapping

**README.md** - Integration overview
- Project structure
- How to use the reference files
- Icon mapping summary
- Component mapping summary
- Next steps for Phoenix LiveView implementation

### Step 8: Asset Handling

**For image assets (PNG, JPG):**
1. Identify which images are essential (logos, photos, illustrations)
2. Ask user if assets should be exported
3. If yes, use `dirForAssetWrites` parameter in get_design_context
4. Copy exported assets to `clientt_crm_app/priv/static/images/`
5. Update references to use Phoenix paths: `~p"/images/filename.png"`

**For icon assets (SVG):**
1. DO NOT export SVG icons
2. Always map to Hero Icons instead
3. Document the mapping in ICON_MAPPING.md

## Workflow Example

```
1. User provides Figma URL: https://figma.com/design/abc123?node-id=98-1432

2. Extract node ID: 98:1432

3. Call Figma tools:
   - get_design_context(nodeId: "98:1432")
   - get_metadata(nodeId: "98:1432")
   - get_screenshot(nodeId: "98:1432")

4. Analyze response:
   - Find 5 navigation icons → Map to Hero Icons
   - Find card components → Map to DaisyUI .card
   - Find table → Map to DaisyUI .table
   - Identify 3 shared components

5. Create structure:
   - components/NavItem.jsx
   - components/KPICard.jsx
   - components/DataTable.jsx
   - frames/dashboard/index.html
   - frames/dashboard/description.md
   - frames/dashboard/metadata.json

6. Generate documentation:
   - Update ICON_MAPPING.md with 15 icons
   - Update COMPONENT_MAPPING.md with 8 UI patterns
   - Update README.md with summary
```

## Best Practices

### Icon Mapping
- Always prefer Hero Icons over exported SVGs
- Use solid variant for active/emphasized states
- Use outline variant for default states
- Use mini variant (20x20) for inline/tight spaces
- Document size classes: `size-4`, `size-5`, `size-6`, `size-8`

### Component Extraction
- Extract components that appear 2+ times
- Create semantic names (not "Component1", "Component2")
- Include DaisyUI class mappings in comments
- Add usage examples in component files

### DaisyUI Mapping
- Start with base DaisyUI components
- Document custom styling separately
- Use DaisyUI color variables when possible
- Preserve responsive design with Tailwind classes

### Frame Organization
- One folder per distinct screen/frame
- Use kebab-case for folder names
- Include all three files: HTML, markdown, JSON
- Keep HTML as static reference (no JavaScript)

### Documentation
- Be specific with icon names (include variant)
- Include both Figma and Phoenix examples
- Document edge cases and custom styling
- Keep mappings up to date

## Checklist

When importing a new Figma design:

- [ ] Extract design context from Figma
- [ ] Get metadata and screenshots
- [ ] Identify all icons and map to Hero Icons
- [ ] Identify UI patterns and map to DaisyUI
- [ ] Extract shared components (2+ occurrences)
- [ ] Create component files with documentation
- [ ] Create frame folders with HTML
- [ ] Write frame description.md files
- [ ] Generate metadata.json files
- [ ] Update ICON_MAPPING.md
- [ ] Update COMPONENT_MAPPING.md
- [ ] Update README.md
- [ ] Handle image assets (if any)
- [ ] Verify no hardcoded asset paths remain
- [ ] Test HTML renders correctly with DaisyUI

## Common Issues & Solutions

**Issue:** Icons not matching Hero Icons exactly
**Solution:** Find closest semantic match, document differences in ICON_MAPPING.md

**Issue:** Custom UI elements don't match DaisyUI
**Solution:** Use base DaisyUI component + custom Tailwind classes, document in COMPONENT_MAPPING.md

**Issue:** Complex nested components
**Solution:** Break into smaller shared components, create composition examples

**Issue:** Frame too large/complex
**Solution:** Split into logical sections, create sub-components first

**Issue:** Responsive design unclear
**Solution:** Use Figma metadata to infer breakpoints, apply Tailwind responsive classes

## Output Format

After completing import, provide user with:

1. **Summary** of what was imported
2. **Component count** (shared components created)
3. **Frame count** (frames processed)
4. **Icon mapping count** (icons mapped to Hero Icons)
5. **DaisyUI component count** (UI patterns mapped)
6. **Next steps** for Phoenix LiveView implementation

## Integration with Phoenix LiveView

The generated files serve as **reference** for implementing in Phoenix:

- Use HTML files to understand structure
- Use component files to create Phoenix Components (`.ex`)
- Use icon mappings with `<.icon>` component from core_components
- Use DaisyUI classes directly in HEEx templates
- Use metadata.json for data structure planning

**Example conversion:**
```heex
<!-- From: figma_integration/frames/dashboard/index.html -->
<!-- To: lib/clientt_crm_app_web/live/dashboard_live.html.heex -->

<div class="card bg-base-100 shadow-sm">
  <div class="card-body">
    <div class="flex items-center gap-3">
      <.icon name="hero-home-solid" class="size-5 text-primary" />
      <span class="font-medium">Dashboard</span>
    </div>
  </div>
</div>
```

## Skill Completion

This skill is complete when:
1. All frames have organized folders with HTML/docs
2. Shared components are extracted and documented
3. All icons are mapped to Hero Icons (no SVG exports)
4. All UI patterns are mapped to DaisyUI
5. Documentation is complete and accurate
6. User understands next steps for LiveView implementation
