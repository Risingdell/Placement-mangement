const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        const tables = ['users', 'student_academics', 'placement_drives', 'drive_applications', 'student_profiles'];

        for (const table of tables) {
            try {
                const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
                console.log(`\nTABLE: ${table}`);
                columns.forEach(col => console.log(`- ${col.Field}`));
            } catch (e) {
                console.log(`\nTABLE: ${table} (NOT FOUND)`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

inspectSchema();
