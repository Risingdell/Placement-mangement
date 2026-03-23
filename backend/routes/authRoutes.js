const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { checkEmailAuthorization } = require('../controllers/authorizedEmailController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Public: Check if email is authorized for registration (used on register page)
router.get('/check-email/:email', checkEmailAuthorization);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
