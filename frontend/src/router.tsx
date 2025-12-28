import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Invoices from "./pages/Invoices";
import ProfileSettings from "./pages/ProfileSettings";
import CompanySettings from "./pages/CompanySettings";
import DomainListPage from "./pages/domains/DomainListPage";
import PackagesPage from "./pages/packages/PackagesPage";
import { ManageUsers } from "./pages/ManageUsers";
import { ManageRoles } from "./pages/ManageRoles";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireRole } from "./components/guards/RouteGuards";
import UiSettings from "./pages/UiSettings";

import BillingDashboard from "./pages/BillingDashboard";
import AdminThemesPage from "./pages/admin/AdminThemesPage";
import TenantThemeSelectorPage from "./pages/tenant/TenantThemeSelectorPage";
import TenantThemeCustomizerPage from "./pages/tenant/TenantThemeCustomizerPage";
import Login from "./pages/Login";
import SignupWizard from "./pages/SignupWizard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <App />,
    children: [
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "users", element: <ProtectedRoute><Users /></ProtectedRoute> },
      { path: "manage-users", element: <ProtectedRoute><ManageUsers /></ProtectedRoute> },
      { path: "manage-roles", element: <ProtectedRoute><ManageRoles /></ProtectedRoute> },
      { path: "billing", element: <ProtectedRoute><BillingDashboard /></ProtectedRoute> },
      { path: "billing/invoices", element: <ProtectedRoute><Invoices /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><ProfileSettings /></ProtectedRoute> },
      { path: "company", element: <ProtectedRoute><CompanySettings /></ProtectedRoute> },
      { path: "domains", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><DomainListPage /></RequireRole></ProtectedRoute> },
      { path: "packages", element: <ProtectedRoute><RequireRole allowedRoles={["TENANT_ADMIN", "TENANT_STAFF", "PLATFORM_SUPERADMIN"]}><PackagesPage /></RequireRole></ProtectedRoute> },
      { path: "admin/themes", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><AdminThemesPage /></RequireRole></ProtectedRoute> },
      { path: "admin/settings/ui", element: <ProtectedRoute><RequireRole allowedRoles={["PLATFORM_SUPERADMIN"]}><UiSettings /></RequireRole></ProtectedRoute> },
      { path: "tenant/theme/select", element: <ProtectedRoute><TenantThemeSelectorPage /></ProtectedRoute> },
      { path: "tenant/theme/customize", element: <ProtectedRoute><TenantThemeCustomizerPage /></ProtectedRoute> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignupWizard /> },
  { path: "/dashboard", element: <Navigate to="/app/dashboard" replace /> },
]);

