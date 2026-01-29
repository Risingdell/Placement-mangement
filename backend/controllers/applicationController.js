const { promisePool } = require('../config/database');

// @desc    Get all applications for current user
// @route   GET /api/applications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [applications] = await promisePool.query(
      `SELECT a.id, a.status, a.applied_at, a.updated_at,
              pd.company_name, pd.role, pd.company_type, pd.ctc, pd.drive_date
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       WHERE a.user_id = ?
       ORDER BY a.applied_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// @desc    Get single application with status history
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const applicationId = req.params.id;

    // Get application details
    const [applications] = await promisePool.query(
      `SELECT a.*, pd.company_name, pd.role, pd.company_type, pd.ctc, pd.drive_date,
              pd.job_description
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       WHERE a.id = ? AND a.user_id = ?`,
      [applicationId, userId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get status history
    const [history] = await promisePool.query(
      `SELECT old_status, new_status, remarks, changed_at
       FROM application_status_history
       WHERE application_id = ?
       ORDER BY changed_at DESC`,
      [applicationId]
    );

    res.json({
      success: true,
      data: {
        ...applications[0],
        statusHistory: history
      }
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details'
    });
  }
};

// @desc    Apply for a placement drive
// @route   POST /api/applications
// @access  Private
const applyForDrive = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const userId = req.user.id;
    const { driveId } = req.body;

    if (!driveId) {
      return res.status(400).json({
        success: false,
        message: 'Drive ID is required'
      });
    }

    await connection.beginTransaction();

    // Check if user is already placed
    if (req.user.is_placed) {
      return res.status(400).json({
        success: false,
        message: 'You are already placed and cannot apply for more drives'
      });
    }

    // Check if drive exists and is active
    const [drives] = await connection.query(
      `SELECT id, company_name, status, min_cgpa, max_backlogs, allowed_branches, registration_deadline
       FROM placement_drives
       WHERE id = ?`,
      [driveId]
    );

    if (drives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    const drive = drives[0];

    if (drive.status !== 'Upcoming' && drive.status !== 'Ongoing') {
      return res.status(400).json({
        success: false,
        message: 'This drive is no longer accepting applications'
      });
    }

    // Check registration deadline
    if (drive.registration_deadline && new Date(drive.registration_deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already applied
    const [existingApplications] = await connection.query(
      'SELECT id FROM applications WHERE user_id = ? AND drive_id = ?',
      [userId, driveId]
    );

    if (existingApplications.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this drive'
      });
    }

    // Check eligibility
    const [studentData] = await connection.query(
      'SELECT cgpa, active_backlogs, branch FROM student_academics WHERE user_id = ?',
      [userId]
    );

    if (studentData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your academic profile before applying'
      });
    }

    const student = studentData[0];

    // Check CGPA
    if (drive.min_cgpa && student.cgpa < drive.min_cgpa) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA requirement is ${drive.min_cgpa}. Your CGPA: ${student.cgpa}`
      });
    }

    // Check backlogs
    if (drive.max_backlogs !== null && student.active_backlogs > drive.max_backlogs) {
      return res.status(400).json({
        success: false,
        message: `Maximum allowed backlogs: ${drive.max_backlogs}. Your active backlogs: ${student.active_backlogs}`
      });
    }

    // Check branch
    if (drive.allowed_branches) {
      try {
        const allowedBranches = JSON.parse(drive.allowed_branches);
        if (Array.isArray(allowedBranches) && !allowedBranches.includes(student.branch)) {
          return res.status(400).json({
            success: false,
            message: 'Your branch is not eligible for this drive'
          });
        }
      } catch (e) {
        // If JSON parsing fails, ignore branch check
      }
    }

    // Create application
    const [result] = await connection.query(
      'INSERT INTO applications (user_id, drive_id, status) VALUES (?, ?, ?)',
      [userId, driveId, 'Applied']
    );

    const applicationId = result.insertId;

    // Log status history
    await connection.query(
      'INSERT INTO application_status_history (application_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
      [applicationId, null, 'Applied', userId]
    );

    // Send inbox message
    await connection.query(
      `INSERT INTO inbox_messages (recipient_id, subject, message, message_type, related_drive_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        `Application Submitted - ${drive.company_name}`,
        `Your application for ${drive.company_name} has been successfully submitted. You will be notified about further updates.`,
        'Notification',
        driveId
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: applicationId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Apply for drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  } finally {
    connection.release();
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private
const withdrawApplication = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const userId = req.user.id;
    const applicationId = req.params.id;

    await connection.beginTransaction();

    // Check if application exists and belongs to user
    const [applications] = await connection.query(
      'SELECT status FROM applications WHERE id = ? AND user_id = ?',
      [applicationId, userId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const currentStatus = applications[0].status;

    // Only allow withdrawal if status is 'Applied' or 'Shortlisted'
    if (currentStatus !== 'Applied' && currentStatus !== 'Shortlisted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application at this stage'
      });
    }

    // Delete application
    await connection.query('DELETE FROM applications WHERE id = ?', [applicationId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  } finally {
    connection.release();
  }
};

// @desc    Update application status (Admin only)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const applicationId = req.params.id;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Applied', 'Shortlisted', 'Exam Scheduled', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await connection.beginTransaction();

    // Get current status
    const [applications] = await connection.query(
      `SELECT a.status, a.user_id, a.drive_id, pd.company_name
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       WHERE a.id = ?`,
      [applicationId]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const { status: oldStatus, user_id: studentId, drive_id: driveId, company_name } = applications[0];

    // Update application status
    await connection.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    // Log status history
    await connection.query(
      'INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, remarks) VALUES (?, ?, ?, ?, ?)',
      [applicationId, oldStatus, status, req.user.id, remarks]
    );

    // If selected, mark student as placed
    if (status === 'Selected') {
      await connection.query('UPDATE users SET is_placed = TRUE WHERE id = ?', [studentId]);
    }

    // Send notification to student
    let messageSubject = '';
    let messageBody = '';

    switch (status) {
      case 'Shortlisted':
        messageSubject = `Shortlisted - ${company_name}`;
        messageBody = `Congratulations! You have been shortlisted for ${company_name}. ${remarks || 'Further details will be shared soon.'}`;
        break;
      case 'Exam Scheduled':
        messageSubject = `Exam Scheduled - ${company_name}`;
        messageBody = `Your online exam for ${company_name} has been scheduled. ${remarks || 'Check your email for details.'}`;
        break;
      case 'Interview Scheduled':
        messageSubject = `Interview Scheduled - ${company_name}`;
        messageBody = `Your interview for ${company_name} has been scheduled. ${remarks || 'Check your email for details.'}`;
        break;
      case 'Selected':
        messageSubject = `Congratulations! Selected at ${company_name}`;
        messageBody = `Congratulations! You have been selected for ${company_name}. ${remarks || 'Further details will be communicated soon.'}`;
        break;
      case 'Rejected':
        messageSubject = `Application Update - ${company_name}`;
        messageBody = `Thank you for your interest in ${company_name}. ${remarks || 'Unfortunately, we are unable to proceed with your application at this time.'}`;
        break;
      default:
        messageSubject = `Application Update - ${company_name}`;
        messageBody = `Your application status has been updated. ${remarks || ''}`;
    }

    await connection.query(
      `INSERT INTO inbox_messages (recipient_id, subject, message, message_type, related_drive_id)
       VALUES (?, ?, ?, ?, ?)`,
      [studentId, messageSubject, messageBody, status === 'Shortlisted' ? 'Shortlist' : status === 'Selected' ? 'Result' : 'Notification', driveId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  } finally {
    connection.release();
  }
};

// @desc    Get all applications for a drive (Admin only)
// @route   GET /api/applications/drive/:driveId
// @access  Private/Admin
const getApplicationsByDrive = async (req, res) => {
  try {
    const driveId = req.params.driveId;

    const [applications] = await promisePool.query(
      `SELECT a.id, a.status, a.applied_at, a.updated_at,
              u.usn, u.full_name, u.email, u.phone,
              sa.cgpa, sa.branch, sa.active_backlogs
       FROM applications a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE a.drive_id = ?
       ORDER BY a.applied_at DESC`,
      [driveId]
    );

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get applications by drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

module.exports = {
  getMyApplications,
  getApplicationById,
  applyForDrive,
  withdrawApplication,
  updateApplicationStatus,
  getApplicationsByDrive
};
