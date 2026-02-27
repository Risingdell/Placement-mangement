-- Recovery SQL for placement_management
-- Password for all seed users: password123
-- Hash: $2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS placement_management;
CREATE DATABASE placement_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE placement_management;

CREATE TABLE users (
 id INT PRIMARY KEY AUTO_INCREMENT,
 usn VARCHAR(30) UNIQUE NOT NULL,
 email VARCHAR(150) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 full_name VARCHAR(150) NOT NULL,
 name VARCHAR(150) NULL,
 phone VARCHAR(20) NULL,
 role ENUM('student','admin','tpo') DEFAULT 'student',
 is_active TINYINT(1) DEFAULT 1,
 is_placed TINYINT(1) DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE companies (
 id INT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(200) NOT NULL,
 company_type ENUM('Product','Service','Startup','Core','Other') DEFAULT 'Other',
 industry VARCHAR(150) NULL,
 location VARCHAR(150) NULL,
 website VARCHAR(255) NULL,
 description TEXT NULL,
 hr_name VARCHAR(150) NULL,
 contact_email VARCHAR(150) NULL,
 contact_phone VARCHAR(20) NULL,
 logo_url VARCHAR(255) NULL,
 company_size VARCHAR(50) NULL,
 is_active TINYINT(1) DEFAULT 1,
 created_by INT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE placement_drives (
 id INT PRIMARY KEY AUTO_INCREMENT,
 company_id INT NULL,
 company_name VARCHAR(200) NOT NULL,
 name VARCHAR(200) NULL,
 role VARCHAR(150) NOT NULL,
 company_type ENUM('Product','Service','Startup','Core','Other') DEFAULT 'Service',
 ctc DECIMAL(10,2) NULL,
 job_description TEXT NULL,
 description TEXT NULL,
 eligibility_criteria LONGTEXT NULL,
 min_cgpa DECIMAL(4,2) NULL,
 max_backlogs INT DEFAULT 0,
 allowed_branches LONGTEXT NULL,
 drive_date DATE NULL,
 registration_deadline DATETIME NULL,
 status ENUM('Upcoming','Ongoing','Completed','Cancelled') DEFAULT 'Upcoming',
 created_by INT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE student_academics (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT UNIQUE NOT NULL,
 branch VARCHAR(100) NOT NULL,
 batch_year INT NOT NULL,
 year INT NULL,
 current_semester INT NULL,
 cgpa DECIMAL(4,2) NULL,
 sgpa DECIMAL(4,2) NULL,
 total_backlogs INT DEFAULT 0,
 active_backlogs INT DEFAULT 0,
 backlogs INT DEFAULT 0,
 tenth_percentage DECIMAL(5,2) NULL,
 twelfth_percentage DECIMAL(5,2) NULL,
 photo_url VARCHAR(255) NULL,
 resume_url VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE authorized_emails (
 id INT PRIMARY KEY AUTO_INCREMENT,
 email VARCHAR(150) UNIQUE NOT NULL,
 student_name VARCHAR(150) NULL,
 usn VARCHAR(30) NULL,
 branch VARCHAR(100) NULL,
 batch_year INT NULL,
 notes TEXT NULL,
 is_active TINYINT(1) DEFAULT 1,
 is_used TINYINT(1) DEFAULT 0,
 added_by INT NOT NULL,
 used_by_user_id INT NULL,
 used_at TIMESTAMP NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (added_by) REFERENCES users(id),
 FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE applications (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 drive_id INT NOT NULL,
 status ENUM('Applied','Shortlisted','Exam Scheduled','Interview Scheduled','Selected','Rejected','Withdrawn') DEFAULT 'Applied',
 applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_user_drive (user_id,drive_id),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE application_status_history (
 id INT PRIMARY KEY AUTO_INCREMENT,
 application_id INT NOT NULL,
 old_status VARCHAR(60) NULL,
 new_status VARCHAR(60) NOT NULL,
 changed_by INT NULL,
 remarks TEXT NULL,
 changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
 FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE inbox_messages (
 id INT PRIMARY KEY AUTO_INCREMENT,
 recipient_id INT NOT NULL,
 sender_id INT NULL,
 subject VARCHAR(200) NOT NULL,
 message TEXT NOT NULL,
 message_type ENUM('Notification','Shortlist','Exam','Interview','Announcement','Result','Offer','Reminder','General') DEFAULT 'Notification',
 related_drive_id INT NULL,
 action_url VARCHAR(255) NULL,
 is_read TINYINT(1) DEFAULT 0,
 sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 read_at TIMESTAMP NULL,
 FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (related_drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE events (
 id INT PRIMARY KEY AUTO_INCREMENT,
 title VARCHAR(200) NOT NULL,
 event_type ENUM('PPT','Online Exam','Interview','Workshop','Seminar','Drive','Result','Other') DEFAULT 'Other',
 description TEXT NULL,
 related_drive_id INT NULL,
 event_date DATETIME NOT NULL,
 location VARCHAR(200) NULL,
 created_by INT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (related_drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL,
 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE drive_attendees (
 id INT PRIMARY KEY AUTO_INCREMENT,
 drive_id INT NOT NULL,
 user_id INT NOT NULL,
 attendance_key VARCHAR(100) UNIQUE NOT NULL,
 marked_by INT NULL,
 notes TEXT NULL,
 attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_drive_user (drive_id,user_id),
 FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE admin_messages (
 id INT PRIMARY KEY AUTO_INCREMENT,
 from_admin_id INT NULL,
 to_user_id INT NULL,
 sender_id INT NULL,
 recipient_id INT NULL,
 subject VARCHAR(200) NOT NULL,
 message TEXT NOT NULL,
 message_type ENUM('General','Drive','Exam','Interview','Result','Notification') DEFAULT 'General',
 parent_message_id INT NULL,
 related_entity_type VARCHAR(100) NULL,
 related_entity_id INT NULL,
 is_read TINYINT(1) DEFAULT 0,
 sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 read_at TIMESTAMP NULL,
 FOREIGN KEY (from_admin_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
 FOREIGN KEY (parent_message_id) REFERENCES admin_messages(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notifications (
 id INT PRIMARY KEY AUTO_INCREMENT,
 title VARCHAR(200) NOT NULL,
 message TEXT NOT NULL,
 type ENUM('Info','Warning','Success','Urgent') DEFAULT 'Info',
 priority ENUM('Low','Medium','High') DEFAULT 'Medium',
 target_audience ENUM('All','Students','Placed','Unplaced','Branch') DEFAULT 'All',
 target_filter LONGTEXT NULL,
 target_criteria LONGTEXT NULL,
 action_url VARCHAR(255) NULL,
 expires_at DATETIME NULL,
 is_active TINYINT(1) DEFAULT 1,
 created_by INT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notification_recipients (
 id INT PRIMARY KEY AUTO_INCREMENT,
 notification_id INT NOT NULL,
 user_id INT NOT NULL,
 is_read TINYINT(1) DEFAULT 0,
 sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 read_at TIMESTAMP NULL,
 UNIQUE KEY uq_notification_user (notification_id,user_id),
 FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE company_shortlists (
 id INT PRIMARY KEY AUTO_INCREMENT,
 company_id INT NULL,
 drive_id INT NULL,
 student_id INT NOT NULL,
 shortlisted_by INT NULL,
 status ENUM('Shortlisted','Notified','Rejected') DEFAULT 'Shortlisted',
 remarks TEXT NULL,
 notified_at TIMESTAMP NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_shortlist (company_id,student_id,drive_id),
 FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
 FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL,
 FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (shortlisted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE document_verifications (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 document_type ENUM('Resume','Marks Card','ID Proof','Offer Letter','Certificate') NOT NULL,
 document_url VARCHAR(255) NOT NULL,
 status ENUM('Pending','Verified','Rejected') DEFAULT 'Pending',
 verification_notes TEXT NULL,
 verified_by INT NULL,
 submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 verified_at TIMESTAMP NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE profile_change_requests (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 field_name VARCHAR(100) NOT NULL,
 old_value TEXT NULL,
 new_value TEXT NULL,
 change_reason TEXT NULL,
 status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
 reviewed_by INT NULL,
 review_notes TEXT NULL,
 requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 reviewed_at TIMESTAMP NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE password_reset_tokens (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 token VARCHAR(255) NOT NULL,
 expires_at DATETIME NOT NULL,
 used TINYINT(1) DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE skills (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 skill_name VARCHAR(120) NOT NULL,
 category ENUM('Programming','Framework','Database','Tool','Soft Skill','Other') DEFAULT 'Other',
 proficiency ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Intermediate',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE projects (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 title VARCHAR(200) NOT NULL,
 description TEXT NULL,
 tech_stack VARCHAR(400) NULL,
 status ENUM('Ongoing','Completed','On Hold') DEFAULT 'Ongoing',
 is_ongoing TINYINT(1) DEFAULT 0,
 start_date DATE NULL,
 end_date DATE NULL,
 project_url VARCHAR(255) NULL,
 github_url VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE internships (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 company_name VARCHAR(200) NOT NULL,
 role VARCHAR(150) NOT NULL,
 duration_months INT NULL,
 start_date DATE NULL,
 end_date DATE NULL,
 description TEXT NULL,
 certificate_url VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE achievements (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 title VARCHAR(200) NOT NULL,
 type ENUM('Hackathon','Certification','Competition','Award','Publication','Other') DEFAULT 'Other',
 issuer VARCHAR(200) NULL,
 date_achieved DATE NULL,
 description TEXT NULL,
 certificate_url VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE portfolios (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 title VARCHAR(150) NOT NULL,
 portfolio_url VARCHAR(500) NOT NULL,
 description TEXT NULL,
 built_with VARCHAR(500) NULL,
 build_details TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE semester_marks (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 semester INT NOT NULL,
 sgpa DECIMAL(4,2) NULL,
 marks_card_url VARCHAR(255) NULL,
 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_user_sem (user_id,semester),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE admin_actions (
 id INT PRIMARY KEY AUTO_INCREMENT,
 admin_id INT NOT NULL,
 action_type ENUM('Create','Update','Delete','Send','Export','BulkUpdate','Verify','Approve') NOT NULL,
 entity_type VARCHAR(100) NOT NULL,
 entity_id INT NULL,
 description TEXT NULL,
 metadata LONGTEXT NULL,
 ip_address VARCHAR(50) NULL,
 user_agent TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NULL,
 action VARCHAR(150) NOT NULL,
 entity_type VARCHAR(100) NULL,
 entity_id INT NULL,
 ip_address VARCHAR(50) NULL,
 user_agent TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE bulk_operations (
 id INT PRIMARY KEY AUTO_INCREMENT,
 operation_type ENUM('BulkStatusUpdate','BulkNotify','BulkImport','BulkExport') NOT NULL,
 target_entity VARCHAR(100) NOT NULL,
 filter_criteria LONGTEXT NULL,
 total_count INT DEFAULT 0,
 success_count INT DEFAULT 0,
 failed_count INT DEFAULT 0,
 result_data LONGTEXT NULL,
 status ENUM('Queued','Running','Completed','Failed') DEFAULT 'Queued',
 initiated_by INT NOT NULL,
 started_at TIMESTAMP NULL,
 completed_at TIMESTAMP NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE export_logs (
 id INT PRIMARY KEY AUTO_INCREMENT,
 export_type VARCHAR(100) NOT NULL,
 export_format ENUM('Excel','CSV','PDF') DEFAULT 'CSV',
 filter_applied LONGTEXT NULL,
 filter_criteria LONGTEXT NULL,
 file_name VARCHAR(255) NULL,
 file_path VARCHAR(255) NULL,
 file_size_kb INT NULL,
 record_count INT DEFAULT 0,
 download_count INT DEFAULT 0,
 exported_by INT NOT NULL,
 exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 expires_at TIMESTAMP NULL,
 FOREIGN KEY (exported_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE placement_statistics (
 id INT PRIMARY KEY AUTO_INCREMENT,
 stat_date DATE UNIQUE NOT NULL,
 total_students INT DEFAULT 0,
 placed_students INT DEFAULT 0,
 eligible_students INT DEFAULT 0,
 total_drives INT DEFAULT 0,
 total_companies INT DEFAULT 0,
 total_applications INT DEFAULT 0,
 avg_ctc DECIMAL(10,2) NULL,
 median_ctc DECIMAL(10,2) NULL,
 highest_ctc DECIMAL(10,2) NULL,
 lowest_ctc DECIMAL(10,2) NULL,
 branch_wise_stats LONGTEXT NULL,
 company_wise_stats LONGTEXT NULL,
 generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE system_settings (
 id INT PRIMARY KEY AUTO_INCREMENT,
 setting_key VARCHAR(100) UNIQUE NOT NULL,
 setting_value TEXT NULL,
 setting_type ENUM('String','Number','Boolean','JSON') DEFAULT 'String',
 category VARCHAR(100) DEFAULT 'General',
 description TEXT NULL,
 is_public TINYINT(1) DEFAULT 0,
 updated_by INT NULL,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users (id,usn,email,password_hash,full_name,name,phone,role,is_active,is_placed) VALUES
(1,'ADMIN001','admin@college.edu','$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi','System Administrator','System Administrator','9999999990','admin',1,0),
(2,'TPO001','tpo@college.edu','$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi','Dr. Anjali Rao','Dr. Anjali Rao','9999999999','tpo',1,0),
(101,'1MS21CS001','student@test.com','$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi','Rajesh Kumar','Rajesh Kumar','9876543210','student',1,0),
(102,'1MS21CS002','priya.sharma@college.edu','$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi','Priya Sharma','Priya Sharma','9876543211','student',1,1),
(103,'1MS21IS003','amit.patel@college.edu','$2b$10$HkkOqY.56DX7ngec3P23heo9s.HRZhWOMFfzydhWq/pcZudZyTsFi','Amit Patel','Amit Patel','9876543212','student',1,0);

INSERT INTO companies (id,name,company_type,industry,location,website,description,hr_name,contact_email,contact_phone,is_active,created_by) VALUES
(11,'Google','Product','Technology','Bangalore','https://careers.google.com','Global technology company','Ananya Singh','hr-india@google.com','08011112222',1,1),
(12,'Infosys','Service','IT Services','Mysore','https://www.infosys.com','Global consulting and IT services company','Vijay Kumar','campus@infosys.com','08033334444',1,2);

INSERT INTO placement_drives (id,company_id,company_name,name,role,company_type,ctc,job_description,description,eligibility_criteria,min_cgpa,max_backlogs,allowed_branches,drive_date,registration_deadline,status,created_by) VALUES
(1001,11,'Google','Google','Software Engineer','Product',1800000.00,'SDE role for campus hires','SDE role for campus hires','{"min_cgpa":7.5,"max_backlogs":0}',7.50,0,'["CSE","ISE","ECE"]','2026-03-15','2026-03-05 23:59:59','Upcoming',1),
(1002,12,'Infosys','Infosys','Systems Engineer','Service',450000.00,'Entry-level systems engineer role','Entry-level systems engineer role','{"min_cgpa":6.5,"max_backlogs":2}',6.50,2,'["CSE","ISE","ECE","EEE"]','2026-03-05','2026-02-28 23:59:59','Ongoing',2),
(1003,12,'Infosys','Infosys','Specialist Programmer','Service',900000.00,'High-performance engineering role','High-performance engineering role','{"min_cgpa":8.0,"max_backlogs":0}',8.00,0,'["CSE","ISE"]','2026-01-20','2026-01-10 23:59:59','Completed',2);

INSERT INTO student_academics (user_id,branch,batch_year,year,current_semester,cgpa,sgpa,total_backlogs,active_backlogs,backlogs,tenth_percentage,twelfth_percentage,photo_url,resume_url) VALUES
(101,'CSE',2021,2021,8,8.45,8.60,0,0,0,92.50,88.75,'https://ui-avatars.com/api/?name=Rajesh+Kumar','/uploads/resumes/rajesh.pdf'),
(102,'CSE',2021,2021,8,9.12,9.20,0,0,0,95.00,91.20,'https://ui-avatars.com/api/?name=Priya+Sharma','/uploads/resumes/priya.pdf'),
(103,'ISE',2021,2021,8,7.85,8.00,1,0,1,88.00,85.50,'https://ui-avatars.com/api/?name=Amit+Patel','/uploads/resumes/amit.pdf');
INSERT INTO authorized_emails (email,student_name,usn,branch,batch_year,notes,is_active,is_used,added_by) VALUES
('student@test.com','Rajesh Kumar','1MS21CS001','CSE',2021,'Imported recovery whitelist',1,1,2),
('priya.sharma@college.edu','Priya Sharma','1MS21CS002','CSE',2021,'Imported recovery whitelist',1,1,2),
('amit.patel@college.edu','Amit Patel','1MS21IS003','ISE',2021,'Imported recovery whitelist',1,1,2),
('new.student@college.edu','New Student','1MS22CS010','CSE',2022,'Ready for registration',1,0,2);
UPDATE authorized_emails SET used_by_user_id=101, used_at=NOW() WHERE email='student@test.com';
UPDATE authorized_emails SET used_by_user_id=102, used_at=NOW() WHERE email='priya.sharma@college.edu';
UPDATE authorized_emails SET used_by_user_id=103, used_at=NOW() WHERE email='amit.patel@college.edu';

INSERT INTO applications (id,user_id,drive_id,status,applied_at,updated_at) VALUES
(5001,101,1001,'Applied','2026-02-20 10:00:00','2026-02-20 10:00:00'),
(5002,101,1002,'Shortlisted','2026-02-10 12:00:00','2026-02-18 14:00:00'),
(5003,102,1003,'Selected','2026-01-08 11:00:00','2026-01-25 16:00:00'),
(5004,103,1002,'Applied','2026-02-15 09:30:00','2026-02-15 09:30:00');

INSERT INTO application_status_history (application_id,old_status,new_status,changed_by,remarks,changed_at) VALUES
(5001,NULL,'Applied',101,'Application submitted','2026-02-20 10:00:00'),
(5002,NULL,'Applied',101,'Application submitted','2026-02-10 12:00:00'),
(5002,'Applied','Shortlisted',2,'Shortlisted after resume screening','2026-02-18 14:00:00'),
(5003,NULL,'Applied',102,'Application submitted','2026-01-08 11:00:00'),
(5003,'Applied','Selected',1,'Final selection confirmed','2026-01-25 16:00:00');

INSERT INTO drive_attendees (drive_id,user_id,attendance_key,marked_by,notes,attended_at) VALUES
(1002,101,'DRV1002-USR101',2,'Attended pre-placement talk','2026-02-18 09:00:00'),
(1002,103,'DRV1002-USR103',2,'Attended aptitude round','2026-02-18 09:05:00');

INSERT INTO events (title,event_type,description,related_drive_id,event_date,location,created_by) VALUES
('Google Pre-Placement Talk','PPT','Introduction to hiring process',1001,'2026-03-01 11:00:00','Seminar Hall A',1),
('Infosys Online Assessment','Online Exam','Assessment for shortlisted students',1002,'2026-03-06 10:00:00','Online',2),
('Resume Workshop','Workshop','Portfolio and resume improvement',NULL,'2026-03-03 15:00:00','Auditorium',2);

INSERT INTO inbox_messages (recipient_id,sender_id,subject,message,message_type,related_drive_id,action_url,is_read,sent_at,read_at) VALUES
(101,2,'Application Submitted - Google','Your application for Google has been submitted successfully.','Notification',1001,'/applications',1,'2026-02-20 10:02:00','2026-02-20 12:00:00'),
(101,2,'Shortlisted - Infosys','You have been shortlisted for Infosys Systems Engineer role.','Shortlist',1002,'/applications',0,'2026-02-18 14:05:00',NULL),
(103,2,'Assessment Reminder','Infosys online assessment starts tomorrow at 10 AM.','Reminder',1002,'/events',0,'2026-03-05 09:00:00',NULL);

INSERT INTO admin_messages (from_admin_id,to_user_id,sender_id,recipient_id,subject,message,message_type,related_entity_type,related_entity_id,is_read,sent_at) VALUES
(2,101,2,101,'Bring printed resume','Please carry two printed resume copies for the drive.','Drive','PlacementDrive',1001,0,'2026-03-01 08:00:00'),
(1,103,1,103,'Profile update needed','Update your skill section before interview rounds.','General','User',103,1,'2026-02-25 10:00:00');

INSERT INTO notifications (id,title,message,type,priority,target_audience,target_filter,target_criteria,action_url,expires_at,is_active,created_by) VALUES
(9001,'Portal Maintenance','Portal will be under maintenance this Sunday 2-4 AM.','Warning','Medium','All',NULL,NULL,'/status','2026-03-31 23:59:59',1,1),
(9002,'Mock Interview Slots Open','Book your mock interview slots now.','Info','High','Students','{"branch":"CSE"}','{"branch":"CSE"}','/events','2026-03-10 23:59:59',1,2);

INSERT INTO notification_recipients (notification_id,user_id,is_read,sent_at,delivered_at,read_at) VALUES
(9001,101,1,'2026-02-27 09:00:00','2026-02-27 09:00:00','2026-02-27 10:00:00'),
(9001,102,0,'2026-02-27 09:00:00','2026-02-27 09:00:00',NULL),
(9002,101,0,'2026-02-28 09:00:00','2026-02-28 09:00:00',NULL);

INSERT INTO company_shortlists (company_id,drive_id,student_id,shortlisted_by,status,remarks,notified_at) VALUES
(12,1002,101,2,'Notified','Move to technical interview',NOW()),
(12,1002,103,2,'Shortlisted','Aptitude cleared',NULL);

INSERT INTO document_verifications (user_id,document_type,document_url,status,verification_notes,verified_by,submitted_at,verified_at) VALUES
(101,'Resume','/uploads/resumes/rajesh.pdf','Verified','Resume format is good',2,'2026-02-12 09:00:00','2026-02-13 11:00:00'),
(103,'Marks Card','/uploads/documents/amit_sem8.pdf','Pending',NULL,NULL,'2026-02-20 10:00:00',NULL);

INSERT INTO profile_change_requests (user_id,field_name,old_value,new_value,change_reason,status,reviewed_by,review_notes,requested_at,reviewed_at) VALUES
(103,'phone','9876543212','9876500000','Updated personal number','Pending',NULL,NULL,'2026-02-26 14:00:00',NULL),
(101,'cgpa','8.40','8.45','Correction after revaluation','Approved',2,'Verified with marksheet','2026-02-10 10:00:00','2026-02-12 09:30:00');

INSERT INTO skills (user_id,skill_name,category,proficiency) VALUES
(101,'JavaScript','Programming','Advanced'),(101,'React','Framework','Advanced'),(102,'Java','Programming','Expert'),(103,'Python','Programming','Intermediate');
INSERT INTO projects (user_id,title,description,tech_stack,status,is_ongoing,start_date,end_date,project_url,github_url) VALUES
(101,'Placement Portal UI','Frontend dashboard for student placements','React, Tailwind, Axios','Completed',0,'2025-07-01','2025-12-01','https://example.com/placement-ui','https://github.com/example/placement-ui'),
(103,'Interview Prep Tracker','Track interview practice progress','Node.js, MySQL, React','Ongoing',1,'2026-01-10',NULL,NULL,'https://github.com/example/interview-tracker');
INSERT INTO internships (user_id,company_name,role,duration_months,start_date,end_date,description,certificate_url) VALUES
(101,'TechNova','Frontend Intern',3,'2025-05-01','2025-07-31','Worked on internal dashboard components','https://example.com/certificates/rajesh-technova.pdf'),
(102,'CloudStack','Backend Intern',4,'2025-04-01','2025-07-31','Built API endpoints and wrote tests','https://example.com/certificates/priya-cloudstack.pdf');
INSERT INTO achievements (user_id,title,type,issuer,date_achieved,description,certificate_url) VALUES
(101,'AWS Cloud Practitioner','Certification','AWS','2025-10-12','Entry-level AWS cloud certification','https://example.com/certificates/aws-rajesh.pdf'),
(102,'Hackathon Winner','Hackathon','CodeFest','2025-09-15','Won first place in college hackathon','https://example.com/certificates/priya-hackathon.pdf');
INSERT INTO portfolios (user_id,title,portfolio_url,description,built_with,build_details) VALUES
(101,'Developer Portfolio','https://rajesh.dev','Main personal portfolio','React, Vite','Includes project case studies and resume'),
(102,'Backend Portfolio','https://priya.dev','Service architecture case studies','Spring Boot, PostgreSQL','Focus on APIs and performance tuning');
INSERT INTO semester_marks (user_id,semester,sgpa,marks_card_url) VALUES
(101,7,8.55,'https://example.com/marks/rajesh-sem7.pdf'),(101,8,8.65,'https://example.com/marks/rajesh-sem8.pdf'),(103,8,7.95,'https://example.com/marks/amit-sem8.pdf');

INSERT INTO admin_actions (admin_id,action_type,entity_type,entity_id,description,metadata,ip_address,user_agent) VALUES
(1,'Create','Drive',1001,'Created Google drive','{"source":"seed"}','127.0.0.1','SeedScript/1.0'),
(2,'Send','Message',NULL,'Sent drive instructions to shortlisted students','{"drive_id":1002}','127.0.0.1','SeedScript/1.0');
INSERT INTO activity_logs (user_id,action,entity_type,entity_id,ip_address,user_agent) VALUES
(101,'LOGIN_SUCCESS','Auth',101,'127.0.0.1','Mozilla/5.0'),(2,'SHORTLIST_UPDATED','Application',5002,'127.0.0.1','Mozilla/5.0');
INSERT INTO bulk_operations (operation_type,target_entity,filter_criteria,total_count,success_count,failed_count,result_data,status,initiated_by,started_at,completed_at) VALUES
('BulkNotify','Students','{"drive_id":1002}',2,2,0,'{"message":"Notifications sent"}','Completed',2,'2026-02-18 13:55:00','2026-02-18 14:01:00');
INSERT INTO export_logs (export_type,export_format,filter_applied,filter_criteria,file_name,file_path,file_size_kb,record_count,download_count,exported_by,exported_at,created_at,expires_at) VALUES
('placement','CSV','{"branch":"CSE"}','{"branch":"CSE"}','placement_report_20260227.csv','/exports/placement_report_20260227.csv',24,3,1,1,NOW(),NOW(),DATE_ADD(NOW(),INTERVAL 7 DAY));
INSERT INTO placement_statistics (stat_date,total_students,placed_students,eligible_students,total_drives,total_companies,total_applications,avg_ctc,median_ctc,highest_ctc,lowest_ctc,branch_wise_stats,company_wise_stats,generated_at) VALUES
('2026-02-27',3,1,3,3,2,4,900000.00,900000.00,1800000.00,450000.00,'{"CSE":{"total":2,"placed":1},"ISE":{"total":1,"placed":0}}','{"Google":{"applications":1},"Infosys":{"applications":3}}',NOW());
INSERT INTO system_settings (setting_key,setting_value,setting_type,category,description,is_public,updated_by) VALUES
('min_cgpa_default','6.0','Number','Placement','Default minimum CGPA for eligibility checks',1,1),
('allow_multiple_offers','false','Boolean','Placement','If false, placed students are blocked from new applications',0,1);
INSERT INTO password_reset_tokens (user_id,token,expires_at,used,created_at) VALUES
(101,SHA2('seed-reset-token',256),DATE_ADD(NOW(),INTERVAL 30 MINUTE),0,NOW());

SET FOREIGN_KEY_CHECKS=1;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_drives FROM placement_drives;
SELECT COUNT(*) AS total_applications FROM applications;
