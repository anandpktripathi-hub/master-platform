/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api, { authApi } from "../lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role?: string;
  company?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderComponent({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On app load, if token exists, fetch /users/me to restore current user
  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // API now returns unwrapped response.data directly
        const rawUser = await api.get("/users/me");

        const mappedUser: AuthUser = {
          id: rawUser._id ?? rawUser.id,
          email: rawUser.email,
          name:
            rawUser.name ??
            `${rawUser.firstName ?? ""} ${rawUser.lastName ?? ""}`.trim(),
          role: rawUser.role,
          company: rawUser.company,
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

  // Login: call /auth/login, save token, then /users/me
  const login = async (payload: LoginPayload) => {
    // API now returns unwrapped response.data directly
    const response = await authApi.login(payload);
    const accessToken: string = response.access_token;
    const rawUser = response.user;

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
      };
      setUser(mappedUser);
      return;
    }

    // Fallback: fetch from /users/me if user not in login payload
    // API now returns unwrapped response.data directly
    const me = await api.get("/users/me");
    const mappedUser: AuthUser = {
      id: me._id ?? me.id,
      email: me.email,
      name:
        me.name ?? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim(),
      role: me.role,
      company: me.company,
    };
    setUser(mappedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export const AuthProvider = AuthProviderComponent;

function useAuthHook(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export const useAuth = useAuthHook;

/* eslint-enable react-refresh/only-export-components */


