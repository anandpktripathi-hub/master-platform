import { Injectable } from '@nestjs/common';
import { MetricsMiddleware } from '../common/middleware/metrics.middleware';
import type { MetricDataDto, MetricsJsonResponseDto } from './dto/metrics.dto';

@Injectable()
export class MetricsService {
  private computeAvgResponseTime(metrics: MetricDataDto): number {
    if (metrics.totalRequests <= 0) return 0;
    return metrics.totalResponseTime / metrics.totalRequests;
  }

  getMetricsJson(): MetricsJsonResponseDto {
    const metrics = MetricsMiddleware.getMetrics() as unknown as MetricDataDto;
    const avgResponseTime = this.computeAvgResponseTime(metrics);

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      requests: {
        total: metrics.totalRequests,
        byMethod: metrics.requestsByMethod,
        byPath: metrics.requestsByPath,
      },
      responses: {
        byStatus: metrics.responsesByStatus,
        avgResponseTime: Math.round(avgResponseTime),
        maxResponseTime: metrics.maxResponseTime === 0 ? 0 : metrics.maxResponseTime,
        minResponseTime: metrics.minResponseTime === Infinity ? 0 : metrics.minResponseTime,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }

  getPrometheusText(): string {
    const metrics = MetricsMiddleware.getMetrics() as unknown as MetricDataDto;
    const avgResponseTime = this.computeAvgResponseTime(metrics);

    const lines: string[] = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
      `http_requests_total ${metrics.totalRequests}`,
      '',
      '# HELP http_request_duration_ms HTTP request duration in milliseconds',
      '# TYPE http_request_duration_ms gauge',
      `http_request_duration_ms{quantile="avg"} ${Math.round(avgResponseTime)}`,
      `http_request_duration_ms{quantile="max"} ${metrics.maxResponseTime === 0 ? 0 : metrics.maxResponseTime}`,
      `http_request_duration_ms{quantile="min"} ${metrics.minResponseTime === Infinity ? 0 : metrics.minResponseTime}`,
      '',
      '# HELP process_heap_bytes Process heap size in bytes',
      '# TYPE process_heap_bytes gauge',
      `process_heap_bytes ${process.memoryUsage().heapUsed}`,
      '',
      '# HELP process_uptime_seconds Process uptime in seconds',
      '# TYPE process_uptime_seconds counter',
      `process_uptime_seconds ${Math.round(process.uptime())}`,
    ];

    for (const [status, count] of Object.entries(metrics.responsesByStatus)) {
      lines.push(`http_responses_total{status="${status}"} ${count}`);
    }

    return lines.join('\n');
  }

  reset(): void {
    MetricsMiddleware.resetMetrics();
  }
}
