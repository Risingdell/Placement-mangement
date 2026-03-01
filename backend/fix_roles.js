const { promisePool } = require('./config/database');

async function fixRoles() {
    try {
        // Update the TPO user role
        const [result] = await promisePool.query(
            "UPDATE users SET role = 'tpo' WHERE email = 'tpo@college.edu' AND (role IS NULL OR role = '')"
        );

        console.log(`Updated ${result.affectedRows} user(s) to 'tpo' role.`);

        // Verify the change
        const [users] = await promisePool.query("SELECT id, email, role FROM users WHERE email = 'tpo@college.edu'");
        console.log('Verification:', users);

        process.exit(0);
    } catch (error) {
        console.error('Error fixing roles:', error);
        process.exit(1);
    }
}

fixRoles();
