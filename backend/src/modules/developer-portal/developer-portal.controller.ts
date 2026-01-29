import {
  Controller,
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
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  DeveloperPortalService,
  CreateApiKeyDto,
} from './developer-portal.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
    sub?: string;
    _id?: string;
  };
}

@Controller('developer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeveloperPortalController {
  constructor(private readonly devPortal: DeveloperPortalService) {}

  private getTenantAndUser(req: AuthRequest): {
    tenantId: string;
    userId: string;
  } {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) {
      throw new Error('Tenant or user ID not found in auth context');
    }
    return { tenantId: String(tenantId), userId: String(userId) };
  }

  /**
   * Create a new API key for the current tenant.
   */
  @Post('api-keys')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async createApiKey(@Req() req: AuthRequest, @Body() dto: CreateApiKeyDto) {
    const { tenantId, userId } = this.getTenantAndUser(req);
    return this.devPortal.createApiKey(tenantId, userId, dto);
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
  async listApiKeys(@Req() req: AuthRequest) {
    const { tenantId } = this.getTenantAndUser(req);
    return this.devPortal.listApiKeys(tenantId);
  }

  /**
   * Revoke (deactivate) an API key.
   */
  @Post('api-keys/:keyId/revoke')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async revokeApiKey(@Req() req: AuthRequest, @Param('keyId') keyId: string) {
    const { tenantId } = this.getTenantAndUser(req);
    await this.devPortal.revokeApiKey(tenantId, keyId);
    return { success: true };
  }

  /**
   * Delete an API key permanently.
   */
  @Delete('api-keys/:keyId')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async deleteApiKey(@Req() req: AuthRequest, @Param('keyId') keyId: string) {
    const { tenantId } = this.getTenantAndUser(req);
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
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('event') event?: string,
    @Query('status') status?: string,
  ) {
    const { tenantId } = this.getTenantAndUser(req);
    return this.devPortal.listWebhookDeliveryLogs(tenantId, {
      limit: limit ? +limit : undefined,
      skip: skip ? +skip : undefined,
      event,
      status,
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
  async getWebhookLog(@Req() req: AuthRequest, @Param('logId') logId: string) {
    const { tenantId } = this.getTenantAndUser(req);
    return this.devPortal.getWebhookDeliveryLog(tenantId, logId);
  }
}
