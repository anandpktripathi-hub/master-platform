import { Controller, Get, Post, Param, Query, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsAnalyticsService } from '../services/cms-analytics.service';

@ApiTags('CMS - Analytics')
@Controller('api/cms/analytics')
export class CmsAnalyticsController {
  constructor(private readonly analyticsService: CmsAnalyticsService) {}

  @Post(':pageId/track')
  async trackView(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Body() metadata?: any,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.analyticsService.trackPageView(tenantId, pageId, metadata);
  }

  @Get('page/:pageId')
  async getPageAnalytics(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.analyticsService.getPageAnalytics(
      tenantId,
      pageId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('page/:pageId/stats')
  async getPageStats(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('days') days?: number,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.analyticsService.getPageStats(tenantId, pageId, days);
  }

  @Get('tenant')
  async getTenantAnalytics(@Req() req: any, @Query('days') days?: number) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.analyticsService.getTenantAnalytics(tenantId, days);
  }

  @Post(':pageId/conversion')
  async recordConversion(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Body('conversionType') conversionType: string,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.analyticsService.recordConversion(
      tenantId,
      pageId,
      conversionType,
    );
  }
}
