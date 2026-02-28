import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { InstallPluginDto, TogglePluginDto } from './dto/marketplace.dto';
import { PluginIdParamDto } from './dto/plugin-id-param.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  private readonly logger = new Logger(MarketplaceController.name);

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
  @ApiOperation({ summary: 'List available marketplace plugins' })
  @ApiResponse({ status: 200, description: 'Plugins returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listAvailablePlugins() {
    try {
      return await this.marketplace.listAvailablePlugins();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listAvailablePlugins] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list marketplace plugins');
    }
  }

  /**
   * Install a plugin for the current tenant.
   */
  @Post('install')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Install a plugin for the current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async installPlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() dto: InstallPluginDto,
  ) {
    try {
      const { tenantId, userId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.marketplace.installPlugin(tenantId, userId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[installPlugin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to install plugin');
    }
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
  @ApiOperation({ summary: 'List plugins installed by the current tenant' })
  @ApiResponse({ status: 200, description: 'Installs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTenantInstalls(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.marketplace.listTenantInstalls(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listTenantInstalls] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list tenant installs');
    }
  }

  /**
   * Enable or disable a plugin for the current tenant.
   */
  @Post('toggle')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Enable or disable a plugin for the current tenant' })
  @ApiResponse({ status: 200, description: 'Plugin toggled' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async togglePlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() body: TogglePluginDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.marketplace.togglePlugin(
        tenantId,
        body.pluginId,
        body.enabled,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[togglePlugin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to toggle plugin');
    }
  }

  /**
   * Uninstall a plugin from the current tenant.
   */
  @Delete('installs/:pluginId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Uninstall a plugin from the current tenant' })
  @ApiResponse({ status: 200, description: 'Plugin uninstalled' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async uninstallPlugin(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: PluginIdParamDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.marketplace.uninstallPlugin(tenantId, params.pluginId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[uninstallPlugin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to uninstall plugin');
    }
  }
}
