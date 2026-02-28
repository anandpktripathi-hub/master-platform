import mongoose from 'mongoose';
import { ThemeSchema } from '../database/schemas/theme.schema';

async function addThemeModuleIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Theme = mongoose.model('Theme', ThemeSchema);

  await Theme.collection.createIndex(
    { tenantId: 1, name: 1 },
    { name: 'tenant_name' },
  );

  await mongoose.disconnect();
  console.log('Theme (legacy module) indexes created/ensured.');
}

addThemeModuleIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
