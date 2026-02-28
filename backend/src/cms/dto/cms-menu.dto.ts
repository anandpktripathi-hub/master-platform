import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CmsMenuIdParamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  menuId!: string;
}

export class CmsMenuItemIdParamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  menuId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  itemId!: string;
}

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  pageId?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  parentItemId?: string;

  @IsOptional()
  @IsArray()
  cssClasses?: string[];

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;
}

export class ReorderMenuItemDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsNumber()
  order!: number;
}

export class ReorderMenuItemsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderMenuItemDto)
  order!: ReorderMenuItemDto[];
}
