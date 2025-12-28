import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { objectIdToString } from '../../utils/objectIdToString';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ManualCreateTenantDto } from './dto/manual-create-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return null;
    }
    return this.tenantsService.getCurrentTenant(tenantId);
  }

  /**
   * Phase 3: Platform admin manually creates a tenant
   * POST /api/tenants/manual-create
   * Protected: platform_admin only
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('manual-create')
  async manualCreate(
    @Body() dto: ManualCreateTenantDto,
    @Req() req: { user?: { sub?: string; _id?: unknown } },
  ) {
    let adminId = req.user?.sub;
    if (!adminId && req.user?._id && typeof req.user._id === 'object') {
      adminId = objectIdToString(req.user._id);
    }
    if (!adminId) throw new BadRequestException('User ID is required');
    return this.tenantsService.manualCreateTenant(dto, adminId);
  }
}
