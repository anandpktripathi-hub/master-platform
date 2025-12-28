# Frontend (Vite + React + TS)

This app is wired to the backend APIs for domains, custom domains, packages, coupons, audit logs, and multi-tenancy. React Query, React Hook Form, and Zod are preinstalled.

## Configure

Create `.env.local` with:

```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

Tokens are read from `localStorage` key `token`; tenant context can be passed via `localStorage` key `tenantId` or `x-tenant-id` header per request.

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – ESLint
- `npm run test` – unit tests (Jest)
- `npm run test:e2e` – Playwright e2e scaffold
- `npm run dev:mock` – run dev server in mock mode (uses Vite mock env)

## E2E (Playwright)

- Config: `playwright.config.ts`
- Tests: `tests/e2e/*.spec.ts` (scaffolds for domains, custom domains, packages/coupons)
- Set `E2E_BASE_URL` if not using default `http://localhost:5173`.

## Integration Notes

- API client: `src/api/client.ts` auto-attaches JWT and optional `x-tenant-id`; handles 401/403 centrally.
- React Query provider and notistack toasts: `src/providers/QueryProvider.tsx`.
- Auth context: `src/contexts/AuthContext.tsx` with `RequireAuth`/`RequireRole` guards.
- Shared UI states: `src/components/common` (loading/error/empty/confirm dialog/status chip).
