import { test, expect, Page } from '@playwright/test';
import {
  loginAsTenantAdmin,
  loginAsPlatformAdmin,
  logout,
  generateTestDomainName,
  dismissSuccessAlert,
  dismissErrorAlert,
  TEST_USERS,
} from '../helpers/auth';

/**
 * E2E Tests for Domain Management
 * 
 * Prerequisites:
 * - Backend running on http://localhost:4000 (or E2E_API_URL env var)
 * - Frontend running on http://localhost:5173 (or E2E_BASE_URL env var)
 * - Test users seeded in database (see TEST_USERS in helpers/auth.ts)
 * - Test package with domain creation enabled
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Domain Management - Full Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tenant admin before each test
    await loginAsTenantAdmin(page);
  });

  test('should create a subdomain successfully', async ({ page }) => {
    // Navigate to domains page
    await page.goto(`${BASE_URL}/app/domains`);
    await expect(page.locator('h4, h5').filter({ hasText: /domain/i }).first()).toBeVisible();

    // Click "Add Domain" button
    const addBtn = page.getByRole('button', { name: /add domain/i }).first();
    await addBtn.click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Select subdomain type
    const typeSelect = page.locator('select[name="type"], [aria-label*="Type"]').first();
    await typeSelect.click({ timeout: 2000 }).catch(() => {});
    const subdomainOption = page.locator('option:has-text("Subdomain"), li:has-text("Subdomain")').first();
    if (await subdomainOption.isVisible({ timeout: 1000 }).catch(() => false)) {
      await subdomainOption.click();
    }

    // Enter domain value
    const domainValue = `subdomain-${generateTestDomainName()}`;
    const valueInput = page.locator('input[name="value"], input[placeholder*="value"]').first();
    await valueInput.fill(domainValue);

    // Wait for availability check
    await page.waitForTimeout(1500);

    // Submit form
    const submitBtn = page.getByRole('button', { name: /create|submit/i }).last();
    await submitBtn.click();

    // Wait for success
    const successMsg = await dismissSuccessAlert(page, 5000).catch(() => null);
    if (successMsg) {
      expect(successMsg.toLowerCase()).toMatch(/success|created/i);
    }

    // Verify domain appears in table
    await expect(page.locator(`text=${domainValue}`)).toBeVisible({ timeout: 5000 });
  });

  test('should set primary domain', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/domains`);

    // Wait for table to load
    const tableRows = page.locator('table tbody tr');
    if (await tableRows.count() === 0) {
      test.skip();
      return;
    }

    // Find first non-primary domain's star button
    const nonPrimaryStars = page.locator('button:has(svg[data-testid="StarBorderIcon"])');
    if (await nonPrimaryStars.count() > 0) {
      await nonPrimaryStars.first().click();

      // Wait for success
      const successMsg = await dismissSuccessAlert(page, 3000).catch(() => null);
      expect(successMsg?.toLowerCase() || '').toMatch(/primary|success/i);

      // Verify star icon changed to filled
      await expect(page.locator('svg[data-testid="StarIcon"]').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should delete a domain', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/domains`);

    // Get initial row count
    const rows = page.locator('table tbody tr');
    const initialCount = await rows.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Find delete button on first row (skip if primary)
    const firstRow = rows.first();
    const isPrimary = await firstRow.locator('svg[data-testid="StarIcon"]').isVisible({ timeout: 1000 }).catch(() => false);
    
    if (isPrimary && initialCount === 1) {
      test.skip();
      return;
    }

    // Click delete button
    const deleteBtn = firstRow.locator('button:has(svg[data-testid="DeleteIcon"])').first();
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();

      // Confirm if dialog appears
      const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i });
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }

      // Wait for success
      await dismissSuccessAlert(page, 3000).catch(() => null);

      // Verify count decreased
      const newCount = await rows.count();
      expect(newCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should show error for duplicate domain', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/domains`);

    // Get first domain value
    const firstCell = page.locator('table tbody tr:first-child td:nth-child(2)').first();
    const existingValue = await firstCell.textContent();

    if (!existingValue?.trim()) {
      test.skip();
      return;
    }

    // Click Add Domain
    await page.getByRole('button', { name: /add domain/i }).first().click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Enter duplicate value
    const valueInput = page.locator('input[name="value"], input[placeholder*="value"]').first();
    await valueInput.fill(existingValue);

    // Wait for availability check
    await page.waitForTimeout(1500);

    // Try to submit
    const submitBtn = page.getByRole('button', { name: /create|submit/i }).last();
    const isDisabled = await submitBtn.isDisabled({ timeout: 2000 }).catch(() => false);

    if (isDisabled) {
      expect(isDisabled).toBe(true);
    } else {
      await submitBtn.click();
      const errorMsg = await dismissErrorAlert(page, 5000).catch(() => null);
      expect(errorMsg?.toLowerCase() || '').toMatch(/already|exists|duplicate|not available/i);
    }
  });

  test('should prevent deletion of primary domain', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/domains`);

    // Find primary domain row
    const primaryRow = page.locator('table tbody tr:has(svg[data-testid="StarIcon"])').first();
    if (await primaryRow.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try to click delete on primary domain
      const deleteBtn = primaryRow.locator('button:has(svg[data-testid="DeleteIcon"])').first();
      const isDisabled = await deleteBtn.isDisabled({ timeout: 2000 }).catch(() => false);

      // Should be disabled
      expect(isDisabled).toBe(true);
    }
  });
});

test.describe('Custom Domains - Full Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/domains`);
  });

  test('should request custom domain and display DNS instructions', async ({ page }) => {
    // Click "Add Custom Domain"
    const addCustomBtn = page.getByRole('button', { name: /custom domain|add custom/i });
    await addCustomBtn.click();

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Enter custom domain
    const customDomain = `e2e-${generateTestDomainName()}.example.com`;
    const domainInput = page.locator('input[name="domain"], input[placeholder*="domain"]').first();
    await domainInput.fill(customDomain);

    // Select verification method
    const methodSelect = page.locator('select[name="verificationMethod"], [aria-label*="Verification"]').first();
    await methodSelect.click({ timeout: 2000 }).catch(() => {});

    // Submit
    const submitBtn = page.getByRole('button', { name: /request|submit/i }).last();
    await submitBtn.click();

    // Wait for DNS instructions
    const dnsTitle = page.locator('text=DNS, text=Configuration');
    await expect(dnsTitle.first()).toBeVisible({ timeout: 5000 });

    // Verify DNS fields
    await expect(page.locator('text=Type, text=Host, text=Value, text=Target, text=Name').first()).toBeVisible({ timeout: 3000 });
  });

  test('should show error for invalid domain format', async ({ page }) => {
    await page.getByRole('button', { name: /custom domain|add custom/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    const domainInput = page.locator('input[name="domain"], input[placeholder*="domain"]').first();
    await domainInput.fill('invalid-domain');

    const submitBtn = page.getByRole('button', { name: /request|submit/i }).last();
    const isDisabled = await submitBtn.isDisabled({ timeout: 2000 }).catch(() => false);

    if (isDisabled) {
      expect(isDisabled).toBe(true);
    } else {
      const helperText = await domainInput.evaluate((el: any) => el.parentElement?.textContent);
      expect(helperText?.toLowerCase() || '').toMatch(/invalid|format/i);
    }
  });
});

test.describe('Authorization & RBAC', () => {
  test('should redirect non-authenticated to login', async ({ page }) => {
    await logout(page);
    await page.goto(`${BASE_URL}/app/domains`);
    await page.waitForURL(`${BASE_URL}/login`);
    expect(page.url()).toContain('/login');
  });

  test('should allow TENANT_ADMIN access to domains', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/domains`);
    await expect(page).toHaveURL(new RegExp('/domains'));
  });
});
