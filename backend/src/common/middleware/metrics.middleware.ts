import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface MetricData {
  totalRequests: number;
  requestsByMethod: Record<string, number>;
  requestsByPath: Record<string, number>;
  responsesByStatus: Record<string, number>;
  totalResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
}

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private static metrics: MetricData = {
    totalRequests: 0,
    requestsByMethod: {},
    requestsByPath: {},
    responsesByStatus: {},
    totalResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
  };

  static getMetrics(): MetricData {
    return { ...this.metrics };
  }

  static resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: {},
      requestsByPath: {},
      responsesByStatus: {},
      totalResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Track request
    MetricsMiddleware.metrics.totalRequests++;
    MetricsMiddleware.metrics.requestsByMethod[req.method] =
      (MetricsMiddleware.metrics.requestsByMethod[req.method] || 0) + 1;
    MetricsMiddleware.metrics.requestsByPath[req.path] =
      (MetricsMiddleware.metrics.requestsByPath[req.path] || 0) + 1;

    // Track response
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode.toString();

      MetricsMiddleware.metrics.responsesByStatus[status] =
        (MetricsMiddleware.metrics.responsesByStatus[status] || 0) + 1;
      MetricsMiddleware.metrics.totalResponseTime += duration;
      MetricsMiddleware.metrics.maxResponseTime = Math.max(
        MetricsMiddleware.metrics.maxResponseTime,
        duration,
      );
      MetricsMiddleware.metrics.minResponseTime = Math.min(
        MetricsMiddleware.metrics.minResponseTime,
        duration,
      );
    });

    next();
  }
}
