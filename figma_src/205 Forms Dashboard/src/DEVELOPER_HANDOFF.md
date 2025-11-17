# 🚀 Developer Handoff Documentation

## Overview
This document provides comprehensive technical specifications for implementing the Clientt Forms & Lead Dashboard settings navigation, routing, and component architecture.

---

## 📐 Settings Page Architecture

### Component Structure

```
SettingsPage.tsx (Container)
├── Tabs Component (Shadcn/ui)
│   ├── TabsList (7 tabs, horizontal grid)
│   │   ├── Profile Tab
│   │   ├── Integrations Tab
│   │   ├── Team Calendar Tab (NEW)
│   │   ├── Notifications Tab
│   │   ├── Security Tab
│   │   ├── Billing Tab
│   │   └── Appearance Tab
│   │
│   └── TabsContent (Content panels)
│       ├── Profile Settings
│       ├── Integrations Settings
│       │   ├── Calendar Integration (Collapsible)
│       │   ├── Chatbot Settings (Collapsible)
│       │   ├── CTA Banner → Team Calendar (NEW)
│       │   └── Developer Reference Card
│       ├── TeamCalendarPage (NEW)
│       │   ├── Availability Overview Card
│       │   ├── General Settings Card
│       │   ├── Weekly Availability Card
│       │   ├── Team Members Card
│       │   ├── Date Overrides Card
│       │   └── Sticky Save Bar
│       ├── Notifications Settings
│       ├── Security Settings
│       ├── Billing Settings
│       └── Appearance Settings
```

---

## 🗂️ File Structure

```
/components/pages/
├── SettingsPage.tsx         # Main container with tab navigation
└── TeamCalendarPage.tsx     # Team calendar settings component (NEW)

/components/ui/
├── tabs.tsx                  # Shadcn tabs component
├── collapsible.tsx          # For expandable sections
├── select.tsx               # Dropdowns for settings
├── switch.tsx               # Toggle switches
└── ...other UI components
```

---

## 🎨 Design Specifications

### Layout Grid
```css
/* Main container */
max-width: 1200px;
margin: 0 auto;
padding: 32px;

/* Tab list */
display: grid;
grid-template-columns: repeat(7, 1fr);
gap: 8px;
margin-bottom: 32px;

/* Card spacing */
gap: 24px; /* between cards */
padding: 24px; /* inside cards */
border-radius: 16px;
```

### Color Tokens
```typescript
// Primary (Blue)
--primary: #2278c0;
--primary-hover: #1a5f99;
--primary-gradient: linear-gradient(135deg, #2278c0 0%, #1a5f99 100%);

// Accent (Fuchsia) - for chatbot features
--accent: #ec4899;
--accent-hover: #db2777;
--accent-gradient: linear-gradient(135deg, #ec4899 0%, #db2777 100%);

// Status colors
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography
```css
/* Page title */
font-size: 38px;
font-weight: 700;
line-height: 1.2;
margin-bottom: 8px;

/* Card heading (h3) */
font-size: 18px;
font-weight: 600;
line-height: 1.4;
margin-bottom: 4px;

/* Body text */
font-size: 14px;
font-weight: 400;
line-height: 1.5;

/* Small text */
font-size: 12px;
color: var(--muted-foreground);
```

### Spacing System
Uses 8px base unit:
- 4px (0.5x)
- 8px (1x)
- 12px (1.5x)
- 16px (2x)
- 24px (3x)
- 32px (4x)
- 48px (6x)

---

## 🔄 State Management

### Tab Navigation State
```typescript
// SettingsPage.tsx
const [activeTab, setActiveTab] = useState('profile');

// Tab switching
<Tabs value={activeTab} onValueChange={setActiveTab}>
  {/* ... */}
</Tabs>

// Programmatic navigation
<Button onClick={() => setActiveTab('calendar')}>
  Go to Team Calendar
</Button>
```

### Settings State (Examples)
```typescript
// Calendar integration state
const [googleConnected, setGoogleConnected] = useState(false);
const [outlookConnected, setOutlookConnected] = useState(false);

// Chatbot state
const [chatbotEnabled, setChatbotEnabled] = useState(true);
const [chatbotDemoButton, setChatbotDemoButton] = useState(true);

// Team calendar state
const [defaultDuration, setDefaultDuration] = useState('30');
const [weeklyHours, setWeeklyHours] = useState<TimeSlot[]>([...]);
```

### State Persistence Recommendations
```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('settings', JSON.stringify({
    calendarConnected: googleConnected || outlookConnected,
    chatbotEnabled,
    defaultDuration,
    // ...other settings
  }));
}, [googleConnected, outlookConnected, chatbotEnabled, defaultDuration]);

// Or use a state management library
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      calendarConnected: false,
      setCalendarConnected: (value) => set({ calendarConnected: value }),
      // ...other state
    }),
    { name: 'clientt-settings' }
  )
);
```

---

## 🛣️ Routing Implementation

### Current Implementation (Tabs)
Currently uses React state for tab switching:
```typescript
const [activeTab, setActiveTab] = useState('profile');
```

### Future Implementation (React Router)
When adding URL-based routing:

```typescript
// App routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/settings" element={<SettingsLayout />}>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<ProfileTab />} />
      <Route path="integrations" element={<IntegrationsTab />} />
      <Route path="calendar" element={<TeamCalendarPage />} />
      <Route path="notifications" element={<NotificationsTab />} />
      <Route path="security" element={<SecurityTab />} />
      <Route path="billing" element={<BillingTab />} />
      <Route path="appearance" element={<AppearanceTab />} />
    </Route>
  </Routes>
</BrowserRouter>

// Settings layout with nested routes
function SettingsLayout() {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'profile';
  
  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>
      
      <Tabs value={activeTab}>
        <TabsList>
          <TabsTrigger 
            value="profile" 
            onClick={() => navigate('/settings/profile')}
          >
            Profile
          </TabsTrigger>
          {/* ...other tabs */}
        </TabsList>
        
        <Outlet /> {/* Renders nested route */}
      </Tabs>
    </div>
  );
}
```

---

## 🎯 Cross-Tab Navigation

### CTA Banner Implementation
Located in Integrations tab, navigates to Team Calendar:

```typescript
<Card 
  className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-primary/20"
  onClick={() => setActiveTab('calendar')}
  style={{
    background: 'linear-gradient(135deg, rgba(34, 120, 192, 0.05) 0%, rgba(26, 95, 153, 0.05) 100%)',
  }}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
        style={{
          background: 'linear-gradient(135deg, #2278c0 0%, #1a5f99 100%)',
        }}
      >
        <Calendar className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="mb-1">Manage Your Team's Availability</h3>
        <p className="text-sm text-muted-foreground">
          Configure booking hours, team members, and availability settings
        </p>
      </div>
    </div>
    <Button
      variant="outline"
      className="border-primary text-primary hover:bg-primary hover:text-white"
      onClick={(e) => {
        e.stopPropagation();
        setActiveTab('calendar');
      }}
    >
      Go to Team Calendar
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </div>
</Card>
```

### Navigation from Other Components
```typescript
// From anywhere in the app
import { useNavigate } from 'react-router-dom'; // if using React Router

// Or if using state-based tabs
const SettingsContext = createContext();

// In parent component
<SettingsContext.Provider value={{ setActiveTab }}>
  {children}
</SettingsContext.Provider>

// In child component
const { setActiveTab } = useContext(SettingsContext);
<Button onClick={() => setActiveTab('calendar')}>
  Open Calendar Settings
</Button>
```

---

## 💾 Data Models

### TimeSlot Interface
```typescript
type TimeSlot = {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // Format: "HH:mm" (24-hour)
  endTime: string;   // Format: "HH:mm" (24-hour)
  enabled: boolean;
};

// Example
const mondaySlot: TimeSlot = {
  id: '1',
  day: 'Monday',
  startTime: '09:00',
  endTime: '17:00',
  enabled: true,
};
```

### TeamMember Interface
```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatar?: string;
  timezone?: string;
}
```

### DateOverride Interface
```typescript
interface DateOverride {
  id: string;
  type: 'blocked' | 'custom';
  title: string;
  startDate: Date;
  endDate?: Date; // For multi-day overrides
  customHours?: {
    startTime: string;
    endTime: string;
  };
}
```

### CalendarSettings Interface
```typescript
interface CalendarSettings {
  defaultDuration: 15 | 30 | 45 | 60 | 90;
  bufferTime: 0 | 5 | 10 | 15 | 30;
  advanceBooking: 7 | 14 | 30 | 60 | 90;
  minNotice: 0 | 1 | 2 | 4 | 24 | 48;
  timezone: string;
  weeklyHours: TimeSlot[];
  teamMembers: TeamMember[];
  dateOverrides: DateOverride[];
}
```

---

## 🎭 Component Props

### SettingsPage Props
```typescript
// Currently no props (self-contained)
export function SettingsPage() {
  // Internal state management
}

// Future: Could accept initial tab
type SettingsPageProps = {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
};
```

### TeamCalendarPage Props
```typescript
// Currently no props (manages own state)
export function TeamCalendarPage() {
  // Internal state
}

// Future: Could accept settings data
type TeamCalendarPageProps = {
  settings?: CalendarSettings;
  onSettingsChange?: (settings: CalendarSettings) => void;
  readOnly?: boolean;
};
```

---

## 🎨 Styling Guidelines

### Hover States
```css
/* Cards */
.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
  transition: all 200ms ease;
}

/* Buttons */
.button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Tabs */
.tab:hover {
  background-color: hsl(var(--muted));
}
```

### Active States
```css
/* Active tab */
.tab[data-state="active"] {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Active button */
.button:active {
  transform: scale(0.95);
}
```

### Focus States
```css
/* Keyboard navigation */
.focusable:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 8px;
}
```

### Dark Mode
All components automatically support dark mode via CSS variables:
```css
/* Define in globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Tab switching functionality
- [ ] State updates for each setting
- [ ] Form validation (time inputs, email, etc.)
- [ ] Date override logic
- [ ] Team member toggle

### Integration Tests
- [ ] Navigation between tabs
- [ ] CTA banner click navigates correctly
- [ ] Settings save and persist
- [ ] Cross-component state sharing
- [ ] Calendar integration status sync

### E2E Tests
- [ ] Complete settings flow
- [ ] Save settings and reload page
- [ ] Navigate using keyboard
- [ ] Responsive layout on mobile
- [ ] Dark mode toggle

### Accessibility Tests
- [ ] Keyboard navigation through all tabs
- [ ] Screen reader announces tab changes
- [ ] Focus management on modal/dialog open
- [ ] Color contrast ratios (WCAG AA)
- [ ] Form labels properly associated

---

## 📱 Responsive Design

### Breakpoints
```typescript
// Tailwind breakpoints
sm: '640px',  // Small devices
md: '768px',  // Tablets
lg: '1024px', // Laptops
xl: '1280px', // Desktops
```

### Mobile Adaptations
```css
/* Tab list */
@media (max-width: 768px) {
  .tabs-list {
    grid-template-columns: repeat(3, 1fr); /* 3 columns instead of 7 */
    grid-template-rows: repeat(3, auto); /* Stack in 3 rows */
  }
}

/* Card layout */
@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr; /* Single column */
  }
  
  .sticky-save-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
```

---

## 🔧 Common Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const saveSettings = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    await api.saveSettings(settings);
    toast.success('Settings saved successfully');
  } catch (err) {
    setError(err.message);
    toast.error('Failed to save settings');
  } finally {
    setIsLoading(false);
  }
};
```

### Optimistic Updates
```typescript
const toggleTeamMember = (id: string) => {
  // Update UI immediately
  setTeamMembers(prev => 
    prev.map(member => 
      member.id === id 
        ? { ...member, active: !member.active }
        : member
    )
  );
  
  // Sync with backend
  api.updateTeamMember(id).catch(err => {
    // Revert on error
    setTeamMembers(originalTeamMembers);
    toast.error('Failed to update team member');
  });
};
```

### Debounced Inputs
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (value) => {
    api.updateSetting(value);
  },
  1000 // 1 second delay
);

<Input 
  onChange={(e) => debouncedSave(e.target.value)}
/>
```

---

## 🐛 Known Issues & TODOs

### Current Limitations
- Tab state not persisted in URL (no deep linking)
- Settings not saved to backend (mock only)
- Calendar OAuth flow is mocked
- No real-time sync between tabs
- Team member management is UI-only

### Future Enhancements
- [ ] Implement React Router for URL-based navigation
- [ ] Add backend API integration
- [ ] Real OAuth flow for Google/Microsoft
- [ ] WebSocket for real-time updates
- [ ] Undo/redo functionality
- [ ] Settings export/import
- [ ] Bulk team member operations
- [ ] Advanced date override recurrence
- [ ] Team member calendar sync
- [ ] Conflict detection for overlapping bookings

---

## 📚 Resources

### Documentation
- [Shadcn/ui Tabs](https://ui.shadcn.com/docs/components/tabs)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

### Code Examples
- See `/components/pages/SettingsPage.tsx` for tab implementation
- See `/components/pages/TeamCalendarPage.tsx` for calendar settings
- See `/INTEGRATION_HANDOFF.md` for API specifications

---

**Last Updated:** November 5, 2025  
**Version:** 2.0.0  
**Maintained By:** Clientt Engineering Team
