const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisePool } = require('../config/database');
const { hasColumn } = require('../utils/schemaUtils');
const { isEmailConfigured, sendPasswordResetEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Password strength validator
const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { usn, email, password, fullName, phone, whatsappNumber, branch, batchYear } = req.body;

    // Validation
    if (!usn || !email || !password || !fullName || !branch || !batchYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    // Check if email is in authorized whitelist
    const [authorizedEmails] = await connection.query(
      `SELECT id, is_active, is_used, student_name, usn as authorized_usn, branch as authorized_branch, batch_year as authorized_batch_year
       FROM authorized_emails
       WHERE LOWER(email) = LOWER(?) AND is_active = 1`,
      [email]
    );

    if (authorizedEmails.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Email not authorized for registration. Please contact the placement office.'
      });
    }

    const authorizedEmail = authorizedEmails[0];

    // Check if email was already used
    if (authorizedEmail.is_used) {
      return res.status(403).json({
        success: false,
        message: 'This email has already been used for registration.'
      });
    }

    // Optional: Validate provided data matches authorized data
    if (authorizedEmail.authorized_usn && authorizedEmail.authorized_usn !== usn) {
      return res.status(400).json({
        success: false,
        message: `USN mismatch. Expected: ${authorizedEmail.authorized_usn}`
      });
    }

    if (authorizedEmail.authorized_branch && authorizedEmail.authorized_branch !== branch) {
      return res.status(400).json({
        success: false,
        message: `Branch mismatch. Expected: ${authorizedEmail.authorized_branch}`
      });
    }

    if (authorizedEmail.authorized_batch_year && authorizedEmail.authorized_batch_year !== parseInt(batchYear)) {
      return res.status(400).json({
        success: false,
        message: `Batch year mismatch. Expected: ${authorizedEmail.authorized_batch_year}`
      });
    }

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE usn = ? OR email = ?',
      [usn, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this USN or email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const hasWhatsappNumber = await hasColumn('users', 'whatsapp_number');

    await connection.beginTransaction();

    // Insert user
    const userColumns = ['usn', 'email', 'password_hash', 'full_name', 'phone', 'role'];
    const userValues = [usn, email, passwordHash, fullName, phone || null, 'student'];

    if (hasWhatsappNumber) {
      userColumns.splice(5, 0, 'whatsapp_number');
      userValues.splice(5, 0, whatsappNumber || null);
    }

    const placeholders = userColumns.map(() => '?').join(', ');
    const [userResult] = await connection.query(
      `INSERT INTO users (${userColumns.join(', ')}) VALUES (${placeholders})`,
      userValues
    );

    const userId = userResult.insertId;

    // Insert academic info
    await connection.query(
      'INSERT INTO student_academics (user_id, branch, batch_year) VALUES (?, ?, ?)',
      [userId, branch, batchYear]
    );

    // Mark authorized email as used
    await connection.query(
      `UPDATE authorized_emails
       SET is_used = 1, used_by_user_id = ?, used_at = NOW()
       WHERE id = ?`,
      [userId, authorizedEmail.id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      data: {
        usn,
        email,
        fullName
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  } finally {
    connection.release();
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user from database
    const [users] = await promisePool.query(
      `SELECT id, usn, email, password_hash, full_name, role, is_active, is_placed${
        (await hasColumn('users', 'whatsapp_number')) ? ', whatsapp_number' : ''
      } FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        usn: user.usn,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isPlaced: user.is_placed,
        whatsappNumber: user.whatsapp_number || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// @desc    Forgot password - send reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Check if user exists
    const [users] = await connection.query(
      'SELECT id, email, full_name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await connection.beginTransaction();

    // Invalidate any existing tokens
    await connection.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE',
      [user.id]
    );

    // Insert new reset token
    await connection.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    await connection.commit();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    if (isEmailConfigured()) {
      setImmediate(async () => {
        try {
          await sendPasswordResetEmail({
            to: user.email,
            name: user.full_name,
            resetUrl
          });
          console.log(`Password reset email sent to ${user.email}`);
        } catch (mailError) {
          console.error('Password reset email send failed via Resend:', mailError);
          console.warn(`Password reset link for ${email}: ${resetUrl}`);
        }
      });
    } else {
      console.warn('Resend email service is not configured. Password reset link was not emailed.');
      console.warn(`Password reset link for ${email}: ${resetUrl}`);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
      // TODO: Remove this in production
      ...(process.env.NODE_ENV === 'development' && {
        resetToken,
        resetUrl,
        emailConfigured: isEmailConfigured()
      })
    });
  } catch (error) {
    await connection.rollback();
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.'
    });
  } finally {
    connection.release();
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const [tokens] = await connection.query(
      `SELECT rt.id, rt.user_id
       FROM password_reset_tokens rt
       WHERE rt.token = ? AND rt.used = FALSE AND rt.expires_at > NOW()`,
      [hashedToken]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const resetTokenRecord = tokens[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await connection.beginTransaction();

    // Update password
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, resetTokenRecord.user_id]
    );

    // Mark token as used
    await connection.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE id = ?',
      [resetTokenRecord.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.'
    });
  } finally {
    connection.release();
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const includeWhatsappNumber = await hasColumn('users', 'whatsapp_number');

    const [users] = await promisePool.query(
      `SELECT u.id, u.usn, u.email, u.full_name, u.phone, u.role, u.is_placed${
        includeWhatsappNumber ? ', u.whatsapp_number' : ''
      },
              sa.branch, sa.batch_year, sa.current_semester, sa.cgpa, sa.sgpa,
              sa.total_backlogs, sa.active_backlogs, sa.photo_url
       FROM users u
       LEFT JOIN student_academics sa ON u.id = sa.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe
};
