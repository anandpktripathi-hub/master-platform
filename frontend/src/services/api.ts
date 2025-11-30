const API_BASE_URL = 'http://localhost:4000/api/v1';

const getToken = () => localStorage.getItem('token');

const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const authApi = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
};

export const usersApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/users?page=${page}&limit=${limit}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  create: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  update: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  bulkCreate: async (users) => {
    const response = await fetch(`${API_BASE_URL}/users/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ users }),
    });
    if (!response.ok) throw new Error('Failed to bulk create users');
    return response.json();
  },
};

export const productsApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/products?page=${page}&limit=${limit}`,
      { headers: getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },
};

export const themesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/themes`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch themes');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch theme');
    return response.json();
  },

  create: async (themeData) => {
    const response = await fetch(`${API_BASE_URL}/themes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(themeData),
    });
    if (!response.ok) throw new Error('Failed to create theme');
    return response.json();
  },

  update: async (id, themeData) => {
    const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(themeData),
    });
    if (!response.ok) throw new Error('Failed to update theme');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete theme');
  },
};

export const dashboardsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboards`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboards');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  },

  create: async (dashboardData) => {
    const response = await fetch(`${API_BASE_URL}/dashboards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dashboardData),
    });
    if (!response.ok) throw new Error('Failed to create dashboard');
    return response.json();
  },

  update: async (id, dashboardData) => {
    const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dashboardData),
    });
    if (!response.ok) throw new Error('Failed to update dashboard');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete dashboard');
  },
};

export const tenantsApi = {
  getCurrentTenant: async () => {
    const response = await fetch(`${API_BASE_URL}/tenants/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch tenant');
    return response.json();
  },
};
