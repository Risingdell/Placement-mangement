const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testSearch() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        console.log('Connected to database.');

        const search = 'ad';
        let query = `
      SELECT u.id, u.full_name as name, u.email, u.usn, u.phone, u.is_placed, u.created_at,
        sa.cgpa, sa.branch, sa.batch_year as year, sa.active_backlogs as backlogs,
        pd.company_name as placed_company, pd.ctc,
        sa.resume_url
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status = 'Selected'
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE u.role = 'student'
    `;

        const params = [];

        if (search) {
            query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.usn LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY u.full_name ASC`;

        console.log('Running search query...');
        const [rows] = await connection.execute(query, params);

        console.log(`Query returned ${rows.length} rows.`);
        if (rows.length > 0) {
            console.log('Sample result:', JSON.stringify(rows[0], null, 2));
        }

    } catch (error) {
        console.error('SQL Error Caught:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testSearch();
