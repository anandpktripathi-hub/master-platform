import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { objectIdToString } from '../../utils/objectIdToString';
import { Types } from 'mongoose';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ManualCreateTenantDto } from './dto/manual-create-tenant.dto';
import { UpdateTenantPublicProfileDto } from './dto/tenant-public-profile.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * GET /tenants/custom-domains
   * Returns custom domains for current tenant
   */
  @UseGuards(JwtAuthGuard)
  @Get('custom-domains')
  async getCustomDomains(@Req() req: { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    // Fetch custom domains from tenant
    const tenant = await this.tenantsService.getCurrentTenant(tenantId);
    if (!tenant) throw new BadRequestException('Tenant not found');
    // Example: tenant.customDomains is an array
    return { domains: tenant.customDomains ?? [] };
  }

  /**
   * GET /tenants/quota
   * Returns quota usage for current tenant
   */
  @UseGuards(JwtAuthGuard)
  @Get('quota')
  async getQuota(@Req() req: { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    // Fetch quota info from tenant
    const tenant = await this.tenantsService.getCurrentTenant(tenantId);
    if (!tenant) throw new BadRequestException('Tenant not found');
    // Example quota fields, adjust as needed
    return {
      maxApiCallsPerDay: tenant.maxApiCallsPerDay ?? 10000,
      usedApiCallsToday: tenant.usedApiCallsToday ?? 0,
      maxStorageMb: tenant.maxStorageMb ?? 1024,
      usedStorageMb: tenant.usedStorageMb ?? 0,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return null;
    }
    return this.tenantsService.getCurrentTenant(tenantId);
  }

  /**
   * Phase 3: Platform admin manually creates a tenant
   * POST /api/tenants/manual-create
   * Protected: platform_admin only
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('manual-create')
  async manualCreate(
    @Body() dto: ManualCreateTenantDto,
    @Req() req: { user?: { sub?: string; _id?: unknown } },
  ) {
    let adminId = req.user?.sub;
    if (!adminId && req.user?._id && typeof req.user._id === 'object') {
      adminId = objectIdToString(req.user._id);
    }
    if (!adminId) throw new BadRequestException('User ID is required');
    return this.tenantsService.manualCreateTenant(dto, adminId);
  }

  /**
   * PUT /tenants/public-profile
   * Update current tenant's public business profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('public-profile')
  async updatePublicProfile(
    @Req() req: { user?: { tenantId?: string } },
    @Body() dto: UpdateTenantPublicProfileDto,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.tenantsService.updateTenantPublicProfile(tenantId, dto);
  }

  /**
   * GET /tenants/public-directory
   * Minimal business directory listing for public tenants
   */
  @Get('public-directory')
  async listPublicBusinesses(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('tag') tag?: string,
    @Query('priceTier') priceTier?: 'LOW' | 'MEDIUM' | 'HIGH',
    @Query('minRating') minRatingRaw?: string,
  ) {
    const minRating = minRatingRaw ? Number(minRatingRaw) : undefined;
    return this.tenantsService.listPublicBusinesses({
      q,
      category,
      city,
      country,
      tag,
      priceTier,
      minRating,
    });
  }

  /**
   * GET /tenants/public/:slug
   * Public business profile by slug
   */
  @Get('public/:slug')
  async getPublicBusiness(@Param('slug') slug: string) {
    if (!slug) throw new BadRequestException('Slug is required');
    return this.tenantsService.getPublicBusinessBySlug(slug);
  }

  /**
   * GET /tenants/public/:slug/reviews
   * Public reviews for a business
   */
  @Get('public/:slug/reviews')
  async getBusinessReviews(@Param('slug') slug: string) {
    if (!slug) throw new BadRequestException('Slug is required');
    const tenant = await this.tenantsService.getPublicBusinessBySlug(slug);
    return this.tenantsService.listBusinessReviews(
      new Types.ObjectId(tenant._id as any),
    );
  }

  /**
   * POST /tenants/public/:slug/reviews
   * Authenticated users can leave a review
   */
  @UseGuards(JwtAuthGuard)
  @Post('public/:slug/reviews')
  async addBusinessReview(
    @Param('slug') slug: string,
    @Req() req: { user?: { sub?: string; _id?: unknown } },
    @Body() body: { rating?: number; comment?: string },
  ) {
    if (!slug) throw new BadRequestException('Slug is required');
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    const tenant = await this.tenantsService.getPublicBusinessBySlug(slug);

    let userId = req.user?.sub;
    if (!userId && req.user?._id && typeof req.user._id === 'object') {
      userId = objectIdToString(req.user._id);
    }
    if (!userId) throw new BadRequestException('User ID is required');

    await this.tenantsService.addBusinessReview(
      new Types.ObjectId(tenant._id as any),
      new Types.ObjectId(userId),
      body.rating,
      body.comment,
    );

    return { success: true };
  }
}
