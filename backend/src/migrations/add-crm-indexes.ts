import mongoose from 'mongoose';
import { CrmContactSchema } from '../database/schemas/crm-contact.schema';
import { CrmCompanySchema } from '../database/schemas/crm-company.schema';
import { CrmDealSchema } from '../database/schemas/crm-deal.schema';
import { CrmTaskSchema } from '../database/schemas/crm-task.schema';

async function addCrmIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const CrmContact = mongoose.model('CrmContact', CrmContactSchema);
  const CrmCompany = mongoose.model('CrmCompany', CrmCompanySchema);
  const CrmDeal = mongoose.model('CrmDeal', CrmDealSchema);
  const CrmTask = mongoose.model('CrmTask', CrmTaskSchema);

  await CrmContact.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );
  await CrmContact.collection.createIndex(
    { tenantId: 1, email: 1 },
    { name: 'tenant_email' },
  );

  await CrmCompany.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );
  await CrmCompany.collection.createIndex(
    { tenantId: 1, name: 1 },
    { name: 'tenant_name' },
  );

  await CrmDeal.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );
  await CrmDeal.collection.createIndex(
    { tenantId: 1, stage: 1, createdAt: -1 },
    { name: 'tenant_stage_createdAt' },
  );
  await CrmDeal.collection.createIndex(
    { tenantId: 1, ownerId: 1, createdAt: -1 },
    { name: 'tenant_owner_createdAt' },
  );

  await CrmTask.collection.createIndex(
    { tenantId: 1, assigneeId: 1, dueDate: 1 },
    { name: 'tenant_assignee_dueDate' },
  );
  await CrmTask.collection.createIndex(
    { tenantId: 1, assigneeId: 1, completed: 1, dueDate: 1 },
    { name: 'tenant_assignee_completed_dueDate' },
  );
  await CrmTask.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );

  await mongoose.disconnect();
  console.log('CRM indexes created/ensured.');
}

addCrmIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
