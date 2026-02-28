import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class TenantIdParamDto {
  @IsMongoId()
  tenantId!: string;
}

export class AddWalletCreditsDto {
  // Prefer tenant/workspace context from headers/JWT; keep body tenantId as fallback
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}