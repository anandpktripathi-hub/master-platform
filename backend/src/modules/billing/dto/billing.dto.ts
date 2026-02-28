import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBillingDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @MinLength(3)
  currency!: string;

  @IsString()
  @MinLength(1)
  status!: string;
}

export class UpdateBillingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  status?: string;
}

export class AdminCreateBillingDto extends CreateBillingDto {
  @IsMongoId()
  tenantId!: string;
}

export class AdminUpdateBillingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class BillingAdminListQueryDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
