import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
  BillingPeriod,
} from '../schemas/subscription.schema';
import { SubscribeDto } from '../dto/subscribe.dto';
import { ChangePlanDto } from '../dto/change-plan.dto';
import { PlansService } from './plans.service';
import { InvoicesService } from './invoices.service';
import { PaymentService, PaymentIntent } from './payment.service';
import { BillingReferralMetadataService } from './billing-referral-metadata.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel('Subscription')
    private subscriptionModel: Model<SubscriptionDocument>,
    private plansService: PlansService,
    private invoicesService: InvoicesService,
    private paymentService: PaymentService,
    private billingReferralMetadataService: BillingReferralMetadataService,
  ) {}

  async create(
    tenantId: string,
    subscribeDto: SubscribeDto,
  ): Promise<{
    subscription: Subscription;
    invoice?: any;
    paymentIntent?: PaymentIntent | null;
    requiresPayment: boolean;
  }> {
    // Check if tenant already has an active subscription
    const existingSubscription = await this.subscriptionModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'Tenant already has an active subscription',
      );
    }

    // Get plan details
    const plan = await this.plansService.findById(subscribeDto.planId);

    // Calculate renewal date (trial: 14 days, paid: 1 month/year)
    const startedAt = new Date();
    let renewAt: Date;
    let trialEndsAt: Date | undefined;

    // Check if plan is free (priceMonthly = 0 and priceYearly = 0)
    const isFree = plan.priceMonthly === 0 && plan.priceYearly === 0;

    if (isFree) {
      // Free plan: no trial, just starts immediately
      renewAt = this.addMonths(startedAt, 1); // Renews monthly
    } else {
      // Paid plans start with 14-day trial
      trialEndsAt = this.addDays(startedAt, 14);
      renewAt = trialEndsAt;
    }

    const subscription = new this.subscriptionModel({
      tenantId: new Types.ObjectId(tenantId),
      planId: new Types.ObjectId(subscribeDto.planId),
      status: isFree ? SubscriptionStatus.ACTIVE : SubscriptionStatus.TRIAL,
      billingPeriod: subscribeDto.billingPeriod,
      startedAt,
      renewAt,
      trialEndsAt,
      currency: 'USD',
      paymentMethod: subscribeDto.paymentMethodId ? 'STRIPE' : 'MANUAL',
    });

    // For free plans, no invoice or payment is needed
    if (isFree) {
      const saved = (await (subscription as any).save()) as Subscription;
      return {
        subscription: saved,
        requiresPayment: false,
        invoice: undefined,
        paymentIntent: null,
      };
    }

    // Paid plans: create invoice and payment intent / order
    const savedSubscription = (await (subscription as any).save()) as Subscription;

    const amountCents =
      subscribeDto.billingPeriod === BillingPeriod.YEARLY
        ? plan.priceYearly
        : plan.priceMonthly;

    const invoice = await this.invoicesService.create(
      tenantId,
      (savedSubscription as any)._id.toString(),
      subscribeDto.planId,
      amountCents,
      `Subscription to ${plan.name} (${subscribeDto.billingPeriod})`,
    );

    const metadata =
      await this.billingReferralMetadataService.buildMetadataForTenantPayment({
        tenantId,
        invoiceId: (invoice as any)._id.toString(),
        subscriptionId: (savedSubscription as any)._id.toString(),
        extra: {
          planId: subscribeDto.planId,
          planName: plan.name,
        },
      });

    const provider = subscribeDto.provider || 'STRIPE';
    let paymentIntent: PaymentIntent | null = null;

    if (provider === 'STRIPE') {
      paymentIntent = this.paymentService.createStripePaymentIntent(
        amountCents,
        'usd',
        metadata,
      );
      (savedSubscription as any).paymentMethod = 'STRIPE';
    } else if (provider === 'RAZORPAY') {
      paymentIntent = this.paymentService.createRazorpayOrder(
        amountCents,
        'USD',
        metadata,
      );
      (savedSubscription as any).paymentMethod = 'RAZORPAY';
    } else if (provider === 'PAYPAL') {
      paymentIntent = await this.paymentService.createPaypalOrder(
        amountCents,
        'USD',
        metadata,
      );
      (savedSubscription as any).paymentMethod = 'PAYPAL';
    } else {
      (savedSubscription as any).paymentMethod = 'MANUAL';
    }

    await (savedSubscription as any).save();

    return {
      subscription: savedSubscription,
      invoice,
      paymentIntent,
      requiresPayment: !!paymentIntent,
    };
  }

  async findByTenantId(tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .populate('planId');

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for tenant "${tenantId}"`,
      );
    }

    return subscription;
  }

  async findActiveByTenantId(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    });
  }

  async changePlan(
    tenantId: string,
    changePlanDto: ChangePlanDto,
  ): Promise<Subscription> {
    const subscription = await this.findByTenantId(tenantId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot change plan for a cancelled subscription',
      );
    }

    // Get new plan
    await this.plansService.findById(changePlanDto.newPlanId);

    // Update subscription
    subscription.planId = new Types.ObjectId(changePlanDto.newPlanId);
    subscription.billingPeriod = changePlanDto.billingPeriod;

    // Reset renewal date
    if (subscription.status === SubscriptionStatus.TRIAL) {
      subscription.renewAt = this.addDays(new Date(), 14); // Reset trial
    } else {
      subscription.renewAt = this.addMonths(
        new Date(),
        changePlanDto.billingPeriod === BillingPeriod.YEARLY ? 12 : 1,
      );
    }

    return (await (subscription as any).save()) as Subscription;
  }

  async cancelSubscription(
    tenantId: string,
    cancelAtPeriodEnd = false,
  ): Promise<Subscription> {
    const subscription = await this.findByTenantId(tenantId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
    }

    return (await (subscription as any).save()) as Subscription;
  }

  async updateStatus(
    tenantId: string,
    status: SubscriptionStatus,
  ): Promise<Subscription> {
    const subscription = await this.findByTenantId(tenantId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    subscription.status = status;
    return (await (subscription as any).save()) as Subscription;
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.cancelAtPeriodEnd) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
    } else {
      // Renew the subscription
      const newRenewDate = this.addMonths(
        subscription.renewAt,
        subscription.billingPeriod === BillingPeriod.YEARLY ? 12 : 1,
      );
      subscription.renewAt = newRenewDate;
      subscription.status = SubscriptionStatus.ACTIVE;
      subscription.lastPaymentDate = new Date();
      subscription.failedPaymentCount = 0;
    }

    return (await (subscription as any).save()) as Subscription;
  }

  // Helper methods
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
