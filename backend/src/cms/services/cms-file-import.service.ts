import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CmsImportRecord, CmsPageEntity } from '../entities/cms.entities';
import {
  ImportStatus,
  ImportType,
  PageStatus,
  PageVisibility,
} from '../enums/cms.enums';

import * as unzipper from 'unzipper';
import * as cheerio from 'cheerio';
import { CmsPageService } from './cms-page.service';

export interface CmsImportStatus {
  status: ImportStatus | 'not_found';
  pagesCreated: number;
}

@Injectable()
export class CmsFileImportService {
  private readonly logger = new Logger(CmsFileImportService.name);

  constructor(
    private readonly cmsPageService: CmsPageService,
    @InjectModel(CmsImportRecord.name)
    private readonly cmsImportRepository: Model<CmsImportRecord>,
  ) {}

  // 1. CREATE IMPORT (CORRECTED SIGNATURE & IMPLEMENTATION)
  async createImport(
    tenantId: string,
    userId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    importType: ImportType,
    metadata?: any,
  ): Promise<CmsImportRecord> {
    const importRecord = await this.cmsImportRepository.create({
      tenantId,
      fileName,
      status: ImportStatus.PENDING,
      pagesCreated: 0,
      createdAt: new Date(),
    });
    return importRecord;
  }

  // 2. PROCESS ZIP IMPORT
  async processZipImport(
    tenantId: string,
    importId: string,
    zipBuffer: Buffer,
  ): Promise<void> {
    const pages = await this.extractAndCreatePages(zipBuffer, tenantId);
    const importRecord = await this.cmsImportRepository.findOne({
      _id: importId,
      tenantId,
    });
    if (importRecord) {
      importRecord.status = ImportStatus.COMPLETED;
      importRecord.pagesCreated = pages.length;
      await importRecord.save();
    }
  }

  // 3. STATUS CHECKER
  async getImportStatus(
    tenantId: string,
    importId: string,
  ): Promise<CmsImportStatus> {
    const record = await this.cmsImportRepository.findOne({
      _id: importId,
      tenantId,
    });
    return record
      ? { status: record.status as any, pagesCreated: record.pagesCreated ?? 0 }
      : { status: 'not_found', pagesCreated: 0 };
  }

  // 4. HISTORY
  async getImportHistory(tenantId: string): Promise<CmsImportRecord[]> {
    return this.cmsImportRepository
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  private async extractAndCreatePages(zipBuffer: Buffer, tenantId: string) {
    const pages = [];
    try {
      const zip = await unzipper.Open.buffer(zipBuffer);
      for (const entry of zip.files) {
        if (entry.type === 'File' && entry.path.endsWith('.html')) {
          const content = await entry.buffer();
          const html = content.toString('utf8');
          const $ = cheerio.load(html);
          const title = $('title').text().trim() || 'Imported Page';
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          const page = await this.cmsPageService.createPage(
            tenantId,
            'import-script',
            {
              title,
              slug,
              status: PageStatus.DRAFT as any,
              visibility: PageVisibility.PRIVATE as any,
              content: [{ type: 'html', content: html }],
            },
          );
          pages.push(page);
        }
      }
    } catch (err) {
      this.logger.error('ZIP import failed', err);
      throw new BadRequestException('Import failed');
    }
    return pages;
  }
}
