import api, { authApi } from '../lib/api';

// Keep this file as a compatibility layer: older code imports from
// ../services/api, while newer code uses ../lib/api directly.

export { authApi };

export const usersApi = api;
export const productsApi = api;
export const tenantsApi = api;
export const themesApi = api;
export const dashboardsApi = api;
export const packagesApi = api;

export default api;
