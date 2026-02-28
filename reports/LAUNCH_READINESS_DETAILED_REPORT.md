# Launch Readiness — Detailed Report (Code-Only)

Generated: 2026-02-24T04:36:18.165Z

## Sources

- Backend scan: reports/backend_module_readiness_code_scan.json
- Frontend route map: launch-v1-route-map.out.txt
- Route map generatedAt: 2026-02-17T09:03:45.270Z

## Backend Modules (43/43 complete)

| Module | Launch % | Tests | Files | Missing |
|---|---:|---|---:|---|
| accounting | 100% | both | 5 | — |
| ai-services | 100% | both | 5 | — |
| analytics | 100% | both | 5 | — |
| auth | 100% | both | 7 | — |
| billing | 100% | both | 7 | — |
| chat | 100% | both | 5 | — |
| cms | 100% | both | 2 | — |
| coupons | 100% | both | 3 | — |
| crm | 100% | both | 6 | — |
| custom-domains | 100% | both | 5 | — |
| dashboard | 100% | both | 5 | — |
| developer-portal | 100% | both | 5 | — |
| domains | 100% | both | 3 | — |
| health | 100% | both | 5 | — |
| hierarchy | 100% | both | 16 | — |
| hrm | 100% | both | 5 | — |
| logger | 100% | both | 5 | — |
| logs | 100% | both | 5 | — |
| marketplace | 100% | both | 5 | — |
| metrics | 100% | both | 5 | — |
| notifications | 100% | both | 9 | — |
| onboarding | 100% | both | 5 | — |
| orders | 100% | both | 5 | — |
| packages | 100% | both | 4 | — |
| payments | 100% | both | 3 | — |
| pos | 100% | both | 5 | — |
| products | 100% | both | 7 | — |
| profile | 100% | both | 5 | — |
| projects | 100% | both | 5 | — |
| rbac | 100% | both | 6 | — |
| reports | 100% | both | 5 | — |
| seo | 100% | both | 5 | — |
| settings | 100% | both | 6 | — |
| social | 100% | both | 5 | — |
| support | 100% | both | 5 | — |
| tenant | 100% | both | 5 | — |
| tenants | 100% | both | 5 | — |
| theme | 100% | both | 5 | — |
| themes | 100% | both | 1 | — |
| user | 100% | both | 5 | — |
| users | 100% | both | 9 | — |
| vcards | 100% | both | 5 | — |
| workspaces | 100% | both | 6 | — |

## Frontend Routes (Launch v1)

- Total routes: 74
- In: 74
- Detected API calls: 17
- API calls mapped to backend controllers: 17

| Status | UI Route | Component File | API Calls | Mapped | Notes |
|---|---|---|---|---:|---|
| In | / | frontend/src/pages/LandingPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app | frontend/src/App.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/accounting | frontend/src/pages/AccountingDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/analytics/billing | frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx | GET /billing/analytics/revenue | yes | All detected api.* calls map to backend controllers. |
| In | /app/admin/domains | frontend/src/pages/admin/AdminDomainsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/invoices | frontend/src/pages/admin/AdminInvoicesPage.tsx | GET /billings/admin/all \| POST /billings/admin | yes | All detected api.* calls map to backend controllers. |
| In | /app/admin/navigation-map | frontend/src/pages/admin/AdminNavigationMapPage.tsx | GET /features | yes | All detected api.* calls map to backend controllers. |
| In | /app/admin/overview | frontend/src/pages/admin/PlatformOverviewDashboard.tsx | GET /dashboards/admin/saas-overview | yes | All detected api.* calls map to backend controllers. |
| In | /app/admin/payments/logs | frontend/src/pages/admin/PaymentLogsPage.tsx | GET /payments/logs | yes | All detected api.* calls map to backend controllers. |
| In | /app/admin/payments/offline | frontend/src/billing/OfflinePaymentsAdminPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/settings/advanced | frontend/src/pages/AdvancedSettings.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/settings/ui | frontend/src/pages/UiSettings.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/support/tickets | frontend/src/pages/AdminSupportTickets.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/tenants | frontend/src/pages/admin/Tenants.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/admin/themes | frontend/src/pages/admin/AdminThemesPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/affiliate | frontend/src/pages/AffiliateDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/ai-tools | frontend/src/pages/AiToolsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/billing | frontend/src/pages/BillingDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/billing/checkout/stripe | frontend/src/pages/BillingStripeCheckoutPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/billing/invoices | frontend/src/pages/Invoices.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/billing/offline | frontend/src/billing/OfflinePaymentsPage.tsx | POST /offline-payments | yes | All detected api.* calls map to backend controllers. |
| In | /app/billing/paypal/return | frontend/src/pages/BillingPaypalReturn.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/chat | frontend/src/pages/TeamChatPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/cms/analytics | frontend/src/pages/cms/CmsAnalyticsPage.tsx | GET /cms/analytics/tenant | yes | All detected api.* calls map to backend controllers. |
| In | /app/cms/page-builder | frontend/src/pages/CmsPageBuilder.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/cms/seo-audit | frontend/src/pages/cms/CmsSeoAuditPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/company | frontend/src/pages/CompanySettings.tsx | GET /tenant/profile \| PUT /tenant/profile | yes | All detected api.* calls map to backend controllers. |
| In | /app/crm/analytics | frontend/src/pages/CrmAnalyticsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/crm/companies | frontend/src/pages/CrmCompaniesPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/crm/contacts | frontend/src/pages/CrmContactsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/crm/deals | frontend/src/pages/CrmDealsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/crm/kanban | frontend/src/pages/CrmKanbanPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/crm/tasks | frontend/src/pages/CrmMyTasksPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/dashboard | frontend/src/pages/Dashboard.tsx | GET /tenant/dashboard \| GET /products/stats/dashboard \| GET /orders/stats/dashboard \| GET /users/stats/dashboard \| GET /accounting/summary \| GET /hrm/summary \| GET /projects/summary \| GET /pos/summary | yes | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/audit-logs | frontend/src/pages/dashboard/AuditLogs.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/dashboard/cms-menu | frontend/src/pages/dashboard/CmsMenuManagement.tsx | GET /cms/menu | yes | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/custom-domains | frontend/src/pages/dashboard/CustomDomains.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/dashboard/package-features | frontend/src/pages/dashboard/PackageFeatures.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/dashboard/system-health | frontend/src/pages/dashboard/SystemHealthPage.tsx | GET /health \| GET /metrics | yes | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/tenant-quota | frontend/src/pages/dashboard/TenantQuotaUsage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/developer | frontend/src/pages/developer/DeveloperPortalPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/domains | frontend/src/pages/domains/DomainListPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/domains/health | frontend/src/pages/domains/TenantDomainHealthPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/hierarchy | frontend/src/pages/HierarchyManagement.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/hrm | frontend/src/pages/HrmDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/manage-roles | frontend/src/pages/ManageRoles.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/manage-users | frontend/src/pages/ManageUsers.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/marketplace | frontend/src/pages/marketplace/MarketplacePage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/notifications | frontend/src/pages/NotificationCenterPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/onboarding | frontend/src/pages/Onboarding.tsx | GET /packages/me \| GET /packages/me/usage \| POST /onboarding/seed-sample | yes | All detected api.* calls map to backend controllers. |
| In | /app/packages | frontend/src/pages/packages/PackagesPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/pos | frontend/src/pages/PosDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/profile | frontend/src/pages/ProfileSettings.tsx | GET /me/profile \| PUT /me/profile | yes | All detected api.* calls map to backend controllers. |
| In | /app/profile/public | frontend/src/pages/ProfilePublicEdit.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/projects | frontend/src/pages/ProjectsDashboard.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/seo | frontend/src/pages/SeoToolsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/social/connections | frontend/src/pages/MyConnectionsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/social/feed | frontend/src/pages/ActivityFeedPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/social/requests | frontend/src/pages/ConnectionRequestsPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/support/tickets | frontend/src/pages/SupportTickets.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/tenant/theme/customize | frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/tenant/theme/select | frontend/src/pages/tenant/TenantThemeSelectorPage.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/users | frontend/src/pages/ManageUsers.tsx | — | no | No direct api.* calls detected in component file. |
| In | /app/vcards | frontend/src/pages/VcardsManager.tsx | — | no | No direct api.* calls detected in component file. |
| In | /b/:slug | frontend/src/pages/BusinessProfilePublicView.tsx | — | no | No direct api.* calls detected in component file. |
| In | /dashboard | — | — | no | Redirect route (Navigate). |
| In | /directory | frontend/src/pages/BusinessDirectory.tsx | — | no | No direct api.* calls detected in component file. |
| In | /forgot-password | frontend/src/pages/ForgotPassword.tsx | POST /auth/request-password-reset | yes | All detected api.* calls map to backend controllers. |
| In | /login | frontend/src/pages/Login.tsx | — | no | No direct api.* calls detected in component file. |
| In | /reset-password | frontend/src/pages/ResetPassword.tsx | POST /auth/reset-password | yes | All detected api.* calls map to backend controllers. |
| In | /signup | frontend/src/pages/SignupWizard.tsx | GET /packages \| POST /auth/tenant-register | yes | All detected api.* calls map to backend controllers. |
| In | /u/:handle | frontend/src/pages/PublicUserProfileView.tsx | — | no | No direct api.* calls detected in component file. |
| In | /vcard/:id | frontend/src/pages/VcardPublicView.tsx | — | no | No direct api.* calls detected in component file. |
| In | /verify-email | frontend/src/pages/VerifyEmail.tsx | POST /auth/verify-email | yes | All detected api.* calls map to backend controllers. |

## Packaging / Infra

- Checklist: 9/9 present (100%)

| Item | Present |
|---|---|
| docker-compose.yml | yes |
| docker-compose.prod.yml | yes |
| Dockerfile | yes |
| backend/Dockerfile | yes |
| frontend/Dockerfile | yes |
| START-BACKEND.bat | yes |
| START-FRONTEND.bat | yes |
| START-BOTH.bat | yes |
| .env.example | yes |

## CI (presence only)

| Check | Value |
|---|---|
| Workflows dir present | yes |
| Workflow files | 2 |
