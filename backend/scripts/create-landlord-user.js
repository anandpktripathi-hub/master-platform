// Usage: node backend/scripts/create-landlord-user.js
// This script creates a landlord (platform super admin) user in MongoDB

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://localhost:27017/smetasc-saas'; // Change if your DB name is different

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
});

const User = mongoose.model('User', userSchema, 'users');

async function createLandlordUser() {
  await mongoose.connect(MONGO_URI);
  const email = 'admin@example.com';
  const password = '123456';
  const role = 'PLATFORM_SUPER_ADMIN';

  // Check if user already exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', existing);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const user = new User({
    name: 'Platform Super Admin',
    email,
    password: hash,
    role,
    isActive: true,
  });
  await user.save();
  console.log('Landlord user created:', user);
  await mongoose.disconnect();
}

createLandlordUser().catch(err => {
  console.error('Error creating landlord user:', err);
  mongoose.disconnect();
});
