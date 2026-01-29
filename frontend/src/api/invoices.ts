import api from '../lib/api';
import type { Invoice, PaginatedResponse } from '../types/billing.types';

export async function getInvoices(
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Invoice>> {
  return api.get<PaginatedResponse<Invoice>>(`/invoices?page=${page}&limit=${limit}`);
}

export async function getLatestInvoice(): Promise<Invoice | null> {
  const result = await getInvoices(1, 1);
  if (!result || !Array.isArray(result.data) || result.data.length === 0) {
    return null;
  }
  return result.data[0];
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice> {
  return api.get<Invoice>(`/invoices/${invoiceId}`);
}

export async function downloadInvoicePdf(invoiceId: string): Promise<void> {
  const blob = await api.get<Blob>(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob' as any,
  });

  const url = URL.createObjectURL(blob as any);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
