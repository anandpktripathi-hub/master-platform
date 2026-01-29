import React, { useEffect, useMemo, useState } from "react";
import {
  MarketplacePluginDto,
  TenantPluginInstallDto,
  marketplaceApi,
} from "../../lib/api";
import { useApiErrorToast } from "../../providers/QueryProvider";

interface PluginWithInstall extends MarketplacePluginDto {
  install?: TenantPluginInstallDto;
}

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState<MarketplacePluginDto[]>([]);
  const [installs, setInstalls] = useState<TenantPluginInstallDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyPlugin, setBusyPlugin] = useState<string | null>(null);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalog, tenantInstalls] = await Promise.all([
        marketplaceApi.listPlugins(),
        marketplaceApi.listInstalls(),
      ]);
      setPlugins(catalog);
      setInstalls(tenantInstalls);
    } catch (err: any) {
      setError(err?.message || "Failed to load marketplace data");
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  const merged: PluginWithInstall[] = useMemo(() => {
    return plugins.map((p) => ({
      ...p,
      install: installs.find((i) => i.pluginId === p.pluginId),
    }));
  }, [plugins, installs]);

  const handleInstall = async (pluginId: string) => {
    setBusyPlugin(pluginId);
    try {
      await marketplaceApi.installPlugin({ pluginId });
      await loadAll();
      showSuccessToast("Plugin installed for this workspace.");
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setBusyPlugin(null);
    }
  };

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    setBusyPlugin(pluginId);
    try {
      await marketplaceApi.togglePlugin(pluginId, enabled);
      await loadAll();
      showSuccessToast(enabled ? "Plugin enabled." : "Plugin disabled.");
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setBusyPlugin(null);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!window.confirm("Uninstall this plugin from this workspace?")) return;
    setBusyPlugin(pluginId);
    try {
      await marketplaceApi.uninstallPlugin(pluginId);
      await loadAll();
      showSuccessToast("Plugin uninstalled.");
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setBusyPlugin(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Workspace Marketplace</h1>
          <p className="text-sm text-slate-400">
            Discover add-ons and integrations that extend your workspace with CRM, billing, automation, and analytics features.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-slate-400 text-sm mb-3">Loading marketplace…</div>}
      {!loading && error && <div className="text-sm text-red-400 mb-3">{error}</div>}

      {!loading && !error && merged.length === 0 && (
        <div className="text-sm text-slate-500">No marketplace plugins are available yet.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {merged.map((p) => {
          const installed = !!p.install;
          const enabled = !!p.install?.enabled;
          return (
            <div
              key={p.pluginId}
              className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center mb-2">
                  {p.iconUrl && (
                    <img
                      src={p.iconUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded mr-2 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-slate-100">{p.name}</div>
                    <div className="text-[11px] text-slate-500">Plugin ID: {p.pluginId}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2 min-h-[3rem]">
                  {p.description || "No description provided for this plugin."}
                </p>
                {p.requiredScopes && p.requiredScopes.length > 0 && (
                  <div className="text-[11px] text-slate-400 mb-2">
                    Requires scopes: {p.requiredScopes.join(", ")}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {installed ? (
                    <>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/60 mr-2">
                        Installed
                      </span>
                      {enabled ? "Enabled" : "Disabled"}
                    </>
                  ) : (
                    <span className="text-slate-500">Not installed</span>
                  )}
                </div>
                <div className="space-x-2 text-xs">
                  {!installed && (
                    <button
                      type="button"
                      disabled={busyPlugin === p.pluginId}
                      onClick={() => void handleInstall(p.pluginId)}
                      className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-60"
                    >
                      {busyPlugin === p.pluginId ? "Installing…" : "Install"}
                    </button>
                  )}
                  {installed && (
                    <>
                      <button
                        type="button"
                        disabled={busyPlugin === p.pluginId}
                        onClick={() => void handleToggle(p.pluginId, !enabled)}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
                      >
                        {busyPlugin === p.pluginId
                          ? "Saving…"
                          : enabled
                          ? "Disable"
                          : "Enable"}
                      </button>
                      <button
                        type="button"
                        disabled={busyPlugin === p.pluginId}
                        onClick={() => void handleUninstall(p.pluginId)}
                        className="px-3 py-1 rounded bg-red-700/80 hover:bg-red-600 disabled:opacity-60"
                      >
                        {busyPlugin === p.pluginId ? "Removing…" : "Uninstall"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
