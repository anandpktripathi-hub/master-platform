import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { MetricsService } from './metrics.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  MetricsJsonResponseDto,
  ResetMetricsResponseDto,
} from './dto/metrics.dto';
@ApiTags('Metrics')
@ApiBearerAuth('bearer')
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get application metrics in JSON format
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get application metrics (JSON)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getMetrics(): MetricsJsonResponseDto {
    try {
      return this.metricsService.getMetricsJson();
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getMetrics] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Get metrics in Prometheus format
   */
  @Get('prometheus')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get application metrics (Prometheus text)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getPrometheusMetrics(): string {
    try {
      return this.metricsService.getPrometheusText();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPrometheusMetrics] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Reset metrics (admin only in production)
   */
  @Get('reset')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Reset application metrics' })
  @ApiResponse({ status: 200, description: 'Success', type: ResetMetricsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  resetMetrics(): ResetMetricsResponseDto {
    try {
      this.metricsService.reset();
      return { message: 'Metrics reset successfully' };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[resetMetrics] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}

