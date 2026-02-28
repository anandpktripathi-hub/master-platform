import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
  private readonly logger = new Logger(CommissionController.name);

  constructor(private readonly affiliateService: AffiliateService) {}

  /**
   * Register or fetch affiliate profile for the current user
   */
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Register (or fetch) affiliate profile for current user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Affiliate profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('register')
  async register(@Req() req: { user?: { sub?: string } }) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new UnauthorizedException('User not found in token');
      }
      return await this.affiliateService.registerAffiliate(userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[register] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to register affiliate');
    }
  }

  /**
   * Get current user's affiliate profile + ledger
   */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get current user's affiliate profile + ledger" })
  @ApiResponse({ status: 200, description: 'Affiliate profile returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('me')
  async me(@Req() req: { user?: { sub?: string } }) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new UnauthorizedException('User not found in token');
      }
      return await this.affiliateService.getAffiliateForUser(userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[me] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get affiliate profile');
    }
  }

  /**
   * Record a commission event for an affiliate (admin/use-case driven)
   */
  @UseGuards(JwtAuthGuard, RoleGuard, RateLimitGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Record a commission event for an affiliate (platform-only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Commission recorded' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('record-commission')
  async recordCommission(
    @Body()
    body: RecordCommissionDto,
  ) {
    try {
      return await this.affiliateService.recordCommission(
        body.affiliateId,
        body.baseAmount,
        body.commissionPercent,
        body.currency,
        body.metadata,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[recordCommission] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to record commission');
    }
  }

  /**
   * Trigger payout of current affiliate balance
   */
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Trigger payout for current user (admin override allowed)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Payout processed' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('payout')
  async payout(
    @Req() req: { user?: { sub?: string; role?: string } },
    @Body() body: PayoutDto,
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new UnauthorizedException('User not found in token');
      }

      // Default behavior: payout for current user only.
      if (!body.affiliateId) {
        return await this.affiliateService.payoutForUser(userId);
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

      return await this.affiliateService.payout(body.affiliateId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[payout] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to process payout');
    }
  }
}
