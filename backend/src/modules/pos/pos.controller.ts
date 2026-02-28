import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { AdjustStockDto, CreatePosOrderDto } from './dto/pos.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PosOrdersQueryDto } from './dto/pos-orders-query.dto';
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
  private readonly logger = new Logger(PosController.name);

  constructor(private readonly posService: PosService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get POS summary (tenant)' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSummary(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.posService.getSummary(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSummary] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get POS summary');
    }
  }

  @Get('stock')
  @ApiOperation({ summary: 'List POS stock (tenant)' })
  @ApiResponse({ status: 200, description: 'Stock returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listStock(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.posService.listStock(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listStock] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list POS stock');
    }
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Adjust POS stock (tenant)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async adjustStock(@Tenant() tenantId: string, @Body() body: AdjustStockDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.posService.adjustStock(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[adjustStock] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to adjust POS stock');
    }
  }

  @Get('orders')
  @ApiOperation({ summary: 'List POS orders (tenant)' })
  @ApiResponse({ status: 200, description: 'Orders returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listOrders(
    @Tenant() tenantId: string,
    @Query() query: PosOrdersQueryDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.posService.listOrders(tenantId, query.limit ?? 50);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listOrders] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list POS orders');
    }
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create POS order (tenant)' })
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createOrder(@Tenant() tenantId: string, @Body() body: CreatePosOrderDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.posService.createOrder(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createOrder] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create POS order');
    }
  }
}
