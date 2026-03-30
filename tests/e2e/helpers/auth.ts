import { Page } from '@playwright/test';

export async function loginAs(page: Page, role: 'admin' | 'salesperson' | 'translator') {
  const credentials = {
    admin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@lofberg.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123!',
    },
    salesperson: {
      email: process.env.TEST_SALESPERSON_EMAIL || 'sales@lofberg.com',
      password: process.env.TEST_SALESPERSON_PASSWORD || 'Sales@1234!',
    },
    translator: {
      email: process.env.TEST_TRANSLATOR_EMAIL || 'translator@lofberg.com',
      password: process.env.TEST_TRANSLATOR_PASSWORD || 'Translator@1234!',
    },
  };
  await page.goto('/login');
  await page.fill('[name=email]', credentials[role].email);
  await page.fill('[name=password]', credentials[role].password);
  await page.click('[type=submit]');
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
}
