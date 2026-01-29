const express = require('express');
const {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getUpcomingDrives
} = require('../controllers/driveController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', getAllDrives);
router.get('/upcoming/preview', getUpcomingDrives);
router.get('/:id', getDriveById);

// Admin only routes
router.post('/', restrictTo('admin'), createDrive);
router.put('/:id', restrictTo('admin'), updateDrive);
router.delete('/:id', restrictTo('admin'), deleteDrive);

module.exports = router;
