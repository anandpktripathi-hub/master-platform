import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsMongoId,
  IsObject,
} from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsOptional()
  previewImage?: string;

  @IsObject()
  @IsNotEmpty()
  cssVariables!: Record<string, string>;

  @IsIn(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateThemeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  previewImage?: string;

  @IsObject()
  @IsOptional()
  cssVariables?: Record<string, string>;

  @IsIn(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

export class SelectThemeDto {
  @IsMongoId()
  themeId!: string;
}

export class CustomizeThemeDto {
  @IsObject()
  @IsNotEmpty()
  customCssVariables!: Record<string, string>;
}

export class ThemeResponseDto {
  _id!: string;
  name!: string;
  key!: string;
  previewImage?: string;
  cssVariables!: Record<string, string>;
  status!: 'ACTIVE' | 'INACTIVE';
  createdAt!: Date;
  updatedAt!: Date;
}

export class TenantThemeResponseDto {
  _id!: string;
  tenantId!: string;
  themeId!: string;
  theme?: ThemeResponseDto; // Populated theme object
  customCssVariables!: Record<string, string>;
  mergedCssVariables!: Record<string, string>; // System defaults + tenant overrides
  createdAt!: Date;
  updatedAt!: Date;
}
