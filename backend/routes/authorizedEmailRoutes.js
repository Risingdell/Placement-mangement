const express = require('express');
const {
  getAllAuthorizedEmails,
  getAuthorizedEmailById,
  createAuthorizedEmail,
  bulkCreateAuthorizedEmails,
  updateAuthorizedEmail,
  deleteAuthorizedEmail,
  toggleEmailStatus,
  getStatistics,
  checkEmailAuthorization
} = require('../controllers/authorizedEmailController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// Public route for checking email authorization (called during registration)
// This is NOT protected and must remain accessible to unauthenticated users
router.get('/check/:email', checkEmailAuthorization);

// ========================================
// PROTECTED ROUTES (Admin/TPO only)
// ========================================

// Create a protected router for admin-only routes
const protectedRouter = express.Router();

// Apply authentication and role-based access control
protectedRouter.use(protect);
protectedRouter.use(restrictTo('admin', 'tpo'));

// Statistics endpoint - MUST be before /:id route to avoid conflict
protectedRouter.get('/statistics', getStatistics);

// CRUD operations
protectedRouter.get('/', getAllAuthorizedEmails);
protectedRouter.post('/', createAuthorizedEmail);
protectedRouter.post('/bulk', bulkCreateAuthorizedEmails);

// Routes with ID parameter
protectedRouter.get('/:id', getAuthorizedEmailById);
protectedRouter.put('/:id', updateAuthorizedEmail);
protectedRouter.delete('/:id', deleteAuthorizedEmail);
protectedRouter.patch('/:id/status', toggleEmailStatus);

// Mount the protected routes
router.use(protectedRouter);

module.exports = router;
