/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from 'react';
import api, { authApi } from "../lib/api";

export type UserRole = 'PLATFORM_SUPERADMIN' | 'TENANT_ADMIN' | 'TENANT_STAFF' | 'CUSTOMER';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  company?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: UserRole[];
  tenantId: string | null;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasAllPermissions?: (permissions: string[]) => boolean;
  hasAnyPermission?: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderComponent({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userResp = await api.get("/users/me");
        const rawUser = userResp as any;
        const mappedUser: AuthUser = {
          id: rawUser._id ?? rawUser.id,
          email: rawUser.email,
          name:
            rawUser.name ??
            `${rawUser.firstName ?? ""} ${rawUser.lastName ?? ""}`.trim(),
          role: rawUser.role,
          company: rawUser.company,
          tenantId: rawUser.tenantId,
        };

        setUser(mappedUser);
      } catch (error) {
        console.error("Failed to load current user", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const accessToken: string = (response as any).access_token;
    const rawUser = (response as any).user;

    if (!accessToken) {
      throw new Error("Invalid login response: missing token");
    }

    localStorage.setItem("token", accessToken);

    if (rawUser) {
      const mappedUser: AuthUser = {
        id: rawUser._id ?? rawUser.id,
        email: rawUser.email,
        name:
          rawUser.name ??
          `${rawUser.firstName ?? ""} ${rawUser.lastName ?? ""}`.trim(),
        role: rawUser.role,
        company: rawUser.company,
        tenantId: rawUser.tenantId,
      };
      setUser(mappedUser);
      return;
    }

    const meResp = await api.get("/users/me");
    const me = meResp as any;
    const mappedUser: AuthUser = {
      id: me._id ?? me.id,
      email: me.email,
      name:
        me.name ?? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim(),
      role: me.role,
      company: me.company,
      tenantId: me.tenantId,
    };
    setUser(mappedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const isPlatformAdmin = user?.role === 'PLATFORM_SUPERADMIN';
  const isTenantAdmin = user?.role === 'TENANT_ADMIN' || user?.role === 'PLATFORM_SUPERADMIN';

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    roles: user?.role ? [user.role] : [],
    tenantId: user?.tenantId || null,
    hasRole,
    isPlatformAdmin,
    isTenantAdmin,
    login,
    logout,
    hasAllPermissions: () => false,
    hasAnyPermission: () => false,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const AuthProvider = AuthProviderComponent;

function useAuthHook(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('Auth context unavailable. Please wrap your app in AuthProvider.');
  }
  return ctx;
}

export const useAuth = useAuthHook;
export const useAuthContext = useAuthHook;

/* eslint-enable react-refresh/only-export-components */