import mongoose from 'mongoose';

/**
 * Ensures required coupon indexes exist (production often has autoIndex disabled).
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

  const coupons = db.collection('coupons');
  const couponUsages = db.collection('couponusages');

  await coupons.createIndex({ code: 1 }, { unique: true });
  await coupons.createIndex({ status: 1, validTo: 1 });
  await coupons.createIndex({ applicablePackageIds: 1, status: 1 });
  await coupons.createIndex({ allowedTenantIds: 1, status: 1 });

  await couponUsages.createIndex({ couponId: 1, tenantId: 1 });
  await couponUsages.createIndex({ tenantId: 1, usedAt: -1 });

  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
