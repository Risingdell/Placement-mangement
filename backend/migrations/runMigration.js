const fs = require('fs');
const path = require('path');
const { promisePool } = require('../config/database');

async function runMigration() {
  const connection = await promisePool.getConnection();

  try {
    console.log('🔄 Starting migration...');

    // Read migration file
    const migrationPath = path.join(__dirname, 'add_authorized_emails_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Remove comments and split by semicolon
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      console.log('Executing migration statement...');
      await connection.query(statement);
    }

    console.log('✅ Migration completed successfully!');

    // Verify table
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = 'placement_management' AND TABLE_NAME = 'authorized_emails'`
    );

    if (tables.length > 0) {
      console.log('✅ authorized_emails table verified!');

      // Show table structure
      const [columns] = await connection.query('DESCRIBE authorized_emails');
      console.log('\n📊 Table Structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ authorized_emails table not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

runMigration();
