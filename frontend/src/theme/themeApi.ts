import api from "../services/api";

export interface CreateThemePayload {
  name: string;
  description?: string;
  cssVariables?: Record<string, string>;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateThemePayload extends Partial<CreateThemePayload> {
  id?: string;
}

/**
 * Minimal, safe theme API wrapper.
 * Extend later when backend theme endpoints are finalised.
 */
export const themeApi = {
  list: () => api.get("/admin/themes"),

  getById: (id: string) => api.get(`/admin/themes/${id}`),

  create: (payload: CreateThemePayload) =>
    api.post("/admin/themes", payload),

  update: (id: string, payload: UpdateThemePayload) =>
    api.patch(`/admin/themes/${id}`, payload),

  remove: (id: string) => api.delete(`/admin/themes/${id}`),
};

export default themeApi;

