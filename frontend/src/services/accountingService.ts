import api from "../lib/api";

export interface AccountPayload {
  name: string;
  code: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  description?: string;
}

export interface TransactionPayload {
  accountId: string;
  amount: number;
  type: 'debit' | 'credit';
  date?: string;
  description?: string;
}

export interface InvoicePayload {
  number: string;
  customerName: string;
  currency: string;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
}

const accountingService = {
  async getSummary() {
    return api.get("/accounting/summary") as Promise<{
      income: number;
      expense: number;
      outstandingInvoices: number;
      last30Days: { income: number; expense: number; net: number };
      last6Months: { month: string; income: number; expense: number; net: number }[];
    }>;
  },

  async getAccounts() {
    return api.get("/accounting/accounts");
  },

  async createAccount(payload: AccountPayload) {
    return api.post("/accounting/accounts", payload);
  },

  async updateAccount(id: string, payload: Partial<AccountPayload>) {
    return api.put("/accounting/accounts/" + id, payload);
  },

  async deleteAccount(id: string) {
    return api.delete("/accounting/accounts/" + id);
  },

  async getTransactions(accountId?: string) {
    const params = accountId ? { accountId } : undefined;
    return api.get("/accounting/transactions", { params });
  },

  async recordTransaction(payload: TransactionPayload) {
    return api.post("/accounting/transactions", payload);
  },

  async getInvoices() {
    return api.get("/accounting/invoices");
  },

  async createInvoice(payload: InvoicePayload) {
    return api.post("/accounting/invoices", payload);
  },

  async updateInvoice(id: string, payload: Partial<InvoicePayload>) {
    return api.put("/accounting/invoices/" + id, payload);
  },

  async deleteInvoice(id: string) {
    return api.delete("/accounting/invoices/" + id);
  },

  async getProfitAndLoss(from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return api.get("/accounting/reports/profit-and-loss", { params: Object.keys(params).length ? params : undefined }) as Promise<{
      period: { from: string; to: string };
      totals: { income: number; expense: number; net: number };
      byMonth: { month: string; income: number; expense: number; net: number }[];
    }>;
  },

  async getBalanceSheet(asOf?: string) {
    const params: Record<string, string> = {};
    if (asOf) params.asOf = asOf;
    return api.get("/accounting/reports/balance-sheet", { params: Object.keys(params).length ? params : undefined }) as Promise<{
      asOf: string;
      byType: { type: string; balance: number }[];
      totals: { assets: number; liabilities: number; equity: number };
    }>;
  },

  async exportProfitAndLossCsv(from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await api.get("/accounting/reports/profit-and-loss/export", {
      params: Object.keys(params).length ? params : undefined,
      responseType: "blob",
    });
    return response.data as Blob;
  },

  async exportBalanceSheetCsv(asOf?: string) {
    const params: Record<string, string> = {};
    if (asOf) params.asOf = asOf;
    const response = await api.get("/accounting/reports/balance-sheet/export", {
      params: Object.keys(params).length ? params : undefined,
      responseType: "blob",
    });
    return response.data as Blob;
  },
};

export default accountingService;
