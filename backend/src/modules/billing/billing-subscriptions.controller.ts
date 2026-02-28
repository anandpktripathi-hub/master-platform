/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  private readonly logger = new Logger(BillingSubscriptionsController.name);

  constructor(private readonly billingService: BillingService) {}

  /** Tenant can see current subscription details. */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMySubscription(
    @Tenant() tenantId: string,
  ): Promise<SubscriptionViewV1> {
    try {
      const subscription =
        await this.billingService.getCurrentSubscriptionForTenant(tenantId);
      return subscription;
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMySubscription] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get subscription');
    }
  }

  /** Tenant selects a plan (trial or paid) and subscription is created/renewed. */
  @Post('select-plan')
  @UseGuards(JwtAuthGuard, RolesGuard, TenantGuard, RateLimitGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Select plan for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async selectPlan(
    @Tenant() tenantId: string,
    @Request() req: RequestWithUser,
    @Body() body: SelectPlanDto,
  ): Promise<SubscriptionViewV1> {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(`[selectPlan] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to select plan');
    }
  }

  /** Platform admin can manually upgrade/downgrade a tenant (no gateway charge). */
  @Post('admin/set-plan')
  @UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Admin set plan for tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async adminSetPlan(
    @Request() req: RequestWithUser,
    @Body() body: AdminSetPlanDto,
  ): Promise<SubscriptionViewV1> {
    try {
      const adminUserId = req.user?.sub;

      const subscription = await this.billingService.adminSetTenantPlan({
        tenantId: body.tenantId,
        packageId: body.packageId,
        adminUserId,
        startTrial: body.startTrial,
        notes: body.notes,
      });

      return subscription;
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[adminSetPlan] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to set plan');
    }
  }

  /**
   * Cron-friendly expiry check. Expires overdue subscriptions.
   * Intended for internal ops / admin triggers (and future schedulers).
   */
  @Post('admin/check-expired')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Expire overdue subscriptions (admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async checkExpired(): Promise<{ expired: number }> {
    try {
      const result =
        await this.billingService.checkAndExpireOverdueSubscriptions();
      return result;
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[checkExpired] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to check expired subscriptions');
    }
  }
}
