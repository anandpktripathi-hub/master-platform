import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { MarketplaceService, InstallPluginDto } from './marketplace.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
    sub?: string;
    _id?: string;
  };
}

@Controller('marketplace')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

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
  async installPlugin(@Req() req: AuthRequest, @Body() dto: InstallPluginDto) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new Error('Tenant or user ID not found in auth context');
    }

    return this.marketplace.installPlugin(
      String(tenantId),
      String(userId),
      dto,
    );
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
  async listTenantInstalls(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return this.marketplace.listTenantInstalls(String(tenantId));
  }

  /**
   * Enable or disable a plugin for the current tenant.
   */
  @Post('toggle')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async togglePlugin(
    @Req() req: AuthRequest,
    @Body() body: { pluginId: string; enabled: boolean },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return this.marketplace.togglePlugin(
      String(tenantId),
      body.pluginId,
      body.enabled,
    );
  }

  /**
   * Uninstall a plugin from the current tenant.
   */
  @Delete('installs/:pluginId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async uninstallPlugin(
    @Req() req: AuthRequest,
    @Param('pluginId') pluginId: string,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return this.marketplace.uninstallPlugin(String(tenantId), pluginId);
  }
}
