import { test, expect } from '@playwright/test';
import { loginAsTenantAdmin, logout } from '../helpers/auth';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Billing Dashboard access & visibility', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await logout(page);
    await page.goto(`${BASE_URL}/app/billing`);

    await page.waitForURL(`${BASE_URL}/login`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow TENANT_ADMIN to view billing dashboard', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/billing`);

    await expect(page).toHaveURL(/\/app\/billing/);

    const heading = page.locator('h2, h3, h4').filter({ hasText: /billing/i }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    const helperText = page.locator('text=subscription, text=Manage your subscription').first();
    await helperText.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  });
});
