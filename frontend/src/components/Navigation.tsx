
import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAdminSettings } from "../contexts/AdminSettingsContext";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import workspaceService, { WorkspaceDto } from "../services/workspaceService";
import NotificationBell from "./NotificationBell";
import api from "../lib/api";
import { NAV_ITEMS } from "../navigation/navConfig";

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
        const dashboard: any = await api.get("/tenant/dashboard");

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

  const visibleNavItems = useMemo(() => {
    const role = user?.role;
    const hasFeatureList = enabledFeatureIds.size > 0;

    return NAV_ITEMS.filter((item) => {
      if (item.visibility === 'hide') return false;
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        if (!role) return false;
        if (!item.allowedRoles.includes(role)) return false;
      }

      if (item.featureId) {
        // If feature list failed to load, do not hide items.
        if (!hasFeatureList) return true;
        return enabledFeatureIds.has(item.featureId);
      }

      return true;
    });
  }, [enabledFeatureIds, user?.role]);

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    [
      "block py-2 px-3 rounded transition",
      isActive
        ? "bg-[var(--admin-sidebar-active,#1f2937)] text-white"
        : "hover:bg-[var(--admin-primary,#0ea5e9)] hover:text-white",
    ].join(" ");

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
              <span className="material-icons text-[28px]">menu</span>
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
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block min-h-screen`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="sidebar-header text-2xl font-bold px-6 py-4">Menu</div>
          <nav className="flex-1 px-4 space-y-2">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                className={linkClassName}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
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
