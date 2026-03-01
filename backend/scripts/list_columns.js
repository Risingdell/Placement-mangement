const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkColumns() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'placement_management'
        });

        const [columns] = await connection.execute('SHOW COLUMNS FROM placement_drives');
        console.log('Columns in placement_drives:');
        columns.forEach(col => console.log(`- ${col.Field}`));

        const [shortlistColumns] = await connection.execute('SHOW COLUMNS FROM company_shortlists');
        console.log('\nColumns in company_shortlists:');
        shortlistColumns.forEach(col => console.log(`- ${col.Field}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkColumns();
