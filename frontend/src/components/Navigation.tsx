import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAdminSettings } from "../contexts/AdminSettingsContext";

interface NavigationProps {
  onLogout?: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const { user, logout } = useAuth();
  const { branding, basic } = useAdminSettings();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <nav className="border-b nav-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1
              className="text-xl font-bold nav-title"
            >
              {branding?.titleText || basic?.siteTitle || "Smetasc SaaS"}
            </h1>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:opacity-80 transition text-[var(--admin-nav-text,#e2e8f0)]">
                Dashboard
              </Link>
              <Link to="/users" className="hover:opacity-80 transition text-[var(--admin-nav-text,#e2e8f0)]">
                Users
              </Link>
              <Link to="/app/domains" className="hover:opacity-80 transition text-[var(--admin-nav-text,#e2e8f0)]">
                Domains
              </Link>
              <Link to="/app/packages" className="hover:opacity-80 transition text-[var(--admin-nav-text,#e2e8f0)]">
                Packages
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
      </div>
    </nav>
  );
}
