import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { AdjustStockDto, CreatePosOrderDto } from './dto/pos.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Pos')
@ApiBearerAuth('bearer')
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
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.posService.getSummary(tenantId);
  }

  @Get('stock')
  listStock(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.posService.listStock(tenantId);
  }

  @Post('stock/adjust')
  adjustStock(@Tenant() tenantId: string, @Body() body: AdjustStockDto) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.posService.adjustStock(tenantId, body);
  }

  @Get('orders')
  listOrders(@Tenant() tenantId: string, @Query('limit') limit?: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    const parsed = limit === undefined ? 50 : Number(limit);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 200) {
      throw new BadRequestException('Invalid limit');
    }
    return this.posService.listOrders(tenantId, parsed);
  }

  @Post('orders')
  createOrder(@Tenant() tenantId: string, @Body() body: CreatePosOrderDto) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.posService.createOrder(tenantId, body);
  }
}
