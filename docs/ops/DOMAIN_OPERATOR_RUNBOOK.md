# Domain & Custom Domain Operator Runbook

**Audience:** Platform operators / PLATFORM_SUPERADMIN users  
**Scope:** Day-to-day management of path/subdomain domains and custom domains for all tenants.

---

## 1. Accessing Admin Domain Views

- **Domains (Admin)** – global view of internal path and subdomain mappings:
  - URL: `/app/admin/domains`
  - Role required: `PLATFORM_SUPERADMIN`
  - Shows: type (PATH/SUBDOMAIN), value, computed URL, status, primary flag, tenant, created date.
- **Custom Domains (Admin Queue)** – global queue of tenant custom domains:
  - URL: `/app/dashboard/custom-domains`
  - Role required: `PLATFORM_SUPERADMIN`
  - Shows: domain, tenant, status, SSL status, created date, activation control.

Use the left-hand navigation under the admin section to reach both views.

---

## 2. Managing Path/Subdomain Domains (Domains Admin)

### 2.1 Filtering & Searching

- Use the **Type** filter to switch between `Path`, `Subdomain`, or all.
- Use the **Status** filter to show only `Pending`, `Active`, `Suspended`, or `Blocked` domains.
- Use the **Search** box to find domains by:
  - Domain value (slug/subdomain)
  - Computed URL
  - Tenant name/slug/ID

The table supports pagination; use the controls at the bottom to move between pages or change the page size.

### 2.2 Understanding Per-Tenant Badges

- In the **Tenant** column, each row shows:
  - The tenant label (name or slug).
  - A small badge like `3 domains` indicating how many domains for that tenant are present in the current filtered result.
- Use this to quickly spot tenants with unusually high or low domain counts.

### 2.3 Changing Domain Status

Typical use cases:
- Move a domain from `pending` to `active` after verification.
- Temporarily `suspend` a domain for abuse or billing issues.
- Mark a domain as `blocked` if it must not be reactivated.

Steps:
1. Find the domain row in **Domains (Admin)**.
2. In the **Actions** column, use the **Status** dropdown.
3. Select the new status (`Pending`, `Active`, `Suspended`, `Blocked`).
4. The change is applied immediately; the table will refresh via the admin update hook.

### 2.4 Setting Primary Domain

- Only **active** domains can be primary.
- Each tenant can have at most one primary active domain.

Steps:
1. Locate the tenant’s domain row.
2. In the **Actions** column, click **Set Primary**.
3. If successful, the **Primary** column will show `PRIMARY` for that row.
4. Previous primary for that tenant will be downgraded to secondary.

### 2.5 Deleting a Domain

Use deletion sparingly, especially for primary or widely used domains.

Steps:
1. Locate the domain row in **Domains (Admin)**.
2. In the **Actions** column, click **Delete**.
3. Confirm the prompt. Once confirmed, the domain is removed.

Recommended practice:
- Prefer `Suspended` status over deletion when you may need auditability or potential future restoration.

---

## 3. Managing Custom Domains (Admin Queue)

### 3.1 Lifecycle Overview

Custom domains pass through these approximate states:
- `pending_verification` – Tenant requested a domain; DNS not yet verified.
- `verified` – DNS TXT/CNAME checks succeeded.
- `ssl_pending` – SSL certificate issuance in progress.
- `ssl_issued` – Certificate issued; ready to activate.
- `active` – Live and routed.
- `suspended` / `failed` – Disabled or failed verification/provisioning.

### 3.2 Reviewing and Filtering

In **Custom Domains (Admin Queue)** you can:
- Filter by **Status** (e.g., show only `pending_verification` or `ssl_issued`).
- Search by domain or tenant.

Use this view daily to:
- Track newly requested custom domains.
- Identify domains stuck in verification/SSL steps.

### 3.3 Activating a Custom Domain

Once DNS is correct and SSL is ready:
1. Filter status to `verified` or `ssl_issued`.
2. For each eligible row, click **Activate**.
3. The backend will mark the domain as `active` and update SSL/tenant routing as implemented.

If activation fails:
- Re-check DNS configuration with the tenant.
- Confirm any external DNS/SSL provider settings if integrated.

### 3.4 Suspending or Cleaning Up Custom Domains

Currently, the primary admin action from this screen is activation. For broader lifecycle operations (suspension, deletion) follow your internal policies and, if exposed, use the corresponding admin APIs or per-tenant views.

---

## 4. Troubleshooting & Best Practices

### 4.1 Domain Not Resolving

1. Confirm the domain appears in **Domains (Admin)** or **Custom Domains (Admin Queue)**.
2. Check **Status** and **Primary** flag.
3. For custom domains, verify DNS records (TXT/CNAME/A) match the provided instructions.
4. Ensure SSL status is not `failed` or `expired`.

### 4.2 Avoiding Downtime

- Always ensure a tenant has at least one working domain (path/subdomain or custom) before suspending or deleting their primary.
- Prefer updating status to `Suspended` rather than deleting records outright.
- Coordinate with billing: use domain suspension to enforce non-payment policies instead of immediate deletion.

### 4.3 Audit & Compliance

- Admin actions (status changes, primary changes, deletions) are routed through secured admin endpoints and should appear in audit logs where implemented.
- Restrict admin domain views to trusted operators with `PLATFORM_SUPERADMIN`.

---

## 5. Quick Reference

- **Domains (Admin)**: `/app/admin/domains` – global path/subdomain view with filters, per-tenant counts, status changes, primary toggle, and delete.
- **Custom Domains (Admin Queue)**: `/app/dashboard/custom-domains` – global custom domain lifecycle monitoring and activation.
- **Tenant Domains Page**: `/app/domains` – tenant-scoped view for self-service domain management.

Use this runbook as the baseline for your internal operations SOPs; extend it with provider-specific DNS/SSL procedures as you connect real registrars and certificate issuers.
