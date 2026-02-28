import { ApiProperty } from '@nestjs/swagger';

export class BillingRevenueMonthBucketDto {
  @ApiProperty({ description: 'Month bucket in YYYY-MM format' })
  month!: string;

  @ApiProperty({ description: 'Total amount for the month' })
  totalAmount!: number;

  @ApiProperty({ description: 'Number of paid invoices for the month' })
  paidInvoices!: number;
}

export class BillingRevenueByCurrencyBucketDto {
  @ApiProperty({ description: 'Currency code (e.g. USD)' })
  currency!: string;

  @ApiProperty({ description: 'Total amount across invoices in this currency' })
  totalAmount!: number;

  @ApiProperty({ description: 'Number of paid invoices in this currency' })
  paidInvoices!: number;
}

export class BillingRevenueStatusSummaryDto {
  @ApiProperty({ description: 'Count of paid invoices in the last 30 days' })
  paidLast30!: number;

  @ApiProperty({ description: 'Count of overdue invoices' })
  overdue!: number;

  @ApiProperty({ description: 'Count of cancelled invoices' })
  cancelled!: number;
}

export class BillingRevenueAnalyticsResponseDto {
  @ApiProperty()
  totalRevenueLast30!: number;

  @ApiProperty()
  totalRevenueLast365!: number;

  @ApiProperty({
    description:
      "Approximate Monthly Recurring Revenue based on the most recent full month's paid invoice volume.",
  })
  mrrApprox!: number;

  @ApiProperty({ description: 'Approximate annual recurring revenue (mrrApprox * 12)' })
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
