import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ListWebhookLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsIn(['pending', 'success', 'failure'])
  status?: string;
}
