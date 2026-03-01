const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function resetPassword() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected. Resetting password for admin@college.edu...');

        // Hash for "password123"
        // Using the one from dummy_data.sql which corresponds to bcrypt 10 rounds
        const passwordHash = '$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi';

        const [result] = await connection.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            [passwordHash, 'admin@college.edu']
        );

        if (result.affectedRows > 0) {
            console.log('Success! Password reset for admin@college.edu to "password123"');
        } else {
            console.log('Error: User not found or not updated.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();
