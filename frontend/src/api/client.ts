import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * Enhanced API client for multi-tenant SaaS platform
 * 
 * Features:
 * - Automatic JWT token attachment
 * - Optional tenant ID header injection
 * - 401 redirect to login
 * - 403 permission error handling
 * - Response unwrapping
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

// Create main API client
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add Authorization and optional x-tenant-id
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach JWT token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optionally attach tenant ID (for admin cross-tenant operations)
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && config.headers && !config.headers['x-tenant-id']) {
      // Only add if not already set (allows per-request override)
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle errors and unwrap data
api.interceptors.response.use(
  (response) => {
    // Unwrap response.data for cleaner usage
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized: Clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        
        // Trigger global auth handler
        const loginUrl = '/login';
        if (window.location.pathname !== loginUrl) {
          window.location.href = loginUrl;
        }
        
        return Promise.reject({
          type: 'AUTH_ERROR',
          message: 'Session expired. Please log in again.',
          status: 401,
        });
      }

      // 403 Forbidden: Permission denied
      if (status === 403) {
        return Promise.reject({
          type: 'PERMISSION_ERROR',
          message: error.response.data?.message || 'You do not have permission to perform this action.',
          status: 403,
        });
      }

      // 400 Bad Request: Validation error
      if (status === 400) {
        return Promise.reject({
          type: 'VALIDATION_ERROR',
          message: error.response.data?.message || 'Invalid request.',
          details: error.response.data?.details || {},
          status: 400,
        });
      }

      // 409 Conflict: Resource conflict (e.g., duplicate domain)
      if (status === 409) {
        return Promise.reject({
          type: 'CONFLICT_ERROR',
          message: error.response.data?.message || 'Resource already exists.',
          status: 409,
        });
      }

      // 404 Not Found
      if (status === 404) {
        return Promise.reject({
          type: 'NOT_FOUND_ERROR',
          message: error.response.data?.message || 'Resource not found.',
          status: 404,
        });
      }

      // Other errors
      return Promise.reject({
        type: 'API_ERROR',
        message: error.response.data?.message || 'An unexpected error occurred.',
        status,
        data: error.response.data,
      });
    }

    // Network error or no response
    return Promise.reject({
      type: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      error,
    });
  }
);

/**
 * Create an API client with custom tenant ID
 * Useful for admin operations on behalf of a specific tenant
 */
export function createApiClientWithTenant(tenantId: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
  });

  // Add token interceptor
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Use same response interceptor logic
  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      // Same error handling as main api
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

/**
 * Helper to set tenant context for subsequent requests
 */
export function setTenantContext(tenantId: string | null) {
  if (tenantId) {
    localStorage.setItem('tenantId', tenantId);
  } else {
    localStorage.removeItem('tenantId');
  }
}

/**
 * Helper to get current tenant ID
 */
export function getTenantContext(): string | null {
  return localStorage.getItem('tenantId');
}

export default api;
