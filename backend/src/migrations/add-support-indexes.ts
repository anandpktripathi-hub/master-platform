import mongoose from 'mongoose';
import { TicketSchema } from '../database/schemas/ticket.schema';

async function addSupportIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Ticket = mongoose.model('Ticket', TicketSchema);

  await Ticket.collection.createIndex(
    { tenantId: 1, userId: 1, createdAt: -1 },
    { name: 'tenant_user_createdAt' },
  );
  await Ticket.collection.createIndex(
    { tenantId: 1, status: 1, createdAt: -1 },
    { name: 'tenant_status_createdAt' },
  );
  await Ticket.collection.createIndex(
    { status: 1, createdAt: -1 },
    { name: 'status_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Support (Ticket) indexes created/ensured.');
}

addSupportIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
