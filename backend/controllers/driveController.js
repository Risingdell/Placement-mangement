const { promisePool } = require('../config/database');

// @desc    Get all placement drives with eligibility check
// @route   GET /api/drives
// @access  Private
const getAllDrives = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // Get student's academic info for eligibility
    const [studentData] = await promisePool.query(
      `SELECT cgpa, active_backlogs, branch FROM student_academics WHERE user_id = ?`,
      [userId]
    );

    if (studentData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic information not found. Please complete your profile.'
      });
    }

    const student = studentData[0];

    // Build query based on status filter
    let query = `
      SELECT pd.id, pd.company_name, pd.role, pd.company_type, pd.ctc,
             pd.job_description, pd.eligibility_criteria, pd.min_cgpa, pd.max_backlogs,
             pd.allowed_branches, pd.drive_date, pd.registration_deadline, pd.status,
             pd.created_at,
             EXISTS(SELECT 1 FROM applications a WHERE a.drive_id = pd.id AND a.user_id = ?) as has_applied
      FROM placement_drives pd
      WHERE 1=1
    `;

    const queryParams = [userId];

    if (status) {
      query += ' AND pd.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY pd.drive_date DESC';

    const [drives] = await promisePool.query(query, queryParams);

    // Check eligibility for each drive
    const drivesWithEligibility = drives.map(drive => {
      let eligible = true;
      let eligibilityReasons = [];

      // Check if already placed
      if (req.user.is_placed) {
        eligible = false;
        eligibilityReasons.push('Already placed');
      }

      // Check CGPA
      if (drive.min_cgpa && student.cgpa < drive.min_cgpa) {
        eligible = false;
        eligibilityReasons.push(`CGPA below minimum (${drive.min_cgpa})`);
      }

      // Check backlogs
      if (drive.max_backlogs !== null && student.active_backlogs > drive.max_backlogs) {
        eligible = false;
        eligibilityReasons.push(`Active backlogs exceed limit (${drive.max_backlogs})`);
      }

      // Check branch
      if (drive.allowed_branches) {
        try {
          const allowedBranches = JSON.parse(drive.allowed_branches);
          if (Array.isArray(allowedBranches) && !allowedBranches.includes(student.branch)) {
            eligible = false;
            eligibilityReasons.push('Branch not eligible');
          }
        } catch (e) {
          // If JSON parsing fails, ignore branch check
        }
      }

      // Check if already applied
      if (drive.has_applied) {
        eligible = false;
        eligibilityReasons.push('Already applied');
      }

      return {
        ...drive,
        eligible,
        eligibilityReasons: eligibilityReasons.length > 0 ? eligibilityReasons : null
      };
    });

    res.json({
      success: true,
      data: drivesWithEligibility
    });
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch placement drives'
    });
  }
};

// @desc    Get single drive details
// @route   GET /api/drives/:id
// @access  Private
const getDriveById = async (req, res) => {
  try {
    const driveId = req.params.id;
    const userId = req.user.id;

    const [drives] = await promisePool.query(
      `SELECT pd.*,
              EXISTS(SELECT 1 FROM applications a WHERE a.drive_id = pd.id AND a.user_id = ?) as has_applied
       FROM placement_drives pd
       WHERE pd.id = ?`,
      [userId, driveId]
    );

    if (drives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Placement drive not found'
      });
    }

    res.json({
      success: true,
      data: drives[0]
    });
  } catch (error) {
    console.error('Get drive by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drive details'
    });
  }
};

// @desc    Create new placement drive (Admin only)
// @route   POST /api/drives
// @access  Private/Admin
const createDrive = async (req, res) => {
  try {
    const {
      companyName,
      role,
      companyType,
      ctc,
      jobDescription,
      eligibilityCriteria,
      minCgpa,
      maxBacklogs,
      allowedBranches,
      driveDate,
      registrationDeadline
    } = req.body;

    if (!companyName || !role || !driveDate) {
      return res.status(400).json({
        success: false,
        message: 'Company name, role, and drive date are required'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO placement_drives
       (company_name, role, company_type, ctc, job_description, eligibility_criteria,
        min_cgpa, max_backlogs, allowed_branches, drive_date, registration_deadline,
        status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?)`,
      [
        companyName,
        role,
        companyType || 'Service',
        ctc,
        jobDescription,
        eligibilityCriteria ? JSON.stringify(eligibilityCriteria) : null,
        minCgpa,
        maxBacklogs,
        allowedBranches ? JSON.stringify(allowedBranches) : null,
        driveDate,
        registrationDeadline,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create placement drive'
    });
  }
};

// @desc    Update placement drive (Admin only)
// @route   PUT /api/drives/:id
// @access  Private/Admin
const updateDrive = async (req, res) => {
  try {
    const driveId = req.params.id;
    const {
      companyName,
      role,
      companyType,
      ctc,
      jobDescription,
      eligibilityCriteria,
      minCgpa,
      maxBacklogs,
      allowedBranches,
      driveDate,
      registrationDeadline,
      status
    } = req.body;

    await promisePool.query(
      `UPDATE placement_drives
       SET company_name = COALESCE(?, company_name),
           role = COALESCE(?, role),
           company_type = COALESCE(?, company_type),
           ctc = COALESCE(?, ctc),
           job_description = COALESCE(?, job_description),
           eligibility_criteria = COALESCE(?, eligibility_criteria),
           min_cgpa = COALESCE(?, min_cgpa),
           max_backlogs = COALESCE(?, max_backlogs),
           allowed_branches = COALESCE(?, allowed_branches),
           drive_date = COALESCE(?, drive_date),
           registration_deadline = COALESCE(?, registration_deadline),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        companyName,
        role,
        companyType,
        ctc,
        jobDescription,
        eligibilityCriteria ? JSON.stringify(eligibilityCriteria) : null,
        minCgpa,
        maxBacklogs,
        allowedBranches ? JSON.stringify(allowedBranches) : null,
        driveDate,
        registrationDeadline,
        status,
        driveId
      ]
    );

    res.json({
      success: true,
      message: 'Placement drive updated successfully'
    });
  } catch (error) {
    console.error('Update drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update placement drive'
    });
  }
};

// @desc    Delete placement drive (Admin only)
// @route   DELETE /api/drives/:id
// @access  Private/Admin
const deleteDrive = async (req, res) => {
  try {
    const driveId = req.params.id;

    await promisePool.query('DELETE FROM placement_drives WHERE id = ?', [driveId]);

    res.json({
      success: true,
      message: 'Placement drive deleted successfully'
    });
  } catch (error) {
    console.error('Delete drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete placement drive'
    });
  }
};

// @desc    Get upcoming drives (dashboard widget)
// @route   GET /api/drives/upcoming/preview
// @access  Private
const getUpcomingDrives = async (req, res) => {
  try {
    const userId = req.user.id;

    const [drives] = await promisePool.query(
      `SELECT pd.id, pd.company_name, pd.role, pd.drive_date, pd.registration_deadline, pd.ctc
       FROM placement_drives pd
       WHERE pd.status = 'Upcoming'
         AND pd.registration_deadline > NOW()
       ORDER BY pd.drive_date ASC
       LIMIT 5`,
      []
    );

    res.json({
      success: true,
      data: drives
    });
  } catch (error) {
    console.error('Get upcoming drives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming drives'
    });
  }
};

module.exports = {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getUpcomingDrives
};
