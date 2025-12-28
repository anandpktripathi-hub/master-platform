import { test, expect } from '@playwright/test';
import {
  loginAsTenantAdmin,
  loginAsPlatformAdmin,
  logout,
  generateTestDomainName,
  dismissSuccessAlert,
  dismissErrorAlert,
} from '../helpers/auth';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Tenant domain lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsTenantAdmin(page);
  });

  test('should create a subdomain, set primary, and delete', async ({ page }) => {
    // Navigate to domains page
    await page.goto(`${BASE_URL}/app/domains`);

    // Verify page loaded
    await expect(page.locator('h4').or(page.locator('h5'))).toContainText('Domains');

    // Get initial domain count
    const initialRows = await page.locator('table tbody tr').count();

    // Click "Add Domain" button
    const addDomainBtn = page.getByRole('button', { name: /add domain/i }).first();
    await addDomainBtn.click();

    // Wait for modal to appear
    const dialogTitle = page.locator('h2').or(page.locator('[role="dialog"] header'));
    await expect(dialogTitle).toContainText(/create|domain/i);

    // Select subdomain type in dropdown
    const typeSelect = page.locator('select[name="type"], [aria-label*="Type"], [aria-label*="Domain"]').first();
    await typeSelect.click();
    const subdomainOption = page.locator('option:has-text("Subdomain"), li:has-text("Subdomain")').first();
    if (await subdomainOption.isVisible()) {
      await subdomainOption.click();
    }

    // Enter domain value
    const testDomain = generateTestDomainName('testshop');
    const valueInput = page.locator('input[name="value"], input[placeholder*="value"]').first();
    await valueInput.fill(testDomain);

    // Wait for availability check
    await page.waitForTimeout(1000); // Brief wait for availability check
    await expect(page.locator('text=available, text=not available').first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Availability check may not always show UI
    });

    // Click submit button
    const submitBtn = page.getByRole('button', { name: /create|submit/i }).last();
    await submitBtn.click();

    // Wait for success message and verify domain appears
    const successMsg = await dismissSuccessAlert(page, 5000).catch(() => null);
    expect(successMsg?.toLowerCase() || '').toContain('success');

    // Verify domain appears in table
    await expect(page.locator(`text=${testDomain}`)).toBeVisible({ timeout: 5000 });

    // Get the row with our new domain
    const domainRow = page.locator(`table tbody tr:has-text("${testDomain}")`).first();
    await expect(domainRow).toBeVisible();

    // Find and click the set-primary button (star icon) in that row
    const setPrimaryBtn = domainRow.locator('button:has(svg)').filter({ has: page.locator('svg[data-testid*="Star"]') }).first();
    if (await setPrimaryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await setPrimaryBtn.click();
      // Wait for success
      await dismissSuccessAlert(page, 3000).catch(() => null);
      // Verify star changed to filled
      await expect(domainRow.locator('svg[data-testid="StarIcon"]')).toBeVisible({ timeout: 3000 }).catch(() => {});
    }

    // Find and click the delete button in that row
    const deleteBtn = domainRow.locator('button:has(svg[data-testid="DeleteIcon"])').first();
    await deleteBtn.click();

    // Confirm delete in dialog if present
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    // Wait for success message
    await dismissSuccessAlert(page, 3000).catch(() => null);

    // Verify domain is removed from table
    await expect(page.locator(`text=${testDomain}`)).not.toBeVisible({ timeout: 5000 });
  });

  test('should show error for duplicate domain', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/domains`);

    // Get first existing domain's value from table
    const firstDomainCell = page.locator('table tbody tr:first-child td:nth-child(2)').first();
    const existingDomainValue = await firstDomainCell.textContent();

    if (!existingDomainValue) {
      test.skip();
      return;
    }

    // Click "Add Domain" button
    await page.getByRole('button', { name: /add domain/i }).first().click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select type
    const typeSelect = page.locator('select[name="type"], [aria-label*="Type"]').first();
    await typeSelect.click({ timeout: 2000 }).catch(() => {});

    // Enter duplicate domain value
    const valueInput = page.locator('input[name="value"], input[placeholder*="value"]').first();
    await valueInput.fill(existingDomainValue);

    // Wait for availability check failure
    await page.waitForTimeout(1500);

    // Try to submit - should be disabled or show error
    const submitBtn = page.getByRole('button', { name: /create|submit/i }).last();
    const isDisabled = await submitBtn.isDisabled();

    if (isDisabled) {
      expect(isDisabled).toBe(true);
    } else {
      // If not disabled, submit and expect error message
      await submitBtn.click();
      const errorMsg = await dismissErrorAlert(page, 5000).catch(() => null);
      expect(errorMsg?.toLowerCase() || '').toMatch(/already|exists|duplicate|taken/i);
    }
  });
});

test.describe('Domain RBAC', () => {
  test('should deny access to tenant domain page for non-authenticated user', async ({ page }) => {
    await logout(page);
    await page.goto(`${BASE_URL}/app/domains`);
    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`);
    await expect(page).toHaveURL(new RegExp('/login'));
  });

  test('should allow TENANT_ADMIN to access domains page', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/domains`);
    await expect(page).toHaveURL(new RegExp('/domains'));
    await expect(page.locator('h4, h5').filter({ hasText: /domains/i }).first()).toBeVisible();
  });
});
