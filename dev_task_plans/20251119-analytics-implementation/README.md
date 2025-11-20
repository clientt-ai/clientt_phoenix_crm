# Analytics Page Implementation

## Status: NOT IMPLEMENTED

This task implements the `/forms/analytics` route for the Forms Portal analytics dashboard.

**Created:** 2024-11-19
**Priority:** Medium
**Estimated Time:** 3-5 days
**Dependencies:** Existing Forms and Submissions domain models

## Overview

The Analytics page provides comprehensive metrics and visualizations for form performance, submission tracking, and lead insights. The detailed specification exists in:
- `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-04-forms-analytics-kpis/README.md`

## Current State

- [ ] **Route not created** - `/forms/analytics` returns 404
- [ ] **Sidebar link disabled** - Shows "Soon" badge in navigation
- [ ] **No LiveView exists** - `AnalyticsLive.Index` not implemented
- [ ] **No Analytics module** - Business logic not implemented

## Implementation TODOs

### Phase 1: Route & Basic LiveView
- [ ] Add route to `router.ex`: `live "/forms/analytics", AnalyticsLive.Index, :index`
- [ ] Create `lib/clientt_crm_app_web/live/analytics_live/index.ex`
- [ ] Create basic template with page structure
- [ ] Enable sidebar link (remove `disabled={true}`)
- [ ] Verify navigation works

### Phase 2: Analytics Module
- [ ] Create `lib/clientt_crm_app/analytics.ex` with:
  - [ ] `get_dashboard_kpis/1` - Calculate main KPIs
  - [ ] `get_submissions_over_time/2` - Time-series data
  - [ ] `get_top_forms/2` - Top performing forms
  - [ ] `get_lead_sources/1` - UTM/source tracking
  - [ ] `get_field_completion_rates/1` - Field analytics
- [ ] Add Timex dependency if not present

### Phase 3: Form Resource Calculations
- [ ] Add to `lib/clientt_crm_app/forms/form.ex`:
  - [ ] `submissions_this_month` calculation
  - [ ] `submissions_last_month` calculation
  - [ ] `submission_change_percent` calculation
  - [ ] `avg_completion_time_seconds` calculation
  - [ ] Required aggregates (new_submissions_count, etc.)

### Phase 4: Database Indexes
- [ ] Add indexes for query performance:
  ```sql
  CREATE INDEX submissions_submitted_at_index ON submissions(submitted_at DESC);
  CREATE INDEX submissions_status_index ON submissions(status);
  ```

### Phase 5: KPI Components
- [ ] Implement KPI cards showing:
  - [ ] Total Forms (with change %)
  - [ ] Total Submissions (with change %)
  - [ ] Conversion Rate (with change %)
  - [ ] Active Users (with change %)
- [ ] Style with DaisyUI/Tailwind

### Phase 6: Chart Components
- [ ] Add Chart.js dependency or use Contex
- [ ] Create `lib/clientt_crm_app_web/components/stats_chart.ex`
- [ ] Create JS hook `assets/js/hooks/chart.js`
- [ ] Implement charts:
  - [ ] Submissions Over Time (line chart)
  - [ ] Lead Sources (pie/bar chart)
  - [ ] Top Forms (bar chart)
  - [ ] Field Completion Rates (horizontal bar)

### Phase 7: Period Selection
- [ ] Add period selector (Daily/Weekly/Monthly)
- [ ] Handle `change_period` event
- [ ] Update charts based on selected period

### Phase 8: Testing
- [ ] Unit tests for `Analytics` module
- [ ] LiveView tests for `AnalyticsLive.Index`
- [ ] Playwright E2E tests (see existing spec)

### Phase 9: Performance
- [ ] Test with realistic data volumes
- [ ] Verify page load <1s
- [ ] Add Cachex only if needed (per MVP decision)

## Files to Create

```
lib/
├── clientt_crm_app/
│   └── analytics.ex                    # Business logic
└── clientt_crm_app_web/
    ├── live/
    │   └── analytics_live/
    │       └── index.ex                # LiveView
    └── components/
        └── stats_chart.ex              # Chart component

assets/
└── js/
    └── hooks/
        └── chart.js                    # Chart.js hook

priv/
└── repo/
    └── migrations/
        └── XXXXXX_add_analytics_indexes.exs
```

## Files to Modify

- `lib/clientt_crm_app_web/router.ex` - Add analytics route
- `lib/clientt_crm_app_web/components/layouts.ex` - Enable sidebar link
- `lib/clientt_crm_app/forms/form.ex` - Add calculations
- `assets/js/app.js` - Register chart hook
- `mix.exs` - Add dependencies (Chart.js, Timex if needed)

## Acceptance Criteria

- [ ] User can navigate to `/forms/analytics` from sidebar
- [ ] Page displays 4 KPI cards with correct values
- [ ] Charts render with real data from submissions
- [ ] Period selector updates chart data
- [ ] Page loads in <1 second
- [ ] Works correctly with multitenancy (tenant scoping)

## Reference Documents

- **Detailed Spec:** `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-04-forms-analytics-kpis/README.md`
- **E2E Tests:** `dev_task-prompts_and_plans/20251115-figma_205_forms_dashboard/20251115-04-forms-analytics-kpis/E2E-TESTS.md`
- **Figma Source:** `figma_src/205 Forms Dashboard/src/components/pages/FormsAnalytics.tsx`

## Notes

- This feature was marked as MVP-required per Q13 decision
- No caching or background jobs in MVP (per Q9, Q23 decisions)
- Start with real-time calculations, optimize only if >1s load time
- CSV export only for MVP (no Excel/PDF)

## Related Issues

- Sidebar currently shows Analytics with "Soon" badge
- Dashboard KPI cards exist but don't link to detailed analytics
- Submission data exists but isn't being visualized
