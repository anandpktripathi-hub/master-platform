import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { InvoiceStatus } from '../../../database/schemas/invoice.schema';

export class CreateInvoiceDto {
  @IsString()
  @Length(1, 80)
  number!: string;

  @IsString()
  @Length(1, 200)
  customerName!: string;

  @IsString()
  @Length(1, 10)
  currency!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsDateString()
  issueDate!: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  customerName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}
