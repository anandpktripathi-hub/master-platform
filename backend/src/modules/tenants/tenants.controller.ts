import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Body,
  Req,
  UseGuards,
  Put,
  Query,
  Param,
} from '@nestjs/common';
import { objectIdToString } from '../../utils/objectIdToString';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ManualCreateTenantDto } from './dto/manual-create-tenant.dto';
import { UpdateTenantPublicProfileDto } from './dto/tenant-public-profile.dto';
import { CreateBusinessReviewDto } from './dto/business-review.dto';
import { ListTenantsQueryDto } from './dto/list-tenants.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Types } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { TenantSlugParamDto, PublicDirectoryQueryDto } from './dto/tenants-public.dto';
@ApiTags('Tenants')
@ApiBearerAuth('bearer')
@Controller('tenants')
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * GET /tenants
   * Platform admin tenant listing
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'PLATFORM_SUPER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'List tenants (platform)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTenants(@Query() query: ListTenantsQueryDto) {
    try {
      return await this.tenantsService.listTenants(query);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listTenants] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * POST /tenants
   * Platform admin creates a tenant record (lightweight)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'PLATFORM_SUPER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create a tenant (platform)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTenant(
    @Body() dto: CreateTenantDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      let adminId = req.user?.sub;
      if (!adminId && req.user?._id) {
        adminId = objectIdToString(req.user._id as any);
      }
      if (!adminId) throw new BadRequestException('User ID is required');
      if (!Types.ObjectId.isValid(adminId)) {
        throw new BadRequestException('User ID is invalid');
      }

      return await this.tenantsService.createTenant(
        dto.name,
        new Types.ObjectId(adminId),
        dto.planKey ?? 'FREE',
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTenant] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GET /tenants/custom-domains
   * Returns custom domains for current tenant
   */
  @UseGuards(JwtAuthGuard)
  @Get('custom-domains')
  @ApiOperation({ summary: 'Get custom domains for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCustomDomains(@Req() req: RequestWithUser) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      const tenant = await this.tenantsService.getCurrentTenant(String(tenantId));
      if (!tenant) throw new BadRequestException('Tenant not found');
      return { domains: (tenant as any).customDomains ?? [] };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getCustomDomains] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GET /tenants/quota
   * Returns quota usage for current tenant
   */
  @UseGuards(JwtAuthGuard)
  @Get('quota')
  @ApiOperation({ summary: 'Get quota usage for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getQuota(@Req() req: RequestWithUser) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      const tenant = await this.tenantsService.getCurrentTenant(String(tenantId));
      if (!tenant) throw new BadRequestException('Tenant not found');
      return {
        maxApiCallsPerDay: (tenant as any).maxApiCallsPerDay ?? 10000,
        usedApiCallsToday: (tenant as any).usedApiCallsToday ?? 0,
        maxStorageMb: (tenant as any).maxStorageMb ?? 1024,
        usedStorageMb: (tenant as any).usedStorageMb ?? 0,
      };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getQuota] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current tenant record for authenticated user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async me(@Req() req: RequestWithUser) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return null;
      }
      return await this.tenantsService.getCurrentTenant(String(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[me] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Phase 3: Platform admin manually creates a tenant
   * POST /api/tenants/manual-create
   * Protected: platform_admin only
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @Post('manual-create')
  @ApiOperation({ summary: 'Manually create tenant (platform)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async manualCreate(
    @Body() dto: ManualCreateTenantDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      let adminId = req.user?.sub;
      if (!adminId && req.user?._id) {
        adminId = objectIdToString(req.user._id as any);
      }
      if (!adminId) throw new BadRequestException('User ID is required');
      return await this.tenantsService.manualCreateTenant(dto, adminId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[manualCreate] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * PUT /tenants/public-profile
   * Update current tenant's public business profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('public-profile')
  @ApiOperation({ summary: "Update current tenant's public business profile" })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updatePublicProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateTenantPublicProfileDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      return await this.tenantsService.updateTenantPublicProfile(
        String(tenantId),
        dto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updatePublicProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GET /tenants/public-directory
   * Minimal business directory listing for public tenants
   */
  @Get('public-directory')
  @Public()
  @ApiOperation({ summary: 'List public businesses (directory)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listPublicBusinesses(
    @Query() query: PublicDirectoryQueryDto,
  ) {
    try {
      return await this.tenantsService.listPublicBusinesses({
        q: query.q,
        category: query.category,
        city: query.city,
        country: query.country,
        tag: query.tag,
        priceTier: query.priceTier,
        minRating: query.minRating,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listPublicBusinesses] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GET /tenants/public/:slug
   * Public business profile by slug
   */
  @Get('public/:slug')
  @Public()
  @ApiOperation({ summary: 'Get public business profile by slug' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPublicBusiness(@Param() params: TenantSlugParamDto) {
    try {
      return await this.tenantsService.getPublicBusinessBySlug(params.slug);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPublicBusiness] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GET /tenants/public/:slug/reviews
   * Public reviews for a business
   */
  @Get('public/:slug/reviews')
  @Public()
  @ApiOperation({ summary: 'Get public reviews for a business' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBusinessReviews(@Param() params: TenantSlugParamDto) {
    try {
      const tenant = await this.tenantsService.getPublicBusinessBySlug(
        params.slug,
      );
      const tenantId = objectIdToString((tenant as any)._id);
      return await this.tenantsService.listBusinessReviews(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getBusinessReviews] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * POST /tenants/public/:slug/reviews
   * Authenticated users can leave a review
   */
  @UseGuards(JwtAuthGuard)
  @Post('public/:slug/reviews')
  @ApiOperation({ summary: 'Add a review for a public business (authed)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async addBusinessReview(
    @Param() params: TenantSlugParamDto,
    @Req() req: RequestWithUser,
    @Body() dto: CreateBusinessReviewDto,
  ) {
    try {
      const tenant = await this.tenantsService.getPublicBusinessBySlug(
        params.slug,
      );
      const tenantId = objectIdToString((tenant as any)._id);

      let userId = req.user?.sub;
      if (!userId && req.user?._id) {
        userId = objectIdToString(req.user._id as any);
      }
      if (!userId) throw new BadRequestException('User ID is required');

      await this.tenantsService.addBusinessReview(
        tenantId,
        userId,
        dto.rating,
        dto.comment,
      );

      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[addBusinessReview] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
