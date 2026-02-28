import { IsInt, IsMongoId, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CmsTemplateIdParamDto {
  @IsMongoId()
  id!: string;
}

export class CmsTemplateCategoryParamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category!: string;
}

export class CmsTemplatesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}

export class CmsTemplatesPopularQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CmsTemplateUseBodyDto {
  @IsString()
  @MinLength(1)
  pageName!: string;
}
