import mongoose from 'mongoose';
import { BillingSchema } from '../database/schemas/billing.schema';

async function addBillingIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Billing = mongoose.model('Billing', BillingSchema);

  await Billing.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );

  await Billing.collection.createIndex(
    { tenantId: 1, status: 1, createdAt: -1 },
    { name: 'tenant_status_createdAt' },
  );

  await Billing.collection.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Billing indexes created/ensured.');
}

addBillingIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
