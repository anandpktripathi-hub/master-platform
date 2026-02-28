import mongoose from 'mongoose';
import { PaymentLogSchema } from '../database/schemas/payment-log.schema';
import { OfflinePaymentRequestSchema } from '../database/schemas/offline-payment-request.schema';

async function addPaymentsIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const PaymentLog = mongoose.model('PaymentLog', PaymentLogSchema);
  const OfflinePaymentRequest = mongoose.model(
    'OfflinePaymentRequest',
    OfflinePaymentRequestSchema,
  );

  // Payment logs
  await PaymentLog.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );
  await PaymentLog.collection.createIndex(
    { tenantId: 1, status: 1, createdAt: -1 },
    { name: 'tenant_status_createdAt' },
  );
  await PaymentLog.collection.createIndex(
    { transactionId: 1, createdAt: -1 },
    { name: 'transaction_createdAt' },
  );

  // Offline payment requests
  await OfflinePaymentRequest.collection.createIndex(
    { tenantId: 1, createdAt: -1 },
    { name: 'tenant_createdAt' },
  );

  await mongoose.disconnect();
  console.log('Payments indexes created/ensured.');
}

addPaymentsIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
