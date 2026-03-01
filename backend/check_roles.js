const { promisePool } = require('./config/database');

async function checkRoles() {
    try {
        const [users] = await promisePool.query('SELECT id, full_name, email, role, is_active FROM users');
        console.log('--- User Roles ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.full_name}, Email: ${u.email}, Role: ${u.role}, Active: ${u.is_active}`);
        });
        console.log('------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error checking roles:', error);
        process.exit(1);
    }
}

checkRoles();
