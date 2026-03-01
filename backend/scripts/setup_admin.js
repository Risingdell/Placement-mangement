/**
 * setup_admin.js — One-time script to create/fix the admin account
 *
 * Usage (from backend/ directory):
 *   node scripts/setup_admin.js
 *
 * What it does:
 *   1. Checks which admin/tpo users currently exist in the DB
 *   2. Upserts admin@placement.com with role='admin' and password 'Admin@1234'
 *   3. Prints login credentials so you can log in immediately
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_EMAIL    = 'admin@college.edu';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'System Admin';
const ADMIN_USN      = 'ADMIN001';

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'placement_management',
      port:     Number(process.env.DB_PORT) || 3306,
    });

    console.log('✓ Connected to MySQL\n');

    // ── 1. Show current admin / tpo users ──────────────────────────────────
    const [existing] = await connection.execute(
      "SELECT id, email, full_name, role, is_active FROM users WHERE role IN ('admin','tpo')"
    );
    if (existing.length > 0) {
      console.log('Existing admin/tpo users:');
      existing.forEach(u =>
        console.log(`  ID ${u.id} | ${u.email} | role=${u.role} | active=${u.is_active}`)
      );
    } else {
      console.log('No admin/tpo users found in DB.\n');
    }

    // ── 2. Hash the new password ────────────────────────────────────────────
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // ── 3. Upsert the admin account ─────────────────────────────────────────
    const [check] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [ADMIN_EMAIL]
    );

    if (check.length > 0) {
      // Account exists — fix role + password
      await connection.execute(
        "UPDATE users SET role = 'admin', password_hash = ?, is_active = 1 WHERE email = ?",
        [hash, ADMIN_EMAIL]
      );
      console.log(`\n✓ Updated existing account: ${ADMIN_EMAIL}`);
    } else {
      // Create fresh admin account
      await connection.execute(
        `INSERT INTO users (usn, email, password_hash, full_name, role, is_active)
         VALUES (?, ?, ?, ?, 'admin', 1)`,
        [ADMIN_USN, ADMIN_EMAIL, hash, ADMIN_NAME]
      );
      console.log(`\n✓ Created new admin account: ${ADMIN_EMAIL}`);
    }

    // ── 4. Print login credentials ──────────────────────────────────────────
    console.log('\n══════════════════════════════════════');
    console.log('  Admin login credentials');
    console.log('══════════════════════════════════════');
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
    console.log('══════════════════════════════════════');
    console.log('\n→ Go to http://localhost:5173/admin/login and use these credentials.\n');

  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();
