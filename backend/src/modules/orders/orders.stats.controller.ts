import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
  constructor(private readonly statsService: OrdersStatsService) {}

  @Get('dashboard')
  async getDashboardStats(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: OrdersDashboardStatsQueryDto,
  ) {
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

      if (query.tenantId && tenantIdFromContext && query.tenantId !== tenantIdFromContext) {
        throw new ForbiddenException('Cross-tenant access is not allowed');
      }
    }

    return this.statsService.getDashboardStats({
      tenantId: effectiveTenantId,
      from: query.from,
      to: query.to,
    });
  }
}
