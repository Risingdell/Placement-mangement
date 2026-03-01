const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './backend/.env' });

async function testBulkNotify() {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1h' });
    const companyId = 15; // Company "fiyfiy"

    console.log('Testing Bulk Notify for Company ID:', companyId);

    try {
        const response = await fetch(`http://localhost:5000/api/admin/companies/${companyId}/notify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log('Bulk notification successful!');
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}

testBulkNotify();
