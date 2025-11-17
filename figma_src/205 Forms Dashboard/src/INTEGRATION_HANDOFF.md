# 🧩 Integration Settings Handoff Notes

## Overview
This document provides technical specifications for implementing the Calendar Integration and Chatbot Settings features in the Clientt Forms & Lead Dashboard.

---

## 🗂️ Architecture Overview

### State Management
The integration system requires managing the following state across the application:

```typescript
// App-level state
const [calendarConnected, setCalendarConnected] = useState(false);
const [calendarProvider, setCalendarProvider] = useState<'google' | 'microsoft' | null>(null);
const [chatbotEnabled, setChatbotEnabled] = useState(true);
```

### Data Flow
```
User Action → Settings Page → State Update → API Call → Calendar Sync → Confirmation
```

---

## 📍 API Endpoints (Implementation Required)

### Calendar Authentication

#### Google Calendar OAuth
```typescript
POST /api/auth/google/calendar
Request Body: {
  redirect_uri: string;
  state: string;
}
Response: {
  auth_url: string;
  state: string;
}
```

#### Microsoft Outlook OAuth
```typescript
POST /api/auth/microsoft/calendar
Request Body: {
  redirect_uri: string;
  state: string;
}
Response: {
  auth_url: string;
  state: string;
}
```

#### OAuth Callback Handler
```typescript
GET /api/auth/callback?code={code}&state={state}
Response: {
  success: boolean;
  provider: 'google' | 'microsoft';
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

### Chatbot Lead Capture

#### Submit Pre-Connect Form
```typescript
POST /api/chatbot/lead-capture
Request Body: {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  intent: 'pricing' | 'features' | 'demo';
  session_id: string;
}
Response: {
  lead_id: string;
  personalized_response: {
    type: 'pricing' | 'features' | 'demo';
    content: string;
  };
  next_steps: Array<{
    action: string;
    label: string;
    url?: string;
  }>;
}
```

### Calendar Operations

#### Get Available Calendars
```typescript
GET /api/calendar/list
Headers: {
  Authorization: Bearer {access_token}
}
Response: {
  calendars: Array<{
    id: string;
    name: string;
    timezone: string;
    primary: boolean;
  }>
}
```

#### Get Availability
```typescript
GET /api/calendar/availability?calendar_id={id}&start_date={date}&end_date={date}
Headers: {
  Authorization: Bearer {access_token}
}
Response: {
  available_slots: Array<{
    start: string; // ISO 8601
    end: string;   // ISO 8601
    duration: number; // minutes
  }>
}
```

#### Create Booking
```typescript
POST /api/bookings/create
Headers: {
  Authorization: Bearer {access_token}
}
Request Body: {
  calendar_id: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  attendee_email: string;
  attendee_name?: string;
  title: string;
  description?: string;
  send_notifications: boolean;
}
Response: {
  booking_id: string;
  event_id: string;
  status: 'confirmed' | 'pending';
  confirmation_sent: boolean;
}
```

#### Disconnect Calendar
```typescript
DELETE /api/calendar/disconnect
Headers: {
  Authorization: Bearer {access_token}
}
Response: {
  success: boolean;
}
```

---

## 🔄 State Management Logic

### Calendar Connection States

```typescript
type CalendarState = 
  | 'disconnected'   // No calendar connected
  | 'connecting'     // OAuth flow in progress
  | 'connected'      // Calendar successfully linked
  | 'error'          // Connection or sync error
  | 'expired';       // Token expired, needs re-auth

interface CalendarConnection {
  state: CalendarState;
  provider: 'google' | 'microsoft' | null;
  connected_at?: Date;
  last_synced?: Date;
  error_message?: string;
}
```

### Chatbot Configuration

```typescript
interface ChatbotConfig {
  enabled: boolean;
  name: string;
  greeting_message: string;
  trigger_pages: 'all' | 'forms' | 'landing' | string[];
  demo_button_enabled: boolean;
  confirmation_routing: 'email' | 'internal' | 'both' | 'slack';
  notification_email: string;
}
```

### Chatbot Lead Data Flow

```typescript
// User Information State (persisted across interactions)
interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

// Chatbot Interaction Flow Diagram
┌─────────────────────────────────────────────────────────────────┐
│                    CHATBOT INTERACTION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Action
├── Click "💰 Pricing" ──────┐
└── Click "✨ Features" ──────┤
                              │
                              ▼
Step 2: Pre-Connect Form Modal Opens
├── Show friendly intro message
├── Display form fields:
│   ├── First Name (required)
│   ├── Last Name (required)
│   ├── Email (required)
│   └── Company (optional)
└── "Continue →" button
                              │
                              ▼
Step 3: Form Submission
├── Validate required fields
├── Save to userInfo state: {
│     firstName: "John",
│     lastName: "Doe",
│     email: "john@company.com",
│     company: "Acme Inc."
│   }
└── Close modal
                              │
                              ▼
Step 4: Personalized Chat Response
├── Add user message to chat ("💰 Pricing" or "✨ Features")
├── AI responds with personalized content:
│   ├── "Thanks [firstName]! Here's our pricing..."
│   └── OR "Great to meet you, [firstName]! Here are our features..."
└── Show call-to-action for demo booking
                              │
                              ▼
Step 5: User Clicks "📅 Book a demo"
├── Check: userInfo.email exists?
│   │
│   ├── YES: userInfo already collected
│   │   ├── Skip email capture step
│   │   ├── Pre-fill userEmail with userInfo.email
│   │   ├── Set emailSubmitted = true
│   │   ├── Show personalized greeting: "Let's get you scheduled, [firstName]!"
│   │   └── Jump directly to calendar iframe
│   │
│   └── NO: userInfo not collected yet
│       ├── Show standard email capture form
│       ├── User enters email manually
│       └── Then show calendar iframe
                              │
                              ▼
Step 6: Calendar Booking
├── Display Google Calendar iframe
├── User selects time slot
├── Booking created with full context:
│   ├── attendee_first_name: userInfo.firstName
│   ├── attendee_last_name: userInfo.lastName
│   ├── attendee_email: userInfo.email
│   ├── attendee_company: userInfo.company
│   └── lead_intent: "pricing" or "features"
└── Send confirmation email

┌─────────────────────────────────────────────────────────────────┐
│  KEY BENEFIT: Single Data Collection Across Entire Session      │
│  • User fills form once (Pricing/Features)                      │
│  • Data persisted in state                                      │
│  • Demo booking uses cached data                                │
│  • Better UX, higher conversion                                 │
└─────────────────────────────────────────────────────────────────┘
```

### State Updates

```typescript
// Initial state
const [userInfo, setUserInfo] = useState<UserInfo>({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
});

// After pre-connect form submission
setUserInfo({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@company.com',
  company: 'Acme Inc.'
});

// When booking demo
if (userInfo.email) {
  // Skip email capture, use cached data
  setUserEmail(userInfo.email);
  setEmailSubmitted(true);
}
```

---

## 📊 Database Schema (Suggested)

### calendar_connections table
```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  provider VARCHAR(20) NOT NULL, -- 'google' or 'microsoft'
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  calendar_id VARCHAR(255),
  calendar_name VARCHAR(255),
  settings JSONB, -- event_title, confirmation_email, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### chatbot_settings table
```sql
CREATE TABLE chatbot_settings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  enabled BOOLEAN DEFAULT true,
  name VARCHAR(100) DEFAULT 'Clientt Assistant',
  greeting_message TEXT,
  trigger_pages JSONB,
  demo_button_enabled BOOLEAN DEFAULT true,
  confirmation_routing VARCHAR(20) DEFAULT 'email',
  notification_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### chatbot_leads table
```sql
CREATE TABLE chatbot_leads (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  intent VARCHAR(50), -- 'pricing', 'features', 'demo'
  interaction_data JSONB, -- Full conversation context
  lead_score INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email (email),
  INDEX idx_session (session_id),
  INDEX idx_created (created_at)
);
```

### bookings table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  calendar_connection_id UUID REFERENCES calendar_connections(id),
  lead_id UUID REFERENCES chatbot_leads(id), -- Link to chatbot lead
  attendee_email VARCHAR(255) NOT NULL,
  attendee_name VARCHAR(255),
  attendee_first_name VARCHAR(100),
  attendee_last_name VARCHAR(100),
  attendee_company VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  title VARCHAR(255),
  description TEXT,
  event_id VARCHAR(255), -- Calendar provider's event ID
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Feature Implementation Checklist

### Phase 1: Calendar Integration (Week 1-2)
- [ ] Implement Google OAuth flow
- [ ] Implement Microsoft OAuth flow
- [ ] Build token refresh mechanism
- [ ] Create calendar list API endpoint
- [ ] Create availability checking API
- [ ] Build booking creation endpoint
- [ ] Add disconnect functionality
- [ ] Implement error handling and retry logic

### Phase 2: Chatbot Integration (Week 2-3)
- [ ] Connect chatbot to calendar state
- [ ] Implement pre-connect form modal for lead capture
- [ ] Build lead data persistence and state management
- [ ] Create personalized pricing/features responses
- [ ] Implement email capture form (with pre-fill logic)
- [ ] Build booking flow with calendar check
- [ ] Add notification routing logic
- [ ] Create settings persistence
- [ ] Implement trigger page filtering
- [ ] Add analytics tracking
- [ ] Track lead conversion funnel

### Phase 3: Notifications & Confirmations (Week 3-4)
- [ ] Email confirmation templates
- [ ] Calendar invite generation
- [ ] Internal dashboard notifications
- [ ] Slack integration (optional)
- [ ] SMS reminders (optional)
- [ ] Webhook support for external systems

---

## 🔐 Security Considerations

### Token Storage
- Store tokens encrypted at rest
- Use secure token rotation
- Implement token expiration handling
- Never expose tokens in client-side code

### OAuth Security
- Validate state parameter
- Use PKCE for enhanced security
- Implement proper redirect URI validation
- Rate limit authentication attempts

### Data Privacy
- Encrypt PII in database
- Implement data retention policies
- Add GDPR compliance features
- Provide data export/deletion capabilities

---

## 🧪 Testing Strategy

### Unit Tests
- OAuth flow handlers
- Token refresh logic
- Calendar API interactions
- Booking creation/validation

### Integration Tests
- End-to-end booking flow
- Calendar sync verification
- Email notification delivery
- Error recovery scenarios

### Manual Testing Checklist
- [ ] Google Calendar connection
- [ ] Microsoft Outlook connection
- [ ] Calendar disconnection
- [ ] Booking creation
- [ ] Email capture
- [ ] Notification routing
- [ ] Settings persistence
- [ ] Error states display
- [ ] Mobile responsiveness

---

## 📈 Analytics & Monitoring

### Key Metrics to Track
```typescript
interface IntegrationMetrics {
  calendar_connections: {
    total: number;
    by_provider: { google: number; microsoft: number };
    connection_success_rate: number;
  };
  bookings: {
    total: number;
    successful: number;
    cancelled: number;
    no_shows: number;
  };
  chatbot: {
    demo_button_clicks: number;
    bookings_completed: number;
    conversion_rate: number;
  };
}
```

### Error Tracking
- OAuth failures
- Token expiration events
- API timeout errors
- Booking conflicts
- Email delivery failures

---

## 🗺️ Routing & Navigation Structure

### Settings Page Routes

The Settings page uses React Tabs for navigation with the following structure:

```typescript
// Tab values and routes
const settingsTabs = {
  profile: '/settings/profile',           // User profile management
  integrations: '/settings/integrations', // Calendar & Chatbot integrations
  calendar: '/settings/calendar',         // Team Calendar & Availability (NEW)
  notifications: '/settings/notifications', // Notification preferences
  security: '/settings/security',         // Security settings
  billing: '/settings/billing',           // Billing & subscription
  appearance: '/settings/appearance',     // Theme & appearance
};
```

### Tab State Management

```typescript
// SettingsPage.tsx
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
        {/* ... other tabs */}
      </TabsList>
      
      <TabsContent value="calendar">
        <TeamCalendarPage />
      </TabsContent>
      {/* ... other tab contents */}
    </Tabs>
  );
}
```

### Cross-Tab Navigation

Navigation between tabs can be triggered programmatically:

```typescript
// From Integrations tab to Team Calendar
<Button onClick={() => setActiveTab('calendar')}>
  Go to Team Calendar →
</Button>

// From any component
<Card onClick={() => setActiveTab('calendar')}>
  Manage Your Team's Availability →
</Card>
```

### Breadcrumb Structure

```
Settings > [Tab Name]
├── Settings > Profile
├── Settings > Integrations
├── Settings > Team Calendar & Availability (NEW)
├── Settings > Notifications
├── Settings > Security
├── Settings > Billing
└── Settings > Appearance
```

### URL Routing (For Future Implementation)

When implementing full routing with React Router:

```typescript
// Route configuration
<Route path="/settings" element={<SettingsLayout />}>
  <Route index element={<Navigate to="profile" replace />} />
  <Route path="profile" element={<ProfileSettings />} />
  <Route path="integrations" element={<IntegrationsSettings />} />
  <Route path="calendar" element={<TeamCalendarPage />} />
  <Route path="notifications" element={<NotificationsSettings />} />
  <Route path="security" element={<SecuritySettings />} />
  <Route path="billing" element={<BillingSettings />} />
  <Route path="appearance" element={<AppearanceSettings />} />
</Route>

// Navigation with React Router
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/settings/calendar');
```

### Persistent Context Panel

The Developer Handoff Notes card remains visible across all tabs for consistency:

```typescript
// Persistent reference card (shown on Integrations and Calendar tabs)
<Card className="p-6 border-dashed">
  <h3>🧩 Integration Settings Handoff Notes</h3>
  {/* API endpoints, data flow, state management */}
</Card>
```

### Navigation CTA Implementation

The Integrations tab includes a prominent CTA banner:

```typescript
<Card 
  className="p-6 cursor-pointer transition-all hover:shadow-lg"
  onClick={() => setActiveTab('calendar')}
  style={{
    background: 'linear-gradient(135deg, rgba(34, 120, 192, 0.05) 0%, rgba(26, 95, 153, 0.05) 100%)',
  }}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary">
        <Calendar className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3>Manage Your Team's Availability</h3>
        <p>Configure booking hours, team members, and availability settings</p>
      </div>
    </div>
    <Button>Go to Team Calendar →</Button>
  </div>
</Card>
```

### Styling Consistency

All navigation elements follow the Clientt design system:

- **Primary Color**: #2278c0 (blue)
- **Border Radius**: 16px for cards, 8px for buttons
- **Hover States**: Defined in `globals.css`
  - Scale: `hover:scale-[1.02]`
  - Shadow: `hover:shadow-lg`
  - Opacity: `hover:opacity-90`
- **Active States**: 
  - Tab: `data-[state=active]:bg-background data-[state=active]:text-foreground`
  - Button: `active:scale-95`
- **Transitions**: `transition-all duration-200`

---

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Google Calendar
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourapp.com/auth/google/callback

# Microsoft
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=https://yourapp.com/auth/microsoft/callback

# Application
ENCRYPTION_KEY=your_encryption_key
DATABASE_URL=your_database_url
SMTP_HOST=smtp.yourprovider.com
SMTP_USER=notifications@clientt.com
SMTP_PASS=your_smtp_password
```

### Rate Limits
- Google Calendar API: 10,000 requests/day
- Microsoft Graph API: Varies by subscription
- Implement request queuing for high volume
- Add caching layer for availability checks

---

## 📚 External Resources

### Documentation Links
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph Calendar API](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)

### Code Examples
- OAuth implementation samples in `/examples/oauth/`
- Calendar sync worker in `/examples/workers/`
- Email templates in `/templates/email/`

---

## 🆘 Support & Troubleshooting

### Common Issues

#### Calendar Won't Connect
1. Verify OAuth credentials
2. Check redirect URI configuration
3. Ensure proper scopes requested
4. Validate state parameter

#### Bookings Not Syncing
1. Check token expiration
2. Verify calendar ID is valid
3. Check timezone handling
4. Review API rate limits

#### Email Not Sending
1. Verify SMTP configuration
2. Check email templates
3. Review spam filter settings
4. Validate recipient addresses

### Debug Mode
Enable debug logging:
```typescript
localStorage.setItem('DEBUG_CALENDAR_SYNC', 'true');
```

---

## 📞 Contact

For technical questions regarding implementation:
- Email: dev@clientt.com
- Slack: #integrations-dev
- Documentation: https://docs.clientt.com/integrations

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Maintained By:** Clientt Engineering Team
