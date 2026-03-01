const { promisePool } = require('./config/database');

async function debugSchema() {
    try {
        console.log('--- Debugging Schema and Warnings ---');

        // 1. Check table structure
        const [describe] = await promisePool.query("DESCRIBE users");
        console.log('Users Table Structure:', describe);

        // 2. Try update again and check SHOW WARNINGS
        await promisePool.query("UPDATE users SET role = 'tpo' WHERE id = 201");
        const [warnings] = await promisePool.query("SHOW WARNINGS");
        console.log('MySQL Warnings:', warnings);

        // 3. See what roles ARE already in the table
        const [roles] = await promisePool.query("SELECT DISTINCT role FROM users");
        console.log('Existing Roles in Table:', roles);

        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
}

debugSchema();
