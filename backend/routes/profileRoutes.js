const express = require('express');
const {
  getProfile,
  updateBasicInfo,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  deleteResume,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  uploadAchievementCertificate,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  addInternship,
  updateInternship,
  deleteInternship,
  getEligibilityStatus
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const {
  uploadPhoto: photoUpload,
  uploadResume: resumeUpload,
  uploadCertificate: certUpload,
  handleUploadError
} = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', getProfile);
router.get('/eligibility', getEligibilityStatus);
router.put('/basic', updateBasicInfo);
router.put('/academics', updateAcademics);

// File uploads
router.post('/photo', photoUpload.single('photo'), handleUploadError, uploadPhoto);
router.post('/resume', resumeUpload.single('resume'), handleUploadError, uploadResume);
router.delete('/resume', deleteResume);

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
router.post('/achievements/:id/certificate', certUpload.single('certificate'), handleUploadError, uploadAchievementCertificate);

// Portfolio links
router.post('/portfolios', addPortfolio);
router.put('/portfolios/:id', updatePortfolio);
router.delete('/portfolios/:id', deletePortfolio);

// Internships
router.post('/internships', addInternship);
router.put('/internships/:id', updateInternship);
router.delete('/internships/:id', deleteInternship);

module.exports = router;
