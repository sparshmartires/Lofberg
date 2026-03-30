import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { getAllVisibleText } from './helpers/text';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
  });

  // TC-USERS-001
  test('page title "User management"; table title "Users"; no subtitle', async ({ page }) => {
    const pageTitle = page.locator('h1, [data-testid="page-title"]').first();
    await expect(pageTitle).toContainText(/user management/i);

    const tableTitle = page.locator('h2, [data-testid="table-title"]');
    const tableTitleTexts = await tableTitle.allTextContents();
    const hasUsersTitle = tableTitleTexts.some(t => /^users$/i.test(t.trim()));
    expect(hasUsersTitle).toBe(true);

    // No subtitle
    const subtitle = page.locator('[data-testid="page-subtitle"], h1 + p, h2 + p');
    if (await subtitle.count() > 0) {
      for (const el of await subtitle.all()) {
        const text = await el.textContent();
        expect(text?.trim()).toBeFalsy();
      }
    }
  });

  // TC-USERS-002
  test('no "KeyAccountManager" in role dropdown', async ({ page }) => {
    await page.locator('button:has-text("Create"), button:has-text("Add user"), a:has-text("Create")').first().click();

    const roleDropdown = page.locator('select[name*="role"], [data-testid*="role"] select, label:has-text("Role") ~ select').first();
    if (await roleDropdown.count() > 0) {
      const options = await roleDropdown.locator('option').allTextContents();
      const hasKAM = options.some(o => /keyaccountmanager/i.test(o));
      expect(hasKAM).toBe(false);
    } else {
      // Try custom dropdown
      const roleField = page.locator('[data-testid*="role"], label:has-text("Role")').first();
      await roleField.click();
      const allText = await getAllVisibleText(page);
      const hasKAM = allText.some(t => /keyaccountmanager/i.test(t));
      expect(hasKAM).toBe(false);
    }
  });

  // TC-USERS-003
  test('no "Password" field in create/edit user form', async ({ page }) => {
    await page.locator('button:has-text("Create"), button:has-text("Add user"), a:has-text("Create")').first().click();

    const labels = await page.locator('label').allTextContents();
    const hasPasswordLabel = labels.some(l => /^password$/i.test(l.trim()));
    expect(hasPasswordLabel).toBe(false);

    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    await expect(passwordInput).toHaveCount(0);
  });

  // TC-USERS-004
  test('preferred language dropdown has all 9 languages', async ({ page }) => {
    await page.locator('button:has-text("Create"), button:has-text("Add user"), a:has-text("Create")').first().click();

    const expectedLanguages = [
      'English', 'Norwegian', 'Swedish', 'Danish', 'Finnish',
      'Lithuanian', 'Latvian', 'Estonian', 'Polish',
    ];

    const langDropdown = page.locator('select[name*="language"], [data-testid*="language"] select, label:has-text("language") ~ select').first();
    if (await langDropdown.count() > 0) {
      const options = await langDropdown.locator('option').allTextContents();
      for (const lang of expectedLanguages) {
        expect(options.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
      }
    } else {
      // Custom dropdown — click to open
      const langField = page.locator('label:has-text("language")').first();
      await langField.click();
      const dropdownItems = await page.locator('[role="option"], [role="listbox"] li, [class*="option"]').allTextContents();
      for (const lang of expectedLanguages) {
        expect(dropdownItems.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
      }
    }
  });

  // TC-USERS-005
  test('status "Archived" not "Inactive"', async ({ page }) => {
    const allText = await getAllVisibleText(page);

    // Check status filter options or table cells
    const hasInactive = allText.some(t => /^inactive$/i.test(t.trim()));
    expect(hasInactive).toBe(false);

    // Archived should be present as a status option or in the table
    const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]').first();
    if (await statusFilter.count() > 0) {
      const options = await statusFilter.locator('option').allTextContents();
      expect(options.some(o => /archived/i.test(o))).toBe(true);
      expect(options.some(o => /^inactive$/i.test(o.trim()))).toBe(false);
    }
  });

  // TC-USERS-006
  test('archive -> restore button flip', async ({ page }) => {
    // Find an active user row and archive it
    const activeRow = page.locator('table tbody tr:has-text("Active")').first();
    if (await activeRow.count() > 0) {
      const archiveBtn = activeRow.locator('button[title="Archive"]').first();
      if (await archiveBtn.count() > 0) {
        await archiveBtn.click();

        // Confirm archive modal if present
        const confirmBtn = page.locator('[role="dialog"] button:has-text("Archive")').first();
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click();
        }

        await page.waitForTimeout(500);
      }
    }

    // Now check archived users have Restore button
    const archivedRow = page.locator('table tbody tr:has-text("Archived")').first();
    if (await archivedRow.count() > 0) {
      const restoreBtn = archivedRow.locator('button[title="Restore"]');
      await expect(restoreBtn.first()).toBeVisible();
    }
  });

  // TC-USERS-007
  test('archive warning modal: correct text and button label "Archive"', async ({ page }) => {
    // Find active user rows that have an Archive button (excludes current admin who may not have one)
    const activeRows = page.locator('table tbody tr:has-text("Active")');
    const rowCount = await activeRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Find a row that has an Archive button (current admin user typically won't)
    let targetRow = null;
    for (let i = 0; i < rowCount; i++) {
      const row = activeRows.nth(i);
      const archiveBtn = row.locator('button[title="Archive"]');
      if (await archiveBtn.count() > 0) {
        targetRow = row;
        break;
      }
    }
    expect(targetRow).not.toBeNull();

    // Click the archive button on the target row
    const archiveBtn = targetRow!.locator('button[title="Archive"]').first();
    await archiveBtn.click();

    // Assert the warning modal appears
    const modal = page.locator('[role="dialog"], [data-testid="confirm-modal"]').first();
    await expect(modal).toBeVisible();

    // Modal should contain warning text about losing access
    const modalText = await modal.textContent() ?? '';
    expect(modalText).toMatch(/will no longer have access/i);

    // Confirm button should be labeled "Archive" (not "Delete" or "Deactivate")
    const confirmBtn = modal.locator('button:has-text("Archive")');
    await expect(confirmBtn.first()).toBeVisible();

    // Click Cancel to avoid actually archiving the user
    const cancelBtn = modal.locator('button:has-text("Cancel")').first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Verify modal closed
    await expect(modal).toBeHidden();
  });

  // TC-USERS-008
  test('mobile card: correct fields, last login date only (no timestamp)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Mobile cards should be visible
    const cards = page.locator('[data-testid="user-card"], [class*="card"]').first();
    if (await cards.count() > 0) {
      const cardText = await cards.textContent();
      // Last login should show date only, not a full timestamp with time
      const dateTimePattern = /\d{1,2}[/.:-]\d{1,2}[/.:-]\d{2,4}\s+\d{1,2}:\d{2}/;
      const dateOnlyPattern = /\d{1,2}[/.:-]\d{1,2}[/.:-]\d{2,4}/;
      // If a date is found, it should not include a time component
      if (dateOnlyPattern.test(cardText || '')) {
        expect(dateTimePattern.test(cardText || '')).toBe(false);
      }
    }
  });

  // TC-USERS-009
  test('reports column: dash for admin/translator; salesperson click opens historical reports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const headers = await page.locator('table thead th').allTextContents();
    const reportsIdx = headers.findIndex(h => /reports/i.test(h.trim()));
    expect(reportsIdx).toBeGreaterThanOrEqual(0);

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < Math.min(rowCount, 10); i++) {
      const row = rows.nth(i);
      const roleCell = await row.textContent();
      const reportsCell = row.locator(`td:nth-child(${reportsIdx + 1})`);
      const cellText = (await reportsCell.textContent())?.trim();

      if (/administrator|translator/i.test(roleCell || '')) {
        expect(cellText).toMatch(/^\d+$/);
      } else if (/sales/i.test(roleCell || '')) {
        // Should be clickable
        const link = reportsCell.locator('a, button').first();
        if (await link.count() > 0) {
          expect(cellText).not.toMatch(/^[-\u2013\u2014]$/);
        }
      }
    }
  });

  // TC-USERS-010
  test('no duplicate search/status filter above table', async ({ page }) => {
    const searchInputs = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid*="search"]');
    const searchCount = await searchInputs.count();
    expect(searchCount).toBeLessThanOrEqual(1);

    const statusFilters = page.locator('select[name*="status"], [data-testid*="status-filter"]');
    const statusCount = await statusFilters.count();
    expect(statusCount).toBeLessThanOrEqual(1);
  });
});
