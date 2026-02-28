import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  IsPositive,
  IsArray,
  IsBoolean,
  IsMongoId,
  Min,
} from 'class-validator';

type CouponType = 'single' | 'multi';
type DiscountType = 'percent' | 'fixed';
type CouponStatus = 'active' | 'inactive' | 'expired';

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  /**
   * Legacy field (kept for compatibility): maps to amount.
   */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  discount?: number;

  @IsOptional()
  @IsIn(['single', 'multi'])
  type?: CouponType;

  @IsOptional()
  @IsIn(['percent', 'fixed'])
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string; // legacy alias for validTo

  @IsOptional()
  @IsNumber()
  @IsPositive()
  usageLimit?: number; // legacy alias for maxUses

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUsesPerTenant?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  applicablePackageIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedTenantIds?: string[];

  @IsOptional()
  @IsIn(['active', 'inactive', 'expired'])
  status?: CouponStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
