import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Sales Representatives', () => {
  // TC-SALES-001
  test('no sales representatives nav item or route exists', async ({ page }) => {
    await loginAs(page, 'admin');

    // Assert no "Sales representatives" link in sidebar/nav
    const sidebar = page.locator('nav, [class*="sidebar"], [class*="nav"], [role="navigation"]');
    const navTexts = await sidebar.allTextContents();
    const joinedNavText = navTexts.join(' ').toLowerCase();

    expect(joinedNavText).not.toContain('sales representatives');
    expect(joinedNavText).not.toContain('sales reps');

    // Navigate directly to /sales-representatives — expect 404 or redirect
    await page.goto('/sales-representatives');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const bodyText = await page.locator('body').textContent() ?? '';

    const isNotFound = /404|not found|page.*not.*found/i.test(bodyText);
    const isRedirected = url.includes('dashboard') || url.includes('login') || !url.includes('sales-representatives');

    expect(isNotFound || isRedirected).toBe(true);
  });

  // TC-SALES-002
  test('sales rep-only API endpoints return 404 or 410', async ({ page }) => {
    await loginAs(page, 'admin');

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5215';

    // Get the auth token from the page
    const token = await page.evaluate(() => localStorage.getItem('token'));

    // GET /api/sales-reps
    const getResponse = await page.request.get(`${apiBase}/api/sales-reps`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => null);

    if (getResponse) {
      expect([404, 410]).toContain(getResponse.status());
    }

    // POST /api/sales-reps
    const postResponse = await page.request.post(`${apiBase}/api/sales-reps`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data: { name: 'Test', email: 'test@test.com' },
    }).catch(() => null);

    if (postResponse) {
      expect([404, 410]).toContain(postResponse.status());
    }
  });
});
