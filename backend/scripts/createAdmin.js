require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const requireEnv = (name) => {
  const v = process.env[name];
  if (!v || !String(v).trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return String(v).trim();
};

const main = async () => {
  const email = requireEnv('ADMIN_EMAIL').toLowerCase();
  const password = requireEnv('ADMIN_PASSWORD');
  const firstName = (process.env.ADMIN_FIRSTNAME || 'Admin').trim();
  const lastName = (process.env.ADMIN_LASTNAME || 'User').trim();

  await connectDB();

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.isEmailVerified = true;
    // Only update password if explicitly requested
    if (process.env.ADMIN_RESET_PASSWORD === 'true') {
      existing.password = password;
    }
    await existing.save();
    console.log(`OK: Updated existing user to admin: ${email}`);
  } else {
    await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`OK: Created admin user: ${email}`);
  }

  await mongoose.connection.close();
};

main().catch(async (err) => {
  console.error(`FAILED: ${err.message}`);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
