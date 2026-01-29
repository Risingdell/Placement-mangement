const express = require('express');
const {
  getMyApplications,
  getApplicationById,
  applyForDrive,
  withdrawApplication,
  updateApplicationStatus,
  getApplicationsByDrive
} = require('../controllers/applicationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', getMyApplications);
router.get('/:id', getApplicationById);
router.post('/', applyForDrive);
router.delete('/:id', withdrawApplication);

// Admin routes
router.put('/:id/status', restrictTo('admin'), updateApplicationStatus);
router.get('/drive/:driveId', restrictTo('admin'), getApplicationsByDrive);

module.exports = router;
