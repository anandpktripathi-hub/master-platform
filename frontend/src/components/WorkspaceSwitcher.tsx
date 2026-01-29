import React from 'react';

export function WorkspaceSwitcher({ workspaces, current, onSwitch }: {
  workspaces: { id: string; name: string }[];
  current: string;
  onSwitch: (id: string) => void;
}) {
  return (
    <select value={current} onChange={e => onSwitch(e.target.value)}>
      {workspaces.map(ws => (
        <option key={ws.id} value={ws.id}>{ws.name}</option>
      ))}
    </select>
  );
}
