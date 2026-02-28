import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../database/schemas/invoice.schema';
import { BillingRevenueAnalyticsResponseDto } from './dto/revenue-analytics.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getRevenueAnalytics(): Promise<BillingRevenueAnalyticsResponseDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeSixtyFiveDaysAgo = new Date(
      now.getTime() - 365 * 24 * 60 * 60 * 1000,
    );

    // Determine the most recent full month for MRR approx
    const mrrMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const mrrMonthStart = new Date(
      mrrMonthDate.getFullYear(),
      mrrMonthDate.getMonth(),
      1,
    );
    const mrrMonthEnd = new Date(
      mrrMonthDate.getFullYear(),
      mrrMonthDate.getMonth() + 1,
      1,
    );

    const [
      last30Agg,
      last365Agg,
      monthlyAgg,
      currencyAgg,
      statusAgg,
      mrrMonthAgg,
    ] = await Promise.all([
      this.invoiceModel
        .aggregate([
          {
            $match: {
              status: 'paid',
              issueDate: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalAmount' },
            },
          },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $match: {
              status: 'paid',
              issueDate: { $gte: threeSixtyFiveDaysAgo },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalAmount' },
            },
          },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $match: {
              status: 'paid',
              issueDate: { $gte: threeSixtyFiveDaysAgo },
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
              currency: { $first: '$currency' },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $group: {
              _id: '$currency',
              totalAmount: { $sum: '$totalAmount' },
              paidInvoices: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'paid'] }, 1, 0],
                },
              },
            },
          },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $match: {
              status: 'paid',
              issueDate: {
                $gte: mrrMonthStart,
                $lt: mrrMonthEnd,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalAmount' },
              currency: { $first: '$currency' },
            },
          },
        ])
        .exec(),
    ]);

    const byCurrency = currencyAgg
      .filter((row) => row._id)
      .map((row) => ({
        currency: row._id as string,
        totalAmount: row.totalAmount || 0,
        paidInvoices: row.paidInvoices || 0,
      }));

    let defaultCurrency: string | null = null;
    if (byCurrency.length > 0) {
      // Prefer the currency with the highest paid volume as default
      const top = [...byCurrency].sort(
        (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0),
      )[0];
      defaultCurrency = top?.currency ?? null;
    }

    const last30Row = last30Agg[0] || {
      totalAmount: 0,
    };
    const last365Row = last365Agg[0] || {
      totalAmount: 0,
    };

    const byMonth = monthlyAgg
      .filter((row) => row._id && row._id.year && row._id.month)
      .map((row) => {
        const year = row._id.year as number;
        const month = row._id.month as number;
        const monthLabel = `${year}-${String(month).padStart(2, '0')}`;

        return {
          month: monthLabel,
          totalAmount: row.totalAmount || 0,
          paidInvoices: row.count || 0,
        };
      })
      .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));

    const statusSummary = {
      paidLast30: 0,
      overdue: 0,
      cancelled: 0,
    };

    for (const row of statusAgg) {
      const status = row._id as string;
      const count = row.count || 0;
      if (status === 'overdue') statusSummary.overdue = count;
      if (status === 'cancelled') statusSummary.cancelled = count;
    }

    // Paid invoices last 30 days requires an explicit filter
    const paidLast30 = await this.invoiceModel
      .countDocuments({ status: 'paid', issueDate: { $gte: thirtyDaysAgo } })
      .exec();
    statusSummary.paidLast30 = paidLast30;

    const mrrRow = mrrMonthAgg[0] || {
      totalAmount: 0,
      currency: defaultCurrency,
    };
    const mrrApprox = mrrRow.totalAmount || 0;
    const arrApprox = mrrApprox * 12;

    return {
      totalRevenueLast30: last30Row.totalAmount || 0,
      totalRevenueLast365: last365Row.totalAmount || 0,
      mrrApprox,
      arrApprox,
      defaultCurrency,
      status: statusSummary,
      byMonth,
      byCurrency,
    };
  }
}
