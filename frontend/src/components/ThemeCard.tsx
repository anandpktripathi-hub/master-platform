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
      className={`p-4 m-2 rounded-lg border text-left cursor-pointer bg-[var(--admin-surface,#020617)] text-[var(--admin-text,#e5e7eb)] ${isActive ? 'border-2 border-[var(--admin-primary,#22c55e)]' : 'border border-[var(--admin-border,#444)]'}`}
    >
      <div className="font-semibold">{name}</div>
      {description && <div className="text-xs opacity-80">{description}</div>}
      {isActive && (
        <div className="mt-1 text-[11px] text-[var(--admin-primary,#22c55e)]">Active theme</div>
      )}
    </button>
  );
};

export default ThemeCard;
