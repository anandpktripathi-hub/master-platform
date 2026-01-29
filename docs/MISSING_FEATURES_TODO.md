# Missing & Partial Features – Implementation TODO

This document tracks the missing / partial items identified for the platform and breaks them into concrete tasks.

## 1. Architecture & ERP Workspaces

- [x] Design ERP workspace model ✅ **COMPLETED**
  - [x] Decided to reuse existing tenant DB (tenant = workspace paradigm), avoiding large refactor.
  - [x] Defined workspace → tenant relationship: one workspace per tenant, with platform admins able to switch between all tenants.
  - [x] Implemented DB-backed `WorkspaceService` that derives workspaces from `User` and `Tenant` models (no separate schema needed).
  - [x] Aligned with existing `workspaces` controller/service and tenant onboarding flows.
  - [x] Created `WorkspaceGuard` to enforce workspace membership and propagate `tenantId`.
  - [x] Wired workspace selection into frontend (`WorkspaceSwitcher` in Navigation, persisted in localStorage).
  - [x] Refactored all ERP services (Accounting, HRM, Projects, POS, vCards) to use shared API client with workspace headers.

## 2. Accounting Module (Backend MVP)

- [x] Create `backend/src/modules/accounting` structure
  - [x] `accounting.module.ts`
  - [x] `accounting.controller.ts`
  - [x] `accounting.service.ts`
  - [x] `schemas` for `Account`, `Transaction`, `Invoice`
  - [x] `schemas` for `Bill`, `Goal` (optional v2 extension)
- [x] Implement tenant-aware CRUD endpoints
  - [x] Basic chart-of-accounts management per tenant.
  - [x] Record income/expense transactions.
  - [x] Simple invoice entity with status (draft/sent/paid/overdue/cancelled).
  - [x] Bill entity (optional) with status lifecycle.
- [x] Integrate with RBAC
  - [x] Define permissions for accounting (via `Account`, `Invoice`, `Expense`, `POS` modules in RBAC seed).
  - [x] Seed roles/permissions via RBAC module (including a `Tenant Admin` role with full ERP permissions).

## 2a. Accounting Module (Frontend MVP)

- [x] Create `frontend/src/services/accountingService.ts` for `/accounting` API calls.
- [x] Add `AccountingDashboard` page under `frontend/src/pages/AccountingDashboard.tsx`.
- [x] Wire route `/app/accounting` in `frontend/src/router.tsx` with proper guards (TENANT_ADMIN / PLATFORM_SUPERADMIN).
- [x] Expose Billing & Accounting links in main navigation so tenant admins can access them easily.
- [x] Add advanced accounting reports (P&L, balance sheet) and charts.

## 3. HRM Module (Backend MVP)

- [x] Create `backend/src/modules/hrm` structure
  - [x] Employees, attendance, leave, jobs, training schemas.
  - [x] HRM controller + service per tenant.
- [x] Implement basic flows
  - [x] Employee directory per tenant.
  - [x] Record daily attendance / status.
  - [x] Simple leave requests and status updates.
  - [x] Job postings list and creation.
  - [x] Training sessions list and creation.
- [x] Hook into dashboards via HRM summary endpoint used by frontend HRM dashboard.

## 3a. HRM Module (Frontend MVP)

- [x] Create `frontend/src/services/hrmService.ts` for `/hrm` API calls.
- [x] Add `HrmDashboard` page under `frontend/src/pages/HrmDashboard.tsx`.
- [x] Wire route `/app/hrm` in `frontend/src/router.tsx` with proper guards (TENANT_ADMIN / PLATFORM_SUPERADMIN).
- [x] Expose HRM link in main navigation so tenant admins can manage employees, attendance, jobs and trainings.

## 4. Projects Module (Backend MVP)

- [x] Create `backend/src/modules/projects`
  - [x] Project, Task, Timesheet schemas.
  - [x] Project controller + service with tenant scoping.
- [x] Implement basic flows
  - [x] Create/update projects.
  - [x] Attach tasks to projects, assign to users.
  - [x] Log time (timesheets) against tasks.

## 4a. Projects Module (Frontend MVP)

- [x] Create `frontend/src/services/projectsService.ts` for `/projects` API calls.
- [x] Add `ProjectsDashboard` page under `frontend/src/pages/ProjectsDashboard.tsx`.
- [x] Wire route `/app/projects` in `frontend/src/router.tsx` with proper guards (TENANT_ADMIN / PLATFORM_SUPERADMIN).
- [x] Expose Projects link in main navigation.

## 5. POS + Warehouse Module (Backend MVP)

- [x] Create `backend/src/modules/pos` (and/or `warehouse`)
  - [x] POSOrder, WarehouseStock, StockMovement schemas.
  - [x] Controllers/services for POS operations.
- [x] Implement minimal POS flows
  - [x] Record POS sale with line items referencing Products.
  - [x] Adjust warehouse stock on sale and stock movements.

## 5a. POS + Warehouse Module (Frontend MVP)

- [x] Create `frontend/src/services/posService.ts` for `/pos` and `/products` API calls.
- [x] Add `PosDashboard` page under `frontend/src/pages/PosDashboard.tsx`.
- [x] Wire route `/app/pos` in `frontend/src/router.tsx` with proper guards (TENANT_ADMIN / PLATFORM_SUPERADMIN).
- [x] Expose POS & Warehouse link in main navigation.

## 6. Dashboards – ERPGo-style KPIs ✅ **COMPLETED (Tenant + Admin Dashboards)**

- [x] Extend admin dashboard ✅ **COMPLETED (SaaS Super Admin Dashboard)**
  - [x] Global KPIs: total users, paid users, active tenants, total MRR/ARR (via SaaS overview analytics + PlatformOverviewDashboard).
  - [x] Most purchased plans, plan distribution (tenant planKey breakdown: FREE/PRO/ENTERPRISE).
  - [x] Orders & sales chart (last 30 days, daily series – replaces earlier "annual orders per month" idea).
- [x] Tenant dashboards ✅ **IMPLEMENTED**
  - [x] Main tenant dashboard now displays ERP KPIs:
    - [x] Accounting: Net Income (income - expense).
    - [x] HRM: Active Employees count.
    - [x] Projects: Active Projects count.
    - [x] POS: Total Sales amount.
  - [x] All ERP summary endpoints (`/accounting/summary`, `/hrm/summary`, `/projects/summary`, `/pos/summary`) integrated.
  - [x] Dashboard loads all KPIs in parallel with `Promise.allSettled` for fault tolerance.
  - [x] Advanced charts (income vs expense/net cashflow in accounting; HRM attendance overview area chart) implemented.

## 7. vCard-style Public Profiles

- [x] Design vCard data model
  - [x] Link to Tenant and optionally to a specific Contact/User.
  - [x] Fields: name, job title, company, phones, emails, social links, address, QR code data.
- [x] Add backend routes
  - [x] Public read-only endpoint: `/public/vcards/:id`.
  - [x] Tenant admin CRUD for vCards under `/vcards`.
- [x] Add frontend public page for vCard rendering and tenant manager.
  - [x] Public vCard view at `/vcard/:id`.
  - [x] Tenant vCard manager at `/app/vcards`.

## 8. Domain Reseller Integration (GoDaddy-like) ✅ **COMPLETED (Abstraction + Stub)**

- [x] Define abstraction for domain reseller providers ✅ **IMPLEMENTED**
  - [x] Interface: `DomainResellerProvider` with methods `search`, `purchase`, `ensureDns`.
  - [x] Defined typed interfaces: `DomainSearchResult`, `DomainPurchaseRequest`, `DomainPurchaseResult`, `DnsRecord`.
- [x] Initial stub implementation ✅ **IMPLEMENTED**
  - [x] Created `StubDomainResellerProvider` that simulates reseller responses (deterministic availability based on domain length).
  - [x] Created `DomainResellerService` that wraps the provider.
  - [x] Wired into `DomainsModule` and exported for use across app.
  - [x] Enhanced `/domains/availability` endpoint to also query reseller for full domains (with dot).
- [ ] Plan configuration (future production integration)
  - [ ] Reseller credentials storage (encrypted), per-tenant vs global (currently environment-based global credentials used for Cloudflare DNS).
  - [x] Mapping between reseller orders and tenant domains in DB (via `DomainResellerOrder` schema and `DomainResellerService`).
  - [ ] Real provider implementations: Cloudflare Registrar, AWS Route53 Domains (examples in deployment docs).

## 9. SSL & Subdomain Infrastructure Documentation ✅ **COMPLETED**

- [x] Document SSL responsibility split ✅ **DOCUMENTED**
  - [x] App-managed: custom-domain DNS verification + per-domain SSL issuance (already implemented in platform).
  - [x] Infra-managed: wildcard SSL for `*.yourdomain` covering all tenant subdomains.
- [x] Add deployment checklist updates ✅ **COMPREHENSIVE GUIDE ADDED**
  - [x] Detailed Nginx configuration for wildcard SSL with Cloudflare and AWS examples.
  - [x] Step-by-step wildcard SSL setup (Cloudflare + AWS ACM).
  - [x] Custom domain SSL automation workflow documented.
  - [x] Domain reseller integration examples (Cloudflare Registrar, AWS Route53).
  - [x] Production testing checklist for SSL and subdomains.
  - [x] Security best practices, rate limiting, logging, backup/recovery procedures.
  - [x] Troubleshooting guide for common SSL/domain issues.

---

## 10. Phase 2 – External Integrations & E2E Hardening (Planned)

The core multi-tenant ERP + SaaS platform is fully functional. The following items are **deployment-time or provider-specific integrations and hardening tasks** that should be completed when wiring the platform to real-world infrastructure and payment providers.

### 10.1 Payment Gateway – Real Provider Wiring

- [ ] Install Stripe/Razorpay SDKs in backend and frontend where required.
- [ ] Configure provider credentials via environment variables / secure secrets store (no hard-coded keys).
- [ ] Replace mock implementations in `PaymentService` with real Stripe/Razorpay calls (charge/create subscription/cancel/refund).
- [ ] Implement secure webhook handling in `PaymentWebhookController` including signature verification.
- [ ] Implement subscription renewal job (cron/queue-based) and retry logic for failed renewals.
- [ ] Add email/notification flows for payment failures, renewals, and plan changes.
- [ ] Implement plan-change proration logic (mid-cycle upgrades/downgrades).
- [ ] Add focused tests around payment flows (success, failure, webhooks, retries).

### 10.2 Domain Reseller – Production Credentials & Registrars

- [ ] Implement secure storage for reseller credentials (encrypted at rest), with clear separation between **global** credentials and potential **per-tenant** overrides.
- [ ] Add configuration surface (admin settings) to manage reseller provider selection and credentials without code changes.
- [ ] Implement concrete registrar providers (e.g., Cloudflare Registrar, AWS Route53 Domains) behind the existing `DomainResellerProvider` abstraction.
- [ ] Extend `DomainResellerService` to support purchase/transfer flows for real registrars using the new providers.
- [ ] Add monitoring and alerting hooks around registrar operations (failed purchases, DNS propagation issues).

### 10.3 Multi-Tenant Isolation – Automated E2E Tests

- [ ] Implement end-to-end tests that cover key scenarios from `docs/testing/DOMAIN-TESTING-GUIDE.md`:
  - [ ] Tenant subdomain resolution (`tenant1.localhost`, `tenant2.localhost`).
  - [ ] JWT + subdomain combinations to ensure JWT `tenantId` always wins over domain resolution.
  - [ ] Cross-tenant access attempts must be rejected at API and UI layers.
- [ ] Add E2E tests for landlord vs tenant vs custom-domain routing (different hostnames and paths).
- [ ] Integrate these E2E suites into CI so multi-tenant isolation is automatically validated on each release.

These Phase 2 tasks are **not blockers** for local development or initial test deployments, but they should be completed before scaling the platform to high-traffic, multi-region production environments with real money and registrar accounts.

## Summary of Recent Completions

### ✅ ERP Workspace Model (Section 1)
- **Backend:** `WorkspaceService` + `WorkspaceController` + `WorkspaceGuard` fully implemented and wired.
- **Frontend:** `WorkspaceSwitcher` in Navigation, workspace-aware API client with `x-workspace-id` header.
- **Integration:** All ERP modules (Accounting, HRM, Projects, POS, vCards) now workspace-scoped.

### ✅ Dashboard KPIs (Section 6)
- **Tenant Dashboard:** Extended to display Accounting, HRM, Projects, and POS KPIs alongside existing product/customer/order/team metrics.
- **API Integration:** Parallel loading of all summary endpoints with fault-tolerant error handling.

### ✅ Domain Reseller Abstraction (Section 8)
- **Service Layer:** `DomainResellerService` with provider interface.
- **Stub Implementation:** `StubDomainResellerProvider` for development/testing.
- **API Enhancement:** `/domains/availability` now returns both platform availability and reseller search results.

### ✅ SSL & Subdomain Infrastructure Documentation (Section 9)
- **Comprehensive Deployment Guide:** Added to `docs/ops/DEPLOYMENT.md` with:
  - Wildcard SSL setup (Cloudflare, AWS).
  - Custom domain SSL automation workflow.
  - Domain reseller integration patterns.
  - Production testing checklist.
  - Security, monitoring, backup, and troubleshooting sections.
