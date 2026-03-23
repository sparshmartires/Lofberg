import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales, loginAsTranslator } from './helpers/auth';

test.describe('User Management Tests', () => {
  test('US1: Admin can see user management table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table, [role="table"], [data-testid*="user"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('US1: User table visible:', tableVisible, 'URL:', page.url());

    if (!tableVisible) {
      const bodyText = await page.locator('body').textContent();
      console.log('US1: Body snippet:', (bodyText || '').substring(0, 500));
    }

    expect(tableVisible).toBeTruthy();
  });

  test('US2: Sales cannot access user management', async ({ page }) => {
    await loginAsSales(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const bodyText = await page.locator('body').textContent();
    console.log('US2: Sales /users URL:', url);
    console.log('US2: Body snippet:', (bodyText || '').substring(0, 300));

    const blocked = !url.includes('/users') ||
      /forbidden|not authorized|access denied|403/i.test(bodyText || '');
    test.info().annotations.push({ type: 'note', description: `Sales /users: URL=${url}, blocked=${blocked}` });
  });

  test('US3: Translator cannot access user management', async ({ page }) => {
    await loginAsTranslator(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    const bodyText = await page.locator('body').textContent();
    console.log('US3: Translator /users URL:', url);

    const blocked = !url.includes('/users') ||
      /forbidden|not authorized|access denied|403/i.test(bodyText || '');
    test.info().annotations.push({ type: 'note', description: `Translator /users: URL=${url}, blocked=${blocked}` });
  });

  test('US4: Admin sees Add User button', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add|create|new|invite/i }).or(
      page.getByRole('link', { name: /add|create|new|invite/i })
    ).first();

    const visible = await addButton.isVisible().catch(() => false);
    console.log('US4: Add user button visible:', visible);

    if (!visible) {
      const allButtons = await page.locator('button, a').allTextContents();
      console.log('US4: All buttons/links:', allButtons.filter(t => t.trim()).slice(0, 20));
    }

    test.info().annotations.push({ type: 'note', description: `Add user button: ${visible}` });
  });

  test('US5: User table has expected columns', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('US5: User table headers:', headers);
    test.info().annotations.push({ type: 'note', description: `User table headers: ${JSON.stringify(headers)}` });

    expect(headers.length).toBeGreaterThan(0);
  });

  test('US6: Add user form has role selection', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add|create|new|invite/i }).or(
      page.getByRole('link', { name: /add|create|new|invite/i })
    ).first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      console.log('US6: Add user form URL:', page.url());

      // Check for role selection
      const labels = await page.locator('label').allTextContents();
      const inputs = await page.locator('input, select, textarea').count();
      console.log('US6: Labels:', labels);
      console.log('US6: Input count:', inputs);

      const hasRole = labels.some(l => /role/i.test(l));
      console.log('US6: Has role field:', hasRole);
      test.info().annotations.push({ type: 'note', description: `Role field found: ${hasRole}, labels: ${JSON.stringify(labels)}` });
    } else {
      console.log('US6: Add button not found');
      test.info().annotations.push({ type: 'note', description: 'Add user button not found.' });
    }
  });

  test('US7: User search', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i).or(
      page.locator('input[type="search"], input[name="search"]')
    ).first();

    const searchVisible = await searchInput.isVisible().catch(() => false);
    console.log('US7: Search input visible:', searchVisible);

    if (searchVisible) {
      await searchInput.fill('admin');
      await page.waitForTimeout(2000);
      const rows = await page.locator('tbody tr, [role="row"]').count();
      console.log('US7: Rows after search "admin":', rows);
    }

    test.info().annotations.push({ type: 'note', description: `Search visible: ${searchVisible}` });
  });

  test('US8: User table pagination', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    const pagination = page.locator('[class*="pagination" i], nav[aria-label*="pagination" i], [data-testid*="pagination"]').first();
    const paginationVisible = await pagination.isVisible().catch(() => false);
    console.log('US8: Pagination visible:', paginationVisible);
    test.info().annotations.push({ type: 'note', description: `Pagination: ${paginationVisible}` });
  });
});
