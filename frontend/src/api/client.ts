// IMPORTANT:
// This file is intentionally a thin re-export of the canonical API client in `src/lib/api.ts`.
// That client is the single source of truth for:
// - baseURL (/api/v1)
// - Authorization handling
// - x-workspace-id header injection (multi-tenancy)
// - consistent response unwrapping and refresh flow

import api from '../lib/api';

export default api;
