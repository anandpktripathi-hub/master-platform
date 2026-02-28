import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Account,
  AccountDocument,
} from '../../database/schemas/account.schema';
import {
  Transaction,
  TransactionDocument,
} from '../../database/schemas/transaction.schema';

@Injectable()
export class WalletService {
  private static readonly WALLET_ACCOUNT_CODE = 'WALLET';

  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  private asObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  private async getOrCreateWalletAccount(
    tenantObjectId: Types.ObjectId,
  ): Promise<AccountDocument> {
    const code = WalletService.WALLET_ACCOUNT_CODE;

    const existing = await this.accountModel
      .findOne({ tenantId: tenantObjectId, code })
      .exec();
    if (existing) return existing;

    try {
      const created = new this.accountModel({
        tenantId: tenantObjectId,
        name: 'Wallet',
        code,
        type: 'asset',
        description: 'Tenant wallet credits',
      });
      return await created.save();
    } catch {
      // In case of a race with unique index, retry read.
      const retry = await this.accountModel
        .findOne({ tenantId: tenantObjectId, code })
        .exec();
      if (retry) return retry;
      throw new BadRequestException('Unable to initialize wallet account');
    }
  }

  async getBalance(tenantId: string) {
    const tenantObjectId = this.asObjectId(tenantId, 'tenantId');
    const walletAccount = await this.getOrCreateWalletAccount(tenantObjectId);

    const [agg] = await this.transactionModel
      .aggregate([
        {
          $match: {
            tenantId: tenantObjectId,
            accountId: walletAccount._id,
          },
        },
        {
          $group: {
            _id: null,
            credits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0],
              },
            },
            debits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0],
              },
            },
          },
        },
      ])
      .exec();

    const credits = typeof agg?.credits === 'number' ? agg.credits : 0;
    const debits = typeof agg?.debits === 'number' ? agg.debits : 0;
    const balance = credits - debits;

    return {
      tenantId,
      accountId: String(walletAccount._id),
      balance,
      credits,
      debits,
    };
  }

  async addCredits(tenantId: string, amount: number, description?: string) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive number');
    }

    const tenantObjectId = this.asObjectId(tenantId, 'tenantId');
    const walletAccount = await this.getOrCreateWalletAccount(tenantObjectId);

    const tx = new this.transactionModel({
      tenantId: tenantObjectId,
      accountId: walletAccount._id,
      amount,
      type: 'credit',
      date: new Date(),
      description: description?.trim() || 'Wallet credit',
    });
    await tx.save();

    return this.getBalance(tenantId);
  }

  async autoRecharge(_tenantId: string) {
    // Intentionally conservative: real auto-recharge requires payment method configuration.
    return { enabled: false, reason: 'not_configured' };
  }

  async getTransactionHistory(tenantId: string) {
    const tenantObjectId = this.asObjectId(tenantId, 'tenantId');
    const walletAccount = await this.getOrCreateWalletAccount(tenantObjectId);

    return this.transactionModel
      .find({ tenantId: tenantObjectId, accountId: walletAccount._id })
      .sort({ date: -1 })
      .limit(100)
      .lean()
      .exec();
  }
}
