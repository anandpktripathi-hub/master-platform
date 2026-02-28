import mongoose from 'mongoose';
import {
  CmsImportRecordSchema,
  CmsMenuItemSchema,
  CmsPageAnalyticsSchema,
  CmsPageSchema,
  CmsPageTemplateSchema,
  CmsPageVersionSchema,
  CmsSeoAuditSchema,
} from '../cms/entities/cms.entities';

async function addCmsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const CmsPage = mongoose.model('CmsPageEntity', CmsPageSchema);
  const CmsPageVersion = mongoose.model('CmsPageVersionEntity', CmsPageVersionSchema);
  const CmsTemplate = mongoose.model('CmsPageTemplateEntity', CmsPageTemplateSchema);
  const CmsMenuItem = mongoose.model('CmsMenuItemEntity', CmsMenuItemSchema);
  const CmsPageAnalytics = mongoose.model('CmsPageAnalyticsEntity', CmsPageAnalyticsSchema);
  const CmsSeoAudit = mongoose.model('CmsSeoAuditEntity', CmsSeoAuditSchema);
  const CmsImportRecord = mongoose.model('CmsImportRecord', CmsImportRecordSchema);

  await CmsPage.collection.createIndex(
    { tenantId: 1, slug: 1 },
    { name: 'tenant_slug' },
  );
  await CmsPage.collection.createIndex(
    { tenantId: 1, status: 1, visibility: 1, updatedAt: -1 },
    { name: 'tenant_status_visibility_updatedAt' },
  );

  await CmsPageVersion.collection.createIndex(
    { pageId: 1, version: 1 },
    { name: 'page_version', unique: true },
  );

  await CmsTemplate.collection.createIndex(
    { name: 1 },
    { name: 'template_name' },
  );

  await CmsMenuItem.collection.createIndex(
    { tenantId: 1, menuName: 1, sortOrder: 1 },
    { name: 'tenant_menu_sortOrder' },
  );

  await CmsPageAnalytics.collection.createIndex(
    { tenantId: 1, pageId: 1 },
    { name: 'tenant_page_analytics', unique: true },
  );

  await CmsSeoAudit.collection.createIndex(
    { tenantId: 1, pageId: 1 },
    { name: 'tenant_page_seo_audit', unique: true },
  );

  await CmsImportRecord.collection.createIndex(
    { tenantId: 1, status: 1, createdAt: -1 },
    { name: 'tenant_import_status_createdAt' },
  );

  await mongoose.disconnect();
  console.log('CMS indexes created/ensured.');
}

addCmsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
