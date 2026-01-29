import React, { useEffect, useState } from 'react';
import { getMyAffiliate, registerAffiliate, payoutAffiliate, AffiliateProfile, ReferralLedgerEntry } from '../api/affiliate';

const AffiliateDashboard: React.FC = () => {
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAffiliate = async () => {
      try {
        setLoading(true);
        setError(null);
        let profile = await getMyAffiliate();
        if (!profile) {
          profile = await registerAffiliate();
        }
        setAffiliate(profile);
      } catch (err: any) {
        setError(err?.message || 'Failed to load affiliate data');
      } finally {
        setLoading(false);
      }
    };

    loadAffiliate();
  }, []);

  const handleCopyLink = async () => {
    if (!affiliate) return;
    try {
      await navigator.clipboard.writeText(affiliate.referralLink);
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage('Unable to copy');
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const handlePayout = async () => {
    if (!affiliate || affiliate.stats.balance <= 0) return;
    try {
      setPayoutLoading(true);
      const result = await payoutAffiliate(affiliate.id);
      if (result.success) {
        // Refresh affiliate data
        const updated = await getMyAffiliate();
        if (updated) {
          setAffiliate(updated);
        }
      } else if (result.message) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const renderLedgerRow = (entry: ReferralLedgerEntry, index: number) => {
    const date = entry.createdAt ? new Date(entry.createdAt) : null;
    const invoiceNumber = entry.metadata?.invoiceNumber as string | undefined;
    const provider = entry.metadata?.provider as string | undefined;
    
    return (
      <tr key={entry._id || index} className="border-t">
        <td className="px-3 py-2 text-sm font-mono">
          {entry.type}
          {entry.type === 'COMMISSION' && invoiceNumber && (
            <span className="ml-2 text-xs text-gray-500">
              from invoice {invoiceNumber}
            </span>
          )}
        </td>
        <td className="px-3 py-2 text-sm">
          {entry.amount ? `${entry.amount.toFixed(2)} ${entry.currency}` : '-'}
        </td>
        <td className="px-3 py-2 text-xs text-gray-500">
          {date ? date.toLocaleString() : ''}
          {provider && (
            <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
              {provider}
            </span>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return <div className="p-6">Loading affiliate dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!affiliate) {
    return <div className="p-6">No affiliate data available.</div>;
  }

  const { stats } = affiliate;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Referral Rewards</h1>
        <p className="text-gray-600 text-sm">
          Share your referral link to earn rewards when new businesses sign up.
        </p>
      </div>

      <div className="bg-white shadow rounded p-4 space-y-3">
        <h2 className="font-semibold mb-2">Your Referral Link</h2>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
          <input
            readOnly
            value={affiliate.referralLink}
            className="flex-1 border rounded px-3 py-2 text-sm bg-gray-50"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Copy Link
          </button>
          {copyMessage && <span className="text-xs text-gray-500 ml-2">{copyMessage}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white shadow rounded p-4">
          <div className="text-xs text-gray-500 uppercase">Total Clicks</div>
          <div className="text-2xl font-semibold">{stats.totalClicks}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-xs text-gray-500 uppercase">Signups</div>
          <div className="text-2xl font-semibold">{stats.totalSignups}</div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-xs text-gray-500 uppercase">Commission Earned</div>
          <div className="text-2xl font-semibold">
            {stats.totalCommissionEarned.toFixed(2)}
          </div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <div className="text-xs text-gray-500 uppercase">Paid Out</div>
          <div className="text-2xl font-semibold">
            {stats.totalPaidOut.toFixed(2)}
          </div>
        </div>
        <div className="bg-white shadow rounded p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase">Current Balance</div>
            <div className="text-2xl font-semibold">
              {stats.balance.toFixed(2)}
            </div>
          </div>
          <button
            type="button"
            onClick={handlePayout}
            disabled={stats.balance <= 0 || payoutLoading}
            className="mt-3 px-3 py-2 text-sm font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {payoutLoading ? 'Processing...' : 'Request Payout'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-3">Referral Activity</h2>
        {affiliate.ledger && affiliate.ledger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {affiliate.ledger.map((entry, index) => renderLedgerRow(entry, index))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No referral activity recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;
