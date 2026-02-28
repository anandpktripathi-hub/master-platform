import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { CrmService } from './crm.service';
import { TenantsService } from '../tenants/tenants.service';
import { PublicContactFormDto } from './dto/public-forms.dto';

@ApiTags('Public')
@Controller('public/forms')
export class PublicFormsController {
  private readonly logger = new Logger(PublicFormsController.name);

  constructor(
    private readonly crmService: CrmService,
    private readonly tenantsService: TenantsService,
  ) {}

  private extractTenantId(tenant: unknown): string {
    if (!tenant || typeof tenant !== 'object') {
      throw new BadRequestException('Tenant host is invalid or unrecognized.');
    }

    const record = tenant as Record<string, unknown>;
    const idValue = record['_id'] ?? record['id'];
    if (!idValue) {
      throw new BadRequestException('Tenant host is invalid or unrecognized.');
    }

    if (typeof idValue === 'string') return idValue;
    if (
      typeof idValue === 'number' ||
      typeof idValue === 'bigint' ||
      typeof idValue === 'boolean'
    ) {
      return String(idValue);
    }

    if (typeof idValue === 'object') {
      const toStringValue = (
        idValue as { toString?: () => unknown }
      ).toString?.();
      if (
        typeof toStringValue === 'string' &&
        toStringValue !== '[object Object]'
      ) {
        return toStringValue;
      }
    }

    throw new BadRequestException('Tenant host is invalid or unrecognized.');
  }

  private normalizeHostForTenantLookup(hostRaw: string): string {
    const host = String(hostRaw).trim();

    // Strip port if present (e.g. example.com:3000). Leave IPv6 bracketed hosts intact.
    if (host.startsWith('[')) {
      const end = host.indexOf(']');
      return end > 0 ? host.slice(1, end) : host;
    }

    const colonIndex = host.indexOf(':');
    return colonIndex > 0 ? host.slice(0, colonIndex) : host;
  }

  private async resolveTenantIdFromRequest(req: Request): Promise<string> {
    const headerTenantRaw =
      req.headers['x-tenant-id'] || req.headers['x-workspace-id'];
    const headerTenant = Array.isArray(headerTenantRaw)
      ? headerTenantRaw[0]
      : headerTenantRaw;

    const hostRaw =
      (req.headers['x-tenant-host'] as string | undefined) ||
      req.headers.host ||
      (req.hostname as string | undefined);

    // Public endpoints must be host-scoped (prevents cross-tenant writes by guessing IDs).
    // Header-based tenant selection is treated as an optional consistency check only.
    if (!hostRaw) {
      throw new BadRequestException(
        'Tenant context missing. Public endpoints require a tenant host (Host header or x-tenant-host).',
      );
    }

    const normalizedHost = this.normalizeHostForTenantLookup(String(hostRaw));
    const byHost =
      await this.tenantsService.resolveTenantByHost(normalizedHost);
    if (!byHost) {
      throw new BadRequestException('Tenant host is invalid or unrecognized.');
    }

    const hostTenantId = this.extractTenantId(byHost);

    if (headerTenant) {
      const byHeader = await this.tenantsService.resolveTenantById(
        String(headerTenant),
      );
      if (byHeader) {
        const headerTenantId = this.extractTenantId(byHeader);
        if (headerTenantId !== hostTenantId) {
          throw new BadRequestException('Tenant context mismatch');
        }
      }
    }

    return hostTenantId;
  }

  @Public()
  @UseGuards(RateLimitGuard)
  @Post('contact')
  @ApiOperation({ summary: 'Submit public contact form (host-scoped tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async contact(@Req() req: Request, @Body() body: PublicContactFormDto) {
    try {
      const tenantId = await this.resolveTenantIdFromRequest(req);
      return await this.crmService.createLeadFromPublicContactForm(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[contact] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to submit contact form');
    }
  }
}
