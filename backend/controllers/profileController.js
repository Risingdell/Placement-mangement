const { promisePool } = require('../config/database');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { hasColumn } = require('../utils/schemaUtils');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ensurePortfoliosTable = async () => {
  await promisePool.query(
    `CREATE TABLE IF NOT EXISTS portfolios (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      portfolio_url VARCHAR(500) NOT NULL,
      description TEXT NULL,
      built_with VARCHAR(500) NULL,
      build_details TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_portfolios_user_id (user_id),
      CONSTRAINT fk_portfolios_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );
};

// @desc    Get student profile with all details
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensurePortfoliosTable();
    const includeWhatsappNumber = await hasColumn('users', 'whatsapp_number');

    const [academicColumns] = await promisePool.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'student_academics'`
    );
    const academicColSet = new Set(academicColumns.map((c) => c.COLUMN_NAME));
    const diplomaSelect = academicColSet.has('diploma_percentage')
      ? ', sa.diploma_percentage'
      : '';

    // Get basic info and academics
    const [profile] = await promisePool.query(
      `SELECT u.id, u.usn, u.email, u.full_name, u.phone, u.is_placed${
        includeWhatsappNumber ? ', u.whatsapp_number' : ''
      },
              sa.branch, sa.batch_year, sa.current_semester, sa.cgpa, sa.sgpa,
              sa.total_backlogs, sa.active_backlogs, sa.tenth_percentage, sa.twelfth_percentage,
              sa.photo_url, sa.resume_url${diplomaSelect}
       FROM users u
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (profile.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get skills
    const [skills] = await promisePool.query(
      'SELECT id, skill_name, category, proficiency FROM skills WHERE user_id = ?',
      [userId]
    );

    // Get projects
    const [projects] = await promisePool.query(
      'SELECT id, title, description, tech_stack, status, is_ongoing, start_date, end_date, project_url, github_url FROM projects WHERE user_id = ? ORDER BY is_ongoing DESC, start_date DESC',
      [userId]
    );

    // Get internships
    const [internships] = await promisePool.query(
      'SELECT id, company_name, role, duration_months, start_date, end_date, description, certificate_url FROM internships WHERE user_id = ? ORDER BY start_date DESC',
      [userId]
    );

    // Get achievements
    const [achievements] = await promisePool.query(
      'SELECT id, title, type, issuer, date_achieved, description, certificate_url FROM achievements WHERE user_id = ? ORDER BY date_achieved DESC',
      [userId]
    );

    // Get semester marks
    const [semesterMarks] = await promisePool.query(
      'SELECT id, semester, sgpa, marks_card_url FROM semester_marks WHERE user_id = ? ORDER BY semester',
      [userId]
    );

    // Get portfolio links
    const [portfolios] = await promisePool.query(
      `SELECT id, title, portfolio_url, description, built_with, build_details, created_at, updated_at
       FROM portfolios
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [userId]
    );

    const profileData = { ...profile[0] };

    res.json({
      success: true,
      data: {
        ...profileData,
        skills,
        projects,
        internships,
        achievements,
        semesterMarks,
        portfolios
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// @desc    Update academic information
// @route   PUT /api/profile/academics
// @access  Private
const updateAcademics = async (req, res) => {
  try {
    const userId = req.user.id;
    // Accept both camelCase and snake_case payloads from frontend.
    const activeBacklogsValue = req.body.activeBacklogs ?? req.body.active_backlogs;
    const incomingUpdates = {
      branch: req.body.branch,
      batch_year: req.body.batchYear ?? req.body.batch_year,
      current_semester: req.body.currentSemester ?? req.body.current_semester,
      cgpa: req.body.cgpa,
      sgpa: req.body.sgpa,
      total_backlogs: req.body.totalBacklogs ?? req.body.total_backlogs,
      active_backlogs: activeBacklogsValue,
      // Keep compatibility with schemas/features that still read `backlogs`.
      backlogs: req.body.backlogs ?? activeBacklogsValue,
      tenth_percentage: req.body.tenthPercentage ?? req.body.tenth_percentage,
      twelfth_percentage: req.body.twelfthPercentage ?? req.body.twelfth_percentage,
      diploma_percentage: req.body.diplomaPercentage ?? req.body.diploma_percentage
    };

    // Read actual DB columns to avoid failures across schema variants.
    const [cols] = await promisePool.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'student_academics'`
    );
    const availableCols = new Set(cols.map((c) => c.COLUMN_NAME));

    const updateEntries = Object.entries(incomingUpdates).filter(([column, value]) => {
      return availableCols.has(column) && value !== undefined;
    });

    if (updateEntries.length === 0) {
      return res.json({
        success: true,
        message: 'No academic fields provided to update'
      });
    }

    const normalizeValue = (column, value) => {
      if (value === '') return null;

      const intColumns = new Set([
        'batch_year',
        'current_semester',
        'total_backlogs',
        'active_backlogs',
        'backlogs'
      ]);
      const decimalColumns = new Set(['cgpa', 'sgpa', 'tenth_percentage', 'twelfth_percentage', 'diploma_percentage']);

      if (intColumns.has(column) && value !== null) {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      if (decimalColumns.has(column) && value !== null) {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return value;
    };

    const setClause = updateEntries.map(([column]) => `${column} = ?`).join(', ');
    const values = updateEntries.map(([column, value]) => normalizeValue(column, value));

    const [updateResult] = await promisePool.query(
      `UPDATE student_academics
       SET ${setClause}
       WHERE user_id = ?`,
      [...values, userId]
    );

    // If row is missing for this user, initialize and apply updates in one insert.
    if (updateResult.affectedRows === 0) {
      const insertColumns = ['user_id'];
      const insertValues = [userId];
      const insertPlaceholders = ['?'];

      // Some schemas keep these fields as NOT NULL.
      if (availableCols.has('branch')) {
        insertColumns.push('branch');
        insertValues.push(incomingUpdates.branch || 'Unknown');
        insertPlaceholders.push('?');
      }
      if (availableCols.has('batch_year')) {
        insertColumns.push('batch_year');
        insertValues.push(parseInt(incomingUpdates.batch_year, 10) || new Date().getFullYear());
        insertPlaceholders.push('?');
      }

      for (const [column, value] of updateEntries) {
        if (column === 'branch' || column === 'batch_year') continue;
        insertColumns.push(column);
        insertValues.push(normalizeValue(column, value));
        insertPlaceholders.push('?');
      }

      await promisePool.query(
        `INSERT INTO student_academics (${insertColumns.join(', ')})
         VALUES (${insertPlaceholders.join(', ')})`,
        insertValues
      );
    }

    res.json({
      success: true,
      message: 'Academic information updated successfully'
    });
  } catch (error) {
    console.error('Update academics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic information'
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/profile/photo
// @access  Private
const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a photo'
      });
    }

    const photoUrl = req.file.path || req.file.secure_url;

    await promisePool.query(
      'UPDATE student_academics SET photo_url = ? WHERE user_id = ?',
      [photoUrl, userId]
    );

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photoUrl }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo'
    });
  }
};

// @desc    Upload resume
// @route   POST /api/profile/resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume'
      });
    }

    // Debug: Log file object to see what Cloudinary returns
    console.log('📄 Resume Upload Debug:');
    console.log('  - req.file.fieldname:', req.file.fieldname);
    console.log('  - req.file.originalname:', req.file.originalname);
    console.log('  - req.file.encoding:', req.file.encoding);
    console.log('  - req.file.mimetype:', req.file.mimetype);
    console.log('  - req.file.size:', req.file.size);
    console.log('  - req.file.path:', req.file.path);
    console.log('  - req.file.secure_url:', req.file.secure_url);
    console.log('  - req.file.url:', req.file.url);
    console.log('  - Full file object:', JSON.stringify(req.file, null, 2));

    // Use secure_url from Cloudinary (not path which is for disk storage)
    const resumeUrl = req.file.secure_url || req.file.path;

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'File upload to Cloudinary failed - no URL returned'
      });
    }

    console.log('  - Final URL to save:', resumeUrl);
    console.log('  ✅ Resume saved successfully to DB');

    await promisePool.query(
      'UPDATE student_academics SET resume_url = ? WHERE user_id = ?',
      [resumeUrl, userId]
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { resumeUrl }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume: ' + error.message
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/profile/resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;

    await promisePool.query(
      'UPDATE student_academics SET resume_url = NULL WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
};

// @desc    Stream resume for preview or download (from Cloudinary)
// @route   GET /api/profile/resume/stream
// @access  Private
const streamResume = async (req, res) => {
  try {
    console.log('📄 Resume Stream - Request received');
    console.log('📄 Resume Stream - User ID:', req.user?.id);
    console.log('📄 Resume Stream - Query params:', req.query);

    if (!req.user?.id) {
      console.error('📄 Resume Stream - No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user information'
      });
    }

    const userId = req.user.id;

    // Get resume URL from database
    const [profile] = await promisePool.query(
      'SELECT resume_url FROM student_academics WHERE user_id = ?',
      [userId]
    );

    if (!profile || !profile[0]?.resume_url) {
      console.warn('📄 Resume Stream - No resume found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No resume found'
      });
    }

    const resumeUrl = profile[0].resume_url;

    // Extract public ID from stored Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud}/raw/upload/v{version}/{public_id}
    const uploadIndex = resumeUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      return res.redirect(302, resumeUrl);
    }

    let publicIdWithVersion = resumeUrl.substring(uploadIndex + 8); // after '/upload/'
    // Remove version prefix like "v1234567890/"
    const publicId = publicIdWithVersion.replace(/^v\d+\//, '');

    console.log('📄 Resume Stream - Generating signed URL for public ID:', publicId);

    // Generate a signed URL valid for 1 hour
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });

    console.log('📄 Resume Stream - Redirecting to signed URL');
    return res.redirect(302, signedUrl);
  } catch (error) {
    console.error('📄 Resume Stream error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume'
    });
  }
};

// @desc    Add skill
// @route   POST /api/profile/skills
// @access  Private
const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_name, skillName, category, proficiency } = req.body;
    const name = skill_name || skillName;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const [result] = await promisePool.query(
      'INSERT INTO skills (user_id, skill_name, category, proficiency) VALUES (?, ?, ?, ?)',
      [userId, name, category || 'Other', proficiency || 'Intermediate']
    );

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill'
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/profile/skills/:id
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = req.params.id;

    await promisePool.query(
      'DELETE FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill'
    });
  }
};

// @desc    Add project
// @route   POST /api/profile/projects
// @access  Private
const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, techStack, status, isOngoing, startDate, endDate, projectUrl, githubUrl } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Project title is required'
      });
    }

    const [result] = await promisePool.query(
      `INSERT INTO projects (user_id, title, description, tech_stack, status, is_ongoing, start_date, end_date, project_url, github_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description, techStack, status || 'Ongoing', isOngoing || false, startDate, endDate, projectUrl, githubUrl]
    );

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/profile/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const { title, description, techStack, status, isOngoing, startDate, endDate, projectUrl, githubUrl } = req.body;

    await promisePool.query(
      `UPDATE projects
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           tech_stack = COALESCE(?, tech_stack),
           status = COALESCE(?, status),
           is_ongoing = COALESCE(?, is_ongoing),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           project_url = COALESCE(?, project_url),
           github_url = COALESCE(?, github_url)
       WHERE id = ? AND user_id = ?`,
      [title, description, techStack, status, isOngoing, startDate, endDate, projectUrl, githubUrl, projectId, userId]
    );

    res.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/profile/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    await promisePool.query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project'
    });
  }
};

// @desc    Add achievement
// @route   POST /api/profile/achievements
// @access  Private
const addAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, type, issuer, dateAchieved, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Achievement title is required'
      });
    }

    const [result] = await promisePool.query(
      'INSERT INTO achievements (user_id, title, type, issuer, date_achieved, description) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, type || 'Other', issuer, dateAchieved, description]
    );

    res.status(201).json({
      success: true,
      message: 'Achievement added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add achievement'
    });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/profile/achievements/:id
// @access  Private
const deleteAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementId = req.params.id;

    await promisePool.query(
      'DELETE FROM achievements WHERE id = ? AND user_id = ?',
      [achievementId, userId]
    );

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement'
    });
  }
};

// @desc    Get eligibility status for placements
// @route   GET /api/profile/eligibility
// @access  Private
const getEligibilityStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const [academics] = await promisePool.query(
      `SELECT u.id,
              u.is_placed,
              sa.user_id AS academic_user_id,
              COALESCE(sa.cgpa, 0) AS cgpa,
              COALESCE(sa.active_backlogs, 0) AS active_backlogs
       FROM users u
       LEFT JOIN student_academics sa ON sa.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (academics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { cgpa, active_backlogs, academic_user_id } = academics[0];
    const isPlaced = Boolean(academics[0].is_placed);

    // Get ongoing project
    const [ongoingProjects] = await promisePool.query(
      'SELECT id, title FROM projects WHERE user_id = ? AND is_ongoing = TRUE LIMIT 1',
      [userId]
    );

    // Basic eligibility criteria (can be customized)
    const minCgpa = 6.0;
    const maxBacklogs = 0;

    const eligible = cgpa >= minCgpa && active_backlogs <= maxBacklogs && !isPlaced;

    res.json({
      success: true,
      data: {
        eligible,
        hasAcademicProfile: Boolean(academic_user_id),
        cgpa: cgpa || 0,
        activeBacklogs: active_backlogs || 0,
        isPlaced,
        ongoingProject: ongoingProjects.length > 0 ? ongoingProjects[0] : null,
        criteria: {
          minCgpa,
          maxBacklogs
        }
      }
    });
  } catch (error) {
    console.error('Get eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch eligibility status'
    });
  }
};

// @desc    Update basic profile info (name, phone)
// @route   PUT /api/profile/basic
// @access  Private
const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, whatsapp_number, whatsappNumber } = req.body;
    const includeWhatsappNumber = await hasColumn('users', 'whatsapp_number');

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const updateFields = ['full_name = ?', 'phone = ?'];
    const updateValues = [full_name.trim(), phone || null];

    if (includeWhatsappNumber) {
      updateFields.push('whatsapp_number = ?');
      updateValues.push(whatsapp_number ?? whatsappNumber ?? null);
    }

    updateValues.push(userId);

    await promisePool.query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update basic info error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Add internship
// @route   POST /api/profile/internships
// @access  Private
const addInternship = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, role, duration_months, start_date, end_date, description } = req.body;

    if (!company_name || !role) {
      return res.status(400).json({ success: false, message: 'Company name and role are required' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO internships (user_id, company_name, role, duration_months, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, company_name, role, duration_months || null, start_date || null, end_date || null, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Internship added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add internship error:', error);
    res.status(500).json({ success: false, message: 'Failed to add internship' });
  }
};

// @desc    Update internship
// @route   PUT /api/profile/internships/:id
// @access  Private
const updateInternship = async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;
    const { company_name, role, duration_months, start_date, end_date, description } = req.body;

    if (!company_name || !role) {
      return res.status(400).json({ success: false, message: 'Company name and role are required' });
    }

    const [result] = await promisePool.query(
      `UPDATE internships SET company_name = ?, role = ?, duration_months = ?,
       start_date = ?, end_date = ?, description = ?
       WHERE id = ? AND user_id = ?`,
      [company_name, role, duration_months || null, start_date || null, end_date || null, description || null, internshipId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    res.json({ success: true, message: 'Internship updated successfully' });
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({ success: false, message: 'Failed to update internship' });
  }
};

// @desc    Delete internship
// @route   DELETE /api/profile/internships/:id
// @access  Private
const deleteInternship = async (req, res) => {
  try {
    const userId = req.user.id;
    const internshipId = req.params.id;

    await promisePool.query(
      'DELETE FROM internships WHERE id = ? AND user_id = ?',
      [internshipId, userId]
    );

    res.json({ success: true, message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete internship' });
  }
};

// @desc    Upload certificate for an achievement
// @route   POST /api/profile/achievements/:id/certificate
// @access  Private
const uploadAchievementCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a certificate file' });
    }

    const certificateUrl = req.file.path || req.file.secure_url;

    const [result] = await promisePool.query(
      'UPDATE achievements SET certificate_url = ? WHERE id = ? AND user_id = ?',
      [certificateUrl, achievementId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    res.json({ success: true, message: 'Certificate uploaded successfully', data: { certificateUrl } });
  } catch (error) {
    console.error('Upload certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload certificate' });
  }
};

// @desc    Get student's placement rank among all students
// @route   GET /api/profile/ranking
// @access  Private
const getRankingInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const [students] = await promisePool.query(
      `SELECT u.id,
              u.full_name,
              u.usn,
              COALESCE(sa.cgpa, 0) AS cgpa,
              COALESCE(skills.skill_count, 0) AS skill_count,
              COALESCE(ints.total_months, 0) AS internship_months
       FROM users u
       LEFT JOIN student_academics sa ON sa.user_id = u.id
       LEFT JOIN (
         SELECT user_id, COUNT(*) AS skill_count
         FROM skills
         GROUP BY user_id
       ) skills ON skills.user_id = u.id
       LEFT JOIN (
         SELECT user_id,
                SUM(
                  CASE
                    WHEN duration_months IS NOT NULL AND duration_months > 0 THEN duration_months
                    ELSE 2
                  END
                ) AS total_months
         FROM internships
         GROUP BY user_id
       ) ints ON ints.user_id = u.id
       WHERE u.role = 'student' AND u.is_active = 1`
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No student records found'
      });
    }

    const scoredStudents = students.map((student) => {
      const cgpa = Number(student.cgpa) || 0;
      const skills = Number(student.skill_count) || 0;
      const internshipMonths = Number(student.internship_months) || 0;

      // Weighted scoring: CGPA (60), Internship (30), Skills (10)
      const cgpaPoints = Math.min(10, cgpa) * 6;
      const internshipPoints = Math.min(12, internshipMonths) * 2.5;
      const skillPoints = Math.min(10, skills) * 1;
      const totalScore = Number((cgpaPoints + internshipPoints + skillPoints).toFixed(2));

      return {
        ...student,
        cgpa,
        skills,
        internshipMonths,
        points: {
          cgpa: Number(cgpaPoints.toFixed(2)),
          internships: Number(internshipPoints.toFixed(2)),
          skills: Number(skillPoints.toFixed(2)),
          total: totalScore
        }
      };
    });

    scoredStudents.sort((a, b) => {
      if (b.points.total !== a.points.total) return b.points.total - a.points.total;
      if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
      if (b.internshipMonths !== a.internshipMonths) return b.internshipMonths - a.internshipMonths;
      if (b.skills !== a.skills) return b.skills - a.skills;
      return a.id - b.id;
    });

    const rankIndex = scoredStudents.findIndex((student) => student.id === userId);

    if (rankIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Current student not found for ranking'
      });
    }

    const me = scoredStudents[rankIndex];
    const totalStudents = scoredStudents.length;

    res.json({
      success: true,
      data: {
        rank: rankIndex + 1,
        totalStudents,
        percentile: Number((((totalStudents - rankIndex - 1) / totalStudents) * 100).toFixed(2)),
        score: me.points,
        metrics: {
          cgpa: me.cgpa,
          skills: me.skills,
          internshipMonths: me.internshipMonths
        }
      }
    });
  } catch (error) {
    console.error('Get ranking insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ranking insights'
    });
  }
};

// @desc    Add portfolio link
// @route   POST /api/profile/portfolios
// @access  Private
const addPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, portfolio_url, description, built_with, build_details } = req.body;

    if (!title || !title.trim() || !portfolio_url || !portfolio_url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and portfolio URL are required'
      });
    }

    await ensurePortfoliosTable();

    const [result] = await promisePool.query(
      `INSERT INTO portfolios (user_id, title, portfolio_url, description, built_with, build_details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        portfolio_url.trim(),
        description || null,
        built_with || null,
        build_details || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Portfolio link added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add portfolio link'
    });
  }
};

// @desc    Update portfolio link
// @route   PUT /api/profile/portfolios/:id
// @access  Private
const updatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolioId = req.params.id;
    const { title, portfolio_url, description, built_with, build_details } = req.body;

    if (!title || !title.trim() || !portfolio_url || !portfolio_url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and portfolio URL are required'
      });
    }

    await ensurePortfoliosTable();

    const [result] = await promisePool.query(
      `UPDATE portfolios
       SET title = ?, portfolio_url = ?, description = ?, built_with = ?, build_details = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        portfolio_url.trim(),
        description || null,
        built_with || null,
        build_details || null,
        portfolioId,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio link updated successfully'
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio link'
    });
  }
};

// @desc    Delete portfolio link
// @route   DELETE /api/profile/portfolios/:id
// @access  Private
const deletePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolioId = req.params.id;

    await ensurePortfoliosTable();

    const [result] = await promisePool.query(
      'DELETE FROM portfolios WHERE id = ? AND user_id = ?',
      [portfolioId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio link deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio link'
    });
  }
};

module.exports = {
  getProfile,
  updateBasicInfo,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  deleteResume,
  streamResume,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  uploadAchievementCertificate,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  addInternship,
  updateInternship,
  deleteInternship,
  getEligibilityStatus,
  getRankingInsights
};
