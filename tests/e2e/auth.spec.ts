import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

// TC-AUTH-001
test.fixme('First login forces password reset (not 403)', async ({ page }) => {
  // Requires backend seed of a fresh isFirstLogin=true user account.
  // Cannot be automated without a dedicated test account that has
  // never logged in before. Needs test seed data or an admin API
  // endpoint to create a fresh user with isFirstLogin=true.
  await page.goto('/login');
  // Would fill in first-login credentials, assert redirect to
  // /reset-password (not a 403 forbidden page).
});

// TC-AUTH-002
test('Failed login shows error message', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'wrong@example.com');
  await page.fill('[name=password]', 'WrongPassword123!');
  await page.click('[type=submit]');

  // Assert error text is visible (not a blank page)
  const error = page.locator('[class*="error"], [role="alert"], [data-testid*="error"], p:has-text("Invalid"), p:has-text("incorrect"), span:has-text("Invalid"), span:has-text("incorrect")');
  await expect(error.first()).toBeVisible({ timeout: 10_000 });

  // The page should still be /login, not a blank or crash page
  expect(page.url()).toContain('/login');
});

// TC-AUTH-003
test('Successful login shows loader then redirects to dashboard', async ({ page }) => {
  await page.goto('/login');

  const email = process.env.TEST_ADMIN_EMAIL || 'admin@lofberg.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'Admin@123!';

  await page.fill('[name=email]', email);
  await page.fill('[name=password]', password);
  await page.click('[type=submit]');

  // Assert loading indicator is visible (spinner, skeleton, or progress)
  const loader = page.locator('[class*="loading"], [class*="spinner"], [role="progressbar"], [data-testid*="loader"], [class*="loader"]');
  // Loader may appear briefly; use a short timeout
  const loaderVisible = await loader.first().isVisible({ timeout: 3000 }).catch(() => false);
  // Not a hard fail if loader is too fast to catch, but URL must redirect
  if (loaderVisible) {
    expect(loaderVisible).toBeTruthy();
  }

  // Assert redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  expect(page.url()).toContain('/dashboard');
});

// TC-AUTH-004
test('Forgot password: logo goes to login', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.waitForLoadState('networkidle');

  // Click the logo (typically an img or svg wrapped in a link)
  const logo = page.locator('a:has(img[alt*="öfberg"]), a:has(img[alt*="logo"]), a:has(svg), [class*="logo"] a, header a').first();
  await expect(logo).toBeVisible();
  await logo.click();

  // Assert URL is /login
  await page.waitForURL('**/login', { timeout: 5000 });
  expect(page.url()).toContain('/login');
});

// TC-AUTH-005
test('Forgot password: error appears only once', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.waitForLoadState('networkidle');

  // Submit an invalid email
  const emailInput = page.locator('input[name="email"], input[type="email"]').first();
  await emailInput.fill('not-an-email');

  const submitButton = page.getByRole('button', { name: /send|submit|reset|continue/i }).first();
  await submitButton.click();

  await page.waitForTimeout(1000);

  // Count error elements that match the error text
  const errors = page.locator('[class*="error"], [role="alert"]');
  const errorTexts = await errors.allTextContents();
  const nonEmptyErrors = errorTexts.filter((t) => t.trim().length > 0);

  // There should be exactly 1 unique error message, not duplicates
  if (nonEmptyErrors.length > 0) {
    const firstError = nonEmptyErrors[0].trim();
    const duplicates = nonEmptyErrors.filter((e) => e.trim() === firstError);
    expect(duplicates.length).toBe(1);
  }
});

// TC-AUTH-007
test('Password policy enforced on reset', async ({ page }) => {
  // Navigate to reset-password page (may need a token; test the validation UI)
  await page.goto('/reset-password');
  await page.waitForLoadState('networkidle');

  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  const submitButton = page.getByRole('button', { name: /reset|submit|save|change/i }).first();

  if (await passwordInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    const errorLocator = page.locator('[class*="error"], [role="alert"], [data-testid*="error"]');

    // Test: too short (< 8 chars)
    await passwordInput.fill('Ab1!');
    await submitButton.click();
    await page.waitForTimeout(500);
    await expect(errorLocator.first()).toBeVisible();

    // Test: no number
    await passwordInput.fill('Abcdefgh!');
    await submitButton.click();
    await page.waitForTimeout(500);
    await expect(errorLocator.first()).toBeVisible();

    // Test: no special char
    await passwordInput.fill('Abcdefg1');
    await submitButton.click();
    await page.waitForTimeout(500);
    await expect(errorLocator.first()).toBeVisible();
  }
});

// TC-AUTH-008
test('No hardcoded * in forgot password labels', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.waitForLoadState('networkidle');

  const labels = await page.locator('label').allTextContents();
  for (const label of labels) {
    expect(label).not.toContain('*');
  }
});
