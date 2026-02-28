import { ApiProperty } from '@nestjs/swagger';

export interface MetricDataDto {
  totalRequests: number;
  requestsByMethod: Record<string, number>;
  requestsByPath: Record<string, number>;
  responsesByStatus: Record<string, number>;
  totalResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
}

export interface MetricsJsonResponseDto {
  timestamp: string;
  uptime: number;
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byPath: Record<string, number>;
  };
  responses: {
    byStatus: Record<string, number>;
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
}

export class ResetMetricsResponseDto {
  @ApiProperty({ description: 'Result message' })
  message!: string;
}
