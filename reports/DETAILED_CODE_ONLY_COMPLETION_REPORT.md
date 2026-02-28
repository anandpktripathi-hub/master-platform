# Detailed Code-Only Completion Report (Publish / Launch / Earn)

Generated: 2026-02-27T03:40:55.423Z

This report is produced from code only. It does not read or use any `.md` or docs content.

## Executive Summary

### What is 100% complete (code-only evidence)

- Backend modules (structural wiring artifacts): 43/43 = 100%
  - Meaning: every backend module shows module/controller/service/dto/schema/tests/migrations signals present.
- Packaging/infra presence checks: 9/9 = 100%
- Frontend route-exposed pages “visible”: 40/40 = 100%
  - Meaning: everything referenced by the router is navigable (exists in the router + import resolved).

### What is NOT 100% (and the % completion)

- Backend endpoints (feature-level, route-by-route evidence): 438 routes
  - Avg endpoint evidence score: 70%
  - Min endpoint score: 44%
  - Perfect (100%) endpoints: 2/438
  - Typical missing evidence: guards/roles, Swagger decorators, DTO usage/validation, try/catch, consistent service-call wiring.
- Frontend route-exposed pages “workable (mapped API)”: 20%
  - Interpreted as: page has at least one detected `api.*` call that matches a backend controller route.
  - Router-exposed pages: 40 total, workable 20%, avg page score 60%.
- Frontend ALL TSX UI files under pages + billing (includes internal components/modals/cards, not just routable pages):
  - Total: 88
  - Visible (actually routed): 45%
  - Workable (mapped API): 9%
  - Avg: 27%
  - Perfect (100%) pages: 8/88
- Earning readiness (practical real-world loop heuristic): 100%

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

## Backend Modules — Structural + Endpoint Quality (Overall)

| Module | Overall % | Structural % | Avg Route % | Routes | Missing (structural) |
|---|---|---|---|---|---|
| seo | 66% | 100% | 44% | 3 | — |
| hierarchy | 75% | 100% | 58% | 21 | — |
| metrics | 75% | 100% | 58% | 3 | — |
| onboarding | 75% | 100% | 58% | 2 | — |
| reports | 75% | 100% | 58% | 3 | — |
| tenant | 75% | 100% | 58% | 1 | — |
| health | 78% | 100% | 63% | 3 | — |
| notifications | 79% | 100% | 65% | 4 | — |
| auth | 80% | 100% | 67% | 15 | — |
| accounting | 83% | 100% | 72% | 24 | — |
| ai-services | 83% | 100% | 72% | 3 | — |
| analytics | 83% | 100% | 72% | 1 | — |
| cms | 83% | 100% | 71% | 36 | — |
| coupons | 83% | 100% | 72% | 10 | — |
| crm | 83% | 100% | 72% | 12 | — |
| custom-domains | 83% | 100% | 72% | 14 | — |
| dashboard | 83% | 100% | 72% | 8 | — |
| developer-portal | 83% | 100% | 72% | 6 | — |
| hrm | 83% | 100% | 72% | 13 | — |
| logger | 83% | 100% | 72% | 2 | — |
| logs | 83% | 100% | 72% | 3 | — |
| marketplace | 83% | 100% | 72% | 5 | — |
| orders | 83% | 100% | 72% | 4 | — |
| packages | 83% | 100% | 72% | 14 | — |
| payments | 83% | 100% | 72% | 9 | — |
| pos | 83% | 100% | 72% | 5 | — |
| profile | 83% | 100% | 72% | 8 | — |
| projects | 83% | 100% | 72% | 9 | — |
| rbac | 83% | 100% | 72% | 15 | — |
| settings | 83% | 100% | 72% | 48 | — |
| social | 83% | 100% | 72% | 10 | — |
| support | 83% | 100% | 72% | 4 | — |
| tenants | 83% | 100% | 71% | 21 | — |
| theme | 83% | 100% | 72% | 5 | — |
| themes | 83% | 100% | 72% | 12 | — |
| user | 83% | 100% | 72% | 5 | — |
| vcards | 83% | 100% | 72% | 5 | — |
| workspaces | 83% | 100% | 72% | 2 | — |
| chat | 84% | 100% | 74% | 8 | — |
| domains | 84% | 100% | 73% | 11 | — |
| users | 84% | 100% | 73% | 16 | — |
| products | 86% | 100% | 77% | 3 | — |
| billing | 87% | 100% | 78% | 21 | — |

## Backend Controllers (Sub-modules) — Most Incomplete First

| Avg Route % | Module | Routes | Controller File |
|---|---|---|---|
| 44% | auth | 1 | backend/src/auth/unified-registration/unified-registration.controller.ts |
| 44% | (non-module) | 10 | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | seo | 3 | backend/src/modules/seo/seo.controller.ts |
| 44% | users | 1 | backend/src/modules/users/users.stats.controller.ts |
| 58% | billing | 1 | backend/src/billing/analytics/revenue.controller.ts |
| 58% | cms | 5 | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | 3 | backend/src/cms/controllers/cms-file-import.controller.ts |
| 58% | cms | 2 | backend/src/cms/controllers/cms-import.controller.ts |
| 58% | cms | 3 | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 58% | metrics | 3 | backend/src/metrics/metrics.controller.ts |
| 58% | hierarchy | 3 | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 58% | hierarchy | 3 | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 58% | hierarchy | 6 | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | 3 | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 58% | hierarchy | 3 | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 58% | hierarchy | 3 | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 58% | notifications | 2 | backend/src/modules/notifications/notifications.controller.ts |
| 58% | onboarding | 2 | backend/src/modules/onboarding/onboarding.controller.ts |
| 58% | products | 1 | backend/src/modules/products/products.stats.controller.ts |
| 58% | reports | 3 | backend/src/modules/reports/reports.controller.ts |
| 58% | tenant | 1 | backend/src/modules/tenant/tenant.controller.ts |
| 58% | tenants | 1 | backend/src/tenants/dashboard/dashboard.controller.ts |
| 58% | tenants | 3 | backend/src/tenants/ssl/ssl.controller.ts |
| 62% | users | 7 | backend/src/modules/users/user.controller.ts |
| 63% | health | 3 | backend/src/modules/health/health.controller.ts |
| 65% | tenants | 2 | backend/src/tenants/branding/branding.controller.ts |
| 69% | auth | 13 | backend/src/modules/auth/auth.controller.ts |
| 72% | billing | 1 | backend/src/billing/stripe/stripe-webhook.controller.ts |
| 72% | cms | 6 | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | 8 | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | logger | 2 | backend/src/logger/logger.controller.ts |
| 72% | accounting | 24 | backend/src/modules/accounting/accounting.controller.ts |
| 72% | ai-services | 3 | backend/src/modules/ai-services/ai-services.controller.ts |
| 72% | analytics | 1 | backend/src/modules/analytics/analytics.controller.ts |
| 72% | auth | 1 | backend/src/modules/auth/refresh.controller.ts |
| 72% | billing | 9 | backend/src/modules/billing/billing.controller.ts |
| 72% | coupons | 10 | backend/src/modules/coupons/coupons.controller.ts |
| 72% | crm | 12 | backend/src/modules/crm/crm.controller.ts |
| 72% | custom-domains | 10 | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | 4 | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 72% | dashboard | 8 | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | developer-portal | 6 | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | hrm | 13 | backend/src/modules/hrm/hrm.controller.ts |
| 72% | logs | 3 | backend/src/modules/logs/tenant-log.controller.ts |
| 72% | marketplace | 5 | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | notifications | 2 | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 72% | orders | 3 | backend/src/modules/orders/orders.controller.ts |
| 72% | orders | 1 | backend/src/modules/orders/orders.stats.controller.ts |
| 72% | packages | 14 | backend/src/modules/packages/packages.controller.ts |
| 72% | payments | 2 | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 72% | payments | 4 | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 72% | payments | 3 | backend/src/modules/payments/payments.controller.ts |
| 72% | pos | 5 | backend/src/modules/pos/pos.controller.ts |
| 72% | profile | 8 | backend/src/modules/profile/profile.controller.ts |
| 72% | projects | 9 | backend/src/modules/projects/projects.controller.ts |
| 72% | rbac | 15 | backend/src/modules/rbac/rbac.controller.ts |
| 72% | settings | 48 | backend/src/modules/settings/settings.controller.ts |
| 72% | social | 10 | backend/src/modules/social/social.controller.ts |
| 72% | support | 4 | backend/src/modules/support/support.controller.ts |
| 72% | tenants | 11 | backend/src/modules/tenants/tenants.controller.ts |
| 72% | theme | 5 | backend/src/modules/theme/theme.controller.ts |
| 72% | themes | 7 | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | 5 | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | user | 5 | backend/src/modules/user/user.controller.ts |
| 72% | vcards | 5 | backend/src/modules/vcards/vcards.controller.ts |
| 72% | workspaces | 2 | backend/src/workspaces/workspace.controller.ts |
| 73% | domains | 11 | backend/src/modules/domains/domains.controller.ts |
| 74% | chat | 8 | backend/src/modules/chat/chat.controller.ts |
| 86% | billing | 4 | backend/src/billing/affiliate/commission.controller.ts |
| 86% | billing | 1 | backend/src/billing/stripe/addons.controller.ts |
| 86% | billing | 1 | backend/src/billing/stripe/lifetime.controller.ts |
| 86% | billing | 1 | backend/src/billing/usage/usage.controller.ts |
| 86% | billing | 3 | backend/src/billing/wallet/wallet.controller.ts |
| 86% | cms | 8 | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | products | 2 | backend/src/modules/products/products.controller.ts |
| 86% | users | 8 | backend/src/modules/users/users.controller.ts |
| 86% | tenants | 4 | backend/src/tenants/domain/domain.controller.ts |
| 100% | cms | 1 | backend/src/cms/controllers/cms-menu-short.controller.ts |
| 100% | (non-module) | 1 | backend/src/feature-registry/auditLog.controller.ts |

## Backend Endpoints (Features) — Completion Distribution

- Total routes: 438
- Avg route evidence: 70%
- Min route evidence: 44%
- Perfect routes (100%): 2/438

Distribution:
- 44%: 16
- 58%: 60
- 72%: 326
- 86%: 34
- 100%: 2

## Backend Endpoints (Features) — Full Route-by-route Table (Most Incomplete First)

| Route % | Module | Method | Path | Missing Evidence | Controller File |
|---|---|---|---|---|---|
| 44% | auth | POST | /auth/unified-register | dto, guards/roles, swagger, try/catch | backend/src/auth/unified-registration/unified-registration.controller.ts |
| 44% | (non-module) | GET | /features | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | POST | /features | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | GET | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | DELETE | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id/assign-role/:role | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id/assign-tenant/:tenant | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id/toggle | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id/unassign-role/:role | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | (non-module) | PATCH | /features/:id/unassign-tenant/:tenant | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 44% | health | GET | /health | service-call, dto, guards/roles, try/catch | backend/src/modules/health/health.controller.ts |
| 44% | seo | GET | /seo/tenants/:slug/feed.xml | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 44% | seo | GET | /seo/tenants/:slug/robots.txt | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 44% | seo | GET | /seo/tenants/:slug/sitemap.xml | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 44% | users | GET | /users/stats/dashboard | dto, guards/roles, swagger, try/catch | backend/src/modules/users/users.stats.controller.ts |
| 58% | auth | GET | /auth/github | service-call, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 58% | auth | GET | /auth/google | service-call, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 58% | auth | POST | /auth/logout | service-call, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 58% | hierarchy | POST | /billing-hierarchy/:billingId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 58% | hierarchy | GET | /billing-hierarchy/:billingId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /billing-hierarchy/:billingId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 58% | billing | GET | /billing/analytics/revenue | service-call, dto, try/catch | backend/src/billing/analytics/revenue.controller.ts |
| 58% | tenants | GET | /branding | guards/roles, swagger, try/catch | backend/src/tenants/branding/branding.controller.ts |
| 58% | cms | POST | /cms/analytics/:pageId/conversion | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | POST | /cms/analytics/:pageId/track | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | GET | /cms/analytics/page/:pageId | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | GET | /cms/analytics/page/:pageId/stats | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | GET | /cms/analytics/tenant | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 58% | cms | POST | /cms/import/figma | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-import.controller.ts |
| 58% | cms | GET | /cms/import/history | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 58% | cms | GET | /cms/import/status/:importId | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 58% | cms | POST | /cms/import/upload | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 58% | cms | POST | /cms/import/zip | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-import.controller.ts |
| 58% | cms | GET | /cms/seo-audit/:pageId | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 58% | cms | GET | /cms/seo-audit/:pageId/recommendations | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 58% | cms | POST | /cms/seo-audit/:pageId/run | dto, guards/roles, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 58% | hierarchy | POST | /domain-hierarchy/:domainId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 58% | hierarchy | GET | /domain-hierarchy/:domainId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /domain-hierarchy/:domainId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 58% | hierarchy | POST | /hierarchy | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | GET | /hierarchy | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | GET | /hierarchy/:id | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | PATCH | /hierarchy/:id | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /hierarchy/:id | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | hierarchy | GET | /hierarchy/:id/children | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 58% | metrics | GET | /metrics | dto, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 58% | metrics | GET | /metrics/prometheus | dto, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 58% | metrics | GET | /metrics/reset | dto, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 58% | notifications | POST | /notifications/mark-all-read | dto, swagger, try/catch | backend/src/modules/notifications/notifications.controller.ts |
| 58% | notifications | GET | /notifications/my | dto, swagger, try/catch | backend/src/modules/notifications/notifications.controller.ts |
| 58% | onboarding | GET | /onboarding/sample-status | dto, swagger, try/catch | backend/src/modules/onboarding/onboarding.controller.ts |
| 58% | onboarding | POST | /onboarding/seed-sample | dto, swagger, try/catch | backend/src/modules/onboarding/onboarding.controller.ts |
| 58% | hierarchy | POST | /package-hierarchy/:packageId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 58% | hierarchy | GET | /package-hierarchy/:packageId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /package-hierarchy/:packageId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 58% | products | GET | /products/stats/dashboard | dto, swagger, try/catch | backend/src/modules/products/products.stats.controller.ts |
| 58% | reports | GET | /reports/tenant/commerce | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 58% | reports | GET | /reports/tenant/financial | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 58% | reports | GET | /reports/tenant/traffic | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 58% | hierarchy | POST | /role-hierarchy/:roleName | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 58% | hierarchy | GET | /role-hierarchy/:roleName | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /role-hierarchy/:roleName | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 58% | tenant | GET | /tenant/current | dto, swagger, try/catch | backend/src/modules/tenant/tenant.controller.ts |
| 58% | tenants | GET | /tenant/dashboard | dto, swagger, try/catch | backend/src/tenants/dashboard/dashboard.controller.ts |
| 58% | tenants | GET | /tenants/ssl/:domain/status | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 58% | tenants | GET | /tenants/ssl/admin/resync-statuses | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 58% | tenants | GET | /tenants/ssl/admin/run-automation | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 58% | hierarchy | POST | /user-hierarchy/:userId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 58% | hierarchy | GET | /user-hierarchy/:userId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 58% | hierarchy | DELETE | /user-hierarchy/:userId | guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 58% | users | GET | /users | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 58% | users | GET | /users/:id | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 58% | users | DELETE | /users/:id | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 58% | users | GET | /users/all | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 58% | users | GET | /users/me | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 72% | accounting | GET | /accounting/accounts | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | POST | /accounting/accounts | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | PUT | /accounting/accounts/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | DELETE | /accounting/accounts/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/bills | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | POST | /accounting/bills | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | PUT | /accounting/bills/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | DELETE | /accounting/bills/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/goals | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | POST | /accounting/goals | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | PUT | /accounting/goals/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | DELETE | /accounting/goals/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/invoices | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | POST | /accounting/invoices | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | PUT | /accounting/invoices/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | DELETE | /accounting/invoices/:id | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/invoices/:id/pdf | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/reports/balance-sheet | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/reports/balance-sheet/export | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/reports/profit-and-loss | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/reports/profit-and-loss/export | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/summary | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | GET | /accounting/transactions | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | accounting | POST | /accounting/transactions | swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 72% | analytics | GET | /admin/analytics/saas-overview | swagger, try/catch | backend/src/modules/analytics/analytics.controller.ts |
| 72% | logger | GET | /admin/logger/status | swagger, try/catch | backend/src/logger/logger.controller.ts |
| 72% | logger | POST | /admin/logger/test-log | swagger, try/catch | backend/src/logger/logger.controller.ts |
| 72% | logs | GET | /admin/logs/tenant/:id | swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 72% | logs | GET | /admin/logs/tenant/:id/events | swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 72% | logs | GET | /admin/logs/tenant/:id/stream | swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 72% | payments | GET | /admin/payments/failures | swagger, try/catch | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 72% | payments | GET | /admin/payments/logs | swagger, try/catch | backend/src/modules/payments/controllers/admin-payments.controller.ts |
| 72% | settings | GET | /admin/settings/application/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/application/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/basic/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/basic/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/branding/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/branding/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/calendar/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/calendar/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/currency/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/currency/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | POST | /admin/settings/email/test | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/email/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/email/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/integrations/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/integrations/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ip-restriction/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ip-restriction/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/notifications/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/notifications/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/pages/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/pages/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/payment/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/payment/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/referral/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/referral/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/reports/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/reports/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/seo/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/seo/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/system/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/system/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/tracker/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/tracker/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ui/colors/categories/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ui/colors/categories/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ui/colors/dark/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ui/colors/dark/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ui/colors/light/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ui/colors/light/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ui/toggles/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ui/toggles/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/ui/typography/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/ui/typography/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/webhooks/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/webhooks/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | GET | /admin/settings/zoom/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | settings | PUT | /admin/settings/zoom/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | themes | POST | /admin/themes | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | GET | /admin/themes | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | GET | /admin/themes/:id | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | PATCH | /admin/themes/:id | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | DELETE | /admin/themes/:id | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | PATCH | /admin/themes/:id/activate | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | themes | PATCH | /admin/themes/:id/deactivate | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 72% | ai-services | POST | /ai/complete | swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 72% | ai-services | POST | /ai/sentiment | swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 72% | ai-services | POST | /ai/suggest | swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 72% | auth | GET | /auth/github/callback | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | GET | /auth/google/callback | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/login | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/refresh | guards/roles, swagger | backend/src/modules/auth/refresh.controller.ts |
| 72% | auth | POST | /auth/register | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/request-password-reset | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/reset-password | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/send-verification-email | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/tenant-register | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | POST | /auth/verify-email | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | auth | GET | /auth/verify-email | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 72% | billing | POST | /billing/stripe/webhook | dto, guards/roles | backend/src/billing/stripe/stripe-webhook.controller.ts |
| 72% | billing | GET | /billings | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | POST | /billings | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | GET | /billings/:id | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | PUT | /billings/:id | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | DELETE | /billings/:id | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | POST | /billings/admin | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | PATCH | /billings/admin/:id | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | DELETE | /billings/admin/:id | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | billing | GET | /billings/admin/all | swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 72% | tenants | PUT | /branding | guards/roles, swagger | backend/src/tenants/branding/branding.controller.ts |
| 72% | chat | PATCH | /chat/admin/rooms/:roomId/archive | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | DELETE | /chat/admin/rooms/:roomId/members/:userId | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | GET | /chat/rooms | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | POST | /chat/rooms | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | POST | /chat/rooms/:roomId/join | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | GET | /chat/rooms/:roomId/messages | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | chat | POST | /chat/rooms/:roomId/messages | swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 72% | cms | POST | /cms/menus/:menuId/items | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | GET | /cms/menus/:menuId/items | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | PATCH | /cms/menus/:menuId/items/:itemId | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | DELETE | /cms/menus/:menuId/items/:itemId | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | POST | /cms/menus/:menuId/reorder | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | GET | /cms/menus/:menuId/tree | guards/roles, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 72% | cms | POST | /cms/templates | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | GET | /cms/templates | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | GET | /cms/templates/:id | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | PATCH | /cms/templates/:id | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | DELETE | /cms/templates/:id | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | POST | /cms/templates/:id/use | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | GET | /cms/templates/category/:category | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | cms | GET | /cms/templates/popular | guards/roles, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 72% | coupons | GET | /coupons | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | PATCH | /coupons/:couponId | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | DELETE | /coupons/:couponId | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons/:couponId/activate | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons/:couponId/deactivate | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | GET | /coupons/:couponId/usage | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons/apply | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons/bulk-actions/update-status | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | coupons | POST | /coupons/validate | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 72% | crm | GET | /crm/analytics | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | GET | /crm/companies | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | POST | /crm/companies | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | GET | /crm/contacts | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | POST | /crm/contacts | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | GET | /crm/deals | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | POST | /crm/deals | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | PATCH | /crm/deals/:id/stage | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | POST | /crm/tasks | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | PATCH | /crm/tasks/:id/completed | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | PATCH | /crm/tasks/:id/delete | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | crm | GET | /crm/tasks/my | swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 72% | custom-domains | GET | /custom-domains | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | PATCH | /custom-domains/:domainId | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | POST | /custom-domains/:domainId/activate | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | GET | /custom-domains/me | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | POST | /custom-domains/me | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | PATCH | /custom-domains/me/:domainId | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | DELETE | /custom-domains/me/:domainId | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | POST | /custom-domains/me/:domainId/primary | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | POST | /custom-domains/me/:domainId/ssl/issue | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | custom-domains | POST | /custom-domains/me/:domainId/verify | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 72% | dashboard | GET | /dashboards | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | POST | /dashboards | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | GET | /dashboards/:id | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | PUT | /dashboards/:id | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | DELETE | /dashboards/:id | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | GET | /dashboards/admin/saas-overview | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | GET | /dashboards/audit/logs | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | dashboard | GET | /dashboards/audit/logs/export | swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 72% | developer-portal | POST | /developer/api-keys | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | developer-portal | GET | /developer/api-keys | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | developer-portal | DELETE | /developer/api-keys/:keyId | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | developer-portal | POST | /developer/api-keys/:keyId/revoke | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | developer-portal | GET | /developer/webhook-logs | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | developer-portal | GET | /developer/webhook-logs/:logId | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 72% | domains | GET | /domains | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | POST | /domains | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | PATCH | /domains/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | DELETE | /domains/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | POST | /domains/:domainId/primary | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | GET | /domains/me | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | POST | /domains/me | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | PATCH | /domains/me/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | DELETE | /domains/me/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | domains | POST | /domains/me/:domainId/primary | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 72% | custom-domains | POST | /domains/tenant/:domainId/issue-ssl | swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 72% | custom-domains | POST | /domains/tenant/:domainId/verify-dns | swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 72% | custom-domains | GET | /domains/tenant/health-summary | swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 72% | custom-domains | GET | /domains/tenant/list | swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 72% | health | GET | /health/detailed | dto, guards/roles | backend/src/modules/health/health.controller.ts |
| 72% | health | GET | /health/ready | dto, guards/roles | backend/src/modules/health/health.controller.ts |
| 72% | hrm | GET | /hrm/attendance | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | POST | /hrm/attendance | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/attendance/overview | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/employees | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | POST | /hrm/employees | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/jobs | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | POST | /hrm/jobs | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/leaves | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | POST | /hrm/leaves | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | PATCH | /hrm/leaves/:id/status | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/summary | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | GET | /hrm/trainings | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | hrm | POST | /hrm/trainings | swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 72% | marketplace | POST | /marketplace/install | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | marketplace | GET | /marketplace/installs | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | marketplace | DELETE | /marketplace/installs/:pluginId | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | marketplace | GET | /marketplace/plugins | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | marketplace | POST | /marketplace/toggle | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 72% | profile | GET | /me/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | profile | PUT | /me/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | profile | GET | /me/public-profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | profile | PUT | /me/public-profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | notifications | POST | /notifications/push-subscriptions/subscribe | swagger, try/catch | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 72% | notifications | POST | /notifications/push-subscriptions/unsubscribe | swagger, try/catch | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 72% | payments | POST | /offline-payments | swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 72% | payments | GET | /offline-payments | swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 72% | payments | PATCH | /offline-payments/:id/status | swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 72% | payments | GET | /offline-payments/me | swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 72% | orders | GET | /orders | swagger, try/catch | backend/src/modules/orders/orders.controller.ts |
| 72% | orders | GET | /orders/domain/:id | swagger, try/catch | backend/src/modules/orders/orders.controller.ts |
| 72% | orders | GET | /orders/pos/:id | swagger, try/catch | backend/src/modules/orders/orders.controller.ts |
| 72% | orders | GET | /orders/stats/dashboard | swagger, try/catch | backend/src/modules/orders/orders.stats.controller.ts |
| 72% | packages | GET | /packages | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | POST | /packages | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | PATCH | /packages/:packageId | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | DELETE | /packages/:packageId | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/:packageId | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | POST | /packages/:packageId/assign | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/admin/all | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/admin/plan-summary | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | POST | /packages/admin/subscription-expire-now | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | POST | /packages/admin/subscription-expiry-warnings | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/features | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/me | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/me/can-use/:feature | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | packages | GET | /packages/me/usage | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 72% | payments | GET | /payments/logs | swagger, try/catch | backend/src/modules/payments/payments.controller.ts |
| 72% | payments | POST | /payments/paypal/capture | swagger, try/catch | backend/src/modules/payments/payments.controller.ts |
| 72% | payments | POST | /payments/webhook/paypal/capture | swagger, try/catch | backend/src/modules/payments/payments.controller.ts |
| 72% | pos | GET | /pos/orders | swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 72% | pos | POST | /pos/orders | swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 72% | pos | GET | /pos/stock | swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 72% | pos | POST | /pos/stock/adjust | swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 72% | pos | GET | /pos/summary | swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 72% | projects | GET | /projects | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | POST | /projects | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | PATCH | /projects/:id | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | GET | /projects/:projectId/tasks | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | POST | /projects/:projectId/tasks | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | GET | /projects/summary | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | PATCH | /projects/tasks/:id | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | GET | /projects/timesheets | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | projects | POST | /projects/timesheets/log | swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 72% | profile | GET | /public/profiles/:handle | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | profile | GET | /public/profiles/check-handle | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | vcards | GET | /public/vcards/:id | swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 72% | rbac | POST | /rbac/check-field-permission | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | GET | /rbac/permissions | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | POST | /rbac/permissions | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | GET | /rbac/permissions/module/:module | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | POST | /rbac/roles | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | GET | /rbac/roles | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | GET | /rbac/roles/:roleId | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | PUT | /rbac/roles/:roleId | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | DELETE | /rbac/roles/:roleId | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | POST | /rbac/users | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | GET | /rbac/users | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | PUT | /rbac/users/:userTenantId | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | DELETE | /rbac/users/:userTenantId | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | POST | /rbac/users/:userTenantId/reset-password | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | rbac | POST | /rbac/users/:userTenantId/toggle-login | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 72% | settings | GET | /settings/reports | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 72% | social | PATCH | /social/connections/:id/accept | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | PATCH | /social/connections/:id/reject | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | GET | /social/connections/my | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | GET | /social/connections/pending | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | POST | /social/connections/request | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | GET | /social/feed | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | POST | /social/posts | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | POST | /social/posts/:id/comments | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | GET | /social/posts/:id/comments | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | social | PATCH | /social/posts/:id/like | swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 72% | support | GET | /support/admin/tickets | swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 72% | support | PATCH | /support/admin/tickets/:id/status | swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 72% | support | POST | /support/tickets | swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 72% | support | GET | /support/tickets | swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 72% | profile | GET | /tenant/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | profile | PUT | /tenant/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 72% | themes | GET | /tenant/theme | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | themes | GET | /tenant/theme/css | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | themes | POST | /tenant/theme/customize | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | themes | POST | /tenant/theme/select | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | themes | GET | /tenant/theme/variables | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 72% | tenants | GET | /tenants | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | POST | /tenants | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/custom-domains | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | POST | /tenants/manual-create | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/me | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/public-directory | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | PUT | /tenants/public-profile | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/public/:slug | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/public/:slug/reviews | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | POST | /tenants/public/:slug/reviews | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | tenants | GET | /tenants/quota | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 72% | theme | GET | /themes | swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 72% | theme | POST | /themes | swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 72% | theme | GET | /themes/:id | swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 72% | theme | PUT | /themes/:id | swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 72% | theme | DELETE | /themes/:id | swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 72% | users | POST | /users | swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 72% | user | GET | /users | swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 72% | user | POST | /users | swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 72% | users | PUT | /users/:id | swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 72% | user | GET | /users/:id | swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 72% | user | PUT | /users/:id | swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 72% | user | DELETE | /users/:id | swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 72% | vcards | GET | /vcards | swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 72% | vcards | POST | /vcards | swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 72% | vcards | PUT | /vcards/:id | swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 72% | vcards | DELETE | /vcards/:id | swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 72% | workspaces | GET | /workspaces | swagger, try/catch | backend/src/workspaces/workspace.controller.ts |
| 72% | workspaces | POST | /workspaces/switch | swagger, try/catch | backend/src/workspaces/workspace.controller.ts |
| 86% | billing | POST | /billing/addons/checkout | try/catch | backend/src/billing/stripe/addons.controller.ts |
| 86% | billing | GET | /billing/affiliate/me | try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 86% | billing | POST | /billing/affiliate/payout | try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 86% | billing | POST | /billing/affiliate/record-commission | try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 86% | billing | POST | /billing/affiliate/register | try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 86% | billing | POST | /billing/lifetime/checkout | try/catch | backend/src/billing/stripe/lifetime.controller.ts |
| 86% | billing | GET | /billing/usage/:tenantId | try/catch | backend/src/billing/usage/usage.controller.ts |
| 86% | billing | GET | /billing/wallet/:tenantId | try/catch | backend/src/billing/wallet/wallet.controller.ts |
| 86% | billing | GET | /billing/wallet/:tenantId/transactions | try/catch | backend/src/billing/wallet/wallet.controller.ts |
| 86% | billing | POST | /billing/wallet/add | try/catch | backend/src/billing/wallet/wallet.controller.ts |
| 86% | chat | GET | /chat/rooms/:roomId/members | swagger | backend/src/modules/chat/chat.controller.ts |
| 86% | cms | POST | /cms/pages | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | GET | /cms/pages | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | GET | /cms/pages/:id | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | PATCH | /cms/pages/:id | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | DELETE | /cms/pages/:id | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | POST | /cms/pages/:id/duplicate | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | GET | /cms/pages/hierarchy/tree | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | cms | GET | /cms/pages/slug/:slug | try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 86% | domains | GET | /domains/availability | swagger | backend/src/modules/domains/domains.controller.ts |
| 86% | products | GET | /products | try/catch | backend/src/modules/products/products.controller.ts |
| 86% | products | GET | /products/:id | try/catch | backend/src/modules/products/products.controller.ts |
| 86% | tenants | GET | /tenants/domain/:tenantId/domains | swagger | backend/src/tenants/domain/domain.controller.ts |
| 86% | tenants | POST | /tenants/domain/map | swagger | backend/src/tenants/domain/domain.controller.ts |
| 86% | tenants | POST | /tenants/domain/update | swagger | backend/src/tenants/domain/domain.controller.ts |
| 86% | tenants | POST | /tenants/domain/verify | swagger | backend/src/tenants/domain/domain.controller.ts |
| 86% | users | POST | /users | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | GET | /users | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | GET | /users/:id | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | PATCH | /users/:id | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | DELETE | /users/:id | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | POST | /users/bulk | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | GET | /users/me | try/catch | backend/src/modules/users/users.controller.ts |
| 86% | users | GET | /users/public | try/catch | backend/src/modules/users/users.controller.ts |
| 100% | (non-module) | GET | /audit-log | — | backend/src/feature-registry/auditLog.controller.ts |
| 100% | cms | GET | /cms/menu | — | backend/src/cms/controllers/cms-menu-short.controller.ts |

## Backend Endpoints — 100% Evidence Routes

- GET /audit-log ((non-module)) — backend/src/feature-registry/auditLog.controller.ts
- GET /cms/menu (cms) — backend/src/cms/controllers/cms-menu-short.controller.ts

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
