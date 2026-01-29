import mongoose from 'mongoose';

const MONGO_URI =
  process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

async function migrateTenants() {
  const mainConn = await mongoose.createConnection(MONGO_URI, {});
  const tenants = await mainConn.collection('tenants').find({}).toArray();
  for (const tenant of tenants) {
    const dbName = `tenant_${tenant._id}_db`;
    const uri = MONGO_URI.replace(/\/(\w+)(\?|$)/, `/${dbName}$2`);
    const tenantConn = await mongoose.createConnection(uri, {});
    // Copy collections as needed (example: users)
    if (!mainConn.db) throw new Error('mainConn.db is undefined');
    const collections = await mainConn.db.listCollections().toArray();
    for (const col of collections) {
      if (['system.indexes', 'tenants'].includes(col.name)) continue;
      const docs = await mainConn
        .collection(col.name)
        .find({ tenantId: tenant._id })
        .toArray();
      if (docs.length) {
        await tenantConn.collection(col.name).insertMany(docs);
      }
    }
    await tenantConn.close();
    console.log(`Migrated data for tenant ${tenant._id}`);
  }
  await mainConn.close();
  console.log('Migration complete.');
}

migrateTenants().catch(console.error);
