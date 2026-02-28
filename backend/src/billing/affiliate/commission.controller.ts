import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { PayoutDto, RecordCommissionDto } from './dto/affiliate.dto';

@ApiTags('Billing - Affiliate')
@ApiBearerAuth()
@Controller('billing/affiliate')
export class CommissionController {
  constructor(private readonly affiliateService: AffiliateService) {}

  /**
   * Register or fetch affiliate profile for the current user
   */
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Register (or fetch) affiliate profile for current user' })
  @ApiResponse({ status: 201, description: 'Affiliate profile returned' })
  @Post('register')
  async register(@Req() req: { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not found in token');
    }
    return this.affiliateService.registerAffiliate(userId);
  }

  /**
   * Get current user's affiliate profile + ledger
   */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user's affiliate profile + ledger" })
  @ApiResponse({ status: 200, description: 'Affiliate profile returned' })
  @Get('me')
  async me(@Req() req: { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not found in token');
    }
    return this.affiliateService.getAffiliateForUser(userId);
  }

  /**
   * Record a commission event for an affiliate (admin/use-case driven)
   */
  @UseGuards(JwtAuthGuard, RoleGuard, RateLimitGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Record a commission event for an affiliate (platform-only)' })
  @ApiResponse({ status: 201, description: 'Commission recorded' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('record-commission')
  async recordCommission(
    @Body()
    body: RecordCommissionDto,
  ) {
    return this.affiliateService.recordCommission(
      body.affiliateId,
      body.baseAmount,
      body.commissionPercent,
      body.currency,
      body.metadata,
    );
  }

  /**
   * Trigger payout of current affiliate balance
   */
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Trigger payout for current user (admin override allowed)' })
  @ApiResponse({ status: 201, description: 'Payout processed' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Post('payout')
  async payout(
    @Req() req: { user?: { sub?: string; role?: string } },
    @Body() body: PayoutDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not found in token');
    }

    // Default behavior: payout for current user only.
    if (!body.affiliateId) {
      return this.affiliateService.payoutForUser(userId);
    }

    // Admin override: allow explicit affiliateId payout only for platform super admin.
    const role = req.user?.role?.trim();
    const isPlatformAdmin =
      role === 'PLATFORM_SUPER_ADMIN' ||
      role === 'PLATFORM_SUPERADMIN' ||
      role === 'platform_admin' ||
      role === 'PLATFORM_ADMIN_LEGACY';

    if (!isPlatformAdmin) {
      throw new ForbiddenException('Not allowed to payout for other affiliates');
    }

    if (!body.affiliateId) {
      throw new BadRequestException('affiliateId is required');
    }

    return this.affiliateService.payout(body.affiliateId);
  }
}
