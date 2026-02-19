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
import { PaymentGatewayService } from '../payments/services/payment-gateway.service';
import { PaymentLogService } from '../payments/services/payment-log.service';
import { BillingNotificationService } from '../billing/billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';

@Controller('packages')
export class PackageController {
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
  async getAllFeatures() {
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
  }

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
    @Body()
    body: {
      tenantId: string;
      startTrial?: boolean;
      paymentToken?: string;
      gatewayName?: string;
    },
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
        paymentToken: body.paymentToken,
        gatewayName: body.gatewayName,
      },
      this.paymentGatewayService,
      this.paymentLogService,
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

  /**
   * Get per-plan summary including expiry settings and tenant counts.
   */
  @Get('admin/plan-summary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async getPlanSummary() {
    return this.packageService.getPlanSummary();
  }

  /**
   * Trigger subscription expiry warning emails for soon-expiring tenant packages.
   * Intended to be called by a scheduled job or manually by a platform admin.
   */
  @Post('admin/subscription-expiry-warnings')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @HttpCode(200)
  async sendExpiryWarnings(@Body() body: { daysBeforeExpiry?: number }) {
    const daysBeforeExpiry = body.daysBeforeExpiry ?? 3;
    const windowDays =
      await this.packageService.getMaxExpiryWarningWindow(daysBeforeExpiry);
    const processed = await this.packageService.sendSubscriptionExpiryWarnings(
      daysBeforeExpiry,
      windowDays,
      this.billingNotifications,
      this.tenantsService,
    );
    return { processed, daysBeforeExpiry, windowDays };
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
  async expireNow() {
    const expired =
      await this.packageService.expireTenantPackagesWithNotifications(
        this.billingNotifications,
        this.tenantsService,
      );
    return { expired };
  }
}
