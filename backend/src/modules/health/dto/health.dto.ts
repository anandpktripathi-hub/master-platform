import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class HealthLivenessResponseDto {
  @ApiProperty({ enum: ['ok'] })
  @IsIn(['ok'])
  status!: 'ok';

  @ApiProperty({ description: 'ISO timestamp' })
  @IsString()
  timestamp!: string;
}

export class HealthCheckDto {
  @ApiProperty({ enum: ['up', 'down'] })
  @IsIn(['up', 'down'])
  status!: 'up' | 'down';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class HealthReportDto {
  @ApiProperty({ enum: ['healthy', 'degraded', 'unhealthy'] })
  @IsIn(['healthy', 'degraded', 'unhealthy'])
  status!: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({ description: 'ISO timestamp' })
  @IsString()
  timestamp!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  checks!: Record<string, unknown>;
}

export class HealthReadyCheckDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  [key: string]: any;
}

export class HealthReadyResponseDto {
  @ApiProperty({ enum: ['ready', 'not_ready'] })
  @IsIn(['ready', 'not_ready'])
  status!: 'ready' | 'not_ready';

  @ApiProperty({ description: 'ISO timestamp' })
  @IsString()
  timestamp!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  checks!: Record<string, HealthReadyCheckDto>;
}
