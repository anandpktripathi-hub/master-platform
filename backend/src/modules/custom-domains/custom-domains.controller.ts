import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCustomDomainDto,
  UpdateCustomDomainDto,
} from './dto/custom-domain.dto';
import {
  CustomDomainIdParamDto,
  CustomDomainsAdminListQueryDto,
  CustomDomainsListQueryDto,
} from './dto/custom-domains-query.dto';
@ApiTags('Custom Domains')
@ApiBearerAuth('bearer')
@Controller('custom-domains')
export class CustomDomainController {
  private readonly logger = new Logger(CustomDomainController.name);

  constructor(private customDomainService: CustomDomainService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's custom domains
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: "Get current tenant's custom domains" })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantCustomDomains(
    @Tenant() tenantId: string,
    @Query() query?: CustomDomainsListQueryDto,
  ) {
    try {
      return await this.customDomainService.getCustomDomainsForTenant(
        objectIdToString(tenantId),
        {
          status: query?.status,
          limit: query?.limit,
          skip: query?.skip,
        },
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantCustomDomains] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Request a custom domain for tenant
   */
  @Post('me')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Request a custom domain for the current tenant' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async requestCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Body() createDto: CreateCustomDomainDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.customDomainService.requestCustomDomain(
        objectIdToString(tenantId),
        createDto,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[requestCustomDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Verify domain ownership
   */
  @Post('me/:domainId/verify')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Verify custom domain ownership (tenant)' })
  @ApiResponse({ status: 201, description: 'Verified' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async verifyDomainOwnership(
    @Tenant() tenantId: string,
    @Param() params: CustomDomainIdParamDto,
  ) {
    try {
      const verified = await this.customDomainService.verifyDomainOwnership(
        params.domainId,
        objectIdToString(tenantId),
      );
      return { verified, domainId: params.domainId };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[verifyDomainOwnership] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Get SSL certificate for verified domain
   */
  @Post('me/:domainId/ssl/issue')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Issue SSL certificate for verified custom domain (tenant)' })
  @ApiResponse({ status: 201, description: 'Issuance initiated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async issueSslCertificate(
    @Tenant() tenantId: string,
    @Param() params: CustomDomainIdParamDto,
  ) {
    try {
      return await this.customDomainService.issueSslCertificate(
        params.domainId,
        objectIdToString(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[issueSslCertificate] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Set custom domain as primary
   */
  @Post('me/:domainId/primary')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Set a tenant custom domain as primary' })
  @ApiResponse({ status: 201, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async setPrimaryCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Param() params: CustomDomainIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.customDomainService.setPrimaryDomain(
        params.domainId,
        objectIdToString(tenantId),
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[setPrimaryCustomDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Update custom domain
   */
  @Patch('me/:domainId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Update a tenant custom domain (limited fields)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCustomDomain(
    @Tenant() tenantId: string,
    @Param() params: CustomDomainIdParamDto,
    @Body() updateDto: UpdateCustomDomainDto,
  ) {
    try {
      const domain = await this.customDomainService.getCustomDomainsForTenant(
        objectIdToString(tenantId),
      );
      const targetDomain = domain.data.find((d) => d._id === params.domainId);
      if (!targetDomain) {
        throw new BadRequestException('Domain not found or not authorized');
      }
      if (updateDto.notes !== undefined) {
        return await this.customDomainService.updateCustomDomain(
          params.domainId,
          objectIdToString(tenantId),
          updateDto,
        );
      }
      throw new BadRequestException('Unauthorized');
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateCustomDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Delete custom domain
   */
  @Delete('me/:domainId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a tenant custom domain' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteCustomDomain(
    @Request() req: RequestWithUser,
    @Tenant() tenantId: string,
    @Param() params: CustomDomainIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      await this.customDomainService.deleteCustomDomain(
        params.domainId,
        objectIdToString(tenantId),
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteCustomDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
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
  @ApiOperation({ summary: 'List all custom domains (platform)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllCustomDomains(
    @Query() query?: CustomDomainsAdminListQueryDto,
  ) {
    try {
      return await this.customDomainService.getAllCustomDomains({
        tenantId: query?.tenantId,
        status: query?.status,
        limit: query?.limit,
        skip: query?.skip,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getAllCustomDomains] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Activate custom domain (admin)
   */
  @Post(':domainId/activate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Activate a custom domain (platform)' })
  @ApiResponse({ status: 201, description: 'Activated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async activateCustomDomain(
    @Request() req: RequestWithUser,
    @Param() params: CustomDomainIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;

      const domains = await this.customDomainService.getAllCustomDomains({});
      const domain = domains.data.find((d) => {
        const idStr = objectIdToString(d._id);
        return idStr === params.domainId;
      });

      if (!domain) {
        throw new BadRequestException('Domain not found');
      }

      return await this.customDomainService.activateDomain(
        params.domainId,
        objectIdToString(domain.tenantId),
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[activateCustomDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Update custom domain (admin)
   */
  @Patch(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update a custom domain (platform)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCustomDomainAdmin(
    @Request() req: RequestWithUser,
    @Param() params: CustomDomainIdParamDto,
    @Body() updateDto: UpdateCustomDomainDto,
  ) {
    try {
      const domains = await this.customDomainService.getAllCustomDomains({});
      const domain = domains.data.find((d) => {
        const idStr = objectIdToString(d._id);
        return idStr === params.domainId;
      });

      if (!domain) {
        throw new BadRequestException('Domain not found');
      }

      return await this.customDomainService.updateCustomDomain(
        params.domainId,
        objectIdToString(domain.tenantId),
        updateDto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateCustomDomainAdmin] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
