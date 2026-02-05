const { promisePool } = require('./config/database');

async function forceFix() {
    try {
        console.log('--- Force Fixing Role for ID 201 ---');

        const [updateResult] = await promisePool.query(
            "UPDATE users SET role = 'tpo' WHERE id = 201"
        );
        console.log('Update result:', updateResult);

        const [verify] = await promisePool.query(
            "SELECT id, email, role FROM users WHERE id = 201"
        );
        console.log('Verification After Force Fix:', verify);

        process.exit(0);
    } catch (error) {
        console.error('Force fix failed:', error);
        process.exit(1);
    }
}

forceFix();
