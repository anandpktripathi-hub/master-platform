const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/master-platform'; // Adjust if needed

const tenantSchema = new mongoose.Schema({
  name: String,
  domain: String,
  slug: String,
  isActive: Boolean,
});
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  tenantId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean,
});

const Tenant = mongoose.model('Tenant', tenantSchema, 'tenants');
const User = mongoose.model('User', userSchema, 'users');

async function createTenantAndUser() {
  await mongoose.connect(MONGO_URI);

  // 1. Create tenant
  const tenant = await Tenant.create({
    name: 'Test Tenant',
    domain: 'gmail.com',
    slug: 'gmail',
    isActive: true,
  });

  // 2. Create user
  const hash = await bcrypt.hash('123456', 10); // Use your desired password
  await User.create({
    name: 'Test User',
    email: 'anand@gmail.com',
    password: hash,
    role: 'tenant_admin',
    tenantId: tenant._id,
    isActive: true,
  });

  console.log('Test tenant and user created.');
  await mongoose.disconnect();
}

createTenantAndUser().catch(console.error);
