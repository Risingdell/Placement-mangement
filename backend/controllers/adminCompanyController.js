const db = require('../config/database');

// Get all companies with stats
exports.getAllCompanies = async (req, res) => {
  try {
    const { search, type, status, sortBy = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT c.*,
        COUNT(DISTINCT pd.id) as total_drives,
        COUNT(DISTINCT cs.student_id) as total_shortlisted,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN a.user_id END) as total_selected
      FROM companies c
      LEFT JOIN placement_drives pd ON c.id = pd.company_id
      LEFT JOIN company_shortlists cs ON c.id = cs.company_id
      LEFT JOIN applications a ON pd.id = a.drive_id
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

    query += ` GROUP BY c.id ORDER BY c.${sortBy} ${order}`;

    const [companies] = await db.query(query, params);

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

    const [companies] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get associated drives
    const [drives] = await db.query(
      `SELECT pd.*, COUNT(a.id) as application_count
       FROM placement_drives pd
       LEFT JOIN applications a ON pd.id = a.drive_id
       WHERE pd.company_id = ?
       GROUP BY pd.id
       ORDER BY pd.drive_date DESC`,
      [id]
    );

    // Get shortlists
    const [shortlists] = await db.query(
      `SELECT cs.*, u.name as student_name, u.email, sa.cgpa
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
        drives,
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
      contact_email, contact_phone, hr_name, hr_email, hr_phone,
      employee_count, is_active
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO companies (
        name, company_type, industry, location, website, description,
        contact_email, contact_phone, hr_name, hr_email, hr_phone,
        employee_count, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name, company_type, industry, location, website, description,
        contact_email, contact_phone, hr_name, hr_email, hr_phone,
        employee_count, is_active !== undefined ? is_active : 1
      ]
    );

    // Log admin action
    await db.query(
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

    await db.query(
      `UPDATE companies SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Log admin action
    await db.query(
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
    const [drives] = await db.query(
      'SELECT COUNT(*) as count FROM placement_drives WHERE company_id = ?',
      [id]
    );

    if (drives[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with associated placement drives'
      });
    }

    await db.query('DELETE FROM companies WHERE id = ?', [id]);

    // Log admin action
    await db.query(
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

    const [shortlists] = await db.query(
      `SELECT cs.*,
        u.name as student_name, u.email, u.usn,
        sa.cgpa, sa.branch,
        pd.role as drive_role, pd.ctc,
        admin.name as shortlisted_by_name
       FROM company_shortlists cs
       JOIN users u ON cs.student_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       LEFT JOIN placement_drives pd ON cs.drive_id = pd.id
       LEFT JOIN users admin ON cs.shortlisted_by = admin.id
       WHERE cs.company_id = ?
       ORDER BY cs.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: shortlists
    });
  } catch (error) {
    console.error('Error fetching shortlists:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shortlists',
      error: error.message
    });
  }
};

// Create shortlist
exports.createShortlist = async (req, res) => {
  try {
    const { id: company_id } = req.params;
    const { drive_id, student_id, remarks } = req.body;

    const [result] = await db.query(
      `INSERT INTO company_shortlists (
        company_id, drive_id, student_id, shortlisted_by,
        status, remarks, created_at
      ) VALUES (?, ?, ?, ?, 'Shortlisted', ?, NOW())`,
      [company_id, drive_id, student_id, req.user.id, remarks]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Create', 'Shortlist', ?, ?, NOW())`,
      [req.user.id, result.insertId, `Shortlisted student for company`]
    );

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

    await db.query(
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

    await db.query('DELETE FROM company_shortlists WHERE id = ?', [shortlistId]);

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
