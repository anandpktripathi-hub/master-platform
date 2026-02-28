import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { DeveloperPortalService } from './developer-portal.service';
import type { Request } from 'express';
import { Tenant } from '../../decorators/tenant.decorator';
import { CreateApiKeyDto, ListWebhookLogsQueryDto } from './dto/developer-portal.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
    sub?: string;
    _id?: string;
    role?: string;
  };
}
@ApiTags('Developer Portal')
@ApiBearerAuth('bearer')
@Controller('developer')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class DeveloperPortalController {
  constructor(private readonly devPortal: DeveloperPortalService) {}

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

    // Prevent tenant spoofing via headers for non-platform users.
    if (!this.isPlatformAdmin(req) && userTenantId && effectiveTenantId !== userTenantId) {
      throw new ForbiddenException('Cross-tenant access is not allowed');
    }

    return { tenantId: String(effectiveTenantId), userId: String(userId) };
  }

  /**
   * Create a new API key for the current tenant.
   */
  @Post('api-keys')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async createApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() dto: CreateApiKeyDto,
  ) {
    const { tenantId, userId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.devPortal.createApiKey(tenantId, userId, {
      name: dto.name,
      scopes: dto.scopes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  /**
   * List all API keys for the current tenant.
   */
  @Get('api-keys')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async listApiKeys(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.devPortal.listApiKeys(tenantId);
  }

  /**
   * Revoke (deactivate) an API key.
   */
  @Post('api-keys/:keyId/revoke')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async revokeApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('keyId') keyId: string,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    await this.devPortal.revokeApiKey(tenantId, keyId);
    return { success: true };
  }

  /**
   * Delete an API key permanently.
   */
  @Delete('api-keys/:keyId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async deleteApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('keyId') keyId: string,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    await this.devPortal.deleteApiKey(tenantId, keyId);
    return { success: true };
  }

  /**
   * List webhook delivery logs for the current tenant.
   */
  @Get('webhook-logs')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async listWebhookLogs(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: ListWebhookLogsQueryDto,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.devPortal.listWebhookDeliveryLogs(tenantId, {
      limit: query.limit,
      skip: query.skip,
      event: query.event,
      status: query.status,
    });
  }

  /**
   * Get detailed webhook delivery log by ID.
   */
  @Get('webhook-logs/:logId')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async getWebhookLog(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param('logId') logId: string,
  ) {
    const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
    return this.devPortal.getWebhookDeliveryLog(tenantId, logId);
  }
}
