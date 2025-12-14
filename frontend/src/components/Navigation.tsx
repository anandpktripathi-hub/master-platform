import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface NavigationProps {
  onLogout?: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-teal-500">Smetasc SaaS</h1>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:text-teal-500 transition">
                Dashboard
              </Link>
              <Link to="/users" className="hover:text-teal-500 transition">
                Users
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-slate-300">
                {user.email} ({user.role ?? "user"})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
