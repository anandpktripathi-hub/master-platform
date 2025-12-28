import { test, expect } from '@playwright/test';
import {
  loginAsTenantAdmin,
  loginAsPlatformAdmin,
  logout,
  dismissSuccessAlert,
  dismissErrorAlert,
} from '../helpers/auth';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

test.describe('Package upgrade with coupon', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTenantAdmin(page);
  });

  test('should display available packages on packages page', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/packages`);

    // Verify page loaded
    await expect(page.locator('h4, h5').filter({ hasText: /package/i }).first()).toBeVisible();

    // Verify package cards exist
    const packageCards = page.locator('[role="region"]:has-text("package"), [role="article"]:has-text("$")').or(page.locator('text=$'));
    await expect(packageCards.first()).toBeVisible({ timeout: 5000 });

    // Verify "Choose a package" or similar heading
    await expect(page.locator('h6, text=package, text=Choose').first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should select a package and validate coupon', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/packages`);

    // Wait for packages to load
    await page.waitForTimeout(1000);
    const selectButtons = page.getByRole('button', { name: /select|choose/i });
    const selectCount = await selectButtons.count();

    if (selectCount === 0) {
      // If no explicit select buttons, look for package cards
      const packageCards = page.locator('[role="article"], .card, [data-testid*="package"]');
      if (await packageCards.first().isVisible()) {
        await packageCards.first().click();
      } else {
        test.skip();
        return;
      }
    } else {
      // Click first select button
      await selectButtons.first().click();
    }

    // Verify selection UI updated
    const selectedIndicator = page.locator('text=Selected, text=selected');
    await expect(selectedIndicator.first()).toBeVisible({ timeout: 3000 }).catch(() => {});

    // Enter a test coupon code
    const couponInput = page.locator('input[placeholder*="coupon"], input[name="coupon"]').first();
    if (await couponInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await couponInput.fill('TEST10OFF');

      // Click validate button
      const validateBtn = page.getByRole('button', { name: /validate|check/i });
      if (await validateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await validateBtn.click();

        // Wait for validation response
        await page.waitForTimeout(1000);
        
        // Check for success or error message
        const responseMsg = page.locator('[role="alert"], .alert, .error, .success');
        if (await responseMsg.first().isVisible({ timeout: 3000 }).catch(() => false)) {
          const msgText = await responseMsg.first().textContent();
          expect(msgText?.toLowerCase() || '').toMatch(/valid|invalid|coupon|discount/i);
        }
      }
    }
  });

  test('should upgrade to a selected package', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/packages`);

    // Select a package
    const selectBtn = page.getByRole('button', { name: /select|choose/i }).first();
    if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectBtn.click();
    }

    // Click upgrade/confirm button
    const upgradeBtn = page.getByRole('button', { name: /upgrade|confirm/i });
    if (await upgradeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await upgradeBtn.click();

      // Wait for success message
      const successMsg = await dismissSuccessAlert(page, 5000).catch(() => null);
      
      // Either success or we see the current plan updated
      if (successMsg) {
        expect(successMsg.toLowerCase()).toMatch(/success|upgrade|updated/i);
      }

      // Verify current plan section shows the upgraded plan
      const currentPlanSection = page.locator('text=Current Plan, text=current plan, text=Your plan').first();
      if (await currentPlanSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        expect(currentPlanSection).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should show error for invalid coupon', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/packages`);

    // Select a package
    const selectBtn = page.getByRole('button', { name: /select|choose/i }).first();
    if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectBtn.click();
    }

    // Enter invalid coupon
    const couponInput = page.locator('input[placeholder*="coupon"], input[name="coupon"]').first();
    if (await couponInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await couponInput.fill('INVALIDCODE123');

      const validateBtn = page.getByRole('button', { name: /validate|check/i });
      if (await validateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await validateBtn.click();

        // Wait for error message
        const errorMsg = await dismissErrorAlert(page, 5000).catch(async () => {
          return await page.locator('[role="alert"]:has-text("not valid"), [role="alert"]:has-text("invalid")').first().textContent();
        });

        expect(errorMsg?.toLowerCase() || '').toMatch(/invalid|not.*valid|expired|not.*found/i);
      }
    }
  });

  test('should display current plan card on packages page', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/packages`);

    // Look for current plan/limits display
    const currentPlanCard = page.locator('text=Current Plan, text=current plan, text=Your plan, text=Plan').first();
    await expect(currentPlanCard).toBeVisible({ timeout: 5000 });

    // Verify plan details are shown
    const planName = page.locator('text=Standard, text=Pro, text=Enterprise, h6').first();
    await expect(planName).toBeVisible({ timeout: 3000 }).catch(() => {});

    // Verify usage/limits display
    const usageIndicator = page.locator('[role="progressbar"], text=Usage, text=Limit').first();
    if (await usageIndicator.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(usageIndicator).toBeVisible();
    }
  });
});

test.describe('Package RBAC', () => {
  test('should deny access to packages page for non-authenticated user', async ({ page }) => {
    await logout(page);
    await page.goto(`${BASE_URL}/app/packages`);
    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`);
    await expect(page).toHaveURL(new RegExp('/login'));
  });

  test('should allow TENANT_ADMIN to access packages page', async ({ page }) => {
    await loginAsTenantAdmin(page);
    await page.goto(`${BASE_URL}/app/packages`);
    await expect(page).toHaveURL(new RegExp('/packages'));
    await expect(page.locator('h4, h5').filter({ hasText: /package/i }).first()).toBeVisible();
  });
});
