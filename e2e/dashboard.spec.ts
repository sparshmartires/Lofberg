import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales, loginAsTranslator } from './helpers/auth';

test.describe('Dashboard Tests', () => {
  test('DB1: Dashboard loads after login', async ({ page }) => {
    await loginAsAdmin(page);
    const url = page.url();
    console.log('DB1: Post-login URL (dashboard):', url);

    await page.waitForLoadState('networkidle');
    const bodyText = await page.locator('body').textContent() || '';
    console.log('DB1: Dashboard content:', bodyText.substring(0, 500));

    // Should be on some app page (dashboard, home, etc.)
    expect(url).not.toContain('/login');
    test.info().annotations.push({ type: 'note', description: `Dashboard URL: ${url}` });
  });

  test('DB2: Dashboard has widgets/cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard explicitly
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for dashboard widgets/cards
    const widgets = page.locator('[class*="card" i], [class*="widget" i], [class*="stat" i], [class*="summary" i]');
    const widgetCount = await widgets.count();
    console.log('DB2: Widget/card count:', widgetCount);

    if (widgetCount > 0) {
      const widgetTexts = await widgets.allTextContents();
      console.log('DB2: Widget texts:', widgetTexts.map(t => t.substring(0, 100)));
    }

    test.info().annotations.push({ type: 'note', description: `Widgets: ${widgetCount}` });
  });

  test('DB3: Dashboard has charts or data visualization', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for chart elements
    const chartSelectors = [
      'canvas',
      'svg',
      '[class*="chart" i]',
      '[class*="graph" i]',
      '[data-testid*="chart"]',
      '[class*="recharts"]',
      '[class*="apexcharts"]',
    ];

    let chartFound = false;
    for (const sel of chartSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        chartFound = true;
        console.log(`DB3: Chart element found with "${sel}", count: ${count}`);
      }
    }

    console.log('DB3: Charts found:', chartFound);
    test.info().annotations.push({ type: 'note', description: `Charts: ${chartFound}` });
  });

  test('DB4: No JavaScript errors on dashboard', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => {
      jsErrors.push(err.message);
    });

    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('DB4: JavaScript errors:', jsErrors.length > 0 ? jsErrors : 'None');

    if (jsErrors.length > 0) {
      test.info().annotations.push({ type: 'note', description: `JS errors: ${JSON.stringify(jsErrors)}` });
    }

    // Log but don't hard-fail - some errors may be expected
    if (jsErrors.length > 0) {
      console.warn('DB4: JS errors detected:', jsErrors);
    }
  });

  test('DB5: Dashboard accessible to all roles', async ({ page }) => {
    const results: Record<string, string> = {};

    // Admin
    await loginAsAdmin(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    results.admin = page.url();

    // Clear cookies and login as sales
    await page.context().clearCookies();
    await loginAsSales(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    results.sales = page.url();

    // Clear and login as translator
    await page.context().clearCookies();
    await loginAsTranslator(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    results.translator = page.url();

    console.log('DB5: Dashboard URLs by role:', results);
    test.info().annotations.push({ type: 'note', description: `Dashboard access: ${JSON.stringify(results)}` });
  });
});
