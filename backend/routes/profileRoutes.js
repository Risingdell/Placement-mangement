const express = require('express');
const {
  getProfile,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  getEligibilityStatus
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadPhoto: photoUpload, uploadResume: resumeUpload, handleUploadError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.get('/eligibility', getEligibilityStatus);
router.put('/academics', updateAcademics);

// File uploads
router.post('/photo', photoUpload.single('photo'), handleUploadError, uploadPhoto);
router.post('/resume', resumeUpload.single('resume'), handleUploadError, uploadResume);

// Skills
router.post('/skills', addSkill);
router.delete('/skills/:id', deleteSkill);

// Projects
router.post('/projects', addProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Achievements
router.post('/achievements', addAchievement);
router.delete('/achievements/:id', deleteAchievement);

module.exports = router;
