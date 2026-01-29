import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Tenant,
  TenantDocument,
} from '../../database/schemas/tenant.schema';
import {
  User,
  UserDocument,
} from '../../database/schemas/user.schema';
import {
  TenantPackage,
  TenantPackageDocument,
} from '../../database/schemas/tenant-package.schema';
import {
  Billing,
  BillingDocument,
} from '../../database/schemas/billing.schema';
import {
  Invoice,
  InvoiceDocument,
} from '../../database/schemas/invoice.schema';
import {
  Domain,
  DomainDocument,
} from '../../database/schemas/domain.schema';
import {
  CustomDomain,
  CustomDomainDocument,
} from '../../database/schemas/custom-domain.schema';
import {
  PosOrder,
  PosOrderDocument,
} from '../../database/schemas/pos-order.schema';

import { PlanKey } from '../../database/schemas/tenant.schema';
import {
  CmsPageAnalyticsEntity,
} from '../../cms/entities/cms.entities';
import { PaymentLogService } from '../payments/services/payment-log.service';

interface SaasOverviewResponse {
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
      date: string; // YYYY-MM-DD
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
      date: string; // YYYY-MM-DD
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
    month: string; // YYYY-MM
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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(TenantPackage.name)
    private readonly tenantPackageModel: Model<TenantPackageDocument>,
    @InjectModel(Billing.name)
    private readonly billingModel: Model<BillingDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Domain.name)
    private readonly domainModel: Model<DomainDocument>,
    @InjectModel(CustomDomain.name)
    private readonly customDomainModel: Model<CustomDomainDocument>,
    @InjectModel(PosOrder.name)
    private readonly posOrderModel: Model<PosOrderDocument>,
    @InjectModel(CmsPageAnalyticsEntity.name)
    private readonly cmsAnalyticsModel: Model<any>,
    private readonly paymentLogService: PaymentLogService,
  ) {}

  async getSaasOverview(): Promise<SaasOverviewResponse> {
    const [
      totalTenants,
      activeTenants,
      totalUsers,
      verifiedUsers,
      trialPackages,
      activePackages,
      invoiceStatusAgg,
      monthlyRevenueAgg,
      totalInternalDomains,
      pathDomains,
      subdomainDomains,
      pendingInternalDomains,
      activeInternalDomains,
      suspendedInternalDomains,
      blockedInternalDomains,
      totalCustomDomains,
      pendingVerificationCustom,
      verifiedCustom,
      sslPendingCustom,
      sslIssuedCustom,
      activeCustom,
      suspendedCustom,
      posOrdersAgg,
      posOrdersLast30Series,
      completedPosOrders,
      cancelledPosOrders,
      freePlanTenants,
      proPlanTenants,
      enterprisePlanTenants,
      visitorsLast30Agg,
      visitorsLast30DailyAgg,
      visitorsTopTenantsAgg,
    ] = await Promise.all([
      this.tenantModel.countDocuments({}).exec(),
      this.tenantModel.countDocuments({ isActive: true }).exec(),
      this.userModel.countDocuments({}).exec(),
      this.userModel.countDocuments({ emailVerified: true }).exec(),
      this.tenantPackageModel.countDocuments({ status: 'trial' }).exec(),
      this.tenantPackageModel.countDocuments({ status: 'active' }).exec(),
      this.invoiceModel
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$totalAmount' },
              currency: { $first: '$currency' },
            },
          },
        ])
        .exec(),
      this.buildMonthlyRevenueAgg(),
      this.domainModel.countDocuments({}).exec(),
      this.domainModel.countDocuments({ type: 'path' }).exec(),
      this.domainModel.countDocuments({ type: 'subdomain' }).exec(),
      this.domainModel.countDocuments({ status: 'pending' }).exec(),
      this.domainModel.countDocuments({ status: 'active' }).exec(),
      this.domainModel.countDocuments({ status: 'suspended' }).exec(),
      this.domainModel.countDocuments({ status: 'blocked' }).exec(),
      this.customDomainModel.countDocuments({}).exec(),
      this.customDomainModel
        .countDocuments({ status: 'pending_verification' })
        .exec(),
      this.customDomainModel.countDocuments({ status: 'verified' }).exec(),
      this.customDomainModel.countDocuments({ status: 'ssl_pending' }).exec(),
      this.customDomainModel.countDocuments({ status: 'ssl_issued' }).exec(),
      this.customDomainModel.countDocuments({ status: 'active' }).exec(),
      this.customDomainModel.countDocuments({ status: 'suspended' }).exec(),
      this.buildGlobalPosOrdersAgg(),
      this.buildGlobalPosOrdersLast30DaysSeries(),
      this.posOrderModel.countDocuments({ status: 'completed' }).exec(),
      this.posOrderModel.countDocuments({ status: 'cancelled' }).exec(),
      this.tenantModel.countDocuments({ planKey: 'FREE' }).exec(),
      this.tenantModel.countDocuments({ planKey: 'PRO' }).exec(),
      this.tenantModel.countDocuments({ planKey: 'ENTERPRISE' }).exec(),
      this.buildGlobalVisitorsLast30DaysAgg(),
      this.buildGlobalVisitorsLast30DaysDailySeries(),
      this.buildGlobalVisitorsTopTenantsLast30Days(),
    ]);

    let totalInvoices = 0;
    let paidInvoices = 0;
    let totalRevenue = 0;
    let currency: string | null = null;

    for (const row of invoiceStatusAgg as any[]) {
      totalInvoices += row.count || 0;
      if (!currency && row.currency) {
        currency = row.currency;
      }
      if (row._id === 'paid') {
        paidInvoices = row.count || 0;
        totalRevenue = row.totalAmount || 0;
      }
    }

    const monthlyRevenue = (monthlyRevenueAgg as any[]).map((row) => {
      const year = row._id.year as number;
      const month = row._id.month as number;
      return {
        month: `${year}-${String(month).padStart(2, '0')}`,
        totalAmount: row.totalAmount || 0,
        paidInvoices: row.count || 0,
      };
    });

    const ordersAggRow = (posOrdersAgg as any[])[0] || {
      totalOrders: 0,
      totalSales: 0,
    };
    const ordersLast30Series = (posOrdersLast30Series as any[]) || [];

    const last30Totals = ordersLast30Series.reduce(
      (acc, row) => {
        acc.orders += row.totalOrders || 0;
        acc.totalSales += row.totalSales || 0;
        return acc;
      },
      { orders: 0, totalSales: 0 },
    );

    const visitorsLast30Row = (visitorsLast30Agg as any[])[0] || {
      totalViews: 0,
      totalUniqueVisitors: 0,
    };
    const visitorsDailySeries = (visitorsLast30DailyAgg as any[]) || [];
    const visitorsTopTenants = (visitorsTopTenantsAgg as any[]) || [];

    // SSL automation (ACME) status
    const [
      totalAcmeDomains,
      pendingAcmeDomains,
      issuedAcmeDomains,
      failedAcmeDomains,
    ] = await Promise.all([
      this.customDomainModel.countDocuments({ sslProvider: 'acme' }).exec(),
      this.customDomainModel
        .countDocuments({ sslProvider: 'acme', sslStatus: 'pending' })
        .exec(),
      this.customDomainModel
        .countDocuments({ sslProvider: 'acme', sslStatus: 'issued' })
        .exec(),
      this.customDomainModel
        .countDocuments({ sslProvider: 'acme', sslStatus: 'failed' })
        .exec(),
    ]);

    // Payments health (recent failures)
    const nowTs = Date.now();
    const thirtyDaysAgoTs = nowTs - 30 * 24 * 60 * 60 * 1000;
    const allLogs = this.paymentLogService.list();
    const failedLast30 = allLogs.filter(
      (l) =>
        l.status === 'failed' &&
        l.createdAt &&
        l.createdAt.getTime() >= thirtyDaysAgoTs,
    );
    const totalFailedLast30Days = failedLast30.length;
    const recentFailures = this.paymentLogService.listFailures(5).map((l) => ({
      transactionId: l.transactionId,
      gatewayName: l.gatewayName || 'unknown',
      error: l.error || 'Unknown error',
      createdAt: l.createdAt.toISOString(),
    }));

    // Resolve tenant names for top tenants by traffic
    const tenantIdSet = new Set<string>();
    for (const row of visitorsTopTenants as any[]) {
      if (row?._id) {
        tenantIdSet.add(String(row._id));
      }
    }

    const tenantIdList = Array.from(tenantIdSet);
    const tenantDocs = tenantIdList.length
      ? await this.tenantModel
          .find({ _id: { $in: tenantIdList } })
          .select('_id name')
          .lean()
          .exec()
      : [];

    const tenantNameMap = new Map<string, string>();
    for (const t of tenantDocs as any[]) {
      tenantNameMap.set(String(t._id), t.name || '');
    }

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        trialing: trialPackages,
        paying: activePackages,
      },
      users: {
        total: totalUsers,
        verified: verifiedUsers,
      },
      billing: {
        totalRevenue,
        totalInvoices,
        paidInvoices,
        currency,
      },
      domains: {
        internal: {
          total: totalInternalDomains,
          path: pathDomains,
          subdomain: subdomainDomains,
          byStatus: {
            pending: pendingInternalDomains,
            active: activeInternalDomains,
            suspended: suspendedInternalDomains,
            blocked: blockedInternalDomains,
          },
        },
        custom: {
          total: totalCustomDomains,
          byStatus: {
            pending_verification: pendingVerificationCustom,
            verified: verifiedCustom,
            ssl_pending: sslPendingCustom,
            ssl_issued: sslIssuedCustom,
            active: activeCustom,
            suspended: suspendedCustom,
          },
        },
      },
      orders: {
        totalOrders: ordersAggRow.totalOrders || 0,
        totalSales: ordersAggRow.totalSales || 0,
        last30Days: {
          orders: last30Totals.orders,
          totalSales: last30Totals.totalSales,
        },
        byStatus: {
          completed: completedPosOrders,
          cancelled: cancelledPosOrders,
        },
        dailySeries: ordersLast30Series.map((row) => {
          const year = row._id.year as number;
          const month = row._id.month as number;
          const day = row._id.day as number;
          return {
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            totalOrders: row.totalOrders || 0,
            totalSales: row.totalSales || 0,
          };
        }),
      },
      plans: {
        byPlanKey: {
          FREE: freePlanTenants,
          PRO: proPlanTenants,
          ENTERPRISE: enterprisePlanTenants,
        },
      },
      visitors: {
        totalViewsLast30Days: visitorsLast30Row.totalViews || 0,
        totalUniqueVisitorsLast30Days:
          visitorsLast30Row.totalUniqueVisitors || 0,
        dailySeries: visitorsDailySeries.map((row) => {
          const year = row._id.year as number;
          const month = row._id.month as number;
          const day = row._id.day as number;
          return {
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            views: row.views || 0,
            uniqueVisitors: row.uniqueVisitors || 0,
          };
        }),
        topTenants: visitorsTopTenants.map((row) => {
          const id = String(row._id);
          return {
            tenantId: id,
            tenantName: tenantNameMap.get(id) || 'Unknown tenant',
            views: row.views || 0,
            uniqueVisitors: row.uniqueVisitors || 0,
          };
        }),
      },
      monthlyRevenue,
      sslAutomation: {
        acme: {
          total: totalAcmeDomains,
          pending: pendingAcmeDomains,
          issued: issuedAcmeDomains,
          failed: failedAcmeDomains,
        },
      },
      paymentsHealth: {
        totalFailedLast30Days,
        recentFailures,
      },
    };
  }

  private async buildMonthlyRevenueAgg() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    return this.invoiceModel
      .aggregate([
        {
          $match: {
            status: 'paid',
            issueDate: { $gte: start },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$issueDate' },
              month: { $month: '$issueDate' },
            },
            totalAmount: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
          },
        },
      ])
      .exec();
  }

  private async buildGlobalPosOrdersAgg() {
    return this.posOrderModel
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSales: { $sum: '$totalAmount' },
          },
        },
      ])
      .exec();
  }

  private async buildGlobalPosOrdersLast30DaysSeries() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.posOrderModel
      .aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            totalOrders: { $sum: 1 },
            totalSales: { $sum: '$totalAmount' },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
            '_id.day': 1,
          },
        },
      ])
      .exec();
  }

  private async buildGlobalVisitorsLast30DaysAgg() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.cmsAnalyticsModel
      .aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
            totalUniqueVisitors: { $sum: '$uniqueVisitors' },
          },
        },
      ])
      .exec();
  }

  private async buildGlobalVisitorsLast30DaysDailySeries() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.cmsAnalyticsModel
      .aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' },
            },
            views: { $sum: '$views' },
            uniqueVisitors: { $sum: '$uniqueVisitors' },
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
            '_id.day': 1,
          },
        },
      ])
      .exec();
  }

  private async buildGlobalVisitorsTopTenantsLast30Days() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.cmsAnalyticsModel
      .aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: '$tenantId',
            views: { $sum: '$views' },
            uniqueVisitors: { $sum: '$uniqueVisitors' },
          },
        },
        {
          $sort: {
            views: -1,
          },
        },
        {
          $limit: 10,
        },
      ])
      .exec();
  }
}
