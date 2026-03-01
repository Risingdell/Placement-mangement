const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function inspectData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected to database.');

        // Find the company "fiyfiy"
        const [companies] = await connection.execute(
            'SELECT id, name FROM companies WHERE name = ?',
            ['fiyfiy']
        );

        if (companies.length === 0) {
            console.log('Company "fiyfiy" not found.');
            return;
        }

        const companyId = companies[0].id;
        console.log(`Found company "fiyfiy" with ID: ${companyId}`);

        // Count shortlists
        const [countResult] = await connection.execute(
            'SELECT COUNT(*) as count FROM company_shortlists WHERE company_id = ?',
            [companyId]
        );
        console.log(`Count in company_shortlists: ${countResult[0].count}`);

        // Try the JOIN from the controller
        const [joinResult] = await connection.execute(
            `SELECT cs.id, cs.student_id, u.id as user_id, u.full_name
       FROM company_shortlists cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.company_id = ?`,
            [companyId]
        );
        console.log(`Count with JOIN users: ${joinResult.length}`);

        if (joinResult.length < countResult[0].count) {
            console.log('DISCREPANCY DETECTED: Some student IDs in company_shortlists do not exist in users table.');

            // Find problematic IDs
            const [orphans] = await connection.execute(
                `SELECT cs.student_id FROM company_shortlists cs
          WHERE cs.company_id = ? AND cs.student_id NOT IN (SELECT id FROM users)`,
                [companyId]
            );
            console.log('Orphaned Student IDs:', orphans.map(o => o.student_id));
        }

        // Check sample_students.sql relevance
        // The user has this file open, maybe they just ran it and it failed or something?

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

inspectData();
