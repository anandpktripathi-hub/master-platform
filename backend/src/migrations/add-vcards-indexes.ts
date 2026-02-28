import mongoose from 'mongoose';
import { VCardSchema } from '../database/schemas/vcard.schema';

async function addVcardsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const VCard = mongoose.model('VCard', VCardSchema);

  await VCard.collection.createIndex(
    { tenantId: 1, displayName: 1 },
    { name: 'tenant_displayName' },
  );

  await mongoose.disconnect();
  console.log('VCards indexes created/ensured.');
}

addVcardsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
