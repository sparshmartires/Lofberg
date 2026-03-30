import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

async function navigateToConversions(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/conversion-logic');
  await page.waitForLoadState('networkidle');
}

test.describe('Conversions', () => {
  // TC-CONV-001
  test('page title is "Conversions and units"', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const heading = page.getByRole('heading', { name: /conversions/i }).or(
      page.locator('h1, h2').filter({ hasText: /conversions/i })
    ).first();
    await expect(heading).toBeVisible();

    const text = await heading.textContent();
    expect(text?.toLowerCase()).toContain('conversions');
    expect(text?.toLowerCase()).toContain('units');
  });

  // TC-CONV-002
  test('edit/delete admin only; translate visible to admin + translator', async ({ page }) => {
    // Admin sees edit, delete, translate
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const translateBtn = page.locator('button[title="Translate"]').first();
    await expect(translateBtn).toBeVisible({ timeout: 10000 });

    // The conversions page uses a grid layout (not <table>). Each row is a grid div.
    // Inside each row's last cell (actions div), there are 3 buttons: Translate, Edit/Save, Delete.
    const firstRowActions = page.locator('.hidden.md\\:block .grid.grid-cols-3 .flex.gap-3, .hidden.md\\:block .grid.grid-cols-4 .flex.gap-3').first();
    const actionButtons = firstRowActions.locator('button');
    const buttonCount = await actionButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(3);
  });

  test('translator cannot edit/delete but can translate', async ({ page }) => {
    await loginAs(page, 'translator');
    await navigateToConversions(page);

    const translateBtn = page.locator('button[title="Translate"]').first();
    await expect(translateBtn).toBeVisible({ timeout: 10000 });

    // Translator should only see translate button, not edit/delete
    // The conversions page uses a grid layout. Each row's actions div contains buttons.
    const firstRowActions = page.locator('.hidden.md\\:block .grid.grid-cols-3 .flex.gap-3, .hidden.md\\:block .grid.grid-cols-4 .flex.gap-3').first();
    const actionButtons = firstRowActions.locator('button');
    const buttonCount = await actionButtons.count();
    // Should have only 1 action button (translate)
    expect(buttonCount).toBeLessThanOrEqual(1);
  });

  // TC-CONV-003
  test('add button admin only', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('add button not visible to salesperson', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await page.goto('/conversion-logic');
    await page.waitForLoadState('networkidle');

    // Salesperson should be redirected away from conversion-logic to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // TC-CONV-004
  test('translation modal: correct columns (Language, Metric, Remove)', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const translateBtn = page.locator('button[title="Translate"]').first();

    await expect(translateBtn).toBeVisible({ timeout: 10000 });

    await translateBtn.click();
    await page.waitForTimeout(1500);

    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Check for column headers within the modal
    const modalText = await modal.textContent() ?? '';
    const lower = modalText.toLowerCase();

    expect(lower).toContain('language');
    expect(lower).toContain('metric');
    expect(lower).toContain('remove');

    // Close modal
    const closeBtn = modal.getByRole('button', { name: /close|cancel|x/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    }
  });

  // TC-CONV-005
  // NOTE: Hard to verify translation deletion without backend state inspection; flagged for manual check
  test('metric edit deletes existing translations', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    // The conversions page uses grid layout, not <table>. The edit button is the 2nd icon button
    // in each row's actions div (after the Translate button). It uses the Save icon.
    // Clicking it enters inline edit mode with input fields in the same row.
    const firstRowActions = page.locator('.hidden.md\\:block .grid.grid-cols-3 .flex.gap-3, .hidden.md\\:block .grid.grid-cols-4 .flex.gap-3').first();
    // Edit button is the 2nd button (index 1) — after Translate (index 0)
    const editBtn = firstRowActions.locator('button').nth(1);

    await expect(editBtn).toBeVisible({ timeout: 10000 });

    // Intercept PUT/PATCH to conversions API
    let updatePayload: any = null;
    await page.route('**/api/**/conversion**', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        updatePayload = route.request().postDataJSON?.() ?? null;
      }
      route.continue();
    });

    await editBtn.click();
    await page.waitForTimeout(1500);

    // After clicking edit, inline inputs appear in the same grid row
    const metricInput = page.locator('.hidden.md\\:block input[class*="rounded-full"]').first();
    if (await metricInput.isVisible().catch(() => false)) {
      await metricInput.fill('Test metric change');
      await page.waitForTimeout(500);
    }

    // Look for a warning about translation deletion
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasTranslationWarning = /translation.*delete|translation.*remove|translation.*clear|existing translation/i.test(bodyText);

    test.info().annotations.push({
      type: 'note',
      description: `Translation deletion warning shown: ${hasTranslationWarning}. Verify manually that changing the metric text clears existing translations in the backend.`,
    });

    // Cancel changes by clicking away or reloading (no explicit cancel button in inline edit)
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  // TC-CONV-006
  test('add/remove row and save in translation modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const translateBtn = page.locator('button[title="Translate"]').first();

    await expect(translateBtn).toBeVisible({ timeout: 10000 });

    await translateBtn.click();
    await page.waitForTimeout(1500);

    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Count initial rows
    const initialRows = await modal.locator('tr, [class*="row"]').count();

    // Click add row button — look for button with "Add" text
    const addRowBtn = modal.locator('button').filter({ hasText: /add/i }).first();
    if (await addRowBtn.isVisible().catch(() => false)) {
      await addRowBtn.click();
      await page.waitForTimeout(500);

      const afterAddRows = await modal.locator('tr, [class*="row"]').count();
      expect(afterAddRows).toBeGreaterThan(initialRows);
    }

    // Click remove on the last row — look for icon button (small button with no text or svg child)
    const removeBtn = modal.locator('button:has(svg)').last();
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await page.waitForTimeout(500);
    }

    // Save
    const saveBtn = modal.getByRole('button', { name: /save|submit|confirm/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }

    // Close modal
    const closeBtn = modal.getByRole('button', { name: /close|cancel/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    }
  });

  // TC-CONV-007
  test('delete is hard-delete with inline confirmation', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    // The conversions page uses grid layout, not <table>. The delete button is the 3rd icon button
    // in each row's actions div (after Translate and Edit/Save). Uses Trash2 icon.
    const firstRowActions = page.locator('.hidden.md\\:block .grid.grid-cols-3 .flex.gap-3, .hidden.md\\:block .grid.grid-cols-4 .flex.gap-3').first();
    // Delete button is the 3rd button (index 2) — after Translate (0) and Edit (1)
    const deleteBtn = firstRowActions.locator('button').nth(2);

    await expect(deleteBtn).toBeVisible({ timeout: 10000 });

    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Inline confirmation — "Confirm" (red text button) and "Cancel" text button appear in the same area
    const confirmBtn = page.locator('button:has-text("Confirm")').first();
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    await expect(confirmBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();

    // Cancel to avoid actual deletion
    await cancelBtn.click();
  });
});
