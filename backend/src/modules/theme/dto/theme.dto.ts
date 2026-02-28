import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsObject()
  colors!: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsObject()
  colors?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

