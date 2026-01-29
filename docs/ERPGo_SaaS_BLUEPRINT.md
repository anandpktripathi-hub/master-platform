# ERPGo-Style SaaS Blueprint for Master Platform

## Purpose

This blueprint maps the ERPGo SaaS feature set (modules, sub-modules, features, options) onto the existing Master Platform architecture so we can implement it incrementally and safely.

The goal is to implement a multi-tenant ERP suite on top of the existing:
- NestJS backend (backend/src)
- React admin frontend (frontend/src)
- Existing multi-tenancy, billing, domains, RBAC, hierarchy, and settings.

> NOTE: This is an original design inspired by generic ERP patterns, **not** a copy of any proprietary source code or text. Names are high-level and generic enough to avoid IP conflicts.

---

## Global Concepts

- Tenant = Company
- Super Admin = Platform owner (existing: Tenants, Packages, Coupons, Orders, Monetization)
- Company Admin = Tenant admin (existing: Users, Products, CMS, Settings, Billing, Payments, Support, CRM, Social, Onboarding)
- User = Employee / staff
- Client = External customer / vendor / contact

### Canonical Account Roles (as used in code)

The high-level roles you described map to concrete values in the codebase via a canonical layer in `backend/src/guards/roles.guard.ts` and the user role enum in `backend/src/modules/users/role.types.ts`:

- SaaS Super Admin (Platform Owner)
  - Canonical role: `PLATFORM_SUPER_ADMIN`
  - Allowed user.role values (aliases): `PLATFORM_SUPER_ADMIN`, `PLATFORM_SUPERADMIN`, `platform_admin`, `PLATFORM_ADMIN_LEGACY`.
  - Typical use: full access to `admin/*` routes (settings, tenants, plans, coupons, orders, landing pages, email templates, etc.).

- Admin / Company (Tenant Owner)
  - Canonical role: `TENANT_ADMIN`
  - Allowed user.role values (aliases): `TENANT_ADMIN`, `tenant_admin`, `TENANT_ADMIN_LEGACY`, `OWNER`, `owner`, `ADMIN`, `admin`.
  - Typical use: full control over their own tenant’s ERP modules (Accounting, HRM, CRM, Projects, POS, Products, Support, Users, Clients, Settings).

- Client
  - Canonical role: `CLIENT`
  - Allowed user.role values (aliases): `CLIENT`, `client`, `customer`, `CUSTOMER_LEGACY`.
  - Typical use: limited portal access (invoices, proposals, project/task views, support tickets) depending on module-level permissions.

- User (Employee / Staff)
  - Canonical role: `STAFF`
  - Allowed user.role values (aliases): `STAFF`, `staff`, `user`, `USER`.
  - Typical use: internal tenant users with permissions granted via RBAC roles and hierarchy (e.g., Accountant, HR, Employee, Manager).

Guards and decorators:
- `@Roles(...)` on controllers/services attaches role metadata.
- `RolesGuard` normalizes both the required roles and the `request.user.role` into the canonical set above and enforces access accordingly.

Existing generic systems to leverage:
- `backend/src/modules/tenants` – tenant registration, lifecycle
- `backend/src/modules/users` – platform/tenant users
- `backend/src/modules/products` – features/packages/products abstraction
- `backend/src/modules/dashboard` – KPIs per tenant
- `backend/src/modules/billing`, `backend/src/modules/payments`, `backend/src/billing/monetization.module.ts` – SaaS billing
- `backend/src/modules/support` – generic ticketing
- `backend/src/modules/crm` – generic CRM
- `backend/src/modules/settings` – platform + tenant settings
- `backend/src/modules/hierarchy` – generic hierarchical feature tree (modules, submodules, etc.)

We will extend these and add dedicated ERP modules where missing.

---

## Target ERP Domains & Planned Backend Modules

Each domain below corresponds to a NestJS module namespace under `backend/src/modules/` (or `backend/src/<domain>/` where we already have one).

1. **HRM (Human Resource Management)**
   - New backend module: `backend/src/modules/hrm/`
   - New frontend area: `frontend/src/modules/hrm/`
   - Submodules:
     - Employee Management
     - Payroll & Payslips
     - Leave Management
     - Attendance (per-employee, bulk)
     - Performance & Goals
     - Training & Trainers
     - Recruitment (Jobs, Applications, Candidates, Questions, Interviews, Career Page config)
     - HR Admin (Awards, Transfers, Resignations, Promotions, Complaints, Warnings, Terminations, Holidays)
     - Events & Meetings
     - Employee Assets
     - Employee Documents
     - Company Policies
     - HRM Master Data (branches, departments, designations, leave types, document types, payslip types, allowance types, loan types, deduction types, goal types, training types, award types, termination types, job categories, job stages, performance types, competencies)

2. **Accounting & Finance**
   - New backend module: `backend/src/modules/accounting/`
   - New frontend area: `frontend/src/modules/accounting/`
   - Submodules:
     - Banking (accounts, balances, transfers)
     - Sales (customers, estimates, invoices, revenue & credit notes)
     - Purchases (suppliers, bills, expenses, payments, debit notes)
     - Double Entry (chart of accounts, journals, ledgers, balance sheet, P&L, trial balance)
     - Budget Planner
     - Financial Goals
     - Accounting Setup (taxes, categories, units, custom fields)
     - Accounting Print Settings (proposals, invoices, bills)

3. **CRM (Customer Relationship Management)**
   - Extend existing `backend/src/modules/crm/` and `frontend/src/modules/crm/`.
   - Submodules (ensure coverage):
     - Leads (list/grid, pipeline & stages, tasks, products, sources, files, users, notes, calls, activity feed)
     - Form Builder (lead/contact forms)
     - Contracts (list/grid, details, attachments, comments, notes)
     - CRM Settings (pipelines, lead stages, deal stages, sources, labels, contract types)

4. **Projects & Tasks**
   - New backend module: `backend/src/modules/projects/`
   - New frontend area: `frontend/src/modules/projects/`
   - Submodules:
     - Projects (overview with progress, budget vs expenses, client, timeline, activity log)
     - Tasks (list/grid, stages, priority, due dates, assignees, completion)
     - Timesheets (time tracking per task/project)
     - Bugs (issues per project)
     - Task Calendar
     - Trackers (custom project trackers / KPIs)
     - Reports (overview, milestones, task priority/status, estimates, user contributions, export)
     - Project Setup (task stages, bug statuses)

5. **User & Role Management**
   - Extend / align with existing:
     - `backend/src/modules/users/`
     - `backend/src/modules/rbac/`
   - Ensure support for:
     - Users list, creation, activity log
     - Roles with granular permissions
     - Clients as a first-class concept

6. **Product & Inventory**
   - Extend existing `backend/src/modules/products/` to:
     - Separate Products & Services from feature-packaging products (if needed)
     - Add inventory tracking in conjunction with POS & warehouses
   - New submodule: Product Stock (per warehouse / global, depending on POS design)

7. **POS & Warehousing**
   - New backend module: `backend/src/modules/pos/`
   - New frontend area: `frontend/src/modules/pos/`
   - Submodules:
     - Warehouses & stock
     - Purchases (with invoice & payment summary)
     - POS entries (sales per customer & warehouse)
     - Transfers between warehouses
     - Barcode generation & printing
     - POS Print Settings (templates, logo, colors)
     - Quotations from POS

8. **Support / Ticketing**
   - Extend existing `backend/src/modules/support/`:
     - Ticket overview metrics
     - List/grid views
     - Ticket details, comments, attachments, status flow
     - New ticket creation

9. **Meetings & Calendar Integrations**
   - New backend module: `backend/src/modules/meetings/`
   - New frontend area: `frontend/src/modules/meetings/`
   - Submodules:
     - Zoom Meetings (list, create, join links, status)
     - Google Calendar sync (leveraging system settings)

10. **Messenger / Internal Chat**
    - New backend module: `backend/src/modules/messenger/`
    - New frontend area: `frontend/src/modules/messenger/`
    - Features:
      - Conversations (user-to-user or group)
      - Messages list & read/unread state
      - Basic real-time support (later via WebSocket/Socket.io if desired)

11. **Notifications & Templates**
    - Extend existing email templates + notifications system under:
      - `backend/src/modules/settings/` or dedicated `notifications` module.
    - Features:
      - Template definitions per event (lead, deal, project, task, HR events, invoices, payments, etc.)
      - E-mail trigger services per domain
      - Hook integration from each business module

12. **System & Tenant Settings**
    - Build on `backend/src/modules/settings/`:
      - Brand, system, and company settings per tenant
      - E-mail, payment gateways, integrations (Slack, Telegram, Twilio), Zoom, Google Calendar, webhooks, IP restrictions

---

## Implementation Strategy (High-Level)

1. **Stabilize Core Platform**
   - Ensure backend (backend/) and frontend/ build and all tests pass.
   - Confirm production-ready Docker & PM2 configs.

2. **Introduce ERP Modules Incrementally**
   - For each new domain (HRM, Accounting, Projects, POS, Meetings, Messenger):
     - Define NestJS module with controllers, services, schemas (Mongoose).
     - Add tenant-aware access via existing tenant middleware.
     - Expose REST API under `/api/v1/<domain>/...`.
     - Wire into RBAC using `RbacModule` and the hierarchy system.
   - On frontend, add:
     - Route segments under `/admin/<domain>`
     - Navigation entries for modules (role-based visibility)
     - CRUD pages and dashboards using the new APIs.

3. **Use Hierarchy & RBAC for Feature Flags**
   - Represent ERP modules/submodules as nodes in the hierarchy system.
   - Drive visibility (menus, buttons) and permissions using hierarchy + RBAC.

4. **Tighten QA & Market Readiness**
   - For each module:
     - Add unit + e2e tests (backend).
     - Add basic Playwright/Jest tests (frontend).
     - Update documentation under docs/.

5. **Launch Readiness Checklist**
   - Multi-tenant isolation re-verified.
   - Billing & plan enforcement per feature set.
   - Security hardening (RBAC, input validation, audit logs).
   - Monitoring & metrics via existing terminus + prom-client.

---

## Next Steps in Code (Recommended Order)

1. Create backend scaffolding for `hrm`, `accounting`, `projects`, `pos`, `meetings`, `messenger` modules.
2. Add minimal schemas & endpoints for: employees (HRM) and accounts+customers+invoices (Accounting) as the first vertical slices.
3. Add corresponding basic frontend pages and navigation entries.
4. Integrate hierarchy & RBAC so modules and submodules can be turned on/off per tenant plan.
5. Iterate feature-by-feature, guided by this blueprint.

This file is intended as the long-term reference for implementing ERP-style capabilities in Master Platform.