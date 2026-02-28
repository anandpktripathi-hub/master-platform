import mongoose from 'mongoose';
import { InvoiceSchema } from '../database/schemas/invoice.schema';
import { PosOrderSchema } from '../database/schemas/pos-order.schema';

async function addReportsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Invoice = mongoose.model('Invoice', InvoiceSchema);
  const PosOrder = mongoose.model('PosOrder', PosOrderSchema);

  // Keep migrations aligned with schema-defined indexes.
  await Invoice.collection.createIndex(
    { tenantId: 1, number: 1 },
    { name: 'tenantId_1_number_1', unique: true },
  );

  await PosOrder.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenantId_1_createdAt_-1' },
  );

  await mongoose.disconnect();
  console.log('Invoice/PosOrder indexes created/ensured.');
}

addReportsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});

