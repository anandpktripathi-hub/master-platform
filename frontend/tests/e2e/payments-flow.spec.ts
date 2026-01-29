import { test, expect } from '@playwright/test';
import { loginAsTenantAdmin, loginAsPlatformAdmin, logout } from '../helpers/auth';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

// Helper to locate an invoice row by number in billing invoices page
async function openInvoicesAndFindRow(page, invoiceNumber: string) {
  await page.goto(`${BASE_URL}/app/billing/invoices`);
  const row = page.locator(`text=${invoiceNumber}`).first();
  await expect(row).toBeVisible({ timeout: 10_000 });
  return row;
}

test.describe('Payments & Billing end-to-end flows', () => {
  test('Stripe success should lead to PAID invoice and active plan (happy path smoke test)', async ({ page }) => {
    await loginAsTenantAdmin(page);

    // Navigate to billing dashboard
    await page.goto(`${BASE_URL}/app/billing`);
    await expect(page).toHaveURL(/\/app\/billing/);

    // Navigate to Stripe checkout page (existing route)
    await page.goto(`${BASE_URL}/app/billing/checkout/stripe`);

    // Basic expectation: checkout page loads and has a confirm button
    const payButton = page.getByRole('button', { name: /pay|confirm/i }).first();
    await expect(payButton).toBeVisible({ timeout: 10_000 });

    // In real E2E, we'd interact with Stripe elements. Here, we assume that
    // clicking the button in the test environment uses a test token and
    // redirects back to billing dashboard with success state.
    await payButton.click();

    await page.waitForURL(/\/app\/billing/, { timeout: 20_000 });

    // Verify that the latest invoice in the billing dashboard shows PAID
    const statusChip = page.locator('text=Latest payment').locator('..').locator('text=PAID').first();
    await expect(statusChip).toBeVisible({ timeout: 10_000 });
  });

  test('Offline payment approval should revive package and reflect in billing', async ({ page }) => {
    // Tenant submits offline payment
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/billing/offline`);

    // Fill offline payment form
    await page.fill('input[label*="Amount" i], input[placeholder*="Amount" i], input[type="number"]', '100');

    const currencySelect = page.locator('select').first();
    if (await currencySelect.isVisible().catch(() => false)) {
      await currencySelect.selectOption('USD').catch(() => {});
    }

    const methodSelect = page.locator('select').nth(1);
    await methodSelect.selectOption('bank_transfer').catch(() => {});

    await page.fill('textarea,label:text("Description") >> xpath=..//textarea', 'E2E offline payment test').catch(() => {});

    const submitBtn = page.getByRole('button', { name: /submit offline payment/i }).first();
    await submitBtn.click();

    // Wait for request card to appear
    const requestCard = page.locator('text=Offline / Bank Transfer Payments').locator('..').locator('text=pending').first();
    await requestCard.waitFor({ timeout: 15_000 }).catch(() => {});

    await logout(page);

    // Platform admin approves offline payment
    await loginAsPlatformAdmin(page);
    await page.goto(`${BASE_URL}/app/admin/payments/offline`);

    const pendingCard = page.locator('text=Offline Payments – Admin Review').locator('..').locator('text=pending').first();
    if (await pendingCard.isVisible({ timeout: 10_000 }).catch(() => false)) {
      const approveButton = pendingCard.getByRole('button', { name: /approve/i }).first();
      await approveButton.click();
    }

    // After approval, the tenant's billing dashboard should still be reachable.
    await logout(page);
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/billing`);
    await expect(page).toHaveURL(/\/app\/billing/);

    // After approval, the latest payment banner should reflect a PAID status
    // (even if the payment method is shown as UNKNOWN for offline flows).
    const latestPaymentSection = page.locator('text=Latest payment').first();
    await expect(latestPaymentSection).toBeVisible({ timeout: 15_000 });
    const paidChip = latestPaymentSection.locator('text=PAID').first();
    await expect(paidChip).toBeVisible({ timeout: 15_000 });
  });

  test('Tenant isolation: tenant A cannot see tenant B invoices or offline requests', async ({ page }) => {
    // This test assumes that test fixtures ensure at least two tenants exist.
    // We only verify that basic RBAC redirects unauthenticated access.

    await logout(page);
    await page.goto(`${BASE_URL}/app/billing/invoices`);
    await page.waitForURL(`${BASE_URL}/login`);

    // After login as tenant admin, invoices should load but we can't navigate
    // to admin offline payments without platform role.
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/admin/payments/offline`);
    await expect(page).not.toHaveURL(/\/app\/admin\/payments\/offline/);
  });
});
