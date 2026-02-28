import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PosOrder,
  PosOrderDocument,
} from '../../../database/schemas/pos-order.schema';
import {
  DomainResellerOrder,
  DomainResellerOrderDocument,
} from '../../../database/schemas/domain-reseller-order.schema';

export type OrdersDashboardStatsParams = {
  tenantId?: string;
  from?: string;
  to?: string;
};

export type OrdersDashboardStatsResult = {
  range: { from?: string; to?: string };
  pos: {
    totalOrders: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  domainReseller: {
    totalOrders: number;
    pending: number;
    purchased: number;
    failed: number;
    cancelled: number;
  };
};

@Injectable()
export class OrdersStatsService {
  constructor(
    @InjectModel(PosOrder.name)
    private readonly posOrderModel: Model<PosOrderDocument>,
    @InjectModel(DomainResellerOrder.name)
    private readonly domainResellerOrderModel: Model<DomainResellerOrderDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private parseDate(value: string, fieldName: string): Date {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return d;
  }

  async getDashboardStats(
    params: OrdersDashboardStatsParams,
  ): Promise<OrdersDashboardStatsResult> {
    const matchBase: Record<string, any> = {};

    if (params.tenantId) {
      matchBase.tenantId = this.toObjectId(params.tenantId, 'tenantId');
    }

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (params.from) {
      fromDate = this.parseDate(params.from, 'from');
    }
    if (params.to) {
      toDate = this.parseDate(params.to, 'to');
    }

    if (fromDate && toDate && toDate.getTime() < fromDate.getTime()) {
      throw new BadRequestException('Invalid date range');
    }

    if (fromDate || toDate) {
      matchBase.createdAt = {};
      if (fromDate) matchBase.createdAt.$gte = fromDate;
      if (toDate) matchBase.createdAt.$lte = toDate;
    }

    const [posAgg, domainAgg] = await Promise.all([
      this.posOrderModel
        .aggregate([
          { $match: matchBase },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },
              cancelled: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
                },
              },
              revenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', 'completed'] },
                    '$totalAmount',
                    0,
                  ],
                },
              },
            },
          },
        ])
        .exec(),
      this.domainResellerOrderModel
        .aggregate([
          { $match: matchBase },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              pending: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
              },
              purchased: {
                $sum: { $cond: [{ $eq: ['$status', 'purchased'] }, 1, 0] },
              },
              failed: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
              cancelled: {
                $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
              },
            },
          },
        ])
        .exec(),
    ]);

    const posRow = (Array.isArray(posAgg) ? posAgg[0] : undefined) || {};
    const domainRow = (Array.isArray(domainAgg) ? domainAgg[0] : undefined) || {};

    return {
      range: {
        from: params.from,
        to: params.to,
      },
      pos: {
        totalOrders: Number(posRow.totalOrders || 0),
        completed: Number(posRow.completed || 0),
        cancelled: Number(posRow.cancelled || 0),
        revenue: Number(posRow.revenue || 0),
      },
      domainReseller: {
        totalOrders: Number(domainRow.totalOrders || 0),
        pending: Number(domainRow.pending || 0),
        purchased: Number(domainRow.purchased || 0),
        failed: Number(domainRow.failed || 0),
        cancelled: Number(domainRow.cancelled || 0),
      },
    };
  }
}
