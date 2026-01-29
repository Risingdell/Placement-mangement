const { promisePool } = require('../config/database');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getAllEvents = async (req, res) => {
  try {
    const { type, upcoming } = req.query;

    let query = `
      SELECT e.id, e.title, e.event_type, e.description, e.event_date,
             e.location, e.created_at,
             pd.company_name, pd.role
      FROM events e
      LEFT JOIN placement_drives pd ON e.related_drive_id = pd.id
      WHERE 1=1
    `;

    const params = [];

    if (type) {
      query += ' AND e.event_type = ?';
      params.push(type);
    }

    if (upcoming === 'true') {
      query += ' AND e.event_date >= NOW()';
    }

    query += ' ORDER BY e.event_date ASC';

    const [events] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;

    const [events] = await promisePool.query(
      `SELECT e.*, pd.company_name, pd.role, pd.drive_date
       FROM events e
       LEFT JOIN placement_drives pd ON e.related_drive_id = pd.id
       WHERE e.id = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: events[0]
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event details'
    });
  }
};

// @desc    Get upcoming events (dashboard widget)
// @route   GET /api/events/upcoming/preview
// @access  Private
const getUpcomingEvents = async (req, res) => {
  try {
    const [events] = await promisePool.query(
      `SELECT e.id, e.title, e.event_type, e.event_date, e.location,
              pd.company_name
       FROM events e
       LEFT JOIN placement_drives pd ON e.related_drive_id = pd.id
       WHERE e.event_date >= NOW()
       ORDER BY e.event_date ASC
       LIMIT 5`,
      []
    );

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events'
    });
  }
};

// @desc    Get events by date range
// @route   GET /api/events/range
// @access  Private
const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const [events] = await promisePool.query(
      `SELECT e.id, e.title, e.event_type, e.description, e.event_date,
              e.location, pd.company_name, pd.role
       FROM events e
       LEFT JOIN placement_drives pd ON e.related_drive_id = pd.id
       WHERE e.event_date BETWEEN ? AND ?
       ORDER BY e.event_date ASC`,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// @desc    Create new event (Admin only)
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const {
      title,
      eventType,
      description,
      relatedDriveId,
      eventDate,
      location
    } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and event date are required'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO events
       (title, event_type, description, related_drive_id, event_date, location, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        eventType || 'Other',
        description,
        relatedDriveId,
        eventDate,
        location,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

// @desc    Update event (Admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      title,
      eventType,
      description,
      relatedDriveId,
      eventDate,
      location
    } = req.body;

    await promisePool.query(
      `UPDATE events
       SET title = COALESCE(?, title),
           event_type = COALESCE(?, event_type),
           description = COALESCE(?, description),
           related_drive_id = COALESCE(?, related_drive_id),
           event_date = COALESCE(?, event_date),
           location = COALESCE(?, location)
       WHERE id = ?`,
      [title, eventType, description, relatedDriveId, eventDate, location, eventId]
    );

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// @desc    Delete event (Admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    await promisePool.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// @desc    Get events calendar data (grouped by date)
// @route   GET /api/events/calendar
// @access  Private
const getCalendarEvents = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [events] = await promisePool.query(
      `SELECT e.id, e.title, e.event_type, e.event_date, e.location,
              pd.company_name
       FROM events e
       LEFT JOIN placement_drives pd ON e.related_drive_id = pd.id
       WHERE DATE(e.event_date) BETWEEN ? AND ?
       ORDER BY e.event_date ASC`,
      [startDate, endDate]
    );

    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const date = event.event_date.toISOString().split('T')[0];
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });

    res.json({
      success: true,
      data: eventsByDate
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  getCalendarEvents
};
