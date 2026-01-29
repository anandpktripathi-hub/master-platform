# Domain, Package & Coupon Management Implementation Guide

## ✅ COMPLETED COMPONENTS

### Database Schemas (Created)
- **Domain** - path and subdomain management
- **CustomDomain** - custom domain verification and SSL
- **Package** - package definitions with features and limits
- **TenantPackage** - tenant package assignment and usage counters
- **Coupon** - coupon definitions for discounts
- **CouponUsage** - coupon usage tracking
- **AuditLog** - audit trail for all changes

### Middleware & Services (Created)
- **Enhanced TenantMiddleware** - Host/path/header-based tenant resolution with caching
- **AuditLogService** - Complete audit logging system
- **DomainService** - Path/subdomain CRUD with limit enforcement
- **CustomDomainService** - Custom domain verification, DNS check, SSL placeholder
- **PackageService** - Package CRUD, assignment, feature/limit enforcement

### Controllers (Partially Created)
- **DomainController** - Tenant and admin endpoints for domain management
- CustomDomain Controller - (Still needed, use same pattern as DomainController)
- Package Controller - (Still needed)
- Coupon Controller - (Still needed)

---

## ⏳ STILL NEEDED

### 1. CustomDomain Controller
Create: `backend/src/modules/custom-domains/custom-domains.controller.ts`

```typescript
@Controller('custom-domains')
export class CustomDomainController {
  constructor(private customDomainService: CustomDomainService) {}

  // GET /custom-domains/me - List tenant's custom domains
  // POST /custom-domains/me - Request new custom domain
  // PATCH /custom-domains/me/:domainId - Update (e.g., change verification method)
  // POST /custom-domains/me/:domainId/verify - Verify domain ownership
  // POST /custom-domains/me/:domainId/ssl/issue - Request SSL
  // POST /custom-domains/me/:domainId/primary - Set as primary
  // DELETE /custom-domains/me/:domainId - Delete
  
  // GET / - Admin: list all custom domains
  // POST /:domainId/activate - Admin: activate domain
  // PATCH /:domainId - Admin: update domain
}
```

### 2. Package Controller
Create: `backend/src/modules/packages/packages.controller.ts`

```typescript
@Controller('packages')
export class PackageController {
  constructor(private packageService: PackageService) {}

  // GET /packages - List all packages (public)
  // POST /packages - Create package (admin)
  // PATCH /packages/:packageId - Update (admin)
  // DELETE /packages/:packageId - Delete (admin)
  // GET /packages/me - Get tenant's current package
  // GET /packages/me/usage - Get usage and limits
  // POST /packages/me/upgrade - Upgrade to new package (with coupon support)
}
```

### 3. Coupon Service
Create: `backend/src/modules/coupons/services/coupon.service.ts`

```typescript
@Injectable()
export class CouponService {
  // createCoupon() - Create coupon
  // updateCoupon() - Update coupon
  // deleteCoupon() - Delete coupon
  // listCoupons() - List all (admin)
  // validateCoupon(code, tenantId, packageId) - Validate for use
  // applyCoupon(code, tenantId) - Apply and record usage
  // getUsageStats() - Get coupon usage statistics
  // bulkActivateDeactivate() - Bulk actions
}
```

### 4. Coupon Controller
Create: `backend/src/modules/coupons/coupons.controller.ts`

```typescript
@Controller('coupons')
export class CouponController {
  // GET / - List coupons (admin)
  // POST / - Create coupon (admin)
  // PATCH /:couponId - Update (admin)
  // DELETE /:couponId - Delete (admin)
  // POST /:couponId/activate - Activate (admin)
  // POST /:couponId/deactivate - Deactivate (admin)
  // GET /:couponId/usage - Get usage stats (admin)
  // POST /validate - Validate code (public/tenant)
  // POST /apply - Apply coupon to upgrade (tenant)
  // POST /bulk-actions - Bulk activate/deactivate (admin)
}
```

### 5. Role-Based Guards
Create: `backend/src/guards/jwt-auth.guard.ts` and `backend/src/guards/role.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Verify JWT token and attach user to request
}

@Injectable()
export class RoleGuard implements CanActivate {
  // Check @Roles() decorator and verify role matches
}
```

### 6. Background Jobs (Bull/BullMQ)
Create: `backend/src/jobs/` with:
- dns-verification.job.ts - Polling DNS verification for custom domains
- ssl-issuance.job.ts - ACME SSL certificate issuance
- ssl-renewal.job.ts - Monitor and renew expiring SSL certs
- usage-reconciliation.job.ts - Reconcile usage counters vs actual records
- trial-expiry.job.ts - Expire trial packages

### 7. React Components (Frontend)
Create or wire:
- `frontend/src/components/DomainManager.tsx`
- `frontend/src/components/CustomDomainForm.tsx`
- `frontend/src/components/PackageSelector.tsx`
- `frontend/src/components/CouponManager.tsx`
- `frontend/src/hooks/useDomains.ts`
- `frontend/src/hooks/usePackages.ts`
- `frontend/src/hooks/useCoupons.ts`

### 8. Update App Module
Modify: `backend/src/app.module.ts`

```typescript
@Module({
  imports: [
    // ... existing modules ...
    DomainsModule,
    CustomDomainsModule,
    PackagesModule,
    CouponsModule,
    // For background jobs, add BullModule:
    BullModule.forRoot({ redis: { host: 'localhost', port: 6379 } })
  ]
})
```

### 9. Environment Variables
Add to `.env`:
```
PLATFORM_DOMAIN=platform.com
DNS_TARGET=edge.platform.com
ACME_EMAIL=ssl@platform.com
ACME_PROVIDER=letsencrypt
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 10. Testing
- E2E tests for domain lifecycle
- Integration tests for package limit enforcement
- Unit tests for coupon validation
- Tenant isolation tests

---

## IMPLEMENTATION SEQUENCE

1. **Create Guard files** (jwt-auth.guard, role.guard) - Quick, unblocks controllers
2. **Create remaining Controllers** (CustomDomain, Package, Coupon)
3. **Create Coupon Service** - Critical for checkout/upgrade
4. **Create Modules** (CustomDomainsModule, PackagesModule, CouponsModule)
5. **Update app.module.ts** - Register new modules
6. **Create React API hooks** (useDomains, usePackages, useCoupons)
7. **Wire React components** to hooks and API calls
8. **Create Background Jobs** - Optional but important for reliability
9. **Create E2E Tests** - Validate end-to-end flows
10. **Deployment & Migration**

---

## KEY IMPLEMENTATION NOTES

### Multi-Tenancy Security
- All domain/package/coupon endpoints MUST verify `tenantId` from JWT
- Use middleware to attach `req.tenantId` from Host header
- Guards enforce role-based access (PLATFORM_SUPERADMIN vs TENANT_ADMIN)
- Audit every action with actor/tenant/action/resource

### Package Limits Enforcement
- DomainService calls `enforcePackageLimits()` before creating domain
- DomainService tracks usage in `TenantPackage.usageCounters`
- CustomDomainService does the same for custom domains
- PackageService provides `canUseFeature()` and `getUsageAndLimits()`

### Coupon Validation
- Check status (active), date window (validFrom/validTo), usage caps (maxUses, maxUsesPerTenant)
- Verify package applicability (applicablePackageIds)
- Verify tenant allowlist (isPrivate + allowedTenantIds)
- Record CouponUsage on successful apply
- Return discount amount for checkout integration

### Custom Domain Workflow
1. Request → Create with `pending_verification` status
2. Provide DNS instructions (TXT or CNAME)
3. Tenant configures DNS
4. Verify DNS → Update to `verified` status
5. Issue SSL (ACME) → Update to `ssl_pending` then `ssl_issued`
6. Admin/auto activate → `active` status
7. Monitor SSL expiry, renew before expiration

### DNS Verification
- TXT: Look for `_verify.{domain}` TXT record with verification token
- CNAME: Look for `{domain}` CNAME record pointing to `DNS_TARGET`
- Use Node.js `dns` module or external API (route53, cloudflare)
- Implement background job for polling/retries

### Checkout/Upgrade with Coupon
```typescript
// In checkout controller:
1. Get selected package and coupon code
2. Call couponService.validateCoupon(code, tenantId, packageId)
3. Get discount amount
4. Calculate final price = package.price - discount
5. Process payment
6. On success: 
   - Call packageService.assignPackageToTenant()
   - Call couponService.applyCoupon() to record usage
   - Update tenant.planKey and billing status
```

---

## FILES CREATED SO FAR

✅ `/backend/src/database/schemas/domain.schema.ts`
✅ `/backend/src/database/schemas/custom-domain.schema.ts`
✅ `/backend/src/database/schemas/package.schema.ts`
✅ `/backend/src/database/schemas/tenant-package.schema.ts`
✅ `/backend/src/database/schemas/coupon.schema.ts`
✅ `/backend/src/database/schemas/coupon-usage.schema.ts`
✅ `/backend/src/database/schemas/audit-log.schema.ts`
✅ `/backend/src/middleware/tenant.middleware.ts` (enhanced)
✅ `/backend/src/services/audit-log.service.ts`
✅ `/backend/src/modules/domains/dto/domain.dto.ts`
✅ `/backend/src/modules/domains/dto/custom-domain.dto.ts`
✅ `/backend/src/modules/domains/services/domain.service.ts`
✅ `/backend/src/modules/domains/domains.controller.ts`
✅ `/backend/src/modules/domains/domains.module.ts`
✅ `/backend/src/modules/custom-domains/services/custom-domain.service.ts`
✅ `/backend/src/modules/packages/services/package.service.ts`

## FILES STILL NEEDED

🔲 `/backend/src/guards/jwt-auth.guard.ts`
🔲 `/backend/src/guards/role.guard.ts`
🔲 `/backend/src/decorators/roles.decorator.ts`
🔲 `/backend/src/modules/custom-domains/dto/custom-domain.dto.ts` (complete)
🔲 `/backend/src/modules/custom-domains/custom-domains.controller.ts`
🔲 `/backend/src/modules/custom-domains/custom-domains.module.ts`
🔲 `/backend/src/modules/packages/dto/package.dto.ts`
🔲 `/backend/src/modules/packages/packages.controller.ts`
🔲 `/backend/src/modules/packages/packages.module.ts`
🔲 `/backend/src/modules/coupons/dto/coupon.dto.ts`
🔲 `/backend/src/modules/coupons/services/coupon.service.ts`
🔲 `/backend/src/modules/coupons/coupons.controller.ts`
🔲 `/backend/src/modules/coupons/coupons.module.ts`
🔲 `/backend/src/jobs/dns-verification.job.ts` (optional but recommended)
🔲 `/backend/src/jobs/ssl-renewal.job.ts` (optional but recommended)
🔲 `/frontend/src/hooks/useDomains.ts`
🔲 `/frontend/src/hooks/usePackages.ts`
🔲 `/frontend/src/hooks/useCoupons.ts`
🔲 `/frontend/src/components/DomainManager.tsx`
🔲 `/frontend/src/components/PackageSelector.tsx`
🔲 `/frontend/src/components/CouponManager.tsx`

---

Ready to continue implementing? Let me know which area you'd like to tackle next!
