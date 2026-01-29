const express = require('express');
const {
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarEvents
} = require('../controllers/eventController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.get('/', getAllEvents);
router.get('/upcoming/preview', getUpcomingEvents);
router.get('/range', getEventsByDateRange);
router.get('/calendar', getCalendarEvents);
router.get('/:id', getEventById);

// Admin routes
router.post('/', restrictTo('admin'), createEvent);
router.put('/:id', restrictTo('admin'), updateEvent);
router.delete('/:id', restrictTo('admin'), deleteEvent);

module.exports = router;
