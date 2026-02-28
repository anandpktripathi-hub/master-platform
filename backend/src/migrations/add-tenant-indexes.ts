import mongoose from 'mongoose';

/**
 * Ensures required tenant/business review indexes exist (production often has autoIndex disabled).
 */
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

  const tenants = db.collection('tenants');
  const reviews = db.collection('businessreviews');

  // Tenant identity & routing
  await tenants.createIndex({ slug: 1 }, { unique: true });
  await tenants.createIndex({ domain: 1 }, { unique: true, sparse: true });
  await tenants.createIndex({ customDomains: 1 });

  // Public directory listing
  await tenants.createIndex({
    isActive: 1,
    isListedInDirectory: 1,
    directoryVisibility: 1,
    avgRating: -1,
  });

  // Reviews listing (per-tenant)
  await reviews.createIndex({ tenantId: 1, status: 1, createdAt: -1 });

  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
