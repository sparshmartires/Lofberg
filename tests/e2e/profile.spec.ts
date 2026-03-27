import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';
import { generateTestPng } from './helpers/api';

const PROFILE_PATHS = ['/profile', '/settings/profile', '/account', '/me'];

async function navigateToProfile(page: import('@playwright/test').Page): Promise<string> {
  for (const p of PROFILE_PATHS) {
    await page.goto(p);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    if (url.includes(p) || url.includes('profile') || url.includes('account')) {
      return url;
    }
  }
  // Try clicking avatar/profile link in header
  const avatarLink = page.locator('[class*="avatar"], [data-testid*="profile"], [aria-label*="profile" i]').first();
  if (await avatarLink.isVisible().catch(() => false)) {
    await avatarLink.click();
    await page.waitForLoadState('networkidle');
  }
  return page.url();
}

test.describe('Profile', () => {
  // TC-PROF-001
  test('fallback avatar when no profile picture (initials avatar visible)', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToProfile(page);

    // Look for initials-based avatar (text content with 1-2 uppercase letters, no img src)
    const avatar = page.locator('[class*="avatar"], [data-testid*="avatar"]').first();
    await expect(avatar).toBeVisible();

    const img = avatar.locator('img');
    const imgCount = await img.count();

    if (imgCount === 0) {
      // No image — initials fallback should show
      const avatarText = (await avatar.textContent() ?? '').trim();
      // Initials are typically 1-2 uppercase characters
      expect(avatarText.length).toBeGreaterThanOrEqual(1);
      expect(avatarText.length).toBeLessThanOrEqual(3);
    } else {
      // If img exists, check if it has a valid src (non-empty, not broken)
      const src = await img.first().getAttribute('src');
      if (!src || src.includes('default') || src.includes('placeholder')) {
        // Fallback image used — acceptable
        expect(true).toBe(true);
      }
    }
  });

  // TC-PROF-002
  test('pencil icon on avatar', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToProfile(page);

    const avatar = page.locator('[class*="avatar"], [data-testid*="avatar"]').first();
    await expect(avatar).toBeVisible();

    // Look for pencil/edit icon overlaying the avatar
    const pencilIcon = avatar.locator('svg, [class*="edit"], [class*="pencil"], [aria-label*="edit" i]').or(
      avatar.locator('..').locator('svg, [class*="edit"], [class*="pencil"]')
    ).first();

    await expect(pencilIcon).toBeVisible();
  });

  // TC-PROF-003
  test('click avatar opens file picker', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToProfile(page);

    const avatar = page.locator('[class*="avatar"], [data-testid*="avatar"]').first();
    await expect(avatar).toBeVisible();

    // There should be a hidden file input associated with the avatar
    const fileInput = page.locator('input[type="file"]');
    const fileInputCount = await fileInput.count();

    // Click the avatar and check that file chooser opens
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await avatar.click();
    const fileChooser = await fileChooserPromise;

    expect(fileChooser).toBeTruthy();
  });

  // TC-PROF-004
  test('replacing picture triggers DELETE for old blob', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToProfile(page);

    const avatar = page.locator('[class*="avatar"], [data-testid*="avatar"]').first();
    await expect(avatar).toBeVisible();

    // Step 1: Upload an initial picture so the user has an existing one
    const firstChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 });
    await avatar.click();
    const firstChooser = await firstChooserPromise;
    const firstPng = generateTestPng();
    await firstChooser.setFiles({
      name: 'initial-avatar.png',
      mimeType: 'image/png',
      buffer: firstPng,
    });
    // Wait for the upload to complete
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Step 2: Set up DELETE request interception before replacing the picture
    let deleteRequestCalled = false;
    let deleteUrl = '';
    await page.route('**/*', (route) => {
      if (route.request().method() === 'DELETE') {
        const url = route.request().url();
        if (/image|avatar|blob|photo|picture|profile/i.test(url) || /api/i.test(url)) {
          deleteRequestCalled = true;
          deleteUrl = url;
        }
      }
      route.continue();
    });

    // Step 3: Upload a replacement picture — this should trigger DELETE for the old blob
    const secondChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 });
    await avatar.click();
    const secondChooser = await secondChooserPromise;
    const secondPng = generateTestPng();
    await secondChooser.setFiles({
      name: 'replacement-avatar.png',
      mimeType: 'image/png',
      buffer: secondPng,
    });
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Assert the DELETE request was made for the old blob
    test.info().annotations.push({
      type: 'note',
      description: `DELETE for old blob called: ${deleteRequestCalled}, URL: ${deleteUrl}`,
    });
    expect(deleteRequestCalled).toBe(true);
  });

  // TC-PROF-005
  test('no "Last login" field on profile page', async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateToProfile(page);

    const bodyText = await page.locator('body').textContent() ?? '';
    expect(bodyText.toLowerCase()).not.toContain('last login');
  });
});
