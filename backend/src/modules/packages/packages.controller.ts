import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  HttpException,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { objectIdToString } from '../../common/utils/objectid.util';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { PackageService } from './services/package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';
import { AssignPackageBodyDto } from './dto/assign-package-body.dto';
import { ExpiryWarningsBodyDto } from './dto/expiry-warnings-body.dto';
import { PackageFeatureParamDto } from './dto/package-feature-param.dto';
import { PackageIdParamDto } from './dto/package-id-param.dto';
import { PackagesPaginationQueryDto } from './dto/packages-pagination-query.dto';
import { PaymentGatewayService } from '../payments/services/payment-gateway.service';
import { PaymentLogService } from '../payments/services/payment-log.service';
import { BillingNotificationService } from '../billing/billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Packages')
@ApiBearerAuth('bearer')
@Controller('packages')
export class PackageController {
  private readonly logger = new Logger(PackageController.name);

  constructor(
    private packageService: PackageService,
    private paymentGatewayService: PaymentGatewayService,
    private paymentLogService: PaymentLogService,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Get all available package features
   */
  @Get('features')
  @Public()
  @ApiOperation({ summary: 'Get available package features' })
  @ApiResponse({ status: 200, description: 'Features returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllFeatures() {
    try {
      // Replace with actual service call or static list as needed
      // Example: return this.packageService.getAllFeatures();
      // For now, return a static example
      return {
        features: [
          { _id: '1', name: 'Multi-tenancy', label: 'Multi-tenancy' },
          { _id: '2', name: 'Custom Domains', label: 'Custom Domains' },
          { _id: '3', name: 'Advanced Billing', label: 'Advanced Billing' },
          { _id: '4', name: 'CMS Integration', label: 'CMS Integration' },
        ],
      };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getAllFeatures] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get package features');
    }
  }

  /**
   * TENANT ENDPOINTS
   */

  /**
   * Get current tenant's package
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current tenant's package" })
  @ApiResponse({ status: 200, description: 'Package returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantPackage(@Request() req: RequestWithUser) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.packageService.getTenantPackage(objectIdToString(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantPackage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get tenant package');
    }
  }

  /**
   * Get tenant's usage and limits
   */
  @Get('me/usage')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current tenant's usage and limits" })
  @ApiResponse({ status: 200, description: 'Usage returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantUsageAndLimits(@Request() req: RequestWithUser) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.packageService.getUsageAndLimits(objectIdToString(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantUsageAndLimits] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get tenant usage and limits',
          );
    }
  }

  /**
   * Check if tenant can use a feature
   */
  @Get('me/can-use/:feature')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check whether tenant can use a feature' })
  @ApiResponse({ status: 200, description: 'Result returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async canUseFeature(
    @Request() req: RequestWithUser,
    @Param() params: PackageFeatureParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      const canUse = await this.packageService.canUseFeature(
        objectIdToString(tenantId),
        params.feature,
      );
      return { feature: params.feature, canUse };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[canUseFeature] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to check feature access');
    }
  }

  /**
   * List all active packages (for signup/upgrade)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'List active packages (signup/upgrade)' })
  @ApiResponse({ status: 200, description: 'Packages returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listPackages(@Query() query: PackagesPaginationQueryDto) {
    try {
      return await this.packageService.listPackages({
        isActive: true,
        limit: query.limit,
        skip: query.skip,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listPackages] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list packages');
    }
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
  @ApiOperation({ summary: 'Create a package (platform admin)' })
  @ApiResponse({ status: 201, description: 'Package created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPackage(
    @Request() req: RequestWithUser,
    @Body() createDto: CreatePackageDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.packageService.createPackage(createDto, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createPackage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create package');
    }
  }

  /**
   * Update a package
   */
  @Patch(':packageId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update a package (platform admin)' })
  @ApiResponse({ status: 200, description: 'Package updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updatePackage(
    @Request() req: RequestWithUser,
    @Param() params: PackageIdParamDto,
    @Body() updateDto: UpdatePackageDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      return await this.packageService.updatePackage(
        params.packageId,
        updateDto,
        userId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updatePackage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update package');
    }
  }

  /**
   * Delete a package
   */
  @Delete(':packageId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a package (platform admin)' })
  @ApiResponse({ status: 204, description: 'Package deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deletePackage(
    @Request() req: RequestWithUser,
    @Param() params: PackageIdParamDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');
      await this.packageService.deletePackage(params.packageId, userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deletePackage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete package');
    }
  }

  /**
   * Assign package to a tenant (admin)
   */
  @Post(':packageId/assign')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Assign package to a tenant (platform admin)' })
  @ApiResponse({ status: 201, description: 'Package assigned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignPackage(
    @Request() req: RequestWithUser,
    @Param() params: PackageIdParamDto,
    @Body() body: AssignPackageBodyDto,
  ) {
    try {
      if (!req.user) throw new BadRequestException('User not authenticated');
      const userId = req.user.sub;
      if (!userId) throw new BadRequestException('User ID is required');

      return await this.packageService.assignPackageToTenant(
        objectIdToString(body.tenantId),
        params.packageId,
        {
          startTrial: body.startTrial,
          userId,
          paymentToken: body.paymentToken,
          gatewayName: body.gatewayName,
        },
        this.paymentGatewayService,
        this.paymentLogService,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[assignPackage] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to assign package');
    }
  }

  /**
   * List all packages (admin - includes inactive)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List all packages (platform admin)' })
  @ApiResponse({ status: 200, description: 'Packages returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listAllPackages(@Query() query: PackagesPaginationQueryDto) {
    try {
      return await this.packageService.listPackages({
        limit: query.limit,
        skip: query.skip,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listAllPackages] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list all packages');
    }
  }

  /**
   * Get per-plan summary including expiry settings and tenant counts.
   */
  @Get('admin/plan-summary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get package plan summary (platform admin)' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPlanSummary() {
    try {
      return await this.packageService.getPlanSummary();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPlanSummary] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get plan summary');
    }
  }

  /**
   * Trigger subscription expiry warning emails for soon-expiring tenant packages.
   * Intended to be called by a scheduled job or manually by a platform admin.
   */
  @Post('admin/subscription-expiry-warnings')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send subscription expiry warning emails (platform admin)' })
  @ApiResponse({ status: 200, description: 'Warnings processed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async sendExpiryWarnings(@Body() body: ExpiryWarningsBodyDto | undefined) {
    try {
      const daysBeforeExpiry = body?.daysBeforeExpiry ?? 3;
      const windowDays =
        await this.packageService.getMaxExpiryWarningWindow(daysBeforeExpiry);
      const processed =
        await this.packageService.sendSubscriptionExpiryWarnings(
          daysBeforeExpiry,
          windowDays,
          this.billingNotifications,
          this.tenantsService,
        );
      return { processed, daysBeforeExpiry, windowDays };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[sendExpiryWarnings] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to send subscription expiry warnings',
          );
    }
  }

  /**
   * Force subscription termination for all overdue tenant packages,
   * sending termination notifications and marking tenants inactive.
   * Useful as a manual safety/ops trigger in addition to the cron job.
   */
  @Post('admin/subscription-expire-now')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Expire overdue subscriptions now (platform admin)' })
  @ApiResponse({ status: 200, description: 'Expiry processed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async expireNow() {
    try {
      const expired =
        await this.packageService.expireTenantPackagesWithNotifications(
          this.billingNotifications,
          this.tenantsService,
        );
      return { expired };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[expireNow] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to expire overdue subscriptions',
          );
    }
  }

  /**
   * Get a specific package
   */
  @Get(':packageId')
  @Public()
  @ApiOperation({ summary: 'Get a package by id' })
  @ApiResponse({ status: 200, description: 'Package returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPackage(@Param() params: PackageIdParamDto) {
    try {
      return await this.packageService.getPackage(params.packageId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getPackage] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get package');
    }
  }
}
