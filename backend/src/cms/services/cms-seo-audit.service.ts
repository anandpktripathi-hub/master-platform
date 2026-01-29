// === CMS TYPES & ENUMS ===
import {
  CmsPageEntity,
  CmsPageVersionEntity,
  CmsPageTemplateEntity,
  CmsSeoAuditEntity,
} from '../entities/cms.entities';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
// === END IMPORTS ===

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CmsSeoAuditService {
  constructor(
    @InjectModel(CmsSeoAuditEntity.name)
    private auditRepo: Model<CmsSeoAuditEntity>,
    @InjectModel(CmsPageEntity.name)
    private pageRepo: Model<CmsPageEntity>,
  ) {}

  async runAudit(tenantId: string, pageId: string): Promise<CmsSeoAuditEntity> {
    try {
      const page = await this.pageRepo.findOne({ _id: pageId, tenantId });
      if (!page) {
        throw new NotFoundException('Page not found');
      }
      const issues: string[] = [];
      let score = 100;
      const titleTag = page.metaTags?.title || page.title;
      if (!titleTag || titleTag.length === 0) {
        issues.push('Missing or empty title tag');
        score -= 10;
      } else if (titleTag.length < 30) {
        issues.push('Title tag is too short (min 30 chars)');
        score -= 5;
      } else if (titleTag.length > 60) {
        issues.push('Title tag is too long (max 60 chars)');
        score -= 5;
      }
      const metaDescription = page.metaTags?.description;
      if (!metaDescription || metaDescription.length === 0) {
        issues.push('Missing meta description');
        score -= 10;
      } else if (metaDescription.length < 120) {
        issues.push('Meta description is too short (min 120 chars)');
        score -= 5;
      } else if (metaDescription.length > 160) {
        issues.push('Meta description is too long (max 160 chars)');
        score -= 5;
      }
      const keywords = page.metaTags?.keywords || [];
      if (!keywords || keywords.length === 0) {
        issues.push('No keywords defined');
        score -= 10;
      } else if (keywords.length < 3) {
        issues.push('Too few keywords (min 3)');
        score -= 5;
      }
      let contentObj: any = {};
      try {
        contentObj =
          typeof page.content === 'string'
            ? JSON.parse(page.content)
            : page.content;
      } catch {
        contentObj = {};
      }
      const hasH1 = contentObj?.headings?.some((h: any) => h.level === 1);
      if (!hasH1) {
        issues.push('Missing H1 tag');
        score -= 15;
      }
      const images = contentObj?.images || [];
      const missingAltCount = images.filter((img: any) => !img.alt).length;
      if (missingAltCount > 0) {
        issues.push(`${missingAltCount} images missing alt text`);
        score -= Math.min(missingAltCount * 2, 10);
      }
      if (!page.jsonLd) {
        issues.push('No structured data (JSON-LD)');
        score -= 5;
      }
      const status = score >= 80 ? 'PASS' : score >= 60 ? 'WARN' : 'FAIL';
      let audit = await this.auditRepo.findOne({ pageId, tenantId });
      if (!audit) {
        audit = await this.auditRepo.create({
          pageId,
          tenantId,
          score: Math.max(0, score),
        });
      }
      audit.score = Math.max(0, score);
      // Store issues and recommendations in recommendations property as JSON
      audit.recommendations = {
        issues,
        titleTag,
        metaDescription,
        keywords,
        status,
      };
      return audit.save();
    } catch (error) {
      throw new NotFoundException('Failed to run SEO audit');
    }
  }
  async getAudit(tenantId: string, pageId: string): Promise<CmsSeoAuditEntity> {
    try {
      const audit = await this.auditRepo.findOne({ pageId, tenantId });
      if (!audit) {
        throw new NotFoundException('No audit found for this page');
      }
      return audit;
    } catch (error) {
      throw new NotFoundException('Invalid page ID');
    }
  }

  async getRecommendations(
    tenantId: string,
    pageId: string,
  ): Promise<{
    score: number;
    status: string;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const audit = await this.getAudit(tenantId, pageId);
      const recommendations: string[] = [];
      const rec = audit.recommendations || {};

      // Status logic
      const status =
        audit.score >= 80 ? 'PASS' : audit.score >= 60 ? 'WARN' : 'FAIL';

      // SEO checks
      if (!rec.titleTag || rec.titleTag.length < 30) {
        recommendations.push(
          'Increase title tag length to 30-60 characters for better SEO visibility',
        );
      }
      if (!rec.metaDescription || rec.metaDescription.length < 120) {
        recommendations.push(
          'Write compelling meta description (120-160 chars) to improve CTR',
        );
      }
      if (audit.issues?.includes('Missing H1 tag')) {
        recommendations.push(
          'Add H1 heading that includes your primary keyword',
        );
      }
      if (
        audit.issues?.some((i: string) => i.includes('images missing alt text'))
      ) {
        recommendations.push(
          'Add descriptive alt text to all images for accessibility and SEO',
        );
      }

      // Default recommendations
      recommendations.push('Submit sitemap to Google Search Console');
      recommendations.push(
        'Ensure mobile responsiveness for better mobile rankings',
      );
      recommendations.push('Improve page load speed (target < 3 seconds)');

      return {
        score: audit.score,
        status,
        issues: audit.issues || [],
        recommendations,
      };
    } catch (error) {
      return {
        score: 0,
        status: 'FAIL',
        issues: ['Service error'],
        recommendations: ['Check service logs'],
      };
    }
  }
}
