import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Simple liveness probe - returns 200 if service is running
   */
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  async check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Detailed health check - tests all dependencies
   */
  @Get('detailed')
  @ApiOperation({ summary: 'Detailed dependency health check' })
  async detailedCheck(): Promise<any> {
    try {
      return await this.healthService.checkAll();
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Health check failed');
    }
  }

  /**
   * Readiness probe - returns 200 if service is ready to serve traffic
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    let health: any;
    try {
      health = await this.healthService.checkAll();
    } catch (err) {
      // Keep readiness response shape stable; callers can interpret status.
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks: {},
      };
    }
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
