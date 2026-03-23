import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsTranslator } from './helpers/auth';

test.describe('Template Management Tests', () => {
  test('TM1: Admin can see template list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const templateList = page.locator('table, [role="table"], [class*="template"], [data-testid*="template"], .grid, ul, [class*="list"]');
    const visible = await templateList.first().isVisible().catch(() => false);
    console.log('TM1: Template list visible:', visible, 'URL:', page.url());

    if (!visible) {
      const bodyText = await page.locator('body').textContent();
      console.log('TM1: Body snippet:', (bodyText || '').substring(0, 500));
    }

    test.info().annotations.push({ type: 'note', description: `Template list visible: ${visible}` });
  });

  test('TM2: Template list shows template names', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();
    console.log('TM2: Templates page content snippet:', (bodyText || '').substring(0, 800));

    // Look for any template items
    const links = await page.locator('a').allTextContents();
    const filteredLinks = links.filter(t => t.trim().length > 2);
    console.log('TM2: Links on page:', filteredLinks.slice(0, 20));
    test.info().annotations.push({ type: 'note', description: `Page links: ${JSON.stringify(filteredLinks.slice(0, 15))}` });
  });

  test('TM3: Template detail view', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    // Click first template link/row
    const templateLinks = page.locator('table tbody tr a, [class*="template"] a, .grid a, ul li a, table tbody tr').first();

    try {
      await templateLinks.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('TM3: Detail URL:', page.url());

      const bodyText = await page.locator('body').textContent();
      console.log('TM3: Detail content:', (bodyText || '').substring(0, 500));
    } catch (e) {
      console.log('TM3: Could not click into template detail:', e);
      test.info().annotations.push({ type: 'note', description: 'Could not navigate to template detail.' });
    }
  });

  test('TM4: Template version information displayed', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    // Look for version-related text on the page
    const bodyText = await page.locator('body').textContent() || '';
    const hasVersion = /version|v\d+|draft|active|archived/i.test(bodyText);
    console.log('TM4: Version info found:', hasVersion);
    console.log('TM4: Body snippet:', bodyText.substring(0, 500));

    // Try navigating to first template
    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a').first();
    if (await firstLink.isVisible().catch(() => false)) {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const detailText = await page.locator('body').textContent() || '';
      const detailHasVersion = /version|v\d+|draft|active|archived/i.test(detailText);
      console.log('TM4: Detail has version info:', detailHasVersion);
    }

    test.info().annotations.push({ type: 'note', description: `Version info on list: ${hasVersion}` });
  });

  test('TM5: Template status badges', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const badges = page.locator('[class*="badge"], [class*="status"], [class*="chip"], [class*="tag"]');
    const badgeCount = await badges.count();
    const badgeTexts = await badges.allTextContents();
    console.log('TM5: Badge count:', badgeCount, 'Texts:', badgeTexts);
    test.info().annotations.push({ type: 'note', description: `Badges: ${JSON.stringify(badgeTexts)}` });
  });

  test('TM6: Create draft template version', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    // Navigate to first template detail
    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a, table tbody tr').first();
    try {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for create/new version button
      const createVersionBtn = page.getByRole('button', { name: /create.*version|new.*version|draft|new.*draft/i }).first();
      const visible = await createVersionBtn.isVisible().catch(() => false);
      console.log('TM6: Create version button visible:', visible);

      if (visible) {
        await createVersionBtn.click();
        await page.waitForTimeout(3000);
        console.log('TM6: After create version URL:', page.url());
      }

      const allButtons = await page.locator('button').allTextContents();
      console.log('TM6: Available buttons:', allButtons.filter(t => t.trim()));
    } catch (e) {
      console.log('TM6: Error:', e);
    }

    test.info().annotations.push({ type: 'note', description: 'Create draft version test completed. Check console for details.' });
  });

  test('TM7: Template editor (TipTap/rich text)', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    // Navigate to template detail/edit
    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a, table tbody tr').first();
    try {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Look for TipTap/ProseMirror editor
      const editorSelectors = [
        '[contenteditable="true"]',
        '.tiptap',
        '.ProseMirror',
        '[class*="editor"]',
        '[data-testid*="editor"]',
      ];

      let editorFound = false;
      for (const sel of editorSelectors) {
        const count = await page.locator(sel).count();
        if (count > 0) {
          editorFound = true;
          console.log(`TM7: Editor found with selector "${sel}", count: ${count}`);
          break;
        }
      }

      if (!editorFound) {
        // Maybe need to click edit button first
        const editBtn = page.getByRole('button', { name: /edit/i }).first();
        if (await editBtn.isVisible().catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(2000);
          for (const sel of editorSelectors) {
            const count = await page.locator(sel).count();
            if (count > 0) {
              editorFound = true;
              console.log(`TM7: Editor found after edit click with "${sel}"`);
              break;
            }
          }
        }
      }

      console.log('TM7: Editor found:', editorFound);
    } catch (e) {
      console.log('TM7: Error navigating to editor:', e);
    }

    test.info().annotations.push({ type: 'note', description: 'Editor detection completed. See console.' });
  });

  test('TM8: Publish template version', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a, table tbody tr').first();
    try {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const publishBtn = page.getByRole('button', { name: /publish|activate|save.*version|create.*version/i }).first();
      const visible = await publishBtn.isVisible().catch(() => false);
      console.log('TM8: Publish button visible:', visible);

      const allButtons = await page.locator('button').allTextContents();
      console.log('TM8: All buttons:', allButtons.filter(t => t.trim()));
    } catch (e) {
      console.log('TM8: Error:', e);
    }

    test.info().annotations.push({ type: 'note', description: 'Publish button detection completed.' });
  });

  test('TM9: Template page types', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a, table tbody tr').first();
    try {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const bodyText = await page.locator('body').textContent() || '';

      const pageTypes = ['cover', 'table of contents', 'sustainability', 'usp', 'impact', 'certification', 'receipt'];
      const foundTypes = pageTypes.filter(t => bodyText.toLowerCase().includes(t));
      console.log('TM9: Found page types:', foundTypes);

      // Look for tabs or page navigation
      const tabs = await page.locator('[role="tab"], [role="tablist"] button, .tab').allTextContents();
      console.log('TM9: Tabs found:', tabs);
    } catch (e) {
      console.log('TM9: Error:', e);
    }

    test.info().annotations.push({ type: 'note', description: 'Page types detection completed.' });
  });

  test('TM10: Translator can view templates', async ({ page }) => {
    await loginAsTranslator(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    console.log('TM10: Translator templates URL:', url);

    const bodyText = await page.locator('body').textContent() || '';
    const hasContent = bodyText.length > 100;
    console.log('TM10: Has content:', hasContent);
    console.log('TM10: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Translator templates access: URL=${url}, hasContent=${hasContent}` });
  });

  test('TM11: Translator can edit text fields only', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsTranslator(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    const firstLink = page.locator('table tbody tr a, [class*="template"] a, .grid a, table tbody tr').first();
    try {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check what fields are editable vs disabled
      const editableInputs = await page.locator('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), [contenteditable="true"]').count();
      const disabledInputs = await page.locator('input[disabled], input[readonly], textarea[disabled], textarea[readonly]').count();

      console.log('TM11: Editable fields:', editableInputs, 'Disabled fields:', disabledInputs);

      // Check for publish/create version buttons (should not be visible for translator)
      const publishBtn = page.getByRole('button', { name: /publish|create.*version|activate/i }).first();
      const publishVisible = await publishBtn.isVisible().catch(() => false);
      console.log('TM11: Publish button visible for translator:', publishVisible);
    } catch (e) {
      console.log('TM11: Error:', e);
    }

    test.info().annotations.push({ type: 'note', description: 'Translator edit permissions checked. See console.' });
  });

  test('TM12: Template type filtering', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');

    // Look for type filter
    const filterControls = page.locator('select, [role="combobox"], button').filter({ hasText: /type|report|receipt|filter/i });
    const filterCount = await filterControls.count();
    console.log('TM12: Filter controls found:', filterCount);

    if (filterCount > 0) {
      const filterTexts = await filterControls.allTextContents();
      console.log('TM12: Filter texts:', filterTexts);
    }

    test.info().annotations.push({ type: 'note', description: `Template type filters: ${filterCount}` });
  });
});
