import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsHexColor,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new theme (Admin only)
 */
export class CreateThemeDto {
  @ApiProperty({ example: 'Modern Light', description: 'Theme name' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: 'A clean and modern light theme',
    description: 'Theme description',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  description: string;

  @ApiProperty({ example: 'modern-light', description: 'URL-friendly slug' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @ApiProperty({ example: '#1976d2', description: 'Primary brand color (hex)' })
  @IsHexColor()
  primaryColor: string;

  @ApiProperty({
    example: '#dc004e',
    description: 'Secondary accent color (hex)',
  })
  @IsHexColor()
  secondaryColor: string;

  @ApiPropertyOptional({
    example: '#f5f5f5',
    description: 'Background color (hex)',
  })
  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @ApiPropertyOptional({
    example: '#ffffff',
    description: 'Surface/card color (hex)',
  })
  @IsOptional()
  @IsHexColor()
  surfaceColor?: string;

  @ApiPropertyOptional({
    example: '#000000',
    description: 'Primary text color (hex)',
  })
  @IsOptional()
  @IsHexColor()
  textPrimaryColor?: string;

  @ApiPropertyOptional({
    example: '#666666',
    description: 'Secondary text color (hex)',
  })
  @IsOptional()
  @IsHexColor()
  textSecondaryColor?: string;

  @ApiPropertyOptional({
    example: 'Roboto, sans-serif',
    description: 'Font family',
  })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ example: 16, description: 'Base font size in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(12)
  baseFontSize?: number;

  @ApiPropertyOptional({ example: 8, description: 'Base spacing unit' })
  @IsOptional()
  @IsNumber()
  @Min(4)
  baseSpacing?: number;

  @ApiPropertyOptional({ example: 4, description: 'Border radius in pixels' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  borderRadius?: number;

  @ApiPropertyOptional({ example: true, description: 'Is theme active?' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is default theme?' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/preview.jpg',
    description: 'Preview image URL',
  })
  @IsOptional()
  @IsString()
  previewImageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * DTO for updating an existing theme (Admin only)
 */
export class UpdateThemeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  surfaceColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  textPrimaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  textSecondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(12)
  baseFontSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(4)
  baseSpacing?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  borderRadius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previewImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * DTO for tenant selecting a theme
 */
export class SelectThemeDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Theme ID to select',
  })
  @IsString()
  baseThemeId: string;
}

/**
 * DTO for tenant customizing their theme
 */
export class CustomizeThemeDto {
  @ApiPropertyOptional({
    example: '#ff5722',
    description: 'Custom primary color',
  })
  @IsOptional()
  @IsHexColor()
  customPrimaryColor?: string;

  @ApiPropertyOptional({
    example: '#00bcd4',
    description: 'Custom secondary color',
  })
  @IsOptional()
  @IsHexColor()
  customSecondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  customBackgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  customSurfaceColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  customTextPrimaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  customTextSecondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customFontFamily?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(12)
  customBaseFontSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(4)
  customBaseSpacing?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customBorderRadius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customMetadata?: Record<string, any>;
}

/**
 * DTO for theme response (includes merged base + customizations)
 */
export class ThemeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  primaryColor: string;

  @ApiProperty()
  secondaryColor: string;

  @ApiProperty()
  backgroundColor: string;

  @ApiProperty()
  surfaceColor: string;

  @ApiProperty()
  textPrimaryColor: string;

  @ApiProperty()
  textSecondaryColor: string;

  @ApiProperty()
  fontFamily: string;

  @ApiProperty()
  baseFontSize: number;

  @ApiProperty()
  baseSpacing: number;

  @ApiProperty()
  borderRadius: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  previewImageUrl?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * DTO for tenant theme response (includes customizations)
 */
export class TenantThemeResponseDto extends ThemeResponseDto {
  @ApiProperty({ description: 'Base theme ID' })
  baseThemeId: string;

  @ApiPropertyOptional({ description: 'Custom overrides applied' })
  customizations?: Partial<CustomizeThemeDto>;

  @ApiPropertyOptional()
  appliedAt?: Date;
}
