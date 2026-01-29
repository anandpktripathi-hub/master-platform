const mongoose = require('mongoose');

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

async function ensureTenantAndUpdateUser() {
  await mongoose.connect(MONGO_URI);

  // 1. Ensure tenant exists
  let tenant = await Tenant.findOne({ domain: 'gmail.com' });
  if (!tenant) {
    tenant = await Tenant.create({
      name: 'Gmail Tenant',
      domain: 'gmail.com',
      slug: 'gmail',
      isActive: true,
    });
    console.log('Created tenant:', tenant);
  } else if (!tenant.isActive) {
    tenant.isActive = true;
    await tenant.save();
    console.log('Activated tenant:', tenant);
  } else {
    console.log('Tenant already exists and is active:', tenant);
  }

  // 2. Update user to have correct tenantId
  const user = await User.findOne({ email: 'anand@gmail.com' });
  if (user) {
    user.tenantId = tenant._id;
    await user.save();
    console.log('Updated user with tenantId:', user);
  } else {
    console.log('User anand@gmail.com not found.');
  }

  await mongoose.disconnect();
}

ensureTenantAndUpdateUser().catch(console.error);
