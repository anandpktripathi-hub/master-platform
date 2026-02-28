import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { CustomDomainService } from './services/custom-domain.service';
import { objectIdToString } from '../../common/utils/objectid.util';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateCustomDomainDto,
  UpdateCustomDomainDto,
} from './dto/custom-domain.dto';
@ApiTags('Custom Domains')
@ApiBearerAuth('bearer')
@Controller('custom-domains')
export class CustomDomainController {
  constructor(private customDomainService: CustomDomainService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's custom domains
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async getTenantCustomDomains(
    @Tenant() tenantId: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.customDomainService.getCustomDomainsForTenant(
      objectIdToString(tenantId),
      {
        status,
        limit: limit ? parseInt(limit) : undefined,
        skip: skip ? parseInt(skip) : undefined,
      },
    );
  }

  /**
   * Request a custom domain for tenant
   */
  @Post('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async requestCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Body() createDto: CreateCustomDomainDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.customDomainService.requestCustomDomain(
      objectIdToString(tenantId),
      createDto,
      userId,
    );
  }

  /**
   * Verify domain ownership
   */
  @Post('me/:domainId/verify')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async verifyDomainOwnership(
    @Tenant() tenantId: string,
    @Param('domainId') domainId: string,
  ) {
    const verified = await this.customDomainService.verifyDomainOwnership(
      domainId,
      objectIdToString(tenantId),
    );
    return { verified, domainId };
  }

  /**
   * Get SSL certificate for verified domain
   */
  @Post('me/:domainId/ssl/issue')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async issueSslCertificate(
    @Tenant() tenantId: string,
    @Param('domainId') domainId: string,
  ) {
    return this.customDomainService.issueSslCertificate(
      domainId,
      objectIdToString(tenantId),
    );
  }

  /**
   * Set custom domain as primary
   */
  @Post('me/:domainId/primary')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async setPrimaryCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Param('domainId') domainId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.customDomainService.setPrimaryDomain(
      domainId,
      objectIdToString(tenantId),
      userId,
    );
  }

  /**
   * Update custom domain
   */
  @Patch('me/:domainId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async updateCustomDomain(
    @Tenant() tenantId: string,
    @Param('domainId') domainId: string,
    @Body() updateDto: UpdateCustomDomainDto,
  ) {
    const domain = await this.customDomainService.getCustomDomainsForTenant(
      objectIdToString(tenantId),
    );
    const targetDomain = domain.data.find((d) => d._id === domainId);
    if (!targetDomain) {
      throw new BadRequestException('Domain not found or not authorized');
    }
    // For now, only notes can be updated by tenant
    // Other fields are admin-only
    if (updateDto.notes !== undefined) {
      // Use service method to update
      return this.customDomainService.updateCustomDomain(
        domainId,
        objectIdToString(tenantId),
        updateDto,
      );
    }
    throw new BadRequestException('Unauthorized');
  }

  /**
   * Delete custom domain
   */
  @Delete('me/:domainId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(204)
  async deleteCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Param('domainId') domainId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    await this.customDomainService.deleteCustomDomain(
      domainId,
      objectIdToString(tenantId),
      userId,
    );
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * Get all custom domains (admin)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async getAllCustomDomains(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.customDomainService.getAllCustomDomains({
      tenantId,
      status,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  /**
   * Activate custom domain (admin)
   */
  @Post(':domainId/activate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async activateCustomDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;

    // Get domain to find tenantId - using service method instead of direct model access
    const domains = await this.customDomainService.getAllCustomDomains({});
    const domain = domains.data.find((d) => {
      const idStr = objectIdToString(d._id);
      return idStr === domainId;
    });

    if (!domain) {
      throw new BadRequestException('Domain not found');
    }

    return this.customDomainService.activateDomain(
      domainId,
      objectIdToString(domain.tenantId),
      userId,
    );
  }

  /**
   * Update custom domain (admin)
   */
  @Patch(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async updateCustomDomainAdmin(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
    @Body() updateDto: UpdateCustomDomainDto,
  ) {
    // Get domain to validate it exists
    const domains = await this.customDomainService.getAllCustomDomains({});
    const domain = domains.data.find((d) => {
      const idStr = objectIdToString(d._id);
      return idStr === domainId;
    });

    if (!domain) {
      throw new BadRequestException('Domain not found');
    }

    // Update through service method
    return this.customDomainService.updateCustomDomain(
      domainId,
      objectIdToString(domain.tenantId),
      updateDto,
    );
  }
}
