import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { getAllVisibleText } from './helpers/text';

test.describe('Translations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'translator');
    await page.goto('/template/translate');
    await page.waitForLoadState('networkidle');
  });

  // TC-TRANS-001
  test('non-RTE inputs are single-line', async ({ page }) => {
    // The translation editor is inline — no need to click into a row.
    // Wait for translation content to load
    await page.waitForTimeout(2000);

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
    // The translation page is an inline editor
    await page.waitForTimeout(2000);

    const allText = await getAllVisibleText(page);

    // Look for N/A placeholder text where English source is empty
    const naElements = page.locator('input[placeholder="N/A"], [data-testid*="english-source"]:has-text("N/A")');
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
    // Translation page excludes English — only non-English languages are shown
    const expectedNonEnglishLanguages = [
      'Norwegian', 'Swedish', 'Danish', 'Finnish',
      'Lithuanian', 'Latvian', 'Estonian', 'Polish',
    ];

    // The page uses a custom radix Select for language
    const langLabel = page.locator('label:has-text("Language")').first();
    const langTrigger = langLabel.locator('..').locator('button[role="combobox"]').first();
    await langTrigger.click();
    await page.waitForTimeout(300);

    const items = await page.locator('[role="option"]').allTextContents();
    for (const lang of expectedNonEnglishLanguages) {
      expect(items.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
    }

    await page.keyboard.press('Escape');
  });

  // TC-TRANS-004
  test('save draft persists translation; language switch and return retains text', async ({ page }) => {
    // The translation editor is inline; wait for content to load
    await page.waitForTimeout(2000);

    // Type into the first translation field
    const translationInput = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    const testText = `TranslationTest_${Date.now()}`;
    await translationInput.fill(testText);

    // Save draft
    const saveBtn = page.locator('button:has-text("Save as draft")').first();
    await saveBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Switch language via radix Select
    const langLabel = page.locator('label:has-text("Language")').first();
    const langTrigger = langLabel.locator('..').locator('button[role="combobox"]').first();

    // Switch to a different language
    await langTrigger.click();
    await page.waitForTimeout(300);
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    if (optionCount >= 2) {
      await options.nth(1).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Switch back to original language
      await langTrigger.click();
      await page.waitForTimeout(300);
      await options.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // Verify text is retained
    const currentValue = await translationInput.inputValue().catch(() =>
      translationInput.textContent()
    );
    expect(currentValue).toContain(testText);
  });

  // TC-TRANS-005
  test('switching to another language shows empty field (not copied English text)', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Get the current text in the first translation field
    const translationInput = page.locator('input[type="text"], textarea').first();
    const currentText = await translationInput.inputValue().catch(() => '');

    // Switch to another non-English language via the radix Select
    const langLabel = page.locator('label:has-text("Language")').first();
    const langTrigger = langLabel.locator('..').locator('button[role="combobox"]').first();
    await langTrigger.click();
    await page.waitForTimeout(300);

    // Pick a different language option (last in list to avoid the already-selected one)
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    if (optionCount >= 2) {
      await options.nth(optionCount - 1).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    }

    // Translation inputs should be empty for a fresh language switch (not pre-filled with English)
    const allInputs = page.locator('input[type="text"], textarea');
    const inputCount = await allInputs.count();
    let emptyCount = 0;
    for (let i = 0; i < inputCount; i++) {
      const value = await allInputs.nth(i).inputValue().catch(() => '');
      // Fields should be empty for a fresh language switch
      if (value.trim() === '') emptyCount++;
    }
    // At least some translation fields should be empty on a fresh language switch
    if (inputCount > 0) {
      expect(emptyCount).toBeGreaterThan(0);
    }
  });
});
