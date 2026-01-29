// Usage: node scripts/reset-user.js
// This script will upsert (insert or update) a user with email 'anand@gmail.com' and password '123456'.
// Make sure to run `npm install mongoose bcrypt` if not already installed.

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/master-platform'; // <-- Set your DB name

const userEmail = 'anand@gmail.com';
const userPassword = '123456';
const userRole = 'PLATFORM_SUPER_ADMIN'; // Change as needed

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  tenantId: mongoose.Schema.Types.Mixed,
  isActive: Boolean,
  status: String,
  firstName: String,
  lastName: String,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema, 'users');

async function upsertUser() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const hash = await bcrypt.hash(userPassword, 10);
  const now = new Date();
  const update = {
    password: hash,
    role: userRole,
    isActive: true,
    status: 'ACTIVE',
    firstName: 'Anand',
    lastName: 'User',
    updatedAt: now,
    createdAt: now,
  };
  const result = await User.findOneAndUpdate(
    { email: userEmail },
    { $set: update, $setOnInsert: { email: userEmail } },
    { upsert: true, new: true }
  );
  console.log('User upserted:', result);
  await mongoose.disconnect();
}

upsertUser().catch(err => {
  console.error('Error upserting user:', err);
  process.exit(1);
});
