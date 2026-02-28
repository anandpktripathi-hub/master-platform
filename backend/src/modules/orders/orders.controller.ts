import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { OrdersService } from './services/orders.service';
import { ListOrdersQueryDto } from './dto/orders.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

type AuthRequest = {
  user?: { role?: string };
};
@ApiTags('Orders')
@ApiBearerAuth('bearer')
@Controller('orders')
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
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private resolveTenantId(
    req: AuthRequest,
    tenantIdFromContext: string | undefined,
    requestedTenantId: string | undefined,
  ) {
    const role = String(req?.user?.role || '').trim();
    const normalizedRole = role.toLowerCase();
    const isPlatformAdmin =
      normalizedRole === 'platform_super_admin' ||
      normalizedRole === 'platform_superadmin' ||
      normalizedRole === 'platform_admin';

    const effectiveTenantId = isPlatformAdmin
      ? requestedTenantId || tenantIdFromContext
      : tenantIdFromContext || requestedTenantId;

    if (!isPlatformAdmin) {
      if (!effectiveTenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      if (
        requestedTenantId &&
        tenantIdFromContext &&
        requestedTenantId !== tenantIdFromContext
      ) {
        throw new ForbiddenException('Cross-tenant access is not allowed');
      }
    }

    if (!effectiveTenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return effectiveTenantId;
  }

  @Get()
  async listOrders(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: ListOrdersQueryDto,
  ) {
    const tenantId = this.resolveTenantId(req, tenantIdFromContext, query.tenantId);
    return this.ordersService.listOrders({
      tenantId,
      source: query.source,
      limit: query.limit,
      from: query.from,
      to: query.to,
    });
  }

  @Get('pos/:id')
  async getPosOrder(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('id') id: string,
    @Query('tenantId') requestedTenantId?: string,
  ) {
    const tenantId = this.resolveTenantId(req, tenantIdFromContext, requestedTenantId);
    return this.ordersService.getPosOrderById(tenantId, id);
  }

  @Get('domain/:id')
  async getDomainOrder(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('id') id: string,
    @Query('tenantId') requestedTenantId?: string,
  ) {
    const tenantId = this.resolveTenantId(req, tenantIdFromContext, requestedTenantId);
    return this.ordersService.getDomainOrderById(tenantId, id);
  }
}
