const express = require('express');
const {
  getAllMessages,
  getMessageById,
  sendMessage,
  replyToMessage,
  deleteMessage,
  markAsRead
} = require('../controllers/adminMessageController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Message management
router.get('/', getAllMessages);
router.get('/:id', getMessageById);
router.post('/', sendMessage);
router.post('/:id/reply', replyToMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;
