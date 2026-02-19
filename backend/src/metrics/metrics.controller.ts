import { Controller, Get } from '@nestjs/common';
import { MetricsMiddleware } from '../common/middleware/metrics.middleware';

@Controller('metrics')
export class MetricsController {
  /**
   * Get application metrics in JSON format
   */
  @Get()
  getMetrics() {
    const metrics = MetricsMiddleware.getMetrics();
    const avgResponseTime =
      metrics.totalRequests > 0
        ? metrics.totalResponseTime / metrics.totalRequests
        : 0;

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
        maxResponseTime:
          metrics.maxResponseTime === 0 ? 0 : metrics.maxResponseTime,
        minResponseTime:
          metrics.minResponseTime === Infinity ? 0 : metrics.minResponseTime,
      },
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }

  /**
   * Get metrics in Prometheus format
   */
  @Get('prometheus')
  getPrometheusMetrics() {
    const metrics = MetricsMiddleware.getMetrics();
    const avgResponseTime =
      metrics.totalRequests > 0
        ? metrics.totalResponseTime / metrics.totalRequests
        : 0;

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

    // Add per-status metrics
    Object.entries(metrics.responsesByStatus).forEach(([status, count]) => {
      lines.push(`http_responses_total{status="${status}"} ${count}`);
    });

    return lines.join('\n');
  }

  /**
   * Reset metrics (admin only in production)
   */
  @Get('reset')
  resetMetrics() {
    MetricsMiddleware.resetMetrics();
    return { message: 'Metrics reset successfully' };
  }
}
