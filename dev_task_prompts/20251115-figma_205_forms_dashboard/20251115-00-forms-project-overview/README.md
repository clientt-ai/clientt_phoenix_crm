# Forms Dashboard Implementation - Development Task Prompts

## Overview

This folder contains comprehensive implementation plans for converting the Figma Forms Dashboard export into a fully functional Phoenix LiveView + Ash Framework application.

**Figma Source:** `figma_src/205 Forms Dashboard/`
**Target Stack:** Elixir, Phoenix 1.8+, Ash Framework 3.0+, LiveView 1.1+, PostgreSQL

## Quick Start

1. **Read First:** `../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md`
   - This is the master planning document that explains the entire project
   - Covers all features, architecture decisions, and implementation phases
   - Provides the big picture before diving into specific tracks

2. **Choose Your Track:** Based on your role or the feature you're implementing
3. **Follow the MVP Phases:** Implementation is organized into 3 phases over 6 weeks

## Current Scope: MVP Implementation

This documentation covers the **MVP (Minimum Viable Product)** scope:
- ✅ Forms creation and management
- ✅ Form submissions tracking
- ✅ Analytics and KPIs
- ✅ Settings and configuration
- ⏸️ Calendar integration (Future phase)
- ⏸️ Chatbot widget (Future phase)

## Folder Structure

```
dev_task_prompts/
├── README.md                                    # Quick start guide
├── 20251115-00-project-overview/                # This folder
│   └── README.md                                # Detailed documentation
├── 20251115-01-forms-dashboard-primary/         # 🎯 START HERE
│   └── 00-PRIMARY-OVERVIEW.md                   # Master planning document
├── 20251115-02-forms-liveview-ui/               # Track 2: UI Conversion
│   └── README.md                                # LiveView pages & components
├── 20251115-03-forms-domain-models/             # Track 3: Data Layer
│   └── README.md                                # Ash resources & database
├── 20251115-04-forms-analytics-kpis/            # Track 4: Analytics
│   └── README.md                                # Metrics & visualization
├── 20251115-05-forms-settings-integrations/     # Track 5: Settings
│   └── README.md                                # Configuration UI
├── 20251115-xx-future-calendar-integration/     # Future: Calendar System
│   └── README.md                                # Booking & calendar sync
└── 20251115-xx-future-chatbot-widget/           # Future: Chatbot
    └── README.md                                # AI sales assistant
```

## Implementation Tracks (MVP)

### Track 1: Primary Overview (Read First!)
**Folder:** `20251115-01-forms-dashboard-primary/`
**Purpose:** Executive summary of the entire project
**Contains:**
- Full feature breakdown
- Technology conversion matrix
- Database schema overview
- Implementation phases (3 phases for MVP)
- Success metrics
- Questions to clarify before starting

**Start Here:** This is your roadmap for the entire project.

---

### Track 2: Phoenix LiveView UI Conversion
**Folder:** `20251115-02-forms-liveview-ui/`
**Purpose:** Convert React/TypeScript components to Phoenix LiveView
**Estimated Time:** 2 weeks
**Dependencies:** None (can start immediately)

**What's Included:**
- Component conversion patterns (React → LiveView)
- Technology mapping (useState → assigns, etc.)
- File structure to create
- Routing configuration
- Design system implementation
- Real-time update patterns
- Accessibility checklist
- Mobile responsive patterns
- Dark mode support

**Key Pages to Build:**
- Dashboard (KPI overview)
- Forms listing
- Form builder
- Analytics pages
- Settings pages
- Sidebar navigation

**Note:** Calendar and chatbot features will show "Coming Soon" placeholders in the UI.

---

### Track 3: Ash Domain Models & Data Layer
**Folder:** `20251115-03-forms-domain-models/`
**Purpose:** Create Ash resources and database schema for Forms
**Estimated Time:** 1 week
**Dependencies:** None (foundational)

**What's Included:**
- Complete database schema (SQL)
- Ash resource definitions (with code examples)
- Forms domain structure
- Calculations & aggregates for analytics
- Validation & business logic
- Testing strategy
- Migration generation

**Resources to Create:**
- Forms domain: Form, FormField, Submission

**Note:** Calendar and chatbot domain resources are documented but not implemented in MVP.

---

### Track 4: Analytics & KPIs
**Folder:** `20251115-04-forms-analytics-kpis/`
**Purpose:** Metrics tracking and data visualization
**Estimated Time:** 1 week
**Dependencies:** Tracks 2 (UI), 3 (Domain)

**What's Included:**
- Dashboard KPI calculations
- Per-form analytics
- Time-series data queries
- Lead source tracking
- Field completion rates
- Chart components (Chart.js integration)
- Caching strategy
- Background job setup for expensive calculations

**Metrics to Track:**
- Total Forms, Submissions, Active Users
- Conversion Rate (global & per-form)
- Submissions over time
- Top performing forms
- Field analytics

---

### Track 5: Settings & Configuration
**Folder:** `20251115-05-forms-settings-integrations/`
**Purpose:** Configuration UI for forms and user settings
**Estimated Time:** 1 week
**Dependencies:** Tracks 2 (UI), 3 (Domain)

**What's Included:**
- Settings page with tabs
- User profile settings
- Form configuration options
- Notification preferences
- "Coming Soon" placeholders for calendar & chatbot integrations

**Key Pages:**
- General settings
- Notification settings
- Integrations (with future placeholders)

**Note:** OAuth and external integrations are documented but not implemented in MVP.

---

## Future Phases (Post-MVP)

### Future: Calendar Integration System
**Folder:** `20251115-xx-future-calendar-integration/`
**Purpose:** Build Calendly-like booking with Google/Outlook sync
**Status:** Documented, not implemented
**Estimated Time:** 2-3 weeks

**Features:**
- Calendar booking widget
- Google/Outlook OAuth + sync
- Team availability management
- Email confirmations

---

### Future: Chatbot Widget System
**Folder:** `20251115-xx-future-chatbot-widget/`
**Purpose:** AI-powered sales chatbot for lead engagement
**Status:** Documented, not implemented
**Estimated Time:** 1-2 weeks

**Features:**
- Expandable chat widget
- Message threading
- Lead capture
- Demo booking integration

---

## MVP Implementation Phases (Recommended Order)

### Phase 1: Foundation (Week 1-2)
**Priority:** Core domain models and basic UI
- ✅ Set up Forms domain with Ash resources (Track 3)
- ✅ Create basic LiveView pages: dashboard, forms list (Track 2)
- ✅ Implement sidebar navigation (Track 2)
- ✅ Create form builder UI - basic version (Track 2)
- ✅ Database migrations

**Deliverables:**
- Forms can be created, listed, and edited
- Submissions can be recorded
- Dashboard shows basic KPIs
- Navigation works across all pages

### Phase 2: Analytics (Week 3-4)
**Priority:** Metrics and insights
- ✅ Form analytics calculations (Track 4)
- ✅ Submission time-series data (Track 4)
- ✅ Conversion rate tracking (Track 4)
- ✅ Charts and graphs (Track 4)
- ✅ KPI calculations using Ash aggregates (Track 4)

**Deliverables:**
- Dashboard shows real KPIs
- Analytics page with detailed metrics
- Charts visualizing form performance

### Phase 3: Polish & Settings (Week 5-6)
**Priority:** UX improvements and configuration
- ✅ Settings UI (Track 5)
- ✅ Dark mode support (Track 2)
- ✅ Mobile responsive refinements (Track 2)
- ✅ Accessibility improvements (Track 2)
- ✅ Performance optimization (all tracks)
- ✅ Comprehensive testing (all tracks)

**Deliverables:**
- Full dark mode support
- Mobile-friendly UI
- WCAG 2.1 AA compliance
- Settings are configurable
- Test coverage >70%

---

## Technology Conversion Reference

### Frontend
| React/Figma | Phoenix LiveView |
|-------------|------------------|
| React components | LiveView pages + components |
| TypeScript | Elixir |
| useState | socket assigns |
| useEffect | handle_info / handle_event |
| onClick | phx-click / handle_event |
| Props | function parameters / assigns |
| Conditional render | `<%= if ... do %>` |
| Map over array | `<%= for item <- items do %>` |
| Tailwind v4.0 | Tailwind v3.x |
| Lucide icons | Heroicons |
| Vite | esbuild |

### Backend (New)
| Figma (static) | Phoenix Implementation |
|----------------|------------------------|
| No backend | Ash Framework 3.0+ |
| No database | PostgreSQL + AshPostgres |
| No auth | AshAuthentication 4.0+ |
| No real-time | Phoenix LiveView + PubSub |
| Mock data | Real CRUD operations |

---

## Quick Reference by Role

### Frontend Developer
**Your Tracks:**
1. Track 2 (LiveView UI) - Primary focus
2. Track 4 (Analytics) - Chart components
3. Track 5 (Settings) - Configuration UI

**Start with:**
- Read Primary Overview
- Review Track 2 for conversion patterns
- Build one page end-to-end before continuing

**Remember:**
- Show "Coming Soon" badges for calendar and chatbot features
- Don't implement OAuth flows yet
- Focus on forms, analytics, and settings

### Backend Developer
**Your Tracks:**
1. Track 3 (Domain Models) - Primary focus
2. Track 4 (Analytics) - Calculation logic

**Start with:**
- Read Primary Overview
- Implement Forms domain (Track 3)
- Set up database migrations

**Remember:**
- Only implement Forms domain resources for MVP
- Skip calendar and chatbot resources for now

### Full-Stack Developer
**Your Path:**
1. Read Primary Overview
2. Start with Phase 1 (Track 2 + 3 together)
3. Follow phases sequentially
4. Build vertically (one feature end-to-end)

---

## Common Questions

### Q: Where should I start?
**A:** Always start with the Primary Overview document in Track 1. It provides the context you need for all other tracks.

### Q: Can I work on tracks in parallel?
**A:** Yes! Here's what can be done in parallel:
- Track 2 (UI) and Track 3 (Domain) can start simultaneously
- Track 4 (Analytics) can start once Track 3 is done
- Track 5 (Settings) can be done anytime after Track 2

### Q: What happened to calendar and chatbot features?
**A:** They are documented in the `20251115-xx-future-*` folders for reference, but not part of the MVP. In the UI, show "Coming Soon" placeholders for these features.

### Q: Do I need to implement all tracks?
**A:** For MVP, implement Tracks 1-5. The future tracks (calendar, chatbot) are optional and can be added later.

### Q: What if I have questions specific to a feature?
**A:** Each track README has a "Next Steps" and "Resources" section. Also:
- Use `/liveview-guidelines` for LiveView patterns
- Use `/ash-guidelines` for Ash framework help
- Use `/phoenix-guidelines` for Phoenix conventions

### Q: How do I test as I build?
**A:** Each track has a "Testing" section with:
- Unit test examples
- Integration test strategies
- E2E test recommendations
- We already have Playwright set up for E2E tests

---

## UI Placeholders for Future Features

When building the UI (Track 2 & 5), show placeholders for future features:

### In Form Builder (Post-Submission Actions)
```heex
<div class="grid grid-cols-3 gap-4">
  <!-- Redirect URL - Active -->
  <button class="btn">Redirect URL</button>

  <!-- Calendar - Coming Soon -->
  <button class="btn btn-disabled" disabled>
    📅 Book a Demo
    <span class="badge">Coming Soon</span>
  </button>

  <!-- Chatbot - Coming Soon -->
  <button class="btn btn-disabled" disabled>
    💬 Open Chatbot
    <span class="badge">Coming Soon</span>
  </button>
</div>
```

### In Settings (Integrations Tab)
```heex
<div class="space-y-6">
  <!-- Calendar Integration - Coming Soon -->
  <div class="bg-card rounded-2xl border p-6 opacity-60">
    <div class="flex items-center justify-between">
      <h3>Calendar Integration</h3>
      <span class="badge badge-warning">Coming Soon</span>
    </div>
    <p class="text-sm text-muted-foreground">
      Google Calendar and Outlook integration will be available soon.
    </p>
  </div>

  <!-- Chatbot Settings - Coming Soon -->
  <div class="bg-card rounded-2xl border p-6 opacity-60">
    <div class="flex items-center justify-between">
      <h3>Chatbot Settings</h3>
      <span class="badge badge-warning">Coming Soon</span>
    </div>
    <p class="text-sm text-muted-foreground">
      AI chatbot configuration will be available soon.
    </p>
  </div>
</div>
```

### In Sidebar Navigation
```heex
<!-- Forms Module - Active -->
<div class="sidebar-module">
  <button phx-click="toggle_module" phx-value-module="forms">
    📄 Forms ▼
  </button>
  <ul class="sidebar-submenu">
    <li>Forms</li>
    <li>Analytics</li>
  </ul>
</div>

<!-- Future modules with "Coming Soon" badge -->
<div class="sidebar-module opacity-60">
  <div class="flex items-center justify-between">
    <span>📅 Calendar</span>
    <span class="badge badge-sm">Soon</span>
  </div>
</div>

<div class="sidebar-module opacity-60">
  <div class="flex items-center justify-between">
    <span>💬 Chatbot</span>
    <span class="badge badge-sm">Soon</span>
  </div>
</div>
```

---

## Success Criteria (MVP)

### Technical Metrics
- [ ] Tracks 1-5 completed
- [ ] Test coverage >70%
- [ ] Page load times <500ms
- [ ] Zero N+1 queries
- [ ] Mobile responsive (all breakpoints)
- [ ] Dark mode fully functional
- [ ] WCAG 2.1 AA compliant

### Feature Metrics
- [ ] Forms can be created and published
- [ ] Submissions are captured and stored
- [ ] Analytics show real-time data
- [ ] Settings are configurable
- [ ] "Coming Soon" placeholders for future features

### User Experience Metrics
- [ ] Form builder is intuitive
- [ ] Dashboard loads in <500ms
- [ ] No error states for happy path
- [ ] Clear feedback for all actions
- [ ] Future features clearly marked

---

## Resources & Documentation

### Internal Project Resources
- `CLAUDE.md` - Project overview and setup
- `/liveview-guidelines` - LiveView best practices
- `/ash-guidelines` - Ash framework conventions
- `/phoenix-guidelines` - Phoenix patterns
- `/elixir-guidelines` - Elixir language guidelines
- `/project-guidelines` - Project workflow & conventions

### External Documentation
- [Ash Framework Docs](https://hexdocs.pm/ash/)
- [Phoenix LiveView Docs](https://hexdocs.pm/phoenix_live_view/)
- [AshPostgres Docs](https://hexdocs.pm/ash_postgres/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)

### Figma Source Files
- `figma_src/205 Forms Dashboard/` - Full export (82 TSX files)
- `figma_src/205 Forms Dashboard/README.md` - Figma export README
- `figma_src/205 Forms Dashboard/package.json` - Dependencies reference
- See `FIGMA-COVERAGE-ANALYSIS.md` in this folder for complete component inventory

---

## Getting Help

### Stuck on a Specific Track?
1. Re-read the track's README thoroughly
2. Check the "Resources" section in that README
3. Review similar implementations in the codebase
4. Use the project skills (e.g., `/ash-basics`, `/liveview-guidelines`)

### Architectural Questions?
- Consult the Primary Overview (Track 1)
- Review the "Questions to Clarify" section
- Check existing patterns in `lib/clientt_crm_app/`

### Technical Blockers?
- Check the track's "Common Pitfalls to Avoid" section
- Review the "Testing Strategy" for debugging approaches
- Look at the "Performance Considerations" for optimization

---

## Notes on This Documentation

### Naming Convention
Folders are named `20251115-0{0-5}-forms-{topic}`:
- `20251115` - Date created (Nov 15, 2025)
- `00-05` - Track number (00 = overview, 01-05 = MVP tracks)
- `forms-{topic}` - Descriptive name
- `xx` - Future tracks (not in MVP)

### How This Was Created
This comprehensive planning was generated by reviewing:
1. The Figma Forms Dashboard export in `figma_src/205 Forms Dashboard/`
2. Existing Phoenix + Ash patterns in the codebase
3. Project guidelines in `CLAUDE.md` and skill files
4. The modular architecture described in the Figma docs

### Maintenance
As you implement:
- Update READMEs with learnings
- Add "Gotchas" sections for tricky parts
- Document any deviations from the plan
- Keep the Primary Overview in sync

---

**Status:** ✅ MVP Planning Complete - Ready for Implementation
**Next Step:** Read `../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md`
**Timeline:** 6 weeks for MVP (Tracks 1-5)

---

**Good luck with the implementation! 🚀**
