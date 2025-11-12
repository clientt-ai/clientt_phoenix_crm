# Figma Integration - 205 Forms Dashboard

This directory contains the complete design extraction and documentation for the "205 Forms Dashboard" from Figma.

**Extraction Date:** 2025-11-12
**Figma Frame:** 205 Forms Dashboard (Node ID: 98:975)
**Dimensions:** 1892 x 1587 px

## Directory Structure

```
figma_integration/
├── README.md                        # This file
├── 205_FORMS_DASHBOARD.md          # Complete design specification
├── SCREENSHOTS_NEEDED.md           # List of required screenshots
├── ICON_MAPPING.md                 # Icon hash-to-name mappings (NEW)
├── ICON_ORGANIZATION_SUMMARY.md    # Icon organization summary (NEW)
├── assets/                         # Exported SVG icons and images (hash names)
│   ├── *.svg                       # 30 Icon files
│   └── *.png                       # 2 Image files (logo, avatars)
└── components/                     # React/JSX component code
    ├── PageHeading.jsx             # Dashboard title section
    ├── KPICards.jsx                # 4 metric cards
    ├── Sidebar.jsx                 # Left navigation sidebar
    ├── Header.jsx                  # Top header with search
    ├── RecentFormsTable.jsx        # Forms table with sample data
    ├── AIFormsAssistant.jsx        # AI form generation card
    └── AIInsights.jsx              # AI recommendations section

clientt_crm_app/priv/static/images/ # Phoenix static assets (NEW)
├── clientt-logo.png                # Clientt brand logo
├── avatar-placeholder.png          # User avatar
└── icons/                          # 23 SVG icons with DaisyUI names
    ├── file-text.svg
    ├── send.svg
    ├── users.svg
    └── ... (20 more icons)
```

## Files Overview

### 📄 Documentation Files

#### `205_FORMS_DASHBOARD.md`
Complete design specification including:
- Layout structure diagram
- Component breakdown with node IDs
- All content and copy
- Design tokens (colors, typography, spacing)
- Status badge definitions
- Table data structure
- Implementation notes for Phoenix LiveView

#### `SCREENSHOTS_NEEDED.md`
Prioritized list of screenshots needed to complete the implementation:
- Full page overview
- Individual component screenshots
- Hover/active states
- Chart visualization (MCP had issues with this)

#### `HEROICON_MAPPING.md` ✨ RECOMMENDED
**Use this for implementation** - Maps dashboard design to Hero Icons:
- Complete icon mappings for all components
- KPI cards, navigation, actions, AI features
- Usage examples with proper sizes/variants
- Better than using Figma SVG exports

#### `FINAL_ASSETS_SUMMARY.md` ✨ READ THIS
Final decision on which assets to use:
- ✅ Hero Icons for all iconography (already installed)
- ✅ PNG images only for logo/avatar
- ❌ Don't copy Figma SVG exports
- Complete implementation guide

#### `ICON_MAPPING.md` (Deprecated)
Initial hash-to-name mappings for Figma exports.
**Don't use** - use `HEROICON_MAPPING.md` instead.

#### `ICON_ORGANIZATION_SUMMARY.md` (Deprecated)
Summary of icon copying task that was reversed.
**Don't use** - see `FINAL_ASSETS_SUMMARY.md` instead.

### 🎨 Assets Directory

Contains all exported design assets (with hash filenames):
- **Icons:** 30 SVG files for all UI icons (trend, users, target, search, etc.)
- **Images:** 2 PNG files (logo, avatar)
- **Total Files:** 32 files

**Note:** These assets have been organized and copied to the Phoenix static directory with meaningful names. See `ICON_MAPPING.md` and `ICON_ORGANIZATION_SUMMARY.md` for details.

### 💻 Components Directory

React/JSX components exported from Figma (with Tailwind CSS classes):

1. **PageHeading.jsx** - Dashboard title and subtitle
2. **KPICards.jsx** - 4 metric cards in grid layout
3. **Sidebar.jsx** - Navigation menu with logo and user profile
4. **Header.jsx** - Top bar with search and actions
5. **RecentFormsTable.jsx** - Forms table with sample data
6. **AIFormsAssistant.jsx** - AI-powered form generator
7. **AIInsights.jsx** - 3 insight cards with recommendations

## What Was Extracted

✅ **Complete Component Structure**
- All major sections and sub-components
- Node IDs preserved as data attributes
- Exact nesting and hierarchy

✅ **Styling Information**
- Tailwind CSS classes
- Color values (hex codes)
- Typography specifications
- Spacing and layout
- Border and shadow styles

✅ **Content & Copy**
- All text content
- Table data (6 sample rows)
- Badge labels and values
- Placeholder text

✅ **Assets**
- All SVG icons
- Logo and images
- File paths mapped correctly

## What Needs Screenshots

❌ **Chart Visualization** - MCP couldn't export the actual chart rendering
❌ **Hover States** - Interactive state styling
❌ **Exact Shadow Values** - Subtle shadows on active elements
❌ **Gradient Verification** - Blue-to-pink gradients on buttons/icons

See `SCREENSHOTS_NEEDED.md` for complete list with priorities.

## Design System Summary

### Colors
- **Primary Blue:** #2278c0
- **Primary Pink:** #f43098
- **Primary Teal:** #00d3bb
- **Primary Violet:** #7c3aed
- **Success Green:** #00c950 / #008236
- **Border Gray:** #eeeeee
- **Background Gray:** #f8f8f8

### Typography
- **Font Family:** Inter (Regular, Medium, Bold)
- **Sizes:** 12px, 14px, 16px, 38px
- **Line Heights:** 16px, 20px, 24px, 57px

### Spacing
- **Grid Gap:** 24px
- **Card Padding:** 24px
- **Border Radius:** 4px (small), 8px (medium), 16px (large)

## Component Mapping (Figma → Phoenix)

| Figma Component | Node ID | Phoenix Component | Status |
|-----------------|---------|-------------------|---------|
| Page Heading | 98:977 | `DashboardOverviewLive` | ⏳ Pending |
| KPI Cards | 98:982 | `KPICardsComponent` | ⏳ Pending |
| Sidebar | 98:1374 | `NavigationComponent` | ⏳ Pending |
| Header | 98:1432 | `HeaderComponent` | ⏳ Pending |
| Forms Table | 98:1064 | `FormsTableComponent` | ⏳ Pending |
| AI Assistant | 98:1218 | `AIAssistantComponent` | ⏳ Pending |
| Performance Chart | 98:1249 | `ChartComponent` | ⏳ Pending |
| AI Insights | 98:1321 | `InsightsComponent` | ⏳ Pending |

## Next Steps for Implementation

### Phase 1: Convert to Phoenix LiveView ⏳
- [ ] Set up LiveView module structure
- [ ] Convert React JSX to HEEx templates
- [ ] Create Phoenix components for reusable elements
- [ ] Map Tailwind classes to project's CSS system

### Phase 2: Implement Styling 📋
- [ ] Create custom CSS for exact design match
- [ ] Implement gradients (blue-to-pink)
- [ ] Add hover and active states
- [ ] Set up responsive breakpoints

### Phase 3: Add Interactivity 📋
- [ ] Table search and filtering
- [ ] Navigation state management
- [ ] AI form generation workflow
- [ ] Real-time KPI updates via PubSub

### Phase 4: Data Integration 📋
- [ ] Create Ash resources for Forms, Submissions
- [ ] Implement queries for KPI calculations
- [ ] Set up AI insights generation logic
- [ ] Add chart data fetching

### Phase 5: Chart Implementation 📋
- [ ] Choose charting library (Chart.js, ApexCharts, etc.)
- [ ] Implement area chart component
- [ ] Style to match Figma design
- [ ] Add interactive tooltips

## Usage Instructions

### For Developers

1. **Review the design:** Read `205_FORMS_DASHBOARD.md` for complete specs
2. **Check components:** Review React code in `components/` directory
3. **View assets:** All icons/images are in `assets/` directory
4. **Get screenshots:** Follow `SCREENSHOTS_NEEDED.md` to capture missing visuals

### Converting to Phoenix LiveView

```elixir
# Example component conversion

# Before (React/JSX)
<div className="bg-white border-[#eeeeee] rounded-[16px]">
  <p className="text-[14px] text-zinc-900">Total Forms</p>
</div>

# After (Phoenix HEEx)
<div class="bg-white border border-gray-200 rounded-2xl">
  <p class="text-sm text-zinc-900">Total Forms</p>
</div>
```

### Asset Usage

```elixir
# In Phoenix templates
<img src={~p"/images/icons/trend-up.svg"} alt="Trend up" />

# Copy assets to:
# priv/static/images/icons/
```

## Technical Notes

### Tailwind to Phoenix CSS

The exported React components use Tailwind CSS with exact pixel values (e.g., `w-[1522.67px]`). For Phoenix implementation:

1. **Convert to Tailwind utilities** where possible
2. **Use custom CSS** for exact Figma values
3. **Make responsive** with breakpoints (sm, md, lg, xl)

### Data Structures

Sample data exports are included in component files:
- `sampleTableData` in `RecentFormsTable.jsx`
- `sampleInsightsData` in `AIInsights.jsx`

Use these for initial LiveView assigns.

### Interactive Elements

Components requiring LiveView events:
- Search inputs → `phx-change`
- Table filters → `phx-click`
- Navigation items → `phx-click` + `active` class management
- AI generate button → `phx-click` → modal/form workflow

## Tools Used

- **Figma MCP Server:** For design context extraction
- **Figma Desktop App:** Source design file
- **Node IDs:** For targeting specific components
- **Asset Export:** Automatic SVG/PNG extraction

## Support & Questions

For questions about:
- **Design decisions:** Refer to `205_FORMS_DASHBOARD.md`
- **Missing screenshots:** See `SCREENSHOTS_NEEDED.md`
- **Implementation:** Check CLAUDE.md in project root
- **Phoenix patterns:** Use `/phoenix-guidelines` slash command

## Assets for Phoenix Implementation

### ✅ Icons: Use Hero Icons (Already Installed)

**Hero Icons v2.2.0** is already installed and configured in your project.
Use the `<.icon>` component from `core_components.ex` for all dashboard icons.

```heex
<!-- Use Hero Icons for all iconography -->
<.icon name="hero-home" class="size-5" />
<.icon name="hero-document-text" class="size-8 text-white" />
<.icon name="hero-sparkles-solid" class="size-6" />
```

**See:** `HEROICON_MAPPING.md` for complete icon mappings
**See:** `FINAL_ASSETS_SUMMARY.md` for usage examples

### ✅ Images: Phoenix Static Directory

Only PNG images (not available as Hero Icons) are copied:

```
clientt_crm_app/priv/static/images/
├── clientt-logo.png (24KB)        ✅ Sidebar brand logo
├── avatar-placeholder.png (5.3KB) ✅ User avatar
└── logo.svg (existing)            ✅ Pre-existing
```

```heex
<!-- In Phoenix LiveView templates -->
<img src={~p"/images/clientt-logo.png"} alt="Clientt" class="h-8" />
<img src={~p"/images/avatar-placeholder.png"} alt="User" class="size-10 rounded-full" />
```

### ❌ Figma SVG Exports: Reference Only

The 30 SVG icons in `figma_integration/assets/` are kept for reference only.
**Do NOT copy them** - use Hero Icons instead for better integration and performance.

## Change Log

### 2025-11-12 - Initial Extraction
- ✅ Extracted all major components
- ✅ Documented complete design specification
- ✅ Exported all assets (32 files)
- ✅ Created component code files
- ⏳ Awaiting screenshots for chart and hover states

### 2025-11-12 - Asset Organization & Hero Icons Decision
- ✅ Identified all 32 Figma-exported assets
- ✅ Discovered Hero Icons v2.2.0 already installed
- ✅ **DECISION:** Use Hero Icons instead of Figma SVG exports
- ✅ Copied 2 PNG images to `priv/static/images/` (logo, avatar)
- ✅ Created Hero Icons mapping documentation
- ✅ Deleted unnecessary SVG icon copies
- ✅ Ready for Phoenix LiveView implementation with Hero Icons

---

**Status:** Design extraction and asset organization complete
**Next Action:**
1. Convert React components to Phoenix LiveView
2. Provide screenshots as specified in SCREENSHOTS_NEEDED.md
