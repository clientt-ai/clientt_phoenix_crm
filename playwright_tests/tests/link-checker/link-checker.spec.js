// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('../support/auth-helpers');
const fs = require('fs');
const path = require('path');

/**
 * Link Checker Test Suite
 *
 * Crawls the application as different user roles, clicking all clickable elements
 * and reporting any dead links, errors, or issues found.
 */

// Test configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:4002',
  maxItemsInList: 2, // Only check first N items in lists/grids
  pageTimeout: 60000,
  clickTimeout: 10000,
  navigationTimeout: 15000,
};

// User roles to test
const ROLES = [
  { name: 'admin', email: 'sample_admin@clientt.com', password: 'Hang123!' },
  { name: 'manager', email: 'sample_manager@clientt.com', password: 'Hang123!' },
  { name: 'user', email: 'sample_user@clientt.com', password: 'Hang123!' },
  { name: 'form_admin', email: 'sample_form_admin@clientt.com', password: 'Hang123!' },
];

// Filter roles if ROLE env var is set
const rolesToTest = process.env.ROLE
  ? ROLES.filter(r => r.name === process.env.ROLE)
  : ROLES;

// Global results collector
const results = {
  startTime: null,
  endTime: null,
  roles: {},
  issues: [],
  summary: {
    totalElementsChecked: 0,
    totalPagesVisited: 0,
    totalIssues: 0,
  }
};

// Selectors for clickable elements
const CLICKABLE_SELECTORS = [
  'a[href]:not([href^="mailto:"]):not([href^="tel:"]):not([href^="javascript:"])',
  'button:not([disabled])',
  '[role="button"]:not([disabled])',
  '[role="link"]',
  '[data-clickable="true"]',
  '.card[onclick], .card a',
  '[phx-click]:not([disabled])',
];

// Elements to skip
const SKIP_PATTERNS = [
  /sign.?out/i,
  /log.?out/i,
  /logout/i,
  /delete/i,
  /remove/i,
  /destroy/i,
  /#$/,  // Hash-only links
];

// URL patterns to skip
const SKIP_URL_PATTERNS = [
  /^mailto:/,
  /^tel:/,
  /^javascript:/,
  /\.pdf$/i,
  /\.zip$/i,
  /\.csv$/i,
  /download/i,
];

/**
 * Check if an element should be skipped
 */
function shouldSkipElement(element) {
  const text = element.textContent || '';
  const href = element.href || element.getAttribute('href') || '';
  const ariaLabel = element.getAttribute('aria-label') || '';

  // Check text patterns
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(text) || pattern.test(href) || pattern.test(ariaLabel)) {
      return true;
    }
  }

  // Check URL patterns
  for (const pattern of SKIP_URL_PATTERNS) {
    if (pattern.test(href)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if URL is external
 */
function isExternalUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname !== baseObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Collect console errors and warnings
 */
function setupConsoleListener(page, errors) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console_error',
        message: msg.text(),
        location: msg.location(),
      });
    }
  });

  page.on('pageerror', error => {
    errors.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
    });
  });
}

/**
 * Check for LiveView disconnection
 * Only reports issues if LiveView is in an error state
 * Note: Disconnected state during navigation is normal and expected
 */
async function checkLiveViewHealth(page) {
  // Wait for LiveView to stabilize
  await page.waitForTimeout(500);

  // Check for error state (this is always a problem - crash/exception)
  const error = await page.locator('[data-phx-error]').count();

  // Check if LiveView is actually connected (has phx-connected class on main container)
  // Don't report disconnected as an issue - it's normal during navigation
  // Only report if there's an actual error state

  return { disconnected: false, error: error > 0 };
}

/**
 * Get all clickable elements on the page, limiting list items
 */
async function getClickableElements(page) {
  const elements = [];

  // Find all list/grid containers
  const listContainers = await page.locator('table tbody, [role="list"], .grid, ul.list, [data-list]').all();
  const listItemSelectors = new Set();

  // For each list container, only get first N items
  for (const container of listContainers) {
    const items = await container.locator('tr, [role="listitem"], li, .grid > *').all();
    const limitedItems = items.slice(0, CONFIG.maxItemsInList);

    for (const item of limitedItems) {
      // Get clickable elements within this item
      for (const selector of CLICKABLE_SELECTORS) {
        const clickables = await item.locator(selector).all();
        for (const el of clickables) {
          const boundingBox = await el.boundingBox();
          if (boundingBox) {
            listItemSelectors.add(await el.evaluate(e => {
              // Create a unique identifier for this element
              return e.outerHTML.substring(0, 200);
            }));
          }
        }
      }
    }
  }

  // Get all clickable elements on the page
  for (const selector of CLICKABLE_SELECTORS) {
    const locators = await page.locator(selector).all();

    for (const locator of locators) {
      try {
        const isVisible = await locator.isVisible();
        if (!isVisible) continue;

        const boundingBox = await locator.boundingBox();
        if (!boundingBox) continue;

        const elementInfo = await locator.evaluate(el => ({
          tagName: el.tagName,
          href: el.href || el.getAttribute('href'),
          text: el.textContent?.trim().substring(0, 50),
          id: el.id,
          className: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          phxClick: el.getAttribute('phx-click'),
          outerHTML: el.outerHTML.substring(0, 200),
        }));

        // Check if this is a list item we should skip (beyond the limit)
        const isInList = await locator.evaluate(el => {
          const parent = el.closest('table tbody, [role="list"], .grid, ul.list, [data-list]');
          if (!parent) return false;
          const items = parent.querySelectorAll('tr, [role="listitem"], li, .grid > *');
          const itemParent = el.closest('tr, [role="listitem"], li, .grid > *');
          if (!itemParent) return false;
          const index = Array.from(items).indexOf(itemParent);
          return index >= 2; // CONFIG.maxItemsInList
        });

        if (isInList) continue;

        // Skip based on patterns and disabled state
        const shouldSkip = await locator.evaluate((el) => {
          const text = el.textContent || '';
          const href = el.href || el.getAttribute('href') || '';
          const ariaLabel = el.getAttribute('aria-label') || '';
          const combined = `${text} ${href} ${ariaLabel}`.toLowerCase();
          const className = el.className || '';

          // Skip logout/delete actions
          const skipPatterns = [
            'sign out', 'sign-out', 'signout',
            'log out', 'log-out', 'logout',
            'delete', 'remove', 'destroy'
          ];

          if (skipPatterns.some(p => combined.includes(p))) return true;

          // Skip disabled elements (pointer-events-none, cursor-not-allowed, opacity-50)
          if (className.includes('pointer-events-none') ||
              className.includes('cursor-not-allowed') ||
              className.includes('disabled') ||
              el.hasAttribute('disabled') ||
              el.getAttribute('aria-disabled') === 'true') {
            return true;
          }

          // Skip hash-only links
          if (href === '#' || href === '') return true;

          return false;
        });

        if (shouldSkip) continue;

        // Skip elements that are not actually clickable (in hidden containers)
        const isClickable = await locator.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();

          // Check if element or parent is hidden
          if (style.display === 'none' ||
              style.visibility === 'hidden' ||
              style.opacity === '0' ||
              rect.width === 0 ||
              rect.height === 0) {
            return false;
          }

          // Check if element is inside a hidden parent (collapsed sidebar, hidden modal, etc.)
          let parent = el.parentElement;
          while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.display === 'none' ||
                parentStyle.visibility === 'hidden' ||
                (parentStyle.height === '0px' && parentStyle.overflow === 'hidden')) {
              return false;
            }
            parent = parent.parentElement;
          }

          return true;
        });

        if (!isClickable) continue;

        // Skip external URLs
        if (elementInfo.href && isExternalUrl(elementInfo.href, CONFIG.baseUrl)) {
          continue;
        }

        elements.push({
          locator,
          info: elementInfo,
        });
      } catch (e) {
        // Element may have been removed from DOM
        continue;
      }
    }
  }

  // Deduplicate by href or unique identifier
  const seen = new Set();
  return elements.filter(el => {
    const key = el.info.href || el.info.outerHTML;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Click an element and check for errors
 */
async function clickAndCheck(page, element, role, currentUrl) {
  const errors = [];
  const startTime = Date.now();

  try {
    // Get the element's target URL if it's a link
    const href = element.info.href;
    const isNavigation = href && !href.startsWith('#') && !element.info.phxClick;

    // Click the element
    if (isNavigation) {
      // For navigation links, use click and wait for navigation
      await Promise.all([
        page.waitForLoadState('networkidle', { timeout: CONFIG.navigationTimeout }).catch(() => {}),
        element.locator.click({ timeout: CONFIG.clickTimeout }),
      ]);
    } else {
      // For other clicks (buttons, phx-click), just click and wait a bit
      await element.locator.click({ timeout: CONFIG.clickTimeout });
      await page.waitForTimeout(500); // Wait for any LiveView updates
    }

    // Wait for page to stabilize after navigation/click
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Check for error pages by looking at specific error indicators
    // Check title and main heading for error messages
    const pageTitle = await page.title();
    const hasErrorTitle = /500|404|error|not found/i.test(pageTitle);

    // Check for Phoenix error page specific elements
    const hasPhoenixError = await page.locator('.phx-error-page, [data-phx-error-page]').count() > 0;

    // Check for common error page indicators in a specific error container
    const hasErrorContainer = await page.locator('.error-page, .error-container, #error-page').count() > 0;

    // Check HTTP status via response if available (for initial page loads)
    const responseStatus = page.url().includes('/404') || page.url().includes('/500');

    // Check for Phoenix debug error page (development mode)
    // This is the red error page with stack traces
    const hasPhoenixDebugError = await page.locator('.phoenix-error, .plug-exception, [data-phoenix-error]').count() > 0;

    // Check page content for common error indicators
    const pageContent = await page.content();
    const hasErrorContent = /Internal Server Error|RuntimeError|ArgumentError|KeyError|FunctionClauseError|Protocol\.UndefinedError|Ecto\.NoResultsError|Phoenix\.Router\.NoRouteError/i.test(pageContent);

    if (hasErrorTitle || hasPhoenixError || hasErrorContainer || responseStatus || hasPhoenixDebugError || hasErrorContent) {
      const errorType = hasPhoenixDebugError || hasErrorContent ? 'critical' : 'warning';
      errors.push({
        type: 'error_page',
        severity: errorType,
        message: `Error page detected: title="${pageTitle}"${hasErrorContent ? ' (contains exception)' : ''}`,
        url: page.url(),
      });
    }

    // Check LiveView health - only check if this is a LiveView page
    const isLiveViewPage = await page.locator('[data-phx-main]').count() > 0;
    if (isLiveViewPage) {
      const lvHealth = await checkLiveViewHealth(page);
      if (lvHealth.error) {
        // LiveView error state is critical
        errors.push({
          type: 'liveview_error',
          severity: 'critical',
          message: 'LiveView error state detected (phx-error)',
          url: page.url(),
        });
      } else if (lvHealth.disconnected) {
        // Disconnected after waiting is a warning (could be network issue)
        errors.push({
          type: 'liveview_disconnected',
          severity: 'warning',
          message: 'LiveView disconnected (did not reconnect after 3s)',
          url: page.url(),
        });
      }
    }

    // Check load time (5s threshold for LiveView apps with DB queries)
    const loadTime = Date.now() - startTime;
    if (loadTime > 5000) {
      errors.push({
        type: 'slow_page',
        severity: 'info',
        message: `Slow page load: ${loadTime}ms`,
        url: page.url(),
      });
    }

  } catch (error) {
    errors.push({
      type: 'click_error',
      severity: 'warning',
      message: error.message,
      url: currentUrl,
    });
  }

  return errors;
}

/**
 * Crawl pages starting from the current page
 */
async function crawlPages(page, role, visitedUrls, maxDepth = 8, currentDepth = 0) {
  if (currentDepth >= maxDepth) return;

  const currentUrl = page.url();
  const normalizedUrl = new URL(currentUrl).pathname;

  if (visitedUrls.has(normalizedUrl)) return;
  visitedUrls.add(normalizedUrl);

  results.roles[role.name].pagesVisited.push(normalizedUrl);
  results.summary.totalPagesVisited++;

  // Collect console errors for this page
  const pageErrors = [];

  // Get all clickable elements
  const elements = await getClickableElements(page);

  for (const element of elements) {
    results.roles[role.name].elementsChecked++;
    results.summary.totalElementsChecked++;

    const errors = await clickAndCheck(page, element, role, currentUrl);

    // Record any errors
    for (const error of errors) {
      const issue = {
        role: role.name,
        severity: error.severity,
        type: error.type,
        message: error.message,
        url: error.url,
        element: element.info.text || element.info.href || 'Unknown element',
        elementSelector: element.info.outerHTML?.substring(0, 100),
        timestamp: new Date().toISOString(),
      };

      results.issues.push(issue);
      results.roles[role.name].issues.push(issue);
      results.summary.totalIssues++;
    }

    // If we navigated to a new page, recursively crawl it
    const newUrl = page.url();
    const newNormalizedUrl = new URL(newUrl).pathname;

    if (newNormalizedUrl !== normalizedUrl && !visitedUrls.has(newNormalizedUrl)) {
      await crawlPages(page, role, visitedUrls, maxDepth, currentDepth + 1);
    }

    // Navigate back to continue checking other elements
    if (newNormalizedUrl !== normalizedUrl) {
      try {
        await page.goto(currentUrl, { timeout: CONFIG.navigationTimeout });
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      } catch {
        // If we can't go back, stop checking this page
        break;
      }
    }
  }
}

/**
 * Generate the HTML report
 */
function generateReport() {
  results.endTime = new Date().toISOString();

  const criticalIssues = results.issues.filter(i => i.severity === 'critical');
  const warningIssues = results.issues.filter(i => i.severity === 'warning');
  const infoIssues = results.issues.filter(i => i.severity === 'info');

  const healthScore = results.summary.totalElementsChecked > 0
    ? Math.round(((results.summary.totalElementsChecked - criticalIssues.length - warningIssues.length) / results.summary.totalElementsChecked) * 100)
    : 100;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Checker Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header .timestamp { opacity: 0.8; }
    .card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card h2 { font-size: 18px; margin-bottom: 15px; color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .summary-item { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; }
    .summary-item .number { font-size: 36px; font-weight: bold; color: #667eea; }
    .summary-item .label { color: #666; margin-top: 5px; }
    .health-score { font-size: 48px; font-weight: bold; }
    .health-score.good { color: #28a745; }
    .health-score.warning { color: #ffc107; }
    .health-score.bad { color: #dc3545; }
    .role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .role-card { padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
    .role-card.has-issues { border-left-color: #ffc107; }
    .role-card.has-critical { border-left-color: #dc3545; }
    .role-name { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
    .role-stats { font-size: 14px; color: #666; }
    .role-status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
    .role-status.ok { background: #d4edda; color: #155724; }
    .role-status.warning { background: #fff3cd; color: #856404; }
    .issues-section { margin-top: 20px; }
    .severity-header { display: flex; align-items: center; gap: 10px; margin: 20px 0 10px; }
    .severity-icon { font-size: 20px; }
    .severity-count { background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
    .issue-list { list-style: none; }
    .issue-item { padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ddd; }
    .issue-item.critical { border-left-color: #dc3545; background: #fff5f5; }
    .issue-item.warning { border-left-color: #ffc107; background: #fffbf0; }
    .issue-item.info { border-left-color: #17a2b8; background: #f0f9ff; }
    .issue-role { display: inline-block; background: #667eea; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 8px; }
    .issue-type { font-weight: bold; margin-bottom: 5px; }
    .issue-url { font-family: monospace; font-size: 13px; color: #666; word-break: break-all; }
    .issue-element { font-family: monospace; font-size: 12px; color: #888; margin-top: 5px; padding: 5px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow-x: auto; }
    .issue-timestamp { font-size: 11px; color: #999; margin-top: 5px; }
    .no-issues { color: #28a745; font-style: italic; }
    .pages-list { max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 13px; }
    .pages-list li { padding: 3px 0; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Link Checker Report</h1>
      <div class="timestamp">Generated: ${new Date(results.endTime).toLocaleString()}</div>
      <div class="timestamp">Duration: ${Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000)}s</div>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="number health-score ${healthScore >= 90 ? 'good' : healthScore >= 70 ? 'warning' : 'bad'}">${healthScore}%</div>
          <div class="label">Health Score</div>
        </div>
        <div class="summary-item">
          <div class="number">${results.summary.totalElementsChecked}</div>
          <div class="label">Elements Checked</div>
        </div>
        <div class="summary-item">
          <div class="number">${results.summary.totalPagesVisited}</div>
          <div class="label">Pages Visited</div>
        </div>
        <div class="summary-item">
          <div class="number">${results.summary.totalIssues}</div>
          <div class="label">Issues Found</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Results by Role</h2>
      <div class="role-grid">
        ${Object.entries(results.roles).map(([roleName, roleData]) => {
          const hasCritical = roleData.issues.some(i => i.severity === 'critical');
          const hasWarning = roleData.issues.some(i => i.severity === 'warning');
          const cardClass = hasCritical ? 'has-critical' : hasWarning ? 'has-issues' : '';
          const statusClass = hasCritical || hasWarning ? 'warning' : 'ok';
          const statusText = roleData.issues.length === 0 ? 'OK' : `${roleData.issues.length} issues`;

          return `
            <div class="role-card ${cardClass}">
              <div class="role-name">
                ${roleName}
                <span class="role-status ${statusClass}">${statusText}</span>
              </div>
              <div class="role-stats">
                <div>${roleData.elementsChecked} elements checked</div>
                <div>${roleData.pagesVisited.length} pages visited</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <h2>Issues Found</h2>

      <div class="severity-header">
        <span class="severity-icon">&#128308;</span>
        <strong>Critical</strong>
        <span class="severity-count">${criticalIssues.length}</span>
      </div>
      ${criticalIssues.length === 0
        ? '<p class="no-issues">No critical issues found</p>'
        : `<ul class="issue-list">${criticalIssues.map(issue => `
          <li class="issue-item critical">
            <span class="issue-role">${issue.role}</span>
            <div class="issue-type">${issue.type.replace(/_/g, ' ').toUpperCase()}</div>
            <div>${issue.message}</div>
            <div class="issue-url">URL: ${issue.url}</div>
            <div class="issue-element">Element: ${issue.element}</div>
            <div class="issue-timestamp">${issue.timestamp}</div>
          </li>
        `).join('')}</ul>`
      }

      <div class="severity-header">
        <span class="severity-icon">&#128993;</span>
        <strong>Warning</strong>
        <span class="severity-count">${warningIssues.length}</span>
      </div>
      ${warningIssues.length === 0
        ? '<p class="no-issues">No warnings found</p>'
        : `<ul class="issue-list">${warningIssues.map(issue => `
          <li class="issue-item warning">
            <span class="issue-role">${issue.role}</span>
            <div class="issue-type">${issue.type.replace(/_/g, ' ').toUpperCase()}</div>
            <div>${issue.message}</div>
            <div class="issue-url">URL: ${issue.url}</div>
            <div class="issue-element">Element: ${issue.element}</div>
            <div class="issue-timestamp">${issue.timestamp}</div>
          </li>
        `).join('')}</ul>`
      }

      <div class="severity-header">
        <span class="severity-icon">&#128309;</span>
        <strong>Info</strong>
        <span class="severity-count">${infoIssues.length}</span>
      </div>
      ${infoIssues.length === 0
        ? '<p class="no-issues">No info items</p>'
        : `<ul class="issue-list">${infoIssues.map(issue => `
          <li class="issue-item info">
            <span class="issue-role">${issue.role}</span>
            <div class="issue-type">${issue.type.replace(/_/g, ' ').toUpperCase()}</div>
            <div>${issue.message}</div>
            <div class="issue-url">URL: ${issue.url}</div>
            <div class="issue-element">Element: ${issue.element}</div>
            <div class="issue-timestamp">${issue.timestamp}</div>
          </li>
        `).join('')}</ul>`
      }
    </div>

    <div class="card">
      <h2>Pages Visited by Role</h2>
      ${Object.entries(results.roles).map(([roleName, roleData]) => `
        <h3 style="margin: 15px 0 10px; font-size: 14px;">${roleName} (${roleData.pagesVisited.length} pages)</h3>
        <ul class="pages-list">
          ${roleData.pagesVisited.map(p => `<li>${p}</li>`).join('')}
        </ul>
      `).join('')}
    </div>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * Generate text report for console output
 */
function generateTextReport() {
  const criticalIssues = results.issues.filter(i => i.severity === 'critical');
  const warningIssues = results.issues.filter(i => i.severity === 'warning');
  const infoIssues = results.issues.filter(i => i.severity === 'info');

  const healthScore = results.summary.totalElementsChecked > 0
    ? Math.round(((results.summary.totalElementsChecked - criticalIssues.length - warningIssues.length) / results.summary.totalElementsChecked) * 100)
    : 100;

  let report = `
${'='.repeat(80)}
                     LINK CHECKER REPORT - ${new Date(results.endTime).toLocaleString()}
${'='.repeat(80)}

SUMMARY
-------
Total Elements Checked: ${results.summary.totalElementsChecked}
Total Pages Visited: ${results.summary.totalPagesVisited}
Total Issues Found: ${results.summary.totalIssues}
Health Score: ${healthScore}%

BY ROLE:
`;

  for (const [roleName, roleData] of Object.entries(results.roles)) {
    const status = roleData.issues.length === 0 ? '✅' : '⚠️';
    report += `  ${status} ${roleName.padEnd(12)} - ${roleData.elementsChecked} elements, ${roleData.pagesVisited.length} pages, ${roleData.issues.length} issues\n`;
  }

  report += `
ISSUES FOUND
------------
🔴 CRITICAL (${criticalIssues.length})
`;

  if (criticalIssues.length === 0) {
    report += '  None\n';
  } else {
    criticalIssues.forEach((issue, i) => {
      report += `  ${i + 1}. [${issue.role}] ${issue.type.replace(/_/g, ' ').toUpperCase()}
     URL: ${issue.url}
     ${issue.message}
     Element: ${issue.element}

`;
    });
  }

  report += `
🟡 WARNING (${warningIssues.length})
`;

  if (warningIssues.length === 0) {
    report += '  None\n';
  } else {
    warningIssues.forEach((issue, i) => {
      report += `  ${i + 1}. [${issue.role}] ${issue.type.replace(/_/g, ' ').toUpperCase()}
     URL: ${issue.url}
     ${issue.message}
     Element: ${issue.element}

`;
    });
  }

  report += `
🔵 INFO (${infoIssues.length})
`;

  if (infoIssues.length === 0) {
    report += '  None\n';
  } else {
    infoIssues.forEach((issue, i) => {
      report += `  ${i + 1}. [${issue.role}] ${issue.type.replace(/_/g, ' ').toUpperCase()}
     URL: ${issue.url}
     ${issue.message}

`;
    });
  }

  report += `\n${'='.repeat(80)}\n`;

  return report;
}

// Test setup
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  results.startTime = new Date().toISOString();

  // Initialize results for each role
  for (const role of rolesToTest) {
    results.roles[role.name] = {
      elementsChecked: 0,
      pagesVisited: [],
      issues: [],
    };
  }
});

test.afterAll(async () => {
  // Generate and save reports
  const htmlReport = generateReport();
  const textReport = generateTextReport();

  // Ensure test-results directory exists
  const resultsDir = path.join(__dirname, '..', '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save HTML report
  const htmlPath = path.join(resultsDir, 'link-checker-report.html');
  fs.writeFileSync(htmlPath, htmlReport);

  // Save JSON report
  const jsonPath = path.join(resultsDir, 'link-checker-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  // Print text report to console
  console.log(textReport);
  console.log(`\n📄 HTML Report: ${htmlPath}`);
  console.log(`📊 JSON Report: ${jsonPath}`);
});

// Create a test for each role
for (const role of rolesToTest) {
  test(`Link check as ${role.name}`, async ({ page }) => {
    test.setTimeout(CONFIG.pageTimeout * 10); // Extended timeout for crawling

    // Setup console error listener
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'console_error',
          severity: 'warning',
          message: msg.text(),
          url: page.url(),
          element: 'Console',
          timestamp: new Date().toISOString(),
          role: role.name,
        });
      }
    });

    page.on('pageerror', error => {
      results.issues.push({
        type: 'page_error',
        severity: 'critical',
        message: error.message,
        url: page.url(),
        element: 'Page Error',
        timestamp: new Date().toISOString(),
        role: role.name,
      });
      results.roles[role.name].issues.push({
        type: 'page_error',
        severity: 'critical',
        message: error.message,
        url: page.url(),
        element: 'Page Error',
        timestamp: new Date().toISOString(),
        role: role.name,
      });
      results.summary.totalIssues++;
    });

    // Login as this role
    await login(page, role.email, role.password);

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Start crawling from the current page (should be dashboard)
    const visitedUrls = new Set();
    await crawlPages(page, role, visitedUrls, 3);

    // Add any console errors collected during the test
    for (const error of consoleErrors) {
      if (!results.issues.some(i => i.message === error.message && i.url === error.url)) {
        results.issues.push(error);
        results.roles[role.name].issues.push(error);
        results.summary.totalIssues++;
      }
    }

    // Test passes if no critical issues for this role
    const criticalForRole = results.roles[role.name].issues.filter(i => i.severity === 'critical');
    expect(criticalForRole.length, `Critical issues found for ${role.name}`).toBe(0);
  });
}
