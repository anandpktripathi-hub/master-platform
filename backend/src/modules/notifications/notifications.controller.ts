import { Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
import { Tenant } from '../../decorators/tenant.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    userId?: string;
    tenantId?: string;
  };
}
@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Controller('notifications')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
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
  async getMyNotifications(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
  ) {
    const tenantId = tenantIdFromDecorator || req.user?.tenantId;
    const userId = req.user?.userId || req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new UnauthorizedException('Tenant or user ID not found');
    }

    return this.notifications.listForUser(String(tenantId), String(userId));
  }

  @Post('mark-all-read')
  async markAllRead(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
  ) {
    const tenantId = tenantIdFromDecorator || req.user?.tenantId;
    const userId = req.user?.userId || req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new UnauthorizedException('Tenant or user ID not found');
    }

    const updated = await this.notifications.markAllRead(
      String(tenantId),
      String(userId),
    );

    return { updated };
  }
}
