import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  HealthLivenessResponseDto,
  HealthReadyResponseDto,
  HealthReportDto,
} from './dto/health.dto';

class AllowAllGuard {
  canActivate() {
    return true;
  }
}

@ApiTags('Health')
@ApiBearerAuth('bearer')
@Controller('health')
@UseGuards(AllowAllGuard)
@Public()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  /**
   * Simple liveness probe - returns 200 if service is running
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async check(): Promise<HealthLivenessResponseDto> {
    try {
      return await this.healthService.liveness();
    } catch (error) {
      const err = error as any;
      this.logger.error(`[check] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Detailed health check - tests all dependencies
   */
  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed dependency health check' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async detailedCheck(): Promise<HealthReportDto> {
    try {
      return await this.healthService.checkAll();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[detailedCheck] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Readiness probe - returns 200 if service is ready to serve traffic
   */
  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async ready(): Promise<HealthReadyResponseDto> {
    try {
      let health: any;
      try {
        health = await this.healthService.checkAll();
      } catch {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(`[ready] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
