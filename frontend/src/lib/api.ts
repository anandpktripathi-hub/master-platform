const API_BASE_URL = "http://localhost:4000/api/v1"

async function request(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch (e: any) {
    console.error("API FETCH ERROR", e)
    throw new Error("Network error while calling backend")
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data
}

export const authApi = {
  async login(email: string, password: string) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
  async register(payload: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
}

export const usersApi = {
  async list(page: number = 1, limit: number = 10) {
    return request(`/users?page=${page}&limit=${limit}`)
  },
  async create(payload: {
    firstName: string
    lastName: string
    email: string
    password: string
    role?: string
    isActive?: boolean
  }) {
    return request("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  async bulkCreate(users: any[]) {
    return request("/users/bulk", {
      method: "POST",
      body: JSON.stringify({ users }),
    })
  },
  async update(id: string, payload: Partial<{
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    isActive: boolean
  }>) {
    return request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  async remove(id: string) {
    return request(`/users/${id}`, {
      method: "DELETE",
    })
  },
}
