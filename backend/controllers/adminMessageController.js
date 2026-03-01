const db = require('../config/database');

// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const { search, type, unreadOnly } = req.query;

    let query = `
      SELECT am.*,
        sender.name as sender_name,
        recipient.name as recipient_name, recipient.email as recipient_email
      FROM admin_messages am
      LEFT JOIN users sender ON am.sender_id = sender.id
      JOIN users recipient ON am.recipient_id = recipient.id
      WHERE am.sender_id = ? OR am.recipient_id = ?
    `;

    const params = [req.user.id, req.user.id];

    if (search) {
      query += ` AND (am.subject LIKE ? OR am.message LIKE ? OR recipient.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ` AND am.message_type = ?`;
      params.push(type);
    }

    if (unreadOnly === 'true') {
      query += ` AND am.is_read = 0`;
    }

    query += ` ORDER BY am.sent_at DESC`;

    const [messages] = await db.query(query, params);

    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Get message by ID
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const [messages] = await db.query(
      `SELECT am.*,
        sender.name as sender_name, sender.email as sender_email,
        recipient.name as recipient_name, recipient.email as recipient_email
       FROM admin_messages am
       LEFT JOIN users sender ON am.sender_id = sender.id
       JOIN users recipient ON am.recipient_id = recipient.id
       WHERE am.id = ?`,
      [id]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Get replies
    const [replies] = await db.query(
      `SELECT am.*,
        sender.name as sender_name
       FROM admin_messages am
       JOIN users sender ON am.sender_id = sender.id
       WHERE am.parent_message_id = ?
       ORDER BY am.sent_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...messages[0],
        replies
      }
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message details',
      error: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { recipient_id, subject, message, message_type, related_entity_type, related_entity_id } = req.body;

    const [result] = await db.query(
      `INSERT INTO admin_messages (
        sender_id, recipient_id, subject, message, message_type,
        related_entity_type, related_entity_id, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, recipient_id, subject, message, message_type || 'General',
       related_entity_type, related_entity_id]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Send', 'Message', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Sent message to student: ${subject}`]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Reply to message
exports.replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Get original message
    const [originalMessages] = await db.query(
      'SELECT * FROM admin_messages WHERE id = ?',
      [id]
    );

    if (originalMessages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Original message not found'
      });
    }

    const original = originalMessages[0];

    const [result] = await db.query(
      `INSERT INTO admin_messages (
        sender_id, recipient_id, subject, message, message_type,
        parent_message_id, related_entity_type, related_entity_id, sent_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, original.sender_id, `Re: ${original.subject}`, message,
       original.message_type, id, original.related_entity_type, original.related_entity_id]
    );

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reply',
      error: error.message
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE admin_messages SET is_read = 1, read_at = NOW() WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM admin_messages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};
