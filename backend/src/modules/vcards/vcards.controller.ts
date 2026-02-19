import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { VcardsService } from './vcards.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';

@Controller()
export class VcardsController {
  constructor(private readonly vcardsService: VcardsService) {}

  // Tenant-admin endpoints
  @Get('vcards')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  listTenantVcards(@Tenant() tenantId: string) {
    return this.vcardsService.listForTenant(tenantId);
  }

  @Post('vcards')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  createTenantVcard(@Tenant() tenantId: string, @Body() body: any) {
    return this.vcardsService.createForTenant(tenantId, body);
  }

  @Put('vcards/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  updateTenantVcard(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.vcardsService.updateForTenant(tenantId, id, body);
  }

  @Delete('vcards/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
  @Roles('tenant_admin', 'TENANT_ADMIN', 'PLATFORM_SUPERADMIN')
  deleteTenantVcard(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.vcardsService.deleteForTenant(tenantId, id);
  }

  // Public read-only endpoint
  @Get('public/vcards/:id')
  getPublicVcard(@Param('id') id: string) {
    return this.vcardsService.getPublicVcard(id);
  }
}
