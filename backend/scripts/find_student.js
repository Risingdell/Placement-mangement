const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function findStudent() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        const [rows] = await connection.execute('SELECT id, full_name, role FROM users WHERE role = "student" LIMIT 1');
        console.log('Valid Student:', JSON.stringify(rows[0], null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

findStudent();
