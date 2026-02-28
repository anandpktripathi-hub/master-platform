import mongoose from 'mongoose';

async function run() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('Missing MONGODB_URI/DATABASE_URL');
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Mongo connection is not ready (mongoose.connection.db is undefined)');
  }

  const permissions = db.collection('permissions');
  const roles = db.collection('roles');
  const userTenants = db.collection('usertenants');

  await permissions.createIndex({ action: 1, module: 1 }, { unique: true });
  await roles.createIndex(
    { tenantId: 1, name: 1 },
    {
      unique: true,
      partialFilterExpression: { tenantId: { $type: 'objectId' } },
    },
  );
  await userTenants.createIndex({ userId: 1, tenantId: 1 }, { unique: true });

  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
