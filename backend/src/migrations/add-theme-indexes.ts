import mongoose from 'mongoose';
import { ThemeSchema } from '../modules/themes/schemas/theme.schema';
import { TenantThemeSchema } from '../modules/themes/schemas/tenant-theme.schema';

async function addThemeIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Theme = mongoose.model('Theme', ThemeSchema);
  const TenantTheme = mongoose.model('TenantTheme', TenantThemeSchema);

  // Themes
  await Theme.collection.createIndex({ name: 1 }, { unique: true, name: 'name_unique' });
  await Theme.collection.createIndex({ key: 1 }, { unique: true, name: 'key_unique' });
  await Theme.collection.createIndex({ status: 1 }, { name: 'status' });
  await Theme.collection.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });

  // Tenant themes
  await TenantTheme.collection.createIndex(
    { tenantId: 1 },
    { unique: true, name: 'tenant_unique' },
  );
  await TenantTheme.collection.createIndex({ themeId: 1 }, { name: 'themeId' });
  await TenantTheme.collection.createIndex({ updatedAt: -1 }, { name: 'updatedAt_desc' });

  await mongoose.disconnect();
  console.log('Theme indexes created/ensured.');
}

addThemeIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
