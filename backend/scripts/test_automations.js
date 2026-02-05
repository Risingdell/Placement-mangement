const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testNotification() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected to database.');

        const student_id = 14; // Dhanushm
        const company_id = 15; // "fiyfiy"
        const admin_id = 1; // Assuming admin ID

        // 1. Fetch company name
        const [companies] = await connection.execute('SELECT name FROM companies WHERE id = ?', [company_id]);
        const companyName = companies[0].name;

        console.log(`Company: ${companyName}`);

        // 2. Insert into inbox_messages (Simulate the controller logic)
        const subject = `Shortlisted for ${companyName}`;
        const messageText = `Congratulations! You have been shortlisted for ${companyName}. Keep checking your dashboard for further updates.`;

        const [result] = await connection.execute(
            `INSERT INTO inbox_messages 
       (recipient_id, sender_id, subject, message, message_type, sent_at)
       VALUES (?, ?, ?, ?, 'Notification', NOW())`,
            [student_id, admin_id, subject, messageText]
        );

        console.log(`Notification sent! ID: ${result.insertId}`);

        // 3. Verify insertion
        const [messages] = await connection.execute('SELECT * FROM inbox_messages WHERE id = ?', [result.insertId]);
        console.log('Verification:', JSON.stringify(messages[0], null, 2));

        // Cleanup test message
        await connection.execute('DELETE FROM inbox_messages WHERE id = ?', [result.insertId]);
        console.log('Test message cleaned up.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testNotification();
