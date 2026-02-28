import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SubscribePushSubscriptionDto,
  UnsubscribePushSubscriptionDto,
} from './dto/push-subscription.dto';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}
@ApiTags('Push Subscriptions')
@ApiBearerAuth('bearer')
@Controller('notifications/push-subscriptions')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class PushSubscriptionsController {
  private readonly logger = new Logger(PushSubscriptionsController.name);

  constructor(private readonly pushSubscriptions: PushSubscriptionsService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe current user to web push notifications' })
  @ApiResponse({ status: 200, description: 'Subscribed' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async subscribe(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
    @Body() body: SubscribePushSubscriptionDto,
  ) {
    try {
      const tenantId = tenantIdFromDecorator || req.user?.tenantId;
      const userId = req.user?.sub || req.user?._id;

      if (!tenantId || !userId) {
        throw new UnauthorizedException('Tenant or user ID not found');
      }

      const subscription = await this.pushSubscriptions.saveOrUpdateForUser(
        String(tenantId),
        String(userId),
        body,
      );

      return { success: true, subscription };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[subscribe] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to subscribe to push notifications');
    }
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe current user from web push notifications' })
  @ApiResponse({ status: 200, description: 'Unsubscribed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async unsubscribe(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
    @Body() body: UnsubscribePushSubscriptionDto,
  ) {
    try {
      const tenantId = tenantIdFromDecorator || req.user?.tenantId;
      const userId = req.user?.sub || req.user?._id;

      if (!tenantId || !userId) {
        throw new UnauthorizedException('Tenant or user ID not found');
      }

      if (!body?.endpoint) throw new BadRequestException('Endpoint is required');

      await this.pushSubscriptions.removeByEndpoint(
        String(tenantId),
        body.endpoint,
        String(userId),
      );

      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[unsubscribe] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to unsubscribe from push notifications');
    }
  }
}
