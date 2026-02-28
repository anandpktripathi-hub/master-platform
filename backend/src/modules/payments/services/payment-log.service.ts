import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaymentLog,
  PaymentLogDocument,
} from '../../../database/schemas/payment-log.schema';

export type PaymentLogRecordInput = {
  transactionId: string;
  tenantId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  gatewayName?: string;
  error?: string;
  createdAt?: Date;
};

export type PaymentLogListFilter = {
  tenantId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
};

@Injectable()
export class PaymentLogService {
  private readonly logger = new Logger(PaymentLogService.name);

  constructor(
    @InjectModel(PaymentLog.name)
    private readonly paymentLogModel: Model<PaymentLogDocument>,
  ) {}

  async record(input: PaymentLogRecordInput): Promise<void> {
    try {
      if (!input?.transactionId || !input?.tenantId || !input?.packageId) {
        return;
      }
      if (!Types.ObjectId.isValid(input.tenantId)) {
        return;
      }

      await this.paymentLogModel
        .create({
          transactionId: input.transactionId,
          tenantId: new Types.ObjectId(input.tenantId),
          packageId: input.packageId,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
          gatewayName: input.gatewayName,
          error: input.error,
          createdAt: input.createdAt,
        })
        .catch(() => undefined);
    } catch (err) {
      this.logger.warn('Failed to record payment log', err as any);
    }
  }

  async list(filter?: PaymentLogListFilter): Promise<PaymentLog[]> {
    const query: Record<string, any> = {};

    if (filter?.tenantId) {
      if (Types.ObjectId.isValid(filter.tenantId)) {
        query.tenantId = new Types.ObjectId(filter.tenantId);
      } else {
        // If tenantId is invalid, return empty result (do not throw)
        return [];
      }
    }

    if (filter?.from || filter?.to) {
      query.createdAt = {};
      if (filter.from) query.createdAt.$gte = filter.from;
      if (filter.to) query.createdAt.$lte = filter.to;
    }

    const limit =
      typeof filter?.limit === 'number' && filter.limit > 0
        ? Math.min(filter.limit, 500)
        : 200;

    return this.paymentLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<PaymentLogDocument[]>()
      .exec() as unknown as PaymentLog[];
  }

  async listFailures(limit = 5): Promise<PaymentLog[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    return this.paymentLogModel
      .find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean<PaymentLogDocument[]>()
      .exec() as unknown as PaymentLog[];
  }
}
