import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CmsAnalyticsPageIdParamDto {
  @ApiProperty({ description: 'CMS page id' })
  @IsString()
  @IsNotEmpty()
  pageId!: string;
}

export class CmsAnalyticsDateRangeQueryDto {
  @ApiPropertyOptional({
    description: 'Start date (ISO-8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date (ISO-8601)',
    example: '2026-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}

export class CmsAnalyticsDaysQueryDto {
  @ApiPropertyOptional({ description: 'Lookback window in days', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;
}

export class CmsAnalyticsTrackViewBodyDto {
  @ApiPropertyOptional({
    description: 'Optional metadata payload for the view event',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CmsAnalyticsRecordConversionBodyDto {
  @ApiProperty({ description: 'Conversion type identifier', example: 'signup' })
  @IsString()
  @IsNotEmpty()
  conversionType!: string;
}
