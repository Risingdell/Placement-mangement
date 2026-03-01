const { promisePool } = require('../config/database');
const { generateMultipleAttendanceKeys } = require('../utils/keyGenerator');

/**
 * @desc    Get all attendees for a specific placement drive
 * @route   GET /api/drives/:driveId/attendees
 * @access  Private/Admin
 */
const getAttendees = async (req, res) => {
  try {
    const { driveId } = req.params;

    // Verify drive exists
    const [drive] = await promisePool.query(
      'SELECT id FROM placement_drives WHERE id = ?',
      [driveId]
    );

    if (drive.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    // Get all attendees for this drive
    const [attendees] = await promisePool.query(
      `SELECT da.id, da.user_id, u.full_name, u.usn, u.email,
              da.attendance_key, da.attended_at, da.notes,
              sa.cgpa, sa.branch
       FROM drive_attendees da
       JOIN users u ON da.user_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE da.drive_id = ?
       ORDER BY da.attended_at DESC`,
      [driveId]
    );

    res.json({
      success: true,
      data: attendees,
      count: attendees.length
    });
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendees'
    });
  }
};

/**
 * @desc    Add students as attendees to a drive (bulk operation)
 * @route   POST /api/drives/:driveId/attendees
 * @access  Private/Admin
 */
const addAttendees = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { driveId } = req.params;
    const { userIds, notes } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required and must not be empty'
      });
    }

    // Verify drive exists
    const [drive] = await promisePool.query(
      'SELECT id, company_name FROM placement_drives WHERE id = ?',
      [driveId]
    );

    if (drive.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    await connection.beginTransaction();

    // Get existing keys for this drive to avoid duplicates
    const [existingAttendees] = await connection.query(
      'SELECT attendance_key FROM drive_attendees WHERE drive_id = ?',
      [driveId]
    );

    const existingKeys = existingAttendees.map(a => a.attendance_key);

    // Generate unique keys for new attendees
    const newKeys = generateMultipleAttendanceKeys(userIds.length, existingKeys);

    // Prepare bulk insert data
    const insertData = userIds.map((userId, index) => [
      driveId,
      userId,
      newKeys[index],
      req.user.id, // marked_by
      notes || null
    ]);

    // Bulk insert attendees
    const insertQuery = `
      INSERT INTO drive_attendees (drive_id, user_id, attendance_key, marked_by, notes)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        attendance_key = VALUES(attendance_key),
        marked_by = VALUES(marked_by),
        notes = VALUES(notes),
        updated_at = NOW()
    `;

    await connection.query(insertQuery, [insertData]);

    // Prepare response with user details and generated keys
    const [newAttendees] = await connection.query(
      `SELECT u.id as user_id, u.full_name, u.usn, da.attendance_key
       FROM drive_attendees da
       JOIN users u ON da.user_id = u.id
       WHERE da.drive_id = ? AND da.user_id IN (?)
       ORDER BY da.created_at DESC
       LIMIT ?`,
      [driveId, userIds, userIds.length]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Successfully added ${userIds.length} attendee(s) to ${drive[0].company_name}`,
      data: newAttendees
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add attendees error:', error);

    // Check for specific constraint violations
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'One or more students are already marked as attendees for this drive'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add attendees'
    });
  } finally {
    connection.release();
  }
};

/**
 * @desc    Remove a student's attendance from a drive
 * @route   DELETE /api/drives/:driveId/attendees/:userId
 * @access  Private/Admin
 */
const removeAttendee = async (req, res) => {
  try {
    const { driveId, userId } = req.params;

    // Verify drive exists
    const [drive] = await promisePool.query(
      'SELECT id, company_name FROM placement_drives WHERE id = ?',
      [driveId]
    );

    if (drive.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    // Delete attendee record
    const [result] = await promisePool.query(
      'DELETE FROM drive_attendees WHERE drive_id = ? AND user_id = ?',
      [driveId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendee record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance removed successfully',
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Remove attendee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove attendee'
    });
  }
};

/**
 * @desc    Get list of eligible students who haven't attended this drive yet
 * @route   GET /api/drives/:driveId/non-attendees
 * @access  Private/Admin
 */
const getNonAttendees = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { search, filter } = req.query;

    // Verify drive exists
    const [drive] = await promisePool.query(
      'SELECT id FROM placement_drives WHERE id = ?',
      [driveId]
    );

    if (drive.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    // Build the query
    let query = `
      SELECT DISTINCT u.id, u.full_name, u.usn, u.email, u.is_placed,
                      sa.cgpa, sa.branch,
                      (SELECT COUNT(*) FROM applications WHERE drive_id = ? AND user_id = u.id) as applied_count
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      WHERE u.role = 'student'
        AND u.id NOT IN (SELECT user_id FROM drive_attendees WHERE drive_id = ?)
        AND u.is_placed = 0
    `;

    const params = [driveId, driveId];

    // Apply filters
    if (filter === 'applied') {
      query += ` AND (SELECT COUNT(*) FROM applications WHERE drive_id = ? AND user_id = u.id) > 0`;
      params.push(driveId);
    } else if (filter === 'not_applied') {
      query += ` AND (SELECT COUNT(*) FROM applications WHERE drive_id = ? AND user_id = u.id) = 0`;
      params.push(driveId);
    }

    // Apply search
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (u.full_name LIKE ? OR u.usn LIKE ? OR u.email LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY u.full_name ASC LIMIT 100`;

    const [students] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Get non-attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch non-attendees list'
    });
  }
};

/**
 * @desc    Send message to all attendees of a drive
 * @route   POST /api/drives/:driveId/attendees/send-message
 * @access  Private/Admin
 */
const sendMessageToAttendees = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { driveId } = req.params;
    const { subject, message, examLink, messageType } = req.body;

    // Validate input
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    if (messageType !== 'general' && !examLink) {
      return res.status(400).json({
        success: false,
        message: 'Link is required for exam/interview message types'
      });
    }

    // Verify drive exists
    const [drive] = await promisePool.query(
      'SELECT id, company_name FROM placement_drives WHERE id = ?',
      [driveId]
    );

    if (drive.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    await connection.beginTransaction();

    // Get all attendees for this drive
    const [attendees] = await connection.query(
      'SELECT user_id FROM drive_attendees WHERE drive_id = ?',
      [driveId]
    );

    if (attendees.length === 0) {
      await connection.commit();
      return res.json({
        success: true,
        message: 'No attendees to send messages to',
        sentCount: 0
      });
    }

    // Prepare message content - include link if provided
    let messageContent = message;
    if (examLink) {
      messageContent += `\n\n🔗 ${examLink}`;
    }

    // Create messages for all attendees in bulk
    const insertMessages = attendees.map(attendee => [
      req.user.id,                    // from_admin_id
      attendee.user_id,               // to_user_id
      subject,
      messageContent,
      'Drive',                        // message_type
      null,                           // parent_message_id
      'PlacementDrive',               // related_entity_type
      driveId,                        // related_entity_id
      0                               // is_read (not read yet)
    ]);

    const insertQuery = `
      INSERT INTO admin_messages
      (from_admin_id, to_user_id, subject, message, message_type,
       parent_message_id, related_entity_type, related_entity_id, is_read)
      VALUES ?
    `;

    await connection.query(insertQuery, [insertMessages]);

    // Log the action
    await connection.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, entity_id, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        'Send',
        'Message',
        driveId,
        `Sent ${messageType} message to ${attendees.length} attendee(s) for ${drive[0].company_name}`,
        JSON.stringify({
          driveId,
          driveName: drive[0].company_name,
          messageType,
          attendeeCount: attendees.length,
          subject
        })
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Message sent successfully to ${attendees.length} attendee(s)`,
      sentCount: attendees.length,
      driveName: drive[0].company_name,
      messageType
    });

  } catch (error) {
    await connection.rollback();
    console.error('Send message to attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message to attendees'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAttendees,
  addAttendees,
  removeAttendee,
  getNonAttendees,
  sendMessageToAttendees
};
