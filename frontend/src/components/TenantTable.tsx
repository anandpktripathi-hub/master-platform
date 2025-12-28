import React from "react";

interface Tenant {
  _id?: string;
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface TenantTableProps {
  tenants?: Tenant[];
  onSelect?: (tenant: Tenant) => void;
}

/**
 * Minimal placeholder TenantTable component.
 * Replace with full tenant management UI later.
 */
const TenantTable: React.FC<TenantTableProps> = ({ tenants = [] }) => {
  return (
    <div style={{ padding: "1rem", border: "1px dashed var(--admin-border, #555)", borderRadius: 8 }}>
      <p>TenantTable placeholder. Total tenants: {tenants.length}</p>
      <ul>
        {tenants.map((t, idx) => (
          <li key={t._id ?? t.id ?? idx}>{t.name ?? "Unnamed tenant"}</li>
        ))}
      </ul>
    </div>
  );
};

export default TenantTable;
