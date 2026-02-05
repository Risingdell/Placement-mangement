const { promisePool } = require('../config/database');

// Get all students with filters
exports.getAllStudents = async (req, res) => {
  try {
    const { search, branch, year, placed, sortBy = 'name', order = 'ASC' } = req.query;

    let query = `
      SELECT u.id, u.full_name as name, u.email, u.usn, u.phone, u.is_placed, u.created_at,
        sa.cgpa, sa.branch, sa.batch_year as year, sa.active_backlogs as backlogs,
        pd.company_name as placed_company, pd.ctc,
        sa.resume_url
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status = 'Selected'
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE u.role = 'student'
    `;

    const params = [];

    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.usn LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (branch) {
      query += ` AND sa.branch = ?`;
      params.push(branch);
    }

    if (year) {
      query += ` AND sa.year = ?`;
      params.push(year);
    }

    if (placed !== undefined) {
      query += ` AND u.is_placed = ?`;
      params.push(placed === 'true' ? 1 : 0);
    }

    let sortColumn = 'full_name';
    if (sortBy === 'email') sortColumn = 'email';
    if (sortBy === 'usn') sortColumn = 'usn';
    if (sortBy === 'created_at') sortColumn = 'created_at';

    query += ` ORDER BY u.${sortColumn} ${order}`;

    const [students] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

// Get student statistics
exports.getStudentStats = async (req, res) => {
  try {
    const [stats] = await promisePool.query(`
      SELECT
        COUNT(DISTINCT u.id) as total_students,
        SUM(u.is_placed) as placed_students,
        COUNT(DISTINCT CASE WHEN sa.cgpa >= 6.0 THEN u.id END) as eligible_students,
        AVG(CASE WHEN u.is_placed THEN pd.ctc END) as avg_ctc,
        MAX(CASE WHEN u.is_placed THEN pd.ctc END) as highest_ctc,
        MIN(CASE WHEN u.is_placed THEN pd.ctc END) as lowest_ctc
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status = 'Selected'
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE u.role = 'student'
    `);

    // Branch-wise stats
    const [branchStats] = await promisePool.query(`
      SELECT
        sa.branch,
        COUNT(DISTINCT u.id) as total,
        SUM(u.is_placed) as placed,
        AVG(sa.cgpa) as avg_cgpa
      FROM users u
      JOIN student_academics sa ON u.id = sa.user_id
      WHERE u.role = 'student'
      GROUP BY sa.branch
    `);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        branchWise: branchStats
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: error.message
    });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [students] = await promisePool.query(
      `SELECT u.*, sa.*
       FROM users u
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE u.id = ? AND u.role = 'student'`,
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student applications
    const [applications] = await promisePool.query(
      `SELECT a.*, pd.company_name, pd.role, pd.ctc
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...students[0],
        applications
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student details',
      error: error.message
    });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Update user table
    if (updates.name || updates.email || updates.phone) {
      const userUpdates = {};
      if (updates.name) userUpdates.full_name = updates.name;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.phone) userUpdates.phone = updates.phone;

      const setClause = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
      await promisePool.query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...Object.values(userUpdates), id]
      );
    }

    // Update academics table
    if (updates.cgpa || updates.branch || updates.year || updates.backlogs !== undefined) {
      const academicUpdates = {};
      if (updates.cgpa) academicUpdates.cgpa = updates.cgpa;
      if (updates.branch) academicUpdates.branch = updates.branch;
      if (updates.year) academicUpdates.batch_year = updates.year;
      if (updates.backlogs !== undefined) academicUpdates.active_backlogs = updates.backlogs;

      const setClause = Object.keys(academicUpdates).map(key => `${key} = ?`).join(', ');
      await promisePool.query(
        `UPDATE student_academics SET ${setClause}, updated_at = NOW() WHERE user_id = ?`,
        [...Object.values(academicUpdates), id]
      );
    }

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Update', 'Student', ?, ?, NOW())`,
      [req.user.id, id, `Updated student profile`]
    );

    res.json({
      success: true,
      message: 'Student profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message
    });
  }
};

// Update placement status
exports.updatePlacementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_placed, company_id, ctc, offer_letter } = req.body;

    await promisePool.query(
      `UPDATE users SET is_placed = ?, updated_at = NOW() WHERE id = ?`,
      [is_placed, id]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Update', 'Student', ?, ?, NOW())`,
      [req.user.id, id, `Updated placement status to ${is_placed ? 'Placed' : 'Unplaced'}`]
    );

    res.json({
      success: true,
      message: 'Placement status updated successfully'
    });
  } catch (error) {
    console.error('Error updating placement status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating placement status',
      error: error.message
    });
  }
};

// Get document verifications
exports.getDocumentVerifications = async (req, res) => {
  try {
    const { status = 'Pending' } = req.query;

    const [documents] = await promisePool.query(
      `SELECT dv.*,
        u.full_name as student_name, u.email, u.usn,
        verifier.full_name as verifier_name
       FROM document_verifications dv
       JOIN users u ON dv.user_id = u.id
       LEFT JOIN users verifier ON dv.verified_by = verifier.id
       WHERE dv.status = ?
       ORDER BY dv.created_at DESC`,
      [status]
    );

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document verifications',
      error: error.message
    });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const { status, notes } = req.body;

    await promisePool.query(
      `UPDATE document_verifications
       SET status = ?, verified_by = ?, verification_notes = ?, verified_at = NOW()
       WHERE id = ?`,
      [status, req.user.id, notes, docId]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, 'Approve', 'Document', ?, ?, NOW())`,
      [req.user.id, docId, `${status} document verification`]
    );

    res.json({
      success: true,
      message: 'Document verification updated successfully'
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
};

// Get profile change requests
exports.getProfileChangeRequests = async (req, res) => {
  try {
    const { status = 'Pending' } = req.query;

    const [requests] = await promisePool.query(
      `SELECT pcr.*,
        u.full_name as student_name, u.email, u.usn,
        reviewer.full_name as reviewer_name
       FROM profile_change_requests pcr
       JOIN users u ON pcr.user_id = u.id
       LEFT JOIN users reviewer ON pcr.reviewed_by = reviewer.id
       WHERE pcr.status = ?
       ORDER BY pcr.requested_at DESC`,
      [status]
    );

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching profile change requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile change requests',
      error: error.message
    });
  }
};

// Approve profile change
exports.approveProfileChange = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes } = req.body;

    // Get the change request
    const [requests] = await promisePool.query(
      'SELECT * FROM profile_change_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    const request = requests[0];

    // If approved, apply the changes
    if (status === 'Approved') {
      const table = request.field_name.includes('cgpa') || request.field_name.includes('branch')
        ? 'student_academics'
        : 'users';

      await promisePool.query(
        `UPDATE ${table} SET ${request.field_name} = ? WHERE ${table === 'users' ? 'id' : 'user_id'} = ?`,
        [request.new_value, request.user_id]
      );
    }

    // Update request status
    await promisePool.query(
      `UPDATE profile_change_requests
       SET status = ?, reviewed_by = ?, review_notes = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [status, req.user.id, notes, requestId]
    );

    // Log admin action
    await promisePool.query(
      `INSERT INTO admin_actions (
        admin_id, action_type, entity_type, entity_id, description, created_at
      ) VALUES (?, ?, 'ProfileChange', ?, ?, NOW())`,
      [req.user.id, status === 'Approved' ? 'Approve' : 'Reject', requestId, `${status} profile change request`]
    );

    res.json({
      success: true,
      message: `Profile change request ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error approving profile change:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing profile change request',
      error: error.message
    });
  }
};
