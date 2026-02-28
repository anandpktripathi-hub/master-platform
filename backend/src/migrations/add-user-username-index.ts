import mongoose from 'mongoose';
import { UserSchema } from '../database/schemas/user.schema';

async function addUserUsernameIndex() {
  const uri =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const User = mongoose.model('User', UserSchema);

  // Ensure unique, sparse username index exists.
  await User.collection.createIndex(
    { username: 1 },
    { unique: true, sparse: true, name: 'username_unique_sparse' },
  );

  await mongoose.disconnect();
  console.log('User username unique sparse index created.');
}

addUserUsernameIndex().catch((e) => {
  console.error(e);
  process.exit(1);
});
