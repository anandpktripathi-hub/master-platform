# Most Incomplete First (Code-Only)

Generated: 2026-02-28T14:09:03.425Z

## Backend Modules (Overall %)

| Module | Overall % | Structural % | Avg Route % | Routes | Missing (structural) |
|---|---:|---:|---:|---:|---|
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

## Backend Endpoints (Route %)

## Backend Controllers (Avg Route %)

| Avg Route % | Module | Routes | Controller File |
|---:|---|---:|---|
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

| Route % | Module | Method | Path | Missing Evidence | Controller File |
|---:|---|---|---|---|---|
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

## Frontend Pages (Page %)

| Page % | Visible | Workable | Page | File |
|---:|---|---|---|---|
| 0% | No | No | AffiliateDashboard.tsx | frontend/src/billing/AffiliateDashboard.tsx |
| 0% | No | No | OfflinePaymentsAdminPage.tsx | frontend/src/billing/OfflinePaymentsAdminPage.tsx |
| 0% | No | No | OfflinePaymentsPage.tsx | frontend/src/billing/OfflinePaymentsPage.tsx |
| 0% | No | No | RevenueDashboard.tsx | frontend/src/billing/RevenueDashboard.tsx |
| 0% | No | No | UsageDashboard.tsx | frontend/src/billing/UsageDashboard.tsx |
| 0% | No | No | WalletManager.tsx | frontend/src/billing/WalletManager.tsx |
| 0% | No | No | AccountingDashboard.tsx | frontend/src/pages/AccountingDashboard.tsx |
| 0% | No | No | AdminBillingAnalyticsPage.tsx | frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx |
| 0% | No | No | AdminDomainsPage.tsx | frontend/src/pages/admin/AdminDomainsPage.tsx |
| 0% | No | No | AdminInvoicesPage.tsx | frontend/src/pages/admin/AdminInvoicesPage.tsx |
| 0% | No | No | AdminNavigationMapPage.tsx | frontend/src/pages/admin/AdminNavigationMapPage.tsx |
| 0% | No | No | AdminThemesPage.tsx | frontend/src/pages/admin/AdminThemesPage.tsx |
| 0% | No | No | AuditLogViewer.tsx | frontend/src/pages/admin/AuditLogViewer.tsx |
| 0% | No | No | index.tsx | frontend/src/pages/admin/index.tsx |
| 0% | No | No | PaymentLogsPage.tsx | frontend/src/pages/admin/PaymentLogsPage.tsx |
| 0% | No | No | PlanManager.tsx | frontend/src/pages/admin/PlanManager.tsx |
| 0% | No | No | PlatformOverviewDashboard.tsx | frontend/src/pages/admin/PlatformOverviewDashboard.tsx |
| 0% | No | No | Tenants.tsx | frontend/src/pages/admin/Tenants.tsx |
| 0% | No | No | AdminSupportTickets.tsx | frontend/src/pages/AdminSupportTickets.tsx |
| 0% | No | No | AdvancedSettings.tsx | frontend/src/pages/AdvancedSettings.tsx |
| 0% | No | No | AiToolsPage.tsx | frontend/src/pages/AiToolsPage.tsx |
| 0% | No | No | CmsAnalyticsPage.tsx | frontend/src/pages/cms/CmsAnalyticsPage.tsx |
| 0% | No | No | CmsSeoAuditPage.tsx | frontend/src/pages/cms/CmsSeoAuditPage.tsx |
| 0% | No | No | AuditLogs.tsx | frontend/src/pages/dashboard/AuditLogs.tsx |
| 0% | No | No | CmsMenuManagement.tsx | frontend/src/pages/dashboard/CmsMenuManagement.tsx |
| 0% | No | No | CustomDomains.tsx | frontend/src/pages/dashboard/CustomDomains.tsx |
| 0% | No | No | PackageFeatures.tsx | frontend/src/pages/dashboard/PackageFeatures.tsx |
| 0% | No | No | SystemHealthPage.tsx | frontend/src/pages/dashboard/SystemHealthPage.tsx |
| 0% | No | No | TenantQuotaUsage.tsx | frontend/src/pages/dashboard/TenantQuotaUsage.tsx |
| 0% | No | No | DeveloperPortalPage.tsx | frontend/src/pages/developer/DeveloperPortalPage.tsx |
| 0% | No | No | CustomDomainRequestModal.tsx | frontend/src/pages/domains/CustomDomainRequestModal.tsx |
| 0% | No | No | DomainCreateModal.tsx | frontend/src/pages/domains/DomainCreateModal.tsx |
| 0% | No | No | DomainListPage.tsx | frontend/src/pages/domains/DomainListPage.tsx |
| 0% | No | No | TenantDomainHealthPage.tsx | frontend/src/pages/domains/TenantDomainHealthPage.tsx |
| 0% | No | No | HrmDashboard.tsx | frontend/src/pages/HrmDashboard.tsx |
| 0% | No | No | MarketplacePage.tsx | frontend/src/pages/marketplace/MarketplacePage.tsx |
| 0% | No | No | NotAuthorized.tsx | frontend/src/pages/NotAuthorized.tsx |
| 0% | No | No | CurrentPlanCard.tsx | frontend/src/pages/packages/CurrentPlanCard.tsx |
| 0% | No | No | PackagesPage.tsx | frontend/src/pages/packages/PackagesPage.tsx |
| 0% | No | No | PosDashboard.tsx | frontend/src/pages/PosDashboard.tsx |
| 0% | No | No | Pricing.tsx | frontend/src/pages/Pricing.tsx |
| 0% | No | No | ProjectsDashboard.tsx | frontend/src/pages/ProjectsDashboard.tsx |
| 0% | No | No | Register.tsx | frontend/src/pages/Register.tsx |
| 0% | No | No | SeoToolsPage.tsx | frontend/src/pages/SeoToolsPage.tsx |
| 0% | No | No | Settings.tsx | frontend/src/pages/Settings.tsx |
| 0% | No | No | UiSettings.tsx | frontend/src/pages/UiSettings.tsx |
| 0% | No | No | Users.tsx | frontend/src/pages/Users.tsx |
| 0% | No | No | VcardsManager.tsx | frontend/src/pages/VcardsManager.tsx |
| 50% | Yes | No | App.tsx | frontend/src/App.tsx |
| 50% | Yes | No | ActivityFeedPage.tsx | frontend/src/pages/ActivityFeedPage.tsx |
| 50% | Yes | No | AffiliateDashboard.tsx | frontend/src/pages/AffiliateDashboard.tsx |
| 50% | Yes | No | ApiDocsPage.tsx | frontend/src/pages/ApiDocsPage.tsx |
| 50% | Yes | No | BillingDashboard.tsx | frontend/src/pages/BillingDashboard.tsx |
| 50% | Yes | No | BillingPaypalReturn.tsx | frontend/src/pages/BillingPaypalReturn.tsx |
| 50% | Yes | No | BillingStripeCheckoutPage.tsx | frontend/src/pages/BillingStripeCheckoutPage.tsx |
| 50% | Yes | No | BusinessDirectory.tsx | frontend/src/pages/BusinessDirectory.tsx |
| 50% | Yes | No | BusinessProfilePublicView.tsx | frontend/src/pages/BusinessProfilePublicView.tsx |
| 50% | Yes | No | CmsPageBuilder.tsx | frontend/src/pages/CmsPageBuilder.tsx |
| 50% | Yes | No | ConnectionRequestsPage.tsx | frontend/src/pages/ConnectionRequestsPage.tsx |
| 50% | Yes | No | CrmAnalyticsPage.tsx | frontend/src/pages/CrmAnalyticsPage.tsx |
| 50% | Yes | No | CrmCompaniesPage.tsx | frontend/src/pages/CrmCompaniesPage.tsx |
| 50% | Yes | No | CrmContactsPage.tsx | frontend/src/pages/CrmContactsPage.tsx |
| 50% | Yes | No | CrmDealsPage.tsx | frontend/src/pages/CrmDealsPage.tsx |
| 50% | Yes | No | CrmKanbanPage.tsx | frontend/src/pages/CrmKanbanPage.tsx |
| 50% | Yes | No | CrmMyTasksPage.tsx | frontend/src/pages/CrmMyTasksPage.tsx |
| 50% | Yes | No | HierarchyManagement.tsx | frontend/src/pages/HierarchyManagement.tsx |
| 50% | Yes | No | Invoices.tsx | frontend/src/pages/Invoices.tsx |
| 50% | Yes | No | LandingPage.tsx | frontend/src/pages/LandingPage.tsx |
| 50% | Yes | No | Login.tsx | frontend/src/pages/Login.tsx |
| 50% | Yes | No | ManageRoles.tsx | frontend/src/pages/ManageRoles.tsx |
| 50% | Yes | No | ManageUsers.tsx | frontend/src/pages/ManageUsers.tsx |
| 50% | Yes | No | MyConnectionsPage.tsx | frontend/src/pages/MyConnectionsPage.tsx |
| 50% | Yes | No | NotificationCenterPage.tsx | frontend/src/pages/NotificationCenterPage.tsx |
| 50% | Yes | No | ProfilePublicEdit.tsx | frontend/src/pages/ProfilePublicEdit.tsx |
| 50% | Yes | No | PublicUserProfileView.tsx | frontend/src/pages/PublicUserProfileView.tsx |
| 50% | Yes | No | SupportTickets.tsx | frontend/src/pages/SupportTickets.tsx |
| 50% | Yes | No | TeamChatPage.tsx | frontend/src/pages/TeamChatPage.tsx |
| 50% | Yes | No | TenantThemeCustomizerPage.tsx | frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx |
| 50% | Yes | No | TenantThemeSelectorPage.tsx | frontend/src/pages/tenant/TenantThemeSelectorPage.tsx |
| 50% | Yes | No | VcardPublicView.tsx | frontend/src/pages/VcardPublicView.tsx |
| 100% | Yes | Yes | CompanySettings.tsx | frontend/src/pages/CompanySettings.tsx |
| 100% | Yes | Yes | Dashboard.tsx | frontend/src/pages/Dashboard.tsx |
| 100% | Yes | Yes | ForgotPassword.tsx | frontend/src/pages/ForgotPassword.tsx |
| 100% | Yes | Yes | Onboarding.tsx | frontend/src/pages/Onboarding.tsx |
| 100% | Yes | Yes | ProfileSettings.tsx | frontend/src/pages/ProfileSettings.tsx |
| 100% | Yes | Yes | ResetPassword.tsx | frontend/src/pages/ResetPassword.tsx |
| 100% | Yes | Yes | SignupWizard.tsx | frontend/src/pages/SignupWizard.tsx |
| 100% | Yes | Yes | VerifyEmail.tsx | frontend/src/pages/VerifyEmail.tsx |
