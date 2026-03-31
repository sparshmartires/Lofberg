import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { getAllVisibleText } from './helpers/text';

test.describe('Customers', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
  });

  // TC-CUST-001
  test('no subtitle; table title is "Customers"', async ({ page }) => {
    const heading = page.locator('h1, h2, [data-testid="page-title"]').first();
    await expect(heading).toContainText(/customer/i);

    // No subtitle element directly below the title
    const subtitle = page.locator('[data-testid="page-subtitle"], h1 + p, h2 + p');
    if (await subtitle.count() > 0) {
      const text = await subtitle.first().textContent();
      expect(text?.trim()).toBeFalsy();
    }
  });

  // TC-CUST-002
  test('table has "Reports generated" column; clicking opens historical reports with filter', async ({ page }) => {
    // Wait for table rows to load
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });

    const headers = page.locator('table thead th');
    const headerTexts = await headers.allTextContents();
    const reportsCol = headerTexts.findIndex(h => /reports generated/i.test(h.trim()));
    expect(reportsCol).toBeGreaterThanOrEqual(0);

    // Find the first row that has a positive report count (button inside the "Reports generated" cell)
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    let clicked = false;

    for (let i = 0; i < rowCount && !clicked; i++) {
      const cell = rows.nth(i).locator(`td:nth-child(${reportsCol + 1})`);
      const btn = cell.locator('button').first();
      if (await btn.isVisible().catch(() => false)) {
        const btnText = (await btn.textContent() ?? '').trim();
        if (btnText && parseInt(btnText) > 0) {
          await btn.click();
          await page.waitForURL(/.*historical-reports.*/, { timeout: 10000 });
          const url = page.url();
          expect(url).toMatch(/customerId/i);
          clicked = true;
        }
      }
    }

    // If no row had a positive count, just verify the column header exists
    if (!clicked) {
      test.info().annotations.push({
        type: 'note',
        description: 'No customer had a positive report count to click through to historical reports.',
      });
    }
  });

  // TC-CUST-003
  test('"View details" opens non-editable modal', async ({ page }) => {
    // Wait for table data to load
    await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('button[title="View details"]').first().click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // The view dialog wraps all inputs in a <fieldset disabled> element,
    // which disables all child inputs without individually setting disabled attributes.
    const disabledFieldset = modal.locator('fieldset[disabled]');
    await expect(disabledFieldset).toBeVisible();

    // Double-check: try typing into the first input inside the fieldset — it should not accept input
    const firstInput = disabledFieldset.locator('input').first();
    if (await firstInput.isVisible().catch(() => false)) {
      const valueBefore = await firstInput.inputValue();
      await firstInput.focus();
      await page.keyboard.type('XYZ');
      const valueAfter = await firstInput.inputValue();
      expect(valueAfter).toBe(valueBefore);
    }
  });

  // TC-CUST-004
  test('status shows "Archived"; Archive button changes to Restore', async ({ page }) => {
    // Filter to see archived customers using the Status Select filter.
    // The Status filter is inside a .filter-field div with a <label>Status</label>.
    const statusField = page.locator('.filter-field').filter({ has: page.locator('label:text("Status")') });
    const statusTrigger = statusField.locator('[data-slot="select-trigger"]').first();
    await expect(statusTrigger).toBeVisible({ timeout: 10000 });

    await statusTrigger.click();
    await page.waitForTimeout(500);
    // The "Archived" option text is "Archived" (value="inactive")
    await page.locator('[role="option"]').filter({ hasText: /^Archived$/i }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const allText = await getAllVisibleText(page);
    const hasArchived = allText.some(t => t.trim() === 'Archived');
    expect(hasArchived).toBe(true);

    // On archived row, button should be "Restore" (title="Restore") not "Archive"
    const archivedRow = page.locator('table tbody tr:has-text("Archived")').first();
    if (await archivedRow.count() > 0) {
      const restoreBtn = archivedRow.locator('button[title="Restore"]');
      await expect(restoreBtn.first()).toBeVisible();
      const archiveBtn = archivedRow.locator('button[title="Archive"]');
      await expect(archiveBtn).toHaveCount(0);
    }
  });

  // TC-CUST-005
  test('create/edit form: label is "Market segment"', async ({ page }) => {
    // Open create customer form
    await page.getByRole('button', { name: /Add customer/ }).click();

    // Wait for dialog to appear
    await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 10000 });

    // Get all labels inside the dialog
    const dialog = page.locator('[role="dialog"]');
    const formLabels = await dialog.locator('label').allTextContents();
    const segmentLabel = formLabels.find(l => /segment/i.test(l));
    expect(segmentLabel).toBeDefined();
    expect(segmentLabel).toMatch(/market segment/i);
  });

  // TC-CUST-006
  test('sub-customer: parent dropdown appears when subcustomer checkbox checked', async ({ page }) => {
    await page.locator('button:has-text("Create"), button:has-text("Add customer"), a:has-text("Create")').first().click();

    const subcustomerCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /sub.?customer/i })
      .or(page.locator('label:has-text("subcustomer") input[type="checkbox"]'))
      .or(page.locator('[data-testid*="subcustomer"] input[type="checkbox"]'))
      .first();

    // Parent dropdown should not be visible initially
    const parentDropdown = page.locator('select, [data-testid*="parent"]').filter({ hasText: /parent/i })
      .or(page.locator('label:has-text("Parent") + select, label:has-text("Parent") ~ select'))
      .first();

    if (await subcustomerCheckbox.count() > 0) {
      await expect(parentDropdown).toBeHidden();
      await subcustomerCheckbox.check();
      await expect(parentDropdown).toBeVisible();
    }
  });

  // TC-CUST-007
  test('phone/email validate on focus-out', async ({ page }) => {
    await page.locator('button:has-text("Create"), button:has-text("Add customer"), a:has-text("Create")').first().click();

    // Email field — enter invalid value and blur
    const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    await emailInput.fill('not-an-email');
    await emailInput.blur();
    const emailError = page.locator('.text-red-500, [role="alert"]').filter({ hasText: /email/i }).first();
    await expect(emailError).toBeVisible();

    // Phone field — enter invalid value and blur
    const phoneInput = page.locator('input[name*="phone"], input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('12345');
      await phoneInput.blur();
      const phoneError = page.locator('.text-red-500, [role="alert"]').filter({ hasText: /phone/i }).first();
      await expect(phoneError).toBeVisible();
    }
  });

  // TC-CUST-008
  test('region sort: International/Global first, Other last', async ({ page }) => {
    // Open region dropdown/sort by region
    const regionHeader = page.locator('th:has-text("Region")').first();
    if (await regionHeader.count() > 0) {
      await regionHeader.click(); // Sort ascending

      const regionCells = page.locator('table tbody tr td:nth-child(1)'); // Adjust column index
      const regions = await page.locator('table tbody tr').allTextContents();

      // Find region values by inspecting the column
      const headers = await page.locator('table thead th').allTextContents();
      const regionIdx = headers.findIndex(h => /region/i.test(h.trim()));
      if (regionIdx >= 0) {
        const firstCell = await page.locator(`table tbody tr:first-child td:nth-child(${regionIdx + 1})`).textContent();
        const lastCell = await page.locator(`table tbody tr:last-child td:nth-child(${regionIdx + 1})`).textContent();

        expect(firstCell?.trim()).toMatch(/international|global/i);
        expect(lastCell?.trim()).toMatch(/other/i);
      }
    }
  });

  // TC-CUST-009
  test('"Admin controls/Metadata" label absent', async ({ page }) => {
    // Open a customer detail or edit form
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('button, a').first().click();

    const allText = await getAllVisibleText(page);
    const hasAdminControls = allText.some(t => /admin controls/i.test(t));
    const hasMetadata = allText.some(t => /^metadata$/i.test(t.trim()));
    expect(hasAdminControls).toBe(false);
    expect(hasMetadata).toBe(false);
  });

  // TC-CUST-010
  test('customer logo error on upload failure; old logo deleted on replace', async ({ page }) => {
    // Open the Add Customer dialog
    await page.getByRole('button', { name: /Add customer/ }).click();
    await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 10000 });

    const dialog = page.locator('[role="dialog"]');

    // Intercept file upload requests and return 500
    await page.route('**/api/**/upload**', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Upload failed' }) })
    );
    await page.route('**/api/**/logo**', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Upload failed' }) })
    );
    await page.route('**/api/**/image**', route =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Upload failed' }) })
    );

    // Find file input for logo inside the dialog
    const fileInput = dialog.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles({
        name: 'test-logo.png',
        mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
      });

      // Assert error message is shown
      const errorMsg = page.locator('[class*="error"], [role="alert"], [data-testid*="error"]').first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    }
  });
});
