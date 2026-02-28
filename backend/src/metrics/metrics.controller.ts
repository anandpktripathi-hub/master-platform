import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { MetricsService } from './metrics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Metrics')
@ApiBearerAuth('bearer')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get application metrics in JSON format
   */
  @Get()
  getMetrics() {
    return this.metricsService.getMetricsJson();
  }

  /**
   * Get metrics in Prometheus format
   */
  @Get('prometheus')
  getPrometheusMetrics() {
    return this.metricsService.getPrometheusText();
  }

  /**
   * Reset metrics (admin only in production)
   */
  @Get('reset')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  resetMetrics() {
    this.metricsService.reset();
    return { message: 'Metrics reset successfully' };
  }
}

