const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './backend/.env' });

async function trigger403() {
    const JWT_SECRET = process.env.JWT_SECRET;

    // Create a token for user ID 1 (Admin)
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '1h' });

    console.log('Using Token:', token);

    try {
        const response = await fetch('http://localhost:5000/api/admin/companies/eligible-students', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('Error:', error.message);
    }
}

trigger403();
