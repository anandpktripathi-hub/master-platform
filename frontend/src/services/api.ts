import axios from "axios";

// Base API instance for the whole app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap response.data and handle 401/403
api.interceptors.response.use(
  (response) => {
    // Unwrap response.data for all successful responses
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 401 Unauthorized: redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired. Please login again."));
      }

      // 403 Forbidden: preserve backend message so we can surface
      // quota/payment/subscription issues instead of a generic error.
      if (error.response.status === 403) {
        const backendMessage =
          (error.response.data && (error.response.data.message || error.response.data.error)) ||
          undefined;
        const message = backendMessage || "Permission denied";
        return Promise.reject(new Error(message));
      }

      // For other errors (including 5xx), pass through without global alert
      // Let individual components handle their errors
      return Promise.reject(error);
    }

    // Network error or no response
    return Promise.reject(error);
  }
);

// ---------------- AUTH API ----------------

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginPayload) => {
    const { email, password } = data;

    return api.post("/auth/login", {
      email,
      password,
    });
  },
};

// --------------- OTHER APIS ----------------

export const usersApi = api;
export const productsApi = api;
export const tenantsApi = api;
export const themesApi = api;
export const dashboardsApi = api;

export default api;
