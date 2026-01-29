import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  CmsPageEntity,
  CmsPageVersionEntity,
  CmsPageTemplateEntity,
  CmsPageVersionSchema,
  CmsPageSchema,
  CmsPageTemplateSchema,
  CmsPageAnalyticsEntity,
  CmsPageAnalyticsSchema,
  CmsSeoAuditEntity,
  CmsSeoAuditSchema,
  CmsMenuItemEntity,
  CmsMenuItemSchema,
  CmsImportRecord,
  CmsImportRecordSchema,
} from './entities/cms.entities';

import { CmsPageService } from './services/cms-page.service';
import { CmsTemplateService } from './services/cms-template.service';
import { CmsAnalyticsService } from './services/cms-analytics.service';
import { CmsSeoAuditService } from './services/cms-seo-audit.service';
import { CmsMenuService } from './services/cms-menu.service';
import { CmsFileImportService } from './services/cms-file-import.service';

import { CmsPageController } from './controllers/cms-page.controller';
import { CmsTemplateController } from './controllers/cms-template.controller';
import { CmsAnalyticsController } from './controllers/cms-analytics.controller';
import { CmsSeoAuditController } from './controllers/cms-seo-audit.controller';
import { CmsMenuController } from './controllers/cms-menu.controller';
import { CmsFileImportController } from './controllers/cms-file-import.controller';

// ...existing code...

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CmsPageVersionEntity.name, schema: CmsPageVersionSchema },
      { name: CmsPageEntity.name, schema: CmsPageSchema },
      { name: CmsPageTemplateEntity.name, schema: CmsPageTemplateSchema },
      { name: CmsPageAnalyticsEntity.name, schema: CmsPageAnalyticsSchema },
      { name: CmsSeoAuditEntity.name, schema: CmsSeoAuditSchema },
      { name: CmsMenuItemEntity.name, schema: CmsMenuItemSchema },
      { name: CmsImportRecord.name, schema: CmsImportRecordSchema },
    ]),
    // AuditModule,
  ],
  providers: [
    CmsPageService,
    CmsTemplateService,
    CmsAnalyticsService,
    CmsSeoAuditService,
    CmsMenuService,
    CmsFileImportService,
  ],
  controllers: [
    CmsPageController,
    CmsTemplateController,
    CmsAnalyticsController,
    CmsSeoAuditController,
    CmsMenuController,
    CmsFileImportController,
  ],
  exports: [CmsPageService, CmsTemplateService, CmsAnalyticsService],
})
export class CmsModule {}
