# Sidebar Navigation Structure

## Visual Hierarchy

```
┌─────────────────────────────────────┐
│  [Clientt Logo]                     │
├─────────────────────────────────────┤
│                                     │
│  📊 Dashboard                       │  ← Top-level item (always visible)
│                                     │
│  📄 Forms                       ▼   │  ← Active module (expanded)
│     ├─ 📄 Forms                     │
│     ├─ 📅 Calendar Integration      │
│     ├─ 💬 Chatbot                   │
│     └─ 📊 Analytics                 │
│                                     │
│  👥 CRM                    🔒 Soon  │  ← Disabled module
│                                     │
│  ✅ CPQ                    🔒 Soon  │  ← Disabled module
│                                     │
│  💳 Billing                🔒 Soon  │  ← Disabled module
│                                     │
│  🎧 Support                🔒 Soon  │  ← Disabled module
│                                     │
│  ─────────────────────────          │
│                                     │
│  ⚙️  Settings                       │  ← System settings (always visible)
│                                     │
├─────────────────────────────────────┤
│  [JD]  John Doe                     │
│        Pro Plan                     │
└─────────────────────────────────────┘
```

## Module States

### Active Module (Forms)
- ✅ Clickable module header
- ✅ Chevron icon (▼ expanded / ▶ collapsed)
- ✅ Sub-menu items visible when expanded
- ✅ Active state highlighting
- ✅ Hover effects enabled

### Disabled Module (CRM, CPQ, Billing, Support)
- 🔒 Lock icon displayed
- 🏷️ "Coming Soon" badge
- ❌ No hover effects
- ❌ Click disabled
- ⚫ Greyed out appearance

## Interaction Patterns

### Expanding/Collapsing Modules

**User Action:** Click on "Forms" module header
**Result:** 
- Forms expanded → shows sub-items (Forms, Calendar Integration, Chatbot, Analytics)
- Forms collapsed → hides sub-items

**User Action:** Click on "CRM" module header (disabled)
**Result:** No action (cursor shows not-allowed)

### Navigation

**User Action:** Click on "Forms" sub-item
**Result:**
- Navigate to Forms page
- Forms item highlighted with blue background
- Forms module remains expanded

### Active State Behavior

When on any sub-page of Forms module:
1. Forms module stays expanded
2. Current page is highlighted
3. Module header shows it's the active module group

## Scalability Features

### Adding New Module Pages

When adding a new sub-page to an existing module (e.g., adding "Form Templates" to Forms):

```typescript
{
  id: 'forms',
  label: 'Forms',
  icon: FileText,
  items: [
    { icon: FileText, label: 'Forms' },
    { icon: Calendar, label: 'Calendar Integration' },
    { icon: MessageSquare, label: 'Chatbot' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: FileStack, label: 'Form Templates' },  // NEW PAGE
  ]
}
```

### Activating a Disabled Module

To enable CRM module:

**Before:**
```typescript
{
  id: 'crm',
  label: 'CRM',
  icon: Users,
  badge: 'Coming Soon',     // Remove this
  disabled: true,           // Change to false
  items: [
    { icon: Users, label: 'Contacts', disabled: true },      // Remove disabled
    { icon: FileText, label: 'Deals', disabled: true },     // Remove disabled
    { icon: BarChart3, label: 'Pipeline', disabled: true }, // Remove disabled
  ]
}
```

**After:**
```typescript
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

## CSS Classes Reference

### Module Header States

**Active Module:**
```css
text-foreground hover:bg-muted
```

**Disabled Module:**
```css
text-muted-foreground/50 cursor-not-allowed
```

### Sub-Item States

**Active Sub-Item:**
```css
bg-primary text-primary-foreground shadow-lg shadow-primary/30
```

**Inactive Sub-Item:**
```css
text-foreground hover:bg-muted
```

**Disabled Sub-Item:**
```css
text-muted-foreground/50 cursor-not-allowed
```

## Responsive Behavior

### Desktop (Width > 768px)
- Sidebar visible by default
- Width: 256px (w-64)
- Fixed positioning
- Content shifts right with margin-left

### Mobile (Width < 768px)
- Sidebar hidden by default
- Slides in from left on toggle
- Overlays content
- Higher z-index (z-20) to appear above content

## Accessibility

- **Keyboard Navigation:** All items focusable with Tab key
- **Screen Readers:** Proper ARIA labels on buttons
- **Visual Feedback:** Clear hover and active states
- **Disabled States:** Cursor and visual indicators for non-clickable items

## Future Enhancements Roadmap

### Phase 1: Current (Forms Only)
- ✅ Collapsible sidebar
- ✅ Single active module
- ✅ Disabled module placeholders
- ✅ Smooth transitions

### Phase 2: Multi-Module (CRM + Forms)
- Add CRM module pages
- Cross-module navigation
- Shared data context
- Module-specific colors

### Phase 3: Full Platform (All Modules)
- All 5 modules active
- Module permissions/roles
- Customizable sidebar order
- Favorites/pinned items

### Phase 4: Advanced Features
- Module search
- Keyboard shortcuts
- Breadcrumb navigation
- Recent pages history
- Custom module creation

## Performance Considerations

- **Lazy Loading:** Module pages loaded on-demand
- **State Management:** Expanded/collapsed state persisted
- **Animations:** Hardware-accelerated CSS transitions
- **Bundle Size:** Icons tree-shaken from lucide-react

## Testing Checklist

When modifying the sidebar:

- [ ] All active pages navigable
- [ ] Disabled modules stay disabled
- [ ] Active state highlights correctly
- [ ] Expansion state persists during navigation
- [ ] Mobile overlay works
- [ ] Dark mode styling correct
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Smooth animations
- [ ] No console errors
