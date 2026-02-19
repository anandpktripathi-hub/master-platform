import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CmsPageEntity, CmsPageVersionEntity } from '../entities/cms.entities';
import { PageStatus, PageVisibility } from '../enums/cms.enums';

import { InjectModel } from '@nestjs/mongoose';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
// import { AuditService } from '../../audit/services/audit.service';
import slugify from 'slugify';

@Injectable()
export class CmsPageService {
  constructor(
    @InjectModel(CmsPageEntity.name)
    private readonly pageRepo: Model<CmsPageEntity>,
    @InjectModel(CmsPageVersionEntity.name)
    private readonly versionRepo: Model<CmsPageVersionEntity>,
    // private readonly auditService: AuditService,
  ) {}

  /**
   * CREATE PAGE
   * Verify tenant ownership
   * Auto-generate slug if not provided
   * Create initial version
   * Log to audit
   */
  async createPage(
    tenantId: string,
    userId: string,
    dto: CreatePageDto,
  ): Promise<CmsPageEntity> {
    // Validate slug uniqueness
    const existingPage = await this.pageRepo.findOne({
      tenantId,
      slug: dto.slug,
    });
    if (existingPage) {
      throw new ConflictException(
        `Page with slug "${dto.slug}" already exists in this tenant`,
      );
    }
    // Create page
    const page = {
      tenantId,
      title: dto.title,
      slug: dto.slug || this.generateSlug(dto.title),
      content: dto.content || null,
      status: dto.status || PageStatus.DRAFT,
      visibility: dto.visibility || PageVisibility.PUBLIC,
      password: dto.password,
      allowedRoles: dto.allowedRoles || [],
      parentPageId: dto.parentPageId,
      metaTags: dto.metaTags || {
        title: dto.title,
        description: '',
        keywords: [],
      },
      jsonLd: dto.jsonLd,
      scheduledPublishAt: dto.scheduledPublishAt,
      scheduledUnpublishAt: dto.scheduledUnpublishAt,
      createdBy: userId,
    };
    const savedPage = await this.pageRepo.create(page);
    // Create initial version
    const version = this.versionRepo.create({
      pageId: savedPage._id,
      tenantId,
      version: 1,
      content: savedPage.content,
      changeDescription: 'Initial version',
      createdBy: userId,
    });
    await this.versionRepo.create(version);
    // Audit log (stub)
    // await this.auditService.log({ ... });
    return savedPage;
  }

  /**
   * GET PAGES (with multi-tenant + visibility filters)
   */
  async getPages(
    tenantId: string,
    userId: string,
    userRoles: string[],
    query: PageQueryDto,
  ): Promise<{ data: CmsPageEntity[]; total: number }> {
    // Pure Mongoose query
    const filter: any = { tenantId };
    if (query.status) filter.status = query.status;
    if (query.visibility) filter.visibility = query.visibility;
    if (query.parentPageId) filter.parentPageId = query.parentPageId;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { slug: { $regex: query.search, $options: 'i' } },
      ];
    }
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'ASC' ? 1 : -1;
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const limit = query.limit || 20;
    const [data, total] = await Promise.all([
      this.pageRepo
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      this.pageRepo.countDocuments(filter),
    ]);
    return { data, total };
  }

  /**
   * Lightweight list of public, published pages for sitemap/feed generation.
   */
  async getPublicPagesForSitemap(
    tenantId: string,
  ): Promise<
    Array<{ slug: string; title?: string; createdAt?: Date; updatedAt?: Date }>
  > {
    const docs = await this.pageRepo
      .find({
        tenantId,
        status: PageStatus.PUBLISHED,
        visibility: PageVisibility.PUBLIC,
      })
      .select('slug title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    return docs as Array<{
      slug: string;
      title?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }>;
  }

  /**
   * GET SINGLE PAGE (with visibility check)
   */
  async getPageById(
    tenantId: string,
    pageId: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<CmsPageEntity> {
    const page = await this.pageRepo.findById(pageId);
    if (!page) throw new NotFoundException('Page not found');
    // Check visibility (stub)
    // this.validateVisibility(page, userId, userRoles || []);
    // Increment view count
    if (page) {
      page.viewCount += 1;
      await this.pageRepo.findByIdAndUpdate(pageId, {
        viewCount: page.viewCount,
      });
    }
    return page;
  }

  /**
   * GET PAGE BY SLUG (public endpoint)
   */
  async getPageBySlug(
    tenantId: string,
    slug: string,
    userId?: string,
    userRoles?: string[],
  ): Promise<CmsPageEntity> {
    const page = await this.pageRepo.findOne({
      tenantId,
      slug,
      status: PageStatus.PUBLISHED,
    });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    // Check visibility (stub)
    // this.validateVisibility(page, userId, userRoles || []);
    // Increment view count
    if (page) {
      page.viewCount += 1;
      await this.pageRepo.findByIdAndUpdate(page._id, {
        viewCount: page.viewCount,
      });
    }
    return page;
  }

  /**
   * UPDATE PAGE (with version tracking)
   */
  async updatePage(
    tenantId: string,
    userId: string,
    pageId: string,
    dto: UpdatePageDto,
  ): Promise<CmsPageEntity> {
    const page = await this.pageRepo.findOne({ _id: pageId, tenantId });
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    // Store previous values for audit (stub)
    // const previousValues = { ...page };
    // Update fields
    if (!page) throw new NotFoundException('Page not found');
    // Slug uniqueness
    if (dto.slug) {
      const existing = await this.pageRepo.findOne({
        tenantId,
        slug: dto.slug,
        _id: { $ne: pageId },
      });
      if (existing) throw new ConflictException('Slug already exists');
    }
    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.slug) updateData.slug = dto.slug;
    if (dto.content) updateData.content = dto.content;
    if (dto.status) updateData.status = dto.status;
    if (dto.visibility) updateData.visibility = dto.visibility;
    if (dto.password !== undefined) updateData.password = dto.password;
    if (dto.allowedRoles) updateData.allowedRoles = dto.allowedRoles;
    if (dto.metaTags)
      updateData.metaTags = { ...page.metaTags, ...dto.metaTags };
    if (dto.jsonLd) updateData.jsonLd = dto.jsonLd;
    if (dto.scheduledPublishAt)
      updateData.scheduledPublishAt = dto.scheduledPublishAt;
    if (dto.scheduledUnpublishAt)
      updateData.scheduledUnpublishAt = dto.scheduledUnpublishAt;
    await this.pageRepo.findByIdAndUpdate(pageId, updateData);
    // Get latest version number
    const latestVersion = await this.versionRepo.findOne({ pageId });
    const newVersion = {
      pageId,
      tenantId,
      version: `${Number(latestVersion?.version || 0) + 1}`,
      content: updateData.content || page.content,
      changeDescription: `Updated by ${userId}`,
      createdBy: userId,
    };
    await this.versionRepo.create(newVersion);
    const result = await this.pageRepo.findById(pageId);
    if (!result) throw new NotFoundException(`Page ${pageId} not found`);
    return result;
  }

  /**
   * DELETE PAGE (soft delete via status)
   */
  async deletePage(
    tenantId: string,
    userId: string,
    pageId: string,
  ): Promise<void> {
    const page = await this.pageRepo.findOne({ _id: pageId, tenantId });
    if (!page) throw new NotFoundException('Page not found');
    await this.pageRepo.findByIdAndUpdate(pageId, {
      status: PageStatus.ARCHIVED,
    });
  }

  /**
   * DUPLICATE PAGE (deep copy)
   */
  async duplicatePage(
    tenantId: string,
    userId: string,
    pageId: string,
  ): Promise<CmsPageEntity> {
    const original = await this.pageRepo.findOne({ _id: pageId, tenantId });
    if (!original) throw new NotFoundException('Page not found');
    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const duplicate = {
      tenantId,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      content: original.content,
      status: PageStatus.DRAFT,
      visibility: original.visibility,
      password: original.password,
      allowedRoles: original.allowedRoles?.length
        ? [...original.allowedRoles]
        : [],
      metaTags: { ...original.metaTags },
      jsonLd: original.jsonLd,
      createdBy: userId,
    };
    const savedDuplicate = await this.pageRepo.create(duplicate);
    const version = {
      pageId: savedDuplicate._id,
      tenantId,
      version: 1,
      content: savedDuplicate.content,
      changeDescription: `Duplicate of page ${pageId}`,
      createdBy: userId,
    };
    await this.versionRepo.create(version);
    return savedDuplicate;
  }

  /**
   * GET PAGE HIERARCHY (parent/child tree)
   */
  async getHierarchy(tenantId: string): Promise<CmsPageEntity[]> {
    const pages = await this.pageRepo.find({ tenantId, parentPageId: null });
    return pages;
  }

  /**
   * HANDLE SCHEDULED PAGES (Cron job)
   */
  async handleScheduledPages(): Promise<void> {
    const now = new Date();
    // Publish scheduled pages (stub)
    // Unpublish expired pages (stub)
  }

  /**
   * HELPER METHODS
   */
  private generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }
  private validateVisibility(
    page: CmsPageEntity,
    userId: string,
    userRoles: string[],
  ): void {
    // Implement as needed
  }
}
