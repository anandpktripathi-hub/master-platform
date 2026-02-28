import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { MarketplaceService } from './marketplace.service';
import type { Request } from 'express';
import { Tenant } from '../../decorators/tenant.decorator';
import { InstallPluginDto, TenantIdQueryDto, TogglePluginDto } from './dto/marketplace.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
    sub?: string;
    _id?: string;
    role?: string;
  };
}
@ApiTags('Marketplace')
@ApiBearerAuth('bearer')
@Controller('marketplace')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  private normalizeRole(role: unknown) {
    return String(role || '').trim().toLowerCase();
  }

  private isPlatformAdmin(req: AuthRequest) {
    const role = this.normalizeRole(req.user?.role);
    return role === 'platform_super_admin' || role === 'platform_superadmin' || role === 'platform_admin';
  }

  private getTenantAndUser(
    req: AuthRequest,
    tenantIdFromContext: string | undefined,
  ): { tenantId: string; userId: string } {
    const userTenantId = req.user?.tenantId ? String(req.user.tenantId) : undefined;
    const userId = req.user?.sub || req.user?._id;
    if (!userId) {
      throw new BadRequestException('User ID not found in auth context');
    }

    const effectiveTenantId = tenantIdFromContext || userTenantId;
    if (!effectiveTenantId) {
      throw new BadRequestException('Tenant ID not found in request context');
    }

    if (!this.isPlatformAdmin(req) && userTenantId && effectiveTenantId !== userTenantId) {
      throw new ForbiddenException('Cross-tenant access is not allowed');
    }

    return { tenantId: String(effectiveTenantId), userId: String(userId) };
  }

  /**
   * List all available marketplace plugins.
   */
  @Get('plugins')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async listAvailablePlugins() {
    return this.marketplace.listAvailablePlugins();
  }

  /**
   * Install a plugin for the current tenant.
   */
  @Post('install')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async installPlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() dto: InstallPluginDto,
  ) {
    const { tenantId, userId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.marketplace.installPlugin(tenantId, userId, dto);
  }

  /**
   * List all plugins installed by the current tenant.
   */
  @Get('installs')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async listTenantInstalls(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.marketplace.listTenantInstalls(tenantId);
  }

  /**
   * Enable or disable a plugin for the current tenant.
   */
  @Post('toggle')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async togglePlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: TogglePluginDto,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.marketplace.togglePlugin(tenantId, body.pluginId, body.enabled);
  }

  /**
   * Uninstall a plugin from the current tenant.
   */
  @Delete('installs/:pluginId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async uninstallPlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('pluginId') pluginId: string,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.marketplace.uninstallPlugin(tenantId, pluginId);
  }
}
