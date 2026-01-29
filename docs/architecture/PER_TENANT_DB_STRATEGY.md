# Optional Per-Tenant Database Strategy (Design)

**Goal:** Provide a safe, production-ready design for enabling an optional "database-per-tenant" deployment mode on top of the existing shared-DB, tenantId-based architecture, without breaking current tenants.

---

## 1. Current Model (Baseline)

- **Architecture:** Single MongoDB database shared by all tenants.
- **Isolation:** Enforced via `tenantId` fields on all multi-tenant schemas.
- **Workspace model:** ERP workspaces + guards ensure tenant context in every request.
- **Advantages:** Simple operations, easy migrations, lower infra overhead.
- **Limitations:**
  - Harder to move a single tenant to another cluster.
  - No hard resource caps per tenant at DB level.
  - Backup/restore is global, not per tenant.

This model remains the default and is already production-ready.

---

## 2. Target Model: Optional DB-per-Tenant

### 2.1 High-Level Design

- Introduce a **"database per tenant" mode** controlled by configuration (feature flag).
- Maintain the existing shared-DB code paths to avoid breaking current deployments.
- For tenants flagged as "isolated", all of their tenant-scoped models (Users, Orders, Accounting, HRM, etc.) will read/write from a dedicated MongoDB database.

### 2.2 Connection Strategy

- Use Mongoose connection per tenant:
  - A **primary shared connection** (current behavior).
  - A **tenant connection registry** keyed by `tenantId` or `tenantSlug`.
- Connections are created lazily on first use and cached.
- Idle connections can be pruned using an LRU or TTL-based strategy.

Pseudo-code sketch:

```ts
// connection-registry.ts
const tenantConnections = new Map<string, Connection>();

export async function getTenantConnection(tenantKey: string): Promise<Connection> {
  if (tenantConnections.has(tenantKey)) return tenantConnections.get(tenantKey)!;

  const uri = buildTenantMongoUri(tenantKey); // e.g., mongodb://.../smetasc_tenant_${tenantKey}
  const conn = await mongoose.createConnection(uri).asPromise();
  tenantConnections.set(tenantKey, conn);
  return conn;
}
```

### 2.3 Tenant Routing

- Extend the existing **WorkspaceGuard** / tenant resolution layer to derive a **`tenantKey`** for DB routing.
- Add a helper:

```ts
export interface TenantDbContext {
  tenantId: string;
  tenantKey: string; // slug or id
  dbMode: 'shared' | 'per-tenant';
}
```

- For each request:
  - Determine `tenantId` and `tenantKey`.
  - Look up tenant config to see if `dbMode === 'per-tenant'`.
  - Attach `TenantDbContext` to `request` for downstream providers.

### 2.4 Model Binding

Two options:

1. **Dynamic model lookup per tenant** (flexible, more code):
   - Replace global `@InjectModel()` usage for tenant-scoped collections with a small factory that checks the `TenantDbContext` and returns a model from the appropriate connection.

2. **Hybrid model strategy** (simpler rollout):
   - Keep core platform models (Tenants, Packages, RBAC, etc.) in the shared DB only.
   - Move heavy data modules (Orders, Accounting, HRM, Projects, POS) to per-tenant DBs when enabled.

Given the size of this project, **Option 2** is recommended for an incremental, low-risk rollout.

---

## 3. Data Layout & Naming

- **Database naming convention:** `smetasc_shared` (current DB), `smetasc_tenant_<slugOrId>` for isolated tenants.
- **Collections:** Keep collection names the same to minimize code branching.

Examples:
- Shared DB: `tenants`, `packages`, `users` (platform-wide), etc.
- Tenant DB: `orders`, `invoices`, `transactions`, `employees`, `projects`, `tasks`, etc.

---

## 4. Migration Strategy

### 4.1 Enabling Per-Tenant Mode

- Add a field to the Tenant schema: `dbMode?: 'shared' | 'per-tenant'`.
- Add an operator-only UI or script to switch a tenant from shared → per-tenant.
- Keep `tenantId` fields in all collections even in tenant DBs (for compatibility and future exports).

### 4.2 Data Migration Steps (Per Tenant)

For a given tenant `T`:

1. **Create tenant DB:**
   - `use smetasc_tenant_T;` (or via Mongoose connection).
   - Apply the same Mongoose schemas (ensured by code).
2. **Copy data:**
   - For each selected collection (e.g., `orders`, `invoices`, `transactions`, `employees`, `projects`, etc.):
     - Copy all documents with `tenantId = T` from the shared DB into the tenant DB.
3. **Dry run checks:**
   - Compare counts and basic checksums for each collection.
4. **Cutover window:**
   - Set tenant `dbMode` to `per-tenant` but **keep shared DB write paths disabled for that tenant**.
   - Monitor logs and errors.
5. **Cleanup (optional, after stability):**
   - Remove or archive data for tenant `T` in the shared DB (keep backups).

All of the above must be performed with strong backup and rollback procedures and is **not** auto-run by default.

---

## 5. Feature Flags & Configuration

- Add a top-level config flag: `MULTI_DB_MODE` = `disabled | mixed | forced`.
  - `disabled` (default): All tenants use the shared DB.
  - `mixed`: Some tenants can be flipped to per-tenant DBs.
  - `forced`: New tenants default to per-tenant DBs.
- Add an environment-driven map or queryable configuration to decide per-tenant DB mode.

Example (.env):

```bash
MULTI_DB_MODE=mixed
MULTI_DB_TENANT_KEYS=tenant-a,tenant-b
```

---

## 6. Operational Considerations

### 6.1 Backups

- Shared DB: Continue current backup strategy.
- Tenant DBs: Add a per-tenant backup schedule.
  - Optionally group small tenants into batches.

### 6.2 Monitoring

- Expose metrics per connection (open connections, query latency).
- Track error rates per tenant to detect issues early after migration.

### 6.3 Cost & Scaling

- For small deployments, keep `MULTI_DB_MODE=disabled` for simplicity.
- For large/enterprise tenants, selectively enable per-tenant DBs to:
  - Move them to dedicated clusters.
  - Guarantee performance and isolation.

---

## 7. Implementation Roadmap

1. **Phase 1 – Infrastructure & Config (Low-Risk):**
   - Implement `TenantDbContext` and connection-registry utilities.
   - Add config flags (`MULTI_DB_MODE`, `MULTI_DB_TENANT_KEYS`).
   - Wire guards/middleware to attach `TenantDbContext` per request.

2. **Phase 2 – Module-by-Module Opt-In:**
   - Start with one heavy module (e.g., `orders`):
     - Add dynamic model lookup by `TenantDbContext`.
     - Test both shared and per-tenant modes.
   - Gradually extend to Accounting, HRM, Projects, POS.

3. **Phase 3 – Tenant Migration Tools:**
   - Implement migration scripts (Node/TS + Mongoose) to move a single tenant’s data.
   - Build admin-only UI or CLI to:
     - Select tenant.
     - Run migration.
     - Flip `dbMode` when safe.

4. **Phase 4 – Hardening & Documentation:**
   - Load tests for mixed-mode operations.
   - Update operations runbooks, including backup and incident response.

---

## 8. Summary

- The existing shared-database + tenantId model remains **production-ready and recommended** for most deployments.
- This design provides a clear, safe path to an **optional** per-tenant DB mode for high-end customers, without breaking current tenants.
- Actual code changes should follow this roadmap in small, well-tested increments rather than a single disruptive rewrite.
