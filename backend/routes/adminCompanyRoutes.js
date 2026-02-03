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
  deleteShortlist
} = require('../controllers/adminCompanyController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Company CRUD operations
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

// Company shortlist management
router.get('/:id/shortlists', getCompanyShortlists);
router.post('/:id/shortlists', createShortlist);
router.put('/shortlists/:shortlistId', updateShortlistStatus);
router.delete('/shortlists/:shortlistId', deleteShortlist);

module.exports = router;
