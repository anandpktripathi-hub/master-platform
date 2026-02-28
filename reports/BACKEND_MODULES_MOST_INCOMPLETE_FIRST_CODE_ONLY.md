# Backend + Endpoints + Frontend Pages — Most Incomplete First (Code-Only)

**Generated**: 2026-02-19

**Scan source**: reports/_repo_scan_code_only.json

## Backend Modules (Most Missing First)
Sorted ascending by **Launch %** (lowest first).

| Module | Launch % | Evidence % | Done | Missing |
|---|---:|---:|---|---|
| cms | 29% | 30% | Module, Controller | Service, DTO, Schema/Entity, Tests, Migrations |
| health | 29% | 30% | Module, Controller | Service, DTO, Schema/Entity, Tests, Migrations |
| orders | 29% | 30% | Module, Controller | Service, DTO, Schema/Entity, Tests, Migrations |
| seo | 29% | 30% | Module, Controller | Service, DTO, Schema/Entity, Tests, Migrations |
| tenant | 29% | 30% | Controller, Service | Module, DTO, Schema/Entity, Tests, Migrations |
| accounting | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| ai-services | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| analytics | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| chat | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| dashboard | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| developer-portal | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| hrm | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| logs | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| marketplace | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| onboarding | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| packages | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| pos | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| products | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| projects | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| reports | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| social | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| support | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| theme | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| user | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| vcards | 43% | 45% | Module, Controller, Service | DTO, Schema/Entity, Tests, Migrations |
| coupons | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| custom-domains | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| profile | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| rbac | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| tenants | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| users | 57% | 55% | Module, Controller, Service, DTO | Schema/Entity, Tests, Migrations |
| hierarchy | 57% | 57% | Module, Controller, Service, Schema/Entity | DTO, Tests, Migrations |
| billing | 57% | 60% | Module, Controller, Service, Tests | DTO, Schema/Entity, Migrations |
| crm | 57% | 60% | Module, Controller, Service, Tests | DTO, Schema/Entity, Migrations |
| notifications | 57% | 60% | Module, Controller, Service, Tests | DTO, Schema/Entity, Migrations |
| payments | 57% | 60% | Module, Controller, Service, Tests | DTO, Schema/Entity, Migrations |
| themes | 71% | 65% | Module, Controller, Service, DTO, Schema/Entity | Tests, Migrations |
| auth | 71% | 67% | Module, Controller, Service, DTO, Schema/Entity | Tests, Migrations |
| domains | 71% | 70% | Module, Controller, Service, DTO, Tests | Schema/Entity, Migrations |
| settings | 71% | 73% | Module, Controller, Service, DTO, Schema/Entity | Tests, Migrations |

## Backend Endpoints (Route-by-route, Most Incomplete First)
Sorted ascending by **Route %** (lowest first).

| Route % | Module | Method | Path | Missing Evidence | Controller File |
|---:|---|---|---|---|---|
| 30% | (non-module) | GET | /audit-log | service-call, dto, guards/roles, swagger, try/catch | backend/src/feature-registry/auditLog.controller.ts |
| 30% | cms | GET | /cms/menu | service-call, dto, guards/roles, swagger, try/catch | backend/src/modules/cms/cms.menu.controller.ts |
| 30% | health | GET | /health | service-call, dto, guards/roles, swagger, try/catch | backend/src/modules/health/health.controller.ts |
| 30% | (non-module) | GET | /metrics | service-call, dto, guards/roles, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 30% | (non-module) | GET | /metrics/prometheus | service-call, dto, guards/roles, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 30% | (non-module) | GET | /metrics/reset | service-call, dto, guards/roles, swagger, try/catch | backend/src/metrics/metrics.controller.ts |
| 30% | orders | GET | /orders/stats/dashboard | service-call, dto, guards/roles, swagger, try/catch | backend/src/modules/orders/orders.stats.controller.ts |
| 50% | themes | DELETE | /admin/themes/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 50% | themes | PATCH | /admin/themes/:id/activate | dto, guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 50% | themes | PATCH | /admin/themes/:id/deactivate | dto, guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 50% | auth | POST | /auth/refresh | dto, guards/roles, swagger, try/catch | backend/src/modules/auth/refresh.controller.ts |
| 50% | (non-module) | POST | /auth/unified-register | dto, guards/roles, swagger, try/catch | backend/src/auth/unified-registration/unified-registration.controller.ts |
| 50% | hierarchy | DELETE | /billing-hierarchy/:billingId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 50% | hierarchy | GET | /billing-hierarchy/:billingId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 50% | hierarchy | POST | /billing-hierarchy/:billingId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/billing-hierarchy.controller.ts |
| 50% | (non-module) | POST | /billing/addons/checkout | dto, guards/roles, swagger, try/catch | backend/src/billing/stripe/addons.controller.ts |
| 50% | (non-module) | GET | /billing/analytics/revenue | service-call, dto, swagger, try/catch | backend/src/billing/analytics/revenue.controller.ts |
| 50% | (non-module) | POST | /billing/lifetime/checkout | dto, guards/roles, swagger, try/catch | backend/src/billing/stripe/lifetime.controller.ts |
| 50% | (non-module) | GET | /billing/usage/:tenantId | dto, guards/roles, swagger, try/catch | backend/src/billing/usage/usage.controller.ts |
| 50% | (non-module) | GET | /billing/wallet/:tenantId | dto, guards/roles, swagger, try/catch | backend/src/billing/wallet/wallet.controller.ts |
| 50% | (non-module) | POST | /billing/wallet/add | dto, guards/roles, swagger, try/catch | backend/src/billing/wallet/wallet.controller.ts |
| 50% | (non-module) | POST | /cms/analytics/:pageId/conversion | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 50% | (non-module) | POST | /cms/analytics/:pageId/track | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 50% | (non-module) | GET | /cms/analytics/page/:pageId | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 50% | (non-module) | GET | /cms/analytics/page/:pageId/stats | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 50% | (non-module) | GET | /cms/analytics/tenant | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-analytics.controller.ts |
| 50% | (non-module) | GET | /cms/import/history | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 50% | (non-module) | GET | /cms/import/status/:importId | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 50% | (non-module) | POST | /cms/import/upload | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-file-import.controller.ts |
| 50% | (non-module) | GET | /cms/menus/:menuId/items | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 50% | (non-module) | DELETE | /cms/menus/:menuId/items/:itemId | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 50% | (non-module) | PATCH | /cms/menus/:menuId/items/:itemId | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 50% | (non-module) | POST | /cms/menus/:menuId/reorder | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 50% | (non-module) | GET | /cms/menus/:menuId/tree | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 50% | (non-module) | GET | /cms/seo-audit/:pageId | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 50% | (non-module) | GET | /cms/seo-audit/:pageId/recommendations | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 50% | (non-module) | POST | /cms/seo-audit/:pageId/run | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-seo-audit.controller.ts |
| 50% | (non-module) | DELETE | /cms/templates/:id | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 50% | (non-module) | POST | /cms/templates/:id/use | dto, guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 50% | dashboard | GET | /dashboards/audit/logs/export | dto, guards/roles, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 50% | hierarchy | DELETE | /domain-hierarchy/:domainId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 50% | hierarchy | GET | /domain-hierarchy/:domainId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 50% | hierarchy | POST | /domain-hierarchy/:domainId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/domain-hierarchy.controller.ts |
| 50% | (non-module) | GET | /features | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | POST | /features | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | DELETE | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | GET | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id/assign-role/:role | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id/assign-tenant/:tenant | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id/toggle | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id/unassign-role/:role | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | PATCH | /features/:id/unassign-tenant/:tenant | dto, guards/roles, swagger, try/catch | backend/src/feature-registry/featureRegistry.controller.ts |
| 50% | (non-module) | GET | /health | dto, guards/roles, swagger, try/catch | backend/src/health/health.controller.ts |
| 50% | (non-module) | GET | /health/detailed | dto, guards/roles, swagger, try/catch | backend/src/health/health.controller.ts |
| 50% | (non-module) | GET | /health/ready | dto, guards/roles, swagger, try/catch | backend/src/health/health.controller.ts |
| 50% | hierarchy | GET | /hierarchy | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hierarchy | POST | /hierarchy | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hierarchy | DELETE | /hierarchy/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hierarchy | GET | /hierarchy/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hierarchy | PATCH | /hierarchy/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hierarchy | GET | /hierarchy/:id/children | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/hierarchy.controller.ts |
| 50% | hrm | GET | /hrm/attendance | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | POST | /hrm/attendance | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | POST | /hrm/employees | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | GET | /hrm/jobs | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | POST | /hrm/jobs | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | GET | /hrm/leaves | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | POST | /hrm/leaves | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | PATCH | /hrm/leaves/:id/status | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | GET | /hrm/trainings | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | hrm | POST | /hrm/trainings | dto, guards/roles, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 50% | notifications | POST | /notifications/push-subscriptions/unsubscribe | dto, guards/roles, swagger, try/catch | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 50% | hierarchy | DELETE | /package-hierarchy/:packageId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 50% | hierarchy | GET | /package-hierarchy/:packageId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 50% | hierarchy | POST | /package-hierarchy/:packageId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/package-hierarchy.controller.ts |
| 50% | payments | POST | /payments/webhook/paypal/capture | dto, guards/roles, swagger, try/catch | backend/src/modules/payments/payments.controller.ts |
| 50% | pos | POST | /pos/orders | dto, guards/roles, swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 50% | products | GET | /products/stats/dashboard | dto, guards/roles, swagger, try/catch | backend/src/modules/products/products.stats.controller.ts |
| 50% | projects | PATCH | /projects/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | projects | GET | /projects/:projectId/tasks | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | projects | POST | /projects/:projectId/tasks | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | projects | PATCH | /projects/tasks/:id | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | projects | GET | /projects/timesheets | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | projects | POST | /projects/timesheets/log | dto, guards/roles, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 50% | profile | GET | /public/profiles/:handle | dto, guards/roles, swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 50% | rbac | POST | /rbac/users/:userTenantId/toggle-login | dto, guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 50% | hierarchy | DELETE | /role-hierarchy/:roleName | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 50% | hierarchy | GET | /role-hierarchy/:roleName | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 50% | hierarchy | POST | /role-hierarchy/:roleName | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/role-hierarchy.controller.ts |
| 50% | seo | GET | /seo/tenants/:slug/feed.xml | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 50% | seo | GET | /seo/tenants/:slug/robots.txt | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 50% | seo | GET | /seo/tenants/:slug/sitemap.xml | dto, guards/roles, swagger, try/catch | backend/src/modules/seo/seo.controller.ts |
| 50% | tenant | GET | /tenants | dto, guards/roles, swagger, try/catch | backend/src/modules/tenant/tenant.controller.ts |
| 50% | tenant | POST | /tenants | dto, guards/roles, swagger, try/catch | backend/src/modules/tenant/tenant.controller.ts |
| 50% | hierarchy | DELETE | /user-hierarchy/:userId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 50% | hierarchy | GET | /user-hierarchy/:userId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 50% | hierarchy | POST | /user-hierarchy/:userId | dto, guards/roles, swagger, try/catch | backend/src/modules/hierarchy/user-hierarchy.controller.ts |
| 50% | users | GET | /users/stats/dashboard | dto, guards/roles, swagger, try/catch | backend/src/modules/users/users.stats.controller.ts |
| 55% | (non-module) | GET | /tenants/domain/:tenantId/domains | dto, guards/roles, swagger | backend/src/tenants/domain/domain.controller.ts |
| 60% | products | GET | /products | dto, guards/roles, try/catch | backend/src/modules/products/products.controller.ts |
| 60% | products | GET | /products/:id | dto, guards/roles, try/catch | backend/src/modules/products/products.controller.ts |
| 65% | themes | GET | /admin/themes/:id | guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 65% | themes | PATCH | /admin/themes/:id | guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 65% | (non-module) | GET | /branding | guards/roles, swagger, try/catch | backend/src/tenants/branding/branding.controller.ts |
| 65% | (non-module) | PUT | /branding | guards/roles, swagger, try/catch | backend/src/tenants/branding/branding.controller.ts |
| 65% | (non-module) | POST | /cms/import/figma | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-import.controller.ts |
| 65% | (non-module) | POST | /cms/import/zip | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-import.controller.ts |
| 65% | (non-module) | POST | /cms/menus/:menuId/items | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-menu.controller.ts |
| 65% | (non-module) | GET | /cms/templates | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | (non-module) | POST | /cms/templates | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | (non-module) | GET | /cms/templates/:id | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | (non-module) | PATCH | /cms/templates/:id | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | (non-module) | GET | /cms/templates/category/:category | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | (non-module) | GET | /cms/templates/popular | guards/roles, swagger, try/catch | backend/src/cms/controllers/cms-template.controller.ts |
| 65% | rbac | GET | /rbac/permissions | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | POST | /rbac/permissions | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | GET | /rbac/permissions/module/:module | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | GET | /rbac/roles | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | POST | /rbac/roles | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | DELETE | /rbac/roles/:roleId | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | GET | /rbac/roles/:roleId | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | PUT | /rbac/roles/:roleId | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | GET | /rbac/users | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | POST | /rbac/users | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | DELETE | /rbac/users/:userTenantId | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | PUT | /rbac/users/:userTenantId | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | rbac | POST | /rbac/users/:userTenantId/reset-password | guards/roles, swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 65% | themes | POST | /tenant/theme/customize | guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 65% | themes | POST | /tenant/theme/select | guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 65% | themes | GET | /tenant/theme/variables | guards/roles, swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 70% | accounting | GET | /accounting/accounts | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | POST | /accounting/accounts | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | DELETE | /accounting/accounts/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | PUT | /accounting/accounts/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/bills | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | POST | /accounting/bills | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | DELETE | /accounting/bills/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | PUT | /accounting/bills/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/goals | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | POST | /accounting/goals | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | DELETE | /accounting/goals/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | PUT | /accounting/goals/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/invoices | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | POST | /accounting/invoices | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | DELETE | /accounting/invoices/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | PUT | /accounting/invoices/:id | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/invoices/:id/pdf | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/reports/balance-sheet | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/reports/balance-sheet/export | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/reports/profit-and-loss | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/reports/profit-and-loss/export | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/summary | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | GET | /accounting/transactions | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | accounting | POST | /accounting/transactions | dto, swagger, try/catch | backend/src/modules/accounting/accounting.controller.ts |
| 70% | analytics | GET | /admin/analytics/saas-overview | dto, swagger, try/catch | backend/src/modules/analytics/analytics.controller.ts |
| 70% | logs | GET | /admin/logs/tenant/:id | dto, swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 70% | logs | GET | /admin/logs/tenant/:id/events | dto, swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 70% | logs | GET | /admin/logs/tenant/:id/stream | dto, swagger, try/catch | backend/src/modules/logs/tenant-log.controller.ts |
| 70% | ai-services | POST | /ai/complete | dto, swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 70% | ai-services | POST | /ai/sentiment | dto, swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 70% | ai-services | POST | /ai/suggest | dto, swagger, try/catch | backend/src/modules/ai-services/ai-services.controller.ts |
| 70% | auth | GET | /auth/github | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | GET | /auth/github/callback | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | GET | /auth/google | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | GET | /auth/google/callback | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | POST | /auth/request-password-reset | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | POST | /auth/reset-password | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | POST | /auth/send-verification-email | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | GET | /auth/verify-email | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | auth | POST | /auth/verify-email | dto, swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 70% | (non-module) | GET | /billing/affiliate/me | dto, swagger, try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 70% | (non-module) | POST | /billing/affiliate/payout | dto, swagger, try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 70% | (non-module) | POST | /billing/affiliate/record-commission | dto, swagger, try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 70% | (non-module) | POST | /billing/affiliate/register | dto, swagger, try/catch | backend/src/billing/affiliate/commission.controller.ts |
| 70% | billing | GET | /billings | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | POST | /billings | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | DELETE | /billings/:id | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | GET | /billings/:id | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | PUT | /billings/:id | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | POST | /billings/admin | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | DELETE | /billings/admin/:id | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | PATCH | /billings/admin/:id | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | billing | GET | /billings/admin/all | dto, swagger, try/catch | backend/src/modules/billing/billing.controller.ts |
| 70% | chat | PATCH | /chat/admin/rooms/:roomId/archive | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | DELETE | /chat/admin/rooms/:roomId/members/:userId | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | GET | /chat/rooms | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | POST | /chat/rooms | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | POST | /chat/rooms/:roomId/join | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | GET | /chat/rooms/:roomId/members | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | GET | /chat/rooms/:roomId/messages | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | chat | POST | /chat/rooms/:roomId/messages | dto, swagger, try/catch | backend/src/modules/chat/chat.controller.ts |
| 70% | (non-module) | GET | /cms/pages | dto, swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 70% | (non-module) | DELETE | /cms/pages/:id | dto, swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 70% | (non-module) | POST | /cms/pages/:id/duplicate | dto, swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 70% | (non-module) | GET | /cms/pages/hierarchy/tree | dto, swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 70% | coupons | DELETE | /coupons/:couponId | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | POST | /coupons/:couponId/activate | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | POST | /coupons/:couponId/deactivate | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | GET | /coupons/:couponId/usage | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | POST | /coupons/apply | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | POST | /coupons/bulk-actions/update-status | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | coupons | POST | /coupons/validate | dto, swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 70% | crm | GET | /crm/analytics | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | GET | /crm/companies | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | POST | /crm/companies | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | GET | /crm/contacts | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | POST | /crm/contacts | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | GET | /crm/deals | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | POST | /crm/deals | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | PATCH | /crm/deals/:id/stage | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | POST | /crm/tasks | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | PATCH | /crm/tasks/:id/completed | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | PATCH | /crm/tasks/:id/delete | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | crm | GET | /crm/tasks/my | dto, swagger, try/catch | backend/src/modules/crm/crm.controller.ts |
| 70% | custom-domains | GET | /custom-domains | dto, swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 70% | custom-domains | DELETE | /custom-domains/me/:domainId | dto, swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 70% | custom-domains | POST | /custom-domains/me/:domainId/ssl/issue | dto, swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 70% | custom-domains | POST | /custom-domains/me/:domainId/verify | dto, swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 70% | dashboard | GET | /dashboards | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | POST | /dashboards | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | DELETE | /dashboards/:id | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | GET | /dashboards/:id | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | PUT | /dashboards/:id | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | GET | /dashboards/admin/saas-overview | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | dashboard | GET | /dashboards/audit/logs | dto, swagger, try/catch | backend/src/modules/dashboard/dashboard.controller.ts |
| 70% | developer-portal | GET | /developer/api-keys | dto, swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 70% | developer-portal | DELETE | /developer/api-keys/:keyId | dto, swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 70% | developer-portal | POST | /developer/api-keys/:keyId/revoke | dto, swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 70% | developer-portal | GET | /developer/webhook-logs | dto, swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 70% | developer-portal | GET | /developer/webhook-logs/:logId | dto, swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 70% | domains | DELETE | /domains/:domainId | dto, swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 70% | domains | POST | /domains/:domainId/primary | dto, swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 70% | domains | POST | /domains/me/:domainId/primary | dto, swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 70% | custom-domains | POST | /domains/tenant/:domainId/issue-ssl | dto, swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 70% | custom-domains | POST | /domains/tenant/:domainId/verify-dns | dto, swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 70% | custom-domains | GET | /domains/tenant/health-summary | dto, swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 70% | custom-domains | GET | /domains/tenant/list | dto, swagger, try/catch | backend/src/modules/custom-domains/tenant-domains.controller.ts |
| 70% | hrm | GET | /hrm/attendance/overview | dto, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 70% | hrm | GET | /hrm/employees | dto, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 70% | hrm | GET | /hrm/summary | dto, swagger, try/catch | backend/src/modules/hrm/hrm.controller.ts |
| 70% | marketplace | GET | /marketplace/installs | dto, swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 70% | marketplace | DELETE | /marketplace/installs/:pluginId | dto, swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 70% | marketplace | POST | /marketplace/toggle | dto, swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 70% | notifications | POST | /notifications/mark-all-read | dto, swagger, try/catch | backend/src/modules/notifications/notifications.controller.ts |
| 70% | notifications | GET | /notifications/my | dto, swagger, try/catch | backend/src/modules/notifications/notifications.controller.ts |
| 70% | notifications | POST | /notifications/push-subscriptions/subscribe | dto, swagger, try/catch | backend/src/modules/notifications/push-subscriptions.controller.ts |
| 70% | payments | GET | /offline-payments | dto, swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 70% | payments | POST | /offline-payments | dto, swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 70% | payments | PATCH | /offline-payments/:id/status | dto, swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 70% | payments | GET | /offline-payments/me | dto, swagger, try/catch | backend/src/modules/payments/controllers/offline-payments.controller.ts |
| 70% | onboarding | GET | /onboarding/sample-status | dto, swagger, try/catch | backend/src/modules/onboarding/onboarding.controller.ts |
| 70% | onboarding | POST | /onboarding/seed-sample | dto, swagger, try/catch | backend/src/modules/onboarding/onboarding.controller.ts |
| 70% | packages | DELETE | /packages/:packageId | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/:packageId | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | POST | /packages/:packageId/assign | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/admin/all | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/admin/plan-summary | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | POST | /packages/admin/subscription-expire-now | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | POST | /packages/admin/subscription-expiry-warnings | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/features | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/me | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | packages | GET | /packages/me/usage | dto, swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 70% | payments | GET | /payments/logs | dto, swagger, try/catch | backend/src/modules/payments/payments.controller.ts |
| 70% | pos | GET | /pos/orders | dto, swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 70% | pos | GET | /pos/stock | dto, swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 70% | pos | POST | /pos/stock/adjust | dto, swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 70% | pos | GET | /pos/summary | dto, swagger, try/catch | backend/src/modules/pos/pos.controller.ts |
| 70% | projects | GET | /projects | dto, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 70% | projects | POST | /projects | dto, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 70% | projects | GET | /projects/summary | dto, swagger, try/catch | backend/src/modules/projects/projects.controller.ts |
| 70% | profile | GET | /public/profiles/check-handle | dto, swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 70% | vcards | GET | /public/vcards/:id | dto, swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 70% | reports | GET | /reports/tenant/commerce | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 70% | reports | GET | /reports/tenant/financial | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 70% | reports | GET | /reports/tenant/traffic | dto, swagger, try/catch | backend/src/modules/reports/reports.controller.ts |
| 70% | social | PATCH | /social/connections/:id/accept | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | PATCH | /social/connections/:id/reject | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | GET | /social/connections/my | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | GET | /social/connections/pending | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | POST | /social/connections/request | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | GET | /social/feed | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | POST | /social/posts | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | GET | /social/posts/:id/comments | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | POST | /social/posts/:id/comments | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | social | PATCH | /social/posts/:id/like | dto, swagger, try/catch | backend/src/modules/social/social.controller.ts |
| 70% | support | GET | /support/admin/tickets | dto, swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 70% | support | PATCH | /support/admin/tickets/:id/status | dto, swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 70% | support | GET | /support/tickets | dto, swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 70% | support | POST | /support/tickets | dto, swagger, try/catch | backend/src/modules/support/support.controller.ts |
| 70% | (non-module) | GET | /tenant/dashboard | dto, swagger, try/catch | backend/src/tenants/dashboard/dashboard.controller.ts |
| 70% | tenants | GET | /tenants/custom-domains | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | tenants | GET | /tenants/public-directory | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | tenants | GET | /tenants/public/:slug | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | tenants | GET | /tenants/public/:slug/reviews | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | tenants | POST | /tenants/public/:slug/reviews | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | tenants | GET | /tenants/quota | dto, swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 70% | (non-module) | GET | /tenants/ssl/:domain/status | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 70% | (non-module) | GET | /tenants/ssl/admin/resync-statuses | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 70% | (non-module) | GET | /tenants/ssl/admin/run-automation | dto, swagger, try/catch | backend/src/tenants/ssl/ssl.controller.ts |
| 70% | theme | GET | /themes | dto, swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 70% | theme | POST | /themes | dto, swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 70% | theme | DELETE | /themes/:id | dto, swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 70% | theme | GET | /themes/:id | dto, swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 70% | theme | PUT | /themes/:id | dto, swagger, try/catch | backend/src/modules/theme/theme.controller.ts |
| 70% | users | GET | /users | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | user | GET | /users | dto, swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 70% | users | POST | /users | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | user | POST | /users | dto, swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 70% | users | DELETE | /users/:id | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | user | DELETE | /users/:id | dto, swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 70% | users | GET | /users/:id | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | user | GET | /users/:id | dto, swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 70% | users | PUT | /users/:id | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | user | PUT | /users/:id | dto, swagger, try/catch | backend/src/modules/user/user.controller.ts |
| 70% | users | GET | /users/all | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | users | GET | /users/me | dto, swagger, try/catch | backend/src/modules/users/user.controller.ts |
| 70% | vcards | GET | /vcards | dto, swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 70% | vcards | POST | /vcards | dto, swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 70% | vcards | DELETE | /vcards/:id | dto, swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 70% | vcards | PUT | /vcards/:id | dto, swagger, try/catch | backend/src/modules/vcards/vcards.controller.ts |
| 70% | (non-module) | GET | /workspaces | dto, swagger, try/catch | backend/src/workspaces/workspace.controller.ts |
| 70% | (non-module) | POST | /workspaces/switch | dto, swagger, try/catch | backend/src/workspaces/workspace.controller.ts |
| 70% | (non-module) | POST | /tenants/domain/map | guards/roles, swagger | backend/src/tenants/domain/domain.controller.ts |
| 70% | (non-module) | POST | /tenants/domain/update | guards/roles, swagger | backend/src/tenants/domain/domain.controller.ts |
| 75% | domains | GET | /domains/availability | dto, swagger | backend/src/modules/domains/domains.controller.ts |
| 75% | domains | DELETE | /domains/me/:domainId | dto, swagger | backend/src/modules/domains/domains.controller.ts |
| 80% | users | GET | /users | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 80% | users | DELETE | /users/:id | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 80% | users | GET | /users/:id | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 80% | users | PATCH | /users/:id | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 80% | users | GET | /users/me | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 80% | users | GET | /users/public | dto, try/catch | backend/src/modules/users/users.controller.ts |
| 85% | settings | GET | /admin/settings/application/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/application/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/basic/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/basic/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/branding/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/branding/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/calendar/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/calendar/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/currency/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/currency/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | POST | /admin/settings/email/test | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/email/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/email/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/integrations/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/integrations/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ip-restriction/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ip-restriction/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/notifications/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/notifications/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/pages/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/pages/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/payment/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/payment/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/referral/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/referral/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/reports/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/reports/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/seo/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/seo/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/system/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/system/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/tracker/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/tracker/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ui/colors/categories/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ui/colors/categories/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ui/colors/dark/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ui/colors/dark/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ui/colors/light/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ui/colors/light/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ui/toggles/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ui/toggles/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/ui/typography/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/ui/typography/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/webhooks/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/webhooks/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | GET | /admin/settings/zoom/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | settings | PUT | /admin/settings/zoom/typed | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | themes | GET | /admin/themes | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 85% | themes | POST | /admin/themes | swagger, try/catch | backend/src/modules/themes/controllers/admin-themes.controller.ts |
| 85% | auth | POST | /auth/login | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 85% | auth | POST | /auth/logout | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 85% | auth | POST | /auth/register | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 85% | auth | POST | /auth/tenant-register | swagger, try/catch | backend/src/modules/auth/auth.controller.ts |
| 85% | (non-module) | POST | /cms/pages | swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 85% | (non-module) | GET | /cms/pages/:id | swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 85% | (non-module) | PATCH | /cms/pages/:id | swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 85% | (non-module) | GET | /cms/pages/slug/:slug | swagger, try/catch | backend/src/cms/controllers/cms-page.controller.ts |
| 85% | coupons | GET | /coupons | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 85% | coupons | POST | /coupons | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 85% | coupons | PATCH | /coupons/:couponId | swagger, try/catch | backend/src/modules/coupons/coupons.controller.ts |
| 85% | custom-domains | PATCH | /custom-domains/:domainId | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | custom-domains | POST | /custom-domains/:domainId/activate | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | custom-domains | GET | /custom-domains/me | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | custom-domains | POST | /custom-domains/me | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | custom-domains | PATCH | /custom-domains/me/:domainId | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | custom-domains | POST | /custom-domains/me/:domainId/primary | swagger, try/catch | backend/src/modules/custom-domains/custom-domains.controller.ts |
| 85% | developer-portal | POST | /developer/api-keys | swagger, try/catch | backend/src/modules/developer-portal/developer-portal.controller.ts |
| 85% | domains | GET | /domains | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | domains | POST | /domains | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | domains | PATCH | /domains/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | domains | GET | /domains/me | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | domains | POST | /domains/me | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | domains | PATCH | /domains/me/:domainId | swagger, try/catch | backend/src/modules/domains/domains.controller.ts |
| 85% | marketplace | POST | /marketplace/install | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 85% | marketplace | GET | /marketplace/plugins | swagger, try/catch | backend/src/modules/marketplace/marketplace.controller.ts |
| 85% | profile | GET | /me/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | profile | PUT | /me/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | profile | GET | /me/public-profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | profile | PUT | /me/public-profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | packages | GET | /packages | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 85% | packages | POST | /packages | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 85% | packages | PATCH | /packages/:packageId | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 85% | packages | GET | /packages/me/can-use/:feature | swagger, try/catch | backend/src/modules/packages/packages.controller.ts |
| 85% | rbac | POST | /rbac/check-field-permission | swagger, try/catch | backend/src/modules/rbac/rbac.controller.ts |
| 85% | settings | GET | /settings/reports | swagger, try/catch | backend/src/modules/settings/settings.controller.ts |
| 85% | profile | GET | /tenant/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | profile | PUT | /tenant/profile | swagger, try/catch | backend/src/modules/profile/profile.controller.ts |
| 85% | themes | GET | /tenant/theme | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 85% | themes | GET | /tenant/theme/css | swagger, try/catch | backend/src/modules/themes/controllers/tenant-themes.controller.ts |
| 85% | tenants | POST | /tenants/manual-create | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 85% | tenants | GET | /tenants/me | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 85% | tenants | PUT | /tenants/public-profile | swagger, try/catch | backend/src/modules/tenants/tenants.controller.ts |
| 90% | (non-module) | POST | /tenants/domain/verify | swagger | backend/src/tenants/domain/domain.controller.ts |
| 95% | users | POST | /users | try/catch | backend/src/modules/users/users.controller.ts |
| 95% | users | POST | /users/bulk | try/catch | backend/src/modules/users/users.controller.ts |

## Frontend Pages (Page-by-page, Most Incomplete First)
Sorted ascending by **Page %** (lowest first).

| Page % | Page | Visible in Router | Has API Calls | Has Forms | Missing | File |
|---:|---|---:|---:|---:|---|---|
| 40% | billingService | No | No | No | visible-in-router, api-calls, forms | frontend/src/pages/services/billingService.ts |
| 40% | CurrentPlanCard | No | No | No | visible-in-router, api-calls, forms | frontend/src/pages/packages/CurrentPlanCard.tsx |
| 40% | index | No | No | No | visible-in-router, api-calls, forms | frontend/src/pages/admin/index.tsx |
| 40% | NotAuthorized | No | No | No | visible-in-router, api-calls, forms | frontend/src/pages/NotAuthorized.tsx |
| 40% | Users | No | No | No | visible-in-router, api-calls, forms | frontend/src/pages/Users.tsx |
| 60% | AuditLogViewer | No | Yes | No | visible-in-router, forms | frontend/src/pages/admin/AuditLogViewer.tsx |
| 60% | PlanManager | No | Yes | No | visible-in-router, forms | frontend/src/pages/admin/PlanManager.tsx |
| 60% | Pricing | No | Yes | No | visible-in-router, forms | frontend/src/pages/Pricing.tsx |
| 60% | Settings | No | Yes | No | visible-in-router, forms | frontend/src/pages/Settings.tsx |
| 70% | AdminThemesPage | Yes | No | No | api-calls, forms | frontend/src/pages/admin/AdminThemesPage.tsx |
| 70% | CmsPageBuilder | Yes | No | No | api-calls, forms | frontend/src/pages/CmsPageBuilder.tsx |
| 70% | CustomDomainRequestModal | No | Yes | Yes | visible-in-router | frontend/src/pages/domains/CustomDomainRequestModal.tsx |
| 70% | DomainCreateModal | No | Yes | Yes | visible-in-router | frontend/src/pages/domains/DomainCreateModal.tsx |
| 70% | HierarchyManagement | Yes | No | No | api-calls, forms | frontend/src/pages/HierarchyManagement.tsx |
| 70% | HrmDashboard | Yes | No | No | api-calls, forms | frontend/src/pages/HrmDashboard.tsx |
| 70% | LandingPage | Yes | No | No | api-calls, forms | frontend/src/pages/LandingPage.tsx |
| 70% | PosDashboard | Yes | No | No | api-calls, forms | frontend/src/pages/PosDashboard.tsx |
| 70% | ProjectsDashboard | Yes | No | No | api-calls, forms | frontend/src/pages/ProjectsDashboard.tsx |
| 70% | Register | No | Yes | Yes | visible-in-router | frontend/src/pages/Register.tsx |
| 70% | TenantThemeCustomizerPage | Yes | No | No | api-calls, forms | frontend/src/pages/app/theme/TenantThemeCustomizerPage.tsx |
| 70% | TenantThemeCustomizerPage | Yes | No | No | api-calls, forms | frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx |
| 70% | TenantThemeSelectorPage | Yes | No | No | api-calls, forms | frontend/src/pages/app/theme/TenantThemeSelectorPage.tsx |
| 70% | TenantThemeSelectorPage | Yes | No | No | api-calls, forms | frontend/src/pages/tenant/TenantThemeSelectorPage.tsx |
| 70% | VcardPublicView | Yes | No | No | api-calls, forms | frontend/src/pages/VcardPublicView.tsx |
| 70% | VcardsManager | Yes | No | No | api-calls, forms | frontend/src/pages/VcardsManager.tsx |
| 80% | BillingStripeCheckoutPage | Yes | No | Yes | api-calls | frontend/src/pages/BillingStripeCheckoutPage.tsx |
| 80% | Login | Yes | No | Yes | api-calls | frontend/src/pages/Login.tsx |
| 90% | AccountingDashboard | Yes | Yes | No | forms | frontend/src/pages/AccountingDashboard.tsx |
| 90% | ActivityFeedPage | Yes | Yes | No | forms | frontend/src/pages/ActivityFeedPage.tsx |
| 90% | AdminBillingAnalyticsPage | Yes | Yes | No | forms | frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx |
| 90% | AdminDomainsPage | Yes | Yes | No | forms | frontend/src/pages/admin/AdminDomainsPage.tsx |
| 90% | AdminInvoicesPage | Yes | Yes | No | forms | frontend/src/pages/admin/AdminInvoicesPage.tsx |
| 90% | AdminNavigationMapPage | Yes | Yes | No | forms | frontend/src/pages/admin/AdminNavigationMapPage.tsx |
| 90% | AdminSupportTickets | Yes | Yes | No | forms | frontend/src/pages/AdminSupportTickets.tsx |
| 90% | AdvancedSettings | Yes | Yes | No | forms | frontend/src/pages/AdvancedSettings.tsx |
| 90% | AffiliateDashboard | Yes | Yes | No | forms | frontend/src/pages/AffiliateDashboard.tsx |
| 90% | ApiDocsPage | Yes | Yes | No | forms | frontend/src/pages/ApiDocsPage.tsx |
| 90% | AuditLogs | Yes | Yes | No | forms | frontend/src/pages/dashboard/AuditLogs.tsx |
| 90% | BillingDashboard | Yes | Yes | No | forms | frontend/src/pages/BillingDashboard.tsx |
| 90% | BillingPaypalReturn | Yes | Yes | No | forms | frontend/src/pages/BillingPaypalReturn.tsx |
| 90% | BusinessDirectory | Yes | Yes | No | forms | frontend/src/pages/BusinessDirectory.tsx |
| 90% | BusinessProfilePublicView | Yes | Yes | No | forms | frontend/src/pages/BusinessProfilePublicView.tsx |
| 90% | CmsAnalyticsPage | Yes | Yes | No | forms | frontend/src/pages/cms/CmsAnalyticsPage.tsx |
| 90% | CmsMenuManagement | Yes | Yes | No | forms | frontend/src/pages/dashboard/CmsMenuManagement.tsx |
| 90% | CmsSeoAuditPage | Yes | Yes | No | forms | frontend/src/pages/cms/CmsSeoAuditPage.tsx |
| 90% | CompanySettings | Yes | Yes | No | forms | frontend/src/pages/CompanySettings.tsx |
| 90% | ConnectionRequestsPage | Yes | Yes | No | forms | frontend/src/pages/ConnectionRequestsPage.tsx |
| 90% | CrmAnalyticsPage | Yes | Yes | No | forms | frontend/src/pages/CrmAnalyticsPage.tsx |
| 90% | CrmCompaniesPage | Yes | Yes | No | forms | frontend/src/pages/CrmCompaniesPage.tsx |
| 90% | CrmContactsPage | Yes | Yes | No | forms | frontend/src/pages/CrmContactsPage.tsx |
| 90% | CrmDealsPage | Yes | Yes | No | forms | frontend/src/pages/CrmDealsPage.tsx |
| 90% | CrmKanbanPage | Yes | Yes | No | forms | frontend/src/pages/CrmKanbanPage.tsx |
| 90% | CrmMyTasksPage | Yes | Yes | No | forms | frontend/src/pages/CrmMyTasksPage.tsx |
| 90% | CustomDomains | Yes | Yes | No | forms | frontend/src/pages/dashboard/CustomDomains.tsx |
| 90% | Dashboard | Yes | Yes | No | forms | frontend/src/pages/Dashboard.tsx |
| 90% | DomainListPage | Yes | Yes | No | forms | frontend/src/pages/domains/DomainListPage.tsx |
| 90% | Invoices | Yes | Yes | No | forms | frontend/src/pages/Invoices.tsx |
| 90% | MarketplacePage | Yes | Yes | No | forms | frontend/src/pages/marketplace/MarketplacePage.tsx |
| 90% | MyConnectionsPage | Yes | Yes | No | forms | frontend/src/pages/MyConnectionsPage.tsx |
| 90% | NotificationCenterPage | Yes | Yes | No | forms | frontend/src/pages/NotificationCenterPage.tsx |
| 90% | Onboarding | Yes | Yes | No | forms | frontend/src/pages/Onboarding.tsx |
| 90% | PackageFeatures | Yes | Yes | No | forms | frontend/src/pages/dashboard/PackageFeatures.tsx |
| 90% | PaymentLogsPage | Yes | Yes | No | forms | frontend/src/pages/admin/PaymentLogsPage.tsx |
| 90% | PlatformOverviewDashboard | Yes | Yes | No | forms | frontend/src/pages/admin/PlatformOverviewDashboard.tsx |
| 90% | ProfilePublicEdit | Yes | Yes | No | forms | frontend/src/pages/ProfilePublicEdit.tsx |
| 90% | ProfileSettings | Yes | Yes | No | forms | frontend/src/pages/ProfileSettings.tsx |
| 90% | PublicUserProfileView | Yes | Yes | No | forms | frontend/src/pages/PublicUserProfileView.tsx |
| 90% | SeoToolsPage | Yes | Yes | No | forms | frontend/src/pages/SeoToolsPage.tsx |
| 90% | SignupWizard | Yes | Yes | No | forms | frontend/src/pages/SignupWizard.tsx |
| 90% | SupportTickets | Yes | Yes | No | forms | frontend/src/pages/SupportTickets.tsx |
| 90% | SystemHealthPage | Yes | Yes | No | forms | frontend/src/pages/dashboard/SystemHealthPage.tsx |
| 90% | TeamChatPage | Yes | Yes | No | forms | frontend/src/pages/TeamChatPage.tsx |
| 90% | TenantDomainHealthPage | Yes | Yes | No | forms | frontend/src/pages/domains/TenantDomainHealthPage.tsx |
| 90% | TenantQuotaUsage | Yes | Yes | No | forms | frontend/src/pages/dashboard/TenantQuotaUsage.tsx |
| 90% | Tenants | Yes | Yes | No | forms | frontend/src/pages/admin/Tenants.tsx |
| 90% | UiSettings | Yes | Yes | No | forms | frontend/src/pages/UiSettings.tsx |
| 90% | VerifyEmail | Yes | Yes | No | forms | frontend/src/pages/VerifyEmail.tsx |
| 100% | AiToolsPage | Yes | Yes | Yes | — | frontend/src/pages/AiToolsPage.tsx |
| 100% | DeveloperPortalPage | Yes | Yes | Yes | — | frontend/src/pages/developer/DeveloperPortalPage.tsx |
| 100% | ForgotPassword | Yes | Yes | Yes | — | frontend/src/pages/ForgotPassword.tsx |
| 100% | ManageRoles | Yes | Yes | Yes | — | frontend/src/pages/ManageRoles.tsx |
| 100% | ManageUsers | Yes | Yes | Yes | — | frontend/src/pages/ManageUsers.tsx |
| 100% | PackagesPage | Yes | Yes | Yes | — | frontend/src/pages/packages/PackagesPage.tsx |
| 100% | ResetPassword | Yes | Yes | Yes | — | frontend/src/pages/ResetPassword.tsx |