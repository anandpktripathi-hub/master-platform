import { useEffect, useMemo, useState } from 'react';
import { useTenantContext } from '../contexts/TenantContext';
import workspaceService, { WorkspaceDto } from '../services/workspaceService';

export default function TenantSelector() {
  const { tenantId, setTenantId } = useTenantContext();
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [switchNote, setSwitchNote] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    workspaceService
      .list()
      .then((list) => {
        if (!mounted) return;
        setWorkspaces(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load workspaces');
        setWorkspaces([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedWorkspaceId = useMemo(() => {
    if (tenantId) return tenantId;
    const current = workspaces.find((w) => w.isCurrent || w.isActive);
    return current?.id || workspaces[0]?.id || '';
  }, [tenantId, workspaces]);

  const handleSwitch = async (workspaceId: string) => {
    if (!workspaceId || workspaceId === tenantId) return;
    try {
      setSwitching(true);
      setSwitchNote(null);
      await workspaceService.switch(workspaceId);
    } catch {
      // Even if the server-side switch fails, updating the client context will
      // keep API header behavior consistent with the rest of the app.
      setSwitchNote('Workspace switch could not be confirmed by the server');
    } finally {
      setSwitching(false);
    }
    setTenantId(workspaceId);
  };

  if (loading) {
    return (
      <span className="text-sm text-gray-600" aria-label="Loading workspaces">
        Loading workspace…
      </span>
    );
  }

  if (error) {
    return (
      <span className="text-sm text-gray-600" aria-label="Workspace selector error">
        {error}
      </span>
    );
  }

  if (!workspaces.length) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Workspace</span>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={selectedWorkspaceId}
        onChange={(e) => void handleSwitch(e.target.value)}
        aria-label="Select workspace"
        disabled={switching || workspaces.length <= 1}
      >
        {workspaces.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name || w.slug || w.id}
          </option>
        ))}
      </select>
      {switchNote && <span className="text-xs text-gray-500">{switchNote}</span>}
    </label>
  );
}
