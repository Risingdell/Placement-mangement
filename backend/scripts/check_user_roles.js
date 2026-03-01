const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUserRoles() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        const [users] = await connection.execute('SELECT id, email, full_name, role FROM users WHERE role IN ("admin", "tpo")');
        console.log('Admin Users:', JSON.stringify(users, null, 2));

        const [allRoles] = await connection.execute('SELECT DISTINCT role FROM users');
        console.log('All Roles in DB:', allRoles.map(r => r.role).join(', '));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkUserRoles();
