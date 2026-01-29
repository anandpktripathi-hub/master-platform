import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('my')
  async getMyNotifications(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new Error('Tenant or user ID not found');
    }

    return this.notifications.listForUser(String(tenantId), String(userId));
  }

  @Post('mark-all-read')
  async markAllRead(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new Error('Tenant or user ID not found');
    }

    const updated = await this.notifications.markAllRead(
      String(tenantId),
      String(userId),
    );

    return { updated };
  }
}
