// Run: node backend/scripts/create_access_keys_table.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { promisePool } = require('../config/database');

async function run() {
  await promisePool.query(`
    CREATE TABLE IF NOT EXISTS drive_access_keys (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      drive_id    INT NOT NULL,
      user_id     INT NOT NULL,
      access_key  VARCHAR(20) NOT NULL UNIQUE,
      used        TINYINT(1) DEFAULT 0,
      used_at     DATETIME NULL,
      created_at  DATETIME DEFAULT NOW(),
      FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('drive_access_keys table ready.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
