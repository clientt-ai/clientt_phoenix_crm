# Module Activation Checklist

Use this checklist when activating a new module (CRM, CPQ, Billing, or Support).

---

## Pre-Activation Checklist

- [ ] Review module requirements and specifications
- [ ] Design mockups approved
- [ ] API endpoints defined (if applicable)
- [ ] Database schema ready (if applicable)
- [ ] Team assigned and briefed

---

## Activation Process

### Step 1: Sidebar Configuration (5 min)

**File:** `/components/Sidebar.tsx`

- [ ] Locate the target module in `moduleGroups` array
- [ ] Remove `badge: 'Coming Soon'` line
- [ ] Change `disabled: true` to `disabled: false` (or remove the line)
- [ ] Remove `disabled: true` from all sub-items
- [ ] (Optional) Add module ID to `expandedModules` initial state

**Example for CRM:**
```typescript
// Before
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  badge: 'Coming Soon',     // ❌ Remove
  disabled: true,           // ❌ Remove
  items: [
    { icon: Users, label: 'Contacts', disabled: true },     // ❌ Remove disabled
    { icon: FileText, label: 'Deals', disabled: true },    // ❌ Remove disabled
    { icon: BarChart3, label: 'Pipeline', disabled: true }, // ❌ Remove disabled
  ]
}

// After
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  items: [
    { icon: Users, label: 'Contacts' },
    { icon: FileText, label: 'Deals' },
    { icon: BarChart3, label: 'Pipeline' },
  ]
}
```

---

### Step 2: Create Page Components (30-60 min)

**Directory:** `/components/pages/`

For each sub-page, create a new file:

- [ ] `ContactsPage.tsx`
- [ ] `DealsPage.tsx`
- [ ] `PipelinePage.tsx`

**Component Template:**
```typescript
type PageNamePageProps = {
  searchQuery?: string;
  onNavigate?: (page: string) => void;
};

export function PageNamePage({ searchQuery = '', onNavigate }: PageNamePageProps) {
  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-[38px] font-bold">
          Page Title
        </h1>
        <p className="text-muted-foreground">
          Page description goes here
        </p>
      </div>

      {/* Page Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Your content here */}
      </div>
    </div>
  );
}
```

**Checklist for Each Page:**
- [ ] Header with title and description
- [ ] Responsive grid layout
- [ ] Search integration (if applicable)
- [ ] Navigation handlers
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

---

### Step 3: Add Page Imports (2 min)

**File:** `/App.tsx`

Add imports at the top:

```typescript
// CRM Pages
import { ContactsPage } from './components/pages/ContactsPage';
import { DealsPage } from './components/pages/DealsPage';
import { PipelinePage } from './components/pages/PipelinePage';
```

- [ ] Import statements added
- [ ] No TypeScript errors
- [ ] File paths correct

---

### Step 4: Add Route Cases (5 min)

**File:** `/App.tsx`

In the `renderPage()` switch statement, add cases for each page:

```typescript
// Find this comment:
// Future Module Pages (add cases when modules are activated)

// Add your cases:
case 'Contacts':
  return <ContactsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
case 'Deals':
  return <DealsPage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
case 'Pipeline':
  return <PipelinePage searchQuery={globalSearchQuery} onNavigate={setActivePage} />;
```

- [ ] Route cases added
- [ ] Page names match sidebar labels exactly (case-sensitive)
- [ ] Props passed correctly
- [ ] No duplicate cases

---

### Step 5: Add Dashboard KPIs (10 min)

**File:** `/components/pages/DashboardPage.tsx`

Add KPI cards to the dashboard grid:

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

**KPI Checklist:**
- [ ] Meaningful metrics selected
- [ ] Values formatted correctly (numbers, currency, percentages)
- [ ] Change percentages show trends
- [ ] Icons match the metric type
- [ ] Colors follow brand guidelines
- [ ] Click handlers navigate to correct pages
- [ ] Grid layout adjusted if needed (4 vs 6 vs 8 columns)

---

### Step 6: Import Required Icons (2 min)

**File:** `/components/pages/DashboardPage.tsx`

If using new icons, add imports:

```typescript
import { FileText, Send, Users, TrendingUp, DollarSign, Building } from 'lucide-react';
```

**Common Icons by Module:**

**CRM:**
- `Users`, `Building`, `Phone`, `Mail`, `UserCheck`, `UserPlus`

**CPQ:**
- `FileCheck`, `DollarSign`, `ShoppingCart`, `Package`, `Calculator`

**Billing:**
- `CreditCard`, `Receipt`, `Wallet`, `BanknoteIcon`, `FileInvoice`

**Support:**
- `Headphones`, `MessageSquare`, `HelpCircle`, `LifeBuoy`, `MessageCircle`

- [ ] Icons imported
- [ ] Icons match module theme
- [ ] No duplicate imports

---

## Testing Checklist

### Functional Testing

- [ ] **Sidebar Navigation**
  - [ ] Module appears in sidebar (no "Coming Soon" badge)
  - [ ] Module can be expanded/collapsed
  - [ ] All sub-pages visible when expanded
  - [ ] Click on sub-page navigates correctly

- [ ] **Page Navigation**
  - [ ] Each sub-page loads without errors
  - [ ] Page titles display correctly
  - [ ] Content renders as expected
  - [ ] Back navigation works

- [ ] **Active State**
  - [ ] Current page highlighted in sidebar
  - [ ] Module stays expanded when navigating between sub-pages
  - [ ] Active state updates on page change

- [ ] **Dashboard Integration**
  - [ ] KPI cards appear on dashboard
  - [ ] KPI cards show correct data
  - [ ] Clicking KPI navigates to correct page
  - [ ] KPI colors match brand guidelines

### Visual Testing

- [ ] **Light Mode**
  - [ ] Sidebar styling correct
  - [ ] Page layouts look good
  - [ ] Colors are legible
  - [ ] Hover states work

- [ ] **Dark Mode**
  - [ ] Sidebar styling correct
  - [ ] Page layouts look good
  - [ ] Colors are legible
  - [ ] Hover states work

- [ ] **Responsive Design**
  - [ ] Desktop (1920px) - Full layout
  - [ ] Laptop (1366px) - Adjusted layout
  - [ ] Tablet (768px) - Mobile-friendly
  - [ ] Mobile (375px) - Optimized for small screens

### Performance Testing

- [ ] Page load time < 2 seconds
- [ ] Smooth transitions and animations
- [ ] No layout shift on page load
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools)

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces page changes
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements have labels

---

## Post-Activation Tasks

### Documentation

- [ ] Update user documentation
- [ ] Add module to feature list
- [ ] Create internal training materials
- [ ] Update changelog

### Monitoring

- [ ] Set up analytics tracking
- [ ] Configure error monitoring
- [ ] Add performance metrics
- [ ] Set up user feedback collection

### Team Handoff

- [ ] Demo to stakeholders
- [ ] Train customer support team
- [ ] Update sales materials
- [ ] Inform customers via email/announcement

---

## Rollback Plan

If issues are found after activation:

1. **Immediate Rollback (< 5 min)**
   - Revert sidebar changes (re-add `disabled: true`)
   - Deploy changes
   - Module becomes "Coming Soon" again

2. **Preserve Work**
   - Page components remain in codebase
   - Routes remain in App.tsx (won't be accessed)
   - Fix issues in development branch

3. **Re-activate When Ready**
   - Follow checklist again
   - Test more thoroughly
   - Deploy with confidence

---

## Success Criteria

Module activation is considered successful when:

- ✅ All pages accessible from sidebar
- ✅ No console errors
- ✅ Dashboard KPIs functional
- ✅ Responsive design works
- ✅ Dark mode looks good
- ✅ Performance is acceptable
- ✅ Stakeholders approve
- ✅ No critical bugs reported

---

## Module-Specific Checklists

### CRM Module
- [ ] Contact management functional
- [ ] Deal pipeline visualized
- [ ] Integration with Forms (lead capture)
- [ ] Contact import/export works
- [ ] Search and filters operational

### CPQ Module
- [ ] Product catalog loaded
- [ ] Quote builder functional
- [ ] Pricing rules applied correctly
- [ ] PDF generation works
- [ ] Integration with CRM

### Billing Module
- [ ] Invoice generation works
- [ ] Payment processing integrated
- [ ] Subscription management functional
- [ ] Revenue reporting accurate
- [ ] Integration with accounting system

### Support Module
- [ ] Ticket system operational
- [ ] Live chat connected
- [ ] Knowledge base searchable
- [ ] Email notifications working
- [ ] Integration with customer data

---

## Time Estimates

| Task | Time Estimate |
|------|---------------|
| Sidebar Configuration | 5 minutes |
| Create Basic Pages | 30-60 minutes |
| Add Routing | 5 minutes |
| Add Dashboard KPIs | 10 minutes |
| Basic Testing | 15 minutes |
| **Minimum Viable Module** | **1-2 hours** |
| Full Feature Development | 1-2 days |
| Comprehensive Testing | 4-8 hours |
| Documentation | 2-4 hours |
| **Production Ready Module** | **3-5 days** |

---

## Common Issues & Solutions

**Issue:** Module still shows "Coming Soon"  
**Solution:** Clear browser cache, hard refresh (Ctrl+Shift+R)

**Issue:** Pages don't load  
**Solution:** Check route case names match sidebar labels exactly

**Issue:** Active state doesn't highlight  
**Solution:** Verify `activePage` prop matches label (case-sensitive)

**Issue:** KPIs don't navigate  
**Solution:** Check `onClick` handler references correct page name

**Issue:** Sidebar doesn't expand  
**Solution:** Ensure `disabled: false` in module configuration

---

## Resources

- **Quick Start Guide:** `/QUICK_START_NEW_MODULE.md`
- **Architecture Guide:** `/MODULE_ARCHITECTURE.md`
- **Sidebar Reference:** `/SIDEBAR_STRUCTURE.md`
- **Implementation Summary:** `/IMPLEMENTATION_SUMMARY.md`

---

**Good luck with your module activation! 🚀**
