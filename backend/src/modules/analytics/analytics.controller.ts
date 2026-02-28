import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import type { SaasOverviewResponse } from './dto/saas-overview.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Analytics')
@ApiBearerAuth('bearer')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Global SaaS overview for platform super admins.
   * Exposes tenant/user/billing KPIs and a 12‑month revenue series
   * for use in the super admin dashboard.
   */
  @Get('saas-overview')
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  async getSaasOverview(): Promise<SaasOverviewResponse> {
    return this.analyticsService.getSaasOverview();
  }
}
