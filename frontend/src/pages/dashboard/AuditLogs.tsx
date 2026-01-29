import React from "react";
import { dashboardsApi } from "../../services/api";

interface AuditLogEntry {
  _id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  status?: string;
  createdAt?: string;
  actorId?: { email?: string; name?: string } | string;
}

interface AuditLogResponse {
  data: AuditLogEntry[];
  total: number;
}

const PAGE_SIZE = 20;

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'ssl'>('all');
  const [resourceType, setResourceType] = React.useState<string>("");
  const [status, setStatus] = React.useState<"" | "success" | "failure" | "pending">("");
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  const fetchLogs = React.useCallback(
    async (pageIndex: number, currentFilter: 'all' | 'ssl') => {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardsApi.get<AuditLogResponse>(
          "/dashboards/audit/logs",
          {
            params: {
              limit: PAGE_SIZE,
              skip: pageIndex * PAGE_SIZE,
              ...(currentFilter === 'ssl' ? { actionPrefix: 'ssl_' } : {}),
              ...(resourceType ? { resourceType } : {}),
              ...(status ? { status } : {}),
              ...(startDate ? { startDate } : {}),
              ...(endDate ? { endDate } : {}),
            },
          },
        );
        setLogs(res.data || []);
        setTotal(res.total || 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    },
    [resourceType, status, startDate, endDate],
  );

  React.useEffect(() => {
    fetchLogs(page, filter);
  }, [fetchLogs, page, filter]);

  const handleExport = async () => {
    try {
      const res = await dashboardsApi.get<Blob>(
        "/dashboards/audit/logs/export",
        {
          params: {
            ...(filter === 'ssl' ? { actionPrefix: 'ssl_' } : {}),
            ...(resourceType ? { resourceType } : {}),
            ...(status ? { status } : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
          },
          responseType: "blob" as any,
        },
      );

      const blob = new Blob([res as any], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to export audit logs", err);
    }
  };

  const canPrev = page > 0;
  const canNext = (page + 1) * PAGE_SIZE < total;

  return (
    <div className="p-8">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-200 flex items-center gap-2">
              <span>View</span>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value === 'ssl' ? 'ssl' : 'all')
                }
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
              >
                <option value="all">All events</option>
                <option value="ssl">SSL events</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => fetchLogs(page, filter)}
              disabled={loading}
              className="px-3 py-1 rounded bg-slate-700 text-slate-100 text-sm disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1 rounded border border-slate-600 text-slate-100 text-sm hover:bg-slate-800/80"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 text-sm text-slate-200 bg-slate-900/60 border border-slate-800 rounded px-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Resource Type
            </label>
            <input
              type="text"
              value={resourceType}
              onChange={(e) => {
                setPage(0);
                setResourceType(e.target.value);
              }}
              placeholder="e.g. CustomDomain"
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setPage(0);
                const value = e.target.value as "" | "success" | "failure" | "pending";
                setStatus(value);
              }}
              aria-label="Status filter"
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
            >
              <option value="">Any</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPage(0);
                setStartDate(e.target.value);
              }}
              aria-label="Start date filter"
              title="Filter audit logs starting from this date"
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPage(0);
                setEndDate(e.target.value);
              }}
              aria-label="End date filter"
              title="Filter audit logs up to this date"
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setResourceType("");
              setStatus("");
              setStartDate("");
              setEndDate("");
              setPage(0);
            }}
            className="ml-auto px-3 py-1 rounded border border-slate-700 text-xs uppercase tracking-wide text-slate-200 hover:bg-slate-800/80"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && !loading && (
        <p className="text-red-500 mb-3">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border border-slate-700 rounded mb-4">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800 text-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-left">Action</th>
                  <th className="px-3 py-2 text-left">Resource</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {logs.map((log) => {
                  const actor =
                    typeof log.actorId === "string"
                      ? log.actorId
                      : log.actorId?.email || log.actorId?.name || "-";
                  const ts = log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : "-";
                  const resource = log.resourceType
                    ? `${log.resourceType}${log.resourceId ? `#${log.resourceId}` : ""}`
                    : "-";
                  return (
                    <tr key={log._id} className="hover:bg-slate-800/60">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-200">{ts}</td>
                      <td className="px-3 py-2 text-slate-200">{actor}</td>
                      <td className="px-3 py-2 text-slate-200">{log.action}</td>
                      <td className="px-3 py-2 text-slate-200">{resource}</td>
                      <td className="px-3 py-2 text-slate-200">{log.status || "success"}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-slate-400"
                    >
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>
              Showing {logs.length} of {total} events
            </span>
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
                disabled={!canPrev}
                className="px-3 py-1 rounded border border-slate-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => canNext && setPage((p) => p + 1)}
                disabled={!canNext}
                className="px-3 py-1 rounded border border-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
