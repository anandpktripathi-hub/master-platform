import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CmsAnalyticsService } from '../services/cms-analytics.service';
import { Tenant } from '../../decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  CmsAnalyticsDateRangeQueryDto,
  CmsAnalyticsDaysQueryDto,
  CmsAnalyticsPageIdParamDto,
  CmsAnalyticsRecordConversionBodyDto,
  CmsAnalyticsTrackViewBodyDto,
} from '../dto/cms-analytics.dto';

@ApiTags('CMS - Analytics')
@ApiBearerAuth('bearer')
@Controller('cms/analytics')
export class CmsAnalyticsController {
  private readonly logger = new Logger(CmsAnalyticsController.name);

  constructor(private readonly analyticsService: CmsAnalyticsService) {}

  @Post(':pageId/track')
  @Public()
  @ApiOperation({ summary: 'Track a CMS page view event' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiBody({ type: CmsAnalyticsTrackViewBodyDto, required: false })
  @ApiResponse({ status: 200, description: 'Tracked successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async trackView(
    @Tenant() tenantId: string,
    @Param() params: CmsAnalyticsPageIdParamDto,
    @Body() body?: CmsAnalyticsTrackViewBodyDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');

      const metadata = body?.metadata ?? body;
      return await this.analyticsService.trackPageView(
        tenantId,
        params.pageId,
        metadata,
      );
    } catch (error) {
      this.logger.error(
        `[trackView] Failed to track view (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('page/:pageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get analytics for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiResponse({ status: 200, description: 'Analytics returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPageAnalytics(
    @Tenant() tenantId: string,
    @Param() params: CmsAnalyticsPageIdParamDto,
    @Query() query: CmsAnalyticsDateRangeQueryDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');

      return await this.analyticsService.getPageAnalytics(
        tenantId,
        params.pageId,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
      );
    } catch (error) {
      this.logger.error(
        `[getPageAnalytics] Failed to get page analytics (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('page/:pageId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get page stats for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPageStats(
    @Tenant() tenantId: string,
    @Param() params: CmsAnalyticsPageIdParamDto,
    @Query() query: CmsAnalyticsDaysQueryDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.analyticsService.getPageStats(
        tenantId,
        params.pageId,
        query.days,
      );
    } catch (error) {
      this.logger.error(
        `[getPageStats] Failed to get page stats (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tenant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get tenant-wide CMS analytics' })
  @ApiResponse({ status: 200, description: 'Tenant analytics returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTenantAnalytics(
    @Tenant() tenantId: string,
    @Query() query: CmsAnalyticsDaysQueryDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.analyticsService.getTenantAnalytics(tenantId, query.days);
    } catch (error) {
      this.logger.error(
        `[getTenantAnalytics] Failed to get tenant analytics (tenantId=${tenantId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post(':pageId/conversion')
  @Public()
  @ApiOperation({ summary: 'Record a conversion event for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiBody({ type: CmsAnalyticsRecordConversionBodyDto })
  @ApiResponse({ status: 200, description: 'Conversion recorded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async recordConversion(
    @Tenant() tenantId: string,
    @Param() params: CmsAnalyticsPageIdParamDto,
    @Body() body: CmsAnalyticsRecordConversionBodyDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.analyticsService.recordConversion(
        tenantId,
        params.pageId,
        body.conversionType,
      );
    } catch (error) {
      this.logger.error(
        `[recordConversion] Failed to record conversion (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
