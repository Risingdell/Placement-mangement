const express = require('express');
const { promisePool } = require('../config/database');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/companies/upcoming — active companies for student dashboard
router.get('/upcoming', protect, async (req, res) => {
  try {
    const [companies] = await promisePool.query(
      `SELECT id, name, logo_url, company_type, location, industry
       FROM companies
       WHERE is_active = 1
       ORDER BY created_at DESC
       LIMIT 20`
    );
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching upcoming companies:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch companies' });
  }
});

module.exports = router;
