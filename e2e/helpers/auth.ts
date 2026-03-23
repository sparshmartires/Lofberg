import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation away from login - could be dashboard, change-password, or app routes
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 });
}

export const ADMIN = { email: 'admin@lofberg.com', password: 'Admin@123!' };
export const SALES = { email: 'sales@lofberg.com', password: 'Sales@1234!' };
export const TRANS = { email: 'translator@lofberg.com', password: 'Translator@1234!' };

export async function loginAsAdmin(page: Page) { await loginAs(page, ADMIN.email, ADMIN.password); }
export async function loginAsSales(page: Page) { await loginAs(page, SALES.email, SALES.password); }
export async function loginAsTranslator(page: Page) { await loginAs(page, TRANS.email, TRANS.password); }
