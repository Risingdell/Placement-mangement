-- =====================================================
-- PLACEMENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Run this script in phpMyAdmin or MySQL command line
-- to create all required tables for the application
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS placement_management;
USE placement_management;

-- =====================================================
-- TABLE: users
-- Stores student authentication and basic information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usn VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    is_placed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_usn (usn),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: student_academics
-- Stores academic information for students
-- =====================================================
CREATE TABLE IF NOT EXISTS student_academics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    batch_year INT NOT NULL,
    current_semester INT DEFAULT 1,
    cgpa DECIMAL(3, 2) DEFAULT NULL,
    sgpa DECIMAL(3, 2) DEFAULT NULL,
    tenth_percentage DECIMAL(5, 2) DEFAULT NULL,
    twelfth_percentage DECIMAL(5, 2) DEFAULT NULL,
    diploma_percentage DECIMAL(5, 2) DEFAULT NULL,
    total_backlogs INT DEFAULT 0,
    active_backlogs INT DEFAULT 0,
    photo_url VARCHAR(255) DEFAULT NULL,
    resume_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_branch (branch),
    INDEX idx_batch_year (batch_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: password_reset_tokens
-- Stores password reset tokens for forgot password flow
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: skills
-- Stores student skills and proficiency levels
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: projects
-- Stores student project details
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    technologies VARCHAR(500),
    start_date DATE,
    end_date DATE,
    project_url VARCHAR(255),
    github_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: achievements
-- Stores student achievements, certifications, awards
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    issued_by VARCHAR(100),
    issued_date DATE,
    certificate_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: placement_drives
-- Stores company placement drive information
-- =====================================================
CREATE TABLE IF NOT EXISTS placement_drives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    job_description TEXT,
    job_type ENUM('Full Time', 'Intern', 'Part Time') DEFAULT 'Full Time',
    package_offered DECIMAL(10, 2),
    package_currency VARCHAR(10) DEFAULT 'INR',
    location VARCHAR(200),
    min_cgpa DECIMAL(3, 2) DEFAULT 0.00,
    max_active_backlogs INT DEFAULT 0,
    allowed_branches TEXT,
    allowed_batch_years VARCHAR(100),
    required_skills TEXT,
    drive_date DATE,
    registration_deadline DATETIME,
    status ENUM('Upcoming', 'Active', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_drive_date (drive_date),
    INDEX idx_registration_deadline (registration_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: drive_applications
-- Stores student applications to placement drives
-- =====================================================
CREATE TABLE IF NOT EXISTS drive_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    drive_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('Applied', 'Shortlisted', 'Rejected', 'Selected', 'Withdrawn') DEFAULT 'Applied',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (drive_id, user_id),
    INDEX idx_drive_id (drive_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: notifications
-- Stores system notifications for users
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Info', 'Success', 'Warning', 'Error') DEFAULT 'Info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: events
-- Stores placement-related events and workshops
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('Workshop', 'Seminar', 'Mock Interview', 'Career Fair', 'Other') DEFAULT 'Other',
    event_date DATETIME NOT NULL,
    duration INT COMMENT 'Duration in minutes',
    location VARCHAR(200),
    organizer VARCHAR(100),
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline DATETIME,
    max_participants INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_date (event_date),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: event_registrations
-- Stores student registrations for events
-- =====================================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_status ENUM('Registered', 'Attended', 'Absent') DEFAULT 'Registered',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample admin user (password: admin123)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO users (usn, email, password_hash, full_name, role, is_active) VALUES
('ADMIN001', 'admin@placement.com', '$2a$10$YourHashedPasswordHere', 'System Admin', 'admin', TRUE)
ON DUPLICATE KEY UPDATE id=id;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify table creation

-- Check all tables
SHOW TABLES;

-- Check users table structure
DESCRIBE users;

-- Check student_academics table structure
DESCRIBE student_academics;

-- Check row counts
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'student_academics', COUNT(*) FROM student_academics
UNION ALL
SELECT 'placement_drives', COUNT(*) FROM placement_drives
UNION ALL
SELECT 'drive_applications', COUNT(*) FROM drive_applications;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Make sure to update the admin password hash if you use the sample data
-- 2. The schema uses InnoDB engine for foreign key support
-- 3. All tables use utf8mb4 for proper Unicode support
-- 4. Timestamps are auto-managed for created_at and updated_at
-- 5. Indexes are created for commonly queried columns
-- =====================================================
