const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testQuery() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected to database.');

        const companyId = 15; // fiyfiy ID from previous check

        const query = `SELECT cs.*,
        u.full_name as student_name, u.email, u.usn,
        sa.cgpa, sa.branch,
        pd.role as drive_role, pd.ctc as ctc,
        admin.full_name as shortlisted_by_name
       FROM company_shortlists cs
       JOIN users u ON cs.student_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       LEFT JOIN placement_drives pd ON cs.drive_id = pd.id
       LEFT JOIN users admin ON cs.shortlisted_by = admin.id
       WHERE cs.company_id = ?
       ORDER BY cs.created_at DESC`;

        console.log('Running query for company ID 15...');
        const [rows] = await connection.execute(query, [companyId]);

        console.log(`Query returned ${rows.length} rows.`);
        if (rows.length > 0) {
            console.log('First row sample:', JSON.stringify(rows[0], null, 2));
        } else {
            console.log('No rows returned. Checking why...');
            const [countOnly] = await connection.execute('SELECT COUNT(*) as count FROM company_shortlists WHERE company_id = ?', [companyId]);
            console.log(`Count without joins: ${countOnly[0].count}`);
        }

    } catch (error) {
        console.error('SQL Error Caught:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testQuery();
