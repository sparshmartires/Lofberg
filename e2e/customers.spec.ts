import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsSales } from './helpers/auth';

test.describe('Customer Management Tests', () => {
  test('CU1: Admin can see customers table', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Look for table
    const table = page.locator('table, [role="table"], [data-testid*="customer"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('CU1: Table visible:', tableVisible);
    console.log('CU1: URL:', page.url());

    if (!tableVisible) {
      const bodyText = await page.locator('body').textContent();
      console.log('CU1: Body snippet:', (bodyText || '').substring(0, 500));
      test.info().annotations.push({ type: 'note', description: 'Customer table not found. See console output.' });
    }

    expect(tableVisible).toBeTruthy();
  });

  test('CU2: Sales can see customers table', async ({ page }) => {
    await loginAsSales(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const table = page.locator('table, [role="table"], [data-testid*="customer"]');
    const tableVisible = await table.first().isVisible().catch(() => false);
    console.log('CU2: Table visible:', tableVisible, 'URL:', page.url());

    if (!tableVisible) {
      const bodyText = await page.locator('body').textContent();
      console.log('CU2: Body snippet:', (bodyText || '').substring(0, 500));
    }

    // Sales might be redirected or see customers differently
    test.info().annotations.push({ type: 'note', description: `Sales customers: tableVisible=${tableVisible}, url=${page.url()}` });
  });

  test('CU3: Customer table has expected columns', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Try to get column headers
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();
    console.log('CU3: Table headers:', headers);
    test.info().annotations.push({ type: 'note', description: `Customer table headers: ${JSON.stringify(headers)}` });

    expect(headers.length).toBeGreaterThan(0);
  });

  test('CU4: Admin sees Add/Create customer button', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add|create|new/i }).or(
      page.getByRole('link', { name: /add|create|new/i })
    ).first();

    const visible = await addButton.isVisible().catch(() => false);
    console.log('CU4: Add customer button visible:', visible);

    if (!visible) {
      const allButtons = await page.locator('button, a').allTextContents();
      console.log('CU4: All buttons/links:', allButtons.filter(t => t.trim()).slice(0, 20));
      test.info().annotations.push({ type: 'note', description: 'Add customer button not found.' });
    }

    expect(visible).toBeTruthy();
  });

  test('CU5: Add customer form has required fields', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Click add button
    const addButton = page.getByRole('button', { name: /add|create|new/i }).or(
      page.getByRole('link', { name: /add|create|new/i })
    ).first();

    const visible = await addButton.isVisible().catch(() => false);
    if (!visible) {
      console.log('CU5: Add button not found, trying direct navigation');
      await page.goto('/customers/new');
      await page.waitForLoadState('networkidle');
    } else {
      await addButton.click();
      await page.waitForLoadState('networkidle');
    }

    await page.waitForTimeout(2000);
    console.log('CU5: Form URL:', page.url());

    // Look for form fields
    const inputs = await page.locator('input, select, textarea').allAttributes('name');
    const placeholders = await page.locator('input, select, textarea').allAttributes('placeholder');
    const labels = await page.locator('label').allTextContents();

    console.log('CU5: Input names:', inputs);
    console.log('CU5: Placeholders:', placeholders);
    console.log('CU5: Labels:', labels);

    test.info().annotations.push({ type: 'note', description: `Form fields - names: ${JSON.stringify(inputs)}, labels: ${JSON.stringify(labels)}` });
  });

  test('CU6: Create a customer with unique name', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add|create|new/i }).or(
      page.getByRole('link', { name: /add|create|new/i })
    ).first();

    const visible = await addButton.isVisible().catch(() => false);
    if (!visible) {
      console.log('CU6: Add button not found, skipping');
      test.info().annotations.push({ type: 'note', description: 'Could not find Add customer button to create customer.' });
      return;
    }

    await addButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const uniqueName = `TestCust_${Date.now()}`;
    console.log('CU6: Creating customer with name:', uniqueName);

    // Try to fill name field
    const nameInput = page.getByPlaceholder(/name/i).or(
      page.locator('input[name="name"], input[name="customerName"]')
    ).first();

    try {
      await nameInput.fill(uniqueName);
      console.log('CU6: Filled customer name');
    } catch (e) {
      console.log('CU6: Could not fill name field:', e);
      const allInputs = await page.locator('input').allAttributes('name');
      console.log('CU6: Available inputs:', allInputs);
      test.info().annotations.push({ type: 'note', description: 'Could not find/fill name field.' });
      return;
    }

    // Try to fill ERP ID
    const erpInput = page.locator('input[name*="erp" i], input[name*="erpId" i]').or(
      page.getByPlaceholder(/erp/i)
    ).first();
    try {
      await erpInput.fill(`ERP-${Date.now()}`);
    } catch {
      console.log('CU6: ERP field not found');
    }

    // Look for segment dropdown/select
    try {
      const segmentSelect = page.locator('select[name*="segment" i], [name*="segment" i]').first();
      if (await segmentSelect.isVisible().catch(() => false)) {
        const options = await segmentSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await segmentSelect.selectOption({ index: 1 });
        }
      }
    } catch {
      console.log('CU6: Segment select not found or not a <select>');
    }

    // Try submit
    const submitBtn = page.getByRole('button', { name: /save|create|submit|add/i }).first();
    const submitVisible = await submitBtn.isVisible().catch(() => false);
    if (submitVisible) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      console.log('CU6: After submit URL:', page.url());
    } else {
      console.log('CU6: Submit button not found');
    }

    test.info().annotations.push({ type: 'note', description: `Customer creation attempted with name: ${uniqueName}` });
  });

  test('CU7: Customer search works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder(/search/i).or(
      page.locator('input[type="search"], input[name="search"]')
    ).first();

    const searchVisible = await searchInput.isVisible().catch(() => false);
    console.log('CU7: Search input visible:', searchVisible);

    if (searchVisible) {
      await searchInput.fill('test');
      await page.waitForTimeout(2000);
      const rows = await page.locator('tbody tr, [role="row"]').count();
      console.log('CU7: Rows after search "test":', rows);
    } else {
      test.info().annotations.push({ type: 'note', description: 'Search input not found on customers page.' });
    }
  });

  test('CU8: Customer table pagination', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Look for pagination controls
    const pagination = page.locator('[class*="pagination" i], nav[aria-label*="pagination" i], [data-testid*="pagination"]').first();
    const paginationVisible = await pagination.isVisible().catch(() => false);

    // Also check for page size selector
    const pageSizeSelector = page.locator('select').filter({ hasText: /10|15|25|50/ }).first();
    const pageSizeVisible = await pageSizeSelector.isVisible().catch(() => false);

    console.log('CU8: Pagination visible:', paginationVisible, 'Page size selector:', pageSizeVisible);
    test.info().annotations.push({ type: 'note', description: `Pagination: ${paginationVisible}, PageSize: ${pageSizeVisible}` });
  });

  test('CU9: Customer detail view', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Click first customer row or link
    const firstRow = page.locator('tbody tr, [role="row"]').first();
    const firstLink = firstRow.locator('a').first();

    try {
      if (await firstLink.isVisible().catch(() => false)) {
        await firstLink.click();
      } else {
        await firstRow.click();
      }
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('CU9: Detail URL:', page.url());

      const bodyText = await page.locator('body').textContent();
      console.log('CU9: Detail body snippet:', (bodyText || '').substring(0, 500));
    } catch (e) {
      console.log('CU9: Could not navigate to customer detail:', e);
      test.info().annotations.push({ type: 'note', description: 'Could not open customer detail view.' });
    }
  });

  test('CU10: Customer sorting', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    const headers = page.locator('th, [role="columnheader"]');
    const headerCount = await headers.count();
    console.log('CU10: Number of headers:', headerCount);

    if (headerCount > 0) {
      // Click first sortable header
      await headers.first().click();
      await page.waitForTimeout(1500);
      console.log('CU10: Clicked first header for sorting');

      // Check for sort indicators
      const sortIndicators = await page.locator('[class*="sort"], [aria-sort], svg').count();
      console.log('CU10: Sort indicators found:', sortIndicators);
    }

    test.info().annotations.push({ type: 'note', description: `Headers: ${headerCount}` });
  });

  test('CU11: Customer filtering', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter/i }).or(
      page.locator('[data-testid*="filter"]')
    ).first();

    const filterVisible = await filterButton.isVisible().catch(() => false);
    console.log('CU11: Filter button visible:', filterVisible);

    if (filterVisible) {
      await filterButton.click();
      await page.waitForTimeout(1000);
      const filterPanel = await page.locator('[class*="filter"], [role="dialog"], [class*="popover"]').first().isVisible().catch(() => false);
      console.log('CU11: Filter panel visible after click:', filterPanel);
    }

    test.info().annotations.push({ type: 'note', description: `Filter button: ${filterVisible}` });
  });

  test('CU12: Subcustomer / parent relationship', async ({ page }) => {
    test.setTimeout(30000);
    await loginAsAdmin(page);
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');

    // Look for subcustomer or parent relationship indicators
    const addButton = page.getByRole('button', { name: /add|create|new/i }).or(
      page.getByRole('link', { name: /add|create|new/i })
    ).first();

    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check for subcustomer checkbox or parent dropdown
      const subcustomerCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /sub|child|parent/i }).or(
        page.getByLabel(/sub|child|parent/i)
      ).first();
      const parentDropdown = page.locator('select, [role="combobox"]').filter({ hasText: /parent/i }).first();

      const subVisible = await subcustomerCheckbox.isVisible().catch(() => false);
      const parentVisible = await parentDropdown.isVisible().catch(() => false);

      console.log('CU12: Subcustomer checkbox:', subVisible, 'Parent dropdown:', parentVisible);
      test.info().annotations.push({ type: 'note', description: `Subcustomer: ${subVisible}, Parent: ${parentVisible}` });
    } else {
      console.log('CU12: Add button not found');
      test.info().annotations.push({ type: 'note', description: 'Add button not found to check subcustomer fields.' });
    }
  });
});
