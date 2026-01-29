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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import {
  UpdateProfileDto,
  UpdateTenantProfileDto,
  UpdatePublicProfileDto,
} from './dto/profile.dto';

interface AuthRequest extends Request {
  user: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /api/me/profile
   * Returns current user's personal profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/profile')
  async getMyProfile(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.profileService.getUserProfile(userId);
  }

  /**
   * PUT /api/me/profile
   * Updates current user's personal profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateMyProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.profileService.updateUserProfile(userId, dto);
  }

  /**
   * GET /api/tenant/profile
   * Returns current user's tenant/company profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('tenant/profile')
  async getTenantProfile(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.profileService.getTenantProfile(tenantId);
  }

  /**
   * PUT /api/tenant/profile
   * Updates current user's tenant/company profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('tenant/profile')
  async updateTenantProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdateTenantProfileDto,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.profileService.updateTenantProfile(tenantId, dto);
  }

  /**
   * GET /api/me/public-profile
   * Returns current user's public profile (creates a minimal one if missing)
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/public-profile')
  async getMyPublicProfile(@Req() req: AuthRequest) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.profileService.getOrCreatePublicProfile(userId);
  }

  /**
   * PUT /api/me/public-profile
   * Updates current user's public profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('me/public-profile')
  async updateMyPublicProfile(
    @Req() req: AuthRequest,
    @Body() dto: UpdatePublicProfileDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.profileService.updatePublicProfile(userId, dto);
  }

  /**
   * GET /api/public/profiles/check-handle?handle=foo
   * Checks if a public handle is available
   */
  @Get('public/profiles/check-handle')
  async checkHandle(@Query('handle') handle?: string) {
    if (!handle) throw new BadRequestException('Handle is required');
    const available = await this.profileService.isHandleAvailable(handle);
    return { available };
  }

  /**
   * GET /api/public/profiles/:handle
   * Returns a public user profile by handle
   */
  @Get('public/profiles/:handle')
  async getPublicProfile(@Param('handle') handle: string) {
    if (!handle) throw new BadRequestException('Handle is required');
    return this.profileService.getPublicProfileByHandle(handle);
  }
}
