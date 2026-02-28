import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class OrdersDashboardStatsQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
