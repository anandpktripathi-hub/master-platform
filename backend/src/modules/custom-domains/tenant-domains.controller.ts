import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CustomDomainService } from './services/custom-domain.service';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    tenantId?: string;
    sub?: string;
    _id?: string;
  };
}

@Controller('domains/tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantDomainsController {
  constructor(private readonly customDomainService: CustomDomainService) {}

  /**
   * Get domain & SSL health summary for the current tenant to power
   * the "My Domains / My URLs / SSL Health" dashboard view.
   */
  @Get('health-summary')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async getHealthSummary(@Req() req: AuthRequest): Promise<unknown> {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return await this.customDomainService.getTenantDomainHealthSummary(
      String(tenantId),
    );
  }

  /**
   * List all custom domains for the current tenant with lifecycle state.
   */
  @Get('list')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  async listDomains(@Req() req: AuthRequest): Promise<unknown> {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    return await this.customDomainService.listForTenant(String(tenantId));
  }

  /**
   * Retry DNS verification for a specific domain.
   */
  @Post(':domainId/verify-dns')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async retryVerifyDns(
    @Param('domainId') domainId: string,
    @Req() req: AuthRequest,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    const verified = await this.customDomainService.verifyDomainOwnership(
      domainId,
      String(tenantId),
    );

    return { verified };
  }

  /**
   * Manually trigger or retry SSL certificate issuance for a verified domain.
   */
  @Post(':domainId/issue-ssl')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  async issueSsl(
    @Param('domainId') domainId: string,
    @Req() req: AuthRequest,
    @Body() body: { provider?: 'acme' | 'manual' },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID not found in auth context');
    }

    const provider: 'acme' | undefined =
      body.provider === 'acme' ? 'acme' : undefined;

    const updated = await this.customDomainService.issueSslCertificate(
      domainId,
      String(tenantId),
      provider,
    );

    return updated;
  }
}
