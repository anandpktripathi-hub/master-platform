import { ApiProperty } from '@nestjs/swagger';

export class BillingRevenueMonthBucketDto {
  @ApiProperty({ description: 'Month label in YYYY-MM' })
  month!: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  paidInvoices!: number;
}

export class BillingRevenueByCurrencyBucketDto {
  @ApiProperty()
  currency!: string;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  paidInvoices!: number;
}

export class BillingRevenueStatusSummaryDto {
  @ApiProperty()
  paidLast30!: number;

  @ApiProperty()
  overdue!: number;

  @ApiProperty()
  cancelled!: number;
}

export class BillingRevenueAnalyticsResponseDto {
  @ApiProperty()
  totalRevenueLast30!: number;

  @ApiProperty()
  totalRevenueLast365!: number;

  @ApiProperty({ description: "Approximate Monthly Recurring Revenue based on the most recent full month's paid invoice volume." })
  mrrApprox!: number;

  @ApiProperty()
  arrApprox!: number;

  @ApiProperty({ nullable: true })
  defaultCurrency!: string | null;

  @ApiProperty({ type: BillingRevenueStatusSummaryDto })
  status!: BillingRevenueStatusSummaryDto;

  @ApiProperty({ type: [BillingRevenueMonthBucketDto] })
  byMonth!: BillingRevenueMonthBucketDto[];

  @ApiProperty({ type: [BillingRevenueByCurrencyBucketDto] })
  byCurrency!: BillingRevenueByCurrencyBucketDto[];
}
