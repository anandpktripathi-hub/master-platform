import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('billing/affiliate')
export class CommissionController {
  constructor(private readonly affiliateService: AffiliateService) {}

  /**
   * Register or fetch affiliate profile for the current user
   */
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Req() req: { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User not found in token');
    }
    return this.affiliateService.registerAffiliate(userId);
  }

  /**
   * Get current user's affiliate profile + ledger
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User not found in token');
    }
    return this.affiliateService.getAffiliateForUser(userId);
  }

  /**
   * Record a commission event for an affiliate (admin/use-case driven)
   */
  @UseGuards(JwtAuthGuard)
  @Post('record-commission')
  async recordCommission(
    @Body()
    body: {
      affiliateId: string;
      baseAmount: number;
      commissionPercent: number;
      currency?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const { affiliateId, baseAmount, commissionPercent, currency, metadata } =
      body;
    return this.affiliateService.recordCommission(
      affiliateId,
      baseAmount,
      commissionPercent,
      currency,
      metadata,
    );
  }

  /**
   * Trigger payout of current affiliate balance
   */
  @UseGuards(JwtAuthGuard)
  @Post('payout')
  async payout(@Body() body: { affiliateId: string }) {
    return this.affiliateService.payout(body.affiliateId);
  }
}
