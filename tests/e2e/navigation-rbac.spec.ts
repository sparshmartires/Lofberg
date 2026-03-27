import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

// TC-NAV-001
test('Admin sees all nav items', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const sidebar = page.locator('nav, [class*="sidebar"], [role="navigation"]').first();
  const sidebarText = await sidebar.textContent();
  const text = sidebarText?.toLowerCase() ?? '';

  const expectedItems = [
    'Dashboard',
    'Generate',
    'Past reports',
    'Templates',
    'Conversions',
    'Users',
    'Customers',
    'Useful resources',
  ];

  for (const item of expectedItems) {
    expect(text).toContain(item.toLowerCase());
  }
});

// TC-NAV-002
test('Salesperson sees limited nav', async ({ page }) => {
  await loginAs(page, 'salesperson');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const sidebar = page.locator('nav, [class*="sidebar"], [role="navigation"]').first();
  const sidebarText = await sidebar.textContent();
  const text = sidebarText?.toLowerCase() ?? '';

  // Should be present
  const expectedItems = ['Dashboard', 'Generate', 'Past reports', 'Useful resources'];
  for (const item of expectedItems) {
    expect(text).toContain(item.toLowerCase());
  }

  // Should be absent
  const forbiddenItems = ['Templates', 'Users', 'Customers', 'Conversions'];
  for (const item of forbiddenItems) {
    expect(text).not.toContain(item.toLowerCase());
  }
});

// TC-NAV-003
test('Translator sees limited nav', async ({ page }) => {
  await loginAs(page, 'translator');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const sidebar = page.locator('nav, [class*="sidebar"], [role="navigation"]').first();
  const sidebarText = await sidebar.textContent();
  const text = sidebarText?.toLowerCase() ?? '';

  // Should be present
  const expectedItems = ['Dashboard', 'Templates', 'Conversions', 'Useful resources'];
  for (const item of expectedItems) {
    expect(text).toContain(item.toLowerCase());
  }

  // Should be absent
  const forbiddenItems = ['Generate', 'Past reports', 'Users', 'Customers'];
  for (const item of forbiddenItems) {
    expect(text).not.toContain(item.toLowerCase());
  }
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
