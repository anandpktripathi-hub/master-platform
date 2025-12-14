import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  // DEV MODE: if there is any user object, allow; otherwise auto-create one
  const safeUser =
    user || {
      _id: "dev-user-id",
      email: "admin@example.com",
      role: "PLATFORM_SUPER_ADMIN",
      name: "Dev Admin",
    };

  if (!user) {
    // store dev user once so rest of app can read it
    localStorage.setItem("auth_user", JSON.stringify(safeUser));
  }

  return children;
}

export function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  // In dev mode, always allow seeing login page without crashing
  return children;
}
