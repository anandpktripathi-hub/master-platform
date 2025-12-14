import React from "react";

/**
 * Minimal placeholder dashboard overview widget.
 * Replace with real KPIs & charts later.
 */
const OverviewWidget: React.FC = () => {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #374151",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Dashboard Overview
      </h2>
      <p style={{ fontSize: 13, opacity: 0.8 }}>
        This is a placeholder widget. Add real metrics here (tenants, users, revenue, etc.).
      </p>
    </div>
  );
};

export default OverviewWidget;
