import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TenantFinancialTotalsDto {
  @ApiProperty() totalInvoices!: number;
  @ApiProperty() totalAmount!: number;
  @ApiProperty() paidAmount!: number;
  @ApiProperty() overdueAmount!: number;
}

export class TenantFinancialReportDto {
  @ApiPropertyOptional({ nullable: true })
  currency?: string | null;

  @ApiProperty({ type: TenantFinancialTotalsDto })
  totals!: TenantFinancialTotalsDto;

  @ApiProperty({
    description: 'Breakdown by invoice status',
    type: Object,
  })
  byStatus!: Record<string, { count: number; totalAmount: number }>;
}

export class TenantCommerceReportDto {
  @ApiProperty() totalOrders!: number;
  @ApiProperty() totalSales!: number;

  @ApiProperty({ description: 'Order counts by status', type: Object })
  byStatus!: Record<string, number>;
}
