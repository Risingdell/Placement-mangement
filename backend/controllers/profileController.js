const { promisePool } = require('../config/database');
const path = require('path');

// @desc    Get student profile with all details
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic info and academics
    const [profile] = await promisePool.query(
      `SELECT u.id, u.usn, u.email, u.full_name, u.phone, u.is_placed,
              sa.branch, sa.batch_year, sa.current_semester, sa.cgpa, sa.sgpa,
              sa.total_backlogs, sa.active_backlogs, sa.tenth_percentage, sa.twelfth_percentage,
              sa.photo_url, sa.resume_url
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

    res.json({
      success: true,
      data: {
        ...profile[0],
        skills,
        projects,
        internships,
        achievements,
        semesterMarks
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
    const {
      branch,
      batchYear,
      currentSemester,
      cgpa,
      sgpa,
      totalBacklogs,
      activeBacklogs,
      tenthPercentage,
      twelfthPercentage
    } = req.body;

    await promisePool.query(
      `UPDATE student_academics
       SET branch = COALESCE(?, branch),
           batch_year = COALESCE(?, batch_year),
           current_semester = COALESCE(?, current_semester),
           cgpa = COALESCE(?, cgpa),
           sgpa = COALESCE(?, sgpa),
           total_backlogs = COALESCE(?, total_backlogs),
           active_backlogs = COALESCE(?, active_backlogs),
           tenth_percentage = COALESCE(?, tenth_percentage),
           twelfth_percentage = COALESCE(?, twelfth_percentage)
       WHERE user_id = ?`,
      [branch, batchYear, currentSemester, cgpa, sgpa, totalBacklogs, activeBacklogs, tenthPercentage, twelfthPercentage, userId]
    );

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

    const photoUrl = `/uploads/photos/${req.file.filename}`;

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

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

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
      message: 'Failed to upload resume'
    });
  }
};

// @desc    Add skill
// @route   POST /api/profile/skills
// @access  Private
const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillName, category, proficiency } = req.body;

    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    const [result] = await promisePool.query(
      'INSERT INTO skills (user_id, skill_name, category, proficiency) VALUES (?, ?, ?, ?)',
      [userId, skillName, category || 'Other', proficiency || 'Intermediate']
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
      `SELECT cgpa, active_backlogs, is_placed
       FROM student_academics sa
       JOIN users u ON sa.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (academics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic information not found'
      });
    }

    const { cgpa, active_backlogs } = academics[0];
    const isPlaced = req.user.is_placed;

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

module.exports = {
  getProfile,
  updateAcademics,
  uploadPhoto,
  uploadResume,
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  getEligibilityStatus
};
