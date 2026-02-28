import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RevenueService } from './revenue.service';
import { BillingRevenueAnalyticsResponseDto } from './dto/revenue-analytics.dto';

@ApiTags('Billing - Analytics')
@ApiBearerAuth()
@Controller('billing/analytics')
@UseGuards(JwtAuthGuard, RoleGuard)
export class RevenueController {
  private readonly logger = new Logger(RevenueController.name);

  constructor(private readonly revenueService: RevenueService) {}

  /**
   * High-level revenue analytics for platform super admins.
   *
   * Uses the invoices collection as the single source of
   * truth and is intentionally conservative in its
   * calculations (e.g. MRR is derived from the most recent
   * full month's paid invoices).
   */
  @Get('revenue')
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Revenue analytics (platform super admin only)' })
  @ApiResponse({ status: 200, description: 'Revenue analytics returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRevenue(): Promise<BillingRevenueAnalyticsResponseDto> {
    try {
      return await this.revenueService.getRevenueAnalytics();
    } catch (error) {
      this.logger.error(
        '[getRevenue] Failed to compute revenue analytics',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
