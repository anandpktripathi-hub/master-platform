import React from "react";

/**
 * Temporary placeholder for Admin Themes Management page.
 * This avoids TypeScript build errors until the real implementation is ready.
 */
const AdminThemesPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Admin Themes Management
      </h1>
      <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
        This page is under construction. Theme creation, editing, activation and
        CSS variable configuration will be available here later.
      </p>
    </div>
  );
};

export default AdminThemesPage;
