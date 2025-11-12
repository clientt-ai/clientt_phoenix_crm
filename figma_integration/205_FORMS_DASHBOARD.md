# 205 Forms Dashboard - Design Specification

**Extracted from Figma:** 2025-11-12
**Frame ID:** 98:975
**Dimensions:** 1892 x 1587 px

## Overview

The 205 Forms Dashboard is a comprehensive forms management interface that displays KPIs, recent forms, AI-powered features, and performance analytics. The design uses a sidebar navigation layout with a main content area.

## Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  Header (Search + User Actions)                            │
├──────────┬─────────────────────────────────────────────────┤
│          │  Dashboard Overview                              │
│ Sidebar  │  ├─ Page Heading                                │
│          │  ├─ 4 KPI Cards (Grid Layout)                   │
│  - Logo  │  ├─ Recent Forms Table                          │
│  - Nav   │  ├─ AI Assistant + Performance Chart (2 cols)   │
│  - User  │  └─ AI Insights & Recommendations               │
│          │                                                   │
└──────────┴─────────────────────────────────────────────────┘
```

## Components Breakdown

### 1. **Page Header** (Node: 98:1432)
- **Width:** 1636px
- **Height:** 63.33px
- **Components:**
  - Menu toggle button
  - Global search bar: "Search forms, pages, analytics..."
  - Help icon button
  - Notifications bell (with badge indicator)
  - User avatar

### 2. **Sidebar Navigation** (Node: 98:1374)
- **Width:** 256px
- **Height:** 866.67px
- **Background:** White with right border (#eeeeee)

#### Components:
- **Logo Section** (Top)
  - Clientt logo image
  - Height: 80.67px

- **Navigation Menu** (Middle)
  - Dashboard (Active - Blue background with shadow)
  - Forms
  - Landing Pages
  - Analytics
  - Settings

- **User Profile** (Bottom)
  - Avatar with gradient (Blue to Pink)
  - Name: "John Doe"
  - Plan: "Pro Plan"
  - Background: #f8f8f8

### 3. **Page Heading** (Node: 98:977)
- **Title:** "Dashboard Overview"
  - Font: Inter Bold, 38px
  - Color: #18181b (zinc-900)
- **Subtitle:** "Welcome back! Here's what's happening with your forms and landing pages."
  - Font: Inter Regular, 16px

### 4. **KPI Cards Section** (Node: 98:982)
- **Layout:** 4-column grid
- **Gap:** 24px
- **Card Height:** 129.33px

#### Card 1: Total Forms
- **Value:** 156
- **Change:** +12% (Green)
- **Period:** vs last month
- **Icon Color:** #2278c0 (Blue)
- **Icon:** File/Document icon

#### Card 2: Total Submissions
- **Value:** 3,428
- **Change:** +18.5% (Green)
- **Period:** vs last month
- **Icon Color:** #f43098 (Pink)
- **Icon:** Bar chart icon

#### Card 3: Active Users
- **Value:** 1,892
- **Change:** +8.2% (Green)
- **Period:** vs last month
- **Icon Color:** #00d3bb (Teal)
- **Icon:** Users icon

#### Card 4: Conversion Rate
- **Value:** 68.4%
- **Change:** +5.3% (Green)
- **Period:** vs last month
- **Icon Color:** #7c3aed (Violet)
- **Icon:** Target/Percentage icon

### 5. **Recent Forms & Landing Pages Table** (Node: 98:1064)
- **Width:** 1572px
- **Height:** 414.33px

#### Header Section:
- **Title:** "Recent Forms & Landing Pages"
- **Subtitle:** "Manage and track your forms and pages"
- **Actions:**
  - "Create New" button (Primary blue)
  - Search input: "Search..."
  - Filter/More options button

#### Table Columns:
1. **Name** (464.47px)
2. **Type** (241.34px) - Badge: "Form" or "Landing Page"
3. **Submissions** (218.5px)
4. **Status** (164.66px) - Badge: Active/Draft/Paused
5. **Date Created** (227.43px)
6. **Last Edited** (204.94px)

#### Table Data (6 rows):
1. Customer Feedback Survey | Form | 247 | Active | Oct 15, 2025 | 2 hours ago
2. Product Launch Landing Page | Landing Page | 1,432 | Active | Oct 10, 2025 | 5 hours ago
3. Newsletter Signup | Form | 892 | Active | Oct 8, 2025 | 1 day ago
4. Event Registration | Form | 156 | Draft | Oct 5, 2025 | 2 days ago
5. Contact Us | Form | 523 | Active | Sep 28, 2025 | 3 days ago
6. Demo Request Page | Landing Page | 78 | Paused | Sep 20, 2025 | 5 days ago

#### Status Badge Colors:
- **Active:** Green background (#dcfce7), Green text (#008236)
- **Draft:** Gray background (#f8f8f8), Gray text (#18181b)
- **Paused:** Orange background (#ffedd4), Orange text (#ca3500)

#### Type Badge Colors:
- **Form:** Blue border (rgba(34,120,192,0.3)), Blue text (#2278c0)
- **Landing Page:** Pink border (rgba(244,48,152,0.3)), Pink text (#f43098)

### 6. **Two-Column Section** (Node: 98:1217)
- **Width:** 1572px
- **Height:** 374px
- **Gap:** 24px

#### Left Column: AI Forms Assistant (Node: 98:1218)
- **Width:** 508px
- **Border:** rgba(34,120,192,0.2)
- **Border Radius:** 16px

**Components:**
- **Header:**
  - Gradient icon (Blue to Pink)
  - Title: "AI Forms Assistant"
  - Subtitle: "Generate a new form using AI"

- **Input Field:**
  - Placeholder: "e.g., Create a customer feedback form..."
  - Background: #f8f8f8

- **CTA Button:**
  - "Create with AI"
  - Gradient background (Blue to Pink)
  - Sparkle icon

- **Smart Suggestions:**
  - "📋 Event Registration Form"
  - "💼 Job Application Form"

#### Right Column: Performance Chart (Node: 98:1249)
- **Width:** 1040px
- **Title:** "Form Submissions This Week"
- **Subtitle:** "Daily breakdown of form responses"
- **Chart Type:** Area chart with gradient
- **X-Axis:** Mon, Tue, Wed, Thu, Fri, Sat, Sun
- **Y-Axis:** 0, 20, 40, 60, 80
- **Note:** Chart visualization requires actual chart library implementation

### 7. **AI Insights & Recommendations** (Node: 98:1321)
- **Width:** 1572px
- **Height:** 372px

#### Header:
- Blue icon with gradient
- Title: "AI Insights & Recommendations"

#### Insight Cards (3 cards):

**Card 1: Top Performing Form**
- **Icon:** Blue circular background (#dbeafe)
- **Badge:** 847 submissions, +4.3%
- **Message:** "Product Inquiry Form is your highest converter with 847 submissions this month"

**Card 2: Optimization Suggestion**
- **Icon:** Pink circular background (#fce7f3)
- **Message:** "Consider adding a progress indicator to your Contact Form - multi-step forms show 31% higher completion rates"

**Card 3: Engagement Trend**
- **Icon:** Teal circular background (#cbfbf1)
- **Message:** "Mobile submissions increased by 42% this week. Your forms are mobile-optimized and performing well"

## Design Tokens

### Colors
```css
/* Primary Colors */
--blue-primary: #2278c0;
--pink-primary: #f43098;
--teal-primary: #00d3bb;
--violet-primary: #7c3aed;

/* Status Colors */
--success-bg: #dcfce7;
--success-text: #008236;
--success-accent: #00c950;
--warning-bg: #ffedd4;
--warning-text: #ca3500;

/* Neutral Colors */
--gray-50: #f8f8f8;
--gray-200: #eeeeee;
--gray-900: #18181b;
--white: #ffffff;

/* Gradients */
--gradient-primary: linear-gradient(to bottom, #2278c0, #f43098);
--gradient-ai: linear-gradient(to bottom, #2278c0, #ec4899);
```

### Typography
```css
/* Font Family */
--font-primary: 'Inter', sans-serif;

/* Font Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-xl: 38px;

/* Font Weights */
--font-regular: 400;
--font-medium: 500;
--font-bold: 700;

/* Line Heights */
--leading-tight: 16px;
--leading-normal: 20px;
--leading-relaxed: 24px;
--leading-loose: 57px;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 40px;
--spacing-3xl: 48px;
```

### Borders
```css
--border-width: 0.667px;
--border-color: #eeeeee;
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 16px;
--border-radius-full: 999px;
```

## Asset Files

All SVG icons and images have been exported to:
`/Users/jeffreyleng/Clientt/ClienttPhoenixCRM/clientt_phoenix_crm_01/figma_integration/assets/`

### Icon List:
- Trend up icon (green)
- File/Document icon
- Bar chart icon
- Users icon
- Target/Percentage icon
- Plus icon
- Search icon
- Filter/More icon
- AI Sparkle icon
- Lightbulb icon
- Target with arrow icon
- Trending up icon

### Images:
- Clientt logo
- User avatar placeholder

## Implementation Notes

### For Phoenix LiveView:
1. Convert React components to Phoenix LiveView components (.heex files)
2. Replace Tailwind classes with custom CSS or adapt to project's styling system
3. Implement real-time updates using Phoenix PubSub for:
   - KPI metrics
   - Recent forms table
   - Chart data
4. Add LiveView event handlers for:
   - Table search/filter
   - Create New button
   - AI form generation
   - Navigation items

### Data Requirements:
- Forms data (name, type, submissions count, status, dates)
- KPI metrics (totals, changes, percentages)
- Chart data (daily/weekly submission counts)
- AI insights (dynamic recommendations based on form performance)

### Interactive Elements:
- Search functionality (debounced)
- Table sorting/filtering
- Status badge interactions
- Navigation state management
- AI form generation modal/workflow
- Chart tooltips on hover

## Screenshots Needed

To complete the implementation, please provide screenshots for:

1. **Full Page Overview** - Complete dashboard view
2. **KPI Cards Section** - Close-up of the 4 metric cards
3. **Recent Forms Table** - Table with all rows visible
4. **AI Forms Assistant Card** - Left column component
5. **Performance Chart** - Right column with chart visualization
6. **AI Insights Section** - All 3 insight cards
7. **Sidebar Navigation** - Full sidebar with active state
8. **Header Section** - Top bar with search and user actions

These screenshots will help with:
- Verifying exact spacing and alignment
- Confirming hover/active states
- Ensuring color accuracy
- Validating responsive behavior
- Understanding chart visualization style
