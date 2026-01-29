import React, { useEffect, useState } from "react";
import {
  TenantCustomDomainDto,
  TenantDomainHealthSummaryDto,
  tenantDomainsApi,
} from "../../lib/api";
import { useApiErrorToast } from "../../providers/QueryProvider";

export default function TenantDomainHealthPage() {
  const [summary, setSummary] = useState<TenantDomainHealthSummaryDto | null>(null);
  const [domains, setDomains] = useState<TenantCustomDomainDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyDomain, setBusyDomain] = useState<string | null>(null);
  const { showErrorToast, showSuccessToast } = useApiErrorToast();

  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([
        tenantDomainsApi.getHealthSummary(),
        tenantDomainsApi.listForTenant(),
      ]);
      setSummary(s);
      setDomains(d);
    } catch (err: any) {
      setError(err?.message || "Failed to load domain health");
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setBusyDomain(domainId);
    try {
      await tenantDomainsApi.verifyDns(domainId);
      await loadAll();
      showSuccessToast("Domain verification requested. Re-check after DNS propagation.");
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setBusyDomain(null);
    }
  };

  const handleIssueSsl = async (domainId: string) => {
    if (!window.confirm("Request/issue SSL certificate for this domain?")) return;
    setBusyDomain(domainId);
    try {
      await tenantDomainsApi.issueSsl(domainId);
      await loadAll();
      showSuccessToast("SSL issuance initiated for this domain.");
    } catch (err: any) {
      showErrorToast(err);
    } finally {
      setBusyDomain(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Domain & SSL Health</h1>
          <p className="text-sm text-slate-400">
            Monitor your custom domains, DNS verification status, and SSL certificate expiry for this workspace.
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

      {loading && <div className="text-slate-400 text-sm">Loading domain health…</div>}
      {!loading && error && <div className="text-sm text-red-400">{error}</div>}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
            <div className="text-xs text-slate-400 mb-1">Total domains</div>
            <div className="text-2xl font-semibold text-slate-100">{summary.total}</div>
            {summary.primary && (
              <div className="mt-2 text-[11px] text-slate-400">Primary: {summary.primary}</div>
            )}
          </div>
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/40">
            <div className="text-xs text-slate-400 mb-1">SSL status</div>
            <div className="text-sm text-slate-300 space-y-1">
              <div>Issued: {summary.ssl.issued}</div>
              <div>Pending: {summary.ssl.pending}</div>
              <div>Expired: {summary.ssl.expired}</div>
              <div>Expiring soon: {summary.ssl.expiringSoon}</div>
            </div>
          </div>
          <div className="border border-slate-800 rounded-lg p-4 bg-slate-900/40 col-span-1 md:col-span-2">
            <div className="text-xs text-slate-400 mb-1">Expiring certificates (next 14 days)</div>
            {summary.ssl.expiringList.length === 0 && (
              <div className="text-sm text-slate-500">No certificates are close to expiry.</div>
            )}
            {summary.ssl.expiringList.length > 0 && (
              <ul className="text-xs text-slate-200 space-y-1">
                {summary.ssl.expiringList.map((item) => (
                  <li key={item.domain}>
                    <span className="font-semibold">{item.domain}</span> ·
                    <span className="ml-1">expires {new Date(item.expiresAt).toLocaleDateString()} </span>
                    <span className="ml-1 text-amber-300">({item.daysRemaining} days)</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300">Per-domain status</div>
          {domains.length > 0 && (
            <div className="text-[11px] text-slate-400">{domains.length} domains</div>
          )}
        </div>
        {domains.length === 0 && !loading && (
          <div className="px-4 py-4 text-sm text-slate-500">
            No custom domains have been configured for this workspace yet.
          </div>
        )}
        {domains.length > 0 && (
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Domain</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">SSL</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Expires</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Primary</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {domains.map((d) => {
                const id = (d as any).id || d._id || d.domain;
                const status = d.status || "unknown";
                const sslStatus = d.sslStatus || "none";
                let sslBadgeClass = "bg-slate-900 text-slate-300 border-slate-700";
                if (sslStatus === "issued") sslBadgeClass = "bg-emerald-900/60 text-emerald-300 border-emerald-600/60";
                if (sslStatus === "pending") sslBadgeClass = "bg-amber-900/70 text-amber-300 border-amber-700/70";
                if (sslStatus === "expired") sslBadgeClass = "bg-red-900/70 text-red-300 border-red-700/70";
                return (
                  <tr key={id}>
                    <td className="px-3 py-2 text-slate-100 text-sm">{d.domain}</td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">{status}</td>
                    <td className="px-3 py-2 text-[11px]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border ${sslBadgeClass}`}>
                        {sslStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-400">
                      {d.sslExpiresAt ? new Date(d.sslExpiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-400">
                      {d.isPrimary ? "Yes" : "No"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300 space-x-2">
                      <button
                        type="button"
                        disabled={busyDomain === String(d._id)}
                        onClick={() => void handleVerify(String(d._id))}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
                      >
                        Verify DNS
                      </button>
                      <button
                        type="button"
                        disabled={busyDomain === String(d._id)}
                        onClick={() => void handleIssueSsl(String(d._id))}
                        className="px-2 py-1 rounded bg-teal-700 hover:bg-teal-600 disabled:opacity-60"
                      >
                        Issue SSL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
