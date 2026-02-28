import mongoose from 'mongoose';
import { PushSubscriptionSchema } from '../database/schemas/push-subscription.schema';
import { UserNotificationSchema } from '../database/schemas/user-notification.schema';

async function addNotificationIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const PushSubscription = mongoose.model('PushSubscription', PushSubscriptionSchema);
  const UserNotification = mongoose.model('UserNotification', UserNotificationSchema);

  // Push subscriptions
  await PushSubscription.collection.createIndex(
    { endpoint: 1 },
    { unique: true, name: 'endpoint_unique' },
  );
  await PushSubscription.collection.createIndex(
    { tenantId: 1, userId: 1 },
    { name: 'tenant_user' },
  );
  await PushSubscription.collection.createIndex(
    { tenantId: 1, endpoint: 1 },
    { name: 'tenant_endpoint' },
  );

  // User notifications
  await UserNotification.collection.createIndex(
    { tenantId: 1, userId: 1, createdAt: -1 },
    { name: 'tenant_user_createdAt' },
  );
  await UserNotification.collection.createIndex(
    { tenantId: 1, userId: 1, read: 1 },
    { name: 'tenant_user_read' },
  );

  await mongoose.disconnect();
  console.log('Notification indexes created/ensured.');
}

addNotificationIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
