import mongoose from 'mongoose';
import {
  HealthCheckEventSchema,
} from '../database/schemas/health-check-event.schema';

async function addHealthIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const HealthCheckEvent = mongoose.model('HealthCheckEvent', HealthCheckEventSchema);

  await HealthCheckEvent.collection.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Health (HealthCheckEvent) indexes created/ensured.');
}

addHealthIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
