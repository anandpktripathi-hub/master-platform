import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Affiliate, AffiliateDocument } from './schemas/affiliate.schema';
import {
  ReferralLedger,
  ReferralLedgerDocument,
  ReferralEventType,
} from './schemas/referral-ledger.schema';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectModel(Affiliate.name)
    private readonly affiliateModel: Model<AffiliateDocument>,
    @InjectModel(ReferralLedger.name)
    private readonly ledgerModel: Model<ReferralLedgerDocument>,
  ) {}

  private generateCode(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async registerAffiliate(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    let affiliate = await this.affiliateModel.findOne({ userId: userObjectId });
    if (!affiliate) {
      let code: string;
      // Ensure unique code
      // eslint-disable-next-line no-constant-condition
      while (true) {
        code = this.generateCode();
        // eslint-disable-next-line no-await-in-loop
        const existing = await this.affiliateModel.findOne({ code }).lean();
        if (!existing) break;
      }

      affiliate = await this.affiliateModel.create({
        userId: userObjectId,
        code: code!,
        totalClicks: 0,
        totalSignups: 0,
        totalCommissionEarned: 0,
        totalPaidOut: 0,
        balance: 0,
      });
    }

    const publicUrl =
      process.env.FRONTEND_PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:5173';
    const referralLink = `${publicUrl}/signup?ref=${affiliate.code}`;

    return {
      id: affiliate._id.toString(),
      code: affiliate.code,
      referralLink,
      stats: {
        totalClicks: affiliate.totalClicks,
        totalSignups: affiliate.totalSignups,
        totalCommissionEarned: affiliate.totalCommissionEarned,
        totalPaidOut: affiliate.totalPaidOut,
        balance: affiliate.balance,
      },
    };
  }

  async trackReferral(
    referralCode: string,
    tenantId: string | null,
    eventType: ReferralEventType = 'SIGNUP',
  ) {
    const affiliate = await this.affiliateModel.findOne({ code: referralCode });
    if (!affiliate) {
      // Silently ignore invalid codes to avoid user-facing errors
      return { tracked: false };
    }

    const tenantObjectId = tenantId ? new Types.ObjectId(tenantId) : undefined;

    if (eventType === 'CLICK') {
      affiliate.totalClicks += 1;
    }
    if (eventType === 'SIGNUP') {
      affiliate.totalSignups += 1;
    }

    await affiliate.save();

    await this.ledgerModel.create({
      affiliateId: affiliate._id,
      type: eventType,
      tenantId: tenantObjectId,
      amount: 0,
      currency: 'USD',
    });

    return { tracked: true };
  }

  async recordCommission(
    affiliateId: string,
    baseAmount: number,
    commissionPercent: number,
    currency = 'USD',
    metadata?: Record<string, unknown>,
  ) {
    const affiliate = await this.affiliateModel.findById(affiliateId);
    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    const amount = (baseAmount * commissionPercent) / 100;

    affiliate.totalCommissionEarned += amount;
    affiliate.balance += amount;
    await affiliate.save();

    await this.ledgerModel.create({
      affiliateId: affiliate._id,
      type: 'COMMISSION',
      amount,
      currency,
      metadata,
    });

    return {
      affiliateId: affiliate._id.toString(),
      amount,
      currency,
      balance: affiliate.balance,
    };
  }

  async payout(affiliateId: string) {
    const affiliate = await this.affiliateModel.findById(affiliateId);
    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    const amount = affiliate.balance;
    if (amount <= 0) {
      return { success: false, message: 'No balance to payout' };
    }

    // In a real system, integrate with Stripe/PayPal/etc here.
    affiliate.totalPaidOut += amount;
    affiliate.balance = 0;
    await affiliate.save();

    await this.ledgerModel.create({
      affiliateId: affiliate._id,
      type: 'PAYOUT',
      amount,
      currency: 'USD',
    });

    return { success: true, amountPaid: amount };
  }

  async getAffiliateForUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const affiliate = await this.affiliateModel
      .findOne({ userId: userObjectId })
      .lean();
    if (!affiliate) {
      return null;
    }

    const publicUrl =
      process.env.FRONTEND_PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:5173';
    const referralLink = `${publicUrl}/signup?ref=${affiliate.code}`;

    const ledger = await this.ledgerModel
      .find({ affiliateId: affiliate._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return {
      id: affiliate._id.toString(),
      code: affiliate.code,
      referralLink,
      stats: {
        totalClicks: affiliate.totalClicks,
        totalSignups: affiliate.totalSignups,
        totalCommissionEarned: affiliate.totalCommissionEarned,
        totalPaidOut: affiliate.totalPaidOut,
        balance: affiliate.balance,
      },
      ledger,
    };
  }
}
