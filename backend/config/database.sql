-- Placement Management System Database Schema
-- Database: placement_management

-- Create database
CREATE DATABASE IF NOT EXISTS placement_management;
USE placement_management;

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Users table (Students)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usn VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  role ENUM('student', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  is_placed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usn (usn),
  INDEX idx_email (email)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);

-- =============================================
-- STUDENT PROFILE & ACADEMIC DATA
-- =============================================

-- Student academic information
CREATE TABLE IF NOT EXISTS student_academics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  branch VARCHAR(100) NOT NULL,
  batch_year INT NOT NULL,
  current_semester INT,
  cgpa DECIMAL(3,2),
  sgpa DECIMAL(3,2),
  total_backlogs INT DEFAULT 0,
  active_backlogs INT DEFAULT 0,
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  photo_url VARCHAR(255),
  resume_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_cgpa (cgpa),
  INDEX idx_branch (branch)
);

-- Semester marks cards
CREATE TABLE IF NOT EXISTS semester_marks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  semester INT NOT NULL,
  sgpa DECIMAL(3,2),
  marks_card_url VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_semester (user_id, semester),
  INDEX idx_user_semester (user_id, semester)
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  category ENUM('Programming', 'Framework', 'Tool', 'Soft Skill', 'Other') DEFAULT 'Other',
  proficiency ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tech_stack VARCHAR(500),
  status ENUM('Ongoing', 'Completed') DEFAULT 'Ongoing',
  is_ongoing BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  project_url VARCHAR(255),
  github_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Internships
CREATE TABLE IF NOT EXISTS internships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  duration_months INT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  certificate_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  type ENUM('Hackathon', 'Certification', 'Competition', 'Award', 'Other') DEFAULT 'Other',
  issuer VARCHAR(200),
  date_achieved DATE,
  description TEXT,
  certificate_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type)
);

-- =============================================
-- PLACEMENT DRIVES
-- =============================================

-- Placement drives/companies
CREATE TABLE IF NOT EXISTS placement_drives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  company_type ENUM('Product', 'Service') DEFAULT 'Service',
  ctc DECIMAL(10,2),
  job_description TEXT,
  eligibility_criteria JSON,
  min_cgpa DECIMAL(3,2),
  max_backlogs INT DEFAULT 0,
  allowed_branches JSON,
  drive_date DATE,
  registration_deadline DATETIME,
  status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_drive_date (drive_date)
);

-- =============================================
-- APPLICATIONS & TRACKING
-- =============================================

-- Student applications for drives
CREATE TABLE IF NOT EXISTS applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  drive_id INT NOT NULL,
  status ENUM('Applied', 'Shortlisted', 'Exam Scheduled', 'Interview Scheduled', 'Selected', 'Rejected') DEFAULT 'Applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (user_id, drive_id),
  INDEX idx_user_id (user_id),
  INDEX idx_drive_id (drive_id),
  INDEX idx_status (status)
);

-- Application status history
CREATE TABLE IF NOT EXISTS application_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INT,
  remarks TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_application_id (application_id)
);

-- =============================================
-- INBOX & COMMUNICATIONS
-- =============================================

-- Inbox messages
CREATE TABLE IF NOT EXISTS inbox_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_id INT NOT NULL,
  sender_id INT,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  message_type ENUM('Notification', 'Shortlist', 'Exam', 'Interview', 'Announcement', 'Result') DEFAULT 'Notification',
  related_drive_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (related_drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL,
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_is_read (is_read),
  INDEX idx_sent_at (sent_at)
);

-- =============================================
-- EVENTS & SCHEDULES
-- =============================================

-- Placement events
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  event_type ENUM('PPT', 'Online Exam', 'Interview', 'Result', 'Other') DEFAULT 'Other',
  description TEXT,
  related_drive_id INT,
  event_date DATETIME NOT NULL,
  location VARCHAR(200),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (related_drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event_date (event_date),
  INDEX idx_event_type (event_type)
);

-- =============================================
-- SYSTEM LOGS (Optional but recommended)
-- =============================================

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_student_eligibility ON student_academics(cgpa, active_backlogs, branch);
CREATE INDEX idx_active_drives ON placement_drives(status, registration_deadline);
CREATE INDEX idx_user_applications ON applications(user_id, status);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert a default admin user (password: admin123)
-- Note: You should change this password immediately after first login
INSERT IGNORE INTO users (usn, email, password_hash, full_name, role) VALUES
('ADMIN001', 'admin@college.edu', '$2a$10$YourHashedPasswordHere', 'System Administrator', 'admin');

-- Note: To generate the password hash, use bcrypt in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('admin123', 10);
