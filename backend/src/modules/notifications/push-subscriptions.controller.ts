import {
  BadRequestException,
  Body,
  Controller,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  constructor(private readonly pushSubscriptions: PushSubscriptionsService) {}

  @Post('subscribe')
  async subscribe(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
    @Body() body: SubscribePushSubscriptionDto,
  ) {
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
  }

  @Post('unsubscribe')
  async unsubscribe(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
    @Body() body: UnsubscribePushSubscriptionDto,
  ) {
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
  }
}
