# Frontend (Vite + React + TypeScript)

A multi-tenant SaaS UI wired to backend APIs for **domains**, **custom domains**, **packages**, **coupons**, and **audit logs**. Built with React Query, React Hook Form, Zod, and Material-UI.

## Quick Start

### 1. Configure

Create `.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

### 2. Install & Run

```bash
npm install
npm run dev  # http://localhost:5173
```

## Core Flows

### Flow A: Tenant Domain CRUD (Path/Subdomain)

**URL**: `/app/domains`  
**Required Role**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  

**Step-by-step**:
1. Navigate to Domains page
2. Click **Add Domain** button
3. Select type (Path or Subdomain)
4. Enter value (e.g., `myshop` for subdomain)
5. System checks availability in real-time
6. Click **Create** → domain appears in table
7. Click **star icon** to set as primary (only active domains)
8. Click **delete icon** to remove

**State**:
- Hooks: `useDomainsList`, `useCreateDomain`, `useSetPrimaryDomain`, `useDeleteDomain`
- Query cache: `['domains']`
- Refetch: Auto after mutations via `invalidateQueries`

**Components**:
- [DomainListPage.tsx](./src/pages/domains/DomainListPage.tsx) – main table and modals
- [DomainCreateModal.tsx](./src/pages/domains/DomainCreateModal.tsx) – form with validation
- LoadingState, ErrorState, StatusChip – shared UI components

---

### Flow B: Custom Domain Request → Verify → SSL

**URL**: `/app/domains` (same page)  
**Required Role**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  

**Workflow**:

**Step 1 – Request**:
- Click **Add Custom Domain**
- Enter custom domain (e.g., `yourbusiness.com`)
- Select verification method (TXT or CNAME)
- Click **Request Domain**

**Step 2 – Verify**:
- Modal shows DNS instructions (copy & add to your DNS provider)
- Supports both old array format `[{description, type, host, value}]` and new object format `{method, target, instructions[]}`
- Click **Verify DNS**
- System polls status in background (5-second intervals)
- ProvisioningLogViewer shows audit trail (pending → verified)

**Step 3 – SSL**:
- Auto-advances once domain is verified
- Click **Issue SSL Certificate**
- System polls SSL issuance (pending → issued)
- ProvisioningLogViewer logs SSL events
- Domain becomes **active** when complete

**State**:
- Hooks: `useRequestCustomDomain`, `useVerifyCustomDomain`, `useIssueSsl`, `useDomainStatusPolling`, `useProvisioningLogs`
- Query cache: `['custom-domains']`
- Polling: `refetchInterval: 5000` while status in `[pending_verification, verified, ssl_pending, ssl_issued]`
- Auto-step: `useEffect` watches status and advances modal step

**Components**:
- [CustomDomainRequestModal.tsx](./src/pages/domains/CustomDomainRequestModal.tsx) – 3-step form with polling
- [ProvisioningLogViewer.tsx](./src/components/logs/ProvisioningLogViewer.tsx) – displays audit trail
- StatusChip – status colors and labels

**Edge cases**:
- Missing provisioning log endpoint? Falls back gracefully (empty array)
- DNS format auto-detects and renders both shapes
- Status updates auto-advance step via `useEffect`

---

### Flow C: Package Upgrade with Coupon

**URL**: `/app/packages`  
**Required Role**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  

**Workflow**:

1. **View Current Plan**:
   - Left sidebar shows current package (name, price, features, usage limits)
   - Progress bars show usage vs limits

2. **Select Upgrade Target**:
   - Grid of available packages with price and billing cycle
   - Click **Select** to choose target package

3. **Apply Coupon (Optional)**:
   - Enter coupon code in text input
   - Click **Validate** → see discount or error
   - Click **Apply** to lock discount

4. **Confirm Upgrade**:
   - Click **Upgrade** button
   - If coupon entered, validates and applies before upgrade
   - Calls `POST /packages/:id/assign` with tenantId
   - Success: CurrentPlanCard refreshes with new plan
   - Error: Shows error message (403 = "Not authorized")

**State**:
- Hooks: `usePublicPackages`, `useCurrentPackageWithUsage`, `useValidateCoupon`, `useApplyCoupon`, `useAssignPackageToSelf`
- Query cache: `['packages']`, `['current-package']`, `['usage']`
- Auth: Uses `user?.tenantId` from AuthContext

**Components**:
- [PackagesPage.tsx](./src/pages/packages/PackagesPage.tsx) – main flow: select, validate, upgrade
- [CurrentPlanCard.tsx](./src/pages/packages/CurrentPlanCard.tsx) – current plan display
- LoadingState, ErrorState, Alert – shared UI

---

## Scripts

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint check
npm run format           # Prettier format
npm run test             # Jest unit tests
npm run test:e2e         # Playwright E2E tests
npm run dev:mock         # Dev with mock API
```

## E2E Testing (Playwright)

### Prerequisites

1. Backend running: `http://localhost:4000`
2. Frontend running: `http://localhost:5173`
3. Test users seeded in database (see `tests/helpers/auth.ts`):
   - `tenant-admin@test.example.com` / `Test123!@#` (TENANT_ADMIN)
   - `tenant-staff@test.example.com` / `Test123!@#` (TENANT_STAFF)
   - `platform-admin@test.example.com` / `Test123!@#` (PLATFORM_SUPERADMIN)

### Run Tests

```bash
npm run test:e2e                                   # All tests
npm run test:e2e -- tests/e2e/domains.spec.ts     # Single file
npm run test:e2e -- -g "create subdomain"         # Single test
npm run test:e2e -- --debug                       # Debug mode
npm run test:e2e -- --ui                          # Interactive UI
```

### Test Coverage

#### domains.spec.ts
- ✅ Create subdomain, set primary, delete lifecycle
- ✅ Error for duplicate domains
- ✅ Prevent deletion of primary domain
- ✅ Deny non-authenticated access
- ✅ Allow TENANT_ADMIN access

#### custom-domains.spec.ts
- ✅ Request custom domain and display DNS instructions
- ✅ Verify custom domain (with mocked or real DNS)
- ✅ Show error for invalid domain format
- ✅ Poll provisioning logs during verification
- ✅ Handle both DNS instruction formats

#### domain-management.spec.ts
- ✅ Full domain CRUD workflow
- ✅ Custom domain request→verify→SSL
- ✅ All positive + negative test cases
- ✅ RBAC and authorization checks

#### packages-coupons.spec.ts
- ✅ Display available packages
- ✅ Select package and validate coupon
- ✅ Upgrade to package
- ✅ Error for invalid coupon
- ✅ Display current plan with usage
- ✅ RBAC for package access

### Test Helpers

`tests/helpers/auth.ts` provides:
```typescript
await loginAsTenantAdmin(page);
await loginAsTenantStaff(page);
await loginAsPlatformAdmin(page);
await logout(page);
await dismissSuccessAlert(page);
await dismissErrorAlert(page);
await generateTestDomainName();
```

### Configuration

- **Base URL**: `E2E_BASE_URL` env var (default: `http://localhost:5173`)
- **API URL**: `E2E_API_URL` env var (default: `http://localhost:4000/api/v1`)
- **Config file**: `playwright.config.ts`
- **Timeout**: 60 seconds per test

---

## Architecture

### Directory Structure

```
src/
├── api/                 # API client with auth/error handling
├── hooks/               # React Query hooks (domains, packages, coupons, etc.)
├── pages/               # Page components
├── components/
│   ├── common/          # LoadingState, ErrorState, ConfirmDialog, StatusChip
│   ├── logs/            # ProvisioningLogViewer
│   ├── guards/          # RequireRole, ProtectedRoute
│   └── providers/       # QueryProvider (React Query + Notistack)
├── contexts/            # AuthContext with JWT + roles
├── types/               # Shared TypeScript types
└── router.tsx           # Route definitions with guards

tests/
├── e2e/                 # Playwright specs (domains, custom-domains, packages)
└── helpers/             # Auth helpers, utilities
```

### Auth Flow

1. **Login**: Fill form → `POST /auth/login` → receive JWT
2. **Store**: JWT saved to `localStorage.token`
3. **Auto-attach**: API client auto-adds `Authorization: Bearer <token>`
4. **Tenant context**: JWT payload contains `tenantId` → auto-attached as `x-tenant-id` header
5. **Error handling**:
   - **401**: Redirect to `/login`
   - **403**: Show "Not Authorized" (no redirect)
6. **Route guards**:
   - `ProtectedRoute`: Checks auth, redirects if needed
   - `RequireRole`: Checks role, shows "Access Denied" if insufficient

### React Query Patterns

```typescript
// List with auto-unwrap of paginated response
const { data: domains } = useDomainsList();  // Returns unwrapped array

// Mutation with invalidation
await createDomainMutation.mutateAsync({ type, value });
// Auto-invalidates ['domains'] to refetch list

// Polling with conditional interval
const { data: polledDomain } = useDomainStatusPolling(id, !!isPolling);
// refetchInterval: 5000 while isPolling=true, disabled when false
```

### Error Handling

1. **Notistack toasts**: Auto-shown for API errors via QueryProvider
2. **Form validation**: RHF + Zod client-side validation
3. **Backend errors**: 400/422 → toast + form feedback
4. **Auth errors**: 401 → redirect; 403 → alert
5. **Network retry**: Configured in QueryProvider (1 retry on queries)

---

## Backend Integration

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/domains/me` | GET | List tenant domains |
| `/domains/me` | POST | Create domain |
| `/domains/me/:id/primary` | POST | Set primary domain |
| `/domains/me/:id` | DELETE | Delete domain |
| `/domains/availability` | GET | Check availability |
| `/custom-domains/me` | GET | List custom domains |
| `/custom-domains/me` | POST | Request custom domain |
| `/custom-domains/me/:id/verify` | POST | Verify DNS |
| `/custom-domains/me/:id/ssl/issue` | POST | Issue SSL cert |
| `/custom-domains/me/:id/primary` | POST | Set custom primary |
| `/custom-domains/me/:id` | DELETE | Delete custom domain |
| `/custom-domains/:id/logs` | GET | Fetch provisioning logs |
| `/packages` | GET | List packages |
| `/packages/me` | GET | Get current tenant package |
| `/packages/me/usage` | GET | Get usage metrics |
| `/packages/:id/assign` | POST | Assign package to tenant |
| `/coupons/validate` | POST | Validate coupon |
| `/coupons/apply` | POST | Apply coupon |

### Response Shapes

**List endpoints**:
```json
{
  "data": [...],
  "total": 10,
  "limit": 20,
  "skip": 0
}
```

**Domain**:
```json
{
  "_id": "...",
  "type": "subdomain",
  "value": "myshop",
  "status": "active",
  "isPrimary": true,
  "computedUrl": "..."
}
```

**Custom Domain**:
```json
{
  "_id": "...",
  "domain": "yourbusiness.com",
  "status": "pending_verification",
  "sslStatus": "pending",
  "dnsInstructions": { "method": "TXT", "target": "...", "instructions": [...] },
  "provisioning": [...]
}
```

**Package**:
```json
{
  "_id": "...",
  "name": "Pro",
  "price": 29.99,
  "limits": { "maxDomains": 50, "maxUsers": 10 },
  "features": [...]
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| E2E login fails | Verify test users are seeded in DB; check auth endpoint |
| 404 on domain fetch | Check if paginated response needs unwrapping (should be auto) |
| Provisioning logs don't show | Implement `GET /custom-domains/:id/logs` endpoint if missing |
| Coupon validation fails | Check coupon exists, is active, and not expired |
| "Not authorized" on upgrade | Check if backend requires PLATFORM_ADMIN role for `/packages/:id/assign` |

---

## Development

### Hot Reload
Vite auto-reloads on file save.

### React Query DevTools
Bottom-right button in dev mode. Inspect queries and mutations.

### Mock API (Tests)
```typescript
await mockApiResponse(page, 'POST', '/domains/me', { _id: '1', ... });
```

### Debug E2E Tests
```bash
npm run test:e2e -- --debug
npm run test:e2e -- --ui
```

---

## Deployment

```bash
npm run build             # Build to dist/
npm run preview           # Test production build
npm run deploy            # Deploy to Vercel (configured in vercel.json)
```

---

## References

- [React Query Docs](https://tanstack.com/query)
- [React Hook Form Docs](https://react-hook-form.com)
- [Zod Docs](https://zod.dev)
- [Material-UI Docs](https://mui.com)
- [Playwright Docs](https://playwright.dev)
