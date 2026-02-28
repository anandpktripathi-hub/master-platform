import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Max,
  Min,
} from 'class-validator';

export class GetAuditLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  actionPrefix?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  @IsIn(['success', 'failure', 'pending'])
  status?: 'success' | 'failure' | 'pending';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
