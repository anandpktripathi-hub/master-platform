import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async me(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return null;
    return this.tenantsService.getCurrentTenant(tenantId);
  }
}
