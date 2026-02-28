import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderIdParamDto } from './dto/order-id-param.dto';
import { OrdersTenantQueryDto } from './dto/orders-tenant-query.dto';

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
  private readonly logger = new Logger(OrdersController.name);

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
  @ApiOperation({ summary: 'List orders (tenant, optionally platform admin scoped)' })
  @ApiResponse({ status: 200, description: 'Orders returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listOrders(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: ListOrdersQueryDto,
  ) {
    try {
      const tenantId = this.resolveTenantId(
        req,
        tenantIdFromContext,
        query.tenantId,
      );
      return await this.ordersService.listOrders({
        tenantId,
        source: query.source,
        limit: query.limit,
        from: query.from,
        to: query.to,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listOrders] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list orders');
    }
  }

  @Get('pos/:id')
  @ApiOperation({ summary: 'Get POS order by id (tenant, optionally platform admin scoped)' })
  @ApiResponse({ status: 200, description: 'Order returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPosOrder(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: OrderIdParamDto,
    @Query() query: OrdersTenantQueryDto,
  ) {
    try {
      const tenantId = this.resolveTenantId(
        req,
        tenantIdFromContext,
        query.tenantId,
      );
      return await this.ordersService.getPosOrderById(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getPosOrder] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch POS order');
    }
  }

  @Get('domain/:id')
  @ApiOperation({ summary: 'Get domain order by id (tenant, optionally platform admin scoped)' })
  @ApiResponse({ status: 200, description: 'Order returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDomainOrder(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: OrderIdParamDto,
    @Query() query: OrdersTenantQueryDto,
  ) {
    try {
      const tenantId = this.resolveTenantId(
        req,
        tenantIdFromContext,
        query.tenantId,
      );
      return await this.ordersService.getDomainOrderById(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getDomainOrder] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch domain order');
    }
  }
}
