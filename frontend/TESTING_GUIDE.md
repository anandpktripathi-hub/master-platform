# E2E Testing Guide

## Setup

### Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test domain-management.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with UI
npx playwright test --ui

# Debug tests
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Test Structure

### Test Files

All E2E tests are in `tests/e2e/` directory:

```
tests/
└── e2e/
    ├── domain-management.spec.ts   # Domain CRUD and custom domains
    ├── package-limits.spec.ts      # Package limits and features
    ├── coupon-validation.spec.ts   # Coupon validation and application
    └── auth-rbac.spec.ts           # Authentication and authorization
```

### Test Categories

#### 1. Domain Management
- Create path-based domain
- Create subdomain
- Check domain availability
- Set primary domain
- Delete domain
- Request custom domain
- Verify custom domain (DNS)
- Issue SSL certificate
- Handle duplicate domains
- Handle limit exceeded

#### 2. Package & Limits
- View current package
- View usage metrics
- Check feature flags
- Upgrade package (with coupon)
- Prevent actions when limit exceeded
- Trial period handling
- Expired plan handling

#### 3. Coupon Validation
- Validate valid coupon
- Validate invalid coupon
- Apply coupon during checkout
- Check discount calculation
- Verify usage tracking
- Handle expired coupons
- Handle usage limit reached

#### 4. Authentication & RBAC
- Login redirect
- Protected route access
- Role-based access (tenant vs platform admin)
- Access denied messages
- Token expiry handling
- Logout functionality

#### 5. Audit Logs
- View audit logs
- Filter by resource type
- Filter by action
- Filter by date range
- Expand log details
- View changes
- Pagination

## Test Data Setup

### Prerequisites

Before running tests, ensure:

1. **Backend Running**: `http://localhost:4000`
2. **Frontend Running**: `http://localhost:5173`
3. **Test Database**: Seeded with test data

### Seed Test Data

Create a seed script `backend/scripts/seed-test-data.ts`:

```typescript
// Create test users
const tenantAdmin = await createUser({
  email: 'tenant-admin@test.com',
  password: 'password123',
  role: 'TENANT_ADMIN',
  tenantId: testTenantId,
});

const platformAdmin = await createUser({
  email: 'platform-admin@test.com',
  password: 'adminpass123',
  role: 'PLATFORM_SUPERADMIN',
});

// Create test packages
const basicPackage = await createPackage({
  name: 'Basic',
  price: 9.99,
  billingCycle: 'monthly',
  featureSet: {
    allowPathDomain: true,
    allowSubdomain: true,
    allowCustomDomain: false,
  },
  limits: {
    maxDomains: 3,
    maxSubdomains: 2,
    maxPaths: 1,
  },
});

// Create test coupons
const testCoupon = await createCoupon({
  code: 'TESTCODE10',
  type: 'multi',
  discountType: 'percent',
  amount: 10,
  status: 'active',
});

// Assign package to test tenant
await assignPackageToTenant({
  tenantId: testTenantId,
  packageId: basicPackage._id,
  startTrial: true,
});
```

Run seed script:
```bash
npm run seed:test
```

## Mocking DNS Verification

For custom domain tests, you have two options:

### Option 1: Mock DNS on Backend

Create a test mode in your backend:

```typescript
// backend/src/modules/custom-domains/services/custom-domain.service.ts

async verifyDomainOwnership(id: string, dto: VerifyCustomDomainDto) {
  // In test mode, auto-verify specific domains
  if (process.env.NODE_ENV === 'test' && customDomain.domain.includes('preconfigured-test')) {
    customDomain.status = 'verified';
    customDomain.verifiedAt = new Date();
    await customDomain.save();
    return customDomain;
  }

  // Normal DNS verification logic
  // ...
}
```

### Option 2: Use Playwright Network Mocking

```typescript
test('should verify custom domain', async ({ page }) => {
  // Mock DNS verification API response
  await page.route('**/custom-domains/*/verify', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        _id: '123',
        domain: 'test.example.com',
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      }),
    });
  });

  // Proceed with test
  await page.click('button:has-text("Verify DNS")');
  await expect(page.locator('text=verified successfully')).toBeVisible();
});
```

## Best Practices

### 1. Use Page Objects

Create reusable page objects for common interactions:

```typescript
// tests/pages/DomainPage.ts
export class DomainPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/domains');
  }

  async createDomain(type: 'path' | 'subdomain', value: string) {
    await this.page.click('button:has-text("Add Domain")');
    await this.page.selectOption('select[name="type"]', type);
    await this.page.fill('input[name="value"]', value);
    await this.page.click('button[type="submit"]');
  }

  async setAsPrimary(domainValue: string) {
    const row = this.page.locator(`tr:has-text("${domainValue}")`);
    await row.locator('button:has(svg[data-testid="StarBorderIcon"])').click();
  }

  async deleteDomain(domainValue: string) {
    const row = this.page.locator(`tr:has-text("${domainValue}")`);
    await row.locator('button:has(svg[data-testid="DeleteIcon"])').click();
  }
}
```

Usage:
```typescript
test('should create domain', async ({ page }) => {
  const domainPage = new DomainPage(page);
  await domainPage.goto();
  await domainPage.createDomain('subdomain', 'myshop');
});
```

### 2. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Delete test domains created during test
  await page.evaluate(() => {
    return fetch('http://localhost:4000/api/v1/test/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: Date.now() }),
    });
  });
});
```

### 3. Use Test IDs

Add `data-testid` to critical elements:

```tsx
<Button data-testid="create-domain-button">Create Domain</Button>
<Table data-testid="domains-table">...</Table>
```

Then use in tests:
```typescript
await page.click('[data-testid="create-domain-button"]');
await expect(page.locator('[data-testid="domains-table"]')).toBeVisible();
```

### 4. Handle Async Operations

```typescript
// Wait for loading to finish
await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });

// Wait for API calls
await page.waitForResponse((response) =>
  response.url().includes('/domains/me') && response.status() === 200
);

// Wait for navigation
await page.waitForURL('/dashboard');
```

### 5. Parallel Test Execution

Use unique identifiers to avoid conflicts:

```typescript
const domainValue = `testshop-${Date.now()}-${Math.random().toString(36).substring(7)}`;
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start backend
        run: |
          cd backend
          npm ci
          npm run start:test &
          sleep 10
      
      - name: Seed test data
        run: cd backend && npm run seed:test
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Failed Tests

### 1. Screenshots
Playwright automatically captures screenshots on failure. Check `test-results/` directory.

### 2. Traces
View traces with:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

### 3. Video Recording
Enable in `playwright.config.ts`:
```typescript
use: {
  video: 'on-first-retry',
}
```

### 4. Slow Motion
Run tests in slow motion to see what's happening:
```bash
npx playwright test --headed --slow-mo=1000
```

## Common Issues

### 1. Element Not Found
```typescript
// ❌ Bad: Fails immediately
await page.click('button');

// ✅ Good: Waits up to 30s
await page.waitForSelector('button', { state: 'visible' });
await page.click('button');
```

### 2. Race Conditions
```typescript
// ❌ Bad: May click before data loads
await page.goto('/domains');
await page.click('button:has-text("Add Domain")');

// ✅ Good: Wait for data to load
await page.goto('/domains');
await page.waitForSelector('table', { state: 'visible' });
await page.click('button:has-text("Add Domain")');
```

### 3. Flaky Tests
```typescript
// Use retry logic for flaky operations
test('flaky test', async ({ page }) => {
  await test.step('retry this step', async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await page.click('button');
        break;
      } catch (e) {
        if (i === 2) throw e;
        await page.waitForTimeout(1000);
      }
    }
  });
});
```

## Summary

- **Setup**: Install Playwright, configure, and seed test data
- **Run**: `npx playwright test` for all tests
- **Debug**: Use `--headed`, `--debug`, or `--ui` flags
- **Best Practices**: Use page objects, clean up, add test IDs
- **CI/CD**: Integrate with GitHub Actions or similar
- **Maintenance**: Keep tests independent, use unique identifiers, handle async properly

Your E2E test suite is now ready to ensure your frontend integration works correctly with the backend APIs!
