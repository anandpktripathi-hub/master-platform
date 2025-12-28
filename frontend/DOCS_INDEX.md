# Frontend E2E Testing & Hardening — Documentation Index

## 📋 Quick Links

### 🚀 Getting Started
- **[TEST_QUICK_START.sh](./TEST_QUICK_START.sh)** — Copy-paste commands for running tests

### 📖 Complete Guides
- **[README_COMPLETE.md](./README_COMPLETE.md)** — Comprehensive guide with:
  - Quick start (install, configure)
  - Three core flows (step-by-step walkthroughs)
  - E2E testing guide (setup, run, coverage)
  - Architecture overview
  - Backend API integration
  - Troubleshooting

### ✅ Implementation Details
- **[HARDENING_SUMMARY.md](./HARDENING_SUMMARY.md)** — What was done:
  - All changes made with code snippets
  - Verification checklist
  - File-by-file changes
  - Known limitations

### 📝 Completion Tracking
- **[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)** — Sign-off document:
  - All sections marked complete
  - Verification status
  - Ready for deployment checklist

---

## 🎯 The Three Core Flows

### 1. Tenant Domain CRUD
**Page**: `/app/domains`  
**Actions**: Create path/subdomain → Set primary → Delete  
**Auth**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  
**Tests**: `tests/e2e/domains.spec.ts` + `domain-management.spec.ts`  
**Docs**: See [README_COMPLETE.md § Flow A](./README_COMPLETE.md#flow-a-tenant-domain-crud-pathsubdomain)

### 2. Custom Domain Lifecycle
**Page**: `/app/domains` (same as above)  
**Actions**: Request → DNS instructions → Verify → Issue SSL  
**Auth**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  
**Tests**: `tests/e2e/custom-domains.spec.ts` + `domain-management.spec.ts`  
**Docs**: See [README_COMPLETE.md § Flow B](./README_COMPLETE.md#flow-b-custom-domain-request--verify--ssl)

### 3. Package Upgrade with Coupon
**Page**: `/app/packages`  
**Actions**: Select package → Validate coupon → Apply → Upgrade  
**Auth**: TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN  
**Tests**: `tests/e2e/packages-coupons.spec.ts`  
**Docs**: See [README_COMPLETE.md § Flow C](./README_COMPLETE.md#flow-c-package-upgrade-with-coupon)

---

## 🧪 E2E Test Files

### Test Files
| File | Purpose | Tests |
|------|---------|-------|
| `tests/e2e/domains.spec.ts` | Domain CRUD + RBAC | 7 tests |
| `tests/e2e/custom-domains.spec.ts` | Custom domain workflow | 4 tests |
| `tests/e2e/domain-management.spec.ts` | Full domain lifecycle | 10+ tests |
| `tests/e2e/packages-coupons.spec.ts` | Package upgrade + coupons | 6 tests |

### Helper Files
| File | Purpose |
|------|---------|
| `tests/helpers/auth.ts` | Login utilities, test data, mock helpers |

### Configuration
| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright configuration (timeout, reporters, etc.) |

---

## 🔐 RBAC & Security

### Route Guards
```
/app/domains    → RequireRole([TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN])
/app/packages   → RequireRole([TENANT_ADMIN, TENANT_STAFF, PLATFORM_SUPERADMIN])
```

### Error Handling
- **401 Unauthorized** → Redirect to `/login`
- **403 Forbidden** → Show "Not Authorized" UI
- **400 Bad Request** → Toast + form validation
- **409 Conflict** → Toast for duplicate/conflict errors

See [HARDENING_SUMMARY.md § RBAC & Security](./HARDENING_SUMMARY.md#2-rbac--error-handling-) for details.

---

## 🛠️ Commands Cheat Sheet

### Run Tests
```bash
npm run test:e2e                               # All tests
npm run test:e2e -- tests/e2e/domains.spec.ts # Single file
npm run test:e2e -- -g "create subdomain"     # Single test
npm run test:e2e -- --debug                   # Debug mode
npm run test:e2e -- --ui                      # Interactive UI
npm run test:e2e -- --headed                  # Show browser
```

### Development
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Check code style
npm run format     # Auto-format code
```

See [README_COMPLETE.md § Scripts](./README_COMPLETE.md#scripts) for all commands.

---

## 📚 Documentation Structure

### For Quick Testing
→ Start with [TEST_QUICK_START.sh](./TEST_QUICK_START.sh)

### For Flow Walkthroughs
→ Read [README_COMPLETE.md § Core Flows](./README_COMPLETE.md#core-flows)

### For Implementation Details
→ See [HARDENING_SUMMARY.md](./HARDENING_SUMMARY.md)

### For Architecture & Integration
→ See [README_COMPLETE.md § Architecture](./README_COMPLETE.md#architecture)

### For Troubleshooting
→ See [README_COMPLETE.md § Troubleshooting](./README_COMPLETE.md#troubleshooting)

---

## 👥 Test Users

Default credentials (seed these in your test DB):

```
TENANT_ADMIN
  Email: tenant-admin@test.example.com
  Password: Test123!@#
  Role: TENANT_ADMIN

TENANT_STAFF
  Email: tenant-staff@test.example.com
  Password: Test123!@#
  Role: TENANT_STAFF

PLATFORM_SUPERADMIN
  Email: platform-admin@test.example.com
  Password: Test123!@#
  Role: PLATFORM_SUPERADMIN
```

See [tests/helpers/auth.ts](./tests/helpers/auth.ts) for these credentials and utilities.

---

## 📋 What's Included

### ✅ Code Changes
- RBAC guards added to `/app/domains` and `/app/packages` routes
- All page components verified for correct endpoints and invalidation
- Shared UI components used consistently

### ✅ Test Implementation
- 4 complete Playwright test files
- Auth helper utilities
- Test user credentials and data generation
- Mock and error handling utilities

### ✅ Documentation
- Complete README with flow walkthroughs
- Hardening summary with all changes
- Completion checklist for sign-off
- This index document

### ✅ Ready for
- Local manual testing
- E2E automation validation
- Production deployment
- CI/CD integration

---

## 🚦 Next Steps

### 1. Seed Test Users
Add test users to your database with the credentials above.

### 2. Start Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 3. Manual Testing
Navigate to http://localhost:5173 and test the three flows.

### 4. Run E2E Tests
```bash
cd frontend && npm run test:e2e
```

### 5. Review Results
Check test output and screenshots/videos if failures occur.

### 6. Deploy
Once tests pass, deploy with confidence!

---

## 📞 Support Resources

### Within This Documentation
- Flow walkthroughs: [README_COMPLETE.md](./README_COMPLETE.md)
- Troubleshooting: [README_COMPLETE.md § Troubleshooting](./README_COMPLETE.md#troubleshooting)
- Commands: [TEST_QUICK_START.sh](./TEST_QUICK_START.sh)

### External References
- [React Query Docs](https://tanstack.com/query)
- [Playwright Docs](https://playwright.dev)
- [Material-UI Docs](https://mui.com)

---

## 📊 Status Summary

| Item | Status | Link |
|------|--------|------|
| Domain CRUD Flow | ✅ Complete | [Flow A](./README_COMPLETE.md#flow-a-tenant-domain-crud-pathsubdomain) |
| Custom Domain Flow | ✅ Complete | [Flow B](./README_COMPLETE.md#flow-b-custom-domain-request--verify--ssl) |
| Package Upgrade Flow | ✅ Complete | [Flow C](./README_COMPLETE.md#flow-c-package-upgrade-with-coupon) |
| RBAC & Guards | ✅ Complete | [RBAC Guide](./HARDENING_SUMMARY.md#2-rbac--error-handling-) |
| E2E Tests | ✅ Complete | [Test Guide](./README_COMPLETE.md#e2e-testing-playwright) |
| Documentation | ✅ Complete | [All Docs](./README_COMPLETE.md) |

---

**Ready for Testing & Deployment** ✅

*Last Updated: December 25, 2025*
