import mongoose from 'mongoose';
import { ProductSchema } from '../database/schemas/product.schema';

async function addProductIndexes() {
  const uri =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/master-platform';

  await mongoose.connect(uri);

  const Product = mongoose.model('Product', ProductSchema);

  await Product.collection.createIndex(
    { isActive: 1, createdAt: -1 },
    { name: 'isActive_createdAt' },
  );
  await Product.collection.createIndex(
    { name: 1 },
    { name: 'name' },
  );

  await mongoose.disconnect();
  console.log('Product indexes created/ensured.');
}

addProductIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
