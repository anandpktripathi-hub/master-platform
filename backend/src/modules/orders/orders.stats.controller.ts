import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersStatsService } from './services/orders-stats.service';
import { OrdersDashboardStatsQueryDto } from './dto/orders-stats.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

type AuthRequest = {
  user?: { role?: string };
};
@ApiTags('Orders Stats')
@ApiBearerAuth('bearer')
@Controller('orders/stats')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
  'PLATFORM_SUPERADMIN',
)
export class OrdersStatsController {
  private readonly logger = new Logger(OrdersStatsController.name);

  constructor(private readonly statsService: OrdersStatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get orders dashboard stats' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDashboardStats(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: OrdersDashboardStatsQueryDto,
  ) {
    try {
      const role = String(req?.user?.role || '').trim();
      const normalizedRole = role.toLowerCase();
      const isPlatformAdmin =
        normalizedRole === 'platform_super_admin' ||
        normalizedRole === 'platform_superadmin' ||
        normalizedRole === 'platform_admin';

      const effectiveTenantId = isPlatformAdmin
        ? query.tenantId || tenantIdFromContext
        : tenantIdFromContext || query.tenantId;

      if (!isPlatformAdmin) {
        if (!effectiveTenantId) {
          throw new BadRequestException('Tenant ID is required');
        }

        if (
          query.tenantId &&
          tenantIdFromContext &&
          query.tenantId !== tenantIdFromContext
        ) {
          throw new ForbiddenException('Cross-tenant access is not allowed');
        }
      }

      return await this.statsService.getDashboardStats({
        tenantId: effectiveTenantId,
        from: query.from,
        to: query.to,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getDashboardStats] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch orders dashboard stats');
    }
  }
}
