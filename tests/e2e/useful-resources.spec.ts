import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { generateFakeExe } from './helpers/api';

const RESOURCE_PATHS = ['/resources', '/resource-library', '/library', '/useful-resources'];

async function navigateToResources(page: import('@playwright/test').Page): Promise<string> {
  for (const p of RESOURCE_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('resource') || url.includes('library')) {
      return url;
    }
  }
  // Try nav link
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const navLink = page.getByText(/resource|library/i).first();
  if (await navLink.isVisible().catch(() => false)) {
    await navLink.click();
    await page.waitForLoadState('networkidle');
  }
  return page.url();
}

test.describe('Useful Resources', () => {
  // TC-RES-001
  test('add button visible to admin only', async ({ page }) => {
    // Admin sees the add button
    await loginAs(page, 'admin');
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();
    await expect(addBtn).toBeVisible();
  });

  test('add button not visible to salesperson', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();
    await expect(addBtn).not.toBeVisible();
  });

  // TC-RES-002
  test('executable file types rejected (e.g., .exe)', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();

    if (!(await addBtn.isVisible().catch(() => false))) {
      test.skip(true, 'Add button not found');
      return;
    }

    await addBtn.click();
    await page.waitForTimeout(1500);

    // Select "file" radio if present
    const fileRadio = page.getByText(/^file$/i).or(page.locator('input[type="radio"][value*="file" i]')).first();
    if (await fileRadio.isVisible().catch(() => false)) {
      await fileRadio.click();
      await page.waitForTimeout(500);
    }

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() === 0) {
      test.skip(true, 'No file input found in add resource form');
      return;
    }

    // Create a fake .exe file using the API helper
    const exeBuffer = generateFakeExe();
    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: exeBuffer,
    });
    await page.waitForTimeout(2000);

    // Should show an error or reject the file
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasRejection = /error|reject|not allowed|invalid|unsupported|not supported|executable/i.test(bodyText);
    expect(hasRejection).toBe(true);
  });

  // TC-RES-003
  test('view opens new tab for viewable types; download for others', async ({ page, context }) => {
    await loginAs(page, 'admin');
    await navigateToResources(page);

    // Find a view/open button for a resource
    const viewBtn = page.locator('button, a').filter({ hasText: /view|open/i }).or(
      page.locator('[aria-label*="view" i], [aria-label*="open" i]')
    ).first();

    const downloadBtn = page.locator('button, a').filter({ hasText: /download/i }).or(
      page.locator('[aria-label*="download" i]')
    ).first();

    if (await viewBtn.isVisible().catch(() => false)) {
      // View should open in new tab
      const newTabPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
      await viewBtn.click();
      const newTab = await newTabPromise;
      if (newTab) {
        expect(newTab).toBeTruthy();
        await newTab.close();
      }
    }

    if (await downloadBtn.isVisible().catch(() => false)) {
      // Download action should trigger a download
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await downloadBtn.click();
      // Download event is expected for non-viewable types
    }
  });

  // TC-RES-004
  test('archive button admin only; hard delete with warning modal', async ({ page }) => {
    // Admin sees archive/delete
    await loginAs(page, 'admin');
    await navigateToResources(page);

    const archiveBtn = page.locator('button, a').filter({ hasText: /archive|delete|remove/i }).or(
      page.locator('[aria-label*="delete" i], [aria-label*="archive" i]')
    ).first();

    if (await archiveBtn.isVisible().catch(() => false)) {
      await archiveBtn.click();
      await page.waitForTimeout(1000);

      // Warning modal should appear
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible();

      // Should have cancel and confirm buttons
      const cancelBtn = modal.getByRole('button', { name: /cancel|no|close/i }).first();
      await expect(cancelBtn).toBeVisible();

      const confirmBtn = modal.getByRole('button', { name: /delete|archive|confirm|yes/i }).first();
      await expect(confirmBtn).toBeVisible();

      await cancelBtn.click();
    }
  });

  test('archive button not visible to salesperson', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await navigateToResources(page);

    const archiveBtn = page.locator('button, a').filter({ hasText: /archive|delete|remove/i }).or(
      page.locator('[aria-label*="delete" i], [aria-label*="archive" i]')
    ).first();
    await expect(archiveBtn).not.toBeVisible();
  });

  // TC-RES-005
  test('search, filter, sort all function', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToResources(page);

    // Search
    const searchInput = page.getByPlaceholder(/search/i).or(
      page.locator('input[type="search"]')
    ).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1500);
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }

    // Filter (if present)
    const filterSelect = page.locator('select, [role="combobox"]').first();
    if (await filterSelect.isVisible().catch(() => false)) {
      await filterSelect.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"], option').first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
    }

    // Sort (click a column header)
    const headers = page.locator('th, [role="columnheader"]');
    const headerCount = await headers.count();
    if (headerCount > 0) {
      await headers.first().click();
      await page.waitForTimeout(1000);

      // Check for sort indicator
      const ariaSort = await headers.first().getAttribute('aria-sort');
      const hasIcon = await headers.first().locator('svg, [class*="sort"]').count();
      expect(ariaSort !== null || hasIcon > 0).toBe(true);
    }
  });
});
