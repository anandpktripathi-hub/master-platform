import {
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RecordCommissionDto {
  @IsMongoId()
  affiliateId!: string;

  @IsNumber()
  @Min(0.01)
  baseAmount!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  commissionPercent!: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class PayoutDto {
  // Optional for backwards compatibility; if omitted, pays out current user's affiliate balance
  @IsOptional()
  @IsMongoId()
  affiliateId?: string;
}
