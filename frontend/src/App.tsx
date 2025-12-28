import { Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useAdminSettings } from "./contexts/AdminSettingsContext";
import Navigation from "./components/Navigation";
import "./styles/App.css";

export default function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { loading: settingsLoading, error: settingsError, dismissError } = useAdminSettings();

  const handleLogout = () => {
    logout();
  };

  // Show loading spinner while auth or settings are loading
  if (isLoading || settingsLoading) {
    return (
      <div className="admin-bg admin-text admin-font flex-center min-h-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="spinner" aria-label="Loading" />
          <p className="mt-4 text-sm admin-text-muted">
            {isLoading ? "Loading..." : "Loading settings..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bg admin-text admin-font min-h-screen">
      {isAuthenticated && <Navigation onLogout={handleLogout} />}
      {settingsError && (
        <div className="admin-surface admin-text admin-border-bottom px-4 py-3 text-sm flex items-center justify-between">
          <span>
            ⚠️ Settings could not be loaded; using defaults. ({settingsError})
          </span>
          <button
            onClick={dismissError}
            className="dismiss-btn hover:opacity-70 transition"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}
      <Outlet />
    </div>
  );
}
