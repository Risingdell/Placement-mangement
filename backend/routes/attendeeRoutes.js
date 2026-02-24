const express = require('express');
const {
  getAttendees,
  addAttendees,
  removeAttendee,
  getNonAttendees,
  sendMessageToAttendees
} = require('../controllers/attendeeController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin-only routes for managing drive attendees
// Get all attendees for a specific drive
router.get('/drives/:driveId/attendees', restrictTo('admin', 'tpo'), getAttendees);

// Add students as attendees to a drive
router.post('/drives/:driveId/attendees', restrictTo('admin', 'tpo'), addAttendees);

// Remove a student from drive attendees
router.delete('/drives/:driveId/attendees/:userId', restrictTo('admin', 'tpo'), removeAttendee);

// Get non-attendees (students who haven't attended this drive yet)
router.get('/drives/:driveId/non-attendees', restrictTo('admin', 'tpo'), getNonAttendees);

// Send message to all attendees of a drive
router.post('/drives/:driveId/attendees/send-message', restrictTo('admin', 'tpo'), sendMessageToAttendees);

module.exports = router;
