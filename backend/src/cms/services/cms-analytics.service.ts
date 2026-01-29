import { Model } from 'mongoose';
import {
  CmsPageAnalyticsEntity,
  CmsPageEntity,
} from '../entities/cms.entities';
import { PageStatus } from '../enums/cms.enums';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CmsAnalyticsService {
  constructor(
    @InjectModel(CmsPageAnalyticsEntity.name)
    private analyticsRepo: Model<CmsPageAnalyticsEntity>,
  ) {}

  async trackPageView(
    tenantId: string,
    pageId: string,
    metadata?: any,
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let analytics = await this.analyticsRepo.findOne({ pageId, date: today });
      if (!analytics) {
        analytics = await this.analyticsRepo.create({
          pageId,
          tenantId,
          views: 1,
          uniqueVisitors: 1,
          date: today,
          metadata,
        });
      } else {
        analytics.views += 1;
        if (metadata?.isNewVisitor) {
          analytics.uniqueVisitors += 1;
        }
        await analytics.save();
      }
    } catch (error) {
      // Silent fail for analytics
      console.error('Analytics tracking error:', error);
    }
  }

  async getPageAnalytics(
    tenantId: string,
    pageId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CmsPageAnalyticsEntity[]> {
    try {
      const query: any = { pageId, tenantId };
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }
      return this.analyticsRepo.find(query).sort({ date: -1 });
    } catch (error) {
      throw new NotFoundException('Page not found');
    }
  }

  async getPageStats(
    tenantId: string,
    pageId: string,
    days: number = 30,
  ): Promise<{
    totalViews: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
    trend: any[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const analytics = await this.getPageAnalytics(
        tenantId,
        pageId,
        startDate,
        endDate,
      );
      const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
      const uniqueVisitors = analytics.reduce(
        (sum, a) => sum + a.uniqueVisitors,
        0,
      );
      const avgTimeOnPage =
        analytics.reduce((sum, a) => sum + (a.avgTimeOnPage || 0), 0) /
        analytics.length;
      const bounceRate =
        analytics.reduce((sum, a) => sum + (a.bounceRate || 0), 0) /
        analytics.length;
      return {
        totalViews,
        uniqueVisitors,
        avgTimeOnPage,
        bounceRate,
        trend: analytics,
      };
    } catch (error) {
      throw new NotFoundException('Page not found');
    }
  }

  async getTenantAnalytics(
    tenantId: string,
    days: number = 30,
  ): Promise<{
    totalPages: number;
    totalViews: number;
    totalUniqueVisitors: number;
    topPages: any[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const analytics = await this.analyticsRepo.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate },
    });
    const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const totalUniqueVisitors = analytics.reduce(
      (sum, a) => sum + a.uniqueVisitors,
      0,
    );
    const uniquePageIds = [
      ...new Set(analytics.map((a) => a.pageId.toString())),
    ];
    const pageGroups = analytics.reduce((acc, a) => {
      const key = a.pageId.toString();
      if (!acc[key]) {
        acc[key] = { views: 0, visitors: 0, pageId: a.pageId };
      }
      acc[key].views += a.views;
      acc[key].visitors += a.uniqueVisitors;
      return acc;
    }, {} as any);
    const topPages = Object.values(pageGroups)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10);
    return {
      totalPages: uniquePageIds.length,
      totalViews,
      totalUniqueVisitors,
      topPages,
    };
  }

  async recordConversion(
    tenantId: string,
    pageId: string,
    conversionType: string,
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const analytics = await this.analyticsRepo.findOne({
        pageId,
        tenantId,
        date: today,
      });
      if (analytics) {
        analytics.conversionRate = (analytics.conversionRate || 0) + 1;
        await analytics.save();
      }
    } catch (error) {
      console.error('Conversion tracking error:', error);
    }
  }
}
