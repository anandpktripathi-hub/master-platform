import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdateTenantProfileDto } from './dto/profile.dto';

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
    return this.profileService.updateTenantProfile(tenantId, dto);
  }
}
