/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { BillingService, SubscriptionViewV1 } from './billing.service';
import { AdminSetPlanDto, SelectPlanDto } from './dto/subscription.dto';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiTags('Billing Subscriptions')
@ApiBearerAuth('bearer')
@Controller('billing/subscriptions')
export class BillingSubscriptionsController {
  constructor(private readonly billingService: BillingService) {}

  /** Tenant can see current subscription details. */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('admin')
  async getMySubscription(
    @Tenant() tenantId: string,
  ): Promise<SubscriptionViewV1> {
    const subscription =
      await this.billingService.getCurrentSubscriptionForTenant(tenantId);
    return subscription;
  }

  /** Tenant selects a plan (trial or paid) and subscription is created/renewed. */
  @Post('select-plan')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard, RateLimitGuard)
  @Roles('admin')
  async selectPlan(
    @Tenant() tenantId: string,
    @Request() req: RequestWithUser,
    @Body() body: SelectPlanDto,
  ): Promise<SubscriptionViewV1> {
    const userId = req.user?.sub;

    const subscription = await this.billingService.selectPlanForTenant({
      tenantId,
      userId,
      packageId: body.packageId,
      startTrial: body.startTrial,
      paymentToken: body.paymentToken,
      gatewayName: body.gatewayName,
    });

    return subscription;
  }

  /** Platform admin can manually upgrade/downgrade a tenant (no gateway charge). */
  @Post('admin/set-plan')
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async adminSetPlan(
    @Request() req: RequestWithUser,
    @Body() body: AdminSetPlanDto,
  ): Promise<SubscriptionViewV1> {
    const adminUserId = req.user?.sub;

    const subscription = await this.billingService.adminSetTenantPlan({
      tenantId: body.tenantId,
      packageId: body.packageId,
      adminUserId,
      startTrial: body.startTrial,
      notes: body.notes,
    });

    return subscription;
  }

  /**
   * Cron-friendly expiry check. Expires overdue subscriptions.
   * Intended for internal ops / admin triggers (and future schedulers).
   */
  @Post('admin/check-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async checkExpired(): Promise<{ expired: number }> {
    const result =
      await this.billingService.checkAndExpireOverdueSubscriptions();
    return result;
  }
}
