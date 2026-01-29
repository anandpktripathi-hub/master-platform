import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';
import { PageStatus, PageVisibility } from '../enums';

export class CreatePageDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsEnum(PageVisibility)
  visibility?: PageVisibility;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  allowedRoles?: string[];

  @IsOptional()
  @IsString()
  parentPageId?: string;

  @IsOptional()
  @IsObject()
  metaTags?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
  };

  @IsOptional()
  @IsObject()
  jsonLd?: any;

  @IsOptional()
  scheduledPublishAt?: Date;

  @IsOptional()
  scheduledUnpublishAt?: Date;
}
