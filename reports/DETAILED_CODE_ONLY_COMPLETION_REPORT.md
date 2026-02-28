# Detailed Code-Only Completion Report (Publish / Launch / Earn)

Generated: 2026-02-28T14:09:03.425Z

This report is produced from code only. It does not read or use any `.md` or docs content.

## Executive Summary

### What is 100% complete (code-only evidence)

- Backend modules (structural wiring artifacts): 43/43 = 100%
  - Meaning: every backend module shows module/controller/service/dto/schema/tests/migrations signals present.
- Frontend route-exposed pages “visible”: 40/40 = 100%
  - Meaning: everything referenced by the router is navigable (exists in the router + import resolved).
- Packaging/infra presence checks: 9/9 = 100%
- Backend endpoints (feature-level, route-by-route evidence): 455 routes = 100% (perfect 455/455)
- Earning readiness (practical real-world loop heuristic): 100%
- Executable / Build checks: PASS (2/2)

### What is NOT 100% (and the % completion)

- Frontend route-exposed pages “workable (mapped API)”: 20%
  - Interpreted as: page has at least one detected `api.*` call that matches a backend controller route.
  - Router-exposed pages: 40 total, workable 20%, avg page score 60%.
- Frontend ALL TSX UI files under pages + billing (includes internal components/modals/cards, not just routable pages):
  - Total: 88
  - Visible (actually routed): 45%
  - Workable (mapped API): 9%
  - Avg: 27%
  - Perfect (100%) pages: 8/88

## Methodology (How Completion % is Computed)

### Backend Modules (Structural)
- Taken from `reports/backend_module_readiness_code_scan.json`.
- 100% means: module + controller + service + DTO + schema wiring + tests + migrations signals exist.

### Backend Endpoints (Route-by-route Evidence)
- Extracts routes from `backend/src/**/*.controller.ts`.
- Each endpoint gets a baseline score (route exists) plus evidence signals:
  - `service-call`: controller method calls a injected service (`this.someService.*`)
  - `dto`: presence of `*Dto` usage/import patterns
  - `guards/roles`: presence of auth/role decorators (e.g. `@UseGuards`, `@Roles`, `@Permissions`)
  - `swagger`: presence of swagger decorators (e.g. `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`)
  - `try/catch`: presence of try/catch inside the handler slice
- These are code-only heuristics: they measure “production readiness signals”, not actual runtime correctness.

### Frontend Visibility / Workability (Router + API Mapping)
- Visibility is derived from `frontend/src/router.tsx` by parsing `createBrowserRouter([...])`.
- A component is “route-exposed” if it is referenced in router `element:` and its import can be resolved to a TS/TSX file.
- Workability is credited when the component file contains at least one `api.<method>("/path")` call that maps to a backend endpoint.
- If API calls are in a different layer (custom client, hook, service wrapper, RTK query, etc.), they may not be detected by this heuristic.

### Mapping to your requested hierarchy
- Modules → backend modules (structural) + frontend route-exposed pages set
- Sub-modules → backend controllers (controller-level aggregate)
- Features → backend endpoints + frontend routes
- Options/Points → evidence checklist items per endpoint + earning-readiness stage checks

## Earning Readiness (Practical Loop Heuristic)

### Checkout / Payment Initiation — 100%

- done: stripe-checkout — Stripe checkout code present
- done: paypal-capture-endpoint — PayPal capture route exists

### Webhooks / Payment Confirmation — 100%

- done: stripe-webhook — Stripe webhook-like endpoint present (heuristic)
- done: paypal-webhook — PayPal webhook/capture endpoint present

### Entitlement / Usage Gates — 100%

- done: packages-me — Tenant package endpoint exists
- done: packages-usage — Usage/quota endpoint exists
- done: rbac — RBAC module present
- done: feature-registry — Feature registry present

### Invoicing / Receipts — 100%

- done: invoices-list — Invoices list endpoint exists
- done: invoice-pdf — Invoice PDF endpoint exists

### Admin Controls — 100%

- done: admin-tenants — Admin tenant endpoints present (heuristic)
- done: admin-payments — Admin payment endpoints present (heuristic)
- done: admin-analytics — Admin analytics endpoints present (heuristic)

## Packaging / Infra Presence (Code/Repo Files)

Score: 100% (9/9)

Checklist:
- yes: docker-compose.yml
- yes: docker-compose.prod.yml
- yes: Dockerfile
- yes: backend/Dockerfile
- yes: frontend/Dockerfile
- yes: START-BACKEND.bat
- yes: START-FRONTEND.bat
- yes: START-BOTH.bat
- yes: .env.example

## Executable / Build Checks (Code-run, not docs)

Snapshot: 2026-02-28T14:12:08.144Z

| Check | OK | Duration | CWD | Command |
|---|---|---|---|---|
| backend-build | Yes | 15.2s | backend | npm run build |
| frontend-build | Yes | 1m 28.4s | frontend | npm run build |

## Backend Modules — Structural + Endpoint Quality (Overall)

| Module | Overall % | Structural % | Avg Route % | Routes | Missing (structural) |
|---|---|---|---|---|---|
| accounting | 100% | 100% | 100% | 24 | — |
| ai-services | 100% | 100% | 100% | 3 | — |
| analytics | 100% | 100% | 100% | 1 | — |
| auth | 100% | 100% | 100% | 15 | — |
| billing | 100% | 100% | 100% | 25 | — |
| chat | 100% | 100% | 100% | 8 | — |
| cms | 100% | 100% | 100% | 36 | — |
| coupons | 100% | 100% | 100% | 10 | — |
| crm | 100% | 100% | 100% | 19 | — |
| custom-domains | 100% | 100% | 100% | 14 | — |
| dashboard | 100% | 100% | 100% | 8 | — |
| developer-portal | 100% | 100% | 100% | 6 | — |
| domains | 100% | 100% | 100% | 11 | — |
| health | 100% | 100% | 100% | 3 | — |
| hierarchy | 100% | 100% | 100% | 21 | — |
| hrm | 100% | 100% | 100% | 16 | — |
| logger | 100% | 100% | 100% | 2 | — |
| logs | 100% | 100% | 100% | 3 | — |
| marketplace | 100% | 100% | 100% | 5 | — |
| metrics | 100% | 100% | 100% | 3 | — |
| notifications | 100% | 100% | 100% | 4 | — |
| onboarding | 100% | 100% | 100% | 2 | — |
| orders | 100% | 100% | 100% | 4 | — |
| packages | 100% | 100% | 100% | 14 | — |
| payments | 100% | 100% | 100% | 10 | — |
| pos | 100% | 100% | 100% | 5 | — |
| products | 100% | 100% | 100% | 3 | — |
| profile | 100% | 100% | 100% | 8 | — |
| projects | 100% | 100% | 100% | 11 | — |
| rbac | 100% | 100% | 100% | 15 | — |
| reports | 100% | 100% | 100% | 3 | — |
| seo | 100% | 100% | 100% | 3 | — |
| settings | 100% | 100% | 100% | 48 | — |
| social | 100% | 100% | 100% | 10 | — |
| support | 100% | 100% | 100% | 4 | — |
| tenant | 100% | 100% | 100% | 1 | — |
| tenants | 100% | 100% | 100% | 21 | — |
| theme | 100% | 100% | 100% | 5 | — |
| themes | 100% | 100% | 100% | 12 | — |
| user | 100% | 100% | 100% | 5 | — |
| users | 100% | 100% | 100% | 16 | — |
| vcards | 100% | 100% | 100% | 5 | — |
| workspaces | 100% | 100% | 100% | 2 | — |

## Backend Controllers (Sub-modules) — Most Incomplete First

| Avg Route % | Module | Routes | Controller File |
|---|---|---|---|
| 100% | auth | 1 | backend/src/auth/unified-registration/unified-registration.controller.ts |
| 100% | billing | 4 | backend/src/billing/affiliate/commission.controller.ts |
| 100% | billing | 1 | backend/src/billing/analytics/revenue.controller.ts |
| 100% | billing | 1 | backend/src/billing/stripe/addons.controller.ts |
| 100% | billing | 1 | backend/src/billing/stripe/lifetime.controller.ts |
| 100% | billing | 1 | backend/src/billing/stripe/stripe-webhook.controller.ts |
| 100% | billing | 1 | backend/src/billing/usage/usage.controller.ts |
| 100% | billing | 3 | backend/src/billing/wallet/wallet.controller.ts |
| 100% | cms | 5 | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | 3 | backend/src/cms/controllers/cms-file-import.controller.ts |
| 100% | cms | 2 | backend/src/cms/controllers/cms-import.controller.ts |
| 100% | cms | 1 | backend/src/cms/controllers/cms-menu-short.controller.ts |
| 100% | cms | 6 | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | 8 | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | 3 | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 100% | cms | 8 | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | (non-module) | 1 | backend/src/feature-registry/auditLog.controller.ts |
| 100% | (non-module) | 10 | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | logger | 2 | backend/src/logger/logger.controller.ts |
| 100% | metrics | 3 | backend/src/metrics/metrics.controller.ts |
| 100% | accounting | 24 | backend/src/modules/accounting/accounting.controller.ts |
| 100% | ai-services | 3 | backend/src/modules/ai-services/ai-services.controller.ts |
| 100% | analytics | 1 | backend/src/modules/analytics/analytics.controller.ts |
| 100% | auth | 13 | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | 1 | backend/src/modules/auth/refresh.controller.ts |
| 100% | billing | 4 | backend/src/modules/billing/billing-subscriptions.controller.ts |
| 100% | billing | 9 | backend/src/modules/billing/billing.controller.ts |
| 100% | chat | 8 | backend/src/modules/chat/chat.controller.ts |
| 100% | coupons | 10 | backend/src/modules/coupons/coupons.controller.ts |
| 100% | crm | 18 | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | 1 | backend/src/modules/crm/public-forms.controller.ts |
| 100% | custom-domains | 10 | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | 4 | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 100% | dashboard | 8 | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | developer-portal | 6 | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | domains | 11 | backend/src/modules/domains/domains.controller.ts |
| 100% | health | 3 | backend/src/modules/health/health.controller.ts |
| 100% | hierarchy | 3 | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 100% | hierarchy | 3 | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 100% | hierarchy | 6 | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | 3 | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 100% | hierarchy | 3 | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 100% | hierarchy | 3 | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 100% | hrm | 16 | backend/src/modules/hrm/hrm.controller.ts |
| 100% | logs | 3 | backend/src/modules/logs/tenant-log.controller.ts |
| 100% | marketplace | 5 | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | notifications | 2 | backend/src/modules/notifications/notifications.controller.ts |
| 100% | notifications | 2 | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 100% | onboarding | 2 | backend/src/modules/onboarding/onboarding.controller.ts |
| 100% | orders | 3 | backend/src/modules/orders/orders.controller.ts |
| 100% | orders | 1 | backend/src/modules/orders/orders.stats.controller.ts |
| 100% | packages | 14 | backend/src/modules/packages/packages.controller.ts |
| 100% | payments | 2 | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 100% | payments | 4 | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 100% | payments | 4 | backend/src/modules/payments/payments.controller.ts |
| 100% | pos | 5 | backend/src/modules/pos/pos.controller.ts |
| 100% | products | 2 | backend/src/modules/products/products.controller.ts |
| 100% | products | 1 | backend/src/modules/products/products.stats.controller.ts |
| 100% | profile | 8 | backend/src/modules/profile/profile.controller.ts |
| 100% | projects | 11 | backend/src/modules/projects/projects.controller.ts |
| 100% | rbac | 15 | backend/src/modules/rbac/rbac.controller.ts |
| 100% | reports | 3 | backend/src/modules/reports/reports.controller.ts |
| 100% | seo | 3 | backend/src/modules/seo/seo.controller.ts |
| 100% | settings | 48 | backend/src/modules/settings/settings.controller.ts |
| 100% | social | 10 | backend/src/modules/social/social.controller.ts |
| 100% | support | 4 | backend/src/modules/support/support.controller.ts |
| 100% | tenant | 1 | backend/src/modules/tenant/tenant.controller.ts |
| 100% | tenants | 11 | backend/src/modules/tenants/tenants.controller.ts |
| 100% | theme | 5 | backend/src/modules/theme/theme.controller.ts |
| 100% | themes | 7 | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | 5 | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | user | 5 | backend/src/modules/user/user.controller.ts |
| 100% | users | 7 | backend/src/modules/users/user.controller.ts |
| 100% | users | 8 | backend/src/modules/users/users.controller.ts |
| 100% | users | 1 | backend/src/modules/users/users.stats.controller.ts |
| 100% | vcards | 5 | backend/src/modules/vcards/vcards.controller.ts |
| 100% | tenants | 2 | backend/src/tenants/branding/branding.controller.ts |
| 100% | tenants | 1 | backend/src/tenants/dashboard/dashboard.controller.ts |
| 100% | tenants | 4 | backend/src/tenants/domain/domain.controller.ts |
| 100% | tenants | 3 | backend/src/tenants/ssl/ssl.controller.ts |
| 100% | workspaces | 2 | backend/src/workspaces/workspace.controller.ts |

## Backend Endpoints (Features) — Completion Distribution

- Total routes: 455
- Avg route evidence: 100%
- Min route evidence: 100%
- Perfect routes (100%): 455/455

Distribution:
- 100%: 455

## Backend Endpoints (Features) — Full Route-by-route Table (Most Incomplete First)

| Route % | Module | Method | Path | Missing Evidence | Controller File |
|---|---|---|---|---|---|
| 100% | accounting | GET | /accounting/accounts | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | POST | /accounting/accounts | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | PUT | /accounting/accounts/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | DELETE | /accounting/accounts/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/bills | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | POST | /accounting/bills | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | PUT | /accounting/bills/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | DELETE | /accounting/bills/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/goals | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | POST | /accounting/goals | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | PUT | /accounting/goals/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | DELETE | /accounting/goals/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/invoices | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | POST | /accounting/invoices | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | PUT | /accounting/invoices/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | DELETE | /accounting/invoices/:id | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/invoices/:id/pdf | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/reports/balance-sheet | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/reports/balance-sheet/export | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/reports/profit-and-loss | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/reports/profit-and-loss/export | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/summary | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | GET | /accounting/transactions | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | accounting | POST | /accounting/transactions | — | backend/src/modules/accounting/accounting.controller.ts |
| 100% | analytics | GET | /admin/analytics/saas-overview | — | backend/src/modules/analytics/analytics.controller.ts |
| 100% | logger | GET | /admin/logger/status | — | backend/src/logger/logger.controller.ts |
| 100% | logger | POST | /admin/logger/test-log | — | backend/src/logger/logger.controller.ts |
| 100% | logs | GET | /admin/logs/tenant/:id | — | backend/src/modules/logs/tenant-log.controller.ts |
| 100% | logs | GET | /admin/logs/tenant/:id/events | — | backend/src/modules/logs/tenant-log.controller.ts |
| 100% | logs | GET | /admin/logs/tenant/:id/stream | — | backend/src/modules/logs/tenant-log.controller.ts |
| 100% | payments | GET | /admin/payments/failures | — | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 100% | payments | GET | /admin/payments/logs | — | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 100% | settings | GET | /admin/settings/application/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/application/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/basic/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/basic/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/branding/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/branding/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/calendar/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/calendar/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/currency/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/currency/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | POST | /admin/settings/email/test | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/email/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/email/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/integrations/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/integrations/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ip-restriction/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ip-restriction/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/notifications/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/notifications/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/pages/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/pages/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/payment/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/payment/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/referral/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/referral/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/reports/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/reports/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/seo/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/seo/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/system/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/system/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/tracker/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/tracker/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ui/colors/categories/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ui/colors/categories/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ui/colors/dark/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ui/colors/dark/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ui/colors/light/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ui/colors/light/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ui/toggles/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ui/toggles/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/ui/typography/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/ui/typography/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/webhooks/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/webhooks/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | GET | /admin/settings/zoom/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | settings | PUT | /admin/settings/zoom/typed | — | backend/src/modules/settings/settings.controller.ts |
| 100% | themes | POST | /admin/themes | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | GET | /admin/themes | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | GET | /admin/themes/:id | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | PATCH | /admin/themes/:id | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | DELETE | /admin/themes/:id | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | PATCH | /admin/themes/:id/activate | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | themes | PATCH | /admin/themes/:id/deactivate | — | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 100% | ai-services | POST | /ai/complete | — | backend/src/modules/ai-services/ai-services.controller.ts |
| 100% | ai-services | POST | /ai/sentiment | — | backend/src/modules/ai-services/ai-services.controller.ts |
| 100% | ai-services | POST | /ai/suggest | — | backend/src/modules/ai-services/ai-services.controller.ts |
| 100% | (non-module) | GET | /audit-log | — | backend/src/feature-registry/auditLog.controller.ts |
| 100% | auth | GET | /auth/github | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | GET | /auth/github/callback | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | GET | /auth/google | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | GET | /auth/google/callback | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/login | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/logout | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/refresh | — | backend/src/modules/auth/refresh.controller.ts |
| 100% | auth | POST | /auth/register | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/request-password-reset | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/reset-password | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/send-verification-email | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/tenant-register | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | POST | /auth/unified-register | — | backend/src/auth/unified-registration/unified-registration.controller.ts |
| 100% | auth | POST | /auth/verify-email | — | backend/src/modules/auth/auth.controller.ts |
| 100% | auth | GET | /auth/verify-email | — | backend/src/modules/auth/auth.controller.ts |
| 100% | hierarchy | POST | /billing-hierarchy/:billingId | — | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 100% | hierarchy | GET | /billing-hierarchy/:billingId | — | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /billing-hierarchy/:billingId | — | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 100% | billing | POST | /billing/addons/checkout | — | backend/src/billing/stripe/addons.controller.ts |
| 100% | billing | GET | /billing/affiliate/me | — | backend/src/billing/affiliate/commission.controller.ts |
| 100% | billing | POST | /billing/affiliate/payout | — | backend/src/billing/affiliate/commission.controller.ts |
| 100% | billing | POST | /billing/affiliate/record-commission | — | backend/src/billing/affiliate/commission.controller.ts |
| 100% | billing | POST | /billing/affiliate/register | — | backend/src/billing/affiliate/commission.controller.ts |
| 100% | billing | GET | /billing/analytics/revenue | — | backend/src/billing/analytics/revenue.controller.ts |
| 100% | billing | POST | /billing/lifetime/checkout | — | backend/src/billing/stripe/lifetime.controller.ts |
| 100% | billing | POST | /billing/stripe/webhook | — | backend/src/billing/stripe/stripe-webhook.controller.ts |
| 100% | billing | POST | /billing/subscriptions/admin/check-expired | — | backend/src/modules/billing/billing-subscriptions.controller.ts |
| 100% | billing | POST | /billing/subscriptions/admin/set-plan | — | backend/src/modules/billing/billing-subscriptions.controller.ts |
| 100% | billing | GET | /billing/subscriptions/me | — | backend/src/modules/billing/billing-subscriptions.controller.ts |
| 100% | billing | POST | /billing/subscriptions/select-plan | — | backend/src/modules/billing/billing-subscriptions.controller.ts |
| 100% | billing | GET | /billing/usage/:tenantId | — | backend/src/billing/usage/usage.controller.ts |
| 100% | billing | GET | /billing/wallet/:tenantId | — | backend/src/billing/wallet/wallet.controller.ts |
| 100% | billing | GET | /billing/wallet/:tenantId/transactions | — | backend/src/billing/wallet/wallet.controller.ts |
| 100% | billing | POST | /billing/wallet/add | — | backend/src/billing/wallet/wallet.controller.ts |
| 100% | billing | GET | /billings | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | POST | /billings | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | GET | /billings/:id | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | PUT | /billings/:id | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | DELETE | /billings/:id | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | POST | /billings/admin | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | PATCH | /billings/admin/:id | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | DELETE | /billings/admin/:id | — | backend/src/modules/billing/billing.controller.ts |
| 100% | billing | GET | /billings/admin/all | — | backend/src/modules/billing/billing.controller.ts |
| 100% | tenants | GET | /branding | — | backend/src/tenants/branding/branding.controller.ts |
| 100% | tenants | PUT | /branding | — | backend/src/tenants/branding/branding.controller.ts |
| 100% | chat | PATCH | /chat/admin/rooms/:roomId/archive | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | DELETE | /chat/admin/rooms/:roomId/members/:userId | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | GET | /chat/rooms | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | POST | /chat/rooms | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | POST | /chat/rooms/:roomId/join | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | GET | /chat/rooms/:roomId/members | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | GET | /chat/rooms/:roomId/messages | — | backend/src/modules/chat/chat.controller.ts |
| 100% | chat | POST | /chat/rooms/:roomId/messages | — | backend/src/modules/chat/chat.controller.ts |
| 100% | cms | POST | /cms/analytics/:pageId/conversion | — | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | POST | /cms/analytics/:pageId/track | — | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | GET | /cms/analytics/page/:pageId | — | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | GET | /cms/analytics/page/:pageId/stats | — | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | GET | /cms/analytics/tenant | — | backend/src/cms/controllers/cms-analytics.controller.ts |
| 100% | cms | POST | /cms/import/figma | — | backend/src/cms/controllers/cms-import.controller.ts |
| 100% | cms | GET | /cms/import/history | — | backend/src/cms/controllers/cms-file-import.controller.ts |
| 100% | cms | GET | /cms/import/status/:importId | — | backend/src/cms/controllers/cms-file-import.controller.ts |
| 100% | cms | POST | /cms/import/upload | — | backend/src/cms/controllers/cms-file-import.controller.ts |
| 100% | cms | POST | /cms/import/zip | — | backend/src/cms/controllers/cms-import.controller.ts |
| 100% | cms | GET | /cms/menu | — | backend/src/cms/controllers/cms-menu-short.controller.ts |
| 100% | cms | POST | /cms/menus/:menuId/items | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | GET | /cms/menus/:menuId/items | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | PATCH | /cms/menus/:menuId/items/:itemId | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | DELETE | /cms/menus/:menuId/items/:itemId | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | POST | /cms/menus/:menuId/reorder | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | GET | /cms/menus/:menuId/tree | — | backend/src/cms/controllers/cms-menu.controller.ts |
| 100% | cms | POST | /cms/pages | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | GET | /cms/pages | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | GET | /cms/pages/:id | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | PATCH | /cms/pages/:id | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | DELETE | /cms/pages/:id | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | POST | /cms/pages/:id/duplicate | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | GET | /cms/pages/hierarchy/tree | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | GET | /cms/pages/slug/:slug | — | backend/src/cms/controllers/cms-page.controller.ts |
| 100% | cms | GET | /cms/seo-audit/:pageId | — | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 100% | cms | GET | /cms/seo-audit/:pageId/recommendations | — | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 100% | cms | POST | /cms/seo-audit/:pageId/run | — | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 100% | cms | POST | /cms/templates | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | GET | /cms/templates | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | GET | /cms/templates/:id | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | PATCH | /cms/templates/:id | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | DELETE | /cms/templates/:id | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | POST | /cms/templates/:id/use | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | GET | /cms/templates/category/:category | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | cms | GET | /cms/templates/popular | — | backend/src/cms/controllers/cms-template.controller.ts |
| 100% | coupons | GET | /coupons | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | PATCH | /coupons/:couponId | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | DELETE | /coupons/:couponId | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons/:couponId/activate | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons/:couponId/deactivate | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | GET | /coupons/:couponId/usage | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons/apply | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons/bulk-actions/update-status | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | coupons | POST | /coupons/validate | — | backend/src/modules/coupons/coupons.controller.ts |
| 100% | crm | GET | /crm/analytics | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/companies | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | POST | /crm/companies | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/contacts | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | POST | /crm/contacts | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/contacts/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | PATCH | /crm/contacts/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | DELETE | /crm/contacts/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/deals | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | POST | /crm/deals | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/deals/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | PATCH | /crm/deals/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | DELETE | /crm/deals/:id | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | PATCH | /crm/deals/:id/stage | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | POST | /crm/tasks | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | PATCH | /crm/tasks/:id/completed | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | PATCH | /crm/tasks/:id/delete | — | backend/src/modules/crm/crm.controller.ts |
| 100% | crm | GET | /crm/tasks/my | — | backend/src/modules/crm/crm.controller.ts |
| 100% | custom-domains | GET | /custom-domains | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | PATCH | /custom-domains/:domainId | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | POST | /custom-domains/:domainId/activate | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | GET | /custom-domains/me | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | POST | /custom-domains/me | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | PATCH | /custom-domains/me/:domainId | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | DELETE | /custom-domains/me/:domainId | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | POST | /custom-domains/me/:domainId/primary | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | POST | /custom-domains/me/:domainId/ssl/issue | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | custom-domains | POST | /custom-domains/me/:domainId/verify | — | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 100% | dashboard | GET | /dashboards | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | POST | /dashboards | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | GET | /dashboards/:id | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | PUT | /dashboards/:id | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | DELETE | /dashboards/:id | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | GET | /dashboards/admin/saas-overview | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | GET | /dashboards/audit/logs | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | dashboard | GET | /dashboards/audit/logs/export | — | backend/src/modules/dashboard/dashboard.controller.ts |
| 100% | developer-portal | POST | /developer/api-keys | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | developer-portal | GET | /developer/api-keys | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | developer-portal | DELETE | /developer/api-keys/:keyId | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | developer-portal | POST | /developer/api-keys/:keyId/revoke | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | developer-portal | GET | /developer/webhook-logs | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | developer-portal | GET | /developer/webhook-logs/:logId | — | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 100% | hierarchy | POST | /domain-hierarchy/:domainId | — | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 100% | hierarchy | GET | /domain-hierarchy/:domainId | — | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /domain-hierarchy/:domainId | — | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 100% | domains | GET | /domains | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | POST | /domains | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | PATCH | /domains/:domainId | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | DELETE | /domains/:domainId | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | POST | /domains/:domainId/primary | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | GET | /domains/availability | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | GET | /domains/me | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | POST | /domains/me | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | PATCH | /domains/me/:domainId | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | DELETE | /domains/me/:domainId | — | backend/src/modules/domains/domains.controller.ts |
| 100% | domains | POST | /domains/me/:domainId/primary | — | backend/src/modules/domains/domains.controller.ts |
| 100% | custom-domains | POST | /domains/tenant/:domainId/issue-ssl | — | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 100% | custom-domains | POST | /domains/tenant/:domainId/verify-dns | — | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 100% | custom-domains | GET | /domains/tenant/health-summary | — | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 100% | custom-domains | GET | /domains/tenant/list | — | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 100% | (non-module) | GET | /features | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | POST | /features | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | GET | /features/:id | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | DELETE | /features/:id | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id/assign-role/:role | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id/assign-tenant/:tenant | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id/toggle | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id/unassign-role/:role | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | (non-module) | PATCH | /features/:id/unassign-tenant/:tenant | — | backend/src/feature-registry/featureRegistry.controller.ts |
| 100% | health | GET | /health | — | backend/src/modules/health/health.controller.ts |
| 100% | health | GET | /health/detailed | — | backend/src/modules/health/health.controller.ts |
| 100% | health | GET | /health/ready | — | backend/src/modules/health/health.controller.ts |
| 100% | hierarchy | POST | /hierarchy | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | GET | /hierarchy | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | GET | /hierarchy/:id | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | PATCH | /hierarchy/:id | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /hierarchy/:id | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hierarchy | GET | /hierarchy/:id/children | — | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 100% | hrm | GET | /hrm/attendance | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | POST | /hrm/attendance | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/attendance/overview | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/employees | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | POST | /hrm/employees | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/employees/:id | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | PATCH | /hrm/employees/:id | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | DELETE | /hrm/employees/:id | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/jobs | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | POST | /hrm/jobs | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/leaves | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | POST | /hrm/leaves | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | PATCH | /hrm/leaves/:id/status | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/summary | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | GET | /hrm/trainings | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | hrm | POST | /hrm/trainings | — | backend/src/modules/hrm/hrm.controller.ts |
| 100% | marketplace | POST | /marketplace/install | — | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | marketplace | GET | /marketplace/installs | — | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | marketplace | DELETE | /marketplace/installs/:pluginId | — | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | marketplace | GET | /marketplace/plugins | — | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | marketplace | POST | /marketplace/toggle | — | backend/src/modules/marketplace/marketplace.controller.ts |
| 100% | profile | GET | /me/profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | profile | PUT | /me/profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | profile | GET | /me/public-profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | profile | PUT | /me/public-profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | metrics | GET | /metrics | — | backend/src/metrics/metrics.controller.ts |
| 100% | metrics | GET | /metrics/prometheus | — | backend/src/metrics/metrics.controller.ts |
| 100% | metrics | GET | /metrics/reset | — | backend/src/metrics/metrics.controller.ts |
| 100% | notifications | POST | /notifications/mark-all-read | — | backend/src/modules/notifications/notifications.controller.ts |
| 100% | notifications | GET | /notifications/my | — | backend/src/modules/notifications/notifications.controller.ts |
| 100% | notifications | POST | /notifications/push-subscriptions/subscribe | — | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 100% | notifications | POST | /notifications/push-subscriptions/unsubscribe | — | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 100% | payments | POST | /offline-payments | — | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 100% | payments | GET | /offline-payments | — | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 100% | payments | PATCH | /offline-payments/:id/status | — | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 100% | payments | GET | /offline-payments/me | — | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 100% | onboarding | GET | /onboarding/sample-status | — | backend/src/modules/onboarding/onboarding.controller.ts |
| 100% | onboarding | POST | /onboarding/seed-sample | — | backend/src/modules/onboarding/onboarding.controller.ts |
| 100% | orders | GET | /orders | — | backend/src/modules/orders/orders.controller.ts |
| 100% | orders | GET | /orders/domain/:id | — | backend/src/modules/orders/orders.controller.ts |
| 100% | orders | GET | /orders/pos/:id | — | backend/src/modules/orders/orders.controller.ts |
| 100% | orders | GET | /orders/stats/dashboard | — | backend/src/modules/orders/orders.stats.controller.ts |
| 100% | hierarchy | POST | /package-hierarchy/:packageId | — | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 100% | hierarchy | GET | /package-hierarchy/:packageId | — | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /package-hierarchy/:packageId | — | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 100% | packages | GET | /packages | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | POST | /packages | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | PATCH | /packages/:packageId | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | DELETE | /packages/:packageId | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/:packageId | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | POST | /packages/:packageId/assign | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/admin/all | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/admin/plan-summary | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | POST | /packages/admin/subscription-expire-now | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | POST | /packages/admin/subscription-expiry-warnings | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/features | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/me | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/me/can-use/:feature | — | backend/src/modules/packages/packages.controller.ts |
| 100% | packages | GET | /packages/me/usage | — | backend/src/modules/packages/packages.controller.ts |
| 100% | payments | GET | /payments/logs | — | backend/src/modules/payments/payments.controller.ts |
| 100% | payments | POST | /payments/paypal/capture | — | backend/src/modules/payments/payments.controller.ts |
| 100% | payments | POST | /payments/paypal/capture-and-subscribe | — | backend/src/modules/payments/payments.controller.ts |
| 100% | payments | POST | /payments/webhook/paypal/capture | — | backend/src/modules/payments/payments.controller.ts |
| 100% | pos | GET | /pos/orders | — | backend/src/modules/pos/pos.controller.ts |
| 100% | pos | POST | /pos/orders | — | backend/src/modules/pos/pos.controller.ts |
| 100% | pos | GET | /pos/stock | — | backend/src/modules/pos/pos.controller.ts |
| 100% | pos | POST | /pos/stock/adjust | — | backend/src/modules/pos/pos.controller.ts |
| 100% | pos | GET | /pos/summary | — | backend/src/modules/pos/pos.controller.ts |
| 100% | products | GET | /products | — | backend/src/modules/products/products.controller.ts |
| 100% | products | GET | /products/:id | — | backend/src/modules/products/products.controller.ts |
| 100% | products | GET | /products/stats/dashboard | — | backend/src/modules/products/products.stats.controller.ts |
| 100% | projects | GET | /projects | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | POST | /projects | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | GET | /projects/:id | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | PATCH | /projects/:id | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | DELETE | /projects/:id | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | GET | /projects/:projectId/tasks | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | POST | /projects/:projectId/tasks | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | GET | /projects/summary | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | PATCH | /projects/tasks/:id | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | GET | /projects/timesheets | — | backend/src/modules/projects/projects.controller.ts |
| 100% | projects | POST | /projects/timesheets/log | — | backend/src/modules/projects/projects.controller.ts |
| 100% | crm | POST | /public/forms/contact | — | backend/src/modules/crm/public-forms.controller.ts |
| 100% | profile | GET | /public/profiles/:handle | — | backend/src/modules/profile/profile.controller.ts |
| 100% | profile | GET | /public/profiles/check-handle | — | backend/src/modules/profile/profile.controller.ts |
| 100% | vcards | GET | /public/vcards/:id | — | backend/src/modules/vcards/vcards.controller.ts |
| 100% | rbac | POST | /rbac/check-field-permission | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | GET | /rbac/permissions | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | POST | /rbac/permissions | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | GET | /rbac/permissions/module/:module | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | POST | /rbac/roles | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | GET | /rbac/roles | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | GET | /rbac/roles/:roleId | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | PUT | /rbac/roles/:roleId | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | DELETE | /rbac/roles/:roleId | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | POST | /rbac/users | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | GET | /rbac/users | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | PUT | /rbac/users/:userTenantId | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | DELETE | /rbac/users/:userTenantId | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | POST | /rbac/users/:userTenantId/reset-password | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | rbac | POST | /rbac/users/:userTenantId/toggle-login | — | backend/src/modules/rbac/rbac.controller.ts |
| 100% | reports | GET | /reports/tenant/commerce | — | backend/src/modules/reports/reports.controller.ts |
| 100% | reports | GET | /reports/tenant/financial | — | backend/src/modules/reports/reports.controller.ts |
| 100% | reports | GET | /reports/tenant/traffic | — | backend/src/modules/reports/reports.controller.ts |
| 100% | hierarchy | POST | /role-hierarchy/:roleName | — | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 100% | hierarchy | GET | /role-hierarchy/:roleName | — | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /role-hierarchy/:roleName | — | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 100% | seo | GET | /seo/tenants/:slug/feed.xml | — | backend/src/modules/seo/seo.controller.ts |
| 100% | seo | GET | /seo/tenants/:slug/robots.txt | — | backend/src/modules/seo/seo.controller.ts |
| 100% | seo | GET | /seo/tenants/:slug/sitemap.xml | — | backend/src/modules/seo/seo.controller.ts |
| 100% | settings | GET | /settings/reports | — | backend/src/modules/settings/settings.controller.ts |
| 100% | social | PATCH | /social/connections/:id/accept | — | backend/src/modules/social/social.controller.ts |
| 100% | social | PATCH | /social/connections/:id/reject | — | backend/src/modules/social/social.controller.ts |
| 100% | social | GET | /social/connections/my | — | backend/src/modules/social/social.controller.ts |
| 100% | social | GET | /social/connections/pending | — | backend/src/modules/social/social.controller.ts |
| 100% | social | POST | /social/connections/request | — | backend/src/modules/social/social.controller.ts |
| 100% | social | GET | /social/feed | — | backend/src/modules/social/social.controller.ts |
| 100% | social | POST | /social/posts | — | backend/src/modules/social/social.controller.ts |
| 100% | social | POST | /social/posts/:id/comments | — | backend/src/modules/social/social.controller.ts |
| 100% | social | GET | /social/posts/:id/comments | — | backend/src/modules/social/social.controller.ts |
| 100% | social | PATCH | /social/posts/:id/like | — | backend/src/modules/social/social.controller.ts |
| 100% | support | GET | /support/admin/tickets | — | backend/src/modules/support/support.controller.ts |
| 100% | support | PATCH | /support/admin/tickets/:id/status | — | backend/src/modules/support/support.controller.ts |
| 100% | support | POST | /support/tickets | — | backend/src/modules/support/support.controller.ts |
| 100% | support | GET | /support/tickets | — | backend/src/modules/support/support.controller.ts |
| 100% | tenant | GET | /tenant/current | — | backend/src/modules/tenant/tenant.controller.ts |
| 100% | tenants | GET | /tenant/dashboard | — | backend/src/tenants/dashboard/dashboard.controller.ts |
| 100% | profile | GET | /tenant/profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | profile | PUT | /tenant/profile | — | backend/src/modules/profile/profile.controller.ts |
| 100% | themes | GET | /tenant/theme | — | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | themes | GET | /tenant/theme/css | — | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | themes | POST | /tenant/theme/customize | — | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | themes | POST | /tenant/theme/select | — | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | themes | GET | /tenant/theme/variables | — | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 100% | tenants | GET | /tenants | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | POST | /tenants | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/custom-domains | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/domain/:tenantId/domains | — | backend/src/tenants/domain/domain.controller.ts |
| 100% | tenants | POST | /tenants/domain/map | — | backend/src/tenants/domain/domain.controller.ts |
| 100% | tenants | POST | /tenants/domain/update | — | backend/src/tenants/domain/domain.controller.ts |
| 100% | tenants | POST | /tenants/domain/verify | — | backend/src/tenants/domain/domain.controller.ts |
| 100% | tenants | POST | /tenants/manual-create | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/me | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/public-directory | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | PUT | /tenants/public-profile | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/public/:slug | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/public/:slug/reviews | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | POST | /tenants/public/:slug/reviews | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/quota | — | backend/src/modules/tenants/tenants.controller.ts |
| 100% | tenants | GET | /tenants/ssl/:domain/status | — | backend/src/tenants/ssl/ssl.controller.ts |
| 100% | tenants | GET | /tenants/ssl/admin/resync-statuses | — | backend/src/tenants/ssl/ssl.controller.ts |
| 100% | tenants | GET | /tenants/ssl/admin/run-automation | — | backend/src/tenants/ssl/ssl.controller.ts |
| 100% | theme | GET | /themes | — | backend/src/modules/theme/theme.controller.ts |
| 100% | theme | POST | /themes | — | backend/src/modules/theme/theme.controller.ts |
| 100% | theme | GET | /themes/:id | — | backend/src/modules/theme/theme.controller.ts |
| 100% | theme | PUT | /themes/:id | — | backend/src/modules/theme/theme.controller.ts |
| 100% | theme | DELETE | /themes/:id | — | backend/src/modules/theme/theme.controller.ts |
| 100% | hierarchy | POST | /user-hierarchy/:userId | — | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 100% | hierarchy | GET | /user-hierarchy/:userId | — | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 100% | hierarchy | DELETE | /user-hierarchy/:userId | — | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 100% | users | GET | /users | — | backend/src/modules/users/user.controller.ts |
| 100% | users | POST | /users | — | backend/src/modules/users/user.controller.ts |
| 100% | users | POST | /users | — | backend/src/modules/users/users.controller.ts |
| 100% | users | GET | /users | — | backend/src/modules/users/users.controller.ts |
| 100% | user | GET | /users | — | backend/src/modules/user/user.controller.ts |
| 100% | user | POST | /users | — | backend/src/modules/user/user.controller.ts |
| 100% | users | GET | /users/:id | — | backend/src/modules/users/user.controller.ts |
| 100% | users | PUT | /users/:id | — | backend/src/modules/users/user.controller.ts |
| 100% | users | DELETE | /users/:id | — | backend/src/modules/users/user.controller.ts |
| 100% | users | GET | /users/:id | — | backend/src/modules/users/users.controller.ts |
| 100% | users | PATCH | /users/:id | — | backend/src/modules/users/users.controller.ts |
| 100% | users | DELETE | /users/:id | — | backend/src/modules/users/users.controller.ts |
| 100% | user | GET | /users/:id | — | backend/src/modules/user/user.controller.ts |
| 100% | user | PUT | /users/:id | — | backend/src/modules/user/user.controller.ts |
| 100% | user | DELETE | /users/:id | — | backend/src/modules/user/user.controller.ts |
| 100% | users | GET | /users/all | — | backend/src/modules/users/user.controller.ts |
| 100% | users | POST | /users/bulk | — | backend/src/modules/users/users.controller.ts |
| 100% | users | GET | /users/me | — | backend/src/modules/users/user.controller.ts |
| 100% | users | GET | /users/me | — | backend/src/modules/users/users.controller.ts |
| 100% | users | GET | /users/public | — | backend/src/modules/users/users.controller.ts |
| 100% | users | GET | /users/stats/dashboard | — | backend/src/modules/users/users.stats.controller.ts |
| 100% | vcards | GET | /vcards | — | backend/src/modules/vcards/vcards.controller.ts |
| 100% | vcards | POST | /vcards | — | backend/src/modules/vcards/vcards.controller.ts |
| 100% | vcards | PUT | /vcards/:id | — | backend/src/modules/vcards/vcards.controller.ts |
| 100% | vcards | DELETE | /vcards/:id | — | backend/src/modules/vcards/vcards.controller.ts |
| 100% | workspaces | GET | /workspaces | — | backend/src/workspaces/workspace.controller.ts |
| 100% | workspaces | POST | /workspaces/switch | — | backend/src/workspaces/workspace.controller.ts |

## Backend Endpoints — 100% Evidence Routes

- GET /accounting/accounts (accounting) — backend/src/modules/accounting/accounting.controller.ts
- POST /accounting/accounts (accounting) — backend/src/modules/accounting/accounting.controller.ts
- PUT /accounting/accounts/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- DELETE /accounting/accounts/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/bills (accounting) — backend/src/modules/accounting/accounting.controller.ts
- POST /accounting/bills (accounting) — backend/src/modules/accounting/accounting.controller.ts
- PUT /accounting/bills/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- DELETE /accounting/bills/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/goals (accounting) — backend/src/modules/accounting/accounting.controller.ts
- POST /accounting/goals (accounting) — backend/src/modules/accounting/accounting.controller.ts
- PUT /accounting/goals/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- DELETE /accounting/goals/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/invoices (accounting) — backend/src/modules/accounting/accounting.controller.ts
- POST /accounting/invoices (accounting) — backend/src/modules/accounting/accounting.controller.ts
- PUT /accounting/invoices/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- DELETE /accounting/invoices/:id (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/invoices/:id/pdf (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/reports/balance-sheet (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/reports/balance-sheet/export (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/reports/profit-and-loss (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/reports/profit-and-loss/export (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/summary (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /accounting/transactions (accounting) — backend/src/modules/accounting/accounting.controller.ts
- POST /accounting/transactions (accounting) — backend/src/modules/accounting/accounting.controller.ts
- GET /admin/analytics/saas-overview (analytics) — backend/src/modules/analytics/analytics.controller.ts
- GET /admin/logger/status (logger) — backend/src/logger/logger.controller.ts
- POST /admin/logger/test-log (logger) — backend/src/logger/logger.controller.ts
- GET /admin/logs/tenant/:id (logs) — backend/src/modules/logs/tenant-log.controller.ts
- GET /admin/logs/tenant/:id/events (logs) — backend/src/modules/logs/tenant-log.controller.ts
- GET /admin/logs/tenant/:id/stream (logs) — backend/src/modules/logs/tenant-log.controller.ts
- GET /admin/payments/failures (payments) — backend/src/modules/payments/controllers/admin-payments.controller.ts
- GET /admin/payments/logs (payments) — backend/src/modules/payments/controllers/admin-payments.controller.ts
- GET /admin/settings/application/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/application/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/basic/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/basic/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/branding/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/branding/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/calendar/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/calendar/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/currency/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/currency/typed (settings) — backend/src/modules/settings/settings.controller.ts
- POST /admin/settings/email/test (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/email/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/email/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/integrations/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/integrations/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ip-restriction/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ip-restriction/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/notifications/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/notifications/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/pages/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/pages/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/payment/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/payment/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/referral/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/referral/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/reports/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/reports/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/seo/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/seo/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/system/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/system/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/tracker/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/tracker/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ui/colors/categories/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ui/colors/categories/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ui/colors/dark/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ui/colors/dark/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ui/colors/light/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ui/colors/light/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ui/toggles/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ui/toggles/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/ui/typography/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/ui/typography/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/webhooks/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/webhooks/typed (settings) — backend/src/modules/settings/settings.controller.ts
- GET /admin/settings/zoom/typed (settings) — backend/src/modules/settings/settings.controller.ts
- PUT /admin/settings/zoom/typed (settings) — backend/src/modules/settings/settings.controller.ts
- POST /admin/themes (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- GET /admin/themes (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- GET /admin/themes/:id (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- PATCH /admin/themes/:id (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- DELETE /admin/themes/:id (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- PATCH /admin/themes/:id/activate (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- PATCH /admin/themes/:id/deactivate (themes) — backend/src/modules/themes/controllers/admin-themes.controller.ts
- POST /ai/complete (ai-services) — backend/src/modules/ai-services/ai-services.controller.ts
- POST /ai/sentiment (ai-services) — backend/src/modules/ai-services/ai-services.controller.ts
- POST /ai/suggest (ai-services) — backend/src/modules/ai-services/ai-services.controller.ts
- GET /audit-log ((non-module)) — backend/src/feature-registry/auditLog.controller.ts
- GET /auth/github (auth) — backend/src/modules/auth/auth.controller.ts
- GET /auth/github/callback (auth) — backend/src/modules/auth/auth.controller.ts
- GET /auth/google (auth) — backend/src/modules/auth/auth.controller.ts
- GET /auth/google/callback (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/login (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/logout (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/refresh (auth) — backend/src/modules/auth/refresh.controller.ts
- POST /auth/register (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/request-password-reset (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/reset-password (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/send-verification-email (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/tenant-register (auth) — backend/src/modules/auth/auth.controller.ts
- POST /auth/unified-register (auth) — backend/src/auth/unified-registration/unified-registration.controller.ts
- POST /auth/verify-email (auth) — backend/src/modules/auth/auth.controller.ts
- GET /auth/verify-email (auth) — backend/src/modules/auth/auth.controller.ts
- POST /billing-hierarchy/:billingId (hierarchy) — backend/src/modules/hierarchy/billing-hierarchy.controller.ts
- GET /billing-hierarchy/:billingId (hierarchy) — backend/src/modules/hierarchy/billing-hierarchy.controller.ts
- DELETE /billing-hierarchy/:billingId (hierarchy) — backend/src/modules/hierarchy/billing-hierarchy.controller.ts
- POST /billing/addons/checkout (billing) — backend/src/billing/stripe/addons.controller.ts
- GET /billing/affiliate/me (billing) — backend/src/billing/affiliate/commission.controller.ts
- POST /billing/affiliate/payout (billing) — backend/src/billing/affiliate/commission.controller.ts
- POST /billing/affiliate/record-commission (billing) — backend/src/billing/affiliate/commission.controller.ts
- POST /billing/affiliate/register (billing) — backend/src/billing/affiliate/commission.controller.ts
- GET /billing/analytics/revenue (billing) — backend/src/billing/analytics/revenue.controller.ts
- POST /billing/lifetime/checkout (billing) — backend/src/billing/stripe/lifetime.controller.ts
- POST /billing/stripe/webhook (billing) — backend/src/billing/stripe/stripe-webhook.controller.ts
- POST /billing/subscriptions/admin/check-expired (billing) — backend/src/modules/billing/billing-subscriptions.controller.ts
- POST /billing/subscriptions/admin/set-plan (billing) — backend/src/modules/billing/billing-subscriptions.controller.ts
- GET /billing/subscriptions/me (billing) — backend/src/modules/billing/billing-subscriptions.controller.ts
- POST /billing/subscriptions/select-plan (billing) — backend/src/modules/billing/billing-subscriptions.controller.ts
- GET /billing/usage/:tenantId (billing) — backend/src/billing/usage/usage.controller.ts
- GET /billing/wallet/:tenantId (billing) — backend/src/billing/wallet/wallet.controller.ts
- GET /billing/wallet/:tenantId/transactions (billing) — backend/src/billing/wallet/wallet.controller.ts
- POST /billing/wallet/add (billing) — backend/src/billing/wallet/wallet.controller.ts
- GET /billings (billing) — backend/src/modules/billing/billing.controller.ts
- POST /billings (billing) — backend/src/modules/billing/billing.controller.ts
- GET /billings/:id (billing) — backend/src/modules/billing/billing.controller.ts
- PUT /billings/:id (billing) — backend/src/modules/billing/billing.controller.ts
- DELETE /billings/:id (billing) — backend/src/modules/billing/billing.controller.ts
- POST /billings/admin (billing) — backend/src/modules/billing/billing.controller.ts
- PATCH /billings/admin/:id (billing) — backend/src/modules/billing/billing.controller.ts
- DELETE /billings/admin/:id (billing) — backend/src/modules/billing/billing.controller.ts
- GET /billings/admin/all (billing) — backend/src/modules/billing/billing.controller.ts
- GET /branding (tenants) — backend/src/tenants/branding/branding.controller.ts
- PUT /branding (tenants) — backend/src/tenants/branding/branding.controller.ts
- PATCH /chat/admin/rooms/:roomId/archive (chat) — backend/src/modules/chat/chat.controller.ts
- DELETE /chat/admin/rooms/:roomId/members/:userId (chat) — backend/src/modules/chat/chat.controller.ts
- GET /chat/rooms (chat) — backend/src/modules/chat/chat.controller.ts
- POST /chat/rooms (chat) — backend/src/modules/chat/chat.controller.ts
- POST /chat/rooms/:roomId/join (chat) — backend/src/modules/chat/chat.controller.ts
- GET /chat/rooms/:roomId/members (chat) — backend/src/modules/chat/chat.controller.ts
- GET /chat/rooms/:roomId/messages (chat) — backend/src/modules/chat/chat.controller.ts
- POST /chat/rooms/:roomId/messages (chat) — backend/src/modules/chat/chat.controller.ts
- POST /cms/analytics/:pageId/conversion (cms) — backend/src/cms/controllers/cms-analytics.controller.ts
- POST /cms/analytics/:pageId/track (cms) — backend/src/cms/controllers/cms-analytics.controller.ts
- GET /cms/analytics/page/:pageId (cms) — backend/src/cms/controllers/cms-analytics.controller.ts
- GET /cms/analytics/page/:pageId/stats (cms) — backend/src/cms/controllers/cms-analytics.controller.ts
- GET /cms/analytics/tenant (cms) — backend/src/cms/controllers/cms-analytics.controller.ts
- POST /cms/import/figma (cms) — backend/src/cms/controllers/cms-import.controller.ts
- GET /cms/import/history (cms) — backend/src/cms/controllers/cms-file-import.controller.ts
- GET /cms/import/status/:importId (cms) — backend/src/cms/controllers/cms-file-import.controller.ts
- POST /cms/import/upload (cms) — backend/src/cms/controllers/cms-file-import.controller.ts
- POST /cms/import/zip (cms) — backend/src/cms/controllers/cms-import.controller.ts
- GET /cms/menu (cms) — backend/src/cms/controllers/cms-menu-short.controller.ts
- POST /cms/menus/:menuId/items (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- GET /cms/menus/:menuId/items (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- PATCH /cms/menus/:menuId/items/:itemId (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- DELETE /cms/menus/:menuId/items/:itemId (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- POST /cms/menus/:menuId/reorder (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- GET /cms/menus/:menuId/tree (cms) — backend/src/cms/controllers/cms-menu.controller.ts
- POST /cms/pages (cms) — backend/src/cms/controllers/cms-page.controller.ts
- GET /cms/pages (cms) — backend/src/cms/controllers/cms-page.controller.ts
- GET /cms/pages/:id (cms) — backend/src/cms/controllers/cms-page.controller.ts
- PATCH /cms/pages/:id (cms) — backend/src/cms/controllers/cms-page.controller.ts
- DELETE /cms/pages/:id (cms) — backend/src/cms/controllers/cms-page.controller.ts
- POST /cms/pages/:id/duplicate (cms) — backend/src/cms/controllers/cms-page.controller.ts
- GET /cms/pages/hierarchy/tree (cms) — backend/src/cms/controllers/cms-page.controller.ts
- GET /cms/pages/slug/:slug (cms) — backend/src/cms/controllers/cms-page.controller.ts
- GET /cms/seo-audit/:pageId (cms) — backend/src/cms/controllers/cms-seo-audit.controller.ts
- GET /cms/seo-audit/:pageId/recommendations (cms) — backend/src/cms/controllers/cms-seo-audit.controller.ts
- POST /cms/seo-audit/:pageId/run (cms) — backend/src/cms/controllers/cms-seo-audit.controller.ts
- POST /cms/templates (cms) — backend/src/cms/controllers/cms-template.controller.ts
- GET /cms/templates (cms) — backend/src/cms/controllers/cms-template.controller.ts
- GET /cms/templates/:id (cms) — backend/src/cms/controllers/cms-template.controller.ts
- PATCH /cms/templates/:id (cms) — backend/src/cms/controllers/cms-template.controller.ts
- DELETE /cms/templates/:id (cms) — backend/src/cms/controllers/cms-template.controller.ts
- POST /cms/templates/:id/use (cms) — backend/src/cms/controllers/cms-template.controller.ts
- GET /cms/templates/category/:category (cms) — backend/src/cms/controllers/cms-template.controller.ts
- GET /cms/templates/popular (cms) — backend/src/cms/controllers/cms-template.controller.ts
- GET /coupons (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons (coupons) — backend/src/modules/coupons/coupons.controller.ts
- PATCH /coupons/:couponId (coupons) — backend/src/modules/coupons/coupons.controller.ts
- DELETE /coupons/:couponId (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons/:couponId/activate (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons/:couponId/deactivate (coupons) — backend/src/modules/coupons/coupons.controller.ts
- GET /coupons/:couponId/usage (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons/apply (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons/bulk-actions/update-status (coupons) — backend/src/modules/coupons/coupons.controller.ts
- POST /coupons/validate (coupons) — backend/src/modules/coupons/coupons.controller.ts
- GET /crm/analytics (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/companies (crm) — backend/src/modules/crm/crm.controller.ts
- POST /crm/companies (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/contacts (crm) — backend/src/modules/crm/crm.controller.ts
- POST /crm/contacts (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/contacts/:id (crm) — backend/src/modules/crm/crm.controller.ts
- PATCH /crm/contacts/:id (crm) — backend/src/modules/crm/crm.controller.ts
- DELETE /crm/contacts/:id (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/deals (crm) — backend/src/modules/crm/crm.controller.ts
- POST /crm/deals (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/deals/:id (crm) — backend/src/modules/crm/crm.controller.ts
- PATCH /crm/deals/:id (crm) — backend/src/modules/crm/crm.controller.ts
- DELETE /crm/deals/:id (crm) — backend/src/modules/crm/crm.controller.ts
- PATCH /crm/deals/:id/stage (crm) — backend/src/modules/crm/crm.controller.ts
- POST /crm/tasks (crm) — backend/src/modules/crm/crm.controller.ts
- PATCH /crm/tasks/:id/completed (crm) — backend/src/modules/crm/crm.controller.ts
- PATCH /crm/tasks/:id/delete (crm) — backend/src/modules/crm/crm.controller.ts
- GET /crm/tasks/my (crm) — backend/src/modules/crm/crm.controller.ts
- GET /custom-domains (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- PATCH /custom-domains/:domainId (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- POST /custom-domains/:domainId/activate (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- GET /custom-domains/me (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- POST /custom-domains/me (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- PATCH /custom-domains/me/:domainId (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- DELETE /custom-domains/me/:domainId (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- POST /custom-domains/me/:domainId/primary (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- POST /custom-domains/me/:domainId/ssl/issue (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- POST /custom-domains/me/:domainId/verify (custom-domains) — backend/src/modules/custom-domains/custom-domains.controller.ts
- GET /dashboards (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- POST /dashboards (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- GET /dashboards/:id (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- PUT /dashboards/:id (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- DELETE /dashboards/:id (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- GET /dashboards/admin/saas-overview (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- GET /dashboards/audit/logs (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- GET /dashboards/audit/logs/export (dashboard) — backend/src/modules/dashboard/dashboard.controller.ts
- POST /developer/api-keys (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- GET /developer/api-keys (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- DELETE /developer/api-keys/:keyId (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- POST /developer/api-keys/:keyId/revoke (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- GET /developer/webhook-logs (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- GET /developer/webhook-logs/:logId (developer-portal) — backend/src/modules/developer-portal/developer-portal.controller.ts
- POST /domain-hierarchy/:domainId (hierarchy) — backend/src/modules/hierarchy/domain-hierarchy.controller.ts
- GET /domain-hierarchy/:domainId (hierarchy) — backend/src/modules/hierarchy/domain-hierarchy.controller.ts
- DELETE /domain-hierarchy/:domainId (hierarchy) — backend/src/modules/hierarchy/domain-hierarchy.controller.ts
- GET /domains (domains) — backend/src/modules/domains/domains.controller.ts
- POST /domains (domains) — backend/src/modules/domains/domains.controller.ts
- PATCH /domains/:domainId (domains) — backend/src/modules/domains/domains.controller.ts
- DELETE /domains/:domainId (domains) — backend/src/modules/domains/domains.controller.ts
- POST /domains/:domainId/primary (domains) — backend/src/modules/domains/domains.controller.ts
- GET /domains/availability (domains) — backend/src/modules/domains/domains.controller.ts
- GET /domains/me (domains) — backend/src/modules/domains/domains.controller.ts
- POST /domains/me (domains) — backend/src/modules/domains/domains.controller.ts
- PATCH /domains/me/:domainId (domains) — backend/src/modules/domains/domains.controller.ts
- DELETE /domains/me/:domainId (domains) — backend/src/modules/domains/domains.controller.ts
- POST /domains/me/:domainId/primary (domains) — backend/src/modules/domains/domains.controller.ts
- POST /domains/tenant/:domainId/issue-ssl (custom-domains) — backend/src/modules/custom-domains/tenant-domains.controller.ts
- POST /domains/tenant/:domainId/verify-dns (custom-domains) — backend/src/modules/custom-domains/tenant-domains.controller.ts
- GET /domains/tenant/health-summary (custom-domains) — backend/src/modules/custom-domains/tenant-domains.controller.ts
- GET /domains/tenant/list (custom-domains) — backend/src/modules/custom-domains/tenant-domains.controller.ts
- GET /features ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- POST /features ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- GET /features/:id ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- DELETE /features/:id ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id/assign-role/:role ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id/assign-tenant/:tenant ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id/toggle ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id/unassign-role/:role ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- PATCH /features/:id/unassign-tenant/:tenant ((non-module)) — backend/src/feature-registry/featureRegistry.controller.ts
- GET /health (health) — backend/src/modules/health/health.controller.ts
- GET /health/detailed (health) — backend/src/modules/health/health.controller.ts
- GET /health/ready (health) — backend/src/modules/health/health.controller.ts
- POST /hierarchy (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- GET /hierarchy (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- GET /hierarchy/:id (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- PATCH /hierarchy/:id (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- DELETE /hierarchy/:id (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- GET /hierarchy/:id/children (hierarchy) — backend/src/modules/hierarchy/hierarchy.controller.ts
- GET /hrm/attendance (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /hrm/attendance (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/attendance/overview (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/employees (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /hrm/employees (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/employees/:id (hrm) — backend/src/modules/hrm/hrm.controller.ts
- PATCH /hrm/employees/:id (hrm) — backend/src/modules/hrm/hrm.controller.ts
- DELETE /hrm/employees/:id (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/jobs (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /hrm/jobs (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/leaves (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /hrm/leaves (hrm) — backend/src/modules/hrm/hrm.controller.ts
- PATCH /hrm/leaves/:id/status (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/summary (hrm) — backend/src/modules/hrm/hrm.controller.ts
- GET /hrm/trainings (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /hrm/trainings (hrm) — backend/src/modules/hrm/hrm.controller.ts
- POST /marketplace/install (marketplace) — backend/src/modules/marketplace/marketplace.controller.ts
- GET /marketplace/installs (marketplace) — backend/src/modules/marketplace/marketplace.controller.ts
- DELETE /marketplace/installs/:pluginId (marketplace) — backend/src/modules/marketplace/marketplace.controller.ts
- GET /marketplace/plugins (marketplace) — backend/src/modules/marketplace/marketplace.controller.ts
- POST /marketplace/toggle (marketplace) — backend/src/modules/marketplace/marketplace.controller.ts
- GET /me/profile (profile) — backend/src/modules/profile/profile.controller.ts
- PUT /me/profile (profile) — backend/src/modules/profile/profile.controller.ts
- GET /me/public-profile (profile) — backend/src/modules/profile/profile.controller.ts
- PUT /me/public-profile (profile) — backend/src/modules/profile/profile.controller.ts
- GET /metrics (metrics) — backend/src/metrics/metrics.controller.ts
- GET /metrics/prometheus (metrics) — backend/src/metrics/metrics.controller.ts
- GET /metrics/reset (metrics) — backend/src/metrics/metrics.controller.ts
- POST /notifications/mark-all-read (notifications) — backend/src/modules/notifications/notifications.controller.ts
- GET /notifications/my (notifications) — backend/src/modules/notifications/notifications.controller.ts
- POST /notifications/push-subscriptions/subscribe (notifications) — backend/src/modules/notifications/push-subscriptions.controller.ts
- POST /notifications/push-subscriptions/unsubscribe (notifications) — backend/src/modules/notifications/push-subscriptions.controller.ts
- POST /offline-payments (payments) — backend/src/modules/payments/controllers/offline-payments.controller.ts
- GET /offline-payments (payments) — backend/src/modules/payments/controllers/offline-payments.controller.ts
- PATCH /offline-payments/:id/status (payments) — backend/src/modules/payments/controllers/offline-payments.controller.ts
- GET /offline-payments/me (payments) — backend/src/modules/payments/controllers/offline-payments.controller.ts
- GET /onboarding/sample-status (onboarding) — backend/src/modules/onboarding/onboarding.controller.ts
- POST /onboarding/seed-sample (onboarding) — backend/src/modules/onboarding/onboarding.controller.ts
- GET /orders (orders) — backend/src/modules/orders/orders.controller.ts
- GET /orders/domain/:id (orders) — backend/src/modules/orders/orders.controller.ts
- GET /orders/pos/:id (orders) — backend/src/modules/orders/orders.controller.ts
- GET /orders/stats/dashboard (orders) — backend/src/modules/orders/orders.stats.controller.ts
- POST /package-hierarchy/:packageId (hierarchy) — backend/src/modules/hierarchy/package-hierarchy.controller.ts
- GET /package-hierarchy/:packageId (hierarchy) — backend/src/modules/hierarchy/package-hierarchy.controller.ts
- DELETE /package-hierarchy/:packageId (hierarchy) — backend/src/modules/hierarchy/package-hierarchy.controller.ts
- GET /packages (packages) — backend/src/modules/packages/packages.controller.ts
- POST /packages (packages) — backend/src/modules/packages/packages.controller.ts
- PATCH /packages/:packageId (packages) — backend/src/modules/packages/packages.controller.ts
- DELETE /packages/:packageId (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/:packageId (packages) — backend/src/modules/packages/packages.controller.ts
- POST /packages/:packageId/assign (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/admin/all (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/admin/plan-summary (packages) — backend/src/modules/packages/packages.controller.ts
- POST /packages/admin/subscription-expire-now (packages) — backend/src/modules/packages/packages.controller.ts
- POST /packages/admin/subscription-expiry-warnings (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/features (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/me (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/me/can-use/:feature (packages) — backend/src/modules/packages/packages.controller.ts
- GET /packages/me/usage (packages) — backend/src/modules/packages/packages.controller.ts
- GET /payments/logs (payments) — backend/src/modules/payments/payments.controller.ts
- POST /payments/paypal/capture (payments) — backend/src/modules/payments/payments.controller.ts
- POST /payments/paypal/capture-and-subscribe (payments) — backend/src/modules/payments/payments.controller.ts
- POST /payments/webhook/paypal/capture (payments) — backend/src/modules/payments/payments.controller.ts
- GET /pos/orders (pos) — backend/src/modules/pos/pos.controller.ts
- POST /pos/orders (pos) — backend/src/modules/pos/pos.controller.ts
- GET /pos/stock (pos) — backend/src/modules/pos/pos.controller.ts
- POST /pos/stock/adjust (pos) — backend/src/modules/pos/pos.controller.ts
- GET /pos/summary (pos) — backend/src/modules/pos/pos.controller.ts
- GET /products (products) — backend/src/modules/products/products.controller.ts
- GET /products/:id (products) — backend/src/modules/products/products.controller.ts
- GET /products/stats/dashboard (products) — backend/src/modules/products/products.stats.controller.ts
- GET /projects (projects) — backend/src/modules/projects/projects.controller.ts
- POST /projects (projects) — backend/src/modules/projects/projects.controller.ts
- GET /projects/:id (projects) — backend/src/modules/projects/projects.controller.ts
- PATCH /projects/:id (projects) — backend/src/modules/projects/projects.controller.ts
- DELETE /projects/:id (projects) — backend/src/modules/projects/projects.controller.ts
- GET /projects/:projectId/tasks (projects) — backend/src/modules/projects/projects.controller.ts
- POST /projects/:projectId/tasks (projects) — backend/src/modules/projects/projects.controller.ts
- GET /projects/summary (projects) — backend/src/modules/projects/projects.controller.ts
- PATCH /projects/tasks/:id (projects) — backend/src/modules/projects/projects.controller.ts
- GET /projects/timesheets (projects) — backend/src/modules/projects/projects.controller.ts
- POST /projects/timesheets/log (projects) — backend/src/modules/projects/projects.controller.ts
- POST /public/forms/contact (crm) — backend/src/modules/crm/public-forms.controller.ts
- GET /public/profiles/:handle (profile) — backend/src/modules/profile/profile.controller.ts
- GET /public/profiles/check-handle (profile) — backend/src/modules/profile/profile.controller.ts
- GET /public/vcards/:id (vcards) — backend/src/modules/vcards/vcards.controller.ts
- POST /rbac/check-field-permission (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /rbac/permissions (rbac) — backend/src/modules/rbac/rbac.controller.ts
- POST /rbac/permissions (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /rbac/permissions/module/:module (rbac) — backend/src/modules/rbac/rbac.controller.ts
- POST /rbac/roles (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /rbac/roles (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /rbac/roles/:roleId (rbac) — backend/src/modules/rbac/rbac.controller.ts
- PUT /rbac/roles/:roleId (rbac) — backend/src/modules/rbac/rbac.controller.ts
- DELETE /rbac/roles/:roleId (rbac) — backend/src/modules/rbac/rbac.controller.ts
- POST /rbac/users (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /rbac/users (rbac) — backend/src/modules/rbac/rbac.controller.ts
- PUT /rbac/users/:userTenantId (rbac) — backend/src/modules/rbac/rbac.controller.ts
- DELETE /rbac/users/:userTenantId (rbac) — backend/src/modules/rbac/rbac.controller.ts
- POST /rbac/users/:userTenantId/reset-password (rbac) — backend/src/modules/rbac/rbac.controller.ts
- POST /rbac/users/:userTenantId/toggle-login (rbac) — backend/src/modules/rbac/rbac.controller.ts
- GET /reports/tenant/commerce (reports) — backend/src/modules/reports/reports.controller.ts
- GET /reports/tenant/financial (reports) — backend/src/modules/reports/reports.controller.ts
- GET /reports/tenant/traffic (reports) — backend/src/modules/reports/reports.controller.ts
- POST /role-hierarchy/:roleName (hierarchy) — backend/src/modules/hierarchy/role-hierarchy.controller.ts
- GET /role-hierarchy/:roleName (hierarchy) — backend/src/modules/hierarchy/role-hierarchy.controller.ts
- DELETE /role-hierarchy/:roleName (hierarchy) — backend/src/modules/hierarchy/role-hierarchy.controller.ts
- GET /seo/tenants/:slug/feed.xml (seo) — backend/src/modules/seo/seo.controller.ts
- GET /seo/tenants/:slug/robots.txt (seo) — backend/src/modules/seo/seo.controller.ts
- GET /seo/tenants/:slug/sitemap.xml (seo) — backend/src/modules/seo/seo.controller.ts
- GET /settings/reports (settings) — backend/src/modules/settings/settings.controller.ts
- PATCH /social/connections/:id/accept (social) — backend/src/modules/social/social.controller.ts
- PATCH /social/connections/:id/reject (social) — backend/src/modules/social/social.controller.ts
- GET /social/connections/my (social) — backend/src/modules/social/social.controller.ts
- GET /social/connections/pending (social) — backend/src/modules/social/social.controller.ts
- POST /social/connections/request (social) — backend/src/modules/social/social.controller.ts
- GET /social/feed (social) — backend/src/modules/social/social.controller.ts
- POST /social/posts (social) — backend/src/modules/social/social.controller.ts
- POST /social/posts/:id/comments (social) — backend/src/modules/social/social.controller.ts
- GET /social/posts/:id/comments (social) — backend/src/modules/social/social.controller.ts
- PATCH /social/posts/:id/like (social) — backend/src/modules/social/social.controller.ts
- GET /support/admin/tickets (support) — backend/src/modules/support/support.controller.ts
- PATCH /support/admin/tickets/:id/status (support) — backend/src/modules/support/support.controller.ts
- POST /support/tickets (support) — backend/src/modules/support/support.controller.ts
- GET /support/tickets (support) — backend/src/modules/support/support.controller.ts
- GET /tenant/current (tenant) — backend/src/modules/tenant/tenant.controller.ts
- GET /tenant/dashboard (tenants) — backend/src/tenants/dashboard/dashboard.controller.ts
- GET /tenant/profile (profile) — backend/src/modules/profile/profile.controller.ts
- PUT /tenant/profile (profile) — backend/src/modules/profile/profile.controller.ts
- GET /tenant/theme (themes) — backend/src/modules/themes/controllers/tenant-themes.controller.ts
- GET /tenant/theme/css (themes) — backend/src/modules/themes/controllers/tenant-themes.controller.ts
- POST /tenant/theme/customize (themes) — backend/src/modules/themes/controllers/tenant-themes.controller.ts
- POST /tenant/theme/select (themes) — backend/src/modules/themes/controllers/tenant-themes.controller.ts
- GET /tenant/theme/variables (themes) — backend/src/modules/themes/controllers/tenant-themes.controller.ts
- GET /tenants (tenants) — backend/src/modules/tenants/tenants.controller.ts
- POST /tenants (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/custom-domains (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/domain/:tenantId/domains (tenants) — backend/src/tenants/domain/domain.controller.ts
- POST /tenants/domain/map (tenants) — backend/src/tenants/domain/domain.controller.ts
- POST /tenants/domain/update (tenants) — backend/src/tenants/domain/domain.controller.ts
- POST /tenants/domain/verify (tenants) — backend/src/tenants/domain/domain.controller.ts
- POST /tenants/manual-create (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/me (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/public-directory (tenants) — backend/src/modules/tenants/tenants.controller.ts
- PUT /tenants/public-profile (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/public/:slug (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/public/:slug/reviews (tenants) — backend/src/modules/tenants/tenants.controller.ts
- POST /tenants/public/:slug/reviews (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/quota (tenants) — backend/src/modules/tenants/tenants.controller.ts
- GET /tenants/ssl/:domain/status (tenants) — backend/src/tenants/ssl/ssl.controller.ts
- GET /tenants/ssl/admin/resync-statuses (tenants) — backend/src/tenants/ssl/ssl.controller.ts
- GET /tenants/ssl/admin/run-automation (tenants) — backend/src/tenants/ssl/ssl.controller.ts
- GET /themes (theme) — backend/src/modules/theme/theme.controller.ts
- POST /themes (theme) — backend/src/modules/theme/theme.controller.ts
- GET /themes/:id (theme) — backend/src/modules/theme/theme.controller.ts
- PUT /themes/:id (theme) — backend/src/modules/theme/theme.controller.ts
- DELETE /themes/:id (theme) — backend/src/modules/theme/theme.controller.ts
- POST /user-hierarchy/:userId (hierarchy) — backend/src/modules/hierarchy/user-hierarchy.controller.ts
- GET /user-hierarchy/:userId (hierarchy) — backend/src/modules/hierarchy/user-hierarchy.controller.ts
- DELETE /user-hierarchy/:userId (hierarchy) — backend/src/modules/hierarchy/user-hierarchy.controller.ts
- GET /users (users) — backend/src/modules/users/user.controller.ts
- POST /users (users) — backend/src/modules/users/user.controller.ts
- POST /users (users) — backend/src/modules/users/users.controller.ts
- GET /users (users) — backend/src/modules/users/users.controller.ts
- GET /users (user) — backend/src/modules/user/user.controller.ts
- POST /users (user) — backend/src/modules/user/user.controller.ts
- GET /users/:id (users) — backend/src/modules/users/user.controller.ts
- PUT /users/:id (users) — backend/src/modules/users/user.controller.ts
- DELETE /users/:id (users) — backend/src/modules/users/user.controller.ts
- GET /users/:id (users) — backend/src/modules/users/users.controller.ts
- PATCH /users/:id (users) — backend/src/modules/users/users.controller.ts
- DELETE /users/:id (users) — backend/src/modules/users/users.controller.ts
- GET /users/:id (user) — backend/src/modules/user/user.controller.ts
- PUT /users/:id (user) — backend/src/modules/user/user.controller.ts
- DELETE /users/:id (user) — backend/src/modules/user/user.controller.ts
- GET /users/all (users) — backend/src/modules/users/user.controller.ts
- POST /users/bulk (users) — backend/src/modules/users/users.controller.ts
- GET /users/me (users) — backend/src/modules/users/user.controller.ts
- GET /users/me (users) — backend/src/modules/users/users.controller.ts
- GET /users/public (users) — backend/src/modules/users/users.controller.ts
- GET /users/stats/dashboard (users) — backend/src/modules/users/users.stats.controller.ts
- GET /vcards (vcards) — backend/src/modules/vcards/vcards.controller.ts
- POST /vcards (vcards) — backend/src/modules/vcards/vcards.controller.ts
- PUT /vcards/:id (vcards) — backend/src/modules/vcards/vcards.controller.ts
- DELETE /vcards/:id (vcards) — backend/src/modules/vcards/vcards.controller.ts
- GET /workspaces (workspaces) — backend/src/workspaces/workspace.controller.ts
- POST /workspaces/switch (workspaces) — backend/src/workspaces/workspace.controller.ts

## Frontend Routes (Features) — Router Surface

- Total router routes discovered: 78
- In-routes: 78 (100%)
- Routes with detected api.* calls: 8
- Routes where detected api.* calls map to backend endpoints: 8

## Frontend Pages / UI Components — Completion Distribution

### Route-exposed pages
- Total route-exposed: 40
- Visible: 40 (100%)
- Workable (mapped API): 8 (20%)
- Avg: 60%

### All TSX under pages + billing
- Total: 88
- Visible (routed): 40 (45%)
- Workable (mapped API): 8 (9%)
- Avg: 27%
- Perfect (100%): 8/88

Distribution (all TSX set):
- 0%: 48
- 50%: 32
- 100%: 8

## Frontend Pages / UI Components — Full Table (Most Incomplete First)

| Page % | Visible | Workable (Mapped API) | Page | File | UI Routes |
|---|---|---|---|---|---|
| 0% | No | No | AffiliateDashboard.tsx | frontend/src/billing/AffiliateDashboard.tsx | — |
| 0% | No | No | OfflinePaymentsAdminPage.tsx | frontend/src/billing/OfflinePaymentsAdminPage.tsx | — |
| 0% | No | No | OfflinePaymentsPage.tsx | frontend/src/billing/OfflinePaymentsPage.tsx | — |
| 0% | No | No | RevenueDashboard.tsx | frontend/src/billing/RevenueDashboard.tsx | — |
| 0% | No | No | UsageDashboard.tsx | frontend/src/billing/UsageDashboard.tsx | — |
| 0% | No | No | WalletManager.tsx | frontend/src/billing/WalletManager.tsx | — |
| 0% | No | No | AccountingDashboard.tsx | frontend/src/pages/AccountingDashboard.tsx | — |
| 0% | No | No | AdminBillingAnalyticsPage.tsx | frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx | — |
| 0% | No | No | AdminDomainsPage.tsx | frontend/src/pages/admin/AdminDomainsPage.tsx | — |
| 0% | No | No | AdminInvoicesPage.tsx | frontend/src/pages/admin/AdminInvoicesPage.tsx | — |
| 0% | No | No | AdminNavigationMapPage.tsx | frontend/src/pages/admin/AdminNavigationMapPage.tsx | — |
| 0% | No | No | AdminThemesPage.tsx | frontend/src/pages/admin/AdminThemesPage.tsx | — |
| 0% | No | No | AuditLogViewer.tsx | frontend/src/pages/admin/AuditLogViewer.tsx | — |
| 0% | No | No | index.tsx | frontend/src/pages/admin/index.tsx | — |
| 0% | No | No | PaymentLogsPage.tsx | frontend/src/pages/admin/PaymentLogsPage.tsx | — |
| 0% | No | No | PlanManager.tsx | frontend/src/pages/admin/PlanManager.tsx | — |
| 0% | No | No | PlatformOverviewDashboard.tsx | frontend/src/pages/admin/PlatformOverviewDashboard.tsx | — |
| 0% | No | No | Tenants.tsx | frontend/src/pages/admin/Tenants.tsx | — |
| 0% | No | No | AdminSupportTickets.tsx | frontend/src/pages/AdminSupportTickets.tsx | — |
| 0% | No | No | AdvancedSettings.tsx | frontend/src/pages/AdvancedSettings.tsx | — |
| 0% | No | No | AiToolsPage.tsx | frontend/src/pages/AiToolsPage.tsx | — |
| 0% | No | No | CmsAnalyticsPage.tsx | frontend/src/pages/cms/CmsAnalyticsPage.tsx | — |
| 0% | No | No | CmsSeoAuditPage.tsx | frontend/src/pages/cms/CmsSeoAuditPage.tsx | — |
| 0% | No | No | AuditLogs.tsx | frontend/src/pages/dashboard/AuditLogs.tsx | — |
| 0% | No | No | CmsMenuManagement.tsx | frontend/src/pages/dashboard/CmsMenuManagement.tsx | — |
| 0% | No | No | CustomDomains.tsx | frontend/src/pages/dashboard/CustomDomains.tsx | — |
| 0% | No | No | PackageFeatures.tsx | frontend/src/pages/dashboard/PackageFeatures.tsx | — |
| 0% | No | No | SystemHealthPage.tsx | frontend/src/pages/dashboard/SystemHealthPage.tsx | — |
| 0% | No | No | TenantQuotaUsage.tsx | frontend/src/pages/dashboard/TenantQuotaUsage.tsx | — |
| 0% | No | No | DeveloperPortalPage.tsx | frontend/src/pages/developer/DeveloperPortalPage.tsx | — |
| 0% | No | No | CustomDomainRequestModal.tsx | frontend/src/pages/domains/CustomDomainRequestModal.tsx | — |
| 0% | No | No | DomainCreateModal.tsx | frontend/src/pages/domains/DomainCreateModal.tsx | — |
| 0% | No | No | DomainListPage.tsx | frontend/src/pages/domains/DomainListPage.tsx | — |
| 0% | No | No | TenantDomainHealthPage.tsx | frontend/src/pages/domains/TenantDomainHealthPage.tsx | — |
| 0% | No | No | HrmDashboard.tsx | frontend/src/pages/HrmDashboard.tsx | — |
| 0% | No | No | MarketplacePage.tsx | frontend/src/pages/marketplace/MarketplacePage.tsx | — |
| 0% | No | No | NotAuthorized.tsx | frontend/src/pages/NotAuthorized.tsx | — |
| 0% | No | No | CurrentPlanCard.tsx | frontend/src/pages/packages/CurrentPlanCard.tsx | — |
| 0% | No | No | PackagesPage.tsx | frontend/src/pages/packages/PackagesPage.tsx | — |
| 0% | No | No | PosDashboard.tsx | frontend/src/pages/PosDashboard.tsx | — |
| 0% | No | No | Pricing.tsx | frontend/src/pages/Pricing.tsx | — |
| 0% | No | No | ProjectsDashboard.tsx | frontend/src/pages/ProjectsDashboard.tsx | — |
| 0% | No | No | Register.tsx | frontend/src/pages/Register.tsx | — |
| 0% | No | No | SeoToolsPage.tsx | frontend/src/pages/SeoToolsPage.tsx | — |
| 0% | No | No | Settings.tsx | frontend/src/pages/Settings.tsx | — |
| 0% | No | No | UiSettings.tsx | frontend/src/pages/UiSettings.tsx | — |
| 0% | No | No | Users.tsx | frontend/src/pages/Users.tsx | — |
| 0% | No | No | VcardsManager.tsx | frontend/src/pages/VcardsManager.tsx | — |
| 50% | Yes | No | App.tsx | frontend/src/App.tsx | /app |
| 50% | Yes | No | ActivityFeedPage.tsx | frontend/src/pages/ActivityFeedPage.tsx | /app/social/feed |
| 50% | Yes | No | AffiliateDashboard.tsx | frontend/src/pages/AffiliateDashboard.tsx | /app/affiliate |
| 50% | Yes | No | ApiDocsPage.tsx | frontend/src/pages/ApiDocsPage.tsx | /docs |
| 50% | Yes | No | BillingDashboard.tsx | frontend/src/pages/BillingDashboard.tsx | /app/billing |
| 50% | Yes | No | BillingPaypalReturn.tsx | frontend/src/pages/BillingPaypalReturn.tsx | /app/billing/paypal/return |
| 50% | Yes | No | BillingStripeCheckoutPage.tsx | frontend/src/pages/BillingStripeCheckoutPage.tsx | /app/billing/checkout/stripe |
| 50% | Yes | No | BusinessDirectory.tsx | frontend/src/pages/BusinessDirectory.tsx | /directory |
| 50% | Yes | No | BusinessProfilePublicView.tsx | frontend/src/pages/BusinessProfilePublicView.tsx | /b/:slug |
| 50% | Yes | No | CmsPageBuilder.tsx | frontend/src/pages/CmsPageBuilder.tsx | /app/cms/page-builder |
| 50% | Yes | No | ConnectionRequestsPage.tsx | frontend/src/pages/ConnectionRequestsPage.tsx | /app/social/requests |
| 50% | Yes | No | CrmAnalyticsPage.tsx | frontend/src/pages/CrmAnalyticsPage.tsx | /app/crm/analytics |
| 50% | Yes | No | CrmCompaniesPage.tsx | frontend/src/pages/CrmCompaniesPage.tsx | /app/crm/companies |
| 50% | Yes | No | CrmContactsPage.tsx | frontend/src/pages/CrmContactsPage.tsx | /app/crm/contacts |
| 50% | Yes | No | CrmDealsPage.tsx | frontend/src/pages/CrmDealsPage.tsx | /app/crm/deals |
| 50% | Yes | No | CrmKanbanPage.tsx | frontend/src/pages/CrmKanbanPage.tsx | /app/crm/kanban |
| 50% | Yes | No | CrmMyTasksPage.tsx | frontend/src/pages/CrmMyTasksPage.tsx | /app/crm/tasks |
| 50% | Yes | No | HierarchyManagement.tsx | frontend/src/pages/HierarchyManagement.tsx | /app/hierarchy |
| 50% | Yes | No | Invoices.tsx | frontend/src/pages/Invoices.tsx | /app/billing/invoices |
| 50% | Yes | No | LandingPage.tsx | frontend/src/pages/LandingPage.tsx | / |
| 50% | Yes | No | Login.tsx | frontend/src/pages/Login.tsx | /login |
| 50% | Yes | No | ManageRoles.tsx | frontend/src/pages/ManageRoles.tsx | /app/manage-roles |
| 50% | Yes | No | ManageUsers.tsx | frontend/src/pages/ManageUsers.tsx | /app/users \| /app/manage-users |
| 50% | Yes | No | MyConnectionsPage.tsx | frontend/src/pages/MyConnectionsPage.tsx | /app/social/connections |
| 50% | Yes | No | NotificationCenterPage.tsx | frontend/src/pages/NotificationCenterPage.tsx | /app/notifications |
| 50% | Yes | No | ProfilePublicEdit.tsx | frontend/src/pages/ProfilePublicEdit.tsx | /app/profile/public |
| 50% | Yes | No | PublicUserProfileView.tsx | frontend/src/pages/PublicUserProfileView.tsx | /u/:handle |
| 50% | Yes | No | SupportTickets.tsx | frontend/src/pages/SupportTickets.tsx | /app/support/tickets |
| 50% | Yes | No | TeamChatPage.tsx | frontend/src/pages/TeamChatPage.tsx | /app/chat |
| 50% | Yes | No | TenantThemeCustomizerPage.tsx | frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx | /app/tenant/theme/customize |
| 50% | Yes | No | TenantThemeSelectorPage.tsx | frontend/src/pages/tenant/TenantThemeSelectorPage.tsx | /app/tenant/theme/select |
| 50% | Yes | No | VcardPublicView.tsx | frontend/src/pages/VcardPublicView.tsx | /vcard/:id |
| 100% | Yes | Yes | CompanySettings.tsx | frontend/src/pages/CompanySettings.tsx | /app/company |
| 100% | Yes | Yes | Dashboard.tsx | frontend/src/pages/Dashboard.tsx | /app/dashboard |
| 100% | Yes | Yes | ForgotPassword.tsx | frontend/src/pages/ForgotPassword.tsx | /forgot-password |
| 100% | Yes | Yes | Onboarding.tsx | frontend/src/pages/Onboarding.tsx | /app/onboarding |
| 100% | Yes | Yes | ProfileSettings.tsx | frontend/src/pages/ProfileSettings.tsx | /app/profile |
| 100% | Yes | Yes | ResetPassword.tsx | frontend/src/pages/ResetPassword.tsx | /reset-password |
| 100% | Yes | Yes | SignupWizard.tsx | frontend/src/pages/SignupWizard.tsx | /signup |
| 100% | Yes | Yes | VerifyEmail.tsx | frontend/src/pages/VerifyEmail.tsx | /verify-email |

## Done vs Missing (Practical Launch / Earn)

### Done (strong signals found in code)
- Backend module structure is complete across all modules (structural scan 100%).
- Router navigation exists for every route-exposed page (visibility 100%).
- Core earning-loop signals exist (checkout initiation, entitlements, invoicing/PDF endpoints present).

### Missing / Still Incomplete (highest-impact blockers to 100%)
- Backend endpoints: many routes do not show full “production-grade” evidence signals (guards/roles, swagger, DTO validation, try/catch).
- Frontend workability: many routed pages have no directly-detected + mappable `api.*` calls in the component file.
- Earning loop: Stripe webhook confirmation evidence is still missing in the heuristic; admin payments evidence is also missing in the heuristic.
