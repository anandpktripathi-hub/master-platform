import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Simple liveness probe - returns 200 if service is running
   */
  @Get()
  async check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Detailed health check - tests all dependencies
   */
  @Get('detailed')
  async detailedCheck(): Promise<any> {
    return this.healthService.checkAll();
  }

  /**
   * Readiness probe - returns 200 if service is ready to serve traffic
   */
  @Get('ready')
  async ready() {
    const health = await this.healthService.checkAll();
    // Readiness should only depend on core dependencies needed to serve traffic.
    // Memory pressure is useful diagnostic info, but should not make the service "not ready".
    const requiredChecks: Array<keyof typeof health.checks> = [
      'database',
      'storage',
    ];

    const isReady = requiredChecks.every(
      (key) => health.checks?.[key]?.status === 'up',
    );

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: health.checks,
    };
  }
}
