import React from "react";

export interface ThemeCardProps {
  name: string;
  description?: string;
  isActive?: boolean;
  onSelect?: () => void;
}

/**
 * Minimal placeholder ThemeCard component.
 * Use this to show selectable themes in the UI.
 */
const ThemeCard: React.FC<ThemeCardProps> = ({
  name,
  description,
  isActive,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      style={{
        padding: "1rem",
        margin: "0.5rem",
        borderRadius: 8,
        border: isActive ? "2px solid #22c55e" : "1px solid #444",
        background: "#020617",
        color: "#e5e7eb",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 600 }}>{name}</div>
      {description && <div style={{ fontSize: 12, opacity: 0.8 }}>{description}</div>}
      {isActive && (
        <div style={{ marginTop: 4, fontSize: 11, color: "#22c55e" }}>
          Active theme
        </div>
      )}
    </button>
  );
};

export default ThemeCard;
