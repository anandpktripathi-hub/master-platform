# Frontend (React/Vite) – Master Platform

This frontend is a modern, multi-tenant SaaS UI built with React, Vite, and Tailwind CSS.

## Structure
- `src/` – Main app code (pages, components, hooks, utils)
- `public/` – Static assets
- `tests/` – Frontend tests

## Key Features
- Tenant-aware routing (subdomain, custom domain)
- Theming and branding per tenant
- Auth flows (JWT, OAuth)
- RBAC-aware UI
- Billing, CMS, and integrations

## Common Scripts
- `npm run dev` – Start in development mode (default port: 5173)
- `npm run build` – Build for production
- `npm run test` – Run tests

## Environment
- Copy `.env.example` to `.env` and update values

## Extending
- Add new pages/components in `src/`
- Use hooks and context for state management
- See `../docs/themes/` for theming guidelines

## More
- For architecture, see `../docs/overview/PROJECT_CONTEXT.md`
- For deployment, see `../docs/ops/DEPLOYMENT.md`
