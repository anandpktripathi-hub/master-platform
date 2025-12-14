import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionStatus, BillingPeriod } from '../schemas/subscription.schema';
import { SubscribeDto } from '../dto/subscribe.dto';
import { ChangePlanDto } from '../dto/change-plan.dto';
import { PlansService } from './plans.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel('Subscription') private subscriptionModel: Model<SubscriptionDocument>,
    private plansService: PlansService,
  ) {}

  async create(tenantId: string, subscribeDto: SubscribeDto): Promise<Subscription> {
    // Check if tenant already has an active subscription
    const existingSubscription = await this.subscriptionModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    });

    if (existingSubscription) {
      throw new BadRequestException('Tenant already has an active subscription');
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

    return (subscription as any).save();
  }

  async findByTenantId(tenantId: string): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .populate('planId');

    if (!subscription) {
      throw new NotFoundException(`No subscription found for tenant "${tenantId}"`);
    }

    return subscription;
  }

  async findActiveByTenantId(tenantId: string): Promise<Subscription | null> {
    return this.subscriptionModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    });
  }

  async changePlan(tenantId: string, changePlanDto: ChangePlanDto): Promise<Subscription> {
    const subscription = await this.findByTenantId(tenantId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Cannot change plan for a cancelled subscription');
    }

    // Get new plan
    const newPlan = await this.plansService.findById(changePlanDto.newPlanId);

    // Update subscription
    subscription.planId = new Types.ObjectId(changePlanDto.newPlanId);
    subscription.billingPeriod = changePlanDto.billingPeriod;

    // Reset renewal date
    if (subscription.status === SubscriptionStatus.TRIAL) {
      subscription.renewAt = this.addDays(new Date(), 14); // Reset trial
    } else {
      subscription.renewAt = this.addMonths(new Date(), changePlanDto.billingPeriod === BillingPeriod.YEARLY ? 12 : 1);
    }

    return (subscription as any).save();
  }

  async cancelSubscription(tenantId: string, cancelAtPeriodEnd = false): Promise<Subscription> {
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

    return (subscription as any).save();
  }

  async updateStatus(tenantId: string, status: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.findByTenantId(tenantId);

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    subscription.status = status;
    return (subscription as any).save();
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

    return (subscription as any).save();
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

