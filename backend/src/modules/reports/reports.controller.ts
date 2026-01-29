import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ReportsService } from './reports.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
    roles?: string[];
    role?: string;
  };
}

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  private getTenantIdFromRequest(req: AuthRequest): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }
    return String(tenantId);
  }

  @Get('tenant/financial')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async getTenantFinancial(@Req() req: AuthRequest) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.reports.getTenantFinancialReport(tenantId);
  }

  @Get('tenant/commerce')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async getTenantCommerce(@Req() req: AuthRequest) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.reports.getTenantCommerceReport(tenantId);
  }

  @Get('tenant/traffic')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async getTenantTraffic(@Req() req: AuthRequest) {
    const tenantId = this.getTenantIdFromRequest(req);
    return this.reports.getTenantTrafficReport(tenantId);
  }
}
