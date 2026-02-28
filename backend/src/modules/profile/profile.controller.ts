import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Query,
  Param,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import {
  UpdateProfileDto,
  UpdateTenantProfileDto,
  UpdatePublicProfileDto,
} from './dto/profile.dto';
import { ProfileHandleParamDto } from './dto/profile-handle-param.dto';
import { ProfileHandleQueryDto } from './dto/profile-handle-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}
@ApiTags('Profile')
@ApiBearerAuth('bearer')
@Controller()
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /api/me/profile
   * Returns current user's personal profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  @ApiOperation({ summary: "Get current user's personal profile" })
  @ApiResponse({ status: 200, description: 'Profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyProfile(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      return await this.profileService.getUserProfile(userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMyProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get profile');
    }
  }

  /**
   * PUT /api/me/profile
   * Updates current user's personal profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  @ApiOperation({ summary: "Update current user's personal profile" })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateMyProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      return await this.profileService.updateUserProfile(userId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateMyProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update profile');
    }
  }

  /**
   * GET /api/tenant/profile
   * Returns current user's tenant/company profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('tenant/profile')
  @ApiOperation({ summary: "Get current tenant/company profile" })
  @ApiResponse({ status: 200, description: 'Tenant profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantProfile(@Req() req: AuthRequest) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.profileService.getTenantProfile(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get tenant profile');
    }
  }

  /**
   * PUT /api/tenant/profile
   * Updates current user's tenant/company profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('tenant/profile')
  @ApiOperation({ summary: 'Update current tenant/company profile' })
  @ApiResponse({ status: 200, description: 'Tenant profile updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTenantProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateTenantProfileDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.profileService.updateTenantProfile(tenantId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTenantProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update tenant profile');
    }
  }

  /**
   * GET /api/me/public-profile
   * Returns current user's public profile (creates a minimal one if missing)
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/public-profile')
  @ApiOperation({ summary: "Get or create current user's public profile" })
  @ApiResponse({ status: 200, description: 'Public profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyPublicProfile(@Req() req: AuthRequest) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      return await this.profileService.getOrCreatePublicProfile(userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getMyPublicProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get public profile');
    }
  }

  /**
   * PUT /api/me/public-profile
   * Updates current user's public profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('me/public-profile')
  @ApiOperation({ summary: "Update current user's public profile" })
  @ApiResponse({ status: 200, description: 'Public profile updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateMyPublicProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdatePublicProfileDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      return await this.profileService.updatePublicProfile(userId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateMyPublicProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update public profile');
    }
  }

  /**
   * GET /api/public/profiles/check-handle?handle=foo
   * Checks if a public handle is available
   */
  @Get('public/profiles/check-handle')
  @Public()
  @ApiOperation({ summary: 'Check whether a public handle is available' })
  @ApiResponse({ status: 200, description: 'Availability returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async checkHandle(@Query() query: ProfileHandleQueryDto) {
    try {
      const available = await this.profileService.isHandleAvailable(
        query.handle,
      );
      return { available };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[checkHandle] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to check handle');
    }
  }

  /**
   * GET /api/public/profiles/:handle
   * Returns a public user profile by handle
   */
  @Get('public/profiles/:handle')
  @Public()
  @ApiOperation({ summary: 'Get public user profile by handle' })
  @ApiResponse({ status: 200, description: 'Public profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPublicProfile(@Param() params: ProfileHandleParamDto) {
    try {
      return await this.profileService.getPublicProfileByHandle(params.handle);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPublicProfile] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get public profile');
    }
  }
}
