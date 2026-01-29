import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../schemas/invoice.schema';

class AdminInvoiceLineItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Amount per line in smallest currency unit (e.g., cents)' })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateAdminInvoiceDto {
  @ApiProperty({ description: 'Tenant ID to bill' })
  @IsMongoId()
  tenantId: string;

  @ApiProperty({ description: 'Subscription this invoice relates to' })
  @IsMongoId()
  subscriptionId: string;

  @ApiProperty({ description: 'Plan this invoice relates to' })
  @IsMongoId()
  planId: string;

  @ApiProperty({ description: 'Total invoice amount in smallest currency unit (e.g., cents)' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Due date in ISO 8601 format' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Optional payment method label, e.g. STRIPE, RAZORPAY, PAYPAL, MANUAL' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Internal notes / memo for this invoice' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [AdminInvoiceLineItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminInvoiceLineItemDto)
  lineItems?: AdminInvoiceLineItemDto[];

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
