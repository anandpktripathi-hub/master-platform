import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SignupWizard from "./pages/SignupWizard";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import BillingDashboard from "./pages/BillingDashboard";
import Invoices from "./pages/Invoices";
import ProfileSettings from "./pages/ProfileSettings";
import CompanySettings from "./pages/CompanySettings";
import AdminThemesPage from "./pages/admin/AdminThemesPage";
import TenantThemeSelectorPage from "./pages/tenant/TenantThemeSelectorPage";
import TenantThemeCustomizerPage from "./pages/tenant/TenantThemeCustomizerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
      { path: "billing", element: <ProtectedRoute><BillingDashboard /></ProtectedRoute> },
      { path: "billing/invoices", element: <ProtectedRoute><Invoices /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><ProfileSettings /></ProtectedRoute> },
      { path: "company", element: <ProtectedRoute><CompanySettings /></ProtectedRoute> },
      { path: "admin/themes", element: <ProtectedRoute><AdminThemesPage /></ProtectedRoute> },
      { path: "tenant/theme/select", element: <ProtectedRoute><TenantThemeSelectorPage /></ProtectedRoute> },
      { path: "tenant/theme/customize", element: <ProtectedRoute><TenantThemeCustomizerPage /></ProtectedRoute> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignupWizard /> },
  { path: "/dashboard", element: <Navigate to="/app/dashboard" replace /> },
]);

