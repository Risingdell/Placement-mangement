-- Migration: Add Drive Attendees Table
-- Description: Creates drive_attendees table to track students who physically attended a placement drive
-- Each attendee is assigned a unique 2-word key for verification

CREATE TABLE IF NOT EXISTS drive_attendees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT NOT NULL,
  user_id INT NOT NULL,
  attendance_key VARCHAR(50) NOT NULL UNIQUE,
  attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  marked_by INT COMMENT 'Admin user ID who marked the attendance',
  notes TEXT COMMENT 'Optional admin notes for this attendee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE KEY unique_drive_user (drive_id, user_id),
  INDEX idx_drive_id (drive_id),
  INDEX idx_user_id (user_id),
  INDEX idx_attendance_key (attendance_key),
  INDEX idx_attended_at (attended_at)
);

-- Verify table was created successfully
-- SELECT * FROM drive_attendees LIMIT 0;
