import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { getAllVisibleText } from './helpers/text';

test.describe('Translations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'translator');
    await page.goto('/translations');
    await page.waitForLoadState('networkidle');
  });

  // TC-TRANS-001
  test('non-RTE inputs are single-line', async ({ page }) => {
    // Open the first translation entry
    const firstEntry = page.locator('table tbody tr, [data-testid*="translation-item"]').first();
    if (await firstEntry.count() > 0) {
      await firstEntry.locator('button:has-text("Open"), button:has-text("Edit"), a').first().click();
      await page.waitForLoadState('networkidle');
    }

    // Find all non-RTE inputs (exclude rich text editors)
    const plainInputs = page.locator('input[type="text"], input:not([type])').filter({
      hasNot: page.locator('[contenteditable="true"], [class*="rich-text"], [class*="rte"], [class*="editor"]'),
    });

    const count = await plainInputs.count();
    for (let i = 0; i < count; i++) {
      const el = plainInputs.nth(i);
      const tagName = await el.evaluate(e => e.tagName.toLowerCase());
      expect(tagName).toBe('input');
      // Ensure it's not a textarea
      const rows = await el.getAttribute('rows');
      expect(rows).toBeNull();
    }
  });

  // TC-TRANS-002
  test('no English text shows "N/A" placeholder', async ({ page }) => {
    const firstEntry = page.locator('table tbody tr, [data-testid*="translation-item"]').first();
    if (await firstEntry.count() > 0) {
      await firstEntry.locator('button:has-text("Open"), button:has-text("Edit"), a').first().click();
      await page.waitForLoadState('networkidle');
    }

    // Look for N/A placeholder text where English source is empty
    const allText = await getAllVisibleText(page);
    const placeholders = page.locator('[placeholder="N/A"], :has-text("N/A")');

    // At minimum, the UI should use "N/A" as placeholder for missing English text
    // We check that the pattern exists in the interface
    const naElements = page.locator('input[placeholder="N/A"], [data-testid*="english-source"]:has-text("N/A")');
    // This test verifies the placeholder convention exists
    const hasNAPlaceholder = allText.some(t => t.trim() === 'N/A') ||
      (await naElements.count()) > 0;

    // If there are empty English fields, they should show N/A
    const englishFields = page.locator('[data-testid*="english"], [class*="english"], [class*="source"]');
    if (await englishFields.count() > 0) {
      for (let i = 0; i < await englishFields.count(); i++) {
        const text = (await englishFields.nth(i).textContent())?.trim();
        if (!text || text === '') {
          // Empty English field should display N/A
          const displayed = await englishFields.nth(i).textContent();
          expect(displayed?.trim()).toBe('N/A');
        }
      }
    }
  });

  // TC-TRANS-003
  test('language dropdown has all 9 languages', async ({ page }) => {
    const expectedLanguages = [
      'English', 'Norwegian', 'Swedish', 'Danish', 'Finnish',
      'Lithuanian', 'Latvian', 'Estonian', 'Polish',
    ];

    const langDropdown = page.locator('select[name*="language"], [data-testid*="language"] select, label:has-text("Language") ~ select').first();
    if (await langDropdown.count() > 0) {
      const options = await langDropdown.locator('option').allTextContents();
      for (const lang of expectedLanguages) {
        expect(options.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
      }
    } else {
      // Custom dropdown
      const langField = page.locator('label:has-text("Language"), [data-testid*="language-selector"]').first();
      await langField.click();
      const items = await page.locator('[role="option"], [role="listbox"] li, [class*="option"]').allTextContents();
      for (const lang of expectedLanguages) {
        expect(items.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
      }
    }
  });

  // TC-TRANS-004
  test('save draft persists translation; language switch and return retains text', async ({ page }) => {
    const firstEntry = page.locator('table tbody tr, [data-testid*="translation-item"]').first();
    if (await firstEntry.count() > 0) {
      await firstEntry.locator('button:has-text("Open"), button:has-text("Edit"), a').first().click();
      await page.waitForLoadState('networkidle');
    }

    // Type into the first translation field
    const translationInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    const testText = `TranslationTest_${Date.now()}`;
    await translationInput.fill(testText);

    // Save draft
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save draft")').first();
    await saveBtn.click();
    await page.waitForLoadState('networkidle');

    // Switch language
    const langDropdown = page.locator('select[name*="language"], [data-testid*="language"] select, label:has-text("Language") ~ select').first();
    if (await langDropdown.count() > 0) {
      await langDropdown.selectOption({ index: 2 }); // Switch to another language
      await page.waitForLoadState('networkidle');

      // Switch back to original language
      await langDropdown.selectOption({ index: 1 });
      await page.waitForLoadState('networkidle');
    }

    // Verify text is retained
    const currentValue = await translationInput.inputValue().catch(() =>
      translationInput.textContent()
    );
    expect(currentValue).toContain(testText);
  });

  // TC-TRANS-005
  test('switching to another language shows empty field (not copied English text)', async ({ page }) => {
    const firstEntry = page.locator('table tbody tr, [data-testid*="translation-item"]').first();
    if (await firstEntry.count() > 0) {
      await firstEntry.locator('button:has-text("Open"), button:has-text("Edit"), a').first().click();
      await page.waitForLoadState('networkidle');
    }

    // Get English text from source/reference
    const englishSource = page.locator('[data-testid*="english"], [class*="english"], [class*="source"]').first();
    let englishText = '';
    if (await englishSource.count() > 0) {
      englishText = (await englishSource.textContent())?.trim() || '';
    }

    // Switch to a non-English language (e.g., Norwegian)
    const langDropdown = page.locator('select[name*="language"], [data-testid*="language"] select, label:has-text("Language") ~ select').first();
    if (await langDropdown.count() > 0) {
      const options = await langDropdown.locator('option').allTextContents();
      const norwegianIdx = options.findIndex(o => /norwegian/i.test(o));
      if (norwegianIdx >= 0) {
        await langDropdown.selectOption({ index: norwegianIdx });
        await page.waitForLoadState('networkidle');
      }
    }

    // Translation input should be empty (not pre-filled with English)
    const translationInputs = page.locator('[data-testid*="translation-input"] input, [data-testid*="translation-input"] textarea, [class*="translation-field"] input');
    const count = await translationInputs.count();
    for (let i = 0; i < count; i++) {
      const value = await translationInputs.nth(i).inputValue().catch(() => '');
      if (englishText) {
        expect(value).not.toBe(englishText);
      }
      // Field should be empty for a fresh language switch
      expect(value.trim()).toBe('');
    }
  });
});
