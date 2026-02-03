const express = require('express');
const {
  getDashboardStats,
  getPlacementStatistics,
  getBranchWiseStats,
  getCompanyWiseStats,
  getSalaryAnalysis,
  getApplicationTrends,
  exportReport
} = require('../controllers/adminStatsController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Statistics and analytics
router.get('/dashboard', getDashboardStats);
router.get('/placement', getPlacementStatistics);
router.get('/branch-wise', getBranchWiseStats);
router.get('/company-wise', getCompanyWiseStats);
router.get('/salary-analysis', getSalaryAnalysis);
router.get('/application-trends', getApplicationTrends);

// Export reports
router.post('/export', exportReport);

module.exports = router;
