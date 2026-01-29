# Backend (NestJS) – Master Platform

This backend powers the multi-tenant SaaS platform using NestJS and TypeScript.

## Structure
- `src/` – Main application code (modules, controllers, services)
- `migrations/` – Database migrations
- `scripts/` – Utility scripts
- `logs/` – Log output

## Key Features
- Multi-tenancy with subdomain and custom domain support
- JWT authentication, OAuth (Google, GitHub)
- RBAC (role-based access control)
- Subscription billing (Stripe, PayPal, Razorpay)
- Webhooks, integrations, audit logging

## Common Scripts
- `npm run start:dev` – Start in development mode
- `npm run build` – Build for production
- `npm run migration:run` – Run DB migrations
- `npm run test` – Run tests

## Environment
- Copy `.env.example` to `.env` and update values
- Default port: 4000

## Extending
- Add new modules in `src/`
- Use NestJS providers for extensibility
- See `docs/API/API-DOCUMENTATION.md` for API reference

## More
- For architecture, see `../docs/overview/PROJECT_CONTEXT.md`
- For deployment, see `../docs/ops/DEPLOYMENT.md`
