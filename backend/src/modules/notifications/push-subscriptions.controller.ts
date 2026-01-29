import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { PushSubscriptionsService, SavePushSubscriptionInput } from './push-subscriptions.service';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller('notifications/push-subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    @Body() body: SavePushSubscriptionInput,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;

    if (!tenantId || !userId) {
      throw new Error('Tenant or user ID not found');
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
    @Body() body: { endpoint: string },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found');
    }

    if (!body?.endpoint) {
      throw new Error('Endpoint is required');
    }

    await this.pushSubscriptions.removeByEndpoint(String(tenantId), body.endpoint);

    return { success: true };
  }
}
