const db = require('../config/database');

// Get all applications with filters
exports.getAllApplications = async (req, res) => {
  try {
    const { search, status, company, sortBy = 'applied_at', order = 'DESC' } = req.query;

    let query = `
      SELECT a.*,
        u.name as student_name, u.email, u.usn,
        sa.cgpa, sa.branch, sa.year,
        pd.name as company_name, pd.role, pd.ctc
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.usn LIKE ? OR pd.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    if (company) {
      query += ` AND pd.name LIKE ?`;
      params.push(`%${company}%`);
    }

    query += ` ORDER BY a.${sortBy} ${order}`;

    const [applications] = await db.query(query, params);

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// Get application statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'Applied' THEN 1 END) as applied,
        COUNT(CASE WHEN status = 'Shortlisted' THEN 1 END) as shortlisted,
        COUNT(CASE WHEN status = 'Selected' THEN 1 END) as selected,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected
      FROM applications
    `);

    // Company-wise stats
    const [companyStats] = await db.query(`
      SELECT
        pd.name as company,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN a.status = 'Selected' THEN 1 END) as selections
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      GROUP BY pd.name
      ORDER BY total_applications DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byCompany: companyStats
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
};

// Get application by ID
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [applications] = await db.query(
      `SELECT a.*,
        u.name as student_name, u.email, u.usn, u.phone,
        sa.cgpa, sa.branch, sa.year, sa.backlogs,
        sp.resume_url, sp.linkedin_url, sp.github_url,
        pd.name as company_name, pd.role, pd.ctc, pd.description as job_description
       FROM applications a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       JOIN placement_drives pd ON a.drive_id = pd.id
       WHERE a.id = ?`,
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: applications[0]
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application details',
      error: error.message
    });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Get application details
    const [applications] = await db.query(
      'SELECT * FROM applications WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application status
    await db.query(
      `UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    // If selected, update user's placement status
    if (status === 'Selected') {
      await db.query(
        `UPDATE users SET is_placed = 1, updated_at = NOW() WHERE id = ?`,
        [applications[0].user_id]
      );
    }

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Update', 'Application', ?, ?, NOW())`,
      [req.user.id, id, `Updated application status to ${status}`]
    );

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// Bulk update application status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { applicationIds, status } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application IDs'
      });
    }

    const placeholders = applicationIds.map(() => '?').join(',');

    await db.query(
      `UPDATE applications SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      [status, ...applicationIds]
    );

    // If selected, update users' placement status
    if (status === 'Selected') {
      await db.query(
        `UPDATE users u
         JOIN applications a ON u.id = a.user_id
         SET u.is_placed = 1, u.updated_at = NOW()
         WHERE a.id IN (${placeholders})`,
        applicationIds
      );
    }

    // Log bulk operation
    await db.query(
      `INSERT INTO bulk_operations (
        operation_type, target_entity, filter_criteria,
        total_count, status, initiated_by, created_at
      ) VALUES ('Status Update', 'Applications', ?, ?, 'Completed', ?, NOW())`,
      [JSON.stringify({ applicationIds }), applicationIds.length, req.user.id]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, description, created_at
      ) VALUES (?, 'Update', 'Application', ?, NOW())`,
      [req.user.id, `Bulk updated ${applicationIds.length} applications to ${status}`]
    );

    res.json({
      success: true,
      message: `${applicationIds.length} applications updated successfully`,
      data: { updated: applicationIds.length }
    });
  } catch (error) {
    console.error('Error bulk updating applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating applications',
      error: error.message
    });
  }
};

// Export applications
exports.exportApplications = async (req, res) => {
  try {
    const { filters, format = 'CSV' } = req.body;

    // Build query based on filters
    let query = `
      SELECT
        u.usn, u.name, u.email, u.phone,
        sa.cgpa, sa.branch, sa.year,
        pd.name as company, pd.role, pd.ctc,
        a.status, a.applied_at
      FROM applications a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE 1=1
    `;

    const params = [];

    if (filters?.status) {
      query += ` AND a.status = ?`;
      params.push(filters.status);
    }

    if (filters?.company) {
      query += ` AND pd.name LIKE ?`;
      params.push(`%${filters.company}%`);
    }

    const [applications] = await db.query(query, params);

    // Log export
    await db.query(
      `INSERT INTO export_logs (
        export_type, export_format, filter_criteria,
        file_name, record_count, exported_by, created_at
      ) VALUES ('Applications', ?, ?, ?, ?, ?, NOW())`,
      [format, JSON.stringify(filters), `applications_${Date.now()}.${format.toLowerCase()}`,
       applications.length, req.user.id]
    );

    // Log admin action
    await db.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, description, created_at
      ) VALUES (?, 'Export', 'Application', ?, NOW())`,
      [req.user.id, `Exported ${applications.length} applications`]
    );

    res.json({
      success: true,
      message: 'Applications exported successfully',
      data: applications
    });
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting applications',
      error: error.message
    });
  }
};
