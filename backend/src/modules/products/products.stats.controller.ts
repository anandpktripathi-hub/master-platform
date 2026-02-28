import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../decorators/tenant.decorator';
@ApiTags('Products Stats')
@ApiBearerAuth('bearer')
@Controller('products/stats')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsStatsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('dashboard')
  async getDashboardStats(@Tenant() tenantId: string) {
    // Example: return total count and active count
    const total = await this.productsService.countAll(tenantId);
    const active = await this.productsService.countActive(tenantId);
    return {
      totalProducts: total,
      activeProducts: active,
    };
  }
}
