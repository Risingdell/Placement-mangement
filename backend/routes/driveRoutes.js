const express = require('express');
const {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getUpcomingDrives,
  getEligibleStudents,
  previewEligibleStudents
} = require('../controllers/driveController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', getAllDrives);
router.get('/upcoming/preview', getUpcomingDrives);

// Admin only routes - preview eligible students (must be before /:id to avoid route collision)
router.get('/preview-eligible', restrictTo('admin', 'tpo'), previewEligibleStudents);

router.get('/:id', getDriveById);

// Admin only routes
router.post('/', restrictTo('admin', 'tpo'), createDrive);
router.put('/:id', restrictTo('admin', 'tpo'), updateDrive);
router.delete('/:id', restrictTo('admin', 'tpo'), deleteDrive);
router.get('/:driveId/eligible-students', restrictTo('admin', 'tpo'), getEligibleStudents);

module.exports = router;
