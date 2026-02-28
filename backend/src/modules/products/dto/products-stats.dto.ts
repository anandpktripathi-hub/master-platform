import { ApiProperty } from '@nestjs/swagger';

export class ProductsDashboardStatsDto {
  @ApiProperty({ description: 'Total number of products in the tenant' })
  totalProducts!: number;

  @ApiProperty({ description: 'Number of active products in the tenant' })
  activeProducts!: number;
}
