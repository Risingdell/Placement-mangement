const { promisePool } = require('../config/database');

// Get all authorized emails with filters and statistics
exports.getAllAuthorizedEmails = async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      batch_year = '',
      branch = '',
      sortBy = 'created_at',
      order = 'DESC',
      limit = 20,
      offset = 0
    } = req.query;

    const allowedSortColumns = new Set([
      'id',
      'email',
      'student_name',
      'usn',
      'branch',
      'batch_year',
      'is_active',
      'is_used',
      'created_at',
      'updated_at'
    ]);
    const safeSortBy = allowedSortColumns.has(sortBy) ? sortBy : 'created_at';
    const safeOrder = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const safeLimit = Number.isFinite(parseInt(limit, 10)) ? Math.max(1, parseInt(limit, 10)) : 20;
    const safeOffset = Number.isFinite(parseInt(offset, 10)) ? Math.max(0, parseInt(offset, 10)) : 0;

    let whereClause = '1=1';
    const params = [];

    // Search filter (email, student_name, usn)
    if (search) {
      whereClause += ' AND (ae.email LIKE ? OR ae.student_name LIKE ? OR ae.usn LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Status filter
    if (status === 'active') {
      whereClause += ' AND ae.is_active = 1';
    } else if (status === 'used') {
      whereClause += ' AND ae.is_used = 1';
    } else if (status === 'unused') {
      whereClause += ' AND ae.is_used = 0';
    } else if (status === 'inactive') {
      whereClause += ' AND ae.is_active = 0';
    }

    // Batch year filter
    if (batch_year) {
      whereClause += ' AND ae.batch_year = ?';
      params.push(batch_year);
    }

    // Branch filter
    if (branch) {
      whereClause += ' AND ae.branch = ?';
      params.push(branch);
    }

    // Get total count
    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM authorized_emails ae WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get paginated results
    const [emails] = await promisePool.query(
      `SELECT ae.*,
              u1.full_name as added_by_name,
              u2.full_name as used_by_name
       FROM authorized_emails ae
       LEFT JOIN users u1 ON ae.added_by = u1.id
       LEFT JOIN users u2 ON ae.used_by_user_id = u2.id
       WHERE ${whereClause}
       ORDER BY ae.${safeSortBy} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, safeOffset]
    );

    // Get statistics
    const [stats] = await promisePool.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN ae.is_active = 1 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN ae.is_used = 1 THEN 1 ELSE 0 END) as used_count,
        SUM(CASE WHEN ae.is_active = 1 AND ae.is_used = 0 THEN 1 ELSE 0 END) as available_count
       FROM authorized_emails ae`
    );

    res.json({
      success: true,
      data: emails,
      pagination: {
        total,
        limit: safeLimit,
        offset: safeOffset,
        totalPages: Math.ceil(total / safeLimit)
      },
      statistics: stats[0]
    });
  } catch (error) {
    console.error('Error fetching authorized emails:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching authorized emails',
      error: error.message
    });
  }
};

// Get single authorized email
exports.getAuthorizedEmailById = async (req, res) => {
  try {
    const { id } = req.params;

    const [emails] = await promisePool.query(
      `SELECT ae.*,
              u1.full_name as added_by_name,
              u2.full_name as used_by_name
       FROM authorized_emails ae
       LEFT JOIN users u1 ON ae.added_by = u1.id
       LEFT JOIN users u2 ON ae.used_by_user_id = u2.id
       WHERE ae.id = ?`,
      [id]
    );

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Authorized email not found'
      });
    }

    res.json({
      success: true,
      data: emails[0]
    });
  } catch (error) {
    console.error('Error fetching authorized email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching authorized email',
      error: error.message
    });
  }
};

// Create authorized email
exports.createAuthorizedEmail = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const {
      email,
      student_name = null,
      usn = null,
      branch = null,
      batch_year = null,
      notes = null
    } = req.body;

    // Validation
    if (!email || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check for duplicates (case-insensitive)
    const [existing] = await connection.query(
      'SELECT id FROM authorized_emails WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists in authorized list'
      });
    }

    await connection.beginTransaction();

    // Insert authorized email
    const [result] = await connection.query(
      `INSERT INTO authorized_emails
       (email, student_name, usn, branch, batch_year, notes, added_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        email.trim(),
        student_name ? student_name.trim() : null,
        usn ? usn.trim() : null,
        branch ? branch.trim() : null,
        batch_year ? parseInt(batch_year) : null,
        notes ? notes.trim() : null,
        req.user.id
      ]
    );

    // Log admin action
    await connection.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, entity_id, description, created_at)
       VALUES (?, 'Create', 'AuthorizedEmail', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Added authorized email: ${email}`]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Email authorized successfully',
      data: { id: result.insertId, email: email.trim() }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating authorized email:', error);
    res.status(500).json({
      success: false,
      message: 'Error authorizing email',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Bulk create authorized emails
exports.bulkCreateAuthorizedEmails = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Emails array is required'
      });
    }

    const results = {
      total: emails.length,
      created: 0,
      duplicates: 0,
      errors: []
    };

    await connection.beginTransaction();

    for (const emailData of emails) {
      try {
        const email = emailData.email ? emailData.email.trim() : '';

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          results.errors.push({
            email: emailData.email || 'invalid',
            reason: 'Invalid email format'
          });
          continue;
        }

        // Check for duplicates
        const [existing] = await connection.query(
          'SELECT id FROM authorized_emails WHERE LOWER(email) = LOWER(?)',
          [email]
        );

        if (existing.length > 0) {
          results.duplicates++;
          continue;
        }

        // Insert
        await connection.query(
          `INSERT INTO authorized_emails
           (email, student_name, usn, branch, batch_year, notes, added_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            email,
            emailData.student_name ? emailData.student_name.trim() : null,
            emailData.usn ? emailData.usn.trim() : null,
            emailData.branch ? emailData.branch.trim() : null,
            emailData.batch_year ? parseInt(emailData.batch_year) : null,
            emailData.notes ? emailData.notes.trim() : null,
            req.user.id
          ]
        );

        results.created++;
      } catch (error) {
        results.errors.push({
          email: emailData.email || 'unknown',
          reason: error.message
        });
      }
    }

    // Log bulk operation
    await connection.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, description, created_at)
       VALUES (?, 'Create', 'AuthorizedEmail', ?, NOW())`,
      [req.user.id, `Bulk authorized ${results.created} emails`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Bulk upload completed: ${results.created} created, ${results.duplicates} duplicates skipped${results.errors.length > 0 ? `, ${results.errors.length} errors` : ''}`,
      data: results
    });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Bulk upload failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Update authorized email
exports.updateAuthorizedEmail = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { id } = req.params;
    const {
      email,
      student_name,
      usn,
      branch,
      batch_year,
      notes,
      is_active
    } = req.body;

    // Get existing record
    const [existing] = await connection.query(
      'SELECT * FROM authorized_emails WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Authorized email not found'
      });
    }

    const record = existing[0];

    // If email is being changed, validate
    if (email && email !== record.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Prevent changing email if already used
      if (record.is_used) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change email that has already been used for registration'
        });
      }

      // Check for duplicates
      const [duplicates] = await connection.query(
        'SELECT id FROM authorized_emails WHERE LOWER(email) = LOWER(?) AND id != ?',
        [email.trim(), id]
      );

      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists in authorized list'
        });
      }
    }

    await connection.beginTransaction();

    // Prepare update fields
    const updateFields = [];
    const updateValues = [];

    if (email && email !== record.email) {
      updateFields.push('email = ?');
      updateValues.push(email.trim());
    }
    if (student_name !== undefined) {
      updateFields.push('student_name = ?');
      updateValues.push(student_name ? student_name.trim() : null);
    }
    if (usn !== undefined) {
      updateFields.push('usn = ?');
      updateValues.push(usn ? usn.trim() : null);
    }
    if (branch !== undefined) {
      updateFields.push('branch = ?');
      updateValues.push(branch ? branch.trim() : null);
    }
    if (batch_year !== undefined) {
      updateFields.push('batch_year = ?');
      updateValues.push(batch_year ? parseInt(batch_year) : null);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes ? notes.trim() : null);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active ? 1 : 0);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      await connection.query(
        `UPDATE authorized_emails SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Log admin action
    await connection.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, entity_id, description, created_at)
       VALUES (?, 'Update', 'AuthorizedEmail', ?, ?, NOW())`,
      [req.user.id, id, `Updated authorized email: ${record.email}`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Email updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating authorized email:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating authorized email',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Delete authorized email
exports.deleteAuthorizedEmail = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { id } = req.params;

    // Get email details
    const [emails] = await connection.query(
      'SELECT * FROM authorized_emails WHERE id = ?',
      [id]
    );

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Authorized email not found'
      });
    }

    const email = emails[0];

    // Check if email is already used
    if (email.is_used) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete email that has already been used for registration'
      });
    }

    await connection.beginTransaction();

    // Delete email
    await connection.query(
      'DELETE FROM authorized_emails WHERE id = ?',
      [id]
    );

    // Log admin action
    await connection.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, entity_id, description, created_at)
       VALUES (?, 'Delete', 'AuthorizedEmail', ?, ?, NOW())`,
      [req.user.id, id, `Deleted authorized email: ${email.email}`]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Email deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting authorized email:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting authorized email',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Toggle email status (active/inactive)
exports.toggleEmailStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const [emails] = await promisePool.query(
      'SELECT is_active FROM authorized_emails WHERE id = ?',
      [id]
    );

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Authorized email not found'
      });
    }

    const newStatus = emails[0].is_active ? 0 : 1;

    // Update status
    await promisePool.query(
      'UPDATE authorized_emails SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, id]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions
       (admin_id, action_type, entity_type, entity_id, description, created_at)
       VALUES (?, 'Update', 'AuthorizedEmail', ?, ?, NOW())`,
      [req.user.id, id, `${newStatus ? 'Activated' : 'Deactivated'} authorized email`]
    );

    res.json({
      success: true,
      message: `Email ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { id, is_active: newStatus }
    });
  } catch (error) {
    console.error('Error toggling email status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling email status',
      error: error.message
    });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const [stats] = await promisePool.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN is_used = 1 THEN 1 ELSE 0 END) as used_count,
        SUM(CASE WHEN is_active = 1 AND is_used = 0 THEN 1 ELSE 0 END) as available_count
       FROM authorized_emails`
    );

    // Get branch-wise distribution
    const [branchStats] = await promisePool.query(
      `SELECT branch, COUNT(*) as count
       FROM authorized_emails
       WHERE branch IS NOT NULL
       GROUP BY branch
       ORDER BY count DESC`
    );

    // Get batch-wise distribution
    const [batchStats] = await promisePool.query(
      `SELECT batch_year, COUNT(*) as count
       FROM authorized_emails
       WHERE batch_year IS NOT NULL
       GROUP BY batch_year
       ORDER BY batch_year DESC`
    );

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byBranch: branchStats,
        byBatch: batchStats
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Check email authorization (public endpoint - for registration)
exports.checkEmailAuthorization = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        authorized: false,
        reason: 'Email is required'
      });
    }

    const [authorized] = await promisePool.query(
      `SELECT id, is_active, is_used
       FROM authorized_emails
       WHERE LOWER(email) = LOWER(?) LIMIT 1`,
      [email.trim()]
    );

    if (authorized.length === 0) {
      return res.json({
        success: true,
        authorized: false,
        reason: 'Email is not authorized for registration'
      });
    }

    const record = authorized[0];

    if (!record.is_active) {
      return res.json({
        success: true,
        authorized: false,
        reason: 'Email has been deactivated'
      });
    }

    if (record.is_used) {
      return res.json({
        success: true,
        authorized: false,
        reason: 'Email has already been used for registration'
      });
    }

    res.json({
      success: true,
      authorized: true,
      reason: 'Email is authorized for registration'
    });
  } catch (error) {
    console.error('Error checking email authorization:', error);
    res.status(500).json({
      success: false,
      authorized: false,
      message: 'Error checking email authorization',
      error: error.message
    });
  }
};
