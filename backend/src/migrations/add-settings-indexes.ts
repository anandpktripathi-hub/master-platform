import mongoose from 'mongoose';
import { SettingSchema } from '../modules/settings/schemas/setting.schema';

async function addSettingsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Setting = mongoose.model('Setting', SettingSchema);

  await Setting.collection.createIndex(
    { group: 1, key: 1, scope: 1, tenantId: 1, locale: 1 },
    { unique: true, name: 'group_key_scope_tenant_locale_unique' },
  );

  await mongoose.disconnect();
  console.log('Setting indexes created/ensured.');
}

addSettingsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
