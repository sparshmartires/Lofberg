import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

async function getSidebarItems(page: import('@playwright/test').Page): Promise<string[]> {
  await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = page.locator('[data-testid="sidebar-nav"]');
  await nav.waitFor({ state: 'visible', timeout: 5000 });
  const texts = await nav.locator('a').allTextContents();
  await page.getByRole('button', { name: 'Close menu' }).click();
  return texts.map(t => t.trim());
}

// TC-NAV-001
test('Admin sees all nav items', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const items = await getSidebarItems(page);
  expect(items).toEqual([
    'Dashboard', 'Generate', 'Past reports', 'Templates',
    'Conversions', 'Customers', 'Users', 'Useful resources',
  ]);
});

// TC-NAV-002
test('Salesperson sees limited nav', async ({ page }) => {
  await loginAs(page, 'salesperson');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const items = await getSidebarItems(page);
  expect(items).toEqual(['Dashboard', 'Generate', 'Past reports', 'Useful resources']);

  expect(items).not.toContain('Templates');
  expect(items).not.toContain('Users');
  expect(items).not.toContain('Customers');
  expect(items).not.toContain('Conversions');
});

// TC-NAV-003
test('Translator sees limited nav', async ({ page }) => {
  await loginAs(page, 'translator');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const items = await getSidebarItems(page);
  expect(items).toEqual(['Dashboard', 'Templates', 'Useful resources', 'Conversions']);

  expect(items).not.toContain('Generate');
  expect(items).not.toContain('Past reports');
  expect(items).not.toContain('Users');
  expect(items).not.toContain('Customers');
});

// TC-NAV-004
test('Salesperson cannot access admin routes by URL', async ({ page }) => {
  await loginAs(page, 'salesperson');

  const adminRoutes = ['/users', '/customers', '/templates'];

  for (const route of adminRoutes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    // Should either redirect away from the admin route or show a forbidden message
    const url = page.url();
    const pageText = await page.textContent('body');

    const isRedirected = !url.includes(route);
    const isForbidden =
      pageText?.toLowerCase().includes('forbidden') ||
      pageText?.toLowerCase().includes('not authorized') ||
      pageText?.toLowerCase().includes('access denied');

    expect(isRedirected || isForbidden).toBeTruthy();
  }
});

// TC-NAV-005
test('Unauthenticated user redirected to login', async ({ page }) => {
  // Clear all cookies and storage to ensure unauthenticated state
  await page.context().clearCookies();
  await page.goto('/dashboard');

  // Should redirect to login
  await page.waitForURL('**/login', { timeout: 10_000 });
  expect(page.url()).toContain('/login');
});
