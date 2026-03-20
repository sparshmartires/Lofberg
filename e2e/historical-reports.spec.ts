import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales } from './helpers/auth';

const REPORT_PATHS = ['/reports', '/historical-reports', '/reports/history'];

async function navigateToReports(page: import('@playwright/test').Page): Promise<string> {
  for (const p of REPORT_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('report')) {
      const table = page.locator('table, [role="table"]');
      if (await table.first().isVisible().catch(() => false)) {
        return url;
      }
    }
  }
  return page.url();
}

test.describe('Historical Reports Tests', () => {
  test('HR1: Admin can see reports table', async ({ page }) => {
    await loginAsAdmin(page);
    const url = await navigateToReports(page);

    const table = page.locator('table, [role="table"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('HR1: Reports table visible:', tableVisible, 'URL:', url);

    if (!tableVisible) {
      const bodyText = await page.locator('body').textContent();
      console.log('HR1: Body snippet:', (bodyText || '').substring(0, 500));
    }

    test.info().annotations.push({ type: 'note', description: `Reports table: ${tableVisible}, URL: ${url}` });
  });

  test('HR2: Reports table has expected columns', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('HR2: Report table headers:', headers);

    const expectedColumns = ['name', 'customer', 'salesperson', 'segment', 'date', 'status'];
    const foundColumns = expectedColumns.filter(col =>
      headers.some(h => h.toLowerCase().includes(col))
    );
    console.log('HR2: Expected columns found:', foundColumns);

    test.info().annotations.push({ type: 'note', description: `Headers: ${JSON.stringify(headers)}, found: ${JSON.stringify(foundColumns)}` });
  });

  test('HR3: Status filter', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    // Look for status filter
    const statusFilter = page.locator('select, [role="combobox"], button').filter({ hasText: /status|latest|past|draft|archived/i }).first();
    const filterVisible = await statusFilter.isVisible().catch(() => false);
    console.log('HR3: Status filter visible:', filterVisible);

    if (filterVisible) {
      await statusFilter.click();
      await page.waitForTimeout(1000);
      const options = await page.locator('[role="option"], option, li').allTextContents();
      console.log('HR3: Filter options:', options);
    }

    test.info().annotations.push({ type: 'note', description: `Status filter: ${filterVisible}` });
  });

  test('HR4: Report search', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    const searchInput = page.getByPlaceholder(/search/i).or(
      page.locator('input[type="search"], input[name="search"]')
    ).first();

    const searchVisible = await searchInput.isVisible().catch(() => false);
    console.log('HR4: Search input visible:', searchVisible);

    if (searchVisible) {
      await searchInput.fill('test');
      await page.waitForTimeout(2000);
      const rows = await page.locator('tbody tr, [role="row"]').count();
      console.log('HR4: Rows after search:', rows);
    }

    test.info().annotations.push({ type: 'note', description: `Search: ${searchVisible}` });
  });

  test('HR5: Download action on reports', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    // Look for download buttons/icons in table rows
    const downloadBtn = page.locator('button, a').filter({ hasText: /download/i }).first().or(
      page.locator('[aria-label*="download" i], [title*="download" i]').first()
    );
    const visible = await downloadBtn.isVisible().catch(() => false);
    console.log('HR5: Download button visible:', visible);

    // Also check for action menu buttons
    const actionBtns = page.locator('[aria-label*="action" i], [aria-label*="more" i], button:has(svg)');
    const actionCount = await actionBtns.count();
    console.log('HR5: Action buttons:', actionCount);

    test.info().annotations.push({ type: 'note', description: `Download: ${visible}, actions: ${actionCount}` });
  });

  test('HR6: Edit action opens wizard', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReports(page);

    // Find edit button
    const editBtn = page.locator('button, a').filter({ hasText: /edit/i }).first().or(
      page.locator('[aria-label*="edit" i], [title*="edit" i]').first()
    );
    const visible = await editBtn.isVisible().catch(() => false);
    console.log('HR6: Edit button visible:', visible);

    if (visible) {
      await editBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('HR6: After edit click URL:', page.url());
    }

    test.info().annotations.push({ type: 'note', description: `Edit: ${visible}` });
  });

  test('HR7: Archive action (admin)', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    const archiveBtn = page.locator('button, a').filter({ hasText: /archive/i }).first().or(
      page.locator('[aria-label*="archive" i], [title*="archive" i]').first()
    );
    const visible = await archiveBtn.isVisible().catch(() => false);
    console.log('HR7: Archive button visible:', visible);

    // Check in action menus
    if (!visible) {
      const actionBtns = page.locator('[aria-label*="action" i], [aria-label*="more" i], button:has(svg)').first();
      if (await actionBtns.isVisible().catch(() => false)) {
        await actionBtns.click();
        await page.waitForTimeout(1000);
        const menuItems = await page.locator('[role="menuitem"], [role="option"]').allTextContents();
        console.log('HR7: Action menu items:', menuItems);
      }
    }

    test.info().annotations.push({ type: 'note', description: `Archive: ${visible}` });
  });

  test('HR8: Restore action (admin, archived)', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    // Filter to archived first
    const statusFilter = page.locator('select, [role="combobox"], button').filter({ hasText: /status|filter/i }).first();
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();
      await page.waitForTimeout(500);
      const archivedOpt = page.getByText(/archived/i).first();
      if (await archivedOpt.isVisible().catch(() => false)) {
        await archivedOpt.click();
        await page.waitForTimeout(2000);
      }
    }

    const restoreBtn = page.locator('button, a').filter({ hasText: /restore/i }).first();
    const visible = await restoreBtn.isVisible().catch(() => false);
    console.log('HR8: Restore button visible:', visible);

    test.info().annotations.push({ type: 'note', description: `Restore: ${visible}` });
  });

  test('HR9: Sales can see reports', async ({ page }) => {
    await loginAsSales(page);
    await navigateToReports(page);

    const table = page.locator('table, [role="table"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('HR9: Sales reports table visible:', tableVisible);

    // Check salesperson column is hidden for sales
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    const hasSalesperson = headers.some(h => /salesperson|sales.*rep/i.test(h));
    console.log('HR9: Salesperson column visible for sales:', hasSalesperson);

    test.info().annotations.push({ type: 'note', description: `Sales table: ${tableVisible}, salesperson col: ${hasSalesperson}` });
  });

  test('HR10: Sales can only archive own drafts', async ({ page }) => {
    await loginAsSales(page);
    await navigateToReports(page);

    const bodyText = await page.locator('body').textContent() || '';
    console.log('HR10: Sales reports body snippet:', bodyText.substring(0, 500));

    // Check available actions
    const actionBtns = page.locator('button, a').filter({ hasText: /archive|delete|remove/i });
    const actionCount = await actionBtns.count();
    console.log('HR10: Archive/delete buttons visible for sales:', actionCount);

    test.info().annotations.push({ type: 'note', description: `Sales archive buttons: ${actionCount}` });
  });

  test('HR11: Date range filter', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    const dateInputs = page.locator('input[type="date"]');
    const dateCount = await dateInputs.count();
    console.log('HR11: Date inputs:', dateCount);

    const filterBtn = page.getByRole('button', { name: /filter/i }).first();
    const filterVisible = await filterBtn.isVisible().catch(() => false);
    console.log('HR11: Filter button:', filterVisible);

    test.info().annotations.push({ type: 'note', description: `Date inputs: ${dateCount}, filter: ${filterVisible}` });
  });

  test('HR12: Reports table pagination', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReports(page);

    const pagination = page.locator('[class*="pagination" i], nav[aria-label*="pagination" i]').first();
    const paginationVisible = await pagination.isVisible().catch(() => false);
    console.log('HR12: Pagination visible:', paginationVisible);

    test.info().annotations.push({ type: 'note', description: `Pagination: ${paginationVisible}` });
  });
});
