import mongoose from 'mongoose';
import { DeveloperApiKeySchema } from '../database/schemas/developer-api-key.schema';
import { WebhookDeliveryLogSchema } from '../database/schemas/webhook-delivery-log.schema';

async function addDeveloperPortalIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const DeveloperApiKey = mongoose.model('DeveloperApiKey', DeveloperApiKeySchema);
  const WebhookDeliveryLog = mongoose.model('WebhookDeliveryLog', WebhookDeliveryLogSchema);

  await DeveloperApiKey.collection.createIndex(
    { tenantId: 1, isActive: 1 },
    { name: 'tenantId_isActive' },
  );
  await DeveloperApiKey.collection.createIndex(
    { keyHash: 1 },
    { unique: true, name: 'keyHash_unique' },
  );

  await WebhookDeliveryLog.collection.createIndex(
    { tenantId: 1, event: 1, createdAt: -1 },
    { name: 'tenantId_event_createdAt' },
  );
  await WebhookDeliveryLog.collection.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Developer portal indexes created/ensured.');
}

addDeveloperPortalIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
