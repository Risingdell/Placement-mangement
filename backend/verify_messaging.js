const { promisePool } = require('./config/database');

async function verifyMessaging() {
    try {
        console.log('--- Verifying Messaging System ---');

        // 1. Check for 'Official' messages in the inbox_messages table
        const [messages] = await promisePool.query(
            `SELECT im.*, u.full_name as recipient_name 
       FROM inbox_messages im 
       JOIN users u ON im.recipient_id = u.id 
       WHERE im.message_type = 'Official' 
       ORDER BY im.sent_at DESC LIMIT 5`
        );

        console.log(`Found ${messages.length} official messages.`);
        messages.forEach(msg => {
            console.log(`ID: ${msg.id}, To: ${msg.recipient_name}, Subject: ${msg.subject}`);
        });

        // 2. Test the query used in getSentMessages
        const [sentMessages] = await promisePool.query(
            `SELECT im.id, im.subject, u.full_name as recipient_name
       FROM inbox_messages im
       JOIN users u ON im.recipient_id = u.id
       WHERE im.sender_id IS NOT NULL
       ORDER BY im.sent_at DESC LIMIT 5`
        );

        console.log(`\nVerified sent messages query: Found ${sentMessages.length} total sent messages.`);

        console.log('--- Verification Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyMessaging();
