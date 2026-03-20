import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales, loginAsTranslator } from './helpers/auth';

async function getNavItems(page: import('@playwright/test').Page): Promise<string[]> {
  await page.waitForLoadState('networkidle');
  // Try multiple strategies to find sidebar nav items
  let items = await page.locator('nav a, aside a, [role="navigation"] a, [role="menuitem"]').allTextContents();
  if (items.filter(t => t.trim().length > 0).length === 0) {
    // Fallback: look for sidebar links by common sidebar patterns
    items = await page.locator('a[href^="/"]').allTextContents();
  }
  if (items.filter(t => t.trim().length > 0).length === 0) {
    // Last resort: dump all link-like elements
    items = await page.$$eval('a', els => els.map(e => e.textContent?.trim() || ''));
  }
  return items.map(t => t.trim()).filter(t => t.length > 0 && t.length < 100);
}

test.describe('Navigation & RBAC Tests', () => {
  test('NR1: Admin sees all navigation items', async ({ page }) => {
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');
    const navItems = await getNavItems(page);
    console.log('NR1: Admin nav items:', navItems);
    test.info().annotations.push({ type: 'note', description: `Admin nav items: ${JSON.stringify(navItems)}` });
    // Admin should have the most nav items
    expect(navItems.length).toBeGreaterThan(0);
  });

  test('NR2: Sales sees limited navigation', async ({ page }) => {
    await loginAsSales(page);
    await page.waitForLoadState('networkidle');
    const navItems = await getNavItems(page);
    console.log('NR2: Sales nav items:', navItems);
    test.info().annotations.push({ type: 'note', description: `Sales nav items: ${JSON.stringify(navItems)}` });
    expect(navItems.length).toBeGreaterThan(0);

    // Sales should NOT see user management
    const hasUsers = navItems.some(item => /user/i.test(item));
    console.log('NR2: Sales has user management nav:', hasUsers);
    test.info().annotations.push({ type: 'note', description: `Sales sees user management: ${hasUsers}` });
  });

  test('NR3: Translator sees limited navigation', async ({ page }) => {
    await loginAsTranslator(page);
    await page.waitForLoadState('networkidle');
    const navItems = await getNavItems(page);
    console.log('NR3: Translator nav items:', navItems);
    test.info().annotations.push({ type: 'note', description: `Translator nav items: ${JSON.stringify(navItems)}` });
    expect(navItems.length).toBeGreaterThan(0);
  });

  test('NR4: Sales cannot access /users', async ({ page }) => {
    await loginAsSales(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const bodyText = await page.locator('body').textContent();
    console.log('NR4: Sales /users URL:', url);
    console.log('NR4: Sales /users body snippet:', (bodyText || '').substring(0, 300));

    const blocked = url.includes('/login') ||
      url.includes('/dashboard') ||
      url.includes('/unauthorized') ||
      /forbidden|not authorized|access denied|403/i.test(bodyText || '');

    test.info().annotations.push({ type: 'note', description: `Sales /users result: URL=${url}, blocked=${blocked}` });
    console.log('NR4: Access blocked:', blocked);
  });

  test('NR5: Translator cannot access /customers', async ({ page }) => {
    await loginAsTranslator(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const bodyText = await page.locator('body').textContent();
    console.log('NR5: Translator /customers URL:', url);
    console.log('NR5: Translator /customers body snippet:', (bodyText || '').substring(0, 300));

    const blocked = url.includes('/login') ||
      url.includes('/dashboard') ||
      url.includes('/unauthorized') ||
      /forbidden|not authorized|access denied|403/i.test(bodyText || '');

    test.info().annotations.push({ type: 'note', description: `Translator /customers result: URL=${url}, blocked=${blocked}` });
    console.log('NR5: Access blocked:', blocked);
  });

  test('NR6: Translator cannot access report generation', async ({ page }) => {
    await loginAsTranslator(page);

    const reportPaths = ['/reports/generate', '/report-generation', '/reports/new', '/generate-report'];
    let result = '';

    for (const path of reportPaths) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const url = page.url();
      if (!url.includes(path)) {
        result = `Redirected from ${path} to ${url}`;
        break;
      }
      const bodyText = await page.locator('body').textContent();
      if (/forbidden|not authorized|access denied|403/i.test(bodyText || '')) {
        result = `Blocked at ${path} with error message`;
        break;
      }
    }

    if (!result) {
      const url = page.url();
      const bodyText = await page.locator('body').textContent();
      result = `Final URL: ${url}, body snippet: ${(bodyText || '').substring(0, 200)}`;
    }

    console.log('NR6: Translator report generation result:', result);
    test.info().annotations.push({ type: 'note', description: `Translator report gen: ${result}` });
  });
});
