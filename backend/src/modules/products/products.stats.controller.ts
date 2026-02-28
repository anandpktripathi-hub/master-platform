import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { ProductsDashboardStatsDto } from './dto/products-stats.dto';
@ApiTags('Products Stats')
@ApiBearerAuth('bearer')
@Controller('products/stats')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsStatsController {
  private readonly logger = new Logger(ProductsStatsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get product stats for tenant dashboard' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDashboardStats(
    @Tenant() tenantId: string,
  ): Promise<ProductsDashboardStatsDto> {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');

      const total = await this.productsService.countAll(tenantId);
      const active = await this.productsService.countActive(tenantId);

      return {
        totalProducts: total,
        activeProducts: active,
      };
    } catch (error) {
      this.logger.error(
        '[getDashboardStats] Failed to compute dashboard stats',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to get dashboard stats');
    }
  }
}
