const crypto = require('crypto');
const { promisePool } = require('../config/database');
const { sendDriveNotificationEmail, isEmailConfigured, sendEligibleStudentInboxNotification } = require('../utils/emailService');

// Generates a readable access key e.g. "A3F9-B2D7"
const generateAccessKey = () => {
  const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${part()}-${part()}`;
};

// @desc    Get all placement drives with eligibility check
// @route   GET /api/drives
// @access  Private
const getAllDrives = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const isAdmin = ['admin', 'tpo'].includes(req.user.role);

    // ── Admin / TPO: return all drives with applicant count, no eligibility check ──
    if (isAdmin) {
      let query = `
        SELECT pd.id, pd.company_name, pd.role, pd.company_type, pd.ctc,
               pd.job_description, pd.eligibility_criteria, pd.min_cgpa, pd.max_backlogs,
               pd.allowed_branches, pd.drive_date, pd.registration_deadline, pd.status,
               pd.created_at,
               (SELECT COUNT(*) FROM applications a WHERE a.drive_id = pd.id) as total_applicants
        FROM placement_drives pd
        WHERE 1=1
      `;
      const queryParams = [];
      if (status) {
        query += ' AND pd.status = ?';
        queryParams.push(status);
      }
      query += ' ORDER BY pd.drive_date DESC';
      const [drives] = await promisePool.query(query, queryParams);
      return res.json({ success: true, data: drives });
    }

    // ── Student: include eligibility check ────────────────────────────────────────
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

    let query = `
      SELECT pd.id, pd.company_name, pd.role, pd.company_type, pd.ctc,
             pd.job_description, pd.eligibility_criteria, pd.min_cgpa, pd.max_backlogs,
             pd.allowed_branches, pd.drive_date, pd.registration_deadline, pd.status,
             pd.created_at,
             da.attendance_key, da.attended_at,
             EXISTS(SELECT 1 FROM applications a WHERE a.drive_id = pd.id AND a.user_id = ?) as has_applied
      FROM placement_drives pd
      LEFT JOIN drive_attendees da ON pd.id = da.drive_id AND da.user_id = ?
      WHERE 1=1
    `;

    const queryParams = [userId, userId];

    if (status) {
      query += ' AND pd.status = ?';
      queryParams.push(status);
    }

    query += ' ORDER BY pd.drive_date DESC';

    const [drives] = await promisePool.query(query, queryParams);

    const drivesWithEligibility = drives.map(drive => {
      let eligible = true;
      let eligibilityReasons = [];

      if (req.user.is_placed) {
        eligible = false;
        eligibilityReasons.push('Already placed');
      }

      if (drive.min_cgpa && student.cgpa < drive.min_cgpa) {
        eligible = false;
        eligibilityReasons.push(`CGPA below minimum (${drive.min_cgpa})`);
      }

      if (drive.max_backlogs !== null && student.active_backlogs > drive.max_backlogs) {
        eligible = false;
        eligibilityReasons.push(`Active backlogs exceed limit (${drive.max_backlogs})`);
      }

      if (drive.allowed_branches) {
        try {
          const allowedBranches = JSON.parse(drive.allowed_branches);
          if (Array.isArray(allowedBranches) && !allowedBranches.includes(student.branch)) {
            eligible = false;
            eligibilityReasons.push('Branch not eligible');
          }
        } catch (e) {
          // ignore branch check if JSON parsing fails
        }
      }

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
      registrationDeadline,
      applicationLink
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
        application_link, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?)`,
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
        applicationLink,
        req.user.id
      ]
    );

    const driveId = result.insertId;

    // Send emails to eligible students (async, don't block drive creation)
    if (isEmailConfigured() && applicationLink) {
      setTimeout(async () => {
        try {
          // Get drive details for email
          const [drives] = await promisePool.query(
            `SELECT min_cgpa, max_backlogs, allowed_branches FROM placement_drives WHERE id = ?`,
            [driveId]
          );

          if (drives.length === 0) return;

          const drive = drives[0];

          // Get all eligible students
          const [students] = await promisePool.query(
            `SELECT u.id, u.name, u.email, sa.cgpa, sa.active_backlogs, sa.branch
             FROM users u
             JOIN student_academics sa ON u.id = sa.user_id
             WHERE u.role = 'student' AND u.is_placed = 0`,
            []
          );

          // Filter by eligibility criteria
          const eligibleStudents = students.filter(student => {
            if (drive.min_cgpa && student.cgpa < drive.min_cgpa) return false;
            if (drive.max_backlogs !== null && student.active_backlogs > drive.max_backlogs) return false;
            if (drive.allowed_branches) {
              try {
                const allowedBranches = JSON.parse(drive.allowed_branches);
                if (Array.isArray(allowedBranches) && !allowedBranches.includes(student.branch)) return false;
              } catch (e) {
                // ignore branch check if JSON parsing fails
              }
            }
            return true;
          });

          // Send emails to each eligible student
          for (const student of eligibleStudents) {
            try {
              await sendDriveNotificationEmail({
                to: student.email,
                studentName: student.name,
                companyName,
                role,
                ctc,
                driveDate,
                registrationDeadline,
                applicationLink
              });
            } catch (emailError) {
              console.error(`Failed to send email to ${student.email}:`, emailError.message);
              // Continue sending to other students even if one fails
            }
          }

          // Generate access keys and store them, then send inbox messages
          if (eligibleStudents.length > 0) {
            try {
              // Ensure table exists
              await promisePool.query(`
                CREATE TABLE IF NOT EXISTS drive_access_keys (
                  id         INT AUTO_INCREMENT PRIMARY KEY,
                  drive_id   INT NOT NULL,
                  user_id    INT NOT NULL,
                  access_key VARCHAR(20) NOT NULL UNIQUE,
                  used       TINYINT(1) DEFAULT 0,
                  used_at    DATETIME NULL,
                  created_at DATETIME DEFAULT NOW(),
                  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
                  FOREIGN KEY (user_id)  REFERENCES users(id)            ON DELETE CASCADE
                )
              `);

              // Generate a unique key per student
              const accessKeys = {}; // userId -> key
              const keyRows = [];
              for (const student of eligibleStudents) {
                let key;
                let attempts = 0;
                do {
                  key = generateAccessKey();
                  attempts++;
                } while (keyRows.some(r => r[2] === key) && attempts < 20);
                accessKeys[student.id] = key;
                keyRows.push([driveId, student.id, key]);
              }

              // Bulk insert keys (ignore duplicates — rare collision safety)
              await promisePool.query(
                `INSERT IGNORE INTO drive_access_keys (drive_id, user_id, access_key) VALUES ?`,
                [keyRows]
              );

              const eligibleStudentIds = eligibleStudents.map(s => s.id);
              await sendEligibleStudentInboxNotification({
                eligibleStudentIds,
                companyName,
                role,
                ctc,
                driveDate,
                applicationLink,
                driveId,
                senderId: req.user.id,
                accessKeys
              });
            } catch (inboxError) {
              console.error(`Failed to send inbox notifications for drive ${driveId}:`, inboxError.message);
            }
          }

          console.log(`Drive ${driveId} created: ${eligibleStudents.length} eligible students notified via email and inbox`);
        } catch (emailJobError) {
          console.error(`Email notification job for drive ${driveId} failed:`, emailJobError.message);
        }
      }, 0);
    }

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully',
      data: { id: driveId }
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
      status,
      applicationLink
    } = req.body;

    // mysql2 rejects undefined — convert to null so COALESCE keeps existing DB value
    const n = (v) => (v === undefined || v === '') ? null : v;

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
           application_link = COALESCE(?, application_link),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [
        n(companyName),
        n(role),
        n(companyType),
        n(ctc),
        n(jobDescription),
        eligibilityCriteria ? JSON.stringify(eligibilityCriteria) : null,
        n(minCgpa),
        n(maxBacklogs),
        allowedBranches ? JSON.stringify(allowedBranches) : null,
        n(driveDate),
        n(registrationDeadline),
        n(applicationLink),
        n(status),
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
      `SELECT pd.id, pd.company_name, pd.role AS job_role,
              pd.drive_date, pd.registration_deadline AS application_deadline,
              pd.ctc AS package, pd.status,
              pd.min_cgpa, pd.max_backlogs,
              sa.cgpa, sa.active_backlogs
       FROM placement_drives pd
       LEFT JOIN student_academics sa ON sa.user_id = ?
       WHERE pd.status IN ('Upcoming', 'Active')
         AND pd.registration_deadline > NOW()
       ORDER BY pd.drive_date ASC
       LIMIT 5`,
      [userId]
    );

    const result = drives.map(d => ({
      ...d,
      eligible: d.cgpa !== null
        ? (d.cgpa >= (d.min_cgpa || 0) && d.active_backlogs <= (d.max_backlogs ?? 99))
        : null,
    }));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get upcoming drives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming drives'
    });
  }
};

// @desc    Get eligible students for a drive
// @route   GET /api/drives/:driveId/eligible-students
// @access  Private/Admin
const getEligibleStudents = async (req, res) => {
  try {
    const driveId = req.params.driveId;

    // Get drive details
    const [drives] = await promisePool.query(
      `SELECT min_cgpa, max_backlogs, allowed_branches FROM placement_drives WHERE id = ?`,
      [driveId]
    );

    if (drives.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    const drive = drives[0];

    // Get all students with their academics
    const [students] = await promisePool.query(
      `SELECT u.id, u.name, u.email, sa.cgpa, sa.active_backlogs, sa.branch
       FROM users u
       JOIN student_academics sa ON u.id = sa.user_id
       WHERE u.role = 'student' AND u.is_placed = 0`,
      []
    );

    // Filter eligible students
    const eligibleStudents = students.filter(student => {
      // Check CGPA
      if (drive.min_cgpa && student.cgpa < drive.min_cgpa) {
        return false;
      }

      // Check backlogs
      if (drive.max_backlogs !== null && student.active_backlogs > drive.max_backlogs) {
        return false;
      }

      // Check branch
      if (drive.allowed_branches) {
        try {
          const allowedBranches = JSON.parse(drive.allowed_branches);
          if (Array.isArray(allowedBranches) && !allowedBranches.includes(student.branch)) {
            return false;
          }
        } catch (e) {
          // ignore branch check if JSON parsing fails
        }
      }

      return true;
    });

    res.json({
      success: true,
      data: {
        totalEligible: eligibleStudents.length,
        students: eligibleStudents
      }
    });
  } catch (error) {
    console.error('Get eligible students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch eligible students'
    });
  }
};

// @desc    Preview eligible students based on criteria (no driveId needed)
// @route   GET /api/drives/preview-eligible?minCgpa=7.5&maxBacklogs=0&branches=CSE,ECE
// @access  Private/Admin
const previewEligibleStudents = async (req, res) => {
  try {
    const { minCgpa, maxBacklogs, branches } = req.query;

    let query = `
      SELECT u.id, u.full_name as name, u.email, sa.cgpa, sa.active_backlogs, sa.branch, sa.batch_year as year
      FROM users u
      JOIN student_academics sa ON u.id = sa.user_id
      WHERE u.role = 'student' AND u.is_placed = 0
    `;
    const params = [];

    // Add CGPA filter — clamp to valid range 0–10
    if (minCgpa !== undefined && minCgpa !== '') {
      const cgpa = parseFloat(minCgpa);
      if (!isNaN(cgpa) && cgpa >= 0 && cgpa <= 10) {
        query += ' AND sa.cgpa >= ?';
        params.push(cgpa);
      }
    }

    // Add backlogs filter — clamp to valid range 0–20
    if (maxBacklogs !== undefined && maxBacklogs !== '') {
      const backlogs = parseInt(maxBacklogs);
      if (!isNaN(backlogs) && backlogs >= 0 && backlogs <= 20) {
        query += ' AND sa.active_backlogs <= ?';
        params.push(backlogs);
      }
    }

    // Add branches filter
    if (branches) {
      const branchList = branches.split(',').map(b => b.trim()).filter(Boolean);
      if (branchList.length > 0) {
        query += ` AND sa.branch IN (${branchList.map(() => '?').join(',')})`;
        params.push(...branchList);
      }
    }

    query += ' ORDER BY sa.cgpa DESC, u.full_name ASC';

    const [students] = await promisePool.query(query, params);

    res.json({
      success: true,
      data: {
        totalEligible: students.length,
        students
      }
    });
  } catch (error) {
    console.error('Preview eligible students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview eligible students'
    });
  }
};

// @desc    Get all students for manual enrollment picker
// @route   GET /api/drives/all-students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const [students] = await promisePool.query(`
      SELECT u.id, u.full_name AS name, u.email, u.usn,
             sa.cgpa, sa.branch, sa.active_backlogs, sa.batch_year AS year
      FROM users u
      LEFT JOIN student_academics sa ON u.id = sa.user_id
      WHERE u.role = 'student' AND u.is_active = 1
      ORDER BY u.full_name ASC
    `);
    res.json({ success: true, data: students });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

// @desc    Manually enroll students into a drive
// @route   POST /api/drives/:id/enroll
// @access  Private/Admin
const enrollStudents = async (req, res) => {
  try {
    const driveId = req.params.id;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected' });
    }

    // Fetch drive details
    const [drives] = await promisePool.query(
      'SELECT id, company_name, role, ctc, drive_date, registration_deadline, application_link FROM placement_drives WHERE id = ?',
      [driveId]
    );
    if (drives.length === 0) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }
    const drive = drives[0];

    // Find who is already enrolled before inserting
    const placeholders = userIds.map(() => '?').join(',');
    const [alreadyEnrolled] = await promisePool.query(
      `SELECT user_id FROM applications WHERE drive_id = ? AND user_id IN (${placeholders})`,
      [driveId, ...userIds]
    );
    const alreadyEnrolledIds = new Set(alreadyEnrolled.map(r => r.user_id));
    const newlyAddedIds = userIds.filter(id => !alreadyEnrolledIds.has(id));

    // INSERT IGNORE skips duplicates (already applied students)
    const values = userIds.map(uid => [uid, driveId, 'Applied']);
    const [result] = await promisePool.query(
      'INSERT IGNORE INTO applications (user_id, drive_id, status) VALUES ?',
      [values]
    );

    const enrolled = result.affectedRows;
    const skipped = userIds.length - enrolled;

    // Respond immediately — notifications fire async
    res.json({
      success: true,
      message: `${enrolled} student(s) enrolled successfully`,
      enrolled,
      skipped,
    });

    // Notify only the newly added students (not those already enrolled)
    if (newlyAddedIds.length === 0) return;

    setTimeout(async () => {
      try {
        const newPlaceholders = newlyAddedIds.map(() => '?').join(',');
        const [newStudents] = await promisePool.query(
          `SELECT id, full_name, email FROM users WHERE id IN (${newPlaceholders})`,
          newlyAddedIds
        );

        if (newStudents.length === 0) return;

        // Inbox notification
        try {
          await sendEligibleStudentInboxNotification(
            newStudents.map(s => s.id),
            drive.company_name,
            drive.role,
            drive.ctc,
            drive.drive_date,
            drive.application_link,
            driveId,
            req.user?.id
          );
        } catch (inboxErr) {
          console.error('[ENROLL] Inbox notification error:', inboxErr.message);
        }

        // Email notification (only if email is configured)
        if (isEmailConfigured() && drive.application_link) {
          for (const student of newStudents) {
            try {
              await sendDriveNotificationEmail({
                to: student.email,
                studentName: student.full_name,
                companyName: drive.company_name,
                role: drive.role,
                ctc: drive.ctc,
                driveDate: drive.drive_date,
                registrationDeadline: drive.registration_deadline,
                applicationLink: drive.application_link,
              });
            } catch (emailErr) {
              console.error(`[ENROLL] Email failed for ${student.email}:`, emailErr.message);
            }
          }
        }
      } catch (notifyErr) {
        console.error('[ENROLL] Notification error:', notifyErr.message);
      }
    }, 0);

  } catch (error) {
    console.error('Enroll students error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll students' });
  }
};

// @desc    Verify drive access key (public — no auth required)
// @route   POST /api/drives/verify-access
// @access  Public
const verifyDriveAccess = async (req, res) => {
  try {
    const { email, accessKey, driveId } = req.body;

    if (!email || !accessKey || !driveId) {
      return res.status(400).json({ success: false, message: 'Email, access key, and drive ID are required.' });
    }

    // Look up the key — join to users so we verify email ownership
    const [rows] = await promisePool.query(
      `SELECT dak.id, dak.user_id, dak.used,
              pd.application_link, pd.company_name, pd.role, pd.status, pd.drive_date
       FROM drive_access_keys dak
       JOIN users u  ON u.id  = dak.user_id
       JOIN placement_drives pd ON pd.id = dak.drive_id
       WHERE LOWER(u.email) = LOWER(?) AND dak.access_key = ? AND dak.drive_id = ?`,
      [email.trim(), accessKey.trim().toUpperCase(), driveId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or access key. Please check your inbox and try again.' });
    }

    const record = rows[0];

    // Create application record if not already applied
    const [existing] = await promisePool.query(
      `SELECT id FROM applications WHERE student_id = ? AND drive_id = ?`,
      [record.user_id, driveId]
    );

    if (existing.length === 0) {
      await promisePool.query(
        `INSERT INTO applications (student_id, drive_id, status, applied_at) VALUES (?, ?, 'Applied', NOW())`,
        [record.user_id, driveId]
      );

      // Add initial status history entry
      const [appResult] = await promisePool.query(
        `SELECT id FROM applications WHERE student_id = ? AND drive_id = ?`,
        [record.user_id, driveId]
      );
      if (appResult.length > 0) {
        await promisePool.query(
          `INSERT INTO application_status_history (application_id, status, updated_at, remarks)
           VALUES (?, 'Applied', NOW(), 'Applied via drive access wall')`,
          [appResult[0].id]
        );
      }
    }

    // Mark key as used (allow re-use but track first use time)
    if (!record.used) {
      await promisePool.query(
        `UPDATE drive_access_keys SET used = 1, used_at = NOW() WHERE id = ?`,
        [record.id]
      );
    }

    return res.json({
      success: true,
      redirectUrl: record.application_link || null,
      company: record.company_name,
      role: record.role,
      driveDate: record.drive_date,
    });
  } catch (error) {
    console.error('Verify drive access error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

module.exports = {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  getUpcomingDrives,
  getEligibleStudents,
  previewEligibleStudents,
  getAllStudents,
  enrollStudents,
  verifyDriveAccess,
};
