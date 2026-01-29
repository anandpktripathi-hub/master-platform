import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products/stats')
export class ProductsStatsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    // Example: return total count and active count
    const total = await this.productsService.countAll();
    const active = await this.productsService.countActive();
    return {
      totalProducts: total,
      activeProducts: active,
    };
  }
}
