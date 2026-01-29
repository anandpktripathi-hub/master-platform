import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsObject()
  content!: any;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}
