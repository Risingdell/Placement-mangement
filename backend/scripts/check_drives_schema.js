const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkStructure() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected to database.');

        console.log('\n--- Structure of placement_drives ---');
        const [drivesSchema] = await connection.execute('DESCRIBE placement_drives');
        console.table(drivesSchema);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkStructure();
