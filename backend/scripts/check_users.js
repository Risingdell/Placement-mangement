const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend .env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUsers() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected. Fetching admin and TPO users...');

        // Check for specific email user is trying
        const [targetUser] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ?',
            ['admin@college.edu']
        );

        if (targetUser.length > 0) {
            console.log('User admin@college.edu found:', targetUser[0]);
        } else {
            console.log('User admin@college.edu NOT found in database.');
        }

        // List all admins/tpos
        const [admins] = await connection.execute(
            'SELECT id, usn, email, role, is_active FROM users WHERE role IN ("admin", "tpo")'
        );

        console.log('\n--- Existing Admin/TPO Users ---');
        if (admins.length === 0) {
            console.log('No users with role "admin" or "tpo" found.');
        } else {
            console.table(admins);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkUsers();
