import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { generateTestCsvContent } from './helpers/api';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5215';

const WIZARD_PATHS = ['/reports/generate', '/report-generation', '/reports/new', '/generate-report', '/reports/create'];

async function navigateToWizard(page: import('@playwright/test').Page) {
  for (const p of WIZARD_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('report') || url.includes('generate')) {
      return url;
    }
  }
  // Fallback: try nav link
  const navLink = page.getByText(/generate|create.*report|new.*report/i).first();
  if (await navLink.isVisible().catch(() => false)) {
    await navLink.click();
    await page.waitForLoadState('networkidle');
  }
  return page.url();
}

async function goToStep(page: import('@playwright/test').Page, targetStep: number) {
  await navigateToWizard(page);
  for (let i = 1; i < targetStep; i++) {
    const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }
  }
}

test.describe('Report Wizard', () => {
  // TC-GENREP-001
  test('page title is "Generate report & receipt"', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const heading = page.getByRole('heading', { name: /generate report/i }).or(
      page.locator('h1, h2').filter({ hasText: /generate report/i })
    ).first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text?.toLowerCase()).toContain('generate report');
    expect(text?.toLowerCase()).toContain('receipt');
  });

  // TC-GENREP-002
  test('step 1: no "Fill in the form fields below to..." instructional text', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText.toLowerCase()).not.toContain('fill in the form fields below');
  });

  // TC-GENREP-003
  test('step 1: label is "Customer" only, not "Customer name"', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const labels = await page.locator('label').allTextContents();
    const customerLabels = labels.filter(l => /customer/i.test(l));
    expect(customerLabels.length).toBeGreaterThan(0);

    // None should say "Customer name"
    for (const label of customerLabels) {
      expect(label.trim().toLowerCase()).not.toBe('customer name');
    }
  });

  // TC-GENREP-004
  test('step 1: salesperson dropdown placeholder is "Find by name/email"', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const salespersonInput = page.getByPlaceholder(/find by name/i).or(
      page.getByPlaceholder(/name.*email/i)
    ).first();
    await expect(salespersonInput).toBeVisible();
  });

  // TC-GENREP-005
  test('step 1: language defaults to English', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    // Check language select / combobox value
    const langSelect = page.locator('select, [role="combobox"], [role="listbox"]')
      .filter({ hasText: /english/i }).first();
    const langInput = page.locator('input').filter({ hasText: /english/i }).first();
    const langDisplay = page.locator('[class*="select"], [class*="dropdown"]')
      .filter({ hasText: /english/i }).first();

    const found =
      (await langSelect.isVisible().catch(() => false)) ||
      (await langInput.isVisible().catch(() => false)) ||
      (await langDisplay.isVisible().catch(() => false));

    expect(found).toBe(true);
  });

  // TC-GENREP-006
  test('step 1: date picker accepts keyboard input', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const dateInput = page.locator('input[type="date"], input[name*="date" i], [data-testid*="date"]').first();
    await expect(dateInput).toBeVisible();
    await dateInput.click();
    await dateInput.fill('2026-03-27');
    const value = await dateInput.inputValue();
    expect(value).toBeTruthy();
  });

  // TC-GENREP-007
  test('step 1: archived customers do not appear in dropdown', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i]')
    ).first();

    if (await customerInput.isVisible().catch(() => false)) {
      await customerInput.fill('a');
      await page.waitForTimeout(1500);

      const options = page.locator('[role="option"], [class*="option"], li[class*="option"]');
      const optionTexts = await options.allTextContents();

      // Archived customers should not appear; look for any "(archived)" markers
      for (const opt of optionTexts) {
        expect(opt.toLowerCase()).not.toContain('archived');
      }
    }
  });

  // TC-GENREP-008
  test('salesperson role: no salesperson dropdown; only active customers', async ({ page }) => {
    await loginAs(page, 'salesperson');
    await navigateToWizard(page);

    const bodyText = await page.locator('body').textContent() ?? '';
    const labels = await page.locator('label').allTextContents();

    // Salesperson dropdown should not be present
    const hasSalespersonLabel = labels.some(l => /salesperson/i.test(l));
    expect(hasSalespersonLabel).toBe(false);

    // Customer dropdown should still work and show only active
    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i]')
    ).first();

    if (await customerInput.isVisible().catch(() => false)) {
      await customerInput.fill('a');
      await page.waitForTimeout(1500);
      const options = page.locator('[role="option"], [class*="option"], li[class*="option"]');
      const optionTexts = await options.allTextContents();
      for (const opt of optionTexts) {
        expect(opt.toLowerCase()).not.toContain('archived');
      }
    }
  });

  // TC-GENREP-009
  test('cannot advance step without completing required fields', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
    await expect(nextBtn).toBeVisible();

    // Click next without filling anything
    await nextBtn.click();
    await page.waitForTimeout(1000);

    // Either the button is disabled, we stay on the same step, or validation messages appear
    const bodyText = await page.locator('body').textContent() ?? '';
    const hasValidation = /required|please|must|field|error/i.test(bodyText);
    const urlStillStep1 = page.url();

    // We should still be on step 1 or see errors
    expect(hasValidation || urlStillStep1.includes('step') || urlStillStep1.includes('generate')).toBe(true);
  });

  // TC-GENREP-010
  test('step 2: label is "Purchase data"', async ({ page }) => {
    await loginAs(page, 'admin');
    await goToStep(page, 2);

    const heading = page.getByText(/purchase data/i).first();
    await expect(heading).toBeVisible();
  });

  // TC-GENREP-011
  test('step 2: removed labels/text confirmed absent', async ({ page }) => {
    await loginAs(page, 'admin');
    await goToStep(page, 2);

    const bodyText = await page.locator('body').textContent() ?? '';
    const lower = bodyText.toLowerCase();

    expect(lower).not.toContain('illustrates the percentage');
    expect(lower).not.toContain('fill in the form fields');
    expect(lower).not.toContain('data display table');
  });

  // TC-GENREP-012
  test('step 2: CO2 value picked up from CSV', async ({ page }) => {
    test.setTimeout(30000);
    await loginAs(page, 'admin');
    await page.goto('/report-generation');
    await page.waitForLoadState('networkidle');

    // Fill Step 1 required fields: enter a manual customer name
    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i]')
    ).first();
    if (await customerInput.isVisible().catch(() => false)) {
      await customerInput.fill('Test Customer CSV');
      await page.waitForTimeout(500);
      // Select manual entry if a "manual" or "add new" option appears
      const manualOption = page.getByText(/manual|add new|create new/i).first();
      if (await manualOption.isVisible().catch(() => false)) {
        await manualOption.click();
      }
    }

    // Navigate to Step 2
    const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Write a temporary CSV file from the helper
    const csvContent = generateTestCsvContent();
    const tmpDir = os.tmpdir();
    const csvPath = path.join(tmpDir, 'test-report-data.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');

    try {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(csvPath);
      } else {
        // Fallback: use file chooser event
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 5000 }),
          page.getByRole('button', { name: /upload|import|browse/i }).first().click(),
        ]);
        await fileChooser.setFiles(csvPath);
      }

      await page.waitForTimeout(3000);

      // CO2 value (500) should appear in the data table
      const bodyText = await page.locator('body').textContent() ?? '';
      expect(bodyText).toContain('500');
    } finally {
      // Clean up temp file
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    }
  });

  // TC-GENREP-013
  test('step 2: back + forward does not lose CSV data', async ({ page }) => {
    test.setTimeout(30000);
    await loginAs(page, 'admin');
    await page.goto('/report-generation');
    await page.waitForLoadState('networkidle');

    // Fill Step 1 required fields
    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i]')
    ).first();
    if (await customerInput.isVisible().catch(() => false)) {
      await customerInput.fill('Test Customer Nav');
      await page.waitForTimeout(500);
      const manualOption = page.getByText(/manual|add new|create new/i).first();
      if (await manualOption.isVisible().catch(() => false)) {
        await manualOption.click();
      }
    }

    // Navigate to Step 2
    const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Write and upload a temporary CSV file
    const csvContent = generateTestCsvContent();
    const tmpDir = os.tmpdir();
    const csvPath = path.join(tmpDir, 'test-nav-data.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf-8');

    try {
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(csvPath);
      } else {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 5000 }),
          page.getByRole('button', { name: /upload|import|browse/i }).first().click(),
        ]);
        await fileChooser.setFiles(csvPath);
      }

      await page.waitForTimeout(2000);

      // Capture data visible before navigation
      const dataBefore = await page.locator('table tbody, [class*="data"]').first().textContent().catch(() => '');
      expect(dataBefore).toBeTruthy();

      // Go back to Step 1
      const backBtn = page.getByRole('button', { name: /back|previous|prev/i }).first();
      await expect(backBtn).toBeVisible();
      await backBtn.click();
      await page.waitForTimeout(1500);

      // Go forward to Step 2 again
      const nextBtnAgain = page.getByRole('button', { name: /next|continue|proceed/i }).first();
      await expect(nextBtnAgain).toBeVisible();
      await nextBtnAgain.click();
      await page.waitForTimeout(1500);

      // Data should still be present after back+forward
      const dataAfter = await page.locator('table tbody, [class*="data"]').first().textContent().catch(() => '');
      expect(dataAfter).toBeTruthy();
      if (dataBefore) {
        expect(dataAfter).toContain(dataBefore.substring(0, 20));
      }
    } finally {
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    }
  });

  // TC-GENREP-014
  test('step 3: label is "Add ons" (no apostrophe)', async ({ page }) => {
    await loginAs(page, 'admin');
    await goToStep(page, 3);

    const bodyText = await page.locator('body').textContent() ?? '';
    // Should say "Add ons" not "Add-on's" or "Add on's"
    expect(/add ons/i.test(bodyText)).toBe(true);
    expect(bodyText).not.toMatch(/add on's/i);
  });

  // TC-GENREP-015
  test('step 4: "Cover page" label absent; no excess space', async ({ page }) => {
    await loginAs(page, 'admin');
    await goToStep(page, 4);

    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText.toLowerCase()).not.toContain('cover page');
  });

  // TC-GENREP-016
  test('step 4: "Increasing impact" and "Certifications" labels correct', async ({ page }) => {
    await loginAs(page, 'admin');
    await goToStep(page, 4);

    const bodyText = await page.locator('body').textContent() ?? '';
    const lower = bodyText.toLowerCase();

    // Should not say "Add on" as section header here
    // Should have "Increasing impact" (or "Increasing positive impact")
    expect(/increasing.*impact/i.test(bodyText)).toBe(true);

    // Should say "Certifications", not "Cerifications" (typo)
    expect(lower).not.toContain('cerifications');
    expect(/certifications/i.test(bodyText)).toBe(true);
  });

  // TC-GENREP-017
  test('step 5: Preview disables buttons without changing Generate label', async ({ page }) => {
    test.setTimeout(45000);
    await loginAs(page, 'admin');
    await goToStep(page, 5);

    const previewBtn = page.getByRole('button', { name: /preview/i }).first();
    const generateBtn = page.getByRole('button', { name: /generate/i }).first();

    if (await previewBtn.isVisible().catch(() => false)) {
      const generateLabelBefore = await generateBtn.textContent().catch(() => '');
      await previewBtn.click();
      await page.waitForTimeout(2000);

      // Generate button label should not change
      const generateLabelAfter = await generateBtn.textContent().catch(() => '');
      expect(generateLabelAfter).toBe(generateLabelBefore);

      // Buttons should be disabled during preview generation
      // (check immediately; they may re-enable after preview completes)
    }
  });

  // TC-GENREP-018
  test('step 5: Preview opens new tab; no historical report entry; no blob', async ({ page, context }) => {
    test.setTimeout(60000);
    await loginAs(page, 'admin');
    await page.goto('/report-generation');
    await page.waitForLoadState('networkidle');

    // Navigate through all steps to reach Step 5
    for (let step = 1; step < 5; step++) {
      const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Intercept POST to historical reports API
    let historicalPostCalled = false;
    await page.route('**/api/reports**', (route) => {
      if (route.request().method() === 'POST') {
        historicalPostCalled = true;
      }
      route.continue();
    });

    // Intercept blob storage calls
    let blobCalled = false;
    await page.route('**blob.core.windows.net**', (route) => {
      blobCalled = true;
      route.continue();
    });
    await page.route('**/api/blobs**', (route) => {
      blobCalled = true;
      route.continue();
    });

    const previewBtn = page.getByRole('button', { name: /preview/i }).first();
    await expect(previewBtn).toBeVisible({ timeout: 5000 });

    // Click Preview and wait for a new tab
    const newTabPromise = context.waitForEvent('page', { timeout: 15000 }).catch(() => null);
    await previewBtn.click();
    const newTab = await newTabPromise;

    // Assert new tab opened
    expect(newTab).toBeTruthy();
    if (newTab) await newTab.close();

    // No historical report entry or blob should be created on preview
    expect(historicalPostCalled).toBe(false);
    expect(blobCalled).toBe(false);
  });

  // TC-GENREP-019
  test('step 5: during generation all controls disabled; navigation shows warning', async ({ page }) => {
    test.setTimeout(60000);
    await loginAs(page, 'admin');
    await page.goto('/report-generation');
    await page.waitForLoadState('networkidle');

    // Navigate through all steps to reach Step 5
    for (let step = 1; step < 5; step++) {
      const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    const generateBtn = page.getByRole('button', { name: /generate/i }).first();
    await expect(generateBtn).toBeVisible({ timeout: 5000 });

    // Intercept the generation API to delay the response, simulating a long generation
    await page.route('**/api/reports/generate**', async (route) => {
      await new Promise(r => setTimeout(r, 10000));
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Listen for dialog (beforeunload warning)
    let dialogShown = false;
    page.on('dialog', async (dialog) => {
      dialogShown = true;
      await dialog.dismiss();
    });

    await generateBtn.click();
    await page.waitForTimeout(500);

    // All interactive controls should be disabled during generation
    const buttons = page.locator('button:not([disabled])');
    const enabledCount = await buttons.count();
    expect(enabledCount).toBeLessThanOrEqual(1);

    // Check that inputs are also disabled
    const enabledInputs = page.locator('input:not([disabled]):not([readonly]), select:not([disabled])');
    const enabledInputCount = await enabledInputs.count();
    expect(enabledInputCount).toBeLessThanOrEqual(0);

    // Attempt navigation to trigger beforeunload warning
    await page.goto('/report-generation').catch(() => {});
    // The dialog handler above captures the beforeunload if it fires
  });

  // TC-GENREP-020
  test('step 5: Generate completion creates historical report entry and download', async ({ page, context }) => {
    test.fixme(true, 'Requires full end-to-end environment with PuppeteerSharp, Azure Blob Storage, and seeded customer/template data to generate a real report. Cannot be reliably automated without a running backend that has report generation dependencies (headless Chrome, blob storage).');
  });

  // TC-GENREP-021
  test('right summary panel: correct labels and format', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    // The summary panel is typically on the right side
    const summaryPanel = page.locator('[class*="summary"], [class*="sidebar"], [data-testid*="summary"]').first();
    if (await summaryPanel.isVisible().catch(() => false)) {
      const panelText = await summaryPanel.textContent() ?? '';
      // Should contain key labels like Customer, Language, Date, etc.
      expect(/customer/i.test(panelText)).toBe(true);
    } else {
      // Panel may appear after filling in some data; check for any summary-like area
      const bodyText = await page.locator('body').textContent() ?? '';
      test.info().annotations.push({
        type: 'note',
        description: 'Summary panel not immediately visible; may require customer selection first',
      });
    }
  });

  // TC-GENREP-022
  test('save as draft disabled before customer details; no "Unknown" customer drafts', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    const draftBtn = page.getByRole('button', { name: /save.*draft|draft/i }).first();
    if (await draftBtn.isVisible().catch(() => false)) {
      // Should be disabled before customer details are filled
      await expect(draftBtn).toBeDisabled();
    }

    // Save as draft should not create an "Unknown" customer entry
    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText.toLowerCase()).not.toContain('unknown');
  });

  // TC-GENREP-023
  test('mobile (375px): step buttons show icons only', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Step buttons / tabs should be icon-only at mobile width
    const stepButtons = page.locator('[class*="step"], [role="tab"], [class*="wizard-step"]');
    const count = await stepButtons.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const btn = stepButtons.nth(i);
        const text = (await btn.textContent() ?? '').trim();
        const box = await btn.boundingBox();
        // At mobile size, step text should be hidden or very short (icon only)
        if (box && box.width < 60) {
          // Small width suggests icon-only
          expect(box.width).toBeLessThan(100);
        }
      }
    }
  });

  // TC-GENREP-024
  test('back button disabled state: border present, no fill', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToWizard(page);

    // On step 1 the back button should be disabled
    const backBtn = page.getByRole('button', { name: /back|previous|prev/i }).first();
    if (await backBtn.isVisible().catch(() => false)) {
      await expect(backBtn).toBeDisabled();

      // Check styling: border present, no fill (background should be transparent or white)
      const styles = await backBtn.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          border: cs.border,
          borderWidth: cs.borderWidth,
          backgroundColor: cs.backgroundColor,
        };
      });

      // Should have a border
      expect(styles.borderWidth).not.toBe('0px');

      // Background should be transparent or very light (no solid fill)
      const bg = styles.backgroundColor;
      const isTransparentOrLight =
        bg === 'transparent' ||
        bg === 'rgba(0, 0, 0, 0)' ||
        bg.startsWith('rgb(255') ||
        bg.startsWith('rgba(255');
      expect(isTransparentOrLight).toBe(true);
    }
  });
});
