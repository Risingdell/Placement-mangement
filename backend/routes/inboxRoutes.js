const express = require('express');
const {
  getMyMessages,
  getMessageById,
  markAsRead,
  markAsUnread,
  deleteMessage,
  getUnreadCount,
  getInboxPreview,
  sendMessage,
  sendBulkMessage,
  getSentMessages
} = require('../controllers/inboxController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', getMyMessages);
router.get('/unread/count', getUnreadCount);
router.get('/preview', getInboxPreview);
router.get('/:id', getMessageById);
router.put('/:id/read', markAsRead);
router.put('/:id/unread', markAsUnread);
router.delete('/:id', deleteMessage);

// Admin routes
router.get('/admin/sent', restrictTo('admin', 'tpo'), getSentMessages);
router.post('/send', restrictTo('admin', 'tpo'), sendMessage);
router.post('/send-bulk', restrictTo('admin', 'tpo'), sendBulkMessage);

module.exports = router;
