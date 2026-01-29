# Multi-Tenancy & RBAC Architecture

## Multi-Tenancy Model
- **Tenant Isolation:** All major entities (users, employees, accounts, etc.) include a `tenantId` field. All queries and mutations are filtered by tenant.
- **Subdomain & Custom Domain:** Tenants are mapped to subdomains (e.g., `tenant1.yourdomain.com`) or custom domains (e.g., `customer.com`). The `CustomDomain` schema links domains to tenants.
- **Tenant Context:** Every request is associated with a tenant, resolved from the domain/subdomain or via explicit context in APIs.
- **Data Access:** Services and controllers require a tenant context. No cross-tenant data access is allowed.

## Role-Based Access Control (RBAC)
- **Roles:** Users are assigned roles (e.g., `PLATFORM_SUPER_ADMIN`, `PLATFORM_ADMIN_LEGACY`, `member`, `admin`).
- **Permissions:** Access to resources and actions is controlled by role checks in services and guards.
- **Guards:** JWT and custom guards enforce authentication and role/permission checks at the controller level.
- **Extensibility:** New roles and permissions can be added by extending the `Role` type and updating guards.

## Best Practices
- Always require `tenantId` in service methods and queries.
- Use guards/middleware to enforce tenant and role checks globally.
- Write tests to verify tenant isolation and permission boundaries.
- Document new modules/services for their tenant and RBAC requirements.

---

For more, see backend code in `src/database/schemas/`, `src/modules/`, and `src/workspaces/`.
