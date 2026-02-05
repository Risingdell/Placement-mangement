const { promisePool } = require('../config/database');

// Get all companies with stats
exports.getAllCompanies = async (req, res) => {
  try {
    const { search, type, status, sortBy = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM company_shortlists cs WHERE cs.company_id = c.id) as total_shortlisted
      FROM companies c
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ` AND c.company_type = ?`;
      params.push(type);
    }

    if (status !== undefined) {
      query += ` AND c.is_active = ?`;
      params.push(status === 'active' ? 1 : 0);
    }

    query += ` ORDER BY c.${sortBy} ${order}`;

    const [companies] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// Get company by ID with detailed info
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const [companies] = await promisePool.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get shortlists
    const [shortlists] = await promisePool.query(
      `SELECT cs.*, u.full_name as student_name, u.email, sa.cgpa
       FROM company_shortlists cs
       JOIN users u ON cs.student_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE cs.company_id = ?
       ORDER BY cs.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...companies[0],
        shortlists
      }
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company details',
      error: error.message
    });
  }
};

// Create new company
exports.createCompany = async (req, res) => {
  try {
    const {
      name, company_type, industry, location, website, description,
      contact_email, contact_phone, hr_name,
      company_size, is_active
    } = req.body;

    const [result] = await promisePool.query(
      `INSERT INTO companies (
        name, company_type, industry, location, website, description,
        contact_email, contact_phone, hr_name,
        company_size, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name, company_type, industry, location, website, description,
        contact_email, contact_phone, hr_name,
        company_size, is_active !== undefined ? is_active : 1
      ]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Create', 'Company', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Created company: ${name}`]
    );

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const setClause = Object.keys(updateFields)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = [...Object.values(updateFields), id];

    await promisePool.query(
      `UPDATE companies SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Update', 'Company', ?, ?, NOW())`,
      [req.user.id, id, `Updated company details`]
    );

    res.json({
      success: true,
      message: 'Company updated successfully'
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company has associated drives
    const [drives] = await promisePool.query(
      'SELECT COUNT(*) as count FROM placement_drives WHERE company_id = ?',
      [id]
    );

    if (drives[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with associated placement drives'
      });
    }

    await promisePool.query('DELETE FROM companies WHERE id = ?', [id]);

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Delete', 'Company', ?, ?, NOW())`,
      [req.user.id, id, `Deleted company`]
    );

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};

// Get company shortlists
exports.getCompanyShortlists = async (req, res) => {
  try {
    const { id } = req.params;

    const [shortlists] = await promisePool.query(
      `SELECT cs.*,
        u.full_name as student_name, u.email, u.usn,
        sa.cgpa, sa.branch,
        pd.role as drive_role, pd.ctc as ctc,
        admin.full_name as shortlisted_by_name
       FROM company_shortlists cs
       JOIN users u ON cs.student_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       LEFT JOIN placement_drives pd ON cs.drive_id = pd.id
       LEFT JOIN users admin ON cs.shortlisted_by = admin.id
       WHERE cs.company_id = ?
       ORDER BY cs.created_at DESC`,
      [id]
    );

    console.log(`Found ${shortlists.length} shortlists for company ${id}`);

    res.json({
      success: true,
      data: shortlists
    });
  } catch (error) {
    console.error('Error fetching shortlists for company', req.params.id, ':', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shortlists',
      error: error.message,
      stack: error.stack
    });
  }
};

// Create shortlist
exports.createShortlist = async (req, res) => {
  try {
    const { id: company_id } = req.params;
    const { drive_id, student_id, remarks } = req.body;

    const [result] = await promisePool.query(
      `INSERT INTO company_shortlists (
        company_id, drive_id, student_id, shortlisted_by,
        status, remarks, created_at
      ) VALUES (?, ?, ?, ?, 'Shortlisted', ?, NOW())`,
      [company_id, drive_id || null, student_id, req.user.id, remarks]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Create', 'Shortlist', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Shortlisted student for company`]
    );

    // Send automated notification to student inbox
    try {
      const [companies] = await promisePool.query(
        'SELECT name FROM companies WHERE id = ?',
        [company_id]
      );

      if (companies.length > 0) {
        const companyName = companies[0].name;
        const subject = `Shortlisted for ${companyName}`;
        const messageText = `Congratulations! You have been shortlisted for ${companyName}. Keep checking your dashboard for further updates.`;

        await promisePool.query(
          `INSERT INTO inbox_messages 
           (recipient_id, sender_id, subject, message, message_type, related_drive_id, sent_at)
           VALUES (?, ?, ?, ?, 'Notification', ?, NOW())`,
          [student_id, req.user.id, subject, messageText, drive_id || null]
        );
      }
    } catch (notifyError) {
      console.error('Error sending automated notification:', notifyError);
      // We don't fail the whole request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Student shortlisted successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating shortlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shortlist',
      error: error.message
    });
  }
};

// Update shortlist status
exports.updateShortlistStatus = async (req, res) => {
  try {
    const { shortlistId } = req.params;
    const { status, remarks } = req.body;

    await promisePool.query(
      `UPDATE company_shortlists
       SET status = ?, remarks = ?, notified_at = NOW()
       WHERE id = ?`,
      [status, remarks, shortlistId]
    );

    res.json({
      success: true,
      message: 'Shortlist status updated successfully'
    });
  } catch (error) {
    console.error('Error updating shortlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shortlist status',
      error: error.message
    });
  }
};

// Delete shortlist
exports.deleteShortlist = async (req, res) => {
  try {
    const { shortlistId } = req.params;

    await promisePool.query('DELETE FROM company_shortlists WHERE id = ?', [shortlistId]);

    res.json({
      success: true,
      message: 'Shortlist removed successfully'
    });
  } catch (error) {
    console.error('Error deleting shortlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing shortlist',
      error: error.message
    });
  }
};

// Get eligible students based on criteria
exports.getEligibleStudents = async (req, res) => {
  try {
    const { minCgpa, branches, maxBacklogs, batchYears } = req.query;

    let query = `
      SELECT u.id, u.full_name as name, u.usn, u.email,
        sa.cgpa, sa.branch, sa.batch_year, sa.active_backlogs, sa.total_backlogs
      FROM users u
      JOIN student_academics sa ON u.id = sa.user_id
      WHERE u.role = 'student' AND u.is_active = 1 AND u.is_placed = 0
    `;

    const params = [];

    if (minCgpa && minCgpa !== '' && !isNaN(parseFloat(minCgpa))) {
      query += ` AND sa.cgpa >= ?`;
      params.push(parseFloat(minCgpa));
    }

    if (branches && branches !== '') {
      const branchList = branches.split(',').map(b => b.trim()).filter(b => b);
      if (branchList.length > 0) {
        query += ` AND sa.branch IN (${branchList.map(() => '?').join(',')})`;
        params.push(...branchList);
      }
    }

    if (maxBacklogs !== undefined && maxBacklogs !== '' && !isNaN(parseInt(maxBacklogs))) {
      query += ` AND sa.active_backlogs <= ?`;
      params.push(parseInt(maxBacklogs));
    }

    if (batchYears && batchYears !== '') {
      const yearList = batchYears.split(',').map(y => y.trim()).filter(y => y);
      if (yearList.length > 0) {
        query += ` AND sa.batch_year IN (${yearList.map(() => '?').join(',')})`;
        params.push(...yearList);
      }
    }

    query += ` ORDER BY sa.cgpa DESC, u.full_name ASC`;

    const [students] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching eligible students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching eligible students',
      error: error.message
    });
  }
};

// Send notifications to shortlisted students
exports.notifyShortlistedStudents = async (req, res) => {
  try {
    const company_id = req.params.id;

    // Get company name
    const [companies] = await promisePool.query(
      'SELECT name FROM companies WHERE id = ?',
      [company_id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const companyName = companies[0].name;

    // Get all shortlisted students who haven't been notified yet for this company
    const [shortlisted] = await promisePool.query(
      `SELECT student_id, drive_id FROM company_shortlists 
       WHERE company_id = ? AND status = 'Shortlisted'`,
      [company_id]
    );

    if (shortlisted.length === 0) {
      return res.json({
        success: true,
        message: 'No new students to notify',
      });
    }

    // Prepare notifications
    const subject = `Shortlisted for ${companyName}`;
    const messageText = `Congratulations! You have been shortlisted for ${companyName}. Keep checking your dashboard for further updates.`;

    for (const item of shortlisted) {
      // Insert into inbox_messages
      await promisePool.query(
        `INSERT INTO inbox_messages 
         (recipient_id, sender_id, subject, message, message_type, related_drive_id, sent_at)
         VALUES (?, ?, ?, ?, 'Notification', ?, NOW())`,
        [item.student_id, req.user.id, subject, messageText, item.drive_id || null]
      );

      // Update shortlist status
      await promisePool.query(
        `UPDATE company_shortlists 
         SET status = 'Notified', notified_at = NOW() 
         WHERE company_id = ? AND student_id = ?`,
        [company_id, item.student_id]
      );
    }

    res.json({
      success: true,
      message: `Notifications sent to ${shortlisted.length} students`,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
      error: error.message,
    });
  }
};
