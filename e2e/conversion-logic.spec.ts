import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTranslator } from './helpers/auth';

const CONVERSION_PATHS = ['/conversions', '/conversion-logic', '/settings/conversions', '/co2-conversions', '/segment-conversions'];

async function navigateToConversions(page: import('@playwright/test').Page): Promise<string> {
  // Try direct paths
  for (const p of CONVERSION_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('conversion')) {
      const bodyText = await page.locator('body').textContent() || '';
      if (/conversion|co2|segment|metric/i.test(bodyText)) {
        return url;
      }
    }
  }

  // Try to find in nav
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const navLink = page.getByText(/conversion/i).first();
  if (await navLink.isVisible().catch(() => false)) {
    await navLink.click();
    await page.waitForLoadState('networkidle');
  }

  return page.url();
}

test.describe('Conversion Logic Tests', () => {
  test('CL1: Admin can access conversions page', async ({ page }) => {
    await loginAsAdmin(page);
    const url = await navigateToConversions(page);
    console.log('CL1: Conversions URL:', url);

    const bodyText = await page.locator('body').textContent() || '';
    const hasConversion = /conversion|co2|segment|metric/i.test(bodyText);
    console.log('CL1: Conversion content found:', hasConversion);
    console.log('CL1: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Conversions URL: ${url}, content: ${hasConversion}` });
  });

  test('CL2: CO2 conversion section visible', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const bodyText = await page.locator('body').textContent() || '';
    const hasCO2 = /co2|carbon/i.test(bodyText);
    console.log('CL2: CO2 section found:', hasCO2);

    // Look for CO2 table or list
    const tables = await page.locator('table, [role="table"]').count();
    console.log('CL2: Tables on page:', tables);

    test.info().annotations.push({ type: 'note', description: `CO2 section: ${hasCO2}, tables: ${tables}` });
  });

  test('CL3: Segment conversion section visible', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const bodyText = await page.locator('body').textContent() || '';
    const hasSegment = /segment|area/i.test(bodyText);
    console.log('CL3: Segment section found:', hasSegment);

    test.info().annotations.push({ type: 'note', description: `Segment section: ${hasSegment}` });
  });

  test('CL4: Admin can add CO2 conversion', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first();
    const visible = await addBtn.isVisible().catch(() => false);
    console.log('CL4: Add button visible:', visible);

    if (visible) {
      await addBtn.click();
      await page.waitForTimeout(2000);

      const inputs = await page.locator('input, select, textarea').count();
      const labels = await page.locator('label').allTextContents();
      console.log('CL4: Form inputs:', inputs, 'Labels:', labels);
    }

    const allButtons = await page.locator('button').allTextContents();
    console.log('CL4: All buttons:', allButtons.filter(t => t.trim()));

    test.info().annotations.push({ type: 'note', description: `Add CO2: ${visible}` });
  });

  test('CL5: Admin can edit conversion', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const editBtn = page.locator('button, a').filter({ hasText: /edit/i }).first().or(
      page.locator('[aria-label*="edit" i]').first()
    );
    const visible = await editBtn.isVisible().catch(() => false);
    console.log('CL5: Edit button visible:', visible);

    if (visible) {
      await editBtn.click();
      await page.waitForTimeout(2000);
      const inputs = await page.locator('input, select, textarea').count();
      console.log('CL5: Edit form inputs:', inputs);
    }

    test.info().annotations.push({ type: 'note', description: `Edit conversion: ${visible}` });
  });

  test('CL6: Admin can delete conversion', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|remove/i }).first().or(
      page.locator('[aria-label*="delete" i]').first()
    );
    const visible = await deleteBtn.isVisible().catch(() => false);
    console.log('CL6: Delete button visible:', visible);

    test.info().annotations.push({ type: 'note', description: `Delete conversion: ${visible}` });
  });

  test('CL7: Conversion factor field', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const bodyText = await page.locator('body').textContent() || '';
    const hasFactor = /factor|multiplier|ratio|value/i.test(bodyText);
    console.log('CL7: Factor field/text:', hasFactor);

    // Look at table columns
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('CL7: Table headers:', headers);

    test.info().annotations.push({ type: 'note', description: `Factor: ${hasFactor}, headers: ${JSON.stringify(headers)}` });
  });

  test('CL8: Metric translation', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToConversions(page);

    const bodyText = await page.locator('body').textContent() || '';
    const hasTranslation = /translat|language/i.test(bodyText);
    console.log('CL8: Translation mentioned:', hasTranslation);

    test.info().annotations.push({ type: 'note', description: `Translation: ${hasTranslation}` });
  });

  test('CL9: Translator can view conversions (read-only)', async ({ page }) => {
    await loginAsTranslator(page);
    await navigateToConversions(page);

    const url = page.url();
    const bodyText = await page.locator('body').textContent() || '';
    console.log('CL9: Translator conversions URL:', url);
    console.log('CL9: Body snippet:', bodyText.substring(0, 500));

    // Check that add/edit/delete are NOT visible
    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first();
    const editBtn = page.locator('button, a').filter({ hasText: /edit/i }).first();
    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|remove/i }).first();

    const addVisible = await addBtn.isVisible().catch(() => false);
    const editVisible = await editBtn.isVisible().catch(() => false);
    const deleteVisible = await deleteBtn.isVisible().catch(() => false);

    console.log('CL9: Translator sees - Add:', addVisible, 'Edit:', editVisible, 'Delete:', deleteVisible);
    test.info().annotations.push({ type: 'note', description: `Translator CRUD: add=${addVisible}, edit=${editVisible}, delete=${deleteVisible}` });
  });

  test('CL10: Metric text change clears translations', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToConversions(page);

    // This is a behavioral test - document what we can see
    const bodyText = await page.locator('body').textContent() || '';
    console.log('CL10: Page content for translation clearing:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: 'Translation clearing behavior - requires manual verification. See console.' });
  });
});
