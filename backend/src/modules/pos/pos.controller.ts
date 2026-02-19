import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';

@Controller('pos')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('summary')
  getSummary(@Tenant() tenantId: string) {
    return this.posService.getSummary(tenantId);
  }

  @Get('stock')
  listStock(@Tenant() tenantId: string) {
    return this.posService.listStock(tenantId);
  }

  @Post('stock/adjust')
  adjustStock(@Tenant() tenantId: string, @Body() body: any) {
    return this.posService.adjustStock(tenantId, body);
  }

  @Get('orders')
  listOrders(@Tenant() tenantId: string, @Query('limit') limit = 50) {
    return this.posService.listOrders(tenantId, Number(limit));
  }

  @Post('orders')
  createOrder(@Tenant() tenantId: string, @Body() body: any) {
    return this.posService.createOrder(tenantId, body);
  }
}
