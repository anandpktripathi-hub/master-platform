import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  NotEquals,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PosOrderItemDto {
  @IsMongoId()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}

export class CreatePosOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosOrderItemDto)
  items!: PosOrderItemDto[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  customerName?: string;
}

export class AdjustStockDto {
  @IsMongoId()
  productId!: string;

  @IsInt()
  @NotEquals(0)
  quantityDelta!: number;

  @IsIn(['sale', 'purchase', 'adjustment'])
  type!: 'sale' | 'purchase' | 'adjustment';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}

export class DomainPurchaseDto {
  @IsString()
  domain!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  years?: number;

  @IsMongoId()
  tenantId!: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
