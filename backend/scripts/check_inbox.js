const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function checkInbox() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [messages] = await connection.execute('SELECT * FROM inbox_messages ORDER BY sent_at DESC LIMIT 5');
        console.log('Last 5 inbox messages:');
        console.log(JSON.stringify(messages, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkInbox();
