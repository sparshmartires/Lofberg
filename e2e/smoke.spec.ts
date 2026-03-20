import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Smoke Tests', () => {
  test('S1: Login page has email, password, and submit', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('S2: Admin can log in successfully', async ({ page }) => {
    await loginAsAdmin(page);
    expect(page.url()).not.toContain('/login');
    console.log('S2: Post-login URL:', page.url());
  });

  test('S3: Unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Should redirect to /login or a page containing login
    await page.waitForURL(/login/, { timeout: 10000 }).catch(() => {});
    const url = page.url();
    console.log('S3: Redirect URL for unauthenticated access:', url);
    expect(url).toContain('/login');
  });
});
