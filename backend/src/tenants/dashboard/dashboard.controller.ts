import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('tenant/dashboard')
@UseGuards(TenantGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req: any) {
    const { tenantId, role, roles, _id, id } = req.user || {};
    return this.dashboardService.getDashboardForTenant(tenantId, {
      id: id ?? _id,
      role,
      roles,
    });
  }
}
