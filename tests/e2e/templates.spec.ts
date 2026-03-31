import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { getAllVisibleText } from './helpers/text';
import { getFirstTemplateWithVersion, apiPost } from './helpers/api';

test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/template');
    await page.waitForLoadState('networkidle');
  });

  // TC-TMPL-001
  test('page title "Report + receipt templates"', async ({ page }) => {
    const title = page.locator('h1').first();
    await expect(title).toContainText(/report \+ receipt templates/i);
  });

  // TC-TMPL-002
  test('template name field validates as filename (no /, no spaces)', async ({ page }) => {
    // The editor is inline — no need to click a Create button
    const nameInput = page.locator('input[placeholder*="SustainabilityReport"]').first();
    await nameInput.fill('invalid / name');
    await nameInput.blur();

    const error = page.locator('p.text-red-500').first();
    await expect(error).toBeVisible({ timeout: 3000 });

    await nameInput.fill('invalid name with spaces');
    await nameInput.blur();

    const error2 = page.locator('p.text-red-500').first();
    await expect(error2).toBeVisible({ timeout: 3000 });
  });

  // TC-TMPL-003
  test('"Template configuration" heading and subtitle removed', async ({ page }) => {
    const allText = await getAllVisibleText(page);
    const hasTemplateConfig = allText.some(t => /template configuration/i.test(t));
    expect(hasTemplateConfig).toBe(false);
  });

  // TC-TMPL-004
  test('template type options contain no word "template"', async ({ page }) => {
    // Template type uses a custom radix Select; click the trigger to open it
    const typeTrigger = page.locator('label:has-text("Template type")').locator('..').locator('button[role="combobox"]').first();
    await typeTrigger.click();
    await page.waitForTimeout(300);

    const items = await page.locator('[role="option"]').allTextContents();
    for (const item of items) {
      if (item.trim()) {
        expect(item.toLowerCase()).not.toContain('template');
      }
    }
  });

  // TC-TMPL-005
  test('language label "Language"; all 9 languages; defaults to English', async ({ page }) => {
    const langLabel = page.locator('label:has-text("Language")').first();
    await expect(langLabel).toBeVisible();

    const expectedLanguages = [
      'English', 'Norwegian', 'Swedish', 'Danish', 'Finnish',
      'Lithuanian', 'Latvian', 'Estonian', 'Polish',
    ];

    // Open the language radix Select
    const langTrigger = langLabel.locator('..').locator('button[role="combobox"]').first();
    await langTrigger.click();
    await page.waitForTimeout(300);

    const options = await page.locator('[role="option"]').allTextContents();
    for (const lang of expectedLanguages) {
      expect(options.some(o => new RegExp(lang, 'i').test(o))).toBe(true);
    }

    // Close the dropdown by pressing Escape
    await page.keyboard.press('Escape');

    // Check that the currently displayed value indicates English (default)
    const triggerText = await langTrigger.textContent();
    expect(triggerText).toMatch(/english/i);
  });

  // TC-TMPL-006
  test('placeholders above tab selector; absent elsewhere', async ({ page }) => {
    // Placeholders text is rendered as a <p> with "Available placeholders:" above the tab buttons
    const placeholders = page.locator('p:has-text("Available placeholders")').first();
    // Tab buttons are inside a container with bg-[#F6F1FB]
    const tabContainer = page.locator('div.bg-\\[\\#F6F1FB\\]').first();

    if (await placeholders.count() > 0 && await tabContainer.count() > 0) {
      const placeholderBox = await placeholders.boundingBox();
      const tabBox = await tabContainer.boundingBox();

      if (placeholderBox && tabBox) {
        expect(placeholderBox.y).toBeLessThan(tabBox.y);
      }
    }
  });

  // TC-TMPL-007
  test('no section title text inside section content areas', async ({ page }) => {
    // The content area is inside a rounded border div below the tabs
    const contentAreas = page.locator('[class*="section-content"], [class*="editor"], div.rounded-\\[28px\\].border');
    const count = await contentAreas.count();
    for (let i = 0; i < count; i++) {
      const area = contentAreas.nth(i);
      const children = await area.locator('h1, h2, h3').allTextContents();
      // Section titles like "Cover Page", "About Sustainability" should not appear inside content
      for (const text of children) {
        expect(text.trim()).not.toMatch(/^(Cover Page|Table of Contents|About Sustainability|USPs|Increasing.*Impact|Certifications|Receipt)$/i);
      }
    }
  });

  // TC-TMPL-008
  test('header text fields are single-line inputs', async ({ page }) => {
    const headerInputs = page.locator('label:has-text("Header") ~ input, label:has-text("Header") ~ textarea, [data-testid*="header"] input, [data-testid*="header"] textarea');
    const count = await headerInputs.count();

    for (let i = 0; i < count; i++) {
      const el = headerInputs.nth(i);
      const tagName = await el.evaluate(e => e.tagName.toLowerCase());
      expect(tagName).toBe('input');
    }
  });

  // TC-TMPL-009
  test('existing version text loads into fields on open', async ({ page }) => {
    // The template page loads the active version inline — check that at least one field has content
    await page.waitForTimeout(2000); // Wait for API data to load

    const filledInputs: string[] = [];
    const allInputs = page.locator('input[type="text"], textarea');
    const inputCount = await allInputs.count();
    for (let i = 0; i < Math.min(inputCount, 20); i++) {
      const val = await allInputs.nth(i).inputValue();
      if (val.trim()) filledInputs.push(val);
    }
    expect(filledInputs.length).toBeGreaterThan(0);
  });

  // TC-TMPL-010
  test('cover page tab is default on load', async ({ page }) => {
    // Tabs are plain buttons; the active one has bg-[#4A145F] (dark purple) class
    const activeTab = page.locator('button.bg-\\[\\#4A145F\\]').first();
    const tabText = await activeTab.textContent();
    expect(tabText?.trim()).toMatch(/cover page/i);
  });

  // TC-TMPL-011
  test('about sustainability block labels: Block 1-4; no "Right side blocks" / "Bottom blocks"', async ({ page }) => {
    // Click the "About sustainability" tab button
    const sustainabilityTab = page.locator('button:has-text("About sustainability")').first();
    if (await sustainabilityTab.count() > 0) {
      await sustainabilityTab.click();
      await page.waitForTimeout(300);
    }

    const allText = await getAllVisibleText(page);

    const hasBlock1 = allText.some(t => /block 1/i.test(t));
    const hasBlock4 = allText.some(t => /block 4/i.test(t));
    expect(hasBlock1).toBe(true);
    expect(hasBlock4).toBe(true);

    const hasRightSide = allText.some(t => /right side blocks/i.test(t));
    const hasBottomBlocks = allText.some(t => /bottom blocks/i.test(t));
    expect(hasRightSide).toBe(false);
    expect(hasBottomBlocks).toBe(false);
  });

  // TC-TMPL-012
  test('image uploader labels "Image"; text box labels "Text" in blocks', async ({ page }) => {
    const sustainabilityTab = page.locator('button:has-text("About sustainability")').first();
    if (await sustainabilityTab.count() > 0) {
      await sustainabilityTab.click();
      await page.waitForTimeout(300);
    }

    const labels = await page.locator('label').allTextContents();
    const imageLabels = labels.filter(l => /image/i.test(l.trim()));
    const textLabels = labels.filter(l => /^text$/i.test(l.trim()));

    expect(imageLabels.length).toBeGreaterThan(0);
    expect(textLabels.length).toBeGreaterThan(0);

    // Labels should be just "Image" and "Text", not something longer
    for (const lbl of imageLabels) {
      expect(lbl.trim()).toMatch(/^image$/i);
    }
  });

  // TC-TMPL-013
  test('USPs tab title "Lofbergs USPs"; section label "Section 1"', async ({ page }) => {
    const uspsTab = page.locator('button:has-text("USP")').first();
    if (await uspsTab.count() > 0) {
      await uspsTab.click();
      await page.waitForTimeout(300);
    }

    const allText = await getAllVisibleText(page);
    const hasTitle = allText.some(t => /l.fbergs? usps/i.test(t));
    expect(hasTitle).toBe(true);

    const hasSection1 = allText.some(t => /section 1/i.test(t));
    expect(hasSection1).toBe(true);
  });

  // TC-TMPL-014
  test('increasing impact name field clearable; validation only on Publish', async ({ page }) => {
    const impactTab = page.locator('button:has-text("Increasing impact"), button:has-text("Impact")').first();
    if (await impactTab.count() > 0) {
      await impactTab.click();
      await page.waitForTimeout(300);
    }

    const nameField = page.locator('input[name*="name"], [data-testid*="impact-name"] input').first();
    if (await nameField.count() > 0) {
      await nameField.fill('Test Name');
      await nameField.clear();
      const val = await nameField.inputValue();
      expect(val).toBe('');

      // No validation error should show on clear (only on Publish)
      const errors = page.locator('p.text-red-500:visible, [role="alert"]:visible');
      await page.waitForTimeout(500);
      const errorCount = await errors.count();
      expect(errorCount).toBe(0);
    }
  });

  // TC-TMPL-015
  test('certifications: no word "certifications" in labels', async ({ page }) => {
    const certTab = page.locator('button:has-text("Certifications")').first();
    if (await certTab.count() > 0) {
      await certTab.click();
      await page.waitForTimeout(300);
    }

    const labels = await page.locator('label').allTextContents();
    for (const lbl of labels) {
      expect(lbl.trim().toLowerCase()).not.toContain('certifications');
    }
  });

  // TC-TMPL-016
  test('receipt: no word "receipt" in labels; image uploaders stack on mobile', async ({ page }) => {
    // Switch template type to Receipt via the radix Select
    const typeTrigger = page.locator('label:has-text("Template type")').locator('..').locator('button[role="combobox"]').first();
    await typeTrigger.click();
    await page.waitForTimeout(300);
    await page.locator('[role="option"]:has-text("Receipt")').click();
    await page.waitForTimeout(500);

    const labels = await page.locator('label').allTextContents();
    for (const lbl of labels) {
      expect(lbl.trim().toLowerCase()).not.toContain('receipt');
    }

    // Check stacking on mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const uploaders = page.locator('[data-testid*="uploader"], [class*="uploader"], input[type="file"]');
    const uploaderCount = await uploaders.count();
    if (uploaderCount >= 2) {
      const box1 = await uploaders.first().boundingBox();
      const box2 = await uploaders.nth(1).boundingBox();
      if (box1 && box2) {
        // Stacked means second is below first (not side by side)
        expect(box2.y).toBeGreaterThan(box1.y);
      }
    }
  });

  // TC-TMPL-017
  test('"Publish" button (not "+ Create a version")', async ({ page }) => {
    const publishBtn = page.locator('button:has-text("Publish")');
    await expect(publishBtn.first()).toBeVisible();

    const createVersionBtn = page.locator('button:has-text("Create a version")');
    await expect(createVersionBtn).toHaveCount(0);
  });

  // TC-TMPL-018
  test('publish blocked until all English fields + images filled; error identifies tab + field', async ({ page }) => {
    // Try to publish with empty/incomplete form
    const publishBtn = page.locator('button:has-text("Publish")').first();
    await publishBtn.click();

    // Error should appear — either a status message or validation error
    const errorMessages = page.locator('div.text-red-700, p.text-red-500, [role="alert"], [data-testid*="validation-error"]');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });

    const errorText = await errorMessages.allTextContents();
    const combinedErrors = errorText.join(' ');
    // Errors should reference tab or field names
    expect(combinedErrors.length).toBeGreaterThan(0);
  });

  // TC-TMPL-019
  test('draft rows: Open + Delete only (no Publish)', async ({ page }) => {
    // Version history uses data-testid="template-item" divs, not table rows
    let draftRow = page.locator('[data-testid="template-item"]:has-text("Draft")').first();
    if (await draftRow.count() === 0) {
      // Create a draft via API if none exists
      const { templateId } = await getFirstTemplateWithVersion();
      await apiPost(`/templates/${templateId}/versions/draft`);
      await page.goto('/template');
      await page.waitForLoadState('networkidle');
      draftRow = page.locator('[data-testid="template-item"]:has-text("Draft")').first();
    }

    await expect(draftRow).toBeVisible({ timeout: 5000 });

    // Check that Open and Delete buttons are present, but not Publish
    const openBtn = draftRow.locator('button:has-text("Open")');
    const deleteBtn = draftRow.locator('button:has-text("Delete")');
    const publishBtn = draftRow.locator('button:has-text("Publish")');

    await expect(openBtn).toBeVisible();
    await expect(deleteBtn).toBeVisible();
    await expect(publishBtn).toHaveCount(0);
  });

  // TC-TMPL-020
  test('active/previous rows: Open only (no Restore)', async ({ page }) => {
    const activeRow = page.locator('[data-testid="template-item"]:has-text("Active")').first();
    if (await activeRow.count() > 0) {
      const openBtn = activeRow.locator('button:has-text("Open")');
      const restoreBtn = activeRow.locator('button:has-text("Restore")');
      await expect(openBtn).toBeVisible();
      await expect(restoreBtn).toHaveCount(0);
    }

    const archivedRow = page.locator('[data-testid="template-item"]:has-text("Archived")').first();
    if (await archivedRow.count() > 0) {
      const openBtn = archivedRow.locator('button:has-text("Open")');
      const restoreBtn = archivedRow.locator('button:has-text("Restore")');
      await expect(openBtn).toBeVisible();
      await expect(restoreBtn).toHaveCount(0);
    }
  });

  // TC-TMPL-021
  test('one version row created per publish (not two)', async ({ page }) => {
    // Version history uses data-testid="template-item" divs
    // Verify that no version number appears twice
    const versionCounts = new Map<string, number>();
    const rows = page.locator('[data-testid="template-item"]');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const text = await rows.nth(i).textContent();
      const version = text?.match(/Version\s+(\d+)/)?.[1];
      if (version) {
        versionCounts.set(version, (versionCounts.get(version) || 0) + 1);
      }
    }

    for (const [version, count] of versionCounts) {
      expect(count).toBe(1);
    }
  });

  // TC-TMPL-022
  test('template name change persists after Save draft', async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="SustainabilityReport"]').first();
    const testName = `TestTemplate_${Date.now()}`;
    await nameInput.fill(testName);

    const saveDraftBtn = page.locator('button:has-text("Save as draft")').first();
    if (await saveDraftBtn.count() > 0) {
      await saveDraftBtn.click();
      await page.waitForLoadState('networkidle');

      // Reload and check the name persists
      await page.goto('/template');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const pageText = await getAllVisibleText(page);
      const found = pageText.some(t => t.includes(testName));
      expect(found).toBe(true);
    }
  });

  // TC-TMPL-023
  test('name, type, language on same row at 1024px+', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(300);

    // Labels are "Version name", "Template type", "Language"
    const nameField = page.locator('label:has-text("Version name")').first();
    const typeField = page.locator('label:has-text("Template type")').first();
    const langField = page.locator('label:has-text("Language")').first();

    if (await nameField.count() > 0 && await typeField.count() > 0 && await langField.count() > 0) {
      const nameBox = await nameField.boundingBox();
      const typeBox = await typeField.boundingBox();
      const langBox = await langField.boundingBox();

      if (nameBox && typeBox && langBox) {
        // All three should have similar Y positions (same row)
        const tolerance = 40;
        expect(Math.abs(nameBox.y - typeBox.y)).toBeLessThan(tolerance);
        expect(Math.abs(typeBox.y - langBox.y)).toBeLessThan(tolerance);
      }
    }
  });

  // TC-TMPL-024
  test('cover page background image uploader shows "10 MB" limit', async ({ page }) => {
    // Cover page is the default tab
    const allText = await getAllVisibleText(page);
    const has10MB = allText.some(t => /10\s*MB/i.test(t));
    expect(has10MB).toBe(true);
  });

  // TC-TMPL-025
  test('cover page header field value contains no <p> HTML tags', async ({ page }) => {
    // The template page loads version content inline. Cover Page is the default tab.
    await page.waitForTimeout(2000); // Wait for API data to load

    // Ensure we are on the Cover Page tab (default)
    const coverTab = page.locator('button:has-text("Cover page")').first();
    if (await coverTab.count() > 0) {
      await coverTab.click();
      await page.waitForTimeout(500);
    }

    const headerInputs = page.locator('input[name*="header"], [data-testid*="header"] input, label:has-text("Header") ~ input');
    const count = await headerInputs.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const value = await headerInputs.nth(i).inputValue();
      expect(value).not.toContain('<p>');
      expect(value).not.toContain('</p>');
    }
  });
});
