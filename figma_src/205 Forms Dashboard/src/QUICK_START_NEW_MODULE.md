# Quick Start: Adding a New Module

This is a step-by-step checklist for engineers to quickly add a new product module to the Clientt platform.

## Example: Activating the CRM Module

### 1. Enable Module in Sidebar (5 minutes)

**File:** `/components/Sidebar.tsx`

Find the CRM module in the `moduleGroups` array and update:

```typescript
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  // Remove these two lines:
  // badge: 'Coming Soon',
  // disabled: true,
  items: [
    // Remove disabled: true from each item:
    { icon: Users, label: 'Contacts' },
    { icon: FileText, label: 'Deals' },
    { icon: BarChart3, label: 'Pipeline' },
  ]
}
```

**Optional:** Add 'crm' to expanded modules by default:
```typescript
const [expandedModules, setExpandedModules] = useState<string[]>(['forms', 'crm']);
```

---

### 2. Create Page Components (15-30 minutes)

**Files:** `/components/pages/ContactsPage.tsx`, `/components/pages/DealsPage.tsx`, `/components/pages/PipelinePage.tsx`

Copy this template for each page:

```typescript
type ContactsPageProps = {
  searchQuery?: string;
  onNavigate?: (page: string) => void;
};

export function ContactsPage({ searchQuery = '', onNavigate }: ContactsPageProps) {
  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-[38px] font-bold">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your customer relationships and contact database
        </p>
      </div>

      {/* Page Content */}
      <div className="bg-card rounded-lg border border-border p-6">
        <p>Your CRM contacts content goes here</p>
      </div>
    </div>
  );
}
```

**Pro Tips:**
- Use existing components from `/components/` for consistency
- Follow the color scheme: `#2278c0` (blue), `#ec4899` (pink), `#00d3bb` (teal)
- Make it responsive with Tailwind grid classes
- Add search filtering using the `searchQuery` prop

---

### 3. Add Routing (5 minutes)

**File:** `/App.tsx`

**a) Import your pages at the top:**
```typescript
import { ContactsPage } from './components/pages/ContactsPage';
import { DealsPage } from './components/pages/DealsPage';
import { PipelinePage } from './components/pages/PipelinePage';
```

**b) Add route cases in the `renderPage()` function:**
```typescript
// Find this comment in App.tsx:
// Future Module Pages (add cases when modules are activated)

// Add your cases:
case 'Contacts':
  return <ContactsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
case 'Deals':
  return <DealsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
case 'Pipeline':
  return <PipelinePage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
```

---

### 4. Add Dashboard KPIs (10 minutes)

**File:** `/components/pages/DashboardPage.tsx`

Add KPI cards in the grid:

```typescript
{/* Add after the existing Forms KPIs */}

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
  colorClass="bg-[#00d3bb]"
  onClick={() => onNavigate('Deals')}
/>
<KPICard
  title="Pipeline Value"
  value="$284K"
  change={12.1}
  icon={TrendingUp}
  colorClass="bg-[#7C3AED]"
  onClick={() => onNavigate('Pipeline')}
/>
```

**Note:** You may need to expand the grid if adding more than 4 total KPIs. Change from `lg:grid-cols-4` to `lg:grid-cols-6` or use multiple rows.

---

### 5. Test Everything (10 minutes)

Run through this checklist:

- [ ] Sidebar shows CRM module without "Coming Soon" badge
- [ ] Click CRM to expand/collapse the sub-menu
- [ ] Click "Contacts" - page loads correctly
- [ ] Click "Deals" - page loads correctly
- [ ] Click "Pipeline" - page loads correctly
- [ ] Active state highlights the correct page in sidebar
- [ ] Dashboard KPIs appear and link to correct pages
- [ ] Global search bar doesn't break (even if search isn't implemented yet)
- [ ] Mobile responsive design works
- [ ] Dark mode looks good
- [ ] No console errors

---

## Common Issues & Solutions

### Module won't expand
**Problem:** Clicked the module but nothing happens  
**Solution:** Make sure `disabled: false` in Sidebar.tsx

### Page shows "Dashboard" instead of my new page
**Problem:** Route case not added or typo in page name  
**Solution:** Check the `case` name matches exactly the `label` in Sidebar.tsx

### Sidebar highlighting wrong item
**Problem:** Active state shows wrong page  
**Solution:** Ensure `activePage` matches the page `label` exactly (case-sensitive)

### Styling looks different
**Problem:** Colors or spacing don't match other pages  
**Solution:** Copy structure from existing page (FormsPage.tsx is a good reference)

---

## Next Steps After Basic Setup

1. **Add real data fetching** - Connect to your backend API
2. **Implement search** - Filter content using `searchQuery` prop
3. **Add actions** - Create, edit, delete functionality
4. **Build tables** - Use existing table components for data lists
5. **Add charts** - Use recharts library for visualizations
6. **Integrate with other modules** - Cross-link related data

---

## Need Help?

- Review existing modules in `/components/pages/FormsPage.tsx`
- Check component library in `/components/ui/`
- See full architecture docs in `/MODULE_ARCHITECTURE.md`
- Search for patterns: `grep -r "Forms" src/` to see how Forms module is implemented

---

## Time Estimate

- **Minimum viable module:** 30-45 minutes
- **Full-featured module:** 2-4 hours
- **Production-ready module:** 1-2 days

Start simple, iterate quickly! 🚀
