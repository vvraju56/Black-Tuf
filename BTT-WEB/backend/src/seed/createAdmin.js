/**
 * Create or update the initial admin account.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run seed:admin
 *
 * Credentials are never printed back to the console.
 */
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';

async function run() {
  const email = env.admin.email.trim().toLowerCase();
  const password = env.admin.password;

  if (!email || !password) {
    console.error('[admin] ADMIN_EMAIL and ADMIN_PASSWORD are required.');
    console.error(
      "[admin] Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-password' npm run seed:admin"
    );
    process.exitCode = 1;
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('[admin] ADMIN_EMAIL is not a valid email address.');
    process.exitCode = 1;
    return;
  }

  if (password.length < 10) {
    console.error('[admin] ADMIN_PASSWORD must be at least 10 characters.');
    process.exitCode = 1;
    return;
  }

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.name = env.admin.name || existing.name;
    existing.passwordHash = passwordHash;
    existing.active = true;
    await existing.save();
    console.log(`[admin] Password reset for existing admin: ${email}`);
  } else {
    await Admin.create({
      name: env.admin.name || 'BlackTuf Admin',
      email,
      passwordHash,
      role: 'owner',
      active: true,
    });
    console.log(`[admin] Owner account created: ${email}`);
  }
}

run()
  .catch((error) => {
    console.error('[admin] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
