import api from './client';

export interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalCommissionEarned: number;
  totalPaidOut: number;
  balance: number;
}

export interface ReferralLedgerEntry {
  _id?: string;
  type: 'CLICK' | 'SIGNUP' | 'COMMISSION' | 'PAYOUT';
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface AffiliateProfile {
  id: string;
  code: string;
  referralLink: string;
  stats: AffiliateStats;
  ledger?: ReferralLedgerEntry[];
}

export async function getMyAffiliate(): Promise<AffiliateProfile | null> {
  const data = await api.get<AffiliateProfile | null>('/billing/affiliate/me');
  return data ?? null;
}

export async function registerAffiliate(): Promise<AffiliateProfile> {
  const data = await api.post<AffiliateProfile>('/billing/affiliate/register');
  return data;
}

export async function payoutAffiliate(affiliateId: string): Promise<{ success: boolean; amountPaid?: number; message?: string }> {
  const data = await api.post<{ success: boolean; amountPaid?: number; message?: string }>(
    '/billing/affiliate/payout',
    { affiliateId },
  );
  return data;
}
