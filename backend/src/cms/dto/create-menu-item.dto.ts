import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  label!: string;

  @IsString()
  url!: string;

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
