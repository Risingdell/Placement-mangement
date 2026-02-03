const express = require('express');
const {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats,
  bulkUpdateStatus,
  exportApplications
} = require('../controllers/adminApplicationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Application management
router.get('/', getAllApplications);
router.get('/stats', getApplicationStats);
router.get('/:id', getApplicationById);
router.put('/:id/status', updateApplicationStatus);

// Bulk operations
router.post('/bulk/update-status', bulkUpdateStatus);
router.post('/export', exportApplications);

module.exports = router;
