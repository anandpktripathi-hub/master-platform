import mongoose from 'mongoose';
import { MarketplacePluginSchema } from '../database/schemas/marketplace-plugin.schema';
import { TenantPluginInstallSchema } from '../database/schemas/tenant-plugin-install.schema';

async function addMarketplaceIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const MarketplacePlugin = mongoose.model('MarketplacePlugin', MarketplacePluginSchema);
  const TenantPluginInstall = mongoose.model(
    'TenantPluginInstall',
    TenantPluginInstallSchema,
  );

  await MarketplacePlugin.collection.createIndex(
    { pluginId: 1 },
    { unique: true, name: 'pluginId_unique' },
  );

  await TenantPluginInstall.collection.createIndex(
    { tenantId: 1, pluginId: 1 },
    { unique: true, name: 'tenantId_pluginId_unique' },
  );
  await TenantPluginInstall.collection.createIndex(
    { tenantId: 1, enabled: 1 },
    { name: 'tenantId_enabled' },
  );

  await mongoose.disconnect();
  console.log('Marketplace indexes created/ensured.');
}

addMarketplaceIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
