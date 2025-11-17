# Module Architecture Guide

## Overview

The Clientt platform is designed as a scalable multi-module SaaS application. This guide explains how to add new product modules without re-architecting the navigation system.

## Current Module Status

### Active Modules
- **Forms** (fully functional)
  - Forms Management
  - Calendar Integration
  - Chatbot
  - Analytics

### Planned Modules (Coming Soon)
- **CRM** - Customer Relationship Management
- **CPQ** - Configure, Price, Quote
- **Billing** - Invoicing & Subscriptions
- **Support** - Ticketing & Help Desk

## Adding a New Module

### Step 1: Update Sidebar Configuration (`/components/Sidebar.tsx`)

Locate the `moduleGroups` array and change the target module's `disabled` property from `true` to `false`, and remove the `badge`:

```typescript
// Before (disabled)
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  badge: 'Coming Soon',
  disabled: true,
  items: [
    { icon: Users, label: 'Contacts', disabled: true },
    { icon: FileText, label: 'Deals', disabled: true },
    { icon: BarChart3, label: 'Pipeline', disabled: true },
  ]
}

// After (enabled)
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  disabled: false,
  items: [
    { icon: Users, label: 'Contacts' },
    { icon: FileText, label: 'Deals' },
    { icon: BarChart3, label: 'Pipeline' },
  ]
}
```

Also add the module ID to the initial `expandedModules` state if you want it expanded by default:

```typescript
const [expandedModules, setExpandedModules] = useState<string[]>(['forms', 'crm']);
```

### Step 2: Create Page Components

Create page components in `/components/pages/` for each sub-page:

```
/components/pages/
  ├── ContactsPage.tsx
  ├── DealsPage.tsx
  └── PipelinePage.tsx
```

Example page component structure:

```typescript
type ContactsPageProps = {
  searchQuery?: string;
  onNavigate?: (page: string) => void;
};

export function ContactsPage({ searchQuery = '', onNavigate }: ContactsPageProps) {
  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-[38px] font-bold">
          Contacts
        </h1>
        <p className="text-muted-foreground">
          Manage your customer relationships
        </p>
      </div>
      
      {/* Your page content here */}
    </div>
  );
}
```

### Step 3: Import Pages in App.tsx

Add imports at the top of `/App.tsx`:

```typescript
import { ContactsPage } from './components/pages/ContactsPage';
import { DealsPage } from './components/pages/DealsPage';
import { PipelinePage } from './components/pages/PipelinePage';
```

### Step 4: Add Route Cases

In the `renderPage()` function in `/App.tsx`, add cases for each new page:

```typescript
switch (activePage) {
  case 'Dashboard':
    return <DashboardPage onCreateForm={handleCreateForm} onNavigate={setActivePage} searchQuery={globalSearchQuery} />;
  case 'Forms':
    return <FormsPage onCreateForm={handleCreateForm} searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
  // ... existing cases ...
  
  // New CRM pages
  case 'Contacts':
    return <ContactsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
  case 'Deals':
    return <DealsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
  case 'Pipeline':
    return <PipelinePage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
  
  default:
    return <DashboardPage onCreateForm={handleCreateForm} onNavigate={setActivePage} searchQuery={globalSearchQuery} />;
}
```

### Step 5: Add Global KPIs to Dashboard

Update `/components/pages/DashboardPage.tsx` to include KPIs for the new module:

```typescript
{/* CRM Module KPIs */}
<KPICard
  title="Total Contacts"
  value="2,847"
  change={15.3}
  icon={Users}
  colorClass="bg-[#2278c0]"
  onClick={() => onNavigate('Contacts')}
/>
<KPICard
  title="Active Deals"
  value="42"
  change={8.7}
  icon={FileText}
  colorClass="bg-[#f43098]"
  onClick={() => onNavigate('Deals')}
/>
```

## Module Structure Best Practices

### Navigation Hierarchy
```
Dashboard (Global Overview)
├── Module 1 (Collapsible)
│   ├── Sub-page A
│   ├── Sub-page B
│   └── Sub-page C
├── Module 2 (Collapsible)
│   ├── Sub-page A
│   └── Sub-page B
└── Settings (Always visible)
```

### Page Component Props

All page components should accept these standard props:

```typescript
type PageProps = {
  searchQuery?: string;          // For global search filtering
  onNavigate?: (page: string) => void;  // For internal navigation
  onAction?: () => void;          // For module-specific actions
};
```

### Styling Guidelines

- Use the `max-w-[1600px] mx-auto` container for consistent page width
- Follow the established color system:
  - Primary: `#2278c0` (Clientt blue)
  - Secondary: `#ec4899` (fuchsia/pink)
  - Success: `#00d3bb` (teal)
  - Purple: `#7C3AED`
- Use existing KPICard, table, and chart components for consistency
- Maintain responsive grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

### Icon Selection

Import icons from `lucide-react`:

```typescript
import { Users, FileText, BarChart3, TrendingUp } from 'lucide-react';
```

Common icons for modules:
- CRM: `Users`, `Building`, `Phone`
- CPQ: `FileCheck`, `DollarSign`, `ShoppingCart`
- Billing: `CreditCard`, `Receipt`, `Wallet`
- Support: `Headphones`, `MessageSquare`, `HelpCircle`

## Testing Checklist

When adding a new module, verify:

- [ ] Sidebar shows the module with correct icon and label
- [ ] Module can be expanded/collapsed
- [ ] All sub-pages are accessible from the sidebar
- [ ] Active state highlights the correct page
- [ ] Global search works on new pages
- [ ] Navigation between pages works correctly
- [ ] KPIs on Dashboard link to correct pages
- [ ] Responsive design works on mobile/tablet
- [ ] Dark mode styling is correct
- [ ] Page transitions are smooth

## Future Enhancements

### Planned Features
- Module-specific dashboards (e.g., "Forms Dashboard", "CRM Dashboard")
- Cross-module integrations (e.g., linking form submissions to CRM contacts)
- Module permissions and role-based access
- Module-level settings pages
- Custom KPI builder for dashboard

### Architecture Considerations
- Keep modules as independent as possible
- Use shared components for consistency
- Centralize navigation logic in App.tsx
- Consider state management solution (e.g., Context API, Zustand) for complex cross-module data

## Support

For questions or assistance with adding new modules, refer to:
- Component library: `/components/ui/` (shadcn components)
- Existing pages: `/components/pages/` (reference implementations)
- Main app logic: `/App.tsx` (routing and state management)
