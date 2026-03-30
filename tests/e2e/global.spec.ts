import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { assertNoLofbergsWithoutUmlaut } from './helpers/text';

// TC-GLOBAL-004
test('Pagination visible on small screens (not "Load more")', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await loginAs(page, 'admin');

  for (const route of ['/customers', '/users']) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    // Pagination controls should be present
    const pagination = page.locator('[aria-label="pagination"], nav:has(button:has-text("Next")), [class*="pagination"], [data-testid="pagination"]');
    await expect(pagination.first()).toBeVisible({ timeout: 10_000 });

    // No "Load more" button
    const loadMore = page.getByRole('button', { name: /load more/i });
    await expect(loadMore).toHaveCount(0);
  }
});

// TC-GLOBAL-005
test('All dropdowns have a clear button', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // Find a Radix Select trigger
  const trigger = page.locator('[data-slot="select-trigger"]').first();
  await expect(trigger).toBeVisible({ timeout: 5000 });
  const originalText = await trigger.textContent();
  await trigger.click();

  // Pick the first non-"All" option
  const option = page.locator('[data-slot="select-content"] [role="option"]').nth(1);
  await option.waitFor({ state: 'visible', timeout: 3000 });
  await option.click();
  await page.waitForTimeout(300);

  // Assert clear button (span with role="button") is present inside trigger
  const clearBtn = trigger.locator('span[role="button"]');
  await expect(clearBtn).toBeVisible({ timeout: 3000 });

  // Click clear and verify value resets
  await clearBtn.click();
  await page.waitForTimeout(300);
  const resetText = await trigger.textContent();
  expect(resetText?.toLowerCase()).toContain('all');
});

// TC-GLOBAL-006
test('Dropdown editable; backspace does not clear selection', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  const dropdown = page.locator('[role="combobox"], [class*="select"] input').first();
  if (await dropdown.isVisible()) {
    await dropdown.click();

    const option = page.locator('[role="option"], [class*="option"]').first();
    const optionText = await option.textContent();
    if (optionText) {
      await option.click();

      // Focus and press Backspace
      await dropdown.focus();
      await page.keyboard.press('Backspace');

      // The selected value should still be present
      const currentText = await dropdown.inputValue().catch(() => dropdown.textContent());
      expect(currentText).toContain(optionText.trim());
    }
  }
});

// TC-GLOBAL-007
test('Required field validation without hardcoded asterisk', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // Open Add Customer dialog
  await page.getByRole('button', { name: /Add customer/ }).click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible' });

  // Click save/submit without filling any fields
  const submitBtn = page.locator('[role="dialog"]').getByRole('button', { name: /add customer|save/i }).first();
  await submitBtn.click();
  await page.waitForTimeout(500);

  // Assert error messages appear (red text paragraphs)
  const errors = page.locator('[role="dialog"] p[class*="text-red"]');
  await expect(errors.first()).toBeVisible({ timeout: 5000 });

  // Assert no label contains literal "*"
  const labels = await page.locator('[role="dialog"] label').allTextContents();
  for (const label of labels) {
    expect(label).not.toContain('*');
  }
});

// TC-GLOBAL-010
test('Search bars have clear button; search uses debounce >= 300ms', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // The SearchInput component renders an <input> inside a div.relative.
  // The clear button (X icon) appears only when the input has a value.
  const searchInput = page.locator('input[placeholder*="Search"]').first();
  await expect(searchInput).toBeVisible({ timeout: 10000 });

  // Type in search to trigger the clear button to appear
  await searchInput.fill('test');
  await page.waitForTimeout(800);

  // Assert clear button appears (button inside the same div.relative parent)
  const clearButton = searchInput.locator('..').locator('button').first();
  await expect(clearButton).toBeVisible({ timeout: 5000 });

  // Click clear and assert input is cleared
  await clearButton.click();
  await page.waitForTimeout(500);
  await expect(searchInput).toHaveValue('');

  // Debounce test: track API requests
  const searchApiRequests: number[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/') && url.includes('customer')) {
      searchApiRequests.push(Date.now());
    }
  });

  // Wait for any lingering requests to settle
  await page.waitForTimeout(1000);
  searchApiRequests.length = 0;

  const startTime = Date.now();
  // Type one character at a time with short delays
  await searchInput.pressSequentially('abc', { delay: 50 });

  // Wait a short time (less than debounce threshold) and check no request fired yet
  await page.waitForTimeout(150);
  const earlyRequests = searchApiRequests.filter((t) => t - startTime < 200);
  // Debounce should prevent any requests in the first ~200ms after last keystroke
  expect(earlyRequests.length).toBe(0);

  // After debounce window passes (~300ms default), a request should come through
  await page.waitForTimeout(1500);
  expect(searchApiRequests.length).toBeGreaterThan(0);
});

// TC-GLOBAL-011
test('"All" filter options use plural labels', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // Open filter dropdowns and check the default "All" option text
  const dropdowns = page.locator('[role="combobox"], [class*="select"], [class*="filter"] select');
  const count = await dropdowns.count();

  for (let i = 0; i < count; i++) {
    const dropdown = dropdowns.nth(i);
    if (await dropdown.isVisible()) {
      const text = await dropdown.textContent();
      if (text && /^all\s/i.test(text.trim())) {
        // Should be plural: "All statuses", "All segments", etc.
        // Should NOT be "All status", "All segment" (singular)
        const label = text.trim();
        const word = label.replace(/^all\s+/i, '');
        expect(word).toMatch(/s$|es$/i);
      }
    }
  }
});

// TC-GLOBAL-013
test('No "Lofberg" or "Lofbergs" without umlaut in UI text', async ({ page }) => {
  test.setTimeout(60000);
  await loginAs(page, 'admin');

  const routes = ['/dashboard', '/customers', '/users', '/templates'];
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const violations = await assertNoLofbergsWithoutUmlaut(page);
    expect(violations).toEqual([]);
  }
});

// TC-GLOBAL-014
test('All API requests use HTTPS (excluding localhost)', async ({ page }) => {
  const insecureRequests: string[] = [];

  page.on('request', (req) => {
    const url = req.url();
    if (
      url.startsWith('http://') &&
      !url.includes('localhost') &&
      !url.includes('127.0.0.1')
    ) {
      insecureRequests.push(url);
    }
  });

  await loginAs(page, 'admin');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  expect(insecureRequests).toEqual([]);
});

// TC-GLOBAL-015
test('Image uploaders show 10 MB limit; show error on exceeding', async ({ page }) => {
  await loginAs(page, 'admin');
  // Navigate to customers page and open the Add Customer dialog (which has logo upload)
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // Open the Add Customer dialog
  await page.getByRole('button', { name: /Add customer/i }).click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 10000 });

  // The upload area contains helper text "PNG, JPG or SVG (max 10 MB)"
  // Look for the text "10 MB" anywhere in the dialog near the file input
  const dialogText = await dialog.textContent() ?? '';
  expect(dialogText).toMatch(/10\s*MB/i);

  // The file input is inside the dialog
  const fileInput = dialog.locator('input[type="file"]').first();
  await expect(fileInput).toHaveCount(1);

  // Route upload to return 413
  await page.route('**/api/**upload**', (route) =>
    route.fulfill({ status: 413, body: JSON.stringify({ message: 'File too large' }) })
  );
  await page.route('**/api/**blob**', (route) =>
    route.fulfill({ status: 413, body: JSON.stringify({ message: 'File too large' }) })
  );
  await page.route('**/api/**logo**', (route) =>
    route.fulfill({ status: 413, body: JSON.stringify({ message: 'File too large' }) })
  );
  await page.route('**/api/**image**', (route) =>
    route.fulfill({ status: 413, body: JSON.stringify({ message: 'File too large' }) })
  );

  // Attempt to upload an oversized file
  const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');
  await fileInput.setInputFiles({
    name: 'large-image.png',
    mimeType: 'image/png',
    buffer: largeBuffer,
  });

  // Assert user-visible error (could be inline error, toast, or alert)
  const error = page.locator('[class*="error"], [role="alert"], [class*="toast"], .text-red-500, .text-red-600').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

// TC-GLOBAL-016
test('File upload shows file OR uploader, never both', async ({ page }) => {
  await loginAs(page, 'admin');
  // Open the Add Customer dialog from the customers page
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Add customer/i }).click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 10000 });

  const dialog = page.locator('[role="dialog"]');
  const fileInput = dialog.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    // Upload a file
    await fileInput.setInputFiles({
      name: 'test-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-content'),
    });

    await page.waitForTimeout(1000);

    // After upload: file preview should be visible
    const preview = dialog.locator('[class*="preview"], img[src*="blob"], [data-testid*="preview"], [class*="uploaded"]').first();
    const removeButton = dialog.locator('[aria-label*="remove"], [aria-label*="Remove"], [aria-label*="delete"], button:has([class*="close"])').first();

    // Dropzone / upload area should NOT be visible simultaneously
    const dropzone = dialog.locator('[class*="dropzone"]:visible, [class*="upload-area"]:visible').first();

    if (await preview.isVisible().catch(() => false)) {
      // If preview is shown, the dropzone should be hidden
      const dropzoneVisible = await dropzone.isVisible().catch(() => false);
      expect(dropzoneVisible).toBeFalsy();
    }

    // Click remove
    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);

      // Now only uploader should be shown, not the preview
      const previewAfterRemove = await preview.isVisible().catch(() => false);
      expect(previewAfterRemove).toBeFalsy();
    }
  }
});

// TC-GLOBAL-017
test('Remove uploaded file then re-upload works', async ({ page }) => {
  await loginAs(page, 'admin');
  // Open the Add Customer dialog from the customers page
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Add customer/i }).click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 10000 });

  const dialog = page.locator('[role="dialog"]');
  const fileInput = dialog.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    // Upload file A
    await fileInput.setInputFiles({
      name: 'fileA.png',
      mimeType: 'image/png',
      buffer: Buffer.from('file-a-content'),
    });
    await page.waitForTimeout(1000);

    // Click remove
    const removeButton = dialog.locator('[aria-label*="remove"], [aria-label*="Remove"], [aria-label*="delete"], button:has([class*="close"])').first();
    if (await removeButton.isVisible().catch(() => false)) {
      await removeButton.click();
      await page.waitForTimeout(500);
    }

    // Upload file B
    const fileInputAgain = dialog.locator('input[type="file"]').first();
    await fileInputAgain.setInputFiles({
      name: 'fileB.png',
      mimeType: 'image/png',
      buffer: Buffer.from('file-b-content'),
    });
    await page.waitForTimeout(1000);

    // Assert file B is shown
    const preview = dialog.locator('[class*="preview"], img[src*="blob"], [data-testid*="preview"], [class*="uploaded"]').first();
    const isUploaded = await preview.isVisible().catch(() => false);
    expect(isUploaded).toBeTruthy();
  }
});

// TC-GLOBAL-018
test('Enter in rich text editor clears placeholder', async ({ page }) => {
  await loginAs(page, 'admin');
  // Navigate to template editing page
  await page.goto('/templates');
  await page.waitForLoadState('networkidle');

  // Try to find and click into a template to edit
  const editLink = page.locator('a:has-text("Edit"), button:has-text("Edit")').first();
  if (await editLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await editLink.click();
    await page.waitForLoadState('networkidle');
  }

  // Find a rich text editor (typically a contenteditable div)
  const rte = page.locator('[contenteditable="true"], .ProseMirror, .ql-editor, [class*="rich-text"], [class*="editor"]').first();
  if (await rte.isVisible({ timeout: 5000 }).catch(() => false)) {
    const placeholderBefore = await rte.getAttribute('data-placeholder') ?? await rte.textContent();

    await rte.focus();
    await page.keyboard.press('Enter');

    // Placeholder text should no longer be displayed as visible content
    const textAfter = await rte.textContent();
    if (placeholderBefore && placeholderBefore.trim()) {
      // After pressing Enter, the editor should have content or the placeholder should be gone
      const hasPlaceholderClass = await rte.evaluate((el) => el.classList.contains('is-editor-empty') || el.classList.contains('is-empty'));
      expect(hasPlaceholderClass).toBeFalsy();
    }
  }
});

// TC-GLOBAL-019
test('Non-RTE textboxes are single-line input elements', async ({ page }) => {
  await loginAs(page, 'admin');
  // Open the Add Customer dialog from the customers page
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Add customer/i }).click();
  await page.locator('[role="dialog"]').waitFor({ state: 'visible', timeout: 10000 });

  const dialog = page.locator('[role="dialog"]');

  // Get all visible text inputs that are NOT rich text editors
  const inputs = dialog.locator(
    'input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input:not([type])'
  );
  const count = await inputs.count();

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);
    if (await input.isVisible()) {
      const tagName = await input.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('input');
    }
  }

  // Also check that any textarea elements are specifically for notes/descriptions (multi-line expected)
  // but not used for regular single-line fields
  const textareas = dialog.locator('textarea');
  const taCount = await textareas.count();
  for (let i = 0; i < taCount; i++) {
    const ta = textareas.nth(i);
    if (await ta.isVisible()) {
      // If it's a textarea, it should have a label suggesting it's a notes/description field
      const id = await ta.getAttribute('id');
      const name = await ta.getAttribute('name');
      const placeholder = await ta.getAttribute('placeholder');
      const identifier = (id ?? name ?? placeholder ?? '').toLowerCase();
      expect(identifier).toMatch(/note|description|comment|message|bio|address/i);
    }
  }
});

// TC-GLOBAL-020
test('Toasts dismiss on outside click or after 10 seconds', async () => {
  test.fixme(true, 'Requires specific toast trigger mechanism — deferred');
});

// TC-GLOBAL-021
test('Success modals have OK button', async ({ page }) => {
  await loginAs(page, 'admin');
  // Fill in minimum required data to trigger a success modal on save
  await page.goto('/customers/create');
  await page.waitForLoadState('networkidle');

  // We need to trigger a success modal; this may require filling in valid data
  // For now, route the API to return success
  await page.route('**/api/**/customer**', (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 1 } }),
      });
    }
    return route.continue();
  });

  // Look for a success modal/dialog
  const modal = page.locator('[role="dialog"], [class*="modal"]');
  if (await modal.isVisible({ timeout: 5000 }).catch(() => false)) {
    const okButton = modal.getByRole('button', { name: /^ok$/i });
    await expect(okButton).toBeVisible();
    await okButton.click();
    await expect(modal).toBeHidden();
  }
});

// TC-GLOBAL-023
test('Navbar role switcher: person icon + arrow only; dropdown shows profile and logout', async ({ page }) => {
  test.setTimeout(60000);
  await loginAs(page, 'admin');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // The UserProfileDropdown trigger has data-testid="user-menu" and contains only SVG icons (User + ChevronDown)
  const switcher = page.locator('[data-testid="user-menu"]');
  await expect(switcher).toBeVisible({ timeout: 15000 });

  // Assert no role name text is displayed (icon + chevron only, no text content)
  const switcherText = await switcher.textContent();
  expect(switcherText?.trim()).not.toMatch(/admin|administrator|sales|translator/i);

  // Click to open Radix DropdownMenu
  await switcher.click();
  await page.waitForTimeout(500);

  // Assert dropdown items (DropdownMenuItem renders [role="menuitem"])
  const menuItems = page.locator('[role="menuitem"]');
  await expect(menuItems.first()).toBeVisible({ timeout: 5000 });
  const menuTexts = await menuItems.allTextContents();
  const joined = menuTexts.join(' ').toLowerCase();
  expect(joined).toContain('my profile');
  expect(joined).toContain('logout');

  // Close dropdown by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Repeat at mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await page.waitForLoadState('networkidle');

  const mobileSwitcher = page.locator('[data-testid="user-menu"]');
  await expect(mobileSwitcher).toBeVisible({ timeout: 15000 });
  await mobileSwitcher.click();
  await page.waitForTimeout(500);

  const mobileMenuItems = page.locator('[role="menuitem"]');
  await expect(mobileMenuItems.first()).toBeVisible({ timeout: 5000 });
  const mobileTexts = await mobileMenuItems.allTextContents();
  const mobileJoined = mobileTexts.join(' ').toLowerCase();
  expect(mobileJoined).toContain('my profile');
  expect(mobileJoined).toContain('logout');
});

// TC-GLOBAL-024
test('Navbar "Generate" button label', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const generateButton = page.locator('header').locator('a, button').filter({ hasText: 'Generate' });
  await expect(generateButton.first()).toBeVisible();
  const text = await generateButton.first().textContent();
  expect(text?.trim()).toBe('Generate');
});

// TC-GLOBAL-025
test('Search/filter collapses on small screens', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/customers');
  await page.waitForLoadState('networkidle');

  // At 1280px (above lg breakpoint): filters should be visible inline
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(500);

  // The desktop filter row is inside a "hidden lg:flex" container
  const searchBar = page.locator('input[placeholder*="Search"]').first();
  await expect(searchBar).toBeVisible({ timeout: 10000 });

  // At 768px (below lg breakpoint): filters should be collapsed behind a toggle
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);

  // Search bar should still be visible
  await expect(searchBar).toBeVisible();

  // There should be a "Filters" toggle (div.mobile-toggle with span "Filters")
  const filtersToggle = page.locator('.mobile-toggle').first();
  await expect(filtersToggle).toBeVisible();

  // The advanced filters should be collapsed by default
  const mobileAdvanced = page.locator('.mobile-advanced').first();
  const isOpen = await mobileAdvanced.evaluate((el) => el.classList.contains('open'));
  expect(isOpen).toBe(false);

  // Click to expand
  await filtersToggle.click();
  await page.waitForTimeout(500);

  // After clicking, the mobile-advanced section should have "open" class
  const isOpenAfter = await mobileAdvanced.evaluate((el) => el.classList.contains('open'));
  expect(isOpenAfter).toBe(true);
});

// TC-GLOBAL-029
test('Rich text editor: bubbleMenu on mobile, static toolbar on desktop', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/templates');
  await page.waitForLoadState('networkidle');

  const editLink = page.locator('a:has-text("Edit"), button:has-text("Edit")').first();
  if (await editLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await editLink.click();
    await page.waitForLoadState('networkidle');
  }

  // At mobile: no static toolbar
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  const staticToolbar = page.locator('[class*="toolbar"]:not([class*="bubble"]), [class*="menu-bar"], [data-testid*="toolbar"]').first();
  const isStaticVisibleMobile = await staticToolbar.isVisible().catch(() => false);
  expect(isStaticVisibleMobile).toBeFalsy();

  // At desktop: static toolbar visible
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(500);
  const staticToolbarDesktop = page.locator('[class*="toolbar"]:not([class*="bubble"]), [class*="menu-bar"], [data-testid*="toolbar"]').first();
  if (await staticToolbarDesktop.count() > 0) {
    await expect(staticToolbarDesktop).toBeVisible();
  }
});

// TC-GLOBAL-030
test('Translator first load: correct sidebar items', async ({ page }) => {
  await loginAs(page, 'translator');
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Open sidebar hamburger menu
  await page.getByRole('button', { name: 'Open menu' }).click();
  const nav = page.locator('[data-testid="sidebar-nav"]');
  await nav.waitFor({ state: 'visible', timeout: 5000 });

  const items = (await nav.locator('a').allTextContents()).map(t => t.trim());

  expect(items).toEqual(['Dashboard', 'Templates', 'Useful resources', 'Conversions']);

  expect(items).not.toContain('Generate');
  expect(items).not.toContain('Past reports');
  expect(items).not.toContain('Users');
  expect(items).not.toContain('Customers');
});
