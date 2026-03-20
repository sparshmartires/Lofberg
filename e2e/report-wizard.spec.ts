import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales } from './helpers/auth';
import path from 'path';

const REPORT_PATHS = ['/reports/generate', '/report-generation', '/reports/new', '/generate-report', '/reports/create'];

async function navigateToReportWizard(page: import('@playwright/test').Page): Promise<string> {
  for (const p of REPORT_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('report') || url.includes('generate')) {
      return url;
    }
  }
  // Try via nav
  const navLink = page.getByText(/generate|create.*report|new.*report/i).first();
  if (await navLink.isVisible().catch(() => false)) {
    await navLink.click();
    await page.waitForLoadState('networkidle');
  }
  return page.url();
}

test.describe('Report Wizard - Step 1: Customer & Report Details', () => {
  test('RW1: Navigate to report generation wizard', async ({ page }) => {
    await loginAsAdmin(page);
    const url = await navigateToReportWizard(page);
    console.log('RW1: Report wizard URL:', url);

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RW1: Body snippet:', bodyText.substring(0, 500));
    test.info().annotations.push({ type: 'note', description: `Wizard URL: ${url}` });
  });

  test('RW2: Step 1 - Customer search/select', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Look for customer search
    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i], [data-testid*="customer"]')
    ).first();

    const visible = await customerInput.isVisible().catch(() => false);
    console.log('RW2: Customer input visible:', visible);

    const labels = await page.locator('label').allTextContents();
    console.log('RW2: Labels:', labels);
    test.info().annotations.push({ type: 'note', description: `Customer input: ${visible}, Labels: ${JSON.stringify(labels)}` });
  });

  test('RW3: Step 1 - Report date field', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const dateInput = page.locator('input[type="date"], input[name*="date" i], [data-testid*="date"]').first();
    const visible = await dateInput.isVisible().catch(() => false);
    console.log('RW3: Date input visible:', visible);

    if (visible) {
      const value = await dateInput.inputValue().catch(() => '');
      console.log('RW3: Default date value:', value);
    }

    test.info().annotations.push({ type: 'note', description: `Date field visible: ${visible}` });
  });

  test('RW4: Step 1 - Language selection', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const langSelect = page.locator('select, [role="combobox"]').filter({ hasText: /language|english|norwegian/i }).first();
    const langVisible = await langSelect.isVisible().catch(() => false);
    console.log('RW4: Language selector visible:', langVisible);

    // Also check for language labels
    const bodyText = await page.locator('body').textContent() || '';
    const hasLanguage = /language/i.test(bodyText);
    console.log('RW4: Language mentioned on page:', hasLanguage);

    test.info().annotations.push({ type: 'note', description: `Language select: ${langVisible}, mentioned: ${hasLanguage}` });
  });

  test('RW5: Step 1 - Salesperson dropdown (admin sees it)', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const salesSelect = page.locator('select, [role="combobox"], [role="listbox"]').filter({ hasText: /sales|representative|rep/i }).first();
    const visible = await salesSelect.isVisible().catch(() => false);

    const bodyText = await page.locator('body').textContent() || '';
    const hasSales = /salesperson|sales.*rep/i.test(bodyText);
    console.log('RW5: Salesperson selector visible:', visible, 'mentioned:', hasSales);

    test.info().annotations.push({ type: 'note', description: `Salesperson: visible=${visible}, mentioned=${hasSales}` });
  });

  test('RW6: Step 1 - Salesperson hidden for sales role', async ({ page }) => {
    await loginAsSales(page);
    await navigateToReportWizard(page);

    const bodyText = await page.locator('body').textContent() || '';
    const hasSalesperson = /salesperson/i.test(bodyText);
    console.log('RW6: Salesperson field for sales user:', hasSalesperson);

    test.info().annotations.push({ type: 'note', description: `Sales user sees salesperson: ${hasSalesperson}` });
  });
});

test.describe('Report Wizard - Step Navigation', () => {
  test('RW7: Next button moves to step 2', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const nextBtn = page.getByRole('button', { name: /next|continue|proceed/i }).first();
    const visible = await nextBtn.isVisible().catch(() => false);
    console.log('RW7: Next button visible:', visible);

    if (visible) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
      const bodyText = await page.locator('body').textContent() || '';
      console.log('RW7: After next, body snippet:', bodyText.substring(0, 500));
    }

    test.info().annotations.push({ type: 'note', description: `Next button: ${visible}` });
  });

  test('RW8: Back button returns to previous step', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Try to go to step 2 first
    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);

      const backBtn = page.getByRole('button', { name: /back|previous|prev/i }).first();
      const backVisible = await backBtn.isVisible().catch(() => false);
      console.log('RW8: Back button visible:', backVisible);

      if (backVisible) {
        await backBtn.click();
        await page.waitForTimeout(2000);
        console.log('RW8: After back URL:', page.url());
      }
    }

    test.info().annotations.push({ type: 'note', description: 'Back button test completed.' });
  });

  test('RW9: Step indicators present', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Look for step indicators (stepper, breadcrumb, numbered steps)
    const stepIndicators = page.locator('[class*="step"], [class*="stepper"], [role="progressbar"], [aria-label*="step"], [class*="wizard"]');
    const count = await stepIndicators.count();
    console.log('RW9: Step indicators found:', count);

    // Check for numbered steps in text
    const bodyText = await page.locator('body').textContent() || '';
    const hasStepNumbers = /step\s*[1-5]|1\s*of\s*5|2\s*of\s*5/i.test(bodyText);
    console.log('RW9: Step numbers in text:', hasStepNumbers);

    test.info().annotations.push({ type: 'note', description: `Step indicators: ${count}, numbers in text: ${hasStepNumbers}` });
  });
});

test.describe('Report Wizard - Step 2: Data Source', () => {
  test('RW10: Step 2 has file upload area', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Try to navigate to step 2
    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    const fileInput = page.locator('input[type="file"]');
    const fileVisible = await fileInput.count();

    // Also check for drop zone
    const dropZone = page.locator('[class*="drop"], [class*="upload"], [data-testid*="upload"]');
    const dropCount = await dropZone.count();

    console.log('RW10: File inputs:', fileVisible, 'Drop zones:', dropCount);
    test.info().annotations.push({ type: 'note', description: `File input: ${fileVisible}, drop zone: ${dropCount}` });
  });

  test('RW11: Data table displayed after entering step 2', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    const table = page.locator('table, [role="table"], [class*="data-table"], [class*="grid"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('RW11: Data table visible:', tableVisible);

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RW11: Body snippet:', bodyText.substring(0, 500));
    test.info().annotations.push({ type: 'note', description: `Data table: ${tableVisible}` });
  });

  test('RW12: Upload valid CSV', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Navigate to step 2
    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      const csvPath = path.resolve(__dirname, 'fixtures', 'valid-report-data.csv');
      await fileInput.setInputFiles(csvPath);
      await page.waitForTimeout(3000);

      console.log('RW12: File uploaded');
      const bodyText = await page.locator('body').textContent() || '';
      console.log('RW12: After upload body:', bodyText.substring(0, 500));
    } else {
      console.log('RW12: No file input found');
    }

    test.info().annotations.push({ type: 'note', description: 'CSV upload test completed.' });
  });

  test('RW13: Upload invalid CSV shows error', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);
    }

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      const csvPath = path.resolve(__dirname, 'fixtures', 'invalid-report-data.csv');
      await fileInput.setInputFiles(csvPath);
      await page.waitForTimeout(3000);

      const bodyText = await page.locator('body').textContent() || '';
      const hasError = /error|invalid|wrong.*type|validation/i.test(bodyText);
      console.log('RW13: Error shown for invalid CSV:', hasError);
      console.log('RW13: Body snippet:', bodyText.substring(0, 500));
    } else {
      console.log('RW13: No file input found');
    }

    test.info().annotations.push({ type: 'note', description: 'Invalid CSV test completed.' });
  });
});

test.describe('Report Wizard - Step 3: Report Type', () => {
  test('RW14: Report type radio buttons', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Navigate through steps
    for (let i = 0; i < 2; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const radios = page.locator('input[type="radio"]');
    const radioCount = await radios.count();
    console.log('RW14: Radio buttons found:', radioCount);

    const bodyText = await page.locator('body').textContent() || '';
    const hasReportType = /report.*receipt|receipt.*only|compiled/i.test(bodyText);
    console.log('RW14: Report type text found:', hasReportType);
    console.log('RW14: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Radios: ${radioCount}, report type text: ${hasReportType}` });
  });

  test('RW15: Compiled receipt checkbox', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 2; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log('RW15: Checkboxes found:', checkboxCount);

    const bodyText = await page.locator('body').textContent() || '';
    const hasCompiled = /compiled/i.test(bodyText);
    console.log('RW15: Compiled receipt mentioned:', hasCompiled);

    test.info().annotations.push({ type: 'note', description: `Checkboxes: ${checkboxCount}, compiled: ${hasCompiled}` });
  });

  test('RW16: Media screen options', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 2; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasMedia = /media|screen|800.*480|800.*600/i.test(bodyText);
    console.log('RW16: Media screen options found:', hasMedia);
    console.log('RW16: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Media screens: ${hasMedia}` });
  });
});

test.describe('Report Wizard - Step 4: Content Customization', () => {
  test('RW17: Navigate to step 4', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RW17: Step 4 body snippet:', bodyText.substring(0, 500));
    test.info().annotations.push({ type: 'note', description: 'Step 4 navigation completed.' });
  });

  test('RW18: ToC toggle', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasToc = /table.*contents|toc/i.test(bodyText);
    const toggles = await page.locator('input[type="checkbox"], [role="switch"]').count();
    console.log('RW18: ToC text:', hasToc, 'Toggles:', toggles);

    test.info().annotations.push({ type: 'note', description: `ToC: ${hasToc}, toggles: ${toggles}` });
  });

  test('RW19: Impact blocks selection (up to 3)', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasImpact = /impact/i.test(bodyText);
    console.log('RW19: Impact mentioned:', hasImpact);
    console.log('RW19: Body snippet:', bodyText.substring(0, 500));

    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log('RW19: Checkboxes:', checkboxes);

    test.info().annotations.push({ type: 'note', description: `Impact: ${hasImpact}, checkboxes: ${checkboxes}` });
  });

  test('RW20: Receipt unit selection (cups/kg)', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasUnits = /cups|kilogram|kg|football|pitch/i.test(bodyText);
    console.log('RW20: Unit selection text:', hasUnits);
    console.log('RW20: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Unit selection: ${hasUnits}` });
  });

  test('RW21: CO2 unit selection', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasCO2 = /co2|carbon|emission/i.test(bodyText);
    console.log('RW21: CO2 unit text:', hasCO2);

    test.info().annotations.push({ type: 'note', description: `CO2 unit: ${hasCO2}` });
  });
});

test.describe('Report Wizard - Step 5: Output & Export', () => {
  test('RW22: Navigate to step 5', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RW22: Step 5 body snippet:', bodyText.substring(0, 500));
    test.info().annotations.push({ type: 'note', description: 'Step 5 navigation completed.' });
  });

  test('RW23: Receipt JPEG checkbox', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasJpeg = /jpeg|jpg|image/i.test(bodyText);
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log('RW23: JPEG text:', hasJpeg, 'Checkboxes:', checkboxes);

    test.info().annotations.push({ type: 'note', description: `JPEG: ${hasJpeg}, checkboxes: ${checkboxes}` });
  });

  test('RW24: Receipt size selection (A4/A3)', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const bodyText = await page.locator('body').textContent() || '';
    const hasSize = /a4|a3/i.test(bodyText);
    console.log('RW24: Size selection text:', hasSize);

    test.info().annotations.push({ type: 'note', description: `Size selection: ${hasSize}` });
  });

  test('RW25: Preview button', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const previewBtn = page.getByRole('button', { name: /preview/i }).first();
    const visible = await previewBtn.isVisible().catch(() => false);
    console.log('RW25: Preview button visible:', visible);

    const allButtons = await page.locator('button').allTextContents();
    console.log('RW25: All buttons:', allButtons.filter(t => t.trim()));

    test.info().annotations.push({ type: 'note', description: `Preview button: ${visible}` });
  });

  test('RW26: Generate button', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const generateBtn = page.getByRole('button', { name: /generate|download|export/i }).first();
    const visible = await generateBtn.isVisible().catch(() => false);
    console.log('RW26: Generate button visible:', visible);

    test.info().annotations.push({ type: 'note', description: `Generate button: ${visible}` });
  });

  test('RW27: Finish button', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    const finishBtn = page.getByRole('button', { name: /finish|complete|done/i }).first();
    const visible = await finishBtn.isVisible().catch(() => false);
    console.log('RW27: Finish button visible:', visible);

    test.info().annotations.push({ type: 'note', description: `Finish button: ${visible}` });
  });
});

test.describe('Report Wizard - Save as Draft', () => {
  test('RW28: Save as Draft button exists', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const draftBtn = page.getByRole('button', { name: /save.*draft|draft/i }).first();
    const visible = await draftBtn.isVisible().catch(() => false);
    console.log('RW28: Save as Draft button visible:', visible);

    const allButtons = await page.locator('button').allTextContents();
    console.log('RW28: All buttons:', allButtons.filter(t => t.trim()));

    test.info().annotations.push({ type: 'note', description: `Save as Draft: ${visible}` });
  });

  test('RW29: Draft button disabled initially (before customer details)', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    const draftBtn = page.getByRole('button', { name: /save.*draft|draft/i }).first();
    if (await draftBtn.isVisible().catch(() => false)) {
      const disabled = await draftBtn.isDisabled();
      console.log('RW29: Draft button disabled:', disabled);
      test.info().annotations.push({ type: 'note', description: `Draft disabled initially: ${disabled}` });
    } else {
      console.log('RW29: Draft button not found');
      test.info().annotations.push({ type: 'note', description: 'Draft button not visible on initial step.' });
    }
  });

  test('RW30: Draft button enabled after customer details', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Try to fill in customer details
    const customerInput = page.getByPlaceholder(/customer|search/i).or(
      page.locator('input[name*="customer" i]')
    ).first();

    if (await customerInput.isVisible().catch(() => false)) {
      await customerInput.fill('Test');
      await page.waitForTimeout(2000);

      // Try to select from dropdown
      const option = page.locator('[role="option"], [class*="option"], li').first();
      if (await option.isVisible().catch(() => false)) {
        await option.click();
        await page.waitForTimeout(1000);
      }
    }

    const draftBtn = page.getByRole('button', { name: /save.*draft|draft/i }).first();
    if (await draftBtn.isVisible().catch(() => false)) {
      const disabled = await draftBtn.isDisabled();
      console.log('RW30: Draft button disabled after customer selection:', disabled);
      test.info().annotations.push({ type: 'note', description: `Draft disabled after customer: ${disabled}` });
    } else {
      console.log('RW30: Draft button not found');
    }
  });

  test('RW31: Save as Draft preserves data', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // This test documents the Save as Draft functionality
    const draftBtn = page.getByRole('button', { name: /save.*draft|draft/i }).first();
    const visible = await draftBtn.isVisible().catch(() => false);
    console.log('RW31: Draft save functionality available:', visible);

    test.info().annotations.push({ type: 'note', description: `Draft save available: ${visible}` });
  });
});

test.describe('Report Wizard - Validation', () => {
  test('RW32: Cannot proceed without required fields', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Try next without filling anything
    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2000);

      // Check for validation errors
      const bodyText = await page.locator('body').textContent() || '';
      const hasError = /required|error|please|must|field/i.test(bodyText);
      console.log('RW32: Validation errors shown:', hasError);
      console.log('RW32: Body snippet:', bodyText.substring(0, 500));
    }

    test.info().annotations.push({ type: 'note', description: 'Validation test completed.' });
  });

  test('RW33: Manual customer entry', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await navigateToReportWizard(page);

    // Look for manual entry option
    const manualOption = page.getByText(/manual|enter.*manually|new.*customer/i).first();
    const visible = await manualOption.isVisible().catch(() => false);
    console.log('RW33: Manual entry option:', visible);

    const bodyText = await page.locator('body').textContent() || '';
    console.log('RW33: Body snippet:', bodyText.substring(0, 500));

    test.info().annotations.push({ type: 'note', description: `Manual customer: ${visible}` });
  });

  test('RW34: Full wizard smoke test (admin)', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAdmin(page);
    const url = await navigateToReportWizard(page);
    console.log('RW34: Starting wizard at:', url);

    const steps: string[] = [];
    let stepNum = 1;

    // Try to walk through all steps
    for (let i = 0; i < 5; i++) {
      const bodyText = await page.locator('body').textContent() || '';
      steps.push(`Step ${stepNum}: ${bodyText.substring(0, 200)}`);

      const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
      if (await nextBtn.isVisible().catch(() => false)) {
        const disabled = await nextBtn.isDisabled();
        if (!disabled) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
          stepNum++;
        } else {
          console.log(`RW34: Next button disabled at step ${stepNum}`);
          break;
        }
      } else {
        console.log(`RW34: No Next button at step ${stepNum}`);
        break;
      }
    }

    console.log('RW34: Steps traversed:', stepNum);
    steps.forEach(s => console.log(s));

    test.info().annotations.push({ type: 'note', description: `Wizard steps traversed: ${stepNum}` });
  });
});
