const express = require('express');
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationRecipients,
  sendNotification
} = require('../controllers/adminNotificationController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin', 'tpo'));

// Notification management
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.post('/', createNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

// Send and track
router.post('/:id/send', sendNotification);
router.get('/:id/recipients', getNotificationRecipients);

module.exports = router;
