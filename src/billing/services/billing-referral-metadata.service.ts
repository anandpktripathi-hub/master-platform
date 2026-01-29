import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant } from '../../modules/tenants/schemas/tenant.schema';

/**
 * Helper service to build payment metadata/notes from tenant-level referral data.
 *
 * This keeps all affiliate-related metadata construction in one place so
 * future Stripe/Razorpay integrations can consistently include referralCode,
 * tenantId, invoiceId, etc. in their requests.
 */
@Injectable()
export class BillingReferralMetadataService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<Tenant>,
  ) {}

  /**
   * Build a generic metadata object for payments based on tenant referral data.
   *
   * Always includes tenantId (as string). If the tenant has a stored
   * referralCode, it is added as `referralCode` for Stripe, and can also be
   * mirrored into Razorpay `notes`.
   */
  async buildMetadataForTenantPayment(options: {
    tenantId: string;
    invoiceId?: string;
    subscriptionId?: string;
    extra?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    const { tenantId, invoiceId, subscriptionId, extra } = options;

    const base: Record<string, unknown> = {
      tenantId,
    };

    if (invoiceId) {
      base.invoiceId = invoiceId;
    }

    if (subscriptionId) {
      base.subscriptionId = subscriptionId;
    }

    // Fetch tenant to read stored referralCode (if any)
    try {
      const tenantObjectId = new Types.ObjectId(tenantId);
      const tenant = await this.tenantModel
        .findById(tenantObjectId)
        .select('referralCode')
        .lean();

      if (tenant && (tenant as any).referralCode) {
        base.referralCode = (tenant as any).referralCode;
      }
    } catch {
      // Swallow errors here so payments are never blocked by referral lookup
    }

    if (extra) {
      Object.assign(base, extra);
    }

    return base;
  }
}
