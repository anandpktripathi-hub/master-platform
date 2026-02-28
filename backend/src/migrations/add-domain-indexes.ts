import mongoose from 'mongoose';
import { DomainSchema } from '../database/schemas/domain.schema';
import { CustomDomainSchema } from '../database/schemas/custom-domain.schema';
import { DomainResellerOrderSchema } from '../database/schemas/domain-reseller-order.schema';

async function addDomainIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Domain = mongoose.model('Domain', DomainSchema);
  const CustomDomain = mongoose.model('CustomDomain', CustomDomainSchema);
  const DomainResellerOrder = mongoose.model(
    'DomainResellerOrder',
    DomainResellerOrderSchema,
  );

  // Domain
  await Domain.collection.createIndex(
    { type: 1, value: 1 },
    { unique: true, name: 'type_value_unique' },
  );
  await Domain.collection.createIndex(
    { tenantId: 1, type: 1 },
    { name: 'tenantId_type' },
  );
  await Domain.collection.createIndex(
    { tenantId: 1, isPrimary: 1 },
    {
      unique: true,
      name: 'tenant_primary_active_unique',
      partialFilterExpression: { isPrimary: true, status: 'active' },
    },
  );

  // CustomDomain
  await CustomDomain.collection.createIndex(
    { domain: 1 },
    { unique: true, name: 'domain_unique' },
  );
  await CustomDomain.collection.createIndex(
    { tenantId: 1, status: 1 },
    { name: 'tenantId_status' },
  );
  await CustomDomain.collection.createIndex(
    { sslExpiresAt: 1, status: 1 },
    { name: 'sslExpiresAt_status' },
  );
  await CustomDomain.collection.createIndex(
    { tenantId: 1, isPrimary: 1 },
    {
      unique: true,
      name: 'tenant_primary_active_unique',
      partialFilterExpression: { isPrimary: true, status: 'active' },
    },
  );

  // DomainResellerOrder
  await DomainResellerOrder.collection.createIndex(
    { tenantId: 1, domain: 1 },
    { name: 'tenantId_domain' },
  );

  await mongoose.disconnect();
  console.log('Domain indexes created/ensured.');
}

addDomainIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
