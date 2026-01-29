import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
} from '../../database/schemas/invoice.schema';
import {
  PosOrder,
  PosOrderDocument,
} from '../../database/schemas/pos-order.schema';
import { CmsAnalyticsService } from '../../cms/services/cms-analytics.service';

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

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(PosOrder.name)
    private readonly posOrderModel: Model<PosOrderDocument>,
    private readonly cmsAnalytics: CmsAnalyticsService,
  ) {}

  async getTenantFinancialReport(
    tenantId: string,
  ): Promise<TenantFinancialReport> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const agg = await this.invoiceModel
      .aggregate([
        { $match: { tenantId: tenantObjectId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            currency: { $first: '$currency' },
          },
        },
      ])
      .exec();

    let currency: string | null = null;
    let totalInvoices = 0;
    let totalAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    const byStatus: TenantFinancialReport['byStatus'] = {};

    for (const row of agg as Array<{
      _id: string;
      count: number;
      totalAmount: number;
      currency?: string;
    }>) {
      const status = row._id || 'unknown';
      const count = row.count || 0;
      const amount = row.totalAmount || 0;
      if (!currency && row.currency) {
        currency = row.currency;
      }
      totalInvoices += count;
      totalAmount += amount;
      if (status === 'paid') {
        paidAmount += amount;
      }
      if (status === 'overdue') {
        overdueAmount += amount;
      }
      byStatus[status] = {
        count,
        totalAmount: amount,
      };
    }

    return {
      currency,
      totals: {
        totalInvoices,
        totalAmount,
        paidAmount,
        overdueAmount,
      },
      byStatus,
    };
  }

  async getTenantCommerceReport(
    tenantId: string,
  ): Promise<TenantCommerceReport> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const [totals, byStatusAgg] = await Promise.all([
      this.posOrderModel
        .aggregate([
          { $match: { tenantId: tenantObjectId } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSales: { $sum: '$totalAmount' },
            },
          },
        ])
        .exec(),
      this.posOrderModel
        .aggregate([
          { $match: { tenantId: tenantObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
    ]);

    const baseRow = (totals[0] as {
      totalOrders?: number;
      totalSales?: number;
    }) || {
      totalOrders: 0,
      totalSales: 0,
    };

    const summaryRow: { totalOrders: number; totalSales: number } = {
      totalOrders: baseRow.totalOrders ?? 0,
      totalSales: baseRow.totalSales ?? 0,
    };
    const byStatus: Record<string, number> = {};
    for (const row of byStatusAgg as Array<{ _id: string; count: number }>) {
      const status = row._id || 'unknown';
      byStatus[status] = row.count || 0;
    }

    return {
      totalOrders: summaryRow.totalOrders || 0,
      totalSales: summaryRow.totalSales || 0,
      byStatus,
    };
  }

  async getTenantTrafficReport(tenantId: string) {
    // Delegate to existing CMS analytics service for rich visitor/device stats.
    // Frontend can use this payload to render GA-style charts.
    return this.cmsAnalytics.getTenantAnalytics(tenantId, 30);
  }
}
