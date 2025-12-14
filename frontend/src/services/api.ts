import axios from "axios";

// Base API instance for the whole app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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
