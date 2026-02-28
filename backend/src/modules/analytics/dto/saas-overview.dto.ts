import type { PlanKey } from '../../../database/schemas/tenant.schema';

export interface SaasOverviewResponse {
  tenants: {
    total: number;
    active: number;
    trialing: number;
    paying: number;
  };
  users: {
    total: number;
    verified: number;
  };
  billing: {
    totalRevenue: number;
    totalInvoices: number;
    paidInvoices: number;
    currency: string | null;
  };
  domains: {
    internal: {
      total: number;
      path: number;
      subdomain: number;
      byStatus: {
        pending: number;
        active: number;
        suspended: number;
        blocked: number;
      };
    };
    custom: {
      total: number;
      byStatus: {
        pending_verification: number;
        verified: number;
        ssl_pending: number;
        ssl_issued: number;
        active: number;
        suspended: number;
      };
    };
  };
  orders: {
    totalOrders: number;
    totalSales: number;
    last30Days: {
      orders: number;
      totalSales: number;
    };
    byStatus: {
      completed: number;
      cancelled: number;
    };
    dailySeries: {
      date: string;
      totalOrders: number;
      totalSales: number;
    }[];
  };
  plans: {
    byPlanKey: Record<PlanKey, number>;
  };
  visitors: {
    totalViewsLast30Days: number;
    totalUniqueVisitorsLast30Days: number;
    dailySeries: {
      date: string;
      views: number;
      uniqueVisitors: number;
    }[];
    topTenants: {
      tenantId: string;
      tenantName: string;
      views: number;
      uniqueVisitors: number;
    }[];
  };
  monthlyRevenue: {
    month: string;
    totalAmount: number;
    paidInvoices: number;
  }[];
  sslAutomation: {
    acme: {
      total: number;
      pending: number;
      issued: number;
      failed: number;
    };
  };
  paymentsHealth: {
    totalFailedLast30Days: number;
    recentFailures: {
      transactionId: string;
      gatewayName: string;
      error: string;
      createdAt: string;
    }[];
  };
}
