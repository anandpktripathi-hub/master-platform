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
import { BillStatus } from '../../../database/schemas/bill.schema';

export class CreateBillDto {
  @IsString()
  @Length(1, 80)
  number!: string;

  @IsString()
  @Length(1, 200)
  vendorName!: string;

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
  @IsEnum(['draft', 'open', 'partially_paid', 'paid', 'cancelled'])
  status?: BillStatus;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}

export class UpdateBillDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  vendorName?: string;

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
  @IsEnum(['draft', 'open', 'partially_paid', 'paid', 'cancelled'])
  status?: BillStatus;

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string;
}
