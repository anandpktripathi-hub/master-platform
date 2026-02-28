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
  Logger,
  HttpCode,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { objectIdToString } from '../../utils/objectIdToString';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { DomainService } from './services/domain.service';
import { DomainResellerService } from './services/domain-reseller.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateDomainDto,
  UpdateDomainDto,
  ListDomainsQueryDto,
} from './dto/domain.dto';
import { DomainIdParamDto } from './dto/domain-id-param.dto';
import { DomainAvailabilityQueryDto } from './dto/domain-availability-query.dto';
@ApiTags('Domains')
@ApiBearerAuth('bearer')
@Controller('domains')
export class DomainsController {
  private readonly logger = new Logger(DomainsController.name);

  constructor(
    private readonly domainService: DomainService,
    private readonly domainResellerService: DomainResellerService,
  ) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's domains
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current tenant's domains" })
  @ApiResponse({ status: 200, description: 'Domains returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantDomains(
    @Request() req: RequestWithUser,
    @Query() query: ListDomainsQueryDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in request');
      }
      return await this.domainService.getDomainsForTenant(
        objectIdToString(tenantId),
        query,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantDomains] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list tenant domains');
    }
  }

  /**
   * Create a domain for current tenant
   */
  @Post('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a domain for the current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createDomainForTenant(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateDomainDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.sub;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in request');
      }
      return await this.domainService.createDomain(
        objectIdToString(tenantId),
        createDto,
        objectIdToString(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createDomainForTenant] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create tenant domain');
    }
  }

  /**
   * Update a domain for current tenant
   */
  @Patch('me/:domainId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a domain for the current tenant' })
  @ApiResponse({ status: 200, description: 'Domain updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTenantDomain(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
    @Body() updateDto: UpdateDomainDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.sub;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in request');
      }
      return await this.domainService.updateDomain(
        objectIdToString(tenantId),
        params.domainId,
        updateDto,
        objectIdToString(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTenantDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update tenant domain');
    }
  }

  /**
   * Set domain as primary for current tenant
   */
  @Post('me/:domainId/primary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set a domain as primary for the current tenant' })
  @ApiResponse({ status: 200, description: 'Primary domain updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async setPrimaryDomain(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.sub;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in request');
      }
      return await this.domainService.setPrimaryDomain(
        objectIdToString(tenantId),
        params.domainId,
        objectIdToString(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[setPrimaryDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to set primary domain');
    }
  }

  /**
   * Delete a domain for current tenant
   */
  @Delete('me/:domainId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a domain for the current tenant' })
  @ApiResponse({ status: 204, description: 'Domain deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTenantDomain(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.sub;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in request');
      }
      await this.domainService.deleteDomain(
        objectIdToString(tenantId),
        params.domainId,
        objectIdToString(userId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteTenantDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete tenant domain');
    }
  }

  /**
   * Check domain availability
   */
  @Get('availability')
  @Public()
  @ApiOperation({ summary: 'Check domain availability' })
  @ApiResponse({ status: 200, description: 'Availability returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async checkAvailability(@Query() query: DomainAvailabilityQueryDto) {
    try {
      const { type, value } = query;
      if (!type || !value) {
        throw new BadRequestException(
          'type and value query parameters are required',
        );
      }

      const available = await this.domainService.checkAvailability(type, value);

      // For full custom domains (with a dot), also query the reseller stub
      let reseller: any = null;
      if (value.includes('.')) {
        try {
          reseller = await this.domainResellerService.search(value);
        } catch (err) {
          this.logger.warn(
            `Reseller search failed for ${value}: ${(err as Error).message}`,
          );
        }
      }

      return { available, reseller, value, type };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[checkAvailability] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to check availability');
    }
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * Get all domains (admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get all domains (admin)' })
  @ApiResponse({ status: 200, description: 'Domains returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllDomains(@Query() query: ListDomainsQueryDto) {
    try {
      return await this.domainService.getAllDomains(query);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getAllDomains] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list domains');
    }
  }

  /**
   * Create domain for specific tenant (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Create domain for specific tenant (admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createDomain(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateDomainDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;

      if (!createDto.tenantId) {
        throw new BadRequestException('tenantId is required');
      }

      return await this.domainService.createDomain(
        createDto.tenantId,
        createDto,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createDomain] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create domain');
    }
  }

  /**
   * Update domain (admin only)
   */
  @Patch(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update domain (admin)' })
  @ApiResponse({ status: 200, description: 'Domain updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDomain(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
    @Body() updateDto: UpdateDomainDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;

      // For admin, we need to get the domain's tenantId from DB
      // For simplicity, passing empty tenantId - service should handle admin mode
      return await this.domainService.updateDomain(
        'admin',
        params.domainId,
        updateDto,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateDomain] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update domain');
    }
  }

  /**
   * Set domain as primary (admin only)
   */
  @Post(':domainId/primary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Set domain as primary (admin)' })
  @ApiResponse({ status: 200, description: 'Primary domain updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async setDomainPrimary(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;

      return await this.domainService.setPrimaryDomain('admin', params.domainId, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[setDomainPrimary] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to set primary domain');
    }
  }

  /**
   * Delete domain (admin only)
   */
  @Delete(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete domain (admin)' })
  @ApiResponse({ status: 204, description: 'Domain deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteDomain(
    @Request() req: RequestWithUser,
    @Param() params: DomainIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;

      await this.domainService.deleteDomain('admin', params.domainId, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteDomain] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete domain');
    }
  }
}
