import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
import { Tenant } from '../../decorators/tenant.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MarkAllReadResponseDto,
  UserNotificationDto,
} from './dto/notifications.dto';

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
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notifications: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'Success', type: UserNotificationDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyNotifications(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
  ): Promise<UserNotificationDto[]> {
    try {
      const tenantId = tenantIdFromDecorator || req.user?.tenantId;
      const userId = req.user?.userId || req.user?.sub || req.user?._id;
      if (!tenantId || !userId) {
        throw new UnauthorizedException('Tenant or user ID not found');
      }

      return await this.notifications.listForUser(
        String(tenantId),
        String(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMyNotifications] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  @ApiResponse({ status: 200, description: 'Success', type: MarkAllReadResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async markAllRead(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromDecorator: string,
  ): Promise<MarkAllReadResponseDto> {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(`[markAllRead] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
