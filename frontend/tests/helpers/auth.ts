import { Page, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL || 'http://localhost:4000/api/v1';

/**
 * Test user credentials (these should exist in test DB)
 * In a real setup, these would be seeded or managed via test fixtures
 */
export const TEST_USERS = {
  TENANT_ADMIN: {
    email: 'tenant-admin@test.example.com',
    password: 'Test123!@#',
    role: 'TENANT_ADMIN',
    tenantId: 'test-tenant-1',
  },
  TENANT_STAFF: {
    email: 'tenant-staff@test.example.com',
    password: 'Test123!@#',
    role: 'TENANT_STAFF',
    tenantId: 'test-tenant-1',
  },
  PLATFORM_SUPERADMIN: {
    email: 'platform-admin@test.example.com',
    password: 'Test123!@#',
    role: 'PLATFORM_SUPERADMIN',
  },
};

/**
 * Login via UI by filling the login form
 * Waits for successful redirect to dashboard or app
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string,
  waitForPath = '/app/dashboard'
) {
  await page.goto(`${BASE_URL}/login`);

  // Fill login form
  await page.fill('input[name="email"], input[placeholder*="Email"]', email);
  await page.fill('input[name="password"], input[placeholder*="Password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for navigation (app or dashboard)
  await page.waitForURL((url) => {
    return url.pathname.includes('/app') || url.pathname === waitForPath;
  }, { timeout: 10_000 });
}

/**
 * Login as TENANT_ADMIN via UI
 */
export async function loginAsTenantAdmin(page: Page) {
  await loginViaUI(page, TEST_USERS.TENANT_ADMIN.email, TEST_USERS.TENANT_ADMIN.password);
}

/**
 * Login as TENANT_STAFF via UI
 */
export async function loginAsTenantStaff(page: Page) {
  await loginViaUI(page, TEST_USERS.TENANT_STAFF.email, TEST_USERS.TENANT_STAFF.password);
}

/**
 * Login as PLATFORM_SUPERADMIN via UI
 */
export async function loginAsPlatformAdmin(page: Page) {
  await loginViaUI(page, TEST_USERS.PLATFORM_SUPERADMIN.email, TEST_USERS.PLATFORM_SUPERADMIN.password);
}

/**
 * Logout by clearing auth token from localStorage and navigating to login
 */
export async function logout(page: Page) {
  // Clear localStorage (auth token)
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(`${BASE_URL}/login`);
}

/**
 * Get auth token from localStorage
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token');
  });
}

/**
 * Check if currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const token = await getAuthToken(page);
  return !!token;
}

/**
 * Helper to navigate as an authenticated user
 */
export async function navigateAsUser(
  page: Page,
  role: keyof typeof TEST_USERS,
  path: string
) {
  const user = TEST_USERS[role];
  // Check if already logged in with correct role
  const currentIsLoggedIn = await isLoggedIn(page);
  if (!currentIsLoggedIn) {
    await loginViaUI(page, user.email, user.password);
  }
  await page.goto(`${BASE_URL}${path}`);
}

/**
 * Helper to wait for and dismiss error toast/alert
 */
export async function dismissErrorAlert(page: Page, timeout = 5000) {
  const errorAlert = page.locator('div[role="alert"]:has-text("Error"), div[role="alert"]:has-text("error")');
  await errorAlert.waitFor({ timeout, state: 'visible' });
  return await errorAlert.textContent();
}

/**
 * Helper to wait for and read success toast/alert
 */
export async function dismissSuccessAlert(page: Page, timeout = 5000) {
  const successAlert = page.locator('div[role="alert"]:has-text("success"), div[role="alert"]:has-text("Success")');
  await successAlert.waitFor({ timeout, state: 'visible' });
  return await successAlert.textContent();
}

/**
 * Helper to intercept and mock API responses
 * Useful for testing error states without a real backend
 */
export async function mockApiResponse(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  pathPattern: string,
  response: any,
  status = 200
) {
  await page.route(`**${pathPattern}**`, (route) => {
    if (route.request().method() === method) {
      route.abort('blockedbyclient');
    } else {
      route.continue();
    }
  });

  // Re-route with response
  await page.route(`**${pathPattern}**`, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock API error response
 */
export async function mockApiError(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  pathPattern: string,
  status = 400,
  message = 'API Error'
) {
  await mockApiResponse(page, method, pathPattern, { error: message, message }, status);
}

/**
 * Generate unique test domain/coupon names
 */
export function generateTestDomainName(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

export function generateTestCouponCode(): string {
  return `TEST${Date.now().toString().slice(-6)}`;
}
