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
} from '@nestjs/common';
import { objectIdToString } from '../../utils/objectIdToString';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { DomainService } from './services/domain.service';
import {
  CreateDomainDto,
  UpdateDomainDto,
  ListDomainsQueryDto,
} from './dto/domain.dto';

@Controller('domains')
export class DomainController {
  private readonly logger = new Logger(DomainController.name);

  constructor(private domainService: DomainService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's domains
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getTenantDomains(
    @Request() req: RequestWithUser,
    @Query() query: ListDomainsQueryDto,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }
    return this.domainService.getDomainsForTenant(
      objectIdToString(tenantId),
      query,
    );
  }

  /**
   * Create a domain for current tenant
   */
  @Post('me')
  @UseGuards(JwtAuthGuard)
  async createDomainForTenant(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateDomainDto,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }
    return this.domainService.createDomain(
      objectIdToString(tenantId),
      createDto,
      objectIdToString(userId),
    );
  }

  /**
   * Update a domain for current tenant
   */
  @Patch('me/:domainId')
  @UseGuards(JwtAuthGuard)
  async updateTenantDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
    @Body() updateDto: UpdateDomainDto,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }
    return this.domainService.updateDomain(
      objectIdToString(tenantId),
      domainId,
      updateDto,
      objectIdToString(userId),
    );
  }

  /**
   * Set domain as primary for current tenant
   */
  @Post('me/:domainId/primary')
  @UseGuards(JwtAuthGuard)
  async setPrimaryDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }
    return this.domainService.setPrimaryDomain(
      objectIdToString(tenantId),
      domainId,
      objectIdToString(userId),
    );
  }

  /**
   * Delete a domain for current tenant
   */
  @Delete('me/:domainId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteTenantDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request');
    }
    await this.domainService.deleteDomain(
      objectIdToString(tenantId),
      domainId,
      objectIdToString(userId),
    );
  }

  /**
   * Check domain availability
   */
  @Get('availability')
  async checkAvailability(
    @Query('type') type: 'path' | 'subdomain',
    @Query('value') value: string,
  ) {
    if (!type || !value) {
      throw new BadRequestException(
        'type and value query parameters are required',
      );
    }

    const available = await this.domainService.checkAvailability(type, value);
    return { available, value, type };
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
  async getAllDomains(@Query() query: ListDomainsQueryDto) {
    return this.domainService.getAllDomains(query);
  }

  /**
   * Create domain for specific tenant (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async createDomain(
    @Request() req: RequestWithUser,
    @Body() createDto: CreateDomainDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;

    if (!createDto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    return this.domainService.createDomain(
      createDto.tenantId,
      createDto,
      userId,
    );
  }

  /**
   * Update domain (admin only)
   */
  @Patch(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async updateDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
    @Body() updateDto: UpdateDomainDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;

    // For admin, we need to get the domain's tenantId from DB
    // For simplicity, passing empty tenantId - service should handle admin mode
    return this.domainService.updateDomain(
      'admin',
      domainId,
      updateDto,
      userId,
    );
  }

  /**
   * Set domain as primary (admin only)
   */
  @Post(':domainId/primary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async setDomainPrimary(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;

    return this.domainService.setPrimaryDomain('admin', domainId, userId);
  }

  /**
   * Delete domain (admin only)
   */
  @Delete(':domainId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  async deleteDomain(
    @Request() req: RequestWithUser,
    @Param('domainId') domainId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;

    await this.domainService.deleteDomain('admin', domainId, userId);
  }
}
