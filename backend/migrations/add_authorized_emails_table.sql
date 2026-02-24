-- Migration: Add Authorized Emails Table
-- Description: Creates authorized_emails table for email whitelist authentication
-- Enables admin control over student registration via email authorization

CREATE TABLE IF NOT EXISTS authorized_emails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  student_name VARCHAR(100) COMMENT 'Optional: Expected student name',
  usn VARCHAR(20) COMMENT 'Optional: Expected USN',
  branch VARCHAR(100) COMMENT 'Optional: Expected branch',
  batch_year INT COMMENT 'Optional: Expected batch year',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'Allow deactivation without deletion',
  is_used TINYINT(1) DEFAULT 0 COMMENT 'Track if email was used for registration',
  used_by_user_id INT NULL COMMENT 'Reference to user who registered',
  notes TEXT COMMENT 'Admin notes about this authorization',
  added_by INT NOT NULL COMMENT 'Admin who added this email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL COMMENT 'When the email was used for registration',

  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_email (email),
  INDEX idx_is_active (is_active),
  INDEX idx_is_used (is_used),
  INDEX idx_batch_year (batch_year),
  INDEX idx_branch (branch),
  INDEX idx_added_by (added_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify table was created successfully
-- SELECT COUNT(*) as table_exists FROM information_schema.tables
-- WHERE table_schema = 'placement_management' AND table_name = 'authorized_emails';
