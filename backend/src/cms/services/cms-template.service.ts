// === CMS TYPES & ENUMS ===
import {
  CmsPageEntity,
  CmsPageVersionEntity,
  CmsPageTemplateEntity,
} from '../entities/cms.entities';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
// === END IMPORTS ===

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CmsTemplateService {
  async getTemplateById(tenantId: string, id: string) {
    return this.templateRepo.findOne({ where: { id, tenantId } });
  }

  async useTemplate(
    tenantId: string,
    userId: string,
    templateId: string,
    pageName: string,
  ) {
    // Example logic: clone template to a new page (pseudo-implementation)
    const template = await this.templateRepo.findOne({
      where: { id: templateId, tenantId },
    });
    if (!template) throw new Error('Template not found');
    // You may want to use a real CmsPageEntity and repo here
    // For now, just return a mock result
    return {
      message: `Template ${templateId} used to create page '${pageName}' for tenant ${tenantId} by user ${userId}`,
      template,
      pageName,
    };
  }
  constructor(
    @InjectModel(CmsPageTemplateEntity.name)
    private templateRepo: Model<CmsPageTemplateEntity>,
  ) {}

  async createTemplate(tenantId: string, userId: string, dto: any) {
    return await this.templateRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });
  }

  async getTemplates(tenantId: string, query: any) {
    return this.templateRepo.find({ tenantId, ...query });
  }

  async getPopularTemplates(tenantId: string, limit?: number) {
    return this.templateRepo
      .find({ tenantId })
      .sort({ usageCount: -1 })
      .limit(limit || 10);
  }

  async getTemplatesByCategory(tenantId: string, category: string) {
    return this.templateRepo.find({ tenantId, category });
  }

  async updateTemplate(tenantId: string, id: string, dto: any) {
    return this.templateRepo.findOneAndUpdate({ _id: id, tenantId }, dto, {
      new: true,
    });
  }

  async deleteTemplate(tenantId: string, id: string) {
    return this.templateRepo.findOneAndDelete({ _id: id, tenantId });
  }
}
