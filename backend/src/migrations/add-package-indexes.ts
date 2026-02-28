import mongoose from 'mongoose';
import { PackageSchema } from '../database/schemas/package.schema';
import { TenantPackageSchema } from '../database/schemas/tenant-package.schema';

async function addPackageIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Package = mongoose.model('Package', PackageSchema);
  const TenantPackage = mongoose.model('TenantPackage', TenantPackageSchema);

  await Package.collection.createIndex(
    { isActive: 1, order: 1 },
    { name: 'isActive_1_order_1' },
  );

  await TenantPackage.collection.createIndex(
    { tenantId: 1 },
    { name: 'tenantId_1', unique: true },
  );

  await TenantPackage.collection.createIndex(
    { packageId: 1, status: 1 },
    { name: 'packageId_1_status_1' },
  );

  await TenantPackage.collection.createIndex(
    { expiresAt: 1, status: 1 },
    { name: 'expiresAt_1_status_1' },
  );

  await TenantPackage.collection.createIndex(
    { expiresAt: 1, expiryWarningSent: 1 },
    { name: 'expiresAt_1_expiryWarningSent_1' },
  );

  await mongoose.disconnect();
  console.log('Package/TenantPackage indexes created/ensured.');
}

addPackageIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
