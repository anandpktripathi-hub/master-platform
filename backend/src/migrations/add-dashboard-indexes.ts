import mongoose from 'mongoose';
import { DashboardSchema } from '../database/schemas/dashboard.schema';
import { AuditLogSchema } from '../database/schemas/audit-log.schema';

async function addDashboardIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Dashboard = mongoose.model('Dashboard', DashboardSchema);
  const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

  // Keep migrations aligned with schema-defined indexes.
  await Dashboard.collection.createIndex(
    { tenantId: 1 },
    { name: 'tenantId_1' },
  );

  await AuditLog.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenantId_1_createdAt_-1' },
  );
  await AuditLog.collection.createIndex(
    { actorId: 1, createdAt: -1 },
    { name: 'actorId_1_createdAt_-1' },
  );
  await AuditLog.collection.createIndex(
    { resourceType: 1, resourceId: 1 },
    { name: 'resourceType_1_resourceId_1' },
  );
  await AuditLog.collection.createIndex(
    { action: 1, createdAt: -1 },
    { name: 'action_1_createdAt_-1' },
  );

  await mongoose.disconnect();
  console.log('Dashboard/AuditLog indexes created/ensured.');
}

addDashboardIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
