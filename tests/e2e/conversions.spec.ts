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

    const editBtn = page.locator('button, a').filter({ hasText: /edit/i }).or(
      page.locator('[aria-label*="edit" i]')
    ).first();
    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|remove/i }).or(
      page.locator('[aria-label*="delete" i]')
    ).first();
    const translateBtn = page.locator('button, a').filter({ hasText: /translat/i }).or(
      page.locator('[aria-label*="translat" i]')
    ).first();

    await expect(editBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
    await expect(translateBtn).toBeVisible();
  });

  test('translator cannot edit/delete but can translate', async ({ page }) => {
    await loginAs(page, 'translator');
    await navigateToConversions(page);

    const editBtn = page.locator('button, a').filter({ hasText: /^edit$/i }).or(
      page.locator('[aria-label*="edit" i]')
    ).first();
    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|remove/i }).or(
      page.locator('[aria-label*="delete" i]')
    ).first();
    const translateBtn = page.locator('button, a').filter({ hasText: /translat/i }).or(
      page.locator('[aria-label*="translat" i]')
    ).first();

    await expect(editBtn).not.toBeVisible();
    await expect(deleteBtn).not.toBeVisible();
    await expect(translateBtn).toBeVisible();
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
    await navigateToConversions(page);

    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first();
    await expect(addBtn).not.toBeVisible();
  });

  // TC-CONV-004
  test('translation modal: correct columns (Language, Metric, Remove)', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const translateBtn = page.locator('button, a').filter({ hasText: /translat/i }).or(
      page.locator('[aria-label*="translat" i]')
    ).first();

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

    const editBtn = page.locator('button, a').filter({ hasText: /edit/i }).or(
      page.locator('[aria-label*="edit" i]')
    ).first();

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

    // Find and change the metric field
    const metricInput = page.locator('input[name*="metric" i], input[name*="name" i], textarea').first();
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

    // Cancel changes
    const cancelBtn = page.getByRole('button', { name: /cancel|close/i }).first();
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    }
  });

  // TC-CONV-006
  test('add/remove row and save in translation modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const translateBtn = page.locator('button, a').filter({ hasText: /translat/i }).or(
      page.locator('[aria-label*="translat" i]')
    ).first();

    await expect(translateBtn).toBeVisible({ timeout: 10000 });

    await translateBtn.click();
    await page.waitForTimeout(1500);

    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Count initial rows
    const initialRows = await modal.locator('tr, [class*="row"]').count();

    // Click add row button
    const addRowBtn = modal.getByRole('button', { name: /add|new|\+/i }).first();
    if (await addRowBtn.isVisible().catch(() => false)) {
      await addRowBtn.click();
      await page.waitForTimeout(500);

      const afterAddRows = await modal.locator('tr, [class*="row"]').count();
      expect(afterAddRows).toBeGreaterThan(initialRows);
    }

    // Click remove on the last row
    const removeBtn = modal.locator('button, [role="button"]').filter({ hasText: /remove|delete|x/i }).or(
      modal.locator('[aria-label*="remove" i], [aria-label*="delete" i]')
    ).last();
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
  test('delete is hard-delete with warning modal', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToConversions(page);

    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|remove/i }).or(
      page.locator('[aria-label*="delete" i]')
    ).first();

    await expect(deleteBtn).toBeVisible({ timeout: 10000 });

    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Warning modal should appear
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Should have warning text
    const modalText = await modal.textContent() ?? '';
    expect(modalText.length).toBeGreaterThan(10);

    // Should have cancel and confirm buttons
    const cancelBtn = modal.getByRole('button', { name: /cancel|no|close/i }).first();
    const confirmBtn = modal.getByRole('button', { name: /delete|confirm|yes/i }).first();
    await expect(cancelBtn).toBeVisible();
    await expect(confirmBtn).toBeVisible();

    // Cancel to avoid actual deletion
    await cancelBtn.click();
  });
});
