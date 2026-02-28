import mongoose from 'mongoose';
import { AuthTokenSchema } from '../modules/auth/schemas/auth-token.schema';

async function addAuthIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const AuthToken = mongoose.model('AuthToken', AuthTokenSchema);

  await AuthToken.collection.createIndex(
    { token: 1 },
    { unique: true, name: 'token_unique' },
  );

  await AuthToken.collection.createIndex(
    { userId: 1, type: 1, used: 1 },
    { name: 'userId_type_used' },
  );

  await AuthToken.collection.createIndex(
    { used: 1, usedAt: 1 },
    { name: 'used_usedAt' },
  );

  // Keep expired tokens for 7 days after expiry (matches schema TTL configuration)
  await AuthToken.collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 604800, name: 'expiresAt_ttl_7d' },
  );

  await mongoose.disconnect();
  console.log('AuthToken indexes created/ensured.');
}

addAuthIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
