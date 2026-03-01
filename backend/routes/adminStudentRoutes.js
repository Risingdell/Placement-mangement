const express = require('express');
const {
  getAllStudents,
  getStudentById,
  getStudentStats,
  updateStudentProfile,
  updatePlacementStatus,
  verifyDocument,
  getDocumentVerifications,
  approveProfileChange,
  getProfileChangeRequests
} = require('../controllers/adminStudentController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Student management
router.get('/', getAllStudents);
router.get('/stats', getStudentStats);
router.get('/:id', getStudentById);
router.put('/:id', updateStudentProfile);
router.put('/:id/placement-status', updatePlacementStatus);

// Document verification
router.get('/documents/pending', getDocumentVerifications);
router.put('/documents/:docId/verify', verifyDocument);

// Profile change requests
router.get('/profile-changes/pending', getProfileChangeRequests);
router.put('/profile-changes/:requestId/approve', approveProfileChange);

module.exports = router;
