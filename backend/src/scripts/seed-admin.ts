import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { env } from '../config/env';
import { User, isAdmin } from '../models/User';

/**
 * Creates (or updates) a verified admin account so you can log in to the admin portal.
 *
 *   Email:    first arg, or ADMIN_SEED_EMAIL, or the first entry in ADMIN_EMAILS.
 *   Password: second arg, or ADMIN_SEED_PASSWORD, or a strong random one (printed once).
 *
 * The email must be listed in ADMIN_EMAILS for the account to get admin access.
 */
function strongPassword() {
  // base64url, no padding — 18 bytes ≈ 24 chars of entropy.
  return randomBytes(18).toString('base64').replace(/[+/=]/g, '').slice(0, 20) + 'A9!';
}

async function main() {
  const email = (process.argv[2] || process.env.ADMIN_SEED_EMAIL || env.ADMIN_EMAILS[0] || '')
    .trim()
    .toLowerCase();
  if (!email) {
    throw new Error('No email given. Pass one as an argument or set ADMIN_EMAILS in .env.');
  }
  const password = process.argv[3] || process.env.ADMIN_SEED_PASSWORD || strongPassword();

  await connectDatabase();

  const passwordHash = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email });
  if (user) {
    user.set('passwordHash', passwordHash);
    user.emailVerified = true;
    if (!user.providers.includes('credentials')) user.providers.push('credentials');
    await user.save();
    console.log(`Updated existing account: ${email}`);
  } else {
    user = await User.create({
      name: 'Admin',
      email,
      passwordHash,
      emailVerified: true,
      providers: ['credentials'],
    });
    console.log(`Created new account: ${email}`);
  }

  const admin = isAdmin({ email, emailVerified: true });
  console.log('');
  console.log('  Admin login');
  console.log('  ───────────');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('');
  if (admin) {
    console.log('  ✓ This email is in ADMIN_EMAILS — it has admin-portal access.');
  } else {
    console.log('  ⚠ This email is NOT in ADMIN_EMAILS. Add it to .env and restart the backend,');
    console.log(`    e.g. ADMIN_EMAILS=${email}`);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
