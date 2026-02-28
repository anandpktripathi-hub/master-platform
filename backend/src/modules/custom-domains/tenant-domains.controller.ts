import {
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { CustomDomainService } from './services/custom-domain.service';
import { IssueSslDto } from './dto/issue-ssl.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomDomainIdParamDto } from './dto/custom-domains-query.dto';
@ApiTags('Tenant Domains')
@ApiBearerAuth('bearer')
@Controller('domains/tenant')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class TenantDomainsController {
  private readonly logger = new Logger(TenantDomainsController.name);

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
  @ApiOperation({ summary: 'Get tenant domain & SSL health summary' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getHealthSummary(@Tenant() tenantId: string): Promise<unknown> {
    try {
      return await this.customDomainService.getTenantDomainHealthSummary(
        String(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getHealthSummary] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
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
  @ApiOperation({ summary: 'List tenant custom domains with lifecycle status' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listDomains(@Tenant() tenantId: string): Promise<unknown> {
    try {
      return await this.customDomainService.listForTenant(String(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listDomains] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Retry DNS verification for a specific domain.
   */
  @Post(':domainId/verify-dns')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Retry DNS verification for a tenant custom domain' })
  @ApiResponse({ status: 201, description: 'Verification retried' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async retryVerifyDns(
    @Param() params: CustomDomainIdParamDto,
    @Tenant() tenantId: string,
  ) {
    try {
      const verified = await this.customDomainService.verifyDomainOwnership(
        params.domainId,
        String(tenantId),
      );

      return { verified };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[retryVerifyDns] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Manually trigger or retry SSL certificate issuance for a verified domain.
   */
  @Post(':domainId/issue-ssl')
  @Roles('tenant_admin', 'admin', 'owner', 'platform_admin')
  @ApiOperation({ summary: 'Issue/retry SSL certificate issuance for a tenant custom domain' })
  @ApiResponse({ status: 201, description: 'Issuance requested' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async issueSsl(
    @Param() params: CustomDomainIdParamDto,
    @Tenant() tenantId: string,
    @Body() body: IssueSslDto,
  ) {
    try {
      const provider: 'acme' | undefined =
        body.provider === 'acme' ? 'acme' : undefined;

      const updated = await this.customDomainService.issueSslCertificate(
        params.domainId,
        String(tenantId),
        provider,
      );

      return updated;
    } catch (error) {
      const err = error as any;
      this.logger.error(`[issueSsl] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
