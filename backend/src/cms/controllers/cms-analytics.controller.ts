import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsAnalyticsService } from '../services/cms-analytics.service';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('CMS - Analytics')
@Controller('cms/analytics')
export class CmsAnalyticsController {
  constructor(private readonly analyticsService: CmsAnalyticsService) {}

  @Post(':pageId/track')
  async trackView(
    @Tenant() tenantId: string,
    @Param('pageId') pageId: string,
    @Body() metadata?: any,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.analyticsService.trackPageView(tenantId, pageId, metadata);
  }

  @Get('page/:pageId')
  async getPageAnalytics(
    @Tenant() tenantId: string,
    @Param('pageId') pageId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.analyticsService.getPageAnalytics(
      tenantId,
      pageId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('page/:pageId/stats')
  async getPageStats(
    @Tenant() tenantId: string,
    @Param('pageId') pageId: string,
    @Query('days') days?: number,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.analyticsService.getPageStats(tenantId, pageId, days);
  }

  @Get('tenant')
  async getTenantAnalytics(@Tenant() tenantId: string, @Query('days') days?: number) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.analyticsService.getTenantAnalytics(tenantId, days);
  }

  @Post(':pageId/conversion')
  async recordConversion(
    @Tenant() tenantId: string,
    @Param('pageId') pageId: string,
    @Body('conversionType') conversionType: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.analyticsService.recordConversion(
      tenantId,
      pageId,
      conversionType,
    );
  }
}
