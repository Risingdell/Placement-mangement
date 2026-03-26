const express = require('express');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyShortlists,
  createShortlist,
  updateShortlistStatus,
  deleteShortlist,
  getEligibleStudents,
  notifyShortlistedStudents
} = require('../controllers/adminCompanyController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadPhoto, handleUploadError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Get eligible students - MUST be before /:id route
router.get('/eligible-students', getEligibleStudents);

// Company CRUD operations
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', uploadPhoto.single('logo'), handleUploadError, createCompany);
router.put('/:id', uploadPhoto.single('logo'), handleUploadError, updateCompany);
router.delete('/:id', deleteCompany);

// Company shortlist management
router.get('/:id/shortlists', getCompanyShortlists);
router.post('/:id/shortlists', createShortlist);
router.put('/shortlists/:shortlistId', updateShortlistStatus);
router.delete('/shortlists/:shortlistId', deleteShortlist);
router.post('/:id/notify', notifyShortlistedStudents);

module.exports = router;
