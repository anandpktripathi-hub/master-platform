import mongoose from 'mongoose';
import { UserSchema } from '../database/schemas/user.schema';

async function addUserCompoundIndex() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';
  await mongoose.connect(uri);
  const User = mongoose.model('User', UserSchema);
  await User.collection.createIndex(
    { email: 1, tenantId: 1 },
    { unique: true },
  );
  await mongoose.disconnect();
  console.log('Compound index (email + tenantId) created.');
}

addUserCompoundIndex().catch((e) => {
  console.error(e);
  process.exit(1);
});
