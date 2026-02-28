import {
  IsMongoId,
  IsNumber,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  Min,
} from 'class-validator';

export class StripeAddonCheckoutDto {
  // Prefer tenant/workspace context from headers/JWT; keep body tenantId as fallback
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsObject()
  @IsNotEmptyObject()
  addon!: Record<string, unknown>;
}

export class StripeLifetimeCheckoutDto {
  // Prefer tenant/workspace context from headers/JWT; keep body tenantId as fallback
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsNumber()
  @Min(0.01)
  price!: number;
}
