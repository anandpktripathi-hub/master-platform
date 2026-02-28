import { createBrowserRouter, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import ProfileSettings from "./pages/ProfileSettings";
import CompanySettings from "./pages/CompanySettings";
import DomainListPage from "./pages/domains/DomainListPage";
import PackagesPage from "./pages/packages/PackagesPage";
import { ManageUsers } from "./pages/ManageUsers";
import { ManageRoles } from "./pages/ManageRoles";
import HierarchyManagement from "./pages/HierarchyManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireRole } from "./components/guards/RouteGuards";
import UiSettings from "./pages/UiSettings";

import BillingDashboard from "./pages/BillingDashboard";
import AccountingDashboard from "./pages/AccountingDashboard";
import AdminThemesPage from "./pages/admin/AdminThemesPage";
import AdminInvoicesPage from "./pages/admin/AdminInvoicesPage";
import AdminBillingAnalyticsPage from "./pages/admin/AdminBillingAnalyticsPage";
import AdminAuditLogViewer from "./pages/admin/AuditLogViewer";
import TenantThemeSelectorPage from "./pages/tenant/TenantThemeSelectorPage";
import TenantThemeCustomizerPage from "./pages/tenant/TenantThemeCustomizerPage";
import Login from "./pages/Login";
import SignupWizard from "./pages/SignupWizard";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";

import CmsPageBuilder from "./pages/CmsPageBuilder";
import CmsAnalyticsPage from "./pages/cms/CmsAnalyticsPage";
import CmsSeoAuditPage from "./pages/cms/CmsSeoAuditPage";
import SupportTickets from "./pages/SupportTickets";
import ProfilePublicEdit from "./pages/ProfilePublicEdit";
import PublicUserProfileView from "./pages/PublicUserProfileView";
import BusinessDirectory from "./pages/BusinessDirectory";
import BusinessProfilePublicView from "./pages/BusinessProfilePublicView";
import AdminSupportTickets from "./pages/AdminSupportTickets";
import PlatformOverviewDashboard from "./pages/admin/PlatformOverviewDashboard";
import PaymentLogsPage from "./pages/admin/PaymentLogsPage";
import TenantsPage from "./pages/admin/Tenants";
import AdminDomainsPage from "./pages/admin/AdminDomainsPage";
import AdminNavigationMapPage from "./pages/admin/AdminNavigationMapPage";
import AdminPanel from "./pages/admin";
import PlanManager from "./pages/admin/PlanManager";
import CrmContactsPage from "./pages/CrmContactsPage";
import CrmDealsPage from "./pages/CrmDealsPage";
import CrmMyTasksPage from "./pages/CrmMyTasksPage";
import CrmCompaniesPage from "./pages/CrmCompaniesPage";
import CrmKanbanPage from "./pages/CrmKanbanPage";
import CrmAnalyticsPage from "./pages/CrmAnalyticsPage";
import ActivityFeedPage from "./pages/ActivityFeedPage";
import MyConnectionsPage from "./pages/MyConnectionsPage";
import ConnectionRequestsPage from "./pages/ConnectionRequestsPage";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import BillingStripeCheckoutPage from "./pages/BillingStripeCheckoutPage";
import BillingPaypalReturn from "./pages/BillingPaypalReturn";
import AdvancedSettings from "./pages/AdvancedSettings";
import HrmDashboard from "./pages/HrmDashboard";
import PosDashboard from "./pages/PosDashboard";
import VcardsManager from "./pages/VcardsManager";
import VcardPublicView from "./pages/VcardPublicView";
import ProjectsDashboard from "./pages/ProjectsDashboard";
import OfflinePaymentsPage from "./billing/OfflinePaymentsPage";
import OfflinePaymentsAdminPage from "./billing/OfflinePaymentsAdminPage";
import NotificationCenterPage from "./pages/NotificationCenterPage";
import TeamChatPage from "./pages/TeamChatPage";
import DeveloperPortalPage from "./pages/developer/DeveloperPortalPage";
import MarketplacePage from "./pages/marketplace/MarketplacePage";
import AiToolsPage from "./pages/AiToolsPage";
import TenantDomainHealthPage from "./pages/domains/TenantDomainHealthPage";
import SeoToolsPage from "./pages/SeoToolsPage";
import ApiDocsPage from "./pages/ApiDocsPage";

const CmsMenuManagement = lazy(() => import("./pages/dashboard/CmsMenuManagement"));
const TenantQuotaUsage = lazy(() => import("./pages/dashboard/TenantQuotaUsage"));
const AuditLogs = lazy(() => import("./pages/dashboard/AuditLogs"));
const CustomDomains = lazy(() => import("./pages/dashboard/CustomDomains"));
const PackageFeatures = lazy(() => import("./pages/dashboard/PackageFeatures"));
const SystemHealthPage = lazy(() => import("./pages/dashboard/SystemHealthPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/docs",
    element: <ApiDocsPage />,
  },
  {
    path: "/app",
    element: <App />,
    children: [
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute><ManageUsers /></ProtectedRoute> },
      { path: "manage-users", element: <ProtectedRoute><ManageUsers /></ProtectedRoute> },
      { path: "manage-roles", element: <ProtectedRoute><ManageRoles /></ProtectedRoute> },
      { path: "hierarchy", element: <ProtectedRoute><HierarchyManagement /></ProtectedRoute> },
      { path: "billing", element: <ProtectedRoute><BillingDashboard /></ProtectedRoute> },
      { path: "billing/checkout/stripe", element: <ProtectedRoute><BillingStripeCheckoutPage /></ProtectedRoute> },
      { path: "billing/paypal/return", element: <ProtectedRoute><BillingPaypalReturn /></ProtectedRoute> },
      { path: "billing/invoices", element: <ProtectedRoute><Invoices /></ProtectedRoute> },
      { path: "billing/offline", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><OfflinePaymentsPage /></RequireRole></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><ProfileSettings /></ProtectedRoute> },
      { path: "profile/public", element: <ProtectedRoute><ProfilePublicEdit /></ProtectedRoute> },
      { path: "company", element: <ProtectedRoute><CompanySettings /></ProtectedRoute> },
      { path: "support/tickets", element: <ProtectedRoute><SupportTickets /></ProtectedRoute> },
      { path: "chat", element: <ProtectedRoute><TeamChatPage /></ProtectedRoute> },
      { path: "admin/support/tickets", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminSupportTickets /></RequireRole></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute><NotificationCenterPage /></ProtectedRoute> },
      { path: "admin/overview", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><PlatformOverviewDashboard /></RequireRole></ProtectedRoute> },
      { path: "admin/analytics/billing", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminBillingAnalyticsPage /></RequireRole></ProtectedRoute> },
      { path: "admin/payments/logs", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><PaymentLogsPage /></RequireRole></ProtectedRoute> },
      { path: "admin/payments/offline", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><OfflinePaymentsAdminPage /></RequireRole></ProtectedRoute> },
      { path: "admin/invoices", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminInvoicesPage /></RequireRole></ProtectedRoute> },
      { path: "admin/tenants", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><TenantsPage /></RequireRole></ProtectedRoute> },
      { path: "admin/domains", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminDomainsPage /></RequireRole></ProtectedRoute> },
      { path: "admin/navigation-map", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminNavigationMapPage /></RequireRole></ProtectedRoute> },
      { path: "admin/panel", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminPanel /></RequireRole></ProtectedRoute> },
      { path: "admin/plans", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><PlanManager /></RequireRole></ProtectedRoute> },
      { path: "admin/audit-log-viewer", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminAuditLogViewer /></RequireRole></ProtectedRoute> },
      { path: "crm/contacts", element: <ProtectedRoute><CrmContactsPage /></ProtectedRoute> },
      { path: "crm/deals", element: <ProtectedRoute><CrmDealsPage /></ProtectedRoute> },
      { path: "crm/tasks", element: <ProtectedRoute><CrmMyTasksPage /></ProtectedRoute> },
      { path: "crm/companies", element: <ProtectedRoute><CrmCompaniesPage /></ProtectedRoute> },
      { path: "crm/kanban", element: <ProtectedRoute><CrmKanbanPage /></ProtectedRoute> },
      { path: "crm/analytics", element: <ProtectedRoute><CrmAnalyticsPage /></ProtectedRoute> },
      { path: "social/feed", element: <ProtectedRoute><ActivityFeedPage /></ProtectedRoute> },
      { path: "social/connections", element: <ProtectedRoute><MyConnectionsPage /></ProtectedRoute> },
      { path: "social/requests", element: <ProtectedRoute><ConnectionRequestsPage /></ProtectedRoute> },
      { path: "affiliate", element: <ProtectedRoute><AffiliateDashboard /></ProtectedRoute> },
      { path: "hrm", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><HrmDashboard /></RequireRole></ProtectedRoute> },
      { path: "pos", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><PosDashboard /></RequireRole></ProtectedRoute> },
      { path: "vcards", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><VcardsManager /></RequireRole></ProtectedRoute> },
      { path: "projects", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><ProjectsDashboard /></RequireRole></ProtectedRoute> },
      { path: "domains", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><DomainListPage /></RequireRole></ProtectedRoute> },
      { path: "domains/health", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><TenantDomainHealthPage /></RequireRole></ProtectedRoute> },
      { path: "packages", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><PackagesPage /></RequireRole></ProtectedRoute> },
      { path: "admin/themes", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminThemesPage /></RequireRole></ProtectedRoute> },
      { path: "admin/settings/ui", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><UiSettings /></RequireRole></ProtectedRoute> },
      { path: "admin/settings/advanced", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdvancedSettings /></RequireRole></ProtectedRoute> },
      { path: "tenant/theme/select", element: <ProtectedRoute><TenantThemeSelectorPage /></ProtectedRoute> },
      { path: "tenant/theme/customize", element: <ProtectedRoute><TenantThemeCustomizerPage /></ProtectedRoute> },
      { path: "cms/page-builder", element: <ProtectedRoute><CmsPageBuilder /></ProtectedRoute> },
      { path: "cms/analytics", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><CmsAnalyticsPage /></RequireRole></ProtectedRoute> },
      { path: "cms/seo-audit", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><CmsSeoAuditPage /></RequireRole></ProtectedRoute> },
      { path: "dashboard/cms-menu", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><CmsMenuManagement /></Suspense></RequireRole></ProtectedRoute> },
      { path: "dashboard/tenant-quota", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><TenantQuotaUsage /></Suspense></RequireRole></ProtectedRoute> },
      { path: "dashboard/audit-logs", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><AuditLogs /></Suspense></RequireRole></ProtectedRoute> },
      { path: "dashboard/custom-domains", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><CustomDomains /></Suspense></RequireRole></ProtectedRoute> },
      { path: "dashboard/package-features", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><PackageFeatures /></Suspense></RequireRole></ProtectedRoute> },
      { path: "dashboard/system-health", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><Suspense fallback={<div>Loading...</div>}><SystemHealthPage /></Suspense></RequireRole></ProtectedRoute> },
      { path: "accounting", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><AccountingDashboard /></RequireRole></ProtectedRoute> },
      { path: "seo", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "PLATFORM_SUPERADMIN"]}><SeoToolsPage /></RequireRole></ProtectedRoute> },
      { path: "developer", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><DeveloperPortalPage /></RequireRole></ProtectedRoute> },
      { path: "marketplace", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><MarketplacePage /></RequireRole></ProtectedRoute> },
      { path: "ai-tools", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><AiToolsPage /></RequireRole></ProtectedRoute> },
      { path: "onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
    ],
  },
  { path: "/u/:handle", element: <PublicUserProfileView /> },
  { path: "/directory", element: <BusinessDirectory /> },
  { path: "/b/:slug", element: <BusinessProfilePublicView /> },
  { path: "/vcard/:id", element: <VcardPublicView /> },
  { path: "/login", element: <Login /> },
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/signup", element: <SignupWizard /> },
  { path: "/dashboard", element: <Navigate to="/app/dashboard" replace /> },
]);

