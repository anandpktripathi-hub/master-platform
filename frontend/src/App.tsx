import { Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";

export default function App() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {isAuthenticated && <Navigation onLogout={handleLogout} />}
      <Outlet />
    </div>
  );
}
