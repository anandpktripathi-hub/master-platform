
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAdminSettings } from "../contexts/AdminSettingsContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import workspaceService, { WorkspaceDto } from "../services/workspaceService";
import NotificationBell from "./NotificationBell";

interface NavigationProps {
  onLogout?: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const { user, logout } = useAuth();
  const { branding, basic } = useAdminSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(
    () => localStorage.getItem("workspaceId") || ""
  );
  const [enabledFeatureIds, setEnabledFeatureIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await workspaceService.list();
        setWorkspaces(data);
        if (!currentWorkspaceId && data.length > 0) {
          const firstId = data[0].id;
          setCurrentWorkspaceId(firstId);
          localStorage.setItem("workspaceId", firstId);
          void workspaceService.switch(firstId).catch(() => undefined);
        }
      } catch {
        // Fail silently; navigation still works with default tenant
      }
      try {
        const dashboard: any = await fetch(
          (import.meta as any).env.VITE_API_BASE_URL
            ? `${(import.meta as any).env.VITE_API_BASE_URL}/api/tenant/dashboard`
            : "/api/v1/api/tenant/dashboard",
          {
            headers: {
              Authorization: localStorage.getItem("token")
                ? `Bearer ${localStorage.getItem("token")}`
                : "",
              "x-workspace-id": localStorage.getItem("workspaceId") || "",
            },
            credentials: "include",
          }
        ).then((res) => res.json());

        const collectIds = (nodes: any[] = [], acc: Set<string>) => {
          for (const n of nodes) {
            if (n?.id) acc.add(n.id as string);
            if (n?.children && Array.isArray(n.children)) {
              collectIds(n.children, acc);
            }
          }
        };

        const ids = new Set<string>();
        if (dashboard?.features && Array.isArray(dashboard.features)) {
          collectIds(dashboard.features, ids);
        }
        setEnabledFeatureIds(ids);
      } catch {
        // If feature-driven nav fails, fall back to static menu
        setEnabledFeatureIds(new Set());
      }
    })();
  }, [user]);

  const handleWorkspaceChange = async (id: string) => {
    setCurrentWorkspaceId(id);
    localStorage.setItem("workspaceId", id);
    try {
      await workspaceService.switch(id);
    } catch {
      // Ignore errors here; WorkspaceGuard will enforce on backend
    }
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <>
      {/* Top nav bar */}
      <nav className="border-b nav-header md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              className="md:hidden p-2 focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open sidebar menu"
            >
              <span className="material-icons" style={{ fontSize: 28 }}>menu</span>
            </button>
            <h1 className="text-xl font-bold nav-title">
              {branding?.titleText || basic?.siteTitle || "Smetasc SaaS"}
            </h1>
            {user && workspaces.length > 0 && (
              <div className="hidden md:block">
                <WorkspaceSwitcher
                  workspaces={workspaces}
                  current={currentWorkspaceId || workspaces[0]?.id}
                  onSwitch={handleWorkspaceChange}
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && <NotificationBell />}
            {user && (
              <span className="text-sm text-[var(--admin-text-muted,#cbd5e1)]">
                {user.email} ({user.role ?? "user"})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded transition bg-[var(--admin-primary,#0ea5e9)] text-[var(--admin-nav-text,#e2e8f0)] border border-[var(--admin-primary-hover,#0284c7)]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-[var(--admin-surface,#111827)] border-r border-[var(--admin-border,#1f2937)] transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block`}
        style={{ minHeight: '100vh' }}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header text-2xl font-bold px-6 py-4">Menu</div>
          <nav className="flex-1 px-4 space-y-2">
            <Link to="/dashboard" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Dashboard</Link>
            <Link to="/users" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Users</Link>
            {enabledFeatureIds.has("billing-dashboard") && (
              <Link to="/app/billing" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Billing</Link>
            )}
            {enabledFeatureIds.has("accounting-dashboard") && (
              <Link to="/app/accounting" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Accounting</Link>
            )}
            {enabledFeatureIds.has("hrm-dashboard") && (
              <Link to="/app/hrm" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">HRM</Link>
            )}
            {enabledFeatureIds.has("projects-dashboard") && (
              <Link to="/app/projects" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Projects</Link>
            )}
            {enabledFeatureIds.has("pos-dashboard") && (
              <Link to="/app/pos" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">POS &amp; Warehouse</Link>
            )}
            <Link to="/app/vcards" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">vCards</Link>
            <Link to="/app/projects" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Projects</Link>
            <Link to="/app/domains" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Domains</Link>
            <Link to="/app/packages" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Packages</Link>
            <Link to="/app/crm/contacts" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CRM Contacts</Link>
            <Link to="/app/crm/companies" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CRM Companies</Link>
            <Link to="/app/crm/deals" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CRM Deals</Link>
            <Link to="/app/crm/kanban" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CRM Kanban</Link>
            <Link to="/app/crm/tasks" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">My CRM Tasks</Link>
            <Link to="/app/crm/analytics" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CRM Analytics</Link>
            <Link to="/app/social/feed" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Activity Feed</Link>
            <Link to="/app/social/connections" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">My Connections</Link>
            <Link to="/app/social/requests" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Connection Requests</Link>
            <Link to="/app/chat" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Team Chat</Link>
            {enabledFeatureIds.has("notification-center") && (
              <Link to="/app/notifications" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Notification Center</Link>
            )}
            <Link to="/app/affiliate" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Referral Rewards</Link>
            {enabledFeatureIds.has("cms-analytics") && (
              <Link to="/app/dashboard/cms-menu" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">CMS Menu</Link>
            )}
            <Link to="/app/dashboard/tenant-quota" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Tenant Quota</Link>
            <Link to="/app/dashboard/audit-logs" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Audit Logs</Link>
            {user?.role === 'PLATFORM_SUPERADMIN' && (
              <>
                <Link
                  to="/app/admin/overview"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Platform Overview
                </Link>
                <Link
                  to="/app/admin/tenants"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Tenants &amp; Brands
                </Link>
                <Link
                  to="/app/admin/support/tickets"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Support Tickets (Admin)
                </Link>
                <Link
                  to="/app/admin/payments/logs"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Payment Activity
                </Link>
                <Link
                  to="/app/admin/invoices"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Invoices (Admin)
                </Link>
                <Link
                  to="/app/admin/settings/advanced?tab=payment"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Payment Settings
                </Link>
                <Link
                  to="/app/admin/settings/advanced"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  System Settings (Advanced)
                </Link>
                <Link
                  to="/app/admin/domains"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Domains (Admin)
                </Link>
                <Link
                  to="/app/dashboard/custom-domains"
                  className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition"
                >
                  Custom Domains (Admin)
                </Link>
              </>
            )}
            <Link to="/app/dashboard/package-features" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Package Features</Link>
            <Link to="/app/hierarchy" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Feature Hierarchy</Link>
            <Link to="/app/developer" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Developer Portal</Link>
            <Link to="/app/marketplace" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Marketplace</Link>
            <Link to="/app/ai-tools" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">AI Tools</Link>
            <Link to="/app/domains/health" className="block py-2 px-3 rounded hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white transition">Domain Health</Link>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
