import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import type { SaasOverviewResponse } from './dto/saas-overview.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Analytics')
@ApiBearerAuth('bearer')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Global SaaS overview for platform super admins.
   * Exposes tenant/user/billing KPIs and a 12‑month revenue series
   * for use in the super admin dashboard.
   */
  @Get('saas-overview')
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get SaaS overview (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSaasOverview(): Promise<SaasOverviewResponse> {
    try {
      return await this.analyticsService.getSaasOverview();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getSaasOverview] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get SaaS overview');
    }
  }
}
