import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  OfflinePaymentRequest,
  OfflinePaymentRequestDocument,
  OfflinePaymentRequestStatus,
} from '../../../database/schemas/offline-payment-request.schema';
import {
  TenantPackage,
  TenantPackageDocument,
} from '../../../database/schemas/tenant-package.schema';
import {
  Package,
  PackageDocument,
} from '../../../database/schemas/package.schema';
import { BillingService } from '../../billing/billing.service';
import { BillingNotificationService } from '../../billing/billing-notification.service';
import { TenantsService } from '../../tenants/tenants.service';
import { PaymentLogService } from './payment-log.service';
import { PackageService } from '../../packages/services/package.service';

@Injectable()
export class OfflinePaymentsService {
  constructor(
    @InjectModel(OfflinePaymentRequest.name)
    private readonly offlineModel: Model<OfflinePaymentRequestDocument>,
    @InjectModel(TenantPackage.name)
    private readonly tenantPackageModel: Model<TenantPackageDocument>,
    @InjectModel(Package.name)
    private readonly packageModel: Model<PackageDocument>,
    private readonly billingService: BillingService,
    private readonly paymentLogService: PaymentLogService,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
    @Inject(forwardRef(() => PackageService))
    private readonly packageService: PackageService,
  ) {}

  async createRequest(params: {
    tenantId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    description?: string;
    proofUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<OfflinePaymentRequest> {
    const {
      tenantId,
      userId,
      amount,
      currency,
      method,
      description,
      proofUrl,
      metadata,
    } = params;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const doc = new this.offlineModel({
      tenantId: new Types.ObjectId(tenantId),
      userId: new Types.ObjectId(userId),
      amount,
      currency: currency.toUpperCase(),
      method,
      description,
      proofUrl,
      metadata,
      status: 'pending' as OfflinePaymentRequestStatus,
    });

    return doc.save();
  }

  async listForTenant(tenantId: string): Promise<OfflinePaymentRequest[]> {
    return this.offlineModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async listAll(): Promise<OfflinePaymentRequest[]> {
    return this.offlineModel.find().sort({ createdAt: -1 }).exec();
  }

  async updateStatus(
    id: string,
    status: OfflinePaymentRequestStatus,
  ): Promise<OfflinePaymentRequest> {
    const doc = await this.offlineModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException('Offline payment request not found');
    }

    if (doc.status !== 'pending') {
      throw new BadRequestException('Only pending requests can be updated');
    }

    doc.status = status;
    const saved = await doc.save();

    // Record in payment logs
    this.paymentLogService.record({
      transactionId: saved._id.toString(),
      tenantId: saved.tenantId.toString(),
      packageId: 'offline-payment',
      amount: saved.amount,
      currency: saved.currency,
      status: status === 'approved' ? 'success' : 'failed',
      createdAt: new Date(),
      error: status === 'approved' ? undefined : `Offline payment ${status}`,
      gatewayName: 'offline',
    });

    // When approved, create a billing record to tie into billing history
    if (status === 'approved') {
      try {
        // If the request specifies a target package, apply it as the upgrade/downgrade.
        // Otherwise, fall back to the legacy "reactivate/extend" logic.
        const applied = await this.applyPackageAssignmentFromMetadata(saved);
        if (!applied) {
          await this.applySubscriptionAdjustmentForTenant(
            saved.tenantId.toString(),
            saved.amount,
            saved.currency,
          );
        }
      } catch (err) {
        // If the upgrade/adjustment fails, revert approval so an admin can retry.
        doc.status = 'pending';
        await doc.save().catch(() => undefined);
        throw err;
      }

      // Best-effort billing record for history (do not block upgrade if billing history fails)
      await this.billingService
        .create(
          {
            amount: saved.amount,
            currency: saved.currency,
            status: 'PAID' as any,
          } as any,
          saved.tenantId.toString(),
        )
        .catch(() => undefined);
    }

    return saved;
  }

  private async applyPackageAssignmentFromMetadata(
    request: OfflinePaymentRequestDocument,
  ): Promise<boolean> {
    const raw = request.metadata?.packageId;
    if (typeof raw !== 'string') {
      return false;
    }
    const packageId = raw.trim();
    if (!packageId) {
      return false;
    }
    if (!Types.ObjectId.isValid(packageId)) {
      return false;
    }

    await this.packageService.assignPackageToTenant(
      request.tenantId.toString(),
      packageId,
      {
        startTrial: false,
        skipPayment: true,
        userId: request.userId?.toString?.() || undefined,
        gatewayName: 'offline',
      },
    );

    return true;
  }

  private async applySubscriptionAdjustmentForTenant(
    tenantId: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    // Find current tenant package (acts as subscription model today)
    const tenantPackage = await this.tenantPackageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .exec();

    if (!tenantPackage) {
      return;
    }

    const pkg = await this.packageModel
      .findById(tenantPackage.packageId as any)
      .exec();

    if (!pkg) {
      return;
    }

    // Require at least half of package price to treat as renewal
    if (pkg.price && amount < pkg.price * 0.5) {
      return;
    }

    // Only "revive" or extend non-active subscriptions
    if (
      tenantPackage.status !== 'expired' &&
      tenantPackage.status !== 'suspended'
    ) {
      return;
    }

    const now = new Date();
    const baseDate =
      tenantPackage.expiresAt && tenantPackage.expiresAt > now
        ? tenantPackage.expiresAt
        : now;

    let newExpiresAt: Date | undefined = tenantPackage.expiresAt;
    if (pkg.billingCycle === 'monthly') {
      newExpiresAt = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + 1,
        baseDate.getDate(),
      );
    } else if (pkg.billingCycle === 'annual') {
      newExpiresAt = new Date(
        baseDate.getFullYear() + 1,
        baseDate.getMonth(),
        baseDate.getDate(),
      );
    }

    tenantPackage.status = 'active';
    if (newExpiresAt) {
      tenantPackage.expiresAt = newExpiresAt;
      // Reset expiry warning flag for the new billing period
      tenantPackage.expiryWarningSent = false as any;
    }

    await tenantPackage.save();

    const recipientEmail =
      (await this.tenantsService.getTenantBillingEmail(tenantId)) ||
      'billing-notifications@platform.local';

    // Fire package reactivated notification to tenant-aware billing email when possible.
    await this.billingNotifications
      .sendPackageReactivatedEmail({
        to: recipientEmail,
        tenantId,
        packageName: (pkg && pkg.name) || 'Current package',
        expiresAt: tenantPackage.expiresAt,
      })
      .catch(() => undefined);
  }
}
