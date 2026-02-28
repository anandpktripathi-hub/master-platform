export interface TenantFinancialReport {
  currency: string | null;
  totals: {
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
  };
  byStatus: Record<
    string,
    {
      count: number;
      totalAmount: number;
    }
  >;
}

export interface TenantCommerceReport {
  totalOrders: number;
  totalSales: number;
  byStatus: Record<string, number>;
}
