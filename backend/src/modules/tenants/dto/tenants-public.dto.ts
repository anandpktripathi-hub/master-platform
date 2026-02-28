import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const PRICE_TIERS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type PriceTier = (typeof PRICE_TIERS)[number];

export class PublicDirectoryQueryDto {
  @ApiPropertyOptional({ description: 'Free text search query' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ description: 'Category filter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'City filter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Country filter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Tag filter' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tag?: string;

  @ApiPropertyOptional({ description: 'Price tier filter', enum: PRICE_TIERS })
  @IsOptional()
  @IsIn(PRICE_TIERS)
  priceTier?: PriceTier;

  @ApiPropertyOptional({ description: 'Minimum rating filter (0..5)', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;
}

export class TenantSlugParamDto {
  @ApiProperty({ description: 'Tenant/business slug' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug!: string;
}
