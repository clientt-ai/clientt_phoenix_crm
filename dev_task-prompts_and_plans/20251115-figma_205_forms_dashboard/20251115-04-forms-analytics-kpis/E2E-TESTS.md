# E2E Tests - Analytics & KPIs

**Track:** 04 - Forms Analytics & KPIs
**Priority:** P2 (Features) - Run Nightly
**Test Count:** 5-7 tests
**Execution Time:** 5-8 minutes
**Run:** Nightly builds

---

## Overview

This track focuses on **analytics and KPI tests** that verify dashboard metrics, per-form analytics, and chart visualizations.

**Test Coverage:**
- ✅ Dashboard KPIs (Total Forms, Submissions, Conversion Rate)
- ✅ Per-form analytics
- ✅ Chart rendering and data visualization
- ✅ Date range filtering

---

## Test Location

```
playwright_tests/tests/forms_dashboard/features/analytics/
├── dashboard-kpis.spec.js
├── form-analytics.spec.js
└── charts-visualization.spec.js
```

---

## Test Suites

### 1. Dashboard KPIs Tests (3-4 tests)
**File:** `dashboard-kpis.spec.js`

**KPI Calculations:**
- **Total Forms** = count of all forms
- **Total Submissions** = count of all submissions across all forms
- **Conversion Rate** = (total submissions / total form views) * 100

**Tests:**
- ✅ Total Forms KPI shows correct count
- ✅ Total Submissions KPI shows correct count
- ✅ Conversion Rate KPI calculates correctly
- ✅ KPIs update after creating form/submission

**Example:**
```javascript
test('dashboard KPIs show accurate counts', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: 3 forms exist with specific submission counts
  await createFormWithSubmissions(page, 'Contact Us', 10);
  await createFormWithSubmissions(page, 'Newsletter', 5);
  await createFormWithSubmissions(page, 'Survey', 0);

  // When: I navigate to the dashboard
  await page.goto('/dashboard');

  // Then: Total Forms shows 3
  const totalFormsKPI = page.locator('[data-test="kpi-total-forms"]');
  const formsValue = await totalFormsKPI.locator('[data-test="kpi-value"]').textContent();
  expect(formsValue.trim()).toBe('3');

  // And: Total Submissions shows 15
  const submissionsKPI = page.locator('[data-test="kpi-total-submissions"]');
  const submissionsValue = await submissionsKPI.locator('[data-test="kpi-value"]').textContent();
  expect(submissionsValue.trim()).toBe('15');
});

test('conversion rate calculates correctly', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: A form with known views and submissions
  const formSlug = 'contact-us';
  await createFormWithViewsAndSubmissions(page, formSlug, {
    views: 100,
    submissions: 25
  });

  await page.goto('/dashboard');

  // Then: Conversion Rate = (25 / 100) * 100 = 25%
  const conversionKPI = page.locator('[data-test="kpi-conversion-rate"]');
  const conversionValue = await conversionKPI.locator('[data-test="kpi-value"]').textContent();
  expect(conversionValue.trim()).toBe('25%');
});

test('KPIs update in real-time after creating form', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/dashboard');

  // Record initial count
  const initialCount = await page.locator('[data-test="kpi-total-forms"] [data-test="kpi-value"]').textContent();

  // Create a new form
  await page.click('[data-test="quick-action-create-form"]');
  await page.fill('[data-test="form-name"]', 'New Form');
  await page.click('[data-test="add-field-text"]');
  await page.fill('[data-test="field-0-label"]', 'Name');
  await page.click('[data-test="save-form"]');

  // Navigate back to dashboard
  await page.goto('/dashboard');

  // KPI should increment by 1
  const newCount = await page.locator('[data-test="kpi-total-forms"] [data-test="kpi-value"]').textContent();
  expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
});
```

**Why Important:** Dashboard KPIs provide at-a-glance metrics - accuracy is critical for decision-making.

---

### 2. Per-Form Analytics Tests (2-3 tests)
**File:** `form-analytics.spec.js`

**Tests:**
- ✅ Submission count for specific form
- ✅ Conversion rate for specific form
- ✅ Submission trend chart shows correct data

**Example:**
```javascript
test('form detail page shows submission count', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: A form with 42 submissions
  const formSlug = 'contact-us';
  await createFormWithSubmissions(page, formSlug, 42);

  // When: I view the form details
  await page.goto(`/forms/${formSlug}`);

  // Then: Submission count shows 42
  const submissionCount = page.locator('[data-test="form-submission-count"]');
  expect(await submissionCount.textContent()).toContain('42');
});

test('form detail shows conversion rate', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: A form with 200 views, 40 submissions
  const formSlug = 'contact-us';
  await createFormWithViewsAndSubmissions(page, formSlug, {
    views: 200,
    submissions: 40
  });

  await page.goto(`/forms/${formSlug}`);

  // Then: Conversion rate = 20%
  const conversionRate = page.locator('[data-test="form-conversion-rate"]');
  expect(await conversionRate.textContent()).toContain('20%');
});
```

---

### 3. Charts & Visualization Tests (2-3 tests)
**File:** `charts-visualization.spec.js`

**Tests:**
- ✅ Submissions over time chart renders
- ✅ Chart shows correct data points
- ✅ Date range filter updates chart data

**Example:**
```javascript
test('submissions over time chart renders', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  await page.goto('/dashboard');

  // Chart element is present
  const chart = page.locator('[data-test="submissions-chart"]');
  await expect(chart).toBeVisible();

  // Chart canvas is rendered
  const canvas = chart.locator('canvas');
  await expect(canvas).toBeVisible();

  // Chart has data
  const hasData = await chart.locator('[data-test="chart-no-data"]').isVisible();
  expect(hasData).toBe(false);
});

test('date range filter updates chart', async ({ page }) => {
  test.use({ storageState: 'playwright/.auth/form-admin.json' });

  // Given: Submissions exist over time
  await createSubmissionsOverTime(page, {
    '2025-11-01': 5,
    '2025-11-08': 10,
    '2025-11-15': 15,
  });

  await page.goto('/dashboard');

  // Initially showing last 30 days
  let chartData = await getChartData(page, '[data-test="submissions-chart"]');
  expect(chartData.labels.length).toBeGreaterThan(20); // ~30 days

  // When: I filter to last 7 days
  await page.selectOption('[data-test="date-range-filter"]', '7');

  // Then: Chart updates to show only 7 days
  chartData = await getChartData(page, '[data-test="submissions-chart"]');
  expect(chartData.labels.length).toBe(7);

  // And: Most recent data point is higher
  const latestValue = chartData.data[chartData.data.length - 1];
  expect(latestValue).toBeGreaterThan(10); // 15 submissions on 11-15
});

async function getChartData(page, selector) {
  // Helper to extract Chart.js data
  return await page.evaluate((sel) => {
    const chart = document.querySelector(sel);
    const chartInstance = Chart.getChart(chart);
    return {
      labels: chartInstance.data.labels,
      data: chartInstance.data.datasets[0].data,
    };
  }, selector);
}
```

**Why Important:** Visual analytics help users understand trends - charts must render correctly and show accurate data.

---

## Test Data Setup

### Analytics Helpers
```javascript
// support/helpers/analytics.js

export async function createFormWithSubmissions(page, formName, count) {
  // Create form
  await createForm(page, { name: formName });

  // Create submissions
  for (let i = 0; i < count; i++) {
    await submitForm(page, formName, {
      'Name': `User ${i + 1}`,
      'Email': `user${i + 1}@example.com`,
    });
  }
}

export async function createFormWithViewsAndSubmissions(page, formSlug, { views, submissions }) {
  // Create form
  await createForm(page, { name: formSlug });

  // Simulate views via API or database
  await page.evaluate(async (slug, viewCount) => {
    await fetch(`/api/forms/${slug}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: viewCount })
    });
  }, formSlug, views);

  // Create submissions
  for (let i = 0; i < submissions; i++) {
    await submitForm(page, formSlug, { /* data */ });
  }
}

export async function createSubmissionsOverTime(page, dateMap) {
  // dateMap: { '2025-11-01': 5, '2025-11-08': 10 }
  for (const [date, count] of Object.entries(dateMap)) {
    for (let i = 0; i < count; i++) {
      await createSubmissionWithDate(page, date);
    }
  }
}
```

---

## Page Objects

### DashboardPage
```javascript
// support/pages/DashboardPage.js
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.totalFormsKPI = page.locator('[data-test="kpi-total-forms"]');
    this.totalSubmissionsKPI = page.locator('[data-test="kpi-total-submissions"]');
    this.conversionRateKPI = page.locator('[data-test="kpi-conversion-rate"]');
    this.submissionsChart = page.locator('[data-test="submissions-chart"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async getKPIValue(kpiName) {
    const kpi = this.page.locator(`[data-test="kpi-${kpiName}"]`);
    return await kpi.locator('[data-test="kpi-value"]').textContent();
  }

  async selectDateRange(days) {
    await this.page.selectOption('[data-test="date-range-filter"]', days.toString());
    await this.page.waitForTimeout(500); // Wait for chart update
  }
}
```

---

## Success Criteria

- [ ] All KPI calculations are accurate
- [ ] KPIs update in real-time after data changes
- [ ] Charts render correctly with accurate data
- [ ] Date range filters work properly
- [ ] Tests pass in all 3 browsers

---

## Related Documentation

- [Analytics Implementation](./README.md) - KPI calculations and chart setup
- [Primary Overview](../20251115-01-forms-dashboard-primary/00-PRIMARY-OVERVIEW.md) - Feature requirements
- [Figma Source](../../figma_src/205 Forms Dashboard/src/components/pages/DashboardPage.tsx) - Original designs

---

**Priority:** P2 (Features)
**Status:** ✅ Ready for implementation
**Next Step:** Implement analytics features, then write KPI and chart tests
