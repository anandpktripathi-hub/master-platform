import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsMongoId()
  packageId!: string;
}

export class ApplyCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class BulkUpdateCouponStatusDto {
  @IsArray()
  @IsMongoId({ each: true })
  couponIds!: string[];

  @IsIn(['active', 'inactive'])
  status!: 'active' | 'inactive';
}
