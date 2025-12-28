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
import { objectIdToString } from '../../common/utils/objectid.util';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  PackageService,
  CreatePackageDto,
  UpdatePackageDto,
} from './services/package.service';

@Controller('packages')
export class PackageController {
  constructor(private packageService: PackageService) {}

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's package
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getTenantPackage(@Request() req: RequestWithUser) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.packageService.getTenantPackage(objectIdToString(tenantId));
  }

  /**
   * Get tenant's usage and limits
   */
  @Get('me/usage')
  @UseGuards(JwtAuthGuard)
  async getTenantUsageAndLimits(@Request() req: RequestWithUser) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return this.packageService.getUsageAndLimits(objectIdToString(tenantId));
  }

  /**
   * Check if tenant can use a feature
   */
  @Get('me/can-use/:feature')
  @UseGuards(JwtAuthGuard)
  async canUseFeature(
    @Request() req: RequestWithUser,
    @Param('feature') feature: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    const canUse = await this.packageService.canUseFeature(
      objectIdToString(tenantId),
      feature,
    );
    return { feature, canUse };
  }

  /**
   * List all active packages (for signup/upgrade)
   */
  @Get()
  async listPackages(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.packageService.listPackages({
      isActive: true,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * Create a new package
   */
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async createPackage(
    @Request() req: RequestWithUser,
    @Body() createDto: CreatePackageDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.packageService.createPackage(createDto, userId);
  }

  /**
   * Update a package
   */
  @Patch(':packageId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async updatePackage(
    @Request() req: RequestWithUser,
    @Param('packageId') packageId: string,
    @Body() updateDto: UpdatePackageDto,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.packageService.updatePackage(packageId, updateDto, userId);
  }

  /**
   * Delete a package
   */
  @Delete(':packageId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  async deletePackage(
    @Request() req: RequestWithUser,
    @Param('packageId') packageId: string,
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    await this.packageService.deletePackage(packageId, userId);
  }

  /**
   * Get a specific package
   */
  @Get(':packageId')
  async getPackage(@Param('packageId') packageId: string) {
    return this.packageService.getPackage(packageId);
  }

  /**
   * Assign package to a tenant (admin)
   */
  @Post(':packageId/assign')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async assignPackage(
    @Request() req: RequestWithUser,
    @Param('packageId') packageId: string,
    @Body() body: { tenantId: string; startTrial?: boolean },
  ) {
    if (!req.user) throw new BadRequestException('User not authenticated');
    const userId = req.user.sub;
    if (!userId) throw new BadRequestException('User ID is required');
    return this.packageService.assignPackageToTenant(
      objectIdToString(body.tenantId),
      packageId,
      {
        startTrial: body.startTrial,
        userId,
      },
    );
  }

  /**
   * List all packages (admin - includes inactive)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async listAllPackages(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.packageService.listPackages({
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
  }
}
