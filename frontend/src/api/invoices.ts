import api from '../lib/api';
import type { Invoice, PaginatedResponse } from '../types/billing.types';

type BillingRecord = {
  _id: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

function mapBillingToInvoice(b: BillingRecord): Invoice {
  const amountCents = Math.round((typeof b.amount === 'number' ? b.amount : 0) * 100);
  return {
    _id: b._id,
    tenantId: b.tenantId,
    subscriptionId: 'manual',
    planId: 'package',
    invoiceNumber: b._id,
    amount: amountCents,
    currency: b.currency,
    description: 'Manual/offline billing record',
    dueDate: b.createdAt,
    status: (b.status || 'PAID') as any,
    paymentMethod: 'MANUAL',
    lineItems: [],
    refundedAmount: 0,
    createdAt: b.createdAt,
    updatedAt: b.createdAt,
  };
}

export async function getInvoices(
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Invoice>> {
  const rows = (await api.get<BillingRecord[]>('/billings')) || [];
  const sorted = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const start = Math.max(0, (page - 1) * limit);
  const end = start + limit;
  const slice = sorted.slice(start, end);
  const pages = Math.max(1, Math.ceil(sorted.length / limit));

  return {
    data: slice.map(mapBillingToInvoice),
    total: sorted.length,
    page,
    pages,
  };
}

export async function getLatestInvoice(): Promise<Invoice | null> {
  const result = await getInvoices(1, 1);
  if (!result || !Array.isArray(result.data) || result.data.length === 0) {
    return null;
  }
  return result.data[0];
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  const row = await api.get<BillingRecord>(`/billings/${invoiceId}`);
  return mapBillingToInvoice(row);
}

export async function downloadInvoicePdf(invoiceId: string): Promise<void> {
  throw new Error('Invoice PDF download is not available in manual billing mode.');
}
