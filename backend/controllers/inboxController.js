const { promisePool } = require('../config/database');

// @desc    Get all inbox messages for current user
// @route   GET /api/inbox
// @access  Private
const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly } = req.query;

    let query = `
      SELECT im.id, im.subject, im.message, im.message_type, im.is_read,
             im.action_url, im.sent_at, im.read_at,
             pd.company_name, pd.role
      FROM inbox_messages im
      LEFT JOIN placement_drives pd ON im.related_drive_id = pd.id
      WHERE im.recipient_id = ?
    `;

    const params = [userId];

    if (unreadOnly === 'true') {
      query += ' AND im.is_read = FALSE';
    }

    query += ' ORDER BY im.sent_at DESC';

    const [messages] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// @desc    Get single message
// @route   GET /api/inbox/:id
// @access  Private
const getMessageById = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    await connection.beginTransaction();

    const [messages] = await connection.query(
      `SELECT im.*, pd.company_name, pd.role, pd.drive_date
       FROM inbox_messages im
       LEFT JOIN placement_drives pd ON im.related_drive_id = pd.id
       WHERE im.id = ? AND im.recipient_id = ?`,
      [messageId, userId]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = messages[0];

    // Mark as read if not already
    if (!message.is_read) {
      await connection.query(
        'UPDATE inbox_messages SET is_read = TRUE, read_at = NOW() WHERE id = ?',
        [messageId]
      );
      message.is_read = true;
      message.read_at = new Date();
    }

    await connection.commit();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    await connection.rollback();
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  } finally {
    connection.release();
  }
};

// @desc    Mark message as read
// @route   PUT /api/inbox/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const [result] = await promisePool.query(
      'UPDATE inbox_messages SET is_read = TRUE, read_at = NOW() WHERE id = ? AND recipient_id = ?',
      [messageId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// @desc    Mark message as unread
// @route   PUT /api/inbox/:id/unread
// @access  Private
const markAsUnread = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const [result] = await promisePool.query(
      'UPDATE inbox_messages SET is_read = FALSE, read_at = NULL WHERE id = ? AND recipient_id = ?',
      [messageId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as unread'
    });
  } catch (error) {
    console.error('Mark as unread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as unread'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/inbox/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.id;

    const [result] = await promisePool.query(
      'DELETE FROM inbox_messages WHERE id = ? AND recipient_id = ?',
      [messageId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/inbox/unread/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await promisePool.query(
      'SELECT COUNT(*) as count FROM inbox_messages WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: { count: result[0].count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// @desc    Get inbox preview (recent messages for dashboard)
// @route   GET /api/inbox/preview
// @access  Private
const getInboxPreview = async (req, res) => {
  try {
    const userId = req.user.id;

    const [messages] = await promisePool.query(
      `SELECT im.id, im.subject, im.message_type, im.is_read, im.sent_at,
              pd.company_name
       FROM inbox_messages im
       LEFT JOIN placement_drives pd ON im.related_drive_id = pd.id
       WHERE im.recipient_id = ?
       ORDER BY im.sent_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get inbox preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inbox preview'
    });
  }
};

// @desc    Send message to student (Admin only)
// @route   POST /api/inbox/send
// @access  Private/Admin
const sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, message, messageType, relatedDriveId, actionUrl } = req.body;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, subject, and message are required'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO inbox_messages
       (recipient_id, sender_id, subject, message, message_type, related_drive_id, action_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recipientId, req.user.id, subject, message, messageType || 'Notification', relatedDriveId, actionUrl]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// @desc    Send bulk messages (Admin only)
// @route   POST /api/inbox/send-bulk
// @access  Private/Admin
const sendBulkMessage = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { recipientIds, subject, message, messageType, relatedDriveId, actionUrl } = req.body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipient IDs array is required'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    await connection.beginTransaction();

    const values = recipientIds.map(recipientId => [
      recipientId,
      req.user.id,
      subject,
      message,
      messageType || 'Notification',
      relatedDriveId,
      actionUrl
    ]);

    await connection.query(
      `INSERT INTO inbox_messages
       (recipient_id, sender_id, subject, message, message_type, related_drive_id, action_url)
       VALUES ?`,
      [values]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: `Messages sent successfully to ${recipientIds.length} recipients`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Send bulk message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk messages'
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  getMyMessages,
  getMessageById,
  markAsRead,
  markAsUnread,
  deleteMessage,
  getUnreadCount,
  getInboxPreview,
  sendMessage,
  sendBulkMessage
};
