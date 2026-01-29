// @ts-nocheck
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  ApiKeyCreatedResponseDto,
  ApiKeySummaryDto,
  CreateApiKeyRequestDto,
  WebhookLogDetailDto,
  WebhookLogSummaryDto,
  developerApi,
} from "../../lib/api";
import { useApiErrorToast } from "../../providers/QueryProvider";

export default function DeveloperPortalPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeySummaryDto[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [rawKeyResult, setRawKeyResult] = useState<ApiKeyCreatedResponseDto | null>(null);

  const [form, setForm] = useState<CreateApiKeyRequestDto>({ name: "" });

  const [logs, setLogs] = useState<WebhookLogSummaryDto[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logFilters, setLogFilters] = useState<{ event: string; status: string }>(
    { event: "", status: "" },
  );
  const [selectedLog, setSelectedLog] = useState<WebhookLogDetailDto | null>(null);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  useEffect(() => {
    void loadApiKeys();
    void loadLogs();
  }, []);

  const loadApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const data = await developerApi.listApiKeys();
      setApiKeys(data);
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setLoadingKeys(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const data = await developerApi.listWebhookLogs({
        limit: 50,
        skip: 0,
        event: logFilters.event || undefined,
        status: logFilters.status || undefined,
      });
      setLogs(data.data);
      setLogsTotal(data.total);
    } catch (err: any) {
      setLogsError(err?.message || "Failed to load webhook logs");
      showErrorToast(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setCreating(true);
    setCreateError(null);
    setRawKeyResult(null);
    try {
      const payload: CreateApiKeyRequestDto = {
        name: form.name.trim(),
        scopes: form.scopes,
        expiresAt: form.expiresAt || undefined,
      };
      const res = await developerApi.createApiKey(payload);
      setRawKeyResult(res);
      setForm({ name: "" });
      await loadApiKeys();
      showSuccessToast("API key created successfully.");
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create API key");
      showErrorToast(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Revoke this API key?")) return;
    try {
      await developerApi.revokeApiKey(id);
      await loadApiKeys();
      showSuccessToast("API key revoked.");
    } catch {
      showErrorToast("Failed to revoke API key");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this API key permanently?")) return;
    try {
      await developerApi.deleteApiKey(id);
      await loadApiKeys();
      showSuccessToast("API key deleted.");
    } catch {
      showErrorToast("Failed to delete API key");
    }
  };

  const handleViewLog = async (id: string) => {
    try {
      const detail = await developerApi.getWebhookLog(id);
      setSelectedLog(detail);
    } catch (err: any) {
      showErrorToast(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold mb-1">Developer API Keys</h1>
        <p className="text-sm text-slate-400 mb-4">
          Create and manage secret API keys for integrating this workspace with external systems.
          Store generated keys securely; they are only shown once on creation.
        </p>

        <form onSubmit={handleCreate} className="border border-slate-800 rounded-lg p-4 mb-6 space-y-3 bg-slate-900/40">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Key name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
                placeholder="e.g. Zapier integration key"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scopes (comma separated)</label>
              <input
                type="text"
                value={form.scopes?.join(", ") || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  const scopes = value
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter((s: string) => Boolean(s));
                  setForm((prev) => ({ ...prev, scopes: scopes.length ? scopes : undefined }));
                }}
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
                placeholder="Optional: billing:read, crm:write"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expires at (optional)</label>
              <input
                type="date"
                value={form.expiresAt || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm((prev) => ({ ...prev, expiresAt: e.target.value || undefined }))}
                className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-sm font-medium disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create API key"}
            </button>
          </div>
          {createError && <div className="text-xs text-red-400 mt-2">{createError}</div>}
          {rawKeyResult && (
            <div className="mt-3 text-xs text-amber-300 bg-slate-900 border border-amber-600 rounded p-3">
              <div className="font-semibold mb-1">Copy this secret key now – it won't be shown again:</div>
              <div className="font-mono break-all text-sm">{rawKeyResult.rawKey}</div>
            </div>
          )}
        </form>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-slate-900/60 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300">Existing API keys</div>
            {loadingKeys && <div className="text-xs text-slate-400">Loading…</div>}
          </div>
          {apiKeys.length === 0 && !loadingKeys && (
            <div className="px-4 py-4 text-sm text-slate-500">No API keys created yet.</div>
          )}
          {apiKeys.length > 0 && (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/40">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Prefix</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Scopes</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Last used</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Expires</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {apiKeys.map((k) => (
                  <tr key={k.id}>
                    <td className="px-4 py-2 text-slate-100">{k.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-300">{k.keyPrefix}</td>
                    <td className="px-4 py-2 text-slate-300 text-xs">
                      {k.scopes && k.scopes.length > 0 ? k.scopes.join(", ") : <span className="text-slate-500">(all)</span>}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {k.isActive ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/60 text-[11px]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-[11px]">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-300 space-x-2">
                      {k.isActive && (
                        <button
                          type="button"
                          onClick={() => void handleRevoke(k.id)}
                          className="px-2 py-1 rounded bg-amber-700/80 hover:bg-amber-600 text-[11px]"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(k.id)}
                        className="px-2 py-1 rounded bg-red-700/80 hover:bg-red-600 text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">Webhook Delivery Logs</h2>
            <p className="text-sm text-slate-400">
              Inspect recent webhook deliveries for debugging integrations like Zapier, Make, or custom webhooks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadLogs()}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event filter</label>
            <input
              type="text"
              value={logFilters.event}
              onChange={(e) => setLogFilters((prev) => ({ ...prev, event: e.target.value }))}
              onBlur={() => void loadLogs()}
              className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-xs"
              placeholder="e.g. billing.invoice.paid"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status filter</label>
            <select
              value={logFilters.status}
              onChange={(e) => {
                const value = e.target.value;
                setLogFilters((prev) => ({ ...prev, status: value }));
                void loadLogs();
              }}
              className="px-3 py-2 rounded bg-slate-950 border border-slate-700 text-xs"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {logsTotal > 0 && (
            <div className="text-xs text-slate-400">{logsTotal} total deliveries</div>
          )}
        </div>

        {logsLoading && <div className="text-slate-400 text-sm">Loading webhook logs…</div>}
        {!logsLoading && logsError && (
          <div className="text-sm text-red-400">{logsError}</div>
        )}

        {!logsLoading && !logsError && logs.length === 0 && (
          <div className="text-sm text-slate-500">No webhook deliveries recorded yet.</div>
        )}

        {!logsLoading && !logsError && logs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 border border-slate-800 rounded-lg overflow-hidden">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-900/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Event</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">URL</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">HTTP</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">When</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-300">Attempts</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-200 max-w-[10rem] truncate" title={log.event}>{log.event}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-400 max-w-[14rem] truncate" title={log.url}>{log.url}</td>
                      <td className="px-3 py-2 text-[11px]">
                        {log.status === "success" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/60">Success</span>
                        )}
                        {log.status === "failed" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-red-900/70 text-red-300 border border-red-700/70">Failed</span>
                        )}
                        {log.status !== "success" && log.status !== "failed" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">{log.status}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-400">{log.responseStatus ?? "—"}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2 text-[11px] text-slate-400">{log.attemptNumber}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => void handleViewLog(log.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70 text-xs max-h-[420px] overflow-auto">
              {!selectedLog && (
                <div className="text-slate-500">Select a log row to inspect full request and response details.</div>
              )}
              {selectedLog && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-200">{selectedLog.event}</div>
                    <button
                      type="button"
                      onClick={() => setSelectedLog(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <div className="truncate" title={selectedLog.url}>{selectedLog.method} {selectedLog.url}</div>
                    <div>HTTP {selectedLog.responseStatus ?? "—"} · Status: {selectedLog.status}</div>
                    {selectedLog.error && (
                      <div className="mt-1 text-red-300">Error: {selectedLog.error}</div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[11px] text-slate-200 mt-2 mb-1">Request headers</div>
                    <pre className="bg-slate-950 rounded p-2 whitespace-pre-wrap break-all border border-slate-800">{JSON.stringify(selectedLog.requestHeaders ?? {}, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="font-semibold text-[11px] text-slate-200 mt-2 mb-1">Request body</div>
                    <pre className="bg-slate-950 rounded p-2 whitespace-pre-wrap break-all border border-slate-800">{JSON.stringify(selectedLog.requestBody ?? {}, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="font-semibold text-[11px] text-slate-200 mt-2 mb-1">Response headers</div>
                    <pre className="bg-slate-950 rounded p-2 whitespace-pre-wrap break-all border border-slate-800">{JSON.stringify(selectedLog.responseHeaders ?? {}, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="font-semibold text-[11px] text-slate-200 mt-2 mb-1">Response body</div>
                    <pre className="bg-slate-950 rounded p-2 whitespace-pre-wrap break-all border border-slate-800">{JSON.stringify(selectedLog.responseBody ?? {}, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
