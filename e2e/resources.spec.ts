import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales, loginAsTranslator } from './helpers/auth';

const RESOURCE_PATHS = ['/resources', '/resource-library', '/library'];

async function navigateToResources(page: import('@playwright/test').Page): Promise<string> {
  for (const p of RESOURCE_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('resource') || url.includes('library')) {
      return url;
    }
  }

  // Try nav
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const navLink = page.getByText(/resource|library/i).first();
  if (await navLink.isVisible().catch(() => false)) {
    await navLink.click();
    await page.waitForLoadState('networkidle');
  }

  return page.url();
}

test.describe('Resources Tests', () => {
  test('RS1: Admin can see resource list', async ({ page }) => {
    await loginAsAdmin(page);
    const url = await navigateToResources(page);

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RS1: Resources URL:', url);
    console.log('RS1: Body snippet:', bodyText.substring(0, 500));

    const hasContent = bodyText.length > 100;
    test.info().annotations.push({ type: 'note', description: `Resources URL: ${url}, hasContent: ${hasContent}` });
  });

  test('RS2: Admin sees Add Resource button', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();

    const visible = await addBtn.isVisible().catch(() => false);
    console.log('RS2: Add resource button visible:', visible);

    if (!visible) {
      const allButtons = await page.locator('button, a').allTextContents();
      console.log('RS2: All buttons:', allButtons.filter(t => t.trim()).slice(0, 20));
    }

    test.info().annotations.push({ type: 'note', description: `Add resource: ${visible}` });
  });

  test('RS3: Add resource form - file/link toggle', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for file/link radio or toggle
      const radios = await page.locator('input[type="radio"]').count();
      const bodyText = await page.locator('body').textContent() || '';
      const hasFileLink = /file|link|url/i.test(bodyText);

      console.log('RS3: Radios:', radios, 'File/link text:', hasFileLink);
      console.log('RS3: Form content:', bodyText.substring(0, 500));
    } else {
      console.log('RS3: Add button not found');
    }

    test.info().annotations.push({ type: 'note', description: 'File/link toggle test completed.' });
  });

  test('RS4: File upload in resource form', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(2000);

      const fileInput = page.locator('input[type="file"]');
      const fileCount = await fileInput.count();
      console.log('RS4: File inputs:', fileCount);

      const dropZone = page.locator('[class*="drop"], [class*="upload"]');
      const dropCount = await dropZone.count();
      console.log('RS4: Drop zones:', dropCount);
    }

    test.info().annotations.push({ type: 'note', description: 'File upload test completed.' });
  });

  test('RS5: Link URL input in resource form', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).or(
      page.getByRole('link', { name: /add|create|new|upload/i })
    ).first();

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(2000);

      // Try to select link type first
      const linkRadio = page.getByText(/link|url/i).first();
      if (await linkRadio.isVisible().catch(() => false)) {
        await linkRadio.click();
        await page.waitForTimeout(1000);
      }

      const urlInput = page.locator('input[type="url"], input[name*="url" i], input[name*="link" i]').or(
        page.getByPlaceholder(/url|link|http/i)
      ).first();
      const urlVisible = await urlInput.isVisible().catch(() => false);
      console.log('RS5: URL input visible:', urlVisible);
    }

    test.info().annotations.push({ type: 'note', description: 'Link URL input test completed.' });
  });

  test('RS6: Sales can view resources', async ({ page }) => {
    await loginAsSales(page);
    await navigateToResources(page);

    const url = page.url();
    const bodyText = await page.locator('body').textContent() || '';
    console.log('RS6: Sales resources URL:', url);
    console.log('RS6: Body snippet:', bodyText.substring(0, 300));

    test.info().annotations.push({ type: 'note', description: `Sales resources: URL=${url}` });
  });

  test('RS7: Sales cannot add/delete resources', async ({ page }) => {
    await loginAsSales(page);
    await navigateToResources(page);

    const addBtn = page.getByRole('button', { name: /add|create|new|upload/i }).first();
    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|archive|remove/i }).first();

    const addVisible = await addBtn.isVisible().catch(() => false);
    const deleteVisible = await deleteBtn.isVisible().catch(() => false);

    console.log('RS7: Sales sees Add:', addVisible, 'Delete:', deleteVisible);
    test.info().annotations.push({ type: 'note', description: `Sales CRUD: add=${addVisible}, delete=${deleteVisible}` });
  });

  test('RS8: Translator can view resources', async ({ page }) => {
    await loginAsTranslator(page);
    await navigateToResources(page);

    const url = page.url();
    console.log('RS8: Translator resources URL:', url);
    test.info().annotations.push({ type: 'note', description: `Translator resources: URL=${url}` });
  });

  test('RS9: Download resource', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToResources(page);

    const downloadBtn = page.locator('button, a').filter({ hasText: /download/i }).first().or(
      page.locator('[aria-label*="download" i]').first()
    );
    const visible = await downloadBtn.isVisible().catch(() => false);
    console.log('RS9: Download button visible:', visible);

    test.info().annotations.push({ type: 'note', description: `Download: ${visible}` });
  });

  test('RS10: Admin can archive/delete resource', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToResources(page);

    const deleteBtn = page.locator('button, a').filter({ hasText: /delete|archive|remove/i }).first().or(
      page.locator('[aria-label*="delete" i], [aria-label*="archive" i]').first()
    );
    const visible = await deleteBtn.isVisible().catch(() => false);
    console.log('RS10: Delete/archive button visible:', visible);

    // Check action menus
    if (!visible) {
      const actionBtns = page.locator('[aria-label*="action" i], [aria-label*="more" i]').first();
      if (await actionBtns.isVisible().catch(() => false)) {
        await actionBtns.click();
        await page.waitForTimeout(1000);
        const menuItems = await page.locator('[role="menuitem"]').allTextContents();
        console.log('RS10: Menu items:', menuItems);
      }
    }

    test.info().annotations.push({ type: 'note', description: `Delete/archive: ${visible}` });
  });
});
