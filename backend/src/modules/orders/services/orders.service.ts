import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

export type OrderSource = 'pos' | 'domain';

export type ListOrdersParams = {
  tenantId: string;
  source?: OrderSource;
  limit?: number;
  from?: string;
  to?: string;
};

export type OrdersListItem =
  | {
      source: 'pos';
      id: string;
      createdAt?: Date;
      updatedAt?: Date;
      status: string;
      totalAmount: number;
      paymentMethod?: string;
      customerName?: string;
    }
  | {
      source: 'domain';
      id: string;
      createdAt?: Date;
      updatedAt?: Date;
      status: string;
      domain: string;
      provider: string;
      providerOrderId?: string;
    };

@Injectable()
export class OrdersService {
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

  private buildMatch(params: Pick<ListOrdersParams, 'tenantId' | 'from' | 'to'>) {
    const matchBase: Record<string, any> = {
      tenantId: this.toObjectId(params.tenantId, 'tenantId'),
    };

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (params.from) fromDate = this.parseDate(params.from, 'from');
    if (params.to) toDate = this.parseDate(params.to, 'to');

    if (fromDate && toDate && toDate.getTime() < fromDate.getTime()) {
      throw new BadRequestException('Invalid date range');
    }

    if (fromDate || toDate) {
      matchBase.createdAt = {};
      if (fromDate) matchBase.createdAt.$gte = fromDate;
      if (toDate) matchBase.createdAt.$lte = toDate;
    }

    return matchBase;
  }

  private normalizeLimit(limit: unknown) {
    const n = typeof limit === 'number' ? limit : limit === undefined ? 50 : Number(limit);
    if (!Number.isFinite(n)) {
      throw new BadRequestException('Invalid limit');
    }
    return Math.min(Math.max(Math.trunc(n), 1), 200);
  }

  async listOrders(params: ListOrdersParams): Promise<OrdersListItem[]> {
    const normalizedLimit = this.normalizeLimit(params.limit);
    const matchBase = this.buildMatch(params);

    const queryPos = async () => {
      const rows = await this.posOrderModel
        .find(matchBase)
        .sort({ createdAt: -1 })
        .limit(normalizedLimit)
        .lean()
        .exec();

      return rows.map(
        (o: any): OrdersListItem => ({
          source: 'pos',
          id: String(o._id),
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          status: String(o.status || 'completed'),
          totalAmount: Number(o.totalAmount || 0),
          paymentMethod: o.paymentMethod,
          customerName: o.customerName,
        }),
      );
    };

    const queryDomain = async () => {
      const rows = await this.domainResellerOrderModel
        .find(matchBase)
        .sort({ createdAt: -1 })
        .limit(normalizedLimit)
        .lean()
        .exec();

      return rows.map(
        (o: any): OrdersListItem => ({
          source: 'domain',
          id: String(o._id),
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
          status: String(o.status || 'pending'),
          domain: String(o.domain || ''),
          provider: String(o.provider || 'unknown'),
          providerOrderId: o.providerOrderId,
        }),
      );
    };

    if (params.source === 'pos') return queryPos();
    if (params.source === 'domain') return queryDomain();

    const [pos, domain] = await Promise.all([queryPos(), queryDomain()]);

    return [...pos, ...domain]
      .sort((a, b) => {
        const at = a.createdAt ? a.createdAt.getTime() : 0;
        const bt = b.createdAt ? b.createdAt.getTime() : 0;
        return bt - at;
      })
      .slice(0, normalizedLimit);
  }

  async getPosOrderById(tenantId: string, id: string) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const orderId = this.toObjectId(id, 'orderId');

    const order = await this.posOrderModel
      .findOne({ _id: orderId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getDomainOrderById(tenantId: string, id: string) {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const orderId = this.toObjectId(id, 'orderId');

    const order = await this.domainResellerOrderModel
      .findOne({ _id: orderId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
