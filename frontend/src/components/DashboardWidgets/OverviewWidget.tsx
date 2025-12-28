import React from "react";

/**
 * Minimal placeholder dashboard overview widget.
 * Replace with real KPIs & charts later.
 */
const OverviewWidget: React.FC = () => {
  return (
    <div className="p-4 rounded-lg border border-[#374151] bg-[#020617] text-[#e5e7eb]">
      <h2 className="text-base font-semibold mb-2">Dashboard Overview</h2>
      <p className="text-sm opacity-80">This is a placeholder widget. Add real metrics here (tenants, users, revenue, etc.).</p>
    </div>
  );
};

export default OverviewWidget;
