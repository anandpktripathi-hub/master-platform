import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smetasc';

const tenantData = {
  name: 'Default Tenant',
  slug: 'default-tenant',
  status: 'ACTIVE',
  plan: 'FREE',
  isActive: true,
};

const userData = {
  email: 'admin@example.com',
  password: 'password', // will be hashed
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  status: 'ACTIVE',
  isActive: true,
};

async function setup() {
  await mongoose.connect(MONGO_URI);
  const Tenant = mongoose.model('Tenant', new mongoose.Schema({
    name: String,
    slug: String,
    status: String,
    plan: String,
    isActive: Boolean,
  }));
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    role: String,
    status: String,
    isActive: Boolean,
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  }));

  let tenant = await Tenant.findOne({ slug: tenantData.slug });
  if (!tenant) {
    tenant = await Tenant.create(tenantData);
    console.log('Created tenant:', tenant.slug);
  }

  let user = await User.findOne({ email: userData.email });
  if (!user) {
    const hashed = await bcrypt.hash(userData.password, 10);
    user = await User.create({ ...userData, password: hashed, tenant: tenant._id });
    console.log('Created user:', user.email);
  } else if (!user.tenant) {
    user.tenant = tenant._id;
    await user.save();
    console.log('Linked user to tenant:', user.email);
  }

  await mongoose.disconnect();
  console.log('Setup complete.');
}

setup().catch(e => { console.error(e); process.exit(1); });
