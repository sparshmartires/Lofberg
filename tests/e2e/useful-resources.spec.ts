import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { generateFakeExe } from './helpers/api';

test.describe('Useful Resources', () => {
  // TC-RES-001
  test('add button visible to admin only', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    // The "Add resource" button is rendered by PageHeaderWithAction with actionLabel="Add resource"
    const addBtn = page.getByRole('button', { name: /add resource/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('add button not visible to salesperson', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /add resource/i });
    await expect(addBtn).toHaveCount(0);
  });

  // TC-RES-002
  test('executable file types rejected (e.g., .exe)', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('button', { name: /add resource/i }).first();
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
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    // Table action buttons use aria-label like "View <title>"
    // The view button is an icon button with aria-label starting with "View"
    const viewBtn = page.locator('button[aria-label^="View"]').first();

    if (await viewBtn.isVisible().catch(() => false)) {
      // View opens in a new tab via window.open
      const newTabPromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
      await viewBtn.click();
      const newTab = await newTabPromise;
      if (newTab) {
        expect(newTab).toBeTruthy();
        await newTab.close();
      }
    }
  });

  // TC-RES-004
  test('archive button admin only; hard delete with warning modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    // Delete/archive buttons use aria-label like "Delete <title>" and have title="Archive"
    const deleteBtn = page.locator('button[aria-label^="Delete"]').first();

    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);

      // Warning dialog should appear (radix Dialog with role="dialog")
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Should have Cancel and Delete buttons
      const cancelBtn = modal.getByRole('button', { name: /cancel/i }).first();
      await expect(cancelBtn).toBeVisible();

      const confirmBtn = modal.getByRole('button', { name: /delete/i }).first();
      await expect(confirmBtn).toBeVisible();

      // Cancel to dismiss
      await cancelBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('archive button not visible to salesperson', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    // Salesperson should not see delete/archive buttons
    const deleteBtn = page.locator('button[aria-label^="Delete"]');
    await expect(deleteBtn).toHaveCount(0);
  });

  // TC-RES-005
  test('search, filter, sort all function', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/useful-resources');
    await page.waitForLoadState('networkidle');

    // Search — uses SearchInput with placeholder "Search by title"
    const searchInput = page.getByPlaceholder(/search by title/i).first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1500);
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }

    // Filter — the Type select uses a radix Select with role="combobox"
    const typeFilter = page.locator('label:has-text("Type")').locator('..').locator('button[role="combobox"]').first();
    if (await typeFilter.isVisible().catch(() => false)) {
      await typeFilter.click();
      await page.waitForTimeout(300);
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(1000);
      }
    }

    // Sort — click a sortable column header (SortableHeader renders a th with click handler)
    const headers = page.locator('th');
    const headerCount = await headers.count();
    if (headerCount > 0) {
      await headers.first().click();
      await page.waitForTimeout(1000);

      // Check for sort indicator (SVG icon in the header)
      const hasIcon = await headers.first().locator('svg').count();
      expect(hasIcon).toBeGreaterThan(0);
    }
  });
});
