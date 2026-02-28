# Launch Readiness Snapshot (Code-Only, Evidence-Based)

Generated: 2026-02-24T04:36:18.165Z

This report merges:
- Backend module readiness scan (structural completeness)
- Frontend route map (UI routes + detected API calls)
- Launch packaging/infra presence (Docker/start scripts/env example)

## Backend Modules (structural)

- Modules: 43 total | 43 complete (100%) | 100% complete
- Average module %: 100% | Minimum module %: 100%

Top missing artifacts across modules:
- none

## Frontend Routes (from launch-v1 route map)

- Routes: 74 | In: 74 (100%)
- Routes with detected API calls: 17 (23%)
- Routes where detected API calls map to backend controllers: 17 (23%)

Most-used backend API prefixes from UI:
- /auth (4 calls)
- /tenant (3 calls)
- /packages (3 calls)
- /billings (2 calls)
- /cms (2 calls)
- /me (2 calls)
- /billing (1 calls)
- /features (1 calls)
- /dashboards (1 calls)
- /payments (1 calls)
- /offline-payments (1 calls)
- /products (1 calls)

## Packaging / Infra (presence checks)

- Packaging checklist: 9/9 present (100%)
- yes: docker-compose.yml
- yes: docker-compose.prod.yml
- yes: Dockerfile
- yes: backend/Dockerfile
- yes: frontend/Dockerfile
- yes: START-BACKEND.bat
- yes: START-FRONTEND.bat
- yes: START-BOTH.bat
- yes: .env.example

## CI (presence only)

- Workflows dir present: yes
- Workflow files: 2

## Appendix A — Backend modules (full)

| Module | Launch % | Tests | Missing |
|---|---:|---|---|
| accounting | 100% | both | — |
| ai-services | 100% | both | — |
| analytics | 100% | both | — |
| auth | 100% | both | — |
| billing | 100% | both | — |
| chat | 100% | both | — |
| cms | 100% | both | — |
| coupons | 100% | both | — |
| crm | 100% | both | — |
| custom-domains | 100% | both | — |
| dashboard | 100% | both | — |
| developer-portal | 100% | both | — |
| domains | 100% | both | — |
| health | 100% | both | — |
| hierarchy | 100% | both | — |
| hrm | 100% | both | — |
| logger | 100% | both | — |
| logs | 100% | both | — |
| marketplace | 100% | both | — |
| metrics | 100% | both | — |
| notifications | 100% | both | — |
| onboarding | 100% | both | — |
| orders | 100% | both | — |
| packages | 100% | both | — |
| payments | 100% | both | — |
| pos | 100% | both | — |
| products | 100% | both | — |
| profile | 100% | both | — |
| projects | 100% | both | — |
| rbac | 100% | both | — |
| reports | 100% | both | — |
| seo | 100% | both | — |
| settings | 100% | both | — |
| social | 100% | both | — |
| support | 100% | both | — |
| tenant | 100% | both | — |
| tenants | 100% | both | — |
| theme | 100% | both | — |
| themes | 100% | both | — |
| user | 100% | both | — |
| users | 100% | both | — |
| vcards | 100% | both | — |
| workspaces | 100% | both | — |

## Appendix B — Frontend routes (full)

| Status | UI Route | Component | API Calls | Notes |
|---|---|---|---|---|
| In | / | LandingPage (frontend/src/pages/LandingPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app | App (frontend/src/App.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/accounting | AccountingDashboard (frontend/src/pages/AccountingDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/analytics/billing | AdminBillingAnalyticsPage (frontend/src/pages/admin/AdminBillingAnalyticsPage.tsx) | GET /billing/analytics/revenue | All detected api.* calls map to backend controllers. |
| In | /app/admin/domains | AdminDomainsPage (frontend/src/pages/admin/AdminDomainsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/invoices | AdminInvoicesPage (frontend/src/pages/admin/AdminInvoicesPage.tsx) | GET /billings/admin/all \| POST /billings/admin | All detected api.* calls map to backend controllers. |
| In | /app/admin/navigation-map | AdminNavigationMapPage (frontend/src/pages/admin/AdminNavigationMapPage.tsx) | GET /features | All detected api.* calls map to backend controllers. |
| In | /app/admin/overview | PlatformOverviewDashboard (frontend/src/pages/admin/PlatformOverviewDashboard.tsx) | GET /dashboards/admin/saas-overview | All detected api.* calls map to backend controllers. |
| In | /app/admin/payments/logs | PaymentLogsPage (frontend/src/pages/admin/PaymentLogsPage.tsx) | GET /payments/logs | All detected api.* calls map to backend controllers. |
| In | /app/admin/payments/offline | OfflinePaymentsAdminPage (frontend/src/billing/OfflinePaymentsAdminPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/settings/advanced | AdvancedSettings (frontend/src/pages/AdvancedSettings.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/settings/ui | UiSettings (frontend/src/pages/UiSettings.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/support/tickets | AdminSupportTickets (frontend/src/pages/AdminSupportTickets.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/tenants | TenantsPage (frontend/src/pages/admin/Tenants.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/admin/themes | AdminThemesPage (frontend/src/pages/admin/AdminThemesPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/affiliate | AffiliateDashboard (frontend/src/pages/AffiliateDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/ai-tools | AiToolsPage (frontend/src/pages/AiToolsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/billing | BillingDashboard (frontend/src/pages/BillingDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/billing/checkout/stripe | BillingStripeCheckoutPage (frontend/src/pages/BillingStripeCheckoutPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/billing/invoices | Invoices (frontend/src/pages/Invoices.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/billing/offline | OfflinePaymentsPage (frontend/src/billing/OfflinePaymentsPage.tsx) | POST /offline-payments | All detected api.* calls map to backend controllers. |
| In | /app/billing/paypal/return | BillingPaypalReturn (frontend/src/pages/BillingPaypalReturn.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/chat | TeamChatPage (frontend/src/pages/TeamChatPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/cms/analytics | CmsAnalyticsPage (frontend/src/pages/cms/CmsAnalyticsPage.tsx) | GET /cms/analytics/tenant | All detected api.* calls map to backend controllers. |
| In | /app/cms/page-builder | CmsPageBuilder (frontend/src/pages/CmsPageBuilder.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/cms/seo-audit | CmsSeoAuditPage (frontend/src/pages/cms/CmsSeoAuditPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/company | CompanySettings (frontend/src/pages/CompanySettings.tsx) | GET /tenant/profile \| PUT /tenant/profile | All detected api.* calls map to backend controllers. |
| In | /app/crm/analytics | CrmAnalyticsPage (frontend/src/pages/CrmAnalyticsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/crm/companies | CrmCompaniesPage (frontend/src/pages/CrmCompaniesPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/crm/contacts | CrmContactsPage (frontend/src/pages/CrmContactsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/crm/deals | CrmDealsPage (frontend/src/pages/CrmDealsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/crm/kanban | CrmKanbanPage (frontend/src/pages/CrmKanbanPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/crm/tasks | CrmMyTasksPage (frontend/src/pages/CrmMyTasksPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/dashboard | Dashboard (frontend/src/pages/Dashboard.tsx) | GET /tenant/dashboard \| GET /products/stats/dashboard \| GET /orders/stats/dashboard \| GET /users/stats/dashboard \| GET /accounting/summary \| GET /hrm/summary \| GET /projects/summary \| GET /pos/summary | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/audit-logs | AuditLogs (frontend/src/pages/dashboard/AuditLogs.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/dashboard/cms-menu | CmsMenuManagement (frontend/src/pages/dashboard/CmsMenuManagement.tsx) | GET /cms/menu | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/custom-domains | CustomDomains (frontend/src/pages/dashboard/CustomDomains.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/dashboard/package-features | PackageFeatures (frontend/src/pages/dashboard/PackageFeatures.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/dashboard/system-health | SystemHealthPage (frontend/src/pages/dashboard/SystemHealthPage.tsx) | GET /health \| GET /metrics | All detected api.* calls map to backend controllers. |
| In | /app/dashboard/tenant-quota | TenantQuotaUsage (frontend/src/pages/dashboard/TenantQuotaUsage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/developer | DeveloperPortalPage (frontend/src/pages/developer/DeveloperPortalPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/domains | DomainListPage (frontend/src/pages/domains/DomainListPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/domains/health | TenantDomainHealthPage (frontend/src/pages/domains/TenantDomainHealthPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/hierarchy | HierarchyManagement (frontend/src/pages/HierarchyManagement.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/hrm | HrmDashboard (frontend/src/pages/HrmDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/manage-roles | ManageRoles (frontend/src/pages/ManageRoles.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/manage-users | ManageUsers (frontend/src/pages/ManageUsers.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/marketplace | MarketplacePage (frontend/src/pages/marketplace/MarketplacePage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/notifications | NotificationCenterPage (frontend/src/pages/NotificationCenterPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/onboarding | Onboarding (frontend/src/pages/Onboarding.tsx) | GET /packages/me \| GET /packages/me/usage \| POST /onboarding/seed-sample | All detected api.* calls map to backend controllers. |
| In | /app/packages | PackagesPage (frontend/src/pages/packages/PackagesPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/pos | PosDashboard (frontend/src/pages/PosDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/profile | ProfileSettings (frontend/src/pages/ProfileSettings.tsx) | GET /me/profile \| PUT /me/profile | All detected api.* calls map to backend controllers. |
| In | /app/profile/public | ProfilePublicEdit (frontend/src/pages/ProfilePublicEdit.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/projects | ProjectsDashboard (frontend/src/pages/ProjectsDashboard.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/seo | SeoToolsPage (frontend/src/pages/SeoToolsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/social/connections | MyConnectionsPage (frontend/src/pages/MyConnectionsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/social/feed | ActivityFeedPage (frontend/src/pages/ActivityFeedPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/social/requests | ConnectionRequestsPage (frontend/src/pages/ConnectionRequestsPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/support/tickets | SupportTickets (frontend/src/pages/SupportTickets.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/tenant/theme/customize | TenantThemeCustomizerPage (frontend/src/pages/tenant/TenantThemeCustomizerPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/tenant/theme/select | TenantThemeSelectorPage (frontend/src/pages/tenant/TenantThemeSelectorPage.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/users | ManageUsers (frontend/src/pages/ManageUsers.tsx) | — | No direct api.* calls detected in component file. |
| In | /app/vcards | VcardsManager (frontend/src/pages/VcardsManager.tsx) | — | No direct api.* calls detected in component file. |
| In | /b/:slug | BusinessProfilePublicView (frontend/src/pages/BusinessProfilePublicView.tsx) | — | No direct api.* calls detected in component file. |
| In | /dashboard | Navigate () | — | Redirect route (Navigate). |
| In | /directory | BusinessDirectory (frontend/src/pages/BusinessDirectory.tsx) | — | No direct api.* calls detected in component file. |
| In | /forgot-password | ForgotPassword (frontend/src/pages/ForgotPassword.tsx) | POST /auth/request-password-reset | All detected api.* calls map to backend controllers. |
| In | /login | Login (frontend/src/pages/Login.tsx) | — | No direct api.* calls detected in component file. |
| In | /reset-password | ResetPassword (frontend/src/pages/ResetPassword.tsx) | POST /auth/reset-password | All detected api.* calls map to backend controllers. |
| In | /signup | SignupWizard (frontend/src/pages/SignupWizard.tsx) | GET /packages \| POST /auth/tenant-register | All detected api.* calls map to backend controllers. |
| In | /u/:handle | PublicUserProfileView (frontend/src/pages/PublicUserProfileView.tsx) | — | No direct api.* calls detected in component file. |
| In | /vcard/:id | VcardPublicView (frontend/src/pages/VcardPublicView.tsx) | — | No direct api.* calls detected in component file. |
| In | /verify-email | VerifyEmail (frontend/src/pages/VerifyEmail.tsx) | POST /auth/verify-email | All detected api.* calls map to backend controllers. |
