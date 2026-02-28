import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class HealthCheckDto {
  @IsIn(['up', 'down'])
  status!: 'up' | 'down';

  @IsOptional()
  @IsString()
  message?: string;
}

export class HealthReportDto {
  @IsIn(['healthy', 'degraded', 'unhealthy'])
  status!: 'healthy' | 'degraded' | 'unhealthy';

  @IsString()
  timestamp!: string;

  @IsObject()
  checks!: Record<string, unknown>;
}
