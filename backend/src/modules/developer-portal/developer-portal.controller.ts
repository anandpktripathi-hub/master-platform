import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Delete,
  Body,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiKeyIdParamDto,
  WebhookLogIdParamDto,
} from './dto/developer-portal-params.dto';

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
  private readonly logger = new Logger(DeveloperPortalController.name);

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
  @ApiOperation({ summary: 'Create an API key for the current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Body() dto: CreateApiKeyDto,
  ) {
    try {
      const { tenantId, userId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.devPortal.createApiKey(tenantId, userId, {
        name: dto.name,
        scopes: dto.scopes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createApiKey] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create API key');
    }
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
  @ApiOperation({ summary: 'List API keys for the current tenant' })
  @ApiResponse({ status: 200, description: 'API keys returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listApiKeys(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.devPortal.listApiKeys(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listApiKeys] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list API keys');
    }
  }

  /**
   * Revoke (deactivate) an API key.
   */
  @Post('api-keys/:keyId/revoke')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Revoke (deactivate) an API key' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async revokeApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: ApiKeyIdParamDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      await this.devPortal.revokeApiKey(tenantId, params.keyId);
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[revokeApiKey] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to revoke API key');
    }
  }

  /**
   * Delete an API key permanently.
   */
  @Delete('api-keys/:keyId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Delete an API key permanently' })
  @ApiResponse({ status: 200, description: 'API key deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteApiKey(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: ApiKeyIdParamDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      await this.devPortal.deleteApiKey(tenantId, params.keyId);
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteApiKey] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete API key');
    }
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
  @ApiOperation({ summary: 'List webhook delivery logs for the current tenant' })
  @ApiResponse({ status: 200, description: 'Webhook logs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listWebhookLogs(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Query() query: ListWebhookLogsQueryDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.devPortal.listWebhookDeliveryLogs(tenantId, {
        limit: query.limit,
        skip: query.skip,
        event: query.event,
        status: query.status,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listWebhookLogs] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list webhook logs');
    }
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
  @ApiOperation({ summary: 'Get webhook delivery log by id for the current tenant' })
  @ApiResponse({ status: 200, description: 'Webhook log returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getWebhookLog(
    @Req() req: AuthRequest,
    @Tenant() tenantIdFromContext: string | undefined,
    @Param() params: WebhookLogIdParamDto,
  ) {
    try {
      const { tenantId } = this.getTenantAndUser(req, tenantIdFromContext);
      return await this.devPortal.getWebhookDeliveryLog(tenantId, params.logId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getWebhookLog] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch webhook log');
    }
  }
}
