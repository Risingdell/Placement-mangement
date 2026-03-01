const db = require('../config/database');

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const { search, type, priority, active } = req.query;

    let query = `
      SELECT n.*,
        creator.name as created_by_name,
        COUNT(nr.id) as recipient_count,
        SUM(CASE WHEN nr.is_read = 1 THEN 1 ELSE 0 END) as read_count
      FROM notifications n
      JOIN users creator ON n.created_by = creator.id
      LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (n.title LIKE ? OR n.message LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ` AND n.type = ?`;
      params.push(type);
    }

    if (priority) {
      query += ` AND n.priority = ?`;
      params.push(priority);
    }

    if (active !== undefined) {
      const now = new Date().toISOString();
      if (active === 'true') {
        query += ` AND n.is_active = 1 AND (n.expires_at IS NULL OR n.expires_at > ?)`;
        params.push(now);
      } else {
        query += ` AND (n.is_active = 0 OR n.expires_at <= ?)`;
        params.push(now);
      }
    }

    query += ` GROUP BY n.id ORDER BY n.created_at DESC`;

    const [notifications] = await db.query(query, params);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [notifications] = await db.query(
      `SELECT n.*,
        creator.name as created_by_name,
        COUNT(nr.id) as recipient_count,
        SUM(CASE WHEN nr.is_read = 1 THEN 1 ELSE 0 END) as read_count
       FROM notifications n
       JOIN users creator ON n.created_by = creator.id
       LEFT JOIN notification_recipients nr ON n.id = nr.notification_id
       WHERE n.id = ?
       GROUP BY n.id`,
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notifications[0]
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification details',
      error: error.message
    });
  }
};

// Create notification
exports.createNotification = async (req, res) => {
  try {
    const {
      title, message, type, priority, target_audience,
      target_criteria, action_url, expires_at
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO notifications (
        title, message, type, priority, target_audience,
        target_criteria, action_url, expires_at, created_by,
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [title, message, type || 'Info', priority || 'Medium',
       target_audience || 'All', target_criteria, action_url,
       expires_at, req.user.id]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Create', 'Notification', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Created notification: ${title}`]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Update notification
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await db.query(
      `UPDATE notifications SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Update', 'Notification', ?, ?, NOW())`,
      [req.user.id, id, `Updated notification`]
    );

    res.json({
      success: true,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete notification recipients first
    await db.query('DELETE FROM notification_recipients WHERE notification_id = ?', [id]);

    // Delete notification
    await db.query('DELETE FROM notifications WHERE id = ?', [id]);

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Delete', 'Notification', ?, ?, NOW())`,
      [req.user.id, id, `Deleted notification`]
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Send notification to recipients
exports.sendNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Get notification details
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const notification = notifications[0];

    // Get target recipients based on target_audience
    let recipientQuery = 'SELECT id FROM users WHERE role = "student"';
    const params = [];

    if (notification.target_audience !== 'All' && notification.target_criteria) {
      const criteria = JSON.parse(notification.target_criteria);

      if (criteria.branch) {
        recipientQuery += ' AND id IN (SELECT user_id FROM student_academics WHERE branch = ?)';
        params.push(criteria.branch);
      }

      if (criteria.year) {
        recipientQuery += ' AND id IN (SELECT user_id FROM student_academics WHERE year = ?)';
        params.push(criteria.year);
      }

      if (criteria.is_placed !== undefined) {
        recipientQuery += ' AND is_placed = ?';
        params.push(criteria.is_placed ? 1 : 0);
      }
    }

    const [recipients] = await db.query(recipientQuery, params);

    // Insert notification recipients
    const recipientValues = recipients.map(r => [id, r.id]);

    if (recipientValues.length > 0) {
      await db.query(
        `INSERT INTO notification_recipients (notification_id, user_id, sent_at)
         VALUES ?`,
        [recipientValues]
      );
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Send', 'Notification', ?, ?, NOW())`,
      [req.user.id, id, `Sent notification to ${recipients.length} recipients`]
    );

    res.json({
      success: true,
      message: `Notification sent to ${recipients.length} recipients`,
      data: { recipientCount: recipients.length }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notification',
      error: error.message
    });
  }
};

// Get notification recipients
exports.getNotificationRecipients = async (req, res) => {
  try {
    const { id } = req.params;

    const [recipients] = await db.query(
      `SELECT nr.*,
        u.name, u.email, u.usn,
        sa.branch, sa.year
       FROM notification_recipients nr
       JOIN users u ON nr.user_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE nr.notification_id = ?
       ORDER BY nr.sent_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: recipients,
      count: recipients.length
    });
  } catch (error) {
    console.error('Error fetching notification recipients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification recipients',
      error: error.message
    });
  }
};
